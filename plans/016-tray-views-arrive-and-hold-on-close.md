# 016 — Tray views fade in, and a closing tray keeps its view

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: MEDIUM
- **Category**: Missed opportunities, plus a correctness bug in the tray's exit
- **Estimated scope**: 2 files, ~70 lines: `features/products/components/AddProductMethodSheet.tsx`, `features/products/components/ProductCard.tsx`
- **Depends on**: plan 015 (this plan edits the `viewKey` line 015 adds). Apply after it.

## Problem

1. **A closing tray shows a different view.** `resetAndClose` puts the tray back on the method chooser in the same handler that closes it:

   ```tsx
   /* features/products/components/AddProductMethodSheet.tsx:108-117 — current */
     function resetAndClose() {
       setView("method");
       setConfirmSource("search");
       setStage("verify");
       setSubject("front");
       setAnswer("productQuery", "");
       setAnswer("scan", undefined);
       setAnswer("productDraft", undefined);
       onClose();
     }
   ```

   `Sheet` keeps a closing tray painted for its 200ms exit (`useDialogPresence`), so the exit paints the reset state. Measured in headless Chrome at 440×900 on 13 Sep 2026: from the search view (143px tall), pressing `Done` gave this on the next frame:
   - the tray, still fully opaque, was showing the two method cards at 245px;
   - it then faded out as the method chooser, 102px taller than what the user had closed.

   `Done`, Escape, the scrim and the grabber all run `resetAndClose`.

2. **Views and stages arrive in one frame.** Each view mounts on `{view === "…" && …}` (`:216-267`), and ConfirmView's blocks mount on `stage` (`:563-684`). After plan 015 the tray's height moves, but the new content still pops in at full opacity.

## Target

- **The tray renders from held values.** It reads `view`, `confirmSource`, `stage`, `subject`, the draft, the query and the scan through `useHeldWhileClosing(open, …)`:
  - while open these are the live values;
  - while closing they are the last open ones.

  The reset itself still happens in `resetAndClose`, so the next open starts fresh.
- **A view that replaces another fades in on `.reveal-quick`** (`lux-fade-in`, 200ms, `--ease-standard`). The view the tray opens on does not: the tray's entrance (`lux-sheet-in`, 320ms) is already fading it, and a fade inside a fade multiplies the two opacities.
  - Classed: the top-level `SearchView` root, the `ScanView` root, ConfirmView's `ProductCard` and its four `.confirmBlock`s.
  - Not classed:
    - `MethodView`, which is always the opening view;
    - the `SearchView` embedded in a `.confirmBlock`, because its block already fades;
    - the scan `ChatBubble`, which has its own entrance;
    - the visually hidden status line.
- **Arrival only.** The outgoing view is not held on screen; plan 015's height transition carries the change.

## Repo conventions to follow

- **Held values.** `useHeldWhileClosing` is in `lib/useModalDialog.ts:237`. The exemplar is in this same file: `SearchView`'s `shown` (`:380`), which holds a closing dropdown's results.
- **Reveal classes.** `.reveal-quick` means "something the user just revealed" (AGENTS.md "Entrance reveals"). The rule "Do not put `.reveal-quick` back on a panel that closes" covers `Collapse` and `.drop` panels. Here it goes on views that replace each other, which never close in place.

## Steps

1. `features/products/components/ProductCard.tsx`. Replace

   ```tsx
   export function ProductCard({
     product,
     matchScore,
     showDescription,
   }: {
     product: CatalogProduct;
     /** renders the "92% match" brand Tag above the image */
     matchScore?: number;
     showDescription?: boolean;
   }) {
     return (
       <div className={styles.card}>
   ```

   with

   ```tsx
   export function ProductCard({
     product,
     matchScore,
     showDescription,
     className,
   }: {
     product: CatalogProduct;
     /** renders the "92% match" brand Tag above the image */
     matchScore?: number;
     showDescription?: boolean;
     /** added to the card — the add tray passes `reveal-quick` */
     className?: string;
   }) {
     return (
       <div className={className ? `${styles.card} ${className}` : styles.card}>
   ```

2. `AddProductMethodSheet.tsx`, the React import. Replace `import { useState } from "react";` with `import { useEffect, useState } from "react";`.

3. Same file. Replace

   ```tsx
     const draft = answers.productDraft;
   ```

   with

   ```tsx
     /* ⚠️ WHAT THE TRAY SHOWS OUTLIVES WHAT IT IS, BY ITS EXIT — added 13 Sep
        2026. `resetAndClose` puts everything back on the method chooser in the
        same handler that closes the tray, and `Sheet` paints a closing tray for
        200ms: the exit faded out the method cards over a tray that had been
        showing a search, 102px taller. Everything the views read comes through
        here, so a closing tray keeps the view it was closed on. */
     const shown = useHeldWhileClosing(open, {
       view,
       confirmSource,
       stage,
       subject,
       draft: answers.productDraft,
       query: answers.productQuery ?? "",
       scan: answers.scan,
     });
     const draft = shown.draft;
   ```

4. Same file, the title. In the `const title = …` expression (`:201-212`), change the three conditions:
   - `view === "method"` → `shown.view === "method"`
   - `view === "search"` → `shown.view === "search"`
   - `view === "scan"` → `shown.view === "scan"`
   - `stage === "added"` → `shown.stage === "added"`
   - `confirmSource === "scan"` → `shown.confirmSource === "scan"`

5. Same file. Replace plan 015's line

   ```tsx
     const viewKey = view === "confirm" ? `confirm:${stage}` : view;
   ```

   with

   ```tsx
     const viewKey = shown.view === "confirm" ? `confirm:${shown.stage}` : shown.view;

     /* ⚠️ A VIEW THAT REPLACES ANOTHER FADES IN; THE ONE THE TRAY OPENS ON DOES
        NOT — added 13 Sep 2026. The tray's own entrance is already fading that
        one, and a fade inside a fade multiplies the two opacities, so its cards
        would trail their own surface. `openedOn` is null while the tray is
        closed. */
     const [openedOn, setOpenedOn] = useState<string | null>(null);
     useEffect(() => {
       setOpenedOn((prev) => (open ? (prev ?? viewKey) : null));
     }, [open, viewKey]);
     const arrive = openedOn !== null && viewKey !== openedOn ? "reveal-quick" : undefined;
   ```

6. Same file, the four view blocks inside `<Sheet …>`. Replace everything from `{view === "method" && (` through the closing `)}` of `{view === "confirm" && (…)}` with

   ```tsx
         {shown.view === "method" && (
           <MethodView
             onSearch={() => setView("search")}
             onScan={() => setView("scan")}
           />
         )}

         {shown.view === "search" && (
           <SearchView
             className={arrive}
             query={shown.query}
             onQueryChange={(v) => setAnswer("productQuery", v)}
             onChoose={chooseProduct}
           />
         )}

         {shown.view === "scan" && (
           <ScanView
             className={arrive}
             captured={Boolean(shown.scan)}
             subject={shown.subject}
             onToggleSubject={() =>
               setSubject(subject === "front" ? "ingredients" : "front")
             }
             onCapture={toggleCapture}
             onContinue={() => {
               setConfirmSource("scan");
               setStage("verify");
               setView("confirm");
             }}
           />
         )}

         {shown.view === "confirm" && (
           <ConfirmView
             arrive={arrive}
             source={shown.confirmSource}
             stage={shown.stage}
             draft={draft}
             product={enrichedProduct}
             onAccept={acceptDraft}
             onReject={rejectDraft}
             onPickDuration={(d) =>
               setAnswer("productDraft", (prev) =>
                 prev ? { ...prev, duration: d } : prev,
               )
             }
             onAdd={addProduct}
             addedProducts={products}
             onRemove={removeProduct}
             query={shown.query}
             onQueryChange={(v) => setAnswer("productQuery", v)}
             onChooseMore={chooseProduct}
           />
         )}
   ```

7. Same file, `SearchView`. Replace

   ```tsx
   function SearchView({
     query,
     onQueryChange,
     onChoose,
   }: {
     query: string;
   ```

   with

   ```tsx
   function SearchView({
     className,
     query,
     onQueryChange,
     onChoose,
   }: {
     /** the tray's top-level search passes `reveal-quick` when it replaces a
      *  view; the copy embedded in the confirm view never does — its block fades */
     className?: string;
     query: string;
   ```

   and replace its root `    <div className={styles.searchView}>` with `    <div className={className ? `${styles.searchView} ${className}` : styles.searchView}>`.

8. Same file, `ScanView`. In its props, add `className,` as the first destructured name and `/** `reveal-quick` when it replaces a view */ className?: string;` as the first type member. Replace its root `    <div className={styles.scanView}>` with `    <div className={className ? `${styles.scanView} ${className}` : styles.scanView}>`.

9. Same file, `ConfirmView`:
   - **Prop.** Add `arrive,` as the first destructured name and, as the first type member:

     ```tsx
       /** `reveal-quick` when this view or stage replaced another — see `arrive`
        *  in the tray; undefined on the view the tray opened on */
       arrive?: string;
     ```

   - **Block class.** Directly after the `const showsCard = …;` statement, add

     ```tsx
       const blockClass = arrive ? `${styles.confirmBlock} ${arrive}` : styles.confirmBlock;
     ```

   - **Product card.** On the `<ProductCard` element, add `className={arrive}`.
   - **The four blocks.** Replace each of the four `<div className={styles.confirmBlock}>` inside ConfirmView (verify, duration, added/rejected, added products) with `<div className={blockClass}>`.

## Boundaries

- Do NOT move the resets out of `resetAndClose` or change when `view` and `stage` change.
- Do NOT put `reveal-quick` on `MethodView`, on the embedded `SearchView`, on the scan `ChatBubble`, or on any element that stays mounted across a stage change. The last would restart its fade.
- Do NOT hold or animate the outgoing view.
- Do NOT touch `Sheet`, the dropdown (`.drop`) or `useOpenBeautyFactsSearch`.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP, 440×900 with mobile emulation; `/products` → `Add more products`):
  - **Opening view.** The method `<ul>` has no `reveal-quick` class and no `lux-fade-in` animation.
  - **Search view arrives.** Tap `Search by name`. The search view root has exactly one `lux-fade-in` animation, 200ms.
  - **Closing keeps the view.** Press `Done`. On the first frame after the click and again 90ms later:
    - the tray contains the search `<input>` and no method cards;
    - `offsetHeight` is unchanged from before `Done`.

    Before this plan it showed the method cards at 245px.
  - **Reopening resets.** Reopen the tray. It opens on the method chooser with no stale query.
  - **Confirm stages.** Type `cerave` and pick a result:
    - `ProductCard` and the verify block each have one `lux-fade-in`;
    - tap `Add product` in the segmented pill: the duration block gets one `lux-fade-in` and `ProductCard` gets none.
- **Feel check**:
  - DevTools → Animations at 10%. Each step's new content fades in while the tray's edge glides (plan 015). The first view never trails the tray's own entrance.
  - Close from the `Product added` stage. The tray fades out still reading "Product added".
  - Rendering → emulate `prefers-reduced-motion: reduce`. Content appears at once; nothing is invisible for a moment.
- **Done when**: every exit paints the view it was closed on, and every swapped view or stage block fades in exactly once.

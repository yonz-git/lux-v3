# 022 — Check results' edit mode opens and closes

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: MEDIUM
- **Category**: Interruptibility / preventing a jarring change
- **Estimated scope**: 3 files, ~90 lines: `features/check/components/CheckResults.tsx` + `.module.css`, `features/check/components/CompatCard.tsx`

## Problem

`/check/results`, the "Compared Products" box, in edit mode.

1. **Rows pop.**

   ```tsx
   /* features/check/components/CheckResults.tsx:365-396 — current (abridged) */
               <ul className={styles.stack}>
                 {shown.map((analysis) => (
                   <li key={analysis.product.id}>
                     <CompatCard
                       compact
                       analysis={analysis}
                       onRemove={
                         editing
                           ? () =>
                               setPending(
                                 list.filter((p) => p.id !== analysis.product.id)
                               )
                           : undefined
                       }
                     />
                   </li>
                 ))}

                 {added.map((p) => (
                   <li key={p.id}>
                     <PendingRow
                       product={p}
                       onRemove={
                         editing
                           ? () => setPending(list.filter((x) => x.id !== p.id))
                           : undefined
                       }
                     />
                   </li>
                 ))}
   ```

   - **Remove.** ✕ unmounts a card in one frame, and every card, the add button and the footer below jump up by its height.
   - **Pick.** A product picked in the picker makes its `PendingRow` pop in.

2. **The add button and the picker swap in one frame, and the picker leaves without motion.**

   ```tsx
   /* CheckResults.tsx:478-501 — current (abridged) */
               {editing && !picking && list.length < MAX_CHECK_PRODUCTS && (
                 <div className={styles.addAnother}>
                   …
                 </div>
               )}

               {editing && picking && (
                 <ProductPicker
                   inCheck={inCheck}
                   onPick={addProduct}
                   onCancel={() => setPicking(false)}
                 />
               )}
   ```

   The picker root fades in on `reveal-quick` (`:657`, `<div className={`${styles.picker} reveal-quick`}>`) and vanishes in one frame on Cancel, on a pick, and on `Done`. That is the arrives-with-motion, vanishes-without fault that "Dropdowns" in `globals.css` exists to remove.

3. **The re-run footer pops in and out.**

   ```tsx
   /* CheckResults.tsx:510-511 — current */
               {edited && (
                 <div className={styles.rerun}>
   ```

   It appears on the first removal and disappears when the set is put back, both in one frame. The note beside it claims `reveal-quick` can't be used there:

   ```css
   /* CheckResults.module.css:452-454 — current */
   /* The re-run block, revealed by the first removal. `reveal-quick` is not used
      here because a module may not name an animation (motion section); the block
      arrives with the box's own layout change instead.
   ```

   That is wrong: `reveal-quick` is a global class, and `:657` uses it. The block closes, though, so it should be a `Collapse` rather than a reveal.

4. **The ✕ glyphs pop.** `CompatCard.tsx:120` `{onRemove && (<button … className={styles.remove}`, and `PendingRow`'s `className={styles.pendingRemove}`, appear in one frame when `Edit` is pressed.

Frequency: occasional.

## Target

- **Rows**, using plan 013's two beats:
  - `leave(id)` marks the row leaving, and its `Collapse as="li"` closes over 200ms;
  - `setPending` then drops it, through the functional updater;
  - a row missing from the last hydrated render grows in (`appear`);
  - `.stack > :global(.collapse) { --collapse-gap: var(--space-sm); }`.
- **Three panels become `Collapse`s** inside `.panel`, whose `--collapse-gap: var(--space-sm)` is already declared (`CheckResults.module.css:154-156`):
  - the add button: `open={editing && !picking && list.length < MAX_CHECK_PRODUCTS}`;
  - the picker: `open={editing && picking}`, with `reveal-quick` removed from its root;
  - the re-run footer: `open={edited}`.

  Opening the picker closes the add button while the picker opens, and a pick reverses that.
- **The footer's text is held while it closes.** It reads `enough` through `useHeldWhileClosing(edited, enough)`, because putting the set back changes `enough` in the same render that closes it.
- **Glyphs.** The ✕ on `CompatCard` and `PendingRow` fades in on `reveal-quick` when edit mode starts. Leaving edit mode removes them at once: they are glyphs, not panels.
- **Interruption.** A panel reopened mid-exit turns round; `Collapse` already does this. The picker keeps its typed query if it's reopened within its 200ms exit.

## Repo conventions to follow

- **The two-beat recipe:** `features/products/components/MyProducts.tsx` `CategoryGroup` (`:303-332`, `:370-383`).
- **Collapse with held content**, already in this file: the "how long have you used it" question, `<Collapse open={asking !== null}>` + `useHeldWhileClosing` (`:128`, `:404-469`).
- **Hydration gate:** `features/progress/components/CheckInCalendar.tsx:155-159`.

## Steps

1. `CheckResults.tsx`, imports:
   - replace `import { useId, useState } from "react";` with `import { useEffect, useId, useRef, useState } from "react";`;
   - replace `import { Collapse } from "@/components/ui/Collapse";` with `import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";`.

2. Replace `  const { answers, setAnswer } = useInvestigation();` (first line of `CheckResults()`) with `  const { answers, setAnswer, hydrated } = useInvestigation();`.

3. Directly after the `leaveWith` function (it ends with `router.push(href);` and `}`), add the block below. If the component has an early `return` above that point, put the block above that `return` instead.

   ```tsx

     /* ⚠️ A REMOVED ROW CLOSES BEFORE IT LEAVES THE SET — added 13 Sep 2026,
        013's two beats (MyProducts.tsx `CategoryGroup`). The card used to unmount
        the moment ✕ was tapped, and every card, the add row and the re-run
        footer under it jumped up by its height. */
     const [leaving, setLeaving] = useState<ReadonlySet<string>>(() => new Set());
     const removing = useRef(new Set<string>());
     /* the rows drawn on the last render — one missing from it (picked, or put
        back) grows in. Not before hydration: the check comes from storage, and
        every row would grow in on a reload. */
     const drawn = useRef<ReadonlySet<string> | null>(null);
     useEffect(() => {
       if (hydrated) drawn.current = new Set(list.map((p) => p.id));
     });
     const appears = (id: string) => drawn.current !== null && !drawn.current.has(id);

     function leave(id: string) {
       if (removing.current.has(id)) return;
       removing.current.add(id);
       setLeaving((prev) => new Set(prev).add(id));
       window.setTimeout(() => {
         removing.current.delete(id);
         setPending((prev) => (prev ?? products).filter((p) => p.id !== id));
         setLeaving((prev) => {
           const next = new Set(prev);
           next.delete(id);
           return next;
         });
       }, COLLAPSE_EXIT_MS);
     }

     /* what the re-run footer says while it closes — putting the set back
        changes `enough` in the same render that closes the footer */
     const enoughShown = useHeldWhileClosing(edited, enough);
   ```

4. Replace the two row maps quoted in Problem 1 with

   ```tsx
                 {shown.map((analysis) => (
                   <Collapse
                     as="li"
                     key={analysis.product.id}
                     open={!leaving.has(analysis.product.id)}
                     appear={appears(analysis.product.id)}
                   >
                     <CompatCard
                       compact
                       analysis={analysis}
                       /* ⚠️ PASSED ONLY WHILE EDITING — the resting list is the
                          read-only accordion it has always been. */
                       onRemove={editing ? () => leave(analysis.product.id) : undefined}
                     />
                   </Collapse>
                 ))}

                 {added.map((p) => (
                   <Collapse
                     as="li"
                     key={p.id}
                     open={!leaving.has(p.id)}
                     appear={appears(p.id)}
                   >
                     <PendingRow
                       product={p}
                       onRemove={editing ? () => leave(p.id) : undefined}
                     />
                   </Collapse>
                 ))}
   ```

5. Replace the add-button and picker blocks quoted in Problem 2 (keep the long `⚠️` comments above and inside the add button) with

   ```tsx
               <Collapse open={editing && !picking && list.length < MAX_CHECK_PRODUCTS}>
                 {/* …the existing `⚠️ NOT IN FIGMA — superseded 13 Sep 2026` comment… */}
                 <div className={styles.addAnother}>
                   {/* …the existing Button, unchanged… */}
                 </div>
               </Collapse>

               {/* the add button closes while the picker opens, and a pick or
                   Cancel turns both round — panels in the box, not reveals */}
               <Collapse open={editing && picking}>
                 <ProductPicker
                   inCheck={inCheck}
                   onPick={addProduct}
                   onCancel={() => setPicking(false)}
                 />
               </Collapse>
   ```

   The `{/* … */}` placeholders stand for existing code; do not paste them literally.

6. Same file, the re-run footer. Replace `            {edited && (` with `            <Collapse open={edited}>` and its matching `            )}` (directly after the footer's closing `</div>`) with `            </Collapse>`. Inside the footer:
   - the note's `{enough` becomes `{enoughShown`;
   - the button's `disabled={!enough}` becomes `disabled={!enoughShown}`.

   Keep the `⚠️ IT APPEARS ONLY ONCE THE SET HAS CHANGED` comment above it.

7. Same file, `ProductPicker`'s root. Replace `    <div className={`${styles.picker} reveal-quick`}>` with `    <div className={styles.picker}>`.

8. Same file, `PendingRow`. Replace `          className={styles.pendingRemove}` with `          className={`${styles.pendingRemove} reveal-quick`}`.

9. `CompatCard.tsx`, the remove button. Replace `            className={styles.remove}` with

   ```tsx
               /* fades in as the box enters edit mode; `Done` takes it away at
                  once — a glyph, not a panel */
               className={`${styles.remove} reveal-quick`}
   ```

10. `CheckResults.module.css`. Directly after the `.stack { … }` rule, add

    ```css

    /* rows are `Collapse` list items now, so the 8 is declared on them and a
       removed row closes its gap with it — "Dropdowns" in globals.css */
    .stack > :global(.collapse) {
      --collapse-gap: var(--space-sm);
    }
    ```

11. Same file. Replace

    ```css
    /* The re-run block, revealed by the first removal. `reveal-quick` is not used
       here because a module may not name an animation (motion section); the block
       arrives with the box's own layout change instead.
    ```

    with

    ```css
    /* The re-run block, opened by the first removal and closed when the set is put
       back — a `Collapse` in the box (CheckResults.tsx), like every other panel in
       it.
    ```

## Boundaries

- Do NOT change `addProduct`, `keepUsing`, `leaveWith`, the `asking` question, `edited`'s definition, or the scores.
- Do NOT add Undo, and do not change `CompatCard`'s own body `Collapse`.
- Do NOT touch `/check/new` or `CheckBasket`.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP, 440×900). Open `/check/history`, open a check, and land on `/check/results`:
  - **Edit.** Each ✕ has one `lux-fade-in` of 200ms, and the add button's `Collapse` is `entering`.
  - **Remove a card.** Its `li.collapse` is `leaving` for about 200ms before it unmounts. The re-run footer's `Collapse` opens in the same window, and the next card moves smoothly: the largest single-frame step is under 35% of the removed card's height.
  - **Two quick removals.** Both cards are gone after 400ms.
  - **Add another product.** The add button's `Collapse` is `leaving` while the picker's is `entering`.
    - **Cancel** reverses both.
    - **Pick** closes the picker, the new `PendingRow` grows in, and the question opens if the product isn't owned.
  - **Put the removed product back.** The footer's `Collapse` closes, and its note text doesn't change during the close.
  - **Done.** The ✕s are gone on the next frame and the add button closes.
  - **Reload.** No row has `data-state`.
- **Feel check**:
  - DevTools → Animations at 10%. Nothing in the box teleports: rows close and grow, and the add button and picker hand over.
  - Rendering → emulate `prefers-reduced-motion: reduce`. Everything swaps at once and nothing sits invisible.
- **Done when**: every element that edit mode adds or removes in the box, other than the ✕ glyphs leaving, moves over 200ms.

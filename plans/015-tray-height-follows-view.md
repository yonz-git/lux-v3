# 015 — The add tray's height follows its view

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: MEDIUM
- **Category**: Missed opportunities (preventing a jarring change)
- **Estimated scope**: 4 files (1 new), ~110 lines:
  - `lib/useHeightTransition.ts` (new)
  - `components/ui/Sheet.tsx`
  - `features/products/components/AddProductMethodSheet.tsx`
  - `AGENTS.md`

## Problem

The add-product tray runs the whole add flow inside one sheet and shows one view at a time:

```tsx
/* features/products/components/AddProductMethodSheet.tsx:214-229 — current */
  return (
    <Sheet open={open} onClose={resetAndClose} title={title}>
      {view === "method" && (
        <MethodView
          onSearch={() => setView("search")}
          onScan={() => setView("scan")}
        />
      )}

      {view === "search" && (
        <SearchView
          query={answers.productQuery ?? ""}
          onQueryChange={(v) => setAnswer("productQuery", v)}
          onChoose={chooseProduct}
        />
      )}
```

Inside the `confirm` view, a `stage` (`verify` → `duration` → `added`, or `rejected`) swaps its blocks the same way (`:555-685`).

The tray hugs its content and has no height transition. On mobile it is docked to the bottom edge; on desktop it is a dialog centred with `translate(-50%, -50%)` (`components/ui/Sheet.module.css:24-65`, `:147-170`). So every swap moves the tray's edge by the whole difference in one frame.

Measured in headless Chrome at 440×900 on 13 Sep 2026: tapping `Search by name` took the tray from 245px to 143px between two frames, dropping its top edge 102px. Confirming a product goes the other way and is several hundred pixels taller. On desktop both edges jump, because the dialog re-centres.

Frequency: occasional. Adding one product is 4–5 swaps.

## Target

- **A new hook, `lib/useHeightTransition(ref, key, { enabled, skip })`.** When `key` changes, it animates the element's `height` from the height last painted to its new natural height.
  - Duration and easing are `200ms`, `cubic-bezier(0.2, 0, 0, 1)` (the values of `--duration-base` and `--ease-standard`), run through the Web Animations API.
  - It does nothing:
    - on the first render;
    - while `enabled` is false;
    - when `skip()` returns true;
    - when the height didn't change;
    - under `prefers-reduced-motion: reduce`.
  - A key change mid-animation retargets from the current animated height.
  - An element whose own `overflow-y` is `visible` gets `overflow: clip` for the length of the animation. The tray is `overflow-y: auto` already, so it isn't clipped.
- **`Sheet` takes `resizeKey?: string`.** It runs the hook on the tray while the tray is present and not leaving, and skips during a grabber drag.
- **`AddProductMethodSheet` passes a key**: `resizeKey` = the view, or `confirm:<stage>` inside the confirm view.
- **Typing is not a swap.** Content that changes under the same key keeps resizing instantly, exactly as today. Typing into the search field changes the results without changing the key; animating those would make the tray trail its own content (see "Dropdowns" in `globals.css` for why the search dropdown is not height-animated either).

## Repo conventions to follow

- **Hooks live in `lib/`.** Hooks used below the feature layer go there (`lib/useModalDialog.ts`). `components/ui/` may import `lib/`, never a feature.
- **Mirrored timing constants are commented.** A constant that mirrors a CSS value carries `⚠️ KEEP IN STEP WITH` (exemplar: `ENTER_MS` and `COLLAPSE_EXIT_MS`, `components/ui/Collapse.tsx:87-96`).
- **JS motion checks reduced motion itself.** The global reduced-motion rule (`globals.css:2226`) only reaches CSS durations, so JS motion checks the media query directly (exemplar: `features/progress/components/CheckIn.tsx:217`).
- **`useLayoutEffect` has a precedent** in `components/ui/ChatBubble.tsx:97`.

## Steps

1. Create `lib/useHeightTransition.ts`. If `lib/useModalDialog.ts` starts with a `"use client";` line, start this file with the same line; otherwise leave it out.

   ```ts
   import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

   /**
    * A container that SWAPS what it shows grows or shrinks to the new content
    * instead of jumping to it. Added 13 Sep 2026 for the add-product tray, whose
    * edge moved by a whole view's height in one frame on every step of adding a
    * product. ⚠️ NOT IN FIGMA.
    *
    * ⚠️ IT ANIMATES ON `key`, NOT ON EVERY SIZE CHANGE. A container whose content
    * changes while the user types (search results) must follow each keystroke at
    * once; animating those would make it trail its own content. The caller says
    * what counts as a swap by changing the key.
    *
    * ⚠️ THE "FROM" HEIGHT COMES FROM A ResizeObserver. Its callback runs after
    * layout and before paint, so when a new key commits it still holds the height
    * of the frame the user last saw — by the time any effect can measure, the DOM
    * has already changed.
    *
    * ⚠️ IT IS THE WEB ANIMATIONS API, SO THE GLOBAL REDUCED-MOTION RULE CANNOT
    * REACH IT. `globals.css` collapses CSS durations only; this checks the media
    * query itself, as `CheckIn`'s smooth scroll does.
    */
   export function useHeightTransition(
     ref: RefObject<HTMLElement | null>,
     key: string | undefined,
     {
       enabled = true,
       skip,
     }: {
       /** false while the element is absent or on its way out */
       enabled?: boolean;
       /** read at the moment of a swap — true lets the height snap */
       skip?: () => boolean;
     } = {},
   ) {
     const painted = useRef<number | null>(null);
     const running = useRef<Animation | null>(null);

     useEffect(() => {
       const el = ref.current;
       if (!enabled || !el) return;
       const observer = new ResizeObserver(() => {
         painted.current = el.offsetHeight;
       });
       observer.observe(el);
       return () => {
         observer.disconnect();
         running.current?.cancel();
         running.current = null;
         painted.current = null;
       };
     }, [ref, enabled]);

     /* biome-ignore lint/correctness/useExhaustiveDependencies: RUNS ON A SWAP
        ONLY. `skip` is read at the moment of the swap and `ref` is a stable
        object; listing either would re-run this on renders that swapped nothing. */
     useLayoutEffect(() => {
       const el = ref.current;
       if (!enabled || !el || key === undefined) return;

       const live = running.current?.playState === "running" ? running.current : null;
       /* mid-animation, the element's current height IS what is on screen */
       const from = live ? el.offsetHeight : painted.current;
       live?.cancel();
       running.current = null;
       const to = el.offsetHeight;
       painted.current = to;

       if (from === null || Math.abs(from - to) < 1 || skip?.()) return;
       if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

       /* a box that shows its overflow would paint the new content over whatever
          sits below it while it grows */
       const clip = getComputedStyle(el).overflowY === "visible";
       const frame = (height: number) =>
         clip ? { height: `${height}px`, overflow: "clip" } : { height: `${height}px` };
       const animation = el.animate([frame(from), frame(to)], {
         duration: HEIGHT_MS,
         easing: HEIGHT_EASING,
       });
       running.current = animation;
       animation.onfinish = () => {
         if (running.current === animation) running.current = null;
       };
     }, [key, enabled]);
   }

   /* ⚠️ KEEP IN STEP WITH `--duration-base` (200ms, app/tokens.css) — the interval
      a `Collapse` opens over, so a swap and a disclosure move alike. */
   const HEIGHT_MS = 200;

   /* ⚠️ KEEP IN STEP WITH `--ease-standard` (app/tokens.css). A WAAPI easing
      cannot read a custom property, so the curve is repeated here. */
   const HEIGHT_EASING = "cubic-bezier(0.2, 0, 0, 1)";
   ```

   Verified on 13 Sep 2026 in headless Chrome 152: `overflow: "clip"` in WAAPI keyframes computes as `clip` while the animation runs and reverts when it is cancelled.

2. `components/ui/Sheet.tsx`, the import. Replace

   ```tsx
   import { useDialogPresence, useModalDialog, useMounted } from "@/lib/useModalDialog";
   ```

   with

   ```tsx
   import { useDialogPresence, useModalDialog, useMounted } from "@/lib/useModalDialog";
   import { useHeightTransition } from "@/lib/useHeightTransition";
   ```

3. Same file, the props. Replace

   ```tsx
     children,
     className,
   }: {
     open: boolean;
     onClose: () => void;
     title: string;
     children: React.ReactNode;
     /** added to the tray, for a caller that needs to adjust its own dialog */
     className?: string;
   }) {
   ```

   with

   ```tsx
     children,
     className,
     resizeKey,
   }: {
     open: boolean;
     onClose: () => void;
     title: string;
     children: React.ReactNode;
     /** added to the tray, for a caller that needs to adjust its own dialog */
     className?: string;
     /**
      * Change this when the tray swaps what it shows — a multi-view tray passes
      * its view — and the tray animates to the new height instead of jumping.
      * Content that changes under the same key (search results while typing)
      * still resizes at once. See `lib/useHeightTransition.ts`.
      */
     resizeKey?: string;
   }) {
   ```

4. Same file, directly after the effect that ends

   ```tsx
       if (open && tray) {
         tray.style.transform = "";
         tray.style.transition = "";
       }
     }, [open]);
   ```

   insert

   ```tsx

     /* ⚠️ THE TRAY'S HEIGHT MOVES WHEN ITS VIEW CHANGES — added 13 Sep 2026; see
        `resizeKey`. Not while it leaves (it fades out at the height it has) and
        not under the finger: a drag owns the tray's geometry. */
     useHeightTransition(trayRef, resizeKey, {
       enabled: present && mounted && !leaving,
       skip: () => drag.current !== null,
     });
   ```

5. `features/products/components/AddProductMethodSheet.tsx`. Replace

   ```tsx
     return (
       <Sheet open={open} onClose={resetAndClose} title={title}>
   ```

   with

   ```tsx
     /* what the tray is showing, as one value — the tray grows and shrinks
        between these (`Sheet`'s `resizeKey`), and typing inside one does not
        count as a change */
     const viewKey = view === "confirm" ? `confirm:${stage}` : view;

     return (
       <Sheet open={open} onClose={resetAndClose} title={title} resizeKey={viewKey}>
   ```

6. `AGENTS.md`, the components table. Replace the row

   ```markdown
   | `Sheet` | `open`, `onClose`, `title`, `children` |
   ```

   with

   ```markdown
   | `Sheet` | `open`, `onClose`, `title`, `children`, `resizeKey?` — change it when the tray swaps views and its height animates instead of jumping (`lib/useHeightTransition.ts`) |
   ```

## Boundaries

- Do NOT add a CSS `height` or `max-height` transition to the tray.
- Do NOT change the `[data-tray]` rules in `globals.css`, the drag handlers, or `useDialogPresence`.
- Do NOT wrap the tray's children in a new element. `CheckBasketSheet` relies on the tray's own 20 gap between its children.
- Do NOT pass `resizeKey` from `CheckBasketSheet` or `SelfieSheet`. Their content changes are `Collapse` rows, which already move the tray's edge smoothly.
- Do NOT change what any view renders or when `view`/`stage` change. Plan 016 handles the content.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP, 440×900 with mobile emulation; `/products` → `Add more products`):
  - **Method → search.** Tap `Search by name`, then sample `[data-tray="tray"].offsetHeight` on every animation frame:
    - it passes through at least 5 values strictly between 245 and 143;
    - it moves monotonically and ends at 143 within about 14 frames;
    - the largest single-frame step is under 35% of the travel, the curve's shape at 60fps (never the whole 102px in one frame).
  - **The animation itself.** While it runs, `tray.getAnimations()` includes one whose `effect.getKeyframes()` carry `height`.
  - **Typing doesn't animate.** Type `cera` into the field and wait for results. No animation with `height` keyframes is created, and the tray follows its content instantly.
  - **Reduced motion.** With `prefers-reduced-motion: reduce` emulated, the same tap creates no animation and the height is final on the next frame.
  - **Desktop.** At 1440×900, the dialog's top and bottom edges both move over about 200ms, and its centre stays within 1px of the viewport centre on every frame.
- **Feel check**:
  - DevTools → Animations at 10%. Go method → search → pick a result → `Add product` → a duration → `Add product`. Each swap glides the tray's edge; nothing jumps.
  - Tap a result straight after `Search by name` lands. The confirm view's growth starts from wherever the search shrink had got to; there is no snap back to 245.
  - Drag the grabber down a little and release. It springs back exactly as before, and no height animation interferes.
- **Done when**: no view or stage change moves the tray's edge by its whole difference in one frame, and typing still resizes instantly.

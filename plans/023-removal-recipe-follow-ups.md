# 023 — 013's recipe in four more places

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: LOW
- **Category**: Missed opportunities (preventing a jarring change)
- **Estimated scope**: 6 files, ~110 lines:
  - `features/products/components/MyProducts.tsx` + `.module.css`
  - `features/check/components/CheckBasket.tsx` + `.module.css`
  - `features/products/components/AddProductMethodSheet.tsx` + `.module.css`
- **Depends on**:
  - 015 and 016, which both edit `AddProductMethodSheet.tsx` (016 adds `arrive`/`blockClass`, and part D keys on the tray's stages);
  - 019, which reshapes `MyProducts`' returns.

  Apply after all three.

Plan 013 made removed products close and restored ones grow in. Four edges of the same change still snap. The parts are independent and can be applied in any order.

## A — An emptied group swaps its list for the empty box in one frame

### Problem

```tsx
/* features/products/components/MyProducts.tsx:364-387 — current (abridged) */
      <Collapse open={open}>
        <div id={panelId} className={styles.panel}>
          {n === 0 ? (
            <EmptyBox compact>No products in this list yet</EmptyBox>
          ) : (
            <ul className={styles.stack}>
              …
            </ul>
          )}
        </div>
      </Collapse>
```

- **Last card removed.** When the last card in an open group closes, the `ul` is replaced by the empty box at full height in one frame.
- **First product added.** Adding a product to an open empty group does the reverse.

### Target

The empty box is its own `Collapse` (`open={n === 0}`), rendered beside the list. It grows in when the list empties while on screen, and closes while the first new card grows.

### Steps

1. Replace the ternary quoted above with

   ```tsx
             {/* ⚠️ THE EMPTY BOX AND THE LIST HAND OVER — added 13 Sep 2026. The
                 box replaced the list in one frame when the last card closed, and
                 the list replaced the box when a product was added to an open
                 group. It grows in after a removal (`appear`, only once this
                 group has drawn a card) and closes while the first card grows. */}
             <Collapse open={n === 0} appear={drawn.current !== null && drawn.current.size > 0}>
               <EmptyBox compact>No products in this list yet</EmptyBox>
             </Collapse>
             {n > 0 && (
               <ul className={styles.stack}>
                 {/* …the existing rows, unchanged… */}
               </ul>
             )}
   ```

   (`drawn` is `CategoryGroup`'s existing ref. `.panel` has no gap, so no `--collapse-gap` is needed.)

## B — The "Not sure" group appears and disappears in one frame

### Problem

```tsx
/* MyProducts.tsx:175-178 — current */
  const categories = [
    ...BUCKETS,
    ...(countIn(products, UNSORTED_BUCKET.id) > 0 ? [UNSORTED_BUCKET] : []),
  ];
```

`Not sure` exists only while it has products. After its last card closes, the whole group row unmounts and every group below jumps. A product added with that answer makes the group pop in the same way.

### Target

The `Not sure` row is a `Collapse as="li"` with `open={count > 0}`. It closes after its last card closes, and it grows in when it appears on screen. A group appearing on a reload does not grow in.

Accepted: while it closes, the row shows its count as 0 and, if it was open, starts growing its empty box inside the closing clip.

### Steps

1. Replace `  const { answers, setAnswer } = useInvestigation();` (in `MyProducts()`) with `  const { answers, setAnswer, hydrated } = useInvestigation();`.
2. Replace the `categories` declaration quoted above (keep the `⚠️ THE THREE DESIGNED PERIODS ALWAYS` comment above it) with

   ```tsx
     const unsortedCount = countIn(products, UNSORTED_BUCKET.id);
     /* whether `Not sure` was on screen last render — it grows in only when it
        appears while the list is showing, never on a reload */
     const unsortedDrawn = useRef<boolean | null>(null);
     useEffect(() => {
       if (hydrated) unsortedDrawn.current = unsortedCount > 0;
     });
   ```

   and add a line to that comment: `It opens and closes with a Collapse rather than appearing in a frame (13 Sep 2026).`
3. Replace the `categories.map` block (`<ul className={styles.categories}> … </ul>`, keeping the long `⚠️ THE FALLBACK IS THE prev` comment on `onRemove`) with

   ```tsx
           <ul className={styles.categories}>
             {[...BUCKETS, UNSORTED_BUCKET].map((b) => {
               const group = (
                 <CategoryGroup
                   bucket={b.id}
                   products={products.filter((p) => p.bucket === b.id)}
                   /* …the existing `⚠️ THE FALLBACK IS THE prev` comment… */
                   onRemove={(id) => removeProduct(id)}
                 />
               );
               return b.id === UNSORTED_BUCKET.id ? (
                 <Collapse
                   as="li"
                   key={b.id}
                   open={unsortedCount > 0}
                   appear={unsortedDrawn.current === false}
                 >
                   {group}
                 </Collapse>
               ) : (
                 <li key={b.id}>{group}</li>
               );
             })}
           </ul>
   ```

   The `{/* … */}` placeholder stands for the existing comment; do not paste it literally.
4. `MyProducts.module.css`. Directly after the `.categories { … }` rule, add

   ```css

   /* `Not sure` is a `Collapse` list item (MyProducts.tsx), so the 12 is
      declared on it and opens and closes with it */
   .categories > :global(.collapse) {
     --collapse-gap: var(--space-md);
   }
   ```

## C — The basket's "and" vanishes after the first row is removed

### Problem

```tsx
/* features/check/components/CheckBasket.tsx:181-190 — current */
            <div className={styles.basketItem}>
              {/* ⚠️ THE "and" IS A CONNECTOR, NOT A LIST ITEM. … */}
              {i > 0 && (
                <span className={`${styles.and} t-label-sm`} aria-hidden="true">
                  and
                </span>
              )}
```

Removing the first row closes it, as plan 013 made it. Then the second row becomes `i === 0` and its "and" line (16px plus the 8 gap) unmounts in one frame, jumping every row below.

### Target

The connector is a `Collapse`, open only for a row that follows a staying row. It closes at the same time as the first row does.

### Steps

1. Directly after the `leave` function in `CheckBasketSheet`, add

   ```tsx

     /* the first row that is not on its way out — its "and" closes WITH the row
        above it rather than vanishing once that row has gone */
     const firstStaying = products.find((p) => !leaving.has(p.id))?.id;
   ```

2. Replace the `{i > 0 && ( <span …>and</span> )}` block quoted above (keep the `⚠️ THE "and" IS A CONNECTOR` comment) with

   ```tsx
                 <Collapse open={i > 0 && p.id !== firstStaying}>
                   <span className={`${styles.and} t-label-sm`} aria-hidden="true">
                     and
                   </span>
                 </Collapse>
   ```

3. `CheckBasket.module.css`. Replace

   ```css
   .and {
     text-align: center;
     color: var(--color-text-on-data-muted);
   }
   ```

   with

   ```css
   /* `display: block` — inside its `Collapse` the span is no longer a flex item,
      and an inline span ignores `text-align` */
   .and {
     display: block;
     text-align: center;
     color: var(--color-text-on-data-muted);
   }

   /* the connector is a `Collapse` (CheckBasket.tsx), so the row's 8 is declared
      on it and closes with it */
   .basketItem > :global(.collapse) {
     --collapse-gap: var(--space-sm);
   }
   ```

## D — The add tray's "Added products" rows pop

### Problem

```tsx
/* features/products/components/AddProductMethodSheet.tsx:662-682 — current (abridged) */
          <ul className={styles.addedList}>
            {addedProducts.map((p) => (
              <li key={p.id}>
                <ProductRow
                  …
                  trailing={
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => onRemove(p.id)}
                      aria-label={`Remove ${fullName(p)}`}
                    >
```

✕ removes a row in one frame, and the tray's edge jumps by its height. Undo makes the row pop back in.

### Target

- **Removal.** Plan 013's two beats: `Collapse as="li"`, and `onRemove` after `COLLAPSE_EXIT_MS`.
- **Undo.** A row missing from the last render grows in, except in the render that also changed the stage. There the tray is running plan 015's height animation to the whole new view. A row growing under that measurement would leave the tray one row short when the animation ends, so the row added by `Add product` arrives with its view instead.

### Steps

1. Imports:
   - replace `import { useEffect, useState } from "react";` (as left by 016) with `import { useEffect, useRef, useState } from "react";`;
   - add `import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";` after the `Sheet` import.
2. In `ConfirmView`, directly after the `const blockClass = …;` line (added by 016), add

   ```tsx

     /* ⚠️ A REMOVED PRODUCT CLOSES BEFORE IT LEAVES THE LIST — added 13 Sep 2026,
        013's two beats (MyProducts.tsx `CategoryGroup`). */
     const [leaving, setLeaving] = useState<ReadonlySet<string>>(() => new Set());
     const removing = useRef(new Set<string>());
     /* the rows drawn on the last render, and at which stage. A row missing from
        it grows in (Undo) — but not in the render that also changed the stage:
        the tray is animating its height to the whole new view then (`Sheet`'s
        `resizeKey`), and a row growing under that measurement would leave the
        tray short by a row when it finished. */
     const drawn = useRef<{ stage: ConfirmStage; ids: ReadonlySet<string> } | null>(null);
     useEffect(() => {
       drawn.current = { stage, ids: new Set(addedProducts.map((p) => p.id)) };
     });
     const appears = (id: string) =>
       drawn.current !== null && drawn.current.stage === stage && !drawn.current.ids.has(id);

     function leave(id: string) {
       if (removing.current.has(id)) return;
       removing.current.add(id);
       setLeaving((prev) => new Set(prev).add(id));
       window.setTimeout(() => {
         removing.current.delete(id);
         onRemove(id);
         setLeaving((prev) => {
           const next = new Set(prev);
           next.delete(id);
           return next;
         });
       }, COLLAPSE_EXIT_MS);
     }
   ```

3. In the added list, replace `              <li key={p.id}>` with

   ```tsx
                 <Collapse
                   as="li"
                   key={p.id}
                   open={!leaving.has(p.id)}
                   appear={appears(p.id)}
                 >
   ```

   Replace its matching `              </li>` with `              </Collapse>`, and change the remove button's `onClick={() => onRemove(p.id)}` to `onClick={() => leave(p.id)}`.
4. `AddProductMethodSheet.module.css`. Directly after the `.addedList { … }` rule, add

   ```css

   /* rows are `Collapse` list items (AddProductMethodSheet.tsx), so the 12 is
      declared on them and closes with a removed row */
   .addedList > :global(.collapse) {
     --collapse-gap: var(--space-md);
   }
   ```

## Boundaries

- Do NOT change `removeProduct` in either file, the Undo snackbar, the grouping rules or `UNSORTED_BUCKET`.
- Do NOT change `Collapse`.
- Accepted, not in scope: the tray list's own "Added products" block disappears in one frame when its last row has closed.
- If an excerpt isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP):
  - **A.**
    - Remove every card from an open group on `/products`. After the last card's `leaving` ends, the empty box's `Collapse` is `entering` and its height grows over about 200ms.
    - Add a product to that group through the tray. The box's `Collapse` is `leaving` while the new card grows.
  - **B.**
    - Add a product with the "Not sure" duration while `/products` is open. The group's `li.collapse` grows in.
    - Remove that product. The card closes, then the group closes over about 200ms.
    - Reload with a stored "Not sure" product. The group renders with no `data-state`.
  - **C.** On `/check/new` with three products, open the basket and remove the first:
    - the first row and the second row's "and" `Collapse` are both `leaving` in the same frame;
    - after 400ms the new first row has no "and", and no row jumped;
    - the "and" text is still centred.
  - **D.**
    - In the tray's `Product added` stage, ✕ a row. It closes over about 200ms, then Undo appears.
    - Undo. The row grows back in.
    - Add another product through the tray. The new row appears with the `added` view at full height, and the tray's height animation ends on the tray's real height.
- **Feel check**: DevTools → Animations at 10% on each case. Nothing below a changing row or group moves in one frame.
- **Done when**: all four measured cases pass.

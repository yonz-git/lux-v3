# 013 — Removed products close smoothly; Undo reopens them

- **Status**: TODO
- **Commit**: `d7220d6` — plus the uncommitted working tree of 13 Sep 2026. Search by quoted code.
- **Severity**: MEDIUM (missed opportunity: additive)
- **Category**: Missed opportunities / preventing a jarring change
- **Estimated scope**: 6 files, ~90 lines:
  - `components/ui/Collapse.tsx`, `AGENTS.md`
  - `features/products/components/MyProducts.tsx` + `.module.css`
  - `features/check/components/CheckBasket.tsx` + `.module.css`
- **Depends on**: plan 007 (`Collapse` renders on `open`, and the `.parent > :global(.collapse)` convention for `--collapse-gap`). Apply after it.

## Problem

Removing a product deletes it from the store at once, so its row unmounts in one frame and everything below jumps up by its height:

```tsx
/* features/products/components/MyProducts.tsx:157-167 — current */
  function removeProduct(id: string) {
    const before = answers.products;
    const removed = products.find((p) => p.id === id);
    setAnswer("products", (prev) =>
      (prev ?? DEMO_PRODUCTS).filter((x) => x.id !== id),
    );
    show({
      message: removed ? `Removed ${fullName(removed)}` : "Product removed",
      onAction: () => setAnswer("products", before),
    });
  }
```

```tsx
/* features/products/components/MyProducts.tsx:387-397 — current (inside CategoryGroup) */
            <ul className={styles.stack}>
              {products.map((p) => (
                <li key={p.id}>
                  <ProductAccordionCard
                    product={p}
                    compact
                    onRemove={() => onRemove(p.id)}
                  />
                </li>
              ))}
            </ul>
```

Undo (`setAnswer("products", before)`) snaps the card back the same way. The check basket tray does the same: `onClick={() => onRemove(p.id)}` on each row's ✕ (`features/check/components/CheckBasket.tsx:173-180`). There the tray is a bottom sheet on mobile, so its top edge jumps too.

Removal is exactly the "preventing a jarring change" case, and a restored row needs spatial continuity: it should come back where it was. Frequency: occasional.

## Target

- **`Collapse` gains two props.**
  - `as?: "div" | "li"`: a list row can be the collapsing element, so `ul > li` stays valid and the row's own negative margin cancels the list's flex gap, with no 8px jump at the end.
  - `appear?: boolean`: a row that mounts open still grows in, for the row Undo puts back.
- **Rows leave in two beats.** Mark the row leaving, so its Collapse closes over 200ms. Then call `onRemove`, which writes the store and raises the Undo snackbar exactly as today.
- **Rows that appear later grow in.** A row that turns up after the list has rendered (Undo, or a product added while the list is open) mounts with `appear`. Nothing animates when a screen arrives.
- Lists declare their gap on the row: `.stack > :global(.collapse)` and `.basket > :global(.collapse)`, both `--collapse-gap: var(--space-sm)`.

## Repo conventions to follow

- `Collapse` and the `.collapse` recipe: `components/ui/Collapse.tsx`, and "Dropdowns open DOWN and close back UP" in `app/globals.css`. Exemplar caller: `features/products/components/ProductAccordionCard.tsx`.
- `--collapse-gap` is declared ON the Collapse via `.parent > :global(.collapse)` (introduced by plan 007). Exemplar: `.group > :global(.collapse)` in `MyProducts.module.css`.
- Timing constants that mirror CSS carry a `⚠️ KEEP IN STEP WITH` comment.

## Steps

1. **`components/ui/Collapse.tsx`: props.** Replace

   ```tsx
   export function Collapse({
     open,
     children,
   }: {
     open: boolean;
     children: ReactNode;
   }) {
   ```

   with

   ```tsx
   export function Collapse({
     open,
     as: Tag = "div",
     appear = false,
     children,
   }: {
     open: boolean;
     /** the element that collapses — `li` when it is a list row itself */
     as?: "div" | "li";
     /** grow in even when mounted open — a row put back by Undo */
     appear?: boolean;
     children: ReactNode;
   }) {
   ```

   Replace `  const [settled, setSettled] = useState(open);` with `  const [settled, setSettled] = useState(open && !appear);`.

   Replace the returned element

   ```tsx
       <div
         className="collapse"
         data-state={leaving ? "leaving" : settled ? undefined : "entering"}
         inert={leaving}
       >
         <div>{children}</div>
       </div>
   ```

   with

   ```tsx
       <Tag
         className="collapse"
         data-state={leaving ? "leaving" : settled ? undefined : "entering"}
         inert={leaving}
       >
         <div>{children}</div>
       </Tag>
   ```

2. **Same file: the exit constant.** After `const ENTER_MS = 200;` add:

   ```tsx
   /* ⚠️ KEEP IN STEP WITH `useDialogPresence`'s default exit (lib/useModalDialog.ts)
      and `--duration-base` — how long a collapse takes to close. A caller that
      commits a removal only once its row has closed waits this long. */
   export const COLLAPSE_EXIT_MS = 200;
   ```

3. **Same file: document it.** In the doc comment above `export function Collapse`, insert before its closing ` */` (after the line ending `already laid out.`):

   ```tsx
    *
    * ⚠️ `as="li"` AND `appear` EXIST FOR LIST ROWS — added 13 Sep 2026 for
    * removing a product. A row that closes has to BE the list item, or the
    * list's flex gap stays behind and jumps shut when the row unmounts; as the
    * `li`, its negative margin cancels that gap (`.list > :global(.collapse)`).
    * `appear` grows a row in even though it mounts open — the row Undo puts
    * back — where a panel that starts open (a `defaultOpen` disclosure) must
    * not.
   ```

4. **`features/products/components/MyProducts.tsx`: imports.**
   - Change `import { useState } from "react";` to `import { useEffect, useRef, useState } from "react";`.
   - Change `import { Collapse } from "@/components/ui/Collapse";` to `import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";`.
5. **Same file, `CategoryGroup`: the two beats.** Replace

   ```tsx
     const [open, setOpen] = useState(false);
     const panelId = `bucket-${bucket}`;
     const n = products.length;
   ```

   with

   ```tsx
     const [open, setOpen] = useState(false);
     const panelId = `bucket-${bucket}`;
     const n = products.length;

     /* ⚠️ A REMOVED CARD CLOSES FIRST AND LEAVES THE STORE SECOND — added 13 Sep
        2026. It used to unmount the moment `Remove` wrote to the store, and every
        card and group under it jumped up by its height; Undo snapped it back the
        same way. `leave` closes its `Collapse` and only then calls `onRemove`,
        which is also when the Undo snackbar appears. */
     const [leaving, setLeaving] = useState<ReadonlySet<string>>(() => new Set());
     const pending = useRef(new Set<string>());
     /* the cards this group has already drawn — one missing from it (put back by
        Undo, or added while the group is open) grows in with `appear`. `null`
        until the first render commits, so nothing animates when the screen
        arrives. */
     const drawn = useRef<ReadonlySet<string> | null>(null);
     useEffect(() => {
       drawn.current = new Set(products.map((p) => p.id));
     });

     function leave(id: string) {
       if (pending.current.has(id)) return;
       pending.current.add(id);
       setLeaving((prev) => new Set(prev).add(id));
       window.setTimeout(() => {
         pending.current.delete(id);
         onRemove(id);
         setLeaving((prev) => {
           const next = new Set(prev);
           next.delete(id);
           return next;
         });
       }, COLLAPSE_EXIT_MS);
     }
   ```

6. **Same file: render rows as Collapses.** Replace the `<ul className={styles.stack}>` block quoted in *Problem* with:

   ```tsx
               <ul className={styles.stack}>
                 {products.map((p) => (
                   <Collapse
                     as="li"
                     key={p.id}
                     open={!leaving.has(p.id)}
                     appear={drawn.current !== null && !drawn.current.has(p.id)}
                   >
                     <ProductAccordionCard
                       product={p}
                       compact
                       onRemove={() => leave(p.id)}
                     />
                   </Collapse>
                 ))}
               </ul>
   ```

7. **`features/products/components/MyProducts.module.css`**: after the `.stack { … }` rule add:

   ```css
   /* each card is a `Collapse` row (`as="li"`) so a removed one closes over the
      list's 8 instead of leaving it behind — declared on the row, see
      "Dropdowns" in globals.css */
   .stack > :global(.collapse) {
     --collapse-gap: var(--space-sm);
   }
   ```

8. **`features/check/components/CheckBasket.tsx`: imports.**
   - Add `import { useEffect, useRef, useState } from "react";` on the line after `"use client";` and its blank line, before `import styles from "./CheckBasket.module.css";`.
   - Add `import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";` after `import { Button } from "@/components/ui/Button";`.
9. **Same file, `CheckBasketSheet`: the two beats.** Replace

   ```tsx
     const enough = products.length >= MIN_CHECK_PRODUCTS;
     const full = products.length >= MAX_CHECK_PRODUCTS;
   ```

   with

   ```tsx
     const enough = products.length >= MIN_CHECK_PRODUCTS;
     const full = products.length >= MAX_CHECK_PRODUCTS;

     /* ⚠️ A REMOVED ROW CLOSES BEFORE IT LEAVES THE BASKET — added 13 Sep 2026;
        it used to vanish and jump the tray's edge. Same two beats as the
        PRODUCTS hub's cards (MyProducts.tsx `CategoryGroup`). */
     const [leaving, setLeaving] = useState<ReadonlySet<string>>(() => new Set());
     const pending = useRef(new Set<string>());
     const drawn = useRef<ReadonlySet<string> | null>(null);
     useEffect(() => {
       drawn.current = new Set(products.map((p) => p.id));
     });

     function leave(id: string) {
       if (pending.current.has(id)) return;
       pending.current.add(id);
       setLeaving((prev) => new Set(prev).add(id));
       window.setTimeout(() => {
         pending.current.delete(id);
         onRemove(id);
         setLeaving((prev) => {
           const next = new Set(prev);
           next.delete(id);
           return next;
         });
       }, COLLAPSE_EXIT_MS);
     }
   ```

10. **Same file: render rows as Collapses.** Inside `<ul className={styles.basket}>`, replace the `{products.map((p, i) => ( <li key={p.id} className={styles.basketItem}> … </li> ))}` block (lines 147-183) with the version below. The inner markup and its comments are unchanged, except that the `li` becomes a `Collapse`, the `basketItem` class moves to an inner `div`, and the ✕ calls `leave`:

    ```tsx
            {products.map((p, i) => (
              <Collapse
                as="li"
                key={p.id}
                open={!leaving.has(p.id)}
                appear={drawn.current !== null && !drawn.current.has(p.id)}
              >
                <div className={styles.basketItem}>
                  {/* ⚠️ THE "and" IS A CONNECTOR, NOT A LIST ITEM. It reads as one
                      sentence — "this AND this AND this" — which is what a
                      compatibility check is asking about. Hidden from assistive tech,
                      where the list semantics already say it. */}
                  {i > 0 && (
                    <span className={`${styles.and} t-label-sm`} aria-hidden="true">
                      and
                    </span>
                  )}
                  <span className={styles.item}>
                    {/* ⚠️ THE THUMB IS NOT IN THE COMP — `bottom-sheet` (604:2103)
                        draws these rows as a label and a close glyph alone. Every
                        other place a product appears carries its drawn vessel
                        (`/check/new`'s own result rows, the PRODUCTS tray, both
                        hubs), so the ONE screen where you review what you picked was
                        the one screen that dropped the picture — and it is the
                        screen where two rows are most likely to read alike, since a
                        basket is two products from the same shelf. Same
                        `ProductArt`, same hash, so a row keeps the identity it had
                        in the list you picked it from. */}
                    <ProductThumb product={p} />
                    <span className={`${styles.itemLabel} t-body2`}>
                      {fullName(p)}
                    </span>
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={`Remove ${fullName(p)} from this analysis`}
                      onClick={() => leave(p.id)}
                    >
                      <CloseIcon className={styles.removeIcon} />
                    </button>
                  </span>
                </div>
              </Collapse>
            ))}
    ```

    Leave the `{!full && ( <li className={styles.addAnotherItem}> … </li> )}` item that follows unchanged.
11. **`features/check/components/CheckBasket.module.css`**: after the `.basket { … }` rule (~line 113-121) add:

    ```css
    /* each row is a `Collapse` (`as="li"`) so a removed one closes over the
       list's 8 — declared on the row, see "Dropdowns" in globals.css */
    .basket > :global(.collapse) {
      --collapse-gap: var(--space-sm);
    }
    ```

12. **`AGENTS.md`**: in the components table, replace the row

    ```
    | `Collapse` | `open`, `children` — wraps an in-flow panel so it opens down and closes up; see "Entrance reveals" |
    ```

    with

    ```
    | `Collapse` | `open`, `as?: "div" \| "li"`, `appear?`, `children` — wraps an in-flow panel (or IS a list row) so it opens down and closes up; see "Entrance reveals" |
    ```

## Boundaries

- Do NOT change `removeProduct`, the snackbar, the store, or `CheckBuilder`'s `remove`.
- Do NOT animate the "and" connector separately. When the first row leaves, the next row's "and" disappears when the removal commits; that is accepted.
- Do NOT animate a group's switch to its empty state (`EmptyBox`) when its last card leaves.
- Do NOT move focus. A removed row's ✕ loses focus exactly as it does today.
- Do NOT touch other remove paths (`CheckInDetail`, `CheckResults` edit mode). They are out of scope.
- If any quoted code differs (for example if plan 007 has not been applied), STOP and report.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint components/ui/Collapse.tsx features/products/components/MyProducts.tsx features/check/components/CheckBasket.tsx` reports no diagnostics. `npm run build` succeeds.
- **Feel check** (`npm run dev`; DevTools → Animations at 10% where noted):
  - **`/products`:** open `Long-term products`, open a card, press `Remove`.
    - The card closes over about 200ms and the cards and groups below slide up.
    - The Undo snackbar appears as the close finishes, and the group count updates then.
    - At 10%, the next card's top ends **exactly** where the removed card's top was, with no 8px jump at the end.
  - **Undo:** the card grows back in, in its place.
  - **Remove two cards in quick succession:** both close; the second snackbar replaces the first.
  - **Reload `/products`** and open a group: no card animates on arrival.
  - **`/check/new`:** add 3 products, open the basket, and remove the middle one. The row and its "and" close together, and the tray shrinks smoothly (on mobile, its top edge glides down).
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: removal looks instant, and the store still updates about 200ms after the tap.
- **Done when**: no product row appears or disappears in a single frame on remove or Undo, and nothing animates on page arrival.

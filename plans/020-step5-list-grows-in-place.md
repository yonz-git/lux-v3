# 020 — Step 5's list grows in place

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: LOW. Occasional, and mostly behind the open tray.
- **Category**: Missed opportunities (preventing a jarring change)
- **Estimated scope**: 2 files, ~60 lines: `features/products/components/YourProducts.tsx` + `.module.css`

## Problem

```tsx
/* features/products/components/YourProducts.tsx:100-135 — current (abridged) */
        {!filled ? null : grouped ? (
          <div className={styles.listWrap}>
            {groups.map((g) => (
              <section key={g.bucket.id} className={styles.group}>
                <h2 className={styles.groupHeader}>
                  …
                </h2>
                <ul className={styles.list}>
                  {g.products.map((p) => (
                    <li key={p.id}>
                      <ProductRow name={fullName(p)} meta={p.size} product={p} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          …
          <ul className={`${styles.list} ${styles.listWrap}`}>
            {products.map((p) => (
              <li key={p.id}>
                <ProductRow … trailing={<Tag>{p.duration}</Tag>} />
              </li>
            ))}
          </ul>
        )}
```

1. **The list blanks when it starts grouping.** The list slot is a direct child of `QuestionScreen`'s `.content[data-reveal][data-reveal-stagger]` (`QuestionScreen.tsx:146`). When a second group gets its first product, the slot's element changes from `ul` to `div`, and React mounts a new element there. The new element then:
   - runs `lux-fade-in` again (`[data-reveal] > *`, 320ms);
   - waits out the 4th child's 120ms stagger delay first (`globals.css:2213`), holding opacity 0 under `backwards` fill.

   So the whole list disappears for 120ms and fades back in over 320ms.
2. **A new row pops in.** Rows are plain `<li>`s, so a product added while the list is on screen pushes `Add product` and the count down by a row plus 12 in one frame.

Both happen while the tray is open over the list. The list is visible behind the desktop dialog's 14% scrim and above the mobile sheet.

## Target

- **A stable slot.** The slot is always one `<div>`, which takes `.listWrap` only while filled, so the page reveal runs on it once, at arrival.
- **Rows grow in.** Rows are `<Collapse as="li" open appear={…}>`. A row missing from the previous hydrated render grows in; nothing grows in at arrival or on a reload.
- **Headers fade in.** When grouping starts on screen, each new group header fades in on `.reveal-quick` (200ms). The flag is latched at the header's mount, so the next render cannot remove the class mid-fade.
- **Accepted:**
  - Rows re-order into their groups instantly; a shared-layout move is out of scope.
  - With an always-present empty slot, `Add product`'s stagger delay at arrival moves from 120 to 160ms.

## Repo conventions to follow

- **The rows recipe** is plan 013's, in `features/products/components/MyProducts.tsx` `CategoryGroup` (`:303-332`, `:370-383`): a `drawn` ref updated in an effect, and `appear` for ids missing from it.
- **Hydration gate** for "nothing animates on reload": `features/progress/components/CheckInCalendar.tsx:155-159`.
- **`--collapse-gap`** is declared on the Collapse itself, as `.parent > :global(.collapse)`. Exemplar: `MyProducts.module.css:237-239`.

## Steps

1. `YourProducts.tsx`, imports:
   - replace `import { useState } from "react";` with `import { useEffect, useRef, useState } from "react";`;
   - add `import { Collapse } from "@/components/ui/Collapse";` after the `Tag` import.

2. Replace `  const { answers } = useInvestigation();` with `  const { answers, hydrated } = useInvestigation();`.

3. Directly after `  const grouped = groups.length > 1;` add

   ```tsx

     /* ⚠️ WHAT THE LIST HAS ALREADY DRAWN — added 13 Sep 2026. A row missing
        from it (added while the list is on screen, usually behind the tray)
        grows in, and a group header missing from it fades in. Not before the
        store has hydrated: products persist, and every restored row would grow
        in on a reload. */
     const drawn = useRef<{ rows: ReadonlySet<string>; headers: ReadonlySet<string> } | null>(
       null,
     );
     useEffect(() => {
       if (!hydrated) return;
       drawn.current = {
         rows: new Set(products.map((p) => p.id)),
         headers: new Set(grouped ? groups.map((g) => g.bucket.id) : []),
       };
     });
     const rowAppears = (id: string) => drawn.current !== null && !drawn.current.rows.has(id);
     const headerAppears = (id: string) =>
       drawn.current !== null && !drawn.current.headers.has(id);
   ```

4. Replace the whole `{!filled ? null : grouped ? ( … )}` expression (`:100-135`, keeping the `⚠️ THE EMPTY STATE DRAWS NO LIST AT ALL` comment above it) with

   ```tsx
           {/* ⚠️ ONE SLOT, ALWAYS THE SAME ELEMENT — changed 13 Sep 2026. It was
               `null`, a `ul` or a `div` depending on the list's state, and as a
               direct child of the step's revealed content every change of element
               re-ran the page fade: the whole list vanished for the stagger's
               120ms and faded back as the second group appeared. */}
           <div className={filled ? styles.listWrap : undefined}>
             {!filled ? null : grouped ? (
               groups.map((g) => (
                 <section key={g.bucket.id} className={styles.group}>
                   <GroupHeader
                     name={g.bucket.name}
                     span={BUCKET_WINDOW[g.bucket.id]}
                     appear={headerAppears(g.bucket.id)}
                   />
                   <ul className={styles.list}>
                     {g.products.map((p) => (
                       <Collapse as="li" key={p.id} open appear={rowAppears(p.id)}>
                         <ProductRow name={fullName(p)} meta={p.size} product={p} />
                       </Collapse>
                     ))}
                   </ul>
                 </section>
               ))
             ) : (
               // one group so far — a flat list, with each row's own duration `Tag`
               // carrying the period information a header would otherwise repeat
               <ul className={styles.list}>
                 {products.map((p) => (
                   <Collapse as="li" key={p.id} open appear={rowAppears(p.id)}>
                     <ProductRow
                       name={fullName(p)}
                       meta={p.size}
                       product={p}
                       trailing={<Tag>{p.duration}</Tag>}
                     />
                   </Collapse>
                 ))}
               </ul>
             )}
           </div>
   ```

5. At the end of the file, after `YourProducts`, add

   ```tsx

   /**
    * One group's header on the live-grouped list — the name beside its window.
    *
    * ⚠️ `appear` IS LATCHED AT MOUNT. A header that arrives while the list is on
    * screen fades in on `reveal-quick`; the flag is recomputed every render and
    * would come off on the next one, and removing the class cancels the fade
    * half way. A finished `reveal-quick` left on the element does nothing.
    */
   function GroupHeader({
     name,
     span,
     appear,
   }: {
     name: string;
     span: string;
     appear: boolean;
   }) {
     const [arriving] = useState(appear);
     return (
       <h2 className={arriving ? `${styles.groupHeader} reveal-quick` : styles.groupHeader}>
         <span className={`${styles.groupName} t-h6`}>{name}</span>
         <span className={`${styles.groupWindow} t-label-sm`}>{span}</span>
       </h2>
     );
   }
   ```

   If `BUCKET_WINDOW[g.bucket.id]` is not typed as `string`, widen `span` to that type rather than casting.

6. `YourProducts.module.css`. Directly after the `.list { … }` rule, add

   ```css

   /* rows are `Collapse` list items, so the 12 is declared on them and a row
      growing in opens its gap with it — "Dropdowns" in globals.css */
   .list > :global(.collapse) {
     --collapse-gap: var(--space-md);
   }
   ```

## Boundaries

- Do NOT change the flat-with-`Tag` design or the grouping rule. The comment at `:58-63` says both are deliberate.
- Do NOT add removal to step 5, and do not animate rows moving between groups.
- Do NOT touch `QuestionScreen`, `AddProductMethodSheet` or `ProductRow`.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP, empty store, 1440×900 so the list stays visible beside the dialog):
  - **First product.** On `/investigation/products`, add a product: `Add product` → search `cerave` → pick → `Add product` → a duration → `Add product`. The first row mounts as `li.collapse[data-state="entering"]` and its height grows from 0 over about 200ms.
  - **Second group.** Add a product with a duration that belongs to a different group. On every frame from that commit:
    - the list slot (`.content`'s fourth child) keeps computed opacity `1` and gets no new `lux-fade-in`;
    - each of the two headers has one `lux-fade-in` of 200ms;
    - the new row grows in;
    - the first row renders settled, with no `data-state`.
  - **Reload.** Reload with both products stored. The rows have no `data-state`, the headers have no `reveal-quick`, and no `lux-fade-in` runs on the slot beyond the page arrival.
- **Feel check**:
  - DevTools → Animations at 10%. Adding the second group never blanks the list; the headers fade in over rows that stay solid.
  - Rendering → emulate `prefers-reduced-motion: reduce`. Rows and headers appear at once.
- **Done when**: no product added on step 5 makes the list disappear or pushes what is below it down in one frame.

# 021 — The day record's rows and note editor move

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`). While this plan was written, another session was editing `features/progress/components/CheckInDetail.tsx` and `.module.css` (the grid columns, the photo well, a group `Tag` on each product row). That work has since landed as `8348ccb`, and the excerpts below match it. Every excerpt is matched by text, not line number; if one isn't found, STOP.
- **Severity**: MEDIUM
- **Category**: Missed opportunities (preventing a jarring change)
- **Estimated scope**: 2 files, ~100 lines: `features/progress/components/CheckInDetail.tsx` + `.module.css`

## Problem

`/progress/check-in/[date]`, the day record.

1. **Product rows pop in and out.** Each row is a plain `<li key={p.id} className={styles.product}>` (inside `<ul className={styles.productList}>`).
   - ✕ calls `removeProduct`, which writes the store at once and raises Undo (`removeProduct`, near `:206`). The row unmounts in one frame and the search field below jumps up by its 68px.
   - Undo, and adding from the search (`addProduct`), pop rows back in the same way.
2. **The note editor swaps in one frame.** The notes card swaps the note for its editor:

   ```tsx
   /* CheckInDetail.tsx — current (abridged) */
                     {editingNote ? (
                       <div className={styles.noteEditor}>
                         …
                         <TextField
                           autoFocus
                           value={noteDraft}
                           …
                         />
                         …
                       </div>
                     ) : entry.note ? (
                       …
                       <p className={`${styles.note} t-body3`}>
                         &ldquo;{entry.note}&rdquo;
                       </p>
                     ) : (
                       <p className={`${styles.empty} t-body3`}>
                         No note recorded for this day.
                       </p>
                     )}
   ```

   `Edit note` replaces a one-line quote with a field, a pill and a hint, about 120px taller, in one frame. `autoFocus` scrolls the page to the new field in one frame too.

Frequency: occasional.

## Target

- **Rows**, using plan 013's two beats:
  - ✕ marks the row leaving, and its `Collapse as="li"` closes over 200ms;
  - `removeProduct` then commits and Undo appears;
  - a row missing from the last hydrated render grows in (`appear`), which covers Undo and adding from the search.

  The removal runs through a ref to the latest `removeProduct`, because that function computes the day from `answers` and a closure from the tap would be 200ms stale.
- **Rule between rows.** The hairline moves to the rows' contents: `.productList > :global(.collapse) + :global(.collapse) .product`.
- **Note.** Two `Collapse`s in the card:
  - the note line is `open={!editingNote}`;
  - the editor is `open={editingNote}`;
  - both are declared at the card's own row gap.

  The line closes up while the editor opens down, so the card's height moves between the two.
- **Focus.** `autoFocus` is replaced by `CheckIn`'s recipe: `focus({ preventScroll: true })`, then a smooth `scrollIntoView({ block: "nearest" })` after the collapse's 200ms (instant under reduced motion).
- **Accepted:**
  - When the last product goes, "No products recorded for this day." appears in one frame after the row has closed.
  - Removing the first row drops the second row's top hairline in one frame at the end.

## Repo conventions to follow

- **The two-beat recipe:** `features/products/components/MyProducts.tsx` `CategoryGroup` (`:303-332`, `:370-383`) and `features/check/components/CheckBasket.tsx:144-167`.
- **A handler read through a ref**, so a timer runs the latest version: `lib/useModalDialog.ts` reads `onClose` that way.
- **Scroll-into-view after a collapse:** `features/progress/components/CheckIn.tsx:197-222`.
- **Hydration gate:** `features/progress/components/CheckInCalendar.tsx:155-159`.

## Steps

1. `CheckInDetail.tsx`, imports. Replace `import { Collapse } from "@/components/ui/Collapse";` with `import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";`. `useEffect`, `useRef` and `useState` are already imported from `react`.

2. Find the `useInvestigation()` destructure in `CheckInDetail` and add `hydrated` to the names it takes (e.g. `const { answers, setAnswer } = useInvestigation();` becomes `const { answers, setAnswer, hydrated } = useInvestigation();`).

3. Directly after the line `  const ownedIdsWhenOpened = owned.map((p) => p.id);` add

   ```tsx

     /* ⚠️ A REMOVED PRODUCT CLOSES BEFORE IT LEAVES THE DAY — added 13 Sep 2026,
        013's two beats (MyProducts.tsx `CategoryGroup`). The row used to unmount
        the moment ✕ wrote the store, and the search field under the list jumped
        up by its 68. `leave` closes the row's `Collapse` and only then commits,
        which is also when the Undo snackbar appears. */
     const [leaving, setLeaving] = useState<ReadonlySet<string>>(() => new Set());
     const removing = useRef(new Set<string>());
     /* the rows drawn on the last render — one missing from it (Undo, or added
        from the search below) grows in. Not before the store has hydrated, or
        every restored row would grow in on a reload. */
     const drawn = useRef<ReadonlySet<string> | null>(null);
     useEffect(() => {
       if (hydrated) drawn.current = new Set(products.map((p) => p.id));
     });
     /* the removal runs against the store as it is when the row has closed.
        `removeProduct` computes the day from `answers`, and a closure from the
        tap is 200ms stale — a second quick removal would write the first
        product back. Read through a ref, as `useModalDialog` reads `onClose`. */
     const removeLatest = useRef(removeProduct);
     useEffect(() => {
       removeLatest.current = removeProduct;
     });

     function leave(id: string, name: string) {
       if (removing.current.has(id)) return;
       removing.current.add(id);
       setLeaving((prev) => new Set(prev).add(id));
       window.setTimeout(() => {
         removing.current.delete(id);
         removeLatest.current(id, name);
         setLeaving((prev) => {
           const next = new Set(prev);
           next.delete(id);
           return next;
         });
       }, COLLAPSE_EXIT_MS);
     }
   ```

4. Directly after the effect that restores focus to the note's edit button (it ends `  }, [editingNote]);` and contains `restoreNoteFocus`), add

   ```tsx

     /* ⚠️ THE NOTE FIELD SCROLLS IN, IT DOES NOT JUMP — added 13 Sep 2026,
        `CheckIn`'s recipe (CheckIn.tsx, the note field). The editor grows in with
        `Collapse`, and `autoFocus` scrolled the page to a zero-height field in one
        frame. Focus skips the scroll; the smooth scroll waits out the collapse's
        200ms (`--duration-base` — keep in step) and aims at the whole field.
        Reduced motion scrolls instantly, which the global duration collapse
        cannot do for a JS scroll. */
     const noteFieldRef = useRef<HTMLInputElement>(null);
     useEffect(() => {
       if (!editingNote) return;
       const input = noteFieldRef.current;
       if (!input) return;
       input.focus({ preventScroll: true });
       const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
       const timer = window.setTimeout(() => {
         input.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
       }, 200);
       return () => window.clearTimeout(timer);
     }, [editingNote]);
   ```

5. The product rows. Inside `<ul className={styles.productList}>`:
   - replace the row's opening line

     ```tsx
                     <li key={p.id} className={styles.product}>
     ```

     with

     ```tsx
                     <Collapse
                       as="li"
                       key={p.id}
                       open={!leaving.has(p.id)}
                       appear={drawn.current !== null && !drawn.current.has(p.id)}
                     >
                       <div className={styles.product}>
     ```

   - replace the matching closing `                  </li>` (the one directly after the remove button's `</button>`) with

     ```tsx
                       </div>
                     </Collapse>
     ```

   - in that row's remove button, replace `onClick={() => removeProduct(p.id, fullName(p))}` with `onClick={() => leave(p.id, fullName(p))}`.
   - Re-indent the row's contents by two spaces. Nothing else inside the row changes.

6. The note. Replace the whole `{editingNote ? ( … ) : entry.note ? ( … ) : ( … )}` expression (quoted in Problem, including the long comments inside it) with the structure below. Keep every existing comment inside the editor and on the note paragraph exactly as it is, and remove only `autoFocus`:

   ```tsx
                     {/* ⚠️ THE NOTE AND ITS EDITOR HAND OVER IN PLACE — added
                         13 Sep 2026. `Edit note` swapped a one-line quote for a
                         field, a pill and a hint in one frame, and the card grew
                         by the difference. The line closes up while the editor
                         opens down, so the card's height moves between the two. */}
                     <Collapse open={!editingNote}>
                       {entry.note ? (
                         /* the quotes are the comp's and they are DISPLAY — what the
                            user typed is stored without them */
                         <p className={`${styles.note} t-body3`}>
                           &ldquo;{entry.note}&rdquo;
                         </p>
                       ) : (
                         <p className={`${styles.empty} t-body3`}>
                           No note recorded for this day.
                         </p>
                       )}
                     </Collapse>

                     <Collapse open={editingNote}>
                       <div className={styles.noteEditor}>
                         {/* …the existing `⚠️ A TextField, NOT A TEXTAREA` comment… */}
                         <TextField
                           ref={noteFieldRef}
                           value={noteDraft}
                           {/* …the existing onChange, onKeyDown (with its comment),
                               placeholder and aria-label, unchanged… */}
                         />

                         {/* …the existing SegmentedToggle with its comment, unchanged… */}

                         {/* …the existing noteHint paragraph, unchanged… */}
                       </div>
                     </Collapse>
   ```

   The `{/* … */}` placeholders above stand for existing code; do not paste them literally.

7. `CheckInDetail.module.css`. Replace

   ```css
   .product + .product {
     border-top: var(--border-width-hairline) solid var(--color-border-glass);
   }
   ```

   with

   ```css
   /* the rows are `Collapse` list items now (CheckInDetail.tsx, "A REMOVED
      PRODUCT CLOSES…"), so the rule sits between their contents */
   .productList > :global(.collapse) + :global(.collapse) .product {
     border-top: var(--border-width-hairline) solid var(--color-border-glass);
   }
   ```

8. Same file. Add, next to the notes-card rules (after `.noteHint { … }` is fine):

   ```css

   /* the note line and its editor are `Collapse`s (CheckInDetail.tsx), and the
      card's row gap is declared on them so it opens and closes with them */
   .notes > :global(.collapse) {
     --collapse-gap: var(--space-lg);
   }
   ```

   `--space-lg` (16) is `DataCard`'s gap (`components/ui/DataCard.module.css:7`). Check it in the browser: `getComputedStyle(notesCard).rowGap` must read `16px`. If it doesn't, use the token that matches, and STOP if none does.

## Boundaries

- Do NOT change what `removeProduct`, `addProduct`, `saveNote`, `closeNoteEditor` or the focus restoration do.
- Do NOT move the `Edit note` / `Add a note` button or animate it.
- Do NOT touch the search results `Collapse`, `closeManualAdd` or the photo card.
- Do NOT change the other session's grid, photo or `Tag` changes.
- If an excerpt isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP, 440×900). Open a day with products from the `/progress` calendar:
  - **Removal.** Tap ✕ on the first row:
    - its `li.collapse` gets `data-state="leaving"` and closes over about 200ms;
    - the Undo snackbar appears at about 200ms;
    - the search field's `getBoundingClientRect().top` moves smoothly, with the largest single-frame step under 35% of the row's height.
  - **Undo.** The row returns as `data-state="entering"` in its old place and grows.
  - **Two quick removals** (✕ on two rows within 100ms). Both products are gone after 400ms and neither comes back.
  - **Adding from search.** Type part of a library product's name and pick it. The results panel closes and the new row grows in.
  - **Note editor.** Tap `Edit note`:
    - the note line closes while the editor opens over about 200ms;
    - `document.activeElement` is the note input on the next frame;
    - `window.scrollY` doesn't jump in that frame.

    `Cancel` reverses it, and focus returns to the edit button.
  - **Reload.** Rows render with no `data-state`.
- **Feel check**:
  - DevTools → Animations at 10%. Rows close and grow; the note card's height eases between the line and the editor, and nothing below the card jumps.
  - Rendering → emulate `prefers-reduced-motion: reduce`. Everything swaps instantly, and the scroll to the field is instant.
- **Done when**: no removal, Undo, add or note edit on the day record moves content by a whole row or editor in one frame.

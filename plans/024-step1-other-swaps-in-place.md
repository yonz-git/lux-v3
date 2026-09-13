# 024 — Step 1's "Other" button and field swap in place

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: LOW
- **Category**: Missed opportunities (preventing a jarring change)
- **Estimated scope**: 2 files, ~50 lines: `features/my-skin/components/StartInvestigation.tsx` + `.module.css`

## Problem

```tsx
/* features/my-skin/components/StartInvestigation.tsx:186-222 — current (abridged) */
      <div className={styles.other}>
        {otherRevealed ? (
          <div className={styles.otherFieldWrap}>
            <TextField
              className="reveal-quick"
              ref={inputRef}
              value={otherText}
              …
            />
            <button
              type="button"
              className={styles.otherClear}
              aria-label="Remove description"
              onClick={closeOther}
            >
              <CloseIcon className={styles.otherClearIcon} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.otherButton}
            onClick={openOther}
          >
            <PlusIcon />
            <span className={`${styles.otherLabel} t-body2`}>
              Other, describe where
            </span>
          </button>
        )}
      </div>
```

- **Open.** Tapping `Other, describe where` removes the button in one frame. The field fades in on `reveal-quick`, but its ✕ pops in beside it.
- **Close.** ✕ or Escape removes the field in one frame, and the button pops back. `closeOther` also clears the answer, so a held field would show empty text.

Both controls are 56 tall (`.otherButton` `min-height: 56px`; `TextField` 56, or 58 on desktop). The swap changes almost no height, so it can be a true crossfade in place.

## Target

- **One grid cell.** The button and the field share one grid cell (`.other { display: grid }`, `.other > * { grid-area: 1 / 1 }`). This is the same stacking Welcome's two bubbles use to crossfade (`Welcome.module.css:90-99`).
- **Held for the exit.** Each control is held for its 200ms exit with `useDialogPresence`:
  - the leaving one gets `data-state="leaving"` and `inert`, and fades to 0 over `--duration-base` on `--ease-standard`;
  - the arriving one fades in on `reveal-quick`, but only while the other is still present, so neither fades at the page's own arrival.
- **Held text.** The leaving field shows its last text, through `useHeldWhileClosing`.
- **Interruption.** The leaving rule sets `animation: none`, so a reopen mid-fade turns round. This is the same load-bearing line as the tray exit in `globals.css:2330-2334`.
- **Accepted:**
  - On desktop the cell is 2px taller while the 58 field and the 56 button overlap, so it settles 2px at the end of a close.
  - Focus is not restored to the button after ✕, the same as today.

## Repo conventions to follow

- **Presence and held content:** `useDialogPresence` / `useHeldWhileClosing` in `lib/useModalDialog.ts`. Exemplar: `SearchView` in `features/products/components/AddProductMethodSheet.tsx:374-402`.
- **`closing` from the flag.** Derive the leaving state from the open flag itself rather than the hook's `leaving`, so there is no frame without the attribute (`components/ui/Collapse.tsx:68-74`).
- **Modules may declare `animation: none` and transitions**, since neither names keyframes.

## Steps

1. `StartInvestigation.tsx`, imports. After `import { useInvestigation } from "@/lib/store/InvestigationProvider";` add

   ```tsx
   import { useDialogPresence, useHeldWhileClosing } from "@/lib/useModalDialog";
   ```

2. Directly after `  const otherRevealed = otherOpen || otherText.length > 0;` add

   ```tsx

     /* ⚠️ THE BUTTON AND THE FIELD SWAP IN PLACE — added 13 Sep 2026. They share
        one grid cell (`.other`) and each is held for its 200ms exit, so opening
        fades the button out while the field fades in, and ✕ does the reverse —
        the button used to vanish in a frame and the field's ✕ to pop. The arriving
        one fades only while the other is still there, so nothing fades twice when
        the page itself arrives. The leaving field keeps its words: `closeOther`
        has already cleared the answer. */
     const field = useDialogPresence(otherRevealed);
     const button = useDialogPresence(!otherRevealed);
     const otherTextShown = useHeldWhileClosing(otherRevealed, otherText);
   ```

3. Replace the whole `<div className={styles.other}> … </div>` block quoted in Problem with

   ```tsx
         <div className={styles.other}>
           {(otherRevealed || field.present) && (
             <div
               className={
                 button.present
                   ? `${styles.otherFieldWrap} reveal-quick`
                   : styles.otherFieldWrap
               }
               data-state={otherRevealed ? undefined : "leaving"}
               inert={!otherRevealed}
             >
               <TextField
                 ref={inputRef}
                 value={otherTextShown}
                 placeholder="Describe where you noticed it"
                 aria-label="Other, describe where you noticed it"
                 style={{ paddingRight: 52 }}
                 onChange={(e) => setAnswer("locationOther", e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === "Escape") closeOther();
                 }}
               />
               <button
                 type="button"
                 className={styles.otherClear}
                 aria-label="Remove description"
                 onClick={closeOther}
               >
                 <CloseIcon className={styles.otherClearIcon} />
               </button>
             </div>
           )}

           {(!otherRevealed || button.present) && (
             <button
               type="button"
               className={
                 field.present ? `${styles.otherButton} reveal-quick` : styles.otherButton
               }
               data-state={otherRevealed ? "leaving" : undefined}
               inert={otherRevealed}
               onClick={openOther}
             >
               <PlusIcon />
               <span className={`${styles.otherLabel} t-body2`}>
                 Other, describe where
               </span>
             </button>
           )}
         </div>
   ```

   The `TextField` no longer carries `className="reveal-quick"`; the wrapper does.

4. `StartInvestigation.module.css`. Replace

   ```css
   .other {
     margin-top: var(--space-4xl); /* 40 */
   }

   /* .other is now just the spacing wrapper — it holds either the collapsed
      button or the revealed TextField, so the margin-top rule above stays on one
      selector regardless of which is showing. */
   ```

   with

   ```css
   .other {
     margin-top: var(--space-4xl); /* 40 */
     /* the collapsed button and the revealed field share this one cell and
        cross-fade — see StartInvestigation.tsx, `field` / `button` */
     display: grid;
   }

   .other > * {
     grid-area: 1 / 1;
   }

   /* the one on its way out. `animation: none` FIRST: a `reveal-quick` still
      running (reopened within 200ms) would outrank the fade-out until it ended —
      the same line the trays' exit carries in globals.css. A module may say
      `none`; it names no keyframes. */
   .otherButton[data-state="leaving"],
   .otherFieldWrap[data-state="leaving"] {
     animation: none;
     opacity: 0;
     transition: opacity var(--duration-base) var(--ease-standard);
   }
   ```

## Boundaries

- Do NOT change `openOther`, `closeOther`, `otherRevealed`, the answer keys, or the field's and button's own styling.
- Do NOT touch `SafetyNotice`, `FaceDiagram`, the photo button or `SelfieSheet`.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0. The layout changed, so also run `npm run spacing` (see its header for the commands) and expect no new findings on `/investigation/start`.
- **Measured** (dev server, headless Chrome over CDP, 440×900, `/investigation/start`, empty store):
  - **Arrival.** The button has no `reveal-quick` class.
  - **Open.** Tap `Other, describe where`:
    - for about 200ms both the button (`data-state="leaving"`, `inert`) and the field wrapper exist, with equal `getBoundingClientRect().top`;
    - the field has one `lux-fade-in`, and the button's opacity transitions to 0;
    - `document.activeElement` is the input;
    - `.other`'s height stays within 2px throughout.
  - **Close.** Type `jawline` and tap ✕. The leaving field still shows `jawline` while it fades, and the button fades in.
  - **Interrupt.** Tap the button again within 100ms of ✕. The field turns round from its current opacity without jumping to 0 or 1.
- **Feel check**:
  - DevTools → Animations at 10%. The control dissolves into the other in place, and nothing below `.other` moves.
  - Rendering → emulate `prefers-reduced-motion: reduce`. The swap is instant.
- **Done when**: the button and the field never both vanish in one frame, and neither pops in.

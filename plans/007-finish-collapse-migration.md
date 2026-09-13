# 007 — Finish the Collapse migration: the in-flow panels that still pop

- **Status**: DONE — 13 Sep 2026. Verified in headless Chrome:
  - **Resting gaps are unchanged.** The `/check/new` row is 16, the `/products` group 8 and the compact card 12, and each Collapse reads its own `--collapse-gap`. The compat card body inside `/check/results`' box still starts at 14px: its Collapse reads `0px`, so the new `.panel` gap does not leak into it.
  - **OtherBlock** (`/investigation/conditions`) grows in, focus lands in the field within one frame (15ms), the clip never scrolls, and it closes up.
  - **Check-in turn 3** grows in. Unticked and re-ticked 110ms later, it turns round on the same element.
  - **The note field** is focused on open (7ms) and keeps its typed text on screen while it closes.
  - **A day record's product search** keeps its matched row on screen through the 13 frames of its close, rather than "Nothing in your products matches".

  Observed, not changed: a returning visitor whose saved answers tick "Other" sees that field grow in on page load, because answers hydrate after the first render. It used to fade in.
- **Commit**: `c5edd11`. Search by quoted code.
- **Severity**: MEDIUM
- **Category**: Interruptibility / preventing a jarring change
- **Estimated scope**: 13 files, ~120 lines:
  - `components/ui/Collapse.tsx`, `app/globals.css`, `AGENTS.md`
  - `features/my-skin/components/OtherBlock.tsx` + `.module.css`
  - `features/progress/components/CheckIn.tsx` + `.module.css`
  - `features/check/components/CheckResults.tsx` + `.module.css`
  - `features/progress/components/CheckInDetail.tsx`
  - four existing `--collapse-gap` declarations in `ProductList.module.css`, `ProductAccordionCard.module.css`, `MyProducts.module.css`, `ProductDetails.module.css`

## ⚠️ Post-review change, 13 Sep 2026

`Collapse` now sets `inert` and `data-state="leaving"` only while `open` is still false: `const closing = leaving && !open`. `useDialogPresence` clears `leaving` in an effect, one render after `open` turns back on. A panel reopened during its 200ms exit therefore committed with `inert` still on it, and the caller's focus effect ran in that same commit, so the focus went nowhere. OtherBlock's field and the check-in note both came back unfocused. Before the fix, in headless Chrome (open, close, reopen 100ms into the exit): `reopenedTakesFocus: false` for both, with focus on `<body>`. After the fix, `true` for both: focus is in `Type the condition` and `Your note`, and the OtherBlock panel was confirmed to be mid-exit (`data-state="leaving"`) when it reopened. The reopened panel also turns round one frame sooner.

## Problem

The app has a recipe for panels that sit in the page flow: `<Collapse open>` plus the `.collapse` rules in `app/globals.css`, in the block headed "Dropdowns open DOWN and close back UP". The space animates, so the rows below slide instead of jumping. These panels still mount on a keyframe fade and vanish in one frame, so everything under them jumps down on open and back up on close:

```tsx
/* features/my-skin/components/OtherBlock.tsx:52-61 — current (the "Other" free-text field on flow steps) */
      {selected && (
        <TextField
          className="reveal-quick"
          ref={inputRef}
          value={value}
          placeholder={placeholder}
          aria-label={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
```

```tsx
/* features/progress/components/CheckIn.tsx:339-341 — current (turn 3 of the daily check-in; it disappears when the last change chip is unticked) */
          {/* ---- turn 3 — optional note and photo --------------------------- */}
          {askedExtras && (
            <div className={styles.turn}>
```

```tsx
/* features/progress/components/CheckIn.tsx:376-385 — current (the note field; the "Photo captured." line below it jumps) */
              {note !== null && (
                <TextField
                  ref={noteRef}
                  className="reveal-quick"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Anything worth remembering about today"
                  aria-label="Your note"
                />
              )}
```

```tsx
/* features/check/components/CheckResults.tsx:400-403 — current ("How long have you used …?" under the results box's list) */
            {asking && (
              <div className={`${styles.ask} reveal-quick`}>
                <p className={`${styles.askTitle} t-h6`} id={askId}>
                  How long have you used {fullName(asking)}?
```

```tsx
/* features/progress/components/CheckInDetail.tsx:564-568 — current (search results inside a day's record card) */
              {searching && (
                <div className={`${styles.results} reveal-quick`}>
                  {matches.length > 0 ? (
                    <ul className={styles.resultList}>
                      {matches.map((p) => (
```

Migrating them runs into three latent problems in `Collapse` that must be fixed first.

1. **It mounts one render late.**

   ```tsx
   /* components/ui/Collapse.tsx:35 and :47 — current */
     const { present, leaving } = useDialogPresence(open);
     …
     if (!present) return null;
   ```

   `useDialogPresence` sets `present` in an effect. OtherBlock focuses its field from an effect (`OtherBlock.tsx:39-42`), and so does the check-in note (`CheckIn.tsx:207-214`); both would run before the field exists.
2. **The clip is a scroll container.** `.collapse[data-state] > * { overflow: hidden; }`, and focusing a field inside a growing panel scrolls the clip's own content.
3. **`--collapse-gap` is declared on parents, and custom properties inherit.** For example, `.row[data-expandable] { … --collapse-gap: var(--space-lg); }` in `ProductList.module.css`. Declaring the results box's gap on `CheckResults`' `.panel` would reach every `CompatCard` body `Collapse` nested inside it, and each would start opening 8px too high.

Frequency: flow steps (tens/day), check results edits and the daily check-in (occasional).

## Target

- `Collapse` renders on the same render its `open` turns true: `if (!open && !present) return null;`.
- The clip is `overflow: clip`, which cannot be scrolled.
- `--collapse-gap` is registered as **non-inheriting** (`@property`, `<length>`, `inherits: false`, `initial-value: 0px`) and declared **on the Collapse element**: `.parent > :global(.collapse) { --collapse-gap: … }`. The four existing parent declarations move to that form.
- Each of the five panels is wrapped in `<Collapse>`, loses `reveal-quick`, and declares its parent's flex gap:

  | Panel | Parent | Gap |
  | --- | --- | --- |
  | OtherBlock field | `.block` | 8 |
  | Check-in turn 3 | `.chat` | 20 |
  | Check-in note field | `.turn` | 12 |
  | Check results "how long" question | `.panel` | 8 |
  | Day search results | `.add`, a block | none |

- Panels whose content reads state that is already empty when they start closing hold their last value with `useHeldWhileClosing` (from `lib/useModalDialog.ts`): the check-results question's `asking`, the day search's `matches`/`query`, and the note text.
- The check-in note scrolls into view **after** it has grown (200ms, matching `--duration-base`).

## Repo conventions to follow

- The recipe and its reasoning live in `app/globals.css` ("Dropdowns open DOWN and close back UP"). Exemplars of a migrated panel:
  - `features/products/components/ProductAccordionCard.tsx`: `<Collapse open={open}><div id={panelId} className={styles.panel}>…</div></Collapse>`
  - `features/check/components/CheckBuilder.tsx`: `useHeldWhileClosing(open, { loading, results, resultsLabel })`
- CSS Modules reference global classes with `:global(...)`. Exemplar: `.empty > :global(.lux-orb)` in `MyProducts.module.css`.
- Never name a keyframe animation in a module. Only custom properties are set there.

## Steps

1. **`components/ui/Collapse.tsx`: render on `open`.** Replace

   ```tsx
     if (!present) return null;
   ```

   with

   ```tsx
     /* ⚠️ `open`, NOT JUST `present`, DECIDES THE FIRST FRAME — changed 13 Sep
        2026. `useDialogPresence` sets `present` in an effect, so opening mounted
        the panel one render late, and a caller that focuses a field inside it
        from its own effect (OtherBlock, the check-in note) ran before the field
        existed. */
     if (!open && !present) return null;
   ```

2. **`app/globals.css`: register the gap, and clip without scrolling.**
   - Directly above the `.collapse {` rule, add:

     ```css
     /* declared ON the Collapse, never inherited — see "`--collapse-gap`" above */
     @property --collapse-gap {
       syntax: "<length>";
       inherits: false;
       initial-value: 0px;
     }
     ```

   - Replace

     ```css
     .collapse[data-state] > * {
       overflow: hidden;
     }
     ```

     with

     ```css
     /* `clip`, not `hidden`: a hidden box is still a scroll container, so
        focusing a field inside a growing panel scrolled the panel's own
        content to reveal it. A clip cannot scroll. */
     .collapse[data-state] > * {
       overflow: clip;
     }
     ```

   - In the block comment above, replace the paragraph that begins `⚠️ \`--collapse-gap\` IS THE PARENT'S FLEX GAP, DECLARED ON THE PARENT.` (it ends `A parent with no gap sets nothing.`) with:

     ```css
        ⚠️ `--collapse-gap` IS THE PARENT'S FLEX GAP, DECLARED ON THE COLLAPSE
        ITSELF — `.parent > :global(.collapse) { --collapse-gap: … }`. A gap exists
        the moment a second child does, so a panel mounting at 0fr still sat one
        gap under its header: an 8–16px jump before anything animated, and another
        at the end of the exit. The collapse starts that far up and eases down, so
        the gap opens with the panel. ⚠️ NOT ON THE PARENT, AND IT DOES NOT
        INHERIT (`@property` below): declared on a parent it reached every Collapse
        nested anywhere under it, and a compat card's body inside the results box
        started opening 8px high. A parent with no gap sets nothing.
     ```

3. **Move the four existing declarations onto the Collapse.** Behaviour at rest is unchanged, which the verification checks.
   - `features/products/components/ProductList.module.css`: delete the line `  --collapse-gap: var(--space-lg);` from the `.row[data-expandable] { … }` rule. Directly after that rule, add:

     ```css
     .row[data-expandable] > :global(.collapse) {
       --collapse-gap: var(--space-lg);
     }
     ```

   - `features/products/components/ProductAccordionCard.module.css`: delete `  --collapse-gap: var(--space-lg);` from `.card { … }` and add after that rule:

     ```css
     .card > :global(.collapse) {
       --collapse-gap: var(--space-lg);
     }
     ```

     Delete `  --collapse-gap: var(--space-md);` from `.card.compact { … }` and add after that rule:

     ```css
     .card.compact > :global(.collapse) {
       --collapse-gap: var(--space-md);
     }
     ```

   - `features/products/components/MyProducts.module.css`: delete `  --collapse-gap: var(--space-sm);` from `.group { … }` and add after that rule:

     ```css
     .group > :global(.collapse) {
       --collapse-gap: var(--space-sm);
     }
     ```

   - `features/products/components/ProductDetails.module.css`: replace

     ```css
     .inci {
       display: flex;
       flex-direction: column;
       gap: var(--space-sm);
       /* the same 8, handed to the list's `Collapse` — "Dropdowns" in globals.css */
       --collapse-gap: var(--space-sm);
     }
     ```

     with

     ```css
     .inci {
       display: flex;
       flex-direction: column;
       gap: var(--space-sm);
     }

     /* the same 8, declared on the list's `Collapse` — "Dropdowns" in globals.css */
     .inci > :global(.collapse) {
       --collapse-gap: var(--space-sm);
     }
     ```

   Where those rules' comments say the gap is "handed to" or declared on the parent, leave the wording. It is still the parent's gap.

4. **OtherBlock.**
   - `OtherBlock.tsx`: add `import { Collapse } from "@/components/ui/Collapse";` after `import { TextField } from "@/components/ui/TextField";`. Replace the block quoted in *Problem* with:

     ```tsx
           <Collapse open={selected}>
             <TextField
               ref={inputRef}
               value={value}
               placeholder={placeholder}
               aria-label={placeholder}
               onChange={(e) => onChange(e.target.value)}
             />
           </Collapse>
     ```

   - `OtherBlock.module.css`: after the `.block { … }` rule add:

     ```css
     /* the field grows in with `Collapse` — the 8 above is declared on it */
     .block > :global(.collapse) {
       --collapse-gap: var(--space-sm);
     }
     ```

5. **Check-in.**
   - `CheckIn.tsx` imports:
     - add `import { Collapse } from "@/components/ui/Collapse";` after `import { TextField } from "@/components/ui/TextField";`;
     - add `import { useHeldWhileClosing } from "@/lib/useModalDialog";` after `import { useToday } from "@/lib/useToday";`.
   - Same file: replace the whole block from `  /* ⚠️ THE NOTE FIELD SCROLLS IN, IT DOES NOT JUMP` through the effect's closing `  }, [noteOpen]);` (lines 195-214) with:

     ```tsx
       /* ⚠️ THE NOTE FIELD SCROLLS IN, IT DOES NOT JUMP — asked for directly 13 Sep
          2026 ("the chat moves up … now is stiff"). It used to carry `autoFocus`,
          and focusing a field makes the browser scroll it into view in a single
          frame, so the whole conversation snapped up the moment the tile was
          tapped. Focus now skips that scroll and the body is scrolled SMOOTHLY
          instead, to the same place: `scrollIntoView` honours the global focus
          `scroll-margin` (globals.css) exactly as the focus scroll did. The field
          grows in with `Collapse`, so the scroll waits the collapse's 200ms
          (`--duration-base` — keep in step) to aim at the whole field rather than
          at a zero-height row. Reduced motion scrolls instantly, which is what the
          global duration collapse cannot do for a JS scroll. */
       const noteRef = useRef<HTMLInputElement>(null);
       const noteOpen = note !== null;
       /* the text the field shows while it closes — `note` is already null then */
       const noteShown = useHeldWhileClosing(noteOpen, note ?? "");
       useEffect(() => {
         if (!noteOpen) return;
         const input = noteRef.current;
         if (!input) return;
         input.focus({ preventScroll: true });
         const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
         const timer = window.setTimeout(() => {
           input.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
         }, 200);
         return () => window.clearTimeout(timer);
       }, [noteOpen]);
     ```

   - Same file, turn 3: replace

     ```tsx
               {askedExtras && (
                 <div className={styles.turn}>
     ```

     with

     ```tsx
               <Collapse open={askedExtras}>
                 <div className={styles.turn}>
     ```

     Then replace the turn's closing, which sits directly before the "AN OVERLAY, NOT A ROUTE" comment:

     ```tsx
                 </div>
               )}
             </div>

             {/* ⚠️ AN OVERLAY, NOT A ROUTE
     ```

     with

     ```tsx
                 </div>
               </Collapse>
             </div>

             {/* ⚠️ AN OVERLAY, NOT A ROUTE
     ```

   - Same file, note field: replace the block quoted in *Problem* with:

     ```tsx
                   <Collapse open={noteOpen}>
                     <TextField
                       ref={noteRef}
                       value={noteShown}
                       onChange={(e) => setNote(e.target.value)}
                       placeholder="Anything worth remembering about today"
                       aria-label="Your note"
                     />
                   </Collapse>
     ```

   - `CheckIn.module.css`: after the `.chat { … }` rule add:

     ```css
     /* turn 3 grows in with `Collapse` — the 20 above is declared on it */
     .chat > :global(.collapse) {
       --collapse-gap: var(--space-xl);
     }
     ```

     After the `.turn { … }` rule add:

     ```css
     /* the note field grows in with `Collapse` — the 12 above is declared on it */
     .turn > :global(.collapse) {
       --collapse-gap: var(--space-md);
     }
     ```

6. **Check results question.**
   - `CheckResults.tsx` imports:
     - add `import { Collapse } from "@/components/ui/Collapse";` after `import { CloseIcon, PlusIcon } from "@/components/ui/icons";`;
     - add `import { useHeldWhileClosing } from "@/lib/useModalDialog";` after `import { useInvestigation } from "@/lib/store/InvestigationProvider";`.
   - Same file: directly after `  const [asking, setAsking] = useState<CatalogProduct | null>(null);` (line 124) add:

     ```tsx
       /* the product the question below is ABOUT — held while its panel closes,
          because `asking` is already null in the render that starts the exit */
       const askingShown = useHeldWhileClosing(asking !== null, asking);
     ```

   - Same file: replace the four lines quoted in *Problem* (400-403) with:

     ```tsx
                 <Collapse open={asking !== null}>
                 {askingShown && (
                   <div className={styles.ask}>
                     <p className={`${styles.askTitle} t-h6`} id={askId}>
                       How long have you used {fullName(askingShown)}?
     ```

   - Same file: inside that block, replace `askedDuration && keepUsing(asking, askedDuration)` with `askedDuration && keepUsing(askingShown, askedDuration)`.
   - Same file: replace the block's closing

     ```tsx
                   </div>
                 )}

                 {/* ⚠️ THE SAME ROW `/products` USES, AND THE SAME COMPONENT. It was
     ```

     with

     ```tsx
                   </div>
                 )}
                 </Collapse>

                 {/* ⚠️ THE SAME ROW `/products` USES, AND THE SAME COMPONENT. It was
     ```

     The wrapped block's own indentation is intentionally left as it was. Do not reformat the file.
   - `CheckResults.module.css`: after the `.panel { … }` rule (~line 144-149) add:

     ```css
     /* the "how long have you used it?" question grows in with `Collapse` — the
        8 above is declared on it, and only on it: a gap on `.panel` itself would
        reach every compat card's own Collapse inside the list */
     .panel > :global(.collapse) {
       --collapse-gap: var(--space-sm);
     }
     ```

7. **Day search results.**
   - `CheckInDetail.tsx` imports:
     - add `import { Collapse } from "@/components/ui/Collapse";` after `import { TextField } from "@/components/ui/TextField";`;
     - add `import { useHeldWhileClosing } from "@/lib/useModalDialog";` after `import { useToday } from "@/lib/useToday";`.
   - Same file: directly after `  const matches = searchProducts(owned, query).filter((p) => !listed.has(p.id));` (line 181) add:

     ```tsx
       /* what the results panel shows while it closes — emptying the field is
          what closes it, and that render has already lost the matches */
       const resultsShown = useHeldWhileClosing(searching, { matches, query });
     ```

   - Same file: replace the five lines quoted in *Problem* (564-568) with:

     ```tsx
                   <Collapse open={searching}>
                     <div className={styles.results}>
                       {resultsShown.matches.length > 0 ? (
                         <ul className={styles.resultList}>
                           {resultsShown.matches.map((p) => (
     ```

   - Same file: inside that panel, replace `Nothing in your products matches &ldquo;{query.trim()}` with `Nothing in your products matches &ldquo;{resultsShown.query.trim()}`.
   - Same file: replace the panel's closing

     ```tsx
                       </button>
                     </div>
                   )}
                 </div>
               </DataCard>
     ```

     with

     ```tsx
                       </button>
                     </div>
                   </Collapse>
                 </div>
               </DataCard>
     ```

   - Do NOT change the visually-hidden `role="status"` paragraph above it. It must keep reading the live `searching`/`matches`.
8. **`AGENTS.md`**: in the table under "A DROPDOWN IS NOT A REVEAL", replace the text `The parent declares its flex gap as \`--collapse-gap\`` with `The parent's flex gap is declared ON the Collapse: \`.parent > :global(.collapse) { --collapse-gap: … }\``.

## Boundaries

- Do NOT migrate `StartInvestigation.tsx`'s "Other" field, or `CheckResults`' `ProductPicker` swap. Those swap one control for another in place, not an expansion.
- Do NOT change `.collapse`'s durations, easing or the `.drop` recipe.
- Do NOT touch `components/ui/TextField.tsx`. Its doc comment mentions `reveal-quick` as its only `className` caller; leave it and note it in your report.
- Do NOT reformat files.
- If any quoted code is not found verbatim, STOP and report. Plans 010 and 013 touch neighbouring code.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint components/ui/Collapse.tsx features/my-skin/components/OtherBlock.tsx features/progress/components/CheckIn.tsx features/check/components/CheckResults.tsx features/progress/components/CheckInDetail.tsx` reports no diagnostics. `npm run build` succeeds.
- **Resting layout unchanged** (the gaps moved selectors), measured in the console after each open:
  - `/check/new`: open a product row; the panel's top minus the row head's bottom is **16**.
  - `/products`: open a group; its first card sits **8** below the row. Open a card; details sit **12** below its header (compact card).
  - `/check/results`: open a compat card. Its body starts exactly where it did before this plan, not 8px higher at the start (DevTools → Animations 10%).
- **Feel check** (`npm run dev`, DevTools → Animations at 10% for each):
  - **Flow step with an "Other" option** (e.g. `/investigation/conditions`):
    - tick Other; the field grows in, the rows below slide, and the caret is already in the field with no scroll jump inside the panel;
    - untick; the field closes and the rows slide back.
  - **`/progress` → Check in today:**
    - pick a trend and tick a change; turn 3 grows in;
    - untick the change; turn 3 closes smoothly;
    - tick again within 200ms; it turns round without replaying from zero.
  - **Same check-in, note:** tap `Add a note`. The field grows in, is focused, and the chat then scrolls smoothly to show the whole field. Tap again; it closes with its text still visible as it fades. With a photo captured, the "Photo captured." line slides rather than jumps.
  - **`/check/results`, results box:** `Edit`, add a product you don't own. The question grows in under the list. `Not now` closes it with the product's name still shown as it fades.
  - **`/progress/check-in/<a seeded date>`:** type in `Add a product` to see results grow in. Clear the field; the results close still showing the matches, not "Nothing in your products matches".
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: every panel opens and closes instantly, and focus behaviour still works.
- **Done when**: none of the five panels appears or disappears in one frame, and the resting gaps measure 16 / 8 / 12 exactly as before.

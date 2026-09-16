# Animation plans

These plans come from the `improve-animations` audits of 13 Sep 2026. Each one is self-contained: exact files, the current code quoted verbatim, target values, ordered steps, boundaries, and a feel check. Hand any plan to an executor as-is, or run `improve-animations execute plans/NNN-….md`.

**Batch 1 (001–013)** was written against the uncommitted tree on top of `d7220d6`. It landed on `design-trial` as one commit per plan, `a06e6f7..6276682`.

**Batch 2 (014–025)** answers "did animation reach every part that could?" It was written against `f23b117` on `design-trial`.

- ⚠️ **Another session's work landed right after.** While batch 2 was written, another session had uncommitted edits in `HubScreen.tsx` and `.module.css` (the `gridColumns` prop), `CheckInDetail.tsx` and `.module.css`, `CheckInPhotoArt.tsx`, `progress.ts` and `SkinProfileSummary.module.css`. Those edits landed straight afterwards as `8348ccb`, and plans 014 and 021 quote those files as they stand there.
- ⚠️ **`globals.css` line numbers read 14 higher on `main`.** `7481990` (on `main`) added 14 lines near the top of `app/globals.css`.
- Every plan quotes by text and says to STOP if its excerpt isn't found.

**Batch 3 (026–027)** answers "quite many elements the hover effect is not smooth" (15 Sep 2026). It was written against `a3b3fb3` on `new-adjustments`, with a dirty tree.

- ⚠️ **The excerpts are quoted from the working tree, not from `a3b3fb3`.** The selfie shutters' `duration/slow` in particular exists only as an uncommitted edit.
- Both sweeps paired every `:hover` in 31 stylesheets with its base transition. Only five hovers had nothing animating (027). The rest were covered, but all rode `--ease-standard`, which front-loads half its change into the first fifth of any duration. That is the snap (026).

**Batch 4 (028–031)** audits only the motion that landed after batch 3: the gallery carousel, the 15 Sep fade-up stagger, the basket bar's frost/shine/rise, and the products/progress/flow edits (16 Sep 2026). Written against `3933d37` on `new-adjustments`, with a dirty tree.

- ⚠️ **028 quotes uncommitted code.** The basket bar's `rise-in`, shine and 17.5px label were working-tree edits when it was written. The other three quote committed files.
- ⚠️ **One regression was fixed during the audit, not planned.** The new `.rise-in` had declared a second `@keyframes lux-rise-in`, which silently replaced Welcome's 24px rise with an 8px one. It was renamed `lux-rise-in-sm` in the same working tree.
- ⚠️ **014 is stale.** It quotes `lux-fade-in` on `[data-reveal] > *` (now `lux-fade-up`), and it removes `data-reveal` from `QuestionScreen`'s `.shell` without knowing `.card` has carried one since 15 Sep. Amend it before executing it.

## Plans

| # | Plan | Severity | Category | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| 001 | [Play the logo entrance once per page load](001-logo-entrance-once-per-load.md) | HIGH | Purpose & frequency | — | DONE |
| 002 | [SmoothScroll: leave trackpads to the browser](002-smoothscroll-leave-trackpads-alone.md) | HIGH | Interruptibility | — | DEFERRED — the classifier can't tell a Mac mouse from a trackpad; see the plan |
| 003 | [SmoothScroll: reverse immediately](003-smoothscroll-reverse-immediately.md) | MEDIUM | Interruptibility | 002 (ordering only) | DONE |
| 004 | [CanvasShader: stop dropping frames](004-canvas-frame-pacing.md) | MEDIUM | Performance | — | DONE |
| 005 | [Reduced motion: no invisible entrance delays](005-reduced-motion-entrance-delays.md) | MEDIUM | Accessibility | — | DONE |
| 006 | [Chat bubbles scale from their tail](006-chat-bubble-origin-at-tail.md) | MEDIUM | Physicality & origin | — | DONE |
| 007 | [Finish the Collapse migration](007-finish-collapse-migration.md) | MEDIUM | Interruptibility | — | DONE |
| 008 | [Snackbar: no blink, rise from the nav](008-snackbar-no-blink-rise-from-nav.md) | MEDIUM | Physicality & origin | — | DONE |
| 009 | [Button enable fade on `duration/base`](009-button-enable-fade-duration.md) | LOW | Easing & duration | — | DONE |
| 010 | [Presence takes the caller's exit duration](010-presence-exit-duration-per-caller.md) | LOW | Interruptibility | — | DONE |
| 011 | [Breath tokens and two timing comments](011-breath-tokens-and-timing-comments.md) | LOW | Cohesion & tokens | after 001, 005 | DONE — plus a step 8 added for two more stale comments |
| 012 | [Today's check-in lands on the calendar](012-checkin-disc-lands-on-calendar.md) | MEDIUM | Missed opportunity | — | DONE — amended before execution: waits for store hydration |
| 013 | [Removed products close; Undo reopens](013-product-removal-closes-smoothly.md) | MEDIUM | Missed opportunity | 007 | DONE |
| 014 | [Page chrome stays still when the page changes](014-page-chrome-stays-still.md) | HIGH | Purpose & frequency | — | TODO — ⚠️ STALE since the 15 Sep fade-up; amend before executing (see batch 4) |
| 015 | [The add tray's height follows its view](015-tray-height-follows-view.md) | MEDIUM | Missed opportunity | — | TODO |
| 016 | [Tray views fade in; a closing tray keeps its view](016-tray-views-arrive-and-hold-on-close.md) | MEDIUM | Missed opportunity + exit bug | 015 | TODO |
| 017 | [Selection marks fade in and out](017-selection-marks-fade.md) | LOW | Missed opportunity | — | TODO |
| 018 | [The analysis hands over from its passes](018-analysis-passes-hand-over.md) | MEDIUM | Jarring change + hydration bug | 014 (ordering only) | TODO |
| 019 | [Three states read at the wrong moment](019-state-read-at-wrong-moment.md) | MEDIUM | Correctness | — | TODO |
| 020 | [Step 5's list grows in place](020-step5-list-grows-in-place.md) | LOW | Missed opportunity | — | TODO |
| 021 | [The day record's rows and note editor move](021-day-record-rows-and-note-editor.md) | MEDIUM | Missed opportunity | — | TODO |
| 022 | [Check results' edit mode opens and closes](022-results-edit-mode-opens-closes.md) | MEDIUM | Interruptibility | — | TODO |
| 023 | [013's recipe in four more places](023-removal-recipe-follow-ups.md) | LOW | Missed opportunity | 015, 016, 019 | TODO |
| 024 | [Step 1's "Other" button and field swap in place](024-step1-other-swaps-in-place.md) | LOW | Missed opportunity | — | TODO |
| 025 | [The calendar's height follows the month](025-calendar-height-follows-month.md) | LOW | Missed opportunity | 015 | TODO |
| 026 | [Hovers run on a hover curve, not the entrance curve](026-hover-curve.md) | HIGH | Easing & duration | — | DONE — plus the `CheckInDetail` `.result` comment the plan missed. (A note here said `PhotoGallery`'s carousel hovers still rode `--ease-standard`; the batch 4 audit found they arrived on `--ease-hover` already.) |
| 027 | [Five hovers that still snap](027-five-hovers-that-snap.md) | MEDIUM | Easing & duration | 026 step 1 | DONE — its open `SegmentedToggle` follow-up is plan 031 |
| 028 | [The basket bar arrives once and stays put](028-basket-bar-stays-put.md) | MEDIUM | Purpose & frequency / Interruptibility | — | TODO |
| 029 | [The screen's action is never invisible while it can be pressed](029-footer-action-never-hidden.md) | MEDIUM | Purpose & frequency / Cohesion | — (014 must be amended separately) | TODO |
| 030 | [The gallery's position segment stays under the finger](030-gallery-track-follows-scroll.md) | MEDIUM | Interruptibility / Performance | — | TODO |
| 031 | [Save / Reset fade both ways, ink included](031-segment-disable-enable-both-fade.md) | LOW-MEDIUM | Interruptibility | 027 (done) | TODO |

## Recommended order

### Batch 1 (done)

1. **001**: the biggest felt win (a 4.8s wait on every return to Welcome), isolated to two files.
2. **002 → 003**: both edit `SmoothScroll`'s `onWheel`. 003 assumes 002's code is in place.
3. **004**: a one-comparison fix that affects every route.
4. **005**: accessibility, CSS only.
5. **009**, then **006**: tiny, independent.
6. **010**: presence API change plus its three dropdown callers.
7. **007**: fixes `Collapse` (render gate, `overflow: clip`, non-inheriting `--collapse-gap`), then migrates five panels.
8. **013**: extends `Collapse` (`as`, `appear`). Requires 007.
9. **008**: independent. Doing it after 013 means 013's removals exercise the new snackbar.
10. **012**: additive, independent.
11. **011**: last. It sweeps literals and comments in `globals.css`, `Welcome.tsx` and `LogoEntrance.tsx`, which 001 and 005 also touch. It matches by text, not line number.

### Batch 2

1. **014**: every navigation blinks the header, track and card. Two files.
2. **017**: tiny, and runs on every radio and checkbox tap.
3. **019**: three small bugs. 023 builds on its `MyProducts` change.
4. **015 → 016**: both edit `AddProductMethodSheet`. 016 edits the `viewKey` line 015 adds.
5. **020**: step 5's list.
6. **021**: the day record. It builds on the other session's `CheckInDetail` work, which landed as `8348ccb`.
7. **022**: `/check/results` edit mode.
8. **018**: the analysis hand-off. After 014, whose shell change it leans on.
9. **023**: after 015, 016 and 019.
10. **024**, then **025**: 025 needs 015's hook.

### Batch 3

Independent of batches 1 and 2. It can run before them.

1. **026**: adds `--ease-hover` and swaps the curve on every hover-only transition. Its step 4 (the button gradient reversals) is separable, so revert only that step if the buttons feel wrong.
2. **027**: needs 026's token. It adds the transitions that were missing, fades the two underlines by colour, and registers `--shine-ink`.

### Batch 4

All four are independent of each other and of batch 2, so any order works. By leverage:

1. **028**: the basket bar re-enters and re-shines inside `/check/new`'s core add loop. It needs the uncommitted bar work committed first.
2. **029**: two declarations, and it unhides `Continue` on every flow step.
3. **031**: two transition lists, and it closes 027's open follow-up.
4. **030**: the largest TSX change of the four, on a screen people open occasionally.

## Overlaps to watch

- **`app/globals.css`** is edited by 005, 006, 007 and 011. Batch 2 does not touch it.
- **`components/ui/Collapse.tsx`**: 007 then 013. Batch 2 adds callers (020, 021, 022, 023) but never changes it.
- **`features/my-skin/components/Welcome.tsx`**: 001 (logic) then 011 (one comment).
- **`components/layout/LogoEntrance.tsx`**: 001 (logic and doc comment) then 011 (one comment in a different block).
- **`AGENTS.md`**: 007 (the reveal table row), 013 and 015 (the components table rows).
- **`features/products/components/AddProductMethodSheet.tsx`**: 015 → 016 → 023 (part D).
- **`features/products/components/MyProducts.tsx`**: 019 (part C) → 023 (parts A and B).
- **`lib/useHeightTransition.ts`**: created by 015 for `Sheet`, reused by 025.
- **`components/layout/HubScreen.tsx`**: edited by 014 only. 018 and 019 rely on its heading and shell behaviour without editing it.
- **`app/globals.css`**: 026 (the token and `.specular`), then 027 (`@property --shine-ink`).
- **`CheckResults.module.css`, `SegmentedToggle.module.css`, `StartInvestigation.module.css`**: 026 swaps curves in some rules, 027 edits different rules. 026 leaves `.historyLink`, `.segment`'s `color` and `.segment::before`'s `opacity` alone on purpose.
- **`AddProductMethodSheet.module.css`**: 026 swaps four curves. Batch 2's 015, 016 and 023 edit the TSX, not these rules.
- **`components/layout/HubScreen.module.css` / `QuestionScreen.module.css`**: 029 changes only `.footer`'s `animation-delay`. 014 edits the TSX shells. Amend 014 first if both are run.

## Not planned — documented decisions the audit respected

### Batch 1

The code documents these as decisions, so no plan changes them:
- the 800ms chat-bubble entrance and its enter shine;
- the 600ms hover shine;
- the 400ms button gradient reversal;
- the background canvas's 60fps target and pixel cap;
- 320ms page-level reveals;
- Sheet 320ms in / 200ms out, with desktop sheets fading only;
- Snackbar's 4s hold and 320ms exit;
- no scale on press (`.pressable` overlay);
- a single global reduced-motion rule (plan 005 only fills its delay gap).

### Batch 2

- **Route exit transitions** (View Transitions API, `template.tsx`). A page-architecture decision. `docs/decisions.md` records that the proposed View Transitions and `motion/react` system never shipped and all motion is CSS. 014 removes the blink without it.
- **The add tray's results while typing.** The dropdown swaps between results and "Searching…" on each keystroke and the tray follows at once. Holding the previous results while a search runs would steady it, but that is a decision about what the dropdown says, not motion. 015 deliberately does not animate it.
- **Things read or used too often to move:** DateField month paging, counts, scores and charts updating, the focus ring, the nav's selected pill.
- **Step 5 rows travelling into their groups** (a shared-layout move). 020 fades the new headers in instead.
- **`SmallButton` disabled fade.** Nothing disables a `SmallButton` (checked 13 Sep 2026: no caller passes `disabled`), so its comment saying so is accurate and there is no state to animate.
- **Empty lines left when a list's last product goes.** The day record's "No products recorded" and the add tray's empty "Added products" block each pop in one frame after the last row has already closed.

### Batch 3

- **Durations.** The shutter went 120 → 320ms and still snapped, so 026 changes the curve and leaves every duration alone. If a hover still feels quick after 026, duration is the lever then, and it will work.
- **Press, selection, entrance and exit keep `--ease-standard`.** `.pressable`, `Chip`, `OptionRow`, `FaceDiagram`, `DateField`'s days, reveals, `Collapse`, `.drop` and `Sheet` all stay. A press wants the fast start, and selection feel was not the complaint.
- **The 600ms hover shine band.** Its curve is the band's crossing, a separate documented decision.
- **JavaScript hovers.** `Snackbar` pauses its timer on `onMouseEnter`, which is not a visual change. `FaceDiagram`'s `onPointerEnter` handlers drive the lit and focus highlights, whose transitions also carry selection, so the file is excluded along with its CSS.
- **`app/prototypes/dark-welcome/picker.css`.** A prototype switcher, not product UI.

### Batch 4

Found and vetted, but not selected for plans on 16 Sep 2026:
- **`/progress`'s phone stagger order.** The two column wrappers each restart `nth-child` counting under `display: contents`, so on a phone the trend lands with the first card and the check-in CTA before the calendar (`ProgressScreen.tsx`, the two `data-reveal data-reveal-stagger` wrappers).
- **`SymptomLocation`'s hover highlight** (`.mark`, `.name`, `.places`) rides `--ease-standard` on `duration/slow`. It mirrors `FaceDiagram`'s glow, which 026 excluded as selection, so switching one end alone would split one highlight across two curves.
- **`ProductThumb` animates `width`/`height`/`border-radius`** (36 → 48 as a compact card opens). It is a layout transition, but it was chosen so the name beside it moves too.
- **`PhotoGallery`'s hover scales** (`.strip:hover .more` 1.05, `.tile:hover .art` 1.03) jump instantly under reduced motion. Keeping the saturation lift and dropping the scale there would be the fix.
- **320ms hovers**: `SelfieSheet` `.shutter`, `CheckInDetail`'s search results. Over the 300ms UI budget, but both were asked for directly ("make the hover smooth", "smoothen hover animation").
- **Plan 014's amendment.** Recorded above as stale, not rewritten.

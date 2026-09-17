# Accessibility Audit: LUX, whole app

**Standard:** WCAG 2.1 AA (2.2 target-size criterion noted where relevant) · **Date:** 17 Sep 2026 · **Build:** `ebeef02` on `new-adjustments`, production build (`next build && next start -p 3100`)

## Summary

**Issues found:** 21 · **Critical:** 2 · **Major:** 9 · **Minor:** 10

The system-level work still holds: every route has a distinct title, one `<main>`, a labelled `<nav>`, a single `<h1>`, `lang="en"`, no unlabelled input, no image without `alt`, no exposed decorative SVG; every tab stop has an `outline` ring except the two fields that chose a 30 % gradient ring; the text-spacing pass (WCAG 1.4.12) is clean on 18 routes × 3 widths, there is no horizontal scroll at 320, 440 or 1440, and axe reports zero non-contrast violations on all 36 route × width passes.

Two things changed for the worse since the 8 Sep review and one changed for the better:

- **Regression — no dialog moves focus into itself on open.** All four `Sheet`s (selfie, add tray, gallery, date picker's sibling) and the check-in overlay leave focus on the opener. `useDialogPresence` starts with `present = false`, so on the render where `open` flips, the dialog is not in the DOM yet and `useModalDialog`'s effect runs with `ref.current === null`. The 8 Sep review recorded "focus moved to the dialog on open"; `useDialogPresence` landed 13 Sep.
- **Regression — the nav bar's labels.** Since the bar left `surface/frost-nav` on 13 Sep, the white labels measure 2.3–3.4 : 1 on every route at 14 px (mobile) / 16 px. That is the widest-reaching failure in the app now.
- **Resolved — the primary button.** The indigo `gradient/brand` reassignment (8 Sep) clears AA: no enabled `Button` label failed on any route (e.g. `Continue` on `/investigation/conditions`, `Start analysis` on `/products`).

## Method

- Production build on `:3100`; headless Chrome 152 over CDP, no dependencies (the same harness as `scripts/text-spacing.mjs`). 18 routes at 440 and 1440; the wait screens (`/check/analyzing`, the analysis's wait state) and `/prototypes/*` excluded.
- **axe-core 4.10.3** (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, best-practice) on every route × width.
- **Contrast by compositing, not by axe.** For every visible text node: rects and computed colour collected, all text made transparent, the page captured at full height, and 5–7 points under each text run sampled from the pixels; the worst point is reported. This is the method AGENTS.md prescribes, because every LUX surface is a gradient or a translucent stack and axe degrades to *incomplete* on those. Overlays (gallery, check-in, tray, selfie, active step 1) measured at 440 only. The nav labels are painted with `background-clip: text`, so their gradient was hidden and the bar sampled beneath; the white stop is what is reported (the violet shine stop is transient).
- **Keyboard with real key events over CDP** (`Input.dispatchKeyEvent`): a Tab walk on every route, the face diagram, both radio groups, the date grid, and open / trap / Escape / restore on all five dialogs. The desktop app's browser-pane key tool sends `KeyboardEvent`s with an empty `key`, so nothing keyboard-related was concluded from it.
- **Hit areas** include absolutely-positioned `::before` / `::after` (`.tap-target`, `Chip`'s pseudo-element).
- Headless Chrome wedged twice mid-run (WebGL canvas without a GPU) and was restarted with `--disable-gpu`; the dialog results below are from a clean session in which the gallery, check-in and gallery again were opened and closed in sequence.

## Findings

### Perceivable

| # | Issue | WCAG | Severity | Recommendation |
|---|-------|------|----------|----------------|
| 1 | **Bottom nav labels** (every route): white on the bar's `#17292f @26%` fill measures 3.19–3.35 : 1 for the active item and **2.28–2.46 : 1** for inactive items (0.85 opacity), at 14 px mobile / 16 px desktop. AGENTS.md already records ~2.9 : 1. | 1.4.3 | 🔴 Critical | Design decision recorded in AGENTS.md § 7 — raise in Figma. Numbers: the bar needs to composite to ≈ `#5c7178` or darker for white 14 px, or the labels need the app ink on a lighter bar. |
| 2 | **Compatibility scores on `/check/results`**: `45` in error rose 3.39 : 1, `62` in warning rose **2.50 : 1**, `94` / `98` in `feedback/success` 3.14–3.20 : 1, all 16 px Medium on the frosted card. | 1.4.3 | 🔴 Critical | Use the ink tiers: `text/success-ink` `#46664f` already exists for green (5.36 : 1); add `warning-ink` / `error-ink` siblings the same way (see AGENTS.md's `text/success-ink` note). |
| 3 | **Check-in record "better" tags** (`/progress/check-in/[date]`): `feedback/warning` `#d47873` on `feedback/warning-subtle` `#f4e7e6`, **2.58 : 1** at 12 / 14 px. The "worse" tags (white on `bg/symptom`) pass. | 1.4.3 | 🟡 Major | Same ink-tier fix as #2: text in the warning hue needs its own ink token. |
| 4 | **Band pills and likelihood tag**: white on `#c65953` (Avoid) 4.24 : 1 and on `#d47873` (Risky) **3.12 : 1**, 12 px, on `/check/results` and `/check/history`; "Moderate likelihood" white on `bg/brand-soft` `#7980af` 3.80 : 1. Listed as known-failing in AGENTS.md § 17. | 1.4.3 | 🟡 Major | Awaiting the Figma decision recorded in AGENTS.md. The Risky pill is the worst and is carried by colour + label, which is right — only the ratio is short. |
| 5 | **Deep tier (`surface/data-deep`) white text**: add-tray method tiles 3.82–4.08 : 1 (16 px title, 12 px subtitle); results emphasis block "Pause …" 3.82 : 1 (16 / 14 px); `Symptom Trend` title 4.47 : 1 at 1440 (4.80 at 440). | 1.4.3 | 🟡 Major | Chosen value per AGENTS.md § 17 ("do not improve it toward a passing one without asking") — raise in Figma; the opaque `#407375` built the same day gives white 5.35 : 1. |
| 6 | **Active symptom chip on step 1**: once a symptom is picked, its chip is white on rose `rgb(211,133,138)`, **2.80 : 1** at 14 px — the one state the user is asked to act inside. | 1.4.3 | 🟡 Major | The chip's active fill is a code-side decision (⚠️ NOT IN FIGMA, 14 Sep); either darken the rose to ≥ `#a86561` (error token, 4.6 : 1 with white) or keep the label in app ink. |
| 7 | **Face-diagram callout pills** on the read-only faces (`/progress`, `/investigation/profile`): white on `rgb(202,135,140)`, 2.85–2.89 : 1, and the label is **9.7 px** at 440 (11 px at 1440) because it scales with the 300-px face. | 1.4.3, 1.4.4 | 🟡 Major | Same rose ink as #6, and a floor on the callout font (the 14 px the diagram's region labels already keep). |
| 8 | **Selfie sheet helper** "Position your face in the oval…": `text/on-data-secondary` on the viewfinder well, **2.74 : 1** at 14 px; the sheet's `<h2>` 4.25 : 1. The 8 Sep review measured the check-in camera's helper at 3.52 : 1 — same recipe. | 1.4.3 | 🟡 Major | Put the helper on the sheet surface rather than over the viewfinder, or use `text/on-data-inverse` on the well. |
| 9 | **Search / text field focus ring** at 30 % of `gradient/brand`: composited over the canvas it computes to ≈ 1.3–1.6 : 1, well under the 3 : 1 a state indicator needs. The CSS comment says "well under 3 : 1 — softer by choice". `/check/new`, `/progress/check-in/[date]`, the tray's search, every `TextField`. | 1.4.11, 2.4.7 | 🟡 Major | Design decision — raise in Figma. A 2 px ring at ≥ 60 % of the gradient's dark end clears 3 : 1 on every LUX ground. |
| 10 | **Bucket window labels** on `/products` ("4+ weeks", "1–4 weeks", "< 1 week"): `text/muted` 12 px on the frosted group header, 4.20–4.47 : 1. | 1.4.3 | 🟢 Minor | `text/secondary` (`#4b4b57`) instead of `text/muted` on this one label, or 14 px. |
| 11 | **Date field placeholder** "Select a date": `text/muted` 16 px on the field, 4.30 : 1. | 1.4.3 | 🟢 Minor | Placeholder in `text/secondary`; it is the field's only visible label until a date exists. |
| 12 | **Product-bucket tags on the check-in record** (`Tag variant="brand"`): white on a translucent indigo measuring `rgb(97–106, 122–129, 163–169)`, 3.94–4.37 : 1 at 12 / 14 px. | 1.4.3 | 🟢 Minor | The brand `Tag` is opaque `bg/brand` elsewhere (10.7 : 1); this instance is lighter — check what dilutes it in `CheckInDetail.module.css`. |
| 13 | **Welcome's reply bubble** ("I can help identify possible links…") is `aria-hidden` and has no screen-reader equivalent; the `<h1>` covers only the question. | 1.3.1 | 🟢 Minor | Give the reply a `visually-hidden` twin the way the question has, or un-hide the reply bubble only. |

### Operable

| # | Issue | WCAG | Severity | Recommendation |
|---|-------|------|----------|----------------|
| 14 | ✅ **FIXED 17 Sep 2026** (`Sheet.tsx`, `CheckInOverlay.tsx`: the hook is armed on `open && present`; verified on all four dialogs). **No dialog moved focus into itself on open** — selfie sheet, add tray, gallery, check-in overlay (and the date picker's `Sheet` sibling). Focus stays on the opener; the first Tab lands on `Close`; the page behind is not `inert`, so a screen reader's reading cursor is still on the page it just left. Verified in a clean session: `focus: BUTTON:Open progress gallery` 1.5 s after open, same for `Check in today`, `Add more products`, `Take a photo`. Cause: `useDialogPresence` initialises `present = false`; `useModalDialog`'s effect (deps `[open, ref]`) runs on the same commit with `ref.current === null`. | 2.4.3, 4.1.2 | 🟡 Major | Gate the focus effect on presence: call `useModalDialog(open && present, …)` after `useDialogPresence`, or add `present` to the effect and focus when both are true. One line in `lib/useModalDialog.ts` or its two callers (`Sheet.tsx:98`, `CheckInOverlay.tsx:61`). |
| 15 | **Targets under 24 × 24** (WCAG 2.2 AA 2.5.8; 2.5.5's 44 px is AAA): `Edit note` 49 × **16**, `View previous analyses` 169 × **22** (`/check`, `/check/results`), the two search inputs **28** tall, the `Add …` buttons on `/check/new` 54 × 30, `Edit` 25 × 24 (hit area). Under 44: calendar discs 32 × 32 (the Figma measurement, left alone on 8 Sep), `Save & exit` 119 × 38, `None, skip to next` 36 tall, compat rows 36 tall. | 2.5.8 (2.2) / 2.5.5 (AAA) | 🟢 Minor | `.tap-target` on `Edit note` and `View previous analyses` — the class exists for exactly this. The rest are Figma measurements. |
| 16 | **Radio groups are five Tab stops each** and arrow keys do not move focus: skin type, timing's status, the check-in scale, the tray's duration, the results strip. Operable, but not the ARIA radio-group pattern a screen-reader user expects ("1 of 5", arrows to change). | 2.1.1 (pattern), 4.1.2 | 🟢 Minor | Roving `tabindex` + Arrow handling in `OptionRow` / the radio `Chip`, once, since both take `control="radio"`. |
| 17 | **Ambient canvas shader** runs continuously behind every screen with no pause control. Honours `prefers-reduced-motion` (one frame, never rescheduled). | 2.2.2 | 🟢 Minor | Accepted with the reduced-motion path; a pause affordance would be a Figma decision. |

### Understandable

| # | Issue | WCAG | Severity | Recommendation |
|---|-------|------|----------|----------------|
| 18 | **`Continue` is disabled with no visible reason** on steps 1–4 (the 8 Sep review noted the same; `/check/new` already says "Pick at least 2 products"). | 3.3.2 | 🟢 Minor | One helper line per step, or `aria-describedby` from the disabled button to the question — copy is a Figma decision. |
| 19 | **Step 1's live region never speaks.** Picking a symptom disables the other chips and enables the face; `Save` closes it; the `aria-live="polite"` paragraph only ever says "Selections cleared". Verified: both regions empty after pick, after marking a place, and after `Save`. | 4.1.3 | 🟢 Minor | Announce "Redness selected — mark the places on the face" and "Redness saved" through the existing region. |

### Robust

| # | Issue | WCAG | Severity | Recommendation |
|---|-------|------|----------|----------------|
| 20 | **"Add product / Search again" is a `role="tablist"`** with two `role="tab"` buttons and `aria-selected="false"` on both (`AddProductMethodSheet.tsx:586`, `SegmentedToggle` without `actions`). They are two actions, announced as tabs that control nothing. | 4.1.2 | 🟡 Major | Pass `actions` (the `role="group"` branch step 1 and the note editor already use). |
| 21 | **"Take a photo" carries `aria-pressed`** and also swaps its label to "Retake photo" (`CheckIn.tsx:412`). A toggle that renames itself announces two different states at once. | 4.1.2 | 🟢 Minor | Drop `aria-pressed`; the label already carries the state. `Add a note` (which keeps its label) is fine with it. |

## Color Contrast Check

All composited; the worst sampled point. "Large" text (≥ 24 px, or ≥ 18.66 px bold) needs 3 : 1; nothing failing here is large.

| Element | Foreground | Background (composited) | Ratio | Required | Pass? |
|---------|-----------|------------|-------|----------|-------|
| Nav label, active (all routes, 440) | `#ffffff` | `rgb(118,147,158)` | 3.19 : 1 | 4.5 : 1 | ❌ |
| Nav label, inactive at 0.85 (all routes, 440) | `#ffffff` @ 0.85 | `rgb(128–133, 161–167, 170–175)` | 2.28–2.43 : 1 | 4.5 : 1 | ❌ |
| Nav label, active (1440) | `#ffffff` | `rgb(117,143,154)` | 3.35 : 1 | 4.5 : 1 | ❌ |
| Compat score "62" (`/check/results`) | `#d47873` | `rgb(217,233,235)` | 2.50 : 1 | 4.5 : 1 | ❌ |
| Compat score "45" | `#c65953` | `rgb(217,233,235)` | 3.39 : 1 | 4.5 : 1 | ❌ |
| Compat scores "94" / "98" | `#5f8a6e` | `rgb(218,234,235)` | 3.14–3.20 : 1 | 4.5 : 1 | ❌ |
| Check-in "better" tag | `#d47873` | `#f4e7e6` | 2.58 : 1 | 4.5 : 1 | ❌ |
| "Risky" pill (results, history) | `#ffffff` | `#d47873` | 3.12 : 1 | 4.5 : 1 | ❌ |
| "Avoid" pill (results, history) | `#ffffff` | `#c65953` | 4.24 : 1 | 4.5 : 1 | ❌ |
| "Moderate likelihood" tag | `#ffffff` | `#7980af` | 3.80 : 1 | 4.5 : 1 | ❌ |
| Tray method tile title / subtitle | `#ffffff` | `rgb(84–88,133–138,147–151)` | 3.82–4.08 : 1 | 4.5 : 1 | ❌ |
| Results emphasis block | `#ffffff` | `rgb(89,138,149)` | 3.82 : 1 | 4.5 : 1 | ❌ |
| `Symptom Trend` title (1440) | `#ffffff` | `rgb(83,126,135)` | 4.47 : 1 | 4.5 : 1 | ❌ (4.80 at 440 ✅) |
| Trend axis labels (12 px) | `#ffffff` | deep tier | 4.89–5.32 : 1 | 4.5 : 1 | ✅ |
| Active symptom chip (step 1) | `#ffffff` | `rgb(211,133,138)` | 2.80 : 1 | 4.5 : 1 | ❌ |
| Face callout pill, read-only faces (9.7 px) | `#ffffff` | `rgb(202,135,140)` | 2.85 : 1 | 4.5 : 1 | ❌ |
| Lit region label on the active face, 12 px | `#ffffff` | `rgb(51,130,149)` | 4.40 : 1 | 4.5 : 1 | ❌ (marginal) |
| Selfie sheet helper | `#354446` | `rgb(108,136,159)` | 2.74 : 1 | 4.5 : 1 | ❌ |
| Selfie sheet heading (16 px) | `#2e2a3f` | `rgb(116,148,155)` | 4.25 : 1 | 4.5 : 1 | ❌ |
| Bucket window label (12 px) | `#63636f` | `rgb(200–209, 221–227, 225–230)` | 4.20–4.47 : 1 | 4.5 : 1 | ❌ |
| Date placeholder | `#63636f` | `rgb(204,223,227)` | 4.30 : 1 | 4.5 : 1 | ❌ |
| Brand `Tag` on the check-in record | `#ffffff` | `rgb(97–106,122–129,163–169)` | 3.94–4.37 : 1 | 4.5 : 1 | ❌ |
| Search / text field focus ring (30 % gradient) | `#657792`→`#39386f` @ 0.3 | canvas ≈ `rgb(205,225,228)` | ≈ 1.3–1.6 : 1 (computed) | 3 : 1 | ❌ |
| Primary `Button` label, enabled (10 routes) | `#ffffff` | `gradient/brand` | ≥ 4.56 : 1 | 4.5 : 1 | ✅ (was 3.12 on 8 Sep) |
| Body, headings, option rows, chips at rest, System B card text, calendar digits on `bg/brand` | app ink / white | — | all ≥ 4.5 : 1 | 4.5 : 1 | ✅ |

**Carried from 8 Sep, not re-measured this pass:** the calendar "Today" ring (`border/glass`, 1.44 : 1 against 3 : 1 for SC 1.4.11); the check basket sheet's item labels (2.39 : 1 — `/check/new`'s basket was not opened); the modal scrim being `state/pressed-overlay` rather than a scrim token.

## Keyboard Navigation

| Element | Tab Order | Enter/Space | Escape | Arrow Keys |
|---------|-----------|-------------|--------|------------|
| Flow step header (`Back`, `Save & exit`) → question → controls → `Continue` → nav | Follows the visual order on every step; nav last | Activates | — | — |
| Step 1 symptom chips (`role="checkbox"`) | Tabbable; the other seven become disabled once one is picked | Space / Enter toggle; picking one enables the face | — | — |
| Step 1 face regions (`role="checkbox"`, disabled until a symptom is picked) | Forehead → Eye area → … → Other, in DOM order (the face precedes the chips visually too) | Space / Enter toggle and enable `Save` | — | — |
| `Save` / `Reset` / `Reset all` (`role="group"`) | After the face | Enter saves; focus lands on the next enabled chip | — | — |
| Radio groups (skin type, timing, check-in scale, tray duration, results strip) | **Every radio is a Tab stop** | Space / Enter select | — | **No arrow-key movement** (finding 16) |
| Date field | Button → dialog: `Previous month` → `Next month` → today's cell (roving `tabindex`) | Enter opens; Enter on a cell selects, closes and returns focus to the button showing "Sep 25, 2026" | Closes, focus restored | ← → ↓ move by day and week ✅ |
| Sheets (selfie, add tray, gallery) and check-in overlay | Trap cycles inside the dialog (`Close` → contents → `Done`/last → `Close`), Shift+Tab reverses | Opens from the trigger by Enter | Closes; focus restored to the opener ✅ | — |
| Dialog open | **Focus stays on the opener** (finding 14) | | | |
| Gallery tiles (`Photo from September 14, 2026, day 13` …) | In the dialog, newest first | Links to the check-in record | | |
| Calendar discs (`2 Wednesday, September 2, 2026, checked in`) | Month buttons → checked-in days → `Check in today` | Links | — | — |
| Product accordions, ingredient disclosures, compat rows | Tabbable, `aria-expanded` + `aria-controls` | Toggle | — | — |
| Bottom nav (`Sections`) | Last on every route; `aria-current="page"` on the active item | Navigates | — | — |

Focus rings: an `outline` (2 px, `#4d4785`) on every tab stop on every route, including inside the dialogs, except the two field recipes in finding 9 (transparent `outline` + 30 % gradient ring).

## Screen Reader

Derived from the accessibility tree and names, not from a live VoiceOver session — that remains worth doing for the face diagram and the check-in chat.

| Element | Announced As | Issue |
|---------|-------------|-------|
| Page load / client navigation | Title via `RouteAnnouncer` (`Create skin profile · LUX`, `Progress · LUX`, …), focus to `<main>` | ✅ |
| Welcome | `heading level 1, How is your skin feeling today?` then `link, Create skin profile` | The reply bubble is skipped (finding 13) |
| Step 1 question group | `group, What is currently happening to your skin?` + instruction via `aria-describedby` | Nothing announces that picking a symptom enabled the face (finding 19) |
| Face region | `Forehead, checkbox, not checked` (`disabled` before a symptom) | ✅; callouts are also a hidden list "Symptoms by place" ✅ |
| Progress bar on flow steps | `Investigation progress, progress bar, Step 2 of 5` | ✅ |
| Compat row | `Paula's Choice BHA Exfoliant, 45 % compatible, Avoid, button, collapsed` (pill and figure hidden, hidden text carries both) | ✅ |
| Score ring on a compat card | `45 % compatible, image` | ✅ |
| Symptom trend | Heading `Symptom Trend`, then a hidden list of every point's figure; axes and canvas hidden | ✅ text alternative present |
| Calendar day | `2 Wednesday, September 2, 2026, checked in, link` | ✅ |
| Gallery tile | `Photo from September 14, 2026, day 13, link` | ✅ |
| Dialogs | `dialog, Take a photo of the affected area.` / `Progress gallery` / `Daily check-in` / `Add a product` | Not announced on open, because focus does not enter (finding 14) |
| Tray confirmation | `tab list` → `Add product, tab, not selected` / `Search again, tab, not selected` | Finding 20 |
| Check-in "Take a photo" | `Take a photo, toggle button, not pressed` → `Retake photo, toggle button, pressed` | Finding 21 |
| Nav | `navigation, Sections` → `My skin, link` … `Progress, link, current page` | ✅ |
| Live regions | Snackbar `status`; search results "N results" `status`; safety notice `status`; check-in `status` | ✅ |

## Priority Fixes

1. **Move focus into dialogs on open** (finding 14) — affects every screen-reader and keyboard user of all five overlays, and it is a regression against a documented pass; one-line gate on `present` in `lib/useModalDialog.ts` or its two callers.
2. **Nav label contrast** (finding 1) — every user on every route; a palette decision for Figma, but the one that reaches furthest.
3. **Warning / error ink tiers** (findings 2, 3, 6, 7) — one pair of tokens beside `text/success-ink` fixes the compat scores, the check-in "better" tags, the active symptom chip and the face callouts at once; no fill changes.
4. **`actions` on the tray's confirm pill** (finding 20) — a prop, already supported.
5. **Deep tier, band pills, 30 % focus ring** (findings 4, 5, 9) — already recorded as chosen values awaiting Figma; this pass only re-confirms the ratios.
6. **Small targets** (finding 15) — `.tap-target` on `Edit note` and `View previous analyses`; the rest are Figma measurements.
7. **Radio-group arrows, step 1 announcements, `aria-pressed`, placeholder / label inks** (findings 16, 19, 21, 10–12) — polish.

## What works well

- Every route: distinct title, `RouteAnnouncer`, one `<main>`, `nav[aria-label]`, one `<h1>` and an honest heading outline (`H2` overlines on the data cards, `H3` per compat card).
- No unlabelled control anywhere: every icon-only button (`Back`, `Close`, `Clear search`, `Remove …`, `Previous month`) carries a name that says what it acts on.
- The face diagram is fully keyboard-operable and has a text alternative; the date grid follows the ARIA grid pattern with a roving tab stop.
- Dialog traps, Escape and focus restoration all work (the check-in overlay's scrim deliberately does not close it, and the store holds no partial check-in — that is documented and right).
- WCAG 1.4.12 text spacing: clean on 18 routes × 320 / 440 / 1440. Reflow at 320: nothing clipped, no horizontal scroll.
- `prefers-reduced-motion` collapses every duration globally and stops the shader; `prefers-reduced-transparency` falls back to opaque surfaces.
- Text selection, caret and native control accents bind `bg/brand`; the primary button label now clears AA across the whole gradient.

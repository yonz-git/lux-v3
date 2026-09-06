# Design Review: LUX — whole app, 17 routes

Reviewed against: `AGENTS.md` (no `.design/` brief exists; AGENTS.md is the design authority in this repo, and it names Figma `wIftBhzkn8E4wjZwgdH71n`, page `06. Screen Designs`, as the source of truth)
Philosophy: calm frosted-glass wellness UI — Surface System A (light frosted rows/cards) for forms, Surface System B (sage data cards) for readouts
Branch: `case-study` @ `d5b99a5`
Date: 2026-09-03
Status: **all nine non-colour findings are closed — eight fixed and re-measured, the ninth accepted as designed.** That ninth (`Continue` rendering behind the nav pill on the two flow screens that outgrow the viewport) was walked on 7 Sep 2026 and is **not a defect**: the button is fully reachable by scrolling, which is what the page's bottom reservation guarantees. It is written up under *Accepted* below. The colour and contrast findings are left exactly as they were, by instruction; they are still listed below because they are the largest group. Two findings turned out to be my own measurement errors and are corrected at the end.

## How this was measured

No Playwright or Cursor browser MCP was available and the Claude-in-Chrome connection was down, so the review drove the running dev server (`localhost:3000`) through Chrome's DevTools Protocol directly (headless Chrome 2× DPR, no dependencies). That allowed measurement rather than eyeballing, which AGENTS.md explicitly requires:

- **Screenshots are viewport captures, not full-page.** Full-page capture expands the viewport and re-flows every `100dvh` layout in this app — the first pass hid `Continue` on one screen and moved it on others. Pages taller than the viewport also have a `-bottom` capture taken after scrolling to the end.
- **Contrast was measured by compositing, not by axe.** For each screen, every distinct text style was collected with its rect, then all text was made transparent, the screen re-captured, and the true composited background sampled from the pixels under each text block. This is the method AGENTS.md prescribes; axe reports zero contrast violations on all of these screens because every background is a gradient or a translucent stack.
- **Focus rings were measured with real `Tab` key events** (`Input.dispatchKeyEvent`), not `el.focus()` — programmatic focus does not match `:focus-visible` on a button, which produces a false "no ring anywhere" result.
- **Occlusion was hit-tested** with `document.elementFromPoint` at each control's centre after scrolling to the resting position, at five viewport sizes.

## Screenshots Captured

165 PNGs in `.design/whole-app/screenshots/`. Screens changed by the fixes were re-captured in place.

| Group | Files | What it covers |
| ----- | ----- | -------------- |
| `review-<screen>-mobile-375` | 16 | small phone |
| `review-<screen>-figma-mobile-440` | 16 | the Figma mobile canvas |
| `review-<screen>-tablet-768` | 16 | tablet |
| `review-<screen>-breakpoint-1024` | 16 | exactly at the desktop breakpoint |
| `review-<screen>-desktop-1280` | 16 | laptop |
| `review-<screen>-figma-desktop-1440` | 16 | the Figma desktop canvas |
| `review-<screen>-…-bottom` | 33 | the same screens scrolled to the end, where they overflow |
| `state-*` | 36 | trays, sheets, overlays, selected states, hover, focus ring, analysing, reduced-transparency |

## Summary

The system-level work is in good shape: token discipline is close to perfect, every tabbable control has a real focus ring, the sheets are properly modal (and do restore focus), and the global Surface System B text fix holds everywhere it was applied. The build's weakness was two layout errors that put an action out of reach and a selected-state stroke that had never rendered at all. `View previous checks` at 1024×768 and the missing stroke are fixed. `Continue` rendering *behind* the nav pill on the two overflowing flow screens was re-examined and accepted: it describes an at-rest state on a form that scrolls, not an action out of reach. What remains is contrast on brand surfaces, which is a palette decision and was left alone by instruction.

## Fixed in this pass

| # | Finding | Fix | Verified |
| - | ------- | --- | -------- |
| 1 | `View previous checks` unclickable at 1024×768 — hit-testing its centre returned the `nav` | `app/globals.css`: a centred hub screen takes its nav reservation back under `@media (min-width: 1024px) and (max-height: 860px)`. Both Figma canvases are unaffected — height is what runs out, not width | `elementFromPoint` finds nothing occluded at 1024×768, 1280×800 or 1440×900 |
| 2 | The selected option row never drew its stroke — the doc comment promised "1.5px, colour-only between states" but no width or style was ever set, so `border-color` resolved against `0px none` | `OptionRow.module.css`: `border: var(--border-width-thin) solid transparent`, colour rules unchanged | Selected row now computes `1.5px solid rgb(77,71,133)`; row height still 56 mobile / 58 desktop |
| 3 | Body copy ran 103–115 characters per line on `/check/results` at desktop | `ResultCards.module.css` + `CheckResults`: a 52ch measure on the card prose, and the verdict sentence wrapped in its own span so the bubble keeps the comp's full-width row | No text over 78 cpl at 1024 or 1440 (was 90–115) |
| 4 | `/products` rested with its content in the top half and 480px of empty canvas under the action | `HubScreen.module.css`: `margin-top: auto` + `padding-top: 32`, so 32 is a minimum rather than a position — a full screen is unchanged, a short one drops its action to the bottom | `Start analysis` now sits above the nav at 440; desktop unchanged |
| 5 | The Progress dashboard's columns ended ~350px apart at 1440 | `ProgressScreen.module.css`: `Check in today` and its caption move into col-1 under the calendar; the calendar spans two rows instead of four | Columns now end at 751 and 625 (was 492 and ~1030), no component height changed |
| 6 | Live search rows were raw API strings — `moisturising cream` in lower case, `CeraVe — 177` (a size with no unit), and the same product twice under two barcodes | `lib/openBeautyFacts.ts`: title-case an all-lower-case name only (a name with capitals is somebody's real capitalisation), drop a size with no letter in it, and drop a row that matches another on brand + name while stating no size. Two different real sizes still both survive — the catalogue's 12 oz and 16 oz CeraVe depend on it | Live query re-run: `Moisturising Cream · CeraVe`, one `Schuimende Reinigingsgel · 236ml` row instead of two |
| 7 | Two `:hover` rules had no `@media (hover: none)` counterpart, against the motion rule | Guards added in `OptionRow.module.css` and `StartInvestigation.module.css` | — |
| 8 | AGENTS.md had drifted: `/products/[bucket]` and `BucketProductsList` still documented after `b3da76b` deleted them; `SymptomTrend` still described as "a white line" though it binds `text/on-data` and now draws dark | AGENTS.md updated, including the resolved System B contrast question, and the new decisions above are documented where the rules they bend live | — |

`npm run typecheck` and `npm run build` both clean.

## Accepted, not a defect — the flow CTA scrolls with the page

**`Continue` renders behind the nav pill at rest on steps 1 and 2.** The page's
115px bottom reservation clears the nav at the END of the document, so on the
two screens that outgrow the viewport — step 1 measures 1029 at 440, step 2
measures 1210 — the button lands at y=852 against a nav at y=858. Measured
again after the revert: step 1 `ctaTop=852 / navTop=858`, step 2
`ctaTop=1033`, i.e. off-screen at rest.

A sticky footer was built for this (`position: sticky` at the same 24 + 75 + 16,
with a backdrop blur so the 0.4-opacity disabled button did not ghost the option
row beneath it) and **rejected — it is reverted, and `QuestionScreen.module.css`
is byte-identical to what it was.**

⚠️ **CLOSED 7 Sep 2026 — ACCEPTED AS DESIGNED, AND THIS FINDING WAS OVERSTATED.**
Walked on the device rather than measured off a single at-rest snapshot. The
button is never out of reach: `.screen`'s bottom reservation exists precisely so
the last element clears the fixed nav at the end of the document, so a short
scroll puts `Continue` fully in the clear on both screens. What the numbers
above describe is the AT-REST state of a form that has to be scrolled to be
answered — the chips on step 1 are themselves below the fold, so anyone filling
the screen in has already scrolled past the overlap before they reach for the
button.

That leaves "a primary action below the fold on a long mobile form", which
describes most mobile forms and is not a defect. **Do not re-file it, and do not
re-attempt the sticky footer**; the earlier rejection stands and now has a
reason recorded beside it.

Two things would genuinely reopen it, and neither is true today: if the CTA
became unreachable at full scroll (i.e. the bottom reservation stopped matching
`--nav-inset-bottom + --size-nav-height`), or if a screen shipped where the
overlap band is the ONLY place the button can be tapped — in that band the fixed
nav wins the hit test, so a tap leaves the flow instead of advancing it.

⚠️ **The `115px` figure above is stale.** It was `24 + 75 + 16` when this was
written; `--nav-inset-bottom` became 5 on 4 Sep, so the reservation is 96 today.
The relationship is unchanged — the nav moved down by the same 19 — so the
measurements still describe what they described.

## Left alone — colour and contrast

All measured by compositing; none of them touched, by instruction.

| Element | Where | Measured | Needs |
| ------- | ----- | -------- | ---- |
| Basket item labels + white remove glyphs | Check basket sheet | 2.39:1 | 4.5:1 (3:1 for the glyph) |
| Score "62%" | `/check/results` | 2.26:1 | 4.5:1 |
| Tray method title / subtitle | Add-product tray | 2.64 / 2.70:1 | 4.5:1 |
| Primary button label, enabled | 10 routes | 3.12:1 | 4.5:1 |
| Primary button label, disabled | steps 1, 2, 4 · check-in | 1.29 – 1.86:1 | exempt from 1.4.3, but invisible |
| Score "94%" | `/check/results` | 3.35:1 | 4.5:1 |
| Camera helper text | check-in photo overlay | 3.52:1 | 4.5:1 |
| "Avoid" pill | results · history | 4.27 – 4.41:1 | 4.5:1 |
| "Today" ring (`border/glass`) | Progress calendar | 1.44:1 | 3:1 (SC 1.4.11) |
| Modal scrim (`state/pressed-overlay`, 14%) | every sheet | — | a real scrim token in Figma |

Two of these are deliberate local overrides that opt back out of the global Surface System B ink fix — `AddProductMethodSheet.module.css:19-22` ("WHITE BY REQUEST", per its own comment) and `CheckBasket`. Everything else in the app inherits the accessible values. The primary-button gradient is the widest-reaching one, and AGENTS.md records that a passing gradient was built once and rejected as too dark, so it is a design decision rather than a token edit.

## Could improve — not done

- **Targets that clear AA but not comfort.** Calendar discs 32×32, chips 40 tall, `Save & exit` 119×38, the `Edit` disclosure 65×24. All pass SC 2.5.8's 24×24 minimum and the inline "View previous checks" link is exempt as inline text, so nothing here is a failure — but the calendar discs are links and they are the smallest thing on the screen. Left alone because 32 is the Figma measurement.
- **Pale products disappear into their thumbnails.** A faint outline on the vessel would carry both surfaces — but the vessel palette is colour, so it is out of scope for this pass.
- **The disabled `Continue` could say why.** A one-line helper would make the gate legible, the way `/check/new` already does with "Pick at least 2 products". Not done: it adds copy to four screens and is a design decision for Figma, not a defect.

## Corrections to the first version of this review

Two findings in the first pass were my own measurement errors, not defects. Both were checked before being "fixed", and nothing was changed in the app for either.

1. **"768 is a stretched phone" — wrong.** I read a 2× screenshot as if it were 1×. Measured, the content column at 768 is `max-width: 392px`, centred, on `/investigation/products`, `/progress` and `/check/new` alike. The tablet layout is the mobile column with wider margins, which is what it should be.
2. **"Closing a sheet does not return focus to the trigger" — wrong.** `Sheet.tsx` captures `document.activeElement` on open and restores it on close. My first test opened the tray with a scripted `.click()`, so the captured "opener" was the document body. Driven from the keyboard — `Tab` to `Add product`, `Enter`, `Escape` — focus returns to `Add product`, as it should.

## What Works Well

- **Sheets are properly modal.** `role="dialog"`, `aria-modal="true"`, an accessible name, focus moved to the dialog on open, a working three-stop tab cycle, `Escape` closes, and focus restored to the trigger.
- **Focus rings survive everywhere.** Tabbing every route with real key events found an `outline` on every control — the `box-shadow`-vs-`outline` trap recorded in AGENTS.md has stayed fixed, including on controls that carry their own inner shadow.
- **Token discipline is essentially perfect.** Zero primitive references from components, zero ad-hoc `font-size` outside the ramp, no SemiBold/Bold usage, `prefers-reduced-transparency` verified rendering opaque sage, and no CSS module names an animation.
- **The global Surface System B ink fix holds.** Across all 16 routes, no `DataCard`, `SkinProfileStrip`, calendar or trend text fails — the only failures left are the two sheets that opted back out.
- **Every route has a distinct, descriptive title**, read by the route announcer — the WCAG 2.4.2 failure AGENTS.md describes is genuinely closed.
- **`/check/results` reads in the right order.** Verdict, numbers, cause, action, detail; the last commit's `NextSteps` card — numbered indigo discs, the product pair drawn as two thumbs and a `+`, the action as the title and the prohibition in the body — is the clearest block on the screen.

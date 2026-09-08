# Design Review: LUX — whole app, 19 routes (portfolio-readiness pass)

Reviewed against: `AGENTS.md` and `docs/product-brief.md` (no `.design/` brief exists; AGENTS.md is the design authority in this repo)
Philosophy: calm frosted-glass wellness UI — Surface System A (light frosted rows/cards) for forms, Surface System B (sage data cards, two tiers) for readouts
Branch: `design-trial` @ `555c251`
Date: 2026-09-08
Supersedes: `DESIGN_REVIEW.md` (3 Sep 2026, `case-study` @ `d5b99a5`) — 62 commits and ~23k changed lines ago. That review's *Accepted* and *Left alone* sections still stand and are not re-litigated here; everything else in it predates the analysis flow, the persistence split, the PROGRESS rewrite and the indigo reassignment.

> **STATUS — all findings closed the same day.** Everything under *Must fix* and
> *Should fix* is fixed and re-measured; the two *Could improve* items are done
> or explicitly declined with a reason. Two findings turned out to be
> measurement artefacts and are withdrawn at the end, where the corrected
> numbers are. See **Fixed in this pass** below.

## Question asked

> Is the app ready for a portfolio and a final case study, as a prototype?

**Short answer: yes to both, now that the one bug is fixed.** (It was: yes for
the case study, no for the click-through demo, one bug apart. That bug — item 1
below — is fixed and re-measured; the walkthrough now reaches the findings
screen from a cold store.)
The craft is portfolio-grade and the argument the product makes is genuinely
original. But the seeded demo library is invisible to the analysis engine, so a
visitor who opens the deployed prototype, walks the flow and taps through to
`/investigation/analysis` — the screen the whole product is named for — is told
"Nothing in your list is new" while `/products` two taps away says "5 products
added". Fix that one thing (plus the ambiguity gate below it) and the walkthrough
lands where the case study says it lands.

## How this was measured

No Playwright or Cursor browser MCP is available here, so the review drove the
production build (`next start -p 3100`) through Chrome's DevTools Protocol
directly, the same way `scripts/text-spacing.mjs` does — headless Chrome, 2× DPR,
no dependencies.

- **Screenshots are viewport captures, not full-page**, for the reason the last
  review recorded: full-page capture re-flows every `100dvh` layout in this app.
  Pages taller than the viewport also get a `-bottom` capture.
- **Contrast was measured by compositing.** For each route, every text node was
  collected with its computed colour and rect; then all text was made
  transparent, the screen re-captured, that PNG decoded in-page onto a canvas,
  and the true composited background sampled at each text node's centre. axe
  cannot see any of this — every background here is a gradient or a stack of
  translucent fills.
  ⚠️ **The fixed nav and CHECK's fixed basket bar must be excluded from that
  sample, and the first pass did not exclude them.** A node resting under either
  one returns the frosted pill's composite rather than its own background, which
  is a colour the text never sits on — two of the first pass's findings were
  that and are withdrawn at the end of this document. The corrected sweep hides
  both bars and scrolls each node clear before sampling.
- **Focus rings were measured with real `Tab` key events** (`Input.dispatchKeyEvent`).
- **Occlusion was hit-tested** with `document.elementFromPoint` at each CTA's
  resting centre.
- **The analysis engine was exercised, not just rendered** — seeded flow answers
  and product records at four different flare dates and three duration buckets,
  reading `main.innerText` back each time.

`npm run build`, `npm run typecheck`, `npm run vocab` and `npm run spacing` are
all clean (spacing: 18 routes × 3 widths, nothing clipped or spilled under the
WCAG 1.4.12 overrides).

## Screenshots captured

69 viewport PNGs in `.design/whole-app/screenshots-2026-09-08/`, plus 6 of the
analysis in its two real outcomes.

| Group | Files | What it covers |
| ----- | ----- | -------------- |
| `<screen>-mobile-375` | 18 | small phone |
| `<screen>-figma-mobile-440` | 18 | the Figma mobile canvas |
| `<screen>-figma-desktop-1440` | 18 | the Figma desktop canvas |
| `<screen>-…-bottom` | 15 | the same screens scrolled to the end |
| `analysis-full-*` | 2 | the refusal state a normal walkthrough reaches |
| `analysis-lead-*` | 6 | the findings state, seeded so it can be reached at all |
| `fixed-analysis-seeded-*` | 3 | AFTER the fix: the findings the seeded library now produces from a cold store |
| `fixed-analysis-unresolved-*` | 2 | AFTER the fix: the confirmation strip, in the state that used to refuse |
| `fixed-analysis-refusal-*` | 2 | AFTER the fix: the centred refusal, heading still at the top |

## Summary

The system-level discipline held through a very large amount of new work: token
usage is clean, every tab stop on the four screens re-tested has a real
`outline` focus ring, the text-spacing check passes at 320/440/1440, and the
vocabulary check passes on copy that now says a great deal more about skin than
it did in September's first review. The findings screen — verdict, then ranked
hypotheses with five collapsible evidence sections each, then what was ruled out
and why, then one concrete observation to run — is the best screen in the build
and is the case study's centrepiece.

The two real problems are both in the seam between the demo data and the
analysis engine, and they have the same symptom: the app refuses to conclude on
paths where it has something to say. Everything else is polish.

## Must fix

1. **The analysis cannot see the seeded product library, so the demo dead-ends.**
   `evidenceFor` in `features/my-skin/analysis.ts:151` reads `a.products ?? []`
   raw, while every other product surface goes through `ownedProducts()` in
   `lib/demo.ts:173`, which falls back to `DEMO_PRODUCTS`. Measured on a cold
   store with only flow answers set: `/products` renders "5 products added" and
   `/investigation/analysis` renders "Nothing in your list is new · Add anything
   you started in the four weeks before your skin changed". That is exactly the
   hub-says-2/list-says-0 class of bug `lib/demo.ts`'s own comment warns about,
   landed on the one screen the product is named for. See
   `screenshots-2026-09-08/analysis-full-figma-mobile-440.png`.
   *Fix: route `evidenceFor` through `ownedProducts(a)`. `DEMO_PRODUCTS`'
   `addedOn` dates are fixed at Jun–Aug 2026 (already flagged in
   `features/progress/progress.ts:131`) but the evidence state is derived from
   `bucket`, not `addedOn`, so the seeded BHA exfoliant reads as a suspect
   against any flare date the demo can produce.*

2. **When every product is `unclear`, the app refuses instead of asking the
   question it built for exactly that case.** `gaps()` (`analysis.ts:299`) fires
   `nothing-to-compare` on `suspects.length === 0`, and `suspects` counts only
   `associated`. A product whose introduction range straddles the boundary is
   `unclear` — which `deriveEvidence`'s own doc comment calls "the honest answer,
   and it is what § 05's confirmation list exists to resolve" — but `NoConclusion`
   (`Analysis.tsx:289`) never renders `Confirmations`. Measured: a `1–4 weeks`
   suspect with a flare 7 days ago (`boundary = 21`, window `7–28`) returns
   `unclear`, and the screen says "Nothing in your list is new" rather than
   "Did you start this before or after?". This is the *likeliest* real
   walkthrough — a recent product and a fortnight-old flare — and the refusal
   copy actively misdescribes it: the list is not un-new, it is un-resolved.
   *Fix: render `Confirmations` inside `NoConclusion` whenever
   `needsConfirmation(answers).length > 0`, and give that state its own title
   ("Two products could go either way") rather than the not-new one.*

## Should fix

3. **AA failures on surfaces that did not exist at the last review.** All on
   `/investigation/analysis`, measured by compositing:

   | Element | Measured | Needs |
   | ------- | -------- | ---- |
   | The green count on `Evidence against this explanation` (`Disclosure` meta) | **3.28:1** @440 · 3.63 @1440 | 4.5:1 |
   | `If anything here was prescribed…` (`.fineprint`, 12px on bare canvas) | **3.62:1** @440 | 4.5:1 |
   | `No sunscreen in your list…` (`.reminder`, 14px on bare canvas) | **4.02:1** @440 | 4.5:1 |
   | The count on the two canvas-level disclosures | **3.94:1** @440 | 4.5:1 |

   The green is `feedback/success` `#5f8a6e` used as TEXT; it is a fill colour,
   and it is right as the cleared block's 4px rule. The other three are
   `text/muted` set straight on the canvas gradient, low on a long page — which
   the token's own note in `globals.css` predicts in as many words: "a new
   screen that sets muted text straight on the gradient needs a darker value,
   not this one."
   *Fix: a `text/success-ink` token for the green, and `text/secondary` for the
   three muted ones.*

4. **`/investigation/profile` is 824 wide on desktop, not the 640 AGENTS.md
   documents.** Measured: `.headline` and `.blocks` both render 824.
   AGENTS.md's recap section states "On desktop the recap takes a **640 column**
   (`width/card-focus`), left-aligned, rather than the card's full 824" — and
   `--width-card-focus` really is `640px`, it is simply not applied. The visible
   cost is in `Where you noticed it`: the 300-wide face and its ~190 text column
   sit in an 824 row, leaving roughly 300px of empty card to their right. See
   `screenshots-2026-09-08/investigation-profile-figma-desktop-1440.png`.
   *Fix: apply `max-width: var(--width-card-focus)` as documented — or, if 824
   was a deliberate later choice, correct AGENTS.md, because a case study that
   quotes the rule will quote a rule the build does not follow.*

5. **The refusal state has no layout.** `/investigation/analysis` in its
   not-enough-evidence state puts a verdict card, one sentence and a
   left-aligned button in the top third and leaves ~1000px of bare canvas below
   at 440. The app already has a recipe for exactly this shape — the empty-state
   pattern AGENTS.md documents (orb → 32 → title → 12 → body → 32 → action,
   centred, `layout="plain"`), used by four other screens, and
   `/investigation/profile` was moved onto it on 8 Sep. This screen is the fifth
   candidate and the note in `Analysis.tsx` records why it was not: `center` with
   `layout="card"` floats the page title. That is a `HubScreen` limitation, not
   a reason for the screen to look unfinished.
   *Fix: either hoist the heading out of the centred region in `HubScreen` (the
   change AGENTS.md already names), or give the refusal state its own vertical
   centring inside the card.*

6. **`/products` rests with ~700px of empty canvas mid-screen at 440.** Three
   category rows and an add row sit at the top; `Start analysis` is pushed to the
   bottom by the `margin-top: auto` fix from the last review. Both ends are
   correct and the middle is the void. On the screen most likely to be
   screenshotted for a portfolio, that reads as unfinished rather than as calm.
   *Suggestion: cap the gap — `margin-top: auto` with a `max-height` spacer, or
   let the category rows breathe into it.*

## Could improve

7. **Two hypotheses from one product read as two suspects.** In the seeded
   findings state the screen offers `1. Salicylic Acid (BHA)` and
   `2. Alcohol Denat.`, both sourced to Paula's Choice BHA Exfoliant, under
   "Two explanations still fit". The model is right — those are two different
   mechanisms — but a reader sees one bottle accused twice. A line acknowledging
   that both live in the same product would close the gap without weakening the
   claim.

8. **`Edit` on `/check/results` is 25×20.** It passes SC 2.5.8 only if the
   `.tap-target` pseudo is doing the work; worth confirming, since it shrank
   from the 65×24 measured in September's review.

9. **The flow CTA at rest.** `/investigation/start` still hit-tests to the nav at
   the button's resting centre (`cta=852`, `nav=877`), and
   `/investigation/profile`'s `Add products` rests below the fold at 1011. This
   is the finding accepted on 7 Sep 2026 and it is **not** re-filed — noted only
   because the recap is a new screen inheriting the same behaviour, and because
   it is the one thing in the build a reviewer will screenshot and ask about. The
   answer is in AGENTS.md and it is a good answer; the case study may as well
   say it out loud.

## What works well

- **The findings screen earns the product.** Verdict overline, hypothesis cards
  with a confidence *word* and no percentage anywhere, five collapsible evidence
  sections including "Evidence against this explanation" and "What could change
  this result", a ruled-out block that names what you tolerate and why that rules
  it out, and a single concrete next action with a "just save this" escape. It
  is a defensible, non-diagnostic answer, which is the hard part of this brief.
- **The refusal is designed, not an error.** Even where it fires wrongly (#2), it
  fires politely and tells the user what would change it.
- **Focus rings survive everywhere they were re-tested** — 13, 6, 9 and 11 tab
  stops on `/investigation/analysis`, `/investigation/profile`, `/progress` and
  `/check/results`, zero without an `outline`.
- **The indigo reassignment worked.** `/products` and `/check` composite to zero
  text nodes under AA, primary button labels included — the app's widest contrast
  failure at the last review is closed.
- **`npm run spacing` and `npm run vocab` are both real checks and both pass.**
  A regulatory-vocabulary linter over user-facing strings is, on its own, a
  strong case-study artefact.
- **The doc comments.** Every screen carries the reasoning for its own decisions
  and the record of what was tried and reverted. That is the material a case
  study is made of, and it is already written.

## Fixed in this pass

| # | Finding | Fix | Verified |
| - | ------- | --- | -------- |
| 1 | The analysis read `a.products` raw, so the seeded library was invisible to it and the demo dead-ended | `analysis.ts`: `evidenceFor` and `forgottenRoles` go through `ownedProducts(a)`, like every other product surface in the app | Cold store, flow answers only, flare 18 days ago: the screen now returns **"Best fit so far — Retinol with Salicylic Acid (BHA), used in the same period, which may have added up."** It returned "Nothing in your list is new" before |
| 2 | Every product `unclear` → a refusal, and § 05's confirmation strip unreachable | A third gap, `unresolved-timeline`, with **no `href` and no action** (`Gap.href`/`action` are now optional); `NoConclusion` renders `<Confirmations />`; the verdict reads *One thing to settle first / One product could go either way* | A `1–4 weeks` product with a 7-day-old flare now renders the strip. Answering `Around then` re-runs the comparison in place, with no wait — measured: verdict becomes *Best fit so far* on the next paint |
| 2b | The strip repeated the verdict — `COULD GO EITHER WAY` under *One product could go either way* | `Confirmations` takes `headed`; the refusal drops the overline and keeps an `aria-label` | — |
| 3 | The `Evidence against this explanation` count measured 3.28:1 / 3.63:1 | New `--color-text-success-ink` `#46664f` on `:root` in `globals.css` — an ADDITION, not a retune: every green fill keeps `feedback/success`. Raised in `docs/figma-catchup.md` § 1 | 5.36:1 at 440, 5.93:1 at 1440 |
| 3b | `.reminder` (4.02:1), `.fineprint` (3.62:1) and `Disclosure`'s count on bare canvas (3.94:1) | `text/muted` → `text/secondary` at those three, exactly as the token's own note in `globals.css` prescribes for muted text on the gradient | **`/investigation/analysis` composites 0 nodes under AA at 440 and at 1440**, in both outcomes |
| 4 | The recap renders 824 wide where AGENTS.md documented a 640 column | **The doc was the stale one** — `SkinProfileSummary.module.css` records that 640 was tried and reverted the same day, because the card does not narrow with the blocks. AGENTS.md now says 824 and says not to re-apply `width/card-focus` | — |
| 5 | The refusal state left ~1000px of bare canvas | `HubScreen` hoists the heading out of the centred region for `card` + `center` — the shared-component change the `Analysis.tsx` note asked for — and the refusal passes `center` | Refusal now measures `docH` **957 at 440** and **900 at 1440**, i.e. exactly the viewport, with the h1 still at the top (`y=80`) |
| 7 | Two hypotheses out of one bottle read as two suspects | `severalVerdict()` says so: *"None is better supported than the others, and all are in Paula's Choice BHA Exfoliant."* The overline counts them (`3 explanations still fit`) instead of hardcoding "Two" | Rendered in the seeded three-way case |
| 8 | `Edit` on `/check/results` is 25×20 | The global `tap-target` utility, no `pressable` (its result is immediate) | `elementFromPoint` hits the button 2px above its box: ~25×24, clears SC 2.5.8 |

`npm run build`, `npm run typecheck`, `npm run vocab` and `npm run spacing` all
clean after the changes.

## Declined, with a reason

**6 — `/products` rests with ~700px of empty canvas at 440.** Not changed. The
footer's `margin-top: auto` is a documented decision in
`HubScreen.module.css`: the alternative was measured on this exact screen and
rejected, because a fixed 32 leaves the screen's action stranded in the upper
half while the bottom of the screen — where every other LUX action lives, from
`Continue` to the basket bar — sits empty. Moving it back would trade a void
below the content for a void below the action. If this is to change it should
change as a decision about the screen's content, not as a spacing tweak.

**The `unresolved-timeline` state is not centred**, though it is also short. A
centred hub drops its desktop nav reservation (`.screen[data-layout="hub"][data-center]`),
which is safe for a fixed-height refusal and not safe for a strip that grows
with the number of ambiguous products. The refusal is centred; the question is
not.

**`/check/results`' 11 sub-AA nodes are untouched**, as they were in September's
review: `CompatCard`'s percentages and band pills and the `surface/data-deep`
emphasis block are the known-failing set AGENTS.md marks as awaiting a Figma
decision, with a standing instruction not to retune the deep tier unasked.

## Corrections — two findings withdrawn

Both were sampling artefacts, found when re-measuring with the fixed nav
excluded and every node scrolled clear of it. The method note above now says so.

1. **"`SymptomTrend`'s summary is 2.04:1"** — wrong. The sample point lay under
   the fixed nav pill, so the composite that was read was the frosted nav, not
   the card. Re-measured with the nav hidden and the node scrolled into view:
   **3.56–3.65:1 at 440 and 1440**, i.e. inside the 3.42–3.77 band the deep tier
   is already documented at, and covered by the standing "do not retune it
   unasked" instruction. Nothing was changed.
2. **"`ProductList`'s meta fails at 3.23:1 on `/check/new`"** — wrong, and the
   same shape of error: only the LAST row failed, and only at 1440, because it
   rests under CHECK's fixed basket bar. The four rows above it measure
   4.76–5.48:1. Nothing was changed.

A third measurement is worth recording rather than acting on: a **disabled**
primary button label composites at 2.19–3.09:1 across five screens. It is
exempt from SC 1.4.3 and AGENTS.md already lists it. The enabled label measures
**6.97:1** on the same screen — the earlier 2.39 reading was the nav artefact
again.

## For the case study

The story this build can tell honestly, in order: a product brief with a
controlled vocabulary and a regulatory constraint; a design system in Figma that
leads on pixels while the prototype leads on flow; three screens cut to one; an
analysis that is allowed to say it does not know; a safety branch deliberately
*not* built, with the reasoning written down. The two must-fix items above are
what stands between that narrative and a visitor being able to walk it.

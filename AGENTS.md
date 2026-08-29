<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LUX — working rules for this repo

LUX is an AI-guided skincare **investigation** web app. The design system —
tokens, components, type, colour — is the source of truth and it lives in Figma.

**⚠️ THE PROTOTYPE LEADS ON FLOW.** Screens used to be built in Figma first and
translated here. That still holds for every VISUAL decision: a component's size,
radius, type and colour must match Figma to the pixel, and inventing a treatment
is drift. It no longer holds for the SHAPE OF A FLOW — what the steps are, what
order they run in, and what each one asks. Those get decided here, in the thing
that can actually be walked, and Figma catches up. The PRODUCTS remap below is
the first change made under that rule, and the reason for it: the designed flow
walked three time periods across six screens, two of those periods were never
drawn, and the three rows meant to select a period all silently selected the
same one. None of that is visible in a comp; all of it is obvious in one minute
of clicking. Flows that have diverged carry a `⚠️ NOT IN FIGMA` comment naming
what changed and why — keep writing them.

**Figma file:** `wIftBhzkn8E4wjZwgdH71n`
**Screens page:** `06. Screen Designs` (`453:2252`). Each section has a
`HANDOFF — *` annotation panel beside its mobile row documenting every recipe.

**Built so far:** GETTING STARTED, PRODUCTS, PROGRESS and CHECK.

- **GETTING STARTED** — `00 — Welcome` at `/`, then four of the five track
  steps: `01 — Start investigation` (step 1), `02a — Skin type` (2),
  `02c — Known conditions` (3) and `03c — Timing` (4), with
  `03b — Selfie capture` hanging off step 1 as an optional side path that
  SHARES its track position. Routes under `/investigation/<step>`. PRODUCTS is
  step 5.

  **⚠️ NINE DESIGNED SCREENS ARE FIVE STEPS.** `02b — Skin tendencies` merged
  into `02a` and `03b — Location` merged into `01` — one screen each, and
  Continue gates on BOTH answers where it used to gate two separate steps.
  `03a — Observable symptoms` was dropped entirely. All three are decided-here
  flow changes with no matching Figma frame yet, flagged in the doc comments on
  `SkinType.tsx` and `StartInvestigation.tsx`; the frame ids of both halves are
  kept there so the next person can find what each came from. The track reads
  1/5, not 1/8, and `TOTAL_STEPS` is the only place that number lives.
- **PRODUCTS** — ONE add-flow screen under `/investigation/products` (step 5/5,
  nav `check`) and two hub routes under `/products*` (nav `products`). It was
  twelve screens; see the remap below.
- **PROGRESS** — ONE hub route at `/progress` (nav `progress`) in two states:
  `Progress — empty` (551:1196 / 551:1231) and `Progress — active`
  (552:1236 / 554:1252). Not an investigation step — no track, no `Save & exit`.
  See the PROGRESS section below.
- **CHECK** — the product compatibility check, five routes under `/check*`
  (nav `check`). Eight designed screens; see the CHECK section below.
  Not an investigation step either.

`lib/flow.ts` owns the step order, the 1-based track position, the Figma frame
ids AND each step's `isComplete` rule. `lib/products.ts` owns the product
catalogue, the groups and the duration→group mapping. `lib/progress.ts` owns
the check-in series and everything the Progress screen states about it.
`lib/check.ts` owns the compatibility bands, the scoring model and the check
history.

### PRODUCTS — the route map

| Route                     | Figma mobile / desktop                                     | Notes                                                |
| ------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `/investigation/products` | `574:1342` / `582:1612` (+ list `574:1391`, `578:1557`)    | step 5. `YourProducts` + the add-product tray on top |
| `/products`               | `579:1574` / `583:1863` (+ filled `579:1607` / `583:1889`) | HUB landing, no back chevron                         |
| `/products/[bucket]`      | `581:1593` / `583:1924`                                    | HUB pushed view, serves every group                  |

**⚠️ STEP 5 IS ONE SCREEN AND ONE TRAY — the twelve-screen flow is gone.** The
design walked three time PERIODS in sequence: an intro promising them, a
per-period list screen, and four routed add screens (`search` → `confirm`,
`scan` → `match`) rejoining at `Product added`. What actually shipped from that
was broken in four ways at once — the intro's three period rows all opened the
tray without setting a period so everything filed under Long term; `bucketFor()`
and `durationForBucket()` sat in one module as mutual inverses with no answer to
which was authoritative; two of the three promised periods were never drawn at
either breakpoint; and Recent was unreachable until you already owned a
long-term product. Deleted: `AddProductsIntro`, `LongTermProducts`,
`SearchProducts`, `ScanProduct`, `ProductConfirmScreen`, `ProductAdded`, and the
six routes under them.

**The shape now: add a product, say how long you have used it, the app sorts.**
`Your products` is one list with one `Add product` row. The tray runs
method → search-or-scan → "is this it?" → **"how long have you used it?"** → added,
without ever navigating. That last question is the ONLY input to `bucketFor()`,
and it is asked with the product on screen — because how long you have used
something is a fact about that product, not a mode you enter before searching.

**⚠️ THE LIST GROUPS ITSELF, LIVE.** `groupProducts()` splits the added products
and omits empty groups; `YourProducts` renders a flat list while everything sits
in one group and grows headers the moment a second fills. The user watches the
sorting happen, which is why there is no end-of-step "here's how I sorted them"
screen — that screen would only show a result already seen. The HUB is the
opposite case on purpose: it always lists all three designed periods including
the empty ones, because there a missing row reads as a lost category.

**⚠️ "Not sure" IS A FOURTH GROUP, AND IT IS NOT IN FIGMA.** With no period mode
left to stand in, `bucketFor("Not sure", current)`'s fallback had nothing to read
`current` from. Binning it into Long term was the tempting fix and it is wrong:
for a flare investigation, "I don't know how long" is diagnostically different
from "months", and correlating products against step 4's flare date is the whole
point. `UNSORTED_BUCKET` is kept OUT of `BUCKETS` and appended by `MyProducts`
only when non-empty, so the hub still always shows exactly the three designed
periods. `/products/not-sure` resolves — `ALL_BUCKETS`, not `BUCKETS`.

**⚠️ HUB vs FLOW — the header tells you which, and `HubScreen` vs
`QuestionScreen` encodes it.** A screen is an investigation step if and only if
it carries BOTH a progress track AND `Save & exit`. Hub screens carry neither,
their nav reads `products`, and a hub LANDING has no back chevron either
(nothing to go back to).

### PROGRESS — SURFACE SYSTEM B

`/progress`, in two states, both driven by whether step 4's flare date exists.
Documented by `HANDOFF — INVESTIGATION & PROGRESS` (`559:1376`), which is the
authority for everything below.

| Route             | Figma mobile / desktop         | Notes                                        |
| ----------------- | ------------------------------ | -------------------------------------------- |
| `/progress`       | active `552:1236` / `554:1252` | HUB landing, no back chevron. **The default** |
| `/progress/empty` | empty `551:1196` / `551:1231`  | ⚠️ prototype-only route — see below           |

**⚠️ THESE ARE DATA SCREENS, AND THEY USE THE OTHER SURFACE SYSTEM.** GETTING
STARTED and PRODUCTS are forms: light frosted rows and cards, dark text, a 1px
`border/subtle`. PROGRESS (and CHECK, when it lands) are READOUTS. Every card is
a sage data card — `surface/data` + `surface/frosted-data` + `radius/2xl`,
padding 20 mobile / 24 desktop, and **NO stroke**. The text on one is white:
`text/on-data` for values, `-secondary` for body, `-muted` for labels; a section
label is `Overline` in `-muted`. Accents are indigo `bg/brand` — check-in discs,
timeline dots, meter fills — and the trend line is white. A divider inside one is
1px `border/glass`, never `border/subtle`. A nested emphasis block is
`surface/data-strong`: **a sage card inside a light card is a LUX pattern, the
reverse is not.** `components/DataCard.tsx` is the whole recipe; use it.

**⚠️ THE DESKTOP IS A 1280 DASHBOARD GRID, NOT A CARD.** Per the handoff, 1280
means "dashboard grid, no card": two columns a `gutter/desktop` (24) apart, col-1
fixed 640 (the calendar), col-2 FILL 616 (profile, trend, CTA, caption, a uniform
24 apart). That is `HubScreen`'s `layout="grid"`, added for this. Wrapping these
in the 920 frosted page card would invert the nesting rule above.
**⚠️ A GRID SCREEN MUST RESERVE FOR THE NAV.** Every other hub screen drops the
desktop bottom reservation so a CENTRED body lands where the comp puts it; a
dashboard body is not centred and its last row rendered straight behind the nav
pill. Measured: caption and nav both at y=743.

**⚠️ THE CHECK-IN HISTORY IS SEEDED, AND IT HAS TO BE.** These screens are
readouts of daily check-ins, and CHECK — which would write them — is not built.
`lib/progress.ts` anchors a deterministic series to a start date and clips it at
today; every figure the screen states (the day count, the percentage, "3 days
ago") is computed from that series rather than transcribed. Every entry point is
named `demo*`. Delete them when CHECK lands, and wire `Check in today` in the
same pass — it is inert for the same reason the nav's Check item is.

**⚠️ THE SEEDED PROFILE LIVES IN `lib/demo.ts`, SHARED WITH CHECK** — see the
CHECK section. `lib/progress.ts` keeps only what is progress-specific: the fixed
clock and the check-in series.

**⚠️ `/progress` OPENS POPULATED, AND THAT IS NOT A BREACH OF "STARTS EMPTY".**
The rule below is about SELECTION CONTROLS rendering pre-ticked, because on a
question screen the user does the selecting. Progress has no controls — it is a
readout, and a readout with nothing in it demonstrates nothing. So an
investigation is assumed until the user starts a real one, at which point their
answers take over completely: walk the flow and the profile, dates, trend and
percentage are all theirs. This is a **prototype decision, taken because the
build is shown as a portfolio piece**, and it is why `Progress — empty` needed
a route of its own: it is one Figma STATE, not two screens. Restore the fallback
and delete `/progress/empty` when real check-ins exist.

**⚠️ THE DEMO CLOCK IS FROZEN AT 17 Aug 2026, NOT `new Date()`.** The demo branch
is what an unanswered store produces, so it is what gets PRERENDERED — a live
clock there bakes the build date into static HTML and then disagrees with the
client on hydration. Frozen dates make the demo path a pure function of nothing.
They also land the seeded check-ins on Aug 2, 5, 9, 11 and 14 under an "August
2026" header — the comp's exact chart labels and month. The real-answer branch
may call `new Date()` freely; it cannot render on the server.

**⚠️ TWO COMP SLIPS ARE DELIBERATELY NOT REPRODUCED.** The comp marks Aug 14 as
checked in while ringing Aug 11 as today, and its "57%" does not match its own
plotted points — so check-ins are clipped at today and the percentage is
computed. Separately, every calendar week row is **32 tall**: the empty
leading/trailing cells are 100-tall frames in both breakpoints, which drags
mobile's week-1 to 39 and desktop's week-1 AND week-6 to 100 while every occupied
row stays 32. That is an auto-layout artefact of an empty frame, and the handoff
requires the breakpoints to be clones. Consequence: the desktop calendar card is
358 tall, not the comp's 494, so col-1 ends higher above col-2 than the comp
shows.

**⚠️ THE MOBILE FRAMES PAD 58 AT THE TOP; THE BUILD USES 40** — the value every
other screen uses, and page-level whitespace is exactly what "translate, don't
transcribe" covers. Everything below it is pixel-exact: the profile card is 189
and the trend card 284 at both breakpoints, with 16/16/24/8 between the blocks.

### CHECK — the compatibility check

`HANDOFF — CHECK` (`613:2434`) is the authority, and it is unusually complete —
including a written TRANSITION MAP, because page 06 carries zero Figma reactions.

| Route             | Figma mobile / desktop                                   | Notes                                    |
| ----------------- | -------------------------------------------------------- | ---------------------------------------- |
| `/check`          | `Check — start` 601:1952                                  | HUB landing. **The default**             |
| `/check/no-profile`| `Check — no profile` — / 606:2183                        | ⚠️ prototype-only route                  |
| `/check/new`      | `602:1972` · `604:2059` · `650:2428` · `651:2510`         | build the check — four frames, one screen |
| `/check/analyzing`| `605:2163`                                                | the wait                                 |
| `/check/results`  | `476:2841`                                                | the readout                              |
| `/check/history`  | `652:2554`                                                | previous checks                          |

**⚠️ NO PROGRESS TRACK AND NO `Save & exit` ANYWHERE IN CHECK.** That pair is the
signature of the investigation flow. CHECK is a standalone check off the Check
tab, so it has no `StepId` and lives in `lib/check.ts`, not `lib/flow.ts`.
Screens 1–2 are the tab landing (no back chevron, dashboard header, pattern C);
3–8 are pushed views with a back chevron and, on desktop, the 920 page card.

**⚠️ SURFACE SYSTEM A, WITH ONE SAGE ELEMENT.** CHECK is light frosted rows
throughout — the opposite of PROGRESS. The only System B element is the
skin-profile strip, and the tray. A sage card inside a light screen is correct;
the reverse is not.

**⚠️ EIGHT SCREENS ARE FIVE ROUTES, AND THE BASKET STOPPED BEING MODAL.** The
three `selection · N` frames are already "ONE screen in three states" by the
handoff's own account, and `tray collapsed` and `no results` are two more states
of the same screen. But the bigger change is which state is the resting one:

> The design opens a scrim'd modal sheet over the search list the moment you add
> your FIRST product — with the CTA disabled and the helper reading "Add at least
> 2 products". The next thing you have to do is use the list underneath, which is
> why the transition map has to say "Add another product returns focus to the
> search list with the tray still open", and why `tray collapsed` exists at all:
> it is the escape hatch from a modal that should not have been modal.

Adding is not a decision that needs confirming — it is the loop. So the basket
lives in the **docked bar** (`tray-bar`, promoted to default): always visible,
never covering the list, counting up. The drawn sheet is still exactly the drawn
sheet, opened deliberately to review or remove. Every treatment is used; only the
resting state changed. Two states instead of three. See `CheckBasket.tsx`.

**⚠️ THREE MORE DECIDED-HERE CHANGES, all flagged in the code:**

- **`/check` OPENS READY TO CHECK, not on "No skin profile yet".** Same call
  `/progress` makes, same reason: this build is shown as a portfolio piece and a
  visitor has a minute, not the ten it takes to walk GETTING STARTED. The skin
  profile is seeded by `lib/demo.ts` until the user answers step 2, then it is
  entirely theirs. `Check — no profile` keeps its own route at
  `/check/no-profile`. It also closed a gap: **only the DESKTOP frame exists** —
  there is no mobile `Check — no profile` in the file at all — so a faithful
  two-screen build had nothing to port at 440.
- **`/check/new` falls back to the catalogue when you own nothing.** Same
  reason: "Your products" would be an empty box on the one screen that has to
  demonstrate adding things. The list label says which list it is, so nothing is
  passed off as the user's own. Rows carry brand AND size, because the real
  catalogue has two CeraVe Moisturizing Creams that are identical on brand
  alone.
- **Your own products come first on `/check/new`.** The comp opens on a search
  field, so checking two things you already told the app you own means typing
  both names back in. Empty query → `answers.products`; type → the catalogue.
- **"Add it manually" returns to the check.** The transition map sends it into
  the PRODUCTS add flow and stops. It opens the PRODUCTS tray in place instead,
  and whatever it adds joins the basket.

**⚠️ ONE SEEDED PROFILE, TWO SECTIONS.** `lib/demo.ts` owns it, and both
PROGRESS and CHECK resolve the skin profile through `skinProfile()` — they were
seeding it separately for a while, which is how a demo ends up claiming two
different skin types depending on which tab you are on. It carries BOTH
tendencies ("Combination · Sensitive · Acne-prone", five CHECK screens' copy);
the PROGRESS comp's `Tendency` column shows just "Sensitive", but step 2 is
multi-select so that card has to render two anyway — the narrower comp is
abbreviating. Verified: the profile card still measures the comp's exact 189
with both on one line.

**⚠️ THE SCORING IS A MODEL, NOT A LOOKUP.** `lib/check.ts` gives every catalogue
product the actives it contains, each active a penalty against the user's skin,
and the score is what is left of 98 — nothing is 100. Hardcoding the comp's five
numbers would mean any product the user actually picks scores nothing, which is
the one thing a compatibility checker must not do. The weights are tuned so the
comp's five products come out at exactly 45 / 62 / 71 / 94 / 98, which is also
what pins the bands the handoff derived — a check on the model, not a constant to
protect.

**⚠️ A CONFLICT CHANGES THE ADVICE, NOT THE SCORE** — which is what the comp
does. `Check results` scores the niacinamide 94 with a retinol in the same check
while the retinol's recommendation reads "Do not combine with Niacinamide". The
score answers "is this right for my skin?"; the pair belongs in the
recommendation, and penalising both halves would double-count one problem.

**⚠️ RESULTS ARE SORTED WORST FIRST.** The comp lists 94 / 62 / 45 / 98 / 71 —
the order they were added. A readout leads with what needs attention.

**⚠️ SCORES ARE COMPUTED ON READ, NEVER STORED.** A `SavedCheck` holds a date and
product ids. So a check the user ran and a seeded one go through the same code
and neither can drift from the model.

**⚠️ THE DAILY CHECK-IN IS ORPHANED, AND STILL IS.** The PROGRESS handoff assigns
`Check-in chat` to the Check section — "it IS the check-in" — but `Check — start`
offers only "Start a check" and "View previous checks", so nothing reaches it,
and Progress's `Check in today` has nowhere to go. The tab owns two unrelated
jobs and advertises one. Out of scope by decision; `/check` NAMES the second job
rather than dropping it silently. Wire `Check-in chat`, the nav and
`Check in today` in one pass.

**⚠️ SURFACE SYSTEM B'S TEXT IS DARK, NOT WHITE — AND WHITE CANNOT BE FIXED.**
The section above says the text on a data card is white (`text/on-data` for
values, `-secondary` for body, `-muted` for labels). Measured on
`/check/results`, that failed WCAG AA on **38 of 59 text nodes**: the overlines
and 12px stat labels at **1.49:1** and the body and metrics at **1.86:1**,
against 4.5:1. `surface/data` is `#7da7a9 @44%`, which composites to about
rgb(170,194,198) — and even at 100% opacity that hue gives white only **2.63:1**,
so no alpha passes. Darkening the text is the only fix that keeps the sage card;
the alternative is a dark-sage surface, i.e. redesigning System B.

The three tiers cannot be rebuilt from alpha either — the muted tier styles
12–13px LABELS, so it must also clear 4.5:1, and the ink at 82% already fails
(4.43:1). So `-secondary` and `-muted` share one value and the hierarchy is
carried by size, weight and the overline's tracking, which is where it mostly
lived anyway. Worst case across both card alphas and the full gradient range:

| role | value | contrast |
| ---- | ----- | -------- |
| values (`on-data`) | `#2e2a3f`, the app ink | 6.28:1 – 8.12:1 |
| body + labels | `#354446`, sage-tinted | 4.61:1 – 5.97:1 |

⚠️ **REDEFINED GLOBALLY, BECAUSE THERE IS NO DARK SAGE SURFACE TO EXEMPT.** This
was first scoped to `DataCard` and `SkinProfileStrip` on the assumption that the
tray sat on a scrim and the two camera viewfinders were dark placeholders. BOTH
WERE WRONG, and measuring said so: `state/pressed-overlay` is 14%, which barely
darkens anything, so the basket bar measured **1.93:1** and the basket sheet
**1.64–2.13:1**; and `SelfieCapture` and `AddProductMethodSheet` both draw their
viewfinder in the same light `surface/data`. Every surface in the app that reads
these tokens is light sage, so the exception list was empty. The values are
declared on `:root` in `globals.css` (hand-authored) rather than `tokens.css`
(generated). **Raise this in Figma** — it is a token bug there too.

⚠️ **STILL WHITE, DELIBERATELY:** the `border/glass` divider inside a data card,
the check-in discs' `text/on-brand` (indigo ground, passes), and
`SymptomTrend`'s line. The trend line is a graphical object at ~2.6:1 against
the card and is the one remaining System B contrast question — unresolved.

⚠️ **TWO CONTRAST FAILURES SURVIVE AND ARE NOT SYSTEM B.** Neither was touched,
because both are meaning-carrying palette rather than a surface bug:
`--color-text-muted` (`neutral-400`) on a light frosted row measures **2.27:1**
at 12px, which is every `ProductRow` meta line app-wide; and `CompatCard`'s band
colours plus their white pill text run **2.18–4.47:1** on `/check/results`.
Changing either changes what a colour MEANS, so they want a decision, not a fix.

**⚠️ THE CHECK SEARCH RANKS, AND IT READS SIZE AND INGREDIENTS.**
`searchCatalog` was an unranked AND-substring match over `brand + name` only,
which broke in two ways that were invisible until typed. `"16 oz"` returned
NOTHING although `resultMeta` puts the size on every row precisely because the
catalogue holds a 16 oz and a 12 oz CeraVe Moisturizing Cream — the one field
that tells two rows apart was the one field you could not search. And ingredient
search half-worked by accident: `retinol` and `niacinamide` hit because those
words sit in product NAMES, while `salicylic` — the highest-penalty active in
the model, and the one `/check/results` flags in the demo — returned nothing.

It now normalizes (diacritics, punctuation; so `la roche posay` finds
`La Roche-Posay`), scores name > brand > size > ingredient with a word-start
bonus and a whole-phrase bonus, and sorts equal hits by name so the list does
not reshuffle as the query grows a character. **Ingredients come from the
CALLER** — `lib/check.ts` owns the actives and already imports `products.ts`, so
`/check/new` passes `checkSearchTerms` and the PRODUCTS tray does not; searching
by what a product contains is a compatibility question. A row pulled in by an
ingredient it does not name says so in its meta line (`· Contains Salicylic
Acid (BHA)`), and the list heading carries the result count.

**⚠️ THE ORB THINKS WHILE THE CHECK RUNS — `Orb`'s `thinking` prop, NOT IN
FIGMA.** `Check — analyzing` is cloned from `05 — Investigating`, whose orb is
static; the handoff nevertheless calls the screen "the orb visibly doing the
work". A still avatar over a moving progress bar says the bar is working and the
AI is not. `thinking` loops the mark's own L → U → X wave on the entrance's
0/120/240ms stagger while the sphere breathes at scale(1.02) — the mark rather
than a spinner, because a ring would be a second motion idea competing with the
progress bar for the same job. The sphere may not TRANSLATE: it sits in a filter
with a fixed region, clipped to 129x129. Keyframes are in `globals.css` (a
module would localize the name and resolve to nothing) and both end on their
resting value, so the global `prefers-reduced-motion` collapse leaves a still
orb rather than a half-faded mark.

## The prototype starts EMPTY — and Continue is gated

**Nothing is pre-selected, on any screen.** The Figma frames show options already
chosen because a comp has to show a filled-in state; the prototype is the thing
the user actually drives. If you port a screen and it renders with something
selected, that is a bug.

⚠️ **THIS IS ABOUT CONTROLS, NOT READOUTS.** `/progress` deliberately opens with
a populated dashboard — it has nothing to select, and an empty readout shows
nothing. See the PROGRESS section above before "fixing" it.

**`Continue` is DISABLED until the step is answered**, then becomes available.
The rule lives on the step in `lib/flow.ts` (`isComplete`), never in the screen,
so a new screen cannot forget it. `QuestionScreen` reads it and owns the button.

Answers live in `components/InvestigationProvider.tsx` — React context,
**in memory only**. Read them with `useInvestigation()`. It is provided from
`app/layout.tsx`, i.e. app-wide: the PRODUCTS hub under `/products` reads the
same products step 5 writes and is reached from the nav rather than from inside
the flow, so a provider scoped to `/investigation` handed it an empty list.

⚠️ **DO NOT PERSIST THE ANSWER STORE.** An earlier build wrote to localStorage
on the reasoning that "Save & exit" implies a resumable flow. The effect was
that opening the prototype showed a previous visit's selections still ticked,
which reads exactly like the screens shipping pre-filled — the opposite of the
rule above. Answers carry across steps because the root layout keeps the
provider mounted through client-side navigation, which is all the flow needs.
Real resumability belongs to a backend, not to a store that silently reproduces
stale answers.

**⚠️ USE THE UPDATER FORM FOR ANY TOGGLE:**
`setAnswer("start", (prev) => toggleMulti(prev ?? [], option))`. Passing a value
computed from the `answers` you read during render uses a snapshot, so two
toggles in the same tick silently lose the first.

Screens ECHO earlier answers rather than hardcoding the comp's copy — 02a recaps
the symptoms picked on 01, 02b shows the skin type picked on 02a. Guard for the
answer being absent (deep links) rather than rendering an empty bubble.

## Non-negotiables

1. \*\*`app/tokens.css` is generated from the Figma variables. Might have been edited with claude code.

2. **Never reference the `01 Primitives` block** (`--color-indigo-*`,
   `--color-sage-*`, …) from a component. Bind to the semantic tokens.
3. **Every piece of text uses a `t-*` class** from `globals.css`, one per Figma
   text style. No ad-hoc `font-size`.
4. **Weights are Light / Regular / Medium only.** SemiBold and Bold are not in
   the ramp. `--font-weight-semibold` and `--font-weight-bold` exist as tokens
   but using them is drift.

   **One rule for every style:** hover runs the gradient END FOR END at full
   strength; disabled fades the whole control to `opacity/disabled` (0.4).

   | Style     | Default                                             | Hover                                                                 | Disabled                    |
   | --------- | --------------------------------------------------- | --------------------------------------------------------------------- | --------------------------- |
   | Primary   | `37:5` `gradient/brand`                             | `37:9` `gradient/brand-hover`                                         | `37:13` same gradient @ 0.4 |
   | Secondary | `37:11` `gradient/secondary` + 1px `border/default` | `749:3338` `gradient/secondary-hover`                                 | `37:15` same gradient @ 0.4 |
   | Ghost     | `37:17` no fill                                     | `37:19` ⚠️ still `bg/accent-mint`, a variable no longer in `02 Color` | `37:21` @ 0.4               |

   **Motion:** `duration/hover` (**400ms**, a new `09 Motion` variable) on
   `ease/standard`, driving the gradient reversal. The Figma set carries this as
   a real **hover interaction** (`Default → Hover`, Smart Animate, 400ms), so the
   prototype plays the reversal rather than only showing the end state.

   ⚠️ **The gradient reversal only animates because of the `--grad-*` plumbing.**
   CSS cannot interpolate `background-image`, so swapping one `linear-gradient()`
   for another snaps. The endpoints are registered `<color>` properties in
   `globals.css`; swapping which token feeds which end cross-fades them.

   **Same rule applied to** `Small Button / Primary` (`225:58` reversed, `225:59`
   faded), `Small Button / Secondary` (`225:61` reversed — it had been a
   _lightened_ gradient, a third treatment nothing else used; `225:62` faded) and
   `Back button/Disabled` (`239:65`). Every disabled control in the file is now
   its own default at 0.4.

5. **The bottom nav is fixed and identical on every screen**: 24px from the
   bottom, horizontally centred, `--z-nav`, 380 wide on mobile and 598 on
   desktop. `active="none"` is a real state (welcome, intro, onboarding), not a
   fallback.
   7a. ⚠️ **The nav is `surface/frost-nav` `#dde8eb @83%` — NOT 17%.** It used to be
   17%, which is barely a tint: the Continue button and the last option rows read
   straight through the bar. Frosted does not mean see-through. The
   `prefers-reduced-transparency` fallback is `bg/nav`, now the SAME colour fully
   opaque (`#dde8eb`) — it used to be `#9caeaf @55%`, a different hue _and_ still
   translucent, which is not a fallback at all.
6. **Chat bubbles carry an asymmetric tail corner, and NO border.** Three corners
   at `--radius-bubble` (30), the sender-side corner at `--radius-bubble-tail`
   (1). AI = tail top-left, sits left. User = tail top-right, sits right. Four
   equal corners is wrong. A bubble is a **fill plus two shadows** — every
   reference bubble in the design system has no stroke. Frosted _rows_ and
   _cards_ do carry a 1px `border/subtle`; **do not merge the two recipes.**
   8a. **Bubbles are OPAQUE** — `--color-bg-bubble-ai` (**#dbeded**) and
   `--color-bg-bubble-user` (**#cadfdf**), both changed 22 Aug 2026. They are a
   PAIR on one hue — G == B on both — differing only in lightness, and both hold
   their value DIRECTLY rather than aliasing a ramp. No backdrop blur and no
   reduced-transparency fallback. They used to be built on
   `surface/frost-light` @55%, which let the canvas gradient through, so a
   bubble low on a screen rendered darker than one near the top. **Never put a
   translucent surface on a bubble.** Padding is 14/18 mobile, 14/22 desktop.

8b. **A Figma stroke does not add to a frame's height; a CSS border does.** With
`box-sizing: border-box`, a 56-tall row with `padding: 15px` plus a 1px
border renders 58. Give these rows `min-height` and drop the vertical
padding — they are flex + centred, so they render identically and stay
exactly on the Figma height.
8c. ⚠️ **A GRADIENT + A BORDER NEEDS `background-origin: border-box`.**
`background-origin` defaults to `padding-box` while `background-clip` defaults
to `border-box`, so a gradient is **sized to the padding box but painted into
the border box**. Add a border and the outermost 1px of every edge has no
gradient on it — the drop shadow shows through as a thin dark notch at the
widest point of each rounded end. It is subtle, and it looks like a rendering
glitch rather than a CSS mistake. Only background IMAGES are affected; a flat
`background-color` is not, which is why the frosted rows never showed it.

9. **Frosted surfaces always get a solid fallback** under
   `prefers-reduced-transparency`, and a translucent fill always needs its inner
   shadow or it reads flat.
10. **Breakpoints: mobile-first, desktop at `min-width: 1024px`.** Never write a
    440px or 1440px media query — those are the Figma canvas widths, not
    breakpoints.
11. ⚠️ **THE FOCUS RING IS AN `outline`, NOT A `box-shadow`.** `focus/ring` is a
    2px stroke, so `box-shadow: 0 0 0 2px` renders it exactly — until the focused
    element has a box-shadow of its own. CSS Modules load AFTER `globals.css`, so
    at equal specificity `.button`'s `--shadow-button` and every frosted row's
    `--shadow-frosted-row` simply won, and **the ring silently disappeared on
    almost every control in the app**. Measured on the PRODUCTS "Add more
    products" row: `:focus-visible` matched and the computed shadow was the inner
    shadow alone. An outline is a separate property, composes with any shadow,
    and follows `border-radius`. `--shadow-focus-ring` is still exported because
    it is a real Figma effect style, but nothing should need it.
12. ⚠️ **FIGMA PADDING MINUS THE BORDER, for any box whose height is
    content-driven.** Rule 8b's `min-height` fix works for a fixed-height row but
    freezes a row that must grow — a product row is 76 with a one-line name and
    94 with two. Since a Figma stroke does not add to a frame's height and a CSS
    border does, write `padding: calc(14px - var(--border-width-hairline))` and
    the box lands on the design height in BOTH states. Used by `ProductList`,
    `ProductCard` and the accordion card.
13. ⚠️ **THE UA `button` PADDING IS `1px 6px`, NOT ZERO.** A text-only button
    styled to a Figma height renders 2px too tall for no visible reason. The
    global reset zeroes it; every LUX button declares its own.
14. ⚠️ **`Size=Desktop` OPTION ROWS ARE 58, NOT 56.** design.md and the component
    notes both say the Size property changes "only the label type"; that is
    wrong. The row hugs vertically (17 + label + 17), so `H6` (24) gives 58 where
    `Label` (20) gives 56. Verified on the component set itself and on every
    desktop frame in both sections.
15. ⚠️ **DESKTOP CHAT BUBBLES ARE `Body 1` (18/28), NOT `Body 2`.** `ChatBubble`
    said so in its own doc comment from the start while the CSS held `t-body2` at
    both breakpoints, so every desktop bubble came out 2px short per line. Use
    `t-body2-body1`. A one-line desktop bubble is 56 tall, not 54.

16. ⚠️ **EVERY PAGE TITLE IN THE APP IS `t-h4-h3` — including a hub's, which
    the comps draw one step larger.** `HubScreen`'s `<h1>` was the only
    `t-h3-h2` in the codebase: the comps give a hub landing H3/H2 and every
    investigation screen H4/H3, so the lightest screens in the product —
    readouts and lists — were titled a full ramp step louder than the questions
    that are the actual task. It also broke the page's own rhythm; measured on
    `/progress` at 440 the stack ran 24 → 18 → 14 → 13 → 12, which put the
    widest interval on the page between the title and a header two levels down
    inside a data card. **NOT IN FIGMA**, flagged on the `heading` const in
    `HubScreen.tsx`. This is a swap between two declared ramp entries, not a
    font-size written on a screen — `t-h3-h2` stays in `globals.css` because it
    is a real Figma text style, it simply has no caller now.

## Things the design system does not have, faked here

Each of these is composed from tokens in Figma too, so the code is not inventing
a treatment — but there is no component to keep them in sync, and that is the
risk. All are on the missing-from-the-DS list.

| Need               | Here                                                 | Note                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date picker        | `components/DateField.tsx`                           | `<input type="date">`'s popup is drawn by the browser and **cannot be styled** — no token or class reaches inside it. It rendered as a stock white Chrome calendar mid-flow. The DS has no calendar component either, so this is composed from tokens.                                                                                                                            |
| Text input         | `components/TextField.tsx`                           | `Search Field` (248:70) exists but is search-specific. `other-input` on 02c/03a and the 03c date field are all hand-composed in Figma.                                                                                                                                                                                                                                            |
| Face-region picker | `components/FaceDiagram.tsx`                         | The region coordinates ARE the design — "Cheeks (L)" only means the left cheek because of where it sits. Stored as % of the 392x300 card so it scales. ⚠️ The region chips are `bg/frost-light` (OPAQUE) as of 22 Aug 2026: they sit ON a frost-light card, so at 55% it was the same fill over the same fill and the pill had almost no edge. Selected stays `bg/brand` + white. |
| Camera shutter     | `SelfieCapture.module.css`, `AddProductMethodSheet.module.css` | No shutter component. Both viewfinders are placeholders, not `getUserMedia` — wiring a real camera would make the prototype demand a permission just to walk the flow.                                                                                                                                                                                                            |
| Modal tray         | `components/Sheet.tsx`                               | `Bottom Sheet` (255:91) has no background blur and a fixed light content slot, so every tray in the file is hand-composed from the recipe. There is also **no scrim token** — `state/pressed-overlay` at 14% is the only darkening value LUX has and it is weak for a modal.                                                                                                      |
| Accordion          | `components/BucketProductsList.tsx`                  | No accordion component. Composed from the frosted card recipe.                                                                                                                                                                                                                                                                                                                    |
| Search dropdown    | `AddProductMethodSheet.module.css` `.dropdown`        | `Search Field` (248:70) has no results popup, and the comps drew results as free-standing `ProductRow` cards on a routed screen. One frosted panel tucked 8 under the pill and inset 8 either side, capped at 296 with its own scroll. ⚠️ IN FLOW, NOT ABSOLUTE — the mobile tray is docked to the bottom edge and hugs its content, so an overlaid panel would open off the bottom of the viewport. |
| Product imagery    | `components/ProductThumb.tsx`, `ProductCard`         | **No product or bottle icon exists outside the bottom nav**, so every thumb and image well in the file shows a camera glyph. Replace it in the DS first, not here.                                                                                                                                                                                                                |
| Opaque sage        | `Sheet.module.css`                                   | `surface/data-strong` is 62% and has no solid counterpart the way `bg/nav` is `surface/frost-nav`'s. The `prefers-reduced-transparency` tray composites the same sage over `bg/canvas`.                                                                                                                                                                                           |
| Data card          | `components/DataCard.tsx`                            | The whole of SURFACE SYSTEM B. `surface/data` + `surface/frosted-data` + `radius/2xl` + 20/24 padding, **no stroke**. Not a component in Figma — every PROGRESS and CHECK card is composed from those tokens. Its `prefers-reduced-transparency` fallback composites the same sage over `bg/canvas`, exactly as `Sheet` does.                                                       |
| Calendar (record)  | `components/CheckInCalendar.tsx`                     | On the handoff's own missing list. ⚠️ THE SECOND CALENDAR IN THE APP AND NOT THE SAME ONE — `DateField` is a Monday-first interactive date PICKER, this is a Sunday-first read-only RECORD, and both match their frames. Do not merge them; raise the week-start split in Figma instead.                                                                                            |
| Line chart         | `components/SymptomTrend.tsx`                        | On the handoff's missing list. Drawn from the data, NOT from the comp's baked vector — the series is the card's whole content. `preserveAspectRatio="none"` + `vector-effect` for the line; the dots are positioned elements so they stay round (the desktop comp exports its "circles" at 13.33 x 8).                                                                              |
| Skin-profile strip | `components/SkinProfileStrip.tsx`                    | The one sage element on a CHECK screen. Same System B recipe as `DataCard` but an 86-tall strip with 18/20 padding — a separate component rather than a size prop that would mean nothing.                                                                                                                                                                                         |
| Compat accordion   | `components/CompatCard.tsx`                          | The SECOND accordion in the app; `BucketProductsList` is the other, on a different surface with a different header and no band. Neither exists in the DS. The band drives pill, score and bar fill through one `--band` custom property so they cannot drift.                                                                                                                       |
| Status pill        | `CompatCard.module.css`, `CheckHistory.module.css`   | Not `Tag` — Tag is Neutral/Brand only and these carry the feedback colours. ⚠️ `feedback/warning` and `feedback/error` share a hue and differ only in lightness, so the pill TEXT is what separates Risky from Avoid. Every row states its band in an aria-label, including the compatible ones that draw no pill at all.                                                            |

## Selection controls — the shape is the contract

Not a style choice. It maps to the ARIA role and screen readers announce them
differently.

| Control      | Shape  | Cardinality                | Role              |
| ------------ | ------ | -------------------------- | ----------------- |
| Radio row    | circle | exactly one                | `role="radio"`    |
| Checkbox row | square | zero or more               | `role="checkbox"` |
| Chip         | pill   | zero or more, short labels | `role="checkbox"` |

**Exclusive options** ("None", "Not sure", "Prefer not to say") stay
**checkboxes** and keep `role="checkbox"`. Selecting one clears every other box;
selecting a normal option clears the exclusives. Never swap them to radios —
mixing shapes in one group tells the user the whole group is single-select.

## Motion — board 04b (389:200)

"LUX motion is calm. Nothing snaps."

| Token               | Value | Use                                    |
| ------------------- | ----- | -------------------------------------- |
| `--duration-fast`   | 120ms | **hover, focus, small colour changes** |
| `--duration-base`   | 200ms | selection, chips, rows, toggles        |
| `--duration-slow`   | 320ms | sheets, overlays, page-level reveals   |
| `--duration-slower` | 480ms | orb and hero entrances                 |

`--ease-standard` is the default for anything that enters and settles.

- **Pressed never uses a transform** — "LUX does not bounce." Overlay
  `state/pressed-overlay` at 14% instead.
- **CSS cannot interpolate `background-image`.** Swapping one `linear-gradient()`
  for another snaps. The registered `--grad-start` / `--grad-end` properties
  (declared in `globals.css`) make the gradient addressable from both states.
- ⚠️ **A "stuck" transition in the preview pane is almost always the HIDDEN TAB,
  not your CSS.** The Browser pane reports `document.visibilityState === "hidden"`,
  and Chromium freezes rAF and CSS transitions there — 0 frames in 400ms.
  Computed values then sit at the START of the transition indefinitely and jump
  to the end on a forced reflow, which looks exactly like a stuck property. I
  misdiagnosed this once and stripped `Button`'s transitions for nothing.
  **To verify motion in the pane, inspect `element.getAnimations()`** — check the
  `CSSTransition`/`CSSAnimation` exists with the expected duration and easing,
  then call `.finish()` and assert the end state. Do not rely on sleeping and
  re-reading `getComputedStyle`.
- ⚠️ **Reveals use `animation-fill-mode: backwards`, NOT `both`.** `both` adds
  `forwards`, which keeps the animation in effect after it ends — and an opacity
  animation still in effect leaves a **persistent stacking context**. Every
  revealed block then paints in DOM order regardless of `z-index`, so a popover
  inside an early block renders _underneath_ the blocks below it. That is exactly
  how the date picker ended up behind the radio rows. Opacity 1 is the natural
  end state, so `forwards` buys nothing and costs that. `backwards` still holds
  the from-state during a stagger delay, which is the only part needed.
- **Anything that opens a popover gets `position: relative; z-index: 1` on its
  own block**, so its layering does not depend on nothing else in the stack ever
  creating a stacking context.
- **Entrance reveals: the rule that NAMES an animation must live in
  `globals.css`, never in a CSS Module.** Modules localize `@keyframes` names, so
  `animation: lux-fade-in …` inside a module compiles to a scoped name that does
  not match the global keyframes — it resolves to nothing and no animation runs,
  while still reporting a duration in `getComputedStyle`. Use the `[data-reveal]`
  / `[data-reveal-stagger]` hooks. A module may safely set `animation-delay`,
  which carries no name.
- **Wrap every `:hover` rule's counterpart in `@media (hover: none)`** so the
  state does not stick after a tap on touch devices.
- `prefers-reduced-motion` already collapses all durations globally; don't
  special-case it per component.

## Translate, don't transcribe

The Figma frames are fixed-height canvases (440x957, 1440x900). Their internal
spacer frames are artefacts of those heights. Express the _intent_ in CSS —
flex, `100dvh`, `clamp()` — and keep the tokens exact. Component sizes, radii,
type and colour must match Figma to the pixel; page-level whitespace should
adapt.

## Before you call a screen done

- `npm run build` and `npm run typecheck` both clean.
- Compare against the Figma frame at 440 and at 1440.
- Check computed values in the browser rather than eyeballing a screenshot.
- Keyboard: focus is visible on every interactive element. **The ring is an
  `outline`, not a `box-shadow`** — see the non-negotiable below. Never remove it.

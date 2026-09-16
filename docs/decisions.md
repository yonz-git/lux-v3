# LUX — decision record

Why this build diverges from Figma, and what earlier versions got wrong. Every
entry here is history plus rationale: the RULES themselves live in `AGENTS.md`,
and each screen's own reasoning is repeated in the doc comment at the top of its
component, where it cannot drift from the code it describes.

**Read a section here before you change the flow, the surfaces or the copy of
that nav section** — the ⚠️ blocks record decisions that a comp will contradict,
so "fixing" the code to match Figma is how they get undone. For ordinary work,
the component's own doc comment is enough.

**Figma file:** `wIftBhzkn8E4wjZwgdH71n` · **Screens page:** `06. Screen
Designs` (`453:2252`). Each section has a `HANDOFF — *` annotation panel beside
its mobile row documenting every recipe.

---

## Built so far

Sections shipped: GETTING STARTED, PRODUCTS, PROGRESS and CHECK.

- **GETTING STARTED** — `00 — Welcome` at `/`, then four of the five track
  steps: `01 — Create skin profile` (step 1), `02a — Skin type` (2),
  `02c — Known conditions` (3) and `03c — Timing` (4). Routes under
  `/investigation/<step>`. PRODUCTS is step 5. `03b — Selfie capture` is the
  optional photo off step 1 — an OVERLAY, not a route; see below.

  **⚠️ SELFIE CAPTURE IS A TRAY OVERLAY, NOT A SCREEN — NOT IN FIGMA.** It was
  `/investigation/selfie`, a routed step that carried a progress track and
  `Save & exit` while explicitly SHARING step 1's number, so the track never
  moved when you reached it — a "step" on the main line of a flow it was an
  optional side path off. "Take a photo" opens `features/my-skin/components/SelfieSheet.tsx` in
  place now: routing away scrolled the symptoms and face regions just picked
  out of sight behind a screen that says nothing about them, and coming back
  was a navigation rather than a dismissal, for what is one tap on a
  placeholder viewfinder. The `Sheet` recipe is unchanged and every measurement
  is still the frame's own; only the container is. The `selfie` step and its
  `StepId` are gone from `features/my-skin/flow.ts` — there is no route left for it to own —
  and `answers.selfie` is written exactly as before.

  **⚠️ NINE DESIGNED SCREENS ARE FIVE STEPS.** `02b — Skin tendencies` merged
  into `02a` and `03b — Location` merged into `01` — one screen each, and
  Continue gates on BOTH answers where it used to gate two separate steps.
  `03a — Observable symptoms` was dropped entirely. All three are decided-here
  flow changes with no matching Figma frame yet, flagged in the doc comments on
  `SkinType.tsx` and `StartInvestigation.tsx`; the frame ids of both halves are
  kept there so the next person can find what each came from. The track reads
  1/5, not 1/8, and `TOTAL_STEPS` is the only place that number lives.

  **⚠️ THE FLOW IS ITS OWN NAV SECTION NOW — `my-skin`, AND IT IS NOT IN FIGMA.**
  `Bottom-Nav-Bar` (410:258) encodes three items and the flow was not one of
  them, so `QuestionScreen` lit `Check` on all six of its screens — telling the
  user they were in the compatibility check while they answered profile
  questions, and lighting a tab whose own landing cannot reach those screens.
  `My skin` is the missing item, added FIRST because the other three all read
  what it collects. Its landing is step 1, `/investigation/start`, which stays a
  flow step — track, `Save & exit` and back chevron all kept, so the "a hub
  landing has no back chevron" rule does not reach it. A fourth item needed a
  fourth glyph and the DS has none; see `MySkinIcon` on the missing list below.

  **⚠️ STEP 1 IS TITLED `Create skin profile`, NOT THE FRAME'S
  `Start investigation`.** The nav section, the Welcome CTA and Progress's
  empty-state CTA all say the same thing now, and that string is not new copy —
  it is the label `Check — no profile` (606:2183) already gives this exact
  destination. Four names for one place was the confusion; the frame name is the
  odd one out and Figma catches up. `features/my-skin/flow.ts` owns the title, as it owns
  every other screen's.
- **PRODUCTS** — ONE add-flow screen under `/investigation/products` (step 5/5)
  and two hub routes under `/products*`. All three read nav `products`. It was
  twelve screens; see the remap below.

  **⚠️ STEP 5 IS THE ONE FLOW SCREEN THAT DOES NOT LIGHT `My skin` — NOT IN
  FIGMA.** It is still an investigation step in every other respect (track,
  `Save & exit`, `features/my-skin/flow.ts`), but what it puts on screen is the products
  list the `Products` tab owns, and the user is there to add products. Lighting
  `My skin` named the flow while the screen plainly read Products.
  `QuestionScreen` takes a `nav` prop for it; every other step keeps the
  `my-skin` default.
- **PROGRESS** — the hub at `/progress` (nav `progress`) in two states,
  `Progress — empty` (551:1196 / 551:1231) and `Progress — active`
  (552:1236 / 554:1252), plus two pushed views off it: the daily check-in at
  `/progress/check-in` and one day's record at `/progress/check-in/[date]`.
  None is an investigation step — no track, no `Save & exit`. See the PROGRESS,
  DAILY CHECK-IN and CHECK-IN DETAIL sections below.
- **CHECK** — the product compatibility check, five routes under `/check*`
  (nav `check`). Eight designed screens; see the CHECK section below.
  Not an investigation step either.

`features/my-skin/flow.ts` owns the step order, the 1-based track position, the Figma frame
ids AND each step's `isComplete` rule. `features/products/products.ts` owns the product
catalogue, the groups and the duration→group mapping. `features/progress/progress.ts` owns
the check-in series and everything the Progress screen states about it.
`features/check/check.ts` owns the compatibility bands, the scoring model and the check
history.


## PRODUCTS — the route map

| Route                     | Figma mobile / desktop                                     | Notes                                                |
| ------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `/investigation/products` | `574:1342` / `582:1612` (+ list `574:1391`, `578:1557`)    | step 5. `YourProducts` + the add-product tray on top |
| `/products`               | `579:1574` / `583:1863` (+ filled `579:1607` / `583:1889`) | HUB landing, no back chevron                         |

⚠️ **`/products/[bucket]` IS GONE, AND SO IS THE SCREEN IT SERVED.**
`Long-term products list` (`581:1593` / `583:1924`) was a pushed view whose
whole content was a title, a count and the group's cards — the first two of
which the hub row already stated. The category rows are DROPDOWNS now and the
cards open in place (`ProductAccordionCard`); see the note on `MyProducts`.

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

**⚠️ THE TIME WINDOW LIVES ON THE HUB ROWS, AND NOWHERE ELSE IN THE HUB.** NOT
IN FIGMA — `My Products — filled` (579:1607) draws each row as title + count,
and `Long-term products` (581:1593) puts a duration `Tag` on every card. Both
were moved in one pass, in opposite directions, for one reason:

`bucket` is derived from `duration` by `bucketFor` and by nothing else — a
strict 1:1 — so every product inside a group carries the SAME duration, the one
its own page title is naming. A "4+ weeks" badge repeated down a screen headed
"Long-term products" is noise that reads like data, so it came off the cards
(both places it appeared: the collapsed `Tag` AND the expanded `Duration` detail
row). `Your products` already had this rule and stated it — it shows the per-row
Tag ONLY in its flat single-group state, "carrying the period information a
header would otherwise repeat" — and the pushed view's list, permanently in the
grouped case, simply had not applied it. (That list is `ProductAccordionCard`
now, opening in place on the hub; `BucketProductsList` was deleted with the
route.)

The window moved TO `/products` because that is the only screen where all three
periods appear together, so they read as one scale (4+ weeks / 1–4 weeks /
< 1 week) rather than an isolated fact per row. It also put `Bucket.window` back
on screen at all: its own doc calls it "the `duration` label beside it", but the
only screen that ever rendered it was the deleted add-products intro, so the
windows that DEFINE these groups had quietly stopped being visible anywhere.

The treatment is not invented — same `t-h6` name + `t-label-sm` muted window,
baseline-aligned, same `BUCKET_WINDOW` lookup that `Your products` uses on its
group headers. ⚠️ **BESIDE THE NAME, NEVER UNDER IT**: measured 56 at both
breakpoints, which a second line would break. The row also carries its own
`aria-label` now — "Long-term products, 4+ weeks, 2 products" — because the
three spans otherwise ran together as "Long-term products 4+ weeks 2", making an
already-unlabelled count ambiguous. `not-sure` renders "unknown" beside it, the
same pairing `Your products` already shows.

**⚠️ AN EXPANDED PRODUCT CARD LEADS WITH `Added`, AND OPENS ITS INGREDIENTS —
NOT IN FIGMA.** 581:1593 orders the details Brand, Size, Added. Brand and size
are already on the collapsed header — the card's title is `fullName`, i.e. brand
+ name, with the size directly under it — so the panel opened by restating the
row that was just tapped and buried the one fact only it carries. `Added` leads
now, and it is also the fact this hub is organised BY.

A fourth row, `Ingredients`, is a nested disclosure rather than a `Detail`: an
INCI list is 15–25 comma-separated terms, which as a value in a right-aligned
column of two-word values would push every other card in an open group off the
screen. Closed by default, so the panel's resting height is unchanged; its
chevron is `icon-xs` against the header's `icon-sm`, which is the only thing
saying it belongs TO the card rather than being a second one. It is not drawn
when `ingredients` is absent.

**⚠️ THAT BLOCK IS `features/products/components/ProductDetails.tsx`, AND TWO SCREENS OPEN IT.**
It started local to `ProductAccordionCard`, i.e. to this hub; `/check/new`
expands its own rows onto the same thing now (see CHECK below). It is one
readout of five fields, and a screen that reordered them or dropped one would
make the same product look like two different records depending on which tab you
found it in. The CARDS still differ — the hub's carries Edit / Remove, the
check's carries the `Add` control — the record does not. `Added` is the one
optional row: a bare `CatalogProduct` has no `addedOn`, and a row reading
"Added —" says less than no row.

**⚠️ EVERY CATALOGUE ENTRY CARRIES AN INCI LIST NOW, AND `features/check/check.ts` READS
THEM.** `CatalogProduct.ingredients` existed for live Open Beauty Facts results
only, so on `/products` — which IS the demo — all five seeded products had an
Ingredients section with nothing in it. The lists agree with the MODEL rather
than with the shelf: `activesFromInci` runs for any product `PRODUCT_ACTIVES`
does not name, so a list disagreeing with the map would put an ingredient on
screen that the compatibility card refused to mention. Verified after the
change: the comp's five still score 45 / 62 / 71 / 94 / 98. The three
niacinamide-containing moisturisers with no map entry now read one off their own
list and score 94 instead of 98 — which is what their `description` said all
along — and no band moves.

`DEMO_PRODUCTS` is derived from `CATALOG` by id as a result. It had been five
hand-copied twins, harmless only while a product was name + brand + size; the
moment a catalogue entry grew a field, the copies shipped without it.

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

## PROGRESS — SURFACE SYSTEM B

`/progress`, in two states, both driven by whether step 4's flare date exists.
Documented by `HANDOFF — INVESTIGATION & PROGRESS` (`559:1376`), which is the
authority for everything below.

| Route             | Figma mobile / desktop         | Notes                                        |
| ----------------- | ------------------------------ | -------------------------------------------- |
| `/progress`       | active `552:1236` / `554:1252` | HUB landing, no back chevron. **The default** |
| `/progress/empty` | empty `551:1196` / `551:1231`  | ⚠️ prototype-only route — see below           |
| `/progress/check-in` | — | ⚠️ NOT IN FIGMA — one step, pushed view. See below |
| `/progress/check-in/[date]` | `556:1330` / `557:1353` | `Check-in detail`. Pushed view, the app's ONE dynamic route |

**⚠️ THESE ARE DATA SCREENS, AND THEY USE THE OTHER SURFACE SYSTEM.** GETTING
STARTED and PRODUCTS are forms: light frosted rows and cards, dark text, a 1px
`border/subtle`. PROGRESS (and CHECK, when it lands) are READOUTS. Every card is
a sage data card — `surface/data` + `surface/frosted-data` + `radius/2xl`,
padding 20 mobile / 24 desktop, and **NO stroke**. The text on one is white:
`text/on-data` for values, `-secondary` for body, `-muted` for labels; a section
label is `Overline` in `-muted`. Accents are indigo `bg/brand` — check-in discs,
timeline dots, meter fills — and the trend line is `text/on-data`, i.e. dark
since the contrast fix below. A divider inside one is
1px `border/glass`, never `border/subtle`. A nested emphasis block is
⚠️ **`surface/data-deep` as of 8 Sep 2026, not `surface/data-strong`** — a 62%
sage inside a 44% sage is two steps of one hue with almost nothing between them,
and every caller that put white on it was failing. **A sage card inside a light
card is a LUX pattern, the reverse is not.** `components/ui/DataCard.tsx` is the
whole recipe; use it.

⚠️ **AND SYSTEM B IS TWO SURFACES WITH TWO INKS.** `surface/data` takes the dark
ink; `surface/data-deep` `#4f838f @85%` takes white (`text/on-data-inverse`).
Neither ink is portable to the other surface — white on `surface/data` is
1.87:1, the dark ink on the deep tier is 3.67:1. An interactive deep surface
hovers to `surface/data-deep-hover`, never back to `-strong`. Full numbers and
the standing "do not retune" instruction are in the contrast section below.

**⚠️ THE CTA AND ITS CAPTION SIT IN col-1 NOW, UNDER THE CALENDAR — NOT IN
FIGMA.** The handoff gives col-2 four blocks and col-1 the calendar alone,
spanning all four rows, which balances only because the comp's calendar is 494
tall. This build's is 358 — see the auto-layout note below — so at 1440 col-1
ended at y≈680 beside a col-2 running to y≈1030, with the screen's own action
stranded at the bottom of the taller column. Moving `Check in today` and
`Last check-in` under the calendar balances the columns (472 against 497)
without changing any component's height, and puts the action under the record
it adds to rather than under a chart it does not change.

**⚠️ THE DESKTOP IS A 1280 DASHBOARD GRID, NOT A CARD.** Per the handoff, 1280
means "dashboard grid, no card": two columns a `gutter/desktop` (24) apart, col-1
fixed 640 (the calendar), col-2 FILL 616 (profile, trend, CTA, caption, a uniform
24 apart). That is `HubScreen`'s `layout="grid"`, added for this. Wrapping these
in the 920 frosted page card would invert the nesting rule above.
**⚠️ A GRID SCREEN MUST RESERVE FOR THE NAV.** Every other hub screen drops the
desktop bottom reservation so a CENTRED body lands where the comp puts it; a
dashboard body is not centred and its last row rendered straight behind the nav
pill. Measured: caption and nav both at y=743.

**⚠️ THE CHECK-IN HISTORY IS SEEDED ONLY WHILE THE SCREEN IS THE DEMO.**
`features/progress/progress.ts` anchors a deterministic series to a start date and clips it at
today; every figure the screen states (the day count, the percentage, "3 days
ago") is computed from that series rather than transcribed. Every entry point is
named `demo*`.

It used to seed unconditionally, which was defensible only while nothing could
WRITE a check-in. Something can now — see DAILY CHECK-IN below — so `checkInsFor`
splits the two: a REAL investigation plots exactly what the user recorded and
nothing else, and the demo merges their entries into the seeded series. A
check-in recorded during a demo walk is dated the demo's frozen today, so it
lands three days after the last seeded point instead of stranding itself weeks to
the right of a chart it cannot connect to.

## DAILY CHECK-IN — `Check-in chat` (555:1268), at `/progress/check-in`

A chat that builds itself one turn at a time as the user taps a pill:

| turn | LUX asks | control | writes |
| ---- | -------- | ------- | ------ |
| 1 | "Hi! How is your skin doing today?" | 5 radio chips, `SKIN_TREND_CHOICES` | `severity` (derived — see below) |
| 2 | conditional on turn 1 — "That's good to hear! Any specific changes you've noticed?" | multi-select chips, `changeOptions` | `changes` |
| 3 | "Would you like to add any notes or take a photo?" | two toggles, optional | `note`, `photo` |

then `Submit check-in`.

**⚠️ IT OPENS AS AN OVERLAY ON `/progress`, AND IT IS STILL A ROUTE — 6 Sep
2026.** `Check in today` used to push `/progress/check-in`. It now opens the
same conversation as a modal `ChatPanel` over the dashboard
(`features/progress/components/CheckInOverlay.tsx`), and submitting it closes
straight back onto the calendar and the trend line it just moved — the check-in
is a daily action off a hub that always ended by returning you to the hub, so
the navigation was a round trip that showed the user nothing on the way. The
panel already argued for this: `ChatPanel` is drawn as a surface that FLOATS on
the canvas, its X reads "this goes away" rather than "step back", and
`ChatPanel.tsx` records that reading in as many words. THE PROTOTYPE LEADS ON
FLOW.

**The route survives and is not a duplicate.** `/progress/check-in` keeps its
`metadata`, its `<h1>` and its back-chevron-less panel, because a deep link
needs somewhere to land and the analysis's "pause and check in" pushes it.
⚠️ **Both render `CheckInPanel`** — one conversation, two ways in. What varies
is only the way out: the route passes `closeHref` and pushes on submit, the
overlay passes `onClose` and closes. The overlay reproduces
`.screen[data-layout="panel"]`'s frame (16 top, the mobile margin, the nav's
clearance) rather than inventing one, so the panel lands in the same place
either way in — measured at 500x788: panel top 16, bottom 692, nav top 708.

**⚠️ THE SCRIM DOES NOT DISMISS IT, UNLIKE `Sheet`'S.** A tray closed by a
mistap costs you a menu; this one would cost a part-answered conversation,
because the store holds no partial check-in — the same fact that keeps the note
field and the photo capture on the screen instead of behind a route. The X and
Escape are the ways out, and both are deliberate acts.

**⚠️ `--z-overlay` (300), BETWEEN THE NAV AND THE SHEET, AND BOTH BOUNDS ARE
LOAD-BEARING.** Above `--z-nav` (200), because a nav showing through the
check-in offers a way out the conversation cannot survive; below `--z-sheet`
(400), because the photo capture is a `Sheet` opened from INSIDE this overlay
and at equal z-index the tray would paint under the panel that opened it.

**⚠️ THE FOCUS TRAP IS NOW SHARED — `lib/useModalDialog.ts`.** Escape, the Tab
wrap and the return of focus to whatever opened the dialog were `Sheet`'s, in
`Sheet.tsx`. The check-in overlay is a `ChatPanel`, not a tray, so it could not
simply BE a `Sheet` — and a second copy of a focus trap drifts apart the first
time one of them is fixed. `Sheet` is unchanged in behaviour; it calls the hook.

**⚠️ IT IS A PROGRESS SCREEN, THOUGH THE FRAME'S NAV SAYS `Check`.** The handoff
assigns `Check-in chat` to the CHECK section and the frame lights that tab.
Not taken, for two reasons: `Check — start` offers only "Start a check" and
"View previous checks", so nothing in CHECK can reach this screen, while
`/progress`'s `Check in today` had no destination at all; and `Check` is the
product COMPATIBILITY check, which shares the word "check" with a daily symptom
report and nothing else. The frame also carries the OLD three-item nav, which
predates `My skin`, so its nav is stale in at least one other respect. Route is
`/progress/check-in`, nav reads `progress`. **Open question — settle it in
Figma.**

**⚠️ THE FRAME DRAWS `Save & exit` WITH NO PROGRESS TRACK, AND THE BUILD HAS
NEITHER.** That pair together is the investigation flow's signature, and this is
a daily action off a hub, not a resumable step — it has no `StepId` and is not
in `features/my-skin/flow.ts`. One half of the pair on its own is the frame contradicting the
rule the rest of the file follows. It IS a pushed view, so it keeps the back
chevron a hub LANDING does not get. **Also an open question.**

**⚠️ THE QUESTION IS RELATIVE; THE STORED VALUE IS ABSOLUTE.** This was the one
real conflict with the trend chart. `SymptomTrend` plots 0–10 and `trendSummary`
divides one severity by another, so a series of "slightly better"s is unreadable
to both — but that only rules out STORING the delta. Asking for it is fine, and
it is the friendlier question: nobody rates their own skin 0–10 consistently
across a fortnight, everybody knows whether today beats yesterday. So the chip
carries a delta (±2 "slightly", ±4 "much"), `severityAfter` applies it to the
last severity, and `CheckIn` holds an absolute score. An earlier build asked the
absolute question outright (Clear … Very severe) on the reasoning that relative
answers break the chart — sound reasoning, wrong conclusion, because it confused
the question with the storage.

**⚠️ THE BASELINE IS THE SERIES THE CHART PLOTS, NOT `answers.checkIns`.** In
demo mode the store holds nothing — the nine seeded check-ins live in
`features/progress/progress.ts` and are merged by `checkInsFor` — so reading the store found no
previous severity, `severityAfter` fell back to mid-scale, and "Slightly better"
after a seeded 1 plotted a **3**. The line went UP directly under the words
"Slightly better". "Better than what?" has exactly one right answer: the last
point the user can see. Today is excluded from the baseline, so re-answering
measures from the same place rather than compounding on itself.

**⚠️ TURN 2's REPLY AND CHIPS ARE CONDITIONAL, AND ONLY THE `better` BRANCH IS
DRAWN.** The frame shows "Slightly better" picked, so it shows the better reply
and `Less redness / Less itching / Less dryness / No change`. The conditional is
the FRAME'S OWN — "That's good to hear!" cannot follow "Much worse", and "Less
redness" cannot be what it offers — so the worse and same branches are required
by the frame rather than invented on top of it, and they mirror its structure
and nothing more. Re-answering turn 1 across directions clears turn 2, rather
than leaving "Less redness" under "Sorry to hear that". **Get the worse/same
copy confirmed in Figma.**

**⚠️ TURN 2's SYMPTOMS ARE THE USER'S OWN.** The frame's three — redness,
itching, dryness — are exactly the first three of step 1's eight, so these chips
are that answer echoed back with a direction on the front, which is what every
screen in the app does with an earlier answer. Falls back to the frame's three
when step 1 is unanswered.

**⚠️ `"No change"` HAD TO JOIN `EXCLUSIVE_OPTIONS`.** It is the same species as
"None" — you cannot have noticed less redness AND noticed no change — but it was
not in the list, so it toggled like an ordinary symptom and the screen recorded
"More redness, More itching, No change". That list is the only place exclusivity
is declared, which is exactly why the bug was invisible in the screen's own code.

**⚠️ THE SELECTED CHIP STAYS IN PLACE — no `from="user"` bubble.** An earlier
build replaced each answered row with one; the frame does not, and the frame is
right. The pills ARE the record of what was said, changing your mind is tapping
a different one, and a bubble repeating a word already on screen two rows up is
a second copy of the same fact. (`ChatBubble`'s `from="user"` styling is
therefore still used by no screen, as it has been since it was written.)

**⚠️ THE ANSWERS BUILD THE SCREEN — NO TIMER, NO STEP INDEX.** A turn renders
because the one above it is answered. Nothing schedules anything and there is no
cursor to keep in sync.

**⚠️ NOTHING ANIMATES ITSELF — MOUNTING IS THE REVEAL.** Each bubble runs
`ChatBubble`'s own `bubble-enter` because it is newly mounted; each pill row uses
the global `[data-reveal]` hook. The screen names no animation of its own, which
also keeps it clear of the "a rule that NAMES an animation may not live in a CSS
module" trap.

**⚠️ TURN 3's TWO BUTTONS HAVE NO COMPONENT, AND THEY ARE TOGGLES.** Not
`Button` (no gradient, not the primary action), not `SmallButton` (a compact text
pill), not `Chip` (a selection control in a group). Composed from the frosted-ROW
recipe — and note that means `surface/frost-light`, the TRANSLUCENT token, not
`bg/frost-light`: the opaque one is #f4feff and rendered them as white stickers
beside bubbles and pills that are not, the same trap the Chip fill note records.
Armed state is a border change, never `bg/brand`, which would put a third
selection treatment on a screen that already has two. The frame gives no
destination for either, and routing away mid-chat would lose the conversation
(the store holds no partial check-in), so both stay on the screen: "Add a note"
reveals a field in place, and "Take a photo" opens the capture as a `Sheet`
OVERLAY — the same treatment the products scan view and the selfie tray use, so
it brings the scrim, focus trap, Escape and the mobile-sheet / desktop-dialog
pair with it rather than inventing a second modal. `Done` closes it and a photo
taken stays taken; removing it is a separate control in the chat. `NoteIcon` is
new — the file has no pencil glyph anywhere.

**⚠️ `note`, `photo` AND `changes` ARE READ NOW — by `Check-in detail`.** They
were written and unread for exactly as long as that screen had no route. It has
one, and the calendar's discs are links to it. See CHECK-IN DETAIL below.

**⚠️ NOTHING IS PRE-SELECTED, INCLUDING ON A DAY ALREADY RECORDED.** The frame
shows "Slightly better", "Less redness" and "Less itching" already chosen because
a comp shows a filled-in screen. Re-answering REPLACES the day's entry, and the
screen says so in a caption.

**⚠️ IT SURFACED A REAL BUG IN THE CALENDAR.** A day that is checked in AND today
could not happen before — the seeded offsets never landed on today — and
`.day[data-today]` and `.day[data-checked-in]` are equal-specificity rules with
`[data-today]` written second, so it won and repainted the numeral `text/on-data`,
the DARK ink, on an indigo disc. The day the user had just recorded was the one
day whose number could not be read. Fixed with `.day[data-today][data-checked-in]`.

**⚠️ `DEMO_PROFILE.current` WAS A BAKED SENTENCE AND IS NOW DATA.** It held
`"Current: Redness, Itching on Cheeks"` beside a doc comment claiming it was
"step 1's symptoms placed on step 1's locations" — nothing assembled it, so the
demo carried a string while every other path assembled one, and the two could
drift. `formatCurrent` is the single assembler now and `currentLine` picks its
inputs.


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

## CHECK-IN DETAIL — `Check-in detail` (556:1330 / 557:1353), at `/progress/check-in/[date]`

One day's record, opened from the Progress calendar. It is the screen that
finally READS `changes`, `note` and `photo`; nothing on it is stored twice.

| card | content | source |
| ---- | ------- | ------ |
| symptoms reported | the turn-2 answers as neutral `Tag`s | `CheckIn.changes` |
| severity | "Moderate" + "6 / 10" + an indigo meter | `CheckIn.severity` |
| notes | the note in quotes | `CheckIn.note` |
| photos | the capture | `CheckIn.photo` |
| products used | thumb + name + size/date, EDITABLE | `productsForCheckIn` |

**⚠️ A PUSHED VIEW, NOT A HUB LANDING AND NOT A FLOW STEP.** Back chevron, nav
`progress`, no track and no `Save & exit` — the same standing as the check-in
chat it is the record of. No `StepId`. The `Day 4` Tag is the header row's
action slot, and its number is `dayNumber`, the count the profile card already
writes.

**⚠️ THE APP'S ONLY DYNAMIC ROUTE.** `lib/pageTitles.ts` is keyed by pathname,
so it matches this one with a regex and the page uses `generateMetadata`. The
title is "Check-in record", NOT the date: a title names the kind of page, and
the date is the screen's own `<h1>` a moment later.

**⚠️ col-1 IS ONE GRID ITEM, col-2 IS THREE.** Grid row tracks are shared across
columns, so five flat cards would tie the columns' heights together and start
the severity card below the BOTTOM of the taller photos card beside it. Both
frames flow the columns independently, so col-1 is wrapped and spanned — the
same shape `/progress` uses for its calendar. The wrapper costs nothing on
mobile: the frames put notes directly above photos there, so the DOM order IS
the mobile order and only the desktop swaps the two.

**⚠️ A CARD WITH NOTHING IN IT IS NOT DRAWN.** The frames are a filled-in state.
Turn 3 is optional and turn 2 can be skipped, and an empty NOTES card headed by
an overline is a promise the record does not keep. Severity always renders; a
day with no check-in at all renders one card saying so, rather than 404ing — the
calendar only links days that have one, so this is reachable by typed URL only.

**⚠️ THE SYMPTOM TAGS ARE THE RECORDED ANSWER, VERBATIM.** The comp's tags read
"Redness" and "Itching"; what turn 2 stores is "Less redness" / "More itching" —
the symptom AND which way it moved. Dropping the prefix to match the comp throws
away the half of the answer the check-in exists to collect.

**⚠️ "PRODUCTS USED" STARTS DERIVED FROM `addedOn`, AND IS THE ONE THING ON THE
RECORD THE USER CAN EDIT.** The chat's three turns ask about skin, not products,
so nothing writes a per-day product list at the moment the check-in is recorded
and adding a fourth turn would change a screen the frame draws. What the app
knows is when each product entered the library, so "used on 5 Aug" STARTS as
every product added on or before it — a product added later cannot have been in
that day's routine.

**⚠️ WHAT THE DERIVATION CANNOT KNOW is that you own a cleanser and did not use
it, or that you used something you only entered afterwards.** Owning a product
is not using it. So each row carries a ✕ and the card carries a search field
under the list; an edit stores `CheckIn.products` (ids), and from then on
`productsForCheckIn` shows the user's list and `productsUsedOn` is only what the
day was before anyone corrected it. **The other four cards stay read-only,
deliberately** — they are what you SAID on the day, and a record you can rewrite
after the fact is not a record. The product list was never something you said.

**⚠️ IT EDITS IN PLACE: NO EDIT MODE, NO SAVE, NO SECOND SCREEN — NOT IN FIGMA.**
Every change writes immediately. A mode would put a second state on a card whose
whole content is five rows, and a Save button would imply the record could be
left half-edited. Three consequences worth knowing:

- **The card now draws at zero products**, which is the one exception to the
  rule above it: it carries the control that fills it, so an empty list is a
  state the user can leave rather than a promise the record cannot keep — and
  hiding the card at zero would take the only way back with it.
- **The field searches `ownedProducts`, not the catalogue.** A day's routine can
  only hold things you own, and a row here needs a real `addedOn` to write its
  meta line. When nothing you own matches, the panel hands over to the PRODUCTS
  tray rather than inventing a library entry with a duration nobody answered —
  the same handover `/check/new` makes for the same dead end, and whatever the
  tray adds joins the day. `AddProductMethodSheet` is now opened from three
  places.
- **The seeded day is materialised whole on the first edit.** In demo mode the
  day being edited usually has no entry in the store at all, so `editProductsUsed`
  falls back to the merged entry and writes severity, changes, note and photo
  with it: correcting a product list cannot quietly drop the rest of the day.
  The reducer also resolves against the list it is updating rather than the one
  the screen rendered, so five ✕ taps in one tick remove five rows.

⚠️ **The search itself is `searchProducts`, the catalogue ranking pointed at a
list the caller supplies** — the alternative was a second, weaker matcher beside
it that does not fold `La Roche-Posay`, does not read a size and does not rank a
word-start hit above a mid-word one, so the three things `products.ts` already
knows how to do would be true of the catalogue and false of your own shelf.

**⚠️ AND THE COMP'S SECOND LINE HAS NO DATA BEHIND IT**: "Moisturizer · Applied
Morning & Night" needs a category and a routine time, and LUX stores neither, so
the row writes the size and the date the product was added instead. Raise both
in Figma.

**⚠️ TWO PICTURES ARE ADDED THAT THE FRAMES DO NOT DRAW, for one reason.** A
`ProductThumb` on every products-used row, and `CheckInPhotoArt` inside the photo
well instead of the comp's camera glyph. Both frames draw text and an icon
because the comps had no imagery to place; the products list is then the one
place in the app that asks the reader to identify a product by reading it, and
the PHOTOS card is a card whose entire content is a picture saying "no picture".
Same call `ProductArt` already made, same rule, and Figma catches up.

**⚠️ THE SEED GREW, AND IT GREW BY DERIVATION.** `demoCheckIns` seeded a date and
a severity, which is all `/progress` reads — so on the demo path every seeded day
opened on a detail screen with one card on it. `changes` is now computed from the
direction the severity moved (the same fact turn 1 asks for) with the demo
profile's own symptoms, so a seeded day cannot claim "Less redness" on a day its
own plotted point went up.

**⚠️ AND IT GREW AGAIN — FIVE SEEDED DAYS ARE NINE.** Five discs on a 31-day
grid is a month in which the user checked in every third day, under a heading
that calls this a DAILY check-in; now that every disc is a link, it was also
five reachable records out of a fortnight, so a reader clicking the calendar
landed on a record one time in three. The comp's five (Aug 2, 5, 9, 11, 14) are
still there at their original severities and four are filled in between. Two
constraints hold the shape: **every step is 0, ±2 or ±4**, the only deltas
`SKIN_TREND_CHOICES` offers, so the seed is a series the app's own chat could
have produced; and **it still ends at offset 12**, because that is what makes
"Last check-in: 3 days ago" true — one of the three facts pinning `demoToday`.
Fill BETWEEN the comp's days, never past the last one. It is also no longer
monotonic — one day goes up and two hold flat — because `demoChanges` derives
its direction from the step, so a purely descending series made all nine detail
screens read "Less redness, Less itching".

**⚠️ THE NOTE SITS ON ONE DAY; THE PHOTO SITS ON ALL NINE.** They were coupled
and are not the same cost. The note is 5 Aug 2026 — the comp's own date and its
own sentence — because a fortnight of check-ins is not a fortnight of written
notes. A photo is one tap on a capture the chat already offers, and for a FLARE
investigation photographing the affected area IS the record the whole app exists
to compare, so a day-by-day series with gaps in it is a comparison with gaps in
it. Coupled to the note, the PHOTOS card and `CheckInPhotoArt` with it appeared
on exactly one screen in the app. `CheckInPhotoArt` keys tone and blush on the
DATE, so nine seeded days give nine different captures and **no assets**.

⚠️ **THE SEED NO LONGER EXERCISES THE EMPTY PHOTOS CARD.** An intermediate
version derived the days — a photo only where the check-in reported a CHANGE,
leaving the two "No change" days bare so the absence was rendered as readily as
the presence. Overruled deliberately: an unbroken photo diary is the more useful
demo. The code path is not lost — `photo` is optional and a real user who checks
in without tapping "Take a photo" still produces the card-less state, and
`CheckInDetail` still draws nothing rather than an empty well. But it is no
longer reachable by reading `/progress`; walk a check-in to see it.

**⚠️ THE TEXT IS DARK.** Both frames write `text/on-data` as white; that token is
redefined globally in `globals.css` (see SURFACE SYSTEM B above) and this screen
inherits the fix rather than restating it.

**⚠️ THE NOTE IS EDITABLE, AND THE CARD DRAWS EVEN WHEN THERE IS NONE — 6 Sep
2026.** `Edit note` swaps the quotation for a `TextField` with `Save` /
`Cancel`; a day that recorded no note draws the same card headed `Add a note`
over "No note recorded for this day." That is the `Products used` exemption
again — the rule "a card with nothing in it is not drawn" is about a card that
can only state what the record holds, and this one now carries the control that
fills it, so hiding it at zero notes would take the only way to write one with
it.

- **The draft is local; nothing is written until `Save`.** Writing on every
  keystroke would rewrite the day's record once per character and make `Cancel`
  a promise nothing could keep. `Cancel` is honest here in a way `Sheet`'s was
  not — that tray renamed its dismissal `Done` because every view behind it had
  already committed; this editor commits on Save alone.
- **Saving an empty field DELETES the note.** `CheckIn.note` is optional and
  every reader tests it for truth, so `editNote` drops the key rather than
  storing `""`, which would draw as an empty pair of quotation marks. Trimming
  lives in the module so the screen and the daily check-in cannot disagree about
  what counts as blank. The editor says so in a caption.
- **`editNote` mirrors `editProductsUsed`** — the updater form, and the fallback
  to the rendered entry that materialises a SEEDED day's whole record on first
  edit. Verified on 25 Aug (the seeded note day): after an edit the severity,
  symptoms, photo and five products all survive.
- **⚠️ A WORD, NOT A PENCIL, AND A `TextField`, NOT A TEXTAREA.** The DS has
  thirteen icons and no edit glyph, and no multi-line input — so the control
  says what it does, and the editor uses the same single-line field the daily
  check-in collects the note in. Both are gaps: **raise a Text Button, an edit
  glyph and a Text Area in Figma.**
- **Enter saves, Escape cancels, and focus returns to the control that opened
  the editor.** ⚠️ The focus restore is an EFFECT, not a call in the handler:
  the button is rendered by the same state change that closes the editor, and
  measured, a `requestAnimationFrame` fired before React had committed that
  render — `ref.current` was null and focus fell to `<main>`.
- Contrast, composited over the card at both ends of the canvas gradient:
  `Edit note` **8.10:1 / 6.51:1**, the hint caption **5.96:1 / 4.79:1**. Both
  pass AA. The white `Add a product you don't own yet` below is the one failure
  on this screen, and it is asked for.

**⚠️ `Add a product you don't own yet` IS WHITE, AND IT FAILS AA — asked for
directly, 6 Sep 2026.** Non-negotiable 17 holds everywhere else: SURFACE
SYSTEM B's text is dark because `surface/data` composites too light for white.
Measured on this well — `surface/data-strong` (62%) over `surface/data` (44%)
over the canvas gradient — the label is **2.22:1** at the top of the gradient
and **2.42:1** at the bottom ⚠️ **(the well took `surface/data-deep` on 8 Sep
2026, which lifts these to roughly 3.7:1 — better, still short)**, where the
inherited `text/on-data` was getting
**6.23:1 / 5.71:1**; `t-label` is 14/500, so AA wants 4.5. Reproduced as asked
rather than quietly corrected, the way the `/chat` failures are. The `PlusIcon`
beside it went white too, asked for straight after and right — a white word next
to a dark glyph reads as two controls rather than one row — so the rule is
scoped to this button and the search-result rows keep
`text/on-data-secondary`. The glyph is decorative and carries no information the
label does not, so its contrast is not an AA failure of its own; the label's
is. A passing version needs either a darker well or the label back on
`text/on-data` — a Figma decision.


## CHECK — the compatibility check

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
tab, so it has no `StepId` and lives in `features/check/check.ts`, not `features/my-skin/flow.ts`.
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

**⚠️ `/check/results` LISTED ITS PRODUCTS TWICE, AND THE EDIT TRAY IS GONE —
6 Sep 2026.** The screen carried the check's five products as five `CompatCard`s
on the canvas, under a `compared-products` header row (476:2851) whose `Edit`
opened `CheckBasketSheet` — a scrim'd modal listing **the same five products
again** as removable rows. One set, two lists, and the only copy you could edit
was the one covering the copy that carried the answers.

Both halves were fixed by the same move, and it is the one `MyProducts` made for
its category groups the day before:

- **The header row became the header of a BOX, and the cards became its
  contents.** The frosted fill moved off the row onto a `.group` container, the
  cards sit inside it inset 8 from three sides, and the fill stepped from
  `surface/frost-light` to `surface/frost-nav` for the same reason it did on the
  hub — a frost-light box around frost-light cards has no edge. `CompatCard`
  gained a `compact` form to match (padding 12, radius 8, opaque, no border),
  exactly as `ProductAccordionCard` did. Closed, the box would simply BE the row.
- **`Edit` became a MODE on the box** rather than a door to another screen, and
  it is what reveals the destructive affordances: a ✕ on each row and the
  `Add another product` row at the foot. ⚠️ **Neither is there at rest** — a
  permanent add row under a set the user had just finished assembling reads as
  an unfinished list rather than as a finished check. The chevron beside `Edit`
  went with the tray: a disclosure glyph on a control that discloses nothing is
  what made the header look like it collapsed the list. `aria-pressed` says it
  is a toggle.
- **The ✕ is on the row, not in the card body.** `ProductAccordionCard` puts its
  `Remove` under the details and this one deliberately does not, because that
  card has no edit mode and this box does. A mode exists to surface what it
  turns on: with the remove buried, entering edit mode changed nothing visible,
  and taking a product out cost a tap to open a row whose scores you did not
  want to read plus a tap to remove.
- **Adding happens in the box**, from a picker that SEARCHES. It opened as a
  plain catalogue list, which answers "add one more of the things the app
  already knows" and nothing else: the moment the product you wanted was not
  among the thirteen, the only route was to leave the screen. Anything already
  in the check is filtered out rather than shown with an `Added` tag: the
  builder is a list you assemble FROM and its rows must keep their place, this
  panel is opened to add one thing and closes when you have.
- ⚠️ **AND IT LISTS NOTHING UNTIL YOU TYPE — the opposite of `/check/new`, on
  purpose.** It first shipped with that screen's rule (empty query = your
  products, typing = the catalogue) and the rule does not transfer. `/check/new`
  exists to assemble a set out of your library, so an opening list IS its
  primary path. This panel opens from a check that is already built, so the
  products you own are by and large already in it — what was left to list was
  the catalogue remainder, and a column of products the user has never mentioned
  reads as a random list rather than as a suggestion. Nothing to suggest means
  nothing to show: the field asks, the results answer, and the empty state is
  one line saying what to type.
- **The `Add another product` row is `AddProductRow`, the PRODUCTS hub's own
  component.** It was a local compact one — opaque, 8 radius, the cards' 12
  padding — on the argument that a box's contents take the box's surface. But
  "add a product" is one action the user meets in three places and it has to
  look like itself in all of them.

**⚠️ AND THE SEARCH WAS LIFTED INTO `features/check/useCheckSearch.ts` RATHER
THAN WRITTEN TWICE.** CHECK searches differently from the rest of the app on
purpose — a live Open Beauty Facts pass MERGED OVER a local ingredient index, so
"salicylic" finds the BHA Exfoliant, which is a compatibility question. That
merge lived inline in `CheckBuilder`, and the promise it was written to keep is
literally "one search function, one debounce, one fixture fallback". Two copies
of that is not one search function, so the moment `/check/results` grew a picker
the merge moved to a hook and the builder now calls it too. Same results, same
debounce, same fallback, one place to reason about.

**⚠️ ADDING A PRODUCT ASKS HOW LONG YOU HAVE USED IT.** A check does not imply
ownership — half the reason to run one is a product you are *considering* — so
putting everything you compare into `answers.products` would quietly fill the
library with things the user has never opened, and the investigation reads that
library as "what I am using". Equally, a product you compare and DO use should
not have to be entered twice. So a question appears under the row it is about:
*"How long have you used <product>?"*, the four `DURATIONS` as radios, with
`Not now` beside `Add to my products`. It fires for a catalogue product and
never for one already in your library.

⚠️ **IT ASKS THE DURATION RATHER THAN YES/NO, AND THAT IS THE SECOND VERSION.**
It shipped as a yes/no that filed everything under `Not sure` — honest, because
nothing had asked, but it made the one group that means "I genuinely do not
know" the destination for every product added this way, and the analysis reads
that timeline. `bucketFor` derives the group from the duration and from NOTHING
else, so asking is the fix: this is the same question the add tray asks, in the
same `OptionRow` radios, and `Not sure` goes back to being one of four answers
rather than the default.

**Answering IS the consent** — "how long have you used it?" cannot be answered
by someone who is not using it — which is why there is no separate confirm, only
the decline beside it. The action is disabled until it is answered, for the
reason `Continue` is on every flow step: there is no group to file the product
under until it is.

It is a question rather than a checkbox on the picker row because "I am using
this" is a claim about the user's routine, not a preference: PRODUCTS is what
the analysis subtracts from, and a wrong entry there changes what the app
concludes.

⚠️ **A PRODUCT ADDED SINCE THE CHECK RAN HAS NO SCORE AND MUST NOT BORROW ONE.**
`results` comes from the check that ran, so an added product has no entry in it
— filtering the rendered list by the pending set alone silently DROPPED it and
the row the user had just added never appeared. It renders as a scoreless
`PendingRow` tagged *Not analysed yet*, which is the true statement: it is in
the set, and the numbers above do not include it. Not a `CompatCard` with a
blank score — a disclosure that opens onto an empty panel is worse than no
disclosure.

⚠️ **EDITING THE SET DOES NOT RE-SCORE THE SCREEN, AND MUST NOT.** `analyseCheck`
scores every product AGAINST THE BASKET — conflicts are half the model — so
dropping one silently changes the other four numbers. A removal therefore edits a
**pending** set only: that product's card goes, everything above it is untouched,
and the box grows a `Re-run analysis` action whose note says in words that the
results on screen are the previous set's, and one `Re-run analysis` below it —
both centred, on the box's own surface with no card of their own. Re-running writes a NEW check under a new date, which is what `Edit`
always did.

⚠️ **THERE IS NO `Undo`.** It shipped beside the button as the ghost of a pair
and came off: a change is not stranded without it, because a removed product is
still in the picker — putting the set back is `Edit` → `Add another product` →
pick it — and re-running is the only thing this block exists to offer. With one
control the row has nothing to balance, so the button centres rather than
pinning right against the gap where the text button was. The question above it
keeps its text-left / pill-right pair, because it HAS two answers.

⚠️ **AND THE FOOTER HAS NO SURFACE.** It carried the nested recipe every other
block in the box has — opaque fill, 8 radius, 12 padding, the frosted-row edge —
and that was one card too many: the products are cards, the picker and the
question are cards, and a fourth one holding a line of copy and a button made
the box read as a stack of five things rather than as a list with an action
under it. A footer is the one thing in a container that should NOT have its own
edge, because it belongs to the box rather than sitting on it. With the surface
gone there is no left edge for the note to start from either, so the note
centres with the button.

⚠️ **AND "CHANGED" IS SET EQUALITY, NOT "HAS THE USER TOUCHED IT".** Removing a
product and adding it straight back leaves a pending set holding the check's own
members, and the banner then said "the results above are for the previous set"
about the set on screen. Order does not count — the box renders worst-first
regardless, so two sets with the same members are the same check. The re-run
block is also NOT gated on the edit mode: a change survives leaving the mode, so
hiding the only way to act on it behind `Edit` again would strand it.

⚠️ **THE PENDING SET IS LOCAL STATE, NOT `answers.checkBasket`.** The basket is
`/check/new`'s working set; it is written only when the user leaves for one of
the two screens that reads it. That also fixes what `Edit` never managed — it
handed `/check/new` whatever the basket happened to hold, so opening a check from
the history and pressing Edit edited a different set, and on a cold load an empty
one.

`CheckBasketSheet` keeps its one honest caller, `/check/new`, and lost the
`submitLabel` prop that existed for this screen alone. ⚠️ **NOT IN FIGMA** —
476:2841 draws the row and the cards as siblings, and the transition map says
"Edit on Compared Products reopens the tray".

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
  both names back in. The page's own list is ALWAYS your products; the search
  overlays the catalogue on top of it — see the dropdown note below.
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

**⚠️ THE SCORING IS A MODEL, NOT A LOOKUP.** `features/check/check.ts` gives every catalogue
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

**⚠️ THE DAILY CHECK-IN IS NO LONGER ORPHANED, AND IT DID NOT LAND HERE.** The
PROGRESS handoff assigns `Check-in chat` to this section — "it IS the check-in" —
and that assignment was not taken. Resolved by moving the JOB rather than adding
a third CTA to `Check — start`: the daily check-in ships at `/progress/check-in`,
is reached from Progress's `Check in today`, and lights `Progress`. This tab now
carries exactly one meaning — the product compatibility check. See DAILY CHECK-IN
under PROGRESS above, and raise the section split in Figma.

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
**1.64–2.13:1**; and `SelfieSheet` and `AddProductMethodSheet` both draw their
viewfinder in the same light `surface/data`. Every surface in the app that reads
these tokens is light sage, so the exception list was empty. The values are
declared on `:root` in `globals.css` (hand-authored) rather than `tokens.css`
(generated). **Raise this in Figma** — it is a token bug there too.

⚠️ **STILL WHITE, DELIBERATELY:** the `border/glass` divider inside a data card
and the check-in discs' `text/on-brand` (indigo ground, passes).
`SymptomTrend`'s line is NOT on this list any more: it binds
`--color-text-on-data`, so the global fix carried it with the text and it now
draws dark — measured, it clears 3:1 against both card alphas. The remaining
System B question is the calendar's `Today` ring, which is `border/glass` on
`surface/data` at **1.44:1** where SC 1.4.11 wants 3:1, and today has no other
indicator.

⚠️ **TWO SHEETS OPT BACK OUT OF THE DARK INK, AND BOTH FAIL.**
`features/products/components/AddProductMethodSheet.module.css` redeclares `text/on-data*` as `#ffffff` for
its method list (measured 2.64:1 / 2.70:1) and `CheckBasket` does the same for
its rows (2.39:1, and 2.39:1 for the white remove glyphs, which are controls).
Both are deliberate and flagged in their own files. Everything else in the app
inherits the accessible values.

⚠️ **`--color-text-muted` WAS ONE OF THOSE SURVIVORS AND IS NOW FIXED.** It
aliased `neutral-400` (`#9a9aa5`) and measured **2.13–2.57:1** on the three
surfaces it actually lands on — every `ProductRow` meta line, `DateField`'s
"Select a date", the PRODUCTS hub's windows and counts, `CheckHistory`'s counts —
at 12–16px, where the large-text allowance never applies. It is `#63636f` now,
**4.54–5.47:1** on all three, redefined on `:root` in `globals.css` beside the
System B block and for the same reason. The full measurement, including why the
darkest surface has to set the value, is on that block.

⚠️ **THE REST OF THAT LIST STILL SURVIVES, AND ONE ENTRY IS NEW AND WORSE.**
These are measured and deliberately unfixed — each wants a decision in Figma, not
a patch here:

- ~~**`gradient/brand`, i.e. the PRIMARY BUTTON on every screen.**~~
  ⚠️ **CLOSED 8 Sep 2026 — AND NOT BY THE ROUTE THIS ENTRY KEPT LOOKING DOWN.**
  It ran `#a2b9bf` → `#637073` with a white label at 2.05:1 / 2.67:1 / 3.73:1 /
  5.13:1 across the sweep, and the entry's own reasoning was that no ink clears
  both ends so the surface has to move — correct, and it assumed the surface
  could only move DOWN the sage ramp. Two rounds went that way: a passing
  version (`#5f7275` → `#3c4b4e`) was built and **rejected as too dark**, then
  the start was nudged `#bbd3d9` → `#a2b9bf` and still failed.

  **The axis nobody had tried was hue.** In OKLCH the old gradient sat at hue
  213–215 with chroma **0.016–0.027** — inside LUX's sage GROUND family (canvas,
  nav, bubbles, data cards) with the chroma drained out, which is why it read as
  a disabled steel pill rather than as the app's one primary action. Indigo is
  LUX's FIGURE family — selection, chips, checked days, the orb's mark — and the
  button belongs to it. It now runs **`#657792` → `#39386f`**, hue 258 → 282,
  chroma 0.047 → **0.092**: it GAINS colour as it darkens where the old one lost
  it.

  White now measures **4.56 / 5.62 / 6.90 / 8.59 / 10.66** across the sweep. AA
  everywhere, on the app's widest-reaching failure.

  ⚠️ **THE "TOO DARK" REJECTION STILL STANDS AND THIS DOES NOT REOPEN IT.** That
  was about seating the whole thing lower on the SAGE ramp, where the result
  read as a flat slab. This keeps a 24° hue rotation and doubles its chroma, so
  it still reads as a sweep. ⚠️ **The instruction "`#a2b9bf` is a chosen design
  value, do not improve it" is retired with the value.**

  Both stops live on `:root` in `globals.css` with their `button/bg-default-*`
  mirrors and the two `@property` initial values — ⚠️ **a registered property
  takes no `var()`, so the initial values are hand-written and have to move with
  the tokens** or the previous colour flashes for a frame. Figma still holds the
  sage; see `docs/figma-catchup.md` §2 and §6. ⚠️ **It also retires the rule that
  `gradient/brand-indigo` is "for marks and accents only"** — the primary button
  is indigo now, and whether the two indigo gradients should be one value is an
  open question for Figma.

  ⚠️ **CLOSED THE SAME DAY, BY MOVING `bg/brand`.** The button's dark end is hue
  282 and `bg/brand` was 293.5 — they sit side by side on `/progress`, the
  button beside the checked-in calendar discs, and read as two violets rather
  than one. `bg/brand` is now `#39386f`, the identical value: **the primary
  action and the mark that says "selected" are the same indigo.** That is the
  right end to move, because the button is the thing with the argument behind
  it and `bg/brand` was only ever `indigo/700` by default.

  ⚠️ **ITS TWO SIBLINGS MOVED WITH IT, AND ONLY `bg/brand` WAS ASKED FOR.**
  `-hover` `#2e2447` → `#2c2a5f` (same lightness delta, new hue) and `-soft`
  `#8e80bc` → `#8284c0` (same L and C, new hue). `-soft` had no choice: it is
  the moderate-likelihood pill on `ResultCards` and its entire job is to read as
  one scale with `bg/brand`, which two hues would break. Reverting the two
  dependents is three lines.

  White holds: 11.91 → **10.66:1** on `bg/brand` and 14.39 → 13.10:1 on
  `-hover`, across the checked-in discs, selected chips and option rows,
  `StepProgress`' fill, the face diagram's picked regions, the "High likelihood"
  pill and `::selection`. `-soft` goes 3.52 → 3.49:1 — the failure it already
  carried, moved by 0.03, not a new one.

  ⚠️ **DO NOT REPOINT `--color-indigo-700` INSTEAD.** Non-negotiable 2 forbids a
  component binding a primitive, and moving the ramp step would drag anything
  else aliasing it. The three semantic tokens are overridden on `:root` in
  `globals.css`; Figma still holds `indigo/700`.
- `CompatCard`'s band colours and their white pill text, **2.03–4.47:1** on
  `/check/results`; the same pill on `/check/history`.
- ~~`ResultCards`' nested emphasis block, **2.22:1**, noted on
  `.emphasisTitle`.~~ ⚠️ **SUPERSEDED 8 Sep 2026 — it is one of four now, not a
  one-off.** `SymptomTrend`'s card, `ResultCards`' emphasis block,
  `CheckBasket`'s rows and `AddProductMethodSheet`'s tiles were four separate
  white-on-sage exceptions measuring 1.64–2.32:1. They now share one declared
  tier, `surface/data-deep` `#4f838f @85%`, with one declared paired ink
  (`text/on-data-inverse`), measuring **3.42–3.77:1**.

  ⚠️ **STILL FAILING, AND THE REASON IS WORTH KNOWING.** On the `surface/data`
  backdrop white measures 3.71:1 and the app ink measures **3.73:1** — the
  surface sits almost exactly where the two inks cross over, so *neither* passes
  and no ink choice fixes it. Only the surface can move, and meaningfully: an
  opaque `#407375` was built the same day and gives white 5.35:1; lighter
  returns the ink to 4.6:1+ and gives up the white. `#4f838f @85%` is a chosen
  design value — **do not "improve" it toward a passing one without asking**,
  and do not "correct" its hue onto the sage line (214.1 against `surface/data`'s
  199.8, deliberately cooler).

⚠️ **AXE CANNOT SEE ANY OF THIS, AND A CLEAN AXE RUN IS NOT EVIDENCE.** Every
screen in the app sits on the canvas gradient, and `color-contrast` degrades to
INCOMPLETE — never to a violation — the moment a background is a gradient or a
stack of translucent fills. All 15 routes report zero contrast violations with
the failures above on screen. Contrast in LUX has to be measured by compositing
the fill stack by hand and sampling the gradient at the element's own position;
sampling one representative surface is not enough either, which is how the muted
tier was first set two steps too light.

**⚠️ A ROW IN `Your products` OPENS ONTO ITS DETAILS — NOT IN FIGMA.** The
screen listed the products you own beside an `Add` control and told you nothing
else about them, so a COMPATIBILITY check was assembled out of rows whose
ingredients you could not see without leaving for the Products tab and coming
back. It opens onto `ProductDetails`, the same block the PRODUCTS hub opens —
the check did not grow a second way to look a product up.

`ProductRow` took a `details` prop for it. Closed, the row is unchanged and
still measures exactly 76 at both breakpoints (measured); open, it becomes a
column and grows the same hairline + panel the hub's accordion card draws. The
disclosure is the thumb + copy + chevron and NOT the whole row, because the
trailing slot holds `Add` — one tap target that both expanded the row and added
the product would be two actions on one control. So `onClick` and `details` are
mutually exclusive in practice.

⚠️ **THE SEARCH DROPDOWN'S ROWS DO NOT OPEN.** They are a capped
`min(360px, 50dvh)` panel with its own scroll, so a row that grew inside it
would fight the cap; and a live Open Beauty Facts result has no `addedOn` to
show. Left as-is deliberately — raise it if the panel ever stops being capped.

**⚠️ `/check/new` AND THE PRODUCTS TRAY NOW RUN THE SAME SEARCH.** They did not,
and the difference was invisible until you typed: the tray queried Open Beauty
Facts live while `/check/new` searched the 13-product offline fixture alone, so
one query typed two screens apart returned two unrelated lists and neither
explained itself. Both go through `useOpenBeautyFactsSearch` now — same debounce,
same fixture fallback. Three consequences, all flagged in the code:

- **The ingredient index survives as a local pass**, merged UNDER the live
  results rather than replacing them, so "salicylic" still finds the BHA
  Exfoliant and the list still leads with what was typed.
- **`activesOf` reads the INCI list** when a product is not in
  `PRODUCT_ACTIVES` — which is every live result. Without it a barcode id
  matched nothing and every searched-for product scored a perfect 98: a
  compatibility checker that approves everything the user looks up. It reads
  `ingredients` (the full list), **never** `description` (cut to 240 for the
  confirm card) — an INCI list is ordered by concentration, so the cut takes
  the fragrance and preservatives with it. The drying-alcohol pattern names its
  forms and never matches bare "alcohol": CETEARYL/CETYL/STEARYL ALCOHOL are
  emollients, and a bare match took 18 points off every barrier cream.
- **`checkBasket` and `SavedCheck` hold PRODUCTS, not ids.** A live result
  exists nowhere in `CATALOG`, so `productById` returned undefined and the row
  vanished between `/check/new` and `/check/results`. **Scores are still never
  stored** — that rule is about derived values, and every number still comes out
  of `analyse()` on read.

**⚠️ `/check/new`'s RESULTS ARE A FLOATING DROPDOWN, LIKE THE TRAY'S — AND
THIS ONE IS ABSOLUTELY POSITIONED.** The two screens ran the same search but
presented it two different ways: the tray hangs a panel off its search pill,
while `/check/new` let the results REPLACE the page's list. So typing swapped
"Your products" for "Search results", the page grew and shrank on every
keystroke, the thing you were half-way through comparing disappeared while you
looked something up, and a long result list scrolled the whole screen — search
field, skin-profile strip and all — out of reach. Now: the page always lists
your products, and the panel floats over it, caps itself at
`min(360px, 50dvh)` and takes its own scroll, so the page never moves.

The recipe is the tray's (`.dropdown` in `features/products/components/AddProductMethodSheet.module.css`)
with two deliberate differences, both flagged in `features/check/components/CheckBuilder.module.css`:

- **Absolutely positioned, where the tray's is in flow.** The tray is docked to
  the bottom edge and hugs its content, so an overlaid panel there would open
  past the bottom of the viewport; this is a full page that scrolls, where a
  panel in flow is what pushes the content around.
- **The SEARCH FIELD's own fill — `bg/nav`, i.e. `surface/frost-nav` with no
  alpha — where the tray's panel is `frost-light`.** Two things pointed the same
  way. The panel should read as the pill's own output rather than as a separate
  card dropped on the page, so it takes the pill's colour; and `frost-light` at
  55% let the page's list straight through it, which is fine in the tray (a
  uniform sage tray with nothing written on it) and is not fine here, where the
  panel floats over the user's own products — measured at 1440, four rows of
  "BHA Exfoliant", "Retinol B3 Serum", "Foaming Cleanser" were legible THROUGH
  the results. `surface/frost-nav` itself was tried first and left a faint ghost
  of the same rows at 87.8% + blur(28); the field can be translucent because it
  sits on the page's background, the panel cannot because it sits on the page's
  LIST. Sampled at both breakpoints the two composite to within two points per
  channel — field rgb(218,235,236) / rgb(220,237,238) against the panel's
  rgb(218,236,236) — so they read as one surface. No border and no
  reduced-transparency case: the pill's surface carries an inner shadow instead
  of a stroke, and an opaque fill has no fallback to answer for.

Consequences: `Check — no results` is a state of the PANEL now (its own fill and
padding, not the standing frosted card the comp draws), the `Add it manually`
button moved into it, and the panel is DISMISSIBLE — Escape or a click outside
close it, the next keystroke reopens it, because an overlay you cannot put away
is a trap. The result count is announced in a `role="status"` line beside the
field: it lives in the panel's own head, which a screen reader has to find and
which is not there at all until something is typed.

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
CALLER** — `features/check/check.ts` owns the actives and already imports `products.ts`, so
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


## `Button`'s height is a hook, and one caller shortens it

`Button` is `size/control-lg` (62) and that stays the default. Two callers want
less, and both now say so through **`--button-height`** rather than a
`min-height` declared from their own module:

- `StartInvestigation`'s **Take a photo** — `size/control-md` (48). The optional
  side path off step 1, which at 62 outweighed `Continue` on a screen whose
  actual task is the chips and the face diagram. On the scale; a size change,
  not a treatment.
- `CheckResults`' **Re-run analysis** — **53**, 15% under the 62. It sits inside
  the compared-products box under a single line of copy, beside a row of
  36-tall controls,
  so a full pill made the box's own action the tallest thing on a screen whose
  real actions are all above it. ⚠️ **53 is off the control scale on purpose** —
  `size/control-*` has 48 and 62 and nothing between, so binding either token
  would name it as a size it is not. Same class of deliberate literal as
  `--nav-inset-bottom` (5) and the 28 preview well on the PRODUCTS hub. Raise a
  shorter Button size in Figma and it becomes a token.

⚠️ **THE DEFAULT IS THE `var()` FALLBACK, NOT A DECLARATION ON `.button`, AND
THAT IS LOAD-BEARING.** `min-height: var(--button-height, var(--size-control-lg))`
— written the other way round, as `--button-height: var(--size-control-lg)`
inside `.button`, the component's own local declaration would SHADOW anything a
caller set, because a local custom-property declaration beats an inherited one
and a caller's own class ties on specificity. As a fallback there is nothing to
shadow. Same shape as `--icon-size` on `icons.tsx` and `--bubble-width` on
`ChatBubble`.

**Take a photo used to do it with `min-height` and happened to win.** Two
single-class rules for one property on one element are decided by CSS-Module
bundle order, not by intent — non-negotiable 13's trap, in its custom-property
costume. It was moved to the hook when the hook arrived, so the fragile
precedent is not there to copy.

## The browser's own surfaces, and who owns them

⚠️ **DECIDED 8 Sep 2026. Text selection, the caret and native control accents
belong to the design system, and until this they belonged to nobody.**

A Figma frame has no text selection, no blinking caret and no OS date picker, so
none of the three was ever specified — and what shipped was the browser default:
a Windows-blue selection highlight, a black caret, and a blue native picker on a
page where nothing else in the app is blue. It is the cheapest tell that a page
was assembled rather than built, and it lands on exactly the moments a user is
most deliberate — dragging to select, typing, picking a date.

All three now bind `bg/brand`, the indigo LUX already uses for every selection it
DOES draw: a selected chip, a checked option row, a checked-in calendar disc. The
argument is that a selection is a selection, and the app should not have two
languages for it depending on whether the control was drawn in Figma.

⚠️ **`::selection` ALSO SETS THE INK, AND THAT IS NOT OPTIONAL.** `bg/brand` is
opaque, so a selection has ONE ground wherever it lands — a System A frosted row
and a System B sage card alike — and the ink has to be the one that passes on
THAT ground rather than on the surface underneath. Letting it inherit put
`text/on-data` (#2e2a3f) on indigo at **1.36:1** on every data card. White on
`#39386f` is 10.66:1 (it was `#3b305c` at 11.91:1 until 8 Sep 2026).

**The scrollbar stays hidden.** That one WAS a decision, taken earlier and still
right: the app's surfaces are chrome-free frosted glass and an OS scrollbar
track is the one piece of chrome that cannot be made to match. Hiding it is not
the same failure as leaving selection at the default — one is a choice about a
surface the DS owns, the other was a surface nobody had looked at.

## Digits that stack take lining figures

⚠️ **DECIDED 8 Sep 2026, BY ROLE AND NEVER GLOBALLY.** Figtree's default figures
are proportional — `1` is narrower than `0` — which is correct for running prose
and wrong everywhere LUX puts numbers in a column or changes one in place.

Four roles set `font-variant-numeric: tabular-nums`:

| Role | What it was doing |
| ---- | ----------------- |
| the calendar grid | a 7-column month did not line up down its own columns; worst on the 11/21 column against the 30 below |
| the chart axes | the y ticks are right-aligned into a fixed 20 and read as a scale; the x dates are positioned against their own ticks |
| `.t-metric1` / `.t-metric2` | a metric that counts or changes jitters as its digits swap width |
| the compat score | 98% and 71% down a list did not align on their own `%` |

⚠️ **NOT ON `body`.** Prose should keep the proportional figures it was designed
with — a date inside a sentence is not a column. Adding a fifth role is a line in
that component's module, which is also what keeps the list above honest.

⚠️ **FIGMA CANNOT EXPRESS THIS AS A VARIABLE** — it is an OpenType feature on the
text style, so either the styles carrying a grid turn it on or the guide boards
note that the build and the comps differ here. Logged in
`docs/figma-catchup.md` §4.

## Where a line breaks is the ramp's decision, not the screen's

⚠️ **DECIDED 8 Sep 2026, BY ROLE, ALONGSIDE THE LINING FIGURES ABOVE.** Every
heading class carries `text-wrap: balance` and every prose class carries
`text-wrap: pretty`, declared once on the ramp in `globals.css`.

| Role | Classes | What it fixes |
| ---- | ------- | ------------- |
| headings | `t-h1`–`t-h6`, `t-h4-h3`, `t-h3-h2`, `t-display1`/`-2` | a title that strands one word alone on its last line |
| prose | `t-body1`/`-2`/`-3`, `t-body2-body1`, `t-body3-body2`, `t-caption` | a paragraph that ends on an orphan |

⚠️ **THE COMP CANNOT MAKE THIS DECISION AND NEVER COULD.** A Figma frame is a
fixed 440 or 1440, so it breaks a heading wherever that width happens to break
it; the build breaks it at whatever width the reader's device is. Neither
property moves a font-size, a line-height or a measured width — only where the
break lands, which is the one typographic decision the comp was never in a
position to make. Logged in `docs/figma-catchup.md`.

⚠️ **IT WAS ALREADY BEING WRITTEN BY HAND, WHICH IS THE ARGUMENT FOR THE RAMP.**
`HypothesisCard`, `Analysis` (twice) and `SkinProfileSummary` had each reached
for it locally. A heading that balances on the analysis and not on the recap is
the class of inconsistency nobody can name and everybody sees. Those four
declarations are now redundant and are removed.

⚠️ **THE CONTROL CLASSES ARE EXCLUDED, DELIBERATELY.** `t-label`, `t-label-sm`,
`t-button`, `t-button-sm` and `t-overline` size chips, buttons and section
labels whose widths are measured against Figma — balancing a two-line chip label
moves the pill, which is exactly the drift the ramp exists to prevent. The
browser also caps `balance` at a handful of lines, so it is a heading tool by
construction.

⚠️ **ONE LOCAL DECLARATION SURVIVED, AND IS GONE AS OF 15 Sep 2026**, on
`SkinProfileSummary`'s `.headlineValue`. It wore `t-button` — a control class —
as a DATA VALUE on the recap's sage card, so the rule the ramp excludes it from
was the rule it wanted. The card was replaced by `SkinProfileTiles` on 14 Sep
2026 and the class was deleted the next day. That is still the shape of a
legitimate local `text-wrap`: a control class doing non-control duty. Anything
else belongs on the ramp.

## Pressed was one component's state and is now the app's

⚠️ **BOARD 04b ALREADY ANSWERED THIS, AND ONE CONTROL WAS LISTENING.** "Pressed
never uses a transform — LUX does not bounce. Overlay `state/pressed-overlay` at
14% instead." `Button` has drawn that overlay since 22 Aug 2026. On 8 Sep 2026
an audit of `:active` across the app found it in exactly two modules — `Button`
and nothing that mattered — against roughly thirty interactive class rules.

⚠️ **THE GAP WAS A TOUCH GAP, WHICH IS WHERE THE APP LIVES.** Every one of those
controls had hover and a focus ring, and hover does not exist on a phone. So on
the mobile frame the whole product is drawn at, a tap on the nav, on either back
chevron, on a `SmallButton`, on a history row, on a checked-in calendar disc or
on one of the add tray's method tiles produced **no feedback at all** until the
thing it did finished. Those are precisely the controls that cannot afford
silence: each one ends in a route change or a whole new sheet, so the gap
between the tap and any visible answer is the longest in the app.

The recipe moved to `globals.css` as `.pressable`, unchanged from the board:
`state/pressed-overlay` at 14%, `duration/fast`, no transform.

⚠️ **`::before`, NOT `::after`.** `.tap-target` — the WCAG 2.5.8 hit-area
utility that has been in `globals.css` since the icon-sizing work — owns
`::after`, and the two classes land on the same element wherever a small text
control both grows its target and takes a press. `Remove` on a product accordion
card is already both.

⚠️ **AN OPT-IN CLASS, NOT A BLANKET `button:active` RULE, AND THAT IS THE WHOLE
DESIGN OF IT.** Half the app's controls answer instantly on their own — a chip
fills, an option row ticks, a disclosure opens, a face region lights. Darkening
those adds a second signal to a state change the user is already looking at. The
overlay goes on the controls whose result arrives LATER. Applied through a class
for the same reason `.tap-target` is: it stays a decision, and it stays
greppable.

⚠️ **`Button` IS NOT A CALLER.** It carries its own copy of the recipe inline,
on `::after`, with the gradient-reversal hover it has to coordinate with.
Rewriting it to consume the class would be churn against a control that has been
correct since August.

⚠️ **INLINE TEXT LINKS ARE ALSO NOT CALLERS** — `CheckScreen`'s "View previous
analyses" and the analysis's reminder link. They have no radius and no padding,
so a 14% overlay lands as a highlighter box across the words rather than as a
pressed surface. Those fade on `:hover` and would need a different pressed
treatment, which is a Figma question rather than a code one.

## Removing something is undoable

⚠️ **NOTHING IN THE APP COULD BE UNDONE UNTIL 8 Sep 2026, AND TWO OF THE THINGS
THAT COULD BE REMOVED PERSIST FOREVER.** `Remove` on a product accordion card
deleted a product from the library outright, and the library is one of the four
`PERSISTED_KEYS` slices — so a mis-tap on a 44px control was permanent, silent
and unrecoverable except by retyping a name and a size. Taking a product off a
day's check-in record was the same, and worse in one respect: the first edit of
a SEEDED day materialises the whole record into the store, so the mis-tap also
froze that day's other values in place.

⚠️ **THE ANSWER IS UNDO, NOT A CONFIRM DIALOG, AND THE CHOICE IS THE POINT.** A
confirm interrupts every removal — including the great majority that are
deliberate — to protect against the few that are not, and it charges that
interruption to the people who meant it. Undo charges them nothing and still
gives the others a way back. It is also the pattern LUX can actually afford:
the store already holds the previous value, so undo is one `setAnswer`, while a
confirm would need a modal the design system does not have either.

⚠️ **IT RESTORES A SLICE SNAPSHOT, NOT A REVERSED EDIT.** Each caller captures
`answers.<key>` BEFORE it writes and hands that value back. Re-inserting the
removed item would have to know where in the list it sat and, on the demo path,
would have to reason about a slice that is still `undefined` because the library
is SEEDED rather than stored. A snapshot answers both for free: restoring
`undefined` puts the seeded library back exactly as it was, where restoring
`DEMO_PRODUCTS` would materialise it and quietly turn a portfolio visitor's list
into a stored one.

⚠️ **ONE BAR AT A TIME.** A second `show()` replaces the first, which is the only
correct behaviour for a snapshot undo: the second snapshot already contains the
first removal, so undoing it walks back one step. Two stacked bars would each
claim to walk back one step and the older one would walk back two.

⚠️ **SIX SECONDS, PAUSED WHILE HOVERED OR FOCUSED.** Six is the window to notice
a mistake and reach the control; it is not enough to read the message, decide,
cross the screen and land on a 36px button, and a bar that vanishes from under
the cursor on the way to it is worse than no bar. Measured in a real browser:
shown at 0.3s, still shown at 3.3s, gone by 6.7s; hovered continuously it
survives 7.2s and dismisses 6s after the pointer leaves. Keyboard users get the
same guarantee through `focus`, because tabbing to the action must not be a race.

⚠️ **THE PAUSE HANDLERS SIT ON THE REGION, NOT ON THE BAR.** `mouseenter` fires
on an element when the pointer enters its SUBTREE, so the region hears the bar
even though it is `pointer-events: none` itself, and `focus` bubbles from the
button. It also keeps the bar a plain container — a `<div>` with interaction
handlers and no role is what `noStaticElementInteractions` objects to, and the
honest answer is that the interactive thing in there is the button.

⚠️ **THE LIVE REGION IS ALWAYS MOUNTED, EMPTY OR NOT.** A live region has to be
in the document BEFORE its content changes or the change is never announced —
mounting the region together with its message is the classic way to ship a toast
no screen reader ever reads. Empty, it takes no layout and no clicks.

⚠️ **WHAT IS DELIBERATELY NOT WIRED.** CHECK's basket and the pending list on
`/check/results` remove things too, and neither raises a bar: a basket you are
building is not a destructive action, the item is still one tap away in the list
beside it, and a message about it would fire constantly during ordinary use. The
check-in draft's `Remove` for a captured photo is the same case.

## The layout survives the user's own text spacing

⚠️ **WCAG 1.4.12 (AA) IS THE ONE CRITERION NOTHING ELSE IN THIS REPO CAN SEE.** A
user may override line-height to 1.5x, letter-spacing to 0.12em, word-spacing to
0.16em and paragraph spacing to 2em, and nothing may be lost when they do. The
build, `tsc` and axe all say nothing about it, because the failure only exists
once those overrides land on a live layout at a real width. So it is measured:
`npm run spacing` drives a headless Chrome over CDP with no dependencies, walks
18 routes at 320, 440 and 1440, and reports what a box loses.

⚠️ **IT RUNS TWICE AND REPORTS THE DIFFERENCE, WHICH IS THE WHOLE DESIGN OF IT.**
A single "does anything overflow" pass reports about 80 boxes in this app and
every one is a false positive: the transparent 44px hit areas (`.tap-target`,
`Chip`'s `::after`) are absolutely positioned pseudo-elements that legitimately
extend past their box and count toward `scrollHeight`. Only a box that overflows
WITH the overrides and not without them is a failure. The baseline pass is what
makes the result readable at all.

Measured before the fix, six boxes lost content, all of them a flex column that
had already collapsed to 56–75px at 320: `ProductList`'s name and meta in a
`/check/new` row, `ResultCards`' `.statLabel` and `.emphasisTitle`,
`CompatCard`'s name, and `MyProducts`' `.categoryName`.

⚠️ **FIVE OF THEM ARE CLOSED BY `overflow-wrap: break-word` ON `body`, AND THAT
IS THE ONE PROPERTY THAT HAS TO BE INHERITED RATHER THAN APPLIED BY ROLE.**
Unlike `text-wrap` and `tabular-nums`, it restyles nothing that was already
fitting — it acts only at the point where the alternative is text spilling out
of its box. `break-word`, NOT `anywhere`: `anywhere` also shrinks a flex item's
min-content width, which would let these columns collapse further than the
layout intends.

⚠️ **THE SIXTH REVERSED A WRITTEN DECISION, DELIBERATELY.** `.categoryName` on
the PRODUCTS hub was `overflow: hidden` + `text-overflow: ellipsis` + nowrap,
under the note "the name yields first — the window is the shorter, fixed string,
and a truncated `4+ wee` would be worse than a truncated category name." That is
still right about WHICH of the two yields; it was wrong about HOW. Under the
overrides the ellipsis cut "Long-term products" at 440 and "Recent" at 320 —
content the user cannot get back, caused by their own accessibility setting.
It wraps now. **The row still stays 56 at every design width**, which is what
the note on `.window` is actually protecting: measured, the longest name fits on
one line at 440 and 1440, so nothing wraps and the comp height is unchanged. The
row grows only at 320 — below the smallest comp — and under a user's own
overrides, which is exactly when a fixed height is the thing that must give.

After both changes the probe is clean: 18 routes x 3 widths, nothing clipped or
spilled, and no page scrolls horizontally at 320 (which is 1.4.10 measured at
the same time).

⚠️ **`CompatCard`'S NAME CAME BACK ON 16 Sep 2026, AND `break-word` COULD NOT
CLOSE IT TWICE.** The net only holds while a column is wider than one letter.
On 13 Sep the compared products took a 36 thumb with a 12 gap in front of
their names and the box's inset went from 8 to 16 a side, 64 out of the name's
width, and at 320 beside a Risky or Avoid score that left it 24 — and 11–14
under the overrides, narrower than a glyph with its 0.12em of tracking, so
three names spilled. ⚠️ **It was never only a 1.4.12 failure.**
At 24 the name read two or three letters a line with no override at all, and
in edit mode, where the ✕ takes 44 more, it was 0 wide and spilling at
baseline. The probe reports neither: it differences against the baseline, and
it never presses `Edit`. Both were measured by hand.

The fix is `SymptomLocation`'s, wrapping by basis: the name's `flex-basis` is
84, so when the thumb, the name and the score cannot share a line, the score
takes the next one, right-aligned so the figures and chevrons keep their
column. **Nothing moves at 440 or 1440**, in either mode, with or without the
overrides — checked by reverting the declarations on the same build and
diffing every box in the header. Why 84 and not 96 is on `.toggle` in
`CompatCard.module.css`.

## Every empty state is one recipe, and one screen was not using it

⚠️ **The recipe was already there and already documented** — `ProgressScreen`
calls it "the standing exception every LUX empty state has": `HubScreen` with
`layout="plain"` and `center`, holding orb → 32 → `t-h4-h3` title → 12 → body →
32 → primary action, centred, on bare gradient with no card at either
breakpoint. `/progress/empty`, `/check/no-profile` and `My Products — empty` all
draw it.

⚠️ **`/investigation/profile`'s empty state was not, until 8 Sep 2026.** It had
the heading, two short paragraphs and the button in `HubScreen`'s footer. The
footer solved the right problem the wrong way: `margin-top: auto` exists to stop
an action being stranded in the upper third, and it does — by pinning it to the
bottom, which on a 957 viewport left roughly 1000px of bare canvas between the
paragraphs and the button. `center` closes that by centring the whole block
instead of pushing its two halves to opposite edges.

⚠️ **`center` WITH `layout="card"` DOES NOT WORK, AND IT WAS TRIED THE SAME DAY
ON `/investigation/analysis`.** The card layout renders the page heading INSIDE
`.body`, so centring the block centres the title with it — "Analysis" floated to
mid-screen above its own card, which is worse than the void it was meant to fix.
Every working `center` caller pairs it with `layout="plain"`, where the heading
sits outside the body and stays at the top. Reverted, and written up in
`Analysis.tsx`. **If a `card` screen ever needs centring, `HubScreen` has to
hoist the heading out of the centred region first** — that is a shared-component
change and it currently has exactly one would-be caller.

⚠️ **THE RECIPE IS NOT A COMPONENT, DELIBERATELY.** Four screens is past the
usual "two sections and it moves to `components/`" bar. Each differs in what
goes in the block, and the recipe is four spacing values — lifting it would
trade four numbers for a component with four configurations. If a fifth appears,
lift it then.

⚠️ **A PUSHED VIEW KEEPS ITS BACK CHEVRON.** The profile recap has one; the
other three are hub landings with nothing behind them and correctly have none.
The recipe does not touch that rule.

## Things the design system does not have, faked here

Each of these is composed from tokens in Figma too, so the code is not inventing
a treatment — but there is no component to keep them in sync, and that is the
risk. All are on the missing-from-the-DS list.

| Need               | Here                                                 | Note                                                                                                                                                                                                                                                                                                                                                                              |
| ------------------ | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Date picker        | `components/ui/DateField.tsx`                           | `<input type="date">`'s popup is drawn by the browser and **cannot be styled** — no token or class reaches inside it. It rendered as a stock white Chrome calendar mid-flow. The DS has no calendar component either, so this is composed from tokens.                                                                                                                            |
| Text input         | `components/ui/TextField.tsx`                           | `Search Field` (248:70) exists but is search-specific. `other-input` on 02c/03a and the 03c date field are all hand-composed in Figma.                                                                                                                                                                                                                                            |
| Face-region picker | `features/my-skin/components/FaceDiagram.tsx`                         | The region coordinates ARE the design — "Cheeks (L)" only means the left cheek because of where it sits. Stored as % of the 392x300 card so it scales. ⚠️ The region chips are `bg/frost-light` (OPAQUE) as of 22 Aug 2026: they sit ON a frost-light card, so at 55% it was the same fill over the same fill and the pill had almost no edge. Selected stays `bg/brand` + white. |
| Camera shutter     | `components/ui/CameraCapture.tsx`, plus `features/my-skin/components/SelfieSheet.module.css` | No shutter component in the DS, and there are now THREE capture surfaces: the selfie tray, the products scan view and the check-in's photo overlay. `SelfieCapture` carried the note "if a second capture surface ever appears, make it a real component first" — a third did, so `CameraCapture` is that component (viewfinder + guide + captured label + copy + shutter) and the scan view and the check-in both use it. ⚠️ **`SelfieSheet` DELIBERATELY DOES NOT.** 487:834 / 490:1041 give it its own geometry — a 392x400 / 420x340 viewfinder against `CameraCapture`'s 392x300, a PORTRAIT oval against a landscape rectangle, a 72 shutter against 64, and the helper BELOW the shutter rather than above. Those are its frame's measurements, not drift; folding it in would move them. **Raise a real Camera / Shutter component in Figma**, then migrate all three at once. Every viewfinder is a placeholder, not `getUserMedia` — wiring a real camera would make the prototype demand a permission just to walk the flow.                                                                                                                                                                                                            |
| Modal tray         | `components/ui/Sheet.tsx`                               | `Bottom Sheet` (255:91) has no background blur and a fixed light content slot, so every tray in the file is hand-composed from the recipe. There is also **no scrim token** — `state/pressed-overlay` at 14% is the only darkening value LUX has and it is weak for a modal. ⚠️ **IT PORTALS TO `document.body`, AND IT HAS TO.** `position: fixed` is viewport-relative only while no ancestor establishes a containing block, and `backdrop-filter` does that exactly like `transform` does. Every tray opens from inside `QuestionScreen`'s frosted card (`blur(32px)`), so the desktop dialog was centred in THAT CARD: measured at 1238x875 the tray's top edge sat at y = −41 with its heading off the top of the screen, and the scrim covered the card instead of the page.                                                                                                      |
| Accordion          | `features/products/components/ProductAccordionCard.tsx`, `ProductList.tsx`'s `details` row | No accordion component. Composed from the frosted card recipe. It was `BucketProductsList` on the deleted `/products/[bucket]` route; the cards moved into the hub rows unchanged. `ProductRow` learned the same move for `/check/new` rather than a second disclosure treatment appearing; both open onto `ProductDetails`.                                                                                                                                                                                                                                                                                                                    |
| Search dropdown    | `features/products/components/AddProductMethodSheet.module.css` `.dropdown`        | `Search Field` (248:70) has no results popup, and the comps drew results as free-standing `ProductRow` cards on a routed screen. One frosted panel tucked 8 under the pill and inset 8 either side, capped at 296 with its own scroll. ⚠️ IN FLOW, NOT ABSOLUTE — the mobile tray is docked to the bottom edge and hugs its content, so an overlaid panel would open off the bottom of the viewport. |
| `My skin` nav icon | `MySkinIcon` in `components/ui/icons.tsx`               | The nav's fourth glyph. `Bottom-Nav-Bar` (410:258) ships three icons and the DS has no face or skin mark anywhere else — `FaceDiagram` is a picker, not an icon. ⚠️ STROKE-drawn, unlike its three filled neighbours: a solid disc at 24 is a far heavier mark than Progress/Check/Products draw, and the face only reads at that size with the eyes and mouth left open. currentColor throughout, so the active/inactive opacity treatment is untouched. Replace it in the DS first, not here. |
| Skin-profile tiles | `features/check/components/SkinProfileTiles.tsx`        | ⚠️ **NOT IN FIGMA** — asked for directly 14 Sep 2026, under the untouched skin-profile strip on `/check`: the overline, then skin type, tendencies, known conditions and symptoms state as four flat tiles (label over value, left-aligned), two a row at every width, under a white hairline brightest at the left and fading out toward the right. It replaced a same-day plan card (star, "Monthly", plan copy), and its glass has been tuned by hand twice: now a deep teal `#005461` @71% with white ink, 4.27–5.27:1 on the card (the overline dips under AA only over the canvas's two lightest stops) and 4.80:1 or better in a tile. The column's width at every breakpoint — it was 140% on desktop for a while. The tiles' backdrop blur came off — the card's own `backdrop-filter` made it invisible anyway. ⚠️ The `/check` values are literals and contradict the seeded strip; wire them to `skinProfile()` if the trial stays. |
| Product imagery    | `features/products/components/ProductArt.tsx`                          | ⚠️ **THE CAMERA GLYPH IS GONE — DECIDED HERE, NOT IN FIGMA.** No product or bottle icon exists outside the bottom nav, so every thumb (`ProductThumb`, 48) and image well (`ProductCard`, 352x140) drew a camera. That reads as "no photo yet" once and as nothing at all down a list — `/check/new`, the PRODUCTS hub and the add tray all show the same mark on every row, so the thumbnail identifies nothing. `ProductArt` draws the vessel instead: **nine** silhouettes (tub, pump, tube, dropper, bottle, airless, spray, sachet, tin) by packaging type, tinted per brand, so same brand → same tint and same type → same shape. ⚠️ **IT WAS FIVE FORMS AND ONE FALLBACK TINT, WHICH WAS ENOUGH ONLY WHILE THE CATALOGUE WAS THE SEARCH.** Both searches are live now, so the list is whatever the database holds — masks, mists, sticks, ointments — and every one of them fell through `formFor`'s default to the same pump on a `sage` body. A column of identical pumps is the camera glyph with an extra step. Three axes of variety, all keyed on a stable FNV-1a `hash` (never `Math.random()` or an index — a thumbnail that changes identity between two screens is worse than one that repeats): unnamed brands hash into a 7-tint `RING`, unrecognised names hash across all nine `FORMS`, and `labelVariant` picks one of three label treatments off the product id so two products of the same form AND brand still differ. Brand strings are diacritic-folded before hashing, because OBF files the same house as both "Avene" and "Avène". ⚠️ **AND IT IS THE ONLY PICTURE — THE API'S PHOTOS ARE NOT READ.** Open Beauty Facts carries `image_front_url` and it used to win over the drawing. Its images are crowdsourced with no quality gate, so a result list mixed usable front-of-package shots with stubs, angled boxes and rows that fell back to a drawing anyway — two kinds of picture in one column, which is worse at telling rows apart than either alone. `features/products/openBeautyFacts.ts` no longer requests the image fields, `CatalogProduct` has no `imageUrl`, and `useProductPhoto` is deleted; `artFor` serves live results via `formFor`/`paletteFor`. **The API still supplies every WORD** — name, brand, size and the INCI list. The pigments are LOCAL LITERALS drawn from the LUX family and must not become tokens — `02 Color` has no "bottle glass" role, and binding a lid to `bg/brand` would move the artwork every time the brand colour did. **Raise a real illustration set in Figma.** |
| Check-in photo     | `features/progress/components/CheckInPhotoArt.tsx`                     | ⚠️ **NOT IN FIGMA.** `Check-in detail` draws its photo wells as a camera glyph, the same hole `ProductThumb` had and the same failure: the PHOTOS card's entire content is the picture, so a camera icon there says "no photo" on the record of one the user took. Drawn instead — a soft crop of skin with the flushed patch the investigation is about, `slice`-cropped to fill the well the way a photograph would be, grained with `feTurbulence` because three overlapping gradients in a picture frame read as a loading state. **No feature is drawn and it is not anyone's face.** Tone and blush position are keyed on the DAY with the same FNV-1a hash `ProductArt` uses, never `Math.random()`. Pigments are LOCAL LITERALS — `02 Color` has no skin-tone role and should not grow one for a placeholder. Every capture surface in LUX is a placeholder; this is the record of one. **Raise real imagery in Figma.** |
| Opaque sage        | `components/ui/Sheet.module.css`                                   | `surface/data-strong` is 62% and has no solid counterpart the way `bg/nav` is `surface/frost-nav`'s. The `prefers-reduced-transparency` tray composites the same sage over `bg/canvas`. ⚠️ **Worse since 8 Sep 2026:** `surface/data-deep` `#4f838f @85%` is the new third step and four surfaces put WHITE on it, so its contrast is a composite that moves with whatever is behind it (3.42–3.77:1). An opaque counterpart would make the ratio a property of the token rather than of the scroll position. |
| Data card          | `components/ui/DataCard.tsx`                            | The whole of SURFACE SYSTEM B. `surface/data` + `surface/frosted-data` + `radius/2xl` + 20/24 padding, **no stroke**. Not a component in Figma — every PROGRESS and CHECK card is composed from those tokens. Its `prefers-reduced-transparency` fallback composites the same sage over `bg/canvas`, exactly as `Sheet` does.                                                       |
| Calendar (record)  | `features/progress/components/CheckInCalendar.tsx`                     | On the handoff's own missing list. ⚠️ THE SECOND CALENDAR IN THE APP AND NOT THE SAME ONE — `DateField` is a Monday-first interactive date PICKER, this is a Sunday-first read-only RECORD, and both match their frames. Do not merge them; raise the week-start split in Figma instead.                                                                                            |
| Line chart         | `features/progress/components/SymptomTrend.tsx`                        | On the handoff's missing list. Drawn from the data, NOT from the comp's baked vector — the series is the card's whole content. `preserveAspectRatio="none"` + `vector-effect` for the line; the dots are positioned elements so they stay round (the desktop comp exports its "circles" at 13.33 x 8).                                                                              |
| Skin-profile strip | `features/check/components/SkinProfileStrip.tsx`                    | The one sage element on a CHECK screen. Same System B recipe as `DataCard` but an 86-tall strip with 18/20 padding — a separate component rather than a size prop that would mean nothing.                                                                                                                                                                                         |
| Compat accordion   | `features/check/components/CompatCard.tsx`                          | The SECOND accordion in the app; `ProductAccordionCard` is the other, on a different surface with a different header and no band. Neither exists in the DS. The band drives pill, score and bar fill through one `--band` custom property so they cannot drift.                                                                                                                       |
| Undo snackbar      | `components/layout/Snackbar.tsx`                     | ⚠️ **NOT IN FIGMA AT ALL** — no toast, no snackbar, no transient message anywhere in the file. The one trace of the idea is `--z-toast` (500), reserved in the token scale and unused until 8 Sep 2026, which is why the component takes that layer rather than inventing one. Drawn as the NAV's own frosted pill — same fill, rim, shadow, blur and reduced-transparency fallback — because the app has exactly one recipe for a thing that floats over a screen and a second one for a message that lives six seconds would be drift. It departs on two values only, both content-driven: no fixed height (a name can take two lines, and more under a user's text-spacing overrides) and `radius/2xl` rather than `full`, since `full` on a two-line bar draws 26px lozenge ends that crowd the first and last words. **Raise a real Snackbar in Figma**, with the message/action split and the pause-on-hover behaviour recorded. |
| Status pill        | `features/check/components/CompatCard.module.css`, `features/check/components/CheckHistory.module.css`   | Not `Tag` — Tag is Neutral/Brand only and these carry the feedback colours. ⚠️ `feedback/warning` and `feedback/error` share a hue and differ only in lightness, so the pill TEXT is what separates Risky from Avoid. Every row states its band in an aria-label, including the compatible ones that draw no pill at all.                                                            |


---

## PERSISTENCE — the store is SPLIT, and only completed records are written

**6 Sep 2026.** Everything the user did lived in RAM and died on refresh. That
was deliberate for a prototype and it is recorded as a rule in `AGENTS.md`:

> ⚠️ **DO NOT PERSIST THE ANSWER STORE.** localStorage made every visit open
> with the previous visit's selections still ticked — which reads exactly like
> the screens shipping pre-filled.

That rule was right about what it saw and **it still stands for every control.**
What it got wrong is the scope: it forbade *persistence*, when the thing that
actually caused the bug was persisting **one bucket that mixed two kinds of
state**. The old build wrote the whole of `Answers` and read the whole of it
back, so a revisit restored `conditions`, `skin-type` and `start` — the flow
opened with chips ticked and looked pre-filled.

### The seam already existed, one paragraph up

`AGENTS.md` draws exactly the line that resolves this, and draws it for a
different purpose:

> ⚠️ **THIS IS ABOUT CONTROLS, NOT READOUTS.** `/progress` and `/check`
> deliberately open populated — they have nothing to select, and an empty
> readout shows nothing.

Persistence follows the SAME line. A restored **control** is the bug. A restored
**record** is the populated readout those two screens are specified to show.

| Never persisted — restoring these *is* the bug | Persisted — completed work, rendered as readouts |
| --- | --- |
| `start` · `skin-type` · `tendencies` · `conditions` · `conditionsOther` · `location` · `timing` | `products` — the library the user built |
| `productDraft` · `checkBasket` — in-flight, half-built | `checks` — checks actually run |
| `productQuery` · `checkQuery` — search field text | `checkIns` — the daily diary |
| `selfie` · `scan` — capture sentinels | `savedFinding` — the § 09 investigation record |
| `viewingCheck` · `evidence` — view and flow state | |

⚠️ **THE SPLIT IS A TYPE, NOT A FILTER AT THE CALL SITE.** `PERSISTED_KEYS` in
`lib/store/persistence.ts` is the whole list and `PersistedAnswers` is derived
from it, so a new key has to be placed deliberately. The original bug was
invisible precisely because **nothing in the store said which keys were safe**.

### ⚠️ SUPERSEDED IN PART — the flow's answers persist for 24 hours (7 Sep 2026)

Asked for directly:

> *"can we use local storage for these profile info to be saved for a certain
> time?"*

**The left-hand column of that table is no longer all one thing.** Its first
row — `start`, `location`, `locationOther`, `selfie`, `skin-type`,
`tendencies`, `conditions`, `conditionsOther`, `timing` — is now written, under
its own key, with a **24-hour sliding window**. (⚠️ `locationOther` joined the
list on 8 Sep 2026 — step 1's typed "Other" description, which until then was
not in the store at all; see "THE TYPED `Other` HAD NOWHERE TO GO" below.
⚠️ `location` LEFT it on 14 Sep 2026, when step 1's `start` became a map of each
symptom to its places and the union became derived — see "A TYPED LOCATION NOW
COUNTS AS ONE", superseded, below.) Every other row still never touches disk at any age.

**Why that is not the reverted build coming back.** This section already argues
that the old bug was persisting *one bucket that mixed two kinds of state*. The
same argument taken one step further is that the bucket also mixed two
LIFETIMES. What made a restored control read as a pre-filled screen was never
the restoring — it was that the state belonged to **nobody**: a demo opened
three weeks later greeted a new reader with a stranger's skin type, and no
reader can tell that apart from a screen that ships filled in. Answers from the
last day are the same reader's own work, still in front of them. So the rule
sharpens rather than reverses: **state that has outlived its owner is the bug.**

| | records | flow answers | everything else |
| --- | --- | --- | --- |
| Lives | forever | 24 hours, sliding | the tab |
| Key | `lux.records.v2` | `lux.flow.v2` (v1 until 14 Sep 2026) | — |
| List | `PERSISTED_KEYS` | `FLOW_KEYS` | by construction |

**Five things that are load-bearing, beyond the three below.**

- ⚠️ **TWO KEYS, NOT ONE WIDER BLOB.** One blob with a mixed lifetime has to
  either drop the records with the answers or keep the answers with the
  records, and both are wrong. Splitting the key splits the clock.
- ⚠️ **THE PAYLOAD IS AN ENVELOPE — `{ savedAt, answers }`.** A payload with no
  numeric `savedAt` is not "answers of unknown age", it is data this build did
  not write. The reverted whole-store format is exactly that shape, so refusing
  it is what keeps `lux.investigation.v1`-era data from walking back in through
  the new key.
- ⚠️ **THE WINDOW SLIDES, MEASURED FROM THE LAST ANSWER.** A walk through the
  flow cannot time out underneath someone who is still walking it.
- ⚠️ **A FUTURE STAMP IS STALE TOO.** A clock that moved backwards — a timezone
  fix, a corrected system time — would otherwise pin the slice open forever,
  since `now - savedAt` never grows past the window.
- ⚠️ **EXPIRY IS ENFORCED ON READ, AND A STALE ENVELOPE IS DELETED.** Nothing
  sweeps storage on a schedule, so reading is the only moment the app can know
  it is past the window — and ignoring the key without removing it would leave
  one visitor's answers on the machine indefinitely.

⚠️ **`products` DID NOT MOVE.** Step 5's products are a completed record and
still persist with no expiry: `/products` is specified to open populated. The
step that collects them is the one flow step whose answer outlives the day.

**Still not resumability.** One device, one browser, no account, and now also
one day. `Save & exit` still does not resume a flow, and nothing on any screen
promises that it does.

### Three things that are load-bearing

- ⚠️ **HYDRATE IN AN EFFECT, NEVER IN THE `useState` INITIALISER.** The server
  renders with no storage, so seeding initial state from localStorage makes the
  first client render disagree with the server's HTML and React throws a
  hydration mismatch.
- ⚠️ **THE WRITE IS GATED ON `hydrated` AS STATE, NOT A REF.** Effects run in
  declaration order on mount, so a ref set in the hydrating effect already reads
  true in the writing one while `answers` is still the empty first-render
  value — and the write puts `{}` straight over the records it just read. The
  state flag defers the first write to the render AFTER hydration.
- ⚠️ **A MALFORMED ROW IS DROPPED, NEVER REPAIRED.** Everything off disk is
  shape-checked. `CheckIn[]` goes straight into `CheckInCalendar`, which indexes
  by date and throws on a bad row; half a check-in is not a record.

### ⚠️ THE COROLLARY: NO COMPONENT MAY SNAPSHOT A PROP INTO `useState`

Records arrive **one render after mount** — hydration is an effect, and it has
to be (the server renders with no storage, so reading it during render is a
hydration mismatch). Nothing can change that: `useSyncExternalStore` with a
server snapshot lands the data at the same moment. So the rule is on the
CONSUMER instead.

`CheckInCalendar` broke on exactly this, 7 Sep 2026. Its opening month was a
`useState` initialiser reading the `checkIns` prop — a snapshot, taken on the
first render, that no later value could move. In a real investigation that
first render sees an EMPTY list (no seed merges in once step 4 is answered), so
the month fell through to today's, hydration then delivered the records, and
they were off-screen in the month before. **Measured on 7 Sep with check-ins on
20–21 Aug: opened on September, should have been August, 0 of 2 visible.**

The fix is `defaultMonth(checkIns, today)` as a pure function evaluated every
render, with the user's own paging as the only state (`paged ?? default`). ⚠️
**An effect that corrects the month afterwards is NOT the fix** — it paints the
wrong month first and then jumps, and it fights the user's paging.

**Before adding `useState(() => somethingFrom(props))` in PROGRESS, CHECK or
PRODUCTS, check whether the prop is downstream of the store.** If it is, derive
it instead.

### `lux.investigation.v1` is deleted and never read

⚠️ **DO NOT REPOINT PERSISTENCE AT THE LEGACY KEY.** It holds whole-store
snapshots from the reverted build — exactly the flow selections this design
refuses to restore. The new key is `lux.records.v2`; bump the name again rather
than widening it if the shape changes.

### ⚠️ THE TYPED `Other` HAD NOWHERE TO GO — fixed 8 Sep 2026

Reported from the running prototype:

> *"when other is chosen and i typed in where, no where shows here
> /investigation/profile"*

**And the recap was not at fault.** Step 1's free-text description — the
`Other – describe in detail` field under the face diagram — was never in the
answer store. It was written to a bespoke localStorage key of its own,
`lux-start-other-description`, on the reasoning recorded in
`StartInvestigation.tsx` at the time: a free-text note has nowhere to live
without a backend, it gates nothing, and no other step reads it. The first two
were true. The third stopped being true the moment `/investigation/profile`
existed, and the cost was exact: the recap drew the lit `Other` chip and none
of the words, so the one part of that answer only the user could supply was the
one part the app forgot.

**A key nothing else can read is a value the rest of the app has to pretend was
never given.** The description is `answers.locationOther` now, beside
`conditionsOther` — step 3's typed condition, which has had this shape all
along and which the recap has always been able to read. It joins `FLOW_KEYS`,
so it lives and expires exactly as the answers around it do (24 hours,
sliding), and the old key is deleted unread on mount next to
`lux.investigation.v1` — a typed sentence left in a visitor's browser with
nothing to read it is the same dead data that sweep exists for.

⚠️ **SUPERSEDED 14 Sep 2026 — READ THIS PARAGRAPH AND THE NEXT AS HISTORY.**
Step 1 now asks for places one symptom at a time and stores each symptom with
its places (`start`, a map; `location` is gone), so its `isComplete` is "a
symptom exists" and a typed description no longer unlocks Continue on its own:
a place with no pill is that symptom's `Other` chip. The field is still
independent of the chip, and an `Other` place with no words is still complete.
See `flow.ts` and `StartInvestigation.tsx`.

⚠️ **AND A TYPED LOCATION NOW COUNTS AS ONE.** `isComplete` for step 1 asked
for a symptom and a location CHIP, which was right while the field asked what
was happening and wrong the moment it asked where: someone who typed
"behind my left ear" and tapped nothing on the face was looking at a dead
Continue with nothing on screen saying why. It reads
`(a.location?.length ?? 0) > 0 || Boolean(a.locationOther?.trim())` now.

⚠️ **IT ONLY EVER UNLOCKS, AND IT IS NOT STEP 3's RULE IN REVERSE.** There,
`otherIsFilled` REQUIRES the text once "Other" is ticked — correct, because the
row and its field are one always-visible unit. Here the chip and the field are
independent controls and the field is collapsed behind a button, so requiring
the text would dead-end someone with no visible cause; the fix for that would be
opening the field from the chip, which is a different decision and has not been
taken. The recap likewise renders the location block if EITHER exists.

⚠️ **AND THE FIELD'S REVEALED STATE IS DERIVED, NOT STORED.** It used to hydrate
itself from localStorage in an effect of its own. The store hydrates in an
effect too, so a saved description now arrives one render after the first —
`otherOpen || otherText.length > 0` opens the field the moment the answer
exists, rather than a second piece of state needing to be kept in step with the
first.

⚠️ **THE DIAGRAM SHRINKS AND THE WORDS TAKE THE SPACE** — asked for directly,
in as many words: *"the face diagram should shrink in size and give space for
the typed in text to be displayed"*. 392 is the width the face card is drawn at
and is right while the diagram is the block's only content; with a typed answer
it is one of two things in the block, so it drops to **300** and the two sit in
a wrapping flex row.

⚠️ **THE FIRST BUILD SHRANK THE PICTURE AND PUT THE SENTENCE UNDER IT, AND THAT
IS NOT WHAT THE ASK SAID.** It freed the space and left it empty — the same
block, only smaller. The row spends it: `300 + 16 + 190` needs 506 of content
box, so on the desktop card's ~776 the answer reads across (picture, then the
part of the answer the picture could not draw) and at 440, where the block has
~352, the note wraps under a 300-wide diagram. **No media query** — it wraps on
the content, which is the only thing that knows.

⚠️ **300 IS A FLOOR, NOT A PREFERENCE.** The diagram positions its region pills
as percentages of the box and sets their labels at a fixed 14, so below a
certain width the pills stop scaling and start covering each other. Measured on
the middle row: `Cheeks (L)` / `Nose` / `Cheeks (R)` overlap by 7 and 6 px — the
overlap the picture is DRAWN with — at every width from 300 to 392, and by 11
and 10 at 280, where the selected pill covers the label beside it. A 250 build
was made and reverted for exactly that. Narrower needs responsive labels in
`FaceDiagram` first.

The note itself is the screen's existing label-over-value pair
(`Other, in your words`), not a caption: a caption describes the picture above
it, and this describes the answer the picture could not draw.

⚠️ **AND THE COPY NOW ASKS ABOUT A PLACE — settled the same day, asked for
directly.** The field read `Other – describe in detail` over the placeholder
`Describe what's happening`, which is a symptom question sitting between the
location chips and the camera, whose answer the recap reads back under
`Where you noticed it`. The placeholder was the odd one out and it predates this
screen: 01 (Start investigation) and 03b (Location) were separate Figma frames,
and the field came from the half that asked what was happening. It is
`Other, describe where` over `Describe where you noticed it` now — the question
the chip beside it is an answer to — and the accessible name is the long form,
`Other, describe where you noticed it`, since the button's text is gone once the
field is open.

⚠️ **THE DASH WENT WITH IT.** `Other – describe in detail` held the app's last
prose en dash: the em-dash sweep of 7 Sep 2026 traded them for commas in every
line the app says, and the remaining `–`s are all numeric ranges (`1–4 weeks`),
which is what an en dash is for. The recap's own label uses the same comma —
`Other, in your words`.

⚠️ **FIGMA STILL HAS NEITHER FRAME.** This screen is already a prototype-only
merge of 01 and 03b (see `StartInvestigation.tsx`), so the copy change rides
along with the merge in `docs/figma-catchup.md` rather than being a new gap.

### What this does NOT do

⚠️ **THIS IS NOT RESUMABILITY, AND IT MUST NOT BE DESCRIBED AS ANY.** One
device, one browser, no account. `Save & exit` still does not resume a flow —
it never could, since the flow answers are the half that stays in memory by
design. A deep link to `/progress/check-in/[date]` still has no data behind it
for anyone but the original visitor, and photos are still the string
`"captured"` because images need real storage.

The audit at `#storage` is right that the product needs a backend and auth; this
closes the *durability* half of that seam on one device and no more. **Do not
add a "resume your investigation" affordance on the strength of it.**

---

# Evidence behind the non-negotiables

`AGENTS.md` states these as one-line rules. The measurements and the
failures that produced them are here.

## The nav fill, and why frosted is not see-through

7a. ⚠️ **The nav is `surface/frost-nav` `#dde8eb @83%` — NOT 17%.** It used to be
17%, which is barely a tint: the Continue button and the last option rows read
straight through the bar. Frosted does not mean see-through. The
`prefers-reduced-transparency` fallback is `bg/nav`, now the SAME colour fully
opaque (`#dde8eb`) — it used to be `#9caeaf @55%`, a different hue _and_ still
translucent, which is not a fallback at all.

### ⚠️ SUPERSEDED 4 Sep 2026 — the nav is now `#dbeded7a`, i.e. 47.8%

**This decision was reversed deliberately, and `AGENTS.md` non-negotiable 7 has
not caught up — it still says 88%.** Do not "fix" the code back to it.

Two separate things changed. The fill went to `#dbeded7a`, and the bevel was
rebuilt: the shipped `inset 0 0 12px rgba(0,0,0,0.2)` darkened all four edges at
once, which is not how light works, so it read as a vignette and the pill sat
flat. It is now `border/highlight` along the top rim, `text/primary @12%` along
the lower lip, a `border/glass` stroke, two drop shadows instead of one, and
`saturate(160%)` on the backdrop-filter. Both live on `:root` in `globals.css`.

The 17% failure above still stands — the objection was never "transparency", it
was that at 17% the Continue button read straight through the bar. 47.8% keeps
the labels legible over everything the app actually puts under them BUT ONE.

**Measured**, compositing by hand and sampling the 165° gradient at the nav's
own position (88.8% along it, `#b4cbd1`), against the 4.5:1 the 12px/500 labels
need:

| Backdrop under the nav | at 0.478 | was 0.90 |
| --- | --- | --- |
| bare canvas | 9.62:1 | 11.07:1 |
| `bg/bubble-ai` | 11.42:1 | 11.42:1 |
| `surface/data` card | 8.79:1 | 10.89:1 |
| chart bar, `bg/brand @75%` on card | 5.04:1 | 9.97:1 |
| **solid `bg/brand` — a selected Chip** | **4.09:1** | 9.67:1 |

⚠️ **The last row fails, and it is not theoretical.** Selected chips are solid
`bg/brand`, and investigation steps 1 and 3 are full of them — the two screens
that already outgrow the viewport, so they scroll under the pill. That 4.09:1 is
the UN-BLURRED worst case: `blur(28px)` averages a ~36px chip with the light
canvas around it and the real figure is higher. **How much higher has not been
measured** — it needs a browser. If it has to pass outright without giving up
the transparency, raise `--blur-card`; more blur mixes more light canvas into
whatever dark element passes underneath.

⚠️ **`SearchField` moved with it, on purpose.** Both bind `surface/frost-nav`,
which non-negotiable 7 pairs as one frosted-pill surface, and both are on screen
together on `/products`. At the old 0.878 → 0.90 step the pairing was academic;
at 0.478 it is visible, and letting them drift would read as a bug. A denser
search field needs its own token, not a local override.
6. **Chat bubbles carry an asymmetric tail corner, and NO border.** Three corners
at `--radius-bubble` (30), the sender-side corner at `--radius-bubble-tail`
(1). AI = tail top-left, sits left. User = tail top-right, sits right. Four

## The nav's offset from the bottom, and why it is one token

### ⚠️ 4 Sep 2026 — the nav sits **5** from the bottom, not 24

`AGENTS.md` non-negotiable 6 said 24 from the first screen and now says
`--nav-inset-bottom`. Asked for directly; no measurement produced it, and there
is none to defend it with. It is recorded here because the number is off the
spacing scale — the scale runs `xs` 4, `sm` 8, with nothing between — so it is a
literal on `:root` in `globals.css`, the app's second hand-authored spacing
value after `--content-top`'s tight-top variant.

**The reason it is a token is that the 24 was never in one place.** It appeared
verbatim at six sites, and only the first of them is the nav:

| Site | What it computes |
| --- | --- |
| `BottomNav.module.css` | the nav's own `bottom` |
| `.screen` (mobile) | `inset + 75 + 16` of bottom padding |
| `.screen[data-layout="flow"\|"hub"]` | the same reservation |
| `.screen[data-layout="hub"]` desktop, and its `max-height: 860px` variant | `inset + 75 + 40` |
| `:focus` scroll-margin-bottom | keeps a focused control off the pill |
| `Sheet` desktop `max-height` | the guard that makes a tall tray scroll |
| `CheckBasket` `.bar` | floats 12 above the nav |

Move the nav alone and the other six keep reserving room for where it used to
be: 19px of empty space under every screen, invisible on a comp and obvious in
the flow steps that already run out of viewport. Hence one name.

⚠️ **THIS PROBABLY EASES THE KNOWN-OPEN `Continue` COLLISION, AND THAT IS NOT
CONFIRMED.** The measurement in `.design/whole-app/DESIGN_REVIEW.md` is at 440:
step 1's CTA bottom at 852 against the nav's top edge at 858. The CTA is placed
by content flow and `padding-bottom` only reserves space BELOW it, so the CTA
should not move while the nav's top edge goes to 877 — which would clear step 1
at rest and still leave step 2 (`cta=1033`) off-screen. **Arithmetic, not a
measurement.** Re-measure in the browser before striking the item; the docked
action bar it actually wants is still a Figma decision.

⚠️ **The nav also got 19px closer to the edge of the screen**, which is where a
phone's home indicator lives. Nothing in the app reads `env(safe-area-inset-*)`
today. At 24 that was comfortable; at 5 the pill's lower lip is inside the
indicator's territory on an iPhone, and the bevel's whole point is that the
lower lip is visible. Raise it if the offset stays.

## Opaque bubbles

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

## Gradient + border

8c. ⚠️ **A GRADIENT + A BORDER NEEDS `background-origin: border-box`.**
`background-origin` defaults to `padding-box` while `background-clip` defaults
to `border-box`, so a gradient is **sized to the padding box but painted into
the border box**. Add a border and the outermost 1px of every edge has no
gradient on it — the drop shadow shows through as a thin dark notch at the
widest point of each rounded end. It is subtle, and it looks like a rendering
glitch rather than a CSS mistake. Only background IMAGES are affected; a flat
`background-color` is not, which is why the frosted rows never showed it.


## The focus ring

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

## Figma padding minus the border

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

## Desktop option rows, desktop bubbles, page titles

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


## Icon sizing

17. ⚠️ **AN ICON'S SIZE IS A CSS DEFAULT, NOT AN INLINE STYLE — NEVER PUT
    `width`/`height` BACK IN `icons.tsx`.** Every glyph used to write
    `var(--size-icon-md)` into its own `style` object, and an inline style beats
    an external stylesheet rule at EVERY specificity, so a module class asking
    for a different size did nothing. It failed silently — the rule sat right
    there in the file looking correct — which is why **eleven** such rules
    survived across nine components, all rendering 24. Among them
    `ProductDetails`'s nested `inciChevron`, whose entire job per the PRODUCTS
    section above is to be `icon-xs` against the header's `icon-sm`: measured at
    24 against 24, i.e. the distinction was not drawing at all. Three more files
    had hit the wall and reached for `!important`.

    The default now lives in `globals.css` as `:where(svg[data-lux-icon])`.
    **`:where()` is load-bearing** — a bare `svg[data-lux-icon]` is (0,1,1) and
    would beat the single class it is meant to yield to, swapping one trap for
    another. At zero specificity any class wins on its own, so no icon size
    needs `!important` and none has it. An icon whose default is not `md` sets
    `--icon-size` inline; that is a custom property feeding the rule, not a
    `width` outranking it, so a class still overrides it.

    Measured before and after over seven routes in headless Chrome: eight icon
    instances moved to the size their own CSS had been asking for all along
    (six chevrons and an `editIcon` 24→20, `inciChevron` 24→16), and nothing
    that was already correct moved. `CheckBasket`'s `.barChevron` declares `md`,
    so it was a no-op rule that now applies to the same 24.


---

# THE ANALYSIS — the culprit finder, built 5 Sep 2026

⚠️ **THIS SECTION USED TO BE HEADED "Not built".** It is built now:
`features/my-skin/analysis.ts` plus `/investigation/{evidence,analyzing,
findings}`. What follows is the record of WHAT WAS DECIDED, because most of it
is the kind of decision a later comp or a later ticket will quietly contradict.
The spec is `docs/product-brief.md` §§ 05–12.

⚠️ **AND BOTH THESES ARE NOW SHIPPED, ON PURPOSE.** The project pivoted on 7 Aug
from "the thirty seconds before you buy" to "the culprit finder" (see "Why the
product is shaped like this", below). CHECK is the earlier thesis and it STAYS —
decided 5 Sep 2026: they answer different questions in opposite directions and
neither subsumes the other. Do not merge them.

## The shape: ONE route, not seven screens, and not a sixth step

The brief's §§ 05–12 are seven screens. They ship as one, plus PROGRESS:

| Brief | Where |
| --- | --- |
| 05 Evidence preparation | inline on the analysis — a strip, only when ambiguous |
| 06 Analysis in progress | the first ~2.5s of `/investigation/analysis` |
| 07 Result · 08 Reasoning · 11 No-conclusion | `/investigation/analysis` |
| 09 Calendar · 10 Next action · 12 Follow-up | PROGRESS — **no new screens** |

⚠️ **IT WAS THREE ROUTES FOR ONE DAY, AND THAT IS THE MOST USEFUL THING IN THIS
SECTION.** `evidence` → `analyzing` → `findings` shipped on 5 Sep 2026 and was
collapsed on 6 Sep. The feedback, verbatim: *"as a user its more steps added and
too much reading required."* Both halves were true and both were self-inflicted:

- **`/investigation/evidence` is deleted.** Its confirmation question is an
  inline strip on the analysis (and is usually absent, because the timeline is
  usually unambiguous). Its cleanser prompt is one line at the bottom. Its
  read-only "here is what I worked out" summary — three groups listing every
  product under its evidence state — is **gone**, and it was the clearest single
  example of the reading problem: it restated the timeline the user had just
  typed in, in the app's own vocabulary, before saying anything useful.
- **`/investigation/analyzing` is a STATE, not a route.** Six named passes for
  2.3 seconds at the top of the analysis, then the result replaces it. It runs
  once per arrival and does NOT re-run when the user answers the inline strip.

⚠️ **DO NOT RE-EXPAND IT INTO A WIZARD.** Every screen this feature adds is a
screen between someone and the answer they came for.

⚠️ **IT IS NOT AN INVESTIGATION STEP.** No progress track, no `Save & exit`,
back chevron kept — a pushed view, the standing `/check/results` has to
`/check/new`. `TOTAL_STEPS` is still 5 and `STEPS` is untouched. It sits under
`/investigation` because it REPORTS on what the five steps COLLECTED. Step 5's
`next` points at it; it pointed at `/products` with a note saying "the real
destination once INVESTIGATION lands".

⚠️ **§§ 09/10/12 ADDED NO SCREENS AND SHOULD NOT.** PROGRESS already owns the
investigation calendar, the day-by-day series and the check-in; building a
second calendar for the analysis would give the demo two.

⚠️ **IT IS CALLED "ANALYSIS", AND THAT IS THE ONLY WORD FOR IT NOW.** It was
`findings` for a day. The app was calling one idea three things — *investigation*
(the flow), *check* (the other engine), *findings* (the result) — and a user
reading the nav has no way to know those are three names and not three features.
"Analysis" is the word the product actually means. See "The naming, and whether
CHECK should merge into it" below, which is a decision still open.

## One route, three outcomes — and one of them is a refusal

§ 07's three outcomes are three states of ONE screen, not three destinations.
Sending "not enough evidence" to its own URL would make it an error page; it is
an answer, and it was **built first** — Open Beauty Facts ingredient coverage is
patchy and the gates are strict, so it is the state most real runs land in.
Built last it would have been built worst.

⚠️ **THERE ARE TWO GATES. THERE WERE FIVE, AND THAT WAS WRONG.** The first build
refused to analyse without a cleanser, a sunscreen, two tolerated products
carrying ingredient lists, and ingredient data on the majority. The result was a
screen that lectured the user about what they had not typed in before it would
tell them anything — and, worse, an app deciding that someone's routine was
incomplete because they do not use a sunscreen. That is not its call.

What stops it now: **no flare date** (nothing to compare against), and
**nothing new plus nothing readable** (no suspect at all, or no ingredients
anywhere). Everything else lowers the CONFIDENCE, which the screen already has a
word for — a comparison with no tolerated history to subtract from comes out
`weak` and says so, instead of refusing.

⚠️ **DO NOT PUT THE COMPLETENESS GATES BACK.** Specifically: a missing cleanser
or sunscreen is a REMINDER at the bottom of the result (`forgottenRoles`), never
a requirement, and there is no longer any answer key for "I don't use one"
because there is nothing for it to unlock.

`MIN_CHECK_PRODUCTS = 2` is still the wrong shape for a causal question, and the
constant `MIN_TOLERATED` is still 2 — it just caps confidence now rather than
blocking. From the case-study spine: *"the interface has to be willing to say I
don't know yet, add three more."* It still is; it just does not say it as often.

⚠️ **AND `Findings` DOES NOT GIVE EVERY CANDIDATE A CARD.** A real routine
produces four or five weak candidates; carding each one buries the leading
hypothesis under things the analysis has already said it cannot support. Only
the top confidence band gets cards (`splitHypotheses`); the rest are listed by
name and label. Nothing is hidden and nothing is dressed up.

## ⚠️ OPEN — the naming, and whether CHECK should merge into the analysis

Raised 6 Sep 2026, by the person who owns the product, on seeing it built:

> *"i also want to understand if this is necessary separate feature from the
> check feature. i do not really think so. analysis, check and investigation
> should be one thing. maybe only the term analysis should be used."*

**They are right about the naming and half right about the feature.** Written
down here because it is a real decision and it is not made yet.

### Where they are right

The app calls one idea three things. *Investigation* is the five-step flow,
*Check* is a nav tab, and the result screen was called *Findings* until this
change. A user reading the bottom nav has no way to know those are three names
for one activity — LUX looking at your products and telling you something —
rather than three separate features. Nothing about the two engines requires
three vocabularies. **The word is "analysis"**, and as of this change the
retrospective side uses it everywhere: the route, the title, the screen.

### What has already moved (6 Sep 2026)

Three steps taken toward the merge, all small and all reversible:

- **The CHECK section is called Analysis to the user.** The nav item, the
  landing, its CTA, the builder, the analysing screen, the results and the
  history all say *analysis* now. ⚠️ **THE `check` ID DID NOT CHANGE** — it keys
  the route map, the `NavSection` type and every screen's `nav=` prop, and
  renaming it would touch a dozen files to change a word nobody sees. The label
  is the word the user reads; the id is plumbing. ⚠️ **The ROUTES are still
  `/check/*`** for the same reason, which means the URL and the title disagree
  until the merge is decided — noted here rather than fixed, because moving the
  routes is the merge, not a rename.

- **Step 4 continues to `/check/new`, not to `/investigation/products`.** Those
  two screens were doing the same job — search a catalogue, build a list of your
  products — in two sections with two vocabularies, which is this problem in its
  most concrete form. Step 5 is untouched, still 5/5 and still reachable from
  the Products tab; it is just no longer the only way through.
  ⚠️ **The back chevron on `/check/new` follows where you came from**, keyed off
  `timing.date` — only step 4 sets it, so its presence IS "part-way through an
  investigation", and no query param or new state was needed.
  ⚠️ **AND IT IS NOT FINISHED.** `/check/new` collects PRODUCTS, not DURATIONS,
  and the duration is the entire mechanism of the analysis — `bucketFor` turns
  it into a group and `deriveEvidence` compares that against the flare date. A
  basket built there has no timeline, so the analysis can only refuse. The
  builder needs the duration question before this hand-off is whole.

  ⚠️ **SUPERSEDED 7 Sep 2026 — STEP 4 CONTINUES TO `/investigation/profile`, AND
  THAT SCREEN CONTINUES TO STEP 5.** The recap of what steps 1–4 collected now
  sits between them, and its one action is `Add products`. **This is not a
  reversal of the merge**: `/check/new` is still the shared builder, still
  reachable from CHECK, and still carries the back chevron keyed off
  `timing.date` — nothing about the two-screens-one-job argument above has
  changed. What changed is that the flow no longer LEAVES the investigation to
  reach a products list, which closes the unfinished business flagged in the
  paragraph directly above: the path runs back through step 5, so the duration
  question is asked again and `deriveEvidence` has a timeline to compare against
  step 4's flare date. The builder still ought to grow a duration question — a
  basket built at `/check/new` from the CHECK side has the same hole — but the
  investigation's own path no longer depends on it.

  ⚠️ **THE RECAP IS NOT A STEP.** No progress track, no `Save & exit`, so
  `TOTAL_STEPS` is still 5 and the track still reads 4/5 on Timing and 5/5 on
  Products. It also does NOT resolve `skinProfile()` from `lib/demo.ts`: that
  helper falls back to `DEMO_PROFILE` so a readout tab never opens blank, which
  is right for PROGRESS and CHECK and wrong for a screen whose entire claim is
  "here is what you told us" — answering a deep link with the demo's skin type
  would put words in the user's mouth. It reads the raw answers and renders a
  real empty state. `features/my-skin/profile.ts` owns the derivation and every
  string on the screen; there is no Figma frame for any of it, so it is listed
  in `docs/figma-catchup.md` § 5.
- **Both analysing screens use the same pass list.** `components/ui/PassList`,
  with each section owning its own lines (`ANALYSIS_PASSES`, `CHECK_PASSES`).
  Six and five respectively, and they must NOT be reconciled: CHECK has no
  timeline and no tolerated set, so claiming those passes would be narrating
  work it does not do.

### Where the separation is real, and it is NOT about the code

The two engines take different inputs and cannot become one function:

| | CHECK | the analysis |
| --- | --- | --- |
| Question | does this suit my skin? | which of these did this to me? |
| Direction | prospective, before use | retrospective, after a reaction |
| Input | a basket + a skin profile | a flare date + a product timeline |
| Mechanism | penalties against a profile | subtraction against tolerated products |
| Output | a score per product | an argument, with a confidence word |

Force the prospective question through the retrospective engine and every
product comes back "not enough history", because there is no timeline. Force the
retrospective one through CHECK and the flare date — the entire mechanism — is
ignored. **A merge at the engine level makes both answers worse.**

### The option that gets what was actually asked for

**ONE FEATURE, TWO QUESTIONS, ONE VOCABULARY.** Rename the Check tab to
**Analysis** and give it a small landing with two entry points — *"Is this
product right for me?"* and *"What caused my reaction?"* — that both end on a
result screen of the same shape, with the same words for the same ideas. The
engines stay separate underneath, where the difference is real; the user sees
one feature, which is where the difference is not.

That also fixes a thing this section has been quietly wrong about: the analysis
currently lives under `/investigation` and lights the **`my-skin`** nav item,
because it is the end of that flow. Under the proposal it would move under the
renamed Check tab and `/investigation/analysis` would become a redirect or a
second entrance. **Not done** — it moves shipped CHECK screens and changes the
nav, which is a product decision rather than a cleanup.

### What is NOT worth doing

Merging the two result screens into one component. They share a vocabulary and
should share a shape, but `/check/results` shows five scored products and the
analysis shows one argument with its counter-evidence. One component serving
both would be a component with two modes and no opinion.

## The timeline is four coarse buckets, so there are THREE evidence states

The app has four duration buckets and one flare date, so a product's
introduction is a RANGE. The range sits inside the suspicion window
(**associated**), entirely before it (**tolerated**), or **straddles the
boundary** — which is not a tie to break. It is the honest answer, and it is
exactly the ambiguity § 05's confirmation list exists to resolve: the screen asks
about two products, never twelve. `LEAD_IN_DAYS = 14` is a named judgement, not
a measurement.

⚠️ **`Not sure` IS STILL NOT BINNED.** `INTRO_WINDOW["not-sure"]` is `null` and
such a product is excluded from both sides of the comparison and said to be. That
is the payoff for keeping the fourth bucket out of `BUCKETS` in the first place
(see the PRODUCTS section).

## Evidence AGAINST is the discarded half of the same pass

`subtract()` returns both halves. Candidates the tolerated set fails to clear are
the evidence for; the ones it clears are § 08's **evidence against** accordion —
the thing no screen in LUX had a pattern for — and they cost nothing, being the
same comparison read from the other side. **Returning only the survivors is how
a reasoning screen turns into advocacy.** The accordion sits FOURTH in the
brief's order rather than last for the same reason: counter-evidence below the
fold, after the reader has stopped scrolling, is advocacy wearing an accordion.

The cleared candidates also get their own top-level block — "Ruled out by what
you already tolerate" — because they are a fact about the whole comparison
rather than about one hypothesis, and because they are the most useful thing the
analysis produces: the ingredient someone would blame first, cleared by a
product they have used without trouble for a month.

## ⚠️ THE PERCENTAGE SPLIT — RESOLVED, AND DELIBERATELY ASYMMETRIC

The brief says **"Do not show a scientific-looking percentage."** `CompatCard`
renders `{score}%` with a bar. Decided 5 Sep 2026: **CHECK keeps its number, the
analysis shows none.** The rule is written about the HYPOTHESIS result, where a
number dresses a judgement up as a measurement — and this judgement is made from
four coarse duration buckets and an ingredient list of unknown concentration.
CHECK's score is a model output about a product, which is a different kind of
claim. `Confidence` is a WORD (stronger / possible / weak) derived from the
shape of the subtraction, including **how much tolerated evidence there was to
be absent from** — a candidate absent from an empty tolerated set has been
cleared of nothing. Counts of products are facts and are shown.

## The vocabulary moved to `lib/actives.ts`, the WEIGHTS did not

Two sections now use the ingredient names, what each does to skin, the INCI
patterns and the conflict pairs, so by the placement rule they are no longer
CHECK's. **`SCORING` stayed in `check.ts`.** Those penalties are tuned to
reproduce the five scores `Check results` draws — the right shape for a
compatibility SCORE and the wrong basis for a causal CLAIM — and the analysis
cannot reach them. `advice` stayed for the same reason: it is prospective
how-to-use copy. `hasReadableIngredients` is new and only the analysis needs it:
an empty active set means "no ingredient list" and "contains nothing of
interest" equally, which is harmless for a score and the whole game for a
subtraction.

⚠️ The analysis also uses `ACTIVES[id].name`, never `.label` — one label is
"Salicylic Acid 2%", and naming a concentration two lines above "concentration
and formulation are unknown" undoes the hedge.

## The copy lives in the data module, and `npm run vocab` enforces it

These screens add more product-effect copy than the rest of the app combined.
Every sentence is built in `analysis.ts` rather than in the components, which is
the house rule ("a screen states nothing it could compute") and also the only
way the brief's controlled vocabulary stays checkable. `scripts/vocab.mjs` greps
user-facing strings for the forbidden phrases and fails the build on a hit; it
strips comments first, so the rule can be written down where it is explained.

## What the analysis still will not do

- **It does not triage.** § 10 offers "consult a professional" as a peer of the
  other next actions, the same stance `SafetyNotice` takes on step 1.
- **Sunscreen can never be proposed for a pause** — the exclusion is in
  `pausableProducts`, in code, not in copy. Prescribed treatment cannot be
  detected (nothing asks), so the screen says to check with whoever prescribed
  it rather than pretending to know.
- **`ACTIVES[id].concern` is still hand-written and not a citable authority.**
  CosIng remains unwired — see "The ingredient data" below. Read the current
  strings as good enough for a prototype to explain itself with, not good enough
  to ship a causal claim on.

---

# The brief's original statement of the gap, kept for the reasoning

⚠️ **THIS IS THE STATE OF THINGS UP TO 5 SEP 2026, AND IT IS KEPT BECAUSE THE
REASONING STILL BINDS.** The feature is built — the section above records what
was decided. Everything below is why it needed to exist and what the brief asks
of it, which is still the authority when the next person changes it. Where the
two disagree about what EXISTS, the section above is current.

The thesis pivoted on 7 Aug — from *"the thirty seconds before you buy"* to
*"the culprit finder"* — and CHECK is the EARLIER thesis. Both ship now; see
"Why the product is shaped like this" at the end of this file.

**Source:** `docs/product-brief.md` (11 Aug 2026), § "Analysis model to
communicate through the UI" and §§ 07–08. ⚠️ **Moved into the repo 4 Sep 2026**
(was `/Users/yonz/Claude/LUX/lux_wireframe_ai_brief.md`) — it is the only copy
of the spec for the analysis AND for the safety branch below, and it was sitting
unversioned outside git, cited by nothing.

## What the brief specifies

An investigation that ends in a **hypothesis about which product caused a
reaction** — retrospective, evidence-based, hedged. Two hypothesis types:

- **A. Single-ingredient pattern** — an ingredient appears across products
  associated with the reaction and is absent, or less supported, in products
  used without problems.
- **B. Possible same-routine interaction** — two or more ingredients that may
  increase irritation when layered or used too often in the same period.
  Context-dependent possibilities, **not** universal incompatibilities.

Every hypothesis has to weigh introduction and reaction timing, frequency and
likely overlap, products used **without** problems, unknown concentration,
formulation and pH and barrier condition as limitations, the recorded skin type
and tendencies, and whether a known condition makes generic advice inappropriate.

The result screen offers exactly three outcomes — *leading hypothesis found* /
*several possible explanations remain* / *not enough evidence for a responsible
conclusion* — with a cautious confidence label (stronger / possible / weak
pattern), and five reasoning accordions: why this may be relevant, how the skin
profile was considered, possible same-routine interactions, **evidence against**,
and uncertain or excluded evidence.

## Why this is not the CHECK tab

`/check/*` is a **different question asked in the opposite direction.** CHECK is
prospective — "is this product right for my skin?" — and scores a product
against the user's profile before they use it. The brief's analysis is
retrospective — "which of the things I already use did this?" — and reasons over
a timeline. They share the word "check" and an ingredient model, and nothing
else. Building CHECK did not build this, and the CHECK section above should not
be read as covering it.

## The inputs are all collected

Every field the analysis needs is already written to `Answers` by a shipped
screen, and read by nothing that draws a conclusion:

| Input the brief needs | Where it already is | Written by |
| --- | --- | --- |
| Symptoms and their locations | `start` (each symptom with its places since 14 Sep 2026; `location` until then) | step 1 |
| Skin type and tendencies | `tendencies` | step 2 |
| Known conditions | `conditions`, `conditionsOther` | step 3 |
| **When the reaction started** | `timing` | step 4 |
| Products, each with **how long it has been used** | `products` | step 5 |
| Day-by-day severity, changes, photos | `checkIns` | the daily check-in |

`bucketFor()` sorts products by duration specifically so they can be correlated
against step 4's flare date — that is stated as the whole point of keeping
"Not sure" as its own group rather than binning it into Long term (see the
PRODUCTS section). The correlation is never run.

## ⚠️ AND THE BRIEF FORBIDS THE ONE THING CHECK DOES — SETTLED, SEE ABOVE

> **"Do not show a scientific-looking percentage."**

`CompatCard` renders `{score}%` with a bar whose fill width equals it. Resolved
5 Sep 2026 in favour of the asymmetry the two questions actually have: CHECK
keeps its number, `findings` shows none. The full reasoning is under
"THE PERCENTAGE SPLIT" above; it is recorded twice on purpose, because someone
reading CHECK's section will not necessarily read the analysis's.

The related rule from the same section is unambiguous either way, and CHECK does
respect it: *never infer an interaction from ingredient names alone without
showing uncertainty; prefer "may have increased irritation when used in the same
period" over claiming two ingredients "clashed".*

## "Enough evidence, or no answer"

From the case-study spine, and it is the constraint that makes outcome 3 above
real rather than decorative:

> With two products, almost everything is still in the running. The interface
> has to be willing to say "I don't know yet, add three more."

Worth holding against CHECK's own `MIN_CHECK_PRODUCTS = 2`. That minimum is
right for a *compatibility* check — two products is exactly when a pair
interaction becomes possible — and would be far too low a bar for a *causal*
one. The analysis needs its own threshold, and needs a designed state for
refusing to answer. The spine's note on why: refusing to answer is the hardest
thing to design and the easiest thing to admire.

**It got both** — structural gates rather than a count, and the no-conclusion
outcome built first. See "The gates are structural" above.

## How it got built — the brief on its own terms

It is not a sixth investigation step. The flow's five steps collect; this
reports on what they collected, so it belongs off `/investigation` as a result
view — the same standing `/check/results` has to `/check/new`. It would be the
first screen in the app whose content is an argument rather than a readout, and
the accordion order above is the argument's shape, including **evidence
against**, which no screen in LUX currently has a pattern for.

**Nothing in Figma covers it** — page 06 has no analysis or result frames
outside CHECK, and that is still true: the three screens were built here, under
the "prototype leads on flow" rule, and every one of them carries a
`⚠️ NOT IN FIGMA` comment. `docs/figma-catchup.md` is the work order.

## The ingredient data — one source is wired, one is named and missing

Salvaged from `lux-phase1-spine.md` (7 Aug 2026) before that file was deleted;
it was the only place either was written down.

**[Open Beauty Facts](https://world.openbeautyfacts.org/)** — free, openly
licensed, ~68,000 cosmetic products with barcodes and INCI lists, public API and
full exports. **Already wired**: `features/products/openBeautyFacts.ts` serves
both the PRODUCTS tray and `/check/new`, and `activesOf` reads the INCI list it
returns whenever a product is not in `PRODUCT_ACTIVES`. The spine's own note on
why it is not optional still holds, and applies harder to the analysis than to
either search:

> the culprit finder *is* ingredient-list arithmetic, so real data isn't a
> nice-to-have, it's the mechanism.

**[CosIng](https://ec.europa.eu/growth/tools-databases/cosing/)** — the European
Commission's official cosmetic ingredient database, free and public. **Still not
used anywhere in the build, and it is the piece the shipped analysis is
missing.** `ACTIVES[id].concern` carries the explanation today and says so in its
own doc comment. Open
Beauty Facts says what is *in* a product; CosIng says what each INCI name
actually *does* and what restrictions apply to it. The brief requires every
hypothesis to explain why an ingredient is a plausible suspect and to show its
uncertainty — that explanation needs a citable authority, and
`PRODUCT_ACTIVES`'s hand-tuned penalties are not one. They are tuned to
reproduce the comp's five scores, which is the right shape for a compatibility
*score* and the wrong basis for a causal *claim*.

Two more, for context on where LUX sits:
[Glass Skin's 2026 write-up on product hopping](https://tryglassskin.com/blog/skincare-app-product-hopping-2026)
and [MyVanity's AI shelf audit](https://myvanityai.com/).

---

# Two open items rescued from `lux-motion-critique.md`

That file (5 Aug 2026) reviewed the 2024 XD prototype and proposed a motion
system built on springs, `motion/react`, Rive, the View Transitions API and an
animated radar chart. **None of it shipped** — board 04b (`389:200`) is four
cubic-bezier easings and a duration scale, the dependency list is `next react
react-dom`, all motion is CSS, and there is no radar chart anywhere. The orb's
entrance came from Figma `670:31` (the "Spiral Assemble" timeline), not from the
critique's spec. Deleted at the user's request; these two survive it.

Its own best line did land, though nothing cites it: the analysing state should
reuse the mark as a functional element — *identity doing work* — which is what
`Orb`'s `thinking` prop does instead of adding a spinner.

## ⚠️ OPEN — the orb entrance is 700ms and the token says 480

```
lux-orb-spiral 700ms cubic-bezier(0.16, 1, 0.3, 1)
```

`duration/slower` is **480ms**, and board 04b assigns it to "orb and hero
entrances" — which this is. The 700ms is a hardcoded literal that contradicts
the board, kept because it is the authored timing from the Figma spiral
timeline. Both readings are defensible: the authored value is right and
`duration/slower` should become 700, or the token wins and the orb tightens.

**It is a design decision, not a bug — do not quietly change either one.** It
was an open item in the 21 Aug handoff prompt (now
`docs/handoff-2026-08-21.md`, marked historical), and recording it here is what
keeps it from being lost with that file. The entrance is otherwise correct: it
ends on its resting value, so the global `prefers-reduced-motion` collapse
leaves a still orb.

## Claim language is a REGULATORY constraint, not a copy preference

The 2024 prototype labelled a radar axis **"Acne risk free"**. That is an
absolute claim: under EU cosmetic-claims rules it needs substantiating, and it
is exactly the language that pushes a beauty app toward **medical-device**
territory. The fix is comparative and hedged — "Low acne risk for your skin
type".

Nothing else in this repo records that, and it binds every string CHECK and the
unbuilt analysis put on screen. It is the same constraint the product brief
states from the other direction (never claim two ingredients "clashed"; prefer
"may have increased irritation when used in the same period"), and the two
should be read together.

**The current build is clean on this** — checked: the strongest thing
`features/check/check.ts` says is *"Well tolerated. No special handling
needed."*, which is an observation about tolerance rather than a guarantee of
safety. Keep it that way. A recommendation that says a product IS safe, or IS
free of a risk, is a different kind of sentence from one that says how it scored.

### Three findings from that review the build already answers

Recorded because they were the critique's ⚔ critical items and it is worth
knowing they are closed rather than re-deriving them:

- **"Verdict before reasoning" — the sin LUX exists to solve.** The 2024
  prototype showed 88% and a green shape with nothing saying which ingredient
  drove it. `CompatCard` leads with the score and band, then names
  `riskyIngredients` and a recommendation in the panel below.
- **The radar chart carried no information** — a near-regular hexagon whose
  shape said nothing, with no gridlines or scale. It was dropped entirely rather
  than fixed. A radar earns its place only when the *shape* is the insight.
- **The verdict arrived five panels deep.** `/check/results` is the destination
  of the check, not something behind a button on it.

---

# Why the product is shaped like this

From `lux-scope-decision.md` (6 Aug 2026), the scoping document written before
any screen existed. Nothing in this repo carried its reasoning, and three of its
decisions are still visibly load-bearing in the code.

## ⚠️ THE THESIS PIVOTED, AND THE BUILD IMPLEMENTS THE EARLIER ONE

This matters for reading the "Not built" section above, which is otherwise easy
to mistake for a feature someone simply forgot.

| Date | Thesis | Direction |
| --- | --- | --- |
| 6 Aug — `lux-scope-decision.md` | **"LUX is for the thirty seconds before you buy."** One question — *does this suit my skin?* | prospective |
| 7–11 Aug — the spine, then the brief | **"Thesis locked: the culprit finder."** Which product caused this? | retrospective |

⚠️ **BOTH SHIP NOW.** The culprit finder landed 5 Sep 2026 and CHECK stays —
decided then, at the user's direction. They answer different questions in
opposite directions and neither subsumes the other.

**CHECK is the 6 Aug thesis, shipped.** `check.ts` says in its own words that it
answers *"is this product right for my skin?"* — the pre-purchase question. The
culprit finder is the thesis the project pivoted TO, and it is the part with no
route.

So the gap was not an oversight. The project changed its mind about what it was,
built the version it had already scoped, and the newer thesis got its screens a
month later. The question that was left open — *which thesis is LUX actually
making?* — was answered by keeping both, which means the app now has two
sections that reason about ingredients and a standing obligation not to let them
collapse into each other.

## "Five questions, maximum" — the origin of the 5-step flow

The scope doc's screen 1 is *"Five questions, maximum. Progressive — each answer
visibly builds your profile."*

`TOTAL_STEPS` is **5**. The GETTING STARTED section above explains that as nine
designed screens collapsing — `02b` merged into `02a`, `03b` into `01`, `03a`
dropped — and presents it as a decided-here flow change. It is that, but it is
also a **return to a constraint set before any screen was drawn**. The Figma
flow had drifted to eight or nine; the merge brought it back to five. Worth
knowing before anyone proposes a sixth step: the number is a product decision
with a stated reason, not an accident of what fitted.

## The one-glance constraint is where the a11y work comes from

> It has to work one-handed, in bad light, in under thirty seconds. That's a
> real constraint that visibly shapes type size, contrast, tap targets and how
> much text can exist on the screen.

That is the rationale behind the contrast measurements in this file and behind
the 44px-touch-target rule. They are not a compliance exercise bolted on at the
end; they are the product's own stated operating condition. Read the two
together — a failing contrast ratio on a screen meant for bad light is a
product failure before it is a WCAG one.

The doc's other two consequences also survive intact, and CHECK honours both:
**the verdict comes first and the reasoning second** (`CompatCard` leads with
score and band, then names the ingredients that cost points), and **the verdict
is about one person** — *"no universal score. If the word 'your' isn't in it, it
isn't a verdict."* The score is computed against the user's own profile, which
is why `analyse()` runs on read and nothing is ever stored.

## ⚠️ TWO THINGS ON THE 6 AUG "OUT" LIST SHIPPED ANYWAY

The doc cut, explicitly and with a stated reason: routine builder, **progress
tracking**, **selfie / AI skin analysis**, shopping, community, expiry
reminders, the ingredient encyclopedia, price comparison, dupes.

> *Each is a separate product with its own interaction model, and each one
> already has a better version than I could build. LUX does one thing: the
> decision in the shop.*

Two of them are now in the app. **PROGRESS** is a whole nav section — hub,
daily check-in, calendar, trend chart, per-day record. **The selfie** is
`SelfieSheet` off step 1, and check-in photos are a nine-day diary.

Neither is flagged anywhere as a reversal, and both are defensible under the
*culprit finder* thesis — a flare investigation needs a timeline and a
photographic record, which is exactly what PROGRESS collects. But they are not
defensible under *"the decision in the shop"*, and the app currently claims
both. Same underlying question as the pivot above; settle it once.

---

# ⚠️ SAFETY — what shipped, and the interrupt that deliberately did not

**Status: a safety NOTICE ships on step 1 (5 Sep 2026). The brief's full
escalation BRANCH does not, and that is a decision rather than a backlog item.**
Read this whole entry before changing either.

`docs/product-brief.md` § 03E specifies a safety branch:

> If the user reports breathing difficulty; swelling of lips, tongue, or throat;
> major eye involvement; widespread rash; severe pain; extensive blistering/open
> skin; infection signs; or rapidly worsening symptoms, **interrupt the normal
> flow. Show urgent-care guidance and do not continue product analysis as if it
> were sufficient medical help.**

**Step 1 already offers `Swelling` and `Rash` as selectable symptoms** — two of
those triggers by name — and the flow proceeds normally when either is ticked.
There is no interrupt, no urgent-care copy, and no escalation path anywhere in
the app. Searched: no occurrence of urgent, emergency, doctor, physician,
dermatologist, seek care or medical help outside one line.

That line is the only medical hedge in the product, and it is in the wrong
place: `CheckResults` closes with *"This is not a diagnosis — it highlights
patterns worth discussing with a dermatologist."* That is a **disclaimer on the
compatibility check**, on a screen the investigation flow never reaches. It does
not cover step 1, and a disclaimer is not an escalation.

Read it with the claim-language constraint recorded above: an app that collects
"Swelling" and continues to product analysis is making an implicit claim about
what kind of problem this is. That is precisely the medical-device boundary the
EU cosmetic-claims note is about, approached from the other side.

## What shipped instead — a scope statement, not a triage

`features/my-skin/safety.ts` + `components/SafetyNotice.tsx`. Ticking
`Swelling` or `Rash` reveals a notice under step 1's chip grid:

> **Before you continue** — LUX can't judge how serious a reaction is. If yours
> is severe, spreading fast, or affecting your eyes, lips or breathing, please
> see a doctor or pharmacist.

⚠️ **27 words, and the length is part of the safety argument.** The first draft
ran to 46 and opened by explaining what LUX does before reaching the point; a
safety message nobody finishes reading is not a safety message. Three things
survived the cut on purpose — the LIMIT (`can't judge how serious`), the
CONDITIONAL that keeps the severity judgement with the reader (`if yours is`),
and the NAMED SIGNS, which are § 03E's triggers in plain words and the only part
that tells someone whether this is about them. Keep all three if it is rewritten.

It also OPENS rather than appears, so the face diagram below slides instead of
jumping — `SafetyNotice.module.css` carries the three-element grid that does it,
and why only the opening animates.

That closes the implicit claim above: the app no longer collects "Swelling" and
walks on as though a product investigation were the right response.

**⚠️ THREE THINGS IT DELIBERATELY DOES NOT DO, AND THE REASONS ARE THE POINT.**

1. **It does not ask the brief's nine triggers.** Asking about breathing
   difficulty, throat swelling and infection signs, and then DECIDING whether
   the answers are serious, is the app performing a clinical assessment. LUX
   does not assess. The notice is CONDITIONAL — "if your symptoms are severe" —
   so the app never concludes that a case IS severe; it names the kinds of
   reaction that outrun it and leaves the judgement with the person who can look
   at the skin.
2. **It does not interrupt the flow or gate `Continue`.** A gate would be the
   app acting on a severity judgement it just declined to make. And `Swelling`
   and `Rash` are ambiguous by construction — the chip cannot tell a swollen lip
   from a swollen cheek — so a hard stop on them fires mostly on the common case
   and trains people to click past the one message on the screen that matters.
3. **It gives no emergency number.** The app has no locale and a wrong number is
   worse than none. ⚠️ **A release into a known market needs the local one, and
   that is a legal and product decision, not a code one.** Open.

**⚠️ SO THE BRIEF IS NOT SATISFIED, ONLY ANSWERED.** § 03E asks for an
interrupt; this is a notice. Anyone reinstating the interrupt has to bring the
trigger questions with it — the branch cannot fire honestly on two ambiguous
chips — and that is a product decision about whether LUX performs triage at all.
Do not "finish" this by adding a redirect to the existing condition.

**Still open, and named so it is not mistaken for covered:** "rapidly worsening
symptoms" is a § 03E trigger, and `/progress/check-in` records a severity series
that escalates nothing. That is a second trigger site with no notice on it.

## The rest of the specified flow, for the record

The brief specifies twelve screens. The build covers **01–05** — start, skin
profile, describe the reaction, add products, evidence preparation — as the
five-step investigation. **06–12 do not exist**: analysis in progress, result
overview, detailed reasoning, save to investigation calendar, cautious next
action, the no-conclusion route, and observation follow-up.

Two near-misses worth naming so they are not mistaken for coverage:

- **`/check/analyzing` is not screen 06.** It is the wait for the compatibility
  check, not for the investigation analysis.
- **PROGRESS's calendar is not screen 09.** The brief's is an *investigation
  calendar* that saves a result; PROGRESS's records daily check-ins.

## The controlled vocabulary — and the build passes it

The brief fixes the words the product may and may not use. **Use:** associated
with this reaction · used without problems · not enough history · possible
contributor · possible interaction · fits your recorded pattern · evidence for ·
evidence against · not enough evidence yet · investigation priority.
**Avoid:** this caused your reaction · allergy diagnosis · toxic ingredient ·
dangerous product · safe for you · guaranteed result · highest-risk product.

Checked every one against the shipped strings: **no violations.** The band label
`Avoid` is not the forbidden `dangerous product` / `highest-risk product` — it
instructs the reader rather than characterising the product, which is the
distinction the list is drawing. Keep that distinction if the labels are ever
rewritten.

Three principles from the same section that the build has not implemented, all
belonging to the unbuilt analysis: **ask for every product used in the last four
weeks, not only the suspected ones**; **treat tolerated products as
counter-evidence**; and **keep uncertain histories visible without treating them
as proof**. Step 5 currently asks only for what the user chooses to add, with no
copy explaining why tolerated products matter — the brief's own wording is
*"even products you have used without problems. Those products help LUX rule out
weaker explanations."*

---

# `/chat` — the conversation panel, and why it WAS a fifth feature folder

⚠️ **DELETED 7 SEP 2026 — THE ROUTE AND THE FOLDER ARE BOTH GONE.** This entry
is kept as the record of why it existed and how it ended, not as a description
of the build. `app/chat/page.tsx` went first, which left `features/chat/`
unreachable with nothing outside it importing it, and the folder followed the
same day. That is the standing rule resolving as written — "it gets a section or
it gets deleted; it does not quietly become another section's" — in favour of
deleted, after the panel had sat linked-from-nothing since 4 Sep.

⚠️ **THE DAILY CHECK-IN WAS NEVER AFFECTED, AND THE REASON MATTERS.** The shared
chat chrome is `components/layout/ChatPanel.tsx` and always was; `CheckInPanel`
imports it directly and takes its glyphs from `components/ui/icons`. The
dependency was checked per EXPORT before deleting — `ChatScreen`,
`SEEDED_CONVERSATION`, `ChatMessage`, `ChatAuthor`, `SendArrowIcon` — rather
than inferred from the folder path, and the only outside mentions were a comment
in `ChatPanel.module.css` and a line in `docs/figma-catchup.md`. Both are prose.

⚠️ **`SendArrowIcon` WENT WITH IT.** The send disc's glyph was one of the two the
design system does not have (see below). If a conversation screen is ever built
again, that gap is still open in Figma and is not closed by this deletion.

---

Built 4 Sep 2026 from Figma `chat-page / mobile` (270:96), on the request to see
how it looks. It was a look-see: nothing linked to it, and nothing read what was
typed into it.

## It is a PANEL, not a screen — which is the whole reading of the frame

Every other frame in the file is drawn on the 440x957 mobile canvas. This one is
375x538, with a 36 radius on all four corners and its own gradient fill. So it
is built as a surface that floats on `.screen`'s canvas gradient rather than as
a screen that replaces it.

That is not a stylistic call — it is the only reading under which the frame's
two header controls mean anything. A kebab and a **collapse chevron** belong to
something that can be collapsed. Read as a full screen, the chevron has nothing
to do; read as a panel, it closes.

Consequence to know: on mobile the panel STRETCHES to fill the viewport rather
than holding 538. "Translate, don't transcribe" — the 538 is a canvas artefact,
and a chat that stops two-thirds down a phone screen is transcription. On
desktop it holds 538 and centres, because there is no desktop frame to say
otherwise and inventing a 1440 composition is drift.

## Why `features/chat/` exists against a rule that says there are four folders

The rule is one folder per nav section, named for the nav items. This screen is
in no nav section. Both alternatives were worse:

- **File it under `progress`.** It is not a check-in — `/progress/check-in` is a
  guided chat that writes a dated severity record, and this is free text that
  writes nothing. Filing it there makes the folder name a lie and hides a
  homeless screen inside a section that has a home.
- **Put it in `components/`.** That layer is underneath the features and may not
  import one; a screen is not a component.

So it is its own folder, and the folder is the flag: it gets a section or it
gets deleted. **Do not add a sixth folder** on this precedent — the next screen
with no section is a sign the nav is wrong, not that the tree needs a drawer.

The same reasoning puts its two glyphs — `more-vertical` and the send arrow — in
`features/chat/components/icons.tsx` rather than in the design system's
`icons.tsx`. Thirteen icons is what the DS publishes; a fourteenth is a Figma
decision, not a file move.

## ⚠️ LUX DOES NOT ANSWER, AND THAT IS DELIBERATE

Sending appends the user's message and nothing replies.

The temptation is a canned response, because a chat that does not answer looks
broken. But what LUX may say about a user's skin is a **regulatory** constraint,
not a copy preference — see the controlled vocabulary above, and
`docs/product-brief.md`. A reply invented to make a demo feel alive is
unreviewed clinical-sounding copy shown to a user, and the vocabulary section of
this file exists precisely because that is the failure mode worth engineering
against.

The composer is fully real — it types, it sends, it appends, the disc gates on
input — so the *interaction* can be judged. The conversation is not simulated.
The frame draws one LUX question; that is what ships until the analysis this
screen fronts actually exists.

## Two things the build decided and Figma has not

Both are in `docs/figma-catchup.md` §7f as work orders.

- **The send disc is NOT gated on the field, and the first build had it wrong.**
  Every other primary action in the app is disabled until its step is answered,
  so the disc was built the same way. `opacity/disabled` is 0.4, and a 0.4 sage
  gradient on a sage panel is not a faded disc — it is no disc. The resting
  state lost the only affordance that says how to send. The frame settles it: it
  draws a full-strength disc beside the EMPTY placeholder, so the comp says this
  control is not gated, and the `Continue` rule does not reach it — that rule is
  about investigation steps, lives on the step in `flow.ts`, and a composer is
  not a step. An empty submit is a no-op, as in every chat composer. Worth
  keeping as a general point: **`opacity/disabled` needs a surface to fade
  against, and Surface System-adjacent sage-on-sage does not give it one.**
- **The close control is an X where the frame draws a chevron-down.** A
  chevron-down is a *disclosure* glyph — it says the panel folds away and can be
  unfolded — and pointed at a route change it promises a state the app cannot
  return you to, because nothing links back to `/chat`. An X says the thing goes
  away, which is what happens. Using the DS's `CloseIcon` also avoids inventing
  a fourth chat-local glyph and lands the control on `size/icon-xs` (16) instead
  of the frame's off-scale 14.
- **The kebab has no behaviour and is rendered `disabled`.** No flow anywhere
  says what it opens. A focusable button that does nothing, or an
  `aria-haspopup` pointing at a menu that does not exist, are both worse than
  saying so in the markup — and `disabled` takes it out of the tab order, which
  is the honest result. Figma needs to say what it is for, or drop it.

## The bubbles are the component's type, not the frame's

The frame sets bubble text at 14/20. `Spec/Chat Bubble` (47:12) and all nine
GETTING STARTED frames set it at `Body 2` / `Body 1` — which is `t-body2-body1`,
which is what `ChatBubble` renders. Two Figma sources disagree and the published
component wins: a chat bubble two steps smaller here than everywhere else in the
product is the drift, not the fix. Everything else about the frame's bubbles
matches the component exactly, down to the 30/1 tail corners and the
fill-plus-two-shadows-no-stroke recipe.

## Known-failing contrast, reproduced as drawn

Measured by compositing, since axe reports INCOMPLETE on every gradient screen:

- **the composer's placeholder and typed text — 1.85:1.** `text/on-brand` on
  `#183036 @15%`, which composites to #b2c1c7.
- **the day label and both timestamps — 4.34:1 / 4.07:1**, against 4.5:1. The
  frame's #606d75. `text/muted` is worse here (2.27:1); `text/secondary` passes
  at 7.01:1 and is the fix to make in Figma.

Both are what the frame draws, and this file already has precedent for a value
that is chosen rather than accidental — so neither was quietly darkened.
⚠️ **That precedent used to be `#a2b9bf`, which no longer exists**; it is now
`surface/data-deep` `#4f838f @85%` (see the contrast list above). Both are
logged in `docs/figma-catchup.md` §7e for a Figma decision.


## The entrance is an overlay on `/`, not a twentieth route (12 Sep 2026)

⚠️ **NOT IN FIGMA.** Asked for directly: the brand lockup appears over the whole
viewport before Welcome is handed the screen. The symbol and the wordmark fade
in **together**, each drifting 15% of the lockup's width inwards — the symbol
from its left, the wordmark from its right — and settle as the finished lockup.
`components/layout/LogoEntrance.tsx` and "The entrance" in `globals.css` carry
the timeline; this entry is the decisions a later reader is most likely to undo.

### It is not a route, and making it one would cost four things

The route map is nineteen routes and every one of them is in a nav section. An
entrance is in none. As a route it would also have to own `/` — taking it from
Welcome, and with it `metadataTitleFor("/")`, the title `RouteAnnouncer` speaks
on a client-side navigation, and the address people deep-link and share — and it
would become a back-button destination, so leaving the app and coming back would
replay it. As a sibling rendered before `<Welcome>` in `app/page.tsx` it is none
of those: `/` is still Welcome, the document outline is still Welcome's, the
route count is still nineteen, and the node is out of the DOM in under three
seconds. **Do not promote it to a route.**

### Welcome's own entrance is HELD, and it is cancelled rather than paused

Welcome runs a 3.8s narrative — orb assembles at 940ms, CTA at 200ms, the
question at 1000ms, the swap to the reply at 3300ms — and all of it starts at
first paint. Left alone it plays out under an opaque veil and the user lands in
the middle of it: orb already together, question already asked, only the swap
still to come. So `LogoEntrance` sets `data-entrance-hold` on the document
element, and `html[data-entrance-hold] .screen *` sets `animation-name: none`.

⚠️ **`animation-name: none`, NEVER `animation-play-state: paused`.** Pausing
freezes the reveals on their `backwards` 0% keyframe — opacity 0 — so a script
that never lifted the hold would leave the CTA and the disclaimer **invisible**
on an otherwise working page. Cancelling drops each element onto its static
style, which for a reveal is opacity 1. The two failure directions are not
symmetric and only one of them is survivable.

The hold is released when the ASSEMBLY tracks end (2300ms), not when the
overlay's own lifetime ends (3200ms) — otherwise Welcome sits
fully formed and unanimated under a fading veil, then blinks out and restarts.

### ⚠️ SUPERSEDED THE SAME DAY — it was a push, and it read as jumping

It first shipped as a sequence: the wordmark flew in from beyond the right edge,
held centred alone, and was shoved into its slot by a symbol arriving from
beyond the left, the two coupled so the symbol's leading edge met the L on the
frame the wordmark began to yield. Asked to change: the halves appear at the
same time, fade in with a short left/right drift rather than from the edge, and
"elegantly appear rather than jump". It was **replaced, not retuned**:

- **The jump was mostly the curve.** The push ran on the orb's expo curve,
  `cubic-bezier(0.16, 1, 0.3, 1)`, which leaves at full speed. The drift runs
  1600ms on `--ease-standard`, which leaves from rest.
- **The distance is the logo's, not the viewport's.** The push needed runs of
  `50vw + its own width` so the halves could start off-screen — travel measured
  in the logo's own width had made both halves pop into existence inside the
  viewport once the logo was scaled down. A drift that is meant to start on
  screen has no such problem, so it is a percentage of each half again.
- **The wordmark's second wrapper, the contact keyframe and the symbol's
  `z-index` are gone.** They existed only so one element could fly and then be
  pushed, and so the symbol could paint over the L it shoved.

**Do not rebuild the push by retuning this.** Sequencing the halves again means
a contact to couple, and that coupling was the fragile part.

### The halves also SETTLE — from a hair larger, and from a blur (12 Sep 2026)

Asked for later the same day: "a bit more animation" on the two halves,
"something with sizing, smooth and sophisticated". Each half now arrives at
`scale(1.06)` under a 5px blur and condenses to its true size, sharp, over the
same 1600ms as the drift — the lockup comes into **focus** rather than sliding
into place. The choices a later reader might undo:

- **Larger, not smaller.** Growing from 0.9 is the stock pop-in. Settling from
  just above 1 is a lens finding focus, and it mirrors the bloom on the way out
  (1 → 1.03 as the veil lifts): focus in, bloom out.
- **No overshoot.** 1.06 → 1 passes through 1 once, at the end. "LUX does not
  bounce" — do not add a spring or a dip below 1.
- **Same stops as the drift, in the same keyframes.** A separate scale track
  with its own timing is how the halves drift out of step. The `translateX()
  scale()` order is load-bearing: the drift is a percentage of the unscaled box.
- **`will-change` gained `filter`** in `LogoEntrance.module.css`, or the blur
  is rasterised on the main thread every frame.

### The lockup carries a gradient sweep — reactbits' gradient-text, in SVG (12 Sep 2026)

Asked for directly, with a link to reactbits.dev/text-animations/gradient-text
and "using our own colours". That component clips a 300%-wide gradient to text
and slides its `background-position`; the logo is paths, which cannot take
`background-clip: text`, so `components/ui/LuxLogo.tsx` builds the same thing
in SVG: a rect two masters wide, filled with a periodic
indigo → steel → lilac → steel → indigo ramp bound to `bg/brand`,
`gradient/brand`'s start and `bg/brand-soft`, clipped to the half's own paths
by `<use>` reference, and slid one master width per loop by
`.lux-logo-light` in `globals.css`.

- **Master space, so the seam holds.** Both halves' viewBoxes are windows on
  the master's `0..538`; one rect at `x=0` sliding 538 user units shows one
  continuous pass in both. Sizing the rect to each half would give two speeds.
- **Periodic, so the loop has no jump.** One period equals the master width;
  sliding exactly one period lands on an identical frame.
- **`linear`, deliberately.** Travelling light has no rest to ease from; eased
  it pulses at every loop.
- **The export's fills stay underneath.** The light is a layer over the master
  ramp, not a replacement for it — cut the layer and the logo is the export.
- **The highlight is `#587095`**, asked for as that value the same day,
  replacing `bg/brand-soft`. It is `--color-logo-light` on `:root` in
  `globals.css` — ⚠️ NOT IN FIGMA; raise it in the gradient group.

### The symbol STAYS and becomes the orb's mark (12–13 Sep 2026)

Asked for directly: "instead of the logos disappearing and the next Welcome
page appearing, the symbol stays and becomes the logo used in the orb, so the
pages are connected, and the orb grows from very small to what it is now from
behind the symbol." And the lockup holds 300ms longer first (the hold is 700,
was 400).

The overlay no longer dissolves. After the hold the wordmark recedes on its
own; the symbol travels to where Welcome's orb draws the same mark, shrinking to
its size; Welcome's orb starts at 0.04 with its centre on the symbol's and grows
to 1 at its own resting place on the same curve over the same 700ms, so the
symbol rides on it; the orb's mark Spiral-Assembles meanwhile into exactly the
spot the symbol is arriving at, and the symbol fades over it on the way.

- **The orb's mark IS the master symbol (13 Sep 2026).** Asked for
  "pixel-exact": `Orb.tsx` draws `LUX_SYMBOL`'s three paths (exported from
  `LuxLogo.tsx`) through one transform onto its 129 grid, keeping the
  chat-ball export's footprint (58 wide, centred on 65,65) and its three ink
  ramps via `gradientTransform`. Until then the orb carried the export's own
  copy, whose centre stroke was ~12% flatter, and the FLIP could only fade
  across a 2px difference. ⚠️ **One geometry, drawn in two places** — do not
  paste a second copy. ⚠️ **The animated `<g>` sits OUTSIDE the transform**,
  or the Spiral's 20px travel becomes 7px.
- **The orb `animateIn`s again**, asked for directly with the above. The
  hand-off is therefore the mark's own Spiral Assemble under a fading symbol
  (R+350 → R+630), not a hidden mark stepping in under a holding one — a mark
  that assembles cannot be hidden until it is done, and hiding it defeats the
  entrance that was asked back.
- **It is a FLIP, and the JS holds two rectangles and nothing else.** At
  release `LogoEntrance` measures the symbol's paths and the orb mark's paths
  on screen and writes four custom properties on the overlay and two on the
  orb; the keyframes in `globals.css` read them. Duration and curve stay in
  CSS with every other number. It measures at RELEASE, not at mount — at mount
  the symbol is paused on its drifted, 6%-large 0% keyframe.
- **The orb grows from the symbol's position, not in place** — that is what
  "from behind the symbol" means once the orb's resting place is above the
  lockup. Same curve, same 700, and — ⚠️ — the SAME START FRAME.
- **Every hand-off track starts on the release, not at a percentage of a
  longer track.** For an hour the symbol's travel ran from 2300 on the
  entrance's own clock while the orb's tracks could only start at the release;
  a CSS animation's clock starts at the first frame painted after the style
  change that creates it, and painting Welcome for the first time (canvas +
  the orb's blurred layers) put that frame 400ms late in `next dev`. The
  symbol arrived and began fading over an orb still at 0.7 with no mark. Now
  `data-handoff` on the overlay creates the entrance's tracks in the same task
  that lifts the hold: one style recalc, one first frame, one start.
- **The travel and the recede are on each half's `<svg>`, the arrival on its
  wrapper.** Two transform tracks cannot share an element; this is not the
  push's second wrapper coming back — the svg was already there.
- **The stage's 1.03 bloom is gone.** An ancestor transform would move the
  target the FLIP was aimed at.
- **The paths are in a different order in the two files** — the master's
  first stroke is the orb's second. Compare by position, never by index.

### `animation-timing-function: var(--token)` inside `@keyframes` is DROPPED

⚠️ **A trap this repo will hit again.** A `var()` is not substituted for
`animation-timing-function` inside a `@keyframes` block. It does not warn and it
does not fall back to the token — the segment silently gets the default `ease`.
Measured on this build: the same keyframe moved **51.3px** by 300ms with a
`var()` token, **87.7px** with the `cubic-bezier()` written out, and **51.3px**
with the line deleted entirely — i.e. the token form and no declaration at all
are the same thing.

It cost the first version its push: the symbol was only 57% of the way across
when the wordmark began to yield, so the two never made contact. With the curve
moved onto the `animation` shorthand — which **does** take `var()` — the contact
landed to within 5px.

**Put the curve on the shorthand.** Every track in the entrance is one move
between holds, and easing a constant gives a constant, so one curve lands on
exactly the segment that moves. If a track ever genuinely needs two curves,
write the `cubic-bezier()` out literally in the keyframe and copy the token's
value beside it in a comment — do not reach for `var()` there.

⚠️ **And no `animation-delay` anywhere in this timeline.** The global
reduced-motion collapse sets `animation-duration: 0.01ms` and leaves
`animation-delay` alone, correctly — a delay is not motion. A timeline built
from delays would still take 2.5 real seconds for a user who asked for no
motion, holding them on a static logo. Built from keyframe percentages, the
whole thing collapses with the duration and is over in a frame.

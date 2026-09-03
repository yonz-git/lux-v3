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
`surface/data-strong`: **a sage card inside a light card is a LUX pattern, the
reverse is not.** `components/ui/DataCard.tsx` is the whole recipe; use it.

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
| products used | thumb + name + size/date | `productsUsedOn` |

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

**⚠️ "PRODUCTS USED" IS DERIVED FROM `addedOn`, NOT RECORDED.** The chat's three
turns ask about skin, not products, so nothing writes a per-day product list and
adding a fourth turn would change a screen the frame draws. What the app knows is
when each product entered the library, so "used on 5 Aug" is every product added
on or before it — a product added later cannot have been in that day's routine.
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

- **`gradient/brand`, i.e. the PRIMARY BUTTON on every screen.** Its white label
  measures **2.67:1 at the first glyph and 3.73:1 at the last** (2.05:1 at the
  left edge), against 4.5:1. The gradient runs `#a2b9bf` → `#637073`, so the
  centred label sits across a light-to-dark sweep and **no ink colour clears
  both ends** — the surface has to move, which makes it a design decision, not a
  token correction. Two rounds on it: the fix that actually passes (`#5f7275` →
  `#3c4b4e`, 4.87:1 – 9.10:1) was built and **rejected as too dark**, then the
  start was darkened one step by hand, `#bbd3d9` → `#a2b9bf`, which improves
  every figure by roughly half a point and still fails. **`#a2b9bf` is a chosen
  design value — do not "improve" it toward a passing one without asking.** The
  start lives on `:root` in `globals.css` (with `button/bg-default-start`, its
  mirror, and the `@property --grad-start` initial value); full numbers there.
- `CompatCard`'s band colours and their white pill text, **2.03–4.47:1** on
  `/check/results`; the same pill on `/check/history`.
- `ResultCards`' nested emphasis block, **2.22:1**, noted on `.emphasisTitle`.

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
| Product imagery    | `features/products/components/ProductArt.tsx`                          | ⚠️ **THE CAMERA GLYPH IS GONE — DECIDED HERE, NOT IN FIGMA.** No product or bottle icon exists outside the bottom nav, so every thumb (`ProductThumb`, 48) and image well (`ProductCard`, 352x140) drew a camera. That reads as "no photo yet" once and as nothing at all down a list — `/check/new`, the PRODUCTS hub and the add tray all show the same mark on every row, so the thumbnail identifies nothing. `ProductArt` draws the vessel instead: **nine** silhouettes (tub, pump, tube, dropper, bottle, airless, spray, sachet, tin) by packaging type, tinted per brand, so same brand → same tint and same type → same shape. ⚠️ **IT WAS FIVE FORMS AND ONE FALLBACK TINT, WHICH WAS ENOUGH ONLY WHILE THE CATALOGUE WAS THE SEARCH.** Both searches are live now, so the list is whatever the database holds — masks, mists, sticks, ointments — and every one of them fell through `formFor`'s default to the same pump on a `sage` body. A column of identical pumps is the camera glyph with an extra step. Three axes of variety, all keyed on a stable FNV-1a `hash` (never `Math.random()` or an index — a thumbnail that changes identity between two screens is worse than one that repeats): unnamed brands hash into a 7-tint `RING`, unrecognised names hash across all nine `FORMS`, and `labelVariant` picks one of three label treatments off the product id so two products of the same form AND brand still differ. Brand strings are diacritic-folded before hashing, because OBF files the same house as both "Avene" and "Avène". ⚠️ **AND IT IS THE ONLY PICTURE — THE API'S PHOTOS ARE NOT READ.** Open Beauty Facts carries `image_front_url` and it used to win over the drawing. Its images are crowdsourced with no quality gate, so a result list mixed usable front-of-package shots with stubs, angled boxes and rows that fell back to a drawing anyway — two kinds of picture in one column, which is worse at telling rows apart than either alone. `features/products/openBeautyFacts.ts` no longer requests the image fields, `CatalogProduct` has no `imageUrl`, and `useProductPhoto` is deleted; `artFor` serves live results via `formFor`/`paletteFor`. **The API still supplies every WORD** — name, brand, size and the INCI list. The pigments are LOCAL LITERALS drawn from the LUX family and must not become tokens — `02 Color` has no "bottle glass" role, and binding a lid to `bg/brand` would move the artwork every time the brand colour did. **Raise a real illustration set in Figma.** |
| Check-in photo     | `features/progress/components/CheckInPhotoArt.tsx`                     | ⚠️ **NOT IN FIGMA.** `Check-in detail` draws its photo wells as a camera glyph, the same hole `ProductThumb` had and the same failure: the PHOTOS card's entire content is the picture, so a camera icon there says "no photo" on the record of one the user took. Drawn instead — a soft crop of skin with the flushed patch the investigation is about, `slice`-cropped to fill the well the way a photograph would be, grained with `feTurbulence` because three overlapping gradients in a picture frame read as a loading state. **No feature is drawn and it is not anyone's face.** Tone and blush position are keyed on the DAY with the same FNV-1a hash `ProductArt` uses, never `Math.random()`. Pigments are LOCAL LITERALS — `02 Color` has no skin-tone role and should not grow one for a placeholder. Every capture surface in LUX is a placeholder; this is the record of one. **Raise real imagery in Figma.** |
| Opaque sage        | `components/ui/Sheet.module.css`                                   | `surface/data-strong` is 62% and has no solid counterpart the way `bg/nav` is `surface/frost-nav`'s. The `prefers-reduced-transparency` tray composites the same sage over `bg/canvas`.                                                                                                                                                                                           |
| Data card          | `components/ui/DataCard.tsx`                            | The whole of SURFACE SYSTEM B. `surface/data` + `surface/frosted-data` + `radius/2xl` + 20/24 padding, **no stroke**. Not a component in Figma — every PROGRESS and CHECK card is composed from those tokens. Its `prefers-reduced-transparency` fallback composites the same sage over `bg/canvas`, exactly as `Sheet` does.                                                       |
| Calendar (record)  | `features/progress/components/CheckInCalendar.tsx`                     | On the handoff's own missing list. ⚠️ THE SECOND CALENDAR IN THE APP AND NOT THE SAME ONE — `DateField` is a Monday-first interactive date PICKER, this is a Sunday-first read-only RECORD, and both match their frames. Do not merge them; raise the week-start split in Figma instead.                                                                                            |
| Line chart         | `features/progress/components/SymptomTrend.tsx`                        | On the handoff's missing list. Drawn from the data, NOT from the comp's baked vector — the series is the card's whole content. `preserveAspectRatio="none"` + `vector-effect` for the line; the dots are positioned elements so they stay round (the desktop comp exports its "circles" at 13.33 x 8).                                                                              |
| Skin-profile strip | `features/check/components/SkinProfileStrip.tsx`                    | The one sage element on a CHECK screen. Same System B recipe as `DataCard` but an 86-tall strip with 18/20 padding — a separate component rather than a size prop that would mean nothing.                                                                                                                                                                                         |
| Compat accordion   | `features/check/components/CompatCard.tsx`                          | The SECOND accordion in the app; `ProductAccordionCard` is the other, on a different surface with a different header and no band. Neither exists in the DS. The band drives pill, score and bar fill through one `--band` custom property so they cannot drift.                                                                                                                       |
| Status pill        | `features/check/components/CompatCard.module.css`, `features/check/components/CheckHistory.module.css`   | Not `Tag` — Tag is Neutral/Brand only and these carry the feedback colours. ⚠️ `feedback/warning` and `feedback/error` share a hue and differ only in lightness, so the pill TEXT is what separates Risky from Avoid. Every row states its band in an aria-label, including the compatible ones that draw no pill at all.                                                            |


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
6. **Chat bubbles carry an asymmetric tail corner, and NO border.** Three corners
at `--radius-bubble` (30), the sender-side corner at `--radius-bubble-tail`
(1). AI = tail top-left, sits left. User = tail top-right, sits right. Four

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


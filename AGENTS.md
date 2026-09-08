<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LUX — working rules for this repo

LUX is an AI-guided skincare **investigation** web app. The design system —
tokens, components, type, colour — is the source of truth and it lives in Figma.

**Figma file:** `wIftBhzkn8E4wjZwgdH71n` · **Screens page:** `06. Screen
Designs` (`453:2252`). Each section has a `HANDOFF — *` annotation panel beside
its mobile row documenting every recipe.

**⚠️ THE PROTOTYPE LEADS ON FLOW, FIGMA LEADS ON PIXELS.** Every VISUAL decision
— a component's size, radius, type, colour — must match Figma to the pixel, and
inventing a treatment is drift. The SHAPE OF A FLOW — what the steps are, what
order they run in, what each asks — gets decided here, in the thing that can
actually be walked, and Figma catches up. Divergences carry a `⚠️ NOT IN FIGMA`
comment naming what changed and why. Keep writing them.

## Where to find the reasoning

This file is the RULES. It deliberately does not carry the reasoning behind
them, because that lives in three better places:

1. **The component's own doc comment.** Every screen and component opens with a
   30–50 line block explaining its Figma frame, its measurements and every
   decided-here change. That is the authority for the file you are editing, and
   it cannot drift from the code it sits on. **Read it before you edit.**
2. **`docs/decisions.md`** — the cross-cutting record: why PRODUCTS went from
   twelve screens to one, why CHECK's basket stopped being modal, the contrast
   measurements behind SURFACE SYSTEM B, and the list of things faked here
   because the design system has no component for them.
3. **`docs/design.md`** — the Figma-side working guide: the component node ids
   and their variant structures, all nine token collections, the text-style
   ramp, the spacing and radius scales, and the `use_figma` gotchas. It is the
   authority for anything this file does not answer. **Read it before building
   a screen shape that does not already exist here** — it carries the
   vocabulary this file assumes you already have.

4. **`docs/product-brief.md`** — the 11 Aug product brief. It specifies the
   controlled vocabulary the product may and may not use, the safety branch and
   the analysis flow. **§§ 05–12 are built now** (`features/my-skin/analysis.ts`
   and the three routes under `/investigation`); the safety branch deliberately
   is not — see below. Read it before adding user-facing copy about a product's
   effect on skin, or before working on the investigation flow.

`design.md` is the FIGMA side; this file is the CODE side. Where they disagree,
the code is the truth about what SHIPPED and `design.md` is the truth about what
FIGMA HOLDS — both can be right at once. `docs/figma-catchup.md` lists every gap
between them and is the work order for closing them in Figma.

**Read the matching section of `docs/decisions.md` before you change the flow,
the surfaces or the copy of a nav section.** Those entries record decisions a
comp will contradict, so "fixing" the code to match Figma is exactly how they
get undone. For ordinary work — a bug, a style fix, a new component — the doc
comment is enough.

## Where the code lives

**One folder per nav section.** `features/<section>/` holds that section's
screens AND its data module. The four folders are named for the four nav items.

⚠️ **THERE IS NO FIFTH FOLDER ANY MORE, AND `features/chat/` IS THE REASON THE
RULE IS WORDED THAT WAY.** It existed from 4 Sep 2026 — the standalone
conversation panel from Figma `chat-page / mobile` (270:96), filed on its own
because a screen belonging to no section should say so, under the standing
terms "it gets a section or it gets deleted; it does not quietly become another
section's". **On 7 Sep 2026 that resolved in favour of deleted:** the route
`/chat` went first, which left the folder unreachable with nothing outside it
importing it, and the folder followed.

⚠️ **DELETING IT DID NOT TOUCH THE DAILY CHECK-IN, AND COULD NOT HAVE.** The
shared chat chrome is `components/layout/ChatPanel.tsx` and always was;
`CheckInPanel` reaches it directly and takes its glyphs from
`components/ui/icons`. Nothing in the check-in chain ever imported
`features/chat/` — verified per export before the delete, not assumed from the
folder path. **Do not add a fifth section**: four folders, four nav items. See
`docs/decisions.md`.

```
app/                 routes only — every page.tsx is a thin shell
components/ui/       the design system: Button, SmallButton, Chip, OptionRow,
                     Tag, TextField, DateField, SearchField, ChatBubble, Sheet,
                     DataCard, Orb, CameraCapture, icons
components/layout/   app chrome: BottomNav, HubScreen, ScreenHeader,
                     RouteAnnouncer, Snackbar
features/my-skin/    flow.ts + safety.ts + analysis.ts, the investigation steps,
                     QuestionScreen, StepProgress, SelfieSheet, FaceDiagram, and
                     the three analysis screens (EvidenceCheck, Analyzing,
                     Findings + HypothesisCard, PriorityList, Disclosure)
features/products/   products.ts, openBeautyFacts.ts, the two search hooks,
                     the product list/card/details/art components, the add tray
features/progress/   progress.ts + ProgressScreen, CheckIn, CheckInDetail,
                     CheckInCalendar, CheckInPhotoArt, SymptomTrend, SkinProfile
features/check/      check.ts + the check screens, CompatCard, ResultCards,
                     CheckBasket, SkinProfileStrip
lib/store/           answers.ts + InvestigationProvider.tsx
lib/                 date.ts  demo.ts  pageTitles.ts  actives.ts
```

**The rule for placing a new file:** it goes in `features/<section>/` unless two
different sections already use it. `components/ui/` is for things with no
opinion about what they contain; `components/layout/` is for the frame around a
screen. A component used by exactly one section is that section's, however
generic it looks.

Four placement facts that look like mistakes and are not:

- **`QuestionScreen` and `StepProgress` live under `my-skin`, not `layout/`.**
  They read `flow.ts`, so they can only ever wrap an investigation step.
  `HubScreen` takes no flow dependency and stays in `layout/`.
- **The store is not `my-skin`'s.** `Answers` carries slices owned by all four
  sections and imports a type from each, so it sits in `lib/store/` beside the
  provider that serves it.
- **Sections may import each other, and two do.** CHECK reads PRODUCTS;
  PRODUCTS reads `my-skin`'s `QuestionScreen` because step 5 is a flow step.
  What must NOT happen is `components/ui/` or `components/layout/` importing a
  feature — those are the layer underneath. `lib/pageTitles.ts` is the one
  shared module that imports a feature, because it is a route registry.
- **`features/<section>/*.ts`** (`flow.ts`, `safety.ts`, `analysis.ts`,
  `products.ts`, `progress.ts`, `check.ts`) own the data and the derived values.
  A screen states nothing it could compute from one of these.
- **`lib/actives.ts` IS SHARED, AND ONLY BECAUSE TWO SECTIONS USE IT.** It was
  `check.ts`'s until `my-skin`'s analysis needed the same ingredient
  vocabulary — the names, what each does to skin, the INCI patterns, the
  conflict pairs. CHECK's PENALTIES did not move: they stay in `check.ts` as
  `SCORING`, where the analysis cannot reach them.

## The route map

Nineteen routes, all in a nav section. ⚠️ **It was eighteen between 7 Sep 2026
and the skin-profile recap landing later the same day.** `/chat` —
prototype-only and in no section — was deleted, along with the `features/chat/`
folder behind it, taking the count from nineteen to eighteen; then
`/investigation/profile` took it back to nineteen. The two are unrelated: one
was a screen belonging to no section, the other belongs to `my-skin`.
`features/my-skin/flow.ts` owns the step order, the 1-based track position, the
Figma frame ids and each step's `isComplete` rule.

| Route | Kind | Nav |
| ----- | ---- | --- |
| `/` | welcome | `none` |
| `/investigation/start` | flow step 1/5 · also the `my-skin` landing | `my-skin` |
| `/investigation/skin-type` | flow step 2/5 | `my-skin` |
| `/investigation/conditions` | flow step 3/5 | `my-skin` |
| `/investigation/timing` | flow step 4/5 — ⚠️ continues to `/investigation/profile`, not to step 5 | `my-skin` |
| `/investigation/profile` | pushed view — ⚠️ NOT a step: the recap of steps 1–4 | `my-skin` |
| `/investigation/products` | flow step 5/5 — ⚠️ the one flow screen lighting `products`, and no longer the only way through | `products` |
| `/investigation/analysis` | pushed view — ⚠️ NOT a step: the retrospective analysis | `my-skin` |
| `/products` | hub landing | `products` |
| `/progress` | hub landing — **the default**, opens populated | `progress` |
| `/progress/empty` | ⚠️ prototype-only empty state | `progress` |
| `/progress/check-in` | pushed view — the daily check-in chat | `progress` |
| `/progress/check-in/[date]` | pushed view — ⚠️ the app's ONE dynamic route | `progress` |
| `/check` | hub landing — **the default**. ⚠️ Titled `Analysis`; the id and the route are still `check` | `check` |
| `/check/no-profile` | ⚠️ prototype-only empty state | `check` |
| `/check/new` | pushed view — build the check | `check` |
| `/check/analyzing` | pushed view | `check` |
| `/check/results` | pushed view | `check` |
| `/check/history` | pushed view | `check` |

**⚠️ HUB vs FLOW — the header tells you which, and `HubScreen` vs
`QuestionScreen` encodes it.** A screen is an investigation step if and only if
it carries BOTH a progress track AND `Save & exit`. Hub screens carry neither,
and a hub LANDING has no back chevron either (nothing to go back to). A pushed
view keeps the back chevron and still has no track. Nothing outside
`/investigation/*` is a flow step — CHECK and PROGRESS have no `StepId`.

**Two overlays are not routes:** the selfie capture off step 1 and the products
add tray. Both are `Sheet` overlays, deliberately. See `docs/decisions.md`.

⚠️ **AND A THIRD OVERLAY IS ALSO A ROUTE — THE DAILY CHECK-IN, FROM 6 Sep 2026.**
`Check in today` on `/progress` no longer navigates: it opens the same
conversation as a modal `ChatPanel` over the dashboard
(`features/progress/components/CheckInOverlay.tsx`), and submitting it closes
back onto the numbers it just changed. `/progress/check-in` still exists,
unchanged, for deep links and for the analysis's "pause and check in" push.
⚠️ **BOTH RENDER `CheckInPanel`** — the conversation is written once and the
only thing that varies is the way out (`closeHref` + push, or `onClose` +
close). Do not fork it. The focus trap, Escape and focus restoration come from
`lib/useModalDialog.ts`, shared with `Sheet`; the scrim deliberately does NOT
close this one, because the store holds no partial check-in.

⚠️ **THE SELFIE SHUTTER ONLY EVER CAPTURES — IT USED TO TOGGLE, AND ITS OWN
LABEL ALREADY SAID OTHERWISE.** `SelfieSheet`'s shutter wrote `undefined` when a
photo existed, so the second tap of a "retake" DELETED the capture and a third
made a new one, while the control announced `Retake photo` and the helper said
"tap the shutter again to retake". It survived on step 1, where the photo is
optional; it was destructive from the recap, where `Update photo` opened the
tray over a photo block that then vanished behind it. **A shutter is not a
delete button.** ⚠️ **There is now no way to remove a capture** — there never
was a labelled one, and if the product wants one it is an explicit
`Remove photo` action, not a second meaning loaded onto the shutter.
⚠️ **Each capture writes a NEW id**, never the literal `"captured"`: nothing
compares the value, and the recap seeds the drawn photograph on it.

⚠️ **STEP 1 CARRIES A SAFETY NOTICE, AND THE BRIEF'S INTERRUPT IS DELIBERATELY
NOT BUILT — read this before touching step 1.** The product brief requires the
flow to INTERRUPT and show urgent-care guidance on nine clinical triggers
(swelling of lips/tongue/throat, breathing difficulty, major eye involvement, a
widespread rash, severe pain, extensive blistering, infection signs, rapidly
worsening symptoms). What ships instead: ticking **`Swelling`** or **`Rash`** —
the only two of those step 1 collects — reveals `SafetyNotice` under the chip
grid, saying LUX cannot judge how serious a reaction is and to see a doctor or
pharmacist if it is severe. **It does not interrupt the flow and does not gate
`Continue`**, because asking the other seven triggers and then deciding whether
the answers are serious is the app performing a triage it is not qualified to
perform. `features/my-skin/safety.ts` owns the rule, the trigger set and the
copy. ⚠️ **Do not "finish" this by adding a redirect to the existing
condition** — the branch cannot fire honestly on two ambiguous chips, and
reinstating it is a product decision about whether LUX triages at all. Two
things stay open: no locale-appropriate emergency number, and
`/progress/check-in` records worsening and escalates nothing. See
"⚠️ SAFETY" in `docs/decisions.md`.

⚠️ **NEITHER IS `/investigation/profile`, AND IT IS THE SAME RULE.** It is the
recap of what steps 1–4 collected, and its one action, `Add products`, continues
to step 5. No progress track and no `Save & exit`, so by the rule above it is
not a step and `TOTAL_STEPS` is still 5. `features/my-skin/profile.ts` owns the
derivation and every string on it.

⚠️ **ONE BLOCK PER ANSWER, DRAWN AS WHAT THE ANSWER IS — it was a card of
`label: value` rows for a few hours on 7 Sep 2026 and that is not what shipped.**
Every answer below the card gets its own light block that says its own name.
⚠️ **THE SAGE CARD IS EVERYTHING TRUE BETWEEN EPISODES, AND THE LIGHT BLOCKS
ARE THE EPISODE — that is the screen's one split and the surface systems carry
it.** In the card, under a `YOUR SKIN PROFILE` overline: skin type and
tendencies as two labelled columns pushed to opposite edges, then **known skin
conditions as a full-width row under them** (a row, not a third column — it has
the longest label and its value can be a typed sentence). Values at **17px
(`t-button`, the ramp's only declared 17 — never a font-size on a screen)**.
⚠️ **Both multi-selects in the card are JOINED with commas, not pilled** — the
one place on this screen that trades a set for a glance. No divider and no
dates. ⚠️ **It carried both for
about an hour on 7 Sep 2026** — a supplied comp gave it a `border/glass` rule
with `Current: <symptoms> on <places>` and `Started <date> · Day <n>` under it —
**and both were cut the same day, asked for directly.** ⚠️ **The overline was
cut too and then asked back**: it repeats the h1 24px above it, which is what
got "From your answers" deleted, and the word that earns it is **"Your"** — the
h1 names the page, the overline names what is in the card. The gap under it is
`DataCard`'s own 16, not the comp's looser one; the card's internal rhythm is
the component's recipe. The card holds what is true BETWEEN
episodes; everything about the episode is drawn as itself in the blocks below.
⚠️ **The start date lives in the `What you noticed` block**, under the symptom
pills, because a date under a skin type is a date and a date under those pills
is the age of those symptoms. ⚠️ **The joined tendencies are the ONE exception
to the set rule below**, the same trade `SkinProfileStrip` makes.

A multi-select is a SET, so the symptoms and the other locations are `Tag`s and
never a sentence with commas in it — the card above is the exception, not these. ⚠️ **Those tags wear `Chip`'s default fill and
hairline** — `bg/frost-light-muted` + `border/chip`, asked for directly, because
`Tag`'s own strokeless `bg/surface-frost` leaves an answer with no edge on a
frosted block. Geometry, type and ink stay `Tag`'s. ⚠️ **It is fenced to this
screen**: a read-only label dressed as a control is only safe where nothing
beside it is one. The recap now has exactly one control — `Update photo`, a
`SmallButton` with the secondary gradient and 36 height — which is a different
object from a 26-tall pill, but the fence matters more than it did. **Do not
lift the class onto a screen that mixes tags with chips** — raise the variant in
Figma instead. The location answer is
**step 1's own face diagram in a read-only mode** — the coordinates ARE that
answer, and "Cheeks (L), Chin / jaw" is the coordinates thrown away. ⚠️ **The
non-face chips ("Neck", "Whole face", "Other") are `Tag`s INSIDE that card**,
in the row step 1's own chips already use, wearing the region pill's fill and
hairline rather than the light blocks' — they are the same answer as
"Cheeks (L)", given in the same tap, and the only reason they have no
coordinate is that the neck is not on the face. ⚠️ **The card renders even with
nothing picked on the face**, which is what "Neck" alone looks like: seven
dimmed pills and one lit chip is the honest reading of *not there, here*.
⚠️ **The non-face chips are drawn as step 1's SELECTED `Chip`** — 40 tall,
`Label`, indigo `bg/brand` on `text/on-brand` — because the recap only ever
shows the ones that were picked. That is the same rule the regions follow, and
drawing them as the pale unselected pill said the opposite of what the answer
was. They are `span`s with a local class, not `Chip`s (a control) or `Tag`s (26
tall, `Label Small` — a different pill).

⚠️ **THE SELFIE IS A BLOCK WITH THE PICTURE IN IT, AND IT WAS A LINE OF TEXT
TWICE FIRST.** `Photo added` sat under the symptom pills, then on the face card;
both merely stated that a capture exists, and a recap of a photograph should BE
the photograph. It is now its own block: `CheckInDetail`'s well
(`surface/data-strong`, `radius/lg`, capped at 392 like the face) holding
`CheckInPhotoArt`, with an `Update photo` `SmallButton` under it that opens the
same `SelfieSheet` step 1 uses. ⚠️ **That button is the ONE control on this
screen** — everything else reads an answer back, this one can change it, because
a photo is the answer a reader is most likely to want to redo. The art is seeded
on the capture's own id (`answers.selfie`, which is why `ProfileRecap.photo` is
a string and not a `boolean`), so a retake visibly changes the picture — the
only feedback available in a prototype whose viewfinder cannot show what a
camera sees. ⚠️ **Step 4 has no block at all** — it was a
two-node timeline rail, and for an hour it was also the sage card's lower half;
both were cut on 7 Sep 2026, asked for directly. All of it is now two meta PAIRS
inside `What you noticed`, under the pills — `Started on` over
`<date> · Day <n>`, and `Current state` over `<status>`. A date is only the AGE
of something when it sits under the something. ⚠️ **They were running lines of
`t-body3` until 8 Sep 2026** and now take the sage card's label-over-value shape
(muted `t-body3` label, 2, value at `t-button`) with THIS surface's ink —
`text/muted` over `text/primary`, never the card's `text/on-data*`. The colon
went with the change: a label on its own line is already separated from its
value. ⚠️ **The block renders whenever step 4 was answered**, even with
nothing from step 1, or the answer would have nowhere to appear. ⚠️ **The generic "From your answers" heading
is gone**: it named a card holding five different kinds of thing, which is the
heading a block gets when nobody has decided what the block is.

⚠️ **THE SPACING BETWEEN THOSE BLOCKS IS THE GROUPING — IT WAS A UNIFORM 16
UNTIL 7 Sep 2026 AND THAT SAID THE WRONG THING.** Four identical cards at one
interval is four peers. `What you noticed`, `Where you noticed it` and `How long
this has been going on` are three readings of ONE episode; `Known skin
conditions` was true before it started. The episode closes to **12** — tighter
than the cards' own 20 padding, which is what makes three cards read as one
group — the standing fact sits **24** from it, the sage statement **32** above,
and the hand-off **40** below. ⚠️ **No heading was added to name the group**:
that is what proximity is for, and a label naming a group is what this screen
deleted once already. On desktop the recap takes a **640 column**
(`width/card-focus`), left-aligned, rather than the card's full 824 — and the
read-only face is capped at the **392** it is drawn at, because `width: 100%`
over a `392 / 300` box rendered it about 600 tall there. Step 1's face is
untouched: there the diagram IS the screen and its regions are targets.

⚠️ **AND ITS LABELS NAME THEIR SUBJECT.** `Symptoms started` and `Symptoms now`,
never step 4's own `Approximate start date` and `Current status` — those are
short because that screen's question is still above them saying what "this" is.
On a recap carrying four other answers, `Started` leaves the reader to guess
which of them started and `Current status` reads like the status of the
investigation.

⚠️ **IT IS THE ONE `/investigation` ROUTE THAT IS `force-dynamic`**, because it
is the only one that measures a span against today ("18 days ago"). `now` is the
server timestamp seeding the first render and `useToday` corrects it — see
`lib/useToday.ts`; prerendered, that `now` would be the BUILD time.

⚠️ **IT IS WHY STEP 4 NO LONGER POINTS AT `/check/new`** — the hand-off now runs
timing → recap → step 5 → analysis. That is not a reversal of the CHECK/analysis
merge: `/check/new` is still the shared builder and is still reachable from
CHECK. It closes the gap `flow.ts` had already written down against the
shortcut — `/check/new` collects PRODUCTS but not DURATIONS, and the duration is
the entire mechanism of the analysis, so a basket built there left the analysis
able only to refuse.

⚠️ **IT DOES NOT USE `skinProfile()` FROM `lib/demo.ts`, DELIBERATELY.** That
helper falls back to `DEMO_PROFILE` so a readout tab never opens blank, which is
right for PROGRESS and CHECK and wrong here: this screen's whole claim is "here
is what you told us", and answering a deep link with the demo's skin type would
put words in the user's mouth. It reads the raw answers and renders a real empty
state instead.

⚠️ **`/investigation/analysis` IS NOT A STEP, AND `TOTAL_STEPS` IS STILL 5.** It
is the retrospective analysis — the culprit finder the product brief specifies
and the thing LUX is named for. It carries no progress track and no
`Save & exit`, which by the rule above is exactly what makes it not a step: the
five steps COLLECT, this REPORTS on what they collected. It lives under
`/investigation` for that reason and not because it is a sixth question.
**Do not add it to `STEPS`.**

⚠️ **AND IT IS ONE ROUTE BECAUSE THREE WAS TOO MANY.** It shipped on 5 Sep as
`evidence` → `analyzing` → `findings` and was cut back the next day: three
screens between step 5 and an answer read as three more steps. The wait is a
STATE of this route now, the ambiguous-product question is an inline strip on
it, and the read-only "here is what I worked out" summary was deleted outright.
**Do not re-expand it into a wizard.**

`features/my-skin/analysis.ts` owns the whole model — the evidence states, the
gates, the subtraction, the confidence label and every sentence the screens put
on the page. A screen states nothing it could compute from there, and the copy
lives in the module rather than the components so the brief's controlled
vocabulary can be checked by `npm run vocab` over one file.

⚠️ **IT IS NOT CHECK, AND THE TWO MUST NOT CONVERGE.** `/check/*` asks "is this
product right for my skin?" prospectively and scores a product. The analysis
asks "which of the things I already use is associated with the reaction I
recorded?" retrospectively, over a timeline, and its answer is an argument
rather than a number. They share `lib/actives.ts` — the ingredient names, what
they do to skin, the INCI patterns, the conflict pairs — and nothing else.
⚠️ **CHECK's penalties are NOT shared**: they live on as `SCORING` in
`check.ts`, tuned to reproduce a comp's five scores, and a number tuned that way
has no business behind a sentence about what caused someone's reaction.

⚠️ **NO SCORE, NO BAR, NO PERCENTAGE ON `findings`.** The brief: "Do not show a
scientific-looking percentage." Confidence is a WORD — stronger / possible /
weak — derived from the shape of the subtraction. `CompatCard` keeps its `%`,
deliberately; the split is recorded in `docs/decisions.md`.

⚠️ **THE ANALYSIS IS ALLOWED TO REFUSE — BUT ONLY WHEN THERE IS NOTHING TO
COMPARE.** "Not enough evidence for a responsible conclusion" is one of § 07's
three outcomes and is a designed state, not an error. It fires on exactly two
things: no flare date, or nothing new plus nothing readable. ⚠️ **It used to
fire on five**, including a missing cleanser or sunscreen, and the result was a
screen that lectured the user about what they had not typed in before it would
say anything. Everything else now LOWERS THE CONFIDENCE instead — which the
screen already has a word for. **Do not put the completeness gates back**; in
particular, a missing cleanser is a reminder, never a requirement.

## The prototype starts EMPTY — and Continue is gated

**Nothing is pre-selected, on any screen.** The Figma frames show options
already chosen because a comp has to show a filled-in state. If you port a
screen and it renders with something selected, that is a bug.

⚠️ **THIS IS ABOUT CONTROLS, NOT READOUTS.** `/progress` and `/check`
deliberately open populated — they have nothing to select, and an empty readout
shows nothing. `lib/demo.ts` owns the one seeded skin profile; both sections
resolve it through `skinProfile()` so the demo cannot claim two different skin
types depending on which tab you are on.

**`Continue` is DISABLED until the step is answered.** The rule lives on the
step in `flow.ts` (`isComplete`), never in the screen, so a new screen cannot
forget it. `QuestionScreen` reads it and owns the button.

Answers live in `lib/store/InvestigationProvider.tsx` — React context,
provided from `app/layout.tsx` so the PRODUCTS hub reads what step 5 writes.
Read them with `useInvestigation()`.

⚠️ **THE STORE IS SPLIT THREE WAYS, AND EACH SLICE HAS ITS OWN LIFETIME.**

| Slice | Survives | Owned by |
| ----- | -------- | -------- |
| what the user COMPLETED — `products`, `checks`, `checkIns`, `savedFinding` | forever | `PERSISTED_KEYS` |
| the FLOW'S ANSWERS — steps 1–4 | **24 hours, sliding** | `FLOW_KEYS` |
| everything else — drafts, baskets, search fields, `evidence`, `scan` | the tab | by construction |

The first row is the controls-vs-readouts line drawn two paragraphs above:
those render as readouts, and `/products`, `/check` and `/progress` are
specified to open populated anyway.

⚠️ **THE MIDDLE ROW ARRIVED 7 Sep 2026 AND IT CHANGED A RULE THIS FILE USED TO
STATE ABSOLUTELY.** It read "do not persist a control's state", because
localStorage once made every visit open with the previous visit's selections
still ticked — which reads exactly like the screens shipping pre-filled. **That
is still the failure to avoid, but the cause was the LIFETIME, not the writing.**
State that belongs to nobody is furniture; state from the last day belongs to
the person still looking at the screen. So `/investigation/start` may now open
with chips ticked, and it is only ever THIS browser's answers from the last 24
hours. Past the window `readFlow` drops the envelope **and deletes it**, and
every screen is empty again.

⚠️ **A DRAFT, A BASKET AND A SEARCH FIELD ARE STILL NEVER WRITTEN, AT ANY
AGE.** `productDraft`, `productQuery`, `checkBasket`, `checkQuery`, `scan`,
`viewingCheck`, `evidence` — the user was mid-gesture there, not answering a
question, and restoring a search field with yesterday's query is the pre-filled
bug with none of the value.

`lib/store/persistence.ts` owns both seams: `PERSISTED_KEYS` and `FLOW_KEYS` are
the whole of both lists, `PersistedAnswers` and `PersistedFlow` are derived from
them, and each split is a **type** so a new key has to be placed deliberately.
⚠️ **TWO STORAGE KEYS, BECAUSE THERE ARE TWO LIFETIMES** — `lux.records.v2` and
`lux.flow.v1`, the second holding an envelope (`{ savedAt, answers }`) so an
unstamped payload can be refused rather than trusted. The window is **sliding**:
every write re-stamps it, so 24 hours means a day of not touching the
investigation. Expiry is enforced **on read**, not by a timer. Hydration happens
in an effect (never in the `useState` initialiser — that is a hydration
mismatch) and the write is gated on `hydrated` as **state, not a ref**, or the
first write clobbers what it just read. Anything failing its shape check on read
is dropped, and a stamp in the FUTURE counts as stale (a clock that moved
backwards would otherwise pin the slice open forever).

⚠️ **THIS IS STILL NOT RESUMABILITY.** One device, one browser, no account, and
now also one day. `Save & exit` still does not resume a flow, and a deep link to
another visitor's check-in still has no data behind it. Real resumability
belongs to a backend — **do not add an affordance that promises it.** See
`docs/decisions.md`, "PERSISTENCE".

⚠️ **USE THE UPDATER FORM FOR ANY TOGGLE:**
`setAnswer("start", (prev) => toggleMulti(prev ?? [], option))`. A value
computed from the `answers` you read during render uses a snapshot, so two
toggles in the same tick silently lose the first.

Screens ECHO earlier answers rather than hardcoding the comp's copy. Guard for
the answer being absent (deep links) rather than rendering an empty bubble.

## The vocabulary — what exists, so you don't invent one

Generated from `app/globals.css`, `app/tokens.css` and the components
themselves. If a value here disagrees with the source, the source wins and this
table is stale — say so rather than working around it.

### Type — every piece of text takes one of these classes

| Class | Mobile | Desktop | Weight | Use |
| --- | --- | --- | --- | --- |
| `t-display1` / `-2` | 84/96 · 64/76 | — | 500 | brand surfaces only |
| `t-h1` | 40/48 | — | 500 | not used by any screen |
| `t-h2` | 32/40 | — | 500 | — |
| `t-h3` | 24/32 | — | 500 | — |
| **`t-h4-h3`** | **20/28** | **24/32** | 500 | ⭐ **every page `<h1>`, hub and flow alike** |
| `t-h4` | 20/28 | — | 500 | fixed-size headings |
| `t-h5` | 18/26 | — | 500 | card titles |
| `t-h6` | 16/24 | — | 500 | desktop option-row labels, row titles |
| `t-body1` | 18/28 | — | 400 | — |
| **`t-body2-body1`** | **16/26** | **18/28** | 400 | ⭐ **chat bubbles** |
| `t-body2` | 16/26 | — | 400 | body copy |
| **`t-body3-body2`** | **14/22** | **16/26** | 400 | secondary body |
| `t-body3` | 14/22 | — | 400 | — |
| `t-label` | 14/20 | — | 500 | mobile option-row labels, chips |
| `t-label-sm` | 12/16 | — | 500 | nav labels, tags, meta lines |
| `t-caption` | 12/16 | — | 400 | captions |
| `t-overline` | 13/18 + 1.82px tracking | — | 500 | section labels on data cards |
| `t-button` | 17/22 | — | 400 | `Button` — owns it, don't re-apply |
| `t-button-sm` | 14/22 | — | 400 | `SmallButton` — same |
| `t-metric1` / `-2` | 56/60 · 40/40 | — | 300 | big figures on data cards |

⚠️ **A `-a-b` name means "a on mobile, b on desktop"** — the responsive pair is
one class, never a media query you write. `t-h3-h2` is a real Figma style with
**no caller**; page titles are `t-h4-h3`. See non-negotiable 16.

⚠️ **THE RAMP ALSO OWNS WHERE A LINE BREAKS, AS OF 8 Sep 2026.** Every heading
class (`t-h1`–`t-h6`, `t-h4-h3`, `t-h3-h2`, `t-display*`) carries
`text-wrap: balance`; every prose class (`t-body*`, both responsive pairs,
`t-caption`) carries `text-wrap: pretty`. Figma cannot express either — a comp
breaks a title wherever its fixed 440 or 1440 canvas breaks it, and the build
breaks it at the reader's width — so this is a code-side decision applied by
ROLE, the same way tabular figures are (non-negotiable 19). ⚠️ **The CONTROL
classes are deliberately excluded** — `t-label`, `t-label-sm`, `t-button`,
`t-button-sm` and `t-overline` size chips, buttons and section labels whose
widths are measured against Figma, and balancing a two-line chip label moves the
pill. `SkinProfileSummary`'s `.headlineValue` is the one local `balance` left,
because it wears `t-button` as a data value rather than as a control. **Do not
write `text-wrap` in a module** unless you are in that same position.

### Spacing — `--space-*`

`2xs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `2xl` 24 · `3xl` 32 ·
`4xl` 40 · `5xl` 48 · `6xl` 64 · `7xl` 80 · `8xl` 96 · `9xl` 120

### Radius — `--radius-*`

`none` 0 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 · `xl` 20 · `2xl` 24 · `3xl` 32 ·
`full` 999 · `bubble` 30 · `bubble-tail` 1

`2xl` is the data card. `full` is every pill — buttons, chips, the nav, the
tray bar. The two `bubble` values are `ChatBubble`'s and nothing else's.

### Sizes — `--size-*`

Icons `xs` 16 · `sm` 20 · `md` 24 (the default) · `lg` 32 · `xl` 48.
Controls `sm` 36 · `md` 48 · `lg` 62 (the `Button` height).

### Icons — 13 exist, in `components/ui/icons.tsx`

Nav: `MySkinIcon` `ProgressIcon` `CheckIcon` `ProductsIcon`
Chevrons: `ChevronLeftIcon` `ChevronRightIcon` `ChevronDownIcon`
Actions: `PlusIcon` `CloseIcon` `SearchIcon` `CameraIcon` `NoteIcon`
Feedback: `SuccessCheckIcon`

⚠️ **There is no other glyph, and the DS has no more to give.** If a screen
needs one that is not here, that is a gap to raise in Figma — see
`docs/decisions.md`. Size them with a CSS class or `--icon-size`, never
`width`/`height` (non-negotiable 14).

### Components — the props, so you don't read every file

| Component | Props |
| --- | --- |
| `Button` | `variant?: "primary" \| "secondary"`, `fullWidth?`, `href?`, `icon?` + button attrs |
| `SmallButton` | `label`, `arrow?`, `href?`, `className?` + button attrs |
| `Chip` | `label`, `selected`, `control?: "checkbox" \| "radio"`, `onToggle` |
| `OptionRow` | `control: "radio" \| "checkbox"`, `label`, `selected`, `onSelect` |
| `Tag` | `children`, `variant?: "neutral" \| "brand"`, `className?` |
| `TextField` | input attrs + `ref?` |
| `DateField` | `value?: IsoDate`, `onChange`, `id?`, `placeholder?` |
| `SearchField` | `value`, `onChange`, `placeholder?`, `label` (the accessible name — there is no visible `<label>`) |
| `ChatBubble` | `from: "ai" \| "user"`, `align?`, `full?` |
| `Sheet` | `open`, `onClose`, `title`, `children` |
| `DataCard` | `as?`, `className?`, `children?` |
| `CameraCapture` | `captured`, `title`, `helper`, `onCapture` |
| `Orb` | `size?`, `className?`, `animateIn?`, `thinking?` |

`Button` and `SmallButton` apply their own type class. `Chip`'s `control` changes
the ARIA role and nothing visual — read the selection-controls contract below
before reaching for `"radio"`.

### Colour — bind semantic tokens, never a primitive

Groups in `02 Color`: `bg/` `surface/` `text/` `icon/` `border/` `state/`
`feedback/` `gradient/` `button/` `effect/`. The ones you will actually reach
for:

- **Text on light:** `text/primary` `#2e2a3f` · `-secondary` `#4b4b57` ·
  `-muted` `#63636f`
- **Text on a data card:** `text/on-data` `#2e2a3f` · `-secondary` and `-muted`
  both `#354446` — **dark, not white** (non-negotiable 17). ⚠️ **That is the ink
  for `surface/data`. The DEEP tier takes `text/on-data-inverse` (white)** —
  see non-negotiable 17.
- **Surfaces:** `surface/frost-light` (translucent) vs `bg/frost-light`
  (opaque) — ⚠️ a frost fill ON a frost surface does not read; use the opaque
  one. Same relationship as `surface/frost-nav` → `bg/nav`.
- **Brand:** `bg/brand` `#39386f` indigo, for selection and accents — ⚠️ **it
  was `#3b305c` (`indigo/700`) until 8 Sep 2026.** It is the same value as
  `gradient/brand`'s dark end on purpose: one indigo for the primary action and
  for every mark that says "selected". `-hover` `#2c2a5f`, `-soft` `#8284c0`,
  both re-hued with it.
  ⚠️ **`gradient/brand` IS INDIGO TOO AS OF 8 Sep 2026 — every older note
  calling it "the SAGE button gradient, not the indigo one" is stale.** It runs
  `#657792 → #39386f`. See non-negotiable 5.
- **Feedback:** `success` `#5f8a6e` · `warning` `#c9918e` · `error` `#a86561`.
  ⚠️ Warning and error share a hue — **never carry the distinction by colour
  alone**, always pair with a label.

### Entrance reveals — three classes and two data attributes

| Hook | Duration | Use |
| --- | --- | --- |
| `.reveal` | `slow` 320ms | a block arriving with the screen |
| `.reveal-quick` | `base` 200ms | something the user just revealed |
| `.reveal-hero` | `slower` 480ms | the orb and hero entrances |
| `[data-reveal]` | `slow` 320ms | applies the fade to every DIRECT child |
| `[data-reveal-stagger]` | + 0/40/80/120/160ms | stagger those children, capped at the 5th |

All five run the global `lux-fade-in`. The stagger hits **direct children only**,
so a ten-row option list arrives as one block rather than ten cascading rows.

⚠️ **Use these rather than naming an animation in a module** — a module
localizes the `@keyframes` name and it resolves to nothing (motion section
below). A module may safely set `animation-delay`, which carries no name.

For anything not listed — the full 9 collections, the Figma node ids, the
variant structures — read `docs/design.md`.

## Non-negotiables

1. **`app/tokens.css` is generated from the Figma variables.** Treat it as
   generated. Hand-authored overrides go on `:root` in `globals.css`.
2. **Never reference the `01 Primitives` block** (`--color-indigo-*`,
   `--color-sage-*`, …) from a component. Bind to the semantic tokens.
3. **Every piece of text uses a `t-*` class** from `globals.css`, one per Figma
   text style. No ad-hoc `font-size`.
4. **Weights are Light / Regular / Medium only.** `--font-weight-semibold` and
   `--font-weight-bold` exist as tokens but using them is drift.
5. **Buttons: one rule for every style.** Hover runs the gradient END FOR END at
   full strength; disabled fades the whole control to `opacity/disabled` (0.4).
   Applies to `Button`, `SmallButton` and the back button alike.

   | Style | Default | Hover |
   | ----- | ------- | ----- |
   | Primary | `gradient/brand` | `gradient/brand-hover` |
   | Secondary | `gradient/secondary` + 1px `border/default` | `gradient/secondary-hover` |
   | Ghost | no fill | ⚠️ `bg/accent-mint`, a variable no longer in `02 Color` |

   ⚠️ **`gradient/brand` IS INDIGO, AND IT WAS SAGE UNTIL 8 Sep 2026.** It runs
   `#657792 → #39386f`, declared on `:root` in `globals.css` (Figma still holds
   the sage `#bbd3d9 → #637073`; see `docs/figma-catchup.md` §2 and §6). This is
   a REASSIGNMENT, not a retune: plotted in OKLCH, LUX runs a sage GROUND family
   (canvas, nav, bubbles, data cards; hue 197–216) and an indigo FIGURE family
   (selection, chips, checked days, the orb's mark; hue 281–295). The button sat
   in the ground family at hue 213–215 with chroma **0.016–0.027** — the colour
   drained out of it — and read on ten routes as a disabled steel pill. It now
   sits at hue 258 → 282, chroma 0.047 → 0.092.

   ⚠️ **THE OLD NOTE THAT `#a2b9bf` IS A CHOSEN VALUE NOT TO BE IMPROVED IS
   RETIRED**, along with the whole "no ink clears both ends" block that went
   with it. The white label now measures **4.56:1 at the left edge and 10.66:1
   at the right** — AA across the entire sweep, which was the app's widest
   contrast failure. The sage version that passed (`#5f7275 → #3c4b4e`) is still
   rejected and still too dark; this is not that. It keeps a 24° hue rotation
   and nearly doubles its chroma on the way down, so it reads as a sweep rather
   than a slab.

   ⚠️ **CLOSED THE SAME DAY: `bg/brand` MOVED TO THE BUTTON'S DARK END.** The
   button and the checked-in calendar discs appear together on `/progress` and
   were two violets eleven degrees apart. `bg/brand` is `#39386f` now — the same
   value — so the primary action and the selection accent are one indigo. Its
   two siblings moved with it to stay on one hue: `-hover` `#2e2447` → `#2c2a5f`,
   `-soft` `#8e80bc` → `#8284c0`. White holds everywhere: 11.91 → **10.66:1** on
   `bg/brand`, 14.39 → 13.10:1 on `-hover`. `-soft` goes 3.52 → 3.49:1, i.e. the
   failure it already carried, unchanged in substance.

   ⚠️ **The reversal only animates because of the `--grad-*` plumbing.** CSS
   cannot interpolate `background-image`; the endpoints are registered
   `<color>` properties in `globals.css`. Motion is `duration/hover` (400ms).
   ⚠️ **The `@property` initial-values are hand-written and must move with the
   tokens** — a registered property takes no `var()`, so a stale initial-value
   flashes the previous colour for a frame.
⚠️ **THE NAV'S THIRD ITEM READS `Analysis`, AND ITS ID IS STILL `check`.** The
label is the word the user sees; the id keys the route map, the `NavSection`
type and every `nav=` prop. Do not "fix" the mismatch by renaming the id — see
`docs/decisions.md`, "the naming".

6. **The bottom nav is fixed and identical on every screen**:
   `--nav-inset-bottom` from the bottom, centred, `--z-nav`, 380 wide mobile /
   598 desktop. `active="none"` is a real state, not a fallback. ⚠️ **FOUR
   items, not the component's three** — `My skin` leads, then Progress, Check,
   Products. The widths did not change and no breakpoint was added; a FIFTH item
   would exhaust the headroom.

   ⚠️ **THE OFFSET IS A TOKEN, NOT A NUMBER, AND IT IS NO LONGER 24.** It is
   **5** as of 4 Sep 2026 — off the spacing scale on purpose, which is why it is
   a literal on `:root` in `globals.css` rather than a `--space-*` step. It is
   not only the nav's own `bottom`: five other rules reserve clearance FROM it
   (`.screen`'s bottom padding in three variants, the global focus
   `scroll-margin-bottom`, `Sheet`'s desktop max-height guard and CHECK's basket
   bar). **Never write the number at any of them** — a literal at one site and a
   token at the others is 19px of dead space nobody can see. See
   `docs/decisions.md`.
7. **The nav is `surface/frost-nav` `#dbeded @88%` — NOT 17%.** Frosted does not
   mean see-through. `bg/nav` is its opaque counterpart, the **same colour**
   fully opaque (`#dbeded`), and is the `prefers-reduced-transparency` fallback
   — a fallback must not be translucent or a different hue. Same colour as
   `bg/bubble-ai`, so the nav sits on the AI bubble's hue, and `Search Field`
   binds the same token: one frosted-pill surface, two components.
8. **Chat bubbles carry an asymmetric tail corner, and NO border.** Three
   corners at `--radius-bubble` (30), the sender-side corner at
   `--radius-bubble-tail` (1). AI = tail top-left, sits left; user = top-right,
   sits right. A bubble is a **fill plus two shadows**. Frosted _rows_ and
   _cards_ do carry a 1px `border/subtle`; **do not merge the two recipes.**
   ⚠️ **Bubbles are OPAQUE** — `--color-bg-bubble-ai` (#dbeded) and
   `--color-bg-bubble-user` (#cadfdf), a pair on one hue. **Never put a
   translucent surface on a bubble.** Padding 14/18 mobile, 14/22 desktop.
9. **A Figma stroke does not add to a frame's height; a CSS border does.** For a
   FIXED-height row, give it `min-height` and drop the vertical padding. For a
   box whose height is CONTENT-driven, write
   `padding: calc(14px - var(--border-width-hairline))` so it lands on the
   design height in every state.
10. ⚠️ **A GRADIENT + A BORDER NEEDS `background-origin: border-box`.** The
    default sizes the gradient to the padding box while painting it into the
    border box, so the outermost 1px of every edge has no gradient on it and the
    drop shadow shows through as a thin dark notch. Only background IMAGES are
    affected; a flat `background-color` is not.
11. **Frosted surfaces always get a solid `prefers-reduced-transparency`
    fallback**, and a translucent fill always needs its inner shadow or it reads
    flat.
12. **Breakpoints: mobile-first, desktop at `min-width: 1024px`.** Never write a
    440px or 1440px media query — those are the Figma canvas widths.
13. ⚠️ **THE FOCUS RING IS AN `outline`, NOT A `box-shadow`.** CSS Modules load
    after `globals.css`, so at equal specificity a component's own shadow simply
    won and the ring silently disappeared on almost every control in the app. An
    outline is a separate property, composes with any shadow, and follows
    `border-radius`. Never remove it.
14. ⚠️ **AN ICON'S SIZE IS A CSS DEFAULT, NOT AN INLINE STYLE — NEVER PUT
    `width`/`height` BACK IN `icons.tsx`.** An inline style beats an external
    stylesheet rule at every specificity, and it fails silently: eleven module
    rules across nine components sat there looking correct while rendering 24.
    The default lives in `globals.css` as `:where(svg[data-lux-icon])`;
    **`:where()` is load-bearing**, since a bare attribute selector would beat
    the single class it must yield to. An icon whose default is not `md` sets
    `--icon-size` inline — a custom property feeding the rule, not a `width`
    outranking it. No icon needs `!important`.
15. ⚠️ **THE UA `button` PADDING IS `1px 6px`, NOT ZERO.** The global reset
    zeroes it; every LUX button declares its own.
16. ⚠️ **Three type facts the comps and the component notes get wrong:**
    `Size=Desktop` option rows are **58, not 56** (the row hugs vertically, and
    `H6` is 24 where `Label` is 20); desktop chat bubbles are **`Body 1`
    (18/28), not `Body 2`** — use `t-body2-body1`; and **every page title is
    `t-h4-h3`, including a hub's**, which the comps draw one step larger.
17. ⚠️ **SURFACE SYSTEM B's TEXT IS DARK, NOT WHITE — ON `surface/data`.**
    That surface composites too light for white text at any alpha; measured, it
    failed WCAG AA on 38 of 59 text nodes on `/check/results`. `text/on-data` is
    `#2e2a3f` and `-secondary`/`-muted` share `#354446`; hierarchy is carried by
    size, weight and tracking. Redefined on `:root` in `globals.css`. Still
    white, deliberately: the `border/glass` divider and the check-in discs'
    `text/on-brand`.

    ⚠️ **SYSTEM B HAS A SECOND SURFACE AS OF 8 Sep 2026, AND ITS INK IS WHITE.**
    The rule above is about `surface/data`, not about sage. `surface/data-deep`
    (`#4f838f @85%`, declared in `globals.css`) is the deep tier, and it is
    paired with `text/on-data-inverse` — white. **The pairing is the contract
    and neither half is portable:** white on `surface/data` is 1.87:1, and the
    app ink on the deep tier is 3.67:1. Putting `text/on-data-inverse` on a
    `surface/data` card re-creates exactly the failure this rule exists to stop.

    Four surfaces take the deep tier — `SymptomTrend`'s card, `ResultCards`'
    emphasis block, `CheckBasket`'s rows, `AddProductMethodSheet`'s tiles. They
    were four separate white-on-sage exceptions measuring 1.64–2.32:1; they are
    now one declared tier measuring **3.42–3.77:1** depending on backdrop.

    ⚠️ **IT STILL DOES NOT CLEAR AA, AND NO INK FIXES IT.** On the `surface/data`
    backdrop white is 3.71:1 and the app ink is 3.73:1 — the surface sits almost
    exactly where the two inks cross over. Only the SURFACE can move, and it has
    to move meaningfully: an opaque `#407375` was built the same day and gives
    white 5.35:1; going lighter returns the ink to 4.6:1+ and gives up the white.
    ⚠️ **`#4f838f @85%` is a chosen design value — do not "improve" it toward a
    passing one without asking**, and do not "correct" its hue onto the sage line
    either (it is 214.1 against `surface/data`'s 199.8, deliberately cooler).

    ⚠️ **AN INTERACTIVE DEEP SURFACE HOVERS TO `surface/data-deep-hover`, NOT TO
    `-strong`.** The method tiles hovered to `surface/data-strong` for as long as
    `-deep` was `#538b8d @62%`, where it happened to be one step lighter. It is
    not one step at any other value — different hue, different alpha — so the
    hover token exists to make the step structural.

    Still known-failing and awaiting a Figma decision: `CompatCard`'s band pills
    and the deep tier above. ⚠️ **`gradient/brand`'s white label is no longer on
    that list** — it clears AA across the sweep since the indigo reassignment
    (non-negotiable 5).

18. ⚠️ **THE BROWSER'S OWN SURFACES BELONG TO THE DESIGN SYSTEM TOO.** Text
    selection, the caret and native control accents ship at the browser default
    unless something claims them, and Figma cannot draw any of them — so they
    stayed a Windows-blue highlight, a black caret and a blue OS date picker on
    a page where nothing else is blue. All three bind `bg/brand` in
    `globals.css`; `::selection` also sets `text/on-brand`, because `bg/brand` is
    opaque and the ink has to pass on THAT ground rather than on the surface
    underneath (letting it inherit put `text/on-data` on indigo at 1.36:1 on
    every System B card). The scrollbar is deliberately hidden and stays so.

19. ⚠️ **DIGITS THAT STACK TAKE `font-variant-numeric: tabular-nums`.** Figtree's
    default figures are proportional, which is right for prose and wrong for a
    column. Applied BY ROLE, never globally: the calendar grid, the chart axes,
    `.t-metric1`/`.t-metric2`, and the compat score. Adding a fifth role is a
    line in the relevant module, not a change to `body`.

## Two surface systems — do not mix them

- **SYSTEM A — forms.** GETTING STARTED, PRODUCTS and CHECK. Light frosted rows
  and cards, dark text, a 1px `border/subtle`.
- **SYSTEM B — readouts.** PROGRESS, plus CHECK's skin-profile strip and tray.
  `surface/data` + `surface/frosted-data` + `radius/2xl`, padding 20 mobile /
  24 desktop, **NO stroke**. A divider inside one is `border/glass`, never
  `border/subtle`. Accents are indigo `bg/brand`. `components/ui/DataCard.tsx`
  is the whole recipe; use it.

⚠️ **SYSTEM B IS TWO SURFACES, NOT ONE — AND EACH CARRIES ITS OWN INK.**

| Tier | Fill | Ink | White measures |
| ---- | ---- | --- | -------------- |
| `surface/data` | `#7da7a9 @44%` | `text/on-data` (dark) | 1.87:1 — never |
| `surface/data-deep` | `#4f838f @85%` | `text/on-data-inverse` (white) | 3.42–3.77:1 |

The deep tier is for a block that has to read as EMPHASIS rather than as one
more sage card, and it is what a nested emphasis block takes. ⚠️ **It was
`surface/data-strong` until 8 Sep 2026** — a 62% sage inside a 44% sage is two
steps of one hue with almost nothing between them, and every caller that put
white on it was failing at 1.64–2.32:1. Non-negotiable 17 has the numbers and
the standing instruction not to retune it unasked.

⚠️ **A sage card inside a light card is a LUX pattern; the reverse is not.**

## Empty states — one recipe, four screens

⚠️ **THERE IS A PATTERN AND EVERY EMPTY STATE USES IT.** `ProgressScreen` calls
it "the standing exception every LUX empty state has": `HubScreen` with
`layout="plain"` and `center`, and inside it

    Orb (animateIn) → 32 → `t-h4-h3` title → 12 → body → 32 → primary action

centred, text-centred, on bare gradient with **no card** at either breakpoint.
The action is full-width on mobile and `width/action` (280) on desktop.
`/progress/empty`, `/check/no-profile`, `My Products — empty` and
`/investigation/profile` all draw it. ⚠️ **The profile recap was the one screen
not using it until 8 Sep 2026** — it had the heading, two paragraphs and a
bottom-pinned button, which left roughly 1000px of canvas between them at 440.

⚠️ **THE HEADING STAYS AT THE TOP; ONLY THE BLOCK IS CENTRED.** That is what
`layout="plain"` buys, and it is why the recipe specifies it. ⚠️ **`center` with
`layout="card"` does NOT work** — the card layout renders the heading INSIDE
`.body`, so centring the block floats the page title into the middle of the
screen above the card. It was tried on `/investigation/analysis` on 8 Sep 2026
and reverted; see the note in `Analysis.tsx`. If a `card` screen ever needs
centring, `HubScreen` has to hoist the heading out of the centred region first.

⚠️ **IT IS NOT A SHARED COMPONENT, DELIBERATELY.** Four screens is past the
usual bar, but each differs in what goes in the block and the recipe is four
spacing values — lifting it would trade four numbers for a component with four
configurations. If a fifth appears, lift it then.

⚠️ **A PUSHED VIEW KEEPS ITS BACK CHEVRON.** `/investigation/profile` has one;
the other three are hub landings with nothing behind them and have none. The
recipe does not change that rule.

## Selection controls — the shape is the contract

Not a style choice. It maps to the ARIA role and screen readers announce them
differently.

| Control | Shape | Cardinality | Role |
| ------- | ----- | ----------- | ---- |
| Radio row | circle | exactly one | `role="radio"` |
| Checkbox row | square | zero or more | `role="checkbox"` |
| Chip | pill | zero or more, short labels | `role="checkbox"` |
| Chip (radio) | pill | exactly one, SHORT ORDINAL SCALE only | `role="radio"` |

⚠️ **THE RADIO CHIP BENDS THIS TABLE AND IS SCOPED ON PURPOSE.** It exists for
ONE case — the daily check-in's five-point scale — and the caller MUST supply a
real `role="radiogroup"`. Do not reach for it to make an ordinary multi-select
tidier. **Raise a single-select Chip variant in Figma** rather than widening it.

**Exclusive options** ("None", "Not sure", "Prefer not to say") stay
**checkboxes** and keep `role="checkbox"`. Selecting one clears every other box;
selecting a normal option clears the exclusives. Never swap them to radios —
mixing shapes in one group tells the user the whole group is single-select.
`EXCLUSIVE_OPTIONS` is the only place exclusivity is declared; an option missing
from it toggles like an ordinary one and the bug is invisible in the screen.

## Motion — board 04b (389:200)

"LUX motion is calm. Nothing snaps."

| Token | Value | Use |
| ----- | ----- | --- |
| `--duration-fast` | 120ms | hover, focus, small colour changes |
| `--duration-base` | 200ms | selection, chips, rows, toggles |
| `--duration-slow` | 320ms | sheets, overlays, page-level reveals |
| `--duration-slower` | 480ms | orb and hero entrances |

`--ease-standard` is the default for anything that enters and settles.

- **Pressed never uses a transform** — "LUX does not bounce." Overlay
  `state/pressed-overlay` at 14% instead. ⚠️ **AND IT IS A SHARED CLASS NOW —
  `pressable`, in `globals.css`, added 8 Sep 2026.** `Button` had drawn the
  board's overlay since 22 Aug and NOTHING ELSE IN THE APP DID: the nav items,
  both back chevrons, `SmallButton`, the history rows, the checked-in calendar
  discs and the add tray's method tiles all shipped with hover and focus and no
  press. Hover does not exist on a phone, so on touch — which is the frame the
  whole app is drawn at — a tap on any of them produced no feedback at all until
  the next screen painted. ⚠️ **It uses `::before`, because `.tap-target` owns
  `::after`** and a small text control can want both. ⚠️ **It is an OPT-IN, not
  a blanket `button:active` rule**: a chip, an option row and a disclosure change
  the moment they are tapped, and darkening those adds a second signal to a
  state change already on screen. It goes on the controls whose result arrives
  LATER. `Button` keeps its own inline copy of the recipe and is not a caller.
- ⚠️ **The rule that NAMES an animation must live in `globals.css`, never in a
  CSS Module.** Modules localize `@keyframes` names, so `animation: lux-fade-in`
  inside a module resolves to nothing while still reporting a duration in
  `getComputedStyle`. Use the `[data-reveal]` / `[data-reveal-stagger]` hooks. A
  module may safely set `animation-delay`, which carries no name.
- ⚠️ **Reveals use `animation-fill-mode: backwards`, NOT `both`.** `both` adds
  `forwards`, and an opacity animation still in effect leaves a **persistent
  stacking context** — every revealed block then paints in DOM order regardless
  of `z-index`. That is how the date picker ended up behind the radio rows.
- **Anything that opens a popover gets `position: relative; z-index: 1`** on its
  own block.
- **Wrap every `:hover` rule's counterpart in `@media (hover: none)`** so the
  state does not stick after a tap.
- `prefers-reduced-motion` already collapses all durations globally; don't
  special-case it per component.
- ⚠️ **A "stuck" transition in a preview pane is almost always the HIDDEN TAB,
  not your CSS.** Chromium freezes rAF and CSS transitions when
  `document.visibilityState === "hidden"`. **Verify motion with
  `element.getAnimations()`** — assert the animation exists with the expected
  duration, call `.finish()`, then check the end state. Do not sleep and re-read
  `getComputedStyle`.

## Translate, don't transcribe

The Figma frames are fixed-height canvases (440x957, 1440x900). Their internal
spacer frames are artefacts of those heights. Express the _intent_ in CSS —
flex, `100dvh`, `clamp()` — and keep the tokens exact. Component sizes, radii,
type and colour must match Figma to the pixel; page-level whitespace adapts.
Mobile frames pad 58 at the top; the build uses 40 everywhere.

## Every route is a page, and the app has to say so

**⚠️ A NEW ROUTE NEEDS A `metadata` EXPORT, AND IT IS NOT OPTIONAL.** All
seventeen routes once rendered `<title>LUX</title>`. That is a WCAG 2.4.2 (level
A) failure on its own, but it costs more than the tab label: **a title is the
only sentence available to announce a client-side navigation.**

`lib/pageTitles.ts` owns them. A flow step takes its title from `flow.ts`; a hub
route gets an entry in `HUB_TITLES`. Then the page exports
`export const metadata: Metadata = { title: metadataTitleFor("/its/path") };`.
The one dynamic route matches a regex and uses `generateMetadata`. A title names
the KIND of page, never its content — "Check-in record", not the date on screen.

**⚠️ THE APP ROUTER ANNOUNCES NOTHING AND MOVES NO FOCUS — `RouteAnnouncer`
DOES BOTH.** (The route announcer people remember is the Pages Router's; the App
Router ships none.) It is mounted once in `app/layout.tsx` and needs nothing
from a screen except that it render a `<main>`. It reads `titleFor`, not
`document.title` — Next writes the tag at its own moment in the commit, and
losing that race announces the screen the user just left.

**⚠️ `main[tabindex="-1"]:focus` IS THE ONE PLACE THE RING IS TURNED OFF**, in
`globals.css`. **No interactive control ever gets this rule.**

## Before you call a screen done

- `npm run build` and `npm run typecheck` both clean.
- ⚠️ **`npm run spacing` clean IF THE SCREEN'S LAYOUT CHANGED.** WCAG 1.4.12:
  a user may override line-height to 1.5x and letter/word-spacing to
  0.12/0.16em, and nothing may be lost when they do. Nothing else here can see
  that failure — it exists only once those overrides land on a live layout — so
  the script drives a headless Chrome over CDP (no dependencies) across 18
  routes at 320/440/1440 and reports only what the OVERRIDES caused, by
  differencing against a baseline pass. It needs a running server and a Chrome,
  which is why it is not on the same footing as `vocab`; the header of
  `scripts/text-spacing.mjs` has the three commands. `body` carries
  `overflow-wrap: break-word` as the standing safety net — see
  `docs/decisions.md`, "The layout survives the user's own text spacing".
- ⚠️ **`npm run vocab` clean IF THE SCREEN SAYS ANYTHING ABOUT A PRODUCT'S
  EFFECT ON SKIN.** It checks user-facing strings against the product brief's
  forbidden list — "this caused your reaction", "safe for you", "toxic
  ingredient", two ingredients that "clashed". That vocabulary is a
  **regulatory** constraint, not a tone preference: an absolute claim needs
  substantiating and is the language that pushes a beauty app toward
  medical-device territory. See `docs/decisions.md`, "Claim language".
- Compare against the Figma frame at 440 and at 1440.
- Check computed values in the browser rather than eyeballing a screenshot.
- Keyboard: focus is visible on every interactive element, as an `outline`.
- The route exports `metadata` from `lib/pageTitles.ts`.
- **An ARIA `role` that takes a NAME needs one.** `role="progressbar"` takes its
  name from a label and never from its value; `aria-valuetext` says where a
  thing has got to, not what it is. axe calls this `aria-progressbar-name`, and
  it fired serious on all five flow screens until `StepProgress` got an
  `aria-label`.
- ⚠️ **Settled, do not re-report: THE FLOW CTA SCROLLS WITH THE PAGE, AND THAT
  IS THE DESIGN.** `Continue` sits behind the nav pill *at rest* on flow steps 1
  and 2, the two screens that outgrow the viewport (measured 440: step 1
  `cta=852` against `nav=858`; step 2 `cta=1033`, i.e. below the fold). It is
  **not** out of reach: `.screen`'s bottom reservation
  (`--nav-inset-bottom + --size-nav-height + --space-lg` = 96) exists so the
  last element clears the fixed nav at the end of the document, and a short
  scroll puts the button fully in the clear. The chips on those screens are
  themselves below the fold, so anyone answering the screen has already
  scrolled past the overlap. Accepted 7 Sep 2026 after walking it.
- ⚠️ **AND DO NOT "FIX" IT.** A sticky footer was built for this once and
  **rejected and reverted** — `QuestionScreen.module.css` is byte-identical to
  what it was. What WOULD be a real defect: the reservation drifting out of step
  with the nav tokens so the button never clears at full scroll, or a screen
  where the overlap band is the only place the button can be tapped — the fixed
  nav wins the hit test there, so a tap leaves the flow instead of advancing it.
  See `.design/whole-app/DESIGN_REVIEW.md`.
- Contrast: ⚠️ **do not trust a clean axe run.** Every screen sits on the canvas
  gradient, so `color-contrast` degrades to INCOMPLETE — never to a violation —
  the moment a background is a gradient or a stack of translucent fills. All 17
  routes report zero contrast violations with known failures on screen. Measure
  by compositing the fill stack by hand and sampling the gradient at the
  element's own position; one representative surface is not enough.

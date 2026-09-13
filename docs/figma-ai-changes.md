# Figma change document — LUX file `wIftBhzkn8E4wjZwgdH71n`

**Generated:** 9 Sep 2026 · **Source of truth:** `docs/figma-catchup.md` §§1–7 + live verification against file `wIftBhzkn8E4wjZwgdH71n` (frames `476:2841` Check results, `581:1593` My Products, `37:9` Button) via `get_variable_defs` on the same day.

**How to use:** Hand this file to Figma AI in the LUX file. Each change names the exact variable role (collection `02 Color` plus Web code syntax), the exact frame/component node id, the exact old value that is there now, and the exact new value to set. There is nothing to look up in code — every value is stated in full. **Check whether each old value is still what you see before changing it:** at least two tokens were already corrected on live frames (`text/on-data → #2e2a3f`, `text/muted → #63636f`), so the corresponding root VARIABLE should be confirmed before editing.

**What NOT to do:** Do not repoint a `01 Primitives` ramp step (e.g. `--color-indigo-700`) instead of the semantic role that aliases it — components must never bind a primitive. Do not "correct" `surface/data-deep`'s hue onto the sage line, do not nudge its alpha, and do not brighten `gradient/brand` back toward sage — all three are chosen values. Items marked **HUMAN DECISION** are open design questions; surface a proposed design or ask the owner — do not invent a fix.

---

## 0. Variables that are already correct — verify, do not change

Live `get_variable_defs` on two different frames confirms these already resolve to the intended values. Check the *root variable* — if it now holds this value, skip the edit; if the frame only holds a local override, fix the variable so every frame resolves correctly. If unsure, verify first, then decide.

| Collection | Variable (Web code) | Settled value — do not touch |
|---|---|---|
| 02 Color | `text/on-data` (alias `--color-text-on-data`) | `#2e2a3f` (`text/primary` — the app ink). Live `476:2841` already resolves here. |
| 02 Color | `text/on-data-secondary` (`--color-text-on-data-secondary`) | `#354446` (sage-tinted). Live `476:2841` already resolves here. |
| 02 Color | `text/muted` (`--color-text-muted`) | `#63636f` (direct hex, **not** `neutral/400`). Live `581:1593` already resolves here. |
| 02 Color | `surface/frost-nav` (`--color-surface-frost-nav`) | `rgba(219,237,237,0.878)` = `#dbedede0` @88% — **the same** as `bg/bubble-ai`'s hue. Settled 22 Aug 2026. Never correct this back. |
| 02 Color | `bg/nav` (`--color-bg-nav`) | `#dbeded` fully opaque — same colour, no alpha, and the `prefers-reduced-transparency` fallback for `surface/frost-nav`. Was `#9caeaf @55%` (a different hue and still translucent — not a fallback). |
| 02 Color | `bg/bubble-ai` (`--color-bg-bubble-ai`) | `#dbeded` (direct hex, not `blue/50`). Changed 22 Aug 2026. |
| 02 Color | `bg/bubble-user` (`--color-bg-bubble-user`) | `#cadfdf` (direct hex, not `sage/300`). Changed 22 Aug 2026. |

If the root variable for any of these still holds its *old* value (see §1's "Old in Figma" column), correct it. The fact that a frame already resolves correctly may be a node-local override — in that case the variable still needs fixing.

---

## 1. Variables to edit in `02 Color` — verified stale on the live file

For each row: open Variables (`02 Color` collection, Light mode), find the role by its **Web code syntax** (the `--color-*` name), and set it to the **New value** exactly. Values listed as "direct" mean a raw hex, not a ramp alias — break the link if the variable currently aliases a `01 Primitives` step, and enter the hex.

| # | Variable (Web code) | Old in Figma (what you will see) | New value (set exactly) | Why · what to check after |
|---|---|---|---|---|
| 1.a | `text/on-data` `--color-text-on-data` | `#ffffff` (or a white literal) — **check first:** live `476:2841` already resolves `#2e2a3f` | **`#2e2a3f`** (alias it to `text-primary` / `neutral/800` if Figma allows the alias) | Sage card `surface/data` is `#7da7a9 @44%` ≈ `rgb(170,194,198)`. White on it fails at every alpha — even at 100% white is only 2.63:1. 38 of 59 text nodes on Check results failed. Darkening the ink is the only fix that keeps the sage. |
| 1.b | `text/on-data-secondary` `--color-text-on-data-secondary` | `rgba(255,255,255,.85)` | **`#354446`** (direct hex, sage-tinted, not grey) — **check first:** live `476:2841` already shows this | Needs 4.5:1 for 12–13px labels (the muted tier carries label text, so the tier must clear 4.5:1, and `#2e2a3f @82%` fails at 4.43:1). Hierarchy goes to size/weight/tracking. |
| 1.c | `text/on-data-muted` `--color-text-on-data-muted` | `rgba(255,255,255,.62)` | **`#354446`** (same value — both tiers collapse to one) | Same measurement as 1.b. |
| 1.d | `text/muted` `--color-text-muted` | `#9a9aa5` via alias `neutral/400` — **check first:** `581:1593` already shows `#63636f` | **`#63636f`** (direct hex — break the alias to `neutral/400`) | Was 2.13–2.57:1 on the surfaces it lands on; new value is 4.54–5.47:1. Lands on product-row meta, DateField placeholder, hub counts, check-history counts — all 12–16px where the large-text allowance never applies. |
| 1.e | `feedback/warning` `--color-feedback-warning` | `#c9918e` (`rose/500`) — live `476:2841` confirms this | **`#d47873`** (direct hex — do not repoint `rose/500`) | The Risky band pill + the analysis confidence pill. Old pair was a dusty red beside a dusty rose 6 chroma steps apart — read as two families. New pair is one hue (3.1°) differing only in lightness (55%/64%). White on it remains 2.65–3.12:1 — see §7 open question. |
| 1.f | `feedback/error` `--color-feedback-error` | `#a86561` (`red/500`) — live `476:2841` confirms this | **`#c65953`** (direct hex — do not repoint `red/500`) | The Avoid band pill ×3. Paired with 1.e as one scale. 4.47→4.24:1 on white. |
| 1.g | `text/warning` `--color-text-warning` | `#c9918e` (`rose/500`) | **`#d47873`** (must mirror `feedback/warning` — LUX has one warm red, not two) | No caller in the build, but moving it now keeps a first caller from inheriting the old red. |
| 1.h | `text/error` `--color-text-error` | `#a86561` (`red/500`) — live `581:1593` confirms this | **`#c65953`** (must mirror `feedback/error`) | Has a real caller: the **Remove** action on `ProductAccordionCard` (`581:1593`, `t-label` 14/20) — was 3.98/3.82/3.42:1, now 3.77/3.62/3.25:1 — a pre-existing 1.4.3 failure, logged open. Do not exempt this from the red. |
| 1.i | `border/error` `--color-border-error` | `#a86561` (`red/500`) | **`#c65953`** (must mirror `feedback/error`) | No caller; move so a first caller inherits consistency. |
| 1.j | `bg/brand` `--color-bg-brand` | `#3b305c` via alias `indigo/700` (hue 293.5) — live `581:1593`'s `text/brand` still shows this | **`#39386f`** (direct hex, hue 281.7 — break the alias to `indigo/700`) | Must match `gradient/brand`'s dark end. They sit side-by-side on `/progress` (button beside checked-in calendar discs) and read as two violets at 293.5 vs 282. **Do not repoint `indigo/700` itself** — that would drag any other alias. |
| 1.k | `bg/brand-hover` `--color-bg-brand-hover` | `#2e2447` via alias `indigo/800` | **`#2c2a5f`** (direct hex — break the alias to `indigo/800`) | Follows `bg/brand` by the same lightness step on the new hue, so the three indigos (`bg/brand`, `bg/brand-hover`, `bg/brand-soft`) share one hue. |
| 1.l | `text/on-data-muted` still aliased? — `text/on-data-muted` and `text/on-data-secondary` should both resolve **`#354446`** after the two rows above; confirm no separate `rgba` lingers. | | | |

> **Do not** repoint the primitives `indigo/700`, `indigo/800`, `red/500`, `rose/500` themselves. Five semantic roles alias `red/500`/`rose/500` and all five now declare the new hex directly in the build (`globals.css` `:root`). Repointing the ramp step would move everything aliasing it and leave no way for a role to stay behind.

---

## 2. Gradient/paint styles to repoint (indigo reassignment)

These are paint styles, **not** color variables — `get_variable_defs` returns `""` for them — so look them up under **Local styles → Paint styles**, not Variables.

| Paint style | Old in Figma (sage) | New value (indigo — set exactly) | Notes |
|---|---|---|---|
| `gradient/brand` (`37:5`, `37:9`) | `#bbd3d9` → `#637073` (sage, hue 213–215, chroma 0.016–0.027 — read on screen as a disabled steel pill) | **`#657792` → `#39386f`** (indigo, hue 258→282, chroma 0.047→0.092) | Measured white-label sweep: old 2.05/2.52/3.12/3.99/5.13 vs new **4.56**/5.62/6.90/8.59/**10.66**. The passing sage ramp `#5f7275→#3c4b4e` was built and rejected as a flat slab — this one keeps the sweep by nearly doubling chroma. |
| `gradient/brand-hover` | original pair reversed, or sage | **Same `#657792 → #39386f` reversed** (hover is the same two stops in the opposite order — no new colour, pill holds still) | |
| `button/bg-default-start` (`--color-button-bg-default-start`) + `button/bg-default-end` | `#bbd3d9` / `#637073` — mirrors `gradient/brand` | **`#657792` / `#39386f`** — mirror the two rows above | Figma holds this gradient **twice** (`gradient/brand` and `button/bg-default-*`). Both move together. `Hover` then swaps those same two; `Pressed` is a separate darkening. |
| `gradient/brand-indigo` note | "for marks and accents only" | **Remove that note/rule** — the primary button IS indigo now, so the rule is dead. `design.md` §4 carries it and it leaves with this change. | |
| `button/bg-secondary` (`--color-button-bg-secondary` `rgba(255,255,255,0.86)`) | white @86% — orphaned since Secondary moved to `gradient/secondary` | **Leave orphaned or retune/repurpose/delete.** No component binds it now. Do not silently resurrect it by re-exporting. | |

> If the `@property --grad-start / --grad-end` initial values are recorded anywhere in Figma (some export plugins carry them), update those two to `#657792` and `#39386f` as well.

---

## 3. New variables / roles to create in `02 Color` (none exist yet)

These are declared on `:root` in `globals.css` and on no Figma variable. Create each as a new variable in `02 Color` (Light mode) at the exact values below. **States where a variable also needs a hover:**

| New variable (Web code) | Value (set exactly) | Purpose · callers |
|---|---|---|
| `surface/data-deep` `--color-surface-data-deep` | **`#4f838f @85%`** = `#4f838fd9` (OKLCH L 0.578 C 0.0585 hue 214.1) | The third System B step — the `sage/700` the file never had. Four callers force white text onto sage and were failing 1.64–2.32:1; they now share this one tier. |
| `surface/data-deep-hover` `--color-surface-data-deep-hover` | **`#588c98 @85%`** = `#588c98d9` (L 0.608, same hue/alpha, one lightness step up) | Hover for the method tiles in `AddProductMethodSheet`. Must be a step BY CONSTRUCTION, not by coincidence with `surface/data-strong` (which is a different hue/alpha). White on hover is 3.43:1 — worse than base, as hover always is. |
| `text/on-data-inverse` `--color-text-on-data-inverse` | **`#ffffff`** | The **only** white-on-sage pairing in the file — and it is for `surface/data-deep` ONLY. On `surface/data` white measures 1.87:1 (the failure non-negotiable 17 was written to stop). Record the pairing beside the token: *deep sage takes white, sage card takes the ink `#2e2a3f`, neither ink is portable*. |
| `bg/brand-soft` `--color-bg-brand-soft` | **`#8284c0`** (indigo/300 on the new hue, same L/C as the old `#8e80bc`) | The moderate-likelihood pill on `ResultCards`. White on it is 3.49:1 (under AA — open question, see §7). It is the lighter half of a **two-point scale** with `bg/brand`; two hues would break it, so it MUST follow `bg/brand`'s hue. |
| `bg/frost-light-muted` `--color-bg-frost-light-muted` | **`#dbeded`** (fully opaque — the same hex `bg/nav` and `bg/bubble-ai` carry, written out not aliased) | An opaque fill for pills that sit ON a `surface/frost-light` card. At 55% the pill dissolved into the card behind it (outline passing through) and `#dbeded` on the sage card read as a white sticker — one step down from `#f4feff` fixes it. The face-diagram region chips are the first caller. |
| `border/chip` `--color-border-chip` | **`#6b8b8d`** (direct hex — sage `400 +1`, not a new hue) | The Chip's hairline. Chip had no stroke; `#dbeded` on the composited question card measured 1.03:1 — the pill had no boundary and the row read as labels. Measures 3.14:1 on the light card and 2.20:1 on the sage card (where the fill is already doing most work). Neutral borders cannot reach it (`border/subtle` 1.08:1, `border/default` 1.35:1). `07 Size` wants `sage/500` anyway. |
| `face/gradient` `--gradient-face-form` | **`radial-gradient(108% 100% at 33% 21%, #cddddb 0%, #bdd1d2 26%, #a7c0c1 62%, #a7c0c1 100%)`** (i.e. `sage/200 → sage/300 → sage/400`) | The dome of the `FaceDiagram`. Built from the sage ramp — the card's own colours — so the face reads as that surface lifting. The file has no face artwork at all (the comp was a stroked ellipse). |
| `face/shadow` `--shadow-face-form` | **`0 16px 34px -14px rgba(46,36,71,.28), inset -14px -18px 36px rgba(46,36,71,.2), inset 10px 12px 26px rgba(255,255,255,.26)`** | Paired with `face/gradient`; the deep edge is carried by the inset ink rather than a further ramp step — the sage primitives stop at `400`. |
| `face/tier-fill` `--color-surface-face-tier` | **`rgba(225,235,233,.22)`** (sage `100` at 22%) | One translucent wash for the contour levels — depth accumulates with each level rather than five hand-picked fills that could drift. |
| `face/tier-shadow` `--shadow-face-tier` | **`0 5px 12px -5px rgba(46,36,71,.2), inset 0 1px 0 rgba(255,255,255,.3)`** | Paired with `face/tier-fill`. |
| `text/success-ink` `--color-text-success-ink` | **`#46664f`** (same hue as `feedback/success` `#5f8a6e`, ink weight) | Text on the light frosted card for `Disclosure[data-tone="against"]`'s count — `feedback/success` (`green/500`) is right as a fill/stripe and fails as 12px text: 3.28:1 at 440 / 3.63:1 at 1440. This clears **5.36:1** at 440, **5.93:1** at 1440, **4.94:1** on the darkest frosted card. Addition, not retune — the existing `text/success` alias (no caller) is the natural name for this in Figma. |
| (*verify → create*) `scrim` | *(value not yet specified — one is needed)* | `state/pressed-overlay` @14% is the only dark value and measures 1.64–2.13:1 behind a sheet — far too weak for a modal scrim. Add a real scrim color (every tray currently hand-composes one). |
| (*verify → create*) `surface/data-strong` opaque counterpart | *(value not yet specified)* | `bg/nav` is the solid twin of `surface/frost-nav`; `surface/data-strong` (@62%) has no equivalent, so reduced-transparency composites the sage over `bg/canvas` by hand. Needs a real opaque value the way `bg/nav` and `bg/frost-light` are for their frosted surfaces. |
| `bg/accent-mint` — **to decide** | *(dangling — `Style=Ghost Hover` `37:19` still points at it)* | No longer exists in `02 Color`. Restore the variable or repoint the Ghost hover variant. No screen uses Ghost, so either fix is safe. |
| `nav/inset-bottom` `--nav-inset-bottom` | **`5px`** (single token, off the spacing scale) | The nav's offset from the bottom edge. Was `size/space-2xl` (24, then corrected to 5) written at six sites — nav itself, four `.screen` bottom reservations, focus scroll-margin, desktop sheet max-height, CHECK basket bar. |
| `layout/width-action` `--width-action` | **`376px`** | Primary action width on desktop. |
| `04 Radius` `radius/4xl` | **`36px`** *(new step)* | The chat panel's `radius` (see §6 table) sits between `radius/3xl` (32) and `radius/full` (999). Add as `radius/4xl`. |

> **No new collection.** Every item above lives in `02 Color` (or `01 Primitives` where noted for the ramp), `03 Spacing`, `04 Radius`, `05 Layout`, `07 Size`, `09 Motion` — whichever collection already owns that kind of token. The chat panel (see §6) adds the remaining three fills as `border/sage-subtle` `#b5c8cc`, `border/sage-hairline` `#beced2`, and `gradient/chat-panel` (see §6).

---

## 4. Stale frames & components — Figma is the one that is wrong

| Location (node id) | What is wrong | What to change to |
|---|---|---|
| `Bottom-Nav-Bar` **410:258** | Ships **three** items; needs **four**. Without it, the flow has no nav item at all, so the question screens lit **Check** on all six — telling the user they were in the compatibility check while answering profile questions. | Add **`My skin`** as the **first** item (before Progress · Check · Products). Glyph: face/skin mark, **stroke-drawn** (not filled — a solid disc at 24 is far heavier; the face only reads with eyes + mouth left open). Widths stay **380** (mobile) / **598** (desktop); no breakpoint, no new width: four items sum to 267.1 against 352 of inner width at 440 — they fit unclipped down to a 344 viewport. The three-item bar (`Check — start`, `Check-in chat`, investigation flow) is still in the three-item state — migrate every occurrence. |
| `Option Row` · `Size=Desktop` | Is **58** tall, not 56. Component notes say Size changes "only the label type" — wrong. Row hugs (17 + label + 17), so H6 at 24 gives 58 where `Label` at 20 gives 56. | Set Desktop auto-layout to 58. Correct the notes. Every desktop frame in both sections confirms this. |
| `Spec/Chat Bubble` chat bubble, desktop | Spec says **`Body 1`** 18/28 is the desktop bubble type (56-tall at one line) | **Keep `Body 1`** `t-body2-body1` as the desktop bubble spec. The `chat-page / mobile` frame setting its bubbles at 14/20 is the frame that is wrong, not the component — fix there (see §6). |
| `Chip` — no single-select variant | None exists. The daily check-in's five answers (one-word ordinal scale) bends Chip's `radio` circle into a pill job; `Timing` wants the pill look too and still uses radio rows. | Raise a real **single-select Chip** variant (the `radio`-via-pill is only safe because the chip answers are one word; this makes that legible as an intentional variant rather than a contract violation). |
| `Check-in chat` **555:1268** | **Three problems:** (a) Lights the **wrong nav tab** (CHECK) — but `Check — start` cannot reach this screen, while Progress's `Check in today` had no destination; also `Check` means product-compatibility check, not daily symptom report. (b) Draws **`Save & exit` with no progress track** — that pair together is the investigation flow's signature; this is a daily action off a hub, no step id, not in the flow. (c) Draws **only the `better` branch of turn 2** (showing "Slightly better" picked → "That's good to hear!" + Less redness / Less itching / ...). Worse/same branches and copy are not drawn. | (a) **Shipped at `/progress/check-in`, nav `progress`**. Fix the tab and the old three-item bar. (b)(c) are **open questions** — see §7. |
| `Check — no profile` **606:2183** | **No mobile frame** — Desktop only, nothing to port at 440. | Draw **440x957** mobile frame for the empty/no-profile state (same orb → 32 → `t-h4-h3` → 12 → body → 32 → primary action recipe; see §5). |
| Calendar empty cells | Every **occupied** week row is **32**; empty leading/trailing cells are **100**-tall at both breakpoints (auto-layout artefact), dragging mobile week 1 to 39 and desktop weeks 1/6 to 100. | Set empty cells to **32** — same as occupied — so every week row is 32. The real desktop calendar card becomes **358** tall (not the comp's 494); rebalance column 1's grid accordingly. |
| `Check-in detail` **556:1330** / **557:1353** | Row `Moisturizer · Applied Morning & Night` needs a product **category** and a **routine time** — LUX stores neither. | Replace row with **`Brand · Size`** (what is on the header) and **`Added <date>`** — what the build writes (the date the product was added). Or add `category` + `routineTime` to the data model — do not keep the frame's text with no data behind it. |
| `Check — start` / transition map prose | No prototype wiring anywhere on page 06 — the CHECK handoff writes transitions in prose. | **No prototype reactions needed** — note only (the handoff's prose transition map is authoritative until wiring exists). |
| All frames with metrics · calendar · chart axes · compat score | **Figtree's figures are proportional** (`1` narrower than `0`) — so `11`/`21` misalign with `30`, stacked metrics jitter, chart ticks drift, `98%`/`71%` misalign on `%`. | **Turn on lining / tabular figures** (`font-variant-numeric: tabular-nums`; OpenType `tnum`) for the text styles that carry digits: **`Metric 1` / `Metric 2`**, the **`Label Small`** ticks, the **calendar grid**, the **chart axes**, and the **compat score**. This is an OpenType setting on the text style, not a variable. (Build does it in code; Figma needs the equivalent toggle, or a note on the guide boards.) |
| Headings & paragraphs | No change needed. Figma has no `text-wrap: balance`/`pretty` and no need: frames are fixed 440 / 1440, so the build's balance re-breaks headings at the reader's own width. Heading ramp balances; prose wraps pretty; control classes (`Label`, `Label Small`, `Button`, `Button Small`, `Overline`) are deliberately left alone. | **Do not "fix"** a comp that breaks 3+1 vs the build's 2+2 — the build is right. If anyone files it as drift, close as intentional. |
| `Small Button` (225:60/61), `Bottom-Nav-Bar` (410:258) | **No `State=Pressed` variant** exists. Board **04b** (389:200) says pressed is `state/pressed-overlay` @14% + no scale, but the component sets do not draw it. Build draws it via a shared `.pressable` class on 7 controls. | Either add **`State=Pressed` variants** to those two sets, or **note on 04b** that the overlay is the pressed treatment for every action control and the sets do not draw it. Inline text links (`View previous analyses` etc.) are intentionally not covered — pressed on a radiusless link would read as a highlighter. |
| Mobile frames' top padding | **58** at the top; the build uses **40** — and the spacing is what "translate, don't transcribe" covers. | **Do not file as drift.** Everything below the page inset is pixel-exact. |
| Buttons · Secondary's 1px stroke | **Unresolved disagreement.** Figma keeps a 1px `border/default` on `Style=Secondary` (with both styles now on gradients, the stroke is what separates Secondary from Primary). The build draws **no border**, reasoning that `border-width-hairline` is unused elsewhere. | **DECIDE THIS ONE.** If the stroke stays, add it in code; if it goes, **drop it from the Secondary variant in Figma** — Secondary is then distinguished by its gradient (`#deeff3 → #b7c6ca`) alone. |
| `Button` — `State=Pressed` for all styles | None exists (same as above). | Add or note on 04b as above. |
| `Button` — `Style=Ghost` | Not implemented in code (`primary` / `secondary` only); its **Hover still points at the deleted `bg/accent-mint`**. | See `bg/accent-mint` in §3 — **restore that variable or repoint** the Ghost Hover variant. No screen uses Ghost, so either is safe. |
| `Button` — `button/bg-secondary` | `white @86%` — **orphaned** since Secondary moved to a gradient. | Keep orphaned, or delete/repurpose — do not silently resurrect by re-exporting. |

---

## 5. New screens & flows for Figma to absorb

These are **prototype-led** flow changes under the rule *prototype leads on flow, Figma leads on pixels* — each is flagged `⚠️ NOT IN FIGMA` in code. Draw them.

### 5.1 My skin — a fourth nav section

- Add **`My skin`** as the **fourth nav** section (see `410:258` fix above).
- Its landing is step 1 at **`/investigation/start`** — stays a flow step (track, `Save & exit`, back chevron all kept).
- The flow's title on step 1 is **`Create skin profile`** (not `Start investigation`) — the label already on `Check — no profile` (`606:2183`) for this destination.

### 5.2 The flow now recaps the profile before it asks for products

| Item | Value |
|---|---|
| Route | **`/investigation/profile`** — a pushed recap between step 4 (Timing) and step 5 (Your products). |
| Step semantics | **Not a step** — no progress track, no `Save & exit`, back chevron kept. `TOTAL_STEPS` stays 5 (track still reads 4/5 on Timing, 5/5 on Products). |
| Title | Uses the recap's **label wording** (see below). |
| Action | One action: **`Add products`** → step 5 (`/investigation/products`). |
| Shape | **One block per answer**, NOT a `label: value` card. A multi-select is a SET (wants pills) and a face region is a PLACE (wants its diagram). |
| Empty state | **Reaches with nothing behind it** (answers expire after 24h, lapsed/other-browser/deep-link). Draw as the **app's empty-state recipe**: orb → 32 → `t-h4-h3` title → 12 → body → 32 → primary action, centred on bare canvas with no card. Exactly `Progress — empty` / `Check — no profile`. Keeps its **back chevron** (unlike those two hub landings — this is not a landing, it has something behind it). |

**Blocks inside the recap and which Figma recipe each borrows:**

| Block | Recipe to compose from |
|---|---|
| Skin type · Tendencies · Known conditions | **Sage `DataCard`** — Surface System B (`surface/data`, `surface/frosted-data`, `radius/2xl`, 20/24 padding, no stroke). `t-overline` heading over two labelled columns, then a full-width row; multi-select values JOINED at `t-button` (17), not pilled. Same card as `Analysis`'s verdict. |
| Symptoms | **`Tag` (256:85)** `Neutral`, but on **`bg/frost-light-muted` + `border/chip` hairline** — i.e. **Chip's default fill + hairline** — inside a System A (frost-light) block. Needs `Tag`'s new **`Style=Outlined`** variant (§3, 26 tall, `Label Small`, `text/secondary`). Wrapping row of pills. |
| Other locations | Inside **`face-diagram-card`**, in its own chip row under the dome — as **read-only pills in their selected state** (`Chip` selected, 40, `Label`, `bg/brand`) rather than `Chip` controls. |
| Where on the face | **`face-diagram-card`** (step 1's card) **at the same 392×300** card size, in a **new read-only mode**: dome + seven pills at the same coordinates (picked = filled, unpicked = 55% without lift) **+ the chip row underneath**. In code this is one `readOnly` prop; in Figma this wants **`State=Read-only` on `face-diagram-card`** covering the chip row too — not a second component. |
| The photo | `Check-in detail`'s photo well (`surface/data-strong`, `radius/lg`) + `CheckInPhotoArt`, with a `SmallButton` opening the existing `SelfieSheet`. |
| All of step 4 (Timing) | The *Current state* block (was *What you noticed*, with the symptom pills, until 13 Sep 2026): **`<status>`** as the block's value, then **`Started on` over `<date> · Day <n>`** — the card's label-over-value shape. The symptom pills are removed from the recap for now and are moving onto the face diagram. |
| Action | **`Button` primary**, full-width at mobile / `width/action` (376) at desktop. |

**Wording decided** (labels on this screen; do not rename): *Current state* (the block heading; was *What you noticed* until 13 Sep 2026), *Where you noticed it*, *Known conditions* (was *Known skin conditions* until 13 Sep 2026, shortened on request), *Started on*, `Day <n>`, *Current state*. They do **not** name the symptoms and are **shorter than before** — *Symptoms started* / *Symptoms now* repeated "symptoms" three times with the pills right above; sitting under those pills the subject is already on screen. **`Current state` was bare `Now` until 8 Sep 2026** — beside *Started*, an adverb with no noun read as another timeline point, not a different fact about a different moment.

**Also needed on the recap — and the real DS asks:**

1. **Read-only face diagram** = that `State=Read-only` variant (entire card including chip row).
2. **A span-of-time component** — the two-line text replaced a 10px-disc rail (vertical at 440 / horizontal at 1440, `border/default` far + `bg/brand` near, hairline between). The rail was cut for this screen but **PROGRESS, the analysis, and this screen all state spans of time and none draw them the same way** — the DS gap survives the cut.
3. **The tag-as-chip ground** = that `Style=Outlined` `Tag` (see above) — asked for directly 7 Sep 2026, fenced to control-free screens so no real chip could be confused.

### 5.3 The investigation ends in an ANALYSIS — the biggest gap in the file

Page `06. Screen Designs` has **no analysis or result frames outside CHECK**. The prototype's culprit finder (`docs/product-brief.md` §§05–12) ships as **one screen with states**, at routes `/investigation/evidence` → `/investigation/analyzing` → `/investigation/findings`. They were cut from three screens to one (three more screens between step 5 and an answer read as three more steps). They are **pushed views, not steps** (no track, no `Save & exit`, back chevron kept) and step 5's Continue ends at `/investigation/evidence` (not the Products hub).

Draw **both breakpoints** (440 / 1440) for:

- **`Analysis — running`** — the orb `thinking` + the **six named passes ticking through inside the page card** (not a bar, not its own frame; transparency is the point and the wait is a state).
- **`Analysis — result`** in **three outcomes**: a leading hypothesis, several that still fit, and **not enough evidence** (where most real runs land — a designed answer, not an error).
- Two **conditional strips** on the result: the ambiguous-product question (usually absent) and the reminder **"no cleanser in your list"** (a reminder, never a gate).

**Colour is constrained by measurement.** The verdict is a **sage `DataCard`** — one System B card on a screen of System A ones (that is what makes the answer findable). Below it: a **warm** stripe+pill on the strongest hypothesis, **green** on what history ruled out, **grey** on weak. `feedback/warning` is 1.24–2.36:1 and `feedback/success` is 1.84–3.50:1 composited on these surfaces — **neither can be a text colour anywhere on this screen**, and white on `feedback/warning` is 2.65 (the `CompatCard` band-pill failure under non-negotiable 17). So the accents are **fills and stripes with measured ink beside them** — a Figma component for this must not put those greens/warms as text.

**Four components go with this screen (see also §8):** `Reasoning accordion` (the third accordion — six sections, stacked, hairline between rows not a card each), `Hypothesis card` (frosted-light, deliberately **no score/bar/percentage** — unlike `CompatCard`), `Ranked list` (one card holding numbered rows, ordinal as small indigo disc), `Pass list` (named steps ticking with `SuccessCheckIcon` in a fixed-width slot; 6 passes on the analysis, 5 on `Check — analyzing` `605:2163`; the 8px `analysis-bar` is no longer drawn).

### 5.4 Step consolidation

- **`02b Skin tendencies` merged into `02a`**; **`03b Location` merged into `01`** — one screen each, with Continue gating on both answers. The track reads **1/5**, not 1/8. `03a Observable symptoms` was dropped entirely.
- **`01`'s `Other` field now asks WHERE:** `Other, describe where` over placeholder `Describe where you noticed it` (accessible name **`Other, describe where you noticed it`**, comma not en dash). Draw both states on the merged step-1 frame. Also draw a **filled** state — the sentence is read back on `/investigation/profile` under `Where you noticed it` as `Other, in your words` over the sentence. (`592:1510`, `476:2542`, `476:2670`)

### 5.5 Conditional safety notice on step 1 (`476:2542`, `476:2670`)

- Ticking **`Swelling` or `Rash`** — the only two symptoms on this screen that appear on the product brief's §03E trigger list — **reveals a notice under the chip grid:** LUX cannot judge how serious a reaction is; see a doctor or pharmacist if severe.
- **Does not interrupt the flow and does not gate Continue** — a deliberate departure from the brief (which asks for a full interrupt on nine clinical triggers): the app stating its limit and leaving the judgement to the reader instead. See `features/my-skin/safety.ts`.
- Draw the notice **on both breakpoints in a `symptom = trigger` state**. Compose from the frosted-card recipe the TOP card `476:2542` already had (**`radius/lg`**, **`surface/frost-light`**, hairline **`border/subtle`**, **`t-overline` over body**) — that DISCLAIMER was cut in `f3edc75` when 01+03b merged and has now been reused. If the frame still shows that top-of-stack disclaimer, it is the **stale** version. Accent = **`feedback/warning`** (see §8 *Callout/notice*).
- This screen needs **no translation string change** beyond hiding the old disclaimer's place.

### 5.6 Selfie capture — a tray, not a route (`487:834`, `490:1041`)

- Was a routed step carrying a progress track while sharing step 1's number (so the track never moved) and scrolled the just-picked symptoms/regions out of sight.
- **Ship it as a tray overlay** instead. Same measurements, same recipe; only the container changes. No track on the tray.

### 5.7 PRODUCTS — twelve screens → one screen + one tray

- Three time-**period** screens in sequence. Now: **add a product, say how long you have used it, app sorts**. The duration is asked **with the product on screen** (`DURATIONS` radios + `Not now` beside `Add to my products`) — how long you used something is a fact about that product, not a mode to enter beforehand.
- **`Long-term products list` + route gone** (`581:1593`, `583:1924`) — a pushed view whose content was a title+count the hub row already stated. Category rows are dropdowns; cards open in place.
- **"Not sure" is a fourth group** — appended only when non-empty, kept **out of the three designed periods**. Do not bin it into Long term.
- **Time window moved onto the hub rows** (`579:1607`, `581:1593`) — bucket is 1:1 from duration, so every card in a group carries the same one the page title already names. A badge down a headed screen is noise. Window sits **beside** the name, never under (56-tall row would break).
- **An expanded product card leads with `Added`** and opens **Ingredients** as a nested disclosure (INCI 15–25 terms as a right-aligned value would push every other card off-screen). Brand + size stay on the header (so the panel must not restate them and bury the one fact only it carries). (`581:1593`)

### 5.8 CHECK — eight screens are five routes; the basket stopped being modal

- The basket **lives in the docked bar** now (`tray-bar`, `650:2513`): always visible, never covering the list, counting up. The drawn sheet (`604:2103`) is still the drawn sheet — opened deliberately to review/remove. Modal-on-first-add plus `tray collapsed` plus `Add at least 2 products` are gone; adding is not a confirming decision — it is the loop.
- **`Check results` listed its products twice — the Edit tray is gone** (`476:2841`, `476:2851`). `compared-products` (`476:2851`) drew a header row with `Edit` and `bottom-sheet` (`604:2103`) listed the **same products the five `analysis/…` cards below already list** (and covered them). The row is now **the header of a BOX** (fill on the container, cards **inset 8**, **`surface/frost-nav`** not `frost-light` — a frost-light box around frost-light cards has no edge). Each card needs a **`COMPACT` variant** (padding 12, radius 8, opaque fill, no stroke) beside `product · …`'s. **Editing the set does not re-score the screen** — a product added after the check ran renders a scoreless **`Not analysed yet` row (no percentage, do not borrow one)**. Inside the box's Edit mode: a **✕ per row** + **`Add another product` at the foot** (neither at rest), and **no chevron** on the header — a disclosure glyph on a non-disclosing control. **Adding opens a picker inside the box** — a `Search Field` over `/check/new`'s search; products already in the user's library are already in the box, so the remainder is by definition things never mentioned. That picker deliberately does **not** open with its own library list. **Needs frames:** the `DURATIONS` prompt for a product added this way (the ownership ambiguity — a check does not imply ownership), and the scoreless row.
- **Step 5 is the one flow screen that does NOT light `My skin`** (`574:1342`, `582:1612`) — it is still an investigation step (track, `Save & exit`, in the flow) but what it puts on screen is the **Products list** shot. Lighting `My skin` named the flow while the screen read Products.

---

## 6. Chat page — `chat-page / mobile` (270:96)

The only free-text conversation surface, built at `/chat` 4 Sep 2026 from spec column `col` (274:99) captioned "Mobile · 375". Nothing links to it yet — it is **not** one of the four nav sections (which is why `features/chat/` exists against the four-section rule). Frame is a **panel floating on the canvas** (375×538, 36 on **all four** corners, own gradient fill) — every other frame is the 440×957 canvas. Build treats it as a surface floating on that gradient (which is the only reading under which the kebab/chevron mean anything).

### 6a. Nine values off the published scales — what to add / what to move the frame to

| Value (as drawn) | Where | Nearest published | Do |
|---|---|---|---|
| `radius` **36** | the panel itself | `radius/3xl` 32 · `radius/full` 999 | **Add `radius/4xl` = 36** (see §3) |
| `gap` **6** | bubble → timestamp | `space/2xs` 2 · `space/xs` 4 | **Add `space/6` = 6**, or move the frame to **4** |
| glyph **18** | `more-vertical` | `size/icon-xs` 16 · `size/icon-sm` 20 | **Move the frame to 16** |
| glyph **14** | `chevron-down` | `size/icon-xs` 16 | **Superseded — see 6f:** control is now a **16 close X** |
| `stroke` **0.2** | composer field | `border/hairline` 1 | **Move the frame to 1** — 0.2 is under a device pixel; Chrome rounds to 1 |
| `text` **11** | `Today` label | `Label Small` 12/16 | Build uses **`t-label-sm` (12)** — move the frame to 12 |
| `text` **10** | both timestamps | `Label Small` 12/16 | Build uses **`t-label-sm` (12)** — move the frame to 12 |
| `text` **14/20** | both bubbles | `Body 2` 16/26 | **Build wins:** the frame's 14/20 contradicts both `Spec/Chat Bubble` (47:12) and all nine GETTING STARTED frames at `Body 2` — **move the frame to Body 2** (see 6c) |

### 6b. Four fills with no variable — publish them

Drawn raw; in the build they are local custom properties in `ChatScreen.module.css` rather than tokens, so nothing can reuse them until Figma publishes them.

| Fill (as drawn) | Where | Nearest token | Raise as |
|---|---|---|---|
| `linear-gradient(116.756deg, #dbebed 36.39%, #d1e1e5 53.77%, #c3cdd9 105.01%)` | the panel itself | `gradient/canvas-mobile` — close, but lighter top+bottom, which is what separates the panel from the canvas underneath | **`gradient/chat-panel`** |
| `#b5c8cc` | date-divider hairlines | `border/subtle` `#e2e4e8` and `border/default` `#cbcdd4` — both neutral, wrong on sage | **`border/sage-subtle`** |
| `#beced2` | composer hairline | as above | **`border/sage-hairline`** |
| `#606d75` | day label + both timestamps | between `text/secondary` `#4b4b57` and `text/muted` `#9a9aa5` | **Move the frame to `text/secondary`** (see 6e — this deletes the need for this fourth fill) |

### 6c. Bubble type — the component wins

The frame sets `14/20`; `Spec/Chat Bubble` (47:12) + nine GETTING STARTED frames set `Body 2` (`t-body2-body1`). Two Figma sources disagree; the **published component wins** — a bubble two steps smaller only here is drift, not a different surface. Everything else in the frame's bubbles (30/1 tail corners, `bg/bubble-ai`/`bg/bubble-user`, fill+two-shadows recipe, no stroke) already matches the component. Move the frame to `Body 2`.

### 6d. Two glyphs the DS does not have — owned by Chat

Both exported from the frame; live in `features/chat/components/icons.tsx`, **not** `components/ui/icons.tsx` — a glyph used by one section is that section's until published. (§8 also lists these.)

- **`more-vertical`** (270:102) — stroked kebab; no overflow-menu glyph anywhere in `02 Icons`.
- **`send`** (270:120) — white arrow on the composer's disc. Disc is **`gradient/brand` at `radius/full`** (same recipe as `Button`, built as CSS). **The frame rotates the whole `Send` node 43°** to turn an up-and-right triangle into an along-field arrow — disc being a circle, only the path shows. **Draw the glyph at its final angle and drop the transform.**

### 6e. Two contrast failures — measured hand-composited

`color-contrast` is INCOMPLETE on gradients — axe reports zero violations with these on screen. Each is measured by hiding the text, screenshotting the surface underneath, and reading the composited pixel at that element's own position. Reproduced as drawn, not quietly darkened — the frame is authoritative on colour.

| Text | Ink | Behind it (composited) | Ratio (needs 4.5:1) | Fix in Figma |
|---|---|---|---|---|
| Composer **placeholder + typed text** | `text/on-brand` `#ffffff` | `#183036 @15%` composites to `#b2c1c7` over the panel gradient | **1.85:1** | **HUMAN DECISION** — either darken the field fill well past 15% or re-ink the text. Typed text inherits the same colour, so this is not just a placeholder problem. |
| **`Today` + both timestamps** | `#606d75` | `#dbebed` / `#d4e4e8` | **4.34:1** / **4.07:1** — misses by a hair | **`text/secondary` `#4b4b57` passes 7.01:1 / 6.57:1** and is the token for this job. Move the frame to it — it deletes one fill in 6b. `text/muted` does NOT work here (2.27/2.13:1 — worse). |

### 6f. Two things the build decided (chat-panel specifics)

- **Send disc has NO disabled state** — diverges from `Button` deliberately. Built gated, then cut: `opacity/disabled` (0.4) on a sage disc over a sage panel made the resting state have no send affordance. The frame correctly draws a **full-strength disc beside the empty placeholder**; empty submit is a no-op. No Figma change — logged so no one "fixes" it back. The spec to record: **full-strength at rest, no faded state.**
- **Close is an X, not the frame's `chevron-down`** (5 Sep 2026). Chevron says *fold away and unfold*; pointed at a route change it promises state the app cannot return to (nothing links back to `/chat`). X says the thing goes away — which is what happens. Uses the DS's **`CloseIcon`** at **`size/icon-xs` 16**, deleting one off-scale value in 6a. **Change the frame's control to X**, or explain why the panel should read as foldable.
- **The kebab has no behaviour and is rendered `disabled`** on the panel. No flow defines what it opens; chevron/X does have an obvious one (collapse panel → Welcome). Figma needs to **say what the kebab is for, or drop it**.

### 6g. No desktop frame

Column captioned **"Mobile · 375"** and nothing else draws this screen. Until a 1440 frame exists, the build keeps the panel at 375 and **centres it on the gradient**. A desktop drawing is wanted.

---

## 7. Open design questions — do NOT auto-fix

These were **deliberately left failing** in the build. Fixing any of them moves a surface/meaning — a design call. If auto-applying the document, **skip this section entirely** and surface it to the owner.

| # | Location | Measurement | Why it needs a human |
|---|---|---|---|
| 7.1 | `surface/data-deep` (`#4f838fd9` @85%) — the new System B tier (§3) | White composites **3.42–3.77:1** depending on backdrop (against 4.5:1; large text passes at 3:1). | White and the app ink cross over at almost the **same lightness** on the card backdrop — **3.71:1 vs 3.73:1** (0.02 apart). So **neither ink passes and no ink choice fixes it** — only the surface can move. Darker (`#407375` opaque → white 5.35:1) or lighter (ink returns to 4.6:1+). Also **15° off the sage hue** (214.1 vs `surface/data` 199.8) — a bluer, cooler read than its parent tier. Both are **chosen** values — do not nudge them. |
| 7.2 | Compatibility **band pills** — `Check results` `476:2841` + check history + **`HypothesisCard`'s confidence pill** on `/investigation/analysis` | White on `#c65953`/**`#d47873`** = 4.24:1 / **3.12:1** (both failing after the §1 retune — Avoid dropped 4.47→4.24 and Risky 2.65→3.12). The analysis pill puts the **app ink `#2e2a3f`** (on brand) — was 5.22:1 on `#c9918e`, now **4.43:1** at 12px `t-label-sm` — under by 0.07. It is **pinned to the same fill as the CHECK pills** by explicit refusal on 8 Sep 2026 (two warm pinks one step apart for two meanings is what the retune was to end). | Three pills on two sections after the §1 retune. **Only the fill can close it now** — the analysis card already takes the better ink. Either darken both bands or drop the white pill text. On `#d47873` / `#c65953` (one hue, near-equal saturation — differ only in lightness) the fill alone cannot distinguish Risky/Avoid; the **label is load-bearing** and `check.ts` states the band in text + `aria-label` on every row for that reason. Document or separate the hues. |
| 7.3 | **`Remove` action** — `My Products` `581:1593` (`ProductAccordionCard`, `t-label` 14/20, `text/error` over `surface/frost-light`) | **3.77 / 3.62 / 3.25:1** at three x-positions on the gradient (was 3.98/3.82/3.42 before the red moved) — was already failing 1.4.3 and is 0.2 worse after §1. | The only destructive control on these screens — the **word** carries it. Do not close it by exempting `text/error` from the single red — LUX has one red, not a band red + control red six points of saturation apart. DARKEN the red for all roles together, or accept the word is load-bearing. |
| 7.4 | **`bg/brand-soft`** (`#8284c0`) · 12px white label | **3.49:1** (was 3.52 before the hue fix — 0.03, not a new failure) | Indigo/300's job is to be the lighter half of a two-point likelihood scale; a fill light enough to read as "less" is one white struggles on. Same open question as 7.2. |
| 7.5 | **`Secondary`'s 1px `border/default`** — see §4 | Indecisive. | Keep the stroke (separates Secondary from Primary now both on gradients) → add in code, or drop it → **remove from Figma's Secondary variant** (gradient alone distinguishes). Pick one so code and file agree. |
| 7.6 | **`Check-in chat` `555:1268`** — two open parts | See §4. | `Save & exit` without a progress track (see §4 — contradicts the investigation flow's signature pairing) and **worse/same branches untitled**. Draw remaining branches + confirm copy for them. |
| 7.7 | **`border/glass` as today's ring on the calendar** (`surface/data`) | **1.44:1** vs 3:1 for non-text state. No other Today indicator. | Give Today a **second signal or a darker ring** — the state is invisible to a low-vision reader. The `border/glass` divider INSIDE a data card (decorative) stays white. |
| 7.8 | **Chat composer typed-text legibility** | `text/on-brand` on `#b2c1c7` = **1.85:1** — see §6e. | Typed text inherits placeholder ink — field fill must go much darker or text must be re-inked. |

### Still-standalone decisions on existing flows/components

| Topic | Decision still wanted |
|---|---|
| **`Products` hub: timing chips vs streak** — the streak/compass is retained but chips untabbed | Whether `Timing` wants the pill look it has had since it was built (currently radio rows). |
| **Compatibility wording** — `check.ts` now states the band in text on every row | Whether the sentence + `aria-label` wording stands as the resolved band-pill question (7.2). |
| **Pressed on `Small Button`/`Bottom-Nav-Bar`** — board `04b` is the only source | Add `State=Pressed` or note it — see §4. |
| **Pressed on inline text links** (`View previous analyses`, analysis reminder link) | Open — they have no radius/padding; overlay reads as a highlighter box. What should a pressed text link look like? |

---

## 8. Components the design system does not have

Every item below is **composed from tokens in Figma** — not invented in code — but no Figma component keeps it in sync. Raise them so the recipes stop repeating. Each entry lists the surface/system and key tokens so a Figma AI knows what to reuse.

| Component | Surface / recipe | Key tokens | Notes |
|---|---|---|---|
| **Data card** | **Surface System B:** `surface/data` `#7da7a9 @44%` + `surface/frosted-data` (`shadow-frosted-data` + `blur-card` 28/32) + `radius/2xl` + **20/24** padding, no stroke | — | Every Progress and Check card is composed from this. |
| **Skin-profile strip** | System B, same recipe but **86-tall strip** with **18/20** padding | — | The one sage element on a Check screen. |
| **Modal tray** | `Bottom Sheet` (`255:91`) has no backdrop blur and a fixed light content slot | needs the **scrim** token | Every tray is hand-composed without one. |
| **Camera / Shutter** | Three capture surfaces — selfie tray, products scan, check-in photo | `shadow/sm/md/lg` | Raise one component, migrate all three. |
| **Search dropdown** | Search (`248:70`) has no results popup | — | Comps drew results as free-standing cards on a routed screen. |
| **Text input** | On `other-input` (02c/03a) + `03c`'s date field | — | `Search Field` is search-specific — these two are hand-composed too. |
| **`Date picker`** | Native popup — browser-drawn, no token reaches inside | — | Needs a DS calendar component beside it. |
| **`Calendar (record)`** | Read-only, **Sunday-first** (date picker is **Monday-first** + interactive); both match their own frames | `radius`/`space` as drawn | On the handoff's missing list — **do not merge** the two week-starts. |
| **`Line chart`** | Drawn from data, not the comp's baked vector | `size/icon-*`, colour for the stroke | On the handoff's missing list. |
| **Accordion** | Composed from the **frost-light** card recipe | `surface/frost-light`, hairline `border/subtle` | Used in two places on two surfaces. |
| **Compat accordion** | **Different surface + header** than the first, plus a **band** that drives pill + score + bar fill together (`band` prop) | — | Second accordion — do not drift the three. |
| **`Reasoning accordion`** | **Third** — the six §08 sections on `/investigation/analysis`, stacked **in a group** with a **hairline between rows** (not a card each) | `ProductAccordionCard`'s recipe via `Disclosure` | Now the strongest case for ONE accordion component — three accordions on three surfaces. Migrate all three. |
| **`Hypothesis card`** | **System A** frosted-light on the analysis screen | same as Data card but System A | Overline + headline + **confidence `Tag`** + products + the Reasoning accordion stack. **Deliberately no score/bar/percentage** — unlike `CompatCard` (same species, different question). A Figma component must not grow one. |
| **`Ranked list`** | **System A**, one card with numbered rows (ranking is the content; rows-as-cards would lose it) | Ordinal = **small indigo disc**, meta-sized — a **position**, not a metric | §11's investigation-priority list. |
| **`Pass list`** | `SuccessCheckIcon` in a fixed-width slot so lines do not reflow as ticks land; **`analysis-bar` is no longer drawn** | — | Both analysing screens use it: analysis names **§06's six passes**; `Check — analyzing` (`605:2163`) names **five** (no timeline/tolerated). 8px bar says only "something is happening" — the list says what. |
| **`Status pill`** | **Not `Tag`** — `Tag` is `Neutral/Brand` only; these carry `feedback/*` | `feedback/warning` / `feedback/error` + see §7.2 | The compat status pills. |
| `Face-region picker` | **392×300** `face-diagram-card`; region coords are **% of that card** so it scales | `face/gradient`, `face/shadow`, `face/tier-*`, `bg/frost-light-muted`, `border/chip`, `bg/brand` for selected | The coords **are** the design — "Cheeks (L)" only means left cheek because of where it sits. The diagram tint lives under the 86-tall sage strip. |
| `My skin` nav icon | Stroke-drawn, not filled (see §4) | — | DS has no face/skin mark anywhere. |
| `Product imagery` | Nine vessel silhouettes by **packaging type**, tinted per brand | — | Every thumb/image well drew a camera — identifies nothing down a list. Raise a real illustration set. |
| `Check-in photo` | The photos card's content is a picture; camera glyph says "no photo" on a record of one taken | — | Raise real imagery (not a camera). |
| **`Callout / Notice`** | Frost-light card recipe: `radius/lg` + `surface/frost-light` + hairline `border/subtle` + **`t-overline` over body**; **CONDITIONAL** (no frame draws it) | **`feedback/warning` accent** (DS has no warning glyph either — `02 Icons` has 13, none means caution) | Step 1's optional notice under the chips on `Swelling`/`Rash`; analysis had no frame; product brief §03E's full-interrupt is deliberately not reproduced. DS has no `ACCENT` of any kind for this. |
| **`Snackbar / Undo`** | Floating over the screen, sitting **`nav-inset-bottom + size/nav-height + space/lg`** above the bottom edge, centred; same frosted pill as **`Bottom-Nav-Bar`** (same fill/rim/shadow/blur + reduced-transparency fallback) | `space/md`, `radius/2xl` (**not `full`** — `full` at two lines draws 26px lozenge ends crowding first/last word) + `z-toast` 500 (already in `08 Elevation`, first use) | **No fixed height** — a product name takes two lines at 380 and more under text-spacing overrides. One action (`Undo`) + message slot; **6s dismiss**, **pauses on hover/focus**, only one on screen. The file has no toast/snackbar/transient of any kind — `--z-toast` was reserved unused until 8 Sep 2026. |
| Chat `more-vertical` + `send` glyph | Stroked kebab + white arrow on branded disc | `size/icon-xs` 16, `gradient/brand` | See §6d — owned by `features/chat` until published. |
| **`Search dropdown` + `Text input` + `Date picker`** effects | — | — | See above — still missing. |

> Two of the three undecided `border / face / pills` questions that blocked the My skin screens now carry this list as explicitly-decided prose — the remaining one is the chip/single-select decision (§4).

---

## 9. Figma surface model — quick reference (paste into a handbook frame)

```
System A  (light frosted forms)     · on the canvas gradient
  surface/frost-light  #f4feff @55%   cards, page card, question cards
  surface/frost-nav    #dbeded @88%   the floating nav pill (shares colour with bg/bubble-ai)
  surface/frosted-data effects: shadow-frosted-data + blur-card (28/32)
  bg/bubble-ai #dbeded  bg/bubble-user #cadfdf   opaque, GS 100% · same hue (G==B), two lightnesses
  Never put a translucent surface on a bubble.

System B  (dark sage data cards)    · sage that carries its own ink
  surface/data         #7da7a9 @44%   takes the app ink  #2e2a3f · 4.6+(tbd)
  surface/data-strong  #7da7a9 @62%   same hue, stronger — needs an opaque twin
  surface/data-deep    #4f838f @85%   third step · takes white · 3.42-3.77 · chosen, 15° bluer, still short
  Call #ffffff "text/on-data-inverse" only on -deep — never on -data.

Tokens you must bind via a semantic role, never a primitive:
  01 Primitives (indigo/sage/blue/neutral/green/rose/red) → 02 Color semantics → components
  :focus-visible  — 2px indigo ring (border/focus · indigo/600)
  ::selection / caret / accent-color — bind bg/brand (#39386f) so the browser chrome matches

Small rules that live nowhere in components:
  Pressed: state/pressed-overlay @14%, no scale (excludes radiusless text links)
  Disabled: whole control at opacity/disabled 0.4
  Button hover: gradient reversed (same two stops, swapped)
  Metrics / calendar / chart ticks / compat score → tabular-nums (tnum)
  motion/board 04b is the authority on pressed; buffer motion does not own a variable
```

---

*End. For the canonical reasoning (full measurement tables, the rejected `#5f7275→#3c4b4e` button, the twin-gradient decision), see `docs/figma-catchup.md` and `docs/decisions.md` in the repo. This file says what to do in Figma; those files say why.*

# LUX — Design System Working Guide (`design.md`)

Companion to the **Lux** Figma file. Read this **before** touching the design system or building any LUX screen — in Figma or in code. It captures conventions, hard-won gotchas, and how to keep designs consistent. Written for a fresh Claude Code chat to continue the work without repeating mistakes.

> **Last major pass: 14 Aug 2026.** The file was reorganised, the token system rebuilt, and two guide boards added. Sections marked ⚠️ changed in that pass — if you remember older values, they are stale.
>
> **22 Aug 2026 — THE BUTTON'S HOVER AND DISABLED STATES TRADED PLACES.** Hover
> is now `gradient/brand-hover` (the brand gradient reversed) at full strength;
> disabled is the whole control at `opacity/disabled` (0.4). Everything below
> describing hover as a 0.4 fade, or disabled as `state/disabled-bg` + a 1px
> `border/default` + a `text/muted` label, is **stale** — see §7.
>
> **21 Aug 2026 — PRODUCTS was built in code**, and implementing it corrected four things the file had wrong: `Size=Desktop` rows are 58 not 56, desktop chat bubbles are `Body 1` not `Body 2`, `Button` `Style=Secondary` had the last unbound fill in the set, and the modal trays had no effect style. See §4 and §7.
>
> **4 Sep 2026 — RECONCILED AGAINST THE BUILD.** PROGRESS and CHECK shipped
> after the last pass, the investigation flow became its own nav section, and an
> accessibility audit moved several token values. Nine places were corrected;
> each carries a dated ⚠️ note naming what changed. The ones that matter most:
> Surface System B's text is **dark, not white** (§4); `text/muted` is `#63636F`
> (§4); `gradient/brand`'s start is `#A2B9BF` in code (§4); the nav has **four**
> sections, not three (§5); the check tray's resting state is the **docked bar**,
> not the modal sheet (§5); and PRODUCTS' twelve-screen add flow is one screen
> and one tray (§5).
>
> ⚠️ **THIS FILE IS THE FIGMA SIDE; `AGENTS.md` (repo root) IS THE CODE SIDE.** They
> answer different questions — this one says what the design system *is* and how
> to build in Figma; that one says how to build a screen in the repo without
> drifting from it. Neither is a copy of the other. Where they disagree, the
> **code** is the truth about what shipped and **this file** is the truth about
> what Figma holds. Every gap between them is listed in
> `docs/figma-catchup.md`, the work order for updating Figma.

---

## 0. Fast facts

- **Figma file key:** `wIftBhzkn8E4wjZwgdH71n`
- **Product:** LUX — an AI-guided skincare *investigation* web app (mobile + desktop).
- **Typeface:** **Figtree** (was Poppins early on — do NOT reintroduce Poppins).
- **Tooling:** the official **Figma MCP** (`use_figma` to write, `get_metadata`/`get_screenshot`/`get_design_context` to read). Load the `figma-use` + `figma-generate-library` skills before `use_figma`.
- **Start in Figma at board `00 · Start here` (`386:200`)** — it is the in-file version of this document and is generated from the live file, so it is the more current of the two.

### ⚠️ Pages (renamed + reordered 14 Aug 2026)
| Page | Node | Contents |
|---|---|---|
| `01 · Design System` | `29:467` | Everything: tokens, foundations, components, patterns, guides, reference screens |
| `02 · Screens` | `67:1486` | Working canvas for recreated app screens (was "Design test") |
| `03 · Brand` | `18:381` | Full logo `18:393`, orb/3d-ball, marks |
| `04 · Logo source` | `1:2` | Logo construction |
| `05 · Wireframes (source)` | `0:1` | Low-fi source screens |
| `99 · BACKUP — safety copy` | `359:1396` | **A safety backup of the Design System page. Never design here, never instance from here, never treat it as a source of truth.** It exists so there is a rollback point if something gets broken. It contains duplicate component sets — instancing from it silently forks the library. Leave it alone. |

### ⚠️ Canvas order on `01 · Design System`
One column at `x=0`, top to bottom, 240px gaps. The numbering **is** the section order of the future HTML design-system page. `00 · Start here` sits to the left at `x=-1600`.

| # | Board | Node |
|---|---|---|
| 00 | Start here — index & rules | `386:200` |
| 01 | Guide — Building LUX screens | `342:99` |
| 02 | **Guide — Desktop screens** | `376:206` |
| 03 | Foundations — Breakpoints & Grid | `281:96` |
| 04 | Foundations — Spacing & Radius | `168:68` |
| 04b | **Foundations — Elevation, Motion & States** | `389:200` |
| 05 | Foundations — Logo | `340:99` |
| 06 | Core — Colour, Type, Components & Patterns | `33:2` |
| 07 | Components — Navigation | `174:44` |
| 08 | Components — Buttons | `157:10` |
| 09 | Components — Selection controls | `157:11` |
| 10 | Components — App Kit | `244:69` |
| 11 | Components — Masters (restored) | section |
| 12 | Patterns — Frosted surfaces | `182:55` |
| 13 | Screens — Mobile reference | `210:3002`, `210:3048` |
| 14 | Screens — Desktop | `359:414` |
| 15–16 | Brand artboards | `60:1084`, `67:1487` |

---

## 1. The golden rules

1. **ALWAYS instance design-system components.** Never hand-draw icons, arrows, navs, or buttons. Hand-drawing was the #1 correction from the user — components must be reused so an edit propagates everywhere.
2. **Mobile = 440px.** Never 402 or 375. Tablet 1024, Desktop 1440.
3. ⚠️ **NO logo in screen headers, at any breakpoint** (decided 14 Aug 2026, reversing the earlier rule). The LUX logo is a **brand asset** — app icon, splash, brand surfaces — not a header element. Headers are chevron + action, nothing else. Never retype "LUX" as text either. The `size/logo-*` tokens remain for brand surfaces. The AI avatar is the orb (`chat-ball-3x` `219:795`), which is unaffected.
4. **Bind visual props to tokens** (variables), never hardcode hex inside components. Bind to **semantic** tokens (`02 Color`), never to a primitive.
5. **Every text node carries a text style.** No free-typed font sizes.
6. **Verify with a screenshot after every build**, and diff against the sample screens.
7. **The user reorganizes the file constantly** — re-verify node IDs, page membership, and widths every session.

---

## 2. Components — instance these (node IDs)

| Need | Component | ID | Notes |
|---|---|---|---|
| Bottom nav | `Bottom-Nav-Bar` **(set)** | `410:258` | **THE nav.** 8 variants: `Active` (None / Progress / Check / Products) × `Size` (Mobile 380 / Desktop 598). Set BOTH properties — never resize a Mobile variant by hand, never restyle an item to fake an active state. Height, padding, icons, type and colours are identical across all 8. Full px+rem spec on the Navigation board `174:44`. |
| ~~`Bottom Nav` (set `83:68`)~~ | — | — | ⚠️ **The OLD nav the user deleted.** Wrongly resurrected on 14 Aug, removed again, and all five desktop screens have been migrated off it onto `142:257`. It is now unreferenced. **Never put it back on the canvas.** Its active state was inverted — it *faded* the active item; the real nav makes the active item bold and dark. That contrast is how you tell the two apart at a glance. |
| Button | `Button` **(set)** | `37:23` | ⚠️ **Was deleted from canvas and restored 14 Aug.** Variants `Style=Primary/Secondary/Ghost × State=Default/Hover/Disabled`. |
| Back / arrows | `Icon / chevron-left` | `244:74` | also `chevron-right` `244:78`, `chevron-down` `244:82`. |
| Header action | `Small Button / Secondary / Default` | `225:60` | "Save & exit" / "Skip". (Primary set `225:57–59`.) |
| Single-select row | `Radio row` | `162:86` | **The only selection row in LUX.** 6 variants: `Label` (text) × `State` (Default/Selected/Hover) × `Size` (Mobile/Desktop). **`Size` changes the label type — Mobile `Label` (Medium 14/20), Desktop `H6` (Medium 16/24).** Padding, radius and the selector are identical at both; ⚠️ **the HEIGHT is not — Mobile 56, Desktop 58**, because the row hugs (17 + label + 17). Selector on the RIGHT. 360 wide. |
| Multi-select row | `Checkbox row` | `465:463` | **MULTI-SELECT** — zero or more ("select all that apply"). 6 variants: `Label` × `State` (Default/Selected/Hover) × `Size` (Mobile/Desktop). Identical to `Radio row` in every respect **except the selector: a SQUARE (22×22, radius 6) instead of a circle** — including the 56 / 58 height split. Sits directly under Radio row on the Selection controls board. |
| Selectable pill | `Chip` | `162:74` | ⚠️ Now has a **`Label` text property** (`Label#388:0`) — set it via props, no longer by overriding the text child. |
| Read-only label | `Tag` | `256:85` | `Style=Neutral/Brand`. Not interactive. |
| Full logo | (Brand page) | `18:393` | ratio 1374×416 ≈ 3.3:1. |

App Kit board `244:69` also has: Search Field, Badge, List Item, App Bar, Step Progress, Button/Icon+Label, Bottom Action Bar, Empty State, Bottom Sheet, Info Card, Status Bar, Banner, Loading State, and a 12-icon line set.

**20 components now carry written descriptions** in Figma (props, tokens, sizing, when-not-to-use). Read the description before using a component; keep it updated when you change one.

**Instancing:** use `component.createInstance()`. `clone()` makes a **detached** copy — never use it for reuse.

---

## 3. ⚠️ Token architecture — 9 collections

Two layers: **primitives** hold raw values, everything else is **semantic** and aliases them. Every variable carries a `WEB` code syntax that maps 1:1 to a CSS custom property, so the whole system exports as a `:root` block plus a `[data-theme="dark"]` override.

| Collection | Vars | CSS prefix | Purpose |
|---|---|---|---|
| `01 Primitives` | 35 | `--color-*` | Raw ramps: indigo, sage, blue, neutral, green, amber, red. **Never bind a component to these.** |
| `02 Color` | 68 | `--color-*` | Semantic, Light + Dark modes. Groups: `bg/`, `surface/`, `text/`, `icon/`, `border/`, `state/`, `feedback/`, `gradient/`, `button/`, `effect/`. |
| `03 Spacing` | 14 | `--space-*` | `2xs` (2) → `9xl` (120). |
| `04 Radius` | 9 | `--radius-*` | `none` (0) → `3xl` (32) → `full` (999). |
| `05 Layout` | 18 | `--bp-*`, `--margin-*`, `--width-*` | Breakpoints, margins, columns, gutters, card-width scale. |
| `06 Typography` | 37 | `--font-*`, `--line-height-*`, `--tracking-*` | Family, weights, size/line-height scales, tracking. The text **styles** are the semantic layer on top. |
| `07 Size` | 23 | `--size-*`, `--border-width-*` | Icon sizes, control heights, touch target, nav/logo dims, stroke weights. |
| `08 Elevation` | 21 | `--blur-*`, `--opacity-*`, `--z-*` | Blur radii, frosted opacity levels, z-index scale. |
| `09 Motion` | 10 | `--duration-*`, `--ease-*` | Durations and easings, incl. the 4s breathing phase. |

### ⚠️ Renames applied 14 Aug 2026 (update any code referencing the old names)
| Old | New |
|---|---|
| `amber/500` | `rose/500` — **and the value changed** `#B08A4F` → `#C9918E` |
| `amber/100` | `rose/100` — `#F5EDE0` → `#F4E7E6` |
| `frost bg white` | `surface/frost-light` |
| `frosted transparent` | `surface/frost-nav` |
| `surface/default` | `surface/data` |
| `highlight/white` | `effect/rim-highlight` |
| `spacing/xxs` | `spacing/2xs` |
| paint `lux` | `gradient/brand-indigo` |
| paint `lux 2` | `gradient/orb` |
| paint `lux bg` | `gradient/canvas-mobile` |
| effect `Frosted surface` | `surface/frosted-soft` |

### ⚠️ Fixes and additions
- **`bg/bubble-user` was broken** — its Light value aliased `green/200`, a deleted variable. Repointed to `sage/200`, then ⚠️ **repointed again 18 Aug 2026 to `sage/300` `#BDD1D2`**, and ⚠️ **set directly to `#CADFDF` on 22 Aug 2026**. It no longer aliases a primitive at all, on purpose: **`bg/canvas` also aliases `sage/300`**, so retuning that primitive would have moved the app background along with the bubble. The nearest ramp value is `sage/200` `#CDDDDB` at distance 5 — the same step, slightly cooler — so it is not a new ramp step either. A dozen semantic tokens in `02 Color` already hold direct values (`text/on-data`, `bg/glass`, every `button/bg-*`), so this is the existing pattern.
- **`container/max` 1200 → 1280.** 1440 − (2 × 80 margin) = 1280. The old 1200 was inconsistent with the margins and with every built screen.
- New styles: paint `gradient/canvas-desktop`; effects `surface/frosted-card-desktop`, `surface/frosted-data`, `surface/frosted-nav`, `focus/ring`.
- New semantic groups: `text/on-data*`, `icon/*`, `state/*`, `feedback/*`, `gradient/*`, `border/focus`, `surface/card-desktop`.

---

## 4. Colour & style values (the actual numbers)

- **Brand indigo** `#3B305C` (selection, accents, checked) · deep `#2E2447` · violet `#4D4785`.
- **Text on light:** primary `#2E2A3F` · secondary `#4B4B57` · muted ⚠️ **`#63636F` as of 4 Sep 2026** (was `#9A9AA5`). The old value measured **2.13–2.57:1** on the three surfaces it actually lands on — product-row meta lines, `DateField`'s "Select a date", the PRODUCTS hub's windows and counts, `CheckHistory`'s counts — at 12–16px, where the large-text allowance never applies. `#63636F` measures **4.54–5.47:1** on all three. **Still to change in Figma.**
- **Backgrounds:** mobile `#DCE7EA → #CEDEE2 → #ACC5CC` (`gradient/canvas-mobile`); desktop `#DCE7EA → #CEDEE2 → #B9D1D7` (`gradient/canvas-desktop`). **Use the paint styles, not raw fills.**
- ⚠️ **`gradient/brand` is the SAGE button gradient** `#BBD3D9 → #637073` — ⚠️ **the START is `#A2B9BF` in code as of 4 Sep 2026, one step darker, and Figma still holds `#BBD3D9`.** The white label measures 2.05:1 at the left edge, 2.67:1 at the first glyph, 3.73:1 at the last, against 4.5:1; the gradient sweeps light-to-dark so **no single ink clears both ends** and the surface has to move. A version that passes (`#5F7275 → #3C4B4E`) was built and **rejected as too dark**. `#A2B9BF` is a chosen value — change Figma to match it and stop there. Not the indigo one. The indigo `#3F326D → #5C5E9E` is now `gradient/brand-indigo` and is for marks/accents only.
- **`border/highlight`** `#FFFFFF @90%` (neumorphic rim).
- **Nav pill:** `surface/frost-nav` ⚠️ **`#DBEDED @88%` as of 22 Aug 2026** (was `#DDE8EB @83%`), blur 28, radius full. Same colour as `bg/bubble-ai`, so the nav sits on the AI bubble's hue. **`bg/nav` is its opaque counterpart `#DBEDED` and must be kept in step** — it is the `prefers-reduced-transparency` fallback and a fallback must not be translucent or a different hue. ⚠️ **`Search Field` `248:70` binds `surface/frost-nav` as well**: one frosted-pill surface, two components. All 8 `Bottom-Nav-Bar` variants bind their fill to the token (resolved 18 Aug 2026; they were a loose hex), which is why a single variable edit moved every one of them. ~~`bg/nav` `#9CAEAF @55%` is an orphan~~ — stale twice over: `bg/nav` is the reduced-transparency fallback and now holds `#DBEDED`.

### Two surface systems — CHOOSE BY SCREEN TYPE
**A) Onboarding / forms / content (light):** `surface/frost-light` `#F4FEFF @55%` (rows, chips) or `surface/card-desktop` `#EDF8FB @55%` (the desktop page card), **DARK text**.

⚠️ **A frosted fill ON a frosted surface does not read.** `surface/frost-light` at 55% over a `surface/frost-light` card is the same fill twice and the inner element loses its edge. That is what **`bg/frost-light` `#F4FEFF`** (added 22 Aug 2026) is for — the opaque counterpart, exactly the relationship `bg/nav` has to `surface/frost-nav`. First used by the face-diagram region chips. It is also the correct `prefers-reduced-transparency` fallback for any frost-light surface; those previously fell back to `bg/surface-frost` `#EEF6F7`, which is a different colour.

**B) Data / dashboards:** `surface/data` `#7DA7A9 @44%`, radius 24–28, blur 28, drop `0 12 32 -8 rgba(46,36,71,.12)`, **DARK text** ⚠️ **changed 4 Sep 2026 — it was WHITE** (`text/on-data` 100 / `-secondary` 85 / `-muted` 62). Accents indigo `#3B305C`.

⚠️ **WHITE CANNOT BE MADE TO WORK ON THIS SURFACE.** Measured on `/check/results`, white failed WCAG AA on **38 of 59 text nodes**: overlines and 12px stat labels at **1.49:1**, body and metrics at **1.86:1**. `surface/data` composites to ≈rgb(170,194,198), and even at **100% opacity** that hue gives white only **2.63:1** — no alpha passes. Darkening the text is the only fix that keeps the sage card; the alternative is a dark-sage surface, i.e. redesigning System B.

| Role | Value | Contrast |
|---|---|---|
| `text/on-data` (values) | `#2E2A3F`, the app ink | 6.28–8.12:1 |
| `-secondary` and `-muted` (body + labels) | `#354446`, sage-tinted | 4.61–5.97:1 |

The two lower tiers **share one value on purpose**: the muted tier styles 12–13px LABELS, so it must also clear 4.5:1, and the ink at 82% already fails (4.43:1). Hierarchy is carried by size, weight and the overline's tracking. Still white, deliberately: the `border/glass` divider inside a data card, and the check-in discs' `text/on-brand` (indigo ground, passes). ⚠️ Open: the calendar's `Today` ring is `border/glass` on `surface/data` at **1.44:1** where SC 1.4.11 wants 3:1, and today has no other indicator. **All still to change in Figma.**

A sage card **inside** a light card is correct. The reverse is not a pattern.

### Typography (Figtree)
Styles: `H1–H6`, `Body 1/2/3`, `Label`, `Label Small`, `Caption`, `Overline`, `Button`, `Button Small`, `Metric 1/2`, `Display 1/2`. Weights are **Light** (Metric only), **Regular** (Body 1/2/3, Button, Button Small) and **Medium** (everything else). **SemiBold and Bold are not in the ramp.**

⚠️ **`Button` is Regular 15/22.** Buttons are deliberately Regular weight. The style used to be Medium 16 while every real button was 15 — rather than restyling every button, the *style* was corrected to match the design (14 Aug 2026). Three non-button nodes that had borrowed it (`4-7-8 Breath`, `Box breathing`, `6.5 oz`) were re-pointed to `H6`, which renders identically.

### ⚠️ `Size=Desktop` rows are 58 tall, not 56 — corrected 21 Aug 2026
Every note in this file and on the Selection controls board says the `Size`
property changes "ONLY the label type — geometry, padding, radius and the
selector are identical at both". **The geometry is not identical.** The row hugs
vertically (padding 17 + label + 17), so `H6` (Medium 16/**24**) gives **58**
where `Label` (Medium 14/**20**) gives 56. Verified on the `Radio row` set itself
— all three `Size=Desktop` variants are 58 — and on every desktop frame in both
built sections (02a, 02b, 03c, 04 Confirm product). The code now matches.

### ⚠️ Radio vs Checkbox — the shape is the contract
**Circle = exactly one. Square = zero or more.** This is not a stylistic choice: users read the shape before they interact, it maps to `role="radio"` vs `role="checkbox"` in code, and screen readers announce them differently ("radio button, 1 of 7" vs "checkbox, not checked"). Never use one to do the other's job.

- `Radio row` `162:86` — single-select.
- `Checkbox row` `465:463` — multi-select. **Most LUX questions are multi-select**, so this is the common one.
- `Chip` `162:74` — multi-select in pill form. Good for short labels (symptoms); poor for long ones like "Perioral dermatitis".

#### Exclusive options inside a multi-select group
"None" and "Prefer not to say" are answers *about* the list, not items in it. They stay **checkboxes** — the group is still multi-select — but they clear everything else. **Never switch just those rows to radios:** mixing circles and squares in one group tells the user the whole group is single-select.

| Action | Behaviour |
|---|---|
| Taps a normal option | Deselect "None" and "Prefer not to say". Everything else keeps its state. |
| Taps "None" | Deselect every other row, including "Prefer not to say". |
| Taps "Prefer not to say" | Deselect every other row, including "None". |
| The two exclusives | Mutually exclusive with each other — only one can ever be checked. |
| Unchecking an exclusive | Just unchecks it. Do **not** auto-restore the previous selections. |
| Signal it visually | Separate the exclusive rows from the list with extra space or a hairline. |
| In code | Keep `role="checkbox"` on every row and manage state in the handler. Do not change roles. |

Full spec on the Selection controls board `157:11`.

### ⚠️ Component labels carry text styles
Set on the components themselves, so every instance inherits and nothing is raw:

| Component | Style |
|---|---|
| `Button` (all 8 variants) | `Button` — Regular 15/22. This also unified 7 variants that were wrongly Medium 15. |
| `Chip` | `Label` — Medium 14/20 |
| `Tag` | `Label Small` — Medium 12/16 |
| `Bottom-Nav-Bar` (all 24 labels) | `Label Small` — Medium 12/16 |

**`Radio row`** was Medium 15 with no matching style — resolved 14 Aug by giving it a `Size` property: Mobile → `Label` (Medium 14/20), Desktop → `H6` (Medium 16/24). Every component label in the library now carries a style.

⚠️ **Cloning a component variant DROPS its `componentPropertyReferences`.** When you build new variants by cloning, the clone's text node loses its link to the `Label` property, so instances switched to that variant silently reset to the default string. Always re-set `componentPropertyReferences = { characters: propId }` on cloned variants, then spot-check an instance. This bit the Radio row `Size=Desktop` variants and wiped seven labels before it was caught.

### ⚠️ Feedback palette — muted rose family, no browns
The feedback colours sit on one hue line (~3°) so they read as a family against the sage/blue canvas. **There are no brown or olive tones in LUX** — the old amber `#B08A4F` was the only one and it was removed.

| Token | Value | Use |
|---|---|---|
| `feedback/success` | `green/500` `#5F8A6E` | High compatibility, positive states |
| `feedback/warning` | `rose/500` **`#C9918E`** | Caution, "Risky" |
| `feedback/error` | `red/500` `#A86561` | "Avoid", destructive |
| `*-subtle` | `#E6EFE8` / `#F4E7E6` / `#F5E7E6` | Chip and badge backgrounds |

Warning and error are deliberately close — same hue, separated by lightness and saturation. **Never rely on that difference alone**: always pair with a label ("Risky" / "Avoid") and, where possible, an icon.

### Logo sizes
`size/logo-mobile` 62 / `size/logo-desktop` 82 exist for **brand surfaces only** — the logo is not used in headers (see §1 rule 3). The orb (`chat-ball-3x` `219:795`) is the AI avatar and is unaffected.

---

## 5. Screen recipes

### ⚠️ The bottom nav is FIXED — identical placement on every screen, every breakpoint
This is the single most frequently broken rule. Full spec on the Navigation board `174:44`.

| Rule | How |
|---|---|
| Absolute, never in flow | In an auto-layout frame set `layoutPositioning = 'ABSOLUTE'`. If the nav consumes layout space, content shifts whenever it changes. |
| Topmost layer | Last child of the screen frame (`layer/z-nav`, 200). |
| Horizontally centred | `x = (frameWidth − navWidth) / 2`. On a 440 frame with the 380 nav → `x = 30`. |
| 24px from the bottom | `y = frameHeight − 75 − 24`. Same on every screen **regardless of frame height**, including tall scrolling frames. |
| Constraints | Horizontal `CENTER`, Vertical `MAX`. |
| Reserve space | Auto-layout screens: `paddingBottom = 24 + 75 + 16 = 115`. Static frames: keep the last element's bottom at or above `frameHeight − 115`. |
| Always a fresh instance | Instance directly from the `Bottom-Nav-Bar` set. Never copy a nav from another screen, never detach, never resize a Mobile variant to a desktop width. |

**Which `Active` value:** the nav reflects the section the user is *in*, not the screen they came from.

⚠️ **THERE ARE FOUR SECTIONS AS OF 4 Sep 2026, AND THE SET STILL SHIPS THREE.**
`My skin` leads, then Progress, Check, Products. Without it the investigation
flow had no nav item, so its six screens lit **Check** — telling the user they
were in the compatibility check while they answered profile questions, and
lighting a tab whose own landing cannot reach those screens. **A fourth glyph is
needed and the DS has none** — no face or skin mark exists anywhere.

The 380 / 598 widths do **not** change and no breakpoint is added: measured, the
four items sum to 267.1 against 352 of inner width at 440 and 570 at 1024. They
fit unclipped down to a 344 viewport. **A fifth item would exhaust that
headroom.**

- `My skin` — the investigation flow: skin type, conditions, symptoms, timing.
  ⚠️ These used to be `Check`.
- `Progress` — dashboards, progress, streaks, rituals, the daily check-in.
- `Check` — the product **compatibility** check, and nothing else.
- `Products` — product browse and detail.
- `None` — welcome and intro. **`None` is a real state, not a fallback** — use it deliberately.

⚠️ **One exception:** the investigation's step 5 lights `Products`, not
`My skin`. It is a flow step in every other respect, but what it puts on screen
is the products list, and the user is there to add products.

### ⚠️ Back controls — one affordance, always in the same place
**The back control is a `Icon / chevron-left` instance in the header, top-left. There is no footer "Back" button, at any breakpoint.** Footer Back buttons were removed from the onboarding screens on 14 Aug; `Continue` now fills the footer.

Why the header chevron wins over a footer Back:
- **One predictable location.** Back in a fixed spot on every screen is learnable; back that moves between header and footer is not.
- **The footer holds exactly one primary action.** Pairing Back with Continue gives two controls equal visual weight for very unequal actions — Continue is the frequent, intended path; Back is occasional and recoverable.
- **The footer is already contested.** With a fixed bottom nav plus a primary CTA, a third control crowds the thumb zone and competes with the nav.
- **It matches the platform.** Top-left back is the iOS/Android convention and lines up with the system back gesture.

Exception: the **first** screen of a flow has nothing to go back to — no chevron. If it needs an escape, that is `Save & exit` (Small Button / Secondary) on the right, not a back arrow.

### ⚠️ Onboarding header — the order is fixed
Top to bottom, **always**:

1. **Header row** — back chevron (`244:74`) LEFT · `Save & exit` (`Small Button / Secondary` `225:60`) RIGHT. `SPACE_BETWEEN`, `counterAxisAlignItems: CENTER`.
2. **12px spacer**
3. **Step progress track** — full content width, the filled portion showing progress.
4. **Spacer**, then the title.

**The progress track goes UNDER the header row, never above it.** I built it the wrong way round on the skin screens and it had to be corrected — the track is a readout of where you are in the flow, so it reads after the controls, not before them.

**`Save & exit`, not `Skip`.** Skip implies the question is optional and discards the answer; the investigation flow is resumable, so the escape hatch is Save & exit. Only use `Skip` on a genuinely optional question, and then it belongs inline near the question (e.g. "Skip this question"), not in the header.

Reference implementation: `01 — Start investigation` `407:1763`.

### ⚠️ Hub sections vs. the investigation flow — the header tells you which
A screen belongs to the **8-step investigation add-flow** if and only if it carries **both** a step-progress track **and** `Save & exit`. Those two together mean "resumable step". Everything else is a **hub** screen reached from the bottom nav — CHECK, PRODUCTS' hub screens, PROGRESS — and gets **neither**.

| | Investigation step | Hub landing (nav-reachable) | Hub pushed view |
|---|---|---|---|
| Back chevron | yes | **no** (nothing to go back to) | yes |
| `Save & exit` | yes | no | no |
| Progress track | yes | no | no |
| Title | in the body | in the body | in the body |

Reference: `Check — no profile` / `Check — start` are hub landings; `Check — add products` onward are pushed views.

### ⚠️ Compatibility bands — settled 18 Aug 2026
| Band | Score | Score + bar colour | Status pill |
|---|---|---|---|
| **Compatible** | **≥ 80%** | `feedback/success` | **none** — the absence is the signal |
| **Risky** | **50–79%** | `feedback/warning` | "Risky" |
| **Avoid** | **≤ 49%** | `feedback/error` | "Avoid" |

Derived from the only evidence in the file (`Check results`: 98/94 success · 71/62 warning · 45 error), which pins the boundaries inside `(71, 94]` and `(45, 62]`. 80 and 50 are the round numbers in those windows. The `compat-bar` fill width equals the percentage, in the same token.

⚠️ **The status pill belongs in the ROW HEADER, not the expanded body.** `feedback/warning` and `feedback/error` share a hue and differ only by lightness, so the **pill text** is what separates Risky from Avoid — the score colour must never be the sole carrier. Before this was fixed, collapsed rows signalled the band by colour alone, which violated §4's own rule. In code, expose the band as text or an `aria-label` on every row.

### ⚠️ The check tray has THREE states — the build ships TWO
`closed` (nothing added) → `Check — add products` · `open` → `Check — selection · N products` · `collapsed` → `Check — tray collapsed`.

⚠️ **THE RESTING STATE CHANGED, 4 Sep 2026.** The design opens the scrim'd modal sheet the moment you add your FIRST product — CTA disabled, helper reading "Add at least 2 products" — and the next thing you have to do is use the list underneath. That is why the transition map has to say "Add another product returns focus to the search list with the tray still open", and why `collapsed` exists at all: it is the escape hatch from a modal that should not have been modal. Adding is not a decision that needs confirming — it is the loop. **The docked `tray-bar` is the default now**: always visible, never covering the list, counting up. The drawn sheet is still exactly the drawn sheet, opened deliberately to review or remove. Every treatment is used; only which one rests changed.

The **`tray-bar`** is a docked pill above the nav: `y = (frameH − 99) − 12 − barH`, width 392 mobile / `width/card-focus` 640 desktop, `surface/data-strong` + `surface/frosted-row` + drop shadow `0/6/20 @12%` + `radius/full`. **It is not a modal** — no scrim, and the nav stays the last child. Only a sheet/dialog outranks the nav.

### Search states — use the App Kit, don't draw new ones
`Check — no results` covers the empty query. **Loading and error are deliberately not drawn**: use `Loading State` `257:103` in place of the results list, and `Banner` `257:96` above it for a failed query. Drawing bespoke ones forks those components.

### ⚠️ Chat bubbles — ONE recipe, settled 18 Aug 2026
There used to be a **three-way conflict** between the written spec, the DS reference artefact and the 43 built bubbles. The user's call: **the `lux-bubble` artefact is canonical.** Everything now agrees.

| Property | Value | Bind to |
|---|---|---|
| AI fill | **`#DBEDED`** **opaque** ⚠️ changed 22 Aug 2026 | **`bg/bubble-ai`** — now a DIRECT value, no longer aliasing `blue/50` |
| User fill | **`#CADFDF`** **opaque** ⚠️ changed 22 Aug 2026 | **`bg/bubble-user`** — now a DIRECT value, no longer an alias |
| Drop shadow | `0 / 4 / 12` rgba(24,32,42,**.04**) | effect style **`surface/chat-bubble`** |
| Inner shadow | **X2 · Y4 · blur 8** rgba(0,0,0,**.10**) | same style |
| Radius | 30, tail corner 1 | `radius/bubble` / `radius/bubble-tail` |
| Stroke | **none, ever** | — |

- ⚠️ **Body text steps up on desktop: `Body 2` (16/26) mobile → `Body 1` (18/28)
  desktop.** Confirmed across both built sections. A one-line desktop bubble is
  therefore **56** tall (14 + 28 + 14), not 54. The code had held `Body 2` at both
  breakpoints since the first screen; fixed 21 Aug 2026.
- ⚠️ **Desktop SIDE padding disagrees between sections.** GETTING STARTED's nine
  desktop frames use `14/22`; all of PRODUCTS uses `14/18`, i.e. the mobile value.
  Both are in the file. Pick one in Figma rather than forking the component —
  the code uses 22.
- **Tail corner:** AI = top-LEFT 1px, sits left. User = top-RIGHT 1px, sits right.
- ⚠️ **Bubbles are OPAQUE, not frosted.** They were built on `surface/frost-light` (`#F4FEFF @55%`), which let the canvas gradient through — so a bubble low on a screen rendered visibly darker than one near the top, and the inset never read crisply. That translucency was the single biggest cause of bubbles "not matching the design system". **Do not put `surface/frost-light` on a bubble.** Frosted rows and cards are translucent; bubbles are not.
- All 43 bubbles carry the **effect style**, not raw effects, and so do the three DS reference artefacts (`lux-bubble` `67:1357`/`270:112`, `user-bubble` `270:129`). Editing the style is now the only way to change bubble shadows, and it propagates everywhere.
- What changed: `surface/chat-bubble` was `drop @5% + inner X2/Y2 B10 @20%` — those values were invented in an earlier session instead of being read off the reference bubble, and the spec panel text has been corrected to match.

### ⚠️ PRODUCTS — where the section departs from the documented rules
Read alongside the `HANDOFF — PRODUCTS` panel (`586:1884`).

- ⚠️ **Desktop `Continue` is the FULL card width (824), not 280 centred.** All
  eight PRODUCTS add-flow desktop frames do this; all nine GETTING STARTED
  desktop frames use 280 centred. That is a real inconsistency between the two
  sections, not a transcription slip. Decide one.
- ⚠️ **The desktop cards have NO gap between the last content block and
  `Continue`.** Every other spacer on those frames is an explicit named frame and
  this one is simply absent, so `Continue` butts against the block above it. Reads
  as a missing spacer; the code inserts the standard 32.
- **A title-first screen puts 24 between the track and the content, a
  bubble-first screen 32.** Consistent across the file; worth stating on the
  guide boards.
- **`Product added` is a HUB screen** (`Active=Products`, no header, no track)
  even though it is reached from inside the add flow — wireframe id `11:162`.
  ⚠️ **The screen no longer exists in the build** — see the note at the end
  of this section.
- ⚠️ **Only the LONG-TERM period is designed.** The intro promises three, and
  neither Recent nor New addition is drawn at either breakpoint or in the
  wireframes. ⚠️ **RESOLVED BY CUTTING THE FLOW, 4 Sep 2026** — see the
  note at the end of this section.
- ⚠️ **Neither "Edit" control on `Long-term products list` has a destination** —
  there is no edit screen anywhere in the file. "Remove" is the only real card
  action. ⚠️ **The screen and its route are gone** — see the note below.
- **The success tick on `Product added` carries a `feedback/success` FILL and a
  `text/primary` STROKE.** An open path renders as its stroke, so the tick is
  dark, not green. The fill says what was meant; the stroke is what shows.

#### ⚠️ TWELVE SCREENS BECAME ONE SCREEN AND ONE TRAY — 4 Sep 2026

The designed flow walked three time PERIODS in sequence: an intro promising
them, a per-period list, and four routed add screens (`search → confirm`,
`scan → match`) rejoining at `Product added`. What shipped from it was broken
four ways at once, none of which is visible in a comp and all of which are
obvious in a minute of clicking:

- the intro's three period rows all opened the tray **without setting a period**,
  so everything filed under Long term;
- two of the three promised periods were **never drawn** at either breakpoint;
- **Recent was unreachable** until you already owned a long-term product;
- `bucketFor()` and `durationForBucket()` sat in one module as mutual inverses
  with no answer to which was authoritative.

**The shape now: add a product, say how long you have used it, the app sorts.**
One list, one `Add product` row. The tray runs method → search-or-scan → "is
this it?" → **"how long have you used it?"** → added, without ever navigating.
That last question is the ONLY input to the grouping, and it is asked with the
product on screen — because how long you have used something is a fact about
that product, not a mode you enter before searching.

**Deleted, with their routes:** `AddProductsIntro`, `LongTermProducts`,
`SearchProducts`, `ScanProduct`, `ProductConfirmScreen`, `ProductAdded`.

**Consequences for the Figma file:**

- `Long-term products list` (`581:1593` / `583:1924`) has no route. Its whole
  content was a title, a count and the group's cards — the first two of which
  the hub row already states. Category rows are **dropdowns** now and the cards
  open in place.
- There is no end-of-step "here's how I sorted them" screen. The list groups
  itself **live** as you add, so that screen would only show a result already
  seen.
- ⚠️ **A fourth group, "Not sure", is not drawn anywhere.** With no period mode
  left, the fallback had nothing to read. Binning it into Long term is the
  tempting fix and it is wrong: for a flare investigation, "I don't know how
  long" is diagnostically different from "months". The PRODUCTS hub still shows
  exactly the three designed periods; the fourth is appended only when non-empty.
- ⚠️ **The duration Tag came OFF the cards and the window moved ONTO the hub
  rows.** Bucket is derived from duration 1:1, so every product in a group
  carries the same duration its own page title is naming — a "4+ weeks" badge
  repeated down a screen headed "Long-term products" is noise that reads like
  data. The window moved to `/products` because that is the only screen where
  all three periods appear together and read as one scale. Beside the name,
  never under it: measured 56 at both breakpoints.
- The `Edit` control question is moot — the screen carrying it is gone.

### ⚠️ Modal trays — mobile sheet, desktop dialog, and the layering exception
One recipe, used by `04 — Add product · method sheet` and the three `Check — selection · N products` screens:

- **Mobile `bottom-sheet`** — full frame width, `x=0`, radius `28/28/0/0`, pinned to the frame bottom (`y = frameH − sheetH`), padding `spacing/xl`.
- **Desktop `check-dialog` / `method-dialog`** — `width/card-focus` 640, `radius/3xl` on all four corners, **no grabber**, padding `spacing/5xl`.
- **Both** — fill `surface/data-strong`, **`BACKGROUND_BLUR 28`**, a drop shadow (mobile `0/−8/32 @12%`, desktop `0/12/40 @18%`), gap `spacing/xl`. The blur is **not optional**: `surface/data*` is translucent and the screen behind reads straight through without it.
- **`scrim`** — full-bleed frame at `state/pressed-overlay` (14%), directly beneath the tray.
- ⚠️ **This is the one place the nav is NOT the topmost layer.** Child order ends `… Bottom-Nav-Bar, scrim, tray` — `layer/z-sheet` (400) is above `layer/z-nav` (200). **Any sweep asserting "nav is the last child" must exempt frames containing a `bottom-sheet` / `check-dialog` / `method-dialog`.**
- **Desktop placement:** centre the dialog in the area **above the fixed nav** — `y = max(40, round((801 − h) / 2))` — not in the full 900. A tall dialog (the 5-product one is 725) otherwise sits under the nav.


Mobile conventions are unchanged — see board `01 · Guide — Building LUX screens`.

### ⚠️ Desktop — see board `02 · Guide — Desktop screens` (`376:206`) for the full spec
Summary:
- Frame **1440 × 900**, fill = `gradient/canvas-desktop`, padding `40 / 80 / 0 / 80`, content column **1280**.
- **One centred frosted card.** Width from the scale: `width/card-focus` **640** (single action) · `width/card-form` **920** (question + option grid) · `width/card-detail` **1040** (2-col content) · `width/content-max` **1280** (dashboard grid, no card).
- Card = fill `surface/card-desktop` + effect `surface/frosted-card-desktop` + 1px `border/subtle` + `radius/3xl` (32) + padding 48, **vertical HUG**.
- ⚠️ **Exception — intro/welcome screens have NO card fill and NO stroke.** The orb, bubble, button and disclaimer float directly on the gradient; only the blur and shadows remain on the container. Adding a visible card here is a regression. Reference: `desktop-welcome` `359:2878`.
- **Nav: instance the `Bottom-Nav-Bar` set `410:258` with `Size=Desktop` and the right `Active`.** Current wiring: welcome **None** · dashboard **Progress** · box-breathing **Progress** · primary-goal **None** · product **Products**. Screens outside the three sections (welcome, onboarding steps) use `Active=None`. Never swap in the old `83:68` set — it fades the active item instead of emphasising it.
- Header patterns: **A** onboarding (chevron left · Save & exit right · 400px progress track below) · **B** task/detail (chevron only) · **C** dashboard (H2 title + Body 2 subtitle, no chevron). **None of them carry a logo.**
- Nav: `Bottom Nav` instance 598 × 75, centred, inside a `bottom-nav-container` (FILL width, height 127, paddingTop 30). **Set `Active` to match the screen.**
- Mobile → desktop: margins 24→80 · title H3→H2 · body Body 3→Body 2 · overline Label Small→Overline · block gap 24→32 · card padding 20/24→48 · button 56→62 tall, full-width→280 centred · lists 1 col→2×2 grid. Touch target stays 44.

---

## 6. `use_figma` gotchas — mistakes to avoid (READ THIS)

1. **`resize(w,h)` AFTER setting `primaryAxisSizingMode`/`counterAxisSizingMode` resets them to FIXED** → the frame collapses. **Fix:** resize first, then set sizing modes.
2. **`layoutSizingHorizontal='FILL'` set BEFORE the text node has characters** → text wraps one character per line. Set `.characters` first.
3. **Setting `layoutMode` AFTER `resize`** makes the frame hug and FILL children collapse.
4. **Vector position quirk:** after assigning `vectorPaths`, centre via `v.x = (frame - v.width)/2` — forcing `v.x=0` shifts the glyph into a corner.
5. **`vectorPaths` rejects the SVG arc `A` command.** Use cubic béziers only.
6. **`createFrame()` / `createAutoLayout()` default to a WHITE fill** — clear `fills=[]` on transparent containers.
7. ⚠️ **`createAutoLayout()` defaults to `clipsContent = true`, and that silently crops drop shadows.** This is the single most common visual bug in the file — 38 frames were affected as of 14 Aug.
   - **Cause:** an auto-layout frame that HUGS its child sits exactly on the child's bounds. A drop shadow draws *outside* those bounds, so a clipping parent cuts it off. A `Save & exit` button (38px tall, shadow `0 4 12`) inside a 38px-tall hugging row loses 16px of shadow.
   - **Why the main component looks fine:** showcase cells have slack around the component (e.g. a 135×63 cell around a 119×38 button), so the shadow still falls inside the clip bounds. The component is not different — its container is.
   - **Fix: set `clipsContent = false` on the hugging wrapper.** This has **zero layout impact** — it does not add a pixel of space, it only stops the crop.
   - **Do NOT fix it with padding.** Padding makes room for the shadow by making the frame bigger, which changes spacing and alignment. That is the wrong lever.
   - **Keep clipping ON where cropping is the point:** screen frames (they represent a viewport), image masks, scroll containers, and specimen panels where content must stay inside a painted panel.
   - Rule of thumb: *clip only when you mean to crop.* Layout wrappers should never clip.
   - ⚠️ **SHADOWS MUST NEVER BE CLIPPED.** The only frames allowed to clip a shadowed child are (a) a **true screen viewport** — a frame at an exact breakpoint width (402/440/1024/1440) and ≥600 tall, which crops at the device bezel by design, and (b) an **image mask**. Everything else gets `clipsContent = false`. If a shadow is being cropped *inside* a viewport, the element sits too close to the edge — **fix the inset, not the clipping**.
   - The `hugging row (clips)` frame on board `04b` is the one deliberate exception: it exists to demonstrate the bug. Do not "fix" it.

19. ⚠️ **Never hand-build a button — that is how shadows go missing.** A hand-drawn gradient frame with a text child looks like a button but carries no `shadow/button` effect, no states, no label property, and no link to the component. Six of these were found across the file (`Continue` ×3, `Add to routine` ×2, `Check in today` ×2) and all were replaced with `Button` instances. **The shadow is not something you add to a button — it is something the button already has, if you instance it.** Sweep for them with: a FRAME 40–72px tall, ≥160 wide, exactly one TEXT child, and zero INSTANCE descendants.
8. **New `createVector()` defaults to a black stroke** — clear `strokes=[]` if unwanted.
9. **`clone()` ≠ `createInstance()`.**
10. **Fonts must be loaded** before writing/editing text (`await figma.loadFontAsync({family:'Figtree',style})`).
11. **Not supported / throws:** `figma.notify()`, `loadAllPagesAsync`, `setPluginData`, `createImageAsync`. Colors are **0–1** range.
12. **`SPACE_BETWEEN`** needs `primaryAxisSizingMode='FIXED'`; **`layoutWrap='WRAP'`** only on HORIZONTAL frames.
13. **Background blur only renders over content behind it.** Verify frosted glass in context, never in isolation.
14. **Coordinate frame confusion:** a node's `x/y` are relative to its parent.
15. **Auto-convert traps:** turning pills into `Chip` instances also catches gradient CTA buttons. Exclude by gradient fill / name.
16. **`get_metadata` output can exceed the token cap** — parse the saved file, don't read inline.
17. **`getMainComponentAsync()` can return undefined** — fall back to finding by name.
18. ⚠️ **A deleted main component keeps its instances alive but has a `null` parent chain.** Walk `parent` up to a `PAGE`; if you never reach one, the component is orphaned. You *can* restore it with `page.appendChild(component)` without breaking any instance link. **But do not do this unprompted.** An orphaned main component usually means the user deleted it on purpose — resurrecting it puts a design they retired back on their canvas. This happened with `Bottom Nav` `83:68`: it was the old nav, deliberately deleted, and restoring it was wrong. Report orphans and let the user decide.
19. ⚠️ **Colour variables carry alpha.** When binding a translucent fill, set `paint.opacity = 1` and let the variable supply the alpha, or you will multiply the two.

---

## 7. ⚠️ Known debt — decide or fix next

- ~~Migrate the five desktop navs~~ **DONE 14 Aug** — all five are instances of `Bottom-Nav-Bar` `142:257` at 598×75, plus the mobile `01 — Welcome` reference screen on board 06 at 380×75. Zero instances on `01 · Design System` still reference the old set; verify with a sweep before assuming it stays that way. The `99 · BACKUP` page still contains old-nav instances — that is correct, do not touch it.
- ~~The nav has no `Active` variants~~ **DONE 14 Aug** — `Bottom-Nav-Bar` is now a component set (`410:258`) with `Active` × `Size`, 8 variants, and every screen is wired to the right one. The active state is encoded as **item frame opacity: 1.0 active, 0.5 inactive** — same colour, same weight, opacity only.
- ~~**Button set is missing `Style=Secondary, State=Hover`.**~~ ✅ **CLOSED 22 Aug 2026** — created as `749:3338` with `gradient/secondary-hover`. See "Secondary joined the system" below. (The malformed `Style=Primary / Secondary, State=Hover` variant had been renamed to `Style=Primary, State=Hover`, which is what left it undefined.)
- ✅ **CLOSED 21 Aug 2026 — the Primary `State` variant names now match their designs.** They were swapped (the variant named `Disabled` was the 0.4 hover fade; the one named `Hover` was the disabled design). **Renamed in place and verified pixel-identical** — renaming a variant does not move an instance's reference, so nothing changed visually and every instance now reports the correct state. The names and showcase `row/Primary` `160:15` agree, and the set's own description documents the three states.
  - **Default** `37:5` / cell `160:17` — `gradient/brand`, label `text/on-brand`, **no stroke**
  - **Hover** `37:9` / cell `160:23` — ⚠️ **CHANGED 22 Aug 2026**: now `gradient/brand-hover` (the brand gradient reversed) at full strength. It *was* the same gradient at node opacity 0.4.
  - **Disabled** `37:13` / cell `160:20` — ⚠️ **CHANGED 22 Aug 2026**: now the whole control at `opacity/disabled` (0.4). It *was* `state/disabled-bg` + a 1px `border/default` + a `text/muted` label.
  ⚠️ ~~The disabled state carries a 1px stroke the enabled state does not~~ — **no longer true after 22 Aug 2026**; the disabled button is a node fade and carries no stroke of its own. **Any older note telling you to read the showcase instead of the variant names is now stale.** Still open: `Style=Secondary, State=Hover` does not exist, and there is no `State=Pressed` for any style.

### ⚠️ SUPERSEDED 22 Aug 2026 — the section below is history

**Hover and disabled swapped.** Hover is `gradient/brand-hover`, the brand
gradient with its ends exchanged, at full strength. Disabled is the entire
control at `opacity/disabled` (**0.4**) — the treatment that used to be hover,
and that was disabled's own until 18 Aug.

The 18 Aug reasoning below is still correct *as far as it goes*: a 0.4 fade and
`state/disabled-bg` are two different disabled looks and having both was drift.
What it got wrong was which one to keep. The fade dims the two drop shadows
along with the fill, so as a HOVER it produced exactly the pale, low-elevation
picture that means "unavailable" — hover and disabled were converging. Reversing
the gradient gives hover a treatment that keeps full strength and elevation, and
frees the fade for the state it actually describes. The old hover was already
reading `opacity/disabled` for its value, which rather made the point.

**`state/disabled-bg`, a `border/default` stroke on a button and a `text/muted`
button label are no longer part of the button recipe.** The token remains for
other surfaces.

Applied to all five: `Button` Primary (`37:13`) and Secondary (`37:15`),
`Small Button / Primary / Disabled` (`225:59`), `Small Button / Secondary /
Disabled` (`225:62`) and `Back button/Disabled` (`239:65`) — each is now simply
its own Default at 0.4. `Small Button / Primary / Hover` (`225:58`), the other
0.4 fade in the file, got the reversed gradient too.

New in the same pass: paint style **`gradient/brand-hover`**, and
**`duration/hover`** (400ms) in `09 Motion` — deliberately between `slow` (320)
and `slower` (480). The `Button` set carries a real **hover interaction**
(`Default → Hover`, Smart Animate, 400ms, `ease/standard`) so the prototype
plays the reversal. In code the label also scales to **1.05** over the same
duration, and returns to 1 while pressed ("LUX does not bounce").

### ⚠️ Secondary joined the system on 22 Aug 2026

`Style=Secondary` was a **flat white @86%** with **no Hover variant at all** — the
one style the button system could not express. It now carries
**`gradient/secondary`** `#DEEFF3 → #B7C6CA`, the gradient `Small Button /
Secondary` already used, so Secondary reads the same at both sizes and has
something to reverse. **`Style=Secondary, State=Hover` (`749:3338`) was created**
with `gradient/secondary-hover`.

It **keeps its 1px `border/default`** — with both styles now on gradients, that
stroke is what separates Secondary from Primary. It is not a disabled marker.

New with it: paint styles `gradient/secondary` and `gradient/secondary-hover`,
and variables `button/bg-secondary-start` / `-end` (mirroring
`button/bg-default-start` / `-end`). ⚠️ **`button/bg-secondary` (white @86%) is
now orphaned.**

`Small Button / Secondary / Hover` (`225:61`) had been a *lightened* gradient
`#ECF3F4 → #D4E2E5` — a third treatment nothing else in the file used. It now
reverses its own default like everything else.

⚠️ **The Secondary showcase row (`160:26`) was wired to the wrong variants**: the
"Default" cell held `Style=Ghost, State=Hover` and the "Hover" cell held
`Style=Primary, State=Disabled`. Both corrected. **Check what a showcase cell is
an instance of before trusting it as a spec.**

---

### ~~The disabled button surface is TRANSLUCENT — `state/disabled-bg`, settled 18 Aug 2026~~ (superseded, see above)
`state/disabled-bg` was repointed from an unused `#c6cfd0` to **`#eef6f7 @51%`** (`#eef6f782`) and is now the single source for every disabled button. The opaque `#eef6f7` read too bright on screen; translucency lets the control soften against whatever is behind it, which matters most on the sage check tray.

Applied to **all five**, each with a 1px `border/default` stroke, a `text/muted` label and **node opacity 1**:
`Button` Primary (`37:13`) · `Button` Secondary (`37:15`) · `Back button/Disabled` (`239:65`) · `Small Button / Primary / Disabled` (`225:59`) · `Small Button / Secondary / Disabled` (`225:62`).

- **Secondary and Small Secondary used to be a node-opacity 0.4 fade.** That is gone — a 0.4 fade is the HOVER treatment, not disabled, and having two different disabled looks was the drift.
- **Ghost disabled is deliberately untouched.** It has no fill by definition; giving it a surface would stop it being a ghost button.
- This closes the old §7 note that the disabled button "should be `state/disabled-bg` + `text/disabled`" — it now uses `state/disabled-bg`, with `text/muted` rather than `text/disabled`, matching the showcase.
- ⚠️ **A frosted box with no inner shadow reads as flat.** Every light frosted row/card/box needs effect style **`surface/frosted-row`** (inner shadow `2 4 9 #000 @20%`) on top of its `surface/frost-light` fill. Easiest thing to forget on a new screen — I forgot it on both new screens and the boxes looked dead until it was applied.
- **Component labels carry no text style.** `Chip`, `Button` and the nav item labels use raw type, so every instance inherits it. Fixing it propagates everywhere but moves the Button label from Regular 15 → `Button` (Medium 16), a visible change on every button. Needs a decision.
- ~~`bg/nav` vs `surface/frost-nav`~~ **RESOLVED 18 Aug 2026** — the nav component binds `surface/frost-nav`; `bg/nav` is now unreferenced by the nav.
- **Desktop frames split 900 / 934.** New screens are 900.
- **Dark mode is defined but never visually reviewed.**

### ⚠️ Added 21 Aug 2026 while building PRODUCTS in code
Three values were missing from the token/style layer and were added **in Figma
first**, then exported:

| New | Value | Why |
|---|---|---|
| variable `02 Color` → `button/bg-secondary` | `#FFFFFF @86%` (Dark: `#2E2447 @62%`) | `Button` `Style=Secondary, State=Default` (`37:11`) painted a loose hex and was the **last unbound fill in the Button set**. ⚠️ Bound with `paint.opacity = 1` — a colour variable carries its own alpha and leaving 0.86 on the paint multiplies the two to 0.74. |
| effect style `surface/sheet-mobile` | `BACKGROUND_BLUR 28` + drop `0 / −8 / 32` @12% | Every modal tray in the file carried RAW effects; there was no style to point at. The shadow lifts **upward** because the sheet docks to the bottom edge. |
| effect style `surface/sheet-desktop` | `BACKGROUND_BLUR 28` + drop `0 / 12 / 40 spread −8` @18% | The dialog floats, so its shadow falls downward and deeper. |

Applied to `04 — Add product · method sheet` (`576:1376`) and the desktop
`method-dialog` (`583:1786`), verified identical to the raw effects they replaced.
**The CHECK section's trays still carry raw effects** — repointing them at these
two styles is a clean follow-up.

⚠️ **A style REPLACES a node's whole effect list, and assigning `effects` after
`setEffectStyleIdAsync` DETACHES the style.** Re-applying a background blur "on
top" of a freshly-applied shadow style silently unlinks it and drops the shadow.
Put the whole treatment — blur and shadow — in the style.

### Still missing from the design system after PRODUCTS
- **No scrim/backdrop token.** `state/pressed-overlay` at 14% is the only
  darkening value and it is weak for a modal.
- **No opaque sage.** `surface/data-strong` is 62% with no solid counterpart, so
  a `prefers-reduced-transparency` tray has nothing to fall back to. `bg/nav` is
  the model to copy: same colour, fully opaque.
- **No product or bottle icon outside the bottom nav** — every product thumb and
  image well in the file shows a camera glyph.
- **No accordion, no stepper, no general text field, no shutter.**
- `Tag`'s Neutral fill binds the PRIMITIVE `neutral/100`. It should bind
  `bg/surface-frost`, which resolves to the same value.

---

## 8. How to recheck (verification checklist)

1. **Screenshot** the frame after building; also screenshot the sample screen and compare side by side.
2. **Diff against source:** extract fills, font family/weight/size and colours; match exactly, don't eyeball.
3. **Collapsed-frame check:** height ~10px or a 1×1 screenshot means gotcha #1.
4. **Component check:** confirm interactive elements are `INSTANCE`s.
5. **Text style check:** every text node reports a style, not blank or Mixed.
6. **Token audit:** every fill/stroke/radius/gap shows a variable chip.
7. **Width check:** mobile 440, desktop 1440; no fixed 354/402 leftovers.
8. **Existence check:** `getNodeByIdAsync` null-guard; trace nodes to their page before assuming they're missing.

---

## 9. Figma → code

- **Tokens → CSS custom properties.** Emit `:root { … }` from the 9 collections (Light), with a `[data-theme="dark"]` override for the Color collection's Dark mode. Reference by `var(--…)`, never hardcode.
- **Auto-layout → flexbox:** VERTICAL = `column`, HORIZONTAL = `row`, `itemSpacing` = `gap`, `FILL` = `flex:1`, `HUG` = `fit-content`, `SPACE_BETWEEN` = `justify-content:space-between`.
- **Frosted glass:** `background: rgba(...)` + `backdrop-filter: blur(Npx)`; **always** provide a solid fallback and respect `prefers-reduced-transparency`.
- **Two surface systems → utility classes** (`.surface-light`, `.surface-data`).
- **Components 1:1** with the Figma components, bound to tokens.
- **Layering:** use the `--z-*` scale. Absolute positioning only for true overlays.
- **Responsive:** 440 / 1024 / 1440, content max 1280, margins 24/40/80.
- **States:** implement all five (hover, pressed, focus-visible, selected, disabled) from board `04b`. Never drop focus.
- **Icons:** 24px, 2px stroke, round caps, `currentColor`.

### The HTML design-system page (target structure)
Cover → Foundations (Colour · Typography · Spacing & Radius · Elevation & Blur · Motion · Grid) → Components (one block each: live render, all states, props table, snippet, do/don't) → Patterns → Screens → Tokens appendix (`:root` block, copy-pasteable). This mirrors the canvas numbering, so every HTML section has one obvious source board.

---

## 10. Continuous-improvement checklist for the next chat

- [ ] Re-verify the file map + component IDs (the user moves things).
- [ ] Any new screen: 440 / 1440, from components, correct surface system, full logo, component header, text styles, bound tokens.
- [ ] After building: run the §8 checklist.
- [ ] Work through §7 debt.
- [ ] Keep the boards `00`, `01`, `02`, `04b` and this file in sync.
- [ ] When adding components, write the Figma description too.

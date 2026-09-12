# Figma AI — tokens: variables & paint styles to update

**File:** `wIftBhzkn8E4wjZwgdH71n` · **Collection:** `02 Color` (Light mode) unless noted · **Generated:** 9 Sep 2026

**What this file covers:** Every colour variable, gradient/paint style, and size token that is stale or missing in the Figma file. For frame-level and component changes, see the companion file `figma-ai-frames.md`.

**How to use:** Each row names one variable by its exact **Web code syntax** (the `--color-*` name), states what you will currently see, and gives the exact new value to type in. "Direct hex" means **break any alias to a `01 Primitives` step** before entering the value — components must never bind a primitive. For paint styles (gradients), look under **Local styles → Paint styles**, not Variables.

**What NOT to do:**
- Do not repoint a `01 Primitives` ramp step (`indigo/700`, `indigo/800`, `red/500`, `rose/500`) — the semantic roles that alias them are being moved individually so the ramp stays intact.
- Do not nudge `surface/data-deep`'s alpha or hue — both are chosen values (see `figma-ai-tokens.md` §3).
- Do not brighten `gradient/brand` back toward sage — the rejected pass that cleared AA (`#5f7275→#3c4b4e`) was a solid dark pill, not a sweep. The indigo reassignment is the decision.

**Live verification** was run on `476:2841` (Check results), `581:1593` (My Products), and `37:9` (Button default) via `get_variable_defs` on 9 Sep 2026. The "already correct" section below reflects what the live frames actually resolve to.

---

## 0. Variables already correct — verify, do not skip

These resolve correctly on at least one live frame. Check the **root variable** in `02 Color` — if it already holds this value, skip. If a frame resolves correctly but the root variable still holds the old value, the fix is a local override; correct the variable so every frame resolves the same way.

| Variable (Web code) | Settled value | Live source |
|---|---|---|
| `text/on-data` `--color-text-on-data` | `#2e2a3f` (`text/primary` — the app ink) | `476:2841` resolves `#2e2a3f` ✓ |
| `text/on-data-secondary` `--color-text-on-data-secondary` | `#354446` (sage-tinted, direct hex) | `476:2841` resolves `#354446` ✓ |
| `text/muted` `--color-text-muted` | `#63636f` (direct hex — **break the `neutral/400` alias** if still bound) | `581:1593` resolves `#63636f` ✓ |
| `surface/frost-nav` `--color-surface-frost-nav` | `rgba(219,237,237,0.878)` = `#dbedede0` @88% | `476:2841` resolves `#dbedede0` ✓ — **never correct this back** (settled 22 Aug 2026) |
| `bg/nav` `--color-bg-nav` | `#dbeded` (fully opaque) — same colour, no alpha; `prefers-reduced-transparency` fallback for `surface/frost-nav`. Was `#9caeaf @55%`. | Settled 22 Aug 2026 |
| `bg/bubble-ai` `--color-bg-bubble-ai` | `#dbeded` (direct hex, not `blue/50`) | Changed 22 Aug 2026 |
| `bg/bubble-user` `--color-bg-bubble-user` | `#cadfdf` (direct hex, not `sage/300`) | Changed 22 Aug 2026 |

---

## 1. Variables to edit — confirmed stale on live frames

Open **Variables → `02 Color` → Light mode**. For each row find the role by its **Web code syntax** and set the **New value** exactly. "Direct hex" means break the alias first.

| # | Variable (Web code) | Old (what you see) | New value | Why & check |
|---|---|---|---|---|
| 1 | `text/on-data` `--color-text-on-data` | `#ffffff` — **verify first**; `476:2841` may already resolve `#2e2a3f` (see §0) | **`#2e2a3f`** (alias to `text-primary` / `neutral/800` if Figma allows) | `surface/data` = `#7da7a9 @44%` ≈ `rgb(170,194,198)`. White on it fails at every alpha — even 100% white is 2.63:1. 38 of 59 text nodes on Check results failed. |
| 2 | `text/on-data-secondary` `--color-text-on-data-secondary` | `rgba(255,255,255,.85)` — **verify first**; `476:2841` may already resolve `#354446` (see §0) | **`#354446`** (direct hex, sage-tinted) | Needs 4.5:1 for 12–13px labels. `#2e2a3f @82%` failed at 4.43:1; hierarchy goes to size/weight/tracking. |
| 3 | `text/on-data-muted` `--color-text-on-data-muted` | `rgba(255,255,255,.62)` | **`#354446`** (same value — both tiers collapse to one) | Same measurement as #2. |
| 4 | `text/muted` `--color-text-muted` | `#9a9aa5` via alias `neutral/400` — **verify first**; `581:1593` may already resolve `#63636f` (see §0) | **`#63636f`** (direct hex — **break the alias** to `neutral/400`) | Was 2.13–2.57:1 on product-row meta, DateField placeholder, hub counts, check-history counts (all 12–16px); new value is 4.54–5.47:1. |
| 5 | `feedback/warning` `--color-feedback-warning` | `#c9918e` via `rose/500` — confirmed on live `476:2841` | **`#d47873`** (direct hex — do **not** repoint `rose/500`) | Risky band pill + analysis confidence pill. Old pair was dusty red/rose 6 chroma steps apart (two families); new pair is one hue at 3.1° differing only in lightness (55%/64%). White = 2.65–3.12:1 — see `figma-ai-frames.md` §7 open question. |
| 6 | `feedback/error` `--color-feedback-error` | `#a86561` via `red/500` — confirmed on live `476:2841` | **`#c65953`** (direct hex — do **not** repoint `red/500`) | Avoid band pill ×3. Paired with #5 as one scale. White = 4.47→4.24:1. |
| 7 | `text/warning` `--color-text-warning` | `#c9918e` via `rose/500` | **`#d47873`** (mirror `feedback/warning`) | No caller; moves so a first caller inherits consistency. |
| 8 | `text/error` `--color-text-error` | `#a86561` via `red/500` — confirmed on live `581:1593` | **`#c65953`** (mirror `feedback/error`) | Caller: **Remove** action on `ProductAccordionCard` (`581:1593`, `t-label` 14/20) — was 3.98/3.82/3.42:1, now 3.77/3.62/3.25:1 — pre-existing 1.4.3 failure, logged open. Do not exempt from the single red. |
| 9 | `border/error` `--color-border-error` | `#a86561` via `red/500` | **`#c65953`** (mirror `feedback/error`) | No caller; moves for consistency. |
| 10 | `bg/brand` `--color-bg-brand` | `#3b305c` via alias `indigo/700` (hue 293.5) — `581:1593`'s `text/brand` still shows this | **`#39386f`** (direct hex, hue 281.7 — **break the alias** to `indigo/700`) | Must match `gradient/brand`'s dark end. They sit side-by-side on `/progress` (button beside checked-in discs) and read as two violets at 293.5 vs 282. **Never repoint the primitive.** |
| 11 | `bg/brand-hover` `--color-bg-brand-hover` | `#2e2447` via alias `indigo/800` | **`#2c2a5f`** (direct hex — **break the alias** to `indigo/800`) | Follows `bg/brand` by the same lightness step on the new hue. |
| 12 | `text/on-data-muted` — confirm this resolved to `#354446` in row #3; check no separate `rgba(…)` lingers if it was aliased separately. | — | — | — |

> **Do not** repoint `indigo/700`, `indigo/800`, `red/500`, or `rose/500` primitives. Five semantic roles alias `red/500`/`rose/500` and all five declare the new hex directly; repointing the ramp step would move everything aliasing it and leave no role able to stay behind.

---

## 2. Gradient/paint styles to repoint (indigo reassignment)

These are **paint styles**, not colour variables — `get_variable_defs` returns `""` for them. Look them up under **Local styles → Paint styles**.

| Paint style / token | Old (sage) | New value (indigo) | Notes |
|---|---|---|---|
| `gradient/brand` (styles `37:5`, `37:9`) | `#bbd3d9` → `#637073` (sage, hue 213–215, chroma 0.016–0.027 — reads as disabled steel pill) | **`#657792` → `#39386f`** (indigo, hue 258→282, chroma 0.047→0.092) | White sweep: old 2.05/2.52/3.12/3.99/5.13 → new **4.56**/5.62/6.90/8.59/**10.66**. Passes AA at both ends. |
| `gradient/brand-hover` | same pair reversed (sage) | **`#657792` → `#39386f` reversed** — same two stops swapped, no new colour | Pill holds still; gradient reverses end-for-end. |
| `button/bg-default-start` `--color-button-bg-default-start` | `#bbd3d9` | **`#657792`** | Mirrors `gradient/brand` start — Figma holds the gradient twice; both move together. |
| `button/bg-default-end` `--color-button-bg-default-end` | `#637073` | **`#39386f`** | Mirrors `gradient/brand` end. |
| `@property --grad-start / --grad-end` initial values | `#bbd3d9` / `#637073` | **`#657792` / `#39386f`** | If any export plugin carries these, update as well. |
| `gradient/brand-indigo` note — "for marks and accents only" | — | **Remove that rule entirely** — the primary button is indigo now; `design.md` §4 carries it and it leaves with this change. | |
| `button/bg-secondary` `--color-button-bg-secondary` `rgba(255,255,255,0.86)` | white @86% — orphaned since Secondary moved to `gradient/secondary` | **Leave orphaned or delete/repurpose.** No component binds it. Do not silently resurrect. | |

---

## 3. New variables / roles to create

None exist in `02 Color` (or other collections). Create each as a new variable at the exact values below. All values are declared on `:root` in `globals.css` and confirmed against the shipped build.

### System B — third tier (`sage/700`)

| Variable (Web code) | Value | Purpose |
|---|---|---|
| `surface/data-deep` `--color-surface-data-deep` | **`#4f838f @85%`** = `#4f838fd9` | The third System B step. OKLCH L 0.578 C 0.0585 hue 214.1 — **15° bluer than `surface/data` (199.8)**, which is a chosen value; do not correct it onto the sage line. Four callers (SymptomTrend card, ResultCards emphasis block, CheckBasket product rows, AddProductMethodSheet tiles) were failing 1.64–2.32:1 for white; this tier lifts them to 3.42–3.77:1. |
| `surface/data-deep-hover` `--color-surface-data-deep-hover` | **`#588c98 @85%`** = `#588c98d9` | Hover for method tiles. Same hue/alpha, one lightness step up (L 0.578→0.608). Must be a step by construction, not by coincidence with `surface/data-strong` (different hue/alpha). White on hover is 3.43:1 — worse than base, as hover always is. |
| `text/on-data-inverse` `--color-text-on-data-inverse` | **`#ffffff`** | The **only** white-on-sage ink — paired with `surface/data-deep` **only**. On `surface/data` white is 1.87:1 (the failure non-negotiable 17 was written to stop). Record the pairing beside the token. |

### Brand family — indigo re-hue

| Variable (Web code) | Value | Purpose |
|---|---|---|
| `bg/brand-soft` `--color-bg-brand-soft` | **`#8284c0`** (indigo/300 re-hued to match `bg/brand`'s new hue) | Moderate-likelihood pill on `ResultCards`. White = 3.49:1 — under AA, same open question as the band pills. It is the lighter half of a two-point scale with `bg/brand`; two hues would break it. |

### Frost-light family

| Variable (Web code) | Value | Purpose |
|---|---|---|
| `bg/frost-light-muted` `--color-bg-frost-light-muted` | **`#dbeded`** (fully opaque; same hex as `bg/nav`/`bg/bubble-ai`, written out not aliased so retuning nav/bubble does not silently move the pills) | Opaque fill for face-diagram region chips that sit ON a `surface/frost-light` card — at 55% the pill dissolved; `#f4feff` was the brightest light value and read as a white sticker on sage — one step down. |

### Border

| Variable (Web code) | Value | Purpose |
|---|---|---|
| `border/chip` `--color-border-chip` | **`#6b8b8d`** (direct hex — sage 400 +1, not a new hue) | Chip hairline. Chip had no stroke; fill on the composited question card was 1.03:1 (invisible). Measures 3.14:1 on the light card, 2.20:1 on sage (where fill already does most work). Neutral borders can't reach it. `07 Size` wants `sage/500` anyway. |

### Green text

| Variable (Web code) | Value | Purpose |
|---|---|---|
| `text/success-ink` `--color-text-success-ink` | **`#46664f`** (same hue as `feedback/success` `#5f8a6e`, ink weight) | Text on the light frosted card — `feedback/success` (`green/500`) is right as a fill and fails as 12px text: 3.28:1 at 440 / 3.63:1 at 1440. New value clears **5.36:1 / 5.93:1**. Addition, not retune — `text/success` alias (no caller) is the natural place for this. |

### Face-diagram illustration

| Variable (Web code) | Value | Purpose |
|---|---|---|
| `face/gradient` `--gradient-face-form` | **`radial-gradient(108% 100% at 33% 21%, #cddddb 0%, #bdd1d2 26%, #a7c0c1 62%, #a7c0c1 100%)`** — i.e. sage/200 → sage/300 → sage/400 | The FaceDiagram dome. Built from the sage ramp so the face reads as the card's surface lifting, not a new surface arriving. The file currently has no face artwork at all (the comp was a stroked ellipse). |
| `face/shadow` `--shadow-face-form` | **`0 16px 34px -14px rgba(46,36,71,.28), inset -14px -18px 36px rgba(46,36,71,.2), inset 10px 12px 26px rgba(255,255,255,.26)`** | Deep edge carried by inset ink, not a further ramp step (sage primitives stop at 400). |
| `face/tier-fill` `--color-surface-face-tier` | **`rgba(225,235,233,.22)`** (sage/100 at 22%) | One translucent wash for the contour levels — depth accumulates by level count, not five hand-picked fills that could drift. |
| `face/tier-shadow` `--shadow-face-tier` | **`0 5px 12px -5px rgba(46,36,71,.2), inset 0 1px 0 rgba(255,255,255,.3)`** | Paired with `face/tier-fill`. |

### Chat panel fills

| Variable (Web code) | Value | Purpose |
|---|---|---|
| `gradient/chat-panel` `--gradient-chat-panel` | **`linear-gradient(116.756deg, #dbebed 36.39%, #d1e1e5 53.77%, #c3cdd9 105.01%)`** | The chat panel's own gradient — lighter top+bottom than `gradient/canvas-mobile`, which is what separates the panel from the canvas underneath. |
| `border/sage-subtle` `--color-border-sage-subtle` | **`#b5c8cc`** | Date-divider hairlines in the chat panel. Neutral borders (`#e2e4e8`, `#cbcdd4`) read wrong on sage. |
| `border/sage-hairline` `--color-border-sage-hairline` | **`#beced2`** | Composer field hairline. |

### Spacing & layout

| Collection | Variable (Web code) | Value | Purpose |
|---|---|---|---|
| `04 Radius` | `radius/4xl` | **`36px`** | Chat panel corner radius — sits between `radius/3xl` (32) and `radius/full` (999). |
| `03 Spacing` | `space/6` | **`6px`** *(if used; or move chat panel to `space/xs` 4)* | Chat bubble → timestamp gap. |
| `05 Layout` | `width/action` `--width-action` | **`376px`** | Primary action button width at desktop. |
| — | `nav/inset-bottom` `--nav-inset-bottom` | **`5px`** | Nav offset from bottom edge. Single value used at six sites; off the spacing scale. |

### Value still to decide (do not create yet)

| Variable | Status |
|---|---|
| **`scrim`** (the modal scrim) | `state/pressed-overlay` @14% is the only darkening value and measures 1.64–2.13:1 behind a sheet — far too weak. Add a real scrim when a value is chosen. |
| **`surface/data-strong` opaque counterpart** | `bg/nav` is the solid twin of `surface/frost-nav`; `surface/data-strong` @62% has none. Reduced-transparency composites sage over `bg/canvas` by hand until one exists. |
| `bg/accent-mint` | Dangling — `Style=Ghost Hover` (37:19) still points at it. Restore or repoint the Ghost variant. No screen uses Ghost, so either is safe. |

---

*For frame-level changes, stale components, new screens, open design questions, and the full component list — see `figma-ai-frames.md`.*

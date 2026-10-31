Next.js 16. Check `node_modules/next/dist/docs/` before using a Next API.

# LUX — rules

LUX: AI-guided skincare investigation web app. This repo is `lux-v3`, the redesign. Never touch `~/Claude/LUX/lux-v2`.

## Source of truth

- Design system lives in code: `app/tokens.css` (every value, declared once), `app/globals.css` (every rule), `components/ui/`, `components/layout/`.
- `/styleguide` renders it live.
- Figma is retired. Don't reference it.
- New visual decision = token or component change. Never a one-off value on a screen.
- Visual refs: `~/Claude/vidgen/index.html`, `~/Claude/vidgen-studio/index.html`. Inventory: `docs/component-inventory.md`.

## Read first

- Editing a file → its doc comment.
- Building or restyling a screen → `docs/design.md`.
- Changing a section's flow, surfaces or copy → `docs/decisions.md`.
- Copy about a product's effect on skin, or the investigation flow → `docs/product-brief.md`.

## Code layout

```
app/                 routes only, thin page.tsx shells
components/ui/       design system components + icons
components/layout/   app chrome: BottomNav, HubScreen, ScreenHeader, RouteAnnouncer, Snackbar
features/my-skin/    flow.ts, safety.ts, analysis.ts, profile.ts, steps, FaceDiagram
features/products/   products.ts, search hooks, list/card/details, add tray
features/progress/   progress.ts, ProgressScreen, check-in, calendar, trend
features/check/      check.ts, check screens, CompatCard, ResultCards, CheckBasket
lib/store/           answers.ts, persistence.ts, InvestigationProvider.tsx
lib/                 date.ts, demo.ts, pageTitles.ts, actives.ts
```

- Four sections, four folders. No fifth.
- New file goes in `features/<section>/` unless two sections use it.
- `components/ui/`: no opinion on content. `components/layout/`: frame around a screen. Neither imports a feature.
- Sections may import each other.
- `features/<section>/*.ts` own data and derived values. Screens don't recompute.
- `QuestionScreen`, `StepProgress` live in `my-skin` (they read `flow.ts`).
- `lib/actives.ts` is shared by analysis and CHECK. CHECK's `SCORING` stays in `check.ts`.
- `lib/pageTitles.ts` is the one shared module allowed to import a feature.

## Routes

| Route | Kind | Nav |
| --- | --- | --- |
| `/` | welcome | `none` |
| `/investigation/start` | step 1/5 | `my-skin` |
| `/investigation/skin-type` | step 2/5 | `my-skin` |
| `/investigation/conditions` | step 3/5 | `my-skin` |
| `/investigation/timing` | step 4/5 → `/investigation/profile` | `my-skin` |
| `/investigation/profile` | pushed, recap of steps 1–4 | `my-skin` |
| `/investigation/products` | step 5/5 | `products` |
| `/investigation/analysis` | pushed, retrospective analysis | `my-skin` |
| `/products` | hub | `products` |
| `/progress` | hub, default, populated | `progress` |
| `/progress/empty` | prototype empty state | `progress` |
| `/progress/check-in` | pushed, check-in chat | `progress` |
| `/progress/check-in/[date]` | pushed, only dynamic route | `progress` |
| `/check` | hub, default, titled `Analysis` | `check` |
| `/check/no-profile` | prototype empty state | `check` |
| `/check/new` | pushed, build a check | `check` |
| `/check/analyzing` | pushed | `check` |
| `/check/results` | pushed | `check` |
| `/check/history` | pushed | `check` |
| `/styleguide` | dev tool | `none` |

- Flow step = has a progress track. Hub landing: no track, no back. Pushed view: back, no track.
- `TOTAL_STEPS` = 5. Profile and analysis are not steps. Don't add them to `STEPS`.
- Nav id `check` is labelled `Analysis`. Don't rename the id.
- Overlays (`Sheet`, not routes): selfie capture, products add tray, progress photo gallery.
- Daily check-in: modal on `/progress` and route `/progress/check-in`. Both render `CheckInPanel`. Don't fork. Scrim doesn't close it.
- Dialogs use Radix Dialog + `useDialogFocus` (`lib/useModalDialog.ts`).

### my-skin

- Step 1 picks places one symptom at a time. `start` is `Partial<Record<Symptom, string[]>>`. Write via `withAreas`; read via `symptomsOf` / `areasOf`.
- Typed `Other` is `answers.locationOther`.
- Selfie shutter only captures, never deletes. Each capture writes a new id.
- Safety: `Swelling` / `Rash` show `SafetyNotice`. It doesn't interrupt or gate Continue. Don't add a triage redirect. Rule in `safety.ts`.
- Profile recap reads raw answers, not `skinProfile()`. It's `force-dynamic`. Copy in `profile.ts`. Labels name their subject.
- A multi-select renders as a set (pills), never a comma list.

### Analysis

- Model and every string in `analysis.ts`.
- One route. The wait is a state. Don't split into a wizard.
- No score, bar or percentage. Confidence is a word.
- Refuses only on: no flare date, or nothing new + nothing readable. Don't add completeness gates.
- `unclear` → `unresolved-timeline` gap with the confirmation strip, no `href`.
- Reads `ownedProducts()`, not `answers.products`.
- Analysis and CHECK must not converge.

## State

- Controls start empty. Nothing pre-selected.
- Readouts (`/progress`, `/check`) open populated via `skinProfile()` in `lib/demo.ts`.
- Continue is gated by the step's `isComplete` in `flow.ts`. `QuestionScreen` owns the button.
- Read with `useInvestigation()`.

| Slice | Lifetime | List |
| --- | --- | --- |
| `products`, `checks`, `checkIns`, `savedFinding` | forever | `PERSISTED_KEYS` |
| steps 1–4 answers | 24h sliding | `FLOW_KEYS` |
| drafts, baskets, search, `evidence`, `scan`, `viewingCheck` | tab only, never written | — |

- Keys: `lux.records.v2`, `lux.flow.v2` (envelope `{ savedAt, answers }`).
- Expiry checked on read. Future stamp = stale.
- Hydrate in an effect. Gate writes on `hydrated` state, not a ref.
- Not resumable. No UI that promises resume.
- Toggles use the updater form: `setAnswer(key, (prev) => …)`.
- Screens echo earlier answers. Guard for missing ones.

## Tokens and type

- Sizes are rem (16px = 1rem). Borders, hairlines, shadows, blur, breakpoints stay px.
- Write new values as a token or rem, never px (except the kinds above).
- Line heights: unitless ratios.
- Font: Figtree. Values: `tokens.css`, `docs/design.md`.
- Every text uses a `t-*` class. No ad-hoc `font-size`.
- `t-a-b` = a on mobile, b on desktop. Fluid: headline, `t-h2`, `t-h3-h2`, `t-body2-body1`, `t-body3-body2`.
- Every page `<h1>` is `t-h4-h3`.
- Headings `text-wrap: balance`, prose `pretty`, controls neither. No `text-wrap` in modules.
- Bind semantic colour tokens. Never primitives (`--color-indigo-*` …).
- Digits that stack: `tabular-nums`, by role.
- Never carry meaning by colour alone. Green text = `text/success-ink`.

## Components

| Component | Props |
| --- | --- |
| `Button` | `variant?: "primary" \| "secondary"`, `size?: "lg" \| "md"`, `width?: "hug" \| "full" \| "action"`, `href?`, `icon?` |
| `IconButton` | `label`, `variant?: "glass" \| "primary" \| "outline" \| "soft"`, `size?: "lg" \| "md" \| "sm" \| "xs"` (56/48/44/20), `href?`, `ref?` |
| `SmallButton` | `label`, `arrow?`, `href?`, `className?` |
| `EditToggle` | Edit/Save toggle |
| `Chip` | `label`, `selected`, `control?: "checkbox" \| "radio"`, `onToggle` |
| `OptionRow` | `control: "radio" \| "checkbox"`, `label`, `selected`, `onSelect` |
| `Tag` | `children`, `variant?: "neutral" \| "brand"` |
| `TextField` | input attrs + `ref?` |
| `DateField` | `value?`, `onChange`, `id?`, `placeholder?` |
| `SearchField` | `value`, `onChange`, `placeholder?`, `label` |
| `ChatBubble` | `from: "ai" \| "user"`, `align?`, `full?` |
| `Sheet` | `open`, `onClose`, `title`, `children` |
| `Collapse` | `open`, `as?`, `appear?` |
| `DataCard` | `as?`, `className?` |
| `CameraCapture` | `captured`, `title`, `helper`, `onCapture` |
| `Orb` | `size?`, `animateIn?`, `thinking?` |

- A control that looks like one of these IS one of these. Add a variant; never restyle it in a screen module.
- Icons: `components/ui/icons.tsx`. Size via CSS or `--icon-size`. Never `width`/`height` in `icons.tsx`.

## Rules

- Buttons: hover reverses the gradient; disabled = opacity 0.4. `@property` initial values must match the tokens.
- Bottom nav: fixed, same on every screen, 4 items. Offset is `--nav-inset-bottom`, never a literal. `surface/frost-nav`, opaque `bg/nav` fallback, dark ink. Height ≥ 56.
- Chat bubbles: opaque, no border, one tail corner.
- Fixed-height row with a border: `min-height`, no vertical padding.
- Gradient + border: `background-origin: border-box`.
- Frosted surface: solid `prefers-reduced-transparency` fallback.
- Mobile-first. Desktop at `min-width: 1024px`. No 440/1440 queries.
- Focus ring is an `outline`. Never remove. Only `main[tabindex="-1"]:focus` turns it off.
- Every button declares its own padding.
- `surface/data` takes dark ink. `surface/data-deep` takes white. Don't swap.
- `::selection`, caret, native accents bind `bg/brand`.

### Surfaces

- System A, forms (my-skin, products, check): frosted rows, dark text, 1px `border/subtle`.
- System B, readouts (progress): `DataCard`, no stroke, `border/glass` dividers.
- Don't mix.

### Empty states

- `HubScreen layout="plain" center`: Orb → 32 → `t-h4-h3` title → 12 → body → 32 → action. No card.
- Heading stays top; only the block centres.

### Selection controls

| Control | Shape | Picks | Role |
| --- | --- | --- | --- |
| Radio row | circle | one | `radio` |
| Checkbox row | square | 0+ | `checkbox` |
| Chip | pill | 0+ | `checkbox` |
| Chip (radio) | pill | one, short scale only | `radio` + `radiogroup` |

- Exclusive options ("None", "Not sure") stay checkboxes. Declared only in `EXCLUSIVE_OPTIONS`.

### Motion

- Nothing snaps. Every change animates.
- Hover uses `--ease-hover`. Enter/exit/selection use `--ease-standard` or `--ease-in-out`.
- Press = `pressable` class. No transform.
- Name `@keyframes` animations only in `globals.css`. Modules may set `animation-delay`.
- Reveals: `.reveal`, `.reveal-quick`, `.reveal-hero`, `[data-reveal]`, `[data-reveal-stagger]`. Fill mode `backwards`.
- Panels that close: `<Collapse>` (in flow) or `.drop` + `data-state="leaving"` (floating). Not `.reveal-quick`.
- Popover owner: `position: relative; z-index: 1`.
- Every `:hover` gets a `@media (hover: none)` counterpart.
- Verify motion with `getAnimations()`, not by sleeping.

## Page titles

- Every route exports `metadata` via `lib/pageTitles.ts`. Title names the kind of page.
- `RouteAnnouncer` announces and moves focus. Screens just render a `<main>`.

## Before done

- `npm run build` and `npm run typecheck` clean.
- `npm run spacing` if layout changed.
- `npm run vocab` if copy mentions a product's effect on skin.
- Check at 440 and 1440. Check computed values, not screenshots.
- Visible focus outline on every control.
- ARIA roles that take a name have one.
- Measure contrast by hand. A clean axe run proves nothing on gradients.
- Flow CTA behind the nav at rest is by design. No sticky footer.

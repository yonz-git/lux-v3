# LUX v3 — Design system

The system every lux-v3 screen is built from. It replaces the Figma-era guide
(`docs/archive/design-figma.md`). Written 1 Oct 2026.

**The source of truth is the code, not this page.** Values live in
`app/tokens.css`, `app/globals.css` and `app/vidgen.css` (loaded last, so it
wins), and in the components under `components/ui/` and `components/layout/`.
`/styleguide` renders all of it live. If this page and the code disagree, the
code is right and this page is stale: fix the page.

---

## 1. The look in one paragraph

Pale sage canvas. On it, **glass**: a thin white tint (25%) with a 1px white
edge and a white highlight along the top, never a solid white. Controls are
**pills and circles**. Round 56px buttons, 56px chips, pill buttons. There is
**one indigo** (`#313560`), used for the primary action and for anything
selected. Type is **Urbanist**: light, large headlines with the key words in
bold indigo; regular body; medium labels. Boxes are a **sheet** (the large
sage frosted surface with very round corners) holding **panels** (frost boxes).
The look comes from the VidGen references (`~/Claude/vidgen/index.html`,
`~/Claude/vidgen-studio/index.html`); the gradients and the indigo are
lux-v2's own.

## 2. Rules

1. **New visual = new token or component.** Never write a one-off colour,
   size, radius or shadow on a screen. If the system lacks it, add it to
   `app/vidgen.css` (or a component), then use it.
2. **No solid white fills.** White appears only as glass (25% / 40%), as a
   1px edge, as a highlight, or as text on indigo.
3. **One primary action per screen**: the indigo pill (`Button`) or the
   indigo circle (`IconButton variant="primary"`). Everything else is glass.
4. **Selected = indigo.** A selected chip, row edge, tag or day is
   `bg/brand`. Never show selection with a new colour.
5. **Every text node takes a `t-*` class** (section 4). No `font-size` on a
   screen.
6. **Icons come from `components/ui/icons.tsx`** at their own default size.
   No inline SVG on a screen, and never set `width`/`height` on an icon: a
   caller resizes with `--icon-size`.
7. **Touch targets are at least 44.** Controls are 56; anything drawn smaller
   gets the `tap-target` class.
8. **Glass sits on the canvas or on the sheet, not on glass.** Glass inside a
   panel is fine (the panel is a frost box, not glass).
9. **Never carry meaning in colour alone.** Pair a colour with a word or a
   shape; warning and error share a hue.
10. **Gradients are lux-v2's three** (section 5). Don't add VidGen's glows
    back; they were tried and dropped.

## 3. Where things live

| What | File |
| --- | --- |
| Primitive and semantic tokens (colour ramps, spacing, radius, motion) | `app/tokens.css` |
| Global rules: focus ring, `pressable`, `tap-target`, reveals, the canvas, icon sizing | `app/globals.css` |
| The lux-v3 layer: type ramp, glass, spacing roles, control sizes, sheet/panel recipes | `app/vidgen.css` |
| Components with no opinion about content | `components/ui/` |
| The frame around a screen (nav, headers, chat chrome, snackbar) | `components/layout/` |
| A section's screens and data | `features/<section>/` |

## 4. Type — Urbanist

Weights loaded: 300 Light, 400 Regular, 500 Medium, 600 SemiBold, 700 Bold.

| Class | Size / line | Weight | Use |
| --- | --- | --- | --- |
| `t-headline` | 36/44 | Light; `<b>` is Bold in indigo | hero lines: welcome, empty states |
| `t-kicker` | 16/20 | Regular, secondary ink | the line above a headline ("Welcome to") |
| `t-brand` | 20/24 | Bold | the wordmark |
| `t-h2` | 28/34 | Regular | large section heading (rare) |
| `t-h4-h3` | 22/28 | Regular | **every page `<h1>`**, sheet titles |
| `t-h3-h2` | 22/28, desktop 24/30 Medium | | a title that steps up on desktop |
| `t-h4` | 20/24 | Regular | |
| `t-h5` | 18/22 | Regular | panel and card labels |
| `t-h6` | 16/20 | Medium | row titles |
| `t-body1` | 18/24 | Regular | |
| `t-body2` | 16/22 | Regular | body copy |
| `t-body2-body1` | 16/22, desktop 18/24 | Regular | chat bubbles |
| `t-body3` | 14/20 | Regular | secondary copy |
| `t-body3-body2` | 14/20, desktop 16/22 | Regular | |
| `t-chip` | 16/20 | Regular | chip labels (`Chip` applies it) |
| `t-label` | 14/20 | Medium | tabs, small labels |
| `t-nav` | 14/20 | Medium | nav labels |
| `t-button` | 15/20 | Medium | `Button` lg (applied by the component) |
| `t-button-md`, `t-button-sm` | 14/20 | Medium | `Button` md, `SmallButton` |
| `t-label-sm` | 12/16 | Medium | tags, meta |
| `t-caption` | 12/16 | Regular | captions |
| `t-overline` | 12/16 | SemiBold, 0.12em tracking, caps | section labels in panels |
| `t-metric1` / `t-metric2` | 56/60 · 40/40 | Light | big numbers in panels |

A `-a-b` name means "a on mobile, b on desktop". The class does the switch;
never write the media query yourself. Headings balance their lines and prose
avoids orphans automatically.

**The headline pattern** (welcome, empty states):

```tsx
<p className="t-kicker">Welcome to</p>
<h1 className="t-headline">Your skin,<br /><b>one day</b> at a time</h1>
```

## 5. Colour and gradients

**Ink**

| Token | Value | Use |
| --- | --- | --- |
| `--color-text-primary` | `#2e2a3f` | headings, body, labels |
| `--color-text-secondary` | `#4b4b57` | chip labels, kicker, secondary copy |
| `--color-text-muted` | `#63636f` | captions, meta |
| `--color-text-on-brand` | white | text on indigo |
| `--color-text-success-ink` | `#46664f` | green TEXT (the fill is too light for text) |

**Brand**

| Token | Value | Use |
| --- | --- | --- |
| `--color-bg-brand` | `#313560` | selected state, glyphs on glass, emphasis |
| `--color-bg-brand-hover` | `#242750` | the dark end of the selected shade |
| `--color-bg-brand-soft` | `#7980af` | soft accents |

**Glass** (`app/vidgen.css`)

| Token | Value | Use |
| --- | --- | --- |
| `--color-glass` | white @ 25% | chips, round buttons, secondary pills, fields, rows |
| `--color-glass-strong` | white @ 40% | hover, a selected row's fill |
| `--color-border-glass` | white @ 55% | the 1px edge on every glass and panel surface |
| `--shadow-glass` | inset 0 1px 0 white @ 80% | the highlight along the top of glass |
| `--shadow-panel` | inset 0 1px 0 white @ 90% | the highlight on panels |

**Surfaces**

| Token | Value | Use |
| --- | --- | --- |
| `--color-surface-frost-light` | `#f4feff` @ 55% | the panel fill |
| `--surface-sheet` | `surface/data` lightened 10%, @ 30% | the sheet fill (lux-v2's tray) |
| `--color-surface-data-deep` | `#4f838f` @ 85% | an emphasis block; white ink only |

**Feedback.** `--color-feedback-success` `#5f8a6e`, `-warning` `#c9918e`,
`-error` `#c65953`. Fills only; pair each with a label.

**Gradients: lux-v2's, and only these.**

| Token | Use |
| --- | --- |
| `--gradient-canvas-mobile` / `-desktop` | the page ground (the app canvas paints it) |
| `--gradient-brand` | `#485780 → #313560`, left to right: the primary action |

The selected chip shades `bg/brand → bg/brand-hover` at 135°; that lives in
`Chip`, not as a token.

## 6. Spacing

The scale (`--space-*`): `2xs` 2 · `xs` 4 · `sm` 8 · `md` 12 · `lg` 16 ·
`xl` 20 · `2xl` 24 · `3xl` 32 · `4xl` 40 · `5xl` 48 · `6xl` 64 · `7xl` 80 ·
`8xl` 96 · `9xl` 120.

**Reach for the roles first.** They are the gaps the references actually use:

| Role | Value | Use |
| --- | --- | --- |
| `--space-group` | 4 | between controls in one cluster (chips, round buttons) |
| `--space-inset` | 8 | sheet edge to the panel inside it; the floating sheet's distance from the screen edge |
| `--space-gutter` | 24 | screen side margin; a panel's side padding |
| `--space-panel` | 32 | a panel's top padding; panel padding on desktop |
| `--space-section` | 48 | headline block to the next block; between unrelated groups |

Inside a panel: label → body 20 (`xl`), body → chips 20, chips → the
round-button row 44 (the 20 gap plus 24 more, so the actions sit apart). Icon to label inside a chip is 9; inside a panel
label it is 11. Both are the reference's own values, written in the component.

## 7. Radius, sizes, shadows

| Radius | Value | Use |
| --- | --- | --- |
| `--radius-sheet` / `--radius-sheet-foot` | 36 / 44 | the sheet: top corners / bottom corners |
| `--radius-panel` | 28 | panels, data cards |
| `--radius-media` | 22 | photos, image cards |
| `--radius-full` | 999 | every pill and circle |
| `--radius-lg` | 16 | option rows, small frosted rows |

| Size | Value | Use |
| --- | --- | --- |
| `--size-round` | 56 | every round button |
| `--size-chip` | 56 | chips, search field |
| `--size-touch-target` | 44 | the minimum hit area; `IconButton size="sm"` |
| `--size-control-md` | 48 | back button, `Button size="md"` |
| `--size-control-sm` | 36 | `SmallButton` |
| `Button` default | 56 | the primary pill |

| Shadow | Use |
| --- | --- |
| `--shadow-brand-vg` | under the indigo pill and circle: 0 8 18 indigo @ 30% + a top highlight |
| `--shadow-sheet` | the sheet's top highlight (plus a deep drop shadow in `Sheet`) |
| `--shadow-glass` / `--shadow-panel` | the inset highlights above |

## 8. Icons

All from `components/ui/icons.tsx`, a 1.4px stroke at every size, colour
`currentColor`. On glass, glyphs are indigo (`bg/brand`); on indigo, white.

| Group | Icons |
| --- | --- |
| Direction | `ArrowLeft`, `ArrowRight`, `DoubleChevron`, `ChevronLeft`, `ChevronRight`, `ChevronDown`, `Menu` |
| Actions | `Plus`, `Minus`, `Close`, `Camera`, `Note`, `Search`, `Trash`, `Expand`, `Frame`, `Bell`, `Mic` |
| AI | `Sparkle` (outline, labels), `Generate` (filled, the primary circle) |
| Options | `Aspect`, `Quality`, `Duration`, `Sliders`, `Versions`, `Help`, `Info` |
| LUX | `MySkin`, `Progress`, `Check`, `Products` (nav), `SuccessCheck` |

The video-specific option glyphs (`Aspect` and the rest) exist because the
references drew them; use them only where they mean something in LUX.

## 9. Components

| Component | Props | Use it for |
| --- | --- | --- |
| `Button` | `variant` primary / secondary, `size` lg (56) / md (48), `fullWidth`, `href`, `icon` | the one primary action (indigo pill); secondary is a glass pill |
| `SmallButton` | `label`, `arrow`, `icon`, `href` | small glass pill actions: `Save & exit`, `Update photo` |
| `IconButton` | `label` (required, the accessible name), `variant` glass / primary / outline / soft, `size` lg (56) / sm (44), `href` | every round button. `primary` = the indigo circle; `outline` = back on a bare canvas |
| `Chip` | `label`, `selected`, `icon`, `control` checkbox / radio, `size` default / compact, `disabled`, `onToggle` | answers. Glass when unselected, indigo when selected. Radio only with a real `role="radiogroup"` |
| `OptionRow` | `control` radio / checkbox, `label`, `selected`, `onSelect` | longer answers that need a row |
| `Tag` | `variant` neutral (glass) / brand (indigo) | read-only labels |
| `TextField`, `SearchField`, `DateField` | as before | glass fields |
| `Sheet` | `open`, `onClose`, `title`, `dismiss` label / corner | every overlay tray: the sage frosted sheet, 36/44 corners, floating 8 in on mobile, glass ✕ |
| `DataCard` | `as`, `className` | a panel: frost fill, glass edge, 28 radius, 24 / 32 padding |
| `ChatBubble` | `from` ai / user | the conversation |
| `Orb` | `size`, `animateIn`, `halo`, `thinking` | LUX's presence. 50px with `animateIn halo` in a chat or sheet header |
| `Collapse` | `open` | a panel that opens in flow |

**Utility classes** (`app/vidgen.css`), for one-off layouts that must look
like the components: `.vg-sheet`, `.vg-panel`, `.vg-glass`.

## 10. Patterns

**A screen.** Canvas ground; `--space-gutter` side margins; a glass back
circle (pushed views only) and the page title in `t-h4-h3`; content in
panels; the primary pill last; `--space-section` between unrelated groups.

**A sheet** (the check-in demo on `/styleguide`):

```
Sheet  (sage frost, 36/44 corners, 8 from the screen edges)
├─ title row     Orb 50 + t-h4-h3 title ............ glass ✕ (56)
└─ panel         (8 inset; padding 32 top, 24 sides/bottom)
   ├─ label      Sparkle icon + t-h5
   ├─ body       t-body2
   ├─ chips      Chip × n, gap 4  (role="radiogroup" if single-select)
   └─ actions    IconButton glass × n + IconButton primary, gap 4, 44 above
```

**A readout.** `DataCard` with a `t-overline` label, a `t-metric1` number and
a `t-body3` line saying what it means.

**A hero / empty state.** `t-kicker` → 10 → `t-headline` with the key words
in `<b>`, then the primary pill.

## 11. States and motion

- **Hover** brightens glass to `glass-strong`; the indigo pill runs its
  gradient end for end. Wrap every hover in `@media (hover: hover)` or undo it
  under `(hover: none)`.
- **Pressed** is a 14% dark overlay (`pressable`), never a scale.
- **Focus** is the global `outline` ring; never remove it, never replace it
  with a box-shadow.
- **Disabled** fades the whole control to 0.4.
- **Durations:** `fast` 120 (hover), `base` 200 (selection), `slow` 320
  (sheets, reveals), `slower` 480 (orb), `hover` 400 (the pill's gradient
  reversal).
- Reduced motion and reduced transparency are handled globally; every glass
  and frost surface already has its solid fallback.

## 12. Not designed yet

These exist as lux-v2 components and have not been brought into this system.
When a screen needs one, design it here first, from the rules above, and add
it to `/styleguide`. The full list is in `docs/vidgen-components.md`, section C.

- The bottom nav (keep the bar, or move to pill tabs: undecided).
- The step progress track (the references' pagination dashes are the lead).
- The face diagram, the trend chart, the calendar, compatibility scores.
- Product cards and thumbnails, the add-product tray.
- Chat bubbles, the undo bar, the safety notice, the analysing state.

## 13. Before calling a screen done

- Every value comes from a token, a role or a component. No raw `px` colours,
  sizes or radii on the screen.
- No solid white anywhere.
- One primary action.
- Checked at 375 / 440 and at 1440.
- Every control's target is at least 44; focus ring visible.
- Contrast measured on the real pixels: text on glass over the canvas, white
  on the indigo.
- `npm run typecheck` and `npm run build` clean.

# 027 — Five hovers that still snap

- **Status**: DONE — 15 Sep 2026, on top of `85a5259`. ⚠️ Open follow-up: `SegmentedToggle`'s `.segment:disabled` declares its own transition list without `--shine-ink`. So when step 1's `Save` / `Reset` segments disable, the label ink still snaps while the pill fades. The fix is one entry, but this plan's Boundaries fence it off, so it wants its own go-ahead.
- **Commit**: `a3b3fb3` (`new-adjustments`). ⚠️ The tree was dirty when this was written. `CheckScreen.module.css`, `SegmentedToggle.module.css` and `globals.css` all had uncommitted edits from other work, so every excerpt below is quoted from the **working tree**, not from `a3b3fb3`. Match by text, never by line number.
- **Severity**: MEDIUM. Hover feedback that pops, on controls people point at constantly.
- **Category**: Easing & duration / Interruptibility (discrete properties)
- **Estimated scope**: 5 files, ~45 lines of CSS. No TSX.
- **Depends on**: **026 step 1** (the `--ease-hover` token). Parts A and B use it; part C does not.

## Problem

Almost every hover in LUX has a transition. Five do not, or they change something that cannot interpolate, so they snap in one frame while everything around them fades.

### A. The check-in's `Remove` link has no transition at all

```css
/* features/progress/components/CheckIn.module.css — current (~line 251) */
.remove {
  padding: 0;
  color: var(--color-text-primary);
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.remove:hover {
  opacity: 0.7;
}
```

Every other `.remove` in the app fades its 0.7 over `--duration-fast`, for example `ProductAccordionCard.module.css` `.remove`: `transition: opacity var(--duration-fast) var(--ease-standard);`. This one blinks.

### B. Two "View previous analyses" links snap their underline on

`text-decoration-line` is a discrete property, so `none → underline` can never animate. Both links fade the whole link to 0.7 over 120ms while the underline pops instantly underneath the fade.

```css
/* features/check/components/CheckScreen.module.css — current (~lines 128-168) */
.link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs); /* 4 */
  color: var(--color-text-brand);
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-standard);
}
/* … comment block and .linkArrow … */
.link:hover {
  opacity: 0.7;
}

.link:hover .linkLabel {
  text-decoration: underline;
}

@media (hover: none) {
  .link:hover {
    opacity: 1;
  }

  .link:hover .linkLabel {
    text-decoration: none;
  }
}
```

`.linkLabel` has no rule of its own in the module. It is used at `features/check/components/CheckScreen.tsx:68`: `<span className={styles.linkLabel}>View previous analyses</span>`.

```css
/* features/check/components/CheckResults.module.css — current (~lines 558-590) */
.historyLink {
  align-self: center;
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs); /* 4 */
  margin-top: var(--space-3xl); /* 32 */
  color: var(--color-text-brand);
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-standard);
}
/* … .historyArrow … */
.historyLink:hover {
  opacity: 0.7;
}

.historyLink:hover .historyLabel {
  text-decoration: underline;
}

@media (hover: none) {
  .historyLink:hover {
    opacity: 1;
  }

  .historyLink:hover .historyLabel {
    text-decoration: none;
  }
}
```

`.historyLabel` has no rule of its own either. It is used at `features/check/components/CheckResults.tsx:574`.

### C. The products tray's segmented toggle swaps its label ink instantly

The segment's label is `<span class="label shine-text shine-on-hover">`. `.shine-text` (in `app/globals.css`) paints the glyphs `color: transparent` and draws them with a gradient built from `--shine-ink`. On hover the pill cross-fades over `duration/base` (200ms), but `--shine-ink` is an **unregistered** custom property, and unregistered custom properties never interpolate. So the visible text colour flips in one frame. The file's own comment says so:

```css
/* features/products/components/SegmentedToggle.module.css — current (~lines 75-123) */
.segment {
  position: relative;
  padding: 11px 22px;
  border-radius: var(--radius-full);
  border: none;
  background: transparent;
  color: var(--color-text-secondary);
  cursor: pointer;
  z-index: 0;
  transition:
    color var(--duration-base) var(--ease-standard);
}

/* ⚠️ THE PILL FOLLOWS THE POINTER — …
   …
   The grad endpoints are set on `::before`, where the gradient is painted, for
   the reason recorded on the reversal below. The label ink swaps with the
   pill; `--shine-ink` is unregistered, so it changes at once while the pill
   cross-fades on `duration/base`. */
@media (hover: hover) {
  /* `:not(:disabled)` throughout: a disabled segment never takes the pill */
  .segment:not(.selected):not(:disabled):hover {
    color: var(--color-text-on-brand);
    --shine-ink: var(--color-text-on-brand);
  }
  …
  .toggle:has(.segment:not(.selected):not(:disabled):hover) .segment.selected {
    color: var(--color-text-secondary);
    --shine-ink: var(--color-text-secondary);
  }
  …
}
```

Two hovers are affected: the hovered segment's label goes white instantly, and the selected sibling's label goes dark instantly.

⚠️ **Registering `--shine-ink` is app-wide, not a `SegmentedToggle` change.** Every `.shine-text` in the app reads it. On 15 Sep 2026 there were 17 setters: `Button` (×2), `SmallButton`, `ChatBubble`, `BottomNav`'s `.label`, `SegmentedToggle` (×5), `CheckResults` (×2), `FaceDiagram` (×2) and `StartInvestigation` (×3). All are `var(--color-…)` tokens. Wherever nothing sets it, the registered `initial-value` replaces `.shine-text`'s `var(--color-text-primary)` fallback with that same `#2e2a3f`, so nothing visible moves. Only `SegmentedToggle`'s `.segment` gains a transition on it, so every other label still changes ink exactly when it does today.

The reader, in `app/globals.css` (~line 2978):

```css
.shine-text {
  --shine-ink-resolved: var(--shine-ink, var(--color-text-primary));
  --shine-highlight-resolved: var(--shine-highlight, var(--color-effect-shine));
  color: transparent;
  …
```

The other registered properties, in `app/globals.css` (~lines 31-41):

```css
@property --grad-start {
  syntax: "<color>";
  inherits: false;
  initial-value: #485780;
}

@property --grad-end {
  syntax: "<color>";
  inherits: false;
  initial-value: #313560;
}
```

## Target

### A. Transition the check-in `Remove`

```css
.remove {
  padding: 0;
  color: var(--color-text-primary);
  background: none;
  border: none;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
  transition: opacity var(--duration-fast) var(--ease-hover);
}
```

### B. The underline is always drawn and fades in by colour

`text-decoration-color` IS animatable. Draw the underline at rest in `transparent`, and animate its colour on hover to `text/brand`, the link's own ink. Name the token rather than using `currentColor`, so both ends of the interpolation are plain colours.

```css
/* CheckScreen.module.css — new rule, placed directly above `.link:hover` */
.linkLabel {
  text-decoration: underline;
  text-decoration-color: transparent;
  transition: text-decoration-color var(--duration-fast) var(--ease-hover);
}

.link:hover .linkLabel {
  text-decoration-color: var(--color-text-brand);
}

@media (hover: none) {
  .link:hover {
    opacity: 1;
  }

  .link:hover .linkLabel {
    text-decoration-color: transparent;
  }
}
```

`CheckResults.module.css` gets the same shape with `.historyLabel` and `.historyLink`.

Also change both parents' existing opacity transition to the hover curve, so the fade and the underline share one clock:

```css
transition: opacity var(--duration-fast) var(--ease-hover);
```

### C. Register `--shine-ink` and transition it with the colour it shadows

```css
/* app/globals.css — directly after the `@property --grad-end { … }` block */
/* `--shine-ink` IS REGISTERED so a label's ink can cross-fade. `.shine-text`
   paints its glyphs from this property, not from `color`, and an unregistered
   custom property never interpolates, so `SegmentedToggle`'s hover swapped the
   label from dark to white in one frame while the pill faded over 200ms.
   ⚠️ `inherits: true`: it is SET on the button and READ by the label span inside
   it. `--collapse-gap` is the opposite case.
   ⚠️ THE INITIAL-VALUE IS `text/primary` (`neutral-800`, #2e2a3f) AND MUST MOVE
   WITH IT. A registered property always has a value, so `.shine-text`'s
   `var(--shine-ink, var(--color-text-primary))` fallback can no longer fire,
   and this initial-value takes its place. */
@property --shine-ink {
  syntax: "<color>";
  inherits: true;
  initial-value: #2e2a3f;
}
```

```css
/* SegmentedToggle.module.css `.segment` */
  transition:
    color var(--duration-base) var(--ease-standard),
    --shine-ink var(--duration-base) var(--ease-standard);
```

⚠️ Part C deliberately stays on `--ease-standard` / `duration/base`. That is the clock the pill's `::before` opacity runs on (`opacity var(--duration-base) var(--ease-standard)`), and the ink must cross-fade in step with the pill behind it.

## Repo conventions to follow

- Registered properties live at the top of `app/globals.css` beside `--grad-start`, `--grad-end` and `--specular-angle`. Their `initial-value`s are hand-written hex, because `@property` accepts no `var()` (AGENTS.md, non-negotiable 5).
- Every `:hover` has a `@media (hover: none)` counterpart that restores the rest value. Keep those, and restore the rest value there, as shown above.
- `--ease-hover` is added by plan 026 step 1. Do not declare it here.

## Steps

1. **Check the prerequisite.** Run `grep -n -- "--ease-hover:" app/globals.css`. If there is no match, STOP: plan 026 step 1 has not landed.
2. **A.** In `features/progress/components/CheckIn.module.css`, find the `.remove {` rule that contains `text-decoration: underline;` and `font: inherit;`. Add `transition: opacity var(--duration-fast) var(--ease-hover);` as its last declaration. Leave `.remove:hover` and its `hover: none` block as they are.
3. **B, CheckScreen.** In `features/check/components/CheckScreen.module.css`:
   1. In `.link`, change `transition: opacity var(--duration-fast) var(--ease-standard);` to `transition: opacity var(--duration-fast) var(--ease-hover);`.
   2. Add the new `.linkLabel { … }` rule from Target B directly above `.link:hover {`.
   3. Replace `.link:hover .linkLabel { text-decoration: underline; }` with `.link:hover .linkLabel { text-decoration-color: var(--color-text-brand); }`.
   4. In the `@media (hover: none)` block, replace `text-decoration: none;` under `.link:hover .linkLabel` with `text-decoration-color: transparent;`.
   5. Above the comment block that begins `/* ⚠️ THE UNDERLINE IS ON THE LABEL ONLY.`, add one sentence to it: `The underline is always drawn and fades in by colour, because text-decoration-line is discrete and snapped on (15 Sep 2026).`
4. **B, CheckResults.** In `features/check/components/CheckResults.module.css`, make the identical changes with `.historyLink` for `.link` and `.historyLabel` for `.linkLabel`. Place the new `.historyLabel` rule directly above `.historyLink:hover {`.
5. **C, register.** In `app/globals.css`, insert the commented `@property --shine-ink { … }` block from Target C immediately after the closing `}` of `@property --grad-end`.
6. **C, transition.** In `features/products/components/SegmentedToggle.module.css`, change `.segment`'s transition from

   ```css
     transition:
       color var(--duration-base) var(--ease-standard);
   ```

   to

   ```css
     transition:
       color var(--duration-base) var(--ease-standard),
       --shine-ink var(--duration-base) var(--ease-standard);
   ```

7. **C, comment.** In the same file's `⚠️ THE PILL FOLLOWS THE POINTER` comment, replace the sentence `The label ink swaps with the pill; \`--shine-ink\` is unregistered, so it changes at once while the pill cross-fades on \`duration/base\`.` with `The label ink cross-fades with the pill on \`duration/base\`: \`--shine-ink\` is a registered <color> (globals.css), so it interpolates like \`color\` does.`
8. **C, audit the setters.** Run `grep -rn --include='*.css' -- "--shine-ink:" app components features`. Every value must be a `var(--color-…)` token that exists in `app/tokens.css` or `app/globals.css`. A registered property with an invalid value inherits its parent's ink instead of falling back to `text/primary`. If any value is not such a token, STOP and report it.

## Boundaries

- Do NOT touch `.shine-on-hover`'s `background-position` sweep, `.shine-on-enter`, or any other `--shine-*` property.
- Do NOT remove the `var(--shine-ink, var(--color-text-primary))` fallback in `.shine-text`. It is inert after registration, but deleting it is an unrelated cleanup.
- Do NOT add `--shine-ink` to any transition other than `SegmentedToggle`'s `.segment`. Everywhere else the ink changes with a selection state that has its own timing.
- Do NOT change any duration, any opacity value, or any TSX.
- Do NOT change `text-decoration` on `.link` or `.historyLink` themselves. The underline stays on the label only, so it never strikes through the chevron.
- If any excerpt is not found as quoted, STOP and report. Other sessions edit this tree concurrently.

## Verification

- **Mechanical**: `npm run typecheck` and `npm run build` both clean. `grep -n "text-decoration: underline" features/check/components/CheckScreen.module.css features/check/components/CheckResults.module.css` shows exactly one match per file, inside `.linkLabel` / `.historyLabel`.
- **Computed**: on `/check`, run `getComputedStyle(document.querySelector('[class*="linkLabel"]')).textDecorationColor`. At rest it must be `rgba(0, 0, 0, 0)`. On `/products` with the add tray open, force `:hover` on the unselected segment in DevTools (Elements → `:hov`), then run `el.getAnimations().map(a => a.transitionProperty)` on that button. It must include `"--shine-ink"`.
- **Feel check**:
  - `/progress` → `Check in today`, add a photo, hover `Remove`. It dims over the same beat as the product cards' `Remove`, with no blink.
  - `/check` and `/check/results`: hover `View previous analyses`. The underline fades in with the dim, rather than appearing a frame before it, and fades out on leave.
  - The products add tray (`/products` → add → search with no match, so `Add product` / `Search again` show): sweep the pointer between the two segments. The label turns white as the pill arrives under it, and the other label darkens as its pill leaves. Neither label flips ahead of its pill.
  - DevTools → Animations at 10%: the segment label's ink and the pill's opacity move on one bar, not one instant and one bar.
  - Rendering → emulate `prefers-reduced-motion: reduce`: all of the above land in one frame, via the global collapse, with no stuck intermediate state.
- **Done when**: none of the five hovers has a property that changes without a transition, and the checks above pass.

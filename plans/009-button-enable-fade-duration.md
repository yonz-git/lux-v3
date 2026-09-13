# 009 — Button: enabling fades on `duration/base`, not the hover clock

- **Status**: DONE — 13 Sep 2026. `Continue` enabling on `/investigation/start` runs `opacity` over 200ms (before 400ms).
- **Commit**: `c5edd11`. Search by quoted code.
- **Severity**: LOW
- **Category**: Easing & duration
- **Estimated scope**: 1 file (`components/ui/Button.module.css`), ~12 lines

## Problem

`Button`'s disabled state is a fade (`.button:disabled { opacity: var(--button-disabled-opacity); }`, ~line 169-171). That fade runs on the **hover** clock:

```css
/* components/ui/Button.module.css:53-54 — current */
  /* How long the hover takes. */
  --button-hover-duration: var(--duration-hover);
```

```css
/* components/ui/Button.module.css:91-102 — current */
  /* Everything that changes between states is transitioned, so enabling the
     button fades rather than snaps — "nothing snaps".
     The gradient endpoints go through the registered --grad-* properties from
     globals.css because CSS cannot interpolate background-image; registered
     <color> properties DO interpolate. Verified: flipping the state creates
     three CSSTransitions (--grad-start, --grad-end, color), each 200ms on
     ease/standard, landing on the brand gradient with a white label. */
  transition: opacity var(--button-hover-duration) var(--ease-standard),
    color var(--button-hover-duration) var(--ease-standard),
    border-color var(--button-hover-duration) var(--ease-standard),
    --grad-start var(--button-hover-duration) var(--ease-standard),
    --grad-end var(--button-hover-duration) var(--ease-standard);
```

`--duration-hover` is 400ms (`app/tokens.css:321`). So `Continue` takes 400ms to come up after a flow step's first answer, although the comment still says 200ms.

Enabling is a **state** change. The motion board assigns those `--duration-base` (200ms: "selection, chips, rows, toggles"). The 400ms hover reversal is non-negotiable 5 and stays.

Frequency: `Continue` enables once on every flow step, tens of times a day.

## Target

```css
/* target */
  transition: opacity var(--duration-base) var(--ease-standard),
    color var(--button-hover-duration) var(--ease-standard),
    border-color var(--button-hover-duration) var(--ease-standard),
    --grad-start var(--button-hover-duration) var(--ease-standard),
    --grad-end var(--button-hover-duration) var(--ease-standard);
```

The comment above it is corrected to describe two clocks.

## Repo conventions to follow

- Token durations only, never a literal: `--duration-base` (200ms) and `--duration-hover` (400ms) are in `app/tokens.css`.
- Motion comments state measured facts. Keep the "Verified:" style honest by deleting the stale 200ms claim rather than leaving it.

## Steps

1. Run `grep -rn "button-hover-duration" components features app`. If anything other than `components/ui/Button.module.css` sets or reads `--button-hover-duration`, STOP and report; a caller might rely on it timing the disabled fade.
2. In `components/ui/Button.module.css`, replace the comment and `transition` block quoted in *Problem* (lines 91-102) with:

   ```css
     /* Everything that changes between states is transitioned, so enabling the
        button fades rather than snaps — "nothing snaps".
        ⚠️ TWO CLOCKS — split 13 Sep 2026. The disabled fade is a STATE change and
        runs on `duration/base` (200ms), with every selection and toggle in the
        app; it had been riding the hover clock, so `Continue` took 400ms to come
        up after a step's first answer. The label colour and the registered
        --grad-* endpoints are the HOVER reversal and stay on
        `--button-hover-duration` (`duration/hover`, 400ms — non-negotiable 5).
        The endpoints go through registered properties because CSS cannot
        interpolate background-image; registered <color> properties do. */
     transition: opacity var(--duration-base) var(--ease-standard),
       color var(--button-hover-duration) var(--ease-standard),
       border-color var(--button-hover-duration) var(--ease-standard),
       --grad-start var(--button-hover-duration) var(--ease-standard),
       --grad-end var(--button-hover-duration) var(--ease-standard);
   ```

## Boundaries

- Do NOT change `--button-hover-duration`, the hover rules, the press overlay or `SmallButton`.
- Do NOT touch `app/tokens.css`.
- If the quoted block differs, STOP and report.

## Verification

- **Mechanical**: `npm run build` succeeds. `npx biome lint components/ui/Button.module.css` reports no new diagnostics.
- **Feel check** (`npm run dev`):
  - `/investigation/start`: tick the first location chip. `Continue` reaches full opacity in about 200ms.
  - In the console, right after ticking: `document.querySelector('main button[type="submit"], main a[href*="skin-type"], main button:not([aria-label])')?.getAnimations().map(a => [a.transitionProperty, a.effect.getTiming().duration])`. `opacity` reports 200. Use DevTools → Elements to pick the `Continue` element if that selector misses.
  - Desktop: hover `Continue`. The gradient still reverses end to end over about 400ms.
- **Done when**: the opacity transition on a `Button` reports 200ms, and its `--grad-*` and `color` transitions report 400ms.

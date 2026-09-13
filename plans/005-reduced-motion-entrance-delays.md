# 005 — Reduced motion: stop holding Welcome invisible behind entrance delays

- **Status**: TODO
- **Commit**: `d7220d6` — plus the uncommitted working tree of 13 Sep 2026. Search by quoted code.
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 2 files (`app/globals.css`, `components/ui/Button.module.css`), ~45 lines

## Problem

The app handles reduced motion with one global rule (a documented convention that stays). It collapses **durations** but not **delays**:

```css
/* app/globals.css:2153-2165 — current */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    /* biome-ignore lint/complexity/noImportantStyles: see above — overriding
       every component module is the entire point of this block. */
    animation-duration: 0.01ms !important;
    /* biome-ignore lint/complexity/noImportantStyles: as above */
    animation-iteration-count: 1 !important;
    /* biome-ignore lint/complexity/noImportantStyles: as above */
    transition-duration: 0.01ms !important;
  }
}
```

An entrance with fill mode `backwards` holds its first keyframe (opacity 0) for its whole delay. Under reduced motion that means:

- **Welcome's CTA, disclaimer and nav** stay invisible for 1.7s, 1.85s and 2.0s. They carry `.welcome-rise` with inline `--rise-delay` values (`features/my-skin/components/Welcome.tsx:73-97`):

  ```css
  /* app/globals.css:2084-2086 — current */
  .welcome-rise {
    animation: lux-rise-in 800ms var(--ease-standard) var(--rise-delay, 0ms) backwards;
  }
  ```

  They are still focusable, so a keyboard user can Tab to an invisible `Create skin profile`.
- **The question bubble** stays invisible until 1200ms, then hard-cuts out at 3300ms. **The reply** hard-cuts in at 3300ms:

  ```css
  /* app/globals.css:2088-2097 and 2109-2112 — current */
  .bubble-ask-exit {
    transform-origin: bottom center;
    animation:
      lux-bubble-rise 800ms var(--ease-standard) 1200ms backwards,
      /* ⚠️ `forwards`, NOT `both`. … */
      lux-bubble-push-out var(--duration-slower) var(--ease-standard) 3300ms forwards;
  }
  .bubble-swap-in {
    transform-origin: top center;
    animation: lux-bubble-push-in var(--duration-slower) var(--ease-standard) 3300ms backwards;
  }
  ```

- **The CTA's light band** ends up resting on the button's right edge. The collapse ends `lux-beacon-sweep` after one 0.01ms iteration with no fill, so `.beacon::before` falls back to its static `background-position`. None is declared, so it's `0% 0`. With `background-size: 200% 100%`, that puts the band's 25%-white peak on the right edge:

  ```css
  /* components/ui/Button.module.css:259-273 — current */
  .beacon::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      color-mix(in srgb, var(--color-button-label-default) 25%, transparent) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    background-repeat: no-repeat;
  }
  ```

  `app/globals.css:2662-2663` claims reduced motion leaves "the band parked off-screen".

Welcome is the app's entry point, and the users who asked for less motion wait longest to act.

## Target

Under `prefers-reduced-motion: reduce`:

- **Decorative entrances don't wait.** `animation-delay: 0ms` on `.welcome-rise`, `.bubble-enter`, `.shine-on-enter` and `[data-reveal] > *`, which also covers the stagger delays.
- **Welcome's question → reply swap is content, not decoration.** It keeps its 3300ms beat but becomes a crossfade with no movement:
  - question: `lux-fade-out` 200ms `var(--duration-base)` on `var(--ease-standard)`, delay 3300ms, fill `forwards`;
  - reply: `lux-fade-in` with the same timing, fill `backwards`.
  - Both delays stay equal: the two bubbles share one grid cell and are opaque (`app/globals.css:2103-2108`).
- **The beacon band** rests at the sweep's end frame, `background-position: 200% 0`. With a 200%-wide image that places the whole band left of the button, off-screen.

With reduced motion off, nothing changes.

## Repo conventions to follow

- Keyframes are defined only in `app/globals.css`, next to their family. `lux-fade-in` is at `app/globals.css:1348-1355`.
- `!important` in this file must be preceded by a `/* biome-ignore lint/complexity/noImportantStyles: … */` comment. Exemplar: the global block quoted above.
- A class selector beats the global block's `*` selector among `!important` declarations, which is what lets these rules win.

## Steps

1. **Add `lux-fade-out`.** In `app/globals.css`, directly after the `@keyframes lux-fade-in { … }` block (it ends at ~line 1355), add:

   ```css
   /* the reverse of lux-fade-in — used where reduced motion turns a moving exit
      into a plain crossfade (see the block after the global collapse) */
   @keyframes lux-fade-out {
     from {
       opacity: 1;
     }
     to {
       opacity: 0;
     }
   }
   ```

2. **Add the reduced-motion refinements.** Directly after the closing `}` of the global `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { … } }` block (~line 2165), add:

   ```css
   /* ⚠️ THE COLLAPSE ABOVE SHORTENS DURATIONS, NOT DELAYS — and an entrance that
      fills `backwards` holds its first keyframe, opacity 0, for its whole delay.
      Under reduced motion Welcome's CTA, disclaimer and nav sat invisible — and
      reachable by Tab — for 1.7–2.0s, and the question was a blank until 1.2s.
      Decorative entrances drop their wait here. Welcome's question → reply swap
      is CONTENT rather than decoration, so it keeps its 3300ms beat and becomes
      a short crossfade with no movement; both delays stay equal (see
      `.bubble-swap-in`). Added 13 Sep 2026. */
   @media (prefers-reduced-motion: reduce) {
     .welcome-rise,
     .bubble-enter,
     .shine-on-enter,
     [data-reveal] > * {
       /* biome-ignore lint/complexity/noImportantStyles: must beat the stagger rules and module declarations, as the block above does */
       animation-delay: 0ms !important;
     }

     .bubble-ask-exit {
       /* biome-ignore lint/complexity/noImportantStyles: must beat the global duration collapse */
       animation: lux-fade-out var(--duration-base) var(--ease-standard) 3300ms forwards !important;
     }

     .bubble-swap-in {
       /* biome-ignore lint/complexity/noImportantStyles: must beat the global duration collapse */
       animation: lux-fade-in var(--duration-base) var(--ease-standard) 3300ms backwards !important;
     }
   }
   ```

3. **Park the beacon band.** In `components/ui/Button.module.css`, inside `.beacon::before`, add after `background-repeat: no-repeat;`:

   ```css
     /* rest = the sweep's END frame (`lux-beacon-sweep` in globals.css), so when
        reduced motion ends the loop the band is parked off the button instead of
        sitting on its right edge — a 200%-wide image at 200% lies wholly left of
        the pill */
     background-position: 200% 0;
   ```

## Boundaries

- Do NOT change the global collapse block itself, and do NOT add per-component `prefers-reduced-motion` rules elsewhere (AGENTS.md: reduced motion is handled globally).
- Do NOT change any delay, duration or keyframe used when reduced motion is OFF.
- Do NOT touch `LogoEntrance` (it already handles reduced motion) or `.welcome-rise.button-beacon`.
- If the quoted rules are not found, STOP and report.

## Verification

- **Mechanical**: `npm run build` succeeds. `npx biome lint app/globals.css components/ui/Button.module.css` reports no new diagnostics.
- **Feel check** (`npm run dev`; DevTools → Rendering → emulate `prefers-reduced-motion: reduce`):
  - Hard-load `/`. On the first frame after the entrance overlay clears, the orb, question bubble, CTA, disclaimer and nav are all visible.
  - Press Tab. Focus lands on a **visible** `Create skin profile`.
  - At about 3.3s, the question crossfades to the reply over about 200ms with no vertical movement. Use DevTools → Animations at 10% to confirm the two `lux-fade-out`/`lux-fade-in` tracks start together.
  - The CTA shows no light band at its right edge. Zoom in with the DevTools element screenshot.
  - Open any flow step (e.g. `/investigation/skin-type`). Content is visible at once, with no staggered pop-in.
- **Feel check with emulation OFF** (reload): the entrance is exactly as before. The question rises at 1.2s, the CTA rises from 1.7s, the swap slides at 3.3s, and the beacon band sweeps across every 10s.
- **Done when**: under reduced motion, no element on `/` is invisible for more than one frame, except the reply bubble before its 3.3s beat.

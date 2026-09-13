# 004 — CanvasShader: stop the 60fps limiter from dropping frames

- **Status**: DONE — 13 Sep 2026. Headless Chrome on `/products` draws 60.1 frames/s against 60.1 rAF/s (before: 36.6 against 49.9).
- **Commit**: `c5edd11`. Search by quoted code.
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (`components/layout/CanvasShader.tsx`), ~15 lines

## Problem

The background canvas (`AppCanvas`, mounted once in `app/layout.tsx` behind every route) throttles its draw loop to 60fps like this:

```ts
/* components/layout/CanvasShader.tsx:130-136 — current */
/* ⚠️ 60, NOT THE 30 THIS STARTED AT. At the original drift a half-rate loop was
   free — nothing moved fast enough to show the missing frames. The drift is now
   ~3x that and the motion is the point, so 30fps reads as a faint stutter on a
   field with no edges to hide it. The octave cut above paid for the extra
   frames: this shader is 4 simplex evaluations per pixel where it used to be 7,
   so it costs less per second at 60fps than the old one did at 30. */
const FRAME_MS = 1000 / 60;
```

```ts
/* components/layout/CanvasShader.tsx:572-575 — current */
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (now - last < FRAME_MS) return;
      last = now;
```

Browsers coarsen `requestAnimationFrame` timestamps: 100µs in Chromium without cross-origin isolation, about 1ms in Safari and Firefox. On a 60Hz display, consecutive frames therefore measure 16.6 or 16.7ms (16 or 17 in Safari) rather than exactly 16.667. Every frame that rounds down fails `now - last < FRAME_MS`, is skipped, and the next draw lands 33ms later.

By the arithmetic that is about one frame in three at 60Hz, with irregular pacing on 90, 120 and 144Hz displays. The full-screen drift judders periodically on every route: the "faint stutter" the comment above moved to 60fps to remove.

The 60fps target itself is a documented decision and stays. Only the comparison is wrong.

## Target

- A frame counts if it is within **1ms** of the interval (`FRAME_SLACK_MS = 1`).
- When more than one interval has elapsed (a faster display, or a stall), carry the remainder, so 120Hz draws on every other frame at an even cadence:

```ts
/* target */
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const elapsed = now - last;
      if (elapsed < FRAME_MS - FRAME_SLACK_MS) return;
      last = elapsed > FRAME_MS ? now - (elapsed % FRAME_MS) : now;
```

## Repo conventions to follow

- Tuning constants are module-level `const`s with a `⚠️` comment directly above, explaining the measured reason. Exemplars: `MAX_PIXELS` (line 128) and `FRAME_MS` (line 136).

## Steps

1. Directly after `const FRAME_MS = 1000 / 60;` (line 136), add:

   ```ts
   /* ⚠️ A FRAME THAT IS EARLY BY ROUNDING STILL COUNTS. rAF timestamps are
      coarsened (100µs in Chromium, ~1ms in Safari and Firefox), so on a 60Hz
      display consecutive frames measure 16.6 or 16.7ms — and a strict
      `now - last < FRAME_MS` skipped every frame that rounded down, drawing one
      in three a whole frame late: the stutter the 60 above exists to remove.
      Frames within FRAME_SLACK_MS of the interval draw, and on a faster display
      the remainder is carried so 120Hz lands on every other frame evenly. */
   const FRAME_SLACK_MS = 1;
   ```

2. In the `loop` function, replace

   ```ts
         if (now - last < FRAME_MS) return;
         last = now;
   ```

   with

   ```ts
         const elapsed = now - last;
         if (elapsed < FRAME_MS - FRAME_SLACK_MS) return;
         last = elapsed > FRAME_MS ? now - (elapsed % FRAME_MS) : now;
   ```

   Leave the rest of `loop` (the pointer easing and `draw((now - start) / 1000)`) untouched. The comment "Per-frame factors are fine because the loop is capped at FRAME_MS" remains true.

## Boundaries

- Do NOT change `FRAME_MS`, `MAX_PIXELS`, the shaders, the reduced-motion path (`sync`) or the ResizeObserver.
- Do NOT add visibility or pause logic. Hidden tabs already pause rAF natively.
- If the quoted lines differ, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint components/layout/CanvasShader.tsx` reports no diagnostics.
- **Measure the draw rate**, before and after the change:
  1. Temporarily add `(window as unknown as { __draws?: number }).__draws = ((window as unknown as { __draws?: number }).__draws ?? 0) + 1;` as the first line inside `draw`.
  2. On `/products`, run in the console: `a = window.__draws; setTimeout(() => console.log((window.__draws - a) / 5), 5000)`.
  3. Expect 57–60 on a 60Hz display and on a 120Hz display (before the fix, roughly 40–45 on 60Hz).
  4. Remove the counter afterwards.
- **Feel check**:
  - Watch the background on `/products` for ten seconds. The drift moves continuously, with no periodic hitch.
  - DevTools → Rendering → "Frame rendering stats" shows a steady rate.
  - On Welcome (`/`), the pointer warp still eases smoothly.
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: the canvas shows one static frame.
- **Done when**: the measured draw rate is 57–60 per second on both 60Hz and 120Hz displays.

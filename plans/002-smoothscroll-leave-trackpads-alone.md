# 002 — SmoothScroll: leave trackpad scrolling to the browser

- **Status**: DEFERRED — needs re-planning (13 Sep 2026). Not applied.
- **Commit**: `c5edd11`. Search by quoted code.
- **Severity**: HIGH
- **Category**: Interruptibility (gesture-driven input)
- **Estimated scope**: 1 file (`components/layout/SmoothScroll.tsx`), ~45 lines

## ⚠️ Deferred during execution: the classifier can't tell a Mac mouse from a trackpad

Step 1's STOP condition is met by the browsers' own source, before any hardware logging:

- **Chrome on macOS.** `components/input/web_input_event_builders_mac.mm` builds a trackpad event with `wheel_ticks_y = delta_y / kScrollbarPixelsPerCocoaTick`, and a discrete mouse event with `delta_y = [event deltaY] * kScrollbarPixelsPerCocoaTick` and `wheel_ticks_y = kCGScrollWheelEventDeltaAxis1` (the integer line count). `kScrollbarPixelsPerCocoaTick` is `40.0` (`ui/events/cocoa/cocoa_event_utils.h`). Blink (`wheel_event.cc`) then exposes `wheelDeltaY = wheel_ticks_y × 120 / dpr` and `deltaY = −delta_y / dpr`.
  - A trackpad always gives `|wheelDeltaY| = 3·|deltaY|`, as the plan expects.
  - A mouse notch whose accelerated delta equals its line count gives the same 3× ratio. A slow single notch lands at `deltaY` 40 or less, under `NOTCH_MIN_PX`, and a stream stays "precise" once any of its events is. Most mouse gestures would go native.
- **Safari.** `PlatformEventFactoryMac.mm` sets a mouse event's `wheelTicks` to the raw delta and then multiplies the delta by `pixelsPerLineStep`, and a trackpad event's `wheelTicks` to `delta / pixelsPerLineStep`. `WheelEvent.cpp` uses `wheelDelta = wheelTicks × TickMultiplier` for both, so the ratio of `wheelDelta` to `delta` is identical for the two devices. The 3× test can never separate them in Safari.

Net effect, as written: on the Mac, in both Chrome and Safari, `SmoothScroll` would stop gliding a mouse wheel as well as a trackpad. That removes the glide asked for on 13 Sep 2026, including inside the `/check/new` basket tray. Plan 003 was applied without this plan; its dependency was ordering only.

**To re-plan:**
1. Run step 1's logging on the actual Mac: mouse and trackpad, in Chrome and Safari.
2. Then either build a classifier on what was logged, or decide that trackpads keep the glide.

Neither decision belongs to an executor.

## Problem

`SmoothScroll` intercepts every vertical wheel event and eases the scroller toward a target with a 120ms time constant (`const TAU = 120;`, line 66):

```ts
/* components/layout/SmoothScroll.tsx:170-198 — current */
    const onWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey) return;
      if (Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
      if (motion.matches) return;

      const el = scrollerFor(e.target, e.deltaY);
      if (!el) return;

      const delta =
        e.deltaMode === 1
          ? e.deltaY * LINE_PX
          : e.deltaMode === 2
            ? e.deltaY * el.clientHeight
            : e.deltaY;

      e.preventDefault();
      …
      glide.target = Math.min(Math.max(glide.target + delta, 0), maxScroll(el));
      if (!raf) raf = requestAnimationFrame(tick);
    };
```

Nothing distinguishes a notched mouse wheel from a trackpad. A two-finger trackpad scroll also arrives as wheel events, but it is direct manipulation with the OS's own momentum behind it. Eased a second time, the content trails the fingers by ~120ms, keeps drifting after the OS momentum ends, and doesn't stop when fingers touch down.

The file already refuses this for touch, for exactly this reason:

```ts
/* components/layout/SmoothScroll.tsx:43-45 — current */
 * ⚠️ IT ONLY EVER TAKES THE WHEEL, AND THAT IS THE WHOLE SAFETY STORY:
 *   - TOUCH is untouched. A phone's own momentum already is the smooth scroll,
 *     and lerping a finger drag makes the page lag behind the finger.
```

Frequency: every scroll on a laptop trackpad, the 100+/day tier, where the rule is no added animation.

## Target

- Glide **only** input that is confidently a notched wheel. Hand every other wheel stream back to the browser untouched (no `preventDefault()`).
- Classify per **stream** (events less than 150ms apart), so a gesture never mixes glided and native events. Once a stream looks like a trackpad, the rest of it is native.
- Skip events that are not `cancelable`.
- When unsure, go native. Native scrolling on a mouse wheel loses a nicety; a glide on a trackpad adds lag.

## Repo conventions to follow

- Constants live at the top of the file with a one-to-three-line comment each (`TAU`, `SETTLE_PX`, `DRIFT_PX`, `LINE_PX`, lines 64-73).
- The doc comment lists every case the component stands down for. The new rule belongs in the "IT ONLY EVER TAKES THE WHEEL" list, in the same voice.

## Steps

1. **Measure first — no code change yet.** On the Mac you are testing with, open DevTools on any route and run:

   ```js
   addEventListener("wheel", (e) => console.log(e.deltaMode, e.deltaY, e.wheelDeltaY, Math.round(e.timeStamp)), { passive: true });
   ```

   Record the logged values for:
   - a trackpad: slow scroll and hard flick;
   - a mouse wheel: single notch and fast spin.

   Do this in Chrome and in Safari, plus Firefox if installed. The classifier in step 3 expects:
   - trackpad events to have `deltaMode` 0 and either `|deltaY| < 50`, a non-integer `deltaY`, or `|wheelDeltaY| === 3·|deltaY|`;
   - mouse notches to have `deltaMode` 1 (Firefox), or an integer `|deltaY| ≥ 50` whose `|wheelDeltaY|` is not `3·|deltaY|`.

   **If a mouse notch or a trackpad flick breaks those expectations, STOP and report the logged values.** Don't retune the thresholds ad hoc.

2. **Add the constants** after `const LINE_PX = 16;` (line 73):

   ```ts
   /* the smallest per-event pixel delta a notched wheel produces; a trackpad
      streams many smaller ones */
   const NOTCH_MIN_PX = 50;
   /* wheel events closer together than this belong to one gesture, and a
      gesture is classified once — see `isNotchedWheel` */
   const STREAM_GAP_MS = 150;
   ```

3. **Add the classifier** directly above `export function SmoothScroll() {`:

   ```ts
   /* ⚠️ A NOTCHED WHEEL, NOT A TRACKPAD — see "TRACKPADS are untouched" above.
      There is no standard way to know the device, so this reads the shape of
      the event and answers "no" whenever it is unsure. */
   function isNotchedWheel(e: WheelEvent) {
     /* Firefox reports a mouse wheel in lines or pages; a trackpad in pixels */
     if (e.deltaMode !== 0) return true;
     const dy = Math.abs(e.deltaY);
     /* trackpads stream small and fractional pixel deltas */
     if (dy < NOTCH_MIN_PX || !Number.isInteger(e.deltaY)) return false;
     /* Chromium and WebKit keep the legacy wheelDeltaY, and for a trackpad it is
        exactly three times the pixel delta */
     const legacy = (e as WheelEvent & { wheelDeltaY?: number }).wheelDeltaY;
     if (typeof legacy === "number" && legacy !== 0 && Math.abs(legacy) === dy * 3) {
       return false;
     }
     return true;
   }
   ```

4. **Track the stream.** Inside the `useEffect`, after `let last = 0;` (the one declared next to `raf`), add:

   ```ts
       /* the current wheel gesture's kind — reset when a gap opens */
       let stream: "notched" | "precise" | null = null;
       let lastWheelAt = 0;
   ```

5. **Gate `onWheel`.** Replace its first line

   ```ts
         if (e.defaultPrevented || e.ctrlKey || e.metaKey) return;
   ```

   with

   ```ts
         if (!e.cancelable || e.defaultPrevented || e.ctrlKey || e.metaKey) return;
   ```

   Then, directly after the existing `if (motion.matches) return;` line, add:

   ```ts
         /* one gesture, one kind: a stream that has shown a trackpad-shaped event
            stays native to its end, so glided and native events never mix */
         if (e.timeStamp - lastWheelAt > STREAM_GAP_MS) stream = null;
         lastWheelAt = e.timeStamp;
         if (stream !== "precise") {
           stream = isNotchedWheel(e) ? "notched" : "precise";
         }
         if (stream === "precise") return;
   ```

6. **Update the doc comment.** In the list under `⚠️ IT ONLY EVER TAKES THE WHEEL, AND THAT IS THE WHOLE SAFETY STORY:`, insert after the `TOUCH is untouched…` bullet (which ends `lag behind the finger.`):

   ```ts
    *   - TRACKPADS are untouched, for the same reason as touch — added 13 Sep
    *     2026. A two-finger scroll arrives as wheel events, but it is a finger
    *     drag with the OS's own momentum behind it; easing it made the page
    *     trail the fingers by TAU and keep drifting after the momentum ended.
    *     Nothing standard says which device sent a wheel event, so
    *     `isNotchedWheel` reads the event's shape, a whole gesture is judged
    *     once, and anything it is unsure of goes to the browser: native
    *     scrolling on a mouse wheel is a lost nicety, a glide on a trackpad is
    *     lag.
   ```

## Boundaries

- Do NOT change `TAU`, `scrollerFor`, `tick`, the drift check or the reduced-motion/locked-page behaviour.
- Do NOT add touch or pointer listeners, and do NOT add dependencies.
- Do NOT implement the direction-reversal fix here. That is plan 003, applied after this one.
- If the measured values in step 1 contradict the classifier, STOP and report them.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint components/layout/SmoothScroll.tsx` reports no diagnostics.
- **Feel check** (`npm run dev`, macOS):
  - **Trackpad**, on `/investigation/start`, inside the `/check/new` basket tray (add 4 products, open it) and in the daily check-in overlay on `/progress`:
    - content tracks the fingers 1:1;
    - a flick coasts on the OS curve and stops the moment fingers touch the pad;
    - Safari still rubber-bands at the page ends.
  - **Comparison**: temporarily comment out `<SmoothScroll />` in `app/layout.tsx`. Trackpad scrolling should feel identical with and without it. Restore the line.
  - **Notched mouse wheel**, same places: one notch still glides, mostly there in ~200ms and settled by ~600ms.
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: every input scrolls natively, as before.
- **Done when**: trackpad scrolling can't be told apart from the page without `SmoothScroll`, and a notched mouse wheel still glides.

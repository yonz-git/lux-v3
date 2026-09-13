# 003 — SmoothScroll: turn round at once when the wheel reverses

- **Status**: TODO
- **Commit**: `d7220d6` — plus the uncommitted working tree of 13 Sep 2026. Search by quoted code.
- **Severity**: MEDIUM
- **Category**: Interruptibility
- **Estimated scope**: 1 file (`components/layout/SmoothScroll.tsx`), ~10 lines
- **Depends on**: plan 002 (same function). Apply after it.

## Problem

Each wheel notch adds its delta to where the glide is **headed**, not to where the page **is**:

```ts
/* components/layout/SmoothScroll.tsx:187-197 — current */
      let glide = glides.get(el);
      if (!glide || Math.abs(el.scrollTop - glide.written) > DRIFT_PX) {
        /* starting fresh — whatever moved it since its last glide is where
           this one starts from */
        const at = el.scrollTop;
        glide = { target: at, current: at, written: at };
        glides.set(el, glide);
      }

      glide.target = Math.min(Math.max(glide.target + delta, 0), maxScroll(el));
      if (!raf) raf = requestAnimationFrame(tick);
```

The glide closes `1 - e^(-dt/120)` of the remaining gap per frame. During a fast spin (one 100px notch every 50ms) the target runs about 300px ahead of the eased position. A single reverse notch subtracts 100px from that target, which is still ahead of the page, so the page keeps moving the old way for a few hundred milliseconds before turning.

Same-direction notches accumulating is correct. Only a reversal is wrong. Frequency: every wheel reversal, tens of times a day.

## Target

When a notch's direction is opposite to the glide's current heading (`sign(target − current)`), restart the target from the current eased position before adding the delta. The page then turns round on the next frame. Same-direction notches keep accumulating exactly as today.

## Repo conventions to follow

- Comments explain the *why* in the file's `⚠️` voice, directly above the code they justify. Exemplar: the "starting fresh" comment in the excerpt above.

## Steps

1. In `onWheel`, directly above the line

   ```ts
         glide.target = Math.min(Math.max(glide.target + delta, 0), maxScroll(el));
   ```

   insert:

   ```ts
         /* ⚠️ A REVERSE NOTCH TURNS THE GLIDE ROUND AT ONCE. Notches add to where
            the glide is headed, so during a fast scroll the target runs a few
            hundred px ahead of the page — and one reverse notch added to THAT
            still left it ahead, so the page kept going the old way. A reversal
            restarts from where the page actually is; same-direction notches
            still pile up. */
         const heading = glide.target - glide.current;
         if (heading !== 0 && Math.sign(heading) !== Math.sign(delta)) {
           glide.target = glide.current;
         }
   ```

   Leave the `glide.target = Math.min(...)` line itself unchanged after it.

## Boundaries

- Do NOT change `TAU`, the drift check, `canMove`, `scrollerFor` or the trackpad classifier from plan 002.
- Do NOT add momentum or velocity modelling. This is a single retarget.
- If the quoted lines are not found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint components/layout/SmoothScroll.tsx` reports no diagnostics.
- **Feel check** (`npm run dev`, notched mouse wheel, a long page such as `/investigation/start` at a short window height):
  - Spin down fast for about a second, then give one notch up. The page stops and moves up within a frame; it does not coast down first.
  - Alternate single notches up and down slowly. Each one moves the page the right way immediately.
  - Spin continuously in one direction. The glide is as smooth as before, with no stutter (same-direction notches never reset).
  - Repeat inside the `/check/new` basket tray (a nested scroller).
- **Done when**: a reverse notch changes the scroll direction on the next frame, and same-direction scrolling feels unchanged.

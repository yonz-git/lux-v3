# 031 — Save / Reset fade both ways, ink included

- **Status**: TODO
- **Commit**: `3933d37` (`new-adjustments`). `SegmentedToggle.module.css` had no uncommitted changes when this was written.
- **Severity**: LOW-MEDIUM (a snap, on a control step 1 changes with every tap on the face)
- **Category**: Interruptibility / Easing & duration
- **Estimated scope**: 1 file, 2 transition lists.
- **Closes**: the open follow-up recorded on plan **027**.

## Problem

Step 1 (`/investigation/start`) shows a `Save` / `Reset` pill under the symptom chips, built from `SegmentedToggle` in actions mode (`features/products/components/SegmentedToggle.tsx`). Both segments disable until a place is marked: `StartInvestigation.tsx` passes `disabled={[!placeMarked, !placeMarked, nothingSelected]}`. They toggle between enabled and disabled as the user taps the face and resets.

Each segment's label is `<span className={`${s.label} shine-text shine-on-hover`}>`. `.shine-text` (globals.css) paints the glyphs **transparent** and draws the ink from the registered custom property `--shine-ink`. So the visible colour of the words is `--shine-ink`, not `color`.

```css
/* features/products/components/SegmentedToggle.module.css — current */
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
    color var(--duration-base) var(--ease-standard),
    --shine-ink var(--duration-base) var(--ease-standard);
}
```

```css
/* features/products/components/SegmentedToggle.module.css — current */
.segment:disabled {
  opacity: var(--opacity-disabled);
  cursor: not-allowed;
  transition:
    color var(--duration-base) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
}

.segment.selected:disabled {
  color: var(--color-text-secondary);
  --shine-ink: var(--color-text-secondary);
}
```

A transition runs with the list of the state being ENTERED. So:

1. **Disabling** uses the `:disabled` list, which has no `--shine-ink`. A selected `Save` changing ink from `text/on-brand` (white) to `text/secondary` jumps in one frame while its indigo pill and edge light fade over 200ms. The visible `color` fade in that list does nothing, because the glyphs are transparent.
2. **Enabling** uses `.segment`'s list, which has no `opacity`. So the segment fades 1 → 0.4 when it disables, but jumps 0.4 → 1 in one frame when it comes back, which is every time the user marks the first place for a symptom.

## Target

Both lists carry `color`, `--shine-ink` AND `opacity`, all on `var(--duration-base)` (200ms) and `var(--ease-standard)`. Disabling and enabling are then the same fade in both directions, and the label ink moves with the pill.

`--ease-standard` is correct here, not `--ease-hover`: disabling is a state change, not a hover (see plan 026's scope and AGENTS.md "Motion").

## Repo conventions to follow

- `--shine-ink` is registered with `@property` in `app/globals.css` (`syntax: "<color>"; inherits: true;`), so it interpolates when listed in a transition. `.segment`'s own list already transitions it, and this plan copies that entry.
- Disabled controls fade to `opacity/disabled` on `duration/base` (plan 009, DONE; `Button`).

## Steps

1. In `.segment`, replace
   ```css
  transition:
    color var(--duration-base) var(--ease-standard),
    --shine-ink var(--duration-base) var(--ease-standard);
   ```
   with
   ```css
  /* `opacity` too, so a segment coming back from `:disabled` fades up the
     way it faded down — the list of the state being ENTERED runs, and this
     one had none (16 Sep 2026) */
  transition:
    color var(--duration-base) var(--ease-standard),
    --shine-ink var(--duration-base) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
   ```

2. In `.segment:disabled`, replace
   ```css
  transition:
    color var(--duration-base) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
   ```
   with
   ```css
  /* ⚠️ `--shine-ink`, NOT JUST `color` — the label is `.shine-text`, whose
     glyphs are transparent and painted from `--shine-ink`, so a `color` fade
     alone is invisible and the ink snapped while the pill faded (the open
     follow-up on plan 027; closed 16 Sep 2026) */
  transition:
    color var(--duration-base) var(--ease-standard),
    --shine-ink var(--duration-base) var(--ease-standard),
    opacity var(--duration-base) var(--ease-standard);
   ```

## Boundaries

- Do NOT touch the hover rules ("THE PILL FOLLOWS THE POINTER"), `.segment::before`, `.edge`, or any `--ease-standard` → `--ease-hover` swap. Those are excluded as selection by plan 026.
- Do NOT touch `StartInvestigation.module.css` (the `.reset` variant) or `StartInvestigation.tsx`.
- Do NOT change `SegmentedToggle.tsx`.
- If an excerpt does not match, STOP and report.

## Verification

- **Mechanical**: `npm run build` clean.
- **Feel check** on `/investigation/start` at 440:
  - Tick `Redness`. `Save` / `Reset` appear disabled (0.4).
  - Tap a face region: both segments fade UP to full over about 200ms. Before this plan they jumped.
  - Tap `Reset`: the segments fade DOWN, and `Save`'s white label greys out WITH its indigo pill rather than a frame ahead of it.
  - In DevTools, before tapping `Reset`, run `$0.getAnimations()` on the `Save` button right after the tap. Expect CSSTransitions for `opacity` and `--shine-ink` (and `color`), each 200ms.
  - At 10% playback: the label ink and the pill's fade finish together.
  - Toggle `prefers-reduced-motion`: both directions resolve immediately (global collapse).
- **Done when**: both `.segment` and `.segment:disabled` list exactly `color`, `--shine-ink` and `opacity`, and neither direction snaps.

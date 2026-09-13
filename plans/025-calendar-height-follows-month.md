# 025 — The calendar's height follows the month

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: LOW
- **Category**: Missed opportunities (preventing a jarring change)
- **Estimated scope**: 1 file, ~15 lines: `features/progress/components/CheckInCalendar.tsx`
- **Depends on**: plan 015, which creates `lib/useHeightTransition.ts`. Apply after it.

## Problem

```tsx
/* features/progress/components/CheckInCalendar.tsx:160-167 — current */
  const cells = monthGridSunday(view);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) =>
    cells.slice(i * 7, i * 7 + 7)
  );
  const monthLabel = formatMonth(view);

  return (
    <DataCard className={className} aria-labelledby="calendar-title">
```

`monthGridSunday` lays a month out in 4–6 week rows (`lib/date.ts:115-127`), and each row is 36px (`CheckInCalendar.module.css:97-104`). Paging between a 5-week and a 6-week month makes the card 36px taller or shorter in one frame. On `/progress` everything under the card in its column (desktop) or on the page (mobile) jumps with it.

For example, September 2026 (starts on a Tuesday) has 5 rows and August 2026 (starts on a Saturday) has 6.

Frequency: occasional (month paging).

## Target

The card's height animates when the visible month changes. It uses plan 015's hook: 200ms, `cubic-bezier(0.2, 0, 0, 1)`, clipped while it runs because the card's own overflow is visible, and skipped under reduced motion.

- **The key is the month.** The key is `toIso(view)`.
- **Load behaviour.** The hook is enabled only once the store has hydrated. `view` is derived from the check-ins (`:121-126`), and the restored ones move the default month one commit after mount, which must not animate.

The grid, numerals and legend stay static. A month is data the user is reading.

## Repo conventions to follow

- **The hook:** `lib/useHeightTransition.ts`, created by plan 015. Its caller there is `components/ui/Sheet.tsx`.
- **`DataCard` forwards `ref`.** It spreads its remaining props onto its element (`components/ui/DataCard.tsx:40-57`), and React 19 passes `ref` as a prop.
- **Hydration gating:** this file's own `drawn` effect (`:155-159`).

## Steps

1. Imports. After `import { useInvestigation } from "@/lib/store/InvestigationProvider";` add

   ```tsx
   import { useHeightTransition } from "@/lib/useHeightTransition";
   ```

   `useRef` is already imported from `react`, and `toIso` is already used in this file.

2. Directly after the effect

   ```tsx
     useEffect(() => {
       if (hydrated) drawn.current = checkedIn;
     });
   ```

   add

   ```tsx

     /* ⚠️ THE CARD'S HEIGHT FOLLOWS THE MONTH — added 13 Sep 2026. A month is
        four to six week rows, so paging changed the card's height by 36 in one
        frame and everything under it jumped. It eases instead; the grid itself
        swaps at once, being the thing read. Not before hydration: the restored
        check-ins move the default month one commit after mount (see the month
        note above), and arriving must not animate. */
     const cardRef = useRef<HTMLElement>(null);
     useHeightTransition(cardRef, toIso(view), { enabled: hydrated });
   ```

3. Replace

   ```tsx
       <DataCard className={className} aria-labelledby="calendar-title">
   ```

   with

   ```tsx
       <DataCard ref={cardRef} className={className} aria-labelledby="calendar-title">
   ```

## Boundaries

- Do NOT animate the grid, the numerals, the month label or the arrows.
- Do NOT change `defaultMonth`, the paging clamp, `[data-just-checked]` or the grid layout.
- Do NOT edit `lib/useHeightTransition.ts`. If it doesn't behave as plan 015 describes, STOP and report.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP, 440×900 and 1440×900, `/progress`). Page with the arrows to a pair of months with different row counts (e.g. September → August 2026):
  - **Height.** The card's `offsetHeight` changes by 36 across at least 5 intermediate frames over about 200ms.
  - **The animation.** `card.getAnimations()` includes one whose keyframes carry `height` and `overflow: "clip"`.
  - **Clipping.** On every frame, the legend's bottom edge is at or above the card's bottom edge.
  - **Equal rows.** Paging between two months with the same row count creates no animation.
  - **Load.** A reload creates no height animation on the card.
  - **Reduced motion.** With `prefers-reduced-motion: reduce` emulated, paging creates no animation.
- **Feel check**:
  - DevTools → Animations at 10%. The card's bottom edge and whatever is under it glide the 36px.
  - Rapid paging turns round without snapping, and no focus ring stays clipped after the animation ends.
- **Done when**: paging between months of different lengths never moves the content below the calendar in one frame.

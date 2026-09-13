# 012 — Show today's check-in landing on the calendar

- **Status**: DONE — 13 Sep 2026. Fresh profile, `/progress` → `Check in today` → `Submit`:
  - today's disc renders with `data-just-checked` and runs `background-color`, `color` and `scale` transitions of 320ms after a 200ms delay;
  - scale holds at 0.8 to ~260ms and reaches 1 by ~610ms;
  - no other disc transitions.

  Reloaded with today stored, no element carried `data-just-checked` at any point.
- **Commit**: `c5edd11`. Search by quoted code.
- **Severity**: MEDIUM (missed opportunity: additive)
- **Category**: Missed opportunities
- **Estimated scope**: 3 files (`features/progress/components/CheckInCalendar.tsx`, `features/progress/components/CheckInCalendar.module.css`, `lib/store/InvestigationProvider.tsx`), ~45 lines
- **Amended 13 Sep 2026, before execution**: the store hydrates one commit after mount, so the calendar's "already drawn" snapshot waits for hydration (step 1, and the second paragraph of the step-3 comment). See *The records arrive one commit late* below.

## ⚠️ Post-review change, 13 Sep 2026

The global reduced-motion collapse shortens `transition-duration` but keeps `transition-delay`, the same gap plan 005 fixed for animations. Under reduced motion the overlay is gone at once, but today's disc sat transparent at `scale: 0.8` for the 200ms delay and then snapped. Plan 005's refinement block in `app/globals.css` now also sets `transition-delay: 0ms !important` on `[data-checked-in][data-just-checked]`. It uses attributes because the module's class can't be reached from globals, and it keeps reduced motion in the one global place AGENTS.md requires. Re-verified with reduced motion emulated in headless Chrome. The disc's transitions report `0.01ms +0`. Only the frame it mounts in reads the starting style; the next sampled frame (62ms) is already indigo at `scale: none`. No other disc transitions, and a reload lands nothing.

## Problem

Submitting the daily check-in saves the day and closes the overlay **in the same handler**:

```tsx
/* features/progress/components/CheckIn.tsx:222-238 — current */
  const submit = () => {
    if (!choice || !canSubmit) return;

    setAnswer("checkIns", (prev) =>
      recordCheckIn(prev ?? [], {
        date: today,
        …
      })
    );
    onSubmitted();
  };
```

`CheckInOverlay` passes `onSubmitted={onClose}` (`features/progress/components/CheckInOverlay.tsx:92`). The overlay begins its 200ms exit while `/progress` re-renders underneath. The screen promises the opposite:

```tsx
/* features/progress/components/ProgressScreen.tsx:72-76 — current */
  /* ⚠️ THE CHECK-IN OPENS HERE, IT DOES NOT NAVIGATE — 6 Sep 2026. `Check in
     today` used to push `/progress/check-in`; the same conversation now opens
     as a modal panel over this dashboard, and submitting it closes back onto
     the numbers it just changed. …
```

On the calendar, a day renders as a `<span>` until it is checked in, then as a `<Link data-checked-in>`:

```tsx
/* features/progress/components/CheckInCalendar.tsx:210-211 and 228-247 — current */
                const isCheckedIn = checkedIn.has(toIso(date));
                const isToday = sameDay(date, today);
…
                  <td key={d} className={styles.cell}>
                    {isCheckedIn ? (
                      <Link
                        href={`/progress/check-in/${toIso(date)}`}
                        className={`${styles.day} t-label-sm pressable`}
                        data-checked-in
                        data-today={isToday || undefined}
                      >
                        {label}
                      </Link>
                    ) : (
                      <span
                        className={`${styles.day} t-label-sm`}
                        data-today={isToday || undefined}
                      >
                        {label}
                      </span>
                    )}
                  </td>
```

The fill has no transition:

```css
/* features/progress/components/CheckInCalendar.module.css:134-137 — current */
.day[data-checked-in] {
  background: var(--color-bg-brand);
  color: var(--color-text-on-brand);
}
```

```css
/* features/progress/components/CheckInCalendar.module.css:181-187 — current */
.day[data-checked-in] {
  cursor: pointer;
  /* the UA underlines an <a>, and a rule under a numeral inside a 32 disc
     reads as a strikethrough on the one mark the card exists to show */
  text-decoration: none;
  transition: opacity var(--duration-fast) var(--ease-standard);
}
```

So today's disc is already filled by the time the overlay has faded. The one change the daily check-in exists to make is never seen happening. Frequency: once a day. It's a completion moment, so a deliberate beat is justified, kept calm with no overshoot: "LUX does not bounce".

### ⚠️ The records arrive one commit late

The store reads storage in an effect, after the first render, and `hydrated` is not on the context:

```tsx
/* lib/store/InvestigationProvider.tsx:92-115 — current (abridged) */
  useEffect(() => {
    …
    const saved = { ...readPersisted(), ...readFlow(Date.now()) };
    if (Object.keys(saved).length) {
      setAnswers((prev) => ({ ...saved, ...prev }));
    }
    setHydrated(true);
  }, []);
```

`CheckInCalendar`'s own month note says the same: "the FIRST render of this component always sees the pre-hydration list". Effects run child-first, so a snapshot of "what this calendar has drawn" taken in its first effect holds the pre-hydration list, and every restored day then looks newly checked in. After a real submit, today's disc would land again on every reload of `/progress` that day; in a real (non-demo) record, every restored disc in the month would.

## Target

- A day that **became** checked in while the calendar was on screen carries `data-just-checked` on its first render as a `Link`.
- The span → Link swap inserts a new element, so `@starting-style` can give it a start state: transparent fill, `text/on-data` numeral, `scale: 0.8`.
- It settles to the normal checked-in disc over **320ms** (`--duration-slow`) on `--ease-standard`, after a **200ms** delay (`--duration-base`, the overlay's exit). The disc lands just as the overlay finishes leaving.
- The transition declarations live permanently on `.day[data-checked-in]`. Only the start state is keyed to `data-just-checked`, so the attribute disappearing on a later render can't cancel a running transition, and discs that mount on page load or month paging (no start state) never animate.
- `scale` is the independent property, so it doesn't collide with `.pressable`'s `::before` overlay.
- The calendar only starts remembering what it has drawn once the store has **hydrated**. `setAnswers` and `setHydrated(true)` run in the same effect and batch into one render, so the first render carrying restored records still remembers nothing and lands nothing.

## Repo conventions to follow

- CSS Modules may use transitions and `@starting-style` but never name a keyframe animation (AGENTS.md, Motion). Exemplar: `features/my-skin/components/StepProgress.module.css` (`@starting-style { .fill { width: var(--progress-from); } }`).
- A `⚠️ NOT IN FIGMA` comment names every decided-here visual change and why.
- Store API comments in `InvestigationProvider.tsx` open with a `⚠️` sentence stating the rule. Exemplar: the `setAnswer` doc comment in `type Ctx`.

## Steps

1. **`lib/store/InvestigationProvider.tsx`: expose `hydrated`.** In `type Ctx`, directly after the line `  reset: () => void;`, add:

   ```ts
     /**
      * ⚠️ WHETHER STORED RECORDS HAVE BEEN READ YET — exposed 13 Sep 2026. The
      * first render is always the empty store and the records arrive one commit
      * later (the hydration effect below), so anything that animates what
      * CHANGED — `CheckInCalendar`'s landing disc — must not count their arrival
      * as a change.
      */
     hydrated: boolean;
   ```

   Then replace

   ```tsx
     const value = useMemo(
       () => ({ answers, setAnswer, reset }),
       [answers, setAnswer, reset]
     );
   ```

   with

   ```tsx
     const value = useMemo(
       () => ({ answers, hydrated, setAnswer, reset }),
       [answers, hydrated, setAnswer, reset]
     );
   ```

2. **`CheckInCalendar.tsx`: imports.** Change `import { useState } from "react";` (line 11) to `import { useEffect, useRef, useState } from "react";`. Add `import { useInvestigation } from "@/lib/store/InvestigationProvider";` on the line directly after `} from "@/lib/date";` (the line that closes the multi-line date import).
3. **Same file: remember what's been drawn.** Directly after `const checkedIn = new Set(checkIns.map((c) => c.date));` (line 142), add:

   ```tsx
     /* ⚠️ THE CHECK-INS THIS CALENDAR HAS ALREADY DRAWN — NOT IN FIGMA, added
        13 Sep 2026. A day missing from it has just been checked in while the
        calendar was on screen (the check-in overlay closing back onto
        /progress), and it lands with motion — see `[data-just-checked]` in the
        stylesheet. `null` until a render has committed, so nothing animates on
        arrival or when paging months.
        ⚠️ AND NOTHING IS REMEMBERED BEFORE THE STORE HAS HYDRATED. Stored
        check-ins arrive one commit after mount (see the month note above), and
        this effect runs before the provider's, so a snapshot of the empty first
        render made every restored day — a check-in made earlier today included
        — land again on every reload. */
     const { hydrated } = useInvestigation();
     const drawn = useRef<ReadonlySet<string> | null>(null);
     useEffect(() => {
       if (hydrated) drawn.current = checkedIn;
     });
   ```

4. **Same file: flag the new day.** Replace

   ```tsx
                   const isCheckedIn = checkedIn.has(toIso(date));
   ```

   with

   ```tsx
                   const iso = toIso(date);
                   const isCheckedIn = checkedIn.has(iso);
                   const justChecked =
                     isCheckedIn && drawn.current !== null && !drawn.current.has(iso);
   ```

   In the `Link` element, add `data-just-checked={justChecked || undefined}` directly after the `data-checked-in` attribute line. Optionally replace `toIso(date)` in the `href` with `iso`.
5. **`CheckInCalendar.module.css`: carry the transitions.** In the second `.day[data-checked-in]` rule (the one with `cursor: pointer`, ~line 181-187), replace

   ```css
     transition: opacity var(--duration-fast) var(--ease-standard);
   ```

   with

   ```css
     /* the hover fade, plus the landing below: background, numeral and scale
        wait out the check-in overlay's 200ms exit and then settle over 320ms.
        Declared here rather than under `[data-just-checked]` so the attribute
        going away on a later render cannot cancel a landing mid-flight; only a
        disc with a starting style (below) ever has anything to transition. */
     transition:
       opacity var(--duration-fast) var(--ease-standard),
       background-color var(--duration-slow) var(--ease-standard) var(--duration-base),
       color var(--duration-slow) var(--ease-standard) var(--duration-base),
       scale var(--duration-slow) var(--ease-standard) var(--duration-base);
   ```

6. **Same file: the start state.** Directly after that rule's closing `}` (and before `.day[data-checked-in]:hover`), add:

   ```css
   /* ⚠️ TODAY'S DISC LANDS — NOT IN FIGMA, added 13 Sep 2026. Submitting the
      check-in saved the day and closed the overlay in one handler, so the disc
      was already filled by the time the overlay had faded: the one change a
      check-in makes was never seen happening. A day checked in while the
      calendar is on screen swaps from a <span> to a new <Link>, so it can start
      empty and slightly small and settle into the disc. Three attribute
      selectors so the start colour outranks `.day[data-today][data-checked-in]`
      (a new check-in is almost always today). No overshoot. */
   @starting-style {
     .day[data-checked-in][data-just-checked] {
       background-color: transparent;
       color: var(--color-text-on-data);
       scale: 0.8;
     }
   }
   ```

   ⚠️ `.day[data-checked-in]:hover {` appears TWICE in this file — once directly after the `cursor: pointer` rule and again inside `@media (hover: none)` further down. Insert before the FIRST one, i.e. immediately after the `cursor: pointer` rule's closing `}`.

## Boundaries

- Do NOT change `CheckIn.tsx`, `CheckInOverlay.tsx` or `ProgressScreen.tsx`. The save-then-close order stays.
- In `InvestigationProvider.tsx`, change only what step 1 names. Do NOT change hydration, persistence, `setAnswer` or `reset`.
- Do NOT animate `SymptomTrend`. Adding a point re-spaces every point on the x-axis, which needs its own design.
- Do NOT add keyframes to the module, and do NOT change disc colours, sizes or the today ring.
- If the quoted code differs, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint features/progress/components/CheckInCalendar.tsx features/progress/components/CheckInCalendar.module.css lib/store/InvestigationProvider.tsx` reports no diagnostics. `npm run build` succeeds.
- **Feel check** (`npm run dev`, `/progress`):
  - Make sure today is not yet checked in. Use a fresh browser profile, or in DevTools → Application → Local Storage delete `lux.records.v2` and reload; the seeded series never lands on today.
  - `Check in today` → answer both questions → `Submit`. The overlay fades (about 200ms), then today's disc fills indigo and grows from 80% to full size over about 320ms, with no overshoot. The white numeral fades in with the fill.
  - DevTools → Animations at 10%: CSS transitions on `background-color`, `color` and `scale` with a 200ms delay, on that one `a` element only.
  - **Reload `/progress` now that today is stored**: today's disc is already filled and does not animate, and `document.querySelectorAll('[data-just-checked]').length` is `0`. Page to the previous month and back: nothing animates.
  - Desktop: hovering a checked-in disc still fades it to 0.7.
  - DevTools → Rendering → `prefers-reduced-motion: reduce`, repeat on a fresh profile: the disc is simply filled once the overlay has closed.
- **Done when**: only a day checked in while `/progress` is showing animates, exactly once, starting as the overlay's exit ends — and a reload never lands a disc.

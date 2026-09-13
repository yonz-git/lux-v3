# 017 — Selection marks fade in and out

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: LOW. Polish, but it runs on every radio and checkbox tap in the app.
- **Category**: Missed opportunities (state indication)
- **Estimated scope**: 4 files, ~35 lines: `components/ui/OptionRow.tsx` + `.module.css`, `components/ui/PassList.tsx` + `.module.css`

## Problem

The selection marks are created and destroyed, and the surfaces around them transition.

- **Radio dot.** The dot exists only while selected, because `content: ""` sits inside the selected rule:

  ```css
  /* components/ui/OptionRow.module.css:118-124 — current */
  .row[data-selected="true"] .selector[data-shape="radio"]::after {
    content: "";
    width: 11px;
    height: 11px;
    border-radius: var(--radius-full);
    background: var(--color-text-primary);
  }
  ```

  So it pops in and out in one frame, while the ring beside it eases its `border-color` over `--duration-base` (`.selector`'s transition, `:99-101`).

- **Checkbox tick.** The tick is mounted only while selected, so it pops while the square's fill transitions under it:

  ```tsx
  /* components/ui/OptionRow.tsx:44 — current */
          {control === "checkbox" && selected && (
  ```

- **Pass list tick.** The tick pops while its line's colour and opacity transition over `--duration-base` (`PassList.module.css:46-49`):

  ```tsx
  /* components/ui/PassList.tsx:81-83 — current */
            <span className={styles.mark} aria-hidden="true">
              {i < done ? <SuccessCheckIcon className={styles.tick} /> : null}
            </span>
  ```

Frequency:
- `OptionRow`: tens of times a session. Every radio or checkbox question in the flow, the tray's duration question and the results' duration question use it.
- `PassList`: once per analysis (6 ticks) and once per check (5).

At tens a day the motion must stay near-imperceptible: fast, opacity-led and small.

## Target

- **`OptionRow` marks.** The radio dot and the checkbox tick are always drawn, hidden at `opacity: 0; scale: 0.6`, and shown at `opacity: 1; scale: 1`.
  - Transition: `opacity` and `scale` over `--duration-fast` (120ms), `--ease-standard`.
  - Never from scale 0.
- **`PassList` tick.** It is always rendered, with the same hidden and shown values, over `--duration-base` (200ms). That is the interval its own line already transitions on, so the tick lands with the line rather than ahead of it.
- **`transform-origin: center` on both SVGs**, so the scale can't anchor to a corner. The SVG user-agent stylesheet can default nested `svg` to `0 0`.

## Repo conventions to follow

- **Transitions in modules.** A transition names no keyframes, so it may live in a CSS module (see the note at `PassList.module.css:42-45`).
- **Individual `scale`.** The individual `scale` property is already used for a settling mark: `CheckInCalendar.module.css:210` (`scale: 0.8` → `1`).
- **Reduced motion** collapses transitions globally (`globals.css:2226`), and the end state is correct without motion.

## Steps

1. `components/ui/OptionRow.tsx`. Replace

   ```tsx
           {control === "checkbox" && selected && (
   ```

   with

   ```tsx
           {/* ⚠️ ALWAYS RENDERED FOR A CHECKBOX, AND FADED — changed 13 Sep 2026.
               It mounted only while selected, so the tick popped in and out while
               the fill under it eased. See `.check`. */}
           {control === "checkbox" && (
   ```

2. `components/ui/OptionRow.module.css`. Replace

   ```css
   .row[data-selected="true"] .selector[data-shape="radio"]::after {
     content: "";
     width: 11px;
     height: 11px;
     border-radius: var(--radius-full);
     background: var(--color-text-primary);
   }
   ```

   with

   ```css
   /* ⚠️ THE DOT IS ALWAYS DRAWN AND FADES — changed 13 Sep 2026. It existed only
      while selected, so it popped in and out in one frame beside a ring that
      eased. `duration/fast` and from 0.6, never from 0: this runs on every
      radio tap in the app, and it should read as the dot settling, not as an
      animation. */
   .selector[data-shape="radio"]::after {
     content: "";
     width: 11px;
     height: 11px;
     border-radius: var(--radius-full);
     background: var(--color-text-primary);
     opacity: 0;
     scale: 0.6;
     transition:
       opacity var(--duration-fast) var(--ease-standard),
       scale var(--duration-fast) var(--ease-standard);
   }

   .row[data-selected="true"] .selector[data-shape="radio"]::after {
     opacity: 1;
     scale: 1;
   }
   ```

3. Same file. Replace

   ```css
   .check {
     width: 11px;
     height: 8px;
   }
   ```

   with

   ```css
   /* always rendered, and faded — the dot's recipe above */
   .check {
     width: 11px;
     height: 8px;
     opacity: 0;
     scale: 0.6;
     transform-origin: center;
     transition:
       opacity var(--duration-fast) var(--ease-standard),
       scale var(--duration-fast) var(--ease-standard);
   }

   .row[data-selected="true"] .check {
     opacity: 1;
     scale: 1;
   }
   ```

4. `components/ui/PassList.tsx`. Replace

   ```tsx
             <span className={styles.mark} aria-hidden="true">
               {i < done ? <SuccessCheckIcon className={styles.tick} /> : null}
             </span>
   ```

   with

   ```tsx
             <span className={styles.mark} aria-hidden="true">
               {/* always rendered and faded in by `[data-state="done"]` — it
                   used to mount, and pop, while its line eased */}
               <SuccessCheckIcon className={styles.tick} />
             </span>
   ```

5. `components/ui/PassList.module.css`. Replace

   ```css
   .tick {
     --icon-size: var(--size-icon-sm);
     color: var(--color-feedback-success);
   }
   ```

   with

   ```css
   /* ⚠️ THE TICK FADES IN WITH ITS LINE — changed 13 Sep 2026. It mounted when a
      pass finished and popped while the line's colour and opacity eased over
      `duration/base`; it now lands on that same interval, from 0.6. */
   .tick {
     --icon-size: var(--size-icon-sm);
     color: var(--color-feedback-success);
     opacity: 0;
     scale: 0.6;
     transform-origin: center;
     transition:
       opacity var(--duration-base) var(--ease-standard),
       scale var(--duration-base) var(--ease-standard);
   }

   .pass[data-state="done"] .tick {
     opacity: 1;
     scale: 1;
   }
   ```

## Boundaries

- Do NOT change the ring's border width or colour, the fill, the row's border, or any size, radius or colour.
- Do NOT change the `role`s or ARIA attributes. The svg stays inside the `aria-hidden` selector.
- Do NOT touch `Chip`.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP):
  - **Radio.** Open the add tray's duration question (`/products` → `Add more products` → search → pick → `Add product`) and tap an unselected radio row:
    - on each frame, `getComputedStyle(selector, "::after")` opacity goes from 0 through intermediate values to 1 within about 8 frames;
    - `scale` never reads below `0.6`.
  - **Checkbox.** Tap a checkbox `OptionRow`; `grep -rn 'control="checkbox"' features` lists the screens that render one:
    - `svg.getAnimations()` shows two `CSSTransition`s (`opacity`, `scale`) of 120ms;
    - mid-transition the svg's `getBoundingClientRect()` centre is within 0.5px of its resting centre, so it scales from its middle.
  - **Pass list.** On `/check/analyzing`, each `.tick` goes from opacity 0 to 1 over about 200ms as its line turns `done`.
- **Feel check**:
  - DevTools → Animations at 10%. Select and deselect a radio: the dot settles into the ring rather than appearing, and never grows from a point. At 100% it should barely register as motion.
  - Spam one checkbox. The tick turns round from wherever it is, with no restarts and no flashes.
  - Rendering → emulate `prefers-reduced-motion: reduce`. The marks appear and disappear instantly.
- **Done when**: no selection mark is mounted or unmounted by its selection state, and the three marks fade over their stated durations.

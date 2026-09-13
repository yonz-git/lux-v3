# 011 — Bind the ambient loops to the breath tokens; fix two drifted timing comments

- **Status**: DONE — 13 Sep 2026.
  - `grep -c "var(--ease-breathe)" app/globals.css` prints 5, and `grep -c "var(--duration-breath-phase)" app/globals.css` prints 2.
  - In headless Chrome on `/`, once the entrance has released, `lux-beacon-flow` (4s), `lux-beacon-sweep` (10s), `lux-orb-float` (9s) and `lux-orb-morph` (14s) all compute `cubic-bezier(0.37, 0, 0.63, 1)`.
  - Step 8 was added during execution for two prose comments that still said `ease-in-out`.
- **Commit**: `c5edd11`. Search by quoted code.
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 3 files (`app/globals.css`, `features/my-skin/components/Welcome.tsx`, `components/layout/LogoEntrance.tsx`), ~10 lines

## Problem

Two motion tokens exist for slow ambient loops and have **no callers** (`grep -rn "ease-breathe\|duration-breath-phase" app components features` finds only `app/tokens.css`):

```css
/* app/tokens.css:322 and :326 — current */
  --duration-breath-phase: 4000ms;
  --ease-breathe: cubic-bezier(0.37, 0, 0.63, 1);
```

Meanwhile the ambient loops hand-type the built-in `ease-in-out` (`cubic-bezier(0.42, 0, 0.58, 1)`) and the same 4000ms:

```css
/* app/globals.css — current */
  animation: lux-orb-float 9s ease-in-out infinite;              /* ~line 1791 */
  animation: lux-orb-morph 14s ease-in-out infinite;             /* ~line 1795 */
  animation: lux-beacon-flow 4000ms ease-in-out infinite;        /* ~line 2688, .button-beacon */
    lux-beacon-flow 4000ms ease-in-out infinite;                 /* ~line 2699, .welcome-rise.button-beacon */
  animation: lux-beacon-sweep 10s ease-in-out infinite;          /* ~line 2703, .button-beacon::before */
```

Two timing comments no longer match their code:

```tsx
/* features/my-skin/components/Welcome.tsx:67-68 — current (the code below it sets 1700 / 1850 / 2000ms) */
        {/* ⚠️ each piece fades up after the question lands (1200 + 800ms),
            one 150ms beat apart, the nav last — see `.welcome-rise` */}
```

```tsx
/* components/layout/LogoEntrance.tsx:237-239 — current (globals.css declares `lux-entrance-done 700ms`) */
       Welcome is released so its orb can start growing behind the symbol as
       the symbol sets off. The hand-off's own lifetime (`lux-entrance-done`)
       ends 900ms after that, once the symbol has faded over the orb's mark,
```

Two out-of-sync comments invite a "fix" in the wrong direction. The unused tokens mean the loops can't be retuned in one place.

## Target

- Every `ease-in-out` on these five loop declarations becomes `var(--ease-breathe)`.
- `lux-beacon-flow`'s `4000ms` becomes `var(--duration-breath-phase)`, both occurrences.
- `9s`, `14s` and `10s` stay literal; no token exists for them.
- Welcome's comment: "each piece fades up from 1700ms — while the question's 800ms rise, which starts at 1200ms, is settling — one 150ms beat apart, the nav last".
- LogoEntrance's comment: "ends 700ms after that".

## Repo conventions to follow

- `app/tokens.css` is generated from Figma variables. **Never edit it.** Only reference its tokens.
- Bind semantic tokens rather than literals. AGENTS.md: "Curves and durations should live as shared tokens".

## Steps

1. In `app/globals.css`, replace `animation: lux-orb-float 9s ease-in-out infinite;` with `animation: lux-orb-float 9s var(--ease-breathe) infinite;`.
2. Replace `animation: lux-orb-morph 14s ease-in-out infinite;` with `animation: lux-orb-morph 14s var(--ease-breathe) infinite;`.
3. Replace **every** occurrence of `lux-beacon-flow 4000ms ease-in-out infinite` (expect 2; count first with `grep -n "lux-beacon-flow 4000ms ease-in-out" app/globals.css`) with `lux-beacon-flow var(--duration-breath-phase) var(--ease-breathe) infinite`.
4. Replace `animation: lux-beacon-sweep 10s ease-in-out infinite;` with `animation: lux-beacon-sweep 10s var(--ease-breathe) infinite;`.
5. Run `grep -n "ease-in-out" app/globals.css`. Expect no remaining matches in `animation` declarations. If other declarations appear, leave them and list them in your report.
6. In `features/my-skin/components/Welcome.tsx`, replace the two comment lines quoted above with:

   ```tsx
           {/* ⚠️ each piece fades up from 1700ms — while the question's 800ms rise,
               which starts at 1200ms, is settling — one 150ms beat apart, the nav
               last — see `.welcome-rise` */}
   ```

7. In `components/layout/LogoEntrance.tsx`, in the comment block quoted above, change `ends 900ms after that` to `ends 700ms after that`.
8. **Added during execution, 13 Sep 2026: the two prose comments that still name the old curve.** Step 5's grep turns up two comments in `app/globals.css` that describe these loops as `ease-in-out`. After steps 1–5 that is exactly the drift this plan exists to remove. Replace, verbatim:
   - In the comment directly above `@keyframes lux-orb-float`, replace the line

     ```css
        ease-in-out on both, no overshoot: calm, and LUX does not bounce. */
     ```

     with

     ```css
        `--ease-breathe` on both (it was the built-in `ease-in-out` until 13 Sep
        2026), no overshoot: calm, and LUX does not bounce. */
     ```

   - In the button-beacon comment, under `1. THE GRADIENT BREATHES.`, replace the line

     ```css
           now slowly, unprompted, on a 4s ease-in-out cycle. No new colour.
     ```

     with

     ```css
           now slowly, unprompted, on a 4s `--ease-breathe` cycle. No new colour.
     ```

   Afterwards, `grep -n "ease-in-out" app/globals.css` should find only the new "it was the built-in `ease-in-out`" line.

## Boundaries

- Do NOT change the Spiral Assemble curve `cubic-bezier(0.16, 1, 0.3, 1)`. Its timing is an open, documented decision (`docs/decisions.md`).
- Do NOT change any duration value, delay, or keyframe, and do NOT edit `app/tokens.css`.
- Do NOT change code in `Welcome.tsx` or `LogoEntrance.tsx`, only the two comments.
- If a quoted declaration is not found, STOP and report; plan 001 or 005 may have been applied with changes.

## Verification

- **Mechanical**: `npm run build` succeeds. `grep -c "var(--ease-breathe)" app/globals.css` prints `5`. `grep -c "var(--duration-breath-phase)" app/globals.css` prints `2`.
- **Feel check** (`npm run dev`, `/`, watch for about 20 seconds after the entrance):
  - The CTA's gradient still breathes on a 4s cycle, and the light band still sweeps every 10s.
  - The orb still floats and morphs at the same rhythm. Turnarounds may look marginally softer (the breathe curve is slightly stronger than `ease-in-out`), with no visible change in speed.
  - DevTools → Animations: the `lux-beacon-flow` track shows duration 4000 and easing `cubic-bezier(0.37, 0, 0.63, 1)`.
- **Done when**: the five loops reference the breath tokens and the two comments state the numbers the code uses.

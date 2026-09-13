# 001 — Play the logo entrance once per page load, not on every return to `/`

- **Status**: DONE — 13 Sep 2026. Checked in headless Chrome with a fresh profile:
  - **Hard load of `/`:** it still renders and holds for the entrance. The first-run composition (question bubble, `orb-from-entrance`, three `.welcome-rise`) survives the entrance ending.
  - **Back from step 1 and `Save & exit`:** both return to Welcome with no entrance, no hold, no question bubble and no rise. The hero and actions run `lux-fade-in` 0.32s, and the nav stays solid (see the post-review change below). The CTA is visible and hit-testable 300ms after arrival (before: not within 6.5s), and the first Tab lands on it.
  - **Reload:** the entrance plays again, with no console errors.

  Accepted, not changed: on a return, the orb halo's own 700ms-delayed glow still fades in after the reveal.
- **Commit**: `c5edd11`. Search by the quoted code, not by line number alone.
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 2 files (`components/layout/LogoEntrance.tsx`, `features/my-skin/components/Welcome.tsx`), ~40 lines

## ⚠️ Post-review change, 13 Sep 2026

Step 7's `BottomNav` branch changed after the final review. On a return the nav now gets **no class**; the step said `reveal`. The nav is chrome: `HubScreen` and `QuestionScreen` render it solid through every route change, so revealing it on Welcome made the one element that never moves blink out and fade back over 320ms. The hero and actions keep `.reveal`. Only the first run stages the nav in with `welcome-rise`. Re-verified in headless Chrome, on Back and on `Save & exit`: the nav runs no animation (`animation-name: none`), the hero and actions still run `lux-fade-in` 0.32s, the CTA is usable at 300ms and takes the first Tab, and a hard load still plays the entrance.

## Problem

`app/page.tsx:27` renders `<LogoEntrance />` before `<Welcome />`, so the brand entrance plays every time the `/` route mounts. Its own doc comment says that only happens on a cold start:

```tsx
/* components/layout/LogoEntrance.tsx:68-75 — current */
 * ⚠️ IT PLAYS ON EVERY LOAD OF `/`, AND THAT IS NOT THE "100 TIMES A DAY"
 * ANIMATION IT LOOKS LIKE. Nothing in the app navigates BACK to `/` — Welcome
 * carries `BottomNav active="none"` and no nav item points at it — so the only
 * way to see this is a cold start, which is also the only way to start the
 * investigation, because the store is in memory and a reload begins empty. It
 * is a first-run animation that happens to have no `sessionStorage` behind it,
 * rather than a splash on a screen people pass through. It is skippable anyway;
 * see below.
```

Two in-app controls do navigate back to `/`:

```tsx
/* components/layout/ScreenHeader.tsx:23-26 — current (every flow step; QuestionScreen.tsx:123 passes no saveHref) */
export function ScreenHeader({
  backHref,
  saveHref = "/",
```

```ts
/* features/my-skin/flow.ts:220-224 — current (Back on step 1) */
export function prevHref(id: StepId): string {
  const i = STEPS.findIndex((x) => x.id === id);
  if (i < 0) return "/";
  return STEPS[i].back ?? (i === 0 ? "/" : STEPS[i - 1].href);
}
```

Each return replays the whole thing: a 2300ms lockup, a 700ms hand-off, and Welcome held (`data-entrance-hold`) until the lockup ends. Then Welcome's own staged arrival runs: the CTA carries `--rise-delay: 1700ms` plus an 800ms rise (`Welcome.tsx:73-80`, `app/globals.css` `.welcome-rise`). The CTA is usable about 4.8s after the user asked to go back. That is a first-run moment replayed on routine navigation, and every return pays for it.

## Target

- The entrance plays **at most once per page load**. Module state survives client-side navigation and is reset by a reload, so a cold start (the real first run) still gets the full entrance.
- On an in-app return to `/`, `LogoEntrance` renders nothing and takes no hold. Welcome renders its **settled** composition instead:
  - the orb with no spiral or grow hand-off;
  - only the reply bubble (the question has already been asked);
  - the CTA, disclaimer and nav.
- That composition fades in on the app's standard page reveal: the global `.reveal` class, `lux-fade-in` 320ms `var(--duration-slow)` on `var(--ease-standard)`, fill `backwards`.
- Nothing about the first-run choreography changes.

## Repo conventions to follow

- Reveal hooks are global classes in `app/globals.css` (`.reveal`, `.reveal-quick`, `.reveal-hero`). Never name a keyframe animation inside a CSS Module. Exemplar: `components/layout/Snackbar.tsx` puts `reveal-quick` in a `className` string.
- Every decided-here change carries a `⚠️` comment naming what changed and why, in the file's existing voice (long, specific comments). Match it.
- `Welcome.tsx` is already a client component (`"use client"` on line 1), and `features/*` may import from `components/layout/*`.

## Steps

1. **`components/layout/LogoEntrance.tsx`: add the flag.** Directly after `const HANDOFF_TARGET = ".orb-from-entrance";` (line 96), add:

   ```ts
   /* ⚠️ ONCE PER PAGE LOAD. Module state survives client-side navigation and
      resets on reload — exactly "the first run of this tab". Set when the
      entrance ENDS, never on mount: React Strict Mode mounts twice in
      development, and a flag set on the first mount would skip the entrance on
      the very load it exists for. */
   let played = false;

   /** true once this page load has shown (or skipped) the entrance */
   export function entrancePlayed() {
     return played;
   }
   ```

2. **Same file: start already gone on a return.** Replace

   ```tsx
     const [gone, setGone] = useState(false);
   ```

   with

   ```tsx
     /* an in-app return to `/`: the entrance already ran on this page load, so
        render nothing — the effect below then finds no node and takes no hold */
     const [gone, setGone] = useState(played);
   ```

3. **Same file: mark the entrance played wherever it ends.** Inside the `useEffect`, directly after `const el = ref.current;` / `if (!el) return;`, add:

   ```tsx
       const finish = () => {
         played = true;
         setGone(true);
       };
   ```

   Then replace the two `setGone(true);` calls inside that effect with `finish();`:
   - in the `if (veil === undefined || veil === "finished") {` block (~line 191);
   - inside `onEnd`, after `release();` (~line 263).

   Do not change anything else in the effect.

4. **Same file: correct the doc comment.** Replace the paragraph quoted in *Problem* (lines 68-75) with:

   ```tsx
    * ⚠️ IT PLAYS ONCE PER PAGE LOAD — and until 13 Sep 2026 it played on every
    * mount of `/`, on the claim that nothing navigates back here. Two things do:
    * `Save & exit` on every flow step (`ScreenHeader`'s `saveHref` defaults to
    * `/`) and Back on step 1 (`prevHref`). Each return replayed the three-second
    * lockup and held Welcome's CTA until ~4.8s. `played` (module state) survives
    * client-side navigation and resets on reload, so a cold start still gets
    * the entrance and an in-app return gets Welcome, settled — see
    * `entrancePlayed` and the `returning` branch in Welcome.tsx. It is
    * skippable anyway; see below.
   ```

5. **`features/my-skin/components/Welcome.tsx`: read the flag once per mount.** Add `import { useState } from "react";` directly after the `"use client";` line and its blank line (before `import styles from "./Welcome.module.css";`). Add this import after the `BottomNav` import (line 7):

   ```tsx
   import { entrancePlayed } from "@/components/layout/LogoEntrance";
   ```

   As the first statement inside `export function Welcome() {`, before `return (`, add:

   ```tsx
     /* ⚠️ AN IN-APP RETURN IS NOT A FIRST RUN. `Save & exit` and Back on step 1
        both land here; the entrance and this screen's staged arrival already
        played on this page load, so the settled composition — orb, reply, CTA —
        fades in on the standard page reveal instead. See `entrancePlayed`.
        Read ONCE PER MOUNT (the `useState` initialiser), not on every render:
        the flag flips when the first-run entrance ends, and a re-render after
        that must not swap a first-run Welcome into this composition mid-screen. */
     const [returning] = useState(entrancePlayed);
   ```

6. **Same file: branch the hero.** Replace `<div className={styles.hero}>` with:

   ```tsx
           <div className={returning ? `${styles.hero} reveal` : styles.hero}>
   ```

   Replace the Orb line

   ```tsx
             <Orb size="var(--size-orb-lg)" animateIn halo className="orb-from-entrance" />
   ```

   with

   ```tsx
             <Orb
               size="var(--size-orb-lg)"
               animateIn={!returning}
               halo
               className={returning ? undefined : "orb-from-entrance"}
             />
   ```

   Wrap the question bubble (the `<ChatBubble ... className="bubble-ask-exit" ...>How is your skin feeling today?</ChatBubble>` element) in `{!returning && ( … )}`.

   On the reply bubble, replace `className={`bubble-swap-in ${styles.bubbleReply}`}` with:

   ```tsx
                 className={returning ? styles.bubbleReply : `bubble-swap-in ${styles.bubbleReply}`}
   ```

7. **Same file: branch the actions and nav.**
   - Replace `<div className={styles.actions}>` with `<div className={returning ? `${styles.actions} reveal` : styles.actions}>`.
   - On the `Button`, replace `className={`${styles.cta} welcome-rise`}` with `className={returning ? styles.cta : `${styles.cta} welcome-rise`}`, and its `style={{ "--rise-delay": "1700ms" } as React.CSSProperties}` with `style={returning ? undefined : ({ "--rise-delay": "1700ms" } as React.CSSProperties)}`.
   - On the disclaimer `<p>`, replace `className={`${styles.disclaimer} t-caption welcome-rise`}` with `className={returning ? `${styles.disclaimer} t-caption` : `${styles.disclaimer} t-caption welcome-rise`}`, and make its `style` `returning ? undefined : ({ "--rise-delay": "1850ms" } as React.CSSProperties)`.
   - On `BottomNav`, replace `className="welcome-rise"` with `className={returning ? "reveal" : "welcome-rise"}`, and make its `style` `returning ? undefined : ({ "--rise-delay": "2000ms" } as React.CSSProperties)`.
   - Leave the `beacon` prop on the Button. `.button-beacon`'s own animation lives on the button, while the reveal lives on the wrapper `div`, so the two don't collide.

## Boundaries

- Do NOT change any entrance keyframe, duration or delay in `app/globals.css`, or the hand-off maths (`aim`).
- Do NOT touch `ScreenHeader.tsx` or `flow.ts`. Going to `/` is the correct destination; only the replay is wrong.
- Do NOT add `sessionStorage`/`localStorage`. A reload replaying the entrance is intended.
- Do NOT add a new CSS rule. `.reveal` already exists.
- If any quoted code does not match what you find, STOP and report instead of improvising.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint components/layout/LogoEntrance.tsx features/my-skin/components/Welcome.tsx` reports no diagnostics. `npm run build` succeeds.
- **Feel check** (`npm run dev`, desktop and a 440px-wide window):
  - Hard-load `/`. The entrance plays exactly as before: lockup, hand-off onto the orb, question rising, CTA from ~4s, question→reply swap at ~3.3s after release. Works in dev too, where Strict Mode double-mounts.
  - Press `Create skin profile`, then Back on step 1. Welcome appears within ~320ms: orb, reply bubble, CTA, disclaimer and nav fade in together. No logo, no question bubble, no rise.
  - Go to step 3 and press `Save & exit`. Same settled Welcome.
  - Reload on `/`. The full entrance plays again.
  - Keyboard: on a return, the first Tab lands on a visible CTA.
  - DevTools → Animations, playback 10%, on a return: only `lux-fade-in` (320ms) on the hero/actions/nav plus the ongoing beacon and halo loops. No `lux-entrance-*`, `lux-bubble-*` or `lux-rise-in` tracks.
  - DevTools → Rendering → emulate `prefers-reduced-motion: reduce`, return to `/`. Everything is present at once.
- **Done when**: returning to `/` by Back or `Save & exit` gives a usable CTA within ~320ms, and a hard load still plays the full entrance.

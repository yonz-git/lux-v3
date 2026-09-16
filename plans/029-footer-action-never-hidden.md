# 029 — The screen's action is never invisible while it can be pressed

- **Status**: TODO
- **Commit**: `3933d37` (`new-adjustments`). The two files this plan edits had no uncommitted changes when it was written.
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Cohesion (a stagger must never block interaction)
- **Estimated scope**: 2 CSS files, 2 declarations plus their comments. No TSX.
- **Interacts with**: plan **014** (TODO). See Boundaries.

## Problem

On 15 Sep 2026 every screen's blocks were asked to "appear in order, top to bottom … slight fade up". The global hooks do it: `[data-reveal] > *` runs `lux-fade-up` (opacity 0 → 1, 8px rise, `duration/slow` 320ms, `--ease-standard`, fill `backwards`), and `[data-reveal-stagger]` delays each child 50ms more, capped at the eighth child (350ms).

To land the action after the last block, both shells delay their footer by a flat 400ms:

```css
/* features/my-skin/components/QuestionScreen.module.css — current, in `.footer` */
  /* the action lands after the blocks — see HubScreen.module.css's `.footer`
     for the number; a delay only, the animation is global (15 Sep 2026) */
  animation-delay: 400ms;
```

```css
/* components/layout/HubScreen.module.css — current, in `.footer` */
  /* ⚠️ LAST TO ARRIVE — 15 Sep 2026, asked for directly ("things to appear
     in order, top to bottom"). The shell reveals header, body and footer
     together and the body's blocks stagger 50ms apart to the eighth; without
     this the action landed at 0ms, before the first card. 400 is one step past
     the stagger's cap (8 × 50), so the footer follows the last block on any
     screen. A delay only — the animation is named in globals.css. */
  animation-delay: 400ms;
```

With `backwards` fill, the footer holds opacity 0 for the whole delay. So on every flow step (five routes, walked back and forth) `Continue` is **invisible for 400ms and settles at about 720ms, while it can still be clicked, tapped and tabbed to**. AUDIT §7: "Stagger is decorative — it must never block interaction." The flat 400 also over-waits: it is sized for eight blocks, and a flow step's content has two or three.

Reduced motion is already fine: `globals.css` zeroes `[data-reveal] > *` delays under `prefers-reduced-motion`. Leave that alone.

## Target

The footer still starts after the blocks above it have started, keeping "in order, top to bottom", but it begins its fade-up at **100ms** (`2 × --reveal-step`), not 400ms.

- On a typical flow step (content blocks at 50 / 100 / 150ms after the card), the action starts with the third block. It is legible by about 250ms and settled by 420ms, down from invisible until 400ms and settled at 720ms.
- Written against the stagger step, not as a literal, so retuning `--reveal-step` moves it too.

```css
/* target — both `.footer` rules */
  animation-delay: calc(2 * var(--reveal-step, 50ms));
```

⚠️ This is a deliberate trade against the literal reading of the 15 Sep request. On a hub screen with more than three blocks, the footer now starts before the fourth block rather than after the eighth. The ordering is still top-down where it matters (the action never leads the first blocks), and the action is never hidden long enough to eat a tap. If the reviewer prefers strict last-to-arrive, STOP and ask. Do not restore 400.

## Repo conventions to follow

- Delays in modules are allowed; animation NAMES are not (AGENTS.md, "Motion"). This plan only changes `animation-delay`.
- `--reveal-step` is declared on `[data-reveal-stagger]` in `app/globals.css` (`--reveal-step: 50ms;`), but the footer is not inside a stagger container. That is why the `var()` carries the `50ms` fallback, the same form the global stagger rules use: `calc(var(--reveal-base, 0ms) + 1 * var(--reveal-step, 50ms))`.

## Steps

1. **`features/my-skin/components/QuestionScreen.module.css`**, in `.footer`: replace
   ```css
  /* the action lands after the blocks — see HubScreen.module.css's `.footer`
     for the number; a delay only, the animation is global (15 Sep 2026) */
  animation-delay: 400ms;
   ```
   with
   ```css
  /* the action lands with the blocks, not after all of them — see
     HubScreen.module.css's `.footer` for why it is 2 steps and not 400ms */
  animation-delay: calc(2 * var(--reveal-step, 50ms));
   ```

2. **`components/layout/HubScreen.module.css`**, in `.footer`: replace the comment and `animation-delay: 400ms;` quoted in Problem with
   ```css
  /* ⚠️ IN ORDER, BUT NEVER HIDING THE ACTION — 15 Sep 2026 asked for blocks
     "in order, top to bottom", and this was a flat 400 (one step past the
     stagger's 8 × 50 cap) so the footer landed last on any screen. With the
     reveal's `backwards` fill that held the screen's action at opacity 0 for
     400ms while it could still be pressed — on every flow step. 16 Sep 2026:
     two stagger steps instead. The action starts after the first blocks,
     never before them, and is legible by ~250ms. A delay only — the animation
     is named in globals.css. */
  animation-delay: calc(2 * var(--reveal-step, 50ms));
   ```

## Boundaries

- Do NOT touch `app/globals.css`: not the stagger rules, not the reduced-motion delay reset.
- Do NOT remove `data-reveal` from any shell, card or body. That is plan 014's territory.
- ⚠️ **Plan 014 is stale against this code.** It quotes `lux-fade-in` on `[data-reveal] > *` (now `lux-fade-up`), and it removes `data-reveal` from `QuestionScreen`'s `.shell` assuming `.card` has none (it has one since 15 Sep). Do not execute 014 as part of this plan. If you are executing 014 as well, that plan must be amended first.
- Do NOT change any other `animation-delay` in the app.

## Verification

- **Mechanical**: `npm run build` clean.
- **Feel check**:
  - Walk `/investigation/start` → `/skin-type` → `/conditions` → `/timing` at 440, and at 1440. On each step `Continue` begins fading up almost with the chips, not visibly after everything.
  - In DevTools, on a flow step right after navigation, run `document.querySelector('[class*="footer"]').getAnimations()[0].effect.getTiming().delay`. Expect `100`.
  - At 10% playback in the Animations panel, the footer's bar starts at 100ms, after the header and the first content block.
  - On `/progress/empty` and `/check/no-profile` (hub screens with a footer), the action still arrives after the orb and title have started.
  - Toggle `prefers-reduced-motion`: the footer is visible immediately (delay zeroed globally, unchanged).
- **Done when**: no `.footer` in `QuestionScreen.module.css` or `HubScreen.module.css` has a delay above 100ms, and both still arrive after the first content block.

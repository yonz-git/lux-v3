# Animation plans

These plans come from the `improve-animations` audit of 13 Sep 2026. Each one is self-contained: exact files, the current code quoted verbatim, target values, ordered steps, boundaries, and a feel check. Hand any plan to an executor as-is, or run `improve-animations execute plans/NNN-….md`.

⚠️ **The plans are stamped `d7220d6`, but they were written against the uncommitted working tree of 13 Sep 2026.** That tree contains `components/ui/Collapse.tsx`, the `.collapse`/`.drop` rules, `useHeldWhileClosing` and the widened `SmoothScroll.tsx`, none of which are in that commit. Commit (or knowingly keep) that work before executing. Every plan says to STOP rather than improvise if its quoted code isn't found.

## Plans

| # | Plan | Severity | Category | Depends on | Status |
| --- | --- | --- | --- | --- | --- |
| 001 | [Play the logo entrance once per page load](001-logo-entrance-once-per-load.md) | HIGH | Purpose & frequency | — | DONE |
| 002 | [SmoothScroll: leave trackpads to the browser](002-smoothscroll-leave-trackpads-alone.md) | HIGH | Interruptibility | — | DEFERRED — the classifier can't tell a Mac mouse from a trackpad; see the plan |
| 003 | [SmoothScroll: reverse immediately](003-smoothscroll-reverse-immediately.md) | MEDIUM | Interruptibility | 002 (ordering only) | DONE |
| 004 | [CanvasShader: stop dropping frames](004-canvas-frame-pacing.md) | MEDIUM | Performance | — | DONE |
| 005 | [Reduced motion: no invisible entrance delays](005-reduced-motion-entrance-delays.md) | MEDIUM | Accessibility | — | DONE |
| 006 | [Chat bubbles scale from their tail](006-chat-bubble-origin-at-tail.md) | MEDIUM | Physicality & origin | — | DONE |
| 007 | [Finish the Collapse migration](007-finish-collapse-migration.md) | MEDIUM | Interruptibility | — | DONE |
| 008 | [Snackbar: no blink, rise from the nav](008-snackbar-no-blink-rise-from-nav.md) | MEDIUM | Physicality & origin | — | DONE |
| 009 | [Button enable fade on `duration/base`](009-button-enable-fade-duration.md) | LOW | Easing & duration | — | DONE |
| 010 | [Presence takes the caller's exit duration](010-presence-exit-duration-per-caller.md) | LOW | Interruptibility | — | DONE |
| 011 | [Breath tokens and two timing comments](011-breath-tokens-and-timing-comments.md) | LOW | Cohesion & tokens | after 001, 005 | DONE — plus a step 8 added for two more stale comments |
| 012 | [Today's check-in lands on the calendar](012-checkin-disc-lands-on-calendar.md) | MEDIUM | Missed opportunity | — | DONE — amended before execution: waits for store hydration |
| 013 | [Removed products close; Undo reopens](013-product-removal-closes-smoothly.md) | MEDIUM | Missed opportunity | 007 | DONE |
| 014 | [Page chrome stays still when the page changes](014-page-chrome-stays-still.md) | HIGH | Purpose & frequency | — | TODO |
| 015 | [The add tray's height follows its view](015-tray-height-follows-view.md) | MEDIUM | Missed opportunity | — | TODO |
| 016 | [Tray views fade in; a closing tray keeps its view](016-tray-views-arrive-and-hold-on-close.md) | MEDIUM | Missed opportunity + exit bug | 015 | TODO |
| 017 | [Selection marks fade in and out](017-selection-marks-fade.md) | LOW | Missed opportunity | — | TODO |
| 018 | [The analysis hands over from its passes](018-analysis-passes-hand-over.md) | MEDIUM | Jarring change + hydration bug | 014 (ordering only) | TODO |
| 019 | [Three states read at the wrong moment](019-state-read-at-wrong-moment.md) | MEDIUM | Correctness | — | TODO |
| 020 | [Step 5's list grows in place](020-step5-list-grows-in-place.md) | LOW | Missed opportunity | — | TODO |

## Recommended order

1. **001**: the biggest felt win (a 4.8s wait on every return to Welcome), isolated to two files.
2. **002 → 003**: both edit `SmoothScroll`'s `onWheel`. 003 assumes 002's code is in place.
3. **004**: a one-comparison fix that affects every route.
4. **005**: accessibility, CSS only.
5. **009**, then **006**: tiny, independent.
6. **010**: presence API change plus its three dropdown callers.
7. **007**: fixes `Collapse` (render gate, `overflow: clip`, non-inheriting `--collapse-gap`), then migrates five panels.
8. **013**: extends `Collapse` (`as`, `appear`). Requires 007.
9. **008**: independent. Doing it after 013 means 013's removals exercise the new snackbar.
10. **012**: additive, independent.
11. **011**: last. It sweeps literals and comments in `globals.css`, `Welcome.tsx` and `LogoEntrance.tsx`, which 001 and 005 also touch. It matches by text, not line number.

## Overlaps to watch

- **`app/globals.css`** is edited by 005, 006, 007 and 011. Edits sit in different blocks; always search by the quoted text.
- **`components/ui/Collapse.tsx`**: 007 then 013.
- **`features/my-skin/components/Welcome.tsx`**: 001 (logic) then 011 (one comment).
- **`components/layout/LogoEntrance.tsx`**: 001 (logic and doc comment) then 011 (one comment in a different block).
- **`AGENTS.md`**: 007 (the reveal table row) and 013 (the components table row).

## Not planned — documented decisions the audit respected

The code documents these as decisions, so no plan changes them:
- the 800ms chat-bubble entrance and its enter shine;
- the 600ms hover shine;
- the 400ms button gradient reversal;
- the background canvas's 60fps target and pixel cap;
- 320ms page-level reveals;
- Sheet 320ms in / 200ms out, with desktop sheets fading only;
- Snackbar's 4s hold and 320ms exit;
- no scale on press (`.pressable` overlay);
- a single global reduced-motion rule (plan 005 only fills its delay gap).

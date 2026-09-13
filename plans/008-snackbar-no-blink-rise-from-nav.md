# 008 — Snackbar: no blink on replacement, and rise from the nav edge

- **Status**: TODO
- **Commit**: `d7220d6` — plus the uncommitted working tree of 13 Sep 2026 (`Snackbar.tsx` has uncommitted changes, e.g. `regionRef` and `liftTo`). Search by quoted code.
- **Severity**: MEDIUM
- **Category**: Physicality & origin / Interruptibility
- **Estimated scope**: 2 files (`components/layout/Snackbar.tsx`, `components/layout/Snackbar.module.css`), ~30 lines

## Problem

The undo bar is keyed on the snack's id and fades in on a keyframe:

```tsx
/* components/layout/Snackbar.tsx:202-219 — current */
        {snack && (
          <div
            key={snack.id}
            className={`${styles.bar} reveal-quick`}
            data-state={leaving ? "leaving" : undefined}
          >
            <span className={`${styles.message} t-body3`}>{snack.message}</span>
            <SmallButton
              className={styles.action}
              label={snack.actionLabel}
              arrow={false}
              onClick={() => {
                snack.onAction();
                setLeaving("action");
              }}
            />
          </div>
        )}
```

`show()` gives every call a new id (`Snackbar.tsx:107-112`). A second removal during the 4s hold therefore unmounts the visible bar in one frame and mounts a new one fading up from opacity 0 in the same spot: a blink. Removing several products in a row blinks every time.

The bar is also opacity-only both ways, although it is anchored just above the bottom nav (the region is positioned in the nav's clearance), so it has no spatial connection to where it lives. Its exit transition:

```css
/* components/layout/Snackbar.module.css:90-100 — current */
.bar {
  transition: opacity var(--duration-slow) var(--ease-standard);
}

.bar[data-state="leaving"] {
  opacity: 0;
  /* a bar on its way out must not take a second Undo — the action has already
     run, and the snapshot it would restore is gone */
  pointer-events: none;
}
```

Documented and kept: the 4s hold (`DISMISS_MS`), the 320ms exit on `--duration-slow` (`EXIT_MS`), and the pause on hover/focus.

## Target

- **The bar stays mounted across replacements.** Only the message text is keyed, so a replacement's words fade in on `.reveal-quick` while the bar holds still.
- **Entrance**: a transition started with `@starting-style`, from `opacity: 0; translate: 0 8px` to rest, over 200ms `var(--duration-base)` on `var(--ease-standard)`. The bar rises 8px out of the nav's clearance.
- **Exit**: the same 8px drop plus fade, over 320ms `var(--duration-slow)` (the documented exit). Because it's a transition, a pointer arriving mid-exit, or a new `show()`, retargets from wherever it had got to.
- Use `translate`, not `transform`. `.region` centres itself with `transform: translateX(-50%)`, and `.bar` is its child.

## Repo conventions to follow

- CSS Modules may hold **transitions** and `@starting-style`, but must never name a keyframe animation (AGENTS.md, Motion). The global `reveal-quick` class may be applied from TSX.
- Exemplar of a `@starting-style` entrance in a module: `features/my-skin/components/StepProgress.module.css` (`@starting-style { .fill { width: var(--progress-from); } }`).
- Exemplar of the independent `translate` property avoiding a centring transform: the `lux-rise-in` comment in `app/globals.css` (~line 2067).

## Steps

1. **`components/layout/Snackbar.tsx`**: replace the block quoted above with:

   ```tsx
           {snack && (
             /* ⚠️ NO `key` ON THE BAR — only on its message. The bar used to be
                keyed on the snack's id, so a second removal inside the hold
                deleted it in one frame and faded a new one up from nothing in the
                same spot. It now stays put and the words change under it. */
             <div className={styles.bar} data-state={leaving ? "leaving" : undefined}>
               <span key={snack.id} className={`${styles.message} t-body3 reveal-quick`}>
                 {snack.message}
               </span>
               <SmallButton
                 className={styles.action}
                 label={snack.actionLabel}
                 arrow={false}
                 onClick={() => {
                   snack.onAction();
                   setLeaving("action");
                 }}
               />
             </div>
           )}
   ```

2. **`components/layout/Snackbar.module.css`**: the comment directly above `.bar { transition … }` ends with the paragraph

   ```css
      The entrance animation is finished long before this ever applies (200ms
      against a 4s hold), so the two never fight over opacity. */
   ```

   Replace that paragraph (keep the rest of the comment) with:

   ```css
      ⚠️ AND IT ENTERS THE SAME WAY IT LEAVES — changed 13 Sep 2026. It used to
      fade in on `.reveal-quick`, a keyframe, under a React `key` that changed on
      every `show()`: a second removal inside the hold deleted the bar in one
      frame and faded a new one up from nothing in the same spot. The bar now
      stays mounted across replacements (only the message is keyed) and enters
      with `@starting-style`, rising 8px out of the nav's clearance on
      `duration/base`; it leaves down the same 8px on `duration/slow`.
      `translate`, not `transform` — `.region` centres itself with a transform. */
   ```

   Then replace the two rules quoted in *Problem* with:

   ```css
   .bar {
     transition:
       opacity var(--duration-base) var(--ease-standard),
       translate var(--duration-base) var(--ease-standard);
   }

   @starting-style {
     .bar {
       opacity: 0;
       translate: 0 8px;
     }
   }

   .bar[data-state="leaving"] {
     opacity: 0;
     translate: 0 8px;
     transition-duration: var(--duration-slow);
     /* a bar on its way out must not take a second Undo — the action has already
        run, and the snapshot it would restore is gone */
     pointer-events: none;
   }
   ```

## Boundaries

- Do NOT change `DISMISS_MS`, `EXIT_MS`, the pause logic, `liftTo` or the live region.
- Do NOT change the bar's surface, radius, padding or position rules.
- Do NOT add a keyframe to the module.
- If the quoted TSX or CSS is not found verbatim, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck` exits 0. `npx biome lint components/layout/Snackbar.tsx components/layout/Snackbar.module.css` reports no diagnostics. `npm run build` succeeds.
- **Feel check** (`npm run dev`, `/products`, open a category, open a product card):
  - Press `Remove`. The bar rises about 8px and fades in over about 200ms. In DevTools → Animations it shows as a CSS **transition** on `opacity` and `translate`, not a `lux-fade-in` animation on `.bar`.
  - Within 4s, remove a second product. The bar does **not** disappear or dim; only its text changes, fading in.
  - Wait. The bar sinks about 8px and fades over about 320ms.
  - Move the pointer onto the bar mid-exit. It comes back up from where it was, not from the bottom.
  - Inside the add-product tray (bar lifted above the tray's `Done`), the same behaviour applies.
  - DevTools → Rendering → `prefers-reduced-motion: reduce`: the bar appears and disappears without visible movement.
- **Done when**: two removals one second apart never show the bar below opacity 0.9 between them, and entrance and exit both move along the same 8px path.

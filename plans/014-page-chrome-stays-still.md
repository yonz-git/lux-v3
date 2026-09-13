# 014 — Page chrome stays still when the page changes

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`). `components/layout/HubScreen.tsx` also carries another session's `gridColumns` edit, which was uncommitted while this was written and has since landed as `8348ccb`. The lines this plan quotes are outside it.
- **Severity**: HIGH
- **Category**: Purpose & frequency
- **Estimated scope**: 2 files, ~25 lines

## Problem

Both page shells put `data-reveal` on their outermost wrapper:

```tsx
/* features/my-skin/components/QuestionScreen.tsx:122 — current */
      <div className={styles.shell} data-reveal>
```

```tsx
/* components/layout/HubScreen.tsx:131 — current */
      <div className={styles.shell} data-reveal>
```

and the global hook fades every direct child:

```css
/* app/globals.css:2196 — current */
[data-reveal] > * {
  animation: lux-fade-in var(--duration-slow) var(--ease-standard) backwards;
}
```

Every route renders its own page tree, so every client-side navigation mounts a new shell. Everything in it starts at opacity 0 and fades back in over 320ms, including the parts that sit in exactly the same place on both screens:
- on a flow step: the back chevron, `Save & exit`, the progress track, the desktop frosted card and `Continue`;
- on a hub: the back-chevron row and the desktop card (`.body`).

Measured in headless Chrome on 13 Sep 2026 (step 2 → Back → step 1): on the new screen's first frame, the `ScreenHeader` row read computed opacity `0` with `lux-fade-in` running. Moving between steps is the flow's most frequent action, so the whole frame blinks tens of times a session.

Two knock-on effects:
- `StepProgress`'s fill slides from the previous step's width (`@starting-style`, `features/my-skin/components/StepProgress.module.css:52`), but it slides inside a track that is itself fading up from 0. The one movement that exists to show progress is mostly invisible.
- On a hub, `.body` fades as a shell child while its own children fade again under `.body[data-reveal]`. The two opacities multiply, so content arrives later than 320ms suggests.

## Target

The chrome renders solid; only the content arrives.

- **QuestionScreen**: `.shell` loses `data-reveal`. The keyed `.content` keeps `data-reveal data-reveal-stagger` (`QuestionScreen.tsx:146`), so the question still fades in with its stagger.
- **HubScreen**: `.shell` loses `data-reveal`, and `.body` keeps its own. The three content pieces that were direct shell children take the global `.reveal` class (`lux-fade-in`, 320ms, `--ease-standard`, `backwards`): the heading, the `belowHeading` slot and the footer wrapper. The header row (back chevron, `action`) renders solid.

No new durations, easings or keyframes.

## Repo conventions to follow

- `.reveal` is the global "block arriving with the screen" class (`app/globals.css:1415`; AGENTS.md "Entrance reveals"). It is applied as a class name in TSX; nothing is named in a module.
- Reduced motion is already global:
  - `globals.css:2226` collapses durations;
  - `:2248` drops `[data-reveal] > *` delays;
  - `.reveal` has no delay.
- Decided-here changes carry a `⚠️` comment saying what changed and why.

## Steps

1. `features/my-skin/components/QuestionScreen.tsx`. Replace

   ```tsx
         <div className={styles.shell} data-reveal>
           <ScreenHeader backHref={prevHref(id)} />
   ```

   with

   ```tsx
         {/* ⚠️ THE SHELL DOES NOT FADE — changed 13 Sep 2026. It carried
             `data-reveal`, and every step is its own route, so each navigation
             mounted a new shell and the header, the track, the desktop card and
             Continue blinked out and back in although none of them moves. Only
             the keyed content below arrives, and the track's own fill slide is
             now the visible part of a step change. */}
         <div className={styles.shell}>
           <ScreenHeader backHref={prevHref(id)} />
   ```

2. `components/layout/HubScreen.tsx`, the heading. Replace

   ```tsx
       <div className={styles.heading}>
         <h1 className="t-h4-h3">{title}</h1>
   ```

   with

   ```tsx
       <div className={`${styles.heading} reveal`}>
         <h1 className="t-h4-h3">{title}</h1>
   ```

   On a `card` screen the heading sits inside `.body`, whose `[data-reveal] > *` rule already runs the same animation, so the class changes nothing there.

3. Same file, the shell. Replace

   ```tsx
         <div className={styles.shell} data-reveal>
           {hasHeader && (
   ```

   with

   ```tsx
         {/* ⚠️ THE SHELL DOES NOT FADE — changed 13 Sep 2026. It carried
             `data-reveal`, so every navigation between two hub screens blinked
             the back chevron and the desktop card out and back in, and `.body`'s
             children faded twice (the body's own reveal inside the shell's). The
             content pieces that were shell children — the heading,
             `belowHeading` and the footer — take `.reveal` themselves; the header
             row is chrome and stays solid. */}
         <div className={styles.shell}>
           {hasHeader && (
   ```

4. Same file, `belowHeading`. Replace

   ```tsx
           {(layout !== "card" || center) && heading}
           {belowHeading}
   ```

   with

   ```tsx
           {(layout !== "card" || center) && heading}
           {belowHeading && <div className="reveal">{belowHeading}</div>}
   ```

   The wrapper doesn't change layout for the only caller, `CheckScreen`'s `SkinProfileStrip`:
   - its margins stay inside a flex item;
   - its desktop centring is `margin-inline: auto`, which `CheckScreen.module.css:23-35` notes "centres it in either a block or a flex parent".

5. Same file, the footer. Replace

   ```tsx
           {footer && <div className={styles.footer}>{footer}</div>}
   ```

   with

   ```tsx
           {footer && <div className={`${styles.footer} reveal`}>{footer}</div>}
   ```

## Boundaries

- Do NOT edit `app/globals.css`: not the `[data-reveal]` rules, the stagger, or `.reveal`.
- Do NOT remove `data-reveal` / `data-reveal-stagger` from `.content` (QuestionScreen) or `.body` (HubScreen), and do not touch `.content`'s `key={id}`.
- Do NOT add View Transitions, a `template.tsx` or any route exit animation.
- Do NOT touch the `data-reveal` in `ChatPanel` or `CheckIn`. Those are an overlay and chat turns, not page shells.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Measured** (dev server, headless Chrome over CDP, 440×900). Sample each element on every animation frame:
  - **Flow, back chevron.** Open `/investigation/skin-type` and click the back chevron. On each of the first 10 frames after the URL changes:
    - the shell's first child (the `ScreenHeader` row) reads computed `opacity: 1`;
    - `getAnimations()` on it returns no animation named `lux-fade-in`;
    - `.content`'s children do have `lux-fade-in` animations.
  - **Flow, desktop.** Repeat at 1440×900. The desktop card (the `.card` element) reads `opacity: 1` on the first frame.
  - **Hub.** Open `/check/history`, open a check, and land on `/check/results`:
    - the header row reads `opacity: 1` on the first frame;
    - `.body`'s children animate;
    - the `<h1>` has exactly one `lux-fade-in`.
- **Feel check**:
  - DevTools → Animations at 10%, step 2 → step 1 → step 2:
    - the chevron, `Save & exit`, the track and `Continue` never flicker;
    - the track's fill visibly slides between the two widths;
    - the question fades in with its stagger.
  - Nav from `/products` to `/check`: the title and the content fade, and nothing in a fixed position blinks.
  - Rendering → emulate `prefers-reduced-motion: reduce`: content appears with no fade and no delay.
- **Done when**: nothing that sits in the same place on both sides of a navigation starts that navigation at opacity 0.

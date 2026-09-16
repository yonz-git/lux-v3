# 028 — The basket bar arrives once and stays put

- **Status**: TODO
- **Commit**: `3933d37` (`new-adjustments`). ⚠️ The tree was dirty when this was written: `CheckBasket.tsx`, `CheckBasket.module.css` and `app/globals.css` carried the bar's frost, 17.5px label, shine and `rise-in` as **uncommitted** edits. Every excerpt below is quoted from the working tree. Match by text, never by line number. If those edits were never committed, STOP.
- **Severity**: MEDIUM
- **Category**: Purpose & frequency / Interruptibility
- **Estimated scope**: 2 files (`CheckBasket.tsx`, `CheckBasket.module.css`), ~40 lines. No `globals.css` change.

## Problem

`/check/new` pins a bar above the nav that counts the basket: "Pick at least 2 products", then "1 of 2, pick one more", then "N products · review & analyse". Adding products is the screen's core loop, so the bar changes tens of times a session. It has two faults.

### A. The whole bar re-enters in place when the count crosses 2

The bar is a `<p>` below two products and a `<button>` from two. Different tags mean React unmounts one node and mounts another, and both carry the `rise-in` entrance. So at 1→2, and again at 2→1 when a product is removed in the sheet, the fixed bar blinks to opacity 0, drops 8px and rises again over 320ms. Nothing arrived: the bar never left. It is a keyframe animation, so a quick add-then-remove restarts it from zero rather than retargeting.

```tsx
/* features/check/components/CheckBasket.tsx — current (in CheckBasketBar) */
  if (!ready) {
    return (
      /* `rise-in` — the bar fades up as it appears (globals.css), 16 Sep 2026 */
      <p className={`${styles.bar} rise-in`} data-quiet aria-live="polite">
        {content}
      </p>
    );
  }

  return (
    <button type="button" className={`${styles.bar} rise-in`} onClick={onExpand}>
      {content}
    </button>
  );
```

The file's own CSS comment says "the point is that the SAME element fills up as you add". The remount contradicts it.

### B. The label replays a 1.2s shine on every count change

```tsx
/* features/check/components/CheckBasket.tsx — current (in CheckBasketBar) */
      <span
        key={label}
        className={`${styles.barLabel} t-body2 shine-text shine-on-enter`}
      >
        {label}
      </span>
```

`key={label}` remounts the span whenever the words change, and `.shine-on-enter` is `animation: lux-shine 1200ms var(--ease-standard) … backwards` (globals.css). So every add and every remove sweeps a 1.2s glint across the label. A second tap inside 1.2s unmounts the span mid-sweep and the band jumps back to the right edge. The shine recipe was scoped to chat bubbles ARRIVING, a rare moment; a counter ticking is state feedback. At 1→2 it also fires on top of fault A, so one tap produces two entrances.

## Target

1. **The frosted pill is one persistent element.** A `<div>` wrapper owns everything visual about the bar: its fixed position, width, surface, blur, shadow and the one `rise-in` entrance. It is rendered in BOTH states, so it mounts once when `CheckBasketBar` mounts and never re-enters.
2. **Only the inside changes tag.** Inside the wrapper, the existing `<p data-quiet aria-live="polite">` (below two) or `<button>` (two or more) fills the pill edge to edge. Their semantics are unchanged.
3. **The shine runs once per state, not once per count.** The label span is keyed by the STATE, not by the words: `key={ready ? "ready" : "goal"}`. A count change inside a state (0→1, 2→3 … 8) updates the text in place with no animation at all (AUDIT §1: tens of times a session → no animation). The shine runs when the bar first appears and when it flips between goal and ready.
4. **The chevron fades in when the bar becomes ready**, instead of popping: `opacity` 0 → 1 over `var(--duration-base)` (200ms) on `var(--ease-standard)`, entered with `@starting-style`.
5. **Hover dims the whole pill**, as today: wrapper at `opacity: 0.9` while its button is hovered, on the existing `opacity var(--duration-fast) var(--ease-hover)` transition. The quiet `<p>` still has no hover.

No new keyframes, no new tokens.

## Repo conventions to follow

- Entrances are named in `globals.css` only. A module may use `@starting-style` for a transition entrance, e.g. `.drop` in `app/globals.css` ("Dropdowns open DOWN and close back UP").
- `.rise-in` (globals.css) animates the individual `translate` property, so it composes with the bar's `transform: translateX(-50%)` centring. Keep it on the element that carries that transform.
- `.shine-text` paints glyphs from `--shine-ink`, which must be the surface's own text token. `.bar` sets `--shine-ink: var(--color-text-on-data)` and `.bar[data-quiet]` sets `--shine-ink: var(--color-text-on-data-secondary)`. Those must stay on whichever element is the label's ancestor and carries the state.
- Hover rules pair with an `@media (hover: none)` reset (see `.bar:hover` and its reset in `CheckBasket.module.css`).

## Steps

1. **`CheckBasket.tsx`: key the label by state.** In `CheckBasketBar`, change the span's `key={label}` to `key={ready ? "ready" : "goal"}`. Replace its comment with:
   ```tsx
      {/* ⚠️ THE LABEL SHINES ONCE PER STATE, NOT PER COUNT — keyed on goal /
          ready, not on the words. Adding is this screen's core loop; a 1.2s
          sweep on every tap was decoration on a counter. It glints when the
          bar appears and when it becomes ready (or stops being). `--shine-ink`
          is set on `.bar` and `.bar[data-quiet]`. */}
   ```

2. **`CheckBasket.tsx`: wrap both branches in one persistent pill.** Replace the two `return`s at the end of `CheckBasketBar` (quoted in Problem A) with:
   ```tsx
  /* ⚠️ ONE PILL IN BOTH STATES. The wrapper owns the position, the surface
     and the single entrance, so crossing two products swaps only what is
     inside it — a `<p>` statement or a `<button>` — and the bar itself never
     re-enters. It used to be the `<p>` or the `<button>` directly, and the tag
     change remounted the whole bar at 1→2 and 2→1. */
  return (
    <div className={`${styles.bar} rise-in`} data-quiet={ready ? undefined : ""}>
      {ready ? (
        <button type="button" className={styles.barAction} onClick={onExpand}>
          {content}
        </button>
      ) : (
        <p className={styles.barAction} aria-live="polite">
          {content}
        </p>
      )}
    </div>
  );
   ```
   Delete the old `if (!ready) { … }` block and the old `return ( <button … )`. `data-quiet` stays on the wrapper, so every `.bar[data-quiet]` selector still matches.

3. **`CheckBasket.module.css`: move the layout inside.** The wrapper keeps every declaration `.bar` has today EXCEPT these four, which move to a new `.barAction` rule: `display: flex;`, `align-items: center;`, `justify-content: space-between;`, `gap: var(--space-md); /* 12 */`. Also move `min-height: 54px;` and `padding: 14px var(--space-xl); /* 14 / 20 */` to `.barAction`. Then add `.barAction` directly after the `.bar { … }` block:
   ```css
/* what the pill holds — the `<p>` statement or the `<button>` action. It
   fills the pill edge to edge, so the whole pill is the button's hit area,
   exactly as when `.bar` was the button itself. */
.barAction {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-md); /* 12 */
  width: 100%;
  min-height: 54px;
  margin: 0;
  padding: 14px var(--space-xl); /* 14 / 20 */
  border: none;
  border-radius: inherit;
  background: none;
  color: inherit;
  font: inherit;
  text-align: inherit;
}
   ```
   `border-radius: inherit` keeps the focus outline (non-negotiable 13) tracing the pill. `.bar` keeps `position: fixed`, so it is still the containing block for the absolute `.barChevron`.

4. **`CheckBasket.module.css`: hover follows the button, not the wrapper.** Replace:
   ```css
.bar:hover {
  opacity: 0.9;
}
   ```
   with:
   ```css
.bar:has(> button:hover) {
  opacity: 0.9;
}
   ```
   Delete the `.bar[data-quiet]:hover { opacity: 1; }` rule; the quiet state has no button, so nothing matches. Change the `@media (hover: none)` reset's selector from `.bar:hover` to `.bar:has(> button:hover)`.

5. **`CheckBasket.module.css`: fade the chevron in.** Add to the end of the existing `.barChevron { … }` rule, before its closing brace:
   ```css
  /* appears when the bar becomes ready — a fade, not a pop */
  transition: opacity var(--duration-base) var(--ease-standard);

  @starting-style {
    opacity: 0;
  }
   ```

## Boundaries

- Do NOT touch `app/globals.css`: not `.rise-in`, not `lux-rise-in-sm`, not `.shine-text`/`.shine-on-enter`.
- Do NOT change the bar's copy, the 17.5px label size, the frost, the 598 desktop width or the reduced-transparency fallback.
- Do NOT touch `CheckBasketSheet` (the tray the bar opens) or its `sheet-grow` entrance.
- Do NOT make the quiet state a disabled button. It stays a `<p aria-live="polite">`, per the component's doc comment ("It renders as a statement until it has something to do").
- If any excerpt above is not in the file, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck` clean. `npm run build` clean.
- **Feel check** on `/check/new`, at 375 and at 1440:
  - Load the page: the bar fades up once and its label glints once.
  - Tap `Add` on one product: the text becomes "1 of 2, pick one more" with no glint and no movement.
  - Tap `Add` on a second: the bar does NOT fade or drop. The label glints once and the up-chevron fades in over about 200ms.
  - Add a third, fourth and fifth quickly: the count updates with nothing animating.
  - Open the sheet, remove products back down to one, close it: the bar does not re-enter. The label glints once as it returns to the goal state.
  - Hover the ready bar with a mouse: the whole pill dims to 0.9. Hover the quiet bar: nothing happens.
  - Tab to the ready bar: the focus outline traces the pill's rounded shape.
  - In DevTools' Animations panel at 10%, crossing 1→2 should record ONE `lux-shine` and no `lux-rise-in-sm`.
  - In DevTools, run `document.querySelector('.rise-in').getAnimations()` after each add: from the second add on, it returns `[]`.
  - Toggle `prefers-reduced-motion`: no rise, no glint travel, and the chevron still appears.
- **Done when**: across 0→8→1 products, `lux-rise-in-sm` runs exactly once (on page load), and `lux-shine` runs only on load and at the two goal/ready flips.

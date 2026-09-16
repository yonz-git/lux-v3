# 030 — The gallery's position segment stays under the finger

- **Status**: TODO
- **Commit**: `3933d37` (`new-adjustments`). `PhotoGallery.tsx` and `PhotoGallery.module.css` had no uncommitted changes when this was written.
- **Severity**: MEDIUM
- **Category**: Interruptibility / Performance
- **Estimated scope**: 2 files, ~30 lines.

## Problem

The `Progress gallery` sheet (opened from `/progress`) shows its photos in a horizontally scrolling, snapping row. Under the row is a hairline with a darker segment: the segment's width is the share of the row in view, and its offset is the share scrolled past.

### A. The segment lags behind the scroll

```css
/* features/progress/components/PhotoGallery.module.css — current, `.trackThumb` */
.trackThumb {
  position: absolute;
  top: -0.5px;
  left: 0;
  width: 100%;
  height: 2px;
  border-radius: var(--radius-full);
  background: var(--color-text-on-data-muted);
  transform-origin: left center;
  transform: translateX(calc(var(--track-x, 0) * 100%))
    scaleX(var(--track-size, 1));
  transition: transform var(--duration-slow) var(--ease-standard);
}
```

The segment is a readout of the scroll position, so it should be locked to it. Instead each scroll event hands it a new target and a fresh 320ms eased transition starts. During a swipe it trails the finger, and after an arrow tap (the browser's own smooth scroll) it keeps easing for about 320ms after the row has stopped. AUDIT §2: motion that tracks something continuous is linear, and here the scroll itself is the motion.

### B. Every scroll event re-renders the whole sheet

```tsx
/* features/progress/components/PhotoGallery.tsx — current, in `PhotoGallery` */
  const [pos, setPos] = useState({ size: 1, x: 0, atStart: true, atEnd: true });

  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    setPos({
      size: scrollWidth > 0 ? clientWidth / scrollWidth : 1,
      /* ⚠️ OVER `scrollWidth`, NOT `clientWidth`: the segment's `translateX`
         is a percentage of its own UNSCALED width, which is the full rule, so
         the offset has to be the share of the whole row scrolled past. Over
         `clientWidth` it ran off the end of the rule on the first slide. */
      x: scrollWidth > 0 ? scrollLeft / scrollWidth : 0,
      atStart: scrollLeft <= 1,
      atEnd: max <= 1 || scrollLeft >= max - 1,
    });
  }, []);
```

```tsx
/* features/progress/components/PhotoGallery.tsx — current, in the JSX */
            <span
              className={styles.track}
              aria-hidden="true"
              style={
                {
                  "--track-size": pos.size,
                  "--track-x": pos.x,
                } as React.CSSProperties
              }
            >
              <span className={styles.trackThumb} />
            </span>
```

`onScroll={measure}` fires every frame of a scroll, and every call creates a new `pos` object, so React re-renders the whole sheet (every tile `<Link>` and `CheckInPhotoArt`) just to rewrite two custom properties. AUDIT §5: don't route per-frame motion through React state.

## Target

- **The segment has no transition.** It moves exactly with the scroll, frame for frame. A swipe carries it with the finger, and an arrow tap moves it along the browser's own smooth-scroll curve, so it still glides and it stops when the row stops.
- **The two custom properties are written straight onto the track element** through a ref, in `measure`, with no React state.
- **React state keeps only what the markup needs**: `atStart` and `atEnd` for the arrows' `disabled`. It is set only when one of them actually changes, so an ordinary scroll causes no re-render.

## Repo conventions to follow

- Custom properties already drive this transform (`--track-size`, `--track-x`). Keep those names and the transform expression unchanged. Only who writes them changes.
- The component already uses a callback ref plus a `ResizeObserver` (`setScroller`), with a comment explaining why it is not an effect. Follow the same pattern for the track: a plain `useRef`, read inside `measure`.

## Steps

1. **`PhotoGallery.module.css`**, in `.trackThumb`: delete the line `transition: transform var(--duration-slow) var(--ease-standard);`. Replace the comment above `.track` ("a hairline in the ink at 14%, … the width scales from the rule's start.") with:
   ```css
/* a hairline in the ink at 14%, and on it the segment that says how much of
   the row is in view and how far along it is — width and offset are the two
   custom properties the TSX writes straight onto `.track` on every scroll,
   applied as a transform. ⚠️ NO TRANSITION, 16 Sep 2026: it is a readout of
   the scroll, and a 320ms ease on each scroll event made it trail a swipe and
   land after the row had stopped. The scroll is the motion; an arrow's smooth
   scroll still carries it smoothly. `transform-origin: left` so the width
   scales from the rule's start. */
   ```

2. **`PhotoGallery.tsx`: add a ref for the track and shrink the state.** Replace
   ```tsx
  const [pos, setPos] = useState({ size: 1, x: 0, atStart: true, atEnd: true });
   ```
   with
   ```tsx
  /* ⚠️ ONLY THE ENDS ARE STATE — the arrows' `disabled` needs a render. The
     segment's size and offset are written straight onto `.track` in
     `measure`, so a scroll re-renders nothing unless it reaches or leaves an
     end. They were state until 16 Sep 2026, and every scroll event re-rendered
     the whole sheet to move one 2px line. */
  const track = useRef<HTMLSpanElement | null>(null);
  const [ends, setEnds] = useState({ atStart: true, atEnd: true });
   ```
   Also delete the comment block directly above the old `useState` line ("where the row is: the share in view, … drawn where it stopped"), and add this comment above `const measure`:
   ```tsx
  /* where the row is, read off the scroller, never guessed from a page index,
     so a swipe that stops between tiles is drawn where it stopped */
   ```

3. **`PhotoGallery.tsx`: rewrite `measure`.** Replace the whole `const measure = useCallback(() => { … }, []);` (quoted in Problem B) with:
   ```tsx
  const measure = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;

    const bar = track.current;
    if (bar) {
      bar.style.setProperty(
        "--track-size",
        String(scrollWidth > 0 ? clientWidth / scrollWidth : 1)
      );
      /* ⚠️ OVER `scrollWidth`, NOT `clientWidth`: the segment's `translateX`
         is a percentage of its own UNSCALED width, which is the full rule, so
         the offset has to be the share of the whole row scrolled past. Over
         `clientWidth` it ran off the end of the rule on the first slide. */
      bar.style.setProperty(
        "--track-x",
        String(scrollWidth > 0 ? scrollLeft / scrollWidth : 0)
      );
    }

    const atStart = scrollLeft <= 1;
    const atEnd = max <= 1 || scrollLeft >= max - 1;
    /* same values → same object → React bails out of the render */
    setEnds((prev) =>
      prev.atStart === atStart && prev.atEnd === atEnd
        ? prev
        : { atStart, atEnd }
    );
  }, []);
   ```

4. **`PhotoGallery.tsx`: update the track markup.** Replace the `<span className={styles.track} … style={…}>` element (quoted in Problem B) with:
   ```tsx
            <span ref={track} className={styles.track} aria-hidden="true">
              <span className={styles.trackThumb} />
            </span>
   ```

5. **`PhotoGallery.tsx`: the arrows read `ends`.** Change `disabled={pos.atStart}` to `disabled={ends.atStart}` and `disabled={pos.atEnd}` to `disabled={ends.atEnd}`.

6. **`PhotoGallery.tsx`: measure once the track exists.** The rail containing the track renders only when `multiple` is true, in the same commit as the `<ul>`, but after it in DOM order. So when `setScroller` calls `measure()`, `track.current` may still be null. Add, directly after the line `useEffect(() => () => observer.current?.disconnect(), []);`:
   ```tsx
  /* the rail mounts in the same commit as the row but after it, so the first
     `measure` from `setScroller` can run before `track` is attached — measure
     again once both exist */
  useEffect(() => {
    if (open) measure();
  }, [open, measure]);
   ```
   ⚠️ If the rail is still missing on first open (segment drawn full width), check that this effect runs after the `Sheet` has mounted its children. If it does not, STOP and report; do not add timeouts.

## Boundaries

- Do NOT change `ProgressGallery` (the card on `/progress`), the tiles, the date/day pills, the arrows' styling or `slide()`.
- Do NOT change `scroll-behavior: smooth` or its reduced-motion override on `.row`.
- Do NOT introduce `animation-timeline: scroll()`. It is the more elegant end state, but Safari support is not assumed here, and this plan must work everywhere.
- Keep the `React.CSSProperties` import usage only if something else still uses it. Otherwise nothing else changes in imports.
- If an excerpt does not match, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck` clean, `npm run build` clean.
- **Feel check**: `/progress` → tap the `Progress gallery` card's photos to open the sheet.
  - On first open, the segment is about a third wide at 440 (3 of the demo's photos in view) and about 4/9 at 1440, at the left end. `‹` is disabled.
  - Tap `›`: the row slides and the segment moves WITH it, arriving at the same moment the row stops.
  - Swipe or trackpad-scroll slowly: the segment stays glued to the scroll with no trailing ease.
  - Scroll to the end: `›` disables the moment the last tile snaps in, and scrolling back enables it.
  - Resize the window with the sheet open: the segment's width follows.
  - In React DevTools with "Highlight updates when components render" on, scroll the row mid-way: no highlight except at the moment an end is reached or left.
  - Toggle `prefers-reduced-motion`: arrows jump the row, and the segment jumps with it.
- **Done when**: `.trackThumb` has no `transition`, `PhotoGallery` has no state holding `size`/`x`, and scrolling mid-row triggers zero React renders.

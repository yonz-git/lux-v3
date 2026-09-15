"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import styles from "./PhotoGallery.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { Sheet } from "@/components/ui/Sheet";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { CheckInPhotoArt } from "./CheckInPhotoArt";
import { dayNumber, type CheckIn } from "@/features/progress/progress";
import { formatDay, formatShort, fromIso } from "@/lib/date";

/**
 * `Progress gallery` on `/progress` — a card of the latest check-in photos —
 * and the gallery sheet it opens.
 *
 * ⚠️ NOT IN FIGMA — asked for directly 14 Sep 2026: "next to current state add
 * a small gallery feature showing the latest photos and access button to
 * gallery". Every check-in can carry a photo, and every seeded one does (see
 * `demoExtras`), but the only way to see one was to open its day from the
 * calendar, one day at a time.
 *
 * ⚠️ IT IS ITS OWN CARD NOW, AND THE PROFILE CARD IS GONE — later the same day,
 * asked for directly ("change this to just a gallery, call it progress
 * gallery"). The strip sat at the right end of `SkinProfile`'s state row as
 * three 36s under a `Latest photos` label. Once CHECK's tiles card joined the
 * screen above it, every answer on that card was said twice, so the card became
 * the gallery and `SkinProfile` was deleted. With the row to itself the photos
 * share the card's width instead of squeezing in beside a date.
 * ⚠️ `Started <date> · Day <n>` went with the card and has no home here yet.
 *
 * ⚠️ THE CARD ALWAYS RENDERS, the face card's rule: the screen paints the demo
 * first and the user's own check-ins a moment later, so a card that only
 * existed with photos would unmount under the reader. With none it says so.
 *
 * ⚠️ THE STRIP IS ONE BUTTON. The thumbnails and the chevron circle after them
 * all open the same gallery, so they are one control with one name rather than
 * five stops that do the same thing; the circle is what says the row is a
 * control. The thumbnails do not lead to their own days — in the gallery, each
 * photo does.
 *
 * ⚠️ THE GALLERY IS A `Sheet`, NOT A ROUTE — the same call the selfie capture
 * and the products tray make (AGENTS.md, the route map). It looks through
 * records that already have routes: each tile links to its day's
 * `Check-in detail`, so the sheet adds a way in without adding a page.
 *
 * ⚠️ EVERY PHOTO IS THE SAME SAMPLE, so the strip and the grid repeat one
 * picture. `CheckInPhotoArt` draws one close-up for every capture, by request
 * (13 Sep 2026); the dates under the tiles are what tell them apart until the
 * captures are real.
 */

/** How many photos the card shows before the gallery. */
const LATEST = 4;

const TITLE = "Progress gallery";

const photoCount = (n: number) => `${n} ${n === 1 ? "photo" : "photos"}`;

export function ProgressGallery({
  photos,
  onOpen,
  className,
}: {
  /** newest first — `photoDiary` */
  photos: CheckIn[];
  onOpen: () => void;
  className?: string;
}) {
  const titleId = useId();

  return (
    <DataCard className={className} aria-labelledby={titleId}>
      <div className={styles.cardHead}>
        <h2 id={titleId} className={`${styles.overline} t-overline`}>
          {TITLE}
        </h2>
        {photos.length > 0 && (
          <p className={`${styles.count} t-label-sm`}>
            {photoCount(photos.length)}
          </p>
        )}
      </div>

      {photos.length > 0 ? (
        <button
          type="button"
          className={`${styles.strip} pressable`}
          aria-label={`Open ${TITLE.toLowerCase()}, ${photoCount(photos.length)}`}
          onClick={onOpen}
        >
          {photos.slice(0, LATEST).map((p) => (
            <span key={p.date} className={styles.thumb}>
              <CheckInPhotoArt seed={p.date} className={styles.art} />
            </span>
          ))}
          <span className={styles.more} aria-hidden="true">
            <ChevronRightIcon className={styles.moreIcon} />
          </span>
        </button>
      ) : (
        <p className={`${styles.empty} t-body3`}>
          No photos yet. Add one when you check in.
        </p>
      )}
    </DataCard>
  );
}

/**
 * The gallery sheet — a row of photos that SLIDES, four to a view on desktop
 * and three on a phone, each photo wearing its own date.
 *
 * ⚠️ NOT IN FIGMA — redrawn 15 Sep 2026, asked for directly ("create a nicer
 * way to display date. it can be on the photo, display only 4 and use sliding
 * feature, and mobile only 3. and dont forget to add smooth animation effect"),
 * from a supplied bento reference: image tiles with a small label set INTO a
 * corner of the picture, and a hairline rule running under the row. It was a
 * 3 / 4-column grid of every photo with `Sep 13` over `Day 14` captioned under
 * each tile, which put the date a line away from the picture it belongs to
 * and stacked nine tiles into three rows of scrolling on a phone.
 *
 * ⚠️ THE ROW IS A NATIVE SCROLLER WITH SCROLL SNAP, NOT A TRANSFORMED TRACK.
 * `scroll-snap-type: x mandatory` on the `<ul>`, `snap-align: start` on every
 * tile, and the arrows call `scrollBy` for one view's width. That buys three
 * things a translated track has to re-implement: a swipe on touch that
 * follows the finger and settles with the platform's own physics, an
 * interruptible move (a second tap mid-slide retargets rather than restarting
 * — the interruptibility rule in AGENTS.md's motion section), and keyboard
 * reach — tabbing into an off-screen tile scrolls it into view because the
 * tiles are real links. `scroll-behavior: smooth` is the slide the arrows
 * produce; the global `prefers-reduced-motion` rule does not reach it, so the
 * stylesheet sets it back to `auto` there itself.
 *
 * ⚠️ THE RULE UNDER THE ROW IS THE POSITION, AND IT MOVES WITH THE SCROLL. A
 * hairline the width of the row, with a darker segment whose width is the
 * share of photos in view and whose offset is the share scrolled past —
 * `--track-size` / `--track-x`, written on every scroll event and applied as
 * `transform`, so it glides under a swipe rather than jumping page to page.
 * It is not a scrollbar (the app hides those, non-negotiable 18) and it is not
 * a control: the arrows beside it are, and they disable at either end with the
 * DS's own fade, as the calendar's do.
 *
 * ⚠️ THE DATE IS ON THE PHOTO. `Sep 13` sits in the tile's top-left corner in
 * a frosted dark pill — the nav bar's own fill (`surface/nav-bar`, dark slate
 * at 26%) over an 8 blur, white `t-label-sm` — and `Day 14` in the bottom-right
 * in the same pill. ⚠️ It was plain white on a drop shadow for its first
 * render and did not hold: the placeholder photograph is lightest exactly
 * there (a pale callout circle sits in that corner), so the count went under.
 * One pill recipe, two corners: the date names the photo, the day count is
 * its place in the investigation. Both are inside the link, so the tile's
 * accessible name is unchanged.
 *
 * ⚠️ EVERYTHING THAT MOVES OR HOVERS IS ON A CURVE. The slide is the
 * browser's smooth scroll; the rule's segment moves on `duration/slow` +
 * `ease/standard`; a hovered tile's picture scales 1.03 inside its clipped well
 * on the same clock (a transform, so no layout) and lifts its saturation as
 * before; the arrows take `pressable` and the 0.7 hover fade every arrow in
 * the app takes. `hover: hover` guards the hover rules so nothing sticks after
 * a tap.
 */
const TILE_GAP = 12;
/** `--per-view` in the stylesheet — keep the two in step */
const PER_VIEW_MOBILE = 3;
const PER_VIEW_DESKTOP = 4;

export function PhotoGallery({
  open,
  onClose,
  photos,
  start,
}: {
  open: boolean;
  onClose: () => void;
  /** newest first — `photoDiary` */
  photos: CheckIn[];
  /** the investigation's first day, so each tile can say which day it was */
  start: Date;
}) {
  const scroller = useRef<HTMLUListElement | null>(null);
  /* where the row is: the share in view, the share scrolled past, and whether
     either end has been reached — read off the scroller, never guessed from a
     page index, so a swipe that stops between tiles is drawn where it stopped */
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

  /* ⚠️ A CALLBACK REF, NOT AN EFFECT ON `open`. `Sheet` mounts its children on
     its own clock (it holds them through the exit), so an effect keyed on
     `open` can run before the row exists and never measure it — which drew
     the rule's segment at full width with both arrows dead. The observer
     attaches the moment the `<ul>` mounts and follows its width from then on
     (the phone tray and the desktop dialog are different widths). */
  const observer = useRef<ResizeObserver | null>(null);
  const setScroller = useCallback(
    (el: HTMLUListElement | null) => {
      observer.current?.disconnect();
      observer.current = null;
      scroller.current = el;
      if (!el) return;
      measure();
      observer.current = new ResizeObserver(measure);
      observer.current.observe(el);
    },
    [measure],
  );
  useEffect(() => () => observer.current?.disconnect(), []);

  const slide = (dir: -1 | 1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth + TILE_GAP) });
  };

  const multiple = photos.length > 1;

  return (
    /* ⚠️ A CORNER ✕, NOT `Done` — asked for directly 15 Sep 2026 ("remove done
       and add x top right corner"). The gallery is something you look through
       and leave, so its exit sits where a viewer's does. */
    <Sheet open={open} onClose={onClose} title={TITLE} dismiss="corner">
      {/* `Sheet` uses the title for its aria-label only, so the visible
          heading is rendered here, as `SelfieSheet` does */}
      <div className={styles.head}>
        <h2 className={`${styles.heading} t-h6`}>{TITLE}</h2>
        <p className={`${styles.intro} t-body3`}>
          {/* ⚠️ THE NUMBER IS THE PHOTOS IN VIEW — 3 on a phone, 4 on
              desktop (`--per-view`) — asked for directly 15 Sep 2026. It was
              the whole diary, which read as a miscount beside a row that
              shows fewer. Capped by the diary so it never claims a photo
              that does not exist. */}
          <span className={styles.perViewMobile}>
            {photoCount(Math.min(photos.length, PER_VIEW_MOBILE))}
          </span>
          <span className={styles.perViewDesktop}>
            {photoCount(Math.min(photos.length, PER_VIEW_DESKTOP))}
          </span>{" "}
          from your check-ins, newest first
        </p>
      </div>

      <div className={styles.carousel}>
        <ul
          ref={setScroller}
          className={styles.row}
          onScroll={measure}
          aria-label="Photos"
        >
          {photos.map((p) => {
            const day = fromIso(p.date);
            if (!day) return null;
            const n = dayNumber(start, day);

            return (
              <li key={p.date} className={styles.slide}>
                {/* the photo leads to its record — the check-in it was taken at */}
                <Link
                  href={`/progress/check-in/${p.date}`}
                  className={`${styles.tile} pressable`}
                  aria-label={`Photo from ${formatDay(day)}, day ${n}`}
                >
                  <span className={styles.well}>
                    <CheckInPhotoArt seed={p.date} className={styles.art} />
                    <span className={`${styles.date} t-label-sm`} aria-hidden="true">
                      {formatShort(day)}
                    </span>
                    <span className={`${styles.day} t-label-sm`} aria-hidden="true">
                      Day {n}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        {multiple && (
          <div className={styles.rail}>
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
            <div className={styles.arrows}>
              {/* ‹ moves the row toward its start (the newest photos), ›
                  toward its end (the older ones) — the chevron points the way
                  the row moves, whatever the dates do */}
              <button
                type="button"
                className={`${styles.arrow} pressable`}
                aria-label="Newer photos"
                disabled={pos.atStart}
                onClick={() => slide(-1)}
              >
                <ChevronLeftIcon className={styles.arrowIcon} />
              </button>
              <button
                type="button"
                className={`${styles.arrow} pressable`}
                aria-label="Older photos"
                disabled={pos.atEnd}
                onClick={() => slide(1)}
              >
                <ChevronRightIcon className={styles.arrowIcon} />
              </button>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}

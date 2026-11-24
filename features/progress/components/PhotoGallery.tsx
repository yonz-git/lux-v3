"use client";

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import styles from "./PhotoGallery.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { Sheet } from "@/components/ui/Sheet";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icons";
import { CheckInPhotoArt } from "./CheckInPhotoArt";
import { dayNumber, type CheckIn } from "@/features/progress/progress";
import { formatDay, formatShort, fromIso } from "@/lib/date";

/**
 * `Progress gallery` on `/myskin` — a card of the latest check-in photos —
 * and the gallery sheet it opens.
 */

/** How many photos the card shows before the gallery. */
const LATEST = 4; /* the strip's four slots in PhotoGallery.module.css */

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
    <DataCard className={className} aria-labelledby={titleId} data-motion>
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
          {photos.slice(0, LATEST).map((p, i) => (
            <span
              key={p.date}
              className={styles.thumb}
              style={{ "--i": i } as CSSProperties}
            >
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
 */
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
      x: scrollWidth > 0 ? scrollLeft / scrollWidth : 0,
      atStart: scrollLeft <= 1,
      atEnd: max <= 1 || scrollLeft >= max - 1,
    });
  }, []);

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
    /* one view plus one gap. */
    const gap = Number.parseFloat(getComputedStyle(el).columnGap) || 0;
    el.scrollBy({ left: dir * (el.clientWidth + gap) });
  };

  const multiple = photos.length > 1;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={TITLE}
      dismiss="corner"
      className="sheet-dialog-tablet"
    >
      {/* `Sheet` uses the title for its aria-label only, so the visible
          heading is rendered here, as `SelfieSheet` does */}
      <div className={styles.head}>
        <h2 className={`${styles.overline} t-overline`}>{TITLE}</h2>
        <p className={`${styles.intro} t-body3`}>
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
                  href={`/myskin/check-in/${p.date}`}
                  className={`${styles.tile} pressable`}
                  aria-label={
                    n >= 1
                      ? `Photo from ${formatDay(day)}, day ${n}`
                      : `Photo from ${formatDay(day)}`
                  }
                >
                  <span className={styles.frame}>
                    <span className="edge-light" aria-hidden="true" />
                    <span className={styles.well}>
                      <CheckInPhotoArt seed={p.date} className={styles.art} />
                      <span className={`${styles.date} t-label-sm`} aria-hidden="true">
                        <span className="edge-light" />
                        {formatShort(day)}
                      </span>
                      {/* no pill on a photo from before the start */}
                      {n >= 1 && (
                        <span className={`${styles.day} t-label-sm`} aria-hidden="true">
                          <span className="edge-light" />
                          Day {n}
                        </span>
                      )}
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

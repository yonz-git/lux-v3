"use client";

import Link from "next/link";
import styles from "./PhotoGallery.module.css";
import { Sheet } from "@/components/ui/Sheet";
import { ChevronRightIcon } from "@/components/ui/icons";
import { CheckInPhotoArt } from "./CheckInPhotoArt";
import { dayNumber, type CheckIn } from "@/features/progress/progress";
import { formatDay, formatShort, fromIso } from "@/lib/date";

/**
 * The latest check-in photos on `/progress`'s profile card, and the gallery
 * they open.
 *
 * ⚠️ NOT IN FIGMA — asked for directly 14 Sep 2026: "next to current state add
 * a small gallery feature showing the latest photos and access button to
 * gallery". Every check-in can carry a photo, and every seeded one does (see
 * `demoExtras`), but the only way to see one was to open its day from the
 * calendar, one day at a time.
 *
 * ⚠️ THE STRIP IS ONE BUTTON. The thumbnails and the chevron circle after them
 * all open the same gallery, so they are one control with one name rather than
 * four stops that do the same thing; the circle is what says the row is a
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

/** How many photos the profile card shows before the gallery. */
const LATEST = 3;

const photoCount = (n: number) => `${n} ${n === 1 ? "photo" : "photos"}`;

export function LatestPhotos({
  photos,
  onOpen,
}: {
  /** newest first — `photoDiary` */
  photos: CheckIn[];
  onOpen: () => void;
}) {
  if (photos.length === 0) return null;

  return (
    <div className={styles.latest}>
      <p className={`${styles.label} t-label-sm`}>Latest photos</p>
      <button
        type="button"
        className={`${styles.strip} pressable`}
        aria-label={`Open photo gallery, ${photoCount(photos.length)}`}
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
    </div>
  );
}

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
  return (
    <Sheet open={open} onClose={onClose} title="Photo gallery">
      {/* `Sheet` uses the title for its aria-label only, so the visible
          heading is rendered here, as `SelfieSheet` does */}
      <div className={styles.head}>
        <h2 className={`${styles.heading} t-h6`}>Photo gallery</h2>
        <p className={`${styles.intro} t-body3`}>
          {photoCount(photos.length)} from your check-ins, newest first
        </p>
      </div>

      <ul className={styles.grid}>
        {photos.map((p) => {
          const day = fromIso(p.date);
          if (!day) return null;
          const n = dayNumber(start, day);

          return (
            <li key={p.date}>
              {/* the photo leads to its record — the check-in it was taken at */}
              <Link
                href={`/progress/check-in/${p.date}`}
                className={`${styles.tile} pressable`}
                aria-label={`Photo from ${formatDay(day)}, day ${n}`}
              >
                <span className={styles.well}>
                  <CheckInPhotoArt seed={p.date} className={styles.art} />
                </span>
                <span className={styles.caption}>
                  <span className={`${styles.date} t-label-sm`}>
                    {formatShort(day)}
                  </span>
                  <span className={`${styles.day} t-label-sm`}>Day {n}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Sheet>
  );
}

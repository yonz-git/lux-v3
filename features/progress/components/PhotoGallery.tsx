"use client";

import { useId } from "react";
import Link from "next/link";
import styles from "./PhotoGallery.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { Sheet } from "@/components/ui/Sheet";
import { ChevronRightIcon } from "@/components/ui/icons";
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
    <Sheet open={open} onClose={onClose} title={TITLE}>
      {/* `Sheet` uses the title for its aria-label only, so the visible
          heading is rendered here, as `SelfieSheet` does */}
      <div className={styles.head}>
        <h2 className={`${styles.heading} t-h6`}>{TITLE}</h2>
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

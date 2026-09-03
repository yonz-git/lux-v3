"use client";

import styles from "./CheckInDetail.module.css";
import { HubScreen } from "./HubScreen";
import { DataCard } from "./DataCard";
import { Tag } from "./Tag";
import { ProductThumb } from "./ProductThumb";
import { CheckInPhotoArt } from "./CheckInPhotoArt";
import { useInvestigation } from "./InvestigationProvider";
import { formatDay, fromIso } from "@/lib/date";
import { formatAdded, fullName } from "@/lib/products";
import {
  SEVERITY_MAX,
  checkInOn,
  checkInsFor,
  dayNumber,
  productsUsedOn,
  progressView,
  severityLabel,
} from "@/lib/progress";

/**
 * `Check-in detail` — Figma 556:1330 (mobile) / 557:1353 (desktop), at
 * `/progress/check-in/<iso date>`.
 *
 * The historical record for ONE day, opened from the Progress calendar. The
 * handoff placed it in the PROGRESS section from the start — "a historical
 * record opened from the Progress calendar" — and it is the screen that finally
 * READS the `changes`, `note` and `photo` the daily check-in has been writing
 * since it shipped. `CheckInCalendar`'s discs are links now for the same
 * reason: the rule they were held back by was that a link to a 404 is worse
 * than a control that has not been wired, and the route exists.
 *
 * ⚠️ A PUSHED VIEW, NOT A HUB LANDING AND NOT A FLOW STEP. Back chevron, nav
 * reads `progress`, and NO progress track and NO `Save & exit` — that pair is
 * the investigation flow's signature and this is a record off a hub, exactly as
 * the check-in chat is an action off one. It has no `StepId`.
 *
 * ⚠️ NOTHING ON IT IS STORED TWICE. The severity, the changes, the note and the
 * photo are the `CheckIn` the chat wrote; the day number is computed from the
 * investigation's start; the products come from the library by date. The screen
 * states no fact it does not derive.
 *
 * ⚠️ THE TEXT IS DARK, NOT WHITE. The frames write `text/on-data` and friends
 * as white on the sage card, and those three tokens are redefined globally in
 * `globals.css` because white failed AA on 38 of 59 nodes when it was measured
 * on `/check/results`. This screen inherits that fix rather than restating it —
 * see the SURFACE SYSTEM B note in AGENTS.md, and raise the token values in
 * Figma.
 *
 * ⚠️ THE PRODUCT ARTWORK IS NOT IN FIGMA. Both frames draw a `products used`
 * row as two lines of text and no picture. Every other product row in the app
 * carries a `ProductThumb`, and a list of names alone is the one place the app
 * asks the reader to identify a product by reading it — so the same 48 thumb
 * is used here, with the same drawn vessel (`ProductArt`), tinted per brand.
 * Decided here under the prototype-leads rule; Figma catches up.
 *
 * ⚠️ THE SUBTITLE IS ON BOTH BREAKPOINTS. Only 557:1353 draws "Check-in
 * record" under the date; the mobile frame has the date alone. The handoff
 * requires the two breakpoints to be clones, and a date with no noun under it
 * does not say what the screen is — so the desktop frame is the one that is
 * right and mobile catches up.
 *
 * ⚠️ A CARD WITH NOTHING IN IT IS NOT DRAWN. The frames are a filled-in state:
 * notes, a photo and two symptom tags. A real check-in can carry none of those
 * — turn 3 is optional and turn 2 can be skipped — and an empty NOTES card
 * headed by an overline is a promise the record does not keep. Severity is the
 * one card that always renders, because every check-in has one.
 */
export function CheckInDetail({ date }: { date: string }) {
  const { answers } = useInvestigation();
  const view = progressView(answers);
  const day = fromIso(date);
  const entry = day ? checkInOn(checkInsFor(answers, view), date) : null;

  const title = day ? formatDay(day) : "Check-in record";
  /* `Day 4` — the same 1-based count the profile card writes, so the tag and
     "Started … · Day 12" cannot disagree about which day this is. */
  const dayTag = day ? `Day ${dayNumber(view.start, day)}` : null;

  const products = entry ? productsUsedOn(answers, date) : [];

  return (
    <HubScreen
      title={title}
      subtitle="Check-in record"
      backHref="/progress"
      action={dayTag ? <Tag variant="brand">{dayTag}</Tag> : undefined}
      nav="progress"
      layout="grid"
    >
      {!entry && (
        <DataCard className={styles.card}>
          <p className={`${styles.empty} t-body3`}>
            No check-in was recorded on this day.
          </p>
        </DataCard>
      )}

      {entry && (
        <>
          {entry.changes && entry.changes.length > 0 && (
            <DataCard
              className={`${styles.card} ${styles.symptoms}`}
              aria-labelledby="checkin-symptoms"
            >
              <h2
                id="checkin-symptoms"
                className={`${styles.label} t-overline`}
              >
                Symptoms reported
              </h2>
              {/* ⚠️ THE RECORDED ANSWER, VERBATIM — the comp's tags read
                  "Redness" and "Itching", but what turn 2 stores is "Less
                  redness" / "More itching": the symptom AND which way it moved.
                  Dropping the prefix to match the comp would throw away the
                  half of the answer the check-in exists to collect. */}
              <ul className={styles.tags}>
                {entry.changes.map((change) => (
                  <li key={change}>
                    <Tag>{change}</Tag>
                  </li>
                ))}
              </ul>
            </DataCard>
          )}

          <DataCard
            className={`${styles.card} ${styles.severity}`}
            aria-labelledby="checkin-severity"
          >
            <h2 id="checkin-severity" className={`${styles.label} t-overline`}>
              Severity
            </h2>
            <p className={styles.severityValue}>
              <span className={`${styles.severityWord} t-h5`}>
                {severityLabel(entry.severity)}
              </span>
              <span className={`${styles.severityScore} t-h6`}>
                {entry.severity} / {SEVERITY_MAX}
              </span>
            </p>
            {/* the meter is decoration over a value both spans above already
                state, so it is hidden rather than announced a third time */}
            <span className={styles.meter} aria-hidden="true">
              <span
                className={styles.meterFill}
                style={{ width: `${(entry.severity / SEVERITY_MAX) * 100}%` }}
              />
            </span>
          </DataCard>

          {/* ⚠️ ONE WRAPPER, AND IT IS col-1 — the ONLY structure the desktop
              grid needs, because the mobile order runs straight through it.
              A grid's rows are shared across its columns, so with five flat
              cards the tall photos card would push the severity card beside it
              a hundred pixels down ITS column and open a gap the comp does not
              draw. Grouping col-1 into one grid item that spans the rows lets
              each column flow at its own heights, which is what both frames
              draw. `/progress` does the same thing with its calendar.

              It costs nothing on mobile: the frames put notes directly above
              photos there, so the wrapper's own contents are already in the
              order the small screen wants and the DOM order stays the reading
              order — no `order` property, and nothing for a screen reader to
              disagree with. Only the desktop swaps the two, because 557:1353
              leads col-1 with the photos. */}
          {(entry.note || entry.photo) && (
            <div className={styles.col1}>
              {entry.note && (
                <DataCard
                  className={`${styles.card} ${styles.notes}`}
                  aria-labelledby="checkin-notes"
                >
                  <h2
                    id="checkin-notes"
                    className={`${styles.label} t-overline`}
                  >
                    Notes
                  </h2>
                  {/* the quotes are the comp's and they are DISPLAY — what the user
                  typed is stored without them */}
                  <p className={`${styles.note} t-body3`}>
                    &ldquo;{entry.note}&rdquo;
                  </p>
                </DataCard>
              )}

              {entry.photo && (
                <DataCard
                  className={`${styles.card} ${styles.photos}`}
                  aria-labelledby="checkin-photos"
                >
                  <h2
                    id="checkin-photos"
                    className={`${styles.label} t-overline`}
                  >
                    Photos
                  </h2>
                  {/* ⚠️ ONE WELL, NOT THE COMP'S TWO. The check-in captures one
                  photo — `photo` is a single value — so a second well would be
                  an empty box the screen can never fill. The well still grows
                  to the full width, which is what the comp's own `flex: 1 0 0`
                  does with one child.

                  ⚠️ AND IT HOLDS A PICTURE, NOT THE COMP'S CAMERA GLYPH. The
                  card's whole content is the photograph, so a camera icon here
                  reads as "no photo" on the one card that exists to show one —
                  the same failure the product thumbnails had. `CheckInPhotoArt`
                  draws the capture; every viewfinder in LUX is a placeholder,
                  and so is this. */}
                  <div className={styles.photoGrid}>
                    <figure className={styles.photo}>
                      <CheckInPhotoArt
                        seed={entry.date}
                        className={styles.photoArt}
                      />
                      <figcaption className="visually-hidden">
                        Photo taken at this check-in
                      </figcaption>
                    </figure>
                  </div>
                </DataCard>
              )}
            </div>
          )}

          {products.length > 0 && (
            <DataCard
              className={`${styles.card} ${styles.products}`}
              aria-labelledby="checkin-products"
            >
              <h2
                id="checkin-products"
                className={`${styles.label} t-overline`}
              >
                Products used
              </h2>
              <ul className={styles.productList}>
                {products.map((p) => (
                  <li key={p.id} className={styles.product}>
                    <ProductThumb product={p} />
                    <span className={styles.productText}>
                      <span className={`${styles.productName} t-h6`}>
                        {fullName(p)}
                      </span>
                      {/* ⚠️ NOT THE COMP'S "Moisturizer · Applied Morning &
                          Night" — LUX stores neither a category nor a routine
                          time, so both halves of that line would be invented.
                          The size and the date the product entered the library
                          are the two facts it carries, and the date is also
                          WHY it is on this day's list. */}
                      <span className={`${styles.productMeta} t-label-sm`}>
                        {p.size ? `${p.size} · ` : ""}
                        Added {formatAdded(p.addedOn)}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </DataCard>
          )}
        </>
      )}
    </HubScreen>
  );
}

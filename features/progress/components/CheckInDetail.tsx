"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CheckInDetail.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { DataCard } from "@/components/ui/DataCard";
import { TextField } from "@/components/ui/TextField";
import { Tag } from "@/components/ui/Tag";
import SegmentedToggle from "@/features/products/components/SegmentedToggle";
import { ProductThumb } from "@/features/products/components/ProductThumb";
import { CheckInPhotoArt } from "./CheckInPhotoArt";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { ProgressEmpty } from "./ProgressScreen";
import { useToday } from "@/lib/useToday";
import { formatDay, fromIso } from "@/lib/date";
import {
  BUCKET_TAG,
  formatAdded,
  fullName,
} from "@/features/products/products";
import {
  SEVERITY_MAX,
  checkInOn,
  checkInDirection,
  checkInsFor,
  hasInvestigation,
  dayNumber,
  editNote,
  productsForCheckIn,
  progressView,
  severityLabel,
} from "@/features/progress/progress";

/**
 * `Check-in detail` — Figma 556:1330 (mobile) / 557:1353 (desktop), at
 * `/myskin/check-in/<iso date>`.
 *
 * The historical record for ONE day, opened from the Progress calendar. The
 * handoff placed it in the PROGRESS section from the start — "a historical
 * record opened from the Progress calendar" — and it is the screen that finally
 * READS the `changes`, `note` and `photo` the daily check-in has been writing
 * since it shipped. `CheckInCalendar`'s discs are links now for the same
 * reason: the rule they were held back by was that a link to a 404 is worse
 * than a control that has not been wired, and the route exists.
 */
export function CheckInDetail({ date, now }: { date: string; now: number }) {
  const { answers, setAnswer } = useInvestigation();
  const view = progressView(answers, useToday(now));
  const day = fromIso(date);
  const records = checkInsFor(answers, view);
  const entry = day ? checkInOn(records, date) : null;

  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  /* Focus goes back to the control that opened the field, the way `Sheet` puts
     it back — leaving it on a button that just disappeared drops the keyboard
     user at the top of the document. */
  const noteEditRef = useRef<HTMLButtonElement>(null);
  const restoreNoteFocus = useRef(false);

  const title = day ? formatDay(day) : "Check-in record";
  /* `Day 4` — the same 1-based count the profile card writes, so the tag and
     "Started … · Day 12" cannot disagree about which day this is. */
  const dayN = day ? dayNumber(view.start, day) : 0;
  /* none on a day from before the start */
  const dayTag = day && dayN >= 1 ? `Day ${dayN}` : null;

  const products = entry ? productsForCheckIn(answers, entry) : [];

  function startEditingNote() {
    setNoteDraft(entry?.note ?? "");
    setEditingNote(true);
  }

  function closeNoteEditor() {
    restoreNoteFocus.current = true;
    setEditingNote(false);
  }

  function saveNote() {
    if (!entry) return;
    setAnswer("checkIns", editNote(entry, noteDraft));
    closeNoteEditor();
  }

  useEffect(() => {
    if (editingNote || !restoreNoteFocus.current) return;
    restoreNoteFocus.current = false;
    noteEditRef.current?.focus();
  }, [editingNote]);

  /* no investigation, so no record to show — the empty Progress hub says so */
  if (!hasInvestigation(answers)) return <ProgressEmpty />;

  return (
    <HubScreen
      title={title}
      subtitle="Check-in record"
      backHref="/myskin"
      action={
        dayTag ? (
          <Tag className={styles.dayTag}>
            {dayTag}
          </Tag>
        ) : undefined
      }
      nav="my-skin"
      layout="grid"
      gridColumns="440px 1fr 1fr"
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
              <ul className={styles.tags}>
                {entry.changes.map((change) => (
                  <li
                    key={change}
                    className={`${styles.tag} t-label-sm`}
                    data-direction={checkInDirection(records, entry)}
                  >
                    {change}
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

          <div className={styles.col1}>
            <DataCard
                  className={`${styles.card} ${styles.notes}`}
                  aria-labelledby="checkin-notes"
                >
                  <div className={styles.cardHead}>
                    <h2
                      id="checkin-notes"
                      className={`${styles.label} t-overline`}
                    >
                      Notes
                    </h2>

                    {!editingNote && (
                      <button
                        ref={noteEditRef}
                        type="button"
                        className={`${styles.noteEdit} t-label-sm`}
                        onClick={startEditingNote}
                      >
                        {entry.note ? "Edit note" : "Add a note"}
                      </button>
                    )}
                  </div>

                  {editingNote ? (
                    <div className={styles.noteEditor}>
                      <TextField
                        autoFocus
                        value={noteDraft}
                        onChange={(e) => setNoteDraft(e.target.value)}
                        /* Enter commits and Escape abandons, which is what a
                           single-line editor owes a keyboard user — there is no
                           form here to submit, so both are wired by hand. */
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            saveNote();
                          } else if (e.key === "Escape") {
                            e.preventDefault();
                            closeNoteEditor();
                          }
                        }}
                        placeholder="Anything worth remembering about today"
                        aria-label="Your note"
                      />

                      <SegmentedToggle
                        actions
                        label="Note"
                        className={styles.noteToggle}
                        options={["Save", "Cancel"]}
                        onChange={(i) => (i === 0 ? saveNote() : closeNoteEditor())}
                      />

                      <p className={`${styles.noteHint} t-caption`}>
                        Saving an empty note removes it from this day.
                      </p>
                    </div>
                  ) : entry.note ? (
                    /* the quotes are the comp's and they are DISPLAY — what the
                       user typed is stored without them */
                    <p className={`${styles.note} t-body3`}>
                      &ldquo;{entry.note}&rdquo;
                    </p>
                  ) : (
                    <p className={`${styles.empty} t-body3`}>
                      No note recorded for this day.
                    </p>
                  )}
                </DataCard>

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

          <DataCard
            className={`${styles.card} ${styles.products}`}
            aria-labelledby="checkin-products"
          >
            <h2 id="checkin-products" className={`${styles.label} t-overline`}>
              Products used
            </h2>

            {products.length > 0 ? (
              <ul className={styles.productList}>
                {products.map((p) => (
                  <li key={p.id} className={styles.product}>
                    <ProductThumb product={p} />
                    <span className={styles.productText}>
                      <span className={`${styles.productName} t-h6`}>
                        {fullName(p)}
                      </span>
                      <span className={`${styles.productMeta} t-label-sm`}>
                        Added {formatAdded(p.addedOn)}
                      </span>
                    </span>
                    <Tag className={styles.productGroup}>
                      {BUCKET_TAG[p.bucket]}
                    </Tag>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${styles.empty} t-body3`}>
                No products recorded for this day.
              </p>
            )}

          </DataCard>

        </>
      )}
    </HubScreen>
  );
}

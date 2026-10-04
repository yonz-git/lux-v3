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
  dayNumber,
  editNote,
  productsForCheckIn,
  progressView,
  severityLabel,
} from "@/features/progress/progress";

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
 * investigation's start. The screen states no fact it does not derive.
 *
 * ⚠️ THE PRODUCT LIST IS READ-ONLY AGAIN, AS OF 4 Oct 2026 — asked for
 * directly ("the x options and add a product are irrelevant here, remove
 * them"). The ✕ on each row, the `Add a product` search under the list and
 * the products tray it opened are gone; the day shows what it shows. The
 * reasoning below is what the editing stood on, kept so a return to it
 * starts from it. `editProductsUsed` still exists in progress.ts, unused here.
 *
 * (was) ⚠️ EXCEPT THE PRODUCT LIST, WHICH THE SCREEN NOW WRITES — and it is the only
 * thing on the record that is editable, deliberately. The other four fields are
 * what you SAID on the day, and a record you can rewrite after the fact is not
 * a record; the product list was never something you said at all. It was
 * derived from `addedOn` — every product in the library by that date — which
 * cannot know that you own a cleanser and did not use it, or that you used
 * something you only entered afterwards. So removing a row and adding one are
 * corrections to a guess the app made, not edits to the user's own answers.
 * `editProductsUsed` owns the write; `productsForCheckIn` decides whether the
 * day still shows the derivation.
 *
 * ⚠️ IT EDITS IN PLACE, WITH NO SAVE — NOT IN FIGMA. There is no edit mode, no
 * pencil and no confirm step: the ✕ on a row and the search field under the
 * list are always there, and every change writes immediately. A mode would put
 * a second state on a card whose whole content is five rows, and a Save button
 * would imply the record could be left half-edited. Same call the check
 * basket makes with its own rows.
 *
 * ⚠️ AND IT ADDS FROM THE LIBRARY, NOT FROM THE CATALOGUE. What the field
 * searches is `ownedProducts` — a day's routine can only hold things you own,
 * and a row here has to carry a real `addedOn` to write its meta line. When
 * nothing you own matches, the panel hands over to the PRODUCTS tray rather
 * than inventing a library entry with a duration nobody answered; whatever the
 * tray adds joins this day. Same handover `/check/new` makes for the same
 * dead end.
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
 *
 * ⚠️ NOTES IS THE THIRD, AND FOR THE SAME REASON — 6 Sep 2026. The note is
 * editable here: `Edit note` swaps the quotation for a `TextField` with
 * Save/Cancel under it, and on a day that recorded none the card still draws,
 * headed by `Add a note`. Both follow the products rule below — a card that
 * carries the control that fills it is not an empty promise — and the write
 * goes through `editNote` in `progress.ts`, which materialises a seeded day's
 * whole record rather than writing a note-only entry over it.
 *
 * ⚠️ AND SAVING AN EMPTY FIELD DELETES THE NOTE, which is the only way to take
 * one back. `CheckIn.note` is optional and every reader tests it for truth, so
 * `editNote` drops the key rather than storing `""` — a stored empty string
 * would draw as a pair of quotation marks with nothing between them. The
 * editor says so in a caption rather than leaving it to be discovered.
 *
 * ⚠️ PRODUCTS USED IS THE SECOND, AND ONLY BECAUSE IT BECAME EDITABLE. The rule
 * above is about a card that says nothing; this one carries the control that
 * fills it, so an empty list is a state the user can leave rather than a
 * promise the record cannot keep — and hiding the card at zero products would
 * take the only way back with it.
 */
export function CheckInDetail({ date, now }: { date: string; now: number }) {
  const { answers, setAnswer } = useInvestigation();
  const view = progressView(answers, useToday(now));
  const day = fromIso(date);
  const records = checkInsFor(answers, view);
  const entry = day ? checkInOn(records, date) : null;

  /* ⚠️ THE DRAFT IS LOCAL AND THE STORE IS NOT WRITTEN UNTIL `Save`. An edit
     that wrote on every keystroke would rewrite the day's record once per
     character and make `Cancel` a promise nothing could keep — there is no undo
     behind it. `editing` is separate from the draft's emptiness because an
     empty draft is a legitimate edit: it is how a note is DELETED. */
  const [editingNote, setEditingNote] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  /* Focus goes back to the control that opened the field, the way `Sheet` puts
     it back — leaving it on a button that just disappeared drops the keyboard
     user at the top of the document.

     ⚠️ IT IS AN EFFECT, NOT A CALL IN THE HANDLER, AND NOT A `requestAnimationFrame`
     EITHER. The button does not exist at the moment `Save` runs — it is
     rendered by the same state change that closes the editor — and measured,
     the rAF version fired before React had committed that render, so
     `noteEditRef.current` was still null and focus fell to `<main>`. The effect
     runs after the commit, which is the only moment the button is there to
     take it. The ref guard keeps it from stealing focus on the first render. */
  const noteEditRef = useRef<HTMLButtonElement>(null);
  const restoreNoteFocus = useRef(false);

  const title = day ? formatDay(day) : "Check-in record";
  /* `Day 4` — the same 1-based count the profile card writes, so the tag and
     "Started … · Day 12" cannot disagree about which day this is. */
  const dayN = day ? dayNumber(view.start, day) : 0;
  /* none on a seeded day from before the start — see `checkInsFor` */
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

  /** ⚠️ SAVING AN EMPTY FIELD DELETES THE NOTE, and `editNote` owns that rule
   *  along with the trimming — see `features/progress/progress.ts`. */
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

  return (
    <HubScreen
      title={title}
      subtitle="Check-in record"
      backHref="/progress"
      action={
        dayTag ? (
          /* ⚠️ A READING, NOT A BUTTON — neutral glass, asked for directly
             1 Oct 2026 ("use a different design as this is not a button"):
             solid indigo is the primary action's colour. It is the trend
             card's `Day 16` pill now. */
          <Tag className={styles.dayTag}>
            {dayTag}
          </Tag>
        ) : undefined
      }
      nav="progress"
      layout="grid"
      /* ⚠️ NOT IN FIGMA — 440, not the comp's 640: the square 392 photo plus
         the card's 24 padding each side, so the photo card hugs the photo. The
         freed width splits in two so symptoms and severity share one row, with
         products spanning both under them. Asked for 13 Sep 2026. */
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
              {/* ⚠️ THE RECORDED ANSWER, VERBATIM — the comp's tags read
                  "Redness" and "Itching", but what turn 2 stores is "Less
                  redness" / "More itching": the symptom AND which way it moved.
                  Dropping the prefix to match the comp would throw away the
                  half of the answer the check-in exists to collect. */}
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
          {/* ⚠️ THE WRAPPER IS NO LONGER CONDITIONAL, BECAUSE NOTES ALWAYS
              RENDERS — see the card below. A day with no photo still has a
              col-1; it holds one card instead of two. */}
          <div className={styles.col1}>
            <DataCard
                  className={`${styles.card} ${styles.notes}`}
                  aria-labelledby="checkin-notes"
                >
                  {/* ⚠️ THE CARD IS DRAWN EVEN WITH NO NOTE ON THE DAY, WHICH IS
                      THE `Products used` EXEMPTION AGAIN — 6 Sep 2026. The rule
                      above ("a card with nothing in it is not drawn") is about a
                      card that can only ever state what the record holds; this
                      one now carries the control that FILLS it, so an empty
                      notes card is a state the user can leave rather than a
                      promise the record cannot keep. Hiding it at zero notes
                      would take the only way to write one with it. */}
                  <div className={styles.cardHead}>
                    <h2
                      id="checkin-notes"
                      className={`${styles.label} t-overline`}
                    >
                      Notes
                    </h2>

                    {!editingNote && (
                      /* ⚠️ A WORD, NOT A PENCIL. The DS has thirteen icons and
                         none of them is an edit glyph (AGENTS.md), and a screen
                         does not get to invent a fourteenth — so the control
                         says what it does. The label switches on whether there
                         is anything to edit, because "Edit" on an empty card
                         offers to change nothing. */
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
                      {/* ⚠️ A `TextField`, NOT A TEXTAREA — the DS has no
                          multi-line input, and the daily check-in collects this
                          same note in this same single-line field. Inventing a
                          textarea here would make the record's editor a
                          different control from the one that wrote the note.
                          Raise a Text Area in Figma. */}
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

                      {/* ⚠️ NOT IN FIGMA — THE PRODUCTS TRAY's SEGMENTED PILL,
                          asked for directly 13 Sep 2026: `Save` is the filled
                          gradient segment and `Cancel` the plain one, where the
                          pair used to be two outlined glass buttons. `actions`
                          keeps them two buttons in a group rather than tabs.
                          ⚠️ `Cancel` IS HONEST HERE, WHERE `Sheet`'s WAS NOT.
                          The tray renamed its dismissal `Done` because every
                          view behind it had already committed; this editor
                          commits nothing until Save, so there is a real edit to
                          abandon. */}
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
                      {/* ⚠️ NOT IN FIGMA — the product's group as a pill after
                          its name, asked for 13 Sep 2026. It is the user's own
                          answer to "how long have you used it?", labelled as
                          the Products hub groups its rows, so the two screens
                          cannot disagree about what a product is: the same
                          groups, as one-word tags (`BUCKET_TAG`). */}
                      <span className={styles.productHead}>
                        <span className={`${styles.productName} t-h6`}>
                          {fullName(p)}
                        </span>
                        <Tag className={styles.productGroup}>
                          {BUCKET_TAG[p.bucket]}
                        </Tag>
                      </span>
                      {/* ⚠️ NOT THE COMP'S "Moisturizer · Applied Morning &
                          Night" — LUX stores neither a category nor a routine
                          time, so both halves of that line would be invented.
                          The size and the date the product entered the library
                          are the two facts it carries, and the date is also
                          why it is on this day's list until someone says
                          otherwise. */}
                      <span className={`${styles.productMeta} t-label-sm`}>
                        {/* no size — it left every title's second line on
                            15 Sep 2026, asked for directly */}
                        Added {formatAdded(p.addedOn)}
                      </span>
                    </span>
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

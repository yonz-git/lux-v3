"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CheckInDetail.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { DataCard } from "@/components/ui/DataCard";
import { SearchField } from "@/components/ui/SearchField";
import { TextField } from "@/components/ui/TextField";
import { Collapse } from "@/components/ui/Collapse";
import { Tag } from "@/components/ui/Tag";
import { CloseIcon, PlusIcon } from "@/components/ui/icons";
import { AddProductMethodSheet } from "@/features/products/components/AddProductMethodSheet";
import SegmentedToggle from "@/features/products/components/SegmentedToggle";
import { ProductThumb } from "@/features/products/components/ProductThumb";
import { CheckInPhotoArt } from "./CheckInPhotoArt";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useSnackbar } from "@/components/layout/Snackbar";
import { useToday } from "@/lib/useToday";
import { useHeldWhileClosing } from "@/lib/useModalDialog";
import { ownedProducts } from "@/lib/demo";
import { formatDay, fromIso } from "@/lib/date";
import {
  BUCKET_LIST_TITLE,
  formatAdded,
  fullName,
  searchProducts,
} from "@/features/products/products";
import {
  SEVERITY_MAX,
  checkInOn,
  checkInDirection,
  checkInsFor,
  dayNumber,
  editNote,
  editProductsUsed,
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
 * ⚠️ EXCEPT THE PRODUCT LIST, WHICH THE SCREEN NOW WRITES — and it is the only
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
  const { show } = useSnackbar();
  const view = progressView(answers, useToday(now));
  const day = fromIso(date);
  const records = checkInsFor(answers, view);
  const entry = day ? checkInOn(records, date) : null;

  /* ⚠️ LOCAL, NOT IN THE STORE. `productQuery` and `checkQuery` are in there
     because the tray and `/check/new` both have to survive a screen changing
     under them — the tray is the one this screen opens, and sharing its key
     would leave the tray opening on a panel of results for a search that
     happened out here. A field that is emptied the moment it is used is not
     state anything else needs. */
  const [query, setQuery] = useState("");
  const [addingManually, setAddingManually] = useState(false);

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
  const dayTag = day ? `Day ${dayNumber(view.start, day)}` : null;

  const products = entry ? productsForCheckIn(answers, entry) : [];

  /* the library is the haystack, minus what the day already lists — a search
     that keeps offering you a product already on the list is offering the one
     thing tapping it cannot do */
  const owned = ownedProducts(answers);
  const listed = new Set(products.map((p) => p.id));
  const searching = query.trim() !== "";
  const matches = searchProducts(owned, query).filter((p) => !listed.has(p.id));
  /* what the results panel shows while it closes — emptying the field is
     what closes it, and that render has already lost the matches */
  const resultsShown = useHeldWhileClosing(searching, { matches, query });

  /** Every edit goes through the module's reducer — see `editProductsUsed` for
   *  why the entry is resolved against the stored list rather than this one. */
  function edit(change: (ids: string[]) => string[]) {
    if (!entry) return;
    setAnswer("checkIns", editProductsUsed(answers, entry, change));
  }

  /**
   * ⚠️ TAKING A PRODUCT OFF A DAY IS UNDOABLE. `checkIns` persists forever, and
   * the record being edited is often a SEEDED one — the first edit materialises
   * the whole day into the store (see `editProductsUsed`), so a mis-tap here
   * both drops a product and freezes the rest of the day's seeded values in
   * place. Restoring the slice as it was undoes both halves of that; undoing the
   * id list alone would leave the day materialised.
   */
  function removeProduct(id: string, name: string) {
    const before = answers.checkIns;
    edit((ids) => ids.filter((x) => x !== id));
    show({
      message: `Removed ${name} from this day`,
      onAction: () => setAnswer("checkIns", before),
    });
  }

  function addProduct(id: string) {
    edit((ids) => (ids.includes(id) ? ids : [...ids, id]));
    /* the field has done its job; leaving the query standing would leave a
       panel open under it listing what you did not pick */
    setQuery("");
  }

  /**
   * The tray writes into `answers.products` itself, so what it added is
   * whatever is in the library that was not there when it opened — the same
   * before/after diff `/check/new` does.
   *
   * ⚠️ THE BASELINE IS `ownedProducts`, NOT THE RAW STORE, and it has to be on
   * this screen: in the demo the raw key is absent, so a raw baseline would
   * read every seeded product as "just added" and drop the whole library onto
   * this one day. `base` is passed to the tray for the mirror-image reason —
   * without it the first add would materialise the store as that single
   * product and wipe the seeded library out from under the list.
   */
  function closeManualAdd(before: string[]) {
    setAddingManually(false);
    const added = ownedProducts(answers)
      .filter((p) => !before.includes(p.id))
      .map((p) => p.id);
    if (added.length > 0) {
      edit((ids) => [...ids, ...added.filter((id) => !ids.includes(id))]);
    }
    setQuery("");
  }

  const ownedIdsWhenOpened = owned.map((p) => p.id);

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
          <Tag variant="brand" className={styles.dayTag}>
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
                          the Products hub titles its rows, so the two screens
                          cannot disagree about what a product is. */}
                      <span className={styles.productHead}>
                        <span className={`${styles.productName} t-h6`}>
                          {fullName(p)}
                        </span>
                        <Tag className={styles.productGroup}>
                          {BUCKET_LIST_TITLE[p.bucket]}
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
                    {/* ⚠️ THE NAME IS IN THE LABEL, NOT JUST THE ROW. Five
                        buttons all reading "Remove" is five identical rows to
                        anyone listening to them rather than looking at them. */}
                    <button
                      type="button"
                      className={styles.remove}
                      aria-label={`Remove ${fullName(p)} from this day`}
                      onClick={() => removeProduct(p.id, fullName(p))}
                    >
                      <CloseIcon className={styles.removeIcon} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${styles.empty} t-body3`}>
                No products recorded for this day.
              </p>
            )}

            {/* ⚠️ THE RESULTS ARE IN FLOW, NOT A FLOATING PANEL. Both the tray
                and `/check/new` hang theirs off the pill; this list is INSIDE a
                data card in a grid column, and an absolutely positioned panel
                there would need its own stacking context on a card that sits
                under the fixed nav. In flow the card simply grows, which is
                what the tray's own dropdown does for the same reason — and
                the list it pushes down is your own five rows, not a page. */}
            <div className={styles.add}>
              <SearchField
                value={query}
                onChange={setQuery}
                placeholder="Add a product"
                label="Add a product to this day"
              />

              {/* the panel below is not a live region and the field's own value
                  says nothing about what matched, so the result of typing is
                  announced here — the same line the tray and /check/new write */}
              <p role="status" aria-live="polite" className="visually-hidden">
                {!searching
                  ? ""
                  : `${matches.length} ${matches.length === 1 ? "product" : "products"} found`}
              </p>

              <Collapse open={searching}>
                <div className={styles.results}>
                  {/* ⚠️ NOT IN FIGMA — a small title over the well, asked for
                      directly 15 Sep 2026: the field searches only what you
                      already own, and the title says so before the rows do */}
                  <h3 className={`${styles.resultsTitle} t-label-sm`}>
                    Your products
                  </h3>
                  {resultsShown.matches.length > 0 ? (
                    <ul className={styles.resultList}>
                      {resultsShown.matches.map((p) => (
                        <li key={p.id}>
                          {/* the whole row is the control, the way the tray's
                              dropdown rows are — a 44 target beside a name you
                              have to aim at is the smaller half of the row */}
                          <button
                            type="button"
                            className={styles.result}
                            onClick={() => addProduct(p.id)}
                          >
                            <ProductThumb product={p} />
                            <span className={styles.resultCopy}>
                              {/* brand-led title, no size under it — 15 Sep 2026 */}
                              <span className={`${styles.resultName} t-h6`}>
                                {fullName(p)}
                              </span>
                            </span>
                            <PlusIcon className={styles.plus} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={`${styles.resultNote} t-body3`}>
                      Nothing in your products matches &ldquo;{resultsShown.query.trim()}
                      &rdquo;.
                    </p>
                  )}

                  {/* ⚠️ OFFERED WHENEVER THE FIELD HAS SOMETHING IN IT, not only
                      when nothing matched. The library is small and the thing
                      you are looking for is often simply not in it yet;
                      revealing the way out only after a search that fails means
                      typing a wrong name to find the right door. */}
                  {/* ⚠️ NOT IN FIGMA — the secondary Button, asked for directly
                      13 Sep 2026; it was a bordered white-label row reading
                      "Add a product you don't own yet" */}
                  <Button
                    variant="secondary"
                    size="md"
                    className={styles.addNew}
                    icon={<PlusIcon />}
                    onClick={() => setAddingManually(true)}
                  >
                    Add a new product
                  </Button>
                </div>
              </Collapse>
            </div>
          </DataCard>

          {/* ⚠️ THE PRODUCTS TRAY, ON A PROGRESS SCREEN — the same handover
              `/check/new` makes, and for the same reason: the alternative is a
              dead end where the product you used is not in the library and
              nothing on the screen can put it there. It portals, so it costs
              the grid above nothing. */}
          <AddProductMethodSheet
            open={addingManually}
            onClose={() => closeManualAdd(ownedIdsWhenOpened)}
            base={owned}
          />
        </>
      )}
    </HubScreen>
  );
}

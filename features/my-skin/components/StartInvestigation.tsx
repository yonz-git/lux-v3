"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./StartInvestigation.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { QuestionPanel } from "./QuestionPanel";
import panel from "./QuestionPanel.module.css";
import { Chip } from "@/components/ui/Chip";
import { SmallButton } from "@/components/ui/SmallButton";
import { TextField } from "@/components/ui/TextField";
import { FaceDiagram, FACE_REGION_IDS } from "./FaceDiagram";
import { Button } from "@/components/ui/Button";
import {
  PlusIcon,
  CloseIcon,
  CameraIcon,
  NoteIcon,
  SuccessCheckIcon,
} from "@/components/ui/icons";
import { SelfieSheet } from "./SelfieSheet";
import { SafetyNotice } from "./SafetyNotice";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import {
  areasOf,
  symptomsOf,
  toggleMulti,
  withAreas,
} from "@/lib/store/answers";
import {
  SYMPTOMS,
  needsProfessionalNotice,
  type Symptom,
} from "@/features/my-skin/safety";

/**
 * 01 + 03b combined — Start investigation and Location on one screen. Step 1/5.
 *
 * ⚠️ THIS IS A PROTOTYPE-ONLY MERGE, NOT YET REFLECTED IN FIGMA. The two
 * questions were separate frames (01 `476:2542`/`476:2670` and 03b
 * `476:2802`/`476:2934`); per the "Figma first" rule this combination needs a
 * matching Figma frame before it is really done. Both frame ids are kept below
 * so the next person can find what each half came from. Location was already
 * moved to immediately follow Start ahead of this merge — see the STEPS
 * comment in `lib/flow.ts`.
 *
 * Symptoms are CHIPS because they are short multi-select labels — that is the
 * documented use for Chip, and it must not be "normalised" to rows.
 *
 * ⚠️ NO CHAT BUBBLE ASKS "Where on your face did this happen?" — on its own
 * screen Location needed the question spelled out, but stacked directly under
 * the symptom picker the face diagram reads as the obvious next thing to fill
 * in. Adding the bubble back here would just repeat what the layout already
 * says.
 *
 * ⚠️ "Take a photo" OPENS AN OVERLAY, IT DOES NOT NAVIGATE — decided here, not
 * in Figma. The selfie capture used to be `/investigation/selfie`, a routed
 * screen that shared this step's number so the track did not move. A sub-step
 * that is really an aside to the question on screen is what the modal tray is
 * for: routing away scrolled the symptoms and regions just picked out of
 * sight, and the capture is one tap. See `components/SelfieSheet.tsx`.
 *
 * ⚠️ THIS SCREEN CARRIES THE APP'S ONLY SAFETY MESSAGE. Ticking `Swelling` or
 * `Rash` — the two symptoms on this screen that appear on the product brief's
 * § 03E trigger list — reveals `SafetyNotice` under the chip grid. It does NOT
 * interrupt the flow and does NOT gate Continue: LUX states what it cannot see
 * and hands the severity judgement to the reader, rather than performing a
 * triage it is not qualified to perform. `features/my-skin/safety.ts` owns the
 * rule, the trigger set and the copy, and carries the full reasoning.
 *
 * ⚠️ THE PLACES ARE ASKED ONE SYMPTOM AT A TIME — NOT IN FIGMA, asked for
 * directly 14 Sep 2026. The chips and the face used to be two independent
 * multi-selects, so the answer could only say "these symptoms, somewhere in
 * these places": the pairing was never collected, so nothing could show it. A
 * symptom and its places are one answer now (`start`, a map — see
 * `lib/store/answers.ts`), and the screen collects them together:
 *
 *   idle      every symptom chip is available; the face shows every place
 *             marked so far, and the rest wait at `opacity/disabled`
 *   placing   the picked chip is lit and EVERY OTHER CHIP IS DISABLED; every
 *             region label shines once, together, and the face takes taps for
 *             this symptom alone; `Save` and `Reset` wake in the pill under
 *             the face card at the first place marked
 *   Save      back to idle, with the symptom still selected
 *   Reset     the symptom's places cleared, the symptom still being placed
 *
 * ⚠️ PLACES ARE WRITTEN AS THEY ARE TAPPED, NOT ON `Save`. `Save` only closes
 * the symptom, so nothing marked is lost to a Continue, a Back or a reload
 * taken mid-symptom, and `isComplete` stays a rule about the ANSWER rather than
 * about this screen's local state. The first place tapped creates the entry and
 * removing the last one deletes it (`withAreas`), so a stored symptom always
 * has somewhere to be. The recap and PROGRESS still read the union
 * (`areasOf`) until they are redrawn to use the pairing.
 *
 * ⚠️ TWO TAPS THE REQUEST DID NOT SPECIFY, DECIDED HERE: tapping the chip being
 * placed DESELECTS it and its places, which is what tapping a lit chip always
 * meant; tapping a chip that is already done REOPENS it, so its places can be
 * changed without starting it again. `Reset` was asked for and its meaning was
 * decided here: it clears the places and KEEPS the symptom open, as though its
 * chip had just been picked with nothing marked — the lit chip already removes the symptom, so a
 * second control doing the same would say nothing new. `Whole face`, `Neck`
 * and `Other` are places of a symptom like any region. The typed description under the card stays ONE
 * sentence for the screen.
 *
 * ⚠️ THE TYPED DESCRIPTION IS CONFIRMED, THEN SHOWN — NOT IN FIGMA, asked for
 * directly 14 Sep 2026. The field carries ✓ before its ✕ (Enter is ✓, Escape is
 * ✕), and a confirmed sentence becomes a frosted row with a pen that reopens
 * the field and a ✕ that still removes it. ✓ on an empty field is ✕: there is
 * nothing to keep. Whether the field is open is local state that starts
 * closed, so a description restored from the store arrives as the confirmed
 * row rather than as an open field.
 *
 * ⚠️ lux-v3 (1 Oct 2026, the canvas boards): THE QUESTION LEADS AGAIN, IN ITS
 * PANEL, AND THE FACE CARD FOLLOWS IT. The panel holds the question, the
 * instruction, the symptom chips and the places row — `Mark where you notice
 * <symptom>` beside `Reset` and `Save`, two small pills where the products
 * tray's three-way pill was. `Reset all` takes the row while no symptom is
 * open. The picked symptom is the app's indigo chip, no longer the rose
 * `bg/symptom` (the canvas drew it indigo; the face's callouts keep the rose).
 * The typed description and `Take a photo` were not on the board and stay,
 * under the face card: they are answers, not decoration.
 *
 * NOTHING starts selected. The Figma frames show options already chosen
 * because a comp has to show a filled-in state; the prototype starts empty and
 * Continue stays disabled until a symptom has at least one place marked.
 *
 */
/* ⚠️ `SYMPTOMS` MOVED TO `features/my-skin/safety.ts` AND THAT IS NOT A TIDY-UP.
   Two of these chips — Swelling and Rash — are the only members of the product
   brief's § 03E trigger list this screen collects, and the safety notice keys
   off them. Kept in two files, renaming a chip here would leave the notice
   quietly never firing again, with nothing in this file to say so. In one file
   the trigger set is typed as a subset of the list and the same rename is a
   compile error. */

const LOCATION_CHIPS = ["Whole face", "Neck", "Other"];

/* how long `Reset all`'s undo stays — the `Snackbar`'s 4s hold */
const UNDO_MS = 4000;

/* ⚠️ AND ITS COPY ASKS ABOUT A PLACE, AS OF 8 Sep 2026. The field read
   `Other – describe in detail` over the placeholder `Describe what's
   happening` — a symptom question sitting under the face diagram, between the
   location chips and the camera, whose answer the recap reads back under
   `Where you noticed it`. Three surfaces, two subjects. The placeholder was the
   odd one out and it predates this screen: 01 (Start investigation) and 03b
   (Location) were separate Figma frames and this field came from the half that
   asked what was happening. It asks where now — `Other, describe where` over
   `Describe where you noticed it` — which is the question the chip beside it
   is an answer to. ⚠️ **The dash went with it**: an en dash in a sentence the
   app says is the one that survived the em-dash sweep, and a comma is what the
   rest of the app's copy uses (the recap's own `Other, in your words` included).

   ⚠️ THE "Other" DESCRIPTION IS AN ANSWER IN THE STORE NOW — `locationOther`,
   changed 8 Sep 2026. It used to be written to a bespoke localStorage key of
   its own, outside `InvestigationProvider`, on the reasoning that a free-text
   note had nowhere else to live; the cost of that was invisible here and
   obvious one screen later. Nothing except this file could read the key, so
   `/investigation/profile` recapped a location answer with the typed part
   silently missing — the user tapped `Other`, said where, and the recap showed
   `Other` and nothing else. It is step 1's answer like every other, so it sits
   with them and expires with them (`FLOW_KEYS`, 24 hours). It still gates
   nothing: `isComplete` asks for a symptom with a place, and a place given only
   in words is that symptom's `Other` chip plus this sentence. */

export function StartInvestigation() {
  const { answers, setAnswer } = useInvestigation();
  const reported = symptomsOf(answers);

  /* the symptom whose places are being marked, or null between symptoms —
     this screen's state, never an answer (see the note at the top) */
  const [placing, setPlacing] = useState<Symptom | null>(null);
  /* a new number each time a symptom opens, to shine the face's labels once */
  const [glint, setGlint] = useState(0);
  const chipsRef = useRef<HTMLDivElement>(null);

  const placingAreas = placing ? (answers.start?.[placing] ?? []) : [];

  /* ⚠️ THE NOTICE FIRES ON THE TAP, NOT ON THE FIRST PLACE. A symptom is only
     stored once it has somewhere to be, but `Swelling` picked and not yet
     placed is already something the reader has told us. */
  const showSafetyNotice = needsProfessionalNotice(
    placing ? [...reported, placing] : reported,
  );

  const tapSymptom = (s: Symptom) => {
    if (placing === s) {
      // the lit chip, tapped again: deselect it, places and all
      setAnswer("start", (prev) => withAreas(prev, s, []));
      setPlacing(null);
      return;
    }
    // a new symptom, or one already done — either way, place it
    setPlacing(s);
    setGlint((n) => n + 1);
  };

  /* ⚠️ `preventScroll`: `Save` and `Reset` sit under the face card now, a
     screen below the chips, and a plain `focus()` scrolled the page up to them */
  const focusChip = (s: Symptom) =>
    requestAnimationFrame(() =>
      chipsRef.current
        ?.querySelectorAll("button")
        [SYMPTOMS.indexOf(s)]?.focus({ preventScroll: true }),
    );

  const finishSymptom = () => {
    const s = placing;
    setPlacing(null);
    /* `Save` closes under the pointer, so hand focus back to the chip it
       finished rather than dropping it on the page */
    if (s) focusChip(s);
  };

  /* clears the places and keeps the symptom open. The pill closes with the
     last place, under the pointer, so focus goes to the still-lit chip. */
  const resetSymptom = () => {
    const s = placing;
    if (!s) return;
    setAnswer("start", (prev) => withAreas(prev, s, []));
    focusChip(s);
  };

  /* ⚠️ `Reset all` — NOT IN FIGMA, asked for directly 14 Sep 2026. Clears
     every symptom and every place and closes the one being placed. The typed
     `Other` description is NOT a selection and stays; it has its own ✕. The
     button disables as it empties.
     ⚠️ AND IT IS UNDOABLE, asked for directly the same day — a snapshot undo,
     like `Remove` on a product: `start` and the symptom being placed are
     captured before the clear and handed back.
     ⚠️ THE UNDO SITS ON THE BUTTON, NOT IN THE APP'S `Snackbar` — asked for
     directly: the page must not move. It is absolutely positioned on
     `Reset all`, so it takes no layout, and focus goes to
     its `Undo` with `preventScroll` rather than up to the chips, which
     scrolled the screen. It holds for `UNDO_MS`, the snackbar's own window. */
  const [undo, setUndo] = useState<{
    id: number;
    start: typeof answers.start;
    placing: Symptom | null;
  } | null>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  /* the row, not the button: `SegmentedToggle` takes no ref, and `Reset all`
     is its third button */
  const resetRef = useRef<HTMLDivElement>(null);
  const nothingSelected = placing === null && reported.length === 0;
  /* `Save` and `Reset` act on the symptom being placed, and only once it has
     a place — the moment the old pill used to open */
  const placeMarked = placing !== null && placingAreas.length > 0;

  const resetAll = () => {
    setUndo({ id: Date.now(), start: answers.start, placing });
    setAnswer("start", undefined);
    setPlacing(null);
    requestAnimationFrame(() => undoRef.current?.focus({ preventScroll: true }));
  };

  const undoReset = () => {
    if (!undo) return;
    setAnswer("start", undo.start);
    setPlacing(undo.placing);
    setUndo(null);
    requestAnimationFrame(() =>
      resetRef.current
        ?.querySelector<HTMLButtonElement>('[role="group"] button:last-child')
        ?.focus({ preventScroll: true }),
    );
  };

  useEffect(() => {
    if (!undo) return;
    const t = window.setTimeout(() => {
      /* the focused control is about to go — keep focus in the card rather
         than dropping it on the page */
      if (document.activeElement === undoRef.current) {
        chipsRef.current
          ?.querySelector("button")
          ?.focus({ preventScroll: true });
      }
      setUndo(null);
    }, UNDO_MS);
    return () => window.clearTimeout(t);
  }, [undo]);

  // "Whole face" is shorthand for every region pill — selecting it fills them
  // all in, clearing it clears them all, rather than being just one more chip.
  // Like every place, it belongs to the symptom being placed.
  const toggleArea = (id: string) => {
    const s = placing;
    if (!s) return;
    setAnswer("start", (prev) => {
      const current = prev?.[s] ?? [];
      const next =
        id !== "Whole face"
          ? toggleMulti(current, id)
          : current.includes("Whole face")
            ? current.filter(
                (v) => v !== "Whole face" && !FACE_REGION_IDS.includes(v),
              )
            : [...new Set([...current, "Whole face", ...FACE_REGION_IDS])];
      return withAreas(prev, s, next);
    });
  };

  const [photoOpen, setPhotoOpen] = useState(false);
  /* whether the description is being typed — local, and closed to begin with,
     so a description restored from the store arrives confirmed */
  const [otherEditing, setOtherEditing] = useState(false);
  const otherText = answers.locationOther ?? "";
  const inputRef = useRef<HTMLInputElement>(null);
  const penRef = useRef<HTMLButtonElement>(null);
  const otherButtonRef = useRef<HTMLButtonElement>(null);

  const otherState = otherEditing
    ? "editing"
    : otherText.trim()
      ? "confirmed"
      : "closed";

  const openOther = () => {
    setOtherEditing(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // ✕ and Esc both mean "never mind" — collapse back to the button and drop
  // whatever was typed, rather than leaving a half-written answer saved behind
  // a closed field.
  const closeOther = () => {
    setOtherEditing(false);
    setAnswer("locationOther", undefined);
    requestAnimationFrame(() => otherButtonRef.current?.focus());
  };

  // ✓ and Enter keep the sentence and show it. An empty field has nothing to
  // keep, so confirming it is closing it.
  const confirmOther = () => {
    if (!otherText.trim()) {
      closeOther();
      return;
    }
    setOtherEditing(false);
    requestAnimationFrame(() => penRef.current?.focus());
  };

  return (
    <QuestionScreen id="start">
      <QuestionPanel
        question="What is currently happening to your skin?"
        hint="For each symptom, select the affected areas in the face diagram."
      >
        {/* the chips and the notice they can reveal are one block: the
            notice brings its own 20 in as it opens (SafetyNotice's `.clip`),
            so it must not also take a slot in the panel's gap while closed */}
        <div>
          <div
            ref={chipsRef}
            className={panel.chips}
            role="group"
            aria-label="What is currently happening to your skin?"
          >
            {SYMPTOMS.map((s) => (
              <Chip
                key={s}
                label={s}
                selected={placing === s || reported.includes(s)}
                disabled={placing !== null && placing !== s}
                onToggle={() => tapSymptom(s)}
              />
            ))}
          </div>

          <SafetyNotice show={showSafetyNotice} />
        </div>

        {/* the places row — only once there is something for it to act on */}
        {(placing || reported.length > 0 || undo) && (
          <div ref={resetRef} className={styles.places}>
            {/* always mounted with the row, so the announcement lands in an
                existing region */}
            <p className="visually-hidden" aria-live="polite">
              {undo ? "Selections cleared" : ""}
            </p>
            {undo ? (
              <div key={undo.id} className={styles.undo}>
                <span className={`${styles.undoMessage} t-body3`}>
                  Selections cleared
                </span>
                <SmallButton
                  ref={undoRef}
                  label="Undo"
                  arrow={false}
                  onClick={undoReset}
                />
              </div>
            ) : (
              <p className={`${styles.placesHint} t-body3`}>
                {placing ? (
                  <>
                    Mark where you notice <b>{placing.toLowerCase()}</b>
                  </>
                ) : (
                  "Tap a symptom to change its places"
                )}
              </p>
            )}
            {!undo && (
              <div className={styles.placesActions} role="group" aria-label="Symptom places">
                {placing ? (
                  <>
                    <SmallButton
                      label="Reset"
                      arrow={false}
                      disabled={!placeMarked}
                      onClick={resetSymptom}
                    />
                    <SmallButton
                      label="Save"
                      variant="primary"
                      arrow={false}
                      disabled={!placeMarked}
                      onClick={finishSymptom}
                    />
                  </>
                ) : (
                  <SmallButton
                    label="Reset all"
                    arrow={false}
                    disabled={nothingSelected}
                    onClick={resetAll}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </QuestionPanel>

      <div className={styles.diagram}>
        <FaceDiagram
          selected={placing ? placingAreas : areasOf(answers)}
          onToggle={toggleArea}
          locationChips={LOCATION_CHIPS}
          disabled={placing === null}
          glint={glint}
          /* ⚠️ THE SAVED SYMPTOMS, AS EDGE PILLS WITH LEADER LINES — NOT IN
             FIGMA, asked for directly 14 Sep 2026; see `layoutCallouts` in
             FaceDiagram.tsx. Hidden while a symptom is being placed, because
             the face then shows that symptom's places alone. The symptom being
             placed is left out rather than hidden with the rest, so its lines
             mount on `Save` and draw in then, not unseen under the fade. */
          callouts={placing ? withAreas(answers.start, placing, []) : answers.start}
          calloutsHidden={placing !== null}
        />
      </div>

      <div className={styles.other}>
        {otherState === "editing" ? (
          <div className={styles.otherFieldWrap}>
            <TextField
              className="reveal-quick"
              ref={inputRef}
              value={otherText}
              placeholder="Describe where you noticed it"
              aria-label="Other, describe where you noticed it"
              style={{ paddingRight: 80 }}
              onChange={(e) => setAnswer("locationOther", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") confirmOther();
                if (e.key === "Escape") closeOther();
              }}
            />
            <div className={styles.otherActions}>
              <button
                type="button"
                className={styles.otherAction}
                aria-label="Confirm description"
                onClick={confirmOther}
              >
                <SuccessCheckIcon className={styles.otherCheckIcon} />
              </button>
              <button
                type="button"
                className={styles.otherAction}
                aria-label="Remove description"
                onClick={closeOther}
              >
                <CloseIcon className={styles.otherActionIcon} />
              </button>
            </div>
          </div>
        ) : otherState === "confirmed" ? (
          <div className={styles.otherConfirmed}>
            <p className={`${styles.otherConfirmedText} t-body2`}>{otherText}</p>
            <div className={styles.otherActions}>
              <button
                ref={penRef}
                type="button"
                className={styles.otherAction}
                aria-label="Edit description"
                onClick={openOther}
              >
                <NoteIcon className={styles.otherActionIcon} />
              </button>
              <button
                type="button"
                className={styles.otherAction}
                aria-label="Remove description"
                onClick={closeOther}
              >
                <CloseIcon className={styles.otherActionIcon} />
              </button>
            </div>
          </div>
        ) : (
          <button
            ref={otherButtonRef}
            type="button"
            className={styles.otherButton}
            onClick={openOther}
          >
            <PlusIcon />
            <span className={`${styles.otherLabel} t-body2`}>
              Other, describe where
            </span>
          </button>
        )}
      </div>

      <Button
        variant="secondary"
        size="md"
        onClick={() => setPhotoOpen(true)}
        icon={<CameraIcon />}
        className={styles.takePhoto}
      >
        Take a photo
      </Button>

      <SelfieSheet open={photoOpen} onClose={() => setPhotoOpen(false)} />
    </QuestionScreen>
  );
}

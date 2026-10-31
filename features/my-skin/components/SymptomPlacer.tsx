"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
/* ⚠️ THE STYLES ARE STEP 1's, AND STAY IN ITS MODULE. The placer was lifted out
   of `StartInvestigation` on 29 Oct 2026 so the profile recap could edit the
   same answers with the same controls; moving the classes too would have meant
   restating a hundred lines of chip, pill and undo recipes in a second module. */
import styles from "./StartInvestigation.module.css";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";
import { TextField } from "@/components/ui/TextField";
import { FaceDiagram, FACE_REGION_IDS } from "./FaceDiagram";
import {
  PlusIcon,
  CloseSmallIcon,
  NoteIcon,
  SuccessCheckIcon,
  ResetIcon,
} from "@/components/ui/icons";
import { SafetyNotice } from "./SafetyNotice";
import { SymptomSummary } from "./SymptomSummary";
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

const LOCATION_CHIPS = ["Whole face", "Neck", "Other"];

/* how long the reset's undo stays — the `Snackbar`'s 4s hold */
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

/**
 * The symptom and place controls — the face card, the symptom chips, the safety
 * notice, the ↺ reset in the face card's corner and the typed `Other`
 * description. Step 1 and the profile
 * recap's `Edit` both draw it, so an answer is changed with the same controls
 * that gave it. Everything about how it behaves is in `StartInvestigation.tsx`'s
 * doc comment; it writes to the store as it is tapped.
 */
export function SymptomPlacer({
  describedBy,
  summary = false,
}: {
  describedBy?: string;
  /** the running list of symptoms and places, under the face card — step 1's */
  summary?: boolean;
}) {
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

  /* ⚠️ NO `Save`, NO `Reset` — usability testing, 29 Oct 2026. Every tap is
     already written as it happens, so a symptom is saved the moment it has a
     place and unsaved by tapping it again. Picking another chip just moves
     the placing to it; the one left behind keeps its places. */
  const tapSymptom = (s: Symptom) => {
    if (placing === s) {
      // the lit chip, tapped again: deselect it, places and all
      setAnswer("start", (prev) => withAreas(prev, s, []));
      setPlacing(null);
      return;
    }
    // a new symptom, or one already marked — either way, place it
    setPlacing(s);
    setGlint((n) => n + 1);
  };

  /* ⚠️ `Reset all` — NOT IN FIGMA, asked for directly 14 Sep 2026. Clears
     every symptom and every place and closes the one being placed. The typed
     `Other` description is NOT a selection and stays; it has its own ✕. The
     button fades out as it empties.
     ⚠️ IT IS A ↺ IN THE FACE CARD'S TOP-RIGHT CORNER as of 30 Oct 2026, asked
     for directly — it was a `Reset all` pill under the card. Its accessible
     name keeps the words.
     ⚠️ AND IT IS UNDOABLE, asked for directly the same day — a snapshot undo,
     like `Remove` on a product: `start` and the symptom being placed are
     captured before the clear and handed back.
     ⚠️ THE UNDO SITS ON THE BUTTON, NOT IN THE APP'S `Snackbar` — asked for
     directly: the page must not move. It is absolutely positioned on
     the ↺, so it takes no layout, and focus goes to
     its `Undo` with `preventScroll` rather than up to the chips, which
     scrolled the screen. It holds for `UNDO_MS`, the snackbar's own window. */
  const [undo, setUndo] = useState<{
    id: number;
    start: typeof answers.start;
    placing: Symptom | null;
  } | null>(null);
  const undoRef = useRef<HTMLButtonElement>(null);
  /* the corner, not the button: `IconButton` takes no ref */
  const resetRef = useRef<HTMLDivElement>(null);
  const nothingSelected = placing === null && reported.length === 0;

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
        ?.querySelector<HTMLButtonElement>("button")
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
    <>
      {/* ⚠️ THE SYMPTOM CHIPS SIT UNDER THE FACE, NOT UNDER THE QUESTION —
          asked for directly 14 Sep 2026: the face card leads, and the chips
          sit right above the face card that acts on them. `SafetyNotice` moves with them, because it reveals under the
          chip grid (safety.ts). NOT IN FIGMA. */}
      <div
        ref={chipsRef}
        className={styles.chips}
        /* the chips arrive one by one (app/vidgen.css, "THE RISE ENTRANCE") */
        data-motion="rise"
        role="group"
        aria-label="What is currently happening to your skin?"
        aria-describedby={describedBy}
      >
        {SYMPTOMS.map((s) => (
          <Chip
            key={s}
            label={s}
            selected={placing === s || reported.includes(s)}
            /* the lit chip is the one the face is taking taps for; the rest
               that are marked step back, so it is clear which is on */
            muted={placing !== s}
            onToggle={() => tapSymptom(s)}
          />
        ))}
      </div>

      <SafetyNotice show={showSafetyNotice} />

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
          corner={
            <div
              ref={resetRef}
              className={styles.reset}
              data-undo={undo ? "" : undefined}
            >
              {/* always mounted, so the announcement lands in an existing region */}
              <p className="visually-hidden" aria-live="polite">
                {undo ? "Selections cleared" : ""}
              </p>
              {undo && (
                <div key={undo.id} className={styles.undo}>
                  <span className={`${styles.undoMessage} t-label-sm`}>
                    Selections cleared
                  </span>
                  <button
                    ref={undoRef}
                    type="button"
                    className={`${styles.undoAction} t-label pressable`}
                    onClick={undoReset}
                  >
                    Undo
                  </button>
                </div>
              )}
              <IconButton
                size="sm"
                label="Reset all selections"
                className={styles.resetButton}
                disabled={nothingSelected}
                onClick={resetAll}
              >
                <ResetIcon />
              </IconButton>
            </div>
          }
        />
      </div>

      {summary && (
        <SymptomSummary />
      )}

      <div
        className={styles.other}
        data-motion="rise-self"
        style={{ "--rise-delay": "260ms" } as CSSProperties}
      >
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
                <CloseSmallIcon className={styles.otherActionRing} />
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
                <CloseSmallIcon className={styles.otherActionRing} />
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
    </>
  );
}

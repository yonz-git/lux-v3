"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
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

  const [placing, setPlacing] = useState<Symptom | null>(null);
  /* a new number each time a symptom opens, to shine the face's labels once */
  const [glint, setGlint] = useState(0);
  const chipsRef = useRef<HTMLDivElement>(null);

  const placingAreas = placing ? (answers.start?.[placing] ?? []) : [];

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
    // a new symptom, or one already marked — either way, place it
    setPlacing(s);
    setGlint((n) => n + 1);
  };

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
      <div
        ref={chipsRef}
        className={styles.chips}
        /* the chips arrive one by one (app/globals.css, "THE RISE ENTRANCE") */
        data-motion="rise"
        role="group"
        aria-label="What is currently happening to your skin?"
        aria-describedby={describedBy}
      >
        {SYMPTOMS.map((s) => (
          <Chip
            key={s}
            label={s}
            size="small"
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
                size="md"
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
              <IconButton
                size="xs"
                label="Confirm description"
                onClick={confirmOther}
              >
                <SuccessCheckIcon className={styles.otherCheckIcon} />
              </IconButton>
              <IconButton
                size="xs"
                label="Remove description"
                onClick={closeOther}
              >
                <CloseSmallIcon />
              </IconButton>
            </div>
          </div>
        ) : otherState === "confirmed" ? (
          <div className={styles.otherConfirmed}>
            <p className={`${styles.otherConfirmedText} t-body2`}>{otherText}</p>
            <div className={styles.otherActions}>
              <IconButton
                ref={penRef}
                size="xs"
                label="Edit description"
                onClick={openOther}
              >
                <NoteIcon className={styles.otherActionIcon} />
              </IconButton>
              <IconButton
                size="xs"
                label="Remove description"
                onClick={closeOther}
              >
                <CloseSmallIcon />
              </IconButton>
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

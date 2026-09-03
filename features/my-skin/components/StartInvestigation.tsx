"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./StartInvestigation.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { FaceDiagram, FACE_REGION_IDS } from "./FaceDiagram";
import { Button } from "@/components/ui/Button";
import { PlusIcon, CloseIcon, CameraIcon } from "@/components/ui/icons";
import { SelfieSheet } from "./SelfieSheet";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { toggleMulti } from "@/lib/store/answers";

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
 * NOTHING starts selected. The Figma frames show options already chosen
 * because a comp has to show a filled-in state; the prototype starts empty and
 * Continue stays disabled until a symptom AND a location are both picked.
 *
 * ⚠️ `gapBeforeContinue` IS 48, NOT THE COMP'S 104. Figma 476:2670 draws an
 * extra spacer above Continue, but 957 and 900 are fixed canvases and that
 * spacer is an artefact of them (AGENTS.md, "translate, don't transcribe").
 * Measured at 1600x868: the 104 put Continue at y 1002 and the card's bottom
 * edge off-screen too, so a laptop user saw neither the primary action nor any
 * cue that one existed below the fold. 48 is the card's own between-block gap
 * and is on the spacing scale, which 104 never was.
 */
const SYMPTOMS = [
  "Redness",
  "Itching",
  "Dryness",
  "Breakouts",
  "Irritation",
  "Swelling",
  "Flaking",
  "Rash",
];

const LOCATION_CHIPS = ["Whole face", "Neck", "Other"];

/**
 * ⚠️ SCOPED, DELIBERATE EXCEPTION to "do not persist the answer store"
 * (AGENTS.md). The free-text "Other" description has nowhere else to live yet
 * — there is no backend — so it is saved to localStorage on its own, outside
 * InvestigationProvider. It does not gate Continue and is not read by any
 * other step. This is a stopgap; a real backend should own it instead.
 */
const OTHER_STORAGE_KEY = "lux-start-other-description";

export function StartInvestigation() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.start ?? [];
  const location = answers.location ?? [];
  // "Whole face" is shorthand for every region pill — selecting it fills them
  // all in, clearing it clears them all, rather than being just one more chip.
  const toggleLocation = (id: string) =>
    setAnswer("location", (prev) => {
      const current = prev ?? [];
      if (id === "Whole face") {
        const turningOn = !current.includes("Whole face");
        return turningOn
          ? [...new Set([...current, "Whole face", ...FACE_REGION_IDS])]
          : current.filter(
              (v) => v !== "Whole face" && !FACE_REGION_IDS.includes(v),
            );
      }
      return toggleMulti(current, id);
    });

  const [photoOpen, setPhotoOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);
  const [otherText, setOtherText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // localStorage isn't available during SSR — hydrate after mount so a saved
  // description reopens the field instead of staying hidden behind the button.
  useEffect(() => {
    const saved = window.localStorage.getItem(OTHER_STORAGE_KEY);
    if (saved) {
      setOtherText(saved);
      setOtherOpen(true);
    }
  }, []);

  const openOther = () => {
    setOtherOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // the X button and Esc both mean "never mind" — collapse back to the button
  // and drop whatever was typed, rather than leaving a half-written answer
  // saved behind a closed field.
  const closeOther = () => {
    setOtherOpen(false);
    setOtherText("");
    window.localStorage.removeItem(OTHER_STORAGE_KEY);
  };

  const handleOtherChange = (value: string) => {
    setOtherText(value);
    if (value) {
      window.localStorage.setItem(OTHER_STORAGE_KEY, value);
    } else {
      window.localStorage.removeItem(OTHER_STORAGE_KEY);
    }
  };

  return (
    <QuestionScreen id="start" gapBeforeContinue={48}>
      {/* ⚠️ AN `<h2>`, NOT AN `<h1>` — the step's own title is the page's one
          `<h1>`, rendered by `QuestionScreen` (visually hidden here). This is a
          question WITHIN that step, so it is a level down. Marking both as
          `<h1>` gave a screen reader two — on `skin-type`, three — peer page
          titles with nothing saying the questions belong to the step. The
          `t-h4-h3` class carries every visual property, so the tag change moves
          nothing on screen. */}
      <h2 className={`${styles.question} t-h4-h3`}>
        What is currently happening to your skin?
      </h2>

      <div
        className={styles.chips}
        role="group"
        aria-label="What is currently happening to your skin?"
      >
        {SYMPTOMS.map((s) => (
          <Chip
            key={s}
            label={s}
            selected={selected.includes(s)}
            onToggle={() =>
              setAnswer("start", (prev) => toggleMulti(prev ?? [], s))
            }
          />
        ))}
      </div>

      <div className={styles.diagram}>
        <FaceDiagram
          selected={location}
          onToggle={toggleLocation}
          locationChips={LOCATION_CHIPS}
        />
      </div>

      <div className={styles.other}>
        {otherOpen ? (
          <div className={styles.otherFieldWrap}>
            <TextField
              className="reveal-quick"
              ref={inputRef}
              value={otherText}
              placeholder="Describe what's happening"
              aria-label="Other – describe in detail"
              style={{ paddingRight: 52 }}
              onChange={(e) => handleOtherChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Escape") closeOther();
              }}
            />
            <button
              type="button"
              className={styles.otherClear}
              aria-label="Remove description"
              onClick={closeOther}
            >
              <CloseIcon className={styles.otherClearIcon} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={styles.otherButton}
            onClick={openOther}
          >
            <PlusIcon />
            <span className={`${styles.otherLabel} t-body2`}>
              Other – describe in detail
            </span>
          </button>
        )}
      </div>

      <Button
        variant="secondary"
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

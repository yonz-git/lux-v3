"use client";

import { useRef, useState } from "react";
import styles from "./StartInvestigation.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { Chip } from "@/components/ui/Chip";
import { TextField } from "@/components/ui/TextField";
import { FaceDiagram, FACE_REGION_IDS } from "./FaceDiagram";
import { Button } from "@/components/ui/Button";
import { PlusIcon, CloseIcon, CameraIcon } from "@/components/ui/icons";
import { SelfieSheet } from "./SelfieSheet";
import { SafetyNotice } from "./SafetyNotice";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { toggleMulti } from "@/lib/store/answers";
import { SYMPTOMS, needsProfessionalNotice } from "@/features/my-skin/safety";

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
/* ⚠️ `SYMPTOMS` MOVED TO `features/my-skin/safety.ts` AND THAT IS NOT A TIDY-UP.
   Two of these chips — Swelling and Rash — are the only members of the product
   brief's § 03E trigger list this screen collects, and the safety notice keys
   off them. Kept in two files, renaming a chip here would leave the notice
   quietly never firing again, with nothing in this file to say so. In one file
   the trigger set is typed as a subset of the list and the same rename is a
   compile error. */

const LOCATION_CHIPS = ["Whole face", "Neck", "Other"];

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
   nothing: `isComplete` for this step asks for a symptom and a location. */

export function StartInvestigation() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.start ?? [];
  const location = answers.location ?? [];
  const showSafetyNotice = needsProfessionalNotice(selected);
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
  const otherText = answers.locationOther ?? "";
  const inputRef = useRef<HTMLInputElement>(null);

  /* ⚠️ THE FIELD IS OPEN IF IT WAS OPENED **OR** IF THERE IS AN ANSWER IN IT,
     and the second half is what replaces the old hydrate-on-mount effect. The
     store fills in from localStorage in an effect of its own (never in a
     `useState` initialiser — that is the hydration mismatch), so a description
     from an earlier visit arrives one render after this one. Deriving the
     revealed state from the answer means it appears the moment it exists,
     rather than needing a second piece of state kept in step with it. */
  const otherRevealed = otherOpen || otherText.length > 0;

  const openOther = () => {
    setOtherOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  // the X button and Esc both mean "never mind" — collapse back to the button
  // and drop whatever was typed, rather than leaving a half-written answer
  // saved behind a closed field.
  const closeOther = () => {
    setOtherOpen(false);
    setAnswer("locationOther", undefined);
  };

  return (
    <QuestionScreen id="start" gapBeforeContinue={48} tightTop>
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

      <SafetyNotice show={showSafetyNotice} />

      <div className={styles.diagram}>
        <FaceDiagram
          selected={location}
          onToggle={toggleLocation}
          locationChips={LOCATION_CHIPS}
        />
      </div>

      <div className={styles.other}>
        {otherRevealed ? (
          <div className={styles.otherFieldWrap}>
            <TextField
              className="reveal-quick"
              ref={inputRef}
              value={otherText}
              placeholder="Describe where you noticed it"
              aria-label="Other, describe where you noticed it"
              style={{ paddingRight: 52 }}
              onChange={(e) => setAnswer("locationOther", e.target.value)}
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

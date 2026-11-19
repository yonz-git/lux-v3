"use client";

import { type CSSProperties, useId, useState } from "react";
import styles from "./StartInvestigation.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { SymptomPlacer } from "./SymptomPlacer";
import { Button } from "@/components/ui/Button";
import { CoachBubble } from "@/components/ui/CoachBubble";
import { CameraIcon } from "@/components/ui/icons";
import { SelfieSheet } from "./SelfieSheet";

/** 01 + 03b combined — Start investigation and Location on one screen. Step 1/5. */

export function StartInvestigation() {
  const instructionId = useId();
  const [photoOpen, setPhotoOpen] = useState(false);

  return (
    <QuestionScreen
      id="start"
      gapBeforeContinue={80}
      gapBeforeContinueMobile={56}
      contentTop={8}
      tightTop
    >
      <h2 className={`${styles.question} t-h4-h3`}>
        What is currently happening to your skin?
      </h2>

      <CoachBubble className={styles.coach} bubbleClassName={styles.coachBubble}>
        <span id={instructionId}>
          Pick a symptom, then tap where it shows on your face.
        </span>
      </CoachBubble>

      <SymptomPlacer describedBy={instructionId} summary />

      <Button
        variant="secondary"
        size="md"
        onClick={() => setPhotoOpen(true)}
        icon={<CameraIcon />}
        className={styles.takePhoto}
        data-motion="rise-self"
        style={{ "--rise-delay": "320ms" } as CSSProperties}
      >
        Take a photo
      </Button>

      <SelfieSheet open={photoOpen} onClose={() => setPhotoOpen(false)} />
    </QuestionScreen>
  );
}

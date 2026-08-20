"use client";

import styles from "./SelfieCapture.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { useInvestigation } from "./InvestigationProvider";

/**
 * 03b — Selfie capture. Figma mobile 487:834, desktop 490:1041.
 *
 * SHARES step 6 with Location — it is a sub-step reached from "Take a photo",
 * so the progress track does not advance.
 *
 * ⚠️ THE DESIGN SYSTEM HAS NO SHUTTER COMPONENT — the control is composed from
 * tokens in Figma and again here. If a second capture surface ever appears,
 * make it a real component first.
 *
 * The viewfinder is a placeholder, not a live camera: wiring getUserMedia would
 * make the prototype demand a camera permission just to walk the flow. Tapping
 * the shutter records that a capture happened, which is what unlocks Continue.
 */
export function SelfieCapture() {
  const { answers, setAnswer } = useInvestigation();
  const captured = Boolean(answers.selfie);

  return (
    <QuestionScreen id="selfie">
      <ChatBubble from="ai" full>
        Take a photo of the affected area.
      </ChatBubble>

      <div className={styles.viewfinder} data-captured={captured}>
        <span className={styles.guide} aria-hidden="true" />
        {captured && <p className={`${styles.captured} t-label`}>Photo captured</p>}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.shutter}
          aria-label={captured ? "Retake photo" : "Capture photo"}
          onClick={() => setAnswer("selfie", captured ? undefined : "captured")}
        >
          <span className={styles.shutterCore} aria-hidden="true" />
        </button>
        <p className={`${styles.helper} t-body3`}>
          {captured
            ? "Tap the shutter again to retake."
            : "Position your face in the oval and tap to capture."}
        </p>
      </div>
    </QuestionScreen>
  );
}

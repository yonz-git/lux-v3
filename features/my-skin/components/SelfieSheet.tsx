"use client";

import styles from "./SelfieSheet.module.css";
import { Sheet } from "@/components/ui/Sheet";
import { SuccessCheckIcon } from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";

/** 03b — Selfie capture. Figma mobile 487:834, desktop 490:1041. */
export function SelfieSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { answers, setAnswer } = useInvestigation();
  const captured = Boolean(answers.selfie);
  const title = "Take a photo of the affected area.";

  return (
    <Sheet open={open} onClose={onClose} title={title} className={styles.tray}>
      {/* `Sheet` uses the title for its aria-label only, so the visible
          heading is rendered here — WHITE-on-sage `text/on-data`, as every
          other thing inside the tray is. */}
      <h2 className={`${styles.question} t-h6`}>{title}</h2>

      <div className={styles.viewfinder} data-captured={captured}>
        <span className={styles.guide} aria-hidden="true" />
        {captured && (
          /* keyed on the capture so a RETAKE re-mounts this line: it replays
             `reveal-quick` and is announced again, where an unchanged node
             would report nothing and look like a dead shutter */
          <p
            key={answers.selfie}
            role="status"
            className={`${styles.captured} reveal-quick t-label`}
          >
            {/* the tick draws itself on — `.tick-draw` in globals.css — and
                replays on a retake, since the key re-mounts the line */}
            <SuccessCheckIcon className={`${styles.capturedIcon} tick-draw`} />
            Photo captured
          </p>
        )}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.shutter}
          aria-label={captured ? "Retake photo" : "Capture photo"}
          onClick={() => setAnswer("selfie", `captured-${Date.now()}`)}
        >
          <span className={styles.shutterCore} aria-hidden="true" />
        </button>
        <p className={`${styles.helper} t-body3-body2`}>
          {captured
            ? "Tap the shutter again to retake."
            : "Position your face in the oval and tap to capture."}
        </p>
      </div>
    </Sheet>
  );
}

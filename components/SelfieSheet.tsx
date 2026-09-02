"use client";

import styles from "./SelfieSheet.module.css";
import { Sheet } from "./Sheet";
import { useInvestigation } from "./InvestigationProvider";

/**
 * 03b — Selfie capture. Figma mobile 487:834, desktop 490:1041.
 *
 * ⚠️ IT IS AN OVERLAY NOW, NOT A ROUTE — DECIDED HERE, NOT IN FIGMA. It was
 * `/investigation/selfie`, a full screen carrying its own progress track and
 * `Save & exit` while explicitly SHARING step 1's number — a "step" that never
 * moved the track, on the main line of a flow it was an optional side path off.
 * Two things went wrong in practice: leaving step 1 to take a photo meant the
 * symptoms and face regions just picked scrolled away behind a screen that
 * says nothing about them, and coming back was a navigation rather than a
 * dismissal. The photo is one tap on a placeholder viewfinder — an aside to
 * the question on screen, which is exactly what the modal tray is for.
 *
 * So it is the SAME recipe as the PRODUCTS scan view: `Sheet`'s sage tray,
 * the viewfinder inside it, `Done` as the only way out. Every treatment below
 * is the frame's own — the 392x400 / 420x340 viewfinder, the portrait oval,
 * the 72 shutter — only the container changed. The `selfie` step is gone from
 * `lib/flow.ts` with the route; the answer it writes is unchanged.
 *
 * ⚠️ THE DESIGN SYSTEM HAS NO SHUTTER COMPONENT — the control is composed from
 * tokens in Figma and again here. A third capture surface DID appear (the daily
 * check-in's photo overlay), so `components/CameraCapture.tsx` now exists and
 * the products scan view uses it. This screen deliberately does NOT: 487:834 /
 * 490:1041 give it a larger viewfinder (392x400 / 420x340), a PORTRAIT oval
 * rather than a landscape rectangle, a 72 shutter rather than 64, and the helper
 * BELOW the shutter rather than above. Those are measurements off its own frame,
 * not drift — folding it in would move them. See the note on `CameraCapture`.
 *
 * The viewfinder is a placeholder, not a live camera: wiring getUserMedia would
 * make the prototype demand a camera permission just to walk the flow. Tapping
 * the shutter records that a capture happened.
 */
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
    <Sheet open={open} onClose={onClose} title={title}>
      {/* `Sheet` uses the title for its aria-label only, so the visible
          heading is rendered here — WHITE-on-sage `text/on-data`, as every
          other thing inside the tray is. */}
      <h2 className={`${styles.question} t-h6`}>{title}</h2>

      <div className={styles.viewfinder} data-captured={captured}>
        <span className={styles.guide} aria-hidden="true" />
        {captured && (
          <p role="status" className={`${styles.captured} reveal-quick t-label`}>
            Photo captured
          </p>
        )}
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
        <p className={`${styles.helper} t-body3-body2`}>
          {captured
            ? "Tap the shutter again to retake."
            : "Position your face in the oval and tap to capture."}
        </p>
      </div>
    </Sheet>
  );
}

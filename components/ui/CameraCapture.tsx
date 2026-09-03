"use client";

import styles from "./CameraCapture.module.css";

/**
 * The viewfinder + shutter block, shared by every capture surface in the app.
 *
 * ⚠️ EXTRACTED BECAUSE A THIRD ONE APPEARED, WHICH IS WHAT THE CODE ASKED FOR.
 * `SelfieCapture` has carried this note since it was written: "the design
 * system has no shutter component — the control is composed from tokens in
 * Figma and again here. If a second capture surface ever appears, make it a
 * real component first." It appeared (the products tray's scan view), then a
 * third (the daily check-in's photo overlay). This is that component.
 *
 * ⚠️ IT IS STILL NOT IN THE DESIGN SYSTEM. Figma composes each viewfinder and
 * each shutter from tokens, with no component behind them, so this is one
 * definition on the code side rather than a port. **Raise a real Camera /
 * Shutter component in Figma** — until then the two files can still drift.
 *
 * ⚠️ THE VIEWFINDER IS LIGHT `surface/data`, EVEN INSIDE THE SAGE TRAY. That is
 * what both existing surfaces draw, and it is why `text/on-data` had to be
 * darkened globally rather than exempted for "dark placeholders" — see the
 * contrast note in AGENTS.md, which names both of these as the measurement that
 * disproved the dark-viewfinder assumption.
 *
 * The camera is a PLACEHOLDER on purpose and always has been: wiring
 * `getUserMedia` would make the prototype demand a camera permission just to
 * walk a flow. Tapping the shutter records only THAT a capture happened.
 *
 * ⚠️ `SelfieSheet` DOES NOT USE THIS, and that is a measurement decision rather
 * than an oversight. It is now a tray like the other two, but 487:834 / 490:1041
 * give it its own geometry — a 392x400 / 420x340 viewfinder against this one's
 * 392x300, a PORTRAIT oval guide against a landscape rectangle, and a 72 shutter
 * against 64 — and it puts the helper BELOW the shutter where this puts it
 * above. Folding it in would mean either parameterising every one of those or
 * quietly moving the selfie frame off its measurements. **Settle it in Figma
 * with a real Camera / Shutter component**, then migrate all three at once.
 */
export function CameraCapture({
  captured,
  title,
  helper,
  onCapture,
}: {
  captured: boolean;
  /** what to point the camera at */
  title: string;
  /** the line under it, which should change once a photo exists */
  helper: string;
  onCapture: () => void;
}) {
  return (
    <>
      <div className={styles.viewfinder} data-captured={captured}>
        <span className={styles.guide} aria-hidden="true" />
        {captured && (
          <p role="status" className={`${styles.captured} reveal-quick t-label`}>
            Photo captured
          </p>
        )}
      </div>

      <div className={styles.copy}>
        <p className="t-h6">{title}</p>
        <p className={`${styles.helper} t-body3`}>{helper}</p>
      </div>

      <div className={styles.shutterRow}>
        <button
          type="button"
          className={styles.shutter}
          aria-label={captured ? "Retake photo" : "Capture photo"}
          onClick={onCapture}
        >
          <span className={styles.shutterCore} aria-hidden="true" />
        </button>
      </div>
    </>
  );
}

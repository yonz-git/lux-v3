"use client";

import styles from "./CameraCapture.module.css";
import { SuccessCheckIcon } from "./icons";

/** The viewfinder + shutter block, shared by every capture surface in the app. */
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
            <SuccessCheckIcon className={`${styles.capturedIcon} tick-draw`} />
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

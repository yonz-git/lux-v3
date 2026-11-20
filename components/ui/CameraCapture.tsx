"use client";

import type { ReactNode } from "react";
import styles from "./CameraCapture.module.css";
import { SuccessCheckIcon } from "./icons";

/** The viewfinder + shutter block, shared by every capture surface in the app. */
export function CameraCapture({
  captured,
  title,
  helper,
  onCapture,
  aside,
}: {
  captured: boolean;
  /** what to point the camera at; leave it out when the helper says enough */
  title?: string;
  /** the line under it, which should change once a photo exists */
  helper: string;
  onCapture: () => void;
  /** a round control at the copy's right, centred on the copy's first line.
   *  The same width is kept free on the left, so the copy stays centred. */
  aside?: ReactNode;
}) {
  const copy = (
    <div className={styles.copy}>
      {title && <p className="t-h6">{title}</p>}
      <p className={`${styles.helper} t-body3`}>{helper}</p>
    </div>
  );

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

      {aside ? (
        <div className={styles.copyRow}>
          {copy}
          {/* takes the first line's type role, so its centring maths reads
              that line's metrics */}
          <div className={`${styles.aside} ${title ? "t-h6" : "t-body3"}`}>{aside}</div>
        </div>
      ) : (
        copy
      )}

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

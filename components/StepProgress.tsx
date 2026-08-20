import styles from "./StepProgress.module.css";
import { TOTAL_STEPS } from "@/lib/flow";

/**
 * The step-progress track — Figma `progress` (4px tall, never 2 or 3).
 *
 * Track = border/subtle, fill = bg/brand, both fully rounded. The fill width is
 * step / TOTAL_STEPS, so the track can never drift out of sync with the flow
 * the way a hardcoded percentage would.
 *
 * It renders as a real progressbar rather than two divs, so assistive tech
 * announces position in the flow.
 */
export function StepProgress({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100;
  return (
    <div
      className={styles.track}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={TOTAL_STEPS}
      aria-valuenow={step}
      aria-valuetext={`Step ${step} of ${TOTAL_STEPS}`}
    >
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}

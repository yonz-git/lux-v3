import Link from "next/link";
import styles from "./ScreenHeader.module.css";
import { ArrowLeftIcon } from "@/components/ui/icons";

/**
 * The onboarding header — the order is fixed and is enforced by QuestionScreen:
 *   1. this row: the back chevron, LEFT
 *   2. a 12px spacer
 *   3. the step-progress track
 *   4. a spacer, then the content
 * The track goes UNDER the header row, never above it — it is a readout of
 * where you are, so it reads after the controls.
 *
 * ⚠️ THE BACK CONTROL IS A HEADER CHEVRON. There is no footer "Back" button at
 * any breakpoint: one predictable location beats a control that moves, the
 * footer holds exactly one primary action, and top-left back matches the
 * platform gesture.
 *
 * ⚠️ `Save & exit` IS GONE, 4 Oct 2026 — asked for directly ("remove save and
 * exit"). It sat at the right of this row on every flow step. It promised a
 * resumability the app does not have (answers last a day in one browser, see
 * AGENTS.md "PERSISTENCE"), and every step already keeps its answers as they
 * are given, so leaving by the nav loses nothing it would have saved. A flow
 * step is now told from a hub by its progress track alone.
 */
export function ScreenHeader({ backHref }: { backHref: string }) {
  return (
    <div className={styles.row}>
      <Link href={backHref} className={`${styles.back} pressable`} aria-label="Back">
        <ArrowLeftIcon />
      </Link>
    </div>
  );
}

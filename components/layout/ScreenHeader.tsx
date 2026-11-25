import styles from "./ScreenHeader.module.css";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { IconButton } from "@/components/ui/IconButton";

/**
 * The onboarding header — the order is fixed and is enforced by QuestionScreen:
 *   1. this row: the back chevron, LEFT
 *   2. a 12px spacer
 *   3. the step-progress track
 *   4. a spacer, then the content
 * The track goes UNDER the header row, never above it — it is a readout of
 * where you are, so it reads after the controls.
 */
export function ScreenHeader({ backHref }: { backHref: string }) {
  return (
    <div className={styles.row}>
      {/* `IconButton` glass at 48 — the app's one back button */}
      <IconButton size="md" href={backHref} label="Back">
        <ArrowLeftIcon />
      </IconButton>
    </div>
  );
}

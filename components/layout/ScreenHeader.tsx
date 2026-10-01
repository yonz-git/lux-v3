import Link from "next/link";
import styles from "./ScreenHeader.module.css";
import { ArrowLeftIcon } from "@/components/ui/icons";
import { SmallButton } from "@/components/ui/SmallButton";

/**
 * The onboarding header — the order is fixed and is enforced by QuestionScreen:
 *   1. this row: back chevron LEFT, `Save & exit` RIGHT
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
 * `Save & exit`, not `Skip` — the investigation is resumable, so the escape
 * hatch saves rather than discards.
 */
export function ScreenHeader({
  backHref,
  saveHref = "/",
}: {
  backHref: string;
  saveHref?: string;
}) {
  return (
    <div className={styles.row}>
      <Link href={backHref} className={`${styles.back} pressable`} aria-label="Back">
        <ArrowLeftIcon />
      </Link>
      <SmallButton label="Save & exit" href={saveHref} />
    </div>
  );
}

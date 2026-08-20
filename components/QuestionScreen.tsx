"use client";

import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import styles from "./QuestionScreen.module.css";
import { ScreenHeader } from "./ScreenHeader";
import { StepProgress } from "./StepProgress";
import { Button } from "./Button";
import { BottomNav } from "./BottomNav";
import { type StepId, stepFor, prevHref, nextHref } from "@/lib/flow";

/**
 * The shell every investigation question screen shares.
 *
 * ORDER IS FIXED, top to bottom: header row -> 12px spacer -> progress track ->
 * spacer -> content. The track goes UNDER the header row, never above it.
 *
 * Nav `Active` is `check` on every investigation question — the nav reflects the
 * section the user is IN, and these are check-in/investigation questions.
 *
 * On desktop the content and the Continue button move INSIDE one centred
 * frosted card (`width/card-form`, 920). On mobile there is no card: the content
 * sits on the gradient and Continue is pushed to the bottom by a flex spacer.
 */
export function QuestionScreen({
  id,
  children,
  continueDisabled,
  continueLabel = "Continue",
}: {
  id: StepId;
  children: ReactNode;
  continueDisabled?: boolean;
  continueLabel?: string;
}) {
  const router = useRouter();
  const { step } = stepFor(id);
  const next = nextHref(id);

  return (
    <main className="screen" data-layout="flow">
      <div className={styles.shell}>
        <ScreenHeader backHref={prevHref(id)} />

        <div className={styles.progressWrap}>
          <StepProgress step={step} />
        </div>

        <div className={styles.card}>
          <div className={styles.content}>{children}</div>

          <div className={styles.spacer} aria-hidden="true" />

          <Button
            fullWidth
            disabled={continueDisabled}
            onClick={() => next && router.push(next)}
          >
            {continueLabel}
          </Button>
        </div>
      </div>

      <BottomNav active="check" />
    </main>
  );
}

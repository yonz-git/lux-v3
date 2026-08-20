"use client";

import Link from "next/link";
import styles from "./Location.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { Chip } from "./Chip";
import { FaceDiagram } from "./FaceDiagram";
import { CameraIcon } from "./icons";
import { useInvestigation } from "./InvestigationProvider";
import { toggleMulti } from "@/lib/answers";
import { stepFor } from "@/lib/flow";

/**
 * 03b — Location. Figma mobile 476:2802, desktop 476:2934. Step 6/8.
 *
 * Two ways to say the same thing, sharing one answer: pills positioned on the
 * face diagram, and chips for the answers that are not a face region ("Whole
 * face", "Neck", "Other"). Both are multi-select.
 *
 * "Take a photo" leads to the selfie capture, which SHARES this step number —
 * it is a sub-step of Location, not a step of its own, so the progress track
 * does not move.
 */
const CHIPS = ["Whole face", "Neck", "Other"];

export function Location() {
  const { answers, setAnswer } = useInvestigation();
  const selected = answers.location ?? [];
  const toggle = (id: string) =>
    setAnswer("location", (prev) => toggleMulti(prev ?? [], id));

  return (
    <QuestionScreen id="location">
      <ChatBubble from="ai" full>
        Where on your face did this happen?
      </ChatBubble>

      <div className={styles.diagram}>
        <FaceDiagram selected={selected} onToggle={toggle} />
      </div>

      <div className={styles.chips} role="group" aria-label="Other locations">
        {CHIPS.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={selected.includes(c)}
            onToggle={() => toggle(c)}
          />
        ))}
      </div>

      <Link href={stepFor("selfie").href} className={styles.takePhoto}>
        <CameraIcon />
        <span className="t-button">Take a photo</span>
      </Link>
    </QuestionScreen>
  );
}

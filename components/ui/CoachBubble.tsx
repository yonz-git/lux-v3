import type { ReactNode } from "react";
import styles from "./CoachBubble.module.css";
import { ChatBubble } from "./ChatBubble";
import { Orb } from "./Orb";

/**
 * The coach speaking: the chat's orb at 40 beside an AI bubble, the pair
 * centred on its row. Used for a question, an instruction or a hand-off line.
 */
export function CoachBubble({
  className,
  bubbleClassName,
  children,
}: {
  /** on the row */
  className?: string;
  /** on the bubble, e.g. an entrance delay */
  bubbleClassName?: string;
  children: ReactNode;
}) {
  return (
    <div className={className ? `${styles.coach} ${className}` : styles.coach}>
      <span className={`${styles.orb} t-body2-body1`} aria-hidden="true">
        {/* --size-orb-coach; the orb draws on a canvas and takes pixels */}
        <Orb size="40px" animateIn halo />
      </span>
      <ChatBubble from="ai" hug className={bubbleClassName}>
        {children}
      </ChatBubble>
    </div>
  );
}

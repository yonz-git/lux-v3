"use client";

import type { ReactNode } from "react";
import styles from "./ChatPanel.module.css";
import { Orb } from "@/components/ui/Orb";
import { CloseButton } from "@/components/ui/CloseButton";

/**
 * The conversation panel — Figma `chat-page / mobile` (270:96).
 *
 * A surface that floats on `.screen`'s canvas: the orb, a greeting and a close
 * X across the top, a scrolling body, and a caller-supplied footer pinned under
 * it. `/chat` puts its composer in that footer; the daily check-in puts
 * `Submit check-in` there.
 */
export function ChatPanel({
  closeHref,
  onClose,
  closeLabel,
  heading,
  footer,
  bodyProps,
  children,
}: {
  /** where the X goes — the screen's own way out, not a shared destination */
  closeHref?: string;
  onClose?: () => void;
  /** the X's accessible name; it names what closes, so it is per-caller */
  closeLabel: string;
  heading?: ReactNode;
  /** pinned under the scrolling body: `/chat`'s composer, check-in's Submit */
  footer?: ReactNode;
  /** forwarded to the scrolling body — a ref, a label, an aria role */
  bodyProps?: React.HTMLAttributes<HTMLDivElement>;
  children: ReactNode;
}) {
  return (
    <div className={styles.panel} data-reveal>
      {heading}

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.avatar}>
            <Orb size="50px" animateIn halo />
          </span>
          <p className="t-body1">Hi, I&rsquo;m LUX</p>
        </div>

        {onClose ? (
          <CloseButton label={closeLabel} className={styles.close} onClick={onClose} />
        ) : (
          <CloseButton label={closeLabel} className={styles.close} href={closeHref ?? "/"} />
        )}
      </div>

      <div {...bodyProps} className={styles.body}>
        {children}
      </div>

      {footer}
    </div>
  );
}

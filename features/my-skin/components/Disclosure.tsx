"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./Disclosure.module.css";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";

/**
 * One expandable row — the § 08 reasoning accordions and the § 11 priority
 * cards both open with this.
 */
export function Disclosure({
  label,
  meta,
  children,
  tone = "plain",
  defaultOpen = false,
}: {
  label: ReactNode;
  /** the short right-hand figure — a count, a confidence word */
  meta?: ReactNode;
  children: ReactNode;
  /** `against` tints the rule and the meta, for the evidence-against block */
  tone?: "plain" | "against";
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();

  return (
    <div className={styles.row} data-open={open} data-tone={tone}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={`${styles.label} t-body3-body2`}>{label}</span>
        {meta ? <span className={`${styles.meta} t-label-sm`}>{meta}</span> : null}
        <ChevronDownIcon className={styles.chevron} />
      </button>

      <Collapse open={open}>
        <div id={panelId} className={styles.panel}>
          {children}
        </div>
      </Collapse>
    </div>
  );
}

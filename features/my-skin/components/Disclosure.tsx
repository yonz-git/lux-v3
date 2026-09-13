"use client";

import { useId, useState, type ReactNode } from "react";
import styles from "./Disclosure.module.css";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";

/**
 * One expandable row — the § 08 reasoning accordions and the § 11 priority
 * cards both open with this.
 *
 * ⚠️ NOT IN FIGMA, AND THE DESIGN SYSTEM HAS NO ACCORDION. `components/ui/`
 * ships nothing that discloses, so the recipe here is lifted from
 * `features/products/components/ProductAccordionCard` — the one disclosure the
 * app already had, built the same way for the same reason. Reusing its shape
 * rather than inventing a second one keeps the app to ONE opening gesture; if
 * an Accordion component is ever drawn, both callers change together. Raised in
 * `docs/figma-catchup.md`.
 *
 * ⚠️ `useState` AND `aria-expanded`, NOT `<details>`. Same call
 * `ProductAccordionCard` makes: `<details>` cannot be styled consistently
 * across browsers for the marker, and the open state has to be readable from
 * React anyway — the reasoning accordions report how many items they hold in
 * their own header.
 *
 * ⚠️ THE CONTENT IS NOT MOUNTED WHILE CLOSED. A screen reader must not be able
 * to reach the body of a collapsed section, and the evidence blocks below carry
 * headings — an off-screen heading tree is worse than none. `Collapse` holds it
 * for the 200ms it takes to close, `inert`, and then lets it go.
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

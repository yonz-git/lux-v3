"use client";

import styles from "./PriorityList.module.css";
import { Disclosure } from "./Disclosure";
import { fullName } from "@/features/products/products";
import type { PriorityEntry } from "@/features/my-skin/analysis";

/**
 * § 11 — "If the user cannot add it, offer INVESTIGATE ONE PRODUCT AT A TIME.
 * Show products ranked by INVESTIGATION PRIORITY, not medical risk."
 */
export function PriorityList({ entries }: { entries: PriorityEntry[] }) {
  return (
    <ol className={styles.list}>
      {entries.map((entry, i) => (
        <li key={entry.product.id} className={styles.item}>
          <Disclosure
            label={
              <span className={styles.head}>
                {/* aria-hidden: the ordinal is already carried by the <ol>, and
                    a screen reader reading "1. 1. CeraVe…" is noise. */}
                <span className={styles.rank} aria-hidden="true">
                  {i + 1}
                </span>
                <span className={styles.name}>{fullName(entry.product)}</span>
              </span>
            }
            meta={entry.missing.length > 0 ? `${entry.missing.length} unknown` : undefined}
          >
            <Section title="Why it ranks here" items={entry.reasons} />
            {entry.missing.length > 0 ? (
              <Section title="Missing information" items={entry.missing} muted />
            ) : null}
            <p className={`${styles.tail} t-caption`}>
              Pausing this one for four weeks would tell you the most about it.
              It is a place to start, not a verdict.
            </p>
          </Disclosure>
        </li>
      ))}
    </ol>
  );
}

function Section({
  title,
  items,
  muted,
}: {
  title: string;
  items: string[];
  muted?: boolean;
}) {
  return (
    <div className={styles.section}>
      <p className={`${styles.sectionTitle} t-overline`}>{title}</p>
      <ul className={styles.reasons} data-muted={muted ? "true" : undefined}>
        {items.map((r) => (
          <li key={r} className="t-body3">
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}

import type { ReactNode } from "react";
import styles from "./ResultCards.module.css";
import { DataCard } from "./DataCard";
import { Tag } from "./Tag";
import {
  LIKELIHOOD_LABEL,
  type IngredientConcern,
  formatScheduleDate,
  type ScheduleNode,
} from "@/lib/check";
import { fullName } from "@/lib/products";

/**
 * The three synthesis cards `06 — Results` (548:1134) is built from, and which
 * `Check results` now opens with too.
 *
 * ⚠️ THEY ARE SAGE ON BOTH SCREENS, AND THAT IS THE POINT OF THE TWO SURFACE
 * SYSTEMS. `06 — Results` is System B throughout; CHECK is System A with, per
 * its handoff, "a sage card inside a light screen is correct". So on
 * `Check results` the split carries meaning rather than being a mix: SAGE IS
 * LUX'S ANALYSIS, LIGHT IS YOUR PRODUCTS. The verdict, the numbers, the
 * ingredients and the plan are the app talking; the per-product cards below are
 * your things, listed.
 *
 * Kept in one file because they are one recipe — an Overline label on a sage
 * data card — and splitting three small blocks across three files hides how
 * consistent they are meant to be. Same call `ProductList.tsx` makes.
 */

/** `card · investigation summary` (548:1165) — three Metric 2 figures. */
export function SummaryCard({
  label = "Investigation summary",
  stats,
}: {
  label?: string;
  stats: { value: number | string; label: string }[];
}) {
  return (
    <DataCard aria-label={label}>
      <p className={`${styles.sectionLabel} t-overline`}>{label}</p>
      <dl className={styles.stats}>
        {stats.map((s) => (
          <div key={s.label} className={styles.stat}>
            {/* ⚠️ <dt> BEFORE <dd> IN THE DOM, REVERSED BY CSS. A description
                list requires the term before its description, but the comp puts
                the figure on top and the label under it. Source order stays
                correct for assistive tech; `column-reverse` does the visual
                swap. Writing dd first AND reversing cancels out — which is
                exactly the bug this replaced. */}
            <dt className={`${styles.statLabel} t-label-sm`}>{s.label}</dt>
            {/* Metric 2 — Light 40/44. The one place in either results screen
                the Light weight is used, and the only one in the ramp. */}
            <dd className={`${styles.statValue} t-metric2`}>{s.value}</dd>
          </div>
        ))}
      </dl>
    </DataCard>
  );
}

/**
 * `card · ingredients of concern` (549:1139) — the ingredient-major view.
 *
 * ⚠️ THE ACCENT BAR IS A SECOND CARRIER, NOT DECORATION. High likelihood is
 * `feedback/warning`, moderate is `text/on-data-muted` — but those two are only
 * distinguishable if you can compare them, so the likelihood is ALSO a Tag with
 * words in it, and the entry's accessible name says it too. Same rule the
 * compatibility pills follow.
 */
export function IngredientsCard({
  concerns,
  label = "Ingredients of concern",
}: {
  concerns: IngredientConcern[];
  label?: string;
}) {
  if (concerns.length === 0) return null;

  return (
    <DataCard aria-label={label}>
      <p className={`${styles.sectionLabel} t-overline`}>{label}</p>
      <ul className={styles.concerns}>
        {concerns.map((c, i) => (
          <li key={c.id} className={styles.concernItem}>
            {/* a 1px border/glass divider between entries, as on every data
                card — see SkinProfile */}
            {i > 0 && <div className={styles.divider} />}
            <div className={styles.concern}>
              <span
                className={styles.accent}
                data-likelihood={c.likelihood}
                aria-hidden="true"
              />
              <div className={styles.concernBody}>
                <p className={`${styles.concernName} t-h6`}>{c.name}</p>
                <p className={`${styles.foundIn} t-label-sm`}>
                  Found in: {c.foundIn.map(fullName).join(", ")}
                </p>
                <p className={`${styles.concernText} t-body3`}>
                  {c.description}
                </p>
                <Tag variant={c.likelihood === "high" ? "brand" : "neutral"}>
                  {LIKELIHOOD_LABEL[c.likelihood]}
                </Tag>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </DataCard>
  );
}

/**
 * `card · what to do next` (549:1163).
 *
 * The emphasis block is `surface/data-strong` — the handoff's rule for a nested
 * block on a data card, NOT a light card. A sage card inside a light card is a
 * LUX pattern; the reverse is not.
 *
 * `schedule` and `actions` are optional because the two screens want different
 * halves of this: the investigation prescribes an elimination period and offers
 * to remind you, a compatibility check just tells you how to sequence what you
 * already own.
 */
export function NextStepsCard({
  label = "What to do next",
  title,
  badge,
  description,
  notes,
  schedule,
  scheduleLabel = "Check-in schedule",
  actions,
}: {
  label?: string;
  title: ReactNode;
  badge?: string;
  description?: string;
  /** extra lines below the emphasis block — CHECK's routine advice */
  notes?: string[];
  schedule?: ScheduleNode[];
  scheduleLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <DataCard aria-label={label}>
      <p className={`${styles.sectionLabel} t-overline`}>{label}</p>

      <div className={styles.emphasis}>
        <p className={`${styles.emphasisTitle} t-h6`}>{title}</p>
        {badge && <Tag>{badge}</Tag>}
        {description && (
          <p className={`${styles.emphasisText} t-body3`}>{description}</p>
        )}
      </div>

      {notes && notes.length > 0 && (
        <ul className={styles.notes}>
          {notes.map((n) => (
            <li key={n} className={`${styles.note} t-body3`}>
              {n}
            </li>
          ))}
        </ul>
      )}

      {schedule && schedule.length > 0 && (
        <div className={styles.schedule}>
          <p className={`${styles.scheduleLabel} t-label-sm`}>
            {scheduleLabel}
          </p>
          <ol className={styles.timeline}>
            {schedule.map((node, i) => (
              <li key={node.week} className={styles.node}>
                {/* the first node is filled, the rest are outlined — the comp
                    marks where you are on the plan, not just that it exists */}
                <span
                  className={styles.dot}
                  data-current={i === 0 || undefined}
                  aria-hidden="true"
                />
                <span className={styles.nodeText}>
                  <span className={`${styles.week} t-h6`}>
                    Week {node.week} — {formatScheduleDate(node.date)}
                  </span>
                  {node.note && (
                    <span className={`${styles.nodeNote} t-label-sm`}>
                      {node.note}
                    </span>
                  )}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {actions && <div className={styles.actions}>{actions}</div>}
    </DataCard>
  );
}

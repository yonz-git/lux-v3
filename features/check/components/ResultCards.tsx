import { type CSSProperties, Fragment, type ReactNode } from "react";
import styles from "./ResultCards.module.css";
import { DataCard } from "@/components/ui/DataCard";
import { CountUp } from "@/components/ui/CountUp";
import { Tag } from "@/components/ui/Tag";
import { ProductThumb } from "@/features/products/components/ProductThumb";
import {
  LIKELIHOOD_LABEL,
  type CompatBand,
  type IngredientConcern,
  type NextStep,
  formatScheduleDate,
  type ScheduleNode,
} from "@/features/check/check";
import { fullName } from "@/features/products/products";

/**
 * The three synthesis cards `06 — Results` (548:1134) is built from, and which
 * `Check results` now opens with too.
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
            <dt className={`${styles.statLabel} t-label-sm`}>{s.label}</dt>
            {/* Metric 2 — Light 40/44. The one place in either results screen
                the Light weight is used, and the only one in the ramp. */}
            <dd className={`${styles.statValue} t-metric2`}>
              {typeof s.value === "number" ? <CountUp value={s.value} /> : s.value}
            </dd>
          </div>
        ))}
      </dl>
    </DataCard>
  );
}

/** `card · ingredients of concern` (549:1139) — the ingredient-major view. */
export function IngredientsCard({
  concerns,
  label = "Ingredients of concern",
}: {
  concerns: IngredientConcern[];
  label?: string;
}) {
  if (concerns.length === 0) return null;

  return (
    <DataCard aria-label={label} data-motion>
      <p className={`${styles.sectionLabel} t-overline`}>{label}</p>
      <ul className={styles.concerns}>
        {concerns.map((c, i) => (
          <li
            key={c.id}
            className={styles.concernItem}
            style={{ "--i": i } as CSSProperties}
          >
            {/* a 1px border/glass divider between entries, as on every data
                card — see SkinProfile */}
            {i > 0 && <div className={styles.divider} />}
            <div className={styles.concern}>
              <div className={styles.concernBody}>
                <p className={`${styles.concernName} t-h6`}>{c.name}</p>
                <p className={`${styles.foundIn} t-label-sm`}>
                  Found in: {c.foundIn.map(fullName).join(", ")}
                </p>
                <p className={`${styles.concernText} t-body3`}>
                  {c.description}
                </p>
                <Tag
                  className={`${styles.likelihood} ${
                    c.likelihood === "high"
                      ? styles.likelihoodHigh
                      : styles.likelihoodModerate
                  }`}
                >
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
 */
export function NextStepsCard({
  label = "What to do next",
  art,
  title,
  badge,
  badgeBand,
  description,
  steps,
  schedule,
  scheduleLabel = "Check-in schedule",
  actions,
}: {
  label?: string;
  /** drawn at 48 beside the title — `ProductThumb` for the product it names */
  art?: ReactNode;
  title: ReactNode;
  badge?: string;
  /** the band the badge names — drives its fill. See `.badge` in the module. */
  badgeBand?: CompatBand;
  description?: string;
  /** the numbered actions below the emphasis block — CHECK's routine advice */
  steps?: NextStep[];
  schedule?: ScheduleNode[];
  scheduleLabel?: string;
  actions?: ReactNode;
}) {
  return (
    <DataCard aria-label={label} data-motion>
      <p className={`${styles.sectionLabel} t-overline`}>{label}</p>

      <div className={styles.emphasis} data-band={badgeBand}>
        <div className={styles.emphasisHead}>
          {art}
          <p className={`${styles.emphasisTitle} t-h6`}>{title}</p>
          {badge && (
            <Tag className={styles.badge} data-band={badgeBand}>
              {badge}
            </Tag>
          )}
        </div>
        {description && (
          <p className={`${styles.emphasisText} t-body3`}>{description}</p>
        )}
      </div>

      {steps && steps.length > 0 && (
        <ol className={styles.steps}>
          {steps.map((step, i) => (
            <li
              key={step.id}
              className={styles.step}
              style={{ "--i": i } as CSSProperties}
            >
              <span className={`${styles.num} t-label-sm`} aria-hidden="true">
                {i + 1}
              </span>
              <div className={styles.stepBody}>
                <p className={`${styles.stepTitle} t-h6`}>{step.title}</p>
                {step.products.length > 0 && (
                  <div className={styles.stepArt}>
                    {step.products.map((p, j) => (
                      <Fragment key={p.id}>
                        {/* the `+` between the pair, not before the first */}
                        {j > 0 && (
                          <span className={`${styles.plus} t-label`} aria-hidden="true">
                            +
                          </span>
                        )}
                        <ProductThumb product={p} className={styles.thumb} />
                      </Fragment>
                    ))}
                  </div>
                )}
                <p className={`${styles.stepText} t-body3`}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
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
                    Week {node.week}, {formatScheduleDate(node.date)}
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

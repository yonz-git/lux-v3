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
            {/* the figures count up the first time they are in view
                (1 Oct 2026, asked for directly) — see `CountUp` */}
            <dd className={`${styles.statValue} t-metric2`}>
              {typeof s.value === "number" ? <CountUp value={s.value} /> : s.value}
            </dd>
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
 * the rose of `bg/symptom` at full strength, moderate the same rose as a
 * tint (indigo until 5 Oct 2026) — each bar carrying its own pill's colour,
 * see the CSS. But two weights
 * of one hue are only distinguishable if you can compare them, so the
 * likelihood is ALSO a Tag with words in it, and the entry's accessible name
 * says it too. Same rule the compatibility pills follow.
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
 *
 * ⚠️ `badgeBand` DRESSES THE BLOCK, NOT ONLY THE PILL — NOT IN FIGMA. It lands
 * as `data-band` on the emphasis div, where the module turns it into a `--band`
 * custom property; the 2px stroke around the block and the pill's fill both
 * read that one value, so the verdict outlines the product it is about. It stays
 * optional, and a block with no band gets a transparent border rather than none,
 * so the geometry does not move between the two states.
 *
 * `schedule` and `actions` are optional because the two screens want different
 * halves of this: the investigation prescribes an elimination period and offers
 * to remind you, a compatibility check just tells you how to sequence what you
 * already own.
 *
 * ⚠️ THE EMPHASIS BLOCK IS A ROW NOW, NOT A STACK — NOT IN FIGMA. 549:1163
 * stacks title, badge and description down the block, each on its own line at
 * `align-items: flex-start`. That gives the band pill a full line of its own,
 * where it reads as a heading rather than as a label on the product above it —
 * and on a check whose worst product is in the Avoid band, the loudest thing in
 * the card is a red word floating on its own row. In the row it stays a small
 * pill ON the title it qualifies, which is what it is, and the block loses a
 * line. `art` is the same move: the product the block names is drawn beside it,
 * so the block leads with the thing rather than with a sentence about it.
 *
 * ⚠️ THE TITLE MUST BE ALLOWED TO WRAP UNDER THE PILL. Measured at 440 the
 * emphasis block is 312 inside its padding; "Pause Paula's Choice BHA
 * Exfoliant" plus a 48 thumb, a 26 pill and two 12 gaps does not fit on one
 * line, and the pill is what would be pushed out. `.emphasisTitle` takes
 * `flex-grow: 1; min-width: 0` and the pill `flex: none`, so the title takes
 * the two lines it needs and the pill keeps its size.
 *
 * ⚠️ THE STEPS ARE NUMBERED, AND THE NUMBER IS NOT DECORATION. They used to be
 * `notes: string[]`, rendered as bare `t-body3` paragraphs — see the note on
 * `routineAdvice`, which now returns the steps themselves. The disc gives each
 * one a visible start, so three actions read as three actions; it is
 * `bg/brand` + `text/on-brand`, the pairing the check-in discs on `/progress`
 * already use, rather than a new treatment.
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
              {/* ⚠️ aria-hidden, and the <ol> carries the semantics. A screen
                  reader already numbers a list item; reading the disc too
                  announces "1 1 Keep …". */}
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

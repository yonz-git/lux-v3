import Link from "next/link";
import { useId, type CSSProperties, type ReactNode } from "react";
import styles from "./GlassMetricCard.module.css";
import { ChevronRightIcon } from "@/components/ui/icons";

/**
 * ⚠️ NOT IN FIGMA, AND MOUNTED NOWHERE — a warm glass metric card, kept as
 * reusable code, asked for directly 14 Sep 2026. It was built on `/check` from
 * a supplied reference (a finance dashboard: one wide card with a dot track, a
 * row of half-width cards with a mini chart) and taken off the page the same
 * day, with the instruction to keep it.
 *
 * ⚠️ IT CARRIES NO DATA. On `/check` it showed the latest analysis's lowest
 * product score (a dot per product, the headline the big dot) and the count of
 * analyses (a bar per analysis at its lowest score). That wiring was removed
 * with it; a caller computes its figures from its section's data module and
 * passes them in.
 *
 * Pieces:
 *   GlassMetricGrid  two columns 12 apart; a `size="lg"` card spans both
 *   GlassMetricCard  `lg`: badge ····· action / label / value ····· visual
 *                    `sm`: badge + two-line label / value ····· visual
 *   GlassDotTrack    dots strung on a hairline — `sm` 8, `md` 20 translucent,
 *                    `lg` 32; closes up past six dots
 *   GlassMiniBars    hairline bars, each a 0–1 fraction of the track height
 *
 * ⚠️ WARM ORANGE INTO SOFT PEACH, WHITE INK — the reference's palette, the one
 * warm surface in a sage-and-indigo app, with no tokens behind it. Its computed
 * contrast is in the module: the label's tail dips under AA.
 *
 * ⚠️ A VISUAL IS `role="img"` AND NEEDS ITS `label` — never let the dots or the
 * bars carry a meaning the text does not (a band, a trend). `valueHint` is
 * read after the value and not shown, for the same reason.
 *
 * ⚠️ THE GLYPHS ARE THE CALLER'S, AND THE DS HAS FEW. The action is
 * `ChevronRightIcon` upright: the reference's ↗ has no glyph here, and the
 * chevron turned -45° read as "¬".
 */

export function GlassMetricGrid({ children }: { children: ReactNode }) {
  return <div className={styles.grid}>{children}</div>;
}

export function GlassMetricCard({
  size = "lg",
  icon,
  label,
  value,
  unit,
  valueHint,
  visual,
  action,
  className,
}: {
  size?: "lg" | "sm";
  /** an icon from `components/ui/icons`, drawn in the outlined disc */
  icon: ReactNode;
  label: string;
  value: ReactNode;
  unit?: string;
  /** screen-reader-only text after the value, e.g. ", Avoid" */
  valueHint?: string;
  /** a `GlassDotTrack`, `GlassMiniBars` or anything of the same size */
  visual?: ReactNode;
  /** the white disc top-right — `lg` only */
  action?: { href: string; label: string; onClick?: () => void };
  className?: string;
}) {
  const titleId = useId();
  const isLg = size === "lg";

  const badge = (
    <span className={styles.badge} data-size={size} aria-hidden="true">
      {icon}
    </span>
  );

  return (
    <section
      className={[styles.card, className].filter(Boolean).join(" ")}
      data-size={size}
      aria-labelledby={titleId}
    >
      {isLg ? (
        <>
          <div className={styles.top}>
            {badge}
            {action && (
              <Link
                href={action.href}
                className={`${styles.open} pressable`}
                aria-label={action.label}
                onClick={action.onClick}
              >
                <ChevronRightIcon className={styles.openIcon} />
              </Link>
            )}
          </div>
          <h2 id={titleId} className={`${styles.label} t-body1`}>
            {label}
          </h2>
        </>
      ) : (
        <div className={styles.head}>
          {badge}
          <h2 id={titleId} className={`${styles.labelSm} t-body3`}>
            {label}
          </h2>
        </div>
      )}

      <div className={styles.bottom}>
        <p className={styles.value}>
          <span className={isLg ? "t-metric1" : "t-metric2"}>{value}</span>
          {unit && <span className={`${styles.unit} t-body2`}>{unit}</span>}
          {valueHint && <span className="visually-hidden">{valueHint}</span>}
        </p>
        {visual}
      </div>
    </section>
  );
}

export function GlassDotTrack({
  dots,
  label,
}: {
  dots: ("sm" | "md" | "lg")[];
  label: string;
}) {
  return (
    <div
      className={styles.track}
      role="img"
      aria-label={label}
      data-dense={dots.length > 6 || undefined}
    >
      {dots.map((size, i) => (
        <span key={i} className={styles.dot} data-size={size} />
      ))}
    </div>
  );
}

export function GlassMiniBars({
  values,
  label,
}: {
  /** each 0–1 */
  values: number[];
  label: string;
}) {
  return (
    <div className={styles.bars} role="img" aria-label={label}>
      {values.map((v, i) => (
        <span
          key={i}
          className={styles.bar}
          style={{ "--bar": Math.min(1, Math.max(0, v)) } as CSSProperties}
        />
      ))}
    </div>
  );
}

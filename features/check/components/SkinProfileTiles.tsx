import { useId, type ReactNode } from "react";
import styles from "./SkinProfileTiles.module.css";

const NOT_SET = "Not set";
const NONE = "None";

/** a set's members, or `None` in the one pill an empty set gets */
const members = (list?: readonly string[] | null) =>
  list && list.length > 0 ? list : [NONE];

export function SkinProfileTiles({
  skinType,
  tendencies,
  conditions,
  symptomsState,
  action,
  className,
}: {
  skinType?: string | null;
  tendencies?: readonly string[] | null;
  conditions?: readonly string[] | null;
  /** where the current episode stands — step 4's status */
  symptomsState?: string | null;
  /** a control at the overline's end — the recap's `Edit`, the only caller.
   *  Draws nothing else differently: the card's look is still one look. */
  action?: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  const tiles = [
    { label: "Skin type", values: [skinType || NOT_SET] },
    { label: "Tendencies", values: members(tendencies) },
    { label: "Known conditions", values: members(conditions) },
    { label: "Symptoms state", values: [symptomsState || NOT_SET] },
  ];
  const isActive = (label: string, value: string) =>
    label === "Symptoms state" && value === "Ongoing";

  return (
    <section
      /* `canvas-card` (globals.css) is the bare-canvas surface — the shadows,
         edge ring and grain this card's own module used to carry */
      className={[styles.card, "canvas-card", className].filter(Boolean).join(" ")}
      aria-labelledby={titleId}
    >
      <div className={styles.head}>
        <h2 id={titleId} className={`${styles.overline} t-overline`}>
          Skin profile
        </h2>
        {action}
      </div>
      <dl className={styles.tiles}>
        {tiles.map(({ label, values }) => (
          <div key={label} className={styles.tile}>
            <dt className={`${styles.tileLabel} t-body3`}>{label}</dt>
            {values.map((value) => (
              <dd
                key={value}
                className={`${styles.tileValue} t-body3`}
                data-tone={isActive(label, value) ? "symptom" : undefined}
              >
                {value}
              </dd>
            ))}
          </div>
        ))}
      </dl>
    </section>
  );
}

import styles from "./SkinProfileStrip.module.css";

/**
 * `skin-profile` — Figma 601:1957 / 602:1979 / 604:2065 / 651:2516 / 476:2847.
 *
 * The one-line skin recap that sits under the title on four of the CHECK
 * screens. It stands in for the wireframes' thin "Skin type:" context strip.
 *
 * ⚠️ IT IS THE ONLY SAGE ELEMENT ON A CHECK SCREEN. CHECK is Surface System A
 * throughout — light frosted rows on the canvas gradient — and this one card is
 * System B: `surface/data` + `surface/frosted-data` + `radius/2xl`, WHITE text.
 * The handoff is explicit that a sage card inside a light screen is correct and
 * the reverse is not.
 *
 * ⚠️ NOT `DataCard`, even though it is the same surface. DataCard is the
 * PROGRESS card: 20/24 padding, 16 gap, a stack of blocks. This is an 86-tall
 * strip with 18/20 padding and a 6 gap. Same recipe, different component —
 * forcing one to serve both would mean a size prop that means nothing.
 *
 * It ECHOES the investigation rather than hardcoding the comp's
 * "Combination · Sensitive · Acne-prone": those are step 2's answers. With no
 * answers it renders nothing at all rather than an empty card — a deep link to
 * /check should not show a skin profile the user has not given.
 */
export function SkinProfileStrip({
  skinType,
  tendencies,
  className,
}: {
  skinType?: string;
  tendencies?: string[];
  className?: string;
}) {
  const hasTendencies = (tendencies?.length ?? 0) > 0;
  if (!skinType && !hasTendencies) return null;

  /* ⚠️ NOT IN FIGMA — 13 Sep 2026, asked for directly. 601:1957 runs the
     profile as one line, "Combination · Sensitive · Acne-prone", which leaves
     the reader to work out where the skin type stops and the tendencies start.
     It now takes the recap card's shape (`SkinProfileSummary`'s `Headline`):
     `Skin type` and `Tendencies` as two labelled columns pushed to opposite
     edges, tendencies joined with commas. Taller than the comp's 86. */
  return (
    <section
      className={[styles.card, className].filter(Boolean).join(" ")}
      aria-labelledby="skin-profile-strip-title"
    >
      <h2 id="skin-profile-strip-title" className={`${styles.label} t-overline`}>
        Your skin profile
      </h2>
      <div className={styles.identity}>
        {skinType && (
          <div className={styles.col}>
            <p className={`${styles.pairLabel} t-body3`}>Skin type</p>
            <p className={`${styles.value} t-body2`}>{skinType}</p>
          </div>
        )}
        {hasTendencies && (
          <div className={`${styles.col} ${skinType ? styles.end : ""}`}>
            <p className={`${styles.pairLabel} t-body3`}>Tendencies</p>
            <p className={`${styles.value} t-body2`}>
              {tendencies!.join(", ")}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

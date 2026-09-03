"use client";

import { useId, useState } from "react";
import styles from "./CompatCard.module.css";
import { ChevronDownIcon } from "@/components/ui/icons";
import { BAND_LABEL, type CheckAnalysis } from "@/features/check/check";
import { fullName } from "@/features/products/products";

/**
 * One `analysis/…` card on `Check results` — Figma 476:2857 (collapsed) and
 * 476:2864 (expanded).
 *
 * A frosted row that opens: header always, and on expand a compatibility bar, a
 * plain-language score line, the ingredients that cost it points, and the
 * recommendation.
 *
 * ⚠️ THE PILL LIVES IN THE HEADER, NOT THE BODY — the handoff moved it there so
 * the band is readable whether the card is open or closed. That is not
 * cosmetic: `feedback/warning` and `feedback/error` share a hue and differ only
 * in lightness, so "Risky" and "Avoid" are NOT distinguishable by colour. The
 * pill's TEXT is what separates them.
 *
 * ⚠️ A COMPATIBLE PRODUCT HAS NO PILL, AND THE ABSENCE IS THE SIGNAL — also the
 * handoff. Which means a screen reader would get nothing at all from the two
 * best rows, so every card states its band in the toggle's accessible name
 * regardless. The colour is never the only carrier.
 *
 * ⚠️ NOT `BucketProductsList`'s accordion. That one is the PRODUCTS hub's, on a
 * different surface with a different header and no band. Two accordions, and
 * the design system still has neither — both are composed from the frosted card
 * recipe. See AGENTS.md.
 */
export function CompatCard({ analysis }: { analysis: CheckAnalysis }) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  const { product, score, band, riskyIngredients, recommendation } = analysis;
  const name = fullName(product);

  return (
    <div className={styles.card} data-band={band} data-open={open || undefined}>
      <h3 className={styles.heading}>
        <button
          type="button"
          className={styles.toggle}
          aria-expanded={open}
          aria-controls={bodyId}
          onClick={() => setOpen((o) => !o)}
        >
          <span className={`${styles.name} t-h6`}>{name}</span>

          <span className={styles.score}>
            {/* only Risky and Avoid draw a pill — compatible is the absence */}
            {band !== "compatible" && (
              <span className={`${styles.pill} t-label-sm`}>
                {BAND_LABEL[band]}
              </span>
            )}
            <span className={`${styles.percent} t-h6`}>{score}%</span>
            <ChevronDownIcon className={styles.chevron} />
          </span>

          {/* the band in words for everyone, including the rows with no pill */}
          <span className="visually-hidden">
            {score}% compatible — {BAND_LABEL[band]}
          </span>
        </button>
      </h3>

      {/* ⚠️ `reveal-quick` IS A GLOBAL CLASS, not a module one. A rule that NAMES
          an animation must live in globals.css — a CSS Module scopes the
          @keyframes name, so `animation: lux-fade-in` written here would resolve
          to nothing while still reporting a duration. duration/base is the
          board's value for something revealed by a user action. */}
      {open && (
        <div id={bodyId} className={`${styles.body} reveal-quick`}>
          <div
            className={styles.bar}
            role="img"
            aria-label={`${score}% compatible`}
          >
            <span className={styles.fill} style={{ width: `${score}%` }} />
          </div>

          <p className={`${styles.summary} t-body3`}>{score}% compatible</p>

          {riskyIngredients.length > 0 && (
            <>
              <p className={`${styles.sectionLabel} t-label`}>
                Risky ingredients
              </p>
              <ul className={styles.tags}>
                {riskyIngredients.map((ingredient) => (
                  <li key={ingredient} className={`${styles.tag} t-label-sm`}>
                    {ingredient}
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className={styles.recommendation}>
            <p className={`${styles.recTitle} t-label`}>Recommendation</p>
            <p className={`${styles.recBody} t-body3`}>{recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

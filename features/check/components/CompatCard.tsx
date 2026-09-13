"use client";

import { useId, useState } from "react";
import styles from "./CompatCard.module.css";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronDownIcon, CloseIcon } from "@/components/ui/icons";
import { BAND_LABEL, type CheckAnalysis } from "@/features/check/check";
import { fullName } from "@/features/products/products";
import { ProductThumb } from "@/features/products/components/ProductThumb";

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
 * ⚠️ NOT `ProductAccordionCard`. That one is the PRODUCTS hub's, on a different
 * surface with a different header and no band. Two accordions, and the design
 * system still has neither — both are composed from the frosted card recipe.
 * See AGENTS.md.
 *
 * ⚠️ `compact` IS THE CARD AS IT RENDERS INSIDE THE COMPARED-PRODUCTS BOX —
 * NOT IN FIGMA. 476:2857 draws it as a card on the canvas, which is what it was
 * while the list hung under the header row as a sibling of it. The list is
 * inside the group's own surface now (see `CheckResults`), and the same rule
 * `ProductAccordionCard.compact` states applies here for the same reason: a
 * frosted fill on a frosted surface composites into one pale smear, and a
 * 16-radius card at full padding inside a 16-radius box reads as two surfaces
 * arguing. Padding steps 16/18 → 12, the radius 16 → 8 (concentric with the
 * box's 16 less its 8 inset), the border goes and the fill becomes
 * `bg/surface-frost`, frost-light's opaque counterpart. It is a PROP, not a
 * second component: the anatomy, the pill, the bar and the body are identical.
 *
 * ⚠️ `onRemove` IS THE EDIT MODE'S GLYPH, AND IT IS ON THE ROW RATHER THAN
 * INSIDE THE CARD. It replaces the `Edit` tray that used to list the same
 * products a second time in a modal sheet — see `CheckResults`.
 *
 * It sits beside the chevron, not under the recommendation where
 * `ProductAccordionCard` puts its `Remove`, and the difference is that this box
 * has an EDIT MODE and that card does not. A mode exists to surface its
 * destructive affordances: with the remove buried in the body, entering edit
 * mode changed nothing you could see, and taking a product out cost a tap to
 * open the row plus a tap to remove — on a row whose scores you did not want to
 * read. Passed only while the box is editing, so the resting list is exactly
 * the read-only accordion it was.
 *
 * ⚠️ IT IS A SIBLING OF THE TOGGLE, NOT A CHILD. A `<button>` may not contain
 * another one, so `.head` is the flex row and the `<h3>` takes the slack.
 */
export function CompatCard({
  analysis,
  compact = false,
  onRemove,
}: {
  analysis: CheckAnalysis;
  /** rendered inside the compared-products box rather than on the canvas */
  compact?: boolean;
  /** absent = the card cannot be removed, which is every read-only caller */
  onRemove?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const bodyId = useId();

  const { product, score, band, riskyIngredients, recommendation } = analysis;
  const name = fullName(product);

  return (
    <div
      className={`${styles.card}${compact ? ` ${styles.compact}` : ""}`}
      data-band={band}
      data-open={open || undefined}
    >
      <div className={styles.head}>
        <h3 className={styles.heading}>
          <button
            type="button"
            className={styles.toggle}
            aria-expanded={open}
            aria-controls={bodyId}
            onClick={() => setOpen((o) => !o)}
          >
            {/* ⚠️ NOT IN FIGMA — the product drawn in front of its name, asked
                for directly 13 Sep 2026. `ProductAccordionCard`'s own recipe:
                the 36 thumb on the compact card, 48 otherwise, at the row's 12
                gap. */}
            <ProductThumb product={product} size={compact ? "sm" : "md"} />
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
              {score}% compatible, {BAND_LABEL[band]}
            </span>
          </button>
        </h3>

        {onRemove && (
          <button
            type="button"
            className={styles.remove}
            /* the glyph is the whole control, so the name has to carry both
               the action and which product it acts on */
            aria-label={`Remove ${name} from this analysis`}
            onClick={onRemove}
          >
            <CloseIcon className={styles.removeIcon} />
          </button>
        )}
      </div>

      {/* opens down and closes back up — `Collapse`, and "Dropdowns" in
          globals.css. The 14 above the bar is the bar's own margin, inside the
          panel, so this card sets no `--collapse-gap`. */}
      <Collapse open={open}>
        <div id={bodyId} className={styles.body}>
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
      </Collapse>
    </div>
  );
}

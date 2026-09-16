"use client";

import { useId, useState } from "react";
import styles from "./IngredientsDisclosure.module.css";
import { IngredientTerms } from "./IngredientTerms";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";

/**
 * A product's INCI list behind an `Ingredients ⌄` toggle, closed by default.
 *
 * ⚠️ LIFTED OUT OF `ProductDetails` on 16 Sep 2026, when the add tray's
 * confirm card (`ProductCard`) was asked to show its ingredients "this way".
 * The card ended up rendering all of `ProductDetails`, so today this has one
 * caller; it stays its own file so the dropdown can be reused as it stands.
 *
 * ⚠️ NOT IN FIGMA. An INCI list is 15–25 comma-separated terms; open by
 * default it would push everything under it off the screen. Its chevron is
 * `icon-xs` against a card's `icon-sm`: that one step is what says this
 * disclosure belongs TO the card rather than being a second card. The chevron
 * sits right after its label, not at the far edge.
 *
 * ⚠️ THE NAMES IN THE LIST EXPLAIN THEMSELVES, AS OF 16 Sep 2026 — also NOT IN
 * FIGMA. Hover one, or tap it on a phone, and a small panel says what it is.
 * Only names the glossary knows are dotted; the rest stay plain text. The
 * reasoning is on `IngredientTerms`, and the lines are in
 * `features/products/ingredients.ts`.
 *
 * ⚠️ EVERY CALLER GETS IT — there is no switch. It was opt-in for an afternoon
 * ("do it on /products first"), with only the hub's cards passing `explain`,
 * and went to every list the same day ("apply to all the elements that contain
 * ingredients part"): the hub, the add tray's cards and `/check/new`'s rows.
 */
export function IngredientsDisclosure({
  ingredients,
  className,
}: {
  /** the INCI list as one string — a caller with none renders nothing */
  ingredients: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const listId = useId();

  return (
    <div
      className={className ? `${styles.inci} ${className}` : styles.inci}
      data-open={open}
    >
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`${styles.label} t-label-sm`}>Ingredients</span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      <Collapse open={open}>
        {/* each name the glossary knows explains itself on hover or tap —
            see IngredientTerms */}
        <p id={listId} className={`${styles.list} t-body3`}>
          <IngredientTerms ingredients={ingredients} />
        </p>
      </Collapse>
    </div>
  );
}

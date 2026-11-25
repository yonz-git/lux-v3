"use client";

import { useId, useState } from "react";
import styles from "./IngredientsDisclosure.module.css";
import { IngredientTerms } from "./IngredientTerms";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";

/** A product's INCI list behind an `Ingredients ⌄` toggle, closed by default. */
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

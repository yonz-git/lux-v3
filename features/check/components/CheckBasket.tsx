"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CheckBasket.module.css";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";
import { CloseButton } from "@/components/ui/CloseButton";
import { ProductThumb } from "@/features/products/components/ProductThumb";
import {
  MAX_CHECK_PRODUCTS,
  MIN_CHECK_PRODUCTS,
} from "@/features/check/check";
import { fullName, type CatalogProduct } from "@/features/products/products";

/**
 * The basket on `/analyses/new` — the products going into this check.
 *
 * Figma: `tray-bar` on `Check — tray collapsed` (650:2513) and `bottom-sheet`
 * on `Check — selection · N products` (604:2103).
 */

/** What the coach says above the search: the goal, then how far along it is. */
export function basketPrompt(count: number) {
  if (count === 0) return `Select at least ${MIN_CHECK_PRODUCTS} products`;
  if (count < MIN_CHECK_PRODUCTS)
    return `${count} of ${MIN_CHECK_PRODUCTS}, select one more`;
  return `${count} selected, ready to analyse`;
}

/**
 * The docked button above the nav, once there is enough to compare; until
 * then the coach's bubble states the goal and nothing docks here.
 */
export function CheckBasketBar({
  count,
  onExpand,
}: {
  count: number;
  onExpand: () => void;
}) {
  if (count < MIN_CHECK_PRODUCTS) return null;
  const label = `${count} products · review & analyse`;

  /* the primary Button, with the up chevron saying the tray opens upward;
     `rise-in` fades it up as it appears (globals.css) */
  return (
    <div className={`${styles.dock} rise-in`}>
      <Button width="full" className={styles.dockButton} onClick={onExpand}>
        {label}
      </Button>
      <ChevronDownIcon className={styles.barChevron} />
    </div>
  );
}

/**
 * The expanded basket — a centred dialog from `Sheet` at every width.
 */
export function CheckBasketSheet({
  open,
  onClose,
  products,
  onRemove,
  onAddAnother,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  products: CatalogProduct[];
  onRemove: (id: string) => void;
  onAddAnother: () => void;
  onSubmit: () => void;
}) {
  const enough = products.length >= MIN_CHECK_PRODUCTS;
  const full = products.length >= MAX_CHECK_PRODUCTS;

  const [leaving, setLeaving] = useState<ReadonlySet<string>>(() => new Set());
  const pending = useRef(new Set<string>());
  const drawn = useRef<ReadonlySet<string> | null>(null);
  useEffect(() => {
    drawn.current = new Set(products.map((p) => p.id));
  });

  function leave(id: string) {
    if (pending.current.has(id)) return;
    pending.current.add(id);
    setLeaving((prev) => new Set(prev).add(id));
    window.setTimeout(() => {
      pending.current.delete(id);
      onRemove(id);
      setLeaving((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, COLLAPSE_EXIT_MS);
  }

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title="Products in this analysis"
      dismiss="corner"
      /* grows up out of the bar's edge — `.sheet-grow` in globals.css */
      className={`sheet-grow ${styles.tray}`}
    >
      <h2 className={`${styles.sheetTitle} t-h4`}>Products in this analysis</h2>

      <ul className={styles.basket}>
        {products.map((p, i) => (
          <Collapse
            as="li"
            key={p.id}
            open={!leaving.has(p.id)}
            appear={drawn.current !== null && !drawn.current.has(p.id)}
          >
            <div className={styles.basketItem}>
              {i > 0 && (
                <span className={`${styles.and} t-label`} aria-hidden="true">
                  and
                </span>
              )}
              <span className={styles.item}>
                <ProductThumb product={p} />
                <span className={`${styles.itemLabel} t-h6`}>
                  {fullName(p)}
                </span>
                <CloseButton
                  label={`Remove ${fullName(p)} from this analysis`}
                  onClick={() => leave(p.id)}
                />
              </span>
            </div>
          </Collapse>
        ))}

        {!full && (
          <li className={styles.addAnotherItem}>
            <Button variant="secondary" size="md" onClick={onAddAnother}>
              Add another product
            </Button>
          </li>
        )}
      </ul>

      <p className={`${styles.count} t-body3`}>
        {products.length} of {MAX_CHECK_PRODUCTS} products
      </p>

      <div className={styles.divider} />

      <Button width="action"
        className={styles.submit}
        disabled={!enough}
        onClick={onSubmit}
        aria-describedby={enough ? undefined : "check-helper"}
      >
        Start analysis
      </Button>

      {/* the 1-product state's helper, and the only thing that explains a
          disabled CTA */}
      {!enough && (
        <p id="check-helper" className={`${styles.helper} t-caption`}>
          Select at least {MIN_CHECK_PRODUCTS} products
        </p>
      )}
    </Sheet>
  );
}

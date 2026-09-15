"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./CheckBasket.module.css";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";
import { ChevronDownIcon, CloseIcon, PlusIcon } from "@/components/ui/icons";
import { ProductThumb } from "@/features/products/components/ProductThumb";
import {
  MAX_CHECK_PRODUCTS,
  MIN_CHECK_PRODUCTS,
} from "@/features/check/check";
import { fullName, type CatalogProduct } from "@/features/products/products";

/**
 * The basket on `/check/new` — the products going into this check.
 *
 * Figma: `tray-bar` on `Check — tray collapsed` (650:2513) and `bottom-sheet`
 * on `Check — selection · N products` (604:2103).
 *
 * ⚠️ THE BAR IS THE DEFAULT AND THE SHEET IS THE EXPANSION — the design has it
 * the other way round, and this is a decided-here flow change.
 *
 * The comps give the tray three states: closed (nothing added), open (a scrim'd
 * modal sheet above the nav) and collapsed (a docked pill). Adding your FIRST
 * product opened the modal — over the search list, with the CTA disabled and
 * the helper reading "Add at least 2 products". So the screen's opening move
 * put a blocking sheet on top of the one thing you still had to use, which is
 * why the transition map has to say "Add another product returns focus to the
 * search list with the tray still open", and why a third state exists at all:
 * `tray collapsed` is the escape hatch from a modal that should not have been
 * modal.
 *
 * Adding is not a decision that needs confirming — it is the loop. So the
 * basket lives in the bar: always visible, never covering the list, counting up
 * as you add. The sheet is still exactly the drawn sheet, opened deliberately
 * to review, reorder or remove. Every drawn treatment is used; only which one
 * is the resting state changed. Two states instead of three.
 *
 * ⚠️ THE BAR IS NOT A MODAL, so it stays BELOW the nav (`--z-sticky` 100 vs
 * `--z-nav` 200) and has no scrim. Only the sheet outranks the nav, and that is
 * `Sheet`'s own documented exception.
 */

/**
 * The docked pill above the nav — ALWAYS present, and it is the only thing on
 * the screen that states the goal.
 *
 * ⚠️ IT USED TO APPEAR ONLY AFTER THE FIRST ADD, AND THAT WAS THE BUG. The
 * screen's job is to assemble a comparison of two to eight products, and until
 * you had added one, nothing said so: you arrived at a title, a search field and
 * a list of products, with no indication you were building anything, how many
 * you needed, or what happened next. The requirement — "Add at least 2
 * products" — lived inside the sheet, which you could only reach by adding
 * something first. So you discovered the rule by breaking it.
 *
 * One persistent element now carries all three:
 *
 *   0 products   the GOAL        "Pick 2 products to compare"
 *   1 product    the PROGRESS    "1 of 2 — pick one more"
 *   2-8          the ACTION      "N products · review & analyse"
 *
 * ⚠️ IT IS INERT BELOW TWO, on purpose. With nothing to review there is nothing
 * for the sheet to show, and a control that opens an empty tray teaches the
 * wrong thing. It renders as a statement until it has something to do — which is
 * also why the tag is chosen at render rather than always being a button.
 *
 * ⚠️ NOT A MODAL, so it stays BELOW the nav (`--z-sticky` 100 vs `--z-nav` 200)
 * and has no scrim. Only the sheet outranks the nav, and that is `Sheet`'s own
 * documented exception.
 */
export function CheckBasketBar({
  count,
  onExpand,
}: {
  count: number;
  onExpand: () => void;
}) {
  const ready = count >= MIN_CHECK_PRODUCTS;

  const label = ready
    ? `${count} products · review & analyse`
    : count === 0
      ? `Pick at least ${MIN_CHECK_PRODUCTS} products`
      : `${count} of ${MIN_CHECK_PRODUCTS}, pick one more`;

  const content = (
    <>
      <span className={`${styles.barLabel} t-body2`}>{label}</span>
      {/* the comp rotates a chevron-down 180°; an up chevron is the same glyph
          and says "this opens upward" without a transform to maintain */}
      {ready && <ChevronDownIcon className={styles.barChevron} />}
    </>
  );

  if (!ready) {
    return (
      <p className={styles.bar} data-quiet aria-live="polite">
        {content}
      </p>
    );
  }

  return (
    <button type="button" className={styles.bar} onClick={onExpand}>
      {content}
    </button>
  );
}

/**
 * The expanded basket — `bottom-sheet` (604:2103), a docked sheet on mobile and
 * a centred dialog on desktop, both from `Sheet`.
 *
 * ⚠️ 0–1 PRODUCTS DISABLES THE CTA AND SHOWS THE HELPER; 2–8 ENABLES IT. The
 * handoff's rule, and the cap is 8. You cannot compare one product with itself.
 *
 * ⚠️ `/check/new` IS ITS ONLY CALLER, AND THAT IS THE POINT. `Check results`
 * used to open this same sheet behind its `Edit` — over a screen that was
 * already listing the same products, so one set appeared twice and the copy of
 * it that could be edited covered the copy that carried the answers. That
 * screen edits its set in place now and this sheet lost its `submitLabel` prop
 * with it. See `CheckResults`.
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

  /* ⚠️ A REMOVED ROW CLOSES BEFORE IT LEAVES THE BASKET — added 13 Sep 2026;
     it used to vanish and jump the tray's edge. Same two beats as the
     PRODUCTS hub's cards (MyProducts.tsx `CategoryGroup`). */
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
    /* ⚠️ `Cancel`, NOT THE SHEET'S `Done` — asked for directly 15 Sep 2026.
       Only this sheet: every other tray keeps `Done`. */
    <Sheet
      open={open}
      onClose={onClose}
      title="Products in this check"
      dismissLabel="Cancel"
    >
      <h2 className={`${styles.sheetTitle} t-h4`}>Products in this check</h2>

      <ul className={styles.basket}>
        {products.map((p, i) => (
          <Collapse
            as="li"
            key={p.id}
            open={!leaving.has(p.id)}
            appear={drawn.current !== null && !drawn.current.has(p.id)}
          >
            <div className={styles.basketItem}>
              {/* ⚠️ THE "and" IS A CONNECTOR, NOT A LIST ITEM. It reads as one
                  sentence — "this AND this AND this" — which is what a
                  compatibility check is asking about. Hidden from assistive tech,
                  where the list semantics already say it. */}
              {i > 0 && (
                <span className={`${styles.and} t-label-sm`} aria-hidden="true">
                  and
                </span>
              )}
              <span className={styles.item}>
                {/* ⚠️ THE THUMB IS NOT IN THE COMP — `bottom-sheet` (604:2103)
                    draws these rows as a label and a close glyph alone. Every
                    other place a product appears carries its drawn vessel
                    (`/check/new`'s own result rows, the PRODUCTS tray, both
                    hubs), so the ONE screen where you review what you picked was
                    the one screen that dropped the picture — and it is the
                    screen where two rows are most likely to read alike, since a
                    basket is two products from the same shelf. Same
                    `ProductArt`, same hash, so a row keeps the identity it had
                    in the list you picked it from. */}
                <ProductThumb product={p} />
                <span className={`${styles.itemLabel} t-body2`}>
                  {fullName(p)}
                </span>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Remove ${fullName(p)} from this analysis`}
                  onClick={() => leave(p.id)}
                >
                  <CloseIcon className={styles.removeIcon} />
                </button>
              </span>
            </div>
          </Collapse>
        ))}

        {!full && (
          <li className={styles.addAnotherItem}>
            {/* ⚠️ NOT IN FIGMA — the small secondary pill, asked for directly
                13 Sep 2026; it was a full-width deep-sage row */}
            <Button
              variant="secondary"
              size="md"
              icon={<PlusIcon />}
              onClick={onAddAnother}
            >
              Add another product
            </Button>
          </li>
        )}
      </ul>

      <p className={`${styles.count} t-caption`}>
        {products.length} of {MAX_CHECK_PRODUCTS} products
      </p>

      <div className={styles.divider} />

      <Button
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
          Pick at least {MIN_CHECK_PRODUCTS} products
        </p>
      )}
    </Sheet>
  );
}

"use client";

import { useState } from "react";
import styles from "./ProductAccordionCard.module.css";
import { ProductThumb } from "./ProductThumb";
import { Collapse } from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";
import { ProductDetails } from "./ProductDetails";
import { fullName, type SavedProduct } from "@/features/products/products";

/**
 * One saved product, collapsed or expanded. Figma `product · …` inside
 * `Long-term products list` (581:1593 / 583:1924).
 *
 * ⚠️ IT LIVES IN ITS OWN FILE NOW, AND THE SCREEN IT CAME FROM IS GONE. It was
 * local to `BucketProductsList`, the pushed view at `/products/[bucket]`; the
 * PRODUCTS hub expands its groups in place instead, so this card is what a hub
 * group opens onto. See `MyProducts` for the change and why.
 *
 * ⚠️ THE DURATION IS GONE FROM THIS CARD — BOTH PLACES IT APPEARED. It was a
 * `Tag` on the collapsed header and a "Duration" row in the expanded details.
 * Neither could ever say anything the screen had not already said: `bucket` is
 * derived from `duration` by `bucketFor` and by nothing else, a strict 1:1, so
 * EVERY product under one group header carries the identical value — the one
 * that header is naming. A "4+ weeks" badge repeated down a list headed
 * "Long-term products" is noise that reads like data.
 *
 * `Your products` already worked this way and stated the rule: it shows the
 * per-row duration Tag ONLY in its flat, single-group state, "carrying the
 * period information a header would otherwise repeat", and drops it the moment
 * group headers appear. This card is only ever rendered under a group header —
 * the hub row that opened it — so the same rule applies.
 *
 * The window that DEFINES the group shows on that hub row. See `MyProducts`.
 *
 * ⚠️ NOT IN FIGMA: 581:1593 draws the badge. The chevron is unchanged — the same
 * glyph in both states, rotated; `chevron-up` in Figma is literally a
 * `chevron-down` instance at 180°.
 *
 * ⚠️ "Edit" IS GONE — NOT IN FIGMA. 581:1593 draws Edit beside Remove, and it
 * had no destination: the design defines no edit screen, not in the comps and
 * not in the wireframes, so it sat here inert. A control that does nothing when
 * tapped is worse than an absent one, and it was the FIRST of the two, so the
 * card led with the dead action and put the working one second. "Remove" is the
 * one card action the store can actually perform, and it is now the only one.
 * Raise an edit flow in Figma before this comes back.
 *
 * ⚠️ THE PANEL'S CONTENT IS `ProductDetails`, WHICH `/check/new` ALSO OPENS.
 * Added / Brand / Size / Ingredients, in that order and with the ingredient
 * list behind its own disclosure — the reasoning for all of it lives on that
 * component. What stays here is what is particular to the HUB's card: the
 * frosted surface, the header, and the Remove action.
 *
 * ⚠️ AND IT HAS A COMPACT FORM, BECAUSE IT IS NOW A BOX INSIDE A BOX. The hub
 * group's cards used to hang under the row as siblings of it, on the canvas,
 * at the full width of the list; they render INSIDE the row's own surface now
 * (see `MyProducts`), and a 24-radius frosted card at the full card padding
 * inside a 16-radius frosted box read as two surfaces arguing rather than as a
 * group containing its products. `compact` steps the whole recipe down one —
 * padding, gap, radius, thumb, title — and makes the fill opaque, which is the
 * house rule for a frosted fill on a frosted surface rather than a decision
 * taken here. The module carries the numbers and the reasoning for each.
 *
 * It is a PROP, not a second component: the card's anatomy, its disclosure,
 * its details panel and its one action are identical in both forms, and the
 * only caller that wants the small one is the hub.
 *
 * The design system has no accordion component; this is composed from the
 * frosted card recipe. It is on the missing-from-the-DS list.
 */
export function ProductAccordionCard({
  product,
  onRemove,
  compact = false,
}: {
  product: SavedProduct;
  onRemove: () => void;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `product-${product.id}`;

  return (
    <div
      className={`${styles.card}${compact ? ` ${styles.compact}` : ""}`}
      data-open={open}
    >
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <ProductThumb product={product} size={compact ? "sm" : "md"} />
        <span className={styles.copy}>
          {/* ⚠️ `Label` COMPACT, `H6` OTHERWISE — both are real styles from the
              ramp, and the smaller card takes the smaller of the two rather
              than an ad-hoc size. Medium weight either way: this is still the
              card's title, not its body. */}
          <span
            className={`${styles.name} ${compact ? "t-label" : "t-h6"}`}
          >
            {fullName(product)}
          </span>
          <span className={`${styles.size} t-label-sm`}>{product.size}</span>
        </span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      <Collapse open={open}>
        <div id={panelId} className={styles.panel}>
          <span className={styles.divider} aria-hidden="true" />

          <ProductDetails product={product} />

          <div className={styles.actions}>
            <button
              type="button"
              className={`${styles.remove} t-label tap-target`}
              onClick={onRemove}
            >
              Remove
            </button>
          </div>
        </div>
      </Collapse>
    </div>
  );
}

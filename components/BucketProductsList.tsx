"use client";

import { useState } from "react";
import styles from "./BucketProductsList.module.css";
import { HubScreen } from "./HubScreen";
import { ProductThumb } from "./ProductThumb";
import { AddProductRow, EmptyBox } from "./ProductList";
import { Tag } from "./Tag";
import { ChevronDownIcon } from "./icons";
import { useInvestigation } from "./InvestigationProvider";
import { useRouter } from "next/navigation";
import {
  BUCKET_LIST_TITLE,
  formatAdded,
  fullName,
  type BucketId,
  type SavedProduct,
} from "@/lib/products";

/**
 * Long-term products list. Figma mobile 581:1593, desktop 583:1924.
 *
 * A hub PUSHED view: a back chevron, no `Save & exit`, no progress track, and a
 * text "Edit" in the header's right-hand slot.
 *
 * ⚠️ ONE COMPONENT SERVES ALL THREE PERIODS. Only the long-term list is drawn,
 * but the screen's content is entirely `bucket`-derived — title, rows, count —
 * and `My Products` links to all three categories. Rendering the other two from
 * the same component follows the design rather than inventing anything; giving
 * long-term its own hardcoded screen would make the sibling links dead.
 *
 * ⚠️ NEITHER "Edit" HAS A DESTINATION. The design defines no edit screen — not
 * in the comps and not in the wireframes — so both the header action and the
 * per-card link are inert here, deliberately, rather than being wired to an
 * invented flow. "Remove" is real: it is the one card action the store can
 * actually perform. This is on the open-questions list.
 */
export function BucketProductsList({ bucket }: { bucket: BucketId }) {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  const products = (answers.products ?? []).filter((p) => p.bucket === bucket);

  return (
    <HubScreen
      title={BUCKET_LIST_TITLE[bucket]}
      subtitle={`${products.length} product${products.length === 1 ? "" : "s"}`}
      backHref="/products"
      action={
        <button type="button" className={`${styles.headerAction} t-label`}>
          Edit
        </button>
      }
    >
      {products.length === 0 ? (
        <EmptyBox>No products in this list yet</EmptyBox>
      ) : (
        <ul className={styles.stack}>
          {products.map((p) => (
            <li key={p.id}>
              <AccordionCard
                product={p}
                onRemove={() =>
                  setAnswer("products", (prev) =>
                    (prev ?? []).filter((x) => x.id !== p.id)
                  )
                }
              />
            </li>
          ))}
        </ul>
      )}

      <div className={styles.addMore}>
        <AddProductRow
          label="Add more products"
          onClick={() => router.push("/investigation/products/long-term")}
        />
      </div>
    </HubScreen>
  );
}

/**
 * One product, collapsed or expanded.
 *
 * ⚠️ THE DURATION TAG IS ONLY ON THE COLLAPSED HEADER. Expanded, the same value
 * appears as the "Duration" detail row, and the comp drops the badge rather than
 * showing it twice. The chevron is the same glyph in both states, rotated —
 * `chevron-up` in Figma is literally a `chevron-down` instance at 180°.
 *
 * The design system has no accordion component; this is composed from the frosted
 * card recipe. It is on the missing-from-the-DS list.
 */
function AccordionCard({
  product,
  onRemove,
}: {
  product: SavedProduct;
  onRemove: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `product-${product.id}`;

  return (
    <div className={styles.card} data-open={open}>
      <button
        type="button"
        className={styles.header}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
      >
        <ProductThumb />
        <span className={styles.copy}>
          <span className={`${styles.name} t-h6`}>{fullName(product)}</span>
          <span className={`${styles.size} t-label-sm`}>{product.size}</span>
        </span>
        {!open && <Tag>{product.duration}</Tag>}
        <ChevronDownIcon className={styles.chevron} />
      </button>

      {open && (
        <div id={panelId} className={`${styles.panel} reveal-quick`}>
          <span className={styles.divider} aria-hidden="true" />

          <dl className={styles.details}>
            <Detail label="Brand" value={product.brand} />
            <Detail label="Size" value={product.size} />
            <Detail label="Duration" value={product.duration} />
            <Detail label="Added" value={formatAdded(product.addedOn)} />
          </dl>

          <div className={styles.actions}>
            <button type="button" className={`${styles.edit} t-label`}>
              Edit
            </button>
            <button type="button" className={`${styles.remove} t-label`} onClick={onRemove}>
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** `detail · …` — label left in Label Small/muted, value right in Body 3. */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.detail}>
      <dt className={`${styles.detailLabel} t-label-sm`}>{label}</dt>
      <dd className={`${styles.detailValue} t-body3`}>{value}</dd>
    </div>
  );
}

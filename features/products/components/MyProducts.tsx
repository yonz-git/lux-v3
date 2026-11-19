"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./MyProducts.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { RoutineSummary } from "./RoutineSummary";
import { Button } from "@/components/ui/Button";
import { Orb } from "@/components/ui/Orb";
import { ProductAccordionCard } from "./ProductAccordionCard";
import { ThumbStack } from "./ThumbStack";
import { EmptyBox } from "./ProductList";
import { AddProductMethodSheet } from "./AddProductMethodSheet";
import { Collapse, COLLAPSE_EXIT_MS } from "@/components/ui/Collapse";
import { ChevronDownIcon } from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { ownedProducts } from "@/features/products/library";
import { useProductLibrary } from "@/features/products/useProductLibrary";
import {
  BUCKETS,
  BUCKET_LIST_TITLE,
  BUCKET_AGE,
  BUCKET_WINDOW,
  UNSORTED_BUCKET,
  countIn,
  type BucketId,
  type SavedProduct,
} from "@/features/products/products";

/**
 * My Products — the PRODUCTS hub landing. ONE screen in two states:
 *   empty  Figma mobile 579:1574, desktop 583:1863
 *   filled Figma mobile 579:1607, desktop 583:1889
 */
export function MyProducts() {
  const { answers } = useInvestigation();
  const { remove: removeProduct } = useProductLibrary("seeded");
  const [sheetOpen, setSheetOpen] = useState(false);
  const products: SavedProduct[] = ownedProducts(answers);

  const categories = [
    ...BUCKETS,
    ...(countIn(products, UNSORTED_BUCKET.id) > 0 ? [UNSORTED_BUCKET] : []),
  ];

  if (products.length === 0) {
    return (
      <HubScreen
        title="Products in use"
        centerHeading
        layout="plain"
        center
        tightTop
      >
        <div className={styles.empty}>
          <Orb animateIn />
          <h2 className="t-h4-h3">No products added yet</h2>
          <p className={`${styles.emptyText} t-body3-body2`}>
            Add products you use to check skin compatibility.
          </p>
          <Button
            width="action"
            className={styles.emptyCta}
            onClick={() => setSheetOpen(true)}
          >
            Search product
          </Button>
        </div>
        <AddProductMethodSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          start="seeded"
        />
      </HubScreen>
    );
  }

  return (
    <>
      <HubScreen
        title="Products in use"
        centerHeading
        layout="card"
        tightTop
        footer={
          <Button href="/check/new">Start analysis</Button>
        }
      >
        <RoutineSummary products={products} />

        <ul className={styles.categories}>
          {categories.map((b) => (
            <li key={b.id}>
              <CategoryGroup
                bucket={b.id}
                products={products.filter((p) => p.bucket === b.id)}
                onRemove={(id) => removeProduct(id)}
                onAdd={() => setSheetOpen(true)}
              />
            </li>
          ))}
        </ul>

        <div className={styles.addMore}>
          <Button
            variant="secondary"
            size="md"
            onClick={() => setSheetOpen(true)}
          >
            Add your products
          </Button>
        </div>
      </HubScreen>

      <AddProductMethodSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        start="seeded"
      />
    </>
  );
}

/**
 * One category: the 56-tall row, and the products it opens onto.
 *
 * The row keeps every part of `My Products — filled`'s recipe — name, window,
 * count — and swaps the trailing `chevron-right` for the rotating
 * `chevron-down`, because it no longer goes anywhere. It is a `<button>` with
 * `aria-expanded` / `aria-controls` rather than a link, which is what tells a
 * screen reader the difference.
 */
function CategoryGroup({
  bucket,
  products,
  onRemove,
  onAdd,
}: {
  bucket: BucketId;
  products: SavedProduct[];
  onRemove: (id: string) => void;
  onAdd: () => void;
}) {
  const [open, setOpen] = useState(false);
  const panelId = `bucket-${bucket}`;
  const n = products.length;

  const [leaving, setLeaving] = useState<ReadonlySet<string>>(() => new Set());
  const pending = useRef(new Set<string>());
  /* the cards this group has already drawn — one missing from it (put back by
     Undo, or added while the group is open) grows in with `appear`. `null`
     until the first render commits, so nothing animates when the screen
     arrives. */
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
    <div className={styles.group} data-open={open}>
      <button
        type="button"
        className={styles.category}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        aria-label={`${BUCKET_LIST_TITLE[bucket]}, ${BUCKET_WINDOW[bucket]}, ${n} product${n === 1 ? "" : "s"}`}
      >
        <span className={styles.copy}>
          <span className={`${styles.categoryName} t-h5`}>
            {BUCKET_LIST_TITLE[bucket]}
          </span>
          <span className={`${styles.window} t-label`}>
            <span className={styles.meter} aria-hidden="true">
              {[1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={styles.bar}
                  data-lit={i <= BUCKET_AGE[bucket] || undefined}
                />
              ))}
            </span>
            {BUCKET_WINDOW[bucket]}
          </span>
        </span>
        {/* nothing to preview in an empty group — and an empty span would
            still take the row's two 12 gaps on either side of it */}
        {n > 0 && <ThumbStack products={products} className={styles.preview} />}
        <span className={`${styles.count} t-h6`}>
          {n}
          {/* the fixed rim light (globals.css `.edge-light`) */}
          <span className="edge-light" aria-hidden="true" />
        </span>
        <ChevronDownIcon className={styles.chevron} />
      </button>

      <Collapse open={open}>
        <div id={panelId} className={styles.panel}>
          {n === 0 ? (
            <EmptyBox
              compact
              action={
                <Button variant="secondary" size="sm" onClick={onAdd}>
                  Add product
                </Button>
              }
            >
              No products yet
            </EmptyBox>
          ) : (
            <ul className={styles.stack}>
              {products.map((p) => (
                <Collapse
                  as="li"
                  key={p.id}
                  open={!leaving.has(p.id)}
                  appear={drawn.current !== null && !drawn.current.has(p.id)}
                >
                  <ProductAccordionCard
                    product={p}
                    compact
                    onRemove={() => leave(p.id)}
                  />
                </Collapse>
              ))}
            </ul>
          )}
        </div>
      </Collapse>
    </div>
  );
}

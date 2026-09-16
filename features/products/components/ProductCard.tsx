import styles from "./ProductCard.module.css";
import { Tag } from "@/components/ui/Tag";
import { ProductArt } from "./ProductArt";
import { ProductDetails } from "./ProductDetails";
import { fullName, type CatalogProduct } from "@/features/products/products";

/**
 * The big product card on `04 — Confirm product` (577:1430) and
 * `04 — Product match` (578:1482).
 *
 * One component, because the two are the same card: an image well, the name
 * and the product's details (Brand, Size, the ingredients dropdown). Product
 * match adds a "N% match" `Tag` above the image. (Confirm showed the
 * catalogue description under an `Ingredients` label until 16 Sep 2026.)
 *
 * ⚠️ THE IMAGE WELL WAS A CAMERA GLYPH, AND IS NOW A DRAWN VESSEL. There was
 * no product imagery in the file and no product icon in the design system, so
 * both comps draw a camera on `bg/surface-frost`. This is the screen that asks
 * "is this it?" — a camera is the one picture that cannot answer that question,
 * because it is the same picture for every product. A product sourced from Open
 * Beauty Facts used to bring a real photo here and that photo used to win.
 * It no longer does: OBF's images are crowdsourced with no quality gate, so
 * "is this it?" was being answered by a stub or an angled box about as often
 * as by a usable front-of-package shot. A drawing that is always the right
 * vessel in the right brand tint answers it more reliably than a photo that is
 * sometimes right. See `ProductArt` and lib/openBeautyFacts.ts.
 *
 * The well stays OPAQUE — a frosted well would show the canvas gradient
 * through the artwork.
 */
export function ProductCard({
  product,
  matchScore,
}: {
  product: CatalogProduct;
  /** renders the "92% match" brand Tag above the image */
  matchScore?: number;
}) {
  return (
    <div className={styles.card}>
      {matchScore != null && (
        <span className={styles.badge}>
          <Tag variant="brand">{matchScore}% match</Tag>
        </span>
      )}

      <div className={styles.image} aria-hidden="true">
        <ProductArt product={product} className={styles.art} />
      </div>

      <p className={`${styles.name} t-h5`}>{fullName(product)}</p>
      {/* ⚠️ NO SIZE UNDER THE NAME — removed 15 Sep 2026, asked for directly
          for every product title in the app.
          ⚠️ THE PRODUCT'S DETAILS, NOT A LABELLED DESCRIPTION — 16 Sep 2026,
          asked for directly ("edit this way so ingredients are dropdown",
          then "there is no info"). The block here read `Ingredients` over the
          catalogue's one-line DESCRIPTION, which is not an ingredient list.
          It is `ProductDetails` now, the record the product cards open onto:
          Brand, Size and the ingredients dropdown, each saying `Not set` when
          the product lacks it — so a live search result with no INCI list
          still shows what is and is not known rather than nothing. No
          `addedOn` here, so no `Added` row: it is not in the library yet. */}
      <ProductDetails product={product} />
    </div>
  );
}

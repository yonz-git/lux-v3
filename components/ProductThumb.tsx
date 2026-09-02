import styles from "./ProductThumb.module.css";
import { ProductArt } from "./ProductArt";
import type { CatalogProduct } from "@/lib/products";

/**
 * The square product thumbnail on every product row — Figma `product-thumb`,
 * 48x48 (`size/control-md`), radius/md, `bg/surface-frost` + 1px `border/subtle`.
 *
 * ⚠️ THE CAMERA GLYPH IS GONE. The comps draw a 20px camera in `icon/muted`
 * here because the design system has no product imagery and no bottle icon —
 * fine on one card, and useless down a list, where every row then carries the
 * same mark and the thumbnail identifies nothing. It now falls back to a drawn
 * vessel tinted per brand; see `ProductArt`, which owns that decision.
 *
 * ⚠️ AND SO IS THE PHOTOGRAPH. This well used to prefer a real Open Beauty
 * Facts image and drop to the illustration only when one was missing, broken
 * or too small — which meant a search result list drew some rows from a photo
 * and some from a vessel, at different croppings and colour temperatures. Two
 * kinds of picture in one column is worse at telling rows apart than either
 * kind alone. Every product is drawn now; see lib/openBeautyFacts.ts, which no
 * longer even requests the image fields.
 *
 * ⚠️ IT TAKES THE PRODUCT, NOT A URL. It used to take `imageUrl` alone, which
 * is all a photo needs; an illustration needs to know WHICH product it is
 * drawing. Every call site already had the product in hand.
 *
 * `04 — Confirm product`'s larger `product-image` is the same idea at 352x140 —
 * see ProductCard.
 */
export function ProductThumb({
  className,
  product,
}: {
  className?: string;
  product: CatalogProduct;
}) {
  return (
    <span className={[styles.thumb, className].filter(Boolean).join(" ")} aria-hidden="true">
      <ProductArt product={product} className={styles.art} />
    </span>
  );
}

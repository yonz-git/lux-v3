import styles from "./ThumbStack.module.css";
import { ProductArt } from "./ProductArt";
import type { CatalogProduct } from "@/features/products/products";

/**
 * ⚠️ HOW MANY PRODUCTS THE DECK DRAWS, AND IT IS PAIRED WITH CSS. `.thumb`'s
 * three `:nth-child` rules stack the wells front to back, so a fourth well
 * would render behind the third rather than in front of it. Change both or
 * neither.
 *
 * Three is not a shortening of the list — every caller puts a count beside the
 * deck already, so a "+2" badge on top of it would be the same number twice.
 */
const PREVIEW_MAX = 3;

/**
 * ⚠️ NOT IN FIGMA — a deck of the first three products, overlapping, on the
 * right of a row that names a group of them, drawn on `MyProducts`' closed
 * category rows. See `MyProducts` for why a closed row wanted it.
 *
 * It is `ProductArt` at 28 in the same opaque well `ProductThumb` uses at 48 —
 * the existing recipe at a smaller size, not a new one. What the pictures carry
 * is IDENTITY rather than detail: same packaging → same kind of bottle. At this
 * size a product is not identifiable and is not meant to be. ⚠️ They were drawn
 * vessels tinted per brand until 26 Sep 2026; they are photographs picked by
 * packaging type now, so brand no longer changes the picture — see `ProductArt`.
 *
 * ⚠️ THE SIZE IS A LITERAL AND OFF THE SIZE SCALE, deliberately. It was 28
 * (between `--size-*`'s 24 and 32), went to 56 on 15 Sep 2026 and settled at
 * 40 the same day (between 36 and 48), and this well is neither an icon nor
 * a control, so binding a token
 * would name it as something it is not. Raise a `product-thumb / small` in
 * Figma and this becomes a token.
 *
 * ⚠️ DECORATIVE — `aria-hidden`, and no per-product alt text. Every caller's
 * row already names what the group holds; the pictures illustrate a group,
 * they are not a list of products.
 *
 * `className` goes on the deck itself, so a caller can fade or place it
 * (`MyProducts` fades it while its group is open).
 */
export function ThumbStack({
  products,
  className,
}: {
  products: CatalogProduct[];
  className?: string;
}) {
  if (products.length === 0) return null;

  return (
    <span
      className={`${styles.stack}${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    >
      {products.slice(0, PREVIEW_MAX).map((p) => (
        <span key={p.id} className={styles.thumb}>
          <ProductArt product={p} className={styles.art} />
        </span>
      ))}
    </span>
  );
}

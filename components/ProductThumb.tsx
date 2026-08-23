import styles from "./ProductThumb.module.css";
import { CameraIcon } from "./icons";
import { useProductPhoto } from "@/lib/useProductPhoto";

/**
 * The square product thumbnail on every product row — Figma `product-thumb`,
 * 48x48 (`size/control-md`), radius/md, `bg/surface-frost` + 1px `border/subtle`,
 * holding a 20px camera glyph in `icon/muted`.
 *
 * ⚠️ THE GLYPH IS A PLACEHOLDER, NOT AN ICON CHOICE. The design system has no
 * product or bottle icon outside the bottom nav, so every thumb in the file
 * shows a camera by default. When a product carries a real photo — Open
 * Beauty Facts search results, or a scan match enriched by
 * `useEnrichedProduct` — that photo fills the well instead; `imageUrl` is
 * absent for the offline fixture, which is when the glyph still shows. A
 * photo that 404s or loads in too small (see `useProductPhoto`) also falls
 * back to the glyph rather than rendering a broken or near-blank image.
 *
 * `04 — Confirm product`'s larger `product-image` is the same idea at 352x140
 * with a 24px glyph — see ProductCard.
 */
export function ProductThumb({
  className,
  imageUrl,
}: {
  className?: string;
  imageUrl?: string;
}) {
  const { showPhoto, onLoad, onError } = useProductPhoto(imageUrl);

  return (
    <span className={[styles.thumb, className].filter(Boolean).join(" ")} aria-hidden="true">
      {showPhoto ? (
        <img src={imageUrl} alt="" className={styles.photo} onLoad={onLoad} onError={onError} />
      ) : (
        <CameraIcon className={styles.glyph} />
      )}
    </span>
  );
}

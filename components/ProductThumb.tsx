import styles from "./ProductThumb.module.css";
import { CameraIcon } from "./icons";

/**
 * The square product thumbnail on every product row — Figma `product-thumb`,
 * 48x48 (`size/control-md`), radius/md, `bg/surface-frost` + 1px `border/subtle`,
 * holding a 20px camera glyph in `icon/muted`.
 *
 * ⚠️ THE GLYPH IS A PLACEHOLDER, NOT AN ICON CHOICE. The design system has no
 * product or bottle icon outside the bottom nav, so every thumb in the file
 * shows a camera. Replace it the day that icon exists, in the DS first.
 *
 * `04 — Confirm product`'s larger `product-image` is the same idea at 352x140
 * with a 24px glyph — see ProductCard.
 */
export function ProductThumb({ className }: { className?: string }) {
  return (
    <span className={[styles.thumb, className].filter(Boolean).join(" ")} aria-hidden="true">
      <CameraIcon className={styles.glyph} />
    </span>
  );
}

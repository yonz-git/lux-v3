import type { CatalogProduct } from "@/features/products/products";
import styles from "./ProductArt.module.css";

/**
 * ⚠️ NOT IN FIGMA — the product picture that replaces the camera glyph.
 *
 * Every image well in the file (`ProductThumb` 48x48 and 36x36, `ProductCard`'s
 * 352x140, `ThumbStack`) was drawn in the comps as a camera glyph on
 * `bg/surface-frost`, because the design system has no product imagery. That
 * reads as "no photo yet" ONCE; down a list it identifies nothing, which is the
 * one thing a thumbnail exists to do.
 *
 * ⚠️ IT IS A PHOTOGRAPH NOW, AS OF 26 Sep 2026 — asked for directly. From the
 * glyph's removal until then it was a DRAWN VESSEL: nine SVG silhouettes
 * tinted per brand. The drawings were replaced by eight transparent product
 * cut-outs in `public/images/products/`, made from the reference photographs
 * the user supplied plus one generated render. The two paired shots were split
 * into single bottles, because a well shows ONE product.
 *
 * ⚠️ THE PHOTO IS CHOSEN BY PACKAGING TYPE, NOT BY PRODUCT. There are eight
 * pictures and an unbounded list (every live Open Beauty Facts result lands
 * here too), so `artFor` still decides the product's FORM exactly as the
 * drawings did — the `ART` table for the catalogue, `formFor` from the
 * product's own words for everything else — and the form picks from its own
 * few photos by the stable `hash` of the id. A tub is a jar and a serum is a
 * dropper on every screen. ⚠️ **Two products of one form can share a photo** —
 * the drawings could vary tint and label per brand, eight photographs cannot.
 * That is a known loss of identity down a long list, and the fix is more
 * photographs, not a return to the drawings.
 *
 * ⚠️ IT IS NOT A BRAND MARK, AND IT MUST NOT READ AS THE PRODUCT IN THE ROW.
 * A CeraVe row showing another house's bottle is a picture of the wrong
 * product; it is only honest while the packaging carries no house name. So
 * the house names were painted out of the source photographs and generic
 * words set in their place, in Figtree: `pump-milky` and `bottle-milky` read
 * "hydrator", both `cylinder-*` read "RETINOL", `dropper-green` reads
 * "ORGANIC SERUM", and `jar-olive` lost its mark with nothing in its place.
 * `pump-grey` and `bottle-brown` never carried one. **A new photograph must be
 * cleaned the same way before it goes in.** At 40px none of the words can be
 * read; what matters is that no logo SHAPE is left to read as a mark.
 *
 * ⚠️ STILL ONE KIND OF PICTURE FOR EVERY ROW. A real Open Beauty Facts
 * photograph used to win over the fallback, and a column mixing the two read
 * worse than either alone; see lib/openBeautyFacts.ts, which still does not
 * request the image fields. Every product, catalogue or live, gets one of these.
 *
 * ⚠️ `object-fit: contain`, NOT `cover`. The wells are different shapes — a
 * square and a 352x140 letterbox — and a cover crop would cut the cap off every
 * bottle in the letterbox. The cut-outs are transparent, so the well's own
 * opaque fill stays the ground, the same thing the drawings relied on.
 */

/**
 * The packaging types. One per silhouette, not per product.
 *
 * ⚠️ NINE, NOT THE ORIGINAL FIVE. Five covered the thirteen fixture products
 * and nothing else, which was fine while the catalogue WAS the search. Now that
 * `/check/new` and the add tray both search Open Beauty Facts live, the list is
 * whatever the database holds — masks, mists, sticks, ointments.
 */
type Form =
  | "tub"
  | "pump"
  | "tube"
  | "dropper"
  | "bottle"
  | "airless"
  | "spray"
  | "sachet"
  | "tin";

/** In a fixed order, so the hashed fallback below is stable across reloads. */
const FORMS: Form[] = [
  "tub",
  "pump",
  "tube",
  "dropper",
  "bottle",
  "airless",
  "spray",
  "sachet",
  "tin",
];

const DIR = "/images/products";

/**
 * Form → the photographs that can stand for it. The nearest shape wins where
 * no photograph matches exactly: a tin is drawn as the jar, a tube and a sachet
 * as the slim frosted cylinders, a spray as the capped bottles.
 */
const PHOTOS: Record<Form, string[]> = {
  tub: ["jar-olive"],
  tin: ["jar-olive"],
  pump: ["pump-grey", "pump-milky"],
  bottle: ["bottle-milky", "bottle-brown"],
  spray: ["bottle-milky", "bottle-brown"],
  dropper: ["dropper-green"],
  airless: ["cylinder-red", "cylinder-violet"],
  tube: ["cylinder-violet", "cylinder-red"],
  sachet: ["cylinder-violet", "cylinder-red"],
};

/**
 * A small stable hash — FNV-1a. Deterministic, so the picture for a given
 * product is the same on the search row, in the basket, on the results card and
 * after a reload. It must never be `Math.random()` or an index: a thumbnail
 * that changes identity between two screens is worse than one that repeats.
 */
function hash(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

/**
 * The catalogue's forms. Form follows what the product actually comes in — a
 * 16 oz tub is a tub and a 12 oz pump is a pump, which is exactly the pair of
 * rows `searchCatalog` had to grow a size field to tell apart.
 */
const ART: Record<string, Form> = {
  "cerave-moisturizing-cream-16": "tub",
  "cerave-moisturizing-cream-12": "pump",
  "cerave-moisturizing-lotion-12": "pump",
  "cerave-am-lotion-spf30": "tube",
  "cerave-niacinamide-body-lotion": "pump",
  "cerave-foaming-cleanser": "bottle",
  "lrp-toleriane-double-repair": "tub",
  "lrp-cicaplast-baume-b5": "tube",
  "lrp-retinol-b3-serum": "dropper",
  "the-ordinary-niacinamide": "dropper",
  "paulas-choice-niacinamide-serum": "dropper",
  "paulas-choice-bha-exfoliant": "bottle",
  "good-molecules-niacinamide-toner": "bottle",
};

/** Silhouette from the product's own words, for anything off the catalogue.
 *  Ordered most specific first: "foaming cleanser" is a pump, not a bottle, and
 *  a "face mist" is a spray before it is a water. */
function formFor(name: string): Form {
  const n = name.toLowerCase();
  if (/sachet|sample|sheet mask|patch|stick pack|wipes?/.test(n)) return "sachet";
  if (/mist|spray|setting|thermal water|atomi[sz]er/.test(n)) return "spray";
  if (/serum|drops?|\boil\b|ampoule|concentrate|elixir|booster/.test(n)) {
    return "dropper";
  }
  if (/salve|ointment|\btin\b|pomade|lip balm|paste/.test(n)) return "tin";
  if (/cleanser|wash|foam|shampoo|\bgel\b|micellar/.test(n)) return "pump";
  if (/toner|essence|water|exfoliant|liquid|peel/.test(n)) return "bottle";
  if (/balm|spf|sunscreen|mask|tube|primer|\bbb\b|\bcc\b/.test(n)) return "tube";
  if (/cream|butter|jar|\btub\b|\bpot\b|moistur/.test(n)) return "tub";
  if (/treatment|repair|night|\bpm\b|complex/.test(n)) return "airless";
  if (/lotion|milk|emulsion|fluid/.test(n)) return "pump";
  /* ⚠️ THE FALLBACK IS HASHED, NOT A FIXED FORM. Returning one form for
     anything unrecognised — most of a live search — would draw every such row
     the same. Spreading the unknowns over all nine keeps a list legible as a
     list of different things, and it is stable per product. */
  return FORMS[hash(n) % FORMS.length];
}

function photoFor(product: CatalogProduct): string {
  const form = ART[product.id] ?? formFor(`${product.name} ${product.size}`);
  const options = PHOTOS[form];
  return `${DIR}/${options[hash(product.id) % options.length]}.webp`;
}

/** The picture, at whatever size the well gives it. Decorative: every well is
 *  `aria-hidden` and the product's name is always printed beside it.
 *
 *  ⚠️ NOT `loading="lazy"`. A group on the PRODUCTS hub opens with `Collapse`,
 *  and a lazy image inside a closed panel has not been fetched, so the bottles
 *  popped in after the panel had already slid open. The eight files are a few
 *  KB each and repeat on every screen; eager is cheaper than the pop. */
export function ProductArt({
  product,
  className,
}: {
  product: CatalogProduct;
  className?: string;
}) {
  return (
    // biome-ignore lint/performance/noImgElement: a fixed local cut-out filling a CSS-sized well; next/image adds nothing here
    <img
      className={[styles.photo, className].filter(Boolean).join(" ")}
      src={photoFor(product)}
      alt=""
      decoding="async"
      draggable={false}
    />
  );
}

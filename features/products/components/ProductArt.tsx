import type { CatalogProduct } from "@/features/products/products";
import styles from "./ProductArt.module.css";

/** The packaging types. One per silhouette, not per product. */
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
  return FORMS[hash(n) % FORMS.length];
}

function photoFor(product: CatalogProduct): string {
  const form = ART[product.id] ?? formFor(`${product.name} ${product.size}`);
  const options = PHOTOS[form];
  return `${DIR}/${options[hash(product.id) % options.length]}.webp`;
}

/**
 * The picture, at whatever size the well gives it. Decorative: every well is
 *  `aria-hidden` and the product's name is always printed beside it.
 */
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

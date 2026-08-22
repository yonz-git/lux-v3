/**
 * PRODUCTS — the data behind step 8 and the Products hub.
 *
 * Figma: `HANDOFF — PRODUCTS` (586:1884) on page `06. Screen Designs`, mobile
 * row y=6600. 12 screens x 2 breakpoints.
 *
 * The catalogue is the set of products the comps actually name, so the search
 * results and the AI "match" are the designed ones rather than invented
 * placeholders. It is a fixture, not a database — a real build would query one.
 */

/** The three time periods the intro screen promises. */
export type BucketId = "long-term" | "recent" | "new-addition";

export type Bucket = {
  id: BucketId;
  /** the row title on `My Products — filled` and the intro's time-buckets */
  name: string;
  /** the `duration` label beside it on the intro screen */
  window: string;
};

export const BUCKETS: Bucket[] = [
  { id: "long-term", name: "Long term", window: "4+ weeks" },
  { id: "recent", name: "Recent", window: "1–4 weeks" },
  { id: "new-addition", name: "New addition", window: "< 1 week" },
];

/**
 * ⚠️ `My Products — filled` (579:1607) titles the first row "Long-term
 * products", while the intro's bucket row (574:1342) says "Long term". Both
 * strings are in the file, so both are kept rather than one being normalised
 * away: `name` is the intro label, `listTitle` is the hub label.
 */
export const BUCKET_LIST_TITLE: Record<BucketId, string> = {
  "long-term": "Long-term products",
  recent: "Recent",
  "new-addition": "New addition",
};

/** The four durations on `04 — Confirm product` / `04 — Product match`. */
export const DURATIONS = [
  "4+ weeks",
  "1–4 weeks",
  "Less than 1 week",
  "Not sure",
] as const;

export type Duration = (typeof DURATIONS)[number];

/**
 * Which period a product lands in.
 *
 * ⚠️ A TRANSLATION DECISION, flagged rather than assumed. The add flow is
 * written as three consecutive periods ("We'll go through three time periods"),
 * but only the FIRST — long-term — is designed, at both breakpoints. If the
 * bucket came from the flow position alone, every product would be long-term
 * and `My Products — filled`'s Recent and New addition rows could never be
 * anything but zero. Deriving it from the duration answer is what makes the hub
 * reflect what the user actually said. "Not sure" keeps the period the user is
 * currently in, which is the only information available.
 */
export function bucketFor(duration: Duration, current: BucketId): BucketId {
  switch (duration) {
    case "4+ weeks":
      return "long-term";
    case "1–4 weeks":
      return "recent";
    case "Less than 1 week":
      return "new-addition";
    case "Not sure":
      return current;
  }
}

/** A product in the catalogue — no duration yet, because that is the answer. */
export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  size: string;
  description?: string;
};

/** A product the user has added: a catalogue entry plus their answers. */
export type SavedProduct = CatalogProduct & {
  duration: Duration;
  bucket: BucketId;
  /** ISO date, rendered as "Aug 5, 2026" on the expanded accordion card */
  addedOn: string;
};

/**
 * The product being added right now. It lives in the answer store rather than a
 * URL param so Confirm and Product match can both read it, and so the flow
 * survives a back-and-forward without re-picking.
 */
export type ProductDraft = {
  product: CatalogProduct;
  duration?: Duration;
  /** the period the user was in when they started adding */
  bucket: BucketId;
  /** "92% match" on 04 — Product match; absent when the product was searched */
  matchScore?: number;
  /**
   * The answer to "Is this the right product?" / "Is this correct?". It is an
   * ANSWER, not an action: the Yes/No pair sits under a question, and the
   * footer's Continue is what commits. See ProductConfirmScreen.
   */
  confirmed?: boolean;
};

/** The products `04 — Search by name` (576:1428) lists for "CeraVe moist". */
export const CATALOG: CatalogProduct[] = [
  {
    id: "cerave-moisturizing-cream-16",
    name: "Moisturizing Cream",
    brand: "CeraVe",
    size: "16 oz tub",
    description: "Moisturizing cream with hyaluronic acid and ceramides",
  },
  {
    id: "cerave-moisturizing-cream-12",
    name: "Moisturizing Cream",
    brand: "CeraVe",
    size: "12 oz pump",
    description: "Moisturizing cream with hyaluronic acid and ceramides",
  },
  {
    id: "cerave-moisturizing-lotion-12",
    name: "Moisturizing Lotion",
    brand: "CeraVe",
    size: "12 oz",
    description: "Lightweight moisturizing lotion with ceramides and niacinamide",
  },
  {
    id: "cerave-am-lotion-spf30",
    name: "AM Facial Moisturizing Lotion SPF 30",
    brand: "CeraVe",
    size: "3 oz",
    description: "Daytime moisturizer with broad-spectrum SPF 30",
  },
  {
    id: "lrp-toleriane-double-repair",
    name: "Toleriane Double Repair",
    brand: "La Roche-Posay",
    size: "2.5 fl oz",
    description: "Face moisturizer with ceramide-3 and niacinamide",
  },
  {
    id: "lrp-cicaplast-baume-b5",
    name: "Cicaplast Baume B5",
    brand: "La Roche-Posay",
    size: "1.35 fl oz",
    description: "Soothing multi-purpose balm with panthenol",
  },
  {
    id: "the-ordinary-niacinamide",
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    size: "1 fl oz",
    description: "High-strength blemish formula",
  },
];

/**
 * The product `04 — Product match` (578:1482) proposes after a scan, with the
 * comp's own 92% score. A real build would run this against the photo.
 */
export const SCAN_MATCH = {
  productId: "lrp-toleriane-double-repair",
  score: 92,
} as const;

export function productById(id: string): CatalogProduct | undefined {
  return CATALOG.find((p) => p.id === id);
}

/** The row title: the comps write "CeraVe Moisturizing Cream", brand first. */
export function fullName(p: CatalogProduct): string {
  return `${p.brand} ${p.name}`;
}

/** The `meta` line under a search result: "CeraVe — 16 oz tub". */
export function resultMeta(p: CatalogProduct): string {
  return `${p.brand} — ${p.size}`;
}

/**
 * A forgiving substring search over brand + name, so "cerave moist" matches the
 * four products the comp shows. Every term must appear somewhere.
 */
export function searchCatalog(query: string): CatalogProduct[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];
  return CATALOG.filter((p) => {
    const haystack = `${p.brand} ${p.name}`.toLowerCase();
    return terms.every((t) => haystack.includes(t));
  });
}

export function countIn(products: SavedProduct[], bucket: BucketId): number {
  return products.filter((p) => p.bucket === bucket).length;
}

/** "Aug 5, 2026" — the format on the expanded accordion card. */
export function formatAdded(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

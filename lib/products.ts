/**
 * PRODUCTS — the data behind step 5 and the Products hub.
 *
 * Figma: `HANDOFF — PRODUCTS` (586:1884) on page `06. Screen Designs`, mobile
 * row y=6600. 12 screens x 2 breakpoints.
 *
 * The catalogue is the set of products the comps actually name, so the search
 * results and the AI "match" are the designed ones rather than invented
 * placeholders.
 *
 * ⚠️ IT IS THE OFFLINE FALLBACK, NOT THE LIVE SOURCE. The add-product tray
 * queries Open Beauty Facts (lib/openBeautyFacts.ts) — a real, free cosmetics
 * database with real photos and INCI ingredient lists — and only falls back to
 * `searchCatalog` below when that request fails. The scan view's hardcoded
 * `SCAN_MATCH` still resolves through this fixture, then gets enriched with a
 * live photo/ingredients by `useEnrichedProduct`, because the viewfinder is a
 * placeholder with no barcode to look up.
 */

/**
 * The groups a product can land in.
 *
 * The first three are the designed time periods. `not-sure` is a FOURTH group
 * with no Figma frame — see `UNSORTED_BUCKET`.
 */
export type BucketId = "long-term" | "recent" | "new-addition" | "not-sure";

export type Bucket = {
  id: BucketId;
  /** the row title on `My Products — filled` and the old intro's time-buckets */
  name: string;
  /** the `duration` label beside it */
  window: string;
};

/**
 * The three designed time periods, always rendered on the hub even when empty —
 * a category that disappears when it empties makes the list look like it lost
 * something.
 */
export const BUCKETS: Bucket[] = [
  { id: "long-term", name: "Long term", window: "4+ weeks" },
  { id: "recent", name: "Recent", window: "1–4 weeks" },
  { id: "new-addition", name: "New addition", window: "< 1 week" },
];

/**
 * ⚠️ A FOURTH GROUP, NOT IN FIGMA, AND SHOWN ONLY WHEN IT HAS SOMETHING IN IT.
 *
 * The add flow used to run as three consecutive PERIODS, so "Not sure" could
 * fall back to whichever period the user was standing in
 * (`bucketFor(duration, current)`). Step 5 no longer has periods to stand in —
 * the duration answer is the only input — so that fallback had nowhere to read
 * `current` from.
 *
 * Binning "Not sure" into Long term was the tempting fix and it is the wrong
 * one: for a flare investigation, "I don't know how long I've used this" is
 * diagnostically different from "I've used it for months", and the whole point
 * of the timeline is correlating products against the flare date step 4
 * collects. An honest answer stays honest.
 *
 * It is kept OUT of `BUCKETS` so the hub still always shows exactly the three
 * designed periods, and appends this one only when `countIn` is non-zero.
 */
export const UNSORTED_BUCKET: Bucket = {
  id: "not-sure",
  name: "Not sure",
  window: "unknown",
};

/** Every group, designed or not — for routing, grouping and validation. */
export const ALL_BUCKETS: Bucket[] = [...BUCKETS, UNSORTED_BUCKET];

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
  "not-sure": "Not sure",
};

/** `Bucket.window`, keyed for lookup by id — the group headers on `Your
 *  products` show it beside the group name, the same pairing the hub uses. */
export const BUCKET_WINDOW: Record<BucketId, string> = {
  "long-term": "4+ weeks",
  recent: "1–4 weeks",
  "new-addition": "< 1 week",
  "not-sure": "unknown",
};

/** The four durations the add-product tray asks about, once per product. */
export const DURATIONS = [
  "4+ weeks",
  "1–4 weeks",
  "Less than 1 week",
  "Not sure",
] as const;

export type Duration = (typeof DURATIONS)[number];

/**
 * Which group a product lands in — THE ONLY PLACE THAT DECIDES.
 *
 * ⚠️ IT TAKES ONE ARGUMENT NOW. It used to take the period the user was
 * standing in as a second argument, and `durationForBucket()` existed as its
 * inverse for the entry points that decided the period FIRST. Two mutually
 * inverse functions in one module meant nobody could say which end was the
 * source of truth, and the entry points that set the period were the bug: the
 * old intro's three period rows all opened the tray without setting one, so
 * every product filed under Long term whichever row was tapped.
 *
 * Step 5 asks the duration once, per product, with the product on screen. The
 * duration is the answer; the group is derived. Nothing sets a group directly.
 */
export function bucketFor(duration: Duration): BucketId {
  switch (duration) {
    case "4+ weeks":
      return "long-term";
    case "1–4 weeks":
      return "recent";
    case "Less than 1 week":
      return "new-addition";
    case "Not sure":
      return "not-sure";
  }
}

/** A product in the catalogue — no duration yet, because that is the answer. */
export type CatalogProduct = {
  id: string;
  name: string;
  brand: string;
  size: string;
  description?: string;
  /** A real product photo, when the catalogue entry came from Open Beauty
   *  Facts. Absent for the local fixture — `ProductThumb`/`ProductCard` fall
   *  back to the camera-glyph placeholder. See lib/openBeautyFacts.ts. */
  imageUrl?: string;
};

/** A product the user has added: a catalogue entry plus their answers. */
export type SavedProduct = CatalogProduct & {
  duration: Duration;
  bucket: BucketId;
  /** ISO date, rendered as "Aug 5, 2026" on the expanded accordion card */
  addedOn: string;
};

/**
 * The product being added right now — held while the tray walks the user from
 * "is this it?" to "how long have you used it?".
 *
 * ⚠️ IT CARRIES NO GROUP. The group is derived from `duration` on commit, by
 * `bucketFor`, and by nothing else. It used to carry a `bucket` set before the
 * product was even chosen, which is the ordering this step was rebuilt to undo.
 *
 * It lives in the answer store rather than local state so a draft survives the
 * tray being scrolled or re-rendered; `AddProductMethodSheet` clears it on
 * close. Where the tray is in the sequence is local state there — this is the
 * data, not the position.
 */
export type ProductDraft = {
  product: CatalogProduct;
  /** the answer to "how long have you used it?" — becomes the group */
  duration?: Duration;
  /** "92% match" after a scan; absent when the product was searched for */
  matchScore?: number;
};

/** The products `04 — Search by name` (576:1428) lists for "CeraVe moist" —
 *  and, because Open Beauty Facts answers that exact query with zero results,
 *  what the tray actually shows for it. See useOpenBeautyFactsSearch. */
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

/** The `meta` line under a search result: "CeraVe — 16 oz tub". Live Open
 *  Beauty Facts entries sometimes carry no size, so the dash is dropped
 *  rather than trailing on nothing. */
export function resultMeta(p: CatalogProduct): string {
  return p.size ? `${p.brand} — ${p.size}` : p.brand;
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

/**
 * The added products, split into their groups — EMPTY GROUPS OMITTED, in
 * `ALL_BUCKETS` order (longest-used first, "Not sure" last).
 *
 * This is what makes step 5 sort itself in front of the user rather than
 * announcing the result on a screen afterwards. `Your products` renders a flat
 * list while everything sits in one group and grows headers the moment a second
 * group fills — so the user watches the sorting happen, and there is nothing
 * left for an end-of-step reveal screen to show them.
 *
 * The hub is the opposite case and stays that way: it always lists all three
 * designed periods including the empty ones (see `BUCKETS`), because there a
 * missing row reads as a lost category rather than as a group not yet needed.
 */
export function groupProducts(
  products: SavedProduct[]
): { bucket: Bucket; products: SavedProduct[] }[] {
  return ALL_BUCKETS.map((bucket) => ({
    bucket,
    products: products.filter((p) => p.bucket === bucket.id),
  })).filter((g) => g.products.length > 0);
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

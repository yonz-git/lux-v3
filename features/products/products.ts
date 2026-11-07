import { fromIso } from "@/lib/date";

/**
 * PRODUCTS — the data behind step 5 and the Products hub.
 *
 * Figma: `HANDOFF — PRODUCTS` (586:1884) on page `06. Screen Designs`, mobile
 * row y=6600. 12 screens x 2 breakpoints.
 *
 * The catalogue is the set of products the comps actually name, so the search
 * results and the AI "match" are the designed ones rather than invented
 * placeholders.
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

export const UNSORTED_BUCKET: Bucket = {
  id: "not-sure",
  name: "Not sure",
  window: "unknown",
};

/** Every group, designed or not — for routing, grouping and validation. */
export const ALL_BUCKETS: Bucket[] = [...BUCKETS, UNSORTED_BUCKET];

export const BUCKET_LIST_TITLE: Record<BucketId, string> = {
  "long-term": "Long-term products",
  recent: "Recent",
  "new-addition": "New addition",
  "not-sure": "Not sure",
};

export const BUCKET_TAG: Record<BucketId, string> = {
  "long-term": "Long-term",
  recent: "Recent",
  "new-addition": "New",
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

export const BUCKET_AGE: Record<BucketId, 0 | 1 | 2 | 3> = {
  "long-term": 3,
  recent: 2,
  "new-addition": 1,
  "not-sure": 0,
};

/** A group's name in the routine card's key, after its count: "3 long term",
 *  "1 new". Lower case because it finishes a phrase rather than heading a row. */
export const BUCKET_KEY_LABEL: Record<BucketId, string> = {
  "long-term": "long term",
  recent: "recent",
  "new-addition": "new",
  "not-sure": "not sure",
};

/** The four durations the add-product tray asks about, once per product. */
export const DURATIONS = [
  "4+ weeks",
  "1–4 weeks",
  "Less than 1 week",
  "Not sure",
] as const;

export type Duration = (typeof DURATIONS)[number];

/** Which group a product lands in — THE ONLY PLACE THAT DECIDES. */
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
  /**
   * The FULL INCI list, when one is known. `description` is the same text cut
   * to 240 for the confirm card; this is what the checker reads.
   */
  ingredients?: string;
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
 */
export type ProductDraft = {
  product: CatalogProduct;
  /** the answer to "how long have you used it?" — becomes the group */
  duration?: Duration;
  /** "92% match" after a scan; absent when the product was searched for */
  matchScore?: number;
};

/**
 * The products `04 — Search by name` (576:1428) lists for "CeraVe moist" —
 *  and, because Open Beauty Facts answers that exact query with zero results,
 *  what the tray actually shows for it. See useOpenBeautyFactsSearch.
 */
export const CATALOG: CatalogProduct[] = [
  {
    id: "cerave-moisturizing-cream-16",
    name: "Moisturizing Cream",
    brand: "CeraVe",
    size: "16 oz tub",
    description: "Moisturizing cream with hyaluronic acid and ceramides",
    ingredients:
      "Aqua/Water, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Cetyl Alcohol, Ceteareth-20, Petrolatum, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Dimethicone, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium EDTA, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin",
  },
  {
    id: "cerave-moisturizing-cream-12",
    name: "Moisturizing Cream",
    brand: "CeraVe",
    size: "12 oz pump",
    description: "Moisturizing cream with hyaluronic acid and ceramides",
    ingredients:
      "Aqua/Water, Glycerin, Cetearyl Alcohol, Caprylic/Capric Triglyceride, Cetyl Alcohol, Ceteareth-20, Petrolatum, Potassium Phosphate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Dimethicone, Behentrimonium Methosulfate, Sodium Lauroyl Lactylate, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium EDTA, Dipotassium Phosphate, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin",
  },
  {
    id: "cerave-moisturizing-lotion-12",
    name: "Moisturizing Lotion",
    brand: "CeraVe",
    size: "12 oz",
    description: "Lightweight moisturizing lotion with ceramides and niacinamide",
    ingredients:
      "Aqua/Water, Glycerin, Caprylic/Capric Triglyceride, Behentrimonium Methosulfate, Cetearyl Alcohol, Ceteareth-20, Cetyl Alcohol, Niacinamide, Sodium Hyaluronate, Ceramide NP, Ceramide AP, Ceramide EOP, Carbomer, Dimethicone, Cholesterol, Phenoxyethanol, Disodium EDTA, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin",
  },
  {
    id: "cerave-am-lotion-spf30",
    name: "AM Facial Moisturizing Lotion SPF 30",
    brand: "CeraVe",
    size: "3 oz",
    description: "Daytime moisturizer with broad-spectrum SPF 30",
    ingredients:
      "Homosalate, Octocrylene, Ethylhexyl Salicylate, Aqua/Water, Glycerin, Niacinamide, Butyloctyl Salicylate, Silica, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Cetearyl Alcohol, Ceteareth-20, Dimethicone, Behentrimonium Methosulfate, Cholesterol, Phenoxyethanol, Disodium EDTA, Tocopherol, Phytosphingosine, Xanthan Gum, Ethylhexylglycerin",
  },
  {
    id: "lrp-toleriane-double-repair",
    name: "Toleriane Double Repair",
    brand: "La Roche-Posay",
    size: "2.5 fl oz",
    description: "Face moisturizer with ceramide-3 and niacinamide",
    ingredients:
      "Aqua/Water, Glycerin, Dimethicone, Isononyl Isononanoate, Niacinamide, Ammonium Polyacryloyldimethyl Taurate, Sodium Hydroxide, Dimethiconol, Ceramide NP, Caprylyl Glycol, Tocopherol, Xanthan Gum, Disodium EDTA, Citric Acid, Zinc PCA, Shea Butter Ethyl Esters, Caprylic/Capric Triglyceride",
  },
  {
    id: "lrp-cicaplast-baume-b5",
    name: "Cicaplast Baume B5",
    brand: "La Roche-Posay",
    size: "1.35 fl oz",
    description: "Soothing multi-purpose balm with panthenol",
    ingredients:
      "Aqua/Water, Glycerin, Dimethicone, Butyrospermum Parkii (Shea) Butter, Panthenol, Zinc Gluconate, Madecassoside, Propylene Glycol, Cetyl Alcohol, Glyceryl Stearate, PEG-100 Stearate, Tocopherol, Disodium EDTA, Xanthan Gum, Manganese Gluconate, Copper Gluconate",
  },
  {
    id: "the-ordinary-niacinamide",
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    size: "1 fl oz",
    description: "High-strength blemish formula",
    ingredients:
      "Aqua (Water), Niacinamide, Pentylene Glycol, Zinc PCA, Dimethyl Isosorbide, Tamarindus Indica Seed Gum, Xanthan Gum, Isoceteth-20, Ethoxydiglycol, Phenoxyethanol, Chlorphenesin",
  },

  /* ---- Added for CHECK ----------------------------------------------------
     The products the CHECK comps name — the search list on `Check — add
     products` (602:1972) and the five analysis cards on `Check results`
     (476:2841). Same principle as the entries above: the catalogue is what the
     comps actually name, so the screens show the designed products rather than
     invented placeholders. See lib/check.ts for what makes them score. */
  {
    id: "paulas-choice-niacinamide-serum",
    name: "Niacinamide Serum",
    brand: "Paula's Choice",
    size: "0.67 fl oz",
    description: "20% niacinamide concentrate for enlarged pores",
    ingredients:
      "Water, Niacinamide, Acetyl Glucosamine, Butylene Glycol, Glycerin, Ascorbyl Glucoside, Panthenol, Sodium Hyaluronate, Allantoin, Boerhavia Diffusa Root Extract, Sodium Citrate, Xanthan Gum, Disodium EDTA, Phenoxyethanol",
  },
  {
    id: "good-molecules-niacinamide-toner",
    name: "Niacinamide Brightening Toner",
    brand: "Good Molecules",
    size: "3.7 fl oz",
    description: "Brightening toner with niacinamide",
    ingredients:
      "Water, Niacinamide, Glycerin, Butylene Glycol, Betaine, Panthenol, Sodium Hyaluronate, Allantoin, Zinc PCA, Polyglyceryl-10 Laurate, Ethylhexylglycerin, Phenoxyethanol",
  },
  {
    id: "cerave-niacinamide-body-lotion",
    name: "Niacinamide Body Lotion",
    brand: "CeraVe",
    size: "8 oz",
    description: "Body lotion with niacinamide and ceramides",
    ingredients:
      "Aqua/Water, Glycerin, Niacinamide, Caprylic/Capric Triglyceride, Cetearyl Alcohol, Ceteareth-20, Cetyl Alcohol, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Cholesterol, Dimethicone, Behentrimonium Methosulfate, Phenoxyethanol, Disodium EDTA, Tocopherol, Phytosphingosine, Xanthan Gum",
  },
  {
    id: "lrp-retinol-b3-serum",
    name: "Retinol B3 Serum",
    brand: "La Roche-Posay",
    size: "1 fl oz",
    description: "Pure retinol serum with vitamin B3",
    ingredients:
      "Aqua/Water, Dimethicone, Glycerin, Alcohol Denat., Niacinamide, Propanediol, Bis-PEG-18 Methyl Ether Dimethyl Silane, Retinol, Hydroxyethylpiperazine Ethane Sulfonic Acid, Adenosine, Sodium Hyaluronate, Tocopherol, Caprylyl Glycol, Disodium EDTA, Xanthan Gum, Phenoxyethanol",
  },
  {
    id: "paulas-choice-bha-exfoliant",
    name: "BHA Exfoliant",
    brand: "Paula's Choice",
    size: "4 fl oz",
    description: "Skin Perfecting 2% BHA liquid exfoliant",
    ingredients:
      "Water, Methylpropanediol, Alcohol Denat., Butylene Glycol, Salicylic Acid, Polysorbate 20, Camellia Oleifera Leaf Extract, Sodium Hydroxide, Tetrasodium EDTA, Parfum",
  },
  {
    id: "cerave-foaming-cleanser",
    name: "Foaming Cleanser",
    brand: "CeraVe",
    size: "12 fl oz",
    description: "Foaming facial cleanser for normal to oily skin",
    ingredients:
      "Aqua/Water, Cocamidopropyl Hydroxysultaine, Glycerin, Sodium Lauroyl Sarcosinate, Sodium Laureth Sulfate, Niacinamide, Ceramide NP, Ceramide AP, Ceramide EOP, Sodium Hyaluronate, Cholesterol, Phenoxyethanol, Disodium EDTA, Tocopherol, Phytosphingosine, Parfum",
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

/** A quantity written into a name: "50ml", "1.7 fl oz", "200 g". */
const QUANTITY_IN_NAME = /\s*\b\d+(?:[.,]\d+)?\s*(?:fl\.?\s*oz|oz|ml|cl|l|g|kg)\b\.?/gi;

/** The row title: the comps write "CeraVe Moisturizing Cream", brand first. */
export function fullName(p: CatalogProduct): string {
  const name = p.name.replace(QUANTITY_IN_NAME, "").replace(/\s{2,}/g, " ").trim();
  return name.toLowerCase().startsWith(p.brand.toLowerCase())
    ? name
    : `${p.brand} ${name}`;
}

/** One US fluid ounce in millilitres. */
const ML_PER_FL_OZ = 29.5735;

/**
 * A product's size as the app SHOWS it: millilitres, the number and the unit
 * only — "16 oz tub" reads "473 ml", "1.35 fl oz" reads "40 ml", Open Beauty
 * Facts' "50ml" reads "50 ml".
 */
export function sizeInMl(size: string | undefined): string | undefined {
  const text = size?.trim();
  if (!text) return undefined;
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*(fl\.?\s*oz|oz|ml|cl|l)\b/i);
  if (!match) return text;
  const amount = Number.parseFloat(match[1].replace(",", "."));
  const unit = match[2].toLowerCase().replace(/[\s.]/g, "");
  const ml =
    unit === "ml"
      ? amount
      : unit === "cl"
        ? amount * 10
        : unit === "l"
          ? amount * 1000
          : amount * ML_PER_FL_OZ;
  return `${Math.round(ml)} ml`;
}

/**
 * Fold a string down to something typeable: lowercase, diacritics stripped,
 * punctuation collapsed to spaces. Digits and `%` survive because half this
 * catalogue is named with them ("Niacinamide 10% + Zinc 1%", "12 oz pump").
 */
function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9%]+/g, " ")
    .trim();
}

/** The fields a term can match, most identifying first. */
const FIELD_WEIGHT = {
  /** the product's own name — what someone is most likely typing */
  name: 40,
  brand: 30,
  size: 16,
  /** what the product CONTAINS — see `extraTerms` below */
  ingredient: 12,
} as const;

type SearchField = keyof typeof FIELD_WEIGHT;

function scoreTerm(term: string, fields: Record<SearchField, string>): number {
  let best = 0;
  for (const field of Object.keys(FIELD_WEIGHT) as SearchField[]) {
    const hay = fields[field];
    if (!hay.includes(term)) continue;
    const weight = FIELD_WEIGHT[field];
    /* A term that starts a word beats one buried mid-word: typing "cream"
       should rank `Moisturizing Cream` over a product that merely mentions it.
       `\b` is unreliable here because the haystack is already space-collapsed,
       so test the space-delimited boundary directly. */
    const atWordStart = hay === term || hay.startsWith(`${term}`) || hay.includes(` ${term}`);
    best = Math.max(best, atWordStart ? weight * 2 : weight);
  }
  return best;
}

/**
 * A forgiving search over brand, name, size and — when the caller supplies them
 * — the product's ingredients. Every term must still match somewhere, so the
 * result stays an AND like the comp's; what changed is WHERE a term may match
 * and in WHAT ORDER the hits come back.
 */
export function searchCatalog(
  query: string,
  extraTerms?: (product: CatalogProduct) => string[]
): CatalogProduct[] {
  return searchProducts(CATALOG, query, extraTerms);
}

/** The same search, over a list the caller supplies rather than the catalogue. */
export function searchProducts<T extends CatalogProduct>(
  list: T[],
  query: string,
  extraTerms?: (product: CatalogProduct) => string[]
): T[] {
  const terms = normalizeForSearch(query).split(" ").filter(Boolean);
  if (terms.length === 0) return [];

  const scored: { product: T; score: number }[] = [];

  for (const product of list) {
    const fields: Record<SearchField, string> = {
      name: normalizeForSearch(product.name),
      brand: normalizeForSearch(product.brand),
      size: normalizeForSearch(product.size),
      ingredient: normalizeForSearch((extraTerms?.(product) ?? []).join(" ")),
    };

    let total = 0;
    let matchedAll = true;
    for (const term of terms) {
      const s = scoreTerm(term, fields);
      if (s === 0) {
        matchedAll = false;
        break;
      }
      total += s;
    }
    if (!matchedAll) continue;

    /* the whole query as one phrase, so "moisturizing cream" ranks the two
       actual Moisturizing Creams above anything that merely holds both words */
    if (`${fields.brand} ${fields.name}`.includes(terms.join(" "))) total += 60;

    scored.push({ product, score: total });
  }

  return scored
    .sort(
      (a, b) =>
        b.score - a.score || fullName(a.product).localeCompare(fullName(b.product))
    )
    .map((s) => s.product);
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
  const d = fromIso(iso);
  if (!d) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

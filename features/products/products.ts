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
  /**
   * The FULL INCI list, when one is known. `description` is the same text cut
   * to 240 for the confirm card; this is what the checker reads.
   *
   * ⚠️ THE MODEL MUST NOT READ THE TRUNCATED COPY. Fragrance, preservatives and
   * the other low-percentage actives sit at the END of an INCI list by
   * regulation — they are ordered by concentration — so a 240-character cut
   * removes exactly the ingredients `activesFromInci` is looking for. Reading
   * `description` scored a fragranced product as fragrance-free.
   *
   * ⚠️ IT IS ALSO WHAT THE EXPANDED ACCORDION CARD SHOWS, so it is no longer
   * only the checker's input — `ProductAccordionCard` opens it as a nested
   * disclosure under Size. That is why every CATALOG entry below carries one:
   * without it the seeded library, which IS the demo on `/products`, had five
   * products with no ingredients to open.
   */
  ingredients?: string;
  /* ⚠️ NO `imageUrl`. Every product's picture is chosen locally by packaging
     type (a photograph since 26 Sep 2026, a drawing before) — see `ProductArt`,
     and the note in lib/openBeautyFacts.ts on why the API's photos are not read. */
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
 *  what the tray actually shows for it. See useOpenBeautyFactsSearch.
 *
 *  ⚠️ THE INCI LISTS AGREE WITH THE MODEL, NOT WITH THE SHELF. They are
 *  fixture data, like every other field here, and `lib/check.ts` reads them:
 *  `activesFromInci` runs for any product `PRODUCT_ACTIVES` does not name, so a
 *  list that disagreed with the map would put an ingredient on screen that the
 *  compatibility card refused to mention, or the reverse. Where the two overlap
 *  the map still wins by id — see `activesOf`.
 *
 *  Verified: the comp's five still score 45 / 62 / 71 / 94 / 98. The three
 *  niacinamide-containing moisturisers that had no map entry now read one off
 *  their own list and score 94 rather than 98, which is what their `description`
 *  said all along; the band is unchanged. */
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

/**
 * The row title: the comps write "CeraVe Moisturizing Cream", brand first.
 *
 * ⚠️ TWO CLEAN-UPS FOR LIVE OPEN BEAUTY FACTS NAMES, 15 Sep 2026 — asked for
 * directly ("remove 50ml"). OBF names are crowdsourced and often carry their
 * own size and brand: "DOVE Déodorant Femme … Original 50ml" by "Dove" titled
 * itself "Dove DOVE Déodorant … 50ml". The size is stripped out of the name
 * (it lives in `ProductDetails`, in ml), and the brand is not prefixed a
 * second time when the name already opens with it, case aside. The
 * catalogue's own names carry neither, so they are untouched.
 */
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
 * Facts' "50ml" reads "50 ml". Asked for directly 15 Sep 2026 ("use ml, not oz
 * nor tub").
 *
 * ⚠️ A DISPLAY FORMAT, NOT A DATA CHANGE. `size` keeps the catalogue's own
 * words because `ProductArt`'s `formFor` reads "tub" and "pump" out of it to
 * pick the vessel, and search still matches "16 oz".
 *
 * ⚠️ PLAIN `oz` IS READ AS FLUID OUNCES. On a cream tub it is strictly a
 * weight; a prototype asked for one unit, and 1 oz of cream is close enough to
 * 1 fl oz that the number a reader sees is honest to within a few percent.
 * A size it cannot parse (grams, a count) is passed through untouched.
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
 *
 * ⚠️ THIS IS WHY "la roche posay" FINDS `La Roche-Posay`. The old search
 * compared raw lowercased strings, so a hyphen in the brand made the unhyphened
 * spelling — the one people actually type — depend on the term happening to
 * fall on the right side of it.
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
  /** ⚠️ SIZE IS SEARCHABLE, and it was not. The catalogue holds a 16 oz and a
      12 oz CeraVe Moisturizing Cream that are identical on brand alone — so
      the one field that exists to tell two rows apart was the one field you
      could see and not type. "16 oz" returned nothing. (Rows stopped printing
      the size under the name on 15 Sep 2026; it lives in `ProductDetails`, in
      ml, and still matches here in the catalogue's own words.) */
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
 *
 * ⚠️ INGREDIENTS COME FROM THE CALLER, NOT FROM THIS MODULE. `lib/check.ts`
 * owns the actives model and already imports this file, so reaching the other
 * way would be a cycle. It is also the right split by meaning: "what do I own
 * with retinol in it" is a COMPATIBILITY question, which is why `/check/new`
 * passes `checkSearchTerms` and the PRODUCTS tray does not.
 *
 * ⚠️ IT USED TO HALF-WORK BY ACCIDENT. `retinol` and `niacinamide` returned
 * hits only because those words sit in product NAMES, while `salicylic` — the
 * highest-penalty active in the model, and the one `/check/results` flags in
 * the demo — returned nothing at all. Search that works for two ingredients and
 * silently fails on the third reads as broken data rather than as a missing
 * feature.
 */
export function searchCatalog(
  query: string,
  extraTerms?: (product: CatalogProduct) => string[]
): CatalogProduct[] {
  return searchProducts(CATALOG, query, extraTerms);
}

/**
 * The same search, over a list the caller supplies rather than the catalogue.
 *
 * ⚠️ ONE IMPLEMENTATION, TWO HAYSTACKS — the ranking above was the catalogue's
 * alone, so a screen that had to search the products the USER owns (the
 * check-in record's product list) would have written a second, weaker matcher
 * beside it: a lowercase `includes` that does not fold `La Roche-Posay`, does
 * not read a size, and does not rank a word-start hit above a mid-word one. The
 * three things this file already knows how to do would then be true of the
 * catalogue and false of your own shelf.
 *
 * Generic in the element type so an owned `SavedProduct[]` comes back as
 * `SavedProduct[]` — the caller keeps `addedOn` and the group, which is what
 * makes the result rows renderable.
 */
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

  /* ⚠️ STABLE TIEBREAK, NOT CATALOGUE ORDER. Equal-scoring rows fall back to
     the order they are declared in, which is arbitrary; sorting equal hits by
     name keeps the list from reshuffling as the query grows a character. */
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
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

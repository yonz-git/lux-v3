import type { CatalogProduct } from "./products";

/**
 * Client for Open Beauty Facts (world.openbeautyfacts.org) — a free,
 * crowdsourced, open database of cosmetic products: real names, brands, sizes
 * and real INCI ingredient lists, keyed by barcode. No API key, CORS-open.
 */

const SEARCH_URL = "https://world.openbeautyfacts.org/cgi/search.pl";

const FIELDS =
  "code,product_name,brands,quantity,ingredients_text_en,ingredients_text";

/** Only the fields this app reads out of an Open Beauty Facts product. */
type OBFProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  quantity?: string;
  ingredients_text_en?: string;
  ingredients_text?: string;
};

/** A full INCI list can run past 500 characters — long enough to unbalance
 *  the confirm card's description block, which has no clamp. Cut it, rather
 *  than adding a clamp the design doesn't draw for what was a short tagline. */
const MAX_DESCRIPTION = 240;

/** How many entries a search fetches per result it shows, and the least it
 *  fetches — enough that the filter still leaves a full list. */
const FETCH_FACTOR = 4;
const MIN_FETCH = 20;

function truncate(text: string): string {
  return text.length > MAX_DESCRIPTION
    ? `${text.slice(0, MAX_DESCRIPTION).trimEnd()}…`
    : text;
}

function displayName(name: string): string {
  if (name !== name.toLowerCase()) return name;
  return name.replace(/[\p{L}][\p{L}\p{M}'’-]*/gu, (word) =>
    /\d/.test(word) ? word : word[0].toUpperCase() + word.slice(1)
  );
}

function displaySize(quantity: string | undefined): string {
  const size = quantity?.trim() ?? "";
  return /\p{L}/u.test(size) ? size : "";
}

/** A real INCI list names several ingredients; a placeholder ("Hdhdh",
 *  "water") does not. */
const MIN_INGREDIENTS = 3;

function isIngredientList(text: string): boolean {
  return text.split(/[,;•]/).filter((part) => /\p{L}{2}/u.test(part)).length >= MIN_INGREDIENTS;
}

/** Skips an entry the community hasn't finished: no barcode, name, brand or
 *  ingredient list. The checker reads the ingredients, so a product without
 *  them has nothing to offer, and an unbranded one can't be told apart. */
function toCatalogProduct(raw: OBFProduct): CatalogProduct | null {
  const name = raw.product_name?.trim();
  const brand = raw.brands?.split(",")[0]?.trim();
  const ingredients = (raw.ingredients_text_en || raw.ingredients_text || "").trim();
  if (!raw.code || !name || !brand || !isIngredientList(ingredients)) return null;

  return {
    id: raw.code,
    name: displayName(name),
    brand,
    size: displaySize(raw.quantity),
    description: truncate(ingredients),
    /* the UNCUT list — see `CatalogProduct.ingredients` on why the checker
       cannot read the truncated one */
    ingredients,
  };
}

/**
 * Live product search — what the add-product tray's search view queries as the
 * user types. Throws on a network/HTTP failure, and returns [] for a query the
 * database has nothing for.
 */
export async function searchOpenBeautyFacts(
  query: string,
  { signal, pageSize = 15 }: { signal?: AbortSignal; pageSize?: number } = {}
): Promise<CatalogProduct[]> {
  const q = query.trim();
  if (!q) return [];

  const url = new URL(SEARCH_URL);
  url.searchParams.set("search_terms", q);
  url.searchParams.set("search_simple", "1");
  url.searchParams.set("action", "process");
  url.searchParams.set("json", "1");
  /* asks for more than it shows: many entries have no brand or ingredients
     and are dropped (see `toCatalogProduct`) */
  url.searchParams.set("page_size", String(Math.max(pageSize * FETCH_FACTOR, MIN_FETCH)));
  url.searchParams.set("fields", FIELDS);

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Open Beauty Facts search failed: ${res.status}`);
  }
  const data = (await res.json()) as { products?: OBFProduct[] };
  return dedupe(
    (data.products ?? [])
      .map(toCatalogProduct)
      .filter((p): p is CatalogProduct => p !== null)
  ).slice(0, pageSize);
}

function dedupe(products: CatalogProduct[]): CatalogProduct[] {
  const nameKey = (p: CatalogProduct) => `${p.brand} ${p.name}`.toLowerCase();
  const sizedGroups = new Set(products.filter((p) => p.size).map(nameKey));
  const taken = new Set<string>();

  return products.filter((p) => {
    /* no size, in a group where another row states one: the same product with
       a field left blank */
    if (!p.size && sizedGroups.has(nameKey(p))) return false;

    const key = p.size ? `${nameKey(p)}|${p.size.toLowerCase()}` : nameKey(p);
    if (taken.has(key)) return false;
    taken.add(key);
    return true;
  });
}

/**
 * The single best match for a free-text query — used to enrich the scan
 * flow's hardcoded catalogue match with a real ingredient list, since the
 * viewfinder has no camera to read an actual barcode from (see the tray's scan
 * view / useEnrichedProduct). Swallows failures: enrichment is a nice-to-have,
 * not something that should ever block the flow.
 */
export async function lookupOpenBeautyFacts(
  query: string,
  opts: { signal?: AbortSignal } = {}
): Promise<CatalogProduct | null> {
  try {
    const [first] = await searchOpenBeautyFacts(query, { ...opts, pageSize: 1 });
    return first ?? null;
  } catch {
    return null;
  }
}

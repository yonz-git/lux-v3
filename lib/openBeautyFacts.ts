import type { CatalogProduct } from "./products";

/**
 * Client for Open Beauty Facts (world.openbeautyfacts.org) — a free,
 * crowdsourced, open database of cosmetic products: real product photos and
 * real INCI ingredient lists, keyed by barcode. No API key, CORS-open.
 *
 * ⚠️ USES THE LEGACY `cgi/search.pl` ENDPOINT, NOT `api/v2/search`. The v2
 * endpoint is search-a-licious-backed and returned near-unfiltered results in
 * testing (73k+ hits for "cerave moisturizing cream", every field empty but
 * `code`). `cgi/search.pl` with `search_simple=1` does the AND-of-terms
 * matching this app needs and returns full product data.
 */

const SEARCH_URL = "https://world.openbeautyfacts.org/cgi/search.pl";

const FIELDS =
  "code,product_name,brands,quantity,image_front_url,image_url,ingredients_text_en,ingredients_text";

/** Only the fields this app reads out of an Open Beauty Facts product. */
type OBFProduct = {
  code?: string;
  product_name?: string;
  brands?: string;
  quantity?: string;
  image_front_url?: string;
  image_url?: string;
  ingredients_text_en?: string;
  ingredients_text?: string;
};

/** A full INCI list can run past 500 characters — long enough to unbalance
 *  the confirm card's description block, which has no clamp. Cut it, rather
 *  than adding a clamp the design doesn't draw for what was a short tagline. */
const MAX_DESCRIPTION = 240;

function truncate(text: string): string {
  return text.length > MAX_DESCRIPTION
    ? `${text.slice(0, MAX_DESCRIPTION).trimEnd()}…`
    : text;
}

/** Skips a product with no barcode or name rather than rendering a blank row —
 *  both happen for entries the community hasn't finished filling in. */
function toCatalogProduct(raw: OBFProduct): CatalogProduct | null {
  const name = raw.product_name?.trim();
  if (!raw.code || !name) return null;

  const ingredients = (raw.ingredients_text_en || raw.ingredients_text || "").trim();

  return {
    id: raw.code,
    name,
    brand: raw.brands?.split(",")[0]?.trim() || "Unknown brand",
    size: raw.quantity?.trim() || "",
    description: ingredients ? truncate(ingredients) : undefined,
    imageUrl: raw.image_front_url || raw.image_url || undefined,
  };
}

/**
 * Live product search — what the add-product tray's search view queries as the
 * user types. Throws on a network/HTTP failure, and returns [] for a query the
 * database has nothing for.
 *
 * ⚠️ BOTH OUTCOMES NEED THE FIXTURE FALLBACK, and only the caller can apply it
 * — see useOpenBeautyFactsSearch. An empty array here is a truthful answer
 * about Open Beauty Facts, not a truthful answer about whether the product
 * exists.
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
  url.searchParams.set("page_size", String(pageSize));
  url.searchParams.set("fields", FIELDS);

  const res = await fetch(url.toString(), { signal });
  if (!res.ok) {
    throw new Error(`Open Beauty Facts search failed: ${res.status}`);
  }
  const data = (await res.json()) as { products?: OBFProduct[] };
  return (data.products ?? [])
    .map(toCatalogProduct)
    .filter((p): p is CatalogProduct => p !== null);
}

/**
 * The single best match for a free-text query — used to enrich the scan
 * flow's hardcoded catalogue match with a real photo and ingredient list,
 * since the viewfinder has no camera to read an actual barcode from (see
 * the tray's scan view / useEnrichedProduct). Swallows failures: enrichment is a
 * nice-to-have, not something that should ever block the flow.
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

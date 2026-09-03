import type { CatalogProduct } from "./products";

/**
 * Client for Open Beauty Facts (world.openbeautyfacts.org) — a free,
 * crowdsourced, open database of cosmetic products: real names, brands, sizes
 * and real INCI ingredient lists, keyed by barcode. No API key, CORS-open.
 *
 * ⚠️ THE PHOTOS ARE NOT READ, DELIBERATELY — `ProductArt` DRAWS EVERY PRODUCT.
 * OBF carries an `image_front_url` and this client used to prefer it over the
 * illustration. The photos are crowdsourced with no quality gate, so a list of
 * results mixed a few good front-of-package shots with stubs, boxes shot at an
 * angle, and rows that fell back to a drawing anyway — the thumbnails were the
 * least consistent thing on a screen whose whole job is telling rows apart.
 * The drawn vessels already encode identity (same brand → same tint, same
 * packaging → same silhouette) and they encode it for EVERY row. So the API
 * keeps supplying the words, and the pictures are all ours. The fields are not
 * merely ignored — they are not requested, so the response is smaller too.
 *
 * ⚠️ USES THE LEGACY `cgi/search.pl` ENDPOINT, NOT `api/v2/search`. The v2
 * endpoint is search-a-licious-backed and returned near-unfiltered results in
 * testing (73k+ hits for "cerave moisturizing cream", every field empty but
 * `code`). `cgi/search.pl` with `search_simple=1` does the AND-of-terms
 * matching this app needs and returns full product data.
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

function truncate(text: string): string {
  return text.length > MAX_DESCRIPTION
    ? `${text.slice(0, MAX_DESCRIPTION).trimEnd()}…`
    : text;
}

/**
 * ⚠️ THE DATABASE IS CROWDSOURCED, SO THE STRINGS ARE NOT PRESENTATION-READY.
 * A "cerave" query returns `moisturising cream` in lower case beside
 * `CeraVe Schuimende Reinigingsgel` in its own — one list, two conventions,
 * on the one screen whose whole job is telling products apart by reading them.
 *
 * Only an ALL-lower-case name is touched, and only word-initially: a name that
 * already carries capitals is somebody's real capitalisation (`CeraVe`, `AHA`,
 * `SA Cleanser`) and rewriting it would be the same damage in the other
 * direction. A token holding a digit is left exactly as it is — `10%`, `b3`
 * and `spf50` are specs rather than words, and title-casing them produces
 * `B3` beside `Spf50`, which is neither the name nor the spec.
 */
function displayName(name: string): string {
  if (name !== name.toLowerCase()) return name;
  return name.replace(/[\p{L}][\p{L}\p{M}'’-]*/gu, (word) =>
    /\d/.test(word) ? word : word[0].toUpperCase() + word.slice(1)
  );
}

/**
 * ⚠️ A SIZE WITH NO UNIT IS NOT A SIZE. `quantity` is free text, and a good
 * share of OBF entries hold a bare number — the row then reads
 * "CeraVe — 177", which looks like an ID, a count, or a truncation rather than
 * 177 ml. `ProductRow`'s meta line is the only place two otherwise identical
 * products are told apart (the catalogue holds a 12 oz and a 16 oz CeraVe
 * Moisturizing Cream), so a value that cannot be read as a measurement is
 * worse there than no value at all.
 */
function displaySize(quantity: string | undefined): string {
  const size = quantity?.trim() ?? "";
  return /\p{L}/u.test(size) ? size : "";
}

/** Skips a product with no barcode or name rather than rendering a blank row —
 *  both happen for entries the community hasn't finished filling in. */
function toCatalogProduct(raw: OBFProduct): CatalogProduct | null {
  const name = raw.product_name?.trim();
  if (!raw.code || !name) return null;

  const ingredients = (raw.ingredients_text_en || raw.ingredients_text || "").trim();

  return {
    id: raw.code,
    name: displayName(name),
    brand: raw.brands?.split(",")[0]?.trim() || "Unknown brand",
    size: displaySize(raw.quantity),
    description: ingredients ? truncate(ingredients) : undefined,
    /* the UNCUT list — see `CatalogProduct.ingredients` on why the checker
       cannot read the truncated one */
    ingredients: ingredients || undefined,
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
  return dedupe(
    (data.products ?? [])
      .map(toCatalogProduct)
      .filter((p): p is CatalogProduct => p !== null)
  );
}

/**
 * ⚠️ THE SAME PRODUCT ARRIVES TWICE, UNDER TWO BARCODES. A "cerave" query
 * returned two rows both reading `CeraVe Schuimende Reinigingsgel`, one with a
 * size and one without — the same tube filed twice by two contributors. They
 * are distinct barcodes, so nothing upstream treats them as duplicates, and on
 * screen they are two rows the user cannot choose between.
 *
 * ⚠️ THE KEY IS BRAND + NAME, AND SIZE IS DELIBERATELY NOT IN IT. Two entries
 * that differ by a real size are two real products — the catalogue's own 12 oz
 * and 16 oz CeraVe Moisturizing Cream is exactly that case, and collapsing
 * them would throw away the one field that tells them apart. So a row is only
 * dropped when it agrees with a kept row on brand and name AND states no size
 * of its own while another row in that group does: an empty size is missing
 * metadata, not a difference. The ranking's order is untouched.
 */
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

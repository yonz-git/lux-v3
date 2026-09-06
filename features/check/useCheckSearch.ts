"use client";

import {
  searchCatalog,
  type CatalogProduct,
} from "@/features/products/products";
import { useOpenBeautyFactsSearch } from "@/features/products/useOpenBeautyFactsSearch";
import { checkSearchTerms } from "@/features/check/check";

/**
 * The search BOTH of CHECK's product pickers run — `/check/new`'s floating
 * dropdown and the compared-products box's inline picker on `/check/results`.
 *
 * ⚠️ IT IS ONE FUNCTION BECAUSE IT WAS ONE PARAGRAPH OF REASONING, and that
 * reasoning is `CheckBuilder`'s: this screen used to search the 13-product
 * offline fixture ALONE while the add-product tray searched Open Beauty Facts
 * live, so the same query typed two screens apart returned two unrelated lists
 * and neither explained itself. The fix was "one search function, one debounce,
 * one fixture fallback" — and the moment `/check/results` grew a picker of its
 * own, keeping that promise meant lifting the merge out of the builder rather
 * than writing it a second time.
 *
 * Two passes, merged:
 *
 *   live          `useOpenBeautyFactsSearch` — debounced, cancellable, and
 *                 already falling back to the local fixture on a failed OR
 *                 empty response
 *   by ingredient `searchCatalog` over `checkSearchTerms`, which is what makes
 *                 "salicylic" find the BHA Exfoliant — a compatibility
 *                 question, and the reason this section searched differently in
 *                 the first place
 *
 * ⚠️ THE INGREDIENT PASS IS MERGED **UNDER** THE LIVE ONE, never in place of
 * it, so the list still leads with what the user typed. Live results carry
 * their own INCI list, so the checker reads their actives directly — see
 * `activesOf` in check.ts.
 *
 * ⚠️ `loading` IS NOT `results.length === 0`. `Check — no results` (651:2510)
 * is only honest once the search has actually answered; without the gate it
 * flashed up between the debounce firing and the response landing, telling the
 * user the product did not exist once per character typed.
 */
export function useCheckSearch(query: string): {
  /** live first, then anything the ingredient index found that it did not hold */
  results: CatalogProduct[];
  loading: boolean;
  /** whether the user has typed anything — the pickers show their own list
   *  when they have not, so this is what selects between the two */
  searching: boolean;
} {
  const searching = query.trim() !== "";
  const { results: live, loading } = useOpenBeautyFactsSearch(query);
  const byIngredient = searching ? searchCatalog(query, checkSearchTerms) : [];

  return {
    results: searching ? dedupe([...live, ...byIngredient]) : [],
    loading,
    searching,
  };
}

/** First occurrence of an id wins, which is what puts live results on top. */
function dedupe(products: CatalogProduct[]): CatalogProduct[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

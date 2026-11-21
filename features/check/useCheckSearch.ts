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

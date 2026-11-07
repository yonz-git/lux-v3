"use client";

import { useEffect, useState } from "react";
import { searchCatalog, type CatalogProduct } from "./products";
import { searchOpenBeautyFacts } from "./openBeautyFacts";

const DEBOUNCE_MS = 350;

/**
 * Debounced, cancellable Open Beauty Facts search — used by the add-product
 * tray's search view, at the top level and in its embedded "add another" /
 * "search again" instances.
 *
 * Falls back to the local `searchCatalog` fixture silently — the same "always
 * have a solid fallback" rule the frosted surfaces follow elsewhere, not a
 * state worth its own UI.
 */
export function useOpenBeautyFactsSearch(query: string): {
  results: CatalogProduct[];
  loading: boolean;
} {
  const [results, setResults] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    const timer = setTimeout(() => {
      searchOpenBeautyFacts(q, { signal: controller.signal })
        .then((live) => {
          setResults(live.length > 0 ? live : searchCatalog(q));
          setLoading(false);
        })
        .catch(() => {
          if (controller.signal.aborted) return; // superseded by a newer keystroke
          setResults(searchCatalog(q));
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return { results, loading };
}

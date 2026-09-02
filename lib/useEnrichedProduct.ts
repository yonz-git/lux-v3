"use client";

import { useEffect, useState } from "react";
import { fullName, type CatalogProduct } from "./products";
import { lookupOpenBeautyFacts } from "./openBeautyFacts";

/**
 * Fills in a real INCI ingredient list for a catalogue product that doesn't
 * have one yet — the scan flow's hardcoded `SCAN_MATCH`, or a search result
 * that fell back to the offline fixture. Products that already carry a
 * `description` (a live Open Beauty Facts search result) pass through
 * unchanged with no extra request.
 *
 * ⚠️ INGREDIENTS ONLY — IT USED TO FETCH A PHOTO TOO, and keyed its skip on
 * `imageUrl`. Photos are no longer read from the API at all (see
 * lib/openBeautyFacts.ts); the artwork is drawn from the product itself and
 * needs no request. The description is the one field left that a lookup can
 * add, so it is what the skip now tests.
 *
 * Used by the add-product tray's confirm view (the old `04 — Product match` /
 * `04 — Confirm product` screens, now one view inside the tray)
 * and the add-product tray's ConfirmView — the two places a `ProductCard`
 * renders a product that may still be the bare catalogue fixture.
 */
export function useEnrichedProduct(product: CatalogProduct): CatalogProduct {
  const [enriched, setEnriched] = useState<CatalogProduct>(product);

  useEffect(() => {
    setEnriched(product);
    if (product.description) return; // already real — no lookup needed

    const controller = new AbortController();
    lookupOpenBeautyFacts(fullName(product), { signal: controller.signal }).then((match) => {
      if (controller.signal.aborted || !match) return;
      setEnriched((prev) =>
        prev.id === product.id
          ? { ...prev, description: match.description ?? prev.description }
          : prev
      );
    });

    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on identity, not every field
  }, [product.id]);

  return enriched;
}

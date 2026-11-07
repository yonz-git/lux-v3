"use client";

import { useSnackbar } from "@/components/layout/Snackbar";
import {
  productIn,
  savedProduct,
  withoutProduct,
  withProduct,
  type LibraryStart,
} from "@/features/products/library";
import {
  fullName,
  type CatalogProduct,
  type Duration,
} from "@/features/products/products";
import { useInvestigation } from "@/lib/store/InvestigationProvider";

/**
 * Changing the Product library — `library.ts` holds the rules, this holds the
 * store and the undo.
 *
 * ⚠️ `remove` IS UNDOABLE, AND THE SNAPSHOT IS THE STORE'S OWN VALUE. The library
 * persists forever, and its value can be `undefined` because the library is
 * seeded. Restoring `undefined` puts the seeded library back; restoring
 * `DEMO_PRODUCTS` would materialise it and quietly turn a portfolio visitor's
 * list into a stored one.
 */
export function useProductLibrary(start: LibraryStart) {
  const { answers, setAnswer } = useInvestigation();
  const { show } = useSnackbar();

  function add(product: CatalogProduct, duration: Duration) {
    const saved = savedProduct(product, duration, new Date());
    setAnswer("products", (prev) => withProduct(prev, saved, start));
  }

  function remove(id: string) {
    const before = answers.products;
    const removed = productIn(before, id, start);
    setAnswer("products", (prev) => withoutProduct(prev, id, start));
    show({
      message: removed ? `Removed ${fullName(removed)}` : "Product removed",
      onAction: () => setAnswer("products", before),
    });
  }

  return { add, remove };
}

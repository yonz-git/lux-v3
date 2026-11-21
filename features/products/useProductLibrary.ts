"use client";

import { useSnackbar } from "@/components/layout/Snackbar";
import {
  ownedProducts,
  savedProduct,
  withoutProduct,
  withProduct,
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
 */
export function useProductLibrary() {
  const { answers, setAnswer } = useInvestigation();
  const { show } = useSnackbar();

  function add(product: CatalogProduct, duration: Duration) {
    const saved = savedProduct(product, duration, new Date());
    setAnswer("products", (prev) => withProduct(prev, saved));
    return saved;
  }

  function remove(id: string) {
    const before = answers.products;
    const removed = ownedProducts(answers).find((p) => p.id === id);
    setAnswer("products", (prev) => withoutProduct(prev, id));
    show({
      message: removed ? `Removed ${fullName(removed)}` : "Product removed",
      onAction: () => setAnswer("products", before),
    });
  }

  return { add, remove };
}

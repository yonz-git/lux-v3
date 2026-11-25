import {
  bucketFor,
  type CatalogProduct,
  type Duration,
  type SavedProduct,
} from "@/features/products/products";
import { toIso } from "@/lib/date";
import type { Answers } from "@/lib/store/answers";

/**
 * The Product library — what the user owns, and every rule about changing it.
 * Screens read it through `ownedProducts` and change it through
 * `useProductLibrary`; only the rules are here, so they run without React.
 */
export function ownedProducts(a: Answers): SavedProduct[] {
  return a.products ?? [];
}

/**
 * A catalogue product as the user owns it. The group comes from the duration
 * answer and from nothing else — see `bucketFor`.
 */
export function savedProduct(
  product: CatalogProduct,
  duration: Duration,
  today: Date,
): SavedProduct {
  return {
    ...product,
    duration,
    bucket: bucketFor(duration),
    addedOn: toIso(today),
  };
}

/** The list with `product` in it. Re-adding one replaces it, matched on id. */
export function withProduct(
  stored: SavedProduct[] | undefined,
  product: SavedProduct,
): SavedProduct[] {
  return [...(stored ?? []).filter((p) => p.id !== product.id), product];
}

/** The list without `id`. */
export function withoutProduct(
  stored: SavedProduct[] | undefined,
  id: string,
): SavedProduct[] {
  return (stored ?? []).filter((p) => p.id !== id);
}

/** What is new since `before`, the ids `ownedProducts` gave then. */
export function addedSince(a: Answers, before: readonly string[]): SavedProduct[] {
  return ownedProducts(a).filter((p) => !before.includes(p.id));
}

import {
  bucketFor,
  type CatalogProduct,
  type Duration,
  type SavedProduct,
} from "@/features/products/products";
import { toIso } from "@/lib/date";
import { DEMO_PRODUCTS } from "@/lib/demo";
import type { Answers } from "@/lib/store/answers";

/**
 * The Product library — what the user owns, and every rule about changing it.
 * Screens read it through `ownedProducts` and change it through
 * `useProductLibrary`; only the rules are here, so they run without React.
 */
export function ownedProducts(a: Answers): SavedProduct[] {
  return a.products ?? DEMO_PRODUCTS;
}

/**
 * What an untouched library means to the screen changing it — the seeded five
 * that screen is showing, or nothing.
 */
export type LibraryStart = "seeded" | "empty";

function libraryFrom(
  stored: SavedProduct[] | undefined,
  start: LibraryStart,
): SavedProduct[] {
  return stored ?? (start === "seeded" ? DEMO_PRODUCTS : []);
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
  start: LibraryStart,
): SavedProduct[] {
  return [...libraryFrom(stored, start).filter((p) => p.id !== product.id), product];
}

/** The list without `id`. */
export function withoutProduct(
  stored: SavedProduct[] | undefined,
  id: string,
  start: LibraryStart,
): SavedProduct[] {
  return libraryFrom(stored, start).filter((p) => p.id !== id);
}

/** The product `id` in the list the screen is showing. */
export function productIn(
  stored: SavedProduct[] | undefined,
  id: string,
  start: LibraryStart,
): SavedProduct | undefined {
  return libraryFrom(stored, start).find((p) => p.id === id);
}

/** What is new since `before`, the ids `ownedProducts` gave then. */
export function addedSince(a: Answers, before: readonly string[]): SavedProduct[] {
  return ownedProducts(a).filter((p) => !before.includes(p.id));
}

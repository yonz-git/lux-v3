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
 *
 * ⚠️ THE SIGNAL IS `undefined` vs `[]`, NOT `length`. It used to read
 * `own.length > 0 ? own : DEMO_PRODUCTS`, which cannot tell "has never touched
 * the list" from "has emptied it" — so removing your last product resurrected
 * all five seeded ones. An absent key means untouched; an array, even an empty
 * one, means the list is theirs and is allowed to be empty. `parsePersisted`
 * keeps that `[]` across a reload.
 *
 * ⚠️ EVERY SCREEN THAT SHOWS OWNED PRODUCTS MUST COME THROUGH HERE. Reading
 * `answers.products` directly is how `/products` came to count the seeded
 * library on its category rows while the list behind those very rows read the
 * raw store and rendered "No products in this list yet". The hub said 2, the
 * list said 0, and adding a product looked like it had not saved. Step 5 is the
 * one exception: `YourProducts` shows what the USER added (see `lib/demo.ts`).
 */
export function ownedProducts(a: Answers): SavedProduct[] {
  return a.products ?? DEMO_PRODUCTS;
}

/**
 * What an untouched library means to the screen changing it — the seeded five
 * that screen is showing, or nothing.
 *
 * ⚠️ REQUIRED AT EVERY CALL, NEVER DEFAULTED. It was an optional `base = []` on
 * the tray, so `CheckBuilder` left it out and a first add from `/check/new`
 * wiped the five products on screen down to one. `empty` is step 5's alone: it
 * opens on nothing so the user can watch the list sort itself.
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
 *
 * ⚠️ `addedOn` IS A LOCAL `YYYY-MM-DD`, THE SHAPE EVERY READER COMPARES. It was
 * `toISOString()`, and a full timestamp sorts AFTER its own date as a string:
 * `productsUsedOn` left a product off its add day and `trendEvents` never
 * matched one at all.
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

/**
 * What is new since `before`, the ids `ownedProducts` gave then.
 *
 * ⚠️ OWNED, NOT RAW, ON BOTH SIDES. A first add materialises the seeded five
 * into the store, and a raw `before` of nothing would count all five as added.
 */
export function addedSince(a: Answers, before: readonly string[]): SavedProduct[] {
  return ownedProducts(a).filter((p) => !before.includes(p.id));
}

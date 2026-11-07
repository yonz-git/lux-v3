import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addedSince,
  ownedProducts,
  savedProduct,
  withoutProduct,
  withProduct,
} from "@/features/products/library";
import { formatAdded, productById } from "@/features/products/products";
import { DEMO_PRODUCTS } from "@/lib/demo";

const catalogued = productById("cerave-foaming-cleanser");
assert.ok(catalogued);
const added = savedProduct(catalogued, "1–4 weeks", new Date(2026, 10, 7, 23, 30));
const fresh = { ...added, id: "fresh" };

describe("ownedProducts", () => {
  it("is the seeded library until the list is touched", () => {
    assert.equal(ownedProducts({}), DEMO_PRODUCTS);
  });

  it("is the user's own list once it exists, even empty", () => {
    assert.deepEqual(ownedProducts({ products: [] }), []);
  });
});

describe("savedProduct", () => {
  it("dates the product by the local day, with no time part", () => {
    assert.equal(added.addedOn, "2026-11-07");
  });

  it("counts as added on its add day", () => {
    assert.ok(added.addedOn <= "2026-11-07");
  });

  it("takes its group from the duration", () => {
    assert.equal(added.bucket, savedProduct(catalogued, "1–4 weeks", new Date()).bucket);
  });
});

describe("withProduct", () => {
  it("keeps the seeded library when the library opened seeded", () => {
    const next = withProduct(undefined, fresh, "seeded");
    assert.equal(next.length, DEMO_PRODUCTS.length + 1);
    assert.equal(next.at(-1), fresh);
  });

  it("starts from nothing when the library opened empty", () => {
    assert.deepEqual(withProduct(undefined, fresh, "empty"), [fresh]);
  });

  it("replaces a product already in the list rather than duplicating it", () => {
    const next = withProduct([fresh], { ...fresh, duration: "4+ weeks" }, "seeded");
    assert.equal(next.length, 1);
    assert.equal(next[0].duration, "4+ weeks");
  });
});

describe("withoutProduct", () => {
  it("removes from the seeded library without losing the rest", () => {
    const next = withoutProduct(undefined, DEMO_PRODUCTS[0].id, "seeded");
    assert.equal(next.length, DEMO_PRODUCTS.length - 1);
  });

  it("can empty the list", () => {
    assert.deepEqual(withoutProduct([fresh], fresh.id, "seeded"), []);
  });
});

describe("addedSince", () => {
  const seededIds = DEMO_PRODUCTS.map((p) => p.id);

  it("finds only what is new, not the seeded library it materialised", () => {
    const products = withProduct(undefined, fresh, "seeded");
    assert.deepEqual(addedSince({ products }, seededIds), [fresh]);
  });

  it("finds nothing when nothing was added", () => {
    assert.deepEqual(addedSince({}, seededIds), []);
  });
});

describe("formatAdded", () => {
  it("shows the stored day in any timezone", () => {
    assert.equal(formatAdded("2026-07-02"), "Jul 2, 2026");
  });
});

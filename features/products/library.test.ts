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

const catalogued = productById("cerave-foaming-cleanser");
assert.ok(catalogued);
const added = savedProduct(catalogued, "1–4 weeks", new Date(2026, 10, 7, 23, 30));
const fresh = { ...added, id: "fresh" };
const other = { ...added, id: "other" };

describe("ownedProducts", () => {
  it("is empty on a fresh visit", () => {
    assert.deepEqual(ownedProducts({}), []);
  });

  it("is the user's own list once it exists", () => {
    assert.deepEqual(ownedProducts({ products: [fresh] }), [fresh]);
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
  it("starts from nothing on a fresh visit", () => {
    assert.deepEqual(withProduct(undefined, fresh), [fresh]);
  });

  it("adds beside what is already there", () => {
    assert.deepEqual(withProduct([other], fresh), [other, fresh]);
  });

  it("replaces a product already in the list rather than duplicating it", () => {
    const next = withProduct([fresh], { ...fresh, duration: "4+ weeks" });
    assert.equal(next.length, 1);
    assert.equal(next[0].duration, "4+ weeks");
  });
});

describe("withoutProduct", () => {
  it("removes only that product", () => {
    assert.deepEqual(withoutProduct([other, fresh], fresh.id), [other]);
  });

  it("can empty the list", () => {
    assert.deepEqual(withoutProduct([fresh], fresh.id), []);
  });
});

describe("addedSince", () => {
  it("finds only what is new", () => {
    assert.deepEqual(addedSince({ products: [other, fresh] }, [other.id]), [fresh]);
  });

  it("finds nothing when nothing was added", () => {
    assert.deepEqual(addedSince({}, []), []);
  });
});

describe("formatAdded", () => {
  it("shows the stored day in any timezone", () => {
    assert.equal(formatAdded("2026-07-02"), "Jul 2, 2026");
  });
});

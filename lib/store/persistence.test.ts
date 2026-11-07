import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { DEMO_PRODUCTS } from "@/lib/demo";
import { parsePersisted, pickPersisted } from "@/lib/store/persistence";

const roundTrip = (products: unknown) =>
  parsePersisted(JSON.stringify({ products }));

describe("persisted products", () => {
  it("keeps an emptied list, so the seeded library stays gone", () => {
    const stored = JSON.stringify(pickPersisted({ products: [] }));
    assert.deepEqual(parsePersisted(stored).products, []);
  });

  it("treats a list of only bad rows as absent", () => {
    assert.equal(roundTrip([{ nonsense: true }]).products, undefined);
  });

  it("keeps the good rows of a mixed list", () => {
    const parsed = roundTrip([DEMO_PRODUCTS[0], { nonsense: true }]);
    assert.deepEqual(parsed.products, [DEMO_PRODUCTS[0]]);
  });

  it("reads an older timestamped addedOn as its date", () => {
    const old = { ...DEMO_PRODUCTS[0], addedOn: "2026-10-03T09:15:00.000Z" };
    assert.equal(roundTrip([old]).products?.[0].addedOn, "2026-10-03");
  });
});

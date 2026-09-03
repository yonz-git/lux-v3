/**
 * The seeded investigation — what the prototype shows before the user has
 * answered anything.
 *
 * ⚠️ THIS EXISTS BECAUSE THE BUILD IS A PORTFOLIO PIECE. Someone opening it has
 * a minute, not the ten it takes to walk GETTING STARTED, and both readout
 * sections are worthless without answers to read: `/progress` would open on
 * "No active investigation" and `/check` on "No skin profile yet". So an
 * investigation is assumed until the user starts a real one, at which point
 * their own answers take over completely.
 *
 * ⚠️ IT IS NOT A BREACH OF "THE PROTOTYPE STARTS EMPTY". That rule is about
 * SELECTION CONTROLS rendering pre-ticked — on a question screen the user does
 * the selecting, and every one of those still starts blank. Nothing here is a
 * control; these are readouts.
 *
 * ⚠️ ONE PROFILE, TWO SECTIONS. PROGRESS and CHECK both show the user's skin
 * profile, and they were seeding it separately for a while — which is how a
 * demo ends up claiming two different skin types depending on which tab you are
 * on. `skinProfile()` is the only way either section resolves it.
 *
 * The values are the comps' own: `Check — start` (601:1952) writes
 * "Combination · Sensitive · Acne-prone" and `Progress — active` (552:1241)
 * writes Combination / Sensitive.
 *
 * Delete this the moment there is a backend to resume from.
 */
import type { Answers } from "@/lib/store/answers";
import { bucketFor, productById, type Duration, type SavedProduct } from "@/features/products/products";

export const DEMO_PROFILE = {
  skinType: "Combination",
  /**
   * ⚠️ BOTH TENDENCIES, WHICH THE PROGRESS COMP DOES NOT SHOW. Its `Tendency`
   * column reads just "Sensitive", while five CHECK screens read
   * "Combination · Sensitive · Acne-prone". Step 2's tendencies are
   * multi-select, so a user really can hold both and PROGRESS has to render
   * that anyway — the narrower comp is the one abbreviating, not the wider one
   * inventing. Carrying both keeps one profile across the app.
   */
  tendencies: ["Sensitive", "Acne-prone"],
  /**
   * The two halves of the profile card's `Current:` line, as DATA.
   *
   * ⚠️ IT USED TO BE THE FINISHED STRING — `current: "Current: Redness, Itching
   * on Cheeks"` — transcribed from the comp beside a doc comment saying it was
   * "step 1's symptoms placed on step 1's locations". It was not; nothing
   * assembled it, so the demo carried a sentence while every other path
   * assembled one, and the two could drift. The daily check-in is what forced
   * the issue: it reports a fresh location each day, and there is no way to put
   * a new location into a baked sentence. `formatCurrent` in lib/progress.ts is
   * the single assembler now and this is one of its three inputs.
   */
  symptoms: ["Redness", "Itching"],
  locations: ["Cheeks"],
} as const;

export type SkinProfile = {
  skinType?: string;
  tendencies?: string[];
  /** false once the user has answered step 2 — then it is all their data */
  isDemo: boolean;
};

/**
 * The skin profile to render: the user's own answers if they have given any,
 * else the seeded one.
 *
 * ⚠️ PURE, AND THAT MATTERS. Both callers render during SSR with an empty
 * store, so this branch is what gets prerendered. Nothing here reads a clock or
 * anything else that could differ between the server and the client.
 */
export function skinProfile(a: Answers): SkinProfile {
  const skinType = a["skin-type"];
  const tendencies = a.tendencies;

  if (skinType || tendencies?.length) {
    return { skinType, tendencies, isDemo: false };
  }

  return {
    skinType: DEMO_PROFILE.skinType,
    tendencies: [...DEMO_PROFILE.tendencies],
    isDemo: true,
  };
}


/* ---------------------------------------------------------------------------
   THE DEMO PRODUCT LIBRARY

   ⚠️ THE SAME CALL AS THE PROFILE, AND IT FIXES THREE SCREENS AT ONCE. The demo
   user had a skin profile and a check history but owned nothing, which left:

     /products     greeting a visitor with "No products added yet"
     /check/new    with an empty "Your products" list — so it was patched with a
                   catalogue browse that made a COMPARISON tool read as an
                   inventory, opening on four near-identical CeraVe moisturisers
     /check        unable to demonstrate its primary case at all — "do these two
                   things I already own work together?"

   Seeding the library removes the patch rather than adding another one.

   ⚠️ IT IS THE COMP'S OWN FIVE. These are exactly the products `Check results`
   (476:2841) analyses, so the library, the seeded check history and the
   designed results screen are all the same set.

   ⚠️ STEP 5 DOES *NOT* READ THIS, AND THAT IS AN OPEN QUESTION. This comment
   used to claim it did. It does not: `YourProducts` reads `answers.products`
   raw, on its own documented reasoning that the add screen has to arrive empty
   so the user can watch `groupProducts` grow headers as they add. Both
   positions are defensible and they contradict each other — a library that
   persists across investigations argues step 5 should open on these five; the
   live-sorting demo argues it must open on nothing. The visible cost of the
   split is that `/products` lists five products and "Add more products" lands
   on a screen saying "No products added yet". Left as-is rather than decided
   silently. Every OTHER owned-products reader goes through `ownedProducts`.
   -------------------------------------------------------------------------- */

/**
 * One seeded product: the CATALOGUE entry plus the two answers the add tray
 * collects.
 *
 * ⚠️ IT RESOLVES BY ID RATHER THAN RESTATING THE PRODUCT. These five were
 * written out in full — name, brand and size copied from `CATALOG` — which was
 * harmless only while a product was those three fields. It is not: a catalogue
 * entry now carries an INCI list that the expanded accordion card renders and
 * `activesOf` reads, and a hand-copied twin would have shipped five products
 * whose Ingredients section was empty on the one screen that is the demo.
 * `demoCheck` in lib/check.ts already resolves its fixtures this way and for
 * the same reason.
 *
 * The group is derived by `bucketFor`, never set — see lib/products.ts.
 */
function demoProduct(id: string, duration: Duration, addedOn: string): SavedProduct {
  const product = productById(id);
  if (!product) throw new Error(`demo product not in the catalogue: ${id}`);
  return { ...product, duration, bucket: bucketFor(duration), addedOn };
}

export const DEMO_PRODUCTS: SavedProduct[] = [
  demoProduct("the-ordinary-niacinamide", "4+ weeks", "2026-07-02"),
  demoProduct("cerave-moisturizing-cream-16", "4+ weeks", "2026-06-14"),
  demoProduct("cerave-foaming-cleanser", "1–4 weeks", "2026-08-04"),
  demoProduct("lrp-retinol-b3-serum", "1–4 weeks", "2026-08-08"),
  demoProduct("paulas-choice-bha-exfoliant", "Less than 1 week", "2026-08-15"),
];

/**
 * The products the user owns — theirs once they have touched the list, else the
 * seeded library.
 *
 * ⚠️ A FALLBACK, NOT A MERGE, and not a write into the store. The moment the
 * user adds their first product the demo library disappears whole rather than
 * leaving five strangers mixed in with it.
 *
 * ⚠️ THE SIGNAL IS `undefined` vs `[]`, NOT `length`. It used to read
 * `own.length > 0 ? own : DEMO_PRODUCTS`, which cannot tell "has never touched
 * the list" from "has emptied it" — so removing your last product resurrected
 * all five seeded ones. An absent key means untouched; an array, even an empty
 * one, means the list is theirs and is allowed to be empty.
 *
 * ⚠️ EVERY SCREEN THAT SHOWS OWNED PRODUCTS MUST COME THROUGH HERE. Reading
 * `answers.products` directly is how `/products` came to count the seeded
 * library on its category rows while `/products/[bucket]` — the list behind
 * those very rows — read the raw store and rendered "No products in this list
 * yet". The hub said 2, the list said 0, and adding a product looked like it
 * had not saved. `AddProductMethodSheet` and `CheckBuilder` are the exceptions
 * and must stay raw: they compute what the USER added, and a seeded product is
 * not something the user added.
 */
export function ownedProducts(a: Answers): SavedProduct[] {
  return a.products ?? DEMO_PRODUCTS;
}

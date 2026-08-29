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
import type { Answers } from "./answers";
import type { SavedProduct } from "./products";

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
  /** step 1's symptoms placed on step 1's locations — see currentSymptoms() */
  current: "Current: Redness, Itching on Cheeks",
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

   ⚠️ YOUR LIBRARY IS NOT PART OF ONE INVESTIGATION. Step 5 reads this too, and
   that is correct rather than a leak: products you use persist across
   investigations, and step 5 is where you ADD to the list, not where the list
   begins. Walking the flow adds to these rather than starting from nothing.
   -------------------------------------------------------------------------- */

export const DEMO_PRODUCTS: SavedProduct[] = [
  {
    id: "the-ordinary-niacinamide",
    name: "Niacinamide 10% + Zinc 1%",
    brand: "The Ordinary",
    size: "1 fl oz",
    duration: "4+ weeks",
    bucket: "long-term",
    addedOn: "2026-07-02",
  },
  {
    id: "cerave-moisturizing-cream-16",
    name: "Moisturizing Cream",
    brand: "CeraVe",
    size: "16 oz tub",
    duration: "4+ weeks",
    bucket: "long-term",
    addedOn: "2026-06-14",
  },
  {
    id: "cerave-foaming-cleanser",
    name: "Foaming Cleanser",
    brand: "CeraVe",
    size: "12 fl oz",
    duration: "1–4 weeks",
    bucket: "recent",
    addedOn: "2026-08-04",
  },
  {
    id: "lrp-retinol-b3-serum",
    name: "Retinol B3 Serum",
    brand: "La Roche-Posay",
    size: "1 fl oz",
    duration: "1–4 weeks",
    bucket: "recent",
    addedOn: "2026-08-08",
  },
  {
    id: "paulas-choice-bha-exfoliant",
    name: "BHA Exfoliant",
    brand: "Paula's Choice",
    size: "4 fl oz",
    duration: "Less than 1 week",
    bucket: "new-addition",
    addedOn: "2026-08-15",
  },
];

/**
 * The products the user owns — theirs once they have added any, else the seeded
 * library.
 *
 * ⚠️ A FALLBACK, NOT A MERGE, and not a write into the store. The moment the
 * user adds their first product the demo library disappears whole rather than
 * leaving five strangers mixed in with it.
 */
export function ownedProducts(a: Answers): SavedProduct[] {
  const own = a.products ?? [];
  return own.length > 0 ? own : DEMO_PRODUCTS;
}

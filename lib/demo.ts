/**
 * The seeded investigation — what the prototype shows before the user has
 * answered anything.
 */
import type { Answers } from "@/lib/store/answers";
import { bucketFor, productById, type Duration, type SavedProduct } from "@/features/products/products";

export const DEMO_PROFILE = {
  skinType: "Combination",
  tendencies: ["Sensitive", "Acne-prone"],
  /**
   * What was noticed and where, as DATA — the comp's "Redness, Itching on
   * Cheeks".
   */
  symptoms: ["Redness", "Itching"],
  locations: ["Cheeks"],
  /**
   * Step 4's status for the demo — what `/progress`'s profile card writes under
   * `Symptoms state`.
   */
  status: "Ongoing",
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

/* THE DEMO PRODUCT LIBRARY */

/**
 * One seeded product: the CATALOGUE entry plus the two answers the add tray
 * collects.
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

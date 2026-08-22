"use client";

import Link from "next/link";
import styles from "./MyProducts.module.css";
import { HubScreen } from "./HubScreen";
import { Button } from "./Button";
import { Orb } from "./Orb";
import { ChevronRightIcon } from "./icons";
import { useInvestigation } from "./InvestigationProvider";
import { BUCKETS, BUCKET_LIST_TITLE, countIn, type SavedProduct } from "@/lib/products";

/**
 * My Products — the PRODUCTS hub landing. ONE screen in two states:
 *   empty  Figma mobile 579:1574, desktop 583:1863
 *   filled Figma mobile 579:1607, desktop 583:1889
 *
 * ⚠️ A HUB LANDING HAS NO BACK CHEVRON. It is reached from the bottom nav, so
 * there is nothing to go back to — and no progress track and no `Save & exit`,
 * because it is not an investigation step.
 *
 * ⚠️ THE TWO STATES USE DIFFERENT DESKTOP COMPOSITIONS, and that is the comps'
 * own decision, not an inconsistency to iron out: the empty state floats an orb
 * and a CTA on the gradient with no card (the same exception every LUX empty
 * state and welcome screen has), while the filled state is a list and gets the
 * standard centred 920 card.
 *
 * The empty state's hero is the orb, matching `Progress — empty` and the CHECK
 * empty states. The wireframe's giant LUX wordmark is deliberately NOT used: the
 * logo is a brand asset, not a screen element.
 */
export function MyProducts() {
  const { answers } = useInvestigation();
  const products: SavedProduct[] = answers.products ?? [];

  if (products.length === 0) {
    return (
      <HubScreen title="My Products" layout="plain" center>
        <div className={styles.empty}>
          <Orb className="reveal-hero" />
          <h2 className="t-h4-h3">No products added yet</h2>
          <p className={`${styles.emptyText} t-body3-body2`}>
            Add products you use to check skin compatibility.
          </p>
          <Button className={styles.emptyCta} href="/investigation/products">
            Add products
          </Button>
        </div>
      </HubScreen>
    );
  }

  return (
    <HubScreen
      title="My Products"
      subtitle={`${products.length} product${products.length === 1 ? "" : "s"} added`}
      layout="card"
    >
      {/* every period is listed, including the empty ones — the comp shows all
          three, and a category that disappears when it empties would make the
          list look like it lost something */}
      <ul className={styles.categories}>
        {BUCKETS.map((b) => (
          <li key={b.id}>
            <Link href={`/products/${b.id}`} className={styles.category}>
              <span className={`${styles.categoryName} t-h6`}>
                {BUCKET_LIST_TITLE[b.id]}
              </span>
              <span className={`${styles.count} t-h6`}>{countIn(products, b.id)}</span>
              <ChevronRightIcon className={styles.chevron} />
            </Link>
          </li>
        ))}
      </ul>
    </HubScreen>
  );
}

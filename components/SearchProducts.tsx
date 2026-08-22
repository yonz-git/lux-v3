"use client";

import { useRouter } from "next/navigation";
import styles from "./SearchProducts.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { SearchField } from "./SearchField";
import { ProductRow, EmptyBox } from "./ProductList";
import { useInvestigation } from "./InvestigationProvider";
import { ChevronRightIcon } from "./icons";
import { searchCatalog, resultMeta, type CatalogProduct } from "@/lib/products";

/**
 * 04 — Search by name. Figma mobile 576:1428, desktop 582:1707. Step 8/8.
 *
 * ⚠️ THE FIELD STARTS EMPTY. The comp shows "CeraVe moist" and four results
 * because a comp has to show a populated search; here the user types.
 *
 * A result row both PICKS the product and drills into `04 — Confirm product` —
 * the comp gives every row a trailing chevron, which is a "go" affordance, so a
 * tap that only highlighted the row would contradict it. Continue does the same
 * thing, so coming back from Confirm and pressing Continue still works.
 */
export function SearchProducts() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();

  const query = answers.productQuery ?? "";
  const results = searchCatalog(query);

  function choose(product: CatalogProduct) {
    setAnswer("productDraft", {
      product,
      // the period the user is in — every designed add-flow screen sits inside
      // the long-term period, the only one drawn
      bucket: "long-term",
    });
    router.push("/investigation/products/confirm");
  }

  return (
    <QuestionScreen id="products-search" continueWidth="full" contentGap={24}>
      <h1 className="t-h3-h2">Search products</h1>

      <div className={styles.field}>
        <SearchField
          value={query}
          onChange={(v) => setAnswer("productQuery", v)}
          label="Search products by brand or name"
        />
      </div>

      <div className={styles.results}>
        {query.trim() === "" ? (
          // no query yet is not the same as no matches — say which
          <EmptyBox>Search for a product by brand or name</EmptyBox>
        ) : results.length === 0 ? (
          // ⚠️ The design has no empty-results state for THIS screen (CHECK has
          // one, `Check — no results`). Rather than draw a new treatment, this
          // reuses `empty-state`, the block the sibling screen 04a already uses
          // for "nothing here" — same section, same recipe.
          <EmptyBox>No products match “{query.trim()}”</EmptyBox>
        ) : (
          <ul className={styles.list}>
            {results.map((p) => (
              <li key={p.id}>
                <ProductRow
                  name={p.name}
                  meta={resultMeta(p)}
                  onClick={() => choose(p)}
                  trailing={<ChevronRightIcon className={styles.chevron} />}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </QuestionScreen>
  );
}

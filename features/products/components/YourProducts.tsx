"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./YourProducts.module.css";
import { QuestionScreen } from "@/features/my-skin/components/QuestionScreen";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Tag } from "@/components/ui/Tag";
import { AddProductMethodSheet } from "./AddProductMethodSheet";
import { ProductRow } from "./ProductList";
import { Button } from "@/components/ui/Button";
import { PlusIcon } from "@/components/ui/icons";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { BUCKET_WINDOW, fullName, groupProducts, type SavedProduct } from "@/features/products/products";
import { nextHref } from "@/features/my-skin/flow";

/**
 * Step 5 — `Your products`. The whole of PRODUCTS' investigation step, on one
 * screen. Nearest Figma frames: `04 — Add products` (574:1342 / 582:1612) for
 * the briefing and `04a — Long-term products` (574:1391 / 582:1662 empty,
 * 578:1557 / 582:1918 filled) for the list.
 */
export function YourProducts() {
  const router = useRouter();
  const { answers } = useInvestigation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const products: SavedProduct[] = answers.products ?? [];
  const filled = products.length > 0;
  const done = nextHref("products") ?? "/products";

  const groups = groupProducts(products);
  const grouped = groups.length > 1;

  return (
    <>
      <QuestionScreen
        id="products"
        contentGap={24}
        contentGapDesktop={64}
        nav="products"
        tightTop
      >
        <ChatBubble from="ai" full className={styles.briefBubble}>
          Now let&rsquo;s look at the products you&rsquo;ve been using.
        </ChatBubble>

        <ChatBubble
          from="ai"
          full
          className={`${styles.stackedBubble} ${styles.briefBubble}`}
        >
          Please include every product used on the affected area during the last
          four weeks, even products you have used without problems.
        </ChatBubble>

        {!filled ? null : grouped ? (
          <div className={styles.listWrap}>
            {groups.map((g) => (
              <section key={g.bucket.id} className={styles.group}>
                <h2 className={styles.groupHeader}>
                  <span className={`${styles.groupName} t-h6`}>{g.bucket.name}</span>
                  <span className={`${styles.groupWindow} t-label-sm`}>
                    {BUCKET_WINDOW[g.bucket.id]}
                  </span>
                </h2>
                <ul className={styles.list}>
                  {g.products.map((p) => (
                    <li key={p.id}>
                      <ProductRow name={fullName(p)} product={p} />
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        ) : (
          // one group so far — a flat list, with each row's own duration `Tag`
          // carrying the period information a header would otherwise repeat
          <ul className={`${styles.list} ${styles.listWrap}`}>
            {products.map((p) => (
              <li key={p.id}>
                <ProductRow
                  name={fullName(p)}
                  product={p}
                  trailing={<Tag>{p.duration}</Tag>}
                />
              </li>
            ))}
          </ul>
        )}

        <div
          className={`${styles.addWrap} ${styles.addCentre} ${filled ? "" : styles.addWrapEmpty}`}
        >
          <Button
            variant="secondary"
            size="md"
            icon={<PlusIcon />}
            onClick={() => setSheetOpen(true)}
          >
            Add product
          </Button>
        </div>

        {filled ? (
          <p className={`${styles.count} t-label-sm`}>
            {products.length} product{products.length === 1 ? "" : "s"} added
            {grouped ? ` across ${groups.length} groups` : ""}
          </p>
        ) : (
          // an inline skip, not a header `Skip` — the question is genuinely
          // optional here, and the header's escape hatch is `Save & exit`
          <button
            type="button"
            className={`${styles.skip} t-label`}
            onClick={() => router.push(done)}
          >
            None, skip to next
          </button>
        )}
      </QuestionScreen>

      <AddProductMethodSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./YourProducts.module.css";
import { QuestionScreen } from "./QuestionScreen";
import { ChatBubble } from "./ChatBubble";
import { Tag } from "./Tag";
import { AddProductMethodSheet } from "./AddProductMethodSheet";
import { ProductRow, AddProductRow } from "./ProductList";
import { useInvestigation } from "./InvestigationProvider";
import { BUCKET_WINDOW, fullName, groupProducts, type SavedProduct } from "@/lib/products";
import { nextHref } from "@/lib/flow";

/**
 * Step 5 — `Your products`. The whole of PRODUCTS' investigation step, on one
 * screen. Nearest Figma frames: `04 — Add products` (574:1342 / 582:1612) for
 * the briefing and `04a — Long-term products` (574:1391 / 582:1662 empty,
 * 578:1557 / 582:1918 filled) for the list.
 *
 * ⚠️ IT REPLACES TWO SCREENS AND A PROMISE. `Add products intro` told the user
 * "we'll go through three time periods" and then offered three rows that all
 * did the same thing — every one of them opened the tray without setting a
 * period, so everything filed under Long term. The two periods it promised were
 * never drawn, at either breakpoint or in the wireframes, and Continue skipped
 * straight past them to the hub. The step no longer has periods to walk
 * through: the user adds a product, says how long they have used it, and the
 * list sorts itself. See `bucketFor` and `groupProducts`.
 *
 * ⚠️ NOT IN FIGMA — THE NAV LIGHTS `Products` HERE, NOT `My skin`. This is
 * still step 5 of the profile — track, `Save & exit` and all — but the screen
 * IS the products list, reached to add products, and the nav names the section
 * the user is looking at. Every other flow screen keeps the `my-skin` default.
 *
 * ⚠️ THE PROTOTYPE ARRIVES EMPTY. The comps show two products because a comp
 * has to show a filled-in state; which state renders here is decided by what
 * the user has actually added.
 *
 * The empty state offers "None — skip to next"; the filled state drops it and
 * shows a count instead. That is the comps' own difference between 574:1391 and
 * 578:1557, not a simplification. The briefing itself is the same two bubbles in
 * both states — a third empty-state-only bubble explaining that each product is
 * added one at a time and sorted by duration was cut, because the tray asks
 * that question with the product on screen and the list then sorts itself in
 * view. Explaining a mechanic the user is about to watch happen is noise.
 */
export function YourProducts() {
  const router = useRouter();
  const { answers } = useInvestigation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const products: SavedProduct[] = answers.products ?? [];
  const filled = products.length > 0;
  const done = nextHref("products") ?? "/products";

  // ⚠️ THE LIST GROUPS ITSELF, LIVE. Headers appear the moment a SECOND group
  // has something in it — one group needs no header to explain it, and a lone
  // "Long term" heading over every row the user has ever added is noise. Past
  // that point the sorting is the thing worth showing, and showing it here is
  // what makes an end-of-step "here's how I sorted them" screen unnecessary:
  // the user has already watched it happen.
  const groups = groupProducts(products);
  const grouped = groups.length > 1;

  return (
    <>
      <QuestionScreen
        id="products"
        contentGap={24}
        /* ⚠️ NOT IN FIGMA — 64 where every other desktop frame uses 40. This is
           the only flow screen whose card is short enough to leave the page
           half empty, so at 40 it hung off the progress track instead of
           sitting in the page. */
        contentGapDesktop={64}
        titleVisible
        nav="products"
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

        {/* ⚠️ THE EMPTY STATE DRAWS NO LIST AT ALL — NOT IN FIGMA. 574:1391
            puts an empty box reading "No products added yet" where the list
            goes, directly above an `Add product` row. The box states what the
            absence of rows already states, and it does it in a bordered
            container that reads as a list with one item in it. Nothing is
            drawn until there is something to draw; `Add product` moves up. */}
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
                      <ProductRow name={fullName(p)} meta={p.size} product={p} />
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
                  meta={p.size}
                  product={p}
                  trailing={<Tag>{p.duration}</Tag>}
                />
              </li>
            ))}
          </ul>
        )}

        <div className={`${styles.addWrap} ${filled ? "" : styles.addWrapEmpty}`}>
          <AddProductRow label="Add product" onClick={() => setSheetOpen(true)} />
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
            None — skip to next
          </button>
        )}
      </QuestionScreen>

      <AddProductMethodSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

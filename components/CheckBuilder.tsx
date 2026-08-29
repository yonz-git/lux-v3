"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CheckBuilder.module.css";
import { HubScreen } from "./HubScreen";
import { Button } from "./Button";
import { SearchField } from "./SearchField";
import { SkinProfileStrip } from "./SkinProfileStrip";
import { ProductRow } from "./ProductList";
import { SmallButton } from "./SmallButton";
import { Tag } from "./Tag";
import { CheckBasketBar, CheckBasketSheet } from "./CheckBasket";
import { AddProductMethodSheet } from "./AddProductMethodSheet";
import { useInvestigation } from "./InvestigationProvider";
import {
  MAX_CHECK_PRODUCTS,
  checkSearchTerms,
  matchedActives,
} from "@/lib/check";
import { ownedProducts, skinProfile } from "@/lib/demo";
import {
  type CatalogProduct,
  fullName,
  productById,
  resultMeta,
  searchCatalog,
} from "@/lib/products";

/**
 * `/check/new` — build the check.
 *
 * ⚠️ ONE SCREEN, NOT SIX. The design walks `Check — add products` →
 * `Check — selection · 1 / 3 / 5 products` → `Check — tray collapsed` →
 * `Check — no results`. Those are not six screens; they are one screen and a
 * basket in different states, and the handoff already says the three selection
 * frames "are ONE screen in three states — the base was built once and cloned".
 * So: one route.
 *
 *   the basket        a docked bar that expands into the drawn sheet —
 *                     see CheckBasket.tsx for why the bar is the resting state
 *   no results        a state of the list, not a screen
 *   selection · N     the sheet, with N in it
 *
 * ⚠️ YOUR OWN PRODUCTS COME FIRST — NOT IN FIGMA. The comp opens on a search
 * field and an unfiltered result list, so checking two things you already told
 * the app you own means typing both names back in. Step 5 and the PRODUCTS hub
 * already hold them, and "do these two things I own work together?" is the
 * primary case this feature exists for. So with an empty query the list is your
 * products, and typing makes it the catalogue search the comp draws.
 *
 * ⚠️ AND THE BASKET BAR IS ALWAYS THERE, STATING THE GOAL. Nothing on this
 * screen used to say you were building a set of two or more — the requirement
 * lived inside a sheet you could only open by adding something first, so you
 * found the rule by breaking it. See `CheckBasketBar`.
 *
 * ⚠️ "Add it manually" RETURNS TO THE CHECK. The transition map sends it into
 * the PRODUCTS add flow and then stops — you were mid-check with a basket, and
 * nothing said how you got back. It opens the PRODUCTS tray in place instead,
 * and whatever it adds joins the basket. Same class of dangling path the
 * PRODUCTS remap fixed.
 *
 * ⚠️ A ROW ALREADY IN THE BASKET SWAPS ITS `Add` FOR A READ-ONLY `Added` Tag —
 * the handoff's rule, and Tag is non-interactive by contract: removal happens
 * in the basket, not in the list.
 */
export function CheckBuilder() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [addManually, setAddManually] = useState(false);

  const query = answers.checkQuery ?? "";
  const basketIds = answers.checkBasket ?? [];
  const basket = basketIds
    .map(productById)
    .filter((p): p is CatalogProduct => Boolean(p));

  /* ⚠️ NEWEST FIRST. A product library in the order it happened to be entered
     buries the thing you are most likely asking about — the one you just
     started using. It also decided what the first two rows were, and with the
     oldest two on top the obvious first check ("tap the top two") produced the
     least informative result the checker can give: nothing flagged, no
     conflicts, both synthesis cards empty. Recency is the honest ordering AND
     the one that shows the tool doing its job. */
  const owned = [...ownedProducts(answers)].sort((a, b) =>
    b.addedOn.localeCompare(a.addedOn)
  );
  const full = basket.length >= MAX_CHECK_PRODUCTS;

  /* Empty query → the products you own. Typing → the catalogue.

     ⚠️ THE "ALL PRODUCTS" BROWSE MODE IS GONE. It existed because a portfolio
     visitor owned nothing, so "Your products" was an empty box — and dumping the
     catalogue in its place made a COMPARISON tool read as an inventory, opening
     on four near-identical CeraVe moisturisers. Nobody compares two sizes of the
     same cream. The real fix was upstream: seed the product library
     (`ownedProducts`), so the primary case — "do these two things I own work
     together?" — is what the screen actually opens on. */
  const searching = query.trim() !== "";
  /* ⚠️ THE SEARCH READS INGREDIENTS TOO — `checkSearchTerms` is passed in
     because `lib/products.ts` cannot import the actives model without a cycle.
     It is what makes "salicylic" find the BHA Exfoliant, which the app already
     knew contained it and flagged on `/check/results` while refusing to find
     it here. Results come back RANKED; see `searchCatalog`. */
  const results: CatalogProduct[] = searching
    ? searchCatalog(query, checkSearchTerms)
    : owned;
  /* ⚠️ THE COUNT IS PART OF THE LABEL. With ranking in play the list no longer
     ends where the obvious matches end, so "did it find one thing or nine?" is
     a question the heading should answer without scrolling — the same reason
     `Check results` writes "Compared Products (5)". */
  const listLabel = searching
    ? `Search results (${results.length})`
    : "Your products";

  function add(p: CatalogProduct) {
    setAnswer("checkBasket", (prev) => {
      const next = prev ?? [];
      if (next.includes(p.id) || next.length >= MAX_CHECK_PRODUCTS) return next;
      return [...next, p.id];
    });
  }

  function remove(id: string) {
    setAnswer("checkBasket", (prev) => (prev ?? []).filter((x) => x !== id));
  }

  /**
   * The PRODUCTS tray writes into `answers.products` itself, so the way to know
   * what it added is to look at what is new. Anything that appeared while the
   * tray was open joins this check.
   */
  function closeManualAdd(before: string[]) {
    setAddManually(false);
    const after = (answers.products ?? []).map((p) => p.id);
    const added = after.filter((id) => !before.includes(id));
    if (added.length > 0) {
      setAnswer("checkBasket", (prev) => {
        const next = [...(prev ?? [])];
        for (const id of added) {
          if (!next.includes(id) && next.length < MAX_CHECK_PRODUCTS) {
            next.push(id);
          }
        }
        return next;
      });
    }
  }

  const ownedIdsWhenOpened = (answers.products ?? []).map((p) => p.id);

  /** The row's meta line, plus the ingredient that pulled it in when the query
   *  matched nothing visible on the row itself. */
  function metaFor(p: CatalogProduct): string {
    const base = resultMeta(p);
    if (!searching) return base;
    const hits = matchedActives(p, query);
    if (hits.length === 0) return base;
    const face = `${p.brand} ${p.name} ${p.size}`.toLowerCase();
    /* only when the match is INVISIBLE on the row — "Retinol B3 Serum" already
       says retinol, and repeating it reads as a bug rather than a reason */
    const hidden = hits.filter((h) => !face.includes(h.toLowerCase().split(" ")[0]));
    if (hidden.length === 0) return base;
    return `${base} · Contains ${hidden.join(", ")}`;
  }

  return (
    <>
      <HubScreen
        title="Add products to check"
        nav="check"
        backHref="/check"
        layout="card"
      >
        <SkinProfileStrip {...skinProfile(answers)} />

        <div className={styles.search}>
          <SearchField
            value={query}
            onChange={(v) => setAnswer("checkQuery", v)}
            label="Search products to check"
          />
        </div>

        <h2 className={`${styles.sectionLabel} t-label`}>{listLabel}</h2>

        {results.length > 0 ? (
          <ul className={styles.list}>
            {results.map((p) => {
              const inBasket = basketIds.includes(p.id);
              return (
                <li key={p.id}>
                  <ProductRow
                    name={p.name}
                    /* ⚠️ BRAND **AND SIZE**, where the comp's rows show the
                       brand alone. Its four results all have distinct names;
                       the real catalogue has a 16 oz and a 12 oz CeraVe
                       Moisturizing Cream, which render as two identical rows on
                       brand alone. `resultMeta` is the same helper the PRODUCTS
                       search uses and it drops the dash when a product has no
                       size, so anything shaped like the comp's data still reads
                       exactly like the comp. */
                    /* ⚠️ SAY WHY AN INGREDIENT MATCH CAME BACK. Typing
                       "salicylic" returns "BHA Exfoliant · Paula's Choice"
                       — a row with the word nowhere on it. Without the
                       reason the search looks wrong at exactly the moment
                       it started working. */
                    meta={metaFor(p)}
                    imageUrl={p.imageUrl}
                    trailing={
                      inBasket ? (
                        <Tag variant="brand">Added</Tag>
                      ) : (
                        <SmallButton
                          label="Add"
                          arrow={false}
                          disabled={full}
                          aria-label={`Add ${fullName(p)} to this check`}
                          onClick={() => add(p)}
                        />
                      )
                    }
                  />
                </li>
              );
            })}
          </ul>
        ) : searching ? (
          /* `Check — no results` (651:2510), as a state rather than a screen */
          <>
            <div className={styles.emptyBox}>
              <p className={`${styles.emptyTitle} t-h6`}>No products found</p>
              <p className={`${styles.emptyText} t-body3`}>
                Check the spelling, or add the product yourself.
              </p>
            </div>
            <Button
              variant="secondary"
              className={styles.manual}
              onClick={() => setAddManually(true)}
            >
              Add it manually
            </Button>
          </>
        ) : null}

        {/* keeps the last row clear of the docked bar, which is fixed and so
            takes no space in the flow. Unconditional, because the bar is now
            present from zero products. */}
        <div className={styles.barSpacer} aria-hidden="true" />
      </HubScreen>

      <CheckBasketBar count={basket.length} onExpand={() => setSheetOpen(true)} />

      <CheckBasketSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        products={basket}
        onRemove={remove}
        onAddAnother={() => setSheetOpen(false)}
        onSubmit={() => {
          setSheetOpen(false);
          router.push("/check/analyzing");
        }}
      />

      <AddProductMethodSheet
        open={addManually}
        onClose={() => closeManualAdd(ownedIdsWhenOpened)}
      />
    </>
  );
}

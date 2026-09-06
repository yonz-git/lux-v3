"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CheckBuilder.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/SearchField";
import { SkinProfileStrip } from "./SkinProfileStrip";
import { ProductRow } from "@/features/products/components/ProductList";
import { ProductDetails } from "@/features/products/components/ProductDetails";
import { ProductThumb } from "@/features/products/components/ProductThumb";
import { SmallButton } from "@/components/ui/SmallButton";
import { Tag } from "@/components/ui/Tag";
import { CheckBasketBar, CheckBasketSheet } from "./CheckBasket";
import { AddProductMethodSheet } from "@/features/products/components/AddProductMethodSheet";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import {
  MAX_CHECK_PRODUCTS,
  checkSearchTerms,
  matchedActives,
} from "@/features/check/check";
import { ownedProducts, skinProfile } from "@/lib/demo";
import {
  type CatalogProduct,
  fullName,
  resultMeta,
  searchCatalog,
} from "@/features/products/products";
import { useOpenBeautyFactsSearch } from "@/features/products/useOpenBeautyFactsSearch";

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
/** Live results first, then anything the local ingredient index found that the
 *  live list did not already contain. First occurrence of an id wins. */
function dedupe(products: CatalogProduct[]): CatalogProduct[] {
  const seen = new Set<string>();
  return products.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function CheckBuilder() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [addManually, setAddManually] = useState(false);
  /* ⚠️ THE PANEL IS DISMISSIBLE, and it has to be. In the tray the dropdown is
     in flow, so it can only ever push content; here it FLOATS over the page's
     own list, and an overlay you cannot put away is a trap — you would have to
     empty the search field to see what is under it. Escape and a click outside
     close it; the next keystroke in the field opens it again, because typing is
     unambiguously asking for results. */
  const [dismissed, setDismissed] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const query = answers.checkQuery ?? "";
  const basket = answers.checkBasket ?? [];
  const basketIds = basket.map((p) => p.id);

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
  /* ⚠️ THE SAME SEARCH THE PRODUCTS TRAY RUNS — `useOpenBeautyFactsSearch`.
     This screen used to search the 13-product offline fixture ALONE while the
     add-product tray searched Open Beauty Facts live, so the same query typed
     two screens apart returned two unrelated lists and neither explained
     itself: search "cerave" in the tray and you get the real shelf, search it
     here and you got four fixture rows plus whatever the ingredient index
     dragged in. One search function, one debounce, one fixture fallback.

     ⚠️ THE INGREDIENT INDEX SURVIVES, AS A LOCAL PASS. `checkSearchTerms` is
     what makes "salicylic" find the BHA Exfoliant — a compatibility question,
     and the reason this screen searched differently in the first place. It runs
     over the fixture and is MERGED UNDER the live results rather than replacing
     them, so the ingredient case still works and the list still leads with what
     the user typed. Live results carry their own INCI list, so the checker
     reads their actives directly; see `activesOf` in lib/check.ts. */
  const { results: live, loading } = useOpenBeautyFactsSearch(query);
  const byIngredient = searching ? searchCatalog(query, checkSearchTerms) : [];
  const results: CatalogProduct[] = searching
    ? dedupe([...live, ...byIngredient])
    : owned;
  /* ⚠️ THE COUNT IS PART OF THE LABEL, and it matters more now the results are
     a capped panel: "did it find one thing or nine?" is a question you can no
     longer answer by looking at the page, because the panel clips its own list.
     Same reason `Check results` writes "Compared Products (5)". It sits in the
     panel's head, which does not scroll with the rows. */
  const resultsLabel = `Search results (${results.length})`;
  const open = searching && !dismissed;

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (!searchRef.current?.contains(e.target as Node)) setDismissed(true);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function add(p: CatalogProduct) {
    setAnswer("checkBasket", (prev) => {
      const next = prev ?? [];
      if (next.some((x) => x.id === p.id) || next.length >= MAX_CHECK_PRODUCTS) {
        return next;
      }
      return [...next, p];
    });
  }

  function remove(id: string) {
    setAnswer("checkBasket", (prev) => (prev ?? []).filter((p) => p.id !== id));
  }

  /**
   * The PRODUCTS tray writes into `answers.products` itself, so the way to know
   * what it added is to look at what is new. Anything that appeared while the
   * tray was open joins this check.
   */
  function closeManualAdd(before: string[]) {
    setAddManually(false);
    const added = (answers.products ?? []).filter((p) => !before.includes(p.id));
    if (added.length > 0) {
      setAnswer("checkBasket", (prev) => {
        const next = [...(prev ?? [])];
        for (const p of added) {
          if (!next.some((x) => x.id === p.id) && next.length < MAX_CHECK_PRODUCTS) {
            next.push(p);
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

  /** ⚠️ ONE FIXED SLOT FOR BOTH STATES — NOT IN FIGMA. The handoff's swap is
   *  between two components of different SIZE: Small Button is 36 tall with 16
   *  side padding, Tag is 26 with 12. Adding a product therefore shrank the
   *  control it replaced and pulled the row's right edge in, so a list where
   *  you add several things twitched on every tap. The slot is sized once and
   *  both states fill it; each keeps its own fill, radius and type. Shared by
   *  the page's own rows and the dropdown's, so the two lists cannot drift. */
  function trailingFor(p: CatalogProduct) {
    return (
      <span className={styles.trailing}>
        {basketIds.includes(p.id) ? (
          <Tag variant="brand">Added</Tag>
        ) : (
          <SmallButton
            label="Add"
            arrow={false}
            disabled={full}
            aria-label={`Add ${fullName(p)} to this check`}
            onClick={() => add(p)}
          />
        )}
      </span>
    );
  }

  return (
    <>
      {/* ⚠️ THE BACK CHEVRON FOLLOWS WHERE YOU CAME FROM. Step 4 of the
          investigation continues HERE now rather than to `/investigation/products`
          — this screen and step 5 were two builders doing the same job in two
          sections, and the merge starts by having one. So someone arriving from
          the flow must be able to go back INTO the flow; a fixed `/check` would
          drop them out of it.

          ⚠️ THE SIGNAL IS THE FLARE DATE, NOT A QUERY PARAM OR NEW STATE. Only
          step 4 sets `timing.date`, so its presence IS "this person is part-way
          through an investigation". A `?from=` would have to survive the tray,
          the search and a reload; an answer already in the store does not. */}
      <HubScreen
        title="Add your products"
        nav="check"
        backHref={answers.timing?.date ? "/investigation/timing" : "/check"}
        layout="card"
        tightTop
      >
        <SkinProfileStrip {...skinProfile(answers)} />

        {/* ⚠️ THE RESULTS ARE A FLOATING DROPDOWN, NOT THE PAGE'S LIST —
            NOT IN FIGMA, and the same call the PRODUCTS tray already made. They
            used to REPLACE the list below: typing swapped "Your products" for
            "Search results", so the page grew and shrank on every keystroke,
            the thing you were half-way through comparing disappeared while you
            looked something up, and a long result list scrolled the whole
            screen — search field, skin-profile strip and all — out of reach.
            The panel hangs off the pill, floats over the page, caps itself and
            takes its own scroll; "Your products" stays exactly where it was
            underneath. See `.dropdown` for why this one is absolutely
            positioned where the tray's is in flow. */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: the handler catches
            Escape BUBBLING UP from the SearchField inside — the interactive
            element is the input, and this wrapper only closes the panel that
            hangs off it. Giving the div a role to satisfy the rule would put a
            second, meaningless control in the accessibility tree. */}
        <div
          className={styles.search}
          ref={searchRef}
          onKeyDown={(e) => {
            if (e.key === "Escape" && open) {
              e.stopPropagation();
              setDismissed(true);
            }
          }}
        >
          <SearchField
            value={query}
            onChange={(v) => {
              setAnswer("checkQuery", v);
              setDismissed(false);
            }}
            label="Search products to analyse"
          />

          {/* the count is inside a panel a screen reader has to find, and the
              panel is not there at all until something is typed — so the result
              of typing is announced here, the same way the tray announces it */}
          <p role="status" aria-live="polite" className="visually-hidden">
            {!searching
              ? ""
              : loading
                ? "Searching…"
                : `${results.length} ${results.length === 1 ? "product" : "products"} found`}
          </p>

          {open && (
            <div className={`${styles.dropdown} reveal-quick`}>
              {loading ? (
                <p className={`${styles.dropdownNote} t-body3`}>Searching…</p>
              ) : results.length === 0 ? (
                /* `Check — no results` (651:2510), a state of the panel rather
                   than a screen — and reached only once the search has actually
                   answered. Without the `loading` gate it flashed up between the
                   debounce firing and the response landing, telling you the
                   product did not exist once per character typed. */
                <div className={styles.noResults}>
                  <p className={`${styles.emptyTitle} t-h6`}>No products found</p>
                  <p className={`${styles.emptyText} t-body3`}>
                    Check the spelling, or add the product yourself.
                  </p>
                  <Button
                    variant="secondary"
                    className={styles.manual}
                    onClick={() => {
                      setDismissed(true);
                      setAddManually(true);
                    }}
                  >
                    Add it manually
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className={`${styles.dropdownHead} t-label`}>{resultsLabel}</h2>
                  <div className={styles.scroll}>
                    <ul className={styles.results}>
                      {results.map((p) => (
                        <li key={p.id}>
                          {/* deliberately NOT `ProductRow` — that is the frosted
                              CARD recipe, and a card inside a panel is two
                              surfaces doing one job. Same call the tray's
                              dropdown makes. */}
                          <div className={styles.result}>
                            <ProductThumb product={p} />
                            <span className={styles.resultCopy}>
                              <span className={`${styles.resultName} t-h6`}>
                                {p.name}
                              </span>
                              {/* ⚠️ BRAND **AND SIZE**, plus the ingredient that
                                  pulled the row in when the query matches
                                  nothing visible on it — typing "salicylic"
                                  returns "BHA Exfoliant · Paula's Choice", a row
                                  with the word nowhere on it. */}
                              <span className={`${styles.resultMeta} t-label-sm`}>
                                {metaFor(p)}
                              </span>
                            </span>
                            {trailingFor(p)}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* The page's own list is now ALWAYS your products — the search never
            takes it over. Nothing is drawn when you own nothing: a heading over
            an empty box says less than the search field's placeholder does. */}
        {owned.length > 0 && (
          <>
            <h2 className={`${styles.sectionLabel} t-label`}>Your products</h2>
            <ul className={styles.list}>
              {owned.map((p) => (
                <li key={p.id}>
                  {/* ⚠️ THE ROW OPENS — NOT IN FIGMA, and it is the PRODUCTS
                      hub's move rather than a new one. This screen listed the
                      products you own beside an `Add` control and told you
                      nothing else about them, so a COMPATIBILITY check was
                      built out of rows whose ingredients you could not see
                      without leaving for the Products tab and coming back.
                      Same block the hub opens: `ProductDetails`. */}
                  <ProductRow
                    name={p.name}
                    meta={resultMeta(p)}
                    product={p}
                    trailing={trailingFor(p)}
                    details={<ProductDetails product={p} />}
                  />
                </li>
              ))}
            </ul>
          </>
        )}

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

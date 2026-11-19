"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CheckBuilder.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { Button } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/SearchField";
import { SkinProfileTiles } from "./SkinProfileTiles";
import { ProductRow } from "@/features/products/components/ProductList";
import { ProductDetails } from "@/features/products/components/ProductDetails";
import { ProductThumb } from "@/features/products/components/ProductThumb";
import { SmallButton } from "@/components/ui/SmallButton";
import { Tag } from "@/components/ui/Tag";
import { CheckBasketBar, CheckBasketSheet } from "./CheckBasket";
import { AddProductMethodSheet } from "@/features/products/components/AddProductMethodSheet";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { DROP_EXIT_MS, useDialogPresence, useHeldWhileClosing } from "@/lib/useModalDialog";
import { MAX_CHECK_PRODUCTS, matchedActives } from "@/features/check/check";
import { useCheckSearch } from "@/features/check/useCheckSearch";
import { addedSince, ownedProducts } from "@/features/products/library";
import { useToday } from "@/lib/useToday";
import { hasInvestigation, progressView } from "@/features/progress/progress";
import { CheckNoProfile } from "./CheckScreen";
import {
  type CatalogProduct,
  fullName,
} from "@/features/products/products";

/** `/check/new` — build the check. */
export function CheckBuilder({ now }: { now: number }) {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  /* the skin profile card's values, from PROGRESS's own view — so the two
     cards cannot say different things about the same person */
  const profile = progressView(answers, useToday(now));

  const [sheetOpen, setSheetOpen] = useState(false);
  const [addManually, setAddManually] = useState(false);
  const idsWhenOpened = useRef<string[]>([]);
  const [dismissed, setDismissed] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const query = answers.checkQuery ?? "";
  const basket = answers.checkBasket ?? [];
  const basketIds = basket.map((p) => p.id);

  const owned = [...ownedProducts(answers)].sort((a, b) =>
    b.addedOn.localeCompare(a.addedOn)
  );
  const full = basket.length >= MAX_CHECK_PRODUCTS;

  /* Empty query → the products you own. Typing → the catalogue. */
  const { results: found, loading, searching } = useCheckSearch(query);
  const results: CatalogProduct[] = searching ? found : owned;
  const resultsLabel = `Search results (${results.length})`;
  const open = searching && !dismissed;
  const dropdown = useDialogPresence(open, DROP_EXIT_MS);
  const shown = useHeldWhileClosing(open, { loading, results, resultsLabel });

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
   * The PRODUCTS tray writes into the library itself, so the way to know what it
   * added is to look at what is new. Anything that appeared while the tray was
   * open joins this check.
   */
  function openManualAdd() {
    idsWhenOpened.current = ownedProducts(answers).map((p) => p.id);
    setAddManually(true);
  }

  function closeManualAdd() {
    setAddManually(false);
    const added = addedSince(answers, idsWhenOpened.current);
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

  /**
   * The line under a dropdown row: ONLY the ingredient that pulled it in when
   *  the query matched nothing visible on the row itself, and nothing
   *  otherwise.
   */
  function metaFor(p: CatalogProduct): string {
    if (!searching) return "";
    const hits = matchedActives(p, query);
    if (hits.length === 0) return "";
    const face = `${p.brand} ${p.name}`.toLowerCase();
    /* only when the match is INVISIBLE on the row — "Retinol B3 Serum" already
       says retinol, and repeating it reads as a bug rather than a reason */
    const hidden = hits.filter((h) => !face.includes(h.toLowerCase().split(" ")[0]));
    if (hidden.length === 0) return "";
    return `Contains ${hidden.join(", ")}`;
  }

  function trailingFor(p: CatalogProduct) {
    return (
      <span className={styles.trailing}>
        {basketIds.includes(p.id) ? (
          <button
            type="button"
            className={`${styles.remove} tap-target`}
            aria-label={`Remove ${fullName(p)} from this analysis`}
            onClick={() => remove(p.id)}
          >
            <Tag variant="brand" size="sm" className={styles.added}>
              Added
            </Tag>
          </button>
        ) : (
          <SmallButton
            label="Add"
            /* the `Added` tag's 12 text and 12 padding */
            size="sm"
            arrow={false}
            specular={false}
            className={`${styles.add} tap-target`}
            disabled={full}
            aria-label={`Add ${fullName(p)} to this analysis`}
            onClick={() => add(p)}
          />
        )}
      </span>
    );
  }

  /* no skin profile to check against yet */
  if (!hasInvestigation(answers)) return <CheckNoProfile />;

  return (
    <>
      <HubScreen
        title="Products’ compatibility analysis"
        nav="check"
        backHref={answers.timing?.date ? "/investigation/timing" : "/check"}
        layout="card"
        tightTop
      >
        <SkinProfileTiles
          skinType={profile.skinType}
          tendencies={profile.tendencies}
          conditions={profile.conditions}
          symptomsState={profile.status}
        />

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
            placeholder="Search for a product"
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

          {dropdown.present && (
            <div
              className={`${styles.dropdown} drop`}
              data-state={dropdown.leaving ? "leaving" : undefined}
              inert={dropdown.leaving}
            >
              {shown.loading ? (
                <p className={`${styles.dropdownNote} t-body3`}>Searching…</p>
              ) : shown.results.length === 0 ? (
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
                      openManualAdd();
                    }}
                  >
                    Add it manually
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className={`${styles.dropdownHead} t-label`}>{shown.resultsLabel}</h2>
                  <div className={styles.scroll}>
                    <ul className={styles.results}>
                      {shown.results.map((p) => (
                        <li key={p.id}>
                          {/* deliberately NOT `ProductRow` — that is the frosted
                              CARD recipe, and a card inside a panel is two
                              surfaces doing one job. Same call the tray's
                              dropdown makes. */}
                          <div className={styles.result}>
                            <ProductThumb product={p} />
                            <span className={styles.resultCopy}>
                              <span className={`${styles.resultName} t-h6`}>
                                {fullName(p)}
                              </span>
                              {metaFor(p) && (
                                <span className={`${styles.resultMeta} t-label-sm`}>
                                  {metaFor(p)}
                                </span>
                              )}
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
                  <ProductRow
                    name={fullName(p)}
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
        onClose={closeManualAdd}
      />
    </>
  );
}

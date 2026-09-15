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
import { ownedProducts } from "@/lib/demo";
import { formatLong } from "@/lib/date";
import { useToday } from "@/lib/useToday";
import { dayNumber, progressView } from "@/features/progress/progress";
import {
  type CatalogProduct,
  fullName,
} from "@/features/products/products";

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
 * ⚠️ A ROW ALREADY IN THE BASKET SWAPS ITS `Add` FOR AN `Added` TAG, AND
 * TAPPING IT REMOVES THE PRODUCT — NOT IN FIGMA. The handoff drew `Added` as a
 * read-only Tag, with removal living only in the basket sheet. That meant
 * undoing a tap required opening the basket to reach the same row you had just
 * looked at. `Tag` itself stays non-interactive — the contract other callers
 * (the duration badge, the match score) rely on — so this wraps it in a plain
 * button, same pattern as `CheckBasket`'s own remove control, and the tag's
 * fill/label are unchanged.
 */
export function CheckBuilder({ now }: { now: number }) {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  /* the skin profile card's values, from PROGRESS's own view — so the two
     cards cannot say different things about the same person */
  const profile = progressView(answers, useToday(now));

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
  /* ⚠️ THE SAME SEARCH `/check/results`' PICKER RUNS, and the same one the
     PRODUCTS tray runs underneath it — `useCheckSearch`, which holds the live
     pass, the ingredient pass and the merge. It used to be written out here,
     and was lifted the day the results box grew a picker of its own: two
     copies of "one search function, one debounce, one fixture fallback" is not
     one search function. The reasoning lives on the hook. */
  const { results: found, loading, searching } = useCheckSearch(query);
  const results: CatalogProduct[] = searching ? found : owned;
  /* ⚠️ THE COUNT IS PART OF THE LABEL, and it matters more now the results are
     a capped panel: "did it find one thing or nine?" is a question you can no
     longer answer by looking at the page, because the panel clips its own list.
     Same reason `Check results` writes "Compared Products (5)". It sits in the
     panel's head, which does not scroll with the rows. */
  const resultsLabel = `Search results (${results.length})`;
  const open = searching && !dismissed;
  /* ⚠️ THE PANEL OUTLIVES `open` BY ITS EXIT, AND PAINTS WHAT IT LAST SHOWED
     WHILE IT GOES — "Dropdowns" in globals.css, and `useHeldWhileClosing`.
     Clearing the field flips `results` to the page's own list in the same
     render that starts closing the panel, so without the held copy the search
     faded out as "Search results (5)" over products nobody searched for. */
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

  /** The line under a dropdown row: ONLY the ingredient that pulled it in when
   *  the query matched nothing visible on the row itself, and nothing
   *  otherwise. ⚠️ It carried the brand and the size too until 15 Sep 2026 —
   *  the brand now leads the title (`fullName`) and the size lives in the
   *  details, both asked for directly. */
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
          <button
            type="button"
            className={styles.remove}
            aria-label={`Remove ${fullName(p)} from this analysis`}
            onClick={() => remove(p.id)}
          >
            <Tag variant="brand" className={styles.added}>
              Added
            </Tag>
          </button>
        ) : (
          <SmallButton
            label="Add"
            arrow={false}
            specular={false}
            className={styles.add}
            disabled={full}
            aria-label={`Add ${fullName(p)} to this analysis`}
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
        {/* ⚠️ PROGRESS's SKIN PROFILE CARD, NOT THE STRIP — asked for directly
            15 Sep 2026 ("update the profile card accordingly to progress
            page"). The same `SkinProfileTiles` with the same four answers and
            the state's start date, derived exactly as `ProgressScreen` derives
            them. `/check/results` took the same card the same day. */}
        <SkinProfileTiles
          skinType={profile.skinType ?? "Not set"}
          tendencies={profile.tendencies?.length ? profile.tendencies.join(", ") : "None"}
          conditions={profile.conditions?.length ? profile.conditions.join(", ") : "None"}
          symptomsState={profile.status ?? "Not set"}
          symptomsStarted={{
            date: formatLong(profile.start),
            day: dayNumber(profile.start, profile.today),
          }}
        />

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
                      setAddManually(true);
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
                              {/* ⚠️ ONLY the ingredient that pulled the row in
                                  when the query matches nothing visible on it
                                  — typing "salicylic" returns "Paula's Choice
                                  BHA Exfoliant", a row with the word nowhere on
                                  it. No size under the title (15 Sep 2026). */}
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
                  {/* ⚠️ THE ROW OPENS — NOT IN FIGMA, and it is the PRODUCTS
                      hub's move rather than a new one. This screen listed the
                      products you own beside an `Add` control and told you
                      nothing else about them, so a COMPATIBILITY check was
                      built out of rows whose ingredients you could not see
                      without leaving for the Products tab and coming back.
                      Same block the hub opens: `ProductDetails`. */}
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
        onClose={() => closeManualAdd(ownedIdsWhenOpened)}
      />
    </>
  );
}

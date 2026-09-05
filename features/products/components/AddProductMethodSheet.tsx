"use client";

import { useState } from "react";
import styles from "./AddProductMethodSheet.module.css";
import { Sheet } from "@/components/ui/Sheet";
import { CameraCapture } from "@/components/ui/CameraCapture";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { ProductCard } from "./ProductCard";
import { Button } from "@/components/ui/Button";
import { OptionRow } from "@/components/ui/OptionRow";
import { SearchField } from "@/components/ui/SearchField";
import { ProductRow } from "./ProductList";
import { ProductThumb } from "./ProductThumb";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { SearchIcon, CameraIcon, ChevronRightIcon, CloseIcon } from "@/components/ui/icons";
import {
  BUCKET_LIST_TITLE,
  DURATIONS,
  bucketFor,
  fullName,
  productById,
  resultMeta,
  SCAN_MATCH,
  type CatalogProduct,
  type Duration,
  type ProductDraft,
  type SavedProduct,
} from "@/features/products/products";
import { useOpenBeautyFactsSearch } from "@/features/products/useOpenBeautyFactsSearch";
import { useEnrichedProduct } from "@/features/products/useEnrichedProduct";

/**
 * The "Add a product" tray — Figma mobile 576:1376, desktop dialog 583:1786.
 * The one way into step 5's add flow, opened from `Your products`.
 *
 * ⚠️ CHANGE OF FLOW, NOT IN FIGMA. The comps treat search and scan as two
 * routed screens (`576:1428`, `577:1498`) handing off to a third (`577:1430` /
 * `578:1482`) and then to `Product added` (`579:1540`). Here the ENTIRE add
 * flow — method, search-or-scan, confirm, duration, added — plays out inside
 * this one tray, which grows to fit whichever view is showing. Nothing in the
 * add flow navigates; the four routed screens have been deleted.
 *
 * ⚠️ THE PERIOD IS NOT CHOSEN BEFORE THE PRODUCT ANY MORE — that reordering is
 * what this step was rebuilt for. The tray used to open already committed to a
 * period (`targetBucket`), decided by which bucket row the user tapped on a
 * screen BEFORE they had searched for anything, and it then ran that backwards
 * through `durationForBucket()` to invent a duration. The three rows that were
 * supposed to set it never did, so everything filed under Long term regardless.
 * Now the tray asks "how long have you used it?" once, with the product on
 * screen, and `bucketFor()` derives the group from that answer alone.
 */
type View = "method" | "search" | "scan" | "confirm";
type ConfirmSource = "search" | "scan";

/**
 * Where the confirm view is in its own little sequence. Position, not data —
 * the draft holds the answers (see `ProductDraft`), this holds what is on
 * screen, and it resets with the tray.
 *
 *   verify    is this the right product?         -> duration | rejected
 *   duration  how long have you used it?         -> added
 *   added     it went into <group>; add another  -> verify
 *   rejected  wrong product; search again        -> verify
 */
type ConfirmStage = "verify" | "duration" | "added" | "rejected";

export function AddProductMethodSheet({
  open,
  onClose,
  base = [],
}: {
  open: boolean;
  onClose: () => void;
  /**
   * ⚠️ WHAT AN EMPTY STORE MEANS DEPENDS ON WHO OPENED THE TRAY. In step 5 it
   * means the user has added nothing, so a first add starts from `[]`. On the
   * PRODUCTS hub it means the seeded library is still showing
   * (`ownedProducts`), and starting from `[]` there would materialise the store
   * as that ONE new product and wipe the list the user was looking at. The
   * caller passes what it is currently displaying; the same fallback
   * `MyProducts`' remove path already uses.
   */
  base?: SavedProduct[];
}) {
  const { answers, setAnswer } = useInvestigation();
  const [view, setView] = useState<View>("method");
  const [confirmSource, setConfirmSource] = useState<ConfirmSource>("search");
  const [stage, setStage] = useState<ConfirmStage>("verify");
  const [subject, setSubject] = useState<"front" | "ingredients">("front");

  const draft = answers.productDraft;
  const products = answers.products ?? [];

  // Called unconditionally (rules of hooks) even when there's no draft or the
  // confirm view isn't showing — falls back to an empty product, whose lookup
  // is a no-op.
  const enrichedProduct = useEnrichedProduct(
    draft?.product ?? { id: "", name: "", brand: "", size: "" },
  );

  /** Cancel, backdrop, Escape, and a successful add all fall through here —
   *  the tray always reopens on the method chooser, with no draft left over
   *  from whichever branch was in progress. */
  function resetAndClose() {
    setView("method");
    setConfirmSource("search");
    setStage("verify");
    setSubject("front");
    setAnswer("productQuery", "");
    setAnswer("scan", undefined);
    setAnswer("productDraft", undefined);
    onClose();
  }

  /** Every route into the confirm view starts a fresh draft at `verify` —
   *  the top-level search, and the "add another" / "search again" fields
   *  embedded in the confirm view itself. */
  function chooseProduct(product: CatalogProduct) {
    setAnswer("productDraft", { product });
    setConfirmSource("search");
    setStage("verify");
    setView("confirm");
  }

  function toggleCapture() {
    if (answers.scan) {
      setAnswer("scan", undefined);
      return;
    }
    setAnswer("scan", "captured");
    const product = productById(SCAN_MATCH.productId);
    if (product) {
      setAnswer("productDraft", { product, matchScore: SCAN_MATCH.score });
    }
  }

  /** "Yes, add this" / "Yes, that's it" — identifies the product but does NOT
   *  commit it. The duration question comes next, and it is the answer that
   *  decides the group, so there is nothing to save until it exists. */
  function acceptDraft() {
    setStage("duration");
  }

  /** "No, search again" / "No, let me search" — swaps the Yes/No prompt for a
   *  search field in place rather than sending the user back to a separate
   *  view. The rejected draft is dropped: its product was wrong. */
  function rejectDraft() {
    setAnswer("productDraft", undefined);
    setStage("rejected");
  }

  /**
   * Commit. The group comes from the duration answer and from nothing else —
   * see `bucketFor`. Re-adding the same product replaces rather than
   * duplicates, matched on id.
   */
  function addProduct() {
    if (!draft?.duration) return;
    const saved: SavedProduct = {
      // the ENRICHED product, not the bare draft, so a saved product carries
      // whatever photo/ingredients Open Beauty Facts found and the hub's
      // thumbs and accordion cards show it too
      ...enrichedProduct,
      duration: draft.duration,
      bucket: bucketFor(draft.duration),
      addedOn: new Date().toISOString(),
    };
    setAnswer("products", (prev) => [
      ...(prev ?? base).filter((p) => p.id !== saved.id),
      saved,
    ]);
    // ⚠️ THE QUERY IS CLEARED HERE, and it matters now the results are a
    // dropdown. `Add another product` reuses the same `productQuery`, so a
    // query left standing meant the added stage opened with a full panel of
    // results for a search the user had already finished — a dropdown open
    // without anyone having typed into the field under it. `rejectDraft`
    // deliberately does NOT do this: "No, search again" means search again
    // for the same thing.
    setAnswer("productQuery", "");
    setStage("added");
  }

  function removeProduct(id: string) {
    setAnswer("products", (prev) => (prev ?? base).filter((p) => p.id !== id));
  }

  const title =
    view === "method"
      ? "Add a product"
      : view === "search"
        ? "Search by name"
        : view === "scan"
          ? "Take a photo"
          : stage === "added"
            ? "Product added"
            : confirmSource === "scan"
              ? "Product match"
              : "Confirm product";

  return (
    <Sheet open={open} onClose={resetAndClose} title={title}>
      {view === "method" && (
        <MethodView
          onSearch={() => setView("search")}
          onScan={() => setView("scan")}
        />
      )}

      {view === "search" && (
        <SearchView
          query={answers.productQuery ?? ""}
          onQueryChange={(v) => setAnswer("productQuery", v)}
          onChoose={chooseProduct}
        />
      )}

      {view === "scan" && (
        <ScanView
          captured={Boolean(answers.scan)}
          subject={subject}
          onToggleSubject={() =>
            setSubject(subject === "front" ? "ingredients" : "front")
          }
          onCapture={toggleCapture}
          onContinue={() => {
            setConfirmSource("scan");
            setStage("verify");
            setView("confirm");
          }}
        />
      )}

      {view === "confirm" && (
        <ConfirmView
          source={confirmSource}
          stage={stage}
          draft={draft}
          product={enrichedProduct}
          onAccept={acceptDraft}
          onReject={rejectDraft}
          onPickDuration={(d) =>
            setAnswer("productDraft", (prev) =>
              prev ? { ...prev, duration: d } : prev,
            )
          }
          onAdd={addProduct}
          addedProducts={products}
          onRemove={removeProduct}
          query={answers.productQuery ?? ""}
          onQueryChange={(v) => setAnswer("productQuery", v)}
          onChooseMore={chooseProduct}
        />
      )}
    </Sheet>
  );
}

/** The two-card chooser — the tray's default view. Search and scan set the
 *  view directly; nothing here navigates.
 *
 *  ⚠️ NO `Cancel` HERE ANY MORE. It was this view's own button, which is why
 *  every other view had no visible way out; `Sheet` renders one under whatever
 *  view is showing instead. */
function MethodView({
  onSearch,
  onScan,
}: {
  onSearch: () => void;
  onScan: () => void;
}) {
  return (
    <ul className={styles.methods}>
      <li>
        <MethodCard
          icon={<SearchIcon />}
          title="Search by name"
          subtitle="Find by brand or product name"
          onClick={onSearch}
        />
      </li>
      <li>
        <MethodCard
          icon={<CameraIcon />}
          title="Take a photo"
          subtitle="Snap the front label or ingredient list"
          onClick={onScan}
        />
      </li>
    </ul>
  );
}

/**
 * A method card inside the tray.
 *
 * ⚠️ THE CARD IS SAGE, AND SO IS ITS ICON. `surface/data-strong` takes WHITE
 * text, and an icon instance carries its own dark default — a dark glyph beside
 * white text is the single most-repeated bug in this file. Both the fill and the
 * stroke have to change, because most LUX icons are stroke-drawn and a
 * fills-only recolour silently does nothing. `currentColor` does both here.
 */
function MethodCard({
  icon,
  title,
  subtitle,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={styles.method} onClick={onClick}>
      <span className={styles.methodIcon}>{icon}</span>
      <span className={styles.methodCopy}>
        <span className={`${styles.methodTitle} t-h6`}>{title}</span>
        <span className={`${styles.methodSubtitle} t-label-sm`}>
          {subtitle}
        </span>
      </span>
      <ChevronRightIcon className={styles.methodChevron} />
    </button>
  );
}

/** Was `04 — Search by name` (576:1428) as its own routed screen; now the
 *  tray's search view. Same field-starts-empty rule — only the destination on
 *  picking a result changed.
 *
 * ⚠️ NOT IN FIGMA: THE RESULTS ARE A DROPDOWN HANGING OFF THE SEARCH BAR, not
 * a list on the tray. They used to be free-standing `ProductRow` cards in a
 * capped `.searchResultsScroll` region, which put a second column of frosted
 * cards on a surface that already had them and read as "more content" rather
 * than "what you just typed matched". One panel tucked under the pill reads as
 * the bar's own output. Consequences worth knowing:
 *
 *   - NOTHING SHOWS UNTIL SOMETHING IS TYPED. The old "Search for a product by
 *     brand or name" `EmptyBox` is gone: a dropdown with nothing in the field
 *     is not a state a dropdown has, and the field's own placeholder already
 *     says it.
 *   - THE PANEL IS IN FLOW, not absolutely positioned. On mobile the tray is
 *     DOCKED TO THE BOTTOM EDGE and hugs its content, so an overlaid dropdown
 *     would open straight off the bottom of the viewport with nowhere to go.
 *     In flow the tray grows upward to hold it, which is the whole point of a
 *     bottom sheet. It still overlays in the sense that matters — see
 *     `.dropdown`'s negative top margin tucking it under the pill — and the
 *     panel caps its own height and scrolls internally, so a long result list
 *     can never push the search field itself out of reach.
 */
function SearchView({
  query,
  onQueryChange,
  onChoose,
}: {
  query: string;
  onQueryChange: (v: string) => void;
  onChoose: (product: CatalogProduct) => void;
}) {
  const { results, loading } = useOpenBeautyFactsSearch(query);
  const typed = query.trim() !== "";

  return (
    <div className={styles.searchView}>
      <SearchField
        value={query}
        onChange={onQueryChange}
        label="Search products by brand or name"
      />

      <p role="status" aria-live="polite" className="visually-hidden">
        {!typed
          ? ""
          : loading
            ? "Searching…"
            : `${results.length} ${results.length === 1 ? "product" : "products"} found`}
      </p>

      {typed && (
        <div className={`${styles.dropdown} reveal-quick`}>
          {loading ? (
            <p className={`${styles.dropdownNote} t-body3`}>Searching…</p>
          ) : results.length === 0 ? (
            <p className={`${styles.dropdownNote} t-body3`}>
              No products match “{query.trim()}”
            </p>
          ) : (
            <ul className={styles.results}>
              {results.map((p) => (
                <li key={p.id}>
                  {/* deliberately NOT `ProductRow` — that is the frosted CARD
                      recipe, and a card inside a panel is two surfaces doing
                      one job. A dropdown row is a hover target on the panel's
                      own fill. */}
                  <button
                    type="button"
                    className={styles.result}
                    onClick={() => onChoose(p)}
                  >
                    <ProductThumb product={p} />
                    <span className={styles.resultCopy}>
                      <span className={`${styles.resultName} t-h6`}>
                        {p.name}
                      </span>
                      <span className={`${styles.resultMeta} t-label-sm`}>
                        {resultMeta(p)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

/** Was `04 — Scan product` (577:1498) as its own routed screen. The shutter
 *  behaves exactly as it did there; Continue only appears once a photo has
 *  been "taken", and moves to the tray's confirm view. */
function ScanView({
  captured,
  subject,
  onToggleSubject,
  onCapture,
  onContinue,
}: {
  captured: boolean;
  subject: "front" | "ingredients";
  onToggleSubject: () => void;
  onCapture: () => void;
  onContinue: () => void;
}) {
  return (
    <div className={styles.scanView}>
      {/* the viewfinder, its copy and the shutter are `CameraCapture` now —
          three surfaces drew this recipe and SelfieCapture's own note said to
          make it a component once a second appeared */}
      <CameraCapture
        captured={captured}
        title={
          subject === "front"
            ? "Take a photo of the front of the product."
            : "Take a photo of the ingredient list."
        }
        helper={
          captured
            ? "Tap the shutter again to retake."
            : subject === "front"
              ? "Make sure the product name and brand are visible."
              : "Make sure the whole list is in frame and in focus."
        }
        onCapture={onCapture}
      />

      <button
        type="button"
        className={`${styles.scanAlt} t-label`}
        onClick={onToggleSubject}
      >
        {subject === "front"
          ? "Take photo of ingredient list instead"
          : "Take photo of the front instead"}
      </button>

      <Button
        className={styles.trayAction}
        disabled={!captured}
        onClick={onContinue}
      >
        Continue
      </Button>
    </div>
  );
}

/**
 * Was `04 — Confirm product` (577:1430) / `04 — Product match` (578:1482) as
 * two routed screens sharing one body — plus, now, the duration question that
 * screen asked and the `Product added` screen (579:1540) that followed it.
 *
 * ⚠️ THE DURATION QUESTION IS THE POINT OF THIS VIEW. It sits here, after the
 * product is identified and with the product on screen, because "how long have
 * you used it" is a fact about the thing in front of the user rather than a
 * mode they had to enter before searching. Its answer is the only input to
 * `bucketFor()`, so this is the single place in the app where a product's group
 * is decided.
 */
function ConfirmView({
  source,
  stage,
  draft,
  product,
  onAccept,
  onReject,
  onPickDuration,
  onAdd,
  addedProducts,
  onRemove,
  query,
  onQueryChange,
  onChooseMore,
}: {
  source: ConfirmSource;
  stage: ConfirmStage;
  /** absent once a draft is rejected, and on the `added` stage after the tray
   *  is reused — the stages that need it are the ones that guard on it */
  draft?: ProductDraft;
  /** the draft's product, enriched with a real Open Beauty Facts photo and
   *  ingredient list where one wasn't already known — see useEnrichedProduct */
  product: CatalogProduct;
  onAccept: () => void;
  onReject: () => void;
  onPickDuration: (d: Duration) => void;
  onAdd: () => void;
  /** everything added so far this investigation, not just this session */
  addedProducts: SavedProduct[];
  onRemove: (id: string) => void;
  /** the inline "add another" / "search again" field — same state SearchView
   *  reads and writes, so query and results carry over exactly as they would
   *  between the tray's own top-level views */
  query: string;
  onQueryChange: (v: string) => void;
  onChooseMore: (product: CatalogProduct) => void;
}) {
  const isScan = source === "scan";
  const showsCard =
    draft != null && (stage === "verify" || stage === "duration");

  return (
    <div className={styles.confirmView}>
      {isScan && stage === "verify" && (
        <ChatBubble from="ai" full>
          I think this might be your product. Can you confirm?
        </ChatBubble>
      )}

      {showsCard && (
        <ProductCard
          product={product}
          matchScore={
            isScan ? (draft.matchScore ?? SCAN_MATCH.score) : undefined
          }
          showDescription={!isScan}
        />
      )}

      {stage === "verify" && draft && (
        <div className={styles.confirmBlock}>
          <p
            className={`${styles.confirmLabel} t-label`}
            id="add-product-confirm"
          >
            {isScan ? "Is this correct?" : "Is this the right product?"}
          </p>
          <div
            className={styles.confirmAnswers}
            role="group"
            aria-labelledby="add-product-confirm"
          >
            <Button
              className={styles.confirmAnswer}
              variant="secondary"
              onClick={onAccept}
            >
              {isScan ? "Yes, that's it" : "Add product"}
            </Button>
            <Button
              className={styles.confirmAnswer}
              variant="secondary"
              onClick={onReject}
            >
              {isScan ? "No, let me search" : "Search again"}
            </Button>
          </div>
        </div>
      )}

      {stage === "duration" && draft && (
        <div className={styles.confirmBlock}>
          <p
            className={`${styles.confirmLabel} t-label`}
            id="add-product-duration"
          >
            How long have you used this product?
          </p>
          {/* radios: exactly one, and the shape is the contract */}
          <div
            className={styles.durationOptions}
            role="radiogroup"
            aria-labelledby="add-product-duration"
          >
            {DURATIONS.map((d) => (
              <OptionRow
                key={d}
                control="radio"
                label={d}
                selected={draft.duration === d}
                onSelect={() => onPickDuration(d)}
              />
            ))}
          </div>
          {/* the tray's own primary action. Disabled until the question is
              answered, for the same reason Continue is on every step: there is
              no group to file the product under until it is. */}
          <Button
            className={styles.trayAction}
            disabled={!draft.duration}
            onClick={onAdd}
          >
            Add product
          </Button>
        </div>
      )}

      {stage === "added" && draft?.duration && (
        // ⚠️ THE VISIBLE "Added to <group>" TAG IS GONE, and only the
        // announcement is left. The tray's own title already reads `Product
        // added` and the block below already reads `Add another product`, so
        // the tag was a third thing saying the same thing on a stage the user
        // reaches by pressing a button labelled `Add product`. A screen reader
        // gets none of that for free, though — the title never changes focus
        // and neither heading is a live region — so the group is still said
        // out loud here, read back off the same answer that put it there.
        <p role="status" className="visually-hidden">
          Added to {BUCKET_LIST_TITLE[bucketFor(draft.duration)]}
        </p>
      )}

      {(stage === "added" || stage === "rejected") && (
        <div className={styles.confirmBlock}>
          <p className={`${styles.confirmLabel} t-label`}>
            {stage === "added"
              ? "Add another product"
              : "Search for a different product"}
          </p>
          <SearchView
            query={query}
            onQueryChange={onQueryChange}
            onChoose={onChooseMore}
          />
        </div>
      )}

      {addedProducts.length > 0 && stage !== "verify" && (
        <div className={styles.confirmBlock}>
          <p className={`${styles.confirmLabel} t-label`}>Added products</p>
          <ul className={styles.addedList}>
            {addedProducts.map((p) => (
              <li key={p.id}>
                <ProductRow
                  name={fullName(p)}
                  meta={p.size}
                  product={p}
                  trailing={
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => onRemove(p.id)}
                      aria-label={`Remove ${fullName(p)}`}
                    >
                      <CloseIcon className={styles.removeIcon} />
                    </button>
                  }
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

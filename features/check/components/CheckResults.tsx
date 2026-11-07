"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CheckResults.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Orb } from "@/components/ui/Orb";
import { SkinProfileTiles } from "./SkinProfileTiles";
import { CompatCard, PendingCompatCard } from "./CompatCard";
import { ProductThumb } from "@/features/products/components/ProductThumb";import { SummaryCard, IngredientsCard, NextStepsCard } from "./ResultCards";
import { Button } from "@/components/ui/Button";
import { OptionRow } from "@/components/ui/OptionRow";
import { SearchField } from "@/components/ui/SearchField";
import { ChevronRightIcon, PlusIcon } from "@/components/ui/icons";
import { Collapse } from "@/components/ui/Collapse";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useHeldWhileClosing } from "@/lib/useModalDialog";
import {
  BAND_LABEL,
  DEMO_CHECKS,
  MAX_CHECK_PRODUCTS,
  MIN_CHECK_PRODUCTS,
  analyseCheck,
  checkSummary,
  ingredientsOfConcern,
  primaryConcern,
  productsOf,
  routineAdvice,
  worstBand,
  type SavedCheck,
} from "@/features/check/check";
import { ownedProducts } from "@/features/products/library";
import { useProductLibrary } from "@/features/products/useProductLibrary";
import { useToday } from "@/lib/useToday";
import { useShrinkWrap } from "@/lib/useShrinkWrap";
import { progressView } from "@/features/progress/progress";
import {
  DURATIONS,
  fullName,
  type CatalogProduct,
  type Duration,
} from "@/features/products/products";
import { useCheckSearch } from "@/features/check/useCheckSearch";
import SegmentedToggle from "@/features/products/components/SegmentedToggle";

/** `Check results` (476:2841) at `/check/results`. */
export function CheckResults({ now }: { now: number }) {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  const { add } = useProductLibrary("seeded");
  /* the skin profile card's values, from PROGRESS's own view — the same
     derivation `/check/new` and `/progress` use, so the three cannot disagree */
  const profile = progressView(answers, useToday(now));
  /* null = untouched, so the box is showing exactly the check that was run. An
     array = the user has removed something and nothing has been analysed yet. */
  const [pending, setPending] = useState<CatalogProduct[] | null>(null);
  const [editing, setEditing] = useState(false);
  const [picking, setPicking] = useState(false);
  /* the product just added to the check that the user does not own, and the
     answer to the one question that files it — see `addProduct` */
  const [asking, setAsking] = useState<CatalogProduct | null>(null);
  /* the product the question below is ABOUT — held while its panel closes,
     because `asking` is already null in the render that starts the exit */
  const askingShown = useHeldWhileClosing(asking !== null, asking);
  const [askedDuration, setAskedDuration] = useState<Duration | undefined>();
  const noteId = useId();
  const askId = useId();

  const check = resolveCheck(answers.viewingCheck, answers.checks);
  const products = check ? productsOf(check) : [];
  const results = analyseCheck(products);
  const concerns = ingredientsOfConcern(products);
  const summary = checkSummary(products);
  const primary = primaryConcern(products);
  const advice = routineAdvice(products);
  const band = worstBand(results);
  const verdictText = verdict(band, primary ? fullName(primary.product) : null);
  /* the bubble hugs its longest line — see lib/useShrinkWrap.ts */
  const verdictRef = useRef<HTMLSpanElement>(null);
  useShrinkWrap(verdictRef, verdictText);

  /* The set the box is showing: the check as run, or the user's edit of it. */
  const list = pending ?? products;
  const edited =
    pending !== null &&
    (pending.length !== products.length ||
      pending.some((p) => !products.some((x) => x.id === p.id)));
  const shown = edited
    ? results.filter((r) => list.some((p) => p.id === r.product.id))
    : results;
  const added = list.filter((p) => !results.some((r) => r.product.id === p.id));
  const enough = list.length >= MIN_CHECK_PRODUCTS;

  /* Who the user already owns — it decides whether adding raises the question
     below, and nothing else. */
  const owned = ownedProducts(answers);
  const ownedIds = new Set(owned.map((p) => p.id));
  const inCheck = new Set(list.map((p) => p.id));

  function addProduct(p: CatalogProduct) {
    setPending([...list, p]);
    setPicking(false);
    if (!ownedIds.has(p.id)) {
      setAsking(p);
      setAskedDuration(undefined);
    }
  }

  function keepUsing(p: CatalogProduct, duration: Duration) {
    add(p, duration);
    setAsking(null);
  }

  function leaveWith(href: string) {
    setAnswer("checkBasket", list);
    router.push(href);
  }

  return (
    <HubScreen
      title="Analysis results"
      centerHeading
      nav="check"
      backHref="/check"
      layout="card"
      tightTop
    >
      {/* 1 — the verdict, in the AI's voice. `full` so it spans the column the
             way 548:1141 does rather than hugging its text. */}
      <div className={styles.speaker}>
        <Orb size="44px" animateIn halo className={styles.orb} />
        <ChatBubble from="ai" full className={styles.bubble}>
          {/* the sentence keeps a reading measure while the bubble keeps the
              comp's full-width row — see `.verdict` */}
          <span ref={verdictRef} className={styles.verdict}>
            {verdictText}
          </span>
        </ChatBubble>
      </div>

      <SkinProfileTiles
        className={styles.profile}
        skinType={profile.skinType}
        tendencies={profile.tendencies}
        conditions={profile.conditions}
        symptomsState={profile.status}
      />

      {/* 2 — the numbers */}
      <div className={styles.block}>
        <SummaryCard
          label="Analysis summary"
          stats={[
            { value: summary.products, label: "Products checked" },
            { value: summary.ingredients, label: "Ingredients checked" },
            { value: summary.flagged, label: "Flagged ingredients" },
          ]}
        />
      </div>

      {/* 3 — the detail: ONE box, header + contents. See the note above. */}
      <div className={styles.block}>
        <div className={styles.group}>
          <div className={styles.compared}>
            {/* lux-v3 (Scores B, canvas): the box's name is an overline over
                the grid, as the board draws it */}
            <h2 className={`${styles.comparedLabel} t-overline`}>
              Compatibility · {list.length} products
            </h2>

            <button
              type="button"
              className={`${styles.edit} tap-target t-label`}
              aria-pressed={editing}
              onClick={() => {
                setEditing((e) => !e);
                setPicking(false);
              }}
            >
              {editing ? "Done" : "Edit"}
            </button>
          </div>

          {/* the entrance — the cards, their rings and scores, one after
              another (CompatCard.module.css, end) */}
          <div className={styles.panel} data-motion>
            <ul className={styles.stack}>
              {shown.map((analysis, i) => (
                <li key={analysis.product.id}>
                  <CompatCard
                    analysis={analysis}
                    index={i}
                    onRemove={
                      editing
                        ? () =>
                            setPending(
                              list.filter((p) => p.id !== analysis.product.id)
                            )
                        : undefined
                    }
                  />
                </li>
              ))}

              {added.map((p) => (
                <li key={p.id}>
                  <PendingCompatCard
                    product={p}
                    onRemove={
                      editing
                        ? () => setPending(list.filter((x) => x.id !== p.id))
                        : undefined
                    }
                  />
                </li>
              ))}
            </ul>

            <Collapse open={asking !== null}>
            {askingShown && (
              <div className={styles.ask}>
                <p className={`${styles.askTitle} t-h6`} id={askId}>
                  How long have you used {fullName(askingShown)}?
                </p>
                <p className={`${styles.askText} t-body3`}>
                  Answering adds it to your products, where the investigation
                  can read it.
                </p>

                {/* radios: exactly one, and the shape is the contract. The same
                    four options the add tray offers, in the same control — this
                    IS that question, asked somewhere else. */}
                <div
                  className={styles.askOptions}
                  role="radiogroup"
                  aria-labelledby={askId}
                >
                  {DURATIONS.map((d) => (
                    <OptionRow
                      key={d}
                      control="radio"
                      label={d}
                      selected={askedDuration === d}
                      onSelect={() => setAskedDuration(d)}
                    />
                  ))}
                </div>

                {/* the tray's own `SegmentedToggle`, as two actions, so the
                    two places the app asks "keep this or not" are one design.
                    The confirm sits LEFT and stays disabled until the question
                    is answered: there is no group to file the product under
                    until it is. */}
                <SegmentedToggle
                  actions
                  label="Keep this product"
                  options={["Add to my products", "Not now"]}
                  disabled={[!askedDuration, false]}
                  className={styles.askActions}
                  onChange={(i) => {
                    if (i === 1) setAsking(null);
                    else if (askedDuration) keepUsing(askingShown, askedDuration);
                  }}
                />
              </div>
            )}
            </Collapse>

            {editing && !picking && list.length < MAX_CHECK_PRODUCTS && (
              <div className={styles.addAnother}>
                <Button
                  variant="secondary"
                  size="md"
                  icon={<PlusIcon />}
                  onClick={() => setPicking(true)}
                >
                  Add another product
                </Button>
              </div>
            )}

            {editing && picking && (
              <ProductPicker
                inCheck={inCheck}
                onPick={addProduct}
                onCancel={() => setPicking(false)}
              />
            )}

            {edited && (
              <div className={styles.rerun}>
                <p id={noteId} className={`${styles.rerunNote} t-body3`}>
                  {enough
                    ? "The results above are for the previous set."
                    : `An analysis compares at least ${MIN_CHECK_PRODUCTS} products.`}
                </p>
                <Button
                  className={styles.rerunButton}
                  disabled={!enough}
                  aria-describedby={noteId}
                  onClick={() => leaveWith("/check/analyzing")}
                >
                  Re-run analysis
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4 — the cause */}
      {concerns.length > 0 && (
        <div className={styles.block}>
          <IngredientsCard concerns={concerns} />
        </div>
      )}

      {/* 5 — the action. */}
      <div className={styles.block}>
        <NextStepsCard
          art={
            primary ? <ProductThumb product={primary.product} /> : undefined
          }
          title={
            primary
              ? band === "avoid"
                ? `Pause ${fullName(primary.product)}`
                : `Take care with: ${fullName(primary.product)}`
              : "No conflicts found"
          }
          badge={primary ? BAND_LABEL[band] : undefined}
          badgeBand={primary ? band : undefined}
          description={
            primary
              ? band === "avoid"
                ? `It contains ${primary.ingredient.name}, the biggest problem for your skin profile in this set. Leave it out for two weeks and see whether the flare settles.`
                : `This product contains ${primary.ingredient.name}, which is the biggest problem for your skin profile in this set.`
              : "These can be used in the same routine."
          }
          steps={advice}
        />
      </div>

      <Link href="/check/history" className={`${styles.historyLink} t-body3 tap-target`}>
        <span className={styles.historyLabel}>View previous analyses</span>
        <ChevronRightIcon className={styles.historyArrow} />
      </Link>
    </HubScreen>
  );
}

/** What `Add another product` opens onto — the picker, INSIDE the box. */
function ProductPicker({
  inCheck,
  onPick,
  onCancel,
}: {
  /** ids already in the check — never offered */
  inCheck: Set<string>;
  onPick: (p: CatalogProduct) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  const { results, loading, searching } = useCheckSearch(query);

  const rows = results.filter((p) => !inCheck.has(p.id));

  return (
    <div className={`${styles.picker} reveal-quick`}>
      <div className={styles.pickerHead}>
        <p className={`${styles.pickerTitle} t-label`}>Add a product</p>
        <button
          type="button"
          className={`${styles.cancel} t-label tap-target`}
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>

      <SearchField
        value={query}
        onChange={setQuery}
        label="Search products to add to this analysis"
      />

      {/* the count is inside a panel a screen reader has to find, so the result
          of typing is announced — the same line `/check/new` and the tray use */}
      <p role="status" aria-live="polite" className="visually-hidden">
        {!searching
          ? ""
          : loading
            ? "Searching…"
            : `${rows.length} ${rows.length === 1 ? "product" : "products"} found`}
      </p>

      {!searching ? (
        <p className={`${styles.pickerNote} t-body3`}>
          Search by product or brand name.
        </p>
      ) : loading ? (
        <p className={`${styles.pickerNote} t-body3`}>Searching…</p>
      ) : rows.length === 0 ? (
        <p className={`${styles.pickerNote} t-body3`}>
          No products found. Check the spelling, or try the brand name.
        </p>
      ) : (
        <ul className={styles.pickerList}>
          {rows.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={styles.pick}
                onClick={() => onPick(p)}
              >
                <ProductThumb product={p} size="sm" />
                <span className={styles.pickCopy}>
                  {/* brand-led title, no size under it */}
                  <span className={`${styles.pickName} t-label`}>{fullName(p)}</span>
                </span>
                <PlusIcon className={styles.pickPlus} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** The one-sentence verdict, plus the disclaimer. */
function verdict(
  band: "compatible" | "risky" | "avoid",
  worst: string | null
): string {
  const head =
    band === "compatible"
      ? "These work well together for your skin profile."
      : band === "risky"
        ? `Most of these are fine together${worst ? `, but ${worst} needs care` : ""}.`
        : `${worst ?? "One of these"} looks like a poor match for your skin.`;

  return `${head} This is not a diagnosis, it highlights patterns worth discussing with a dermatologist.`;
}

/**
 * Which check to show: the one the user opened, else the newest they ran, else
 * the newest seeded one.
 */
function resolveCheck(
  viewing: string | undefined,
  ran: SavedCheck[] | undefined
): SavedCheck | undefined {
  const all = [...(ran ?? []), ...DEMO_CHECKS];
  if (viewing) {
    const match = all.find((c) => c.id === viewing);
    if (match) return match;
  }
  return all[0];
}

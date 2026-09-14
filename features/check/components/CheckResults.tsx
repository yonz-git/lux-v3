"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./CheckResults.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { SkinProfileStrip } from "./SkinProfileStrip";
import { CompatCard } from "./CompatCard";
import { ProductThumb } from "@/features/products/components/ProductThumb";import { SummaryCard, IngredientsCard, NextStepsCard } from "./ResultCards";
import { Button } from "@/components/ui/Button";
import { OptionRow } from "@/components/ui/OptionRow";
import { SearchField } from "@/components/ui/SearchField";
import { Tag } from "@/components/ui/Tag";
import { ChevronRightIcon, CloseIcon, PlusIcon } from "@/components/ui/icons";
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
import { DEMO_PRODUCTS, ownedProducts, skinProfile } from "@/lib/demo";
import {
  DURATIONS,
  bucketFor,
  fullName,
  resultMeta,
  type CatalogProduct,
  type Duration,
  type SavedProduct,
} from "@/features/products/products";
import { useCheckSearch } from "@/features/check/useCheckSearch";

/**
 * `Check results` (476:2841) at `/check/results`.
 *
 * ⚠️ REORDERED TO MATCH `06 — Results` (548:1134) — VERDICT, EVIDENCE, ACTION,
 * DETAIL. This screen used to be the per-product cards and nothing else: five
 * scores and no answer to "so what do I do?". The ingredients that caused those
 * scores were reachable only by opening an accordion, and the conflicts between
 * products — the whole point of a compatibility check — were buried one level
 * further down inside a recommendation paragraph.
 *
 * `06 — Results` is the same shape of answer at a different altitude, and its
 * order is the right one. Adopted here:
 *
 *   1  an AI bubble stating the verdict in a sentence — and carrying the
 *      "not a diagnosis" line, which this screen had nowhere at all
 *   2  the numbers behind it
 *   3  INGREDIENTS OF CONCERN — the cause, ingredient-major, "found in" which
 *      of your products
 *   4  WHAT TO DO NEXT — the routine advice, which is the actual output
 *   5  the per-product cards, last, as the detail
 *
 * ⚠️ SAGE FOR THE ANALYSIS, LIGHT FOR THE PRODUCTS. CHECK is Surface System A,
 * `06 — Results` is System B, and blending them arbitrarily would be drift. The
 * split is meaningful instead: blocks 1–4 are LUX talking, so they are sage;
 * the product cards are your things listed, so they stay light. The CHECK
 * handoff already permits it — "a sage card inside a light screen is correct
 * and matches Check results".
 *
 * ⚠️ BLOCK 5 IS ONE BOX AND THERE IS NO EDIT TRAY — 6 Sep 2026, NOT IN FIGMA.
 * The screen used to list the check's products TWICE: five `CompatCard`s on the
 * canvas under a `compared-products` header row, and — behind that row's `Edit`
 * — a modal `Sheet` listing the same five products again as removable rows. Two
 * lists of one set, one of them covering the other, and the only way to take a
 * product out was through the copy that hid the results.
 *
 * The cards live INSIDE the header row's own surface now, which is the move
 * `MyProducts` made for its category groups a day earlier and for the same
 * reason: cards that hang under a row as siblings of it, at the row's own
 * spacing, have nothing but adjacency saying the row owns them. The header is
 * the box's header, the cards are its contents, inset 8 from three sides, and
 * closed the box would simply BE the row. Removing happens where the app
 * already puts it — inside the open card, under its recommendation (see
 * `CompatCard`) — and adding is a row at the foot of the same box.
 *
 * ⚠️ EDITING THE SET DOES NOT RE-SCORE THE SCREEN, AND MUST NOT. A check is a
 * point in time; `analyseCheck` scores every product AGAINST THE BASKET, so
 * dropping one silently changes the other four numbers. Removing a product
 * therefore edits a PENDING set only — the rows for it disappear, the verdict,
 * the summary, the ingredients and the plan above are untouched, and the box
 * grows a `Re-run analysis` action saying in words that the results on screen
 * are the previous set's. Re-running writes a NEW check under a new date, which
 * is what it always did.
 *
 * ⚠️ THE PENDING SET IS LOCAL STATE, NOT `answers.checkBasket`. The basket is
 * `/check/new`'s working set; mirroring this check into it on every removal
 * meant a half-edited check leaked into the builder's own list. It is written
 * only when the user leaves for one of the two screens that reads it — adding
 * a product, or re-running — which is also what makes `Add another product`
 * continue from the set on screen rather than from whatever was last assembled.
 *
 * ⚠️ THE SCORES ARE COMPUTED, NOT STORED. A `SavedCheck` holds only the date and
 * the products; everything else is derived on read, so a check the user just
 * ran and a seeded one go through the same code and neither can drift from the
 * model in lib/check.ts.
 */
export function CheckResults() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  /* null = untouched, so the box is showing exactly the check that was run. An
     array = the user has removed something and nothing has been analysed yet. */
  const [pending, setPending] = useState<CatalogProduct[] | null>(null);
  /* ⚠️ THE LIST IS READ-ONLY UNTIL YOU SAY OTHERWISE. `Edit` is what reveals
     the per-row ✕ and the add row; without it the box opened with a permanent
     "Add another product" under a set the user had just finished assembling,
     which reads as an unfinished list rather than a finished check. */
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

  /* The set the box is showing: the check as run, or the user's edit of it.
     ⚠️ `shown` FILTERS THE RESULTS RATHER THAN RE-ANALYSING — see the note on
     the component. A removed product's card goes; the ones that remain keep the
     scores they were given, because those are the scores of the check that ran
     and re-running is what produces new ones. */
  const list = pending ?? products;
  /* ⚠️ `edited` IS SET EQUALITY, NOT "HAS THE USER TOUCHED IT". Removing a
     product and adding it straight back leaves `pending` non-null with the
     check's own set in it, and the banner then said "the results above are for
     the previous set" about the set on screen. Order does not count: the box
     renders worst-first regardless, so two sets with the same members are the
     same check. */
  const edited =
    pending !== null &&
    (pending.length !== products.length ||
      pending.some((p) => !products.some((x) => x.id === p.id)));
  const shown = edited
    ? results.filter((r) => list.some((p) => p.id === r.product.id))
    : results;
  /* ⚠️ A PRODUCT JUST ADDED HAS NO SCORE, AND MUST NOT BORROW ONE. `results`
     comes from the check that ran, so an added product has no entry in it —
     filtering `shown` by `list` alone silently DROPPED it, and the row the user
     had just added never appeared. It renders as a scoreless row instead, which
     is the true statement: it is in the set and it has not been analysed. */
  const added = list.filter((p) => !results.some((r) => r.product.id === p.id));
  const enough = list.length >= MIN_CHECK_PRODUCTS;

  /* Who the user already owns — it decides whether adding raises the question
     below, and nothing else. ⚠️ IT NO LONGER SEEDS THE PICKER: see
     `ProductPicker`, which shows search results and only search results. */
  const owned = ownedProducts(answers);
  const ownedIds = new Set(owned.map((p) => p.id));
  const inCheck = new Set(list.map((p) => p.id));

  /**
   * ⚠️ ADDING ASKS WHETHER YOU ACTUALLY USE IT, AND ONLY WHEN THE ANSWER IS NOT
   * ALREADY KNOWN. A check does not imply ownership — half the reason to run
   * one is a product you are considering — so putting everything you compare
   * into your library would quietly fill it with things you have never opened,
   * and the investigation reads that library as "what I am using". Equally, a
   * product you compare and DO use should not have to be typed in twice.
   *
   * So the question fires for a catalogue product and never for one already in
   * your library. It is a question rather than a checkbox on the row because
   * "I am using this" is a claim about the user's routine, not a preference:
   * `PRODUCTS` is what the analysis subtracts from, and a wrong entry there
   * changes what the app concludes.
   */
  function addProduct(p: CatalogProduct) {
    setPending([...list, p]);
    setPicking(false);
    if (!ownedIds.has(p.id)) {
      setAsking(p);
      setAskedDuration(undefined);
    }
  }

  /**
   * ⚠️ THE QUESTION ASKS HOW LONG, AND THE ANSWER IS THE WHOLE POINT. It used
   * to be a yes/no that filed everything under `Not sure` — honest, because
   * nothing had asked, but it made the one group that means "I genuinely do not
   * know" the destination for every product added this way, and the analysis
   * reads that timeline. Asking is the fix: `bucketFor` derives the group from
   * the duration and from NOTHING else, so this is the same question the add
   * tray asks for the same reason, and `Not sure` goes back to being one of the
   * four answers rather than the default.
   *
   * Answering IS the consent. "How long have you used it?" cannot be answered
   * by someone who is not using it, so the duration doubles as the yes — which
   * is why there is no separate confirm, only the decline beside it.
   *
   * ⚠️ THE FALLBACK IS `DEMO_PRODUCTS`, not `[]` — the same materialisation
   * `MyProducts` documents. With `?? []` the first add would replace the whole
   * seeded library with the one product just added.
   */
  function keepUsing(p: CatalogProduct, duration: Duration) {
    const saved: SavedProduct = {
      ...p,
      duration,
      bucket: bucketFor(duration),
      addedOn: new Date().toISOString(),
    };
    setAnswer("products", (prev) => [
      ...(prev ?? DEMO_PRODUCTS).filter((x) => x.id !== saved.id),
      saved,
    ]);
    setAsking(null);
  }

  /** ⚠️ THE SET ON SCREEN IS WHAT TRAVELS, which is what `Edit` never managed:
   *  it used to hand `/check/new` whatever `answers.checkBasket` happened to
   *  hold, so opening a check from the history and pressing Edit edited a
   *  different set — and on a cold load, an empty one. */
  function leaveWith(href: string) {
    setAnswer("checkBasket", list);
    router.push(href);
  }

  return (
    <HubScreen
      title="Analysis results"
      nav="check"
      backHref="/check"
      layout="card"
      tightTop
    >
      {/* 1 — the verdict, in the AI's voice. `full` so it spans the column the
             way 548:1141 does rather than hugging its text. */}
      <ChatBubble from="ai" full className={styles.bubble}>
        {/* the sentence keeps a reading measure while the bubble keeps the
            comp's full-width row — see `.verdict` */}
        <span className={styles.verdict}>
          {verdict(band, primary ? fullName(primary.product) : null)}
        </span>
      </ChatBubble>

      <SkinProfileStrip className={styles.profile} {...skinProfile(answers)} />

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

      {/* 3 — the cause */}
      {concerns.length > 0 && (
        <div className={styles.block}>
          <IngredientsCard concerns={concerns} />
        </div>
      )}

      {/* 4 — the action.

          ⚠️ IT ALWAYS RENDERS, INCLUDING WHEN EVERYTHING IS FINE. It used to be
          hidden unless something was wrong, which meant the most common result —
          two compatible products — produced a screen that answered "so what do I
          do?" with silence, and made the whole reorder pointless in the good
          case. A clean result is a RESULT: it deserves saying out loud, plus the
          one piece of advice that still applies (introduce things one at a time,
          or you cannot trace a reaction). "Nothing is wrong" and "we have
          nothing to tell you" look identical on screen otherwise. */}
      <div className={styles.block}>
        <NextStepsCard
          /* ⚠️ THE PRODUCT IS DRAWN, NOT JUST NAMED — NOT IN FIGMA. 549:1163
             draws the emphasis block as text alone, because the comps had no
             product imagery to place; every other screen that names one of the
             user's products shows it (see `ProductArt`). It is also the one
             product in the check the user has to act on, and the numbered
             steps below now carry thumbs, so leaving the block text-only made
             the loudest block the only one without the picture. */
          art={
            primary ? <ProductThumb product={primary.product} /> : undefined
          }
          /* ⚠️ THE TITLE IS THE ACTION IN THE AVOID BAND. "Take care with:" is
             a diagnosis, and it is the right words for Risky — the product
             stays in the routine and is used carefully. For Avoid it is not
             what the card means: the advice is to stop, and the steps below
             are written assuming the product is out. */
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

      {/* 5 — the detail: ONE box, header + contents. See the note above. */}
      <div className={styles.block}>
        <div className={styles.group}>
          <div className={styles.compared}>
            {/* ⚠️ AN <h2>, WHICH IT WAS NOT. It was a `<p>` carrying `t-h6`, so
                the five `CompatCard` <h3>s under it hung off the page <h1> with
                their own section unnamed in the outline. It is the header of a
                box now, which is exactly what a heading is for, and
                h1 → h2 → h3 is the order they render in. */}
            <h2 className={`${styles.comparedLabel} t-h6`}>
              Compared Products ({list.length})
            </h2>

            {/* ⚠️ `Edit` IS A MODE ON THIS BOX, NOT A DOOR TO ANOTHER SCREEN.
                476:2851 draws it beside a chevron-down and the transition map
                sends it to the tray — a modal listing the same products the
                rows below already list. It toggles the box's own affordances
                instead: the ✕ on each row and the add row at the foot. */}
            <button
              type="button"
              /* ⚠️ `tap-target` BECAUSE THE LABEL IS 25x20 AND SC 2.5.8 WANTS
                 24x24. `Edit`/`Done` is a bare text control in a header row
                 whose height the comp fixes, so the box cannot grow — the
                 utility's `::after` clears 24 in both directions without
                 moving the text or the row. The `pressable` overlay is
                 deliberately NOT added: this control's result is the same box
                 changing under the finger, which is feedback already. */
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

          <div className={styles.panel}>
            <ul className={styles.stack}>
              {shown.map((analysis) => (
                <li key={analysis.product.id}>
                  <CompatCard
                    compact
                    analysis={analysis}
                    /* ⚠️ PASSED ONLY WHILE EDITING — the resting list is the
                       read-only accordion it has always been. */
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
                  <PendingRow
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

            {/* ⚠️ THE QUESTION SITS DIRECTLY UNDER THE ROW IT IS ABOUT, above
                the add row rather than below it. It names a product; putting
                "Add another product" between the two made it read as a question
                about whatever you were going to add next.
                See `keepUsing` for what it asks and why. */}
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

                {/* ⚠️ THE PAIR IS ONE SEGMENTED PILL, THE SAME DESIGN AS THE
                    ADD-PRODUCT TRAY'S `SegmentedToggle` — asked for directly so
                    the two places the app asks "keep this or not" look like one
                    decision. NOT an actual toggle, though: `Add to my products`
                    and `Not now` are two distinct actions rather than two states
                    of one control, so both render as plain buttons and neither
                    carries `role="tab"`. The confirm sits LEFT, the way the
                    tray's own "Add product" segment does.

                    ⚠️ THE CONFIRM IS DISABLED UNTIL THE QUESTION IS ANSWERED,
                    for the reason `Continue` is on every flow step: there is no
                    group to file the product under until it is. */}
                <div className={styles.askActions}>
                  <button
                    type="button"
                    className={`${styles.askConfirm} t-label`}
                    disabled={!askedDuration}
                    onClick={() =>
                      askedDuration && keepUsing(askingShown, askedDuration)
                    }
                  >
                    {/* the label shines on hover, the way `SmallButton`'s
                        does — a direct child, so `.shine-on-hover` reaches it */}
                    {/* the fixed rim light, globals.css `.edge-light` */}
                    <span className="edge-light" aria-hidden="true" />
                    <span className="shine-text shine-on-hover">Add to my products</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.decline} t-label tap-target`}
                    onClick={() => setAsking(null)}
                  >
                    <span className="shine-text shine-on-hover">Not now</span>
                  </button>
                </div>
              </div>
            )}
            </Collapse>

            {/* ⚠️ THE SAME ROW `/products` USES, AND THE SAME COMPONENT. It was
                a local compact one — opaque, 8 radius, the cards' 12 padding —
                on the argument that a box's contents take the box's surface.
                But "add a product" is one action the user meets in three places
                and it has to look like itself in all of them, so it is
                `AddProductRow` here as on the PRODUCTS hub: 52 tall, radius/lg,
                frost-light, the frosted-row shadow, the label at `Button`. */}
            {editing && !picking && list.length < MAX_CHECK_PRODUCTS && (
              /* ⚠️ NOT IN FIGMA — superseded 13 Sep 2026: every add-product
                 action is now the secondary `Button` at control/md (48) with a
                 plus, hugging its label and centred, asked for directly. The
                 note above records why it was `AddProductRow` before that. */
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

            {/* ⚠️ IT APPEARS ONLY ONCE THE SET HAS CHANGED, and it says why.
                Until then the box IS the results and there is nothing to re-run;
                a permanent `Re-run analysis` on a screen that has just analysed
                would read as though the numbers above were provisional.
                ⚠️ AND IT IS NOT GATED ON `editing` — a change survives leaving
                the mode, so hiding the only way to act on it behind `Edit`
                again would strand it. */}
            {edited && (
              <div className={styles.rerun}>
                {/* ⚠️ THE NOTE IS THE DISABLED BUTTON'S DESCRIPTION, which is
                    the rule the tray already followed: a disabled CTA with no
                    programmatic reason attached is silent to a screen reader.
                    Same element either way, so the sentence a sighted user
                    reads is the sentence that gets announced. */}
                <p id={noteId} className={`${styles.rerunNote} t-body3`}>
                  {enough
                    ? "The results above are for the previous set."
                    : `An analysis compares at least ${MIN_CHECK_PRODUCTS} products.`}
                </p>
                {/* ⚠️ ONE ACTION, AND NO ROW AROUND IT — `Undo` is gone. It
                    sat left of this button as the ghost of the pair, and a
                    change is not stranded without it: a removed product is
                    still in the picker, so putting the set back is `Edit` →
                    `Add another product` → pick it, and re-running is the only
                    thing this block exists to offer. The wrapper that held the
                    two apart went with it — `.rerun` centres its own children,
                    so a flex row around a single button was a box doing
                    nothing. */}
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

      {/* ⚠️ RE-RUNNING WRITES A NEW CHECK, IT DOES NOT MUTATE THIS ONE. A check
          happened at a point in time and appears in the history under that
          date; editing the set and running it again is a second check, which is
          why the action says "Re-run analysis" rather than "Save". */}

      {/* ⚠️ NOT IN FIGMA — the history link `/check` ends on, repeated at the
          foot of a result so the way to the other checks is not only the back
          chevron. See `.historyLink`. */}
      <Link href="/check/history" className={`${styles.historyLink} t-body3`}>
        <span className={styles.historyLabel}>View previous analyses</span>
        <ChevronRightIcon className={styles.historyArrow} />
      </Link>
    </HubScreen>
  );
}

/**
 * A product in the set that the check has not scored — everything the user has
 * added since it ran.
 *
 * ⚠️ IT IS A ROW, NOT A `CompatCard` WITH A BLANK SCORE. A card that opens onto
 * a bar, a percentage and a recommendation has nothing to open onto here, and a
 * disclosure that discloses an empty panel is worse than no disclosure. What it
 * says instead is the only true thing available: it is in the set, and the
 * numbers above do not include it. Same 52 and the same fill as the picker's
 * rows, so an added product looks like what it is — the thing you just picked,
 * now in the list.
 */
function PendingRow({
  product,
  onRemove,
}: {
  product: CatalogProduct;
  onRemove?: () => void;
}) {
  const name = fullName(product);

  return (
    <div className={styles.pendingRow}>
      <span className={`${styles.pendingName} t-h6`}>{name}</span>
      <Tag className={styles.pendingTag}>Not analysed yet</Tag>
      {onRemove && (
        <button
          type="button"
          className={styles.pendingRemove}
          aria-label={`Remove ${name} from this analysis`}
          onClick={onRemove}
        >
          <CloseIcon className={styles.pendingRemoveIcon} />
        </button>
      )}
    </div>
  );
}

/**
 * What `Add another product` opens onto — the picker, INSIDE the box.
 *
 * ⚠️ IT SEARCHES, AND IT RUNS `/check/new`'s SEARCH RATHER THAN A NEW ONE. It
 * opened as a plain list of the catalogue, which answers "add one more of the
 * things the app already knows" and nothing else: the moment the product you
 * wanted was not among the thirteen, the only route was to leave the screen.
 * `useCheckSearch` is the builder's own live pass, ingredient pass and merge,
 * lifted so both pickers run one function — see the hook for why that promise
 * matters in this section particularly.
 *
 * ⚠️ IT SHOWS SEARCH RESULTS AND NOTHING ELSE. It opened on a list — the
 * products you own that are not in the check, then the rest of the catalogue —
 * which is the rule `/check/new` follows, and it is the wrong rule here. That
 * screen exists to assemble a set out of your library, so an opening list IS
 * the primary path. This panel is opened from a check that is already built, so
 * the products you own are, by and large, already in it: what was left to list
 * was the catalogue remainder, and a column of products the user has never
 * mentioned reads as a random list rather than as a suggestion. Nothing to
 * suggest means nothing to show, so the field asks and the results answer.
 *
 * ⚠️ ANYTHING ALREADY IN THE CHECK IS FILTERED OUT rather than shown with an
 * `Added` tag the way the builder's list does it. The builder is a list you
 * assemble FROM and its rows have to keep their place; this panel is opened to
 * add one thing and closes when you have, so a row you cannot pick is only a
 * row you have to read past.
 *
 * ⚠️ THE ROWS ARE NOT `ProductRow`. That is the frosted CARD recipe and a card
 * inside a panel inside a box is three surfaces doing one job — the same call
 * `/check/new`'s own dropdown makes for its results. Thumb at `sm` (36) to
 * match the compact cards above it.
 *
 * ⚠️ AND `loading` GATES THE EMPTY STATE. "No products found" is only honest
 * once the search has answered; without the gate it flashes up between the
 * debounce firing and the response landing, once per character typed.
 */
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
  /* ⚠️ LOCAL, NOT `answers.checkQuery`. That key is the builder's field, and
     sharing it meant opening this panel with the last thing typed on a
     different screen already in it — and typing here silently changed what
     `/check/new` would show. The panel unmounts on cancel, which is also the
     right moment for the query to go. */
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
                  <span className={`${styles.pickName} t-label`}>{p.name}</span>
                  <span className={`${styles.pickMeta} t-label-sm`}>
                    {resultMeta(p)}
                  </span>
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

/**
 * The one-sentence verdict, plus the disclaimer.
 *
 * ⚠️ THE "NOT A DIAGNOSIS" LINE IS NOT OPTIONAL, and it was missing from this
 * screen entirely. `06 — Results` carries it verbatim, the app's own metadata
 * carries it, and this screen makes health-adjacent claims about ingredients on
 * a named skin profile. It says the same thing here.
 */
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
 *
 * ⚠️ THE SEED IS THE FALLBACK, NOT A MERGE — the same call `/progress` and
 * `/check/history` make. A cold visit to `/check/results` has nothing to show,
 * and an empty results screen demonstrates nothing.
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

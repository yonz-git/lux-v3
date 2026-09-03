"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./CheckResults.module.css";
import { HubScreen } from "./HubScreen";
import { ChatBubble } from "./ChatBubble";
import { SkinProfileStrip } from "./SkinProfileStrip";
import { CompatCard } from "./CompatCard";
import { ProductThumb } from "./ProductThumb";
import { SummaryCard, IngredientsCard, NextStepsCard } from "./ResultCards";
import { CheckBasketSheet } from "./CheckBasket";
import { ChevronDownIcon } from "./icons";
import { useInvestigation } from "./InvestigationProvider";
import {
  BAND_LABEL,
  DEMO_CHECKS,
  analyseCheck,
  checkSummary,
  ingredientsOfConcern,
  primaryConcern,
  productsOf,
  routineAdvice,
  worstBand,
  type SavedCheck,
} from "@/lib/check";
import { skinProfile } from "@/lib/demo";
import { fullName } from "@/lib/products";

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
 * ⚠️ THE SCORES ARE COMPUTED, NOT STORED. A `SavedCheck` holds only the date and
 * the products; everything else is derived on read, so a check the user just
 * ran and a seeded one go through the same code and neither can drift from the
 * model in lib/check.ts.
 */
export function CheckResults() {
  const router = useRouter();
  const { answers, setAnswer } = useInvestigation();
  const [editing, setEditing] = useState(false);

  const check = resolveCheck(answers.viewingCheck, answers.checks);
  const products = check ? productsOf(check) : [];
  const results = analyseCheck(products);
  const concerns = ingredientsOfConcern(products);
  const summary = checkSummary(products);
  const primary = primaryConcern(products);
  const advice = routineAdvice(products);
  const band = worstBand(results);

  /* While the tray is open it edits the live basket; until then it mirrors the
     check on screen. See `openEditor`. */
  const basket = answers.checkBasket ?? [];

  /**
   * ⚠️ `Edit` LOADS *THIS* CHECK INTO THE BASKET, THEN OPENS THE TRAY IN PLACE.
   *
   * It used to be a link to `/check/new`, which was wrong twice over. The
   * handoff's transition map says "Edit on Compared Products reopens the tray"
   * — not "navigates" — and the chevron-down beside it reads as disclose, not
   * leave. Worse, `/check/new` builds from `answers.checkBasket`, which is
   * whatever was last assembled and has nothing to do with the check being
   * viewed: open a check from the history, press Edit, and you were editing a
   * different set. Cold-load the results and press Edit and the basket was
   * EMPTY, so a five-product check silently became none.
   *
   * Seeding the basket from the check on screen is what makes Edit mean edit.
   */
  function openEditor() {
    setAnswer("checkBasket", products);
    setEditing(true);
  }

  return (
    <HubScreen
      title="Check Results"
      nav="check"
      backHref="/check"
      layout="card"
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
          label="Check summary"
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

      {/* 5 — the detail */}
      <div className={styles.block}>
        <div className={styles.compared}>
          <p className={`${styles.comparedLabel} t-h6`}>
            Compared Products ({results.length})
          </p>
          <button type="button" className={styles.edit} onClick={openEditor}>
            <span className="t-label">Edit</span>
            <ChevronDownIcon className={styles.editIcon} />
          </button>
        </div>

        <div className={styles.cards}>
          {results.map((analysis) => (
            <CompatCard key={analysis.product.id} analysis={analysis} />
          ))}
        </div>
      </div>

      {/* ⚠️ RE-RUNNING WRITES A NEW CHECK, IT DOES NOT MUTATE THIS ONE. A check
          happened at a point in time and appears in the history under that
          date; editing the set and running it again is a second check, which is
          why the action says "Re-run check" rather than "Save". Cancel leaves
          the results on screen untouched. */}
      <CheckBasketSheet
        open={editing}
        onClose={() => setEditing(false)}
        products={basket}
        submitLabel="Re-run check"
        onRemove={(id) =>
          setAnswer("checkBasket", (prev) => (prev ?? []).filter((p) => p.id !== id))
        }
        onAddAnother={() => {
          /* the search list lives on the builder, and the basket is already
             this check — so adding continues where the tray left off */
          setEditing(false);
          router.push("/check/new");
        }}
        onSubmit={() => {
          setEditing(false);
          router.push("/check/analyzing");
        }}
      />
    </HubScreen>
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

  return `${head} This is not a diagnosis — it highlights patterns worth discussing with a dermatologist.`;
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

"use client";

import styles from "./EvidenceCheck.module.css";
import { HubScreen } from "@/components/layout/HubScreen";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { SmallButton } from "@/components/ui/SmallButton";
import { OptionRow } from "@/components/ui/OptionRow";
import { Chip } from "@/components/ui/Chip";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { fullName } from "@/features/products/products";
import {
  EVIDENCE_LABEL,
  evidenceFor,
  missingRoutineRoles,
  needsConfirmation,
  unansweredCount,
  type EvidenceState,
  type ProductEvidence,
  type RoutineRole,
} from "@/features/my-skin/analysis";

/**
 * `/investigation/evidence` — product brief § 05, "Evidence preparation".
 *
 * ⚠️ NOT IN FIGMA. No analysis frames exist on page `06. Screen Designs`; the
 * surfaces are CHECK's (Surface System A) and every measurement is decided
 * here. Listed in `docs/figma-catchup.md`.
 *
 * ⚠️ NOT A FLOW STEP — no progress track, no `Save & exit`. A pushed view off
 * step 5, the same standing `/check/new` has.
 *
 * ⚠️ IT ASKS ABOUT TWO PRODUCTS, NOT TWELVE. The brief is explicit: "Do not
 * force the user to label every product suspicious or safe. Show a compact
 * confirmation list only when the AI's interpretation is ambiguous." The
 * timeline places most products on its own — `deriveEvidence` returns
 * `unclear` only when a product's introduction range genuinely straddles the
 * reaction — and asking about the rest would be the app making the user do
 * arithmetic it has already done. Everything it worked out is still SHOWN, in
 * the read-only summary below the questions; only the ambiguous ones are asked.
 *
 * ⚠️ THE CLEANSER / SUNSCREEN QUESTION LIVES HERE AND NOT ON STEP 5. The
 * brief's flow diagram puts "Review products and missing cleanser/sunscreen"
 * between the product collection and the analysis, which is this screen. On
 * step 5 the question would arrive while the user was still adding, so "I don't
 * use one" would be asked of someone who was about to add one.
 *
 * ⚠️ `Run the analysis` IS NEVER DISABLED, WHICH IS NOT THE FLOW'S RULE. That
 * rule ("Continue is DISABLED until the step is answered") belongs to the five
 * steps in `flow.ts` and lives on the step. This screen is a review, not a
 * question, and the analysis is willing to refuse — sending someone to a
 * findings screen that names exactly what is missing is more useful than a dead
 * button that does not say why.
 */
export function EvidenceCheck() {
  const { answers, setAnswer } = useInvestigation();
  const evidence = evidenceFor(answers);
  const ambiguous = needsConfirmation(answers);
  const unanswered = unansweredCount(answers);
  const missingRoles = missingRoutineRoles(answers);

  const setEvidence = (id: string, state: "associated" | "tolerated") =>
    setAnswer("evidence", (prev) => ({ ...(prev ?? {}), [id]: state }));

  const toggleNotUsed = (role: RoutineRole) =>
    setAnswer("routineNotUsed", (prev) => {
      const current = prev ?? [];
      return current.includes(role)
        ? current.filter((r) => r !== role)
        : [...current, role];
    });

  return (
    <HubScreen
      title="Evidence check"
      nav="my-skin"
      backHref="/investigation/products"
      layout="card"
      tightTop
    >
      <ChatBubble from="ai" full className={styles.bubble}>
        <span className={styles.lede}>
          {evidence.length === 0
            ? "I have nothing to compare yet — add the products you were using, including the ones you do not suspect."
            : unanswered === 0
              ? "I have placed each product against the day your skin changed. Have a look before I compare them."
              : `I have placed most of your products against the day your skin changed. ${unanswered === 1 ? "One is" : `${unanswered} are`} genuinely unclear — you would know better than me.`}
        </span>
      </ChatBubble>

      {ambiguous.length > 0 ? (
        <section className={styles.block} aria-labelledby="confirm-heading">
          <h2 id="confirm-heading" className={`${styles.heading} t-h5`}>
            {ambiguous.length === 1
              ? "One product could have gone either way"
              : "These could have gone either way"}
          </h2>
          <div className={styles.cards}>
            {ambiguous.map((e) => (
              <Confirmation
                key={e.product.id}
                entry={e}
                onAnswer={(state) => setEvidence(e.product.id, state)}
              />
            ))}
          </div>
        </section>
      ) : null}

      {missingRoles.length > 0 ? (
        <section className={styles.block} aria-labelledby="roles-heading">
          <h2 id="roles-heading" className={`${styles.heading} t-h5`}>
            {missingRoles.length === 1
              ? `No ${missingRoles[0].label} in your list`
              : "No cleanser or sunscreen in your list"}
          </h2>
          <p className={`${styles.body} t-body3-body2`}>
            These touch your whole face every day, so leaving one out hides the
            product most likely to be involved. Add it, or tell me you do not
            use one.
          </p>
          <div className={styles.roleActions}>
            <SmallButton
              label="Add a product"
              arrow
              href="/investigation/products"
            />
            {/* ⚠️ CHECKBOXES, NOT RADIOS. "I don't use one" is zero-or-more
                across two independent roles — someone may use neither. */}
            <div className={styles.roleChips}>
              {missingRoles.map((role) => (
                <Chip
                  key={role.id}
                  label={`I don't use a ${role.label}`}
                  selected={role.declared}
                  onToggle={() => toggleNotUsed(role.id)}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {evidence.length > 0 ? (
        <section className={styles.block} aria-labelledby="summary-heading">
          <h2 id="summary-heading" className={`${styles.heading} t-h5`}>
            What I have so far
          </h2>
          {(["associated", "tolerated", "unclear"] as EvidenceState[]).map(
            (state) => {
              const group = evidence.filter((e) => e.state === state);
              if (group.length === 0) return null;
              return (
                <div key={state} className={styles.group}>
                  <p className={`${styles.groupTitle} t-overline`}>
                    {EVIDENCE_LABEL[state]}
                  </p>
                  <ul className={styles.rows}>
                    {group.map((e) => (
                      <li key={e.product.id} className={styles.row}>
                        <span className={`${styles.rowName} t-body3-body2`}>
                          {fullName(e.product)}
                        </span>
                        {/* ⚠️ THE ABSENCE OF AN INGREDIENT LIST IS SHOWN, NOT
                            HIDDEN. It is the difference between "we looked and
                            it contains nothing" and "we could not look", and
                            the second is what most often ends the analysis. */}
                        {!e.readable ? (
                          <span className={`${styles.rowMeta} t-label-sm`}>
                            No ingredient list
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }
          )}
        </section>
      ) : null}

      <Button
        href="/investigation/analyzing"
        fullWidth
        className={styles.primary}
      >
        Run the analysis
      </Button>
    </HubScreen>
  );
}

/**
 * One ambiguous product, and the single question that resolves it.
 *
 * ⚠️ RADIO ROWS, BECAUSE IT IS EXACTLY ONE OF TWO. The selection-controls
 * contract in AGENTS.md maps the shape to the ARIA role: a circle means "choose
 * one", and the group carries a real `role="radiogroup"`.
 */
function Confirmation({
  entry,
  onAnswer,
}: {
  entry: ProductEvidence;
  onAnswer: (state: "associated" | "tolerated") => void;
}) {
  const labelId = `confirm-${entry.product.id}`;
  return (
    <div className={styles.card}>
      <p id={labelId} className={`${styles.cardTitle} t-h6`}>
        {fullName(entry.product)}
      </p>
      <p className={`${styles.body} t-body3-body2`}>
        You said you have used this for {entry.product.duration.toLowerCase()},
        which could put it on either side of the reaction.
      </p>
      <div
        className={styles.options}
        role="radiogroup"
        aria-labelledby={labelId}
      >
        <OptionRow
          control="radio"
          label="I started it around then"
          selected={entry.confirmed && entry.state === "associated"}
          onSelect={() => onAnswer("associated")}
        />
        <OptionRow
          control="radio"
          label="I was already using it well before"
          selected={entry.confirmed && entry.state === "tolerated"}
          onSelect={() => onAnswer("tolerated")}
        />
      </div>
    </div>
  );
}

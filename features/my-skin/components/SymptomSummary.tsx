"use client";

import { useEffect, useState } from "react";
import styles from "./SymptomSummary.module.css";
import faceStyles from "./FaceDiagram.module.css";
import { Collapse } from "@/components/ui/Collapse";
import { FACE_REGION_IDS } from "./FaceDiagram";
import { SYMPTOMS, type Symptom } from "@/features/my-skin/safety";
import { useInvestigation } from "@/lib/store/InvestigationProvider";
import { useHeldWhileClosing } from "@/lib/useModalDialog";

const PLACE_ORDER = [...FACE_REGION_IDS, "Whole face", "Neck", "Other"];
const byPlace = (a: string, b: string) =>
  PLACE_ORDER.indexOf(a) - PLACE_ORDER.indexOf(b);

/** how long a removed place stays to fade — `--duration-move` (500ms) */
const LEAVE_MS = 500;

/**
 * Step 1's running summary — every symptom marked so far and the places marked
 * for it, under the face card. 30 Oct 2026, asked for directly, then redrawn
 * the same day against Apple's HIG numbers ("/hig and redesign").
 *
 * ⚠️ IT LISTS SYMPTOMS THAT HAVE A PLACE, NOT SYMPTOMS THAT ARE MERELY LIT. A
 * symptom is stored only once it has somewhere to be (`withAreas`), so the
 * list is exactly what `Continue` will carry forward.
 *
 * ⚠️ THE REDESIGN, AND WHAT EACH CHOICE IS FOR (HIG, fetched 2026-09-27):
 *   - the symptom is the row's heading at 16/26 `t-body2` — Callout is 16/21 on
 *     iOS and the type ramp's nearest role; it was `t-label` at 14, a size
 *     below the Body/Callout a primary line takes, in a card whose second line
 *     was 12;
 *   - the places are PILLS, not a `·`-joined sentence — a set of discrete
 *     answers (AGENTS.md: a multi-select is a SET) and the same unit the face
 *     draws them in, so "Forehead" here is the thing tapped there. 28 tall, the
 *     HIG's floor for a control and the face's own region pill; they are not
 *     controls, so no 44 hit area is owed;
 *   - 12 between rows' content and rules, 8 between pills: the HIG's 12 for
 *     things with a bezel, and the pills have one;
 *   - the rose dot is no longer the only thing marking a symptom — the name
 *     says it, so nothing is carried by colour alone;
 *   - ink is `text/primary` on glass everywhere: 4.5:1 is the floor at these
 *     sizes (≤17pt), and the old muted ink on the places line was the weakest
 *     text on the screen.
 *
 * ⚠️ NOTHING SNAPS (`taste.md`). The card and every row open on `<Collapse
 * smooth>`; a place arrives on a 500ms fade and settle, and one removed stays
 * long enough to leave the same way (`useExiting`). A leaving row keeps what
 * it last showed (`useHeldWhileClosing`).
 */
export function SymptomSummary() {
  const { answers } = useInvestigation();
  const placed = SYMPTOMS.filter((s) => (answers.start?.[s]?.length ?? 0) > 0);

  return (
    <Collapse smooth open={placed.length > 0}>
      <section
        className={`${styles.card} canvas-card`}
        aria-labelledby="symptom-summary"
      >
        <h2 id="symptom-summary" className={`${styles.overline} t-overline`}>
          Your symptoms
        </h2>
        <ul className={styles.rows}>
          {SYMPTOMS.map((s) => (
            <Row
              key={s}
              symptom={s}
              places={[...(answers.start?.[s] ?? [])].sort(byPlace)}
            />
          ))}
        </ul>
      </section>
    </Collapse>
  );
}

function Row({ symptom, places }: { symptom: Symptom; places: string[] }) {
  const open = places.length > 0;
  const held = useHeldWhileClosing(open, places);
  const shown = useExiting(held, LEAVE_MS);

  return (
    <Collapse smooth as="li" open={open}>
      <div className={styles.row}>
        <p className={`${styles.name} t-body2`}>
          <span className={styles.mark} aria-hidden="true" />
          {symptom}
        </p>
        <ul className={styles.places} aria-label={`${symptom}, where`}>
          {shown.map(({ item, leaving }) => (
            <li
              key={item}
              className={`${styles.place} ${faceStyles.placePill} t-label-sm`}
              data-leaving={leaving || undefined}
            >
              {item}
            </li>
          ))}
        </ul>
      </div>
    </Collapse>
  );
}

/**
 * The list, with anything removed kept for `ms` marked `leaving`, so it can
 * play its exit before it goes. An item put back inside the window is simply
 * current again.
 */
function useExiting(items: string[], ms: number) {
  const key = items.join("|");
  const [shown, setShown] = useState(() =>
    items.map((item) => ({ item, leaving: false })),
  );

  useEffect(() => {
    const current = key ? key.split("|") : [];
    setShown((prev) => {
      const gone = prev
        .filter((p) => !current.includes(p.item))
        .map((p) => ({ item: p.item, leaving: true }));
      return [...current.map((item) => ({ item, leaving: false })), ...gone].sort(
        (a, b) => byPlace(a.item, b.item),
      );
    });
    const timer = setTimeout(
      () => setShown((prev) => prev.filter((p) => !p.leaving)),
      ms,
    );
    return () => clearTimeout(timer);
  }, [key, ms]);

  return shown;
}

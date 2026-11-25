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
 * for it, under the face card.
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

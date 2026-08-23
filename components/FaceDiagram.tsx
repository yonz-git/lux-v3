"use client";

import styles from "./FaceDiagram.module.css";
import { Chip } from "./Chip";

/**
 * The face-region picker on 03b — Figma `face-diagram-card` (392x300).
 *
 * The regions are positioned ON the diagram, so their coordinates ARE the
 * design: a "Cheeks (L)" pill only means the left cheek because of where it
 * sits. They are given as percentages of the 392x300 card so the diagram scales
 * with the column instead of breaking below 392.
 *
 * Multi-select, so each region is role="checkbox" — the same contract as every
 * other multi-select control in the flow.
 *
 * ⚠️ PROTOTYPE-ONLY MERGE, NOT YET REFLECTED IN FIGMA. `locationChips`
 * ("Whole face" / "Neck" / "Other") used to render as their own chip row
 * below this card in StartInvestigation; they now render inside it, under
 * the diagram, so the whole location answer reads as one frosted control.
 * They write to the same `location` answer as the regions do, so `selected`
 * and `onToggle` are shared rather than being a second pair of props. The
 * 392x300 ratio in the comment above now belongs to the diagram illustration
 * alone — the card itself grows to fit the chip row under it.
 */
type Region = { id: string; x: number; y: number; w: number };

/* x/y/w read from Figma, expressed as % of the 392x300 card. `w` is only used
   to find each pill's horizontal CENTRE (x + w/2) — the pill itself is sized
   to its label (see .region's transform in FaceDiagram.module.css), not
   stretched to `w`, or a wider diagram (desktop's 920 card vs mobile's 392)
   would blow the pill up into mostly whitespace. */
const REGIONS: Region[] = [
  { id: "Forehead", x: 160 / 392, y: 49 / 300, w: 73 / 392 },
  { id: "Eye area", x: 162 / 392, y: 79 / 300, w: 68 / 392 },
  { id: "Cheeks (L)", x: 82 / 392, y: 119 / 300, w: 80 / 392 },
  { id: "Nose", x: 171 / 392, y: 119 / 300, w: 50 / 392 },
  { id: "Cheeks (R)", x: 231 / 392, y: 119 / 300, w: 82 / 392 },
  { id: "Around mouth", x: 146 / 392, y: 183 / 300, w: 101 / 392 },
  { id: "Chin / jaw", x: 158 / 392, y: 215 / 300, w: 77 / 392 },
];

/** So "Whole face" can select/clear every region pill in one tap — see StartInvestigation. */
export const FACE_REGION_IDS = REGIONS.map((r) => r.id);

export function FaceDiagram({
  selected,
  onToggle,
  locationChips,
}: {
  selected: string[];
  onToggle: (id: string) => void;
  locationChips: string[];
}) {
  return (
    <div className={styles.card}>
      <div
        className={styles.diagram}
        role="group"
        aria-label="Face regions"
      >
        {/* the outline is decorative — the pills carry the meaning */}
        <span className={styles.outline} aria-hidden="true" />
        {REGIONS.map((r) => (
          <button
            key={r.id}
            type="button"
            role="checkbox"
            aria-checked={selected.includes(r.id)}
            data-selected={selected.includes(r.id)}
            className={`${styles.region} t-label-sm`}
            style={{
              left: `${(r.x + r.w / 2) * 100}%`,
              top: `${r.y * 100}%`,
            }}
            onClick={() => onToggle(r.id)}
          >
            {r.id}
          </button>
        ))}
      </div>

      <div
        className={styles.chips}
        role="group"
        aria-label="Other locations"
      >
        {locationChips.map((c) => (
          <Chip
            key={c}
            label={c}
            selected={selected.includes(c)}
            onToggle={() => onToggle(c)}
          />
        ))}
      </div>
    </div>
  );
}

"use client";

import styles from "./FaceDiagram.module.css";

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
 */
type Region = { id: string; x: number; y: number; w: number };

// x/y/w read from Figma, expressed as % of the 392x300 card
const REGIONS: Region[] = [
  { id: "Forehead", x: 160 / 392, y: 49 / 300, w: 73 / 392 },
  { id: "Eye area", x: 162 / 392, y: 79 / 300, w: 68 / 392 },
  { id: "Cheeks (L)", x: 82 / 392, y: 119 / 300, w: 80 / 392 },
  { id: "Nose", x: 171 / 392, y: 119 / 300, w: 50 / 392 },
  { id: "Cheeks (R)", x: 231 / 392, y: 119 / 300, w: 82 / 392 },
  { id: "Around mouth", x: 146 / 392, y: 183 / 300, w: 101 / 392 },
  { id: "Chin / jaw", x: 158 / 392, y: 215 / 300, w: 77 / 392 },
];

export function FaceDiagram({
  selected,
  onToggle,
}: {
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <div className={styles.card} role="group" aria-label="Face regions">
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
            left: `${r.x * 100}%`,
            top: `${r.y * 100}%`,
            width: `${r.w * 100}%`,
          }}
          onClick={() => onToggle(r.id)}
        >
          {r.id}
        </button>
      ))}
    </div>
  );
}

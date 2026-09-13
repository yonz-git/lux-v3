"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import styles from "./FaceDiagram.module.css";
import { Chip } from "@/components/ui/Chip";
import contour from "../assets/face-contour.webp";
import silhouette from "../assets/face-silhouette.webp";

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
 *
 * ⚠️ THE FACE IS A CONTOUR DRAWING, NOT A DOME — NOT IN FIGMA, chosen 13 Sep
 * 2026 from a three-way prototype (photo / sage / contour), asked for
 * directly. It replaced a CSS terraced dome (a filled ellipse plus five
 * nested tiers). The asset is white level lines on transparency, cut from a
 * supplied illustration at the neck — see `.lines` for its footprint — and a
 * shine follows the pointer ACROSS THE LINES ONLY (`.shine`, masked by the same
 * image). Raise both in Figma: the DS still has no face artwork.
 */
/* `x`/`y` are the pill's CENTRE, as fractions of the 392x300 box. */
type Region = { id: string; x: number; y: number };

/* ⚠️ SEATED ON THE DRAWING'S OWN LANDMARKS, NOT ON FIGMA'S COORDINATES. The
   comp's positions were for a 168x214 ellipse, and the dome after it moved them
   to fractions of a smooth form. A drawn face has a real eye line, nose tip and
   mouth, and a pill that misses them names the wrong place — so these were read
   off the head itself at its drawn footprint (226x280 at 83,10): forehead,
   the eye line, the nose tip with the cheek centres level with it, the lips,
   the chin. Cheeks sit 81 either side of the nose, which clears the middle row
   at the diagram's narrowest scaled pill (see `.region`).

   ⚠️ AND `y` IS THE CENTRE, NOT THE TOP. A pill is a fixed-ratio object in a box
   that scales, so a top-anchored pill's centre drifts up the face as the diagram
   grows; `.region` translates -50% on both axes so one set of fractions means
   the same point at 440 and at 1024+. */
const REGIONS: Region[] = [
  { id: "Forehead", x: 199 / 392, y: 74 / 300 },
  { id: "Eye area", x: 199 / 392, y: 139 / 300 },
  /* 181, not the nose tip's 184: splits the pitch to the eye row and the mouth
     row evenly, which at a 303-wide diagram is ~5.5px of air either side
     where 184 left 2.9 under `Cheeks (R)` */
  { id: "Cheeks (L)", x: 118 / 392, y: 181 / 300 },
  { id: "Nose", x: 199 / 392, y: 181 / 300 },
  { id: "Cheeks (R)", x: 278 / 392, y: 181 / 300 },
  { id: "Around mouth", x: 199 / 392, y: 223 / 300 },
  { id: "Chin / jaw", x: 199 / 392, y: 266 / 300 },
];

/** So "Whole face" can select/clear every region pill in one tap — see StartInvestigation. */
export const FACE_REGION_IDS = REGIONS.map((r) => r.id);

/* How far the shine closes on the pointer each frame. It trails rather than
   sticks, so it reads as light gliding over the lines instead of a cursor
   decoration; ~150ms to settle at 60fps. */
const SHINE_EASE = 0.2;

/**
 * The pointer-following shine. Writes two custom properties straight onto the
 * glow element from a rAF loop, so a pointer move never re-renders the pills.
 *
 * ⚠️ NATIVE LISTENERS, AND THE LIGHT COMES ON AT THE FIRST MOVE RATHER THAN ON
 * AN "ENTER". Keyed on movement, it also lights for a pointer already resting
 * on the face when the screen mounts and for a touch that starts on it — cases
 * where there is no enter to wait for. `pointerenter` is still listened to so a
 * mouse lights it on arrival.
 * ⚠️ IT SNAPS ON THAT FIRST MOVE. Without that the light starts from wherever
 * it last settled (or 0,0) and flies across the face to the pointer.
 * ⚠️ UNDER REDUCED MOTION IT FOLLOWS WITHOUT TRAILING — the glide is the motion;
 * the light under the pointer is feedback, and stays.
 */
function useLineShine() {
  const ref = useRef<HTMLSpanElement>(null);
  const diagramRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const diagram = diagramRef.current;
    const el = ref.current;
    if (!diagram || !el) return;

    const target = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    let frame = 0;
    let active = false;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");

    const paint = () => {
      el.style.setProperty("--shine-x", `${pos.x}px`);
      el.style.setProperty("--shine-y", `${pos.y}px`);
    };

    const step = () => {
      pos.x += (target.x - pos.x) * SHINE_EASE;
      pos.y += (target.y - pos.y) * SHINE_EASE;
      paint();
      frame =
        Math.abs(target.x - pos.x) + Math.abs(target.y - pos.y) > 0.5
          ? requestAnimationFrame(step)
          : 0;
    };

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      if (!active || still.matches) {
        pos.x = target.x;
        pos.y = target.y;
        paint();
        if (!active) {
          active = true;
          el.setAttribute("data-active", "");
        }
        return;
      }
      if (!frame) frame = requestAnimationFrame(step);
    };

    const onLeave = () => {
      active = false;
      el.removeAttribute("data-active");
      cancelAnimationFrame(frame);
      frame = 0;
    };

    diagram.addEventListener("pointerenter", onMove);
    diagram.addEventListener("pointermove", onMove);
    diagram.addEventListener("pointerleave", onLeave);
    diagram.addEventListener("pointercancel", onLeave);
    return () => {
      diagram.removeEventListener("pointerenter", onMove);
      diagram.removeEventListener("pointermove", onMove);
      diagram.removeEventListener("pointerleave", onLeave);
      diagram.removeEventListener("pointercancel", onLeave);
      cancelAnimationFrame(frame);
    };
  }, []);

  return { ref, diagramRef };
}

/**
 * ⚠️ TWO MODES, AND THE PROPS ARE A UNION SO THE WRONG ONE CANNOT COMPILE.
 * `readOnly` is the recap at `/investigation/profile` reading the location
 * answer back: the same face, the same seven pills at the same coordinates,
 * with the picked ones filled and the rest dimmed. It exists rather than a
 * chip list because the coordinates ARE the answer — "Cheeks (L)" only means
 * the left cheek because of where the pill sits, and a comma-separated line
 * throws exactly that away.
 *
 * The read-only face takes no `onToggle`: there is nothing to toggle. It does
 * take `otherLocations`, and the union means the interactive `locationChips`
 * and the read-only list cannot be swapped by accident.
 *
 * ⚠️ THE NON-FACE ANSWERS COME INSIDE THE CARD IN BOTH MODES — asked for
 * directly, 7 Sep 2026. In the recap they were `Tag`s in the light block
 * BESIDE this card, which split one answer across two surfaces: "Neck" is the
 * same answer as "Cheeks (L)", given in the same tap, and the only reason it
 * has no coordinate is that the neck is not on the face. Inside, it reads as
 * what it is. The interactive mode already made this move (see the note above);
 * the recap was the half that had not caught up.
 *
 * ⚠️ THE READ-ONLY CHIPS ARE THE SAME PILL STEP 1 DRAWS, IN THE STATE THE
 * ANSWER PUTS THEM IN — matched to `/investigation/start`, asked for directly.
 * Step 1's location chips are `Chip`s: 40 tall, `Label`, `radius/full`, and
 * INDIGO once picked. The recap only ever shows the ones that were picked, so
 * the pill it draws is the selected one — exactly the rule the face regions
 * above already follow, where a chosen region keeps its full indigo treatment
 * and only the others step back. Drawing them as the pale unselected pill said
 * the opposite of what the answer was.
 *
 * They are `span`s with a local class rather than `Chip`s or `Tag`s: `Chip` is
 * a `role="checkbox"` control and there is nothing here to check, and `Tag` is
 * 26 tall with `Label Small`, which is a different pill from the one step 1
 * draws. The region pills beside them are `span`s for the same reason.
 *
 * ⚠️ THE SHINE RUNS IN BOTH MODES. It is a property of the drawing, not of the
 * control, and a face that lights under the pointer on step 1 and not on the
 * recap would be two different objects.
 *
 * ⚠️ AND THE DIAGRAM IS `aria-hidden` — DELIBERATELY, NOT AN OVERSIGHT. In
 * read-only mode it is an illustration of an answer the recap also writes out
 * in text; announcing seven pills, five of them dimmed and meaningless without
 * their position, would be the screen reader getting the worse half of the
 * picture twice. ⚠️ **The chip row below it is NOT hidden** — it sits outside
 * the diagram, its labels mean what they say without a position, and it is a
 * `<ul>` so the count is announced. The interactive mode keeps its
 * `role="group"` and every pill's `role="checkbox"`.
 */
type FaceDiagramProps =
  | {
      readOnly?: false;
      selected: string[];
      onToggle: (id: string) => void;
      locationChips: string[];
    }
  | { readOnly: true; selected: string[]; otherLocations?: string[] };

export function FaceDiagram(props: FaceDiagramProps) {
  const { selected } = props;
  const readOnly = props.readOnly === true;
  const shine = useLineShine();

  return (
    <div className={styles.card}>
      <div
        className={styles.diagram}
        data-readonly={readOnly || undefined}
        role={readOnly ? undefined : "group"}
        aria-label={readOnly ? undefined : "Face regions"}
        aria-hidden={readOnly || undefined}
        ref={shine.diagramRef}
      >
        {/* the drawing is decorative — the pills carry the meaning. Both image
            URLs are handed to CSS as custom properties because they are MASKS
            there: `.volume` is shaded inside the head's outline, and `.shine`
            lights only the lines. */}
        <span
          className={styles.form}
          aria-hidden="true"
          style={
            {
              "--face-lines": `url(${contour.src})`,
              "--face-silhouette": `url(${silhouette.src})`,
            } as CSSProperties
          }
        >
          <span className={styles.volume} />
          {/* biome-ignore lint/performance/noImgElement: a fixed decorative
              asset masked by CSS; next/image's wrapper and srcset buy nothing */}
          <img
            className={styles.lines}
            src={contour.src}
            width={contour.width}
            height={contour.height}
            alt=""
            draggable={false}
          />
          <span ref={shine.ref} className={styles.glow}>
            <span className={styles.shine} />
          </span>
        </span>
        {REGIONS.map((r) => {
          const position = {
            left: `${r.x * 100}%`,
            top: `${r.y * 100}%`,
          };

          /* The read-only pill is a `span`, not a disabled `button`. Disabled
             is a control the user cannot use yet; this is not a control at
             all, and the recap should not tell a screen reader otherwise. */
          return readOnly ? (
            <span
              key={r.id}
              data-selected={selected.includes(r.id)}
              className={`${styles.region} t-label-sm`}
              style={position}
            >
              {r.id}
            </span>
          ) : (
            <button
              key={r.id}
              type="button"
              role="checkbox"
              aria-checked={selected.includes(r.id)}
              data-selected={selected.includes(r.id)}
              className={`${styles.region} t-label-sm`}
              style={position}
              onClick={() => props.onToggle(r.id)}
            >
              {r.id}
            </button>
          );
        })}
      </div>

      {readOnly
        ? props.otherLocations &&
          props.otherLocations.length > 0 && (
            <ul
              className={`${styles.chips} ${styles.chipList}`}
              aria-label="Other locations"
            >
              {props.otherLocations.map((c) => (
                <li key={c}>
                  <span className={`${styles.readOnlyChip} t-label`}>{c}</span>
                </li>
              ))}
            </ul>
          )
        : (
          <div
            className={styles.chips}
            role="group"
            aria-label="Other locations"
          >
            {props.locationChips.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={selected.includes(c)}
                onToggle={() => props.onToggle(c)}
              />
            ))}
          </div>
        )}
    </div>
  );
}

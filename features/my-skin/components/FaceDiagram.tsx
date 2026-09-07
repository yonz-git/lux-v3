"use client";

import styles from "./FaceDiagram.module.css";
import { Chip } from "@/components/ui/Chip";

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
/* `y` is the pill's CENTRE, not its top edge — see the note below. */
type Region = { id: string; x: number; y: number; w: number };

/* x/y/w read from Figma, expressed as % of the 392x300 card. `w` is only used
   to find each pill's horizontal CENTRE (x + w/2) — the pill itself is sized
   to its label (see .region's transform in FaceDiagram.module.css), not
   stretched to `w`, or a wider diagram (desktop's 920 card vs mobile's 392)
   would blow the pill up into mostly whitespace. */
/* ⚠️ THE y VALUES ARE PILL CENTRES, AND THEY ARE SEATED ON THE DOME — NOT IN
   FIGMA. Two corrections in one pass, and the second is only visible at 1024+.

   The comp stacks Forehead at 49 and Eye area at 79, and Around mouth at 183
   and Chin / jaw at 215: a 30-tall pill therefore ENDS exactly where the next
   one starts (49+30 = 79) or clears it by 2 (183+30 = 213). Drawn as flat
   fills that reads as tight; drawn as the pill it is now — hairline, radius
   full, a shadow — two touching pills merge into one lozenge and the edge
   treatment is what makes the collision visible. So the stacked rows are opened
   to 40 units of centre-to-centre pitch — a 30-tall pill plus ~8 of air at 440,
   which is the gap the cheeks row already had to the eye row.

   THEY ARE ALSO SEATED LOWER THAN THE COMP, because the form under them moved
   and they did not. Figma's face is a 168x214 ellipse spanning y 40..254; `.form`
   is a 230x260 dome spanning y 20..280 (see FaceDiagram.module.css for why it
   had to widen). That dropped the chin of the drawing 26 units without moving
   the pill that names it, so every row read high on the face and `Around mouth`
   and `Chin / jaw` — the two with the furthest to fall — left an empty crescent
   at the bottom of the dome. The centres below are the SAME reading order at
   the fractions of the new form a face actually has: .16 / .31 / .47 / .72 / .88
   of y 20..280. Every pill still sits inside the outline at its own width — the
   dome's half-width at the chin row is 73, against a 77-wide pill centred on it.

   ⚠️ AND `y` IS THE CENTRE, NOT THE TOP — which is what made this a DESKTOP
   complaint rather than an everywhere one. A pill is 30px tall at every
   breakpoint while the box it sits in scales (368 wide at 440, 456 at 1024+),
   so a top-anchored pill's CENTRE drifts up the face as the diagram grows: the
   30px is a shrinking fraction of a growing box. Measured, chin's centre landed
   3 units higher at 1024 than at 440 for no reason anyone chose. Anchoring the
   centre makes the geometry scale-invariant, which is the only way one set of
   percentages can be honest at both sizes. `.region` translates -50% on BOTH
   axes now; it already did on x for the same reason. */
const REGIONS: Region[] = [
  { id: "Forehead", x: 160 / 392, y: 62 / 300, w: 73 / 392 },
  { id: "Eye area", x: 162 / 392, y: 102 / 300, w: 68 / 392 },
  { id: "Cheeks (L)", x: 82 / 392, y: 142 / 300, w: 80 / 392 },
  { id: "Nose", x: 171 / 392, y: 142 / 300, w: 50 / 392 },
  { id: "Cheeks (R)", x: 231 / 392, y: 142 / 300, w: 82 / 392 },
  { id: "Around mouth", x: 146 / 392, y: 208 / 300, w: 101 / 392 },
  { id: "Chin / jaw", x: 158 / 392, y: 250 / 300, w: 77 / 392 },
];

/* ⚠️ THE FACE IS A TERRACED DOME — decided here, NOT IN FIGMA. See `.form` in
   FaceDiagram.module.css for why the comp's 1.25px ellipse could not stay.
   These are the CONTOUR LEVELS: nested ellipses, each smaller step drifting
   toward the light at 33%/21% the way the level lines on a real dome do, each
   casting onto the step below it. The geometry is here rather than in the CSS
   for the same reason REGIONS is — the shape of this thing IS the design, and
   the module should not be the place you go to find out what the face looks
   like. Level 0 is the base form itself (`.form`); these are the three above
   it. Values are diagram units, i.e. the same 392x300 box the regions use.
   Every level steps in by ~30 and shares the base form's centre (196, 150),
   so the stack is CONCENTRIC. The light stays off-centre — the base gradient
   still lights the dome from 33%/21% — which is what keeps the terraces
   reading as elevation rather than as a flat target; the geometry does not
   need to lean for that, and a stack that leans reads as a mistake before it
   reads as perspective. Each level carries the same translucent wash, so the
   tint accumulates toward the summit on its own rather than being five
   hand-picked values that can drift apart. */
const TIERS = [
  { w: 198, h: 224, cx: 196, cy: 150 },
  { w: 168, h: 190, cx: 196, cy: 150 },
  { w: 138, h: 156, cx: 196, cy: 150 },
  { w: 108, h: 122, cx: 196, cy: 150 },
  { w: 78, h: 88, cx: 196, cy: 150 },
];

/** So "Whole face" can select/clear every region pill in one tap — see StartInvestigation. */
export const FACE_REGION_IDS = REGIONS.map((r) => r.id);

/**
 * ⚠️ TWO MODES, AND THE PROPS ARE A UNION SO THE WRONG ONE CANNOT COMPILE.
 * `readOnly` is the recap at `/investigation/profile` reading the location
 * answer back: the same dome, the same seven pills at the same coordinates,
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

  return (
    <div className={styles.card}>
      <div
        className={styles.diagram}
        data-readonly={readOnly || undefined}
        role={readOnly ? undefined : "group"}
        aria-label={readOnly ? undefined : "Face regions"}
        aria-hidden={readOnly || undefined}
      >
        {/* the form is decorative — the pills carry the meaning */}
        <span className={styles.form} aria-hidden="true">
          {TIERS.map((t, i) => (
            /* biome-ignore lint/suspicious/noArrayIndexKey: TIERS is a constant
               list of decorative shapes — fixed length, fixed order, no state,
               aria-hidden. Position is the only identity they have. */
            <span key={i}
              className={styles.tier}
              style={{
                left: `${((t.cx - t.w / 2) / 392) * 100}%`,
                top: `${((t.cy - t.h / 2) / 300) * 100}%`,
                width: `${(t.w / 392) * 100}%`,
                height: `${(t.h / 300) * 100}%`,
              }}
            />
          ))}
        </span>
        {REGIONS.map((r) => {
          const position = {
            left: `${(r.x + r.w / 2) * 100}%`,
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

"use client";

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import styles from "./FaceDiagram.module.css";
import { Chip } from "@/components/ui/Chip";
import { SYMPTOMS, type Symptom } from "@/features/my-skin/safety";
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

/* ---------------------------------------------------------------------------
   THE SYMPTOM CALLOUTS — NOT IN FIGMA, asked for directly 14 Sep 2026, from a
   supplied anatomy reference (labels at the edge, a leader line to each point).

   ⚠️ ONE PILL PER SYMPTOM, WITH A LINE TO EACH OF ITS PLACES — not one per
   place. `start` is symptom → places, so a symptom is the unit the answer is
   stored in, and it is the bounded one: eight symptoms at most, where a pill
   per (place, symptom) pair could need 56 and a 300-tall box holds about nine
   a side.

   ⚠️ THE SEVEN FACE REGIONS AND `Neck` GET A LINE. `Neck` has no pill on the
   face, so it draws to a point on the drawn neck (`NECK`) instead, marked by a
   dot because no pill covers that end of its line. It takes the side of the
   neck its pill is on, so the line never crosses the `Chin / jaw` pill
   above it. Added 14 Sep 2026, asked for directly. `Whole face` and `Other`
   have no coordinate to draw to, and their lit chips under the face already say
   them; a symptom placed only there has no callout. `Whole face` writes every
   region too, so it fans seven lines — that is what the answer says.

   ⚠️ THE LINE RUNS FROM THE REGION'S CENTRE TO THE BOX'S EDGE, AND BOTH ENDS ARE
   COVERED — the region pill paints over its start, the symptom pill over its
   end — so no label is ever measured.

   ⚠️ THE MIDDLE ROW IS THE ONE COLLISION. `Cheeks (L)`, `Nose` and `Cheeks (R)`
   share a y, so a level line from `Nose` to either edge would run behind a
   cheek pill and read as ending there. A callout with a line that would cross
   a middle-row pill steps its pill off that row, turning the line into a
   diagonal that clears the pill between. */
export type SymptomPlaces = Partial<Record<Symptom, string[]>>;

type Callout = {
  symptom: Symptom;
  side: "left" | "right";
  /** the pill's centre, as a fraction of the box's height */
  y: number;
  regions: Region[];
};

const MIDDLE_ROW = 181 / 300;
/* how far a crossing callout steps off the middle row: a line from `Nose` to
   the edge passes `Cheeks (L)` 41% of the way along, and has to be 17 clear of
   that pill's centre there */
const MIDDLE_ROW_STEP = 50 / 300;
/* one pill plus air — the pill is at most 24px tall (see `.symptom`) */
const CALLOUT_PITCH = 30 / 300;
const CALLOUT_TOP = 14 / 300;
const CALLOUT_BOTTOM = 286 / 300;

/* the neck is not a pill, so its line ends on the drawing: level with the neck
   below the `Chin / jaw` pill, at the neck's edge on the side its callout
   is on (the neck spans about 152–264 of the box's width there) */
const NECK: Region = { id: "Neck", x: 199 / 392, y: 290 / 300 };
const NECK_X = { left: 156 / 392, right: 242 / 392 };

const mean = (ns: number[]) => ns.reduce((a, b) => a + b, 0) / ns.length;

function layoutCallouts(places: SymptomPlaces): Callout[] {
  const items = SYMPTOMS.flatMap((symptom) => {
    const areas = places[symptom] ?? [];
    const regions = REGIONS.filter((r) => areas.includes(r.id));
    if (areas.includes(NECK.id)) regions.push(NECK);
    if (regions.length === 0) return [];
    return [
      {
        symptom,
        regions,
        x: mean(regions.map((r) => r.x)),
        y: mean(regions.map((r) => r.y)),
      },
    ];
  });

  /* a symptom leans to the side its places lean to; the ones down the middle
     then fill whichever side has fewer, top to bottom */
  const count = { left: 0, right: 0 };
  const sided = new Map<Symptom, Callout["side"]>();
  for (const it of items) {
    if (Math.abs(it.x - 0.5) < 0.03) continue;
    const side = it.x < 0.5 ? "left" : "right";
    sided.set(it.symptom, side);
    count[side]++;
  }
  for (const it of [...items].sort((a, b) => a.y - b.y)) {
    if (sided.has(it.symptom)) continue;
    const side = count.left <= count.right ? "left" : "right";
    sided.set(it.symptom, side);
    count[side]++;
  }

  const callouts: Callout[] = items.map((it) => {
    const side = sided.get(it.symptom)!;
    const ownCheek = side === "left" ? "Cheeks (L)" : "Cheeks (R)";
    const crosses = it.regions.some(
      (r) => r.y === MIDDLE_ROW && r.id !== ownCheek,
    );
    let y = it.y;
    if (crosses && Math.abs(y - MIDDLE_ROW) < MIDDLE_ROW_STEP) {
      y = y > MIDDLE_ROW ? MIDDLE_ROW + MIDDLE_ROW_STEP : MIDDLE_ROW - MIDDLE_ROW_STEP;
    }
    const regions = it.regions.map((r) =>
      r === NECK ? { ...NECK, x: NECK_X[side] } : r,
    );
    return { symptom: it.symptom, side, y, regions };
  });

  /* push apart down each edge, then back up if the last one ran off the box */
  for (const side of ["left", "right"] as const) {
    const column = callouts
      .filter((c) => c.side === side)
      .sort((a, b) => a.y - b.y);
    column.forEach((c, i) => {
      const floor = i === 0 ? CALLOUT_TOP : column[i - 1].y + CALLOUT_PITCH;
      c.y = Math.max(c.y, floor);
    });
    for (let i = column.length - 1; i >= 0; i--) {
      const ceiling =
        i === column.length - 1 ? CALLOUT_BOTTOM : column[i + 1].y - CALLOUT_PITCH;
      column[i].y = Math.min(column[i].y, ceiling);
    }
  }

  return callouts;
}

const pct = (n: number) => `${n * 100}%`;

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
 *
 * ⚠️ A THIRD STATE, `disabled` — NOT IN FIGMA, added 14 Sep 2026. Step 1 asks
 * for places one symptom at a time now (see `StartInvestigation.tsx`), so
 * between symptoms a region has nothing to be the place OF. The face stays
 * drawn and every place already marked keeps its full selected treatment; the
 * regions nobody marked fade to `opacity/disabled`, as real disabled buttons.
 * ⚠️ **IT IS NOT `readOnly`**, whose stylesheet note says in capitals that it
 * must not look disabled: that face is a finished answer, and this one is a
 * control waiting for a symptom.
 *
 * ⚠️ `glint` SHINES EVERY REGION'S LABEL ONCE, TOGETHER — asked for directly
 * 14 Sep 2026 ("face locations shine once altogether"), for the moment a
 * symptom is picked and the face becomes the next thing to answer. It is the
 * app's own shine (`.shine-text` + `.shine-on-enter`, `globals.css`) on all
 * seven labels at once, not a new effect. A new number replays it, and the
 * class comes off after the one run: a label painted through the shine's
 * transparent ink would SNAP to white when its pill is then picked, where the
 * plain label fades with the fill.
 */
type CalloutProps = {
  /** each symptom's places, drawn as edge pills with leader lines — see
      `layoutCallouts` */
  callouts?: SymptomPlaces;
  /** fades the callouts without unmounting them, so their lines only draw in
      when they are new */
  calloutsHidden?: boolean;
};

type FaceDiagramProps = CalloutProps &
  (
    | {
        readOnly?: false;
        selected: string[];
        onToggle: (id: string) => void;
        locationChips: string[];
        /** nothing to toggle yet — see the note above */
        disabled?: boolean;
        /** a new number shines every region's label once — see the note above */
        glint?: number;
      }
    | { readOnly: true; selected: string[]; otherLocations?: string[] }
  );

/* how long a glint keeps its class: `.shine-on-enter` runs 1200ms, and this is
   the fallback for the `animationend` a hidden tab never delivers (AGENTS.md,
   motion), the same guard `SafetyNotice` keeps for its close */
const GLINT_MS = 1400;

export function FaceDiagram(props: FaceDiagramProps) {
  const { selected } = props;
  const readOnly = props.readOnly === true;
  const disabled = props.readOnly !== true && props.disabled === true;
  const glint = props.readOnly !== true ? (props.glint ?? 0) : 0;
  const shine = useLineShine();
  /* each instance owns its filter, under an id stable across SSR */
  const brightenId = useId();
  const callouts = layoutCallouts(props.callouts ?? {});

  /* the glint in progress — the number it was started for, or null. Set during
     render, the pattern `SafetyNotice` uses, so the shine never starts a frame
     behind the chip that asked for it */
  const [glintRun, setGlintRun] = useState<number | null>(null);
  const [seenGlint, setSeenGlint] = useState(glint);
  if (glint !== seenGlint) {
    setSeenGlint(glint);
    setGlintRun(glint > 0 ? glint : null);
  }

  useEffect(() => {
    if (glintRun === null) return;
    const t = window.setTimeout(() => setGlintRun(null), GLINT_MS);
    return () => window.clearTimeout(t);
  }, [glintRun]);

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
              "--face-lines-brighten": `url("#${brightenId}")`,
            } as CSSProperties
          }
        >
          {/* ⚠️ THE LINES ARE LIFTED, asked for directly 14 Sep 2026, twice —
              NOT IN FIGMA. The asset is pure white on transparency, so
              `brightness()` has no colour left to raise; what reads as the
              line's clarity is its ALPHA, and only an SVG filter can change
              that. ⚠️ A CURVE, NOT A MULTIPLIER: half the line pixels are thin
              antialiased strokes under 40% alpha, and ×1.2 (tried first, mean
              0.414 → 0.494) left them as faint as before. Each alpha goes to
              its square root instead — mean 0.414 → 0.622, strokes under 40%
              from 48% of the lines to 9%, and the 0.2% already opaque stay
              exactly that, so no line thickens or clips. Only `.lines` takes
              it: `.shine` masks by the same image and keeps the strength it
              was dimmed to. */}
          <svg className={styles.filters} aria-hidden="true" focusable="false">
            <filter id={brightenId}>
              <feComponentTransfer>
                <feFuncA type="gamma" amplitude="1" exponent="0.5" />
              </feComponentTransfer>
            </filter>
          </svg>
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
        {/* under the region pills, so each line starts beneath its place.
            Decorative: the list after the diagram says the same in words. */}
        {callouts.length > 0 && (
          <div
            className={styles.callouts}
            data-hidden={props.calloutsHidden || undefined}
            aria-hidden="true"
          >
            <svg className={styles.leaders} focusable="false">
              {callouts.flatMap((c) =>
                c.regions.map((r) => (
                  <g key={`${c.symptom}-${r.id}`}>
                    <line
                      className={styles.leader}
                      x1={pct(r.x)}
                      y1={pct(r.y)}
                      x2={c.side === "left" ? "0%" : "100%"}
                      y2={pct(c.y)}
                      pathLength={1}
                    />
                    {/* no pill covers the neck's end of the line */}
                    {r.id === NECK.id && (
                      <circle
                        className={styles.anchor}
                        cx={pct(r.x)}
                        cy={pct(r.y)}
                        r={3}
                      />
                    )}
                  </g>
                )),
              )}
            </svg>
            {callouts.map((c) => (
              <span
                key={c.symptom}
                className={`${styles.symptom} t-label-sm`}
                data-side={c.side}
                style={{ top: pct(c.y) }}
              >
                {c.symptom}
              </span>
            ))}
          </div>
        )}
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
              disabled={disabled}
              className={`${styles.region} t-label-sm`}
              style={position}
              onClick={() => props.onToggle(r.id)}
            >
              {/* the label is its own element so the glint lights the words and
                  not the pill; keyed on the run, so a new glint restarts it */}
              <span
                key={glintRun === null ? "rest" : `glint-${glintRun}`}
                className={
                  glintRun === null ? undefined : "shine-text shine-on-enter"
                }
                onAnimationEnd={() => setGlintRun(null)}
              >
                {r.id}
              </span>
            </button>
          );
        })}
      </div>

      {callouts.length > 0 && !props.calloutsHidden && (
        <ul className="visually-hidden" aria-label="Symptoms by place">
          {callouts.map((c) => (
            <li key={c.symptom}>
              {c.symptom}: {c.regions.map((r) => r.id).join(", ")}
            </li>
          ))}
        </ul>
      )}

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
                disabled={disabled}
                onToggle={() => props.onToggle(c)}
              />
            ))}
          </div>
        )}
    </div>
  );
}

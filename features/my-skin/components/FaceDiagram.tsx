"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import styles from "./FaceDiagram.module.css";
import { Chip } from "@/components/ui/Chip";
import { SYMPTOMS, type Symptom } from "@/features/my-skin/safety";
import art from "../assets/face-art.svg";
import silhouette from "../assets/face-silhouette.svg";

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
 * ⚠️ THE FACE IS A WIREFRAME TRACED FROM A SUPPLIED REFERENCE IMAGE — NOT IN
 * FIGMA, AND NOT OURS. It was a CSS terraced dome, then from 13 Sep 2026 a
 * contour drawing (a scanned head's iso-depth lines, asked for directly),
 * and since 26 Sep 2026 a quad-mesh head: the lines of a wireframe-head
 * image found on Pinterest (pin 305611524731014086) thinned to skeletons
 * and written as vector strokes by `scripts/face-art.mjs` (`npm run face`;
 * the provenance and the IP position are in its header). A procedural
 * head was built and reshaped against that reference first and did not
 * read as a real face; image generation was blocked on the account; the
 * decision to trace the reference itself was the product owner's, asked
 * for directly ("use the reference, trace it and wire it in"). ⚠️ Replace
 * the source with a generated or licensed head before this ships beyond
 * the prototype — the script takes any light-lines-on-black image.
 *
 * The asset is white lines on transparency, each line's opacity the
 * source's own glow at that point — see `.art` for its footprint — and a
 * shine follows the pointer ACROSS THE LINES ONLY (`.shine`, masked by the
 * same image). The silhouette is the same image's non-background region
 * plus the neck column, so the shading it masks falls down the neck.
 * ⚠️ REGISTERED BY THE EYES AND THE LIPS, THEN DRAWN 5% LARGER (asked for
 * directly 26 Sep 2026): one uniform scale maps the image's eye row and
 * mouth line onto `REGIONS`' rows below, and the head is then enlarged
 * about the eye row, so the eyes sit 3 rows under their pill, the lips 15,
 * the nose tip 38 (this head's nose is longer than the landmark spacing)
 * — all still under their pills, which are ~100 rows tall. ⚠️ THE NECK AND
 * THE SHOULDERS ARE DRAWN, NOT TRACED: the image is
 * cut at the chin, and they follow a second supplied line drawing (asked
 * for directly: "add the neck part like the image I attached"), measured
 * and hung off the traced jaw by the script. The frame is 670x1040 for
 * them, up from the 980 of the first asset — `.form` in the module CSS
 * carries what that costs. ⚠️ AND THE WHOLE DRAWING IS 15% LARGER AND 45
 * UNITS LOWER ON THE CARD than the footprint every seat and measurement in
 * this file is written at (asked for directly) — see `REGIONS`. Raise the artwork in Figma: the DS still has no
 * face artwork.
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
   the same point at 440 and at 1024+.

   ⚠️ THE DRAWING IS 32.25% LARGER AND 45 UNITS LOWER THAN EVERY SEAT BELOW
   SAYS, AS OF 26 Sep 2026 — asked for directly ("make the whole face diagram
   bigger 15% and move it down 15%"), then 15% bigger again the same day, which
   compounds: 1.15 x 1.15 = 1.3225. The seats are still written at the footprint
   they were read at (226x280 at 83,10); `seat` maps each one the way `.form`
   in the module CSS maps the drawing — scaled about the crown's centre
   (196,10), then dropped 45 — so a pill stays on its feature. `FACE_ZOOM` and
   `FACE_DROP` here and the `.form` calc there are ONE value written twice;
   change both. The callout rails and the neck point take the same map. */
const FACE_ZOOM = 1.15 * 1.15;
const FACE_DROP = 45 / 300;
const seatX = (x: number) => 0.5 + (x - 0.5) * FACE_ZOOM;
const seatY = (y: number) => (y - 10 / 300) * FACE_ZOOM + 10 / 300 + FACE_DROP;
const seat = (r: Region): Region => ({ ...r, x: seatX(r.x), y: seatY(r.y) });
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
].map(seat);

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

const MIDDLE_ROW = seatY(181 / 300);
/* how far a crossing callout steps off the middle row: a line from `Nose` to
   the edge passes `Cheeks (L)` 41% of the way along, and has to be 17 clear of
   that pill's centre there */
const MIDDLE_ROW_STEP = (50 / 300) * FACE_ZOOM;
/* one pill plus air — the pill is at most 24px tall (see `.symptom`) */
const CALLOUT_PITCH = 30 / 300;
/* the rails follow the drawing's map too, so the stack still spans the head */
const CALLOUT_TOP = seatY(14 / 300);
const CALLOUT_BOTTOM = seatY(286 / 300);

/* the neck is not a pill, so its line ends on the drawing: level with the neck
   below the `Chin / jaw` pill, at the neck's edge on the side its callout
   is on. ⚠️ The drawn neck of 26 Sep 2026 is wider than the 14 Sep one these
   were read on (152–264): its sides are `NECK_HALF` 180 either side of frame
   x 337 (the script prints both), i.e. 136–257 of the box's width at the
   footprint the seats are written in, and the dot sits on the line. */
const NECK: Region = seat({ id: "Neck", x: 199 / 392, y: 290 / 300 });
const NECK_X = { left: seatX(136 / 392), right: seatX(257 / 392) };

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
 *
 * ⚠️ HOVER LIGHTS ONE ANSWER'S PAIRS — NOT IN FIGMA, asked for directly 14 Sep
 * 2026: with several symptoms placed, the leader lines cross and it stops
 * being clear which pill goes with which place. Hovering a symptom's callout
 * lights the places it was marked on and its lines to them; hovering a place
 * lights the symptoms marked there and their lines to that place. What is lit
 * brightens under a soft glow on `duration/slow`, and the other lines and
 * symptom pills fade back, so the pairing reads on its own. Nothing is
 * selected or written: it is a reading aid, and the hidden list after the
 * diagram already says the same pairs in words. It runs in both modes, since
 * the recap and PROGRESS draw the same lines, and never while the callouts are
 * hidden.
 * ⚠️ STEP 1's IDLE FACE IS DISABLED, and that is exactly when the callouts
 * show, so its places are hovered as disabled buttons. Pointer events still
 * reach a disabled button (checked in Chrome 152), which is why these are
 * `onPointerEnter` / `onPointerLeave`.
 */
/* what the pointer is on — a symptom's callout pill, a place, or one of the
   location chips under the face (`Whole face`, `Neck`, `Other`) */
type Lit = { symptom: Symptom } | { region: string } | { chip: string } | null;

/* ⚠️ THE CHIPS UNDER THE FACE LIGHT THEIR SYMPTOMS TOO, asked for directly 14
   Sep 2026. A chip has no coordinate of its own, so it lights by the ANSWER:
   every symptom whose places include it, and the lines that answer draws —
   `Neck`'s to the neck, `Whole face`'s to every face region, `Other`'s none
   (it has nothing to draw to, so only its symptoms' pills light). The other
   way round, a hovered symptom lights the chips it was placed on. */
const WHOLE_FACE = "Whole face";

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
    | {
        readOnly: true;
        selected: string[];
        otherLocations?: string[];
        /** a symptom lit from OUTSIDE the diagram — `SymptomLocation`'s list
            row under the pointer; lights that symptom's pill and lines exactly
            as hovering the pill does. See LIT FROM THE LIST below. */
        litSymptom?: Symptom | null;
        /** reports the symptoms the diagram's own hover is lighting, so the
            list beside it can light their rows; called with `[]` on leave */
        onLit?: (symptoms: Symptom[]) => void;
        /** the pairing is written out visibly beside the diagram, so the
            hidden "Symptoms by place" list is not rendered — it would say the
            answer twice to a screen reader */
        legendOutside?: boolean;
      }
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
  const callouts = layoutCallouts(props.callouts ?? {});

  /* the pairing under the pointer — see HOVER in the note above. Ignored while
     the callouts are hidden, and cleared when the pointer leaves the face, so a
     pill that unmounts under the pointer cannot leave its pairs lit. */
  const [hover, setHover] = useState<Lit>(null);
  /* ⚠️ TAP LIGHTS IT ON TOUCH — 16 Sep 2026, asked for directly ("this hover
     highlight effect is not working on mobile, make it tap and work"). A touch
     fires `pointerenter` on press and `pointerleave` on lift, so the pairing
     flashed for the length of the tap and went out. Touch now ignores
     enter/leave, and a TAP pins the pairing instead: tap a symptom pill, a
     read-only place or a read-only chip to light it, tap it again (or tap
     anywhere that is not one of them) to clear it, tap another to move the
     light. A mouse keeps hover exactly as before. Step 1's editable places
     and chips are not pinned — a tap on those toggles the answer. */
  const [pinned, setPinned] = useState<Lit>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  /* whether the pointer that is about to click is a finger — `click` itself
     does not say so in every browser */
  const touching = useRef(false);
  const notTouch = (e: ReactPointerEvent) => e.pointerType !== "touch";
  const enter = (lit: Lit) => (e: ReactPointerEvent) => {
    if (notTouch(e)) setHover(lit);
  };
  const sameLit = (a: Lit, b: Lit) =>
    a !== null && b !== null && JSON.stringify(a) === JSON.stringify(b);
  const tap = (lit: Lit) => () => {
    if (touching.current) setPinned((prev) => (sameLit(prev, lit) ? null : lit));
  };
  /* ⚠️ LIT FROM THE LIST — NOT IN FIGMA, 15 Sep 2026. `SymptomLocation` draws
     the pairing as rows beside this diagram, and a row under the pointer is
     the same reading aid as a pill under it, so it feeds the same state. The
     diagram's own hover wins while it has one (the pointer can only be in one
     place); the list's lights the face when the pointer is on the words. */
  const external: Lit =
    props.readOnly === true && props.litSymptom
      ? { symptom: props.litSymptom }
      : null;
  /* a row tapped in the list takes the light from a pill pinned here */
  const [seenExternal, setSeenExternal] = useState<Symptom | null>(null);
  const externalSymptom = external ? external.symptom : null;
  if (externalSymptom !== seenExternal) {
    setSeenExternal(externalSymptom);
    if (externalSymptom !== null) setPinned(null);
  }
  const active = props.calloutsHidden ? null : (hover ?? pinned ?? external);
  const placesOf = (s: Symptom) => props.callouts?.[s] ?? [];
  const litCallouts =
    active === null
      ? []
      : callouts.filter((c) =>
          "symptom" in active
            ? c.symptom === active.symptom
            : "region" in active
              ? c.regions.some((r) => r.id === active.region)
              : placesOf(c.symptom).includes(active.chip),
        );
  /* a hovered place no symptom points to lights nothing and fades nothing */
  const focused = litCallouts.length > 0;
  const litRegions = new Set<string>(
    active === null || !focused
      ? []
      : "symptom" in active
        ? litCallouts.flatMap((c) => c.regions.map((r) => r.id))
        : "region" in active
          ? [active.region]
          : active.chip === WHOLE_FACE
            ? FACE_REGION_IDS
            : [active.chip],
  );
  const litChips = new Set<string>(
    active === null || !focused
      ? []
      : "symptom" in active
        ? placesOf(active.symptom)
        : "chip" in active
          ? [active.chip]
          : [],
  );
  const lineLit = (c: Callout, r: Region) =>
    litCallouts.includes(c) && litRegions.has(r.id);
  const leave = (e: ReactPointerEvent) => {
    if (notTouch(e)) setHover(null);
  };

  /* a pinned pairing clears on a tap anywhere that is not a tap target of
     THIS diagram — the page, the card's own background, another block */
  useEffect(() => {
    if (pinned === null) return;
    const clear = (e: PointerEvent) => {
      const target = e.target instanceof Element ? e.target : null;
      const onTarget =
        target?.closest("[data-tap-light]") &&
        cardRef.current?.contains(target);
      if (!onTarget) setPinned(null);
    };
    document.addEventListener("pointerdown", clear);
    return () => document.removeEventListener("pointerdown", clear);
  }, [pinned]);

  /* the other direction: what THIS diagram lights, told to the list. Keyed on
     the symptoms as a string so the effect runs on a change of pairing, not on
     every render; the callback rides a ref so a new function identity per
     render cannot re-fire it. Only the diagram's OWN hover or pin is reported
     — echoing the list's light back at it would loop. */
  const onLit = props.readOnly === true ? props.onLit : undefined;
  const onLitRef = useRef(onLit);
  onLitRef.current = onLit;
  const own = hover ?? pinned;
  const reported = own === null || props.calloutsHidden ? "" : litCallouts.map((c) => c.symptom).join("|");
  useEffect(() => {
    onLitRef.current?.(reported === "" ? [] : (reported.split("|") as Symptom[]));
  }, [reported]);

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
    <div
      ref={cardRef}
      className={styles.card}
      /* the entrance — the drawing, then the pills, then the callouts; see
         "THE FACE ENTRANCE" in app/vidgen.css */
      data-motion="face"
      onPointerDown={(e) => {
        touching.current = e.pointerType === "touch";
      }}
    >
      <div
        className={styles.diagram}
        data-readonly={readOnly || undefined}
        role={readOnly ? undefined : "group"}
        aria-label={readOnly ? undefined : "Face regions"}
        aria-hidden={readOnly || undefined}
        ref={shine.diagramRef}
        onPointerLeave={leave}
      >
        {/* the drawing is decorative — the pills carry the meaning. Both image
            URLs are handed to CSS as custom properties because they are MASKS
            there: `.volume` is shaded inside the head's outline, and `.shine`
            lights only the lines. */}
        <span
          className={styles.form}
          data-part="art"
          aria-hidden="true"
          style={
            {
              "--face-art": `url(${art.src})`,
              "--face-silhouette": `url(${silhouette.src})`,
            } as CSSProperties
          }
        >
          {/* ⚠️ NO ALPHA LIFT ANY MORE. The contour asset ran through an SVG
              filter raising each pixel's alpha to its square root (asked for
              directly 14 Sep 2026, twice), because a faint antialiased line
              only has its alpha to raise. The mesh carries the LIGHT in its
              alpha — a shadowed segment at 0.4 is the form — and a square
              root would pull 0.4 to 0.63 and flatten the head. Gone with the
              contour lines, 26 Sep 2026. */}
          <span className={styles.volume} />
          {/* biome-ignore lint/performance/noImgElement: a fixed decorative
              asset masked by CSS; next/image's wrapper and srcset buy nothing */}
          <img
            className={styles.art}
            src={art.src}
            width={art.width}
            height={art.height}
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
            data-focus={focused || undefined}
            aria-hidden="true"
          >
            <svg className={styles.leaders} focusable="false">
              {callouts.flatMap((c) =>
                c.regions.map((r) => (
                  <g key={`${c.symptom}-${r.id}`}>
                    <line
                      className={styles.leader}
                      data-part="leader"
                      data-lit={lineLit(c, r) || undefined}
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
                        data-part="anchor"
                        data-lit={lineLit(c, r) || undefined}
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
                data-part="callout"
                data-side={c.side}
                data-lit={litCallouts.includes(c) || undefined}
                style={{ top: pct(c.y) }}
                data-tap-light
                onPointerEnter={enter({ symptom: c.symptom })}
                onPointerLeave={leave}
                onClick={tap({ symptom: c.symptom })}
              >
                {c.symptom}
              </span>
            ))}
          </div>
        )}
        {REGIONS.map((r, i) => {
          const position = {
            left: `${r.x * 100}%`,
            top: `${r.y * 100}%`,
            /* the entrance's order (app/vidgen.css, "THE FACE ENTRANCE") */
            "--i": i,
          } as CSSProperties;

          /* The read-only pill is a `span`, not a disabled `button`. Disabled
             is a control the user cannot use yet; this is not a control at
             all, and the recap should not tell a screen reader otherwise. */
          return readOnly ? (
            <span
              key={r.id}
              data-selected={selected.includes(r.id)}
              data-lit={litRegions.has(r.id) || undefined}
              className={`${styles.region} t-label-sm`}
              data-part="region"
              style={position}
              data-tap-light
              onPointerEnter={enter({ region: r.id })}
              onPointerLeave={leave}
              onClick={tap({ region: r.id })}
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
              data-lit={litRegions.has(r.id) || undefined}
              disabled={disabled}
              className={`${styles.region} t-label-sm`}
              data-part="region"
              style={position}
              onClick={() => props.onToggle(r.id)}
              onPointerEnter={enter({ region: r.id })}
              onPointerLeave={leave}
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

      {callouts.length > 0 &&
        !props.calloutsHidden &&
        !(props.readOnly === true && props.legendOutside) && (
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
                  <span
                    className={`${styles.readOnlyChip} t-label`}
                    data-lit={litChips.has(c) || undefined}
                    data-tap-light
                    onPointerEnter={enter({ chip: c })}
                    onPointerLeave={leave}
                    onClick={tap({ chip: c })}
                  >
                    {c}
                  </span>
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
            {/* `display: contents` — the span only carries the pointer and the
                lit state; the row still lays out the `Chip`s themselves */}
            {props.locationChips.map((c) => (
              <span
                key={c}
                className={styles.chipHover}
                data-lit={litChips.has(c) || undefined}
                onPointerEnter={enter({ chip: c })}
                onPointerLeave={leave}
              >
                <Chip
                  label={c}
                  selected={selected.includes(c)}
                  disabled={disabled}
                  onToggle={() => props.onToggle(c)}
                />
              </span>
            ))}
          </div>
        )}
    </div>
  );
}

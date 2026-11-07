"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
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
 */
/* `x`/`y` are the pill's CENTRE, as fractions of the 392x300 box. */
type Region = { id: string; x: number; y: number };

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
   is on. */
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

/* what the pointer is on — a symptom's callout pill, a place, or one of the
   location chips under the face (`Whole face`, `Neck`, `Other`) */
type Lit = { symptom: Symptom } | { region: string } | { chip: string } | null;

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
        disabled?: boolean;
        glint?: number;
        /** a control pinned to the card's top-right corner — step 1's reset */
        corner?: ReactNode;
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

  const [hover, setHover] = useState<Lit>(null);
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

  /* the glint in progress — the number it was started for, or null. */
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
      className={`${styles.card} grain`}
      /* the entrance — the drawing, then the pills, then the callouts; see
         "THE FACE ENTRANCE" in app/globals.css */
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
                /* `--cy`, not `top`: CSS rounds it to a whole pixel */
                style={{ "--cy": c.y } as CSSProperties}
                data-tap-light
                onPointerEnter={enter({ symptom: c.symptom })}
                onPointerLeave={leave}
                onClick={tap({ symptom: c.symptom })}
              >
                {/* the label is its own block so `text-box` can trim it to
                    cap height — see `.symptomLabel` */}
                <span className={styles.symptomLabel}>{c.symptom}</span>
              </span>
            ))}
          </div>
        )}
        {REGIONS.map((r, i) => {
          const position = {
            left: `${r.x * 100}%`,
            top: `${r.y * 100}%`,
            /* the entrance's order (app/globals.css, "THE FACE ENTRANCE") */
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
      {props.readOnly !== true && props.corner && (
        <div className={styles.corner}>{props.corner}</div>
      )}
    </div>
  );
}

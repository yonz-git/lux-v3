import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Headline } from "../components/Type";
import { C, clamp, EASE_IN, EASE_IN_OUT, EASE_OUT, FIGTREE } from "../theme";

/**
 * Next version, beats 1–2 (prototype): TOO MUCH → YOUR FIVE.
 * Brief: lux-v3/.forge/briefs/intro-video-next.md. Structure borrowed from
 * Enxovaly ("Mil dúvidas. Sem exageros."). Since 2 Oct 2026 it opens on the
 * first intro's frame (your five in a ring round "Your skin flared up. You
 * use five products. Where do you start?"), then the ring dissolves and a
 * tilted wall of hundreds of products and "add this" tips builds round the
 * five (the pull back between the two was cut, asked for); the wall dims, the five lift out, the rest falls away and the five go
 * as the orb arrives. The row they used to glide into is gone (asked for).
 *
 * The wall is real CSS 3D (one plane, perspective on the frame). The same
 * maths is run in JS per tile so far tiles can fog and blur (depth of field)
 * and off-frame tiles are culled. The five are tiles OF the wall — in beat 2
 * the plane flattens to identity while they glide to their row, so plane
 * coordinates become frame coordinates and the hand-off has no seam.
 */
export const TOO_MUCH_LEN = 410;

const W = 1920;
const H = 1080;
const PERSP = 1500;
const CELL = 96;
const PITCH = 118;
const COLS = [-17, 17] as const;
const ROWS = [-14, 6] as const;

const PHOTOS = [
  "dropper-green",
  "jar-olive",
  "bottle-brown",
  "bottle-milky",
  "pump-milky",
  "cylinder-violet",
  "pump-grey",
  "cylinder-red",
];

/* the "add more" noise. DRAFT copy, no brands, no claims */
const TIPS = [
  "Add a\nserum",
  "Try\nretinol",
  "Double\ncleanse",
  "Add\nvitamin C",
  "Layer an\nessence",
  "One more\nmask",
  "Toner\nfirst",
  "Add a\npeel",
  "Try this\noil",
  "10 step\nroutine",
  "Add an\nacid",
  "Night\ncream too",
];

/* your five, the demo library's own (Hook's TILES): cells near the centre of
   the wall, and the row slot each glides to. Sorted by x so no paths cross. */
const YOURS: Record<string, { photo: string; slot: number }> = {
  "-3,-1": { photo: "jar-olive", slot: 0 },
  "-2,1": { photo: "bottle-milky", slot: 1 },
  "0,0": { photo: "dropper-green", slot: 2 },
  "2,-2": { photo: "bottle-brown", slot: 3 },
  "3,1": { photo: "pump-milky", slot: 4 },
};
export const ROW = { size: 176, gap: 48, y: 100 };
export const slotX = (slot: number) => (slot - 2) * (ROW.size + ROW.gap);
/* where your five settle, in screen px from the frame's centre: a ring round
   the three lines, as the first intro drew it (asked for 2 Oct 2026 in place
   of the tilted wall's "add more" frame). Indexed by slot. */
export const RING_SIZE = 170;
export const RING: { x: number; y: number }[] = [
  { x: 0, y: -330 } /* jar-olive, top */,
  { x: -500, y: 230 } /* bottle-milky, bottom left */,
  { x: -500, y: -185 } /* dropper-green, top left */,
  { x: 500, y: -185 } /* bottle-brown, top right */,
  { x: 500, y: 230 } /* pump-milky, bottom right */,
];
/** your five, by row slot — the later beats pick the row up from here */
export const FIVE = Object.values(YOURS)
  .sort((a, b) => a.slot - b.slot)
  .map((y) => y.photo);

const rand = (n: number) => {
  const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453;
  return v - Math.floor(v);
};

type Tile = {
  key: string;
  c: number;
  r: number;
  x: number;
  y: number;
  ring: number;
  yours?: { photo: string; slot: number };
  photo?: string;
  tip?: string;
  rot: number;
  fill: number;
  scale: number;
  seed: number;
};

const TILES: Tile[] = [];
for (let r = ROWS[0]; r <= ROWS[1]; r++) {
  for (let c = COLS[0]; c <= COLS[1]; c++) {
    const seed = (c + 40) * 97 + (r + 40);
    const key = `${c},${r}`;
    const yours = YOURS[key];
    const isTip = !yours && rand(seed) < 0.22;
    TILES.push({
      key,
      c,
      r,
      /* odd rows offset half a pitch: reads as a pile, not a spreadsheet */
      x: c * PITCH + (r % 2 === 0 ? 0 : PITCH / 2) + (yours ? 0 : (rand(seed + 7) - 0.5) * 26),
      y: r * PITCH + (yours ? 0 : (rand(seed + 8) - 0.5) * 22),
      ring: Math.max(Math.abs(c), Math.abs(r)),
      yours,
      photo: yours ? yours.photo : isTip ? undefined : PHOTOS[Math.floor(rand(seed + 1) * PHOTOS.length)],
      tip: isTip ? TIPS[Math.floor(rand(seed + 2) * TIPS.length)] : undefined,
      rot: (rand(seed + 3) - 0.5) * 14,
      fill: 0.62 + rand(seed + 4) * 0.14,
      scale: yours ? 1 : 0.84 + rand(seed + 9) * 0.26,
      seed,
    });
  }
}

/* one camera. It opens square on (identity: plane px are frame px) while
   your five sit in their ring round the three lines, then pulls back and
   tilts into the wall as they gather into it, and keeps drifting (never
   parks) until the scene hands off. a = tilt (rotateX), b = roll (rotateZ),
   s = zoom, tx/ty = pan. */
/* the pull back itself was cut (2 Oct 2026, asked for): the ring dissolves,
   and the wall arrives already tilted, building outward round your five */
const CUT = 136;
function camera(f: number) {
  const p = f < CUT ? 0 : 1;
  const drift = interpolate(f, [CUT, 340], [0, 1], clamp);
  return {
    a: 50 * p,
    b: -11 * p - drift * 3,
    s: 1 - 0.02 * p - drift * 0.07 * p,
    tx: -70 * drift * p,
    ty: 70 * p,
  };
}

const rad = (d: number) => (d * Math.PI) / 180;

/* where a plane point lands on screen, and how deep it sits — the same
   transform the browser applies: rotateX, then rotateZ, then 2D scale, then
   translate, then perspective about the frame's centre */
function project(x: number, y: number, cam: ReturnType<typeof camera>) {
  const yr = y * Math.cos(rad(cam.a));
  const z = y * Math.sin(rad(cam.a));
  const xz = x * Math.cos(rad(cam.b)) - yr * Math.sin(rad(cam.b));
  const yz = x * Math.sin(rad(cam.b)) + yr * Math.cos(rad(cam.b));
  const k = PERSP / (PERSP - z);
  return { sx: W / 2 + (xz * cam.s + cam.tx) * k, sy: H / 2 + (yz * cam.s + cam.ty) * k, z, k };
}

/** `questionOut`: when the film continues, the question dissolves here so the next scene can take the row */
export const TooMuch: React.FC = () => {
  const f = useCurrentFrame();
  const cam = camera(f);
  /* the wall dims around your five just before it goes */
  /* the five leave their ring and gather into the wall as it builds */
  const gather = f < CUT ? 0 : 1;
  /* the ring dissolves before the cut; the five come back as tiles of the wall */
  const ringOut = interpolate(f, [116, 134], [0, 1], { ...clamp, easing: EASE_IN });
  const inWall = interpolate(f, [150, 172], [0, 1], { ...clamp, easing: EASE_OUT });
  /* the wall dims around your five, they lift out, the rest falls away,
     and then the five go too as the orb arrives */
  const dimOthers = interpolate(f, [250, 276], [0, 1], { ...clamp, easing: EASE_IN_OUT });
  const exit = interpolate(f, [298, 330], [0, 1], { ...clamp, easing: EASE_IN });
  /* a frosted pool behind the line over the wall, so it reads on the noise */
  const pool = interpolate(f, [176, 206, 250, 272], [0, 1, 1, 0], clamp);
  /* a frosted pool behind the line over the wall, so it reads on the noise */
  

  return (
    <AbsoluteFill style={{ perspective: PERSP, perspectiveOrigin: "50% 50%", overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: W / 2,
          top: H / 2,
          width: 0,
          height: 0,
          transformStyle: "preserve-3d",
          transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s}) rotateZ(${cam.b}deg) rotateX(${cam.a}deg)`,
        }}
      >
        {TILES.map((t) => {
          const yours = t.yours;
          /* where it sits in the plane; your five glide to their row */
          const size = yours ? RING_SIZE + (CELL - RING_SIZE) * gather : CELL;
          const x = yours ? RING[yours.slot].x + (t.x - RING[yours.slot].x) * gather : t.x;
          const y = yours ? RING[yours.slot].y + (t.y - RING[yours.slot].y) * gather : t.y;

          const pr = project(x, y, cam);
          const half = (size / 2) * cam.s * pr.k * 1.5;
          if (pr.sx < -half || pr.sx > W + half || pr.sy < -half || pr.sy > H + half) return null;
          if (PERSP - pr.z < 260) return null;

          /* the pile builds outward, ring by ring, as the camera pulls back */
          const at = yours ? 40 + yours.slot * 3 : CUT + 4 + t.ring * 3 + rand(t.seed + 5) * 10;
          const k = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: EASE_OUT });
          /* the rest falls away: outer tiles first, a calm drop back and down */
          const fallAt = 262 + Math.max(0, 14 - t.ring) * 1.2 + rand(t.seed + 6) * 14;
          const fall = yours ? 0 : interpolate(f, [fallAt, fallAt + 30], [0, 1], { ...clamp, easing: EASE_IN });

          /* depth of field and fog, from the tile's own depth */
          const depth = pr.z;
          const fog = interpolate(-depth, [250, 1500], [1, 0.12], clamp);
          const dof = Math.min(9, Math.abs(depth) / 110) * (yours ? 1 - dimOthers : 1);
          const opacity = k * (yours ? (f < CUT ? 1 - ringOut : inWall) * (1 - exit) : fog * (1 - 0.62 * dimOthers) * (1 - fall));
          /* your five lift out of the pile before it goes */
          const lift = yours ? 1 + 0.32 * dimOthers : t.scale;
          if (opacity < 0.01) return null;

          return (
            <div
              key={t.key}
              style={{
                position: "absolute",
                left: x - size / 2,
                top: y - size / 2,
                width: size,
                height: size,
                borderRadius: size * 0.24,
                background: yours ? `rgba(255,255,255,${0.42 - 0.12 * gather})` : `rgba(244,254,255,${t.fill * 0.55})`,
                border: `1px solid ${C.glassEdge}`,
                boxShadow: yours
                  ? `inset 0 1px 0 ${C.panelRim}, 0 ${28 - 10 * gather}px ${44 - 10 * gather}px -20px rgba(44,69,70,0.38)`
                  : `inset 0 1px 0 ${C.panelRim}, 0 14px 26px -18px rgba(44,69,70,0.3)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity,
                filter: `blur(${(1 - k) * 8 + dof + fall * 6 + exit * 8}px)${yours ? "" : ` grayscale(${0.55 * dimOthers})`}`,
                transform: `translate3d(0, ${fall * 150 + exit * 60}px, ${-fall * 340}px) rotate(${yours ? t.rot * gather * 0.3 : t.rot * 0.3}deg) scale(${(0.86 + 0.14 * k) * lift})`,
              }}
            >
              {t.photo ? (
                <Img
                  src={staticFile(`products/${t.photo}.webp`)}
                  style={{
                    height: size * 0.72,
                    maxWidth: size * 0.72,
                    width: "auto",
                    objectFit: "contain",
                    rotate: `${yours ? 0 : t.rot * 0.6}deg`,
                  }}
                />
              ) : (
                <div
                  style={{
                    fontFamily: FIGTREE,
                    fontWeight: 600,
                    fontSize: 17,
                    lineHeight: 1.12,
                    color: C.primary,
                    textAlign: "center",
                    whiteSpace: "pre",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {t.tip}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 620px 190px at 50% 50%, rgba(226,237,241,0.92), rgba(226,237,241,0.7) 45%, rgba(226,237,241,0) 100%)",
          opacity: pool,
        }}
      />

      {/* the three lines inside the ring, as the first intro drew them */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", paddingTop: 20 }}>
        <Headline text="Your skin flared up" size={62} at={48} out={114} />
        <Headline text="You use five products" size={62} at={62} out={116} />
        <Headline text="**Where** do you start?" size={62} at={76} out={118} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <Headline text="Everyone tells you to **add** more" size={64} at={186} out={262} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

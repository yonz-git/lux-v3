import { Img, staticFile } from "remotion";
import { C } from "../theme";

export type ScreenLayer = { src: string; opacity: number; scroll?: number; height: number; dx?: number; dy?: number };

/* the captures carry 34 css px of the app's own canvas above the page — where
   a real phone's status bar sits — so the gradient runs unbroken to the top */
export const TOP_INSET = 34;

/** the phone's viewport in CSS px — the captures are 390 wide */
export const SCREEN_W = 390;
export const SCREEN_H = 844;
const BEZEL = 12;

/**
 * A minimal phone in the app's own panel glass rather than a photoreal
 * device: a rounded slab, a 12px bezel of glass with its rim highlight, the
 * real captured screen inside, and the real bottom nav pinned over it.
 * `x`/`y` place the phone's top-centre; `scale` maps CSS px to film px.
 */
export const Phone: React.FC<{
  x: number;
  y: number;
  scale: number;
  screens: ScreenLayer[];
  nav?: { src: string; opacity: number }[];
  dim?: number;
  opacity?: number;
  rotate?: number;
}> = ({ x, y, scale, screens, nav = [], dim = 0, opacity = 1, rotate = 0 }) => {
  const w = SCREEN_W * scale;
  const h = SCREEN_H * scale;
  const outerW = w + BEZEL * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: x - outerW / 2,
        top: y,
        width: outerW,
        height: h + BEZEL * 2,
        borderRadius: 54 * scale + BEZEL,
        background: C.glass,
        border: `1px solid ${C.glassEdge}`,
        boxShadow: `inset 0 1px 0 ${C.panelRim}, 0 40px 80px -30px rgba(44, 69, 70, 0.35), 0 12px 30px -12px rgba(44, 69, 70, 0.25)`,
        backdropFilter: "blur(14px)",
        opacity,
        rotate: `${rotate}deg`,
        filter: dim > 0 ? `blur(${dim * 4}px) saturate(${1 - dim * 0.25})` : undefined,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: BEZEL - 1,
          top: BEZEL - 1,
          width: w,
          height: h,
          borderRadius: 54 * scale,
          overflow: "hidden",
          background: "#D3E4E7",
        }}
      >
        {screens.map((sc) =>
          sc.opacity <= 0 ? null : (
            <Img
              key={sc.src}
              src={staticFile(sc.src)}
              style={{
                position: "absolute",
                left: (sc.dx ?? 0) * scale,
                top: (-(sc.scroll ?? 0) + (sc.dy ?? 0)) * scale,
                width: w,
                height: sc.height * scale,
                opacity: sc.opacity,
              }}
            />
          ),
        )}
        {nav.map((n) =>
          n.opacity <= 0 ? null : (
            <Img
              key={n.src}
              src={staticFile(n.src)}
              /* the nav, matted out of the live app over black and white: the
                 full 390-wide strip from y 744 to 842, where the app pins it */
              style={{ position: "absolute", left: 0, top: 744 * scale, width: w, height: 98 * scale, opacity: n.opacity }}
            />
          ),
        )}
        {/* the status bar's own soft scrim — a scrolled page slides under it
            the way it does on a phone, instead of being cut at the top edge */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: w,
            height: 52 * scale,
            background: "linear-gradient(rgba(203, 221, 226, 0.97) 0%, rgba(203, 221, 226, 0.88) 45%, rgba(203, 221, 226, 0) 100%)",
          }}
        />
        {/* the dim washes the screen toward the canvas so a lifted card leads */}
        {dim > 0 && <div style={{ position: "absolute", inset: 0, background: "#D3E4E7", opacity: dim * 0.62 }} />}
      </div>
    </div>
  );
};

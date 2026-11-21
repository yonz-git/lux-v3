import { AbsoluteFill, useCurrentFrame } from "remotion";

/* A soft-focus bathroom shelf drawn in code — window light top-left, a
   sage tiled wall, a counter with bottles on it — then blurred hard so it
   reads as depth of field behind the phone. It drifts a few px over the
   loop and carries film grain, like the reference's shot backgrounds.
   Swap for a real photo by replacing the inner layers with an <Img>. */

export const Backdrop: React.FC<{ loop: number }> = ({ loop }) => {
  const f = useCurrentFrame();
  const t = (f / loop) * Math.PI * 2;
  const drift = `${Math.sin(t) * 10}px ${Math.cos(t) * 6}px`;
  /* grain re-seeds every 2 frames */
  const seed = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ background: "#9fb7b8", overflow: "hidden" }}>
      <AbsoluteFill style={{ filter: "blur(38px) saturate(0.9)", scale: 1.12, translate: drift }}>
        {/* wall: cool sage, warmer toward the window */}
        <AbsoluteFill style={{ background: "linear-gradient(105deg, #e9e2d3 0%, #c9d3cc 30%, #9fb8b9 62%, #6f8f93 100%)" }} />
        {/* window light */}
        <div style={{ position: "absolute", left: -60, top: -80, width: 380, height: 760, background: "#fbf6ea", opacity: 0.9, borderRadius: 30 }} />
        <div style={{ position: "absolute", left: 140, top: -80, width: 22, height: 760, background: "#b9b4a6", opacity: 0.6 }} />
        {/* mirror edge, darker glass down the right */}
        <div style={{ position: "absolute", right: -40, top: -60, width: 300, height: 860, background: "linear-gradient(90deg, #5b7a80, #3f5a60)", opacity: 0.75 }} />
        {/* counter */}
        <div style={{ position: "absolute", left: -60, right: -60, top: 880, height: 400, background: "linear-gradient(#f1ede4, #cfd6d0)" }} />
        <div style={{ position: "absolute", left: -60, right: -60, top: 870, height: 18, background: "#ffffff", opacity: 0.8 }} />
        {/* bottles on the counter */}
        <div style={{ position: "absolute", left: 90, top: 640, width: 110, height: 250, borderRadius: 26, background: "#b5763f" }} />
        <div style={{ position: "absolute", left: 122, top: 580, width: 46, height: 80, borderRadius: 12, background: "#2d2a2a" }} />
        <div style={{ position: "absolute", left: 240, top: 720, width: 150, height: 170, borderRadius: 40, background: "#f4f1ec" }} />
        <div style={{ position: "absolute", left: 870, top: 600, width: 120, height: 290, borderRadius: 30, background: "#e8ecea" }} />
        <div style={{ position: "absolute", left: 912, top: 540, width: 36, height: 70, borderRadius: 8, background: "#c8ccc9" }} />
        <div style={{ position: "absolute", left: 1010, top: 760, width: 170, height: 130, borderRadius: 60, background: "#d9b9a9" }} />
        {/* a leaf of green top-right */}
        <div style={{ position: "absolute", left: 930, top: 40, width: 260, height: 200, borderRadius: "50%", background: "#6e8a5d", opacity: 0.55, rotate: "-20deg" }} />
      </AbsoluteFill>
      {/* lens falloff */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 45%, rgba(20,30,34,0.28) 100%)" }} />
      {/* grain */}
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: 0.35 }}>
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </AbsoluteFill>
  );
};

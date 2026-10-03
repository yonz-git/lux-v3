import { Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Urbanist";

/* lux-v3's one typeface — docs/design.md "Typography" */
export const { fontFamily: URBANIST } = loadFont("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

/* docs/design.md tokens, verbatim */
export const C = {
  ink: "#2E2A3F",
  inkSecondary: "#4B4B57",
  inkMuted: "#63636F",
  primary: "#313560",
  primaryStart: "#485780",
  logoLight: "#587095",
  frostLight: "#F4FEFF",
  bubbleAi: "#DBEDED",
  canvasStart: "#E2EDF1",
  canvasMid: "#D3E4E7",
  canvasEnd: "#B1CAD2",
  panel: "rgba(244, 254, 255, 0.30)",
  panelEdge: "rgba(255, 255, 255, 0.45)",
  panelRim: "rgba(255, 255, 255, 0.60)",
  glass: "rgba(255, 255, 255, 0.25)",
  glassStrong: "rgba(255, 255, 255, 0.40)",
  glassEdge: "rgba(255, 255, 255, 0.55)",
  symptom: "#D3858A",
  shadow: "rgba(44, 69, 70, 0.18)",
} as const;

export const FPS = 30;
export const s = (seconds: number) => Math.round(seconds * FPS);

/* LUX motion: calm, nothing snaps, nothing bounces */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_IN_OUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

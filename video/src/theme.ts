import { Easing } from "remotion";
import { loadFont } from "@remotion/google-fonts/Figtree";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";

/* lux-v3's typefaces (app/layout.tsx): Figtree for text, Manrope for headings
   and card overlines. */
export const { fontFamily: FIGTREE } = loadFont("normal", {
  weights: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});
export const { fontFamily: MANROPE } = loadManrope("normal", {
  weights: ["500", "600", "800"],
  subsets: ["latin"],
});

/* docs/design.md tokens, verbatim. The app sets every text in one ink
   (--color-text-ink), so the secondary and muted inks are that ink too. */
export const C = {
  ink: "#25294A",
  inkSecondary: "#25294A",
  inkMuted: "#25294A",
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
  routine: "#005461",
  /* --color-panel-data: every card, pale sage at 30% */
  card: "rgba(230, 240, 240, 0.30)",
  shadow: "rgba(44, 69, 70, 0.18)",
} as const;

/* A card as the app draws it: no border, --shadow-frosted-row's inner shadow
   (inset 2 4 9, ×k for the scale it is drawn at), and a soft drop shadow so it
   floats over the film's canvas. */
export const cardShadow = (k: number, drop = "0 30px 50px -34px rgba(44, 69, 70, 0.38)") =>
  `inset ${2 * k}px ${4 * k}px ${9 * k}px rgba(0, 0, 0, 0.1), ${drop}`;

/* .t-overline: Manrope ExtraBold, 0.12em tracking, upper case */
export const overline = { fontFamily: MANROPE, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" } as const;

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

import { createContext, useContext } from "react";

type Rect = { x: number; y: number; w: number };

/**
 * Where everything sits, per format. The timeline, copy and motion are shared;
 * only positions differ. SQUARE is the 1080×1080 cut. WIDE is 1920×1080: the
 * captions take a left column, the phone stays on the right for the whole
 * walkthrough, and the cards lift out of it into the left half.
 */
export type Layout = {
  phone: { x: number; y: number; scale: number; dimMax: number };
  caption: { left: number; top: number; width: number };
  face: Rect;
  profile: Rect;
  buckets: Rect;
  axisX: number;
  verdict: Rect;
  evidence: { left: number; top: number };
  cal: Rect;
  trend: Rect;
  /** where the two named products fly in from: off frame right, or out of the phone */
  tilesFrom: "right" | "phone";
  /** square: the phone clears for the analysis; wide: it stays to the end on the check-in */
  phoneToEnd: boolean;
  hookTiles: { x: number; y: number; size: number }[];
  cameraOrigin: string;
  /**
   * WIDE only: each beat's caption and card form one block, centred on
   * (`col`, `mid`) with `gap` between them, from the cards' measured heights.
   */
  stack?: { col: number; mid: number; gap: number };
};

export const SQUARE: Layout = {
  phone: { x: 540, y: 360, scale: 1.36, dimMax: 1 },
  caption: { left: 84, top: 120, width: 912 },
  face: { x: 270, y: 300, w: 540 },
  profile: { x: 260, y: 330, w: 560 },
  buckets: { x: 410, y: 400, w: 500 },
  axisX: 352,
  verdict: { x: 232, y: 340, w: 616 },
  evidence: { left: 540 - (912 * 0.7) / 2, top: 330 },
  cal: { x: 270, y: 390, w: 540 },
  trend: { x: 220, y: 380, w: 640 },
  tilesFrom: "right",
  phoneToEnd: false,
  /* symmetric about the centred type: two pairs at the corners, one on the axis */
  hookTiles: [
    { x: 215, y: 300, size: 164 },
    { x: 540, y: 165, size: 150 },
    { x: 865, y: 300, size: 164 },
    { x: 215, y: 780, size: 164 },
    { x: 865, y: 780, size: 164 },
  ],
  cameraOrigin: "50% 62%",
};

/* WIDE — a two-column grid. Left column 140–1060 (centre 600) holds the
   caption, centred, and under it each card at the column's optical centre
   (y 655, the middle of the space below a two-line caption). The right column
   holds the phone, whole and vertically centred. */
const COL = 600;
const MID = 655;
const at = (w: number, h: number) => ({ x: COL - w / 2, y: MID - h / 2, w });

export const WIDE: Layout = {
  phone: { x: 1420, y: 98, scale: 1.02, dimMax: 0.55 },
  caption: { left: 140, top: 150, width: 920 },
  face: at(470, 470 * (414 / 342)),
  profile: at(560, 300),
  /* the card sits right of centre so the card plus its then/now axis is centred */
  buckets: { x: COL - 250 + 75, y: MID - 535 / 2, w: 500 },
  axisX: COL - 250 + 75 - 58,
  verdict: at(616, 216),
  evidence: { left: COL - (912 * 0.7) / 2, top: MID - 215 },
  cal: at(500, 500 * (382 / 342)),
  trend: at(600, 600 * (328 / 342)),
  tilesFrom: "phone",
  phoneToEnd: true,
  hookTiles: [
    { x: 470, y: 340, size: 168 },
    { x: 960, y: 205, size: 150 },
    { x: 1450, y: 340, size: 168 },
    { x: 470, y: 750, size: 168 },
    { x: 1450, y: 750, size: 168 },
  ],
  cameraOrigin: "50% 50%",
  stack: { col: COL, mid: 540, gap: 56 },
};

const Ctx = createContext<Layout>(SQUARE);
export const LayoutProvider = Ctx.Provider;
export const useLayout = () => useContext(Ctx);

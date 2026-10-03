import { Img, interpolate, staticFile } from "remotion";
import { clamp, EASE_IN_OUT } from "../theme";

export type Rect = { x: number; y: number; w: number };
export type Key = Rect & { f: number; o?: number };

/** interpolate a rect through keyframes, eased in-out between each pair */
export function track(frame: number, keys: Key[]): Rect & { o: number } {
  const fs = keys.map((k) => k.f);
  const at = (pick: (k: Key) => number) =>
    interpolate(frame, fs, keys.map(pick), { ...clamp, easing: EASE_IN_OUT });
  return { x: at((k) => k.x), y: at((k) => k.y), w: at((k) => k.w), o: at((k) => k.o ?? 1) };
}

/**
 * A real cutout of an app card, floating over the film. The panel fill in the
 * capture is translucent (the app's 30% panel), so the wrapper adds the same
 * backdrop blur the app does; `lift` 0..1 deepens the shadow as it rises.
 */
export const Card: React.FC<{
  src: string;
  rect: Rect & { o?: number };
  cssW: number;
  cssH: number;
  radius?: number;
  lift?: number;
  children?: React.ReactNode;
  imgStyle?: React.CSSProperties;
  extra?: { src: string; style: React.CSSProperties }[];
}> = ({ src, rect, cssW, cssH, radius = 24, lift = 1, children, imgStyle, extra = [] }) => {
  const k = rect.w / cssW;
  const h = cssH * k;
  if ((rect.o ?? 1) <= 0) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: h,
        opacity: rect.o ?? 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius * k,
          backdropFilter: "blur(16px)",
          boxShadow: `0 ${10 + 30 * lift}px ${30 + 50 * lift}px -${16 + 10 * lift}px rgba(44, 69, 70, ${0.18 + 0.2 * lift})`,
        }}
      />
      <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...imgStyle }} />
      {extra.map((e) => (
        <Img key={e.src} src={staticFile(e.src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", ...e.style }} />
      ))}
      {children}
    </div>
  );
};

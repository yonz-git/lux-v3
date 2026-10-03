import { interpolate, useCurrentFrame } from "remotion";
import { C, clamp, EASE_IN, EASE_OUT, URBANIST } from "../theme";

type Word = { text: string; bold: boolean; glue: boolean; br: boolean };

/** "Map **where** it shows." → words, with the starred ones bold. A chunk that
    follows a bold run without a space (the full stop in "**against**.") glues
    to it; a "\n" forces a line break. */
function parse(text: string): Word[] {
  const out: Word[] = [];
  let br = false;
  text.split(/(\*\*[^*]+\*\*)/).forEach((chunk) => {
    const bold = chunk.startsWith("**");
    const body = bold ? chunk.slice(2, -2) : chunk;
    const glueFirst = !bold && out.length > 0 && body.length > 0 && !/^\s/.test(body);
    body
      .split(/( +)/)
      .filter((w) => w.trim() || w.includes("\n"))
      .forEach((w, i) => {
        w.split("\n").forEach((part, j) => {
          if (j > 0) br = true;
          if (!part) return;
          out.push({ text: part, bold, glue: glueFirst && i === 0 && j === 0, br });
          br = false;
        });
      });
  });
  return out;
}

/**
 * The lux-v3 `headline` pattern at film size: Urbanist Light in dark ink with
 * the key words Bold in primary. Each word resolves from blur and a short rise
 * (the motionsites reference), 70ms apart; `out` dissolves it the same way.
 */
export const Headline: React.FC<{
  text: string;
  size: number;
  at: number;
  out?: number;
  stagger?: number;
  align?: "left" | "center";
  width?: number;
  lineHeight?: number;
  weight?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ text, size, at, out, stagger = 2, align = "center", width, lineHeight = 1.12, weight = 300, color = C.ink, style }) => {
  const frame = useCurrentFrame();
  const words = parse(text);
  return (
    <div
      style={{
        fontFamily: URBANIST,
        fontSize: size,
        fontWeight: weight,
        lineHeight,
        letterSpacing: "-0.015em",
        color: C.ink,
        textAlign: align,
        width,
        textWrap: "balance",
        ...style,
      }}
    >
      {words.map((w, i) => {
        const start = at + i * stagger;
        const k = interpolate(frame, [start, start + 18], [0, 1], { ...clamp, easing: EASE_OUT });
        const o = out === undefined ? 0 : interpolate(frame, [out + i, out + i + 10], [0, 1], { ...clamp, easing: EASE_IN });
        return (
          <span key={i}>
            {w.br && <br />}
            <span
              style={{
                display: "inline-block",
                opacity: k * (1 - o),
                filter: `blur(${(1 - k) * 14 + o * 10}px)`,
                translate: `0 ${(1 - k) * 0.28 * size - o * 0.12 * size}px`,
                fontWeight: w.bold ? 700 : weight,
                color: w.bold ? C.primary : color,
              }}
            >
              {w.text}
            </span>
            {i < words.length - 1 && !words[i + 1].glue && !words[i + 1].br ? " " : ""}
          </span>
        );
      })}
    </div>
  );
};

/** the overline: tracked caps, SemiBold — `DAY 1 · MAP IT` */
export const Kicker: React.FC<{ text: string; at: number; out?: number; size?: number; style?: React.CSSProperties }> = ({
  text,
  at,
  out,
  size = 30,
  style,
}) => {
  const frame = useCurrentFrame();
  const k = interpolate(frame, [at, at + 16], [0, 1], { ...clamp, easing: EASE_OUT });
  const o = out === undefined ? 0 : interpolate(frame, [out, out + 10], [0, 1], { ...clamp, easing: EASE_IN });
  return (
    <div
      style={{
        fontFamily: URBANIST,
        fontSize: size,
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: C.primary,
        opacity: k * (1 - o),
        translate: `${(1 - k) * -16}px 0`,
        ...style,
      }}
    >
      {text}
    </div>
  );
};

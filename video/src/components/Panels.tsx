import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { C, clamp, EASE_OUT, FIGTREE } from "../theme";
import { Headline } from "./Type";

/**
 * The app's panels redrawn as vectors at film size — same recipe as lux-v3's
 * `panel` (#F4FEFF at 30%, a 45% edge, a 60% rim along the top, 12px blur),
 * same copy as the live screens, but set large enough to read in a feed.
 * Used where a capture would be ~6px text at phone size (the grader's call).
 */
export const Panel: React.FC<{ width: number; children: React.ReactNode; style?: React.CSSProperties; pad?: number }> = ({
  width,
  children,
  style,
  pad = 44,
}) => (
  <div
    style={{
      width,
      boxSizing: "border-box",
      padding: pad,
      borderRadius: 44,
      background: C.panel,
      border: `1.5px solid ${C.panelEdge}`,
      boxShadow: `inset 0 1.5px 0 ${C.panelRim}, 0 40px 70px -34px rgba(44, 69, 70, 0.4)`,
      backdropFilter: "blur(18px)",
      fontFamily: FIGTREE,
      color: C.ink,
      ...style,
    }}
  >
    {children}
  </div>
);

export const Overline: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: C.ink, ...style }}>
    {children}
  </div>
);

const pop = (f: number, at: number) => interpolate(f, [at, at + 16], [0, 1], { ...clamp, easing: EASE_OUT });

/** a read-only answer pill — `glass`, dark ink, or the symptom rose */
const Pill: React.FC<{ text: string; at: number; rose?: boolean; hidden?: boolean }> = ({ text, at, rose, hidden }) => {
  const f = useCurrentFrame();
  const k = hidden ? 0 : pop(f, at);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        height: 68,
        padding: "0 30px",
        borderRadius: 34,
        fontSize: 38,
        fontWeight: 500,
        background: rose ? C.symptom : C.glassStrong,
        color: rose ? "#fff" : C.ink,
        border: `1.5px solid ${rose ? "rgba(255,255,255,0.35)" : C.glassEdge}`,
        boxShadow: "inset 0 1.5px 4px rgba(255,255,255,0.38)",
        opacity: k,
        scale: 0.8 + 0.2 * k,
        translate: `0 ${(1 - k) * -26}px`,
        filter: `blur(${(1 - k) * 6}px)`,
      }}
    >
      {text}
    </span>
  );
};

/** YOUR SKIN PROFILE — every answer arriving as its own pill */
/** `hideSymptoms`: the symptom pills are drawn by the caller instead (chips that fly in and land on these spots) */
export const ProfileCard: React.FC<{ at: number; hideSymptoms?: boolean }> = ({ at, hideSymptoms }) => {
  const rows = [
    { label: "Symptoms", pills: [{ t: "Redness", rose: true }, { t: "Itching", rose: true }] },
    { label: "Skin type", pills: [{ t: "Combination" }] },
    { label: "Tendencies", pills: [{ t: "Sensitive" }] },
    { label: "Known conditions", pills: [{ t: "Rosacea" }] },
  ];
  let n = 0;
  return (
    <Panel width={800}>
      <Overline>Your skin profile</Overline>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "34px 28px", marginTop: 34 }}>
        {rows.map((r) => (
          <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: 14, gridColumn: r.pills.length > 1 ? "1 / -1" : undefined }}>
            <div style={{ fontSize: 32, color: C.inkMuted }}>{r.label}</div>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              {r.pills.map((p) => (
                <Pill key={p.t} text={p.t} rose={"rose" in p && p.rose} hidden={hideSymptoms && r.label === "Symptoms"} at={at + 9 * n++} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
};

/** BEST FIT SO FAR — the analysis's answer, with the two products it names */
export const VerdictCard: React.FC<{ at: number; productsIn?: number }> = ({ at, productsIn = 1 }) => (
  <Panel width={880} pad={48}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Overline>Best fit so far</Overline>
      {/* the slots the two product tiles fly into */}
      <div style={{ display: "flex", gap: 14, opacity: productsIn }}>
        {["products/dropper-green.webp", "products/bottle-milky.webp"].map((src) => (
          <div
            key={src}
            style={{
              width: 92,
              height: 92,
              borderRadius: 24,
              background: C.glass,
              border: `1.5px solid ${C.glassEdge}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Img src={staticFile(src)} style={{ height: 70 }} />
          </div>
        ))}
      </div>
    </div>
    <Headline
      text="**Retinol** with **Salicylic Acid (BHA)**, used in the same period, which may have added up."
      size={54}
      at={at}
      stagger={1}
      align="left"
      lineHeight={1.22}
      style={{ marginTop: 26 }}
    />
  </Panel>
);

/** the hypothesis card's two decisive rows, expanded, with the app's own words */
export const EvidenceCard: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame();
  const rows = [
    {
      tag: "For",
      text: "Both were in your routine when the reaction started, and both entered it around the same time.",
      at: at + 10,
      fill: true,
    },
    { tag: "Against", text: "Whether these were actually layered, or used on different days, is not recorded.", at: at + 30, fill: false },
  ];
  return (
    <Panel width={912} pad={44}>
      <Overline style={{ opacity: pop(f, at) }}>Possible interaction</Overline>
      <div style={{ fontSize: 46, fontWeight: 500, marginTop: 10, opacity: pop(f, at + 4) }}>Retinol with Salicylic Acid (BHA)</div>
      {rows.map((r) => {
        const k = pop(f, r.at);
        return (
          <div key={r.tag} style={{ display: "flex", gap: 26, alignItems: "flex-start", marginTop: 34 }}>
            <span
              style={{
                flex: "none",
                height: 60,
                padding: "0 26px",
                borderRadius: 30,
                display: "inline-flex",
                alignItems: "center",
                fontSize: 36,
                fontWeight: 600,
                background: r.fill ? `linear-gradient(90deg, ${C.primaryStart}, ${C.primary})` : C.glassStrong,
                color: r.fill ? "#fff" : C.primary,
                border: r.fill ? "none" : `2.5px solid ${C.primary}`,
                opacity: k,
                translate: `${(1 - k) * -24}px 0`,
              }}
            >
              {r.tag}
            </span>
            <Headline text={r.text} size={40} at={r.at + 4} stagger={1} align="left" lineHeight={1.3} color={C.inkSecondary} style={{ marginTop: 6 }} />
          </div>
        );
      })}
    </Panel>
  );
};

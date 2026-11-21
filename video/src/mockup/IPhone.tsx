/* A real-looking iPhone (15/16 size: 390 × 844 pt screen) for case-study
   loops. Everything is in screen points × `k`, so the frame stays true to
   the device at any size. Children render inside the screen, clipped to
   its corner radius; the status bar and home indicator sit on top. */

export const SCREEN_W = 390;
export const SCREEN_H = 844;
const SCREEN_R = 47; // the display's own corner radius
const BEZEL = 6; // black glass border around the display
const RIM = 3.5; // titanium band

const UI = '-apple-system, "SF Pro Text", system-ui, sans-serif';

/* titanium: dark with a lit edge top-left and a soft return bottom-right */
const TITANIUM = "linear-gradient(135deg, #8b8a90 0%, #3a3a3e 18%, #222225 50%, #3a3a3e 82%, #77767c 100%)";

const StatusBar: React.FC<{ k: number }> = ({ k }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      height: 54 * k,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: `${4 * k}px ${32 * k}px 0 ${50 * k}px`,
      color: "#1c1c1e",
      fontFamily: UI,
      fontWeight: 600,
      fontSize: 17 * k,
      letterSpacing: -0.4 * k,
    }}
  >
    <span>9:41</span>
    <svg width={74 * k} height={13 * k} viewBox="0 0 74 13" fill="#1c1c1e">
      {/* signal */}
      <rect x="0" y="8" width="3" height="4.5" rx="0.8" />
      <rect x="4.6" y="5.8" width="3" height="6.7" rx="0.8" />
      <rect x="9.2" y="3.4" width="3" height="9.1" rx="0.8" />
      <rect x="13.8" y="1" width="3" height="11.5" rx="0.8" />
      {/* wifi */}
      <path d="M30.5 3.2a10.6 10.6 0 0 1 14.6 0l1.3-1.3a12.4 12.4 0 0 0-17.2 0z" transform="translate(-4 0.6)" />
      <path d="M33.2 5.9a6.8 6.8 0 0 1 9.2 0l1.3-1.3a8.6 8.6 0 0 0-11.8 0z" transform="translate(-4 0.6)" />
      <path d="M37.8 10.6l2.8-2.8a3 3 0 0 0-5.6 0z" transform="translate(-4 0.9)" />
      {/* battery */}
      <rect x="47.5" y="0.75" width="23" height="11.5" rx="3.6" fill="none" stroke="#1c1c1e" strokeOpacity="0.4" strokeWidth="1" />
      <rect x="49.5" y="2.75" width="19" height="7.5" rx="2.2" />
      <path d="M72 4.5v4a2.2 2.2 0 0 0 0-4z" fillOpacity="0.45" />
    </svg>
  </div>
);

export const IPhone: React.FC<{ x: number; y: number; k: number; children: React.ReactNode }> = ({ x, y, k, children }) => {
  const sw = SCREEN_W * k;
  const sh = SCREEN_H * k;
  const edge = (BEZEL + RIM) * k;
  const W = sw + edge * 2;
  const H = sh + edge * 2;
  const btn = (side: "l" | "r", top: number, h: number) => (
    <div
      style={{
        position: "absolute",
        [side === "l" ? "left" : "right"]: -2.2 * k,
        top: top * k,
        width: 3.4 * k,
        height: h * k,
        borderRadius: 1.6 * k,
        background: "linear-gradient(90deg, #2a2a2d, #6e6d73 45%, #2a2a2d)",
      }}
    />
  );
  return (
    <div style={{ position: "absolute", left: x - W / 2, top: y - H / 2, width: W, height: H }}>
      {/* contact shadow + long soft shadow, so the phone sits in the scene */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: (SCREEN_R + BEZEL + RIM) * k,
          boxShadow: `0 ${60 * k}px ${120 * k}px -${30 * k}px rgba(20, 30, 34, 0.45), 0 ${18 * k}px ${36 * k}px -${12 * k}px rgba(20, 30, 34, 0.35)`,
        }}
      />
      {btn("l", 120, 32)}
      {btn("l", 178, 62)}
      {btn("l", 252, 62)}
      {btn("r", 205, 100)}
      {/* titanium band */}
      <div style={{ position: "absolute", inset: 0, borderRadius: (SCREEN_R + BEZEL + RIM) * k, background: TITANIUM }} />
      {/* black glass, with a hairline catch of light on its outer edge */}
      <div
        style={{
          position: "absolute",
          inset: RIM * k,
          borderRadius: (SCREEN_R + BEZEL) * k,
          background: "#050506",
          boxShadow: `inset 0 0 0 ${0.75 * k}px rgba(255, 255, 255, 0.12)`,
        }}
      />
      {/* the display */}
      <div style={{ position: "absolute", left: edge, top: edge, width: sw, height: sh, borderRadius: SCREEN_R * k, overflow: "hidden", background: "#D3E4E7" }}>
        {children}
        <StatusBar k={k} />
        {/* Dynamic Island */}
        <div
          style={{
            position: "absolute",
            left: (SCREEN_W / 2 - 62.5) * k,
            top: 11 * k,
            width: 125 * k,
            height: 37 * k,
            borderRadius: 18.5 * k,
            background: "#000",
          }}
        >
          <div
            style={{
              position: "absolute",
              right: 13 * k,
              top: 12.5 * k,
              width: 12 * k,
              height: 12 * k,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #2b3550 0%, #0b0d14 55%, #000 100%)",
            }}
          />
        </div>
        {/* home indicator */}
        <div style={{ position: "absolute", left: (SCREEN_W / 2 - 67) * k, bottom: 8 * k, width: 134 * k, height: 5 * k, borderRadius: 3 * k, background: "rgba(28, 28, 30, 0.85)" }} />
        {/* glass: a faint sheen across the top-left */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 32%)", pointerEvents: "none" }} />
      </div>
    </div>
  );
};

import { useLayoutEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { EvidenceCard, ProfileCard, VerdictCard } from "./components/Panels";
import { Headline } from "./components/Type";

/* dev-only: renders each vector card and caption at its natural width with
   every entrance finished, and prints its measured height */
const ITEMS: [string, number, React.ReactNode][] = [
  ["profile", 800, <ProfileCard at={-200} />],
  ["verdict", 880, <VerdictCard at={-200} productsIn={0} />],
  ["evidence", 912, <EvidenceCard at={-200} />],
  ["cap1", 920, <Headline text="Tap **where** it shows up." size={59} at={-200} align="center" lineHeight={1.1} />],
  ["cap2", 920, <Headline text="Each answer goes into **your** skin profile." size={59} at={-200} align="center" lineHeight={1.1} />],
  ["cap3", 920, <Headline text="Add what you use, and **when** you started it." size={59} at={-200} align="center" lineHeight={1.1} />],
  ["cap4", 920, <Headline text="LUX points to **what to pause** first." size={59} at={-200} align="center" lineHeight={1.1} />],
  ["cap5", 920, <Headline text="Along with what points **for** it, and **against** it." size={59} at={-200} align="center" lineHeight={1.1} />],
  ["cap6", 920, <Headline text={"Pause one product,\nthen note **what happens**."} size={59} at={-200} align="center" lineHeight={1.1} />],
];

export const Measure: React.FC = () => {
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  const [out, setOut] = useState("");
  const [handle] = useState(() => delayRender("measure"));
  useLayoutEffect(() => {
    document.fonts.ready.then(() => {
      const prof = refs.current[0];
      const pills = prof
        ? [...prof.querySelectorAll("span")]
            .filter((el) => ["Redness", "Itching"].includes(el.textContent ?? ""))
            .map((el) => {
              const a = el.getBoundingClientRect();
              const b = prof.getBoundingClientRect();
              return `${el.textContent}:${Math.round(a.left - b.left)},${Math.round(a.top - b.top)},${Math.round(a.width)}x${Math.round(a.height)}`;
            })
        : [];
      setOut(ITEMS.map(([k], i) => `${k}=${refs.current[i]?.offsetHeight}`).join("  ") + "  " + pills.join("  "));
      continueRender(handle);
    });
  }, [handle]);
  return (
    <AbsoluteFill style={{ background: "#fff" }}>
      {ITEMS.map(([k, w, node], i) => (
        <div key={k} ref={(el) => { refs.current[i] = el; }} style={{ position: "absolute", left: 0, top: 0, width: w, visibility: "hidden" }}>
          {node}
        </div>
      ))}
      <div style={{ position: "absolute", left: 40, top: 40, right: 40, fontSize: 40, fontFamily: "monospace", color: "#000", wordBreak: "break-all" }}>{out}</div>
    </AbsoluteFill>
  );
};

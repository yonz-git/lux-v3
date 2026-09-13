"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import "../themes.css";
import { CanvasShader } from "@/components/layout/CanvasShader";
import { WelcomeStage } from "../DarkWelcomeHarness";

/* ⚠️ PROTOTYPE — the Indigo variant alone, built to be edited through DevTools.

   HOW TO EDIT
   - Colours: select <html> in Elements. The Styles pane shows the rule
     `:root[data-proto-theme="indigo"]` from themes.css with every token this
     variant sets; change a value there and the page follows.
   - One element: each carries a plain `edit-*` class — `edit-orb`,
     `edit-bubble`, `edit-button`, `edit-disclaimer`, `edit-nav`,
     `edit-screen` — to find it by, and element.style takes any property.

   WHY THIS POLLS
   The living canvas reads its five ramp tokens once, when it mounts, so a
   token edited in DevTools would change the CSS fallback gradient but never
   the moving background. Nothing fires an event when a stylesheet is edited in
   DevTools, so this re-reads the five values twice a second and re-keys the
   canvas when any of them changes. */

const RAMP_TOKENS = [
  "--color-bg-progress-track",
  "--color-bg-nav",
  "--color-gradient-canvas-start",
  "--color-gradient-canvas-mid",
  "--color-gradient-canvas-end-mobile",
] as const;

function readRamp() {
  const cs = getComputedStyle(document.documentElement);
  return RAMP_TOKENS.map((t) => cs.getPropertyValue(t).trim()).join(",");
}

export function IndigoEditor() {
  const [ramp, setRamp] = useState<string | null>(null);

  useLayoutEffect(() => {
    document.documentElement.dataset.protoTheme = "indigo";
    setRamp(readRamp());
    return () => {
      delete document.documentElement.dataset.protoTheme;
    };
  }, []);

  useEffect(() => {
    if (ramp === null) return;
    const id = window.setInterval(() => {
      const next = readRamp();
      setRamp((prev) => (prev === next ? prev : next));
    }, 500);
    return () => window.clearInterval(id);
  }, [ramp === null]);

  if (ramp === null) return null;

  return (
    <>
      <CanvasShader key={ramp} variant="film" interactive />
      <WelcomeStage />
    </>
  );
}

"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import "../themes.css";
import { CanvasShader } from "@/components/layout/CanvasShader";
import { WelcomeStage } from "../DarkWelcomeHarness";

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

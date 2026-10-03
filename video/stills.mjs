import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const frames = process.argv.slice(2).map(Number);
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts"), webpackOverride: (c) => c });
const composition = await selectComposition({ serveUrl, id: process.env.COMP ?? "LuxIntro", chromiumOptions: { gl: "angle" } });
for (const frame of frames) {
  try {
    await renderStill({ composition, serveUrl, frame, output: `out/stills/${process.env.COMP ?? "sq"}-f${frame}.png`, chromiumOptions: { gl: "angle" }, scale: Number(process.env.SCALE ?? 0.5) });
    console.log("frame", frame);
  } catch (err) { console.log("FAIL", frame, String(err.message).slice(0, 400)); }
}

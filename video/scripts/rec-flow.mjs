// Record a real app flow, frame by frame, for the case-study iPhone loops
// (src/mockup). Every CSS animation and transition is paused and stepped on
// one virtual clock at 30fps, and scrolls are eased per frame, so the take is
// exact however slow the capture runs.
//
// Needs the app on localhost:3030 and a headless Chrome on port 9333:
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
//     --remote-debugging-port=9333 --user-data-dir=/tmp/cdp --hide-scrollbars about:blank
//   node video/scripts/rec-flow.mjs map        (or products, analysis, track, subtraction, all)
// Frames land in video/public/mockups/<flow>/, taps in video/src/mockup/rec/<flow>.json.
import fs from "node:fs";
import path from "node:path";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const PUBLIC = path.join(HERE, "../public/mockups");
const REC = path.join(HERE, "../src/mockup/rec");

/* The app ships no demo data, so a take that needs a filled-in profile writes
   one to the app's saved answers before the page loads: steps 1–4, the five
   demo products (demo-products.json, copied from the catalogue) and nine
   check-ins over the 15 days before the recording day. `flare` is how many
   days before the recording day step 4's date falls: 8 gives the analysis its
   three explanations, 15 lines the start up with the first check-in. */
const STORAGE_KEY = "lux.answers.v3";
const PRODUCTS = JSON.parse(fs.readFileSync(path.join(HERE, "demo-products.json"), "utf8"));
const DAY = 864e5;
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);
const CHECK_IN_DAYS = [0, 1, 3, 4, 5, 7, 9, 10, 12];
const SEVERITY = [9, 9, 7, 5, 7, 5, 3, 3, 1];
const NOTE = "Patches on cheeks seem slightly less red than yesterday. Still itchy in the evening.";

function seed(flare) {
  const now = Date.now();
  const first = now - 15 * DAY;
  const checkIns = CHECK_IN_DAYS.map((d, i) => {
    const before = i === 0 ? 5 : SEVERITY[i - 1];
    const direction = SEVERITY[i] < before ? "better" : SEVERITY[i] > before ? "worse" : "same";
    const word = direction === "better" ? "Less" : "More";
    return {
      date: iso(first + d * DAY),
      severity: SEVERITY[i],
      direction,
      changes: direction === "same" ? ["No change"] : [`${word} redness`, `${word} itching`],
      photo: "captured",
      ...(d === 3 ? { note: NOTE } : {}),
    };
  });
  return {
    start: { Redness: ["Cheeks (L)", "Cheeks (R)", "Chin / jaw"], Itching: ["Chin / jaw"] },
    "skin-type": "Combination",
    tendencies: ["Sensitive"],
    conditions: ["None"],
    timing: { status: "Ongoing", date: iso(now - flare * DAY) },
    products: PRODUCTS,
    checkIns,
  };
}

/* each flow: the route, the seed's flare day (false for an empty app), a
   scroll to start from, and the take. Steps: hold n · click text [nth] n ·
   scroll y n · scrollTo text offset n. A click's text matches the control's
   own text from its start, so "Long-term products" finds the row with its
   counts after it. */
const FLOWS = {
  map: {
    url: "/investigation/start",
    seed: false,
    scroll: 68,
    take: [
      ["hold", 30],
      ["click", "Redness", 0, 22],
      ["click", "Cheeks (L)", 0, 14],
      ["click", "Cheeks (R)", 0, 14],
      ["click", "Chin / jaw", 0, 22],
      ["click", "Itching", 0, 22],
      ["click", "Chin / jaw", 0, 50],
    ],
  },
  products: {
    url: "/products",
    seed: 8,
    scroll: 0,
    take: [
      ["hold", 30],
      ["click", "Long-term products", 0, 50],
      ["click", "Long-term products", 0, 26],
      ["click", "New addition", 0, 50],
      ["click", "New addition", 0, 26],
      ["hold", 20],
    ],
  },
  analysis: {
    url: "/investigation/analysis",
    seed: 8,
    scroll: 0,
    take: [
      ["hold", 30],
      ["scrollTo", "Salicylic Acid (BHA)", 150, 45],
      ["hold", 12],
      ["click", "Why this may be relevant", 0, 36],
      ["hold", 60],
      ["click", "Why this may be relevant", 0, 26],
      ["scroll", 0, 50],
      ["hold", 12],
    ],
  },
  track: {
    url: "/progress",
    seed: 15,
    scroll: 0,
    take: [
      ["hold", 30],
      ["scrollTo", "Progress", 80, 50],
      ["hold", 70],
      ["scroll", 99999, 45],
      ["hold", 12],
      ["click", "Check in today", 0, 50],
      ["hold", 50],
    ],
  },
  subtraction: {
    url: "/investigation/analysis",
    seed: 8,
    scroll: 230,
    take: [
      ["hold", 30],
      ["click", "Long before", 0, 45],
      ["click", "Long before", 1, 45],
      ["scrollTo", "Ruled out by what you tolerate", 120, 55],
      ["hold", 70],
    ],
  },
};

const names = process.argv[2] === "all" ? Object.keys(FLOWS) : [process.argv[2]];
if (!names[0] || !FLOWS[names[0]]) throw new Error(`flow? one of ${Object.keys(FLOWS).join(", ")}, all`);

const t = await (await fetch("http://127.0.0.1:9333/json/new?about:blank", { method: "PUT" })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const P = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && P.has(m.id)) {
    P.get(m.id)(m);
    P.delete(m.id);
  }
};
const send = (method, params = {}) =>
  new Promise((r) => {
    const i = ++id;
    P.set(i, r);
    ws.send(JSON.stringify({ id: i, method, params }));
  });
const ev = async (x) => {
  const r = await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? x);
  return r.result?.result?.value;
};
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

await send("Page.enable");
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `document.addEventListener("DOMContentLoaded",()=>{const s=document.createElement("style");s.textContent="nextjs-portal{display:none!important} *{caret-color:transparent!important} html{scroll-behavior:auto!important}";document.head.appendChild(s)})`,
});
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

/* the virtual clock: every animation the page has, or gains, is paused and
   set from it — one that appeared since the last frame starts from zero */
const CLOCK = `(()=>{
  window.__vt ??= 0; window.__seen ??= new WeakMap();
  for (const a of document.getAnimations()) {
    let s = window.__seen.get(a);
    if (!s) { a.pause(); s = { base: (a.currentTime ?? 0) < 400 ? 0 : a.currentTime, t0: window.__vt }; window.__seen.set(a, s); }
    try { a.currentTime = s.base + (window.__vt - s.t0); } catch (e) {}
  }
  window.__vt += 1000 / 30; document.body.offsetWidth; return 1;
})()`;

for (const name of names) {
  const flow = FLOWS[name];
  const out = path.join(PUBLIC, name);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });

  await send("Page.navigate", { url: "http://localhost:3030/" });
  await sleep(2000);
  await ev(
    flow.seed === false
      ? `localStorage.removeItem("${STORAGE_KEY}"); 1`
      : `localStorage.setItem("${STORAGE_KEY}", ${JSON.stringify(JSON.stringify(seed(flow.seed)))}); 1`,
  );
  await send("Page.navigate", { url: `http://localhost:3030${flow.url}` });
  for (let i = 0; i < 80; i++) {
    if (await ev(`document.documentElement.hasAttribute("data-store-ready")`)) break;
    await sleep(250);
  }
  await sleep(3500);
  /* 34 css px of the app's own canvas where the status bar sits */
  await ev(`document.documentElement.style.paddingTop='34px'; window.scrollTo(0, ${flow.scroll}); 1`);
  await sleep(800);
  await ev(`document.getAnimations().forEach(a => { try { a.finish(); } catch (e) {} }); 1`);

  let frame = 0;
  const taps = [];
  const shot = async () => {
    await ev(CLOCK);
    const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 90 });
    fs.writeFileSync(`${out}/${String(frame).padStart(3, "0")}.jpg`, Buffer.from(s.result.data, "base64"));
    frame++;
  };
  const find = (txt, nth) =>
    `[...document.querySelectorAll("button,a,[role=radio],[role=checkbox],label,h1,h2,h3")].filter(e=>e.textContent.trim().startsWith(${JSON.stringify(txt)}) && e.getClientRects().length)[${nth}]`;
  const scrollFrames = async (to, n) => {
    const from = await ev(`window.scrollY`);
    const max = await ev(`document.documentElement.scrollHeight - innerHeight`);
    const end = Math.max(0, Math.min(max, to));
    for (let k = 1; k <= n; k++) {
      await ev(`window.scrollTo(0, ${from + (end - from) * ease(k / n)}); 1`);
      await shot();
    }
  };

  for (const [kind, a, b, c] of flow.take) {
    if (kind === "hold") for (let k = 0; k < a; k++) await shot();
    if (kind === "scroll") await scrollFrames(a, b);
    if (kind === "scrollTo") {
      const y = await ev(`(()=>{const e=${find(a, 0)}; if(!e) return null; return e.getBoundingClientRect().top + scrollY})()`);
      if (y == null) throw new Error(`${name}: no "${a}"`);
      await scrollFrames(y - b, c);
    }
    if (kind === "click") {
      const r = await ev(`(()=>{const e=${find(a, b)}; if(!e) return null; const r=e.getBoundingClientRect(); return {x:r.x,y:r.y,w:r.width,h:r.height}})()`);
      if (!r) throw new Error(`${name}: no "${a}" [${b}]`);
      /* the fingertip lands 6 frames before the press, as in the film */
      for (let k = 0; k < 6; k++) await shot();
      taps.push({ frame, ...r });
      await ev(`${find(a, b)}.click(); 1`);
      await sleep(120); // let React commit; the clock does not move meanwhile
      for (let k = 0; k < c; k++) await shot();
    }
  }
  fs.mkdirSync(REC, { recursive: true });
  fs.writeFileSync(path.join(REC, `${name}.json`), JSON.stringify({ frames: frame, taps }, null, 1));
  console.log(name, "frames", frame, "taps", taps.length);
}
await send("Target.closeTarget", { targetId: t.id }).catch(() => {});
ws.close();
process.exit(0);

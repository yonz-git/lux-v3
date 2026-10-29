/**
 * The contrast check — `npm run contrast`.
 *
 * ⚠️ AXE CANNOT DO THIS ON LUX, AND A CLEAN AXE RUN IS NOT EVIDENCE. Every
 * screen sits on the canvas gradient under translucent glass, so axe's
 * `color-contrast` degrades to INCOMPLETE rather than failing. This measures
 * what is actually painted: for every element holding its own text it records
 * the text colour (alpha × every ancestor's opacity), hides ALL text, takes a
 * screenshot, and reads the pixels under that element's text boxes. The
 * contrast is the text colour composited over each pixel against the pixel;
 * the reported figure is the 10th-percentile worst, so a stray border pixel
 * does not fail a label but a gradient that darkens under half a word does.
 *
 * Thresholds are WCAG 1.4.3 (AA): 4.5:1, or 3:1 for large text (24px, or
 * 18.66px at 700). Disabled controls are exempt by the criterion and skipped.
 * Placeholders and text drawn inside an <svg> are not measured.
 *
 * Needs a running server and a Chrome, like `npm run spacing`:
 *
 *   npx next dev -p 3220 &        # BASE must be an origin the dev server allows
 *   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *     --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/lux-cdp &
 *   BASE=http://localhost:3220 npm run contrast
 *
 * No dependencies: Node's own `WebSocket` speaks CDP and `zlib` inflates the PNG.
 */
import { inflateSync } from "node:zlib";

const PORT = process.env.CDP_PORT || 9222;
const BASE = process.env.BASE || "http://localhost:3220";

const ALL_ROUTES = [
  "/",
  "/investigation/start",
  "/investigation/skin-type",
  "/investigation/conditions",
  "/investigation/timing",
  "/investigation/profile",
  "/investigation/products",
  "/investigation/analysis",
  "/products",
  "/progress",
  "/progress/empty",
  "/progress/check-in",
  "/progress/check-in/2026-09-05",
  "/check",
  "/check/no-profile",
  "/check/new",
  "/check/results",
  "/check/history",
];

const ROUTES = process.env.ROUTES ? process.env.ROUTES.split(",") : ALL_ROUTES;

const WIDTHS = (process.env.WIDTHS || "390,1440").split(",").map(Number);

const PROBE = `(() => {
  const out = [];
  const parse = (c) => { const m = c.match(/[\\d.]+/g).map(Number); return [m[0], m[1], m[2], m.length > 3 ? m[3] : 1]; };
  for (const el of document.querySelectorAll("body *")) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim().length > 0);
    if (!own.length || el.closest("svg")) continue;
    if (el.closest(":disabled, [aria-disabled='true'], [inert]")) continue;
    // screen-reader-only text is clipped to 1px and never painted
    if (el.closest(".visually-hidden")) continue;
    const cs = getComputedStyle(el);
    if (cs.visibility === "hidden" || cs.display === "none") continue;
    let op = 1;
    for (let a = el; a; a = a.parentElement) op *= Number(getComputedStyle(a).opacity);
    const [r, g, b, alpha] = parse(cs.color);
    if (alpha * op < 0.05) continue;
    const rects = [];
    for (const n of own) {
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) if (q.width >= 2 && q.height >= 4) rects.push([q.left + scrollX, q.top + scrollY, q.width, q.height]);
    }
    if (!rects.length) continue;
    const size = parseFloat(cs.fontSize), weight = Number(cs.fontWeight);
    out.push({
      fg: [r, g, b, alpha * op],
      large: size >= 24 || (size >= 18.66 && weight >= 700),
      size, weight, rects,
      text: el.textContent.trim().replace(/\\s+/g, " ").slice(0, 50),
      cls: (typeof el.className === "string" ? el.className : "").split(" ").filter(Boolean).slice(0, 2).join(" "),
    });
  }
  return JSON.stringify(out);
})()`;

const HIDE = `* , *::before, *::after { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; caret-color: transparent !important; }`;

/* ── PNG decode (8-bit RGB/RGBA, non-interlaced — what Chrome writes) ────── */
function decodePng(buf) {
  let p = 8, w = 0, h = 0, ct = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), type = buf.toString("ascii", p + 4, p + 8);
    const data = buf.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { w = data.readUInt32BE(0); h = data.readUInt32BE(4); ct = data[9]; }
    else if (type === "IDAT") idat.push(data);
    else if (type === "IEND") break;
    p += 12 + len;
  }
  const bpp = ct === 6 ? 4 : 3, stride = w * bpp;
  const raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, dst = y * stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[dst + x - bpp] : 0, b = y ? px[dst - stride + x] : 0, c = x >= bpp && y ? px[dst - stride + x - bpp] : 0;
      const v = raw[src + x];
      let o;
      if (f === 0) o = v; else if (f === 1) o = v + a; else if (f === 2) o = v + b; else if (f === 3) o = v + ((a + b) >> 1);
      else { const pp = a + b - c, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - c); o = v + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c); }
      px[dst + x] = o & 255;
    }
  }
  return { w, h, bpp, px };
}

const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

async function connect() {
  let target;
  try {
    target = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
  } catch {
    console.error(`contrast: no Chrome listening on ${PORT}. See the header of this file.`);
    process.exit(2);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  });
  const send = (method, params = {}) => new Promise((resolve) => { const n = ++id; pending.set(n, resolve); ws.send(JSON.stringify({ id: n, method, params })); });
  await send("Page.enable");
  await send("Runtime.enable");
  return { ws, send };
}

const evalJs = async (send, expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const { ws, send } = await connect();
const fails = [];
let measured = 0;

for (const width of WIDTHS) {
  for (const route of ROUTES) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await send("Page.navigate", { url: BASE + route });
    let ready = false;
    for (let i = 0; i < 60 && !ready; i++) {
      await wait(250);
      ready = (await evalJs(send, `document.documentElement.hasAttribute("data-store-ready")`)) === true;
    }
    if (!ready) { console.error(`contrast: ${route} @${width} never hydrated — is BASE an allowed origin?`); process.exit(2); }
    await wait(1200);
    // the whole document at once, so fixed chrome and the text under it are measured where they really sit
    const docH = Math.min(8000, await evalJs(send, `document.documentElement.scrollHeight`));
    await send("Emulation.setDeviceMetricsOverride", { width, height: docH, deviceScaleFactor: 1, mobile: false });
    await wait(400);
    await evalJs(send, `document.getAnimations().forEach((a) => { try { a.finish(); } catch {} }); 1`);
    await wait(150);
    const items = JSON.parse(await evalJs(send, PROBE));
    await evalJs(send, `(() => { const s = document.createElement("style"); s.id = "__hide"; s.textContent = ${JSON.stringify(HIDE)}; document.head.appendChild(s); document.getAnimations().forEach((a) => { try { a.finish(); } catch {} }); return 1; })()`);
    await wait(150);
    const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
    const img = decodePng(Buffer.from(shot.result.data, "base64"));
    for (const it of items) {
      const [fr, fg, fb, fa] = it.fg;
      const rs = [];
      for (const [x0, y0, w, h] of it.rects) {
        const stepX = Math.max(1, Math.floor(w / 24)), stepY = Math.max(1, Math.floor(h / 6));
        for (let y = Math.floor(y0 + 1); y < y0 + h - 1; y += stepY) for (let x = Math.floor(x0 + 1); x < x0 + w - 1; x += stepX) {
          if (x < 0 || y < 0 || x >= img.w || y >= img.h) continue;
          const i = y * img.w * img.bpp + x * img.bpp;
          const br = img.px[i], bg = img.px[i + 1], bb = img.px[i + 2];
          const tr = fr * fa + br * (1 - fa), tg = fg * fa + bg * (1 - fa), tb = fb * fa + bb * (1 - fa);
          rs.push(ratio(lum(tr, tg, tb), lum(br, bg, bb)));
        }
      }
      if (!rs.length) continue;
      measured++;
      rs.sort((a, b) => a - b);
      const worst = rs[Math.floor(rs.length * 0.1)];
      const need = it.large ? 3 : 4.5;
      if (worst < need) fails.push({ width, route, worst: worst.toFixed(2), need, size: it.size, weight: it.weight, text: it.text, cls: it.cls, fg: it.fg.map((v, k) => (k < 3 ? Math.round(v) : v.toFixed(2))).join(",") });
    }
  }
}
ws.close();

if (!fails.length) {
  console.log(`contrast: clean — ${measured} text items across ${ROUTES.length} routes x ${WIDTHS.length} widths clear WCAG 1.4.3 AA.`);
  process.exit(0);
}
console.error(`contrast: ${fails.length} of ${measured} text items fall short of WCAG 1.4.3 AA:\n`);
for (const f of fails) console.error(`  ${f.worst}:1 (needs ${f.need})  ${f.route} @${f.width}  ${f.size}px/${f.weight}  rgba(${f.fg})  ${f.cls}\n    ${JSON.stringify(f.text)}`);
process.exit(1);

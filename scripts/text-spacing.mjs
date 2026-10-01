/**
 * The text-spacing check — `npm run spacing`.
 *
 * ⚠️ WCAG 1.4.12 (AA) IS THE ONE SUCCESS CRITERION NOTHING ELSE HERE CAN SEE.
 * A user may override line-height to 1.5×, letter-spacing to 0.12em,
 * word-spacing to 0.16em and paragraph spacing to 2em — and nothing may be lost
 * or clipped when they do. `npm run build`, `tsc` and axe all say nothing about
 * it, because the failure only exists once those overrides are applied to a
 * live layout at a real width. So this drives a real browser and applies them.
 *
 * ⚠️ IT RUNS TWICE AND REPORTS THE DIFFERENCE, WHICH IS THE WHOLE DESIGN. A
 * bare "does anything overflow" pass reports ~80 boxes in this app and every
 * one of them is a false positive: the transparent 44px hit areas
 * (`.tap-target`, `Chip`'s `::after`) are absolutely positioned pseudo-elements
 * that legitimately extend past their box and count toward `scrollHeight`.
 * Only a box that overflows WITH the overrides and not WITHOUT them is a
 * 1.4.12 failure. The baseline pass is what makes the result readable.
 *
 * Reports two kinds:
 *   CLIPPED   the box hides its overflow — text is actually gone
 *   OVERFLOW  the text spills out of its box — it collides with what is beside it
 *
 * ⚠️ IT NEEDS A RUNNING SERVER AND A CHROME, so it is NOT part of the
 * before-you-ship list the way `npm run vocab` is. Run it when a screen's
 * layout changes:
 *
 *   npm run build && npx next start -p 3100 &
 *   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *     --headless=new --remote-debugging-port=9222 --user-data-dir=/tmp/lux-cdp &
 *   npm run spacing
 *
 * `BASE` and `CDP_PORT` override the two addresses. No dependencies: Node's own
 * `WebSocket` speaks CDP.
 */
const PORT = process.env.CDP_PORT || 9222;
const BASE = process.env.BASE || "http://127.0.0.1:3100";

/** every route but the two wait screens, which redirect out from under the probe */
const ROUTES = [
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

/** 320 is the reflow floor (1.4.10); 440 and 1440 are the two comp widths */
const WIDTHS = [320, 440, 1440];

/** the overrides 1.4.12 names, verbatim */
const OVERRIDE = `* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; }
p, li, h1, h2, h3, h4, h5, h6 { margin-bottom: 2em !important; }`;

const PROBE = `(() => {
  const bad = [];
  for (const el of document.querySelectorAll("body *")) {
    // only elements holding text of their own — a wrapper's overflow is its child's story
    const hasText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!hasText) continue;
    // an svg lays its own text out; a visually-hidden string is a 1x1 box on purpose
    if (el.closest("svg")) continue;
    if (typeof el.className === "string" && el.className.includes("visually-hidden")) continue;
    const cs = getComputedStyle(el);
    if (cs.display === "none" || cs.visibility === "hidden") continue;
    const overY = el.scrollHeight - el.clientHeight > 1;
    const overX = el.scrollWidth - el.clientWidth > 1;
    if (!overY && !overX) continue;
    // a scroller is doing its job
    if (/auto|scroll/.test(cs.overflowY) || /auto|scroll/.test(cs.overflowX)) continue;
    const hides = (overY && /hidden|clip/.test(cs.overflowY)) || (overX && /hidden|clip/.test(cs.overflowX));
    bad.push({
      kind: hides ? "CLIPPED" : "OVERFLOW",
      key: el.tagName.toLowerCase() + "|" + (typeof el.className === "string" ? el.className : "") + "|" + el.textContent.trim().slice(0, 30),
      cls: typeof el.className === "string" ? el.className : "",
      text: el.textContent.trim().slice(0, 60),
      box: el.clientWidth + "x" + el.clientHeight,
      content: el.scrollWidth + "x" + el.scrollHeight,
    });
  }
  const doc = document.documentElement;
  return JSON.stringify({ bad, hscroll: doc.scrollWidth - doc.clientWidth > 1 });
})()`;

async function connect() {
  let target;
  try {
    const res = await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" });
    target = await res.json();
  } catch {
    console.error(
      `spacing: no Chrome listening on ${PORT}. Start one with --headless=new --remote-debugging-port=${PORT} (see the header of this file).`
    );
    process.exit(2);
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((r) => ws.addEventListener("open", r));
  let id = 0;
  const pending = new Map();
  ws.addEventListener("message", (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) {
      pending.get(m.id)(m);
      pending.delete(m.id);
    }
  });
  const send = (method, params = {}) =>
    new Promise((resolve) => {
      const n = ++id;
      pending.set(n, resolve);
      ws.send(JSON.stringify({ id: n, method, params }));
    });
  await send("Page.enable");
  await send("Runtime.enable");
  return { ws, send };
}

async function pass(send, applyOverride) {
  const found = [];
  for (const width of WIDTHS) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const route of ROUTES) {
      await send("Page.navigate", { url: BASE + route });
      await new Promise((r) => setTimeout(r, 700));
      /* ⚠️ WAIT FOR THE STORE, OR THE PASS IS EMPTY. Until `data-store-ready`
         lands on <html>, everything in `.screen` but the nav is
         `visibility: hidden` (globals.css), and the probe skips hidden boxes —
         so a page that never hydrates (Next's dev server refuses its scripts
         to an origin it does not allow, e.g. 127.0.0.1 for a localhost
         server) reports CLEAN while checking nothing. Poll, then refuse. */
      let ready = false;
      for (let i = 0; i < 40 && !ready; i++) {
        const r = await send("Runtime.evaluate", {
          expression: `document.documentElement.hasAttribute("data-store-ready")`,
          returnByValue: true,
        });
        ready = r.result?.result?.value === true;
        if (!ready) await new Promise((r) => setTimeout(r, 250));
      }
      if (!ready) {
        console.error(`spacing: ${route} @${width} never hydrated — is BASE an allowed origin?`);
        process.exit(2);
      }
      if (applyOverride) {
        await send("Runtime.evaluate", {
          expression: `(() => { const s = document.createElement("style"); s.textContent = ${JSON.stringify(OVERRIDE)}; document.head.appendChild(s); })()`,
        });
        await new Promise((r) => setTimeout(r, 250));
      }
      const out = await send("Runtime.evaluate", { expression: PROBE, returnByValue: true });
      const value = out.result?.result?.value;
      if (!value) {
        console.error(`spacing: no result for ${route} @${width}`);
        continue;
      }
      const { bad, hscroll } = JSON.parse(value);
      if (hscroll) found.push({ width, route, kind: "HSCROLL", key: "document", cls: "", text: "the page scrolls horizontally", box: "", content: "" });
      for (const b of bad) found.push({ width, route, ...b });
    }
  }
  return found;
}

const { ws, send } = await connect();
const baseline = await pass(send, false);
const widened = await pass(send, true);
ws.close();

const seen = new Set(baseline.map((x) => `${x.width}|${x.route}|${x.key}`));
const caused = widened.filter((x) => !seen.has(`${x.width}|${x.route}|${x.key}`));

if (caused.length === 0) {
  console.log(
    `spacing: clean — ${ROUTES.length} routes x ${WIDTHS.length} widths, nothing clipped or spilled by the WCAG 1.4.12 overrides.`
  );
  process.exit(0);
}

console.error(`spacing: ${caused.length} box${caused.length === 1 ? "" : "es"} lose content under the 1.4.12 overrides:\n`);
for (const x of caused) {
  console.error(`  ${x.kind}  ${x.route} @${x.width}`);
  console.error(`    ${x.cls || x.key}`);
  console.error(`    box ${x.box}, content ${x.content} — ${JSON.stringify(x.text)}\n`);
}
process.exit(1);

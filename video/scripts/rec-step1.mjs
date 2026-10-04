// Record step 1's real face-diagram motion, frame by frame, for Story.tsx:
// the entrance, then two symptoms picked, their places tapped, saved — the
// app's own CSS animations, paused and stepped at 30fps so every frame is exact.
//
// Needs the app on localhost:3030 and a headless Chrome on port 9333:
//   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new \
//     --remote-debugging-port=9333 --user-data-dir=/tmp/cdp --hide-scrollbars about:blank
//   SCROLL=115 node video/scripts/rec-step1.mjs /tmp/face
// then copy /tmp/face/*.jpg to video/public/app/face/ and events.json to
// video/src/faceRec.json.
//
// The coach row (the chat orb and its bubble) is measured, then HIDDEN for
// the take: the film flies its own orb into that place and reveals the
// bubble from video/public/app/face/coach.png. The click sequence and its
// frame counts are what Story.tsx's timings were cut to; change them and the
// film's taps drift.
const fs = await import("node:fs");
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
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
const ev = async (x) => (await send("Runtime.evaluate", { expression: x, returnByValue: true, awaitPromise: true })).result?.result?.value;
const sleep = (ms) => new Promise((x) => setTimeout(x, ms));

await send("Page.enable");
await send("Page.addScriptToEvaluateOnNewDocument", {
  source: `document.addEventListener("DOMContentLoaded",()=>{const s=document.createElement("style");s.textContent="nextjs-portal{display:none!important} nav[class*=BottomNav]{visibility:hidden!important} *{caret-color:transparent!important}";document.head.appendChild(s)})`,
});
await send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await send("Page.navigate", { url: "http://localhost:3030/" });
await sleep(2500);
await ev(`localStorage.removeItem("lux.flow.v2"); true`);
await send("Page.navigate", { url: "http://localhost:3030/investigation/start" });
for (let i = 0; i < 80; i++) {
  if (await ev(`document.documentElement.hasAttribute("data-store-ready")`)) break;
  await sleep(250);
}
await sleep(3500);
const SCROLL = Number(process.env.SCROLL ?? 115);
await ev(`document.documentElement.style.paddingTop='34px'; document.documentElement.style.scrollBehavior='auto'; window.scrollTo(0, ${SCROLL}); 1`);
await sleep(800);

let frame = 0;
const events = [];
const shot = async () => {
  const s = await send("Page.captureScreenshot", { format: "jpeg", quality: 92 });
  fs.writeFileSync(`${OUT}/${String(frame).padStart(3, "0")}.jpg`, Buffer.from(s.result.data, "base64"));
  frame++;
};
/* pause every running animation and transition, then step them together;
   endless ones (the orb's halo) are left to run */
const step = async (n) => {
  await ev(
    `window.__A = document.getAnimations().filter(a => a.effect?.getComputedTiming?.().iterations !== Infinity); window.__A.forEach(a => { a.pause(); a.__base = a.currentTime || 0; }); window.__A.length`,
  );
  for (let k = 0; k < n; k++) {
    await ev(`window.__A.forEach(a => { try { a.currentTime = a.__base + ${k} * (1000/30); } catch(e){} }); document.body.offsetWidth; 1`);
    await shot();
  }
  /* let everything finish for real before the next action */
  await ev(`window.__A.forEach(a => { try { a.finish(); } catch(e){} }); 1`);
  await sleep(250);
};
const rectOf = (expr) =>
  ev(`(()=>{const e=${expr}; if(!e) return null; const b=e.getBoundingClientRect(); return {x:+b.x.toFixed(1),y:+b.y.toFixed(1),w:+b.width.toFixed(1),h:+b.height.toFixed(1)}})()`);
const byText = (txt) => `[...document.querySelectorAll("button,[role=radio],[role=checkbox],label")].find(e=>e.textContent.trim()===${JSON.stringify(txt)})`;
const click = async (txt, frames, label) => {
  const r = await rectOf(byText(txt));
  if (!r) throw new Error(`no ${txt}`);
  events.push({ frame, label, text: txt, rect: r });
  await ev(`${byText(txt)}.click(); 1`);
  await step(frames);
};

/* the coach row: measured, then hidden for the take */
const coach = {
  orb: await rectOf(`document.querySelector("[class*=__coachOrb]")`),
  bubble: await rectOf(`document.querySelector("[class*=__coachBubble]")`),
};
await ev(`(()=>{const s=document.createElement("style");s.textContent="[class*=__coach]{visibility:hidden!important}";document.head.appendChild(s);return 1})()`);
await sleep(300);

/* 1 · the entrance, replayed: the card loses its in-view mark and gets it back */
const face = await rectOf(`document.querySelector("[data-motion=face]")`);
await ev(
  `(()=>{const c=document.querySelector("[data-motion=face]"); c.removeAttribute("data-inview"); c.removeAttribute("data-settled"); void c.offsetWidth; c.setAttribute("data-inview",""); return 1})()`,
);
events.push({ frame, label: "entrance" });
await step(44);
/* 2 · the interaction: two symptoms whose places overlap */
await click("Redness", 24, "symptom");
await click("Cheeks (L)", 12, "place");
await click("Forehead", 12, "place");
await click("Nose", 12, "place");
await click("Cheeks (R)", 12, "place");
await click("Save", 14, "save");
await click("Itching", 24, "symptom");
await click("Cheeks (L)", 12, "place");
await click("Forehead", 12, "place");
await click("Cheeks (R)", 12, "place");
await click("Chin / jaw", 12, "place");
await click("Save", 60, "save");
fs.writeFileSync(`${OUT}/events.json`, JSON.stringify({ scroll: SCROLL, face, coach, frames: frame, events }, null, 1));
console.log("frames", frame, "face", JSON.stringify(face));
await send("Target.closeTarget", { targetId: t.id }).catch(() => {});
ws.close();
process.exit(0);

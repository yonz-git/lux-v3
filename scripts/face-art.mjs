/**
 * The face artwork generator — `npm run face`.
 *
 * THE FACE DIAGRAM'S TWO ASSETS ARE TRACED FROM A FREE HEAD SCAN.
 * `features/my-skin/assets/face-art.svg` (the head as a wireframe) and
 * `face-silhouette.svg` (its outline, the mask for the card's shading) both
 * come out of this file, and nothing else edits them. The source is
 * `assets/source/head-wire.png`, rendered by `scripts/face-source.py` from
 * Lee Perry-Smith's head scan (CC BY 3.0, `assets/source/CREDITS.md`) as a
 * curved grid of light lines on black. ⚠️ UNTIL 4 Oct 2026 THE SOURCE WAS A
 * WIREFRAME HEAD FOUND ON PINTEREST; it was replaced, asked for directly
 * ("just use free images"), and the pipeline below did not change — any
 * light-lines-on-black image works; only the three measured landmarks do.
 *
 * What this does: registers the image to the diagram's frame, thresholds
 * its lines, THINS every stroke to a one-pixel skeleton (Zhang–Suen),
 * chains the skeleton into polylines, prunes the mesh thinning leaves where
 * the glow of neighbouring lines touches, joins ends across small gaps,
 * smooths each line, and writes it as one vector stroke whose opacity is
 * the source's own glow at that point — so the rim glows as it does in the
 * reference. The silhouette is the image's non-background region, found by
 * flooding the black from the corners, cut as an iso-line.
 *
 * ⚠️ REGISTRATION IS BY THE EYES AND THE LIPS. FaceDiagram.tsx seats every
 * region pill on the drawing's landmarks in the 670×980 frame (row r lands
 * at box y = 10 + r·280/830, see `.form` in FaceDiagram.module.css): eyes
 * 382, lips 631, centre x 335. `SOURCE` holds those rows measured on the
 * image; one uniform scale (1.008) maps them. ⚠️ THE SCAN'S MOUTH SITS
 * CLOSER TO ITS EYES, relative to its crown, than the pills' spacing, so at
 * that scale the crown leaves the frame. It is drawn at 0.835 (`ENLARGE`
 * 0.828) and dropped 20 rows (`DROP`), which splits the difference: the
 * eyes land about 20 below their pill, the nose tip on its pill, the lips
 * about 23 above theirs, the crown at the frame top. Every pill still sits
 * on its feature — a pill is ~100 frame rows tall.
 *
 * ⚠️ THE NECK IS DRAWN, NOT TRACED. The image is cut at the chin. The neck
 * and the shoulders come from a SECOND supplied reference — a clean line
 * drawing of a neck (asked for directly: "add the neck part like the image
 * I attached") — measured in units of its own neck width (`NECK_SIDE`: x
 * from the neck's centre, y below the chin) and drawn as clean strokes in
 * the wireframe's stroke width, no mesh, which is what that drawing shows.
 * ⚠️ The reference's collarbones were drawn too, for an hour, and removed —
 * asked for directly ("remove those lines"). The neck is `NECK_HALF` wide each side;
 * each side starts on the traced outline itself, at the lowest row where
 * the jaw is that wide, so it hangs off THIS jaw and not off the frame's
 * centre. The shoulder strokes fade out before the frame's edge (the
 * frame is not widened for them — see `.form` in FaceDiagram.module.css
 * for what its width costs) and end at row ~1012 of 1040. The silhouette
 * takes the neck and the shoulders with it, out to the shoulder strokes,
 * so the card's shading falls down the neck.
 *
 * `--preview <pgm path>` also writes the thinned skeleton as a PGM (P5).
 *
 *   node scripts/face-art.mjs --preview /tmp/face-skeleton.pgm
 *
 * No dependencies: the PNG is decoded with `node:zlib`.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { inflateSync } from "node:zlib";

/* ------------------------------------------------------------------ frame */

const W = 670;
/** 980 until 26 Sep 2026 — 1040 rows so the neck and the shoulders fit under
    an 803-row chin (see the header; 1100 while the collarbones were drawn);
    `.form` in FaceDiagram.module.css scales the box by H/830 and every height
    percentage there by 830/H */
const H = 1040;
/** traced at SS× so the skeleton sits between the image's pixels */
const SS = 2;
/** the pills' landmarks in the frame (FaceDiagram.tsx) */
const FRAME = { eyes: 382, lips: 631, cx: 335 };
/** the same landmarks measured on the source image, in its pixels */
const SOURCE = { eyes: 510, lips: 757, cx: 428, width: 856, height: 976 };
/** ⚠️ drawn 5% larger than the registration gives, about the eye row (asked
    for directly 26 Sep 2026), and dropped `DROP` rows so the crown clears the
    frame top — see the header for where the landmarks land */
const ENLARGE = 0.828;
const DROP = 20;

/* ---------------------------------------------------------------- neck */

/** the neck's half-width in frame px: 0.92 of the lips' width, the ratio in
    the reference line drawing (neck 330 wide over lips 180), on this head's
    traced mouth (~200 wide after the enlargement). ⚠️ 140 since the head
    scan replaced the Pinterest head (4 Oct 2026): this head is drawn about
    three quarters as wide, and at 180 the neck hung off the ears */
const NECK_HALF = 140;
/** the left neck side and shoulder, from the second reference: x from the
    neck's centre and y below the chin, both in neck half-widths (165 px
    there). It runs straight down from the jaw, bows out gently, then sweeps
    into the trapezius; the first point is replaced by where it meets the
    traced outline. Mirrored for the right side. */
const NECK_SIDE = [
  [-1.0, -0.6], [-1.0, 0.12], [-1.01, 0.24], [-1.03, 0.36], [-1.05, 0.48], [-1.1, 0.61], [-1.16, 0.73],
  [-1.28, 0.85], [-1.44, 0.97], [-1.66, 1.09], [-1.82, 1.15], [-2.04, 1.21], [-2.3, 1.27],
];
/** the shoulder stroke fades out between these two distances from the neck's
    centre (half-widths) */
const SHOULDER_FADE = [1.3, 1.9];

/* ---------------------------------------------------------------- tracing */

/** a line is a pixel brighter than its surroundings: at least `CONTRAST`
    above the local background (the image blurred at `BACKGROUND_SIGMA`, in
    SS× px) and at least `FLOOR` bright. The reference's mesh lines on the
    face peak at only 95–140 with the fill under them at 40–100, and its
    brightest lines (the outline, the eyes) at 200+, so no single threshold
    separates them */
const CONTRAST = 10;
const BACKGROUND_SIGMA = 10;
const FLOOR = 66;
/** the blur before the threshold (SS× px): closes the pinholes in a
    stroke's core without joining neighbouring strokes */
const BLUR_SIGMA = 1.2;
/** brightness below which a pixel is ground, for the silhouette */
const GROUND = 55;
/** a branch shorter than this (SS× px) with a free end is a spur */
const SPUR = 16;
/** a piece between two junctions shorter than this is a bar of the mesh
    thinning makes where two glows touch */
const MESH = 12;
/** free ends closer than this, each pointing at the other, are joined */
const JOIN = 14;
/** an isolated fragment shorter than MIN_LEN, or a loop shorter than
    MIN_LOOP, is dropped */
const MIN_LEN = 16;
const MIN_LOOP = 40;
/** the along-the-line Gaussian (SS× px); the ends are held */
const SMOOTH_SIGMA = 2.6;
/** Ramer–Douglas–Peucker tolerance, in SS× px */
const SIMPLIFY = 0.45;
/** stroke in frame units — a hairline at 440 (0.5px) and 1024 (0.6px) */
const STROKE = 1.55;
/** the line's opacity is its glow: brightness at the point mapped through
    this range, then binned */
const GLOW_LO = 0.45;
const GLOW_HI = 1;
const BINS = 6;

/* ------------------------------------------------------------------- PNG */

function readGrayPng(path) {
  const buf = readFileSync(path);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error(`${path}: not a PNG`);
  let pos = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (pos < buf.length) {
    const len = buf.readUInt32BE(pos);
    const type = buf.toString("ascii", pos + 4, pos + 8);
    const data = buf.subarray(pos + 8, pos + 8 + len);
    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 0 || data[12] !== 0) throw new Error(`${path}: need 8-bit grayscale, non-interlaced`);
    } else if (type === "IDAT") idat.push(data);
    pos += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const out = new Uint8Array(width * height);
  const stride = width + 1;
  for (let y = 0; y < height; y++) {
    const filter = raw[y * stride];
    const row = y * width;
    const prev = row - width;
    for (let x = 0; x < width; x++) {
      const v = raw[y * stride + 1 + x];
      const a = x > 0 ? out[row + x - 1] : 0;
      const b = y > 0 ? out[prev + x] : 0;
      const c = x > 0 && y > 0 ? out[prev + x - 1] : 0;
      let p = 0;
      if (filter === 1) p = a;
      else if (filter === 2) p = b;
      else if (filter === 3) p = (a + b) >> 1;
      else if (filter === 4) {
        const q = a + b - c;
        const pa = Math.abs(q - a);
        const pb = Math.abs(q - b);
        const pc = Math.abs(q - c);
        p = pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      } else if (filter !== 0) throw new Error(`${path}: bad filter ${filter}`);
      out[row + x] = (v + p) & 255;
    }
  }
  return { data: out, width, height };
}

/* -------------------------------------------------------------- raster */

/** the source resampled (bilinear) into the SS× frame under the
    registration: frame = scale · (source − source landmark) + frame landmark */
function register(img) {
  const scale = ((FRAME.lips - FRAME.eyes) / (SOURCE.lips - SOURCE.eyes)) * ENLARGE;
  const w = W * SS;
  const h = H * SS;
  const out = new Float32Array(w * h);
  for (let j = 0; j < h; j++) {
    const fy = (j + 0.5) / SS;
    const sy = (fy - FRAME.eyes - DROP) / scale + SOURCE.eyes - 0.5;
    for (let i = 0; i < w; i++) {
      const fx = (i + 0.5) / SS;
      const sx = (fx - FRAME.cx) / scale + SOURCE.cx - 0.5;
      if (sx < 0 || sy < 0 || sx >= img.width - 1 || sy >= img.height - 1) continue;
      const x0 = Math.floor(sx);
      const y0 = Math.floor(sy);
      const tx = sx - x0;
      const ty = sy - y0;
      const p = y0 * img.width + x0;
      const top = img.data[p] * (1 - tx) + img.data[p + 1] * tx;
      const bot = img.data[p + img.width] * (1 - tx) + img.data[p + img.width + 1] * tx;
      out[j * w + i] = top * (1 - ty) + bot * ty;
    }
  }
  return { data: out, w, h, scale };
}

function blur(img, sigma) {
  const r = Math.ceil(sigma * 3);
  const k = [];
  let sum = 0;
  for (let d = -r; d <= r; d++) {
    const v = Math.exp(-(d * d) / (2 * sigma * sigma));
    k.push(v);
    sum += v;
  }
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  const { data, w, h } = img;
  const tmp = new Float32Array(data.length);
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      let acc = 0;
      for (let d = -r; d <= r; d++) acc += data[j * w + Math.min(w - 1, Math.max(0, i + d))] * k[d + r];
      tmp[j * w + i] = acc;
    }
  }
  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      let acc = 0;
      for (let d = -r; d <= r; d++) acc += tmp[Math.min(h - 1, Math.max(0, j + d)) * w + i] * k[d + r];
      data[j * w + i] = acc;
    }
  }
}

/** Zhang–Suen thinning of a binary image, in place */
function thin(bin, w, h) {
  const at = (i, j) => bin[j * w + i];
  let changed = true;
  while (changed) {
    changed = false;
    for (let pass = 0; pass < 2; pass++) {
      const kill = [];
      for (let j = 1; j < h - 1; j++) {
        for (let i = 1; i < w - 1; i++) {
          if (!at(i, j)) continue;
          const p2 = at(i, j - 1);
          const p3 = at(i + 1, j - 1);
          const p4 = at(i + 1, j);
          const p5 = at(i + 1, j + 1);
          const p6 = at(i, j + 1);
          const p7 = at(i - 1, j + 1);
          const p8 = at(i - 1, j);
          const p9 = at(i - 1, j - 1);
          const b = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9;
          if (b < 2 || b > 6) continue;
          const seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2];
          let a = 0;
          for (let k = 0; k < 8; k++) if (!seq[k] && seq[k + 1]) a++;
          if (a !== 1) continue;
          if (pass === 0) {
            if (p2 * p4 * p6 || p4 * p6 * p8) continue;
          } else if (p2 * p4 * p8 || p2 * p6 * p8) continue;
          kill.push(j * w + i);
        }
      }
      for (const k of kill) bin[k] = 0;
      if (kill.length) changed = true;
    }
  }
}

/** chains a 1px skeleton into polylines, split at junctions, with spurs,
    specks and mesh bars dropped. ⚠️ A DIAGONAL NEIGHBOUR ONLY COUNTS WHEN NO
    4-NEIGHBOUR BRIDGES IT — counted naively, a thinned line's corner pixel
    has three neighbours and the trace shatters into stubs. */
function trace(bin, w, h) {
  const N8 = [
    [-1, -1],
    [0, -1],
    [1, -1],
    [-1, 0],
    [1, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
  ];
  const neighbours = (p) => {
    const px = p % w;
    const py = (p - px) / w;
    const out = [];
    for (const [dx, dy] of N8) {
      const n = (py + dy) * w + px + dx;
      if (!bin[n]) continue;
      if (dx !== 0 && dy !== 0 && (bin[py * w + px + dx] || bin[(py + dy) * w + px])) continue;
      out.push(n);
    }
    return out;
  };
  const deg = new Uint8Array(w * h);
  for (let j = 1; j < h - 1; j++) for (let i = 1; i < w - 1; i++) if (bin[j * w + i]) deg[j * w + i] = neighbours(j * w + i).length;
  const used = new Uint8Array(w * h);
  const lines = [];
  const xy = (p) => [p % w, Math.floor(p / w)];
  const walk = (start, first) => {
    const pts = [xy(start)];
    let prev = start;
    let cur = first;
    while (true) {
      pts.push(xy(cur));
      if (deg[cur] !== 2 || used[cur]) break;
      used[cur] = 1;
      const next = neighbours(cur).find((n) => n !== prev);
      if (next === undefined) break;
      if (next === start) {
        pts.push(xy(start));
        break;
      }
      prev = cur;
      cur = next;
    }
    return pts;
  };
  for (let p = 0; p < w * h; p++) {
    if (!bin[p] || deg[p] === 2 || deg[p] === 0) continue;
    for (const n of neighbours(p)) {
      if (used[n]) continue;
      if (deg[n] !== 2) {
        if (n > p && deg[p] <= 2 && deg[n] <= 2) lines.push([xy(p), xy(n)]);
        continue;
      }
      const pts = walk(p, n);
      const last = pts[pts.length - 1];
      const endDeg = deg[last[1] * w + last[0]];
      const l = length(pts);
      const spur = (deg[p] === 1 || endDeg === 1) && deg[p] !== endDeg && l < SPUR;
      const speck = deg[p] === 1 && endDeg === 1 && l < MIN_LEN;
      const bar = deg[p] > 2 && endDeg > 2 && l < MESH;
      if (!spur && !speck && !bar) lines.push(pts);
    }
  }
  for (let p = 0; p < w * h; p++) {
    if (!bin[p] || deg[p] !== 2 || used[p]) continue;
    used[p] = 1;
    const n = neighbours(p)[0];
    if (n === undefined) continue;
    const pts = walk(p, n);
    if (length(pts) >= MIN_LEN) lines.push(pts);
  }
  return lines;
}

function length(pts) {
  let l = 0;
  for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  return l;
}

/** joins open lines end to end across small gaps: two free ends within
    JOIN, each heading toward the other. Greedy, nearest first. */
function join(lines) {
  const ends = [];
  for (let i = 0; i < lines.length; i++) {
    const pts = lines[i];
    const n = pts.length;
    if (n < 2 || (pts[0][0] === pts[n - 1][0] && pts[0][1] === pts[n - 1][1])) continue;
    const dir = (a, b) => {
      const dx = a[0] - b[0];
      const dy = a[1] - b[1];
      const l = Math.hypot(dx, dy) || 1;
      return [dx / l, dy / l];
    };
    const d0 = dir(pts[0], pts[Math.min(5, n - 1)]);
    const d1 = dir(pts[n - 1], pts[Math.max(0, n - 6)]);
    ends.push({ line: i, at: 0, x: pts[0][0], y: pts[0][1], dx: d0[0], dy: d0[1] });
    ends.push({ line: i, at: 1, x: pts[n - 1][0], y: pts[n - 1][1], dx: d1[0], dy: d1[1] });
  }
  const grid = new Map();
  ends.forEach((e, k) => {
    const key = `${Math.floor(e.x / JOIN)},${Math.floor(e.y / JOIN)}`;
    if (!grid.has(key)) grid.set(key, []);
    grid.get(key).push(k);
  });
  const pairs = [];
  ends.forEach((a, ka) => {
    const gx = Math.floor(a.x / JOIN);
    const gy = Math.floor(a.y / JOIN);
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        for (const kb of grid.get(`${gx + ox},${gy + oy}`) ?? []) {
          if (kb <= ka) continue;
          const b = ends[kb];
          if (b.line === a.line) continue;
          const vx = b.x - a.x;
          const vy = b.y - a.y;
          const d = Math.hypot(vx, vy);
          if (d > JOIN || d === 0) continue;
          const fa = (a.dx * vx + a.dy * vy) / d;
          const fb = -(b.dx * vx + b.dy * vy) / d;
          if (fa < 0.35 || fb < 0.35) continue;
          pairs.push({ ka, kb, score: d * (2.2 - fa - fb) });
        }
      }
    }
  });
  pairs.sort((p, q) => p.score - q.score);
  const root = lines.map((_, i) => i);
  const find = (i) => {
    if (root[i] === i) return i;
    root[i] = find(root[i]);
    return root[i];
  };
  const taken = new Uint8Array(ends.length);
  const link = new Map();
  for (const { ka, kb } of pairs) {
    if (taken[ka] || taken[kb]) continue;
    const a = ends[ka];
    const b = ends[kb];
    if (find(a.line) === find(b.line)) continue;
    root[find(a.line)] = find(b.line);
    taken[ka] = taken[kb] = 1;
    link.set(ka, kb);
    link.set(kb, ka);
  }
  const endIndex = new Map();
  ends.forEach((e, k) => {
    endIndex.set(`${e.line}:${e.at}`, k);
  });
  const consumed = new Uint8Array(lines.length);
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (consumed[i]) continue;
    let line = i;
    let at = 0;
    while (true) {
      const k = endIndex.get(`${line}:${at}`);
      const other = k === undefined ? undefined : link.get(k);
      if (other === undefined) break;
      const e = ends[other];
      line = e.line;
      at = e.at === 0 ? 1 : 0;
    }
    const pts = [];
    while (true) {
      consumed[line] = 1;
      const seg = at === 0 ? lines[line] : [...lines[line]].reverse();
      pts.push(...(pts.length ? seg.slice(1) : seg));
      const k = endIndex.get(`${line}:${at === 0 ? 1 : 0}`);
      const other = k === undefined ? undefined : link.get(k);
      if (other === undefined) break;
      const e = ends[other];
      line = e.line;
      at = e.at;
    }
    out.push(pts);
  }
  return out;
}

/** Gaussian smoothing along the line, ends held (a closed line wraps) */
function smooth(pts, sigma) {
  const n = pts.length;
  if (n < 5) return pts;
  const closed = pts[0][0] === pts[n - 1][0] && pts[0][1] === pts[n - 1][1];
  const r = Math.ceil(sigma * 3);
  const k = [];
  for (let d = -r; d <= r; d++) k.push(Math.exp(-(d * d) / (2 * sigma * sigma)));
  const out = [];
  const m = closed ? n - 1 : n;
  for (let i = 0; i < m; i++) {
    let sx = 0;
    let sy = 0;
    let sw = 0;
    for (let d = -r; d <= r; d++) {
      let idx = i + d;
      if (closed) idx = ((idx % m) + m) % m;
      else if (idx < 0 || idx >= m) continue;
      sx += pts[idx][0] * k[d + r];
      sy += pts[idx][1] * k[d + r];
      sw += k[d + r];
    }
    out.push([sx / sw, sy / sw]);
  }
  if (closed) out.push(out[0]);
  else {
    out[0] = pts[0];
    out[n - 1] = pts[n - 1];
  }
  return out;
}

const NONE = -1e4;

/* --------------------------------------------------- marching squares */
/* --------------------------------------------------- marching squares */

/** iso-lines of `field` at `level`, chained into polylines — for the outline */
function contour(field, w, h, level, skipNone = false) {
  const pointOf = new Map();
  const adj = new Map();
  const at = (i, j) => field[j * w + i];
  const lerp = (a, b) => (level - a) / (b - a);
  const link = (e1, e2) => {
    if (!adj.has(e1)) adj.set(e1, []);
    if (!adj.has(e2)) adj.set(e2, []);
    adj.get(e1).push(e2);
    adj.get(e2).push(e1);
  };
  for (let j = 0; j < h - 1; j++) {
    for (let i = 0; i < w - 1; i++) {
      const a = at(i, j);
      const b = at(i + 1, j);
      const c = at(i + 1, j + 1);
      const d = at(i, j + 1);
      // a field cell touching "no surface" would draw the mask's edge at
      // every level; the mesh stops one cell short and the outline is drawn
      // once, on its own
      if (skipNone && (a === NONE || b === NONE || c === NONE || d === NONE)) continue;
      const code = (a > level ? 8 : 0) | (b > level ? 4 : 0) | (c > level ? 2 : 0) | (d > level ? 1 : 0);
      if (code === 0 || code === 15) continue;
      const edge = (id, x, y) => {
        if (!pointOf.has(id)) pointOf.set(id, [x, y]);
        return id;
      };
      const T = () => edge(2 * (j * w + i), i + lerp(a, b), j);
      const B = () => edge(2 * ((j + 1) * w + i), i + lerp(d, c), j + 1);
      const L = () => edge(2 * (j * w + i) + 1, i, j + lerp(a, d));
      const R = () => edge(2 * (j * w + i + 1) + 1, i + 1, j + lerp(b, c));
      const centre = (a + b + c + d) / 4 > level;
      switch (code) {
        case 1:
        case 14:
          link(L(), B());
          break;
        case 2:
        case 13:
          link(B(), R());
          break;
        case 3:
        case 12:
          link(L(), R());
          break;
        case 4:
        case 11:
          link(T(), R());
          break;
        case 6:
        case 9:
          link(T(), B());
          break;
        case 7:
        case 8:
          link(L(), T());
          break;
        case 5:
          if (centre) {
            link(L(), T());
            link(B(), R());
          } else {
            link(L(), B());
            link(T(), R());
          }
          break;
        case 10:
          if (centre) {
            link(T(), R());
            link(L(), B());
          } else {
            link(L(), T());
            link(B(), R());
          }
          break;
      }
    }
  }
  const seen = new Set();
  const lines = [];
  const walk = (start) => {
    const line = [];
    let prev = -1;
    let cur = start;
    while (cur !== undefined && !seen.has(cur)) {
      seen.add(cur);
      line.push(pointOf.get(cur));
      const next = (adj.get(cur) ?? []).find((e) => e !== prev && !seen.has(e));
      prev = cur;
      cur = next;
    }
    if (line.length > 2 && (adj.get(prev) ?? []).includes(start)) line.push(pointOf.get(start));
    return line;
  };
  for (const [e, n] of adj) if (n.length === 1 && !seen.has(e)) lines.push(walk(e));
  for (const e of adj.keys()) if (!seen.has(e)) lines.push(walk(e));
  return lines;
}

function chaikin(pts) {
  if (pts.length < 3) return pts;
  const closed = pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
  const out = closed ? [] : [pts[0]];
  for (let i = 0; i < pts.length - 1; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1];
    out.push([0.75 * ax + 0.25 * bx, 0.75 * ay + 0.25 * by], [0.25 * ax + 0.75 * bx, 0.25 * ay + 0.75 * by]);
  }
  if (closed) out.push(out[0]);
  else out.push(pts[pts.length - 1]);
  return out;
}

function simplify(pts, tol) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = 1;
  keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [s, e] = stack.pop();
    let maxD = 0;
    let idx = -1;
    const [sx, sy] = pts[s];
    const [ex, ey] = pts[e];
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.hypot(dx, dy);
    for (let i = s + 1; i < e; i++) {
      const [px, py] = pts[i];
      const d = len === 0 ? Math.hypot(px - sx, py - sy) : Math.abs(dy * px - dx * py + ex * sy - ey * sx) / len;
      if (d > maxD) {
        maxD = d;
        idx = i;
      }
    }
    if (maxD > tol && idx > 0) {
      keep[idx] = 1;
      stack.push([s, idx], [idx, e]);
    }
  }
  return pts.filter((_, i) => keep[i]);
}

/** a centripetal Catmull–Rom spline through `pts`, sampled every ~`step` */
function spline(pts, step) {
  const out = [];
  const P = [pts[0], ...pts, pts[pts.length - 1]];
  const knot = (a, b, t) => t + Math.hypot(b[0] - a[0], b[1] - a[1]) ** 0.5;
  for (let i = 1; i < P.length - 2; i++) {
    const [p0, p1, p2, p3] = [P[i - 1], P[i], P[i + 1], P[i + 2]];
    const t0 = 0;
    const t1 = knot(p0, p1, t0);
    const t2 = knot(p1, p2, t1);
    const t3 = knot(p2, p3, t2);
    const n = Math.max(2, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step));
    for (let k = 0; k < n; k++) {
      const t = t1 + ((t2 - t1) * k) / n;
      const lerp = (a, b, ta, tb) => (tb === ta ? a : a.map((v, j) => (v * (tb - t) + b[j] * (t - ta)) / (tb - ta)));
      const a1 = lerp(p0, p1, t0, t1);
      const a2 = lerp(p1, p2, t1, t2);
      const a3 = lerp(p2, p3, t2, t3);
      const b1 = lerp(a1, a2, t0, t2);
      const b2 = lerp(a2, a3, t1, t3);
      out.push(lerp(b1, b2, t1, t2));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}

/** cut `pts` into runs of one opacity bin (`binOf(point)`) and push them */
function pushRuns(bins, pts, binOf) {
  let run = [pts[0]];
  let bin = binOf(pts[0]);
  for (let i = 1; i < pts.length; i++) {
    const b = binOf(pts[i]);
    run.push(pts[i]);
    if (b !== bin) {
      bins[bin].push(run);
      run = [pts[i]];
      bin = b;
    }
  }
  if (run.length > 1) bins[bin].push(run);
}

const f1 = (n) => (Math.round(n * 10) / 10).toString();

/** an SVG path `d` in frame units, relative commands, one decimal */
function pathD(pts) {
  let d = `M${f1(pts[0][0] / SS)} ${f1(pts[0][1] / SS)}`;
  let lx = pts[0][0] / SS;
  let ly = pts[0][1] / SS;
  const closed = pts[0][0] === pts[pts.length - 1][0] && pts[0][1] === pts[pts.length - 1][1];
  const end = closed ? pts.length - 1 : pts.length;
  for (let i = 1; i < end; i++) {
    const x = pts[i][0] / SS;
    const y = pts[i][1] / SS;
    const rx = Math.round((x - lx) * 10) / 10;
    const ry = Math.round((y - ly) * 10) / 10;
    d += `l${rx} ${ry}`;
    lx += rx;
    ly += ry;
  }
  if (closed) d += "z";
  return d.replace(/ -/g, "-");
}


/* --------------------------------------------------------------- main */

const args = process.argv.slice(2);
const previewAt = args.includes("--preview") ? args[args.indexOf("--preview") + 1] : null;
const assets = resolve(dirname(new URL(import.meta.url).pathname), "../features/my-skin/assets");

const src = readGrayPng(resolve(assets, "source/head-wire.png"));
if (src.width !== SOURCE.width || src.height !== SOURCE.height) throw new Error(`the source is ${src.width}x${src.height}, not the measured ${SOURCE.width}x${SOURCE.height}`);

console.time("trace");
const img = register(src);
const glow = new Float32Array(img.data); // the unblurred brightness, for the opacity
const background = { data: new Float32Array(img.data), w: img.w, h: img.h };
blur(background, BACKGROUND_SIGMA);
blur(img, BLUR_SIGMA);
const bin = new Uint8Array(img.w * img.h);
for (let p = 0; p < bin.length; p++) bin[p] = img.data[p] >= FLOOR && img.data[p] - background.data[p] >= CONTRAST ? 1 : 0;
thin(bin, img.w, img.h);
if (previewAt) {
  const out = new Uint8Array(bin.length);
  for (let p = 0; p < bin.length; p++) out[p] = bin[p] ? 255 : 0;
  writeFileSync(previewAt, Buffer.concat([Buffer.from(`P5\n${img.w} ${img.h}\n255\n`), Buffer.from(out)]));
}
const traced = join(trace(bin, img.w, img.h)).filter((pts) => {
  const l = length(pts);
  const n = pts.length;
  const closed = pts[0][0] === pts[n - 1][0] && pts[0][1] === pts[n - 1][1];
  return closed ? l >= MIN_LOOP : l >= MIN_LEN;
});
console.timeEnd("trace");

// the silhouette: the ground flooded from the corners; what it never reaches
// is the head. Cut at half on a padded field so the loop always closes.
const ground = new Uint8Array(img.w * img.h);
for (let p = 0; p < ground.length; p++) ground[p] = img.data[p] < GROUND ? 1 : 0;
const reached = new Uint8Array(img.w * img.h);
const stack = [0, img.w - 1, (img.h - 1) * img.w, img.h * img.w - 1];
while (stack.length) {
  const p = stack.pop();
  if (reached[p] || !ground[p]) continue;
  reached[p] = 1;
  const x = p % img.w;
  if (x > 0) stack.push(p - 1);
  if (x < img.w - 1) stack.push(p + 1);
  if (p >= img.w) stack.push(p - img.w);
  if (p < (img.h - 1) * img.w) stack.push(p + img.w);
}
// the neck hangs off the traced jaw: the chin is the head's lowest row, and
// each side starts on the outline at the lowest row where the jaw is a neck
// wide. Everything below is in SS units.
const rowSpan = (j) => {
  let l = -1;
  let r = -1;
  for (let i = 0; i < img.w; i++) {
    if (reached[j * img.w + i]) continue;
    if (l < 0) l = i;
    r = i;
  }
  return [l, r];
};
let chin = img.h - 1;
while (chin > 0 && rowSpan(chin)[0] < 0) chin--;
let emerge = chin;
let span = rowSpan(emerge);
while (emerge > 0 && span[1] - span[0] < 2 * NECK_HALF * SS) span = rowSpan(--emerge);
const neckCx = (span[0] + span[1]) / 2;
const nw = NECK_HALF * SS;
const neckPt = ([x, y], side) => [neckCx + side * x * nw, chin + y * nw];
// `NECK_SIDE` is the LEFT side (x < 0), so side 1 is left and -1 the mirror
const sides = [1, -1].map((side) => {
  const first = [-1, (emerge - chin) / nw];
  const pts = spline([first, ...NECK_SIDE.filter(([, y]) => y > first[1] + 0.1)].map((p) => neckPt(p, side)), 2 * SS);
  return pts.filter(([x]) => x >= 2 * SS && x <= (W - 2) * SS);
});

const pw = img.w + 2;
const ph = img.h + 2;
const padded = new Float32Array(pw * ph);
for (let j = 0; j < img.h; j++) for (let i = 0; i < img.w; i++) padded[(j + 1) * pw + i + 1] = reached[j * img.w + i] ? 0 : 1;
const cut = (field) =>
  contour(field, pw, ph, 0.5)
    .map((pts) => pts.map(([x, y]) => [x - 1, y - 1]))
    .map((pts) => simplify(chaikin(chaikin(smooth(pts, 2))), SIMPLIFY))
    .filter((p) => p.length >= 6 && length(p) > 200);
// the head's outline, drawn as a line below — cut BEFORE the neck column is
// painted in, or the column's edges are drawn too (they were, for an hour)
const outline = cut(padded);
// the neck joins the SILHOUETTE only: everything between the two neck sides,
// out to the shoulder strokes, from where they leave the jaw to the shoulder's
// end (the card's fade has removed it before then). ⚠️ It follows the
// shoulder curve rather than stopping at a straight edge — a column clamped
// at the shoulder's start put a vertical edge across the curve, and it was
// asked to be smoothed.
{
  const edge = (pts, j) => {
    for (let k = 1; k < pts.length; k++) {
      const [x0, y0] = pts[k - 1];
      const [x1, y1] = pts[k];
      if (j >= y0 && j <= y1) return y1 === y0 ? x0 : x0 + ((x1 - x0) * (j - y0)) / (y1 - y0);
    }
    return pts[pts.length - 1][0];
  };
  const bottom = Math.min(img.h - 1, Math.round(chin + NECK_SIDE[NECK_SIDE.length - 1][1] * nw));
  for (let j = emerge; j <= bottom; j++) {
    const l = edge(sides[0], j);
    const r = edge(sides[1], j);
    for (let i = Math.max(0, Math.round(l)); i <= Math.min(img.w - 1, Math.round(r)); i++) padded[(j + 1) * pw + i + 1] = 1;
  }
}
const silhouette = cut(padded);

// opacity from the source's glow, in bins; a line is cut into runs by bin
const bins = Array.from({ length: BINS }, () => []);
const binAt = (x, y) => {
  const i = Math.min(img.w - 1, Math.max(0, Math.round(x)));
  const j = Math.min(img.h - 1, Math.max(0, Math.round(y)));
  const g = Math.min(1, Math.max(0, (glow[j * img.w + i] - FLOOR) / (255 - FLOOR)));
  const b = GLOW_LO + (GLOW_HI - GLOW_LO) * g;
  return Math.min(BINS - 1, Math.floor(b * BINS));
};
for (const raw of traced) {
  const pts = simplify(chaikin(smooth(raw, SMOOTH_SIGMA)), SIMPLIFY);
  if (pts.length < 2) continue;
  pushRuns(bins, pts, ([x, y]) => binAt(x, y));
}

// the outline is drawn too, in the brightest bin: the reference's rim is a
// wide glow that the contrast rule only catches in pieces
for (const o of outline) bins[BINS - 1].push(o);

// the neck: the brightest bin, the shoulders tapering to nothing before the
// frame's edge
const binOfOpacity = (o) => Math.min(BINS - 1, Math.max(0, Math.floor(o * BINS)));
const clamp01 = (v) => Math.min(1, Math.max(0, v));
for (const pts of sides) {
  pushRuns(bins, simplify(pts, SIMPLIFY), ([x]) => {
    const out = Math.abs(x - neckCx) / nw;
    return binOfOpacity(clamp01((SHOULDER_FADE[1] - out) / (SHOULDER_FADE[1] - SHOULDER_FADE[0])));
  });
}

const svgHead = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
const linePaths = bins
  .map((runs, k) => (runs.length ? `<path opacity="${((k + 0.5) / BINS).toFixed(3)}" d="${runs.map(pathD).join("")}"/>` : ""))
  .filter(Boolean);
const artSvg =
  `${svgHead}\n<!-- generated by scripts/face-art.mjs — do not edit by hand -->\n` +
  `<g fill="none" stroke="#fff" stroke-width="${STROKE}" stroke-linecap="round" stroke-linejoin="round">\n${linePaths.join("\n")}\n</g>\n</svg>\n`;
const silhouetteSvg =
  `${svgHead}\n<!-- generated by scripts/face-art.mjs — do not edit by hand -->\n` +
  `<path fill="#fff" fill-rule="evenodd" d="${silhouette.map(pathD).join(" ")}"/>\n</svg>\n`;
writeFileSync(resolve(assets, "face-art.svg"), artSvg);
writeFileSync(resolve(assets, "face-silhouette.svg"), silhouetteSvg);
console.log(
  `registered at ${img.scale.toFixed(3)}, chin ${(chin / SS).toFixed(0)}, neck from ${(emerge / SS).toFixed(0)} at x ${(neckCx / SS).toFixed(0)}, shoulders to ${(Math.max(...sides.flat().map((p) => p[1])) / SS).toFixed(0)}; wrote ${traced.length} lines in ${linePaths.length} bins (${(artSvg.length / 1024).toFixed(0)} KB), silhouette ${silhouette.length} paths (${(silhouetteSvg.length / 1024).toFixed(0)} KB)`,
);

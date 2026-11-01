"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "@/components/ui/Chip";
import { IconButton } from "@/components/ui/IconButton";
import { SmallButton } from "@/components/ui/SmallButton";
import { CloseSmallIcon } from "@/components/ui/icons";
import styles from "./Tweak.module.css";

/**
 * Tweak — step 1 (`/investigation/start`) in a frame, with a panel for tuning
 * it by hand. Asked for directly 1 Nov 2026 ("make me tweak page for this …
 * that i can control all of the elements manually").
 *
 *   Element  pick anything on the screen (or a component from the list) and
 *            edit its box, layout, type and look.
 *   Tokens   every custom property on `:root`, edited for the whole screen.
 *   Export   the changes as CSS, to hand back so they land in the real
 *            modules and tokens. Nothing here edits the source.
 *
 * ⚠️ REBUILT THE SAME DAY, asked for directly ("its still in px", "when i
 * reduce … a width the element is not centered anymore", "elements sharing
 * one component should be bined together"):
 *   - A value shows as AUTHORED — `var(--space-lg)`, `clamp(…)`, a ratio —
 *     read from the stylesheet rule that wins for the element; only when no
 *     rule sets it does the computed value show, in rem. ↑/↓ steps a token
 *     along its own scale (`--space-md` → `--space-lg`), a rem by 0.25 (Shift
 *     1), a px by 1 (Shift 10), a ratio by 0.05.
 *   - A change targets the COMPONENT by default: every element carrying the
 *     same module classes (all eight symptom chips at once). `Only this one`
 *     narrows it to the picked element.
 *   - A change holds at `All widths` or `From 1024`, the app's one
 *     breakpoint. Changes are a stylesheet injected into the framed page, so
 *     the breakpoint is real and switching the frame width shows it.
 *   - Narrowing a block's width or max-width in a column also sets its side
 *     margins to `auto`, so it stays centred instead of sliding left.
 *
 * Changes are kept in this browser (localStorage) until reset.
 */

const SRC = "/investigation/start";
const WIDTHS = [375, 430, 768, 1024, 1440] as const;
const STORE = "lux.tweak.v2";
const DESKTOP = "(min-width: 1024px)";

const GROUPS: { name: string; props: string[] }[] = [
  {
    name: "Box",
    props: [
      "width", "min-width", "max-width", "height", "min-height", "max-height",
      "padding-top", "padding-right", "padding-bottom", "padding-left",
      "margin-top", "margin-right", "margin-bottom", "margin-left", "gap",
    ],
  },
  {
    name: "Layout",
    props: [
      "display", "flex-direction", "flex-wrap", "align-items", "justify-content",
      "align-self", "position", "top", "left",
    ],
  },
  {
    name: "Type",
    props: [
      "font-size", "line-height", "font-weight", "letter-spacing", "color",
      "text-align", "text-transform",
    ],
  },
  {
    name: "Look",
    props: [
      "background-color", "background-image", "opacity", "border-width",
      "border-style", "border-color", "border-radius", "box-shadow",
      "backdrop-filter",
    ],
  },
];

const KEYWORDS: Record<string, string[]> = {
  display: ["block", "inline-block", "flex", "inline-flex", "grid", "none", "contents"],
  "flex-direction": ["row", "column", "row-reverse", "column-reverse"],
  "flex-wrap": ["nowrap", "wrap"],
  "align-items": ["stretch", "flex-start", "center", "flex-end", "baseline"],
  "justify-content": ["flex-start", "center", "flex-end", "space-between", "space-around"],
  "align-self": ["auto", "stretch", "flex-start", "center", "flex-end"],
  position: ["static", "relative", "absolute", "sticky"],
  "text-align": ["left", "center", "right"],
  "text-transform": ["none", "uppercase", "lowercase", "capitalize"],
  "font-weight": ["400", "500", "600", "700"],
  "border-style": ["none", "solid", "dashed"],
};

const COLOR_PROPS = new Set(["color", "background-color", "border-color"]);
/* sizes are rem in this app (AGENTS: "Sizes are rem"); borders, shadows and
   blur stay px, so their computed fallback is left alone */
const PX_PROPS = new Set(["border-width", "box-shadow", "backdrop-filter"]);

type Scope = "all" | "desktop";
type Rule = { selector: string; label: string; scope: Scope; props: Record<string, string> };
type Changes = Record<string, Rule>;
type Saved = { changes: Changes; tokens: Record<string, string>; width: number };

const keyOf = (scope: Scope, selector: string) => `${scope}::${selector}`;

/* `StartInvestigation-module__jCy4gW__chips` → `StartInvestigation.chips` */
const MODULE_CLASS = /^(\w+)-module__\w+__(\w+)$/;
const moduleClasses = (el: Element) => [...el.classList].filter((c) => MODULE_CLASS.test(c));

function componentLabel(classes: string[]) {
  const [first, ...rest] = classes.map((c) => c.match(MODULE_CLASS)!);
  return [`${first[1]}.${first[2]}`, ...rest.map((m) => m[2])].join(".");
}

function labelFor(el: Element) {
  const mods = moduleClasses(el);
  if (mods.length) return componentLabel(mods);
  const text = el.textContent?.trim().replace(/\s+/g, " ").slice(0, 24);
  return `${el.tagName.toLowerCase()}${text ? ` “${text}”` : ""}`;
}

/* the shortest path that still finds this one element: climbs until a module
   class makes it unique, with `:nth-of-type` wherever siblings share a tag */
function pathFor(el: Element, doc: Document) {
  const parts: string[] = [];
  let cur: Element | null = el;
  while (cur && cur !== doc.documentElement) {
    const mod = moduleClasses(cur)[0];
    let part = cur.tagName.toLowerCase() + (mod ? `.${CSS.escape(mod)}` : "");
    const parent: Element | null = cur.parentElement;
    if (parent) {
      const tag = cur.tagName;
      const same = [...parent.children].filter((s) => s.tagName === tag);
      if (same.length > 1) part += `:nth-of-type(${same.indexOf(cur) + 1})`;
    }
    parts.unshift(part);
    const sel = parts.join(" > ");
    if (mod && doc.querySelectorAll(sel).length === 1) return sel;
    cur = parent;
  }
  return parts.join(" > ");
}

/* the nearest ancestor that carries a module class — the place a component
   sits in */
function contextOf(el: Element) {
  let cur = el.parentElement;
  while (cur && !moduleClasses(cur).length) cur = cur.parentElement;
  return cur;
}

/* every element that shares this one's module classes AND sits in the same
   place: the component, in this variant, here. ⚠️ THE PLACE IS PART OF IT —
   1 Nov 2026, asked for directly: grouping by the classes alone bound the
   face's `Whole face` / `Neck` / `Other` to the symptom chips, because they
   are all `Chip`s. */
function componentSelector(el: Element) {
  const own = moduleClasses(el).map((c) => `.${CSS.escape(c)}`).join("");
  if (!own) return null;
  const ctx = contextOf(el);
  const at = ctx ? `.${CSS.escape(moduleClasses(ctx)[0])} ` : "";
  return `${at}${own}`;
}

function componentName(el: Element) {
  const ctx = contextOf(el);
  const name = componentLabel(moduleClasses(el));
  return ctx ? `${name} in ${componentLabel(moduleClasses(ctx).slice(0, 1))}` : name;
}

/* ---- reading the authored value ------------------------------------------ */

type FlatRule = { selector: string; style: CSSStyleDeclaration; media: string[]; order: number };

/* every style rule in the frame, with the media it sits in. Duck-typed, not
   `instanceof`: the rules belong to the frame's window, not this one. */
function flattenRules(doc: Document) {
  const out: FlatRule[] = [];
  const walk = (rules: CSSRuleList, media: string[]) => {
    for (const rule of rules) {
      const style = rule as CSSStyleRule;
      if (typeof style.selectorText === "string" && style.style) {
        out.push({ selector: style.selectorText, style: style.style, media, order: out.length });
      } else if ("cssRules" in rule && (rule as CSSGroupingRule).cssRules) {
        const cond = (rule as CSSMediaRule).conditionText;
        walk((rule as CSSGroupingRule).cssRules, cond && "media" in rule ? [...media, cond] : media);
      }
    }
  };
  for (const sheet of doc.styleSheets) {
    if ((sheet.ownerNode as HTMLElement | null)?.dataset?.tweak) continue;
    try {
      walk(sheet.cssRules, []);
    } catch {
      /* a cross-origin sheet (fonts) cannot be read */
    }
  }
  return out;
}

function specificity(selector: string) {
  const s = selector.replace(/::?(before|after|placeholder|selection|marker)\b.*/g, "");
  const a = (s.match(/#[\w-]+/g) ?? []).length;
  const b = (s.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) ?? []).length;
  const c = (s.match(/(^|[\s>+~(])[a-z][\w-]*/gi) ?? []).length;
  return a * 10000 + b * 100 + c;
}

/* the rules that apply to this element at the frame's current width, each
   with the specificity of its best-matching selector */
function matchingRules(el: Element, rules: FlatRule[], win: Window) {
  const out: (FlatRule & { spec: number })[] = [];
  for (const r of rules) {
    if (!r.media.every((m) => win.matchMedia(m).matches)) continue;
    let best = -1;
    for (const part of r.selector.split(",")) {
      try {
        if (el.matches(part)) best = Math.max(best, specificity(part));
      } catch {
        /* a pseudo-element selector cannot match an element */
      }
    }
    if (best >= 0) out.push({ ...r, spec: best });
  }
  return out;
}

function authored(prop: string, rules: (FlatRule & { spec: number })[]) {
  let win: { v: string; imp: boolean; spec: number; order: number } | null = null;
  for (const r of rules) {
    const v = r.style.getPropertyValue(prop).trim();
    /* a longhand a shorthand left unset reads `initial`: not a written value */
    if (!v || v === "initial") continue;
    const cand = { v, imp: r.style.getPropertyPriority(prop) === "important", spec: r.spec, order: r.order };
    if (
      !win ||
      (cand.imp && !win.imp) ||
      (cand.imp === win.imp &&
        (cand.spec > win.spec || (cand.spec === win.spec && cand.order > win.order)))
    ) {
      win = cand;
    }
  }
  return win?.v ?? null;
}

const toRem = (value: string) =>
  value.replace(/(-?\d*\.?\d+)px/g, (_, n) => `${Math.round((parseFloat(n) / 16) * 10000) / 10000}rem`);

/* ---- stepping ------------------------------------------------------------ */

function stepValue(value: string, dir: 1 | -1, big: boolean, scaleOf: (name: string) => string[]) {
  const v = value.trim();
  const token = v.match(/^var\((--[\w-]+)\)$/);
  if (token) {
    const scale = scaleOf(token[1]);
    const i = scale.indexOf(token[1]);
    const next = scale[Math.min(scale.length - 1, Math.max(0, i + dir))];
    return next ? `var(${next})` : null;
  }
  const m = v.match(/^(-?\d*\.?\d+)([a-z%]*)$/);
  if (!m) return null;
  const unit = m[2];
  const by = unit === "rem" || unit === "em" ? (big ? 1 : 0.25) : unit === "" && parseFloat(m[1]) < 5 ? (big ? 0.25 : 0.05) : big ? 10 : 1;
  const next = Math.round((parseFloat(m[1]) + dir * by) * 1000) / 1000;
  return `${next}${unit}`;
}

function toHex(value: string) {
  const hex = value.trim().match(/^#[0-9a-f]{6}/i);
  if (hex) return hex[0];
  const m = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return "#000000";
  return `#${m.slice(1, 4).map((n) => Number(n).toString(16).padStart(2, "0")).join("")}`;
}

/* ---- the CSS the panel writes -------------------------------------------- */

function buildCss(changes: Changes, tokens: Record<string, string>, important: boolean) {
  const bang = important ? " !important" : "";
  const block = (sel: string, props: Record<string, string>, indent = "") =>
    `${indent}${sel} {\n${Object.entries(props).map(([p, v]) => `${indent}  ${p}: ${v}${bang};`).join("\n")}\n${indent}}`;
  const out: string[] = [];
  if (Object.keys(tokens).length) {
    out.push(`${important ? "" : "/* tokens — app/tokens.css */\n"}${block(":root", tokens)}`);
  }
  const rules = Object.values(changes);
  for (const r of rules.filter((r) => r.scope === "all")) {
    out.push(`${important ? "" : `/* ${r.label} */\n`}${block(r.selector, r.props)}`);
  }
  const desk = rules.filter((r) => r.scope === "desktop");
  if (desk.length) {
    out.push(
      `@media ${DESKTOP} {\n${desk
        .map((r) => `${important ? "" : `  /* ${r.label} */\n`}${block(r.selector, r.props, "  ")}`)
        .join("\n\n")}\n}`,
    );
  }
  return out.join("\n\n");
}

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORE);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

/* ========================================================================== */

export function Tweak() {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<Element | null>(null);
  const hoverRef = useRef<Element | null>(null);
  const targetSelRef = useRef<string | null>(null);
  const rulesRef = useRef<FlatRule[]>([]);
  const wired = useRef(new WeakSet<Document>());

  const [width, setWidth] = useState<number>(430);
  const [stage, setStage] = useState({ w: 0, h: 0 });
  const [tab, setTab] = useState<"element" | "tokens" | "export">("element");
  const [picking, setPicking] = useState(false);
  const [picked, setPicked] = useState(0); // bumps on every pick
  const [only, setOnly] = useState(false);
  const [scope, setScope] = useState<Scope>("all");
  const [changes, setChanges] = useState<Changes>({});
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [tokenNames, setTokenNames] = useState<string[]>([]);
  const [components, setComponents] = useState<{ sel: string; label: string; count: number }[]>([]);
  const [filter, setFilter] = useState("");
  const [tick, setTick] = useState(0);
  const [copied, setCopied] = useState(false);

  const doc = () => frameRef.current?.contentDocument ?? null;
  const win = () => frameRef.current?.contentWindow ?? null;

  /* restore, then keep — and keep nothing until the restore has run, or the
     first render's empty state would be written over what was saved */
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    const saved = load();
    if (saved) {
      setChanges(saved.changes ?? {});
      setTokens(saved.tokens ?? {});
      if (saved.width) setWidth(saved.width);
    }
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(STORE, JSON.stringify({ changes, tokens, width }));
    } catch {
      /* private window: the tweaks just do not survive a reload */
    }
  }, [restored, changes, tokens, width]);

  /* the frame scales down to fit the stage, never up. The stage only changes
     size with the window (the panel is fixed), so a resize listener does it */
  useEffect(() => {
    const measure = () => {
      const r = stageRef.current?.getBoundingClientRect();
      if (r) setStage({ w: r.width, h: r.height });
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  const scale = stage.w ? Math.min(1, stage.w / width) : 1;

  /* write the changes into the framed page as one stylesheet */
  const latest = useRef({ changes, tokens });
  latest.current = { changes, tokens };
  const applyAll = useCallback(() => {
    const d = doc();
    /* only into a screen `onLoad` has wired, i.e. one that has hydrated */
    if (!d || !wired.current.has(d)) return;
    let sheet = d.querySelector<HTMLStyleElement>("style[data-tweak]");
    if (!sheet) {
      sheet = d.createElement("style");
      sheet.dataset.tweak = "sheet";
      d.head.appendChild(sheet);
    }
    const css = buildCss(latest.current.changes, latest.current.tokens, true);
    if (sheet.textContent !== css) sheet.textContent = css;
  }, []);

  useEffect(() => {
    applyAll();
    setTick((t) => t + 1);
  }, [changes, tokens, applyAll]);

  /* the frame's width changes which rules match, so values are re-read */
  useEffect(() => {
    const t = setTimeout(() => setTick((n) => n + 1), 400);
    return () => clearTimeout(t);
  }, [width]);

  const listComponents = useCallback(() => {
    const d = doc();
    if (!d) return;
    const seen = new Map<string, { sel: string; label: string; count: number }>();
    for (const el of d.body.querySelectorAll("*")) {
      const sel = componentSelector(el);
      if (!sel) continue;
      const hit = seen.get(sel);
      if (hit) hit.count += 1;
      else seen.set(sel, { sel, label: componentName(el), count: 1 });
    }
    setComponents([...seen.values()]);
  }, []);

  /* on every load of the frame: tokens, rules, the component list, the
     outlines, and a watch that refreshes the list as the screen changes */
  const onLoad = useCallback(() => {
    const d = doc();
    if (!d || wired.current.has(d) || d.location.href === "about:blank") return;
    /* ⚠️ NOT BEFORE THE SCREEN HAS HYDRATED: a stylesheet or outline put into
       the server HTML is a hydration mismatch. `data-store-ready` is stamped
       on <html> once the store has hydrated (InvestigationProvider). */
    if (!d.documentElement.hasAttribute("data-store-ready")) {
      const wait = new MutationObserver(() => {
        if (!d.documentElement.hasAttribute("data-store-ready")) return;
        wait.disconnect();
        onLoad();
      });
      wait.observe(d.documentElement, { attributes: true, attributeFilter: ["data-store-ready"] });
      return;
    }
    wired.current.add(d);
    rulesRef.current = flattenRules(d);
    const names = new Set<string>();
    for (const r of rulesRef.current) {
      if (r.selector !== ":root") continue;
      for (const p of r.style) if (p.startsWith("--")) names.add(p);
    }
    setTokenNames([...names]);

    /* outlines: one dashed under the pointer while picking, one solid round
       every element the next change will reach */
    const layer = d.createElement("div");
    layer.dataset.tweak = "outlines";
    layer.setAttribute("aria-hidden", "true");
    Object.assign(layer.style, { position: "fixed", inset: "0", pointerEvents: "none", zIndex: "2147483647" });
    d.body.appendChild(layer);
    const boxes: HTMLDivElement[] = [];
    const box = (i: number) => {
      if (!boxes[i]) {
        const b = d.createElement("div");
        Object.assign(b.style, { position: "absolute", boxSizing: "border-box" });
        layer.appendChild(b);
        boxes[i] = b;
      }
      return boxes[i];
    };
    const place = (b: HTMLDivElement, el: Element, hover: boolean) => {
      const r = el.getBoundingClientRect();
      Object.assign(b.style, {
        display: "block",
        left: `${r.left}px`,
        top: `${r.top}px`,
        width: `${r.width}px`,
        height: `${r.height}px`,
        border: hover ? "1px dashed #e0457b" : "2px solid #e0457b",
        background: hover ? "rgb(224 69 123 / 0.08)" : "transparent",
      });
    };
    let raf = 0;
    const loop = () => {
      let n = 0;
      if (hoverRef.current?.isConnected) place(box(n++), hoverRef.current, true);
      const sel = targetSelRef.current;
      if (sel) {
        let els: Element[] = [];
        try {
          els = [...d.querySelectorAll(sel)];
        } catch {
          /* a stale selector from another screen */
        }
        for (const el of els) place(box(n++), el, false);
      }
      for (let i = n; i < boxes.length; i++) boxes[i].style.display = "none";
      raf = d.defaultView!.requestAnimationFrame(loop);
    };
    loop();

    let pending = 0;
    const mo = new MutationObserver((records) => {
      if (records.every((r) => [...r.addedNodes].every((n) => (n as HTMLElement).dataset?.tweak))) return;
      cancelAnimationFrame(pending);
      pending = requestAnimationFrame(listComponents);
    });
    mo.observe(d.body, { childList: true, subtree: true });
    d.defaultView!.addEventListener("unload", () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
    });

    applyAll();
    listComponents();
    /* re-find the picked element in the fresh document */
    if (targetSelRef.current) {
      try {
        selectedRef.current = d.querySelector(targetSelRef.current);
      } catch {
        selectedRef.current = null;
      }
    }
    setTick((t) => t + 1);
  }, [applyAll, listComponents]);

  /* the server-rendered frame can finish loading before hydration attaches
     `onLoad`, so the first load is caught here */
  useEffect(() => {
    if (doc()?.readyState === "complete") onLoad();
  }, [onLoad]);

  const select = (el: Element | null) => {
    const d = doc();
    if (!d || !el || el === d.body || el === d.documentElement) return;
    selectedRef.current = el;
    setOnly(!componentSelector(el));
    setPicked((n) => n + 1);
    setTab("element");
  };

  /* picking: hover outlines, a click selects and swallows the press. On the
     frame's WINDOW, in the capture phase: React listens on the document, so
     a listener there would run after it and the press would still land. */
  useEffect(() => {
    const w = win();
    if (!w || !picking) {
      hoverRef.current = null;
      return;
    }
    const move = (e: Event) => {
      hoverRef.current = e.target as Element;
    };
    const block = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const click = (e: Event) => {
      block(e);
      select(e.target as Element);
      setPicking(false);
    };
    const kinds = ["pointerdown", "mousedown", "pointerup", "mouseup"];
    w.addEventListener("mousemove", move, true);
    w.addEventListener("click", click, true);
    kinds.forEach((k) => w.addEventListener(k, block, true));
    return () => {
      w.removeEventListener("mousemove", move, true);
      w.removeEventListener("click", click, true);
      kinds.forEach((k) => w.removeEventListener(k, block, true));
      hoverRef.current = null;
    };
    // `select` only reads refs and setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picking]);

  /* what the next change reaches: the component, or just the picked element */
  const el = selectedRef.current;
  const d = doc();
  const target = useMemo(() => {
    void picked;
    if (!el || !d || !el.isConnected) return null;
    const comp = componentSelector(el);
    const selector = only || !comp ? pathFor(el, d) : comp;
    const count = d.querySelectorAll(selector).length;
    const compCount = comp ? d.querySelectorAll(comp).length : 1;
    const label = only || !comp ? labelFor(el) : componentName(el);
    return { selector, label, count, compCount, comp: !!comp };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el, d, only, picked, tick]);
  targetSelRef.current = target?.selector ?? null;
  const key = target ? keyOf(scope, target.selector) : null;

  /* the rules that apply to the picked element at the frame's width */
  const matched = useMemo(() => {
    const w = win();
    return el && w && el.isConnected ? matchingRules(el, rulesRef.current, w) : [];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [el, picked, tick, width]);
  const computed = el && el.isConnected ? win()?.getComputedStyle(el) : null;
  const rect = el && el.isConnected ? el.getBoundingClientRect() : null;

  const shown = (prop: string) => {
    const own = key ? changes[key]?.props[prop] : undefined;
    if (own != null) return own;
    const a = authored(prop, matched);
    if (a) return a;
    const c = computed?.getPropertyValue(prop) ?? "";
    return PX_PROPS.has(prop) ? c : toRem(c);
  };

  /* a token's own scale: its family (`--space-`, `--radius-`, …) by size */
  const scaleOf = useCallback(
    (name: string) => {
      const family = name.replace(/-[^-]+$/, "-");
      const w = win();
      const root = w && doc() ? w.getComputedStyle(doc()!.documentElement) : null;
      const px = (n: string) => {
        const v = root?.getPropertyValue(n).trim() ?? "";
        const m = v.match(/^(-?\d*\.?\d+)(px|rem)$/);
        return m ? parseFloat(m[1]) * (m[2] === "rem" ? 16 : 1) : NaN;
      };
      return tokenNames
        .filter((n) => n.startsWith(family) && !Number.isNaN(px(n)))
        .sort((a, b) => px(a) - px(b));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tokenNames],
  );

  const setProp = (prop: string, value: string) => {
    if (!target || !key) return;
    const clear = value.trim() === "";
    setChanges((c) => {
      const rule: Rule = c[key] ?? { selector: target.selector, label: target.label, scope, props: {} };
      const props = { ...rule.props };
      if (clear) delete props[prop];
      else props[prop] = value;
      /* ⚠️ A NARROWED BLOCK STAYS CENTRED: in a column (block or flex column
         parent) a capped width slides to the left edge, so its side margins
         go to `auto` with it — unless they were set here by hand */
      if (!clear && (prop === "width" || prop === "max-width") && el?.parentElement) {
        const p = win()?.getComputedStyle(el.parentElement);
        const column = p && (p.display === "block" || (p.display.includes("flex") && p.flexDirection.startsWith("column")));
        if (column && !("margin-left" in props) && !("margin-right" in props)) {
          props["margin-left"] = "auto";
          props["margin-right"] = "auto";
        }
      }
      const next = { ...c, [key]: { ...rule, props } };
      if (!Object.keys(props).length) delete next[key];
      return next;
    });
  };

  const setToken = (name: string, value: string) => {
    setTokens((t) => {
      const next = { ...t };
      if (value.trim() === "") delete next[name];
      else next[name] = value;
      return next;
    });
  };

  const resetAll = () => {
    setChanges({});
    setTokens({});
  };

  const exportCss = useMemo(() => {
    const body = buildCss(changes, tokens, false);
    return body ? `/* ${SRC}, tweaked */\n\n${body}\n` : "";
  }, [changes, tokens]);

  const changeCount =
    Object.values(changes).reduce((n, r) => n + Object.keys(r.props).length, 0) +
    Object.keys(tokens).length;

  const tokenGroups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const names = tokenNames.filter((n) => !q || n.includes(q));
    const groups = new Map<string, string[]>();
    for (const n of names) {
      const g = n.split("-")[2] ?? "other";
      groups.set(g, [...(groups.get(g) ?? []), n]);
    }
    return [...groups.entries()];
  }, [tokenNames, filter]);

  const rootStyle = win() && doc() ? win()!.getComputedStyle(doc()!.documentElement) : null;

  return (
    <div className={styles.tool}>
      <div className={styles.main}>
        <div className={styles.bar}>
          <div className={styles.row} role="radiogroup" aria-label="Frame width">
            {WIDTHS.map((w) => (
              <Chip
                key={w}
                label={String(w)}
                control="radio"
                size="compact"
                selected={width === w}
                onToggle={() => setWidth(w)}
              />
            ))}
          </div>
          <span className={`${styles.meta} t-label-sm`}>
            {SRC} · {Math.round(scale * 100)}%
          </span>
          <SmallButton
            label="Reload"
            arrow={false}
            onClick={() => frameRef.current?.contentWindow?.location.reload()}
          />
        </div>

        <div ref={stageRef} className={styles.stage}>
          <iframe
            ref={frameRef}
            src={SRC}
            title={`${SRC}, being tweaked`}
            onLoad={onLoad}
            className={styles.frame}
            style={{
              width,
              height: stage.h ? stage.h / scale : "100%",
              transform: `scale(${scale})`,
            }}
          />
        </div>
      </div>

      <aside className={styles.panel} aria-label="Tweaks">
        <div className={styles.tabs} role="radiogroup" aria-label="Panel">
          {(["element", "tokens", "export"] as const).map((t) => (
            <Chip
              key={t}
              label={
                t === "element"
                  ? "Element"
                  : t === "tokens"
                    ? "Tokens"
                    : `Export${changeCount ? ` (${changeCount})` : ""}`
              }
              control="radio"
              size="compact"
              selected={tab === t}
              onToggle={() => setTab(t)}
            />
          ))}
        </div>

        {tab === "element" && (
          <div className={styles.body}>
            <div className={styles.row}>
              <Chip
                label={picking ? "Click an element…" : "Pick on screen"}
                size="compact"
                selected={picking}
                onToggle={() => setPicking((p) => !p)}
              />
              <SmallButton
                label="Parent"
                arrow={false}
                disabled={!el?.parentElement || el.parentElement === d?.body}
                onClick={() => select(el?.parentElement ?? null)}
              />
              <SmallButton
                label="First child"
                arrow={false}
                disabled={!el?.firstElementChild}
                onClick={() => select(el?.firstElementChild ?? null)}
              />
            </div>

            <label className={styles.field}>
              <span className={`${styles.meta} t-label-sm`}>Components on the screen</span>
              <select
                className={`${styles.input} t-label-sm`}
                value={target?.comp && !only ? target.selector : ""}
                onChange={(e) => {
                  const found = e.target.value ? d?.querySelector(e.target.value) : null;
                  if (found) {
                    found.scrollIntoView({ block: "center" });
                    select(found);
                  }
                }}
              >
                <option value="">Choose…</option>
                {components.map((c) => (
                  <option key={c.sel} value={c.sel}>
                    {c.label}
                    {c.count > 1 ? ` ×${c.count}` : ""}
                  </option>
                ))}
              </select>
            </label>

            {target && (
              <div className={styles.picked}>
                <p className="t-label">{target.label}</p>
                <p className={`${styles.meta} t-label-sm`}>
                  {rect ? `${(rect.width / 16).toFixed(2)} × ${(rect.height / 16).toFixed(2)}rem · ` : ""}
                  {target.count} on the screen
                </p>
                {target.comp && (
                  <div className={styles.row} role="radiogroup" aria-label="Applies to">
                    <Chip
                      label={`All ${target.compCount}`}
                      control="radio"
                      size="compact"
                      selected={!only}
                      onToggle={() => setOnly(false)}
                    />
                    <Chip
                      label="Only this one"
                      control="radio"
                      size="compact"
                      selected={only}
                      onToggle={() => setOnly(true)}
                    />
                  </div>
                )}
                <div className={styles.row} role="radiogroup" aria-label="Widths">
                  <Chip
                    label="All widths"
                    control="radio"
                    size="compact"
                    selected={scope === "all"}
                    onToggle={() => setScope("all")}
                  />
                  <Chip
                    label="From 1024"
                    control="radio"
                    size="compact"
                    selected={scope === "desktop"}
                    onToggle={() => setScope("desktop")}
                  />
                </div>
                {key && changes[key] && (
                  <SmallButton
                    label="Reset these changes"
                    arrow={false}
                    onClick={() =>
                      setChanges((c) => {
                        const next = { ...c };
                        delete next[key];
                        return next;
                      })
                    }
                  />
                )}
              </div>
            )}

            {target &&
              computed &&
              GROUPS.map((g) => (
                <fieldset key={g.name} className={styles.group}>
                  <legend className={`${styles.legend} t-overline`}>{g.name}</legend>
                  {g.props.map((p) => (
                    <PropInput
                      key={`${key}|${p}`}
                      prop={p}
                      value={shown(p)}
                      changed={key ? changes[key]?.props[p] != null : false}
                      colorValue={computed.getPropertyValue(p)}
                      listId={KEYWORDS[p] ? `kw-${p}` : "tokens"}
                      onStep={(v, dir, big) => stepValue(v, dir, big, scaleOf)}
                      onCommit={(v) => setProp(p, v)}
                    />
                  ))}
                </fieldset>
              ))}

            {!target && (
              <p className={`${styles.meta} t-label-sm`}>
                Pick an element on the screen, or choose a component from the list.
              </p>
            )}
          </div>
        )}

        {tab === "tokens" && (
          <div className={styles.body}>
            <input
              className={`${styles.input} t-label-sm`}
              placeholder="Filter, e.g. space or color-text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="Filter tokens"
            />
            {tokenGroups.map(([group, names]) => (
              <fieldset key={group} className={styles.group}>
                <legend className={`${styles.legend} t-overline`}>{group}</legend>
                {names.map((n) => {
                  /* the token as written in app/tokens.css, not resolved */
                  const own = tokens[n];
                  const written =
                    rulesRef.current.find((r) => r.selector === ":root" && !r.media.length && r.style.getPropertyValue(n))
                      ?.style.getPropertyValue(n)
                      .trim() ?? rootStyle?.getPropertyValue(n).trim() ?? "";
                  return (
                    <PropInput
                      key={n}
                      prop={n}
                      value={own ?? written}
                      changed={own != null}
                      color={n.startsWith("--color-")}
                      colorValue={rootStyle?.getPropertyValue(n).trim()}
                      listId="tokens"
                      onStep={(v, dir, big) => stepValue(v, dir, big, scaleOf)}
                      onCommit={(v) => setToken(n, v)}
                    />
                  );
                })}
              </fieldset>
            ))}
          </div>
        )}

        {tab === "export" && (
          <div className={styles.body}>
            <p className={`${styles.meta} t-label-sm`}>
              Copy this and send it over: each rule names its component, and the
              values go into the real modules and tokens.
            </p>
            <textarea
              className={`${styles.input} ${styles.code} ${styles.export} t-label-sm`}
              readOnly
              value={exportCss || "/* no changes yet */"}
              aria-label="Changes as CSS"
            />
            <div className={styles.row}>
              <SmallButton
                label={copied ? "Copied" : "Copy CSS"}
                arrow={false}
                disabled={!exportCss}
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(exportCss);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  } catch {
                    /* the textarea is still there to select by hand */
                  }
                }}
              />
              <SmallButton label="Reset all" arrow={false} disabled={!changeCount} onClick={resetAll} />
            </div>
          </div>
        )}

        <datalist id="tokens">
          {tokenNames.map((n) => (
            <option key={n} value={`var(${n})`} />
          ))}
        </datalist>
        {Object.entries(KEYWORDS).map(([p, words]) => (
          <datalist key={p} id={`kw-${p}`}>
            {words.map((w) => (
              <option key={w} value={w} />
            ))}
          </datalist>
        ))}
      </aside>
    </div>
  );
}

/* one property: free CSS text (committed on Enter or blur), ↑/↓ to step it,
   a swatch for colours, × to drop the change */
function PropInput({
  prop,
  value,
  changed,
  color = COLOR_PROPS.has(prop),
  colorValue,
  listId,
  onStep,
  onCommit,
}: {
  prop: string;
  value: string;
  changed: boolean;
  color?: boolean;
  /** the resolved colour for the swatch, when `value` is a `var()` */
  colorValue?: string;
  listId: string;
  onStep: (value: string, dir: 1 | -1, big: boolean) => string | null;
  onCommit: (value: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [editing, setEditing] = useState(false);

  return (
    <div className={styles.prop} data-changed={changed || undefined}>
      <span className={`${styles.propName} ${styles.code} t-label-sm`} title={prop}>
        {prop}
      </span>
      <input
        className={`${styles.input} ${styles.code} t-label-sm`}
        value={editing ? draft : value}
        list={listId}
        aria-label={prop}
        onFocus={() => {
          setDraft(value);
          setEditing(true);
        }}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          setEditing(false);
          if (draft !== value) onCommit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onCommit(draft);
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "ArrowUp" || e.key === "ArrowDown") {
            const next = onStep(draft, e.key === "ArrowUp" ? 1 : -1, e.shiftKey);
            if (next != null) {
              e.preventDefault();
              setDraft(next);
              onCommit(next);
            }
          }
        }}
      />
      {color && (
        <input
          type="color"
          className={styles.swatch}
          value={toHex(colorValue ?? value)}
          aria-label={`${prop} colour`}
          onChange={(e) => onCommit(e.target.value)}
        />
      )}
      {changed && (
        <IconButton label={`Reset ${prop}`} size="xs" variant="soft" onClick={() => onCommit("")}>
          <CloseSmallIcon />
        </IconButton>
      )}
    </div>
  );
}

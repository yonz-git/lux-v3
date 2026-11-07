"use client";

import { useEffect, useRef, useState } from "react";
import { LuxLogoMark, LuxLogoWord } from "@/components/ui/LuxLogo";
import styles from "./LogoEntrance.module.css";

/** The entrance — the brand lockup appearing before Welcome takes the screen. */
/* How long the logo waits for the canvas before playing on the gradient. The
   canvas effect runs before this one in the same commit (`AppCanvas` precedes
   the page in app/layout.tsx), so on a working device it has almost always
   drawn already; this only bounds a canvas that never will. */
const CANVAS_WAIT_MS = 800;

/* The latest the hold may last before it is released regardless — see the
   backstop in the effect. Well past the wait plus the 3200ms lifetime. */
const HOLD_BACKSTOP_MS = 6000;

/* Welcome's orb — the other end of the hand-off. The class is Welcome's to
   put on `<Orb>`; see `.orb-from-entrance` in globals.css. */
const HANDOFF_TARGET = ".orb-from-entrance";

let played = false;

/** true once this page load has shown (or skipped) the entrance */
export function entrancePlayed() {
  return played;
}

/* the on-screen box round a set of paths — the symbol's three, or the orb
   mark's three. `getBoundingClientRect` on an SVG path is its transformed
   bounds in CSS pixels, so both sides are measured in the same units. */
function unionRect(paths: Iterable<Element>) {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;
  for (const path of paths) {
    const r = path.getBoundingClientRect();
    left = Math.min(left, r.left);
    top = Math.min(top, r.top);
    right = Math.max(right, r.right);
    bottom = Math.max(bottom, r.bottom);
  }
  if (!(right > left && bottom > top)) return null;
  return { left, top, width: right - left, height: bottom - top };
}

/**
 * Aim the hand-off: map the symbol's box onto the orb mark's box, and put the
 * orb's starting centre on the symbol's. Pure measurement — every number it
 * writes is a rectangle's, and the motion that consumes them is in
 * `globals.css`.
 *
 * The symbol's travel is on its `<svg>` with `transform-origin: 0 0`
 * (LogoEntrance.module.css), so for the svg's box B, the symbol's box S and
 * the target T: scale is T/S per axis, and the translate is what puts S's
 * corner on T's after that scale about B's corner.
 */
function aim(el: HTMLElement) {
  const orb = document.querySelector<HTMLElement>(HANDOFF_TARGET);
  const svg = el.querySelector<SVGSVGElement>(".lux-entrance-mark-travel");
  if (!orb || !svg) return;
  const S = unionRect(svg.querySelectorAll("path"));
  const T = unionRect(orb.querySelectorAll("svg path"));
  if (!S || !T) return;
  const B = svg.getBoundingClientRect();
  const sx = T.width / S.width;
  const sy = T.height / S.height;
  el.style.setProperty("--handoff-x", `${T.left - B.left - (S.left - B.left) * sx}px`);
  el.style.setProperty("--handoff-y", `${T.top - B.top - (S.top - B.top) * sy}px`);
  el.style.setProperty("--handoff-sx", `${sx}`);
  el.style.setProperty("--handoff-sy", `${sy}`);

  const O = orb.getBoundingClientRect();
  orb.style.setProperty("--orb-from-x", `${S.left + S.width / 2 - (O.left + O.width / 2)}px`);
  orb.style.setProperty("--orb-from-y", `${S.top + S.height / 2 - (O.top + O.height / 2)}px`);
}

export function LogoEntrance() {
  const ref = useRef<HTMLDivElement>(null);
  /* an in-app return to `/`: the entrance already ran on this page load, so
     render nothing — the effect below then finds no node and takes no hold */
  const [gone, setGone] = useState(played);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const finish = () => {
      played = true;
      setGone(true);
    };

    const root = document.documentElement;
    const release = () => {
      delete root.dataset.entranceHold;
    };
    /* the release that starts the hand-off: measured first, then the hand-off
       tracks and Welcome's are started by ONE style change — `data-handoff`
       on the overlay and the hold coming off the root in the same task — so
       the symbol, the orb and the orb's mark share a start frame. See the
       clock note under "THE TIMELINE" in globals.css. */
    const handOff = () => {
      aim(el);
      el.dataset.handoff = "";
      release();
    };

    const tracks = el.getAnimations({ subtree: true });
    const stateOf = (name: string) =>
      tracks.find((a) => "animationName" in a && a.animationName === name)
        ?.playState;

    const veil = stateOf("lux-entrance-veil");
    if (veil === undefined || veil === "finished") {
      /* nothing to hold for, and nothing to wait on — including the case where
         the stylesheet never arrived and there is no entrance to speak of */
      delete el.dataset.wait;
      finish();
      return;
    }

    /* hold Welcome's entrance — see the hand-off block in globals.css. Set here
       rather than in the server HTML so it stays off every other route: this
       component only ever mounts on `/`. */
    root.dataset.entranceHold = "";
    if (stateOf("lux-entrance-mark-in") === "finished") handOff();

    let waitTimer = 0;
    let observer: MutationObserver | null = null;
    const go = () => {
      if (el.dataset.wait === undefined) return;
      window.clearTimeout(waitTimer);
      observer?.disconnect();
      if (
        root.dataset.canvasReady !== undefined &&
        root.dataset.entranceHold !== undefined
      ) {
        el.dataset.overCanvas = "";
      }
      delete el.dataset.wait;
    };
    if (root.dataset.canvasReady !== undefined) {
      go();
    } else {
      observer = new MutationObserver(() => {
        if (root.dataset.canvasReady !== undefined) go();
      });
      observer.observe(root, { attributeFilter: ["data-canvas-ready"] });
      waitTimer = window.setTimeout(go, CANVAS_WAIT_MS);
    }

    const backstop = window.setTimeout(release, HOLD_BACKSTOP_MS);

    const onEnd = (event: AnimationEvent) => {
      if (event.animationName === "lux-entrance-mark-in") handOff();
      /* `lux-entrance-skip` replaces the veil when the user cuts it short */
      if (
        event.animationName === "lux-entrance-done" ||
        event.animationName === "lux-entrance-veil" ||
        event.animationName === "lux-entrance-skip"
      ) {
        release();
        finish();
      }
    };

    const skip = () => {
      /* a skip during the wait must not sit paused behind it */
      go();
      el.dataset.skip = "";
    };

    el.addEventListener("animationend", onEnd);
    el.addEventListener("pointerdown", skip);
    window.addEventListener("keydown", skip);

    return () => {
      window.clearTimeout(waitTimer);
      window.clearTimeout(backstop);
      observer?.disconnect();
      el.removeEventListener("animationend", onEnd);
      el.removeEventListener("pointerdown", skip);
      window.removeEventListener("keydown", skip);
      release();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={ref}
      className={`${styles.entrance} lux-entrance`}
      data-wait=""
      aria-hidden
    >
      {/* without JavaScript nothing would ever remove `data-wait` */}
      <noscript>
        <style>
          {
            ".lux-entrance[data-wait],.lux-entrance[data-wait]::before,.lux-entrance[data-wait] *{animation-play-state:running!important}"
          }
        </style>
      </noscript>
      <div className={`${styles.stage} lux-entrance-stage`}>
        {/* each half is TWO elements with a track each: the wrapper arrives,
            the svg leaves — the symbol by travelling to the orb, the wordmark
            by receding. See "THE HAND-OFF" in globals.css for why they cannot
            share an element. */}
        <div className={`${styles.mark} lux-entrance-mark`}>
          <LuxLogoMark className={`${styles.markSvg} lux-entrance-mark-travel`} />
        </div>
        <div className={`${styles.word} lux-entrance-word`}>
          <LuxLogoWord className={`${styles.wordSvg} lux-entrance-word-out`} />
        </div>
      </div>
    </div>
  );
}

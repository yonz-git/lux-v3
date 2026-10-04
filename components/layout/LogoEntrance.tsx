"use client";

import { useEffect, useRef, useState } from "react";
import { LuxLogoMark, LuxLogoWord } from "@/components/ui/LuxLogo";
import styles from "./LogoEntrance.module.css";

/**
 * The entrance — the brand lockup appearing before Welcome takes the screen.
 *
 * ⚠️ NOT IN FIGMA, AND ON `/` ONLY. Asked for directly: the symbol and the
 * wordmark fade in TOGETHER, each drifting a short way inwards — the symbol from
 * its left, the wordmark from its right — while each condenses from a hair
 * larger than life and sharpens from a soft blur, and they hold as the
 * finished lockup. Then THE SYMBOL STAYS: the wordmark recedes, the symbol
 * travels to where Welcome's orb carries the same mark, and the orb grows from
 * almost nothing behind it and carries it into place — the two screens are one
 * object handed over. It replaced a sequenced push, then a plain dissolve, on
 * 12 Sep 2026. The timeline, the drift, the settle, the hand-off and the two
 * durations are documented in `globals.css` under "The entrance" — that file
 * owns every rule that NAMES an animation, because a CSS Module would localize
 * the `@keyframes` name and the rule would resolve to nothing.
 *
 * ⚠️ THE HAND-OFF IS A FLIP, AND THIS FILE HOLDS THE TWO RECTANGLES AND NOTHING
 * ELSE. At release, `aim` measures the symbol's three paths on screen and the
 * orb mark's three paths on screen — Welcome is laid out under the hold, only
 * at opacity 0 — and writes the translate and x/y scale that map the one box
 * onto the other as custom properties on the overlay, and the offset from the
 * orb's resting centre back to the symbol's on the orb. The keyframes in
 * `globals.css` read them; the duration and the curve live there. ⚠️ It
 * measures AT RELEASE, never at mount: at mount the symbol is paused on its 0%
 * keyframe, a drift to the left and 6% large, and a box measured there aims
 * the travel at the wrong place. At release the wrapper has held identity for
 * 700ms. ⚠️ It reaches into Welcome by class (`.orb-from-entrance`) because a
 * shared-element hand-off is the one thing that has to know both ends; if the
 * orb is not there the properties stay unset and the symbol simply fades where
 * it is, which is the old dissolve.
 *
 * ⚠️ IT IS AN OVERLAY, NOT A TWENTIETH ROUTE, AND THAT WAS THE FIRST DECISION.
 * The route map is nineteen routes and every one of them belongs to a nav
 * section. An entrance belongs to none. As a route it would also have to own
 * `/` — taking it from Welcome, which would cost `metadataTitleFor("/")`, the
 * title `RouteAnnouncer` speaks, and the address anyone deep-links or shares —
 * and it would become a back-button destination, so leaving the app and
 * returning would replay it. As a sibling rendered BEFORE `<Welcome>` in
 * `app/page.tsx` it is none of those things: `/` is still Welcome, the document
 * outline is still Welcome's, and the entrance is gone from the DOM in under
 * three seconds.
 *
 * ⚠️ IT IS SERVER-RENDERED, BUT IT WAITS FOR THE CANVAS — AND UNTIL 12 Sep 2026
 * IT DID NOT. The markup is in the first HTML response and the animation is pure
 * CSS; it used to start from that HTML, before React hydrated, on the veil's
 * gradient. Asked for directly: the new background has to be there when the
 * logo first appears, and the canvas needs JavaScript. So the tracks are paused
 * behind `data-wait` until `AppCanvas` has drawn, and the veil shows its
 * gradient with nothing on it until then — a blank beat that is hydration's
 * length, and far shorter in production than on a cold `next dev` load. The
 * script below starts the animation, holds Welcome's timeline, releases it,
 * and takes the node out.
 *
 * ⚠️ EVERY ONE OF THOSE FAILS SAFE. No JavaScript: the `<noscript>` rule
 * un-pauses the tracks, the veil still fades on `both`, `visibility: hidden`
 * still sticks, a hidden element still takes no pointer, and Welcome — never
 * held — plays its entrance behind the veil. No WebGL, or a canvas that has not
 * drawn: the wait gives up after CANVAS_WAIT_MS and the logo plays on the
 * gradient, exactly as it did before. The entrance is a decoration that cannot
 * strand the app behind it.
 *
 * ⚠️ IT PLAYS ONCE PER PAGE LOAD — and until 13 Sep 2026 it played on every
 * mount of `/`, on the claim that nothing navigates back here. Two things do:
 * `Save & exit` on every flow step (removed 4 Oct 2026; `ScreenHeader`'s `saveHref` defaulted to
 * `/`) and Back on step 1 (`prevHref`). Each return replayed the three-second
 * lockup and held Welcome's CTA until ~4.8s. `played` (module state) survives
 * client-side navigation and resets on reload, so a cold start still gets
 * the entrance and an in-app return gets Welcome, settled — see
 * `entrancePlayed` and the `returning` branch in Welcome.tsx. It is
 * skippable anyway; see below.
 *
 * ⚠️ ANY TAP AND ANY KEY SKIP IT — THE KEY HALF IS AN ACCESSIBILITY FIX, NOT A
 * CONVENIENCE. The veil covers a fully interactive Welcome, so the first Tab
 * moves focus to a CTA the user cannot see. Treating that keystroke as "skip"
 * puts the focus ring back on screen in 200ms. The overlay is `aria-hidden`, so
 * a screen reader is reading Welcome underneath from the first frame and is
 * never held here at all.
 */
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

/* ⚠️ ONCE PER PAGE LOAD. Module state survives client-side navigation and
   resets on reload — exactly "the first run of this tab". Set when the
   entrance ENDS, never on mount: React Strict Mode mounts twice in
   development, and a flag set on the first mount would skip the entrance on
   the very load it exists for. */
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

    /* ⚠️ THE TRACKS CAN ALREADY BE OVER BEFORE THIS RUNS, AND THEN NO EVENT IS
       EVER COMING. Two ways in: `prefers-reduced-motion`, where the global
       collapse cuts every duration to 0.01ms so the whole entrance is finished
       within the first frame — long before React hydrates — and a cold device
       where hydration itself takes longer than 2300ms. Both used to leave the
       hold set for the life of the page, because the `animationend` that lifts
       it fired before there was a listener: Welcome would be visible (the hold
       cancels animations rather than pausing them) but nothing on the screen
       could ever animate again. So the state of the tracks is READ first, and
       the hold is only taken if there is still something to wait for. */
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

    /* ⚠️ START THE LOGO ONCE THE CANVAS HAS DRAWN — see "waits for the canvas"
       above. The hold is taken FIRST, on purpose: `data-over-canvas` makes the
       veil transparent, and it may only do that while the hold has Welcome at
       opacity 0, or Welcome would show through behind the logo. */
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

    /* ⚠️ A HOLD THAT IS NEVER RELEASED NOW HIDES WELCOME (globals.css) — it
       used to leave it merely unanimated — so it has a backstop well past the
       wait plus the 3200ms lifetime. */
    const backstop = window.setTimeout(release, HOLD_BACKSTOP_MS);

    /* ⚠️ THE TWO EVENTS ARE DIFFERENT MOMENTS AND BOTH ARE LOAD-BEARING. The
       assembly tracks end at 2300ms, and that is when the hand-off is aimed and
       Welcome is released so its orb can start growing behind the symbol as
       the symbol sets off. The hand-off's own lifetime (`lux-entrance-done`)
       ends 700ms after that, once the symbol has faded over the orb's mark,
       and that is when the node goes; `lux-entrance-veil` is the fail-safe
       that ends it at 3200 if the hand-off was never started. Filtering by
       NAME rather than by a timer is what keeps this file from holding a
       second copy of a duration that lives in globals.css, and it is what
       makes the reduced-motion collapse work: it shortens every track
       together and the events land in the same frame.

       ⚠️ AND THERE IS NO `event.target === el` GUARD, DELIBERATELY.
       `lux-entrance-mark-in` runs on the MARK, a child, and only reaches this
       listener by bubbling — a target check rejected it, the release fell
       through to the veil's own end 520ms later, and Welcome then sat fully
       formed and unanimated under a fading veil before blinking out and
       restarting. The five `lux-entrance-*` names exist nowhere else in the
       app, so the name alone identifies the event. (Seven now, with the
       hand-off's.) */
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

    /* ⚠️ `pointerdown`, NOT `click`. The veil covers a live Welcome, and a
       click that begins on the veil can be delivered after it is gone — landing
       on the CTA underneath and navigating somewhere the user never asked to
       go. A pointerdown is consumed here and never becomes that click. */
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

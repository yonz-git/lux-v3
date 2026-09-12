"use client";

import { useEffect, useRef, useState } from "react";
import { LuxLogoMark, LuxLogoWord } from "@/components/ui/LuxLogo";
import styles from "./LogoEntrance.module.css";

/**
 * The entrance — the brand lockup appearing before Welcome takes the screen.
 *
 * ⚠️ NOT IN FIGMA, AND ON `/` ONLY. Asked for directly: the symbol and the
 * wordmark fade in TOGETHER, each drifting a short way inwards — the symbol from
 * its left, the wordmark from its right — and settle as the finished lockup.
 * It replaced a sequenced push the same day. The timeline, the drift and the
 * two durations are
 * documented in `globals.css` under "The entrance" — that file owns every rule
 * that NAMES an animation, because a CSS Module would localize the `@keyframes`
 * name and the rule would resolve to nothing.
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
 * ⚠️ IT PLAYS ON EVERY LOAD OF `/`, AND THAT IS NOT THE "100 TIMES A DAY"
 * ANIMATION IT LOOKS LIKE. Nothing in the app navigates BACK to `/` — Welcome
 * carries `BottomNav active="none"` and no nav item points at it — so the only
 * way to see this is a cold start, which is also the only way to start the
 * investigation, because the store is in memory and a reload begins empty. It
 * is a first-run animation that happens to have no `sessionStorage` behind it,
 * rather than a splash on a screen people pass through. It is skippable anyway;
 * see below.
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
   backstop in the effect. */
const HOLD_BACKSTOP_MS = 6000;

export function LogoEntrance() {
  const ref = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const root = document.documentElement;
    const release = () => {
      delete root.dataset.entranceHold;
    };

    /* ⚠️ THE TRACKS CAN ALREADY BE OVER BEFORE THIS RUNS, AND THEN NO EVENT IS
       EVER COMING. Two ways in: `prefers-reduced-motion`, where the global
       collapse cuts every duration to 0.01ms so the whole entrance is finished
       within the first frame — long before React hydrates — and a cold device
       where hydration itself takes longer than 2520ms. Both used to leave the
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
      setGone(true);
      return;
    }

    /* hold Welcome's entrance — see the hand-off block in globals.css. Set here
       rather than in the server HTML so it stays off every other route: this
       component only ever mounts on `/`. */
    root.dataset.entranceHold = "";
    if (stateOf("lux-entrance-mark-in") === "finished") release();

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
       wait plus the 2520ms timeline. */
    const backstop = window.setTimeout(release, HOLD_BACKSTOP_MS);

    /* ⚠️ THE TWO EVENTS ARE DIFFERENT MOMENTS AND BOTH ARE LOAD-BEARING. The
       assembly tracks end at 2000ms, while the veil is still fully opaque, and
       that is when Welcome is released so its orb can begin assembling under
       cover. The veil's own track ends 520ms later, and that is when the node
       goes. Filtering by NAME rather than by a timer is what keeps this file
       from holding a second copy of a duration that lives in globals.css, and
       it is what makes the reduced-motion collapse work: it shortens both
       tracks together and both events land in the same frame.

       ⚠️ AND THERE IS NO `event.target === el` GUARD, DELIBERATELY.
       `lux-entrance-mark-in` runs on the MARK, a child, and only reaches this
       listener by bubbling — a target check rejected it, the release fell
       through to the veil's own end 520ms later, and Welcome then sat fully
       formed and unanimated under a fading veil before blinking out and
       restarting. The five `lux-entrance-*` names exist nowhere else in the
       app, so the name alone identifies the event. */
    const onEnd = (event: AnimationEvent) => {
      if (event.animationName === "lux-entrance-mark-in") release();
      /* `lux-entrance-skip` replaces the veil when the user cuts it short */
      if (
        event.animationName === "lux-entrance-veil" ||
        event.animationName === "lux-entrance-skip"
      ) {
        release();
        setGone(true);
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
            ".lux-entrance[data-wait],.lux-entrance[data-wait] *{animation-play-state:running!important}"
          }
        </style>
      </noscript>
      <div className={`${styles.stage} lux-entrance-stage`}>
        <div className={`${styles.mark} lux-entrance-mark`}>
          <LuxLogoMark />
        </div>
        <div className={`${styles.word} lux-entrance-word`}>
          <LuxLogoWord />
        </div>
      </div>
    </div>
  );
}

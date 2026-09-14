"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import "./picker.css";
import "./themes.css";
import styles from "@/features/my-skin/components/Welcome.module.css";
import { Orb } from "@/components/ui/Orb";
import { ChatBubble } from "@/components/ui/ChatBubble";
import { Button } from "@/components/ui/Button";
import { BottomNav } from "@/components/layout/BottomNav";
import { CanvasShader } from "@/components/layout/CanvasShader";

/* ⚠️ PROTOTYPE SURFACE — three dark directions for 00 Welcome. NOT IN FIGMA.

   HOW A FLIP RE-THEMES EVERYTHING
   - The theme is an attribute on <html> (`data-proto-theme`), and every token
     override lives on `:root[data-proto-theme=…]` in themes.css.
   - The living canvas reads its ramp ONCE per mount, from <html>'s computed
     style. So the harness mounts its OWN CanvasShader, keyed on the flip, and
     writes the attribute SYNCHRONOUSLY in the handler, before the state change
     that re-keys it — a layout effect would run after the child's effect has
     already read the old ramp. It sits later in the DOM than the root layout's
     AppCanvas at the same z-index, so it paints over it.
   - The first mount waits on a layout effect that has set the attribute.

   WHY NOT `<Welcome />`
   Welcome reads `entrancePlayed`, a module flag set by LogoEntrance. Deep-linked
   here it plays first-run choreography aimed at an entrance that is not mounted.
   This is Welcome's RETURNING composition, copied — the real Orb, ChatBubble,
   Button, BottomNav and Welcome.module.css, with the settled layout. */

/* Round 2 — "more indigo like ours, a bit more mysterious, not as dark, a nice
   gradient". All three are mid-value indigo grounds built from LUX's own
   figure family (`gradient/brand` #657792 -> #39386f, `bg/brand-soft`
   #8284c0, the orb mark's #3F326D -> #5C5E9E); they diverge on which way the
   indigo leans and what the figures on it are made of. */
const VARIANTS = [
  { id: "dusk", name: "Dusk" },
  { id: "amethyst", name: "Amethyst" },
  { id: "mist", name: "Indigo Mist" },
  { id: "indigo", name: "Indigo" },
] as const;

function applyTheme(index: number) {
  document.documentElement.dataset.protoTheme = VARIANTS[index].id;
}

/* The `edit-*` classes are plain global names with no styles of their own —
   hooks so an element can be found and restyled by name in DevTools, since
   every other class on these elements is a hashed CSS Module class. */
export function WelcomeStage() {
  return (
    <main className="screen edit-screen">
      <div className={styles.welcome}>
        <div className={styles.spacerTop} aria-hidden="true" />

        <div className={`${styles.hero} reveal`}>
          <h1 className="visually-hidden">How is your skin feeling today?</h1>
          <Orb size="var(--size-orb-lg)" animateIn={false} halo className="edit-orb" />
          <div className={styles.bubbles}>
            <ChatBubble
              from="ai"
              align="center"
              className={`${styles.bubbleReply} edit-bubble`}
              entrance={false}
              aria-hidden
            >
              I can help identify possible links between skincare products and
              skin reactions.
            </ChatBubble>
          </div>
        </div>

        <div className={`${styles.actions} reveal`}>
          <Button className={`${styles.cta} edit-button`} href="/investigation/start">
            Create skin profile
          </Button>
          <p className={`${styles.disclaimer} t-caption edit-disclaimer`}>
            Lux does not provide medical diagnoses.
          </p>
        </div>

        <div className={styles.spacerBottom} aria-hidden="true" />
      </div>

      <BottomNav active="none" className="edit-nav" />
    </main>
  );
}

export function DarkWelcomeHarness() {
  const [current, setCurrent] = useState<number | null>(null);
  const [mountKey, setMountKey] = useState(0);
  const pickerRef = useRef<HTMLElement>(null);
  const highlightRef = useRef<HTMLSpanElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const currentRef = useRef<number | null>(null);
  currentRef.current = current;

  /* first mount: theme from `?v=`, falling back to variant 1 */
  useLayoutEffect(() => {
    const v = Number.parseInt(new URLSearchParams(window.location.search).get("v") ?? "", 10);
    const index = v >= 1 && v <= VARIANTS.length ? v - 1 : 0;
    applyTheme(index);
    setCurrent(index);
    return () => {
      delete document.documentElement.dataset.protoTheme;
    };
  }, []);

  const setActive = useCallback((index: number) => {
    if (index < 0 || index >= VARIANTS.length) return;
    applyTheme(index); /* before the re-key — see the note above */
    const url = new URL(window.location.href);
    url.searchParams.set("v", String(index + 1));
    window.history.replaceState(null, "", url);
    setCurrent(index);
    setMountKey((k) => k + 1);
  }, []);

  const replay = useCallback(() => setMountKey((k) => k + 1), []);

  const moveHighlight = useCallback(() => {
    const i = currentRef.current;
    const el = i === null ? null : itemRefs.current[i];
    const highlight = highlightRef.current;
    if (!el || !highlight) return;
    highlight.style.width = `${el.offsetWidth}px`;
    highlight.style.transform = `translateX(${el.offsetLeft}px)`;
  }, []);

  useLayoutEffect(() => {
    if (current !== null) moveHighlight();
  }, [current, moveHighlight]);

  /* enable the highlight's slide only after first paint */
  useEffect(() => {
    if (current === null) return;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => pickerRef.current?.setAttribute("data-ready", ""));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [current === null]);

  useEffect(() => {
    window.addEventListener("resize", moveHighlight);
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName) || target.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const i = currentRef.current ?? 0;
      const num = Number.parseInt(e.key, 10);
      if (num >= 1 && num <= VARIANTS.length) setActive(num - 1);
      else if (e.key === "ArrowRight") setActive((i + 1) % VARIANTS.length);
      else if (e.key === "ArrowLeft") setActive((i - 1 + VARIANTS.length) % VARIANTS.length);
      else if (e.key === "r" || e.key === "R") replay();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("resize", moveHighlight);
      document.removeEventListener("keydown", onKey);
    };
  }, [moveHighlight, setActive, replay]);

  return (
    <>
      {current !== null && (
        <>
          <CanvasShader key={`canvas-${mountKey}`} variant="film" interactive />
          <WelcomeStage key={`stage-${mountKey}`} />
        </>
      )}

      <nav
        ref={pickerRef}
        className="proto-picker"
        data-position="top"
        aria-label="Prototype variants"
      >
        <span ref={highlightRef} className="proto-picker-highlight" aria-hidden="true" />
        {VARIANTS.map((variant, i) => (
          <button
            key={variant.id}
            ref={(el) => {
              itemRefs.current[i] = el;
            }}
            type="button"
            className="proto-picker-item"
            data-active={i === current ? "" : undefined}
            aria-current={i === current ? "true" : undefined}
            onClick={() => setActive(i)}
          >
            {variant.name}
          </button>
        ))}
        <span className="proto-picker-divider" aria-hidden="true" />
        <button
          type="button"
          className="proto-picker-item proto-picker-replay"
          aria-label="Replay animation (R)"
          onClick={replay}
        >
          ↻
        </button>
      </nav>
    </>
  );
}

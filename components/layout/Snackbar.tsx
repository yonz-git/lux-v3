"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import styles from "./Snackbar.module.css";
import { SmallButton } from "@/components/ui/SmallButton";

/**
 * The undo snackbar — a transient message with one action, mounted once in
 * `app/layout.tsx`.
 *
 * ⚠️ IT EXISTS BECAUSE REMOVING SOMETHING WAS UNDOABLE NOWHERE IN THE APP.
 * `Remove` on a product card deleted a product from the library outright, and
 * the library is one of the four slices that persist FOREVER — so a mis-tap on
 * a 44px control was permanent, silent, and left the user to retype a name and
 * a size to get back to where they were. The same was true of taking a product
 * off a day's check-in record. Nothing confirmed, nothing announced, nothing
 * came back.
 *
 * ⚠️ AND THE ANSWER IS UNDO, NOT A CONFIRM DIALOG — the choice is the whole
 * point of the component. A confirm interrupts every removal, including the
 * ~95% that are deliberate, to protect against the few that are not; undo
 * charges nothing to the people who meant it and gives the others a way back.
 * It is also the pattern LUX can afford: the store already holds the previous
 * value, so undo is one `setAnswer` away, while a dialog would need a modal the
 * design system does not have either.
 *
 * ⚠️ NOT IN FIGMA. The file has no toast, no snackbar and no transient message
 * of any kind. The one trace of the idea is `--z-toast` (500), reserved in the
 * token scale and unused until this — which is why this component takes it
 * rather than inventing a layer. Everything visible is the nav's own frosted
 * pill recipe; see the stylesheet. On the catch-up list.
 *
 * ⚠️ UNDO RESTORES A SLICE SNAPSHOT, NOT A REVERSED EDIT, AND THAT IS WHY THE
 * CALLERS LOOK THE WAY THEY DO. Each one captures `answers.<key>` BEFORE it
 * writes and hands the captured value back on undo. Re-inserting the removed
 * item would have to know where in the list it was and, on the demo path, would
 * have to reason about a slice that is still `undefined` because the list is
 * seeded rather than stored. A snapshot answers both for free: restoring
 * `undefined` puts the seeded library back exactly as it was.
 *
 * ⚠️ ONE AT A TIME. A second `show()` replaces the first, which is correct for
 * a snapshot undo: the second snapshot already contains the first removal, so
 * undoing it walks back one step, and the first bar's action would have walked
 * back two while claiming to walk back one.
 */

/* ⚠️ THE BAR HOLDS FOR 4s AND THEN TAKES 320ms TO GO — IT WAS 6s AND A CUT.
   Six seconds is longer than it takes to read four words and decide, so the bar
   sat over the last row of the page long after it had been answered; and it
   left by being unmounted, which is a frame-perfect disappearance in a design
   system whose first sentence is "nothing snaps". The hold is the window to
   notice a mistake — 4s, with the pause below covering anyone who needs longer
   — and the exit is `duration/slow`, the token board 04b gives to anything
   overlay-scale leaving the screen. The two are separate numbers because the
   pause has to be able to cancel one and not the other. */
const DISMISS_MS = 4000;
/* ⚠️ KEEP IN STEP WITH `--duration-slow` (320ms) — the fade is a CSS transition
   on `.bar` and this timeout only decides when the faded-out bar unmounts. Too
   short and it is cut off; too long and the live region holds a message nobody
   can see. */
const EXIT_MS = 320;

type Snack = {
  /** identity, so a repeat of the same message still restarts the timer */
  id: number;
  message: string;
  actionLabel: string;
  onAction: () => void;
};

type ShowArgs = {
  message: string;
  actionLabel?: string;
  onAction: () => void;
};

const SnackbarContext = createContext<{ show: (args: ShowArgs) => void } | null>(
  null
);

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error("useSnackbar must be used inside SnackbarProvider");
  return ctx;
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snack, setSnack] = useState<Snack | null>(null);
  const [paused, setPaused] = useState(false);
  /* ⚠️ THE EXIT REMEMBERS WHY IT STARTED, AND IT HAS TO. An auto-dismiss that
     has begun fading is cancelled by the pointer arriving (below); a dismissal
     the user asked for by pressing the action is not — and the pointer is by
     definition on the bar at that moment, so one flag for both would have the
     press cancel itself. */
  const [leaving, setLeaving] = useState<"auto" | "action" | null>(null);
  const nextId = useRef(0);

  const show = useCallback(({ message, actionLabel = "Undo", onAction }: ShowArgs) => {
    nextId.current += 1;
    setPaused(false);
    setLeaving(null);
    setSnack({ id: nextId.current, message, actionLabel, onAction });
  }, []);

  /* ⚠️ THE TIMER PAUSES WHILE THE BAR IS HOVERED OR HOLDS FOCUS, AND THAT IS
     WHAT PAYS FOR THE SHORTER HOLD. Four seconds is the window to notice a
     mistake and reach the control; it is not enough to read the message,
     decide, move a pointer across the screen and land on a 36px button, and a
     bar that vanishes from under the cursor on the way to it is worse than no
     bar. Keyboard users get the same guarantee for the same reason: tabbing to
     the action must not be a race. */
  useEffect(() => {
    if (!snack || paused || leaving) return;
    const timer = setTimeout(() => setLeaving("auto"), DISMISS_MS);
    return () => clearTimeout(timer);
  }, [snack, paused, leaving]);

  /* The fade itself is CSS — `.bar[data-state="leaving"]` transitions to
     opacity 0. This only unmounts what has finished fading, and hands the
     pointer arriving mid-fade its bar back rather than letting it vanish from
     under the cursor a few pixels short of the button. */
  useEffect(() => {
    if (!leaving) return;
    if (leaving === "auto" && paused) {
      setLeaving(null);
      return;
    }
    const timer = setTimeout(() => {
      setSnack(null);
      setLeaving(null);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving, paused]);

  /* ⚠️ THE BAR CLIMBS ABOVE AN OPEN SHEET'S `Done`. Its resting place is the
     nav clearance, which is exactly where a tray's own dismissal sits — so an
     undo raised from inside the add tray covered the tray's only way out.
     While a sheet is open the region's `bottom` is measured from that button's
     top edge instead, 12 above it; with no sheet it falls back to the CSS. */
  const regionRef = useRef<HTMLDivElement>(null);
  const [liftTo, setLiftTo] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (!snack) return;
    const measure = () => {
      const done = document.querySelector<HTMLElement>(
        '[data-tray="tray"]:not([data-state="leaving"]) > button:last-child',
      );
      const region = regionRef.current;
      if (!done || !region) return setLiftTo(null);
      const gap = 12; // --space-md
      const doneTop = done.getBoundingClientRect().top;
      // read the CSS resting value, not a lift written on a previous pass
      const inline = region.style.bottom;
      region.style.bottom = "";
      const restingBottom = parseFloat(getComputedStyle(region).bottom);
      region.style.bottom = inline;
      const needed = window.innerHeight - doneTop + gap;
      setLiftTo(needed > restingBottom ? needed : null);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [snack]);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {/* ⚠️ THE REGION IS ALWAYS MOUNTED, EMPTY OR NOT. A live region has to be
          in the document BEFORE its content changes or the change is not
          announced — mounting the region and its message together is the
          classic way to ship a toast no screen reader ever reads. It takes no
          layout (fixed) and no clicks (pointer-events: none) while empty. */}
      {/* ⚠️ THE PAUSE HANDLERS SIT ON THE REGION, NOT ON THE BAR. `mouseenter`
          fires on an element when the pointer enters its SUBTREE, so the region
          hears the bar being entered even though it is `pointer-events: none`
          itself — and `focus` bubbles up from the action. Putting them here also
          keeps the bar a plain container: a `<div>` carrying interaction
          handlers and no role is exactly what `noStaticElementInteractions`
          objects to, and the honest fix is that the interactive thing in here is
          the button, not the box. */}
      <div
        ref={regionRef}
        className={styles.region}
        style={liftTo != null ? { bottom: liftTo } : undefined}
        role="status"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {snack && (
          <div
            key={snack.id}
            className={`${styles.bar} reveal-quick`}
            data-state={leaving ? "leaving" : undefined}
          >
            <span className={`${styles.message} t-body3`}>{snack.message}</span>
            <SmallButton
              className={styles.action}
              label={snack.actionLabel}
              arrow={false}
              onClick={() => {
                snack.onAction();
                setLeaving("action");
              }}
            />
          </div>
        )}
      </div>
    </SnackbarContext.Provider>
  );
}

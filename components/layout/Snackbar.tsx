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
import { usePathname } from "next/navigation";
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

/* ⚠️ THE BAR DOES NOT TIME OUT — 27 Sep 2026, from a review against Apple's HIG
   ("don't auto-dismiss on a timer"). It held 4s (6s before that) with a pause
   on hover and focus, and neither pause exists on a phone or for a screen
   reader still reading the message, so the one way back from a removal could
   leave before it was reachable. It now stays until the user moves on: a press
   anywhere outside it, Escape, a route change, or the next `show()`. The exit
   is still `duration/slow`, the token board 04b gives to anything
   overlay-scale leaving the screen. */
/* ⚠️ KEEP IN STEP WITH `--duration-slow` (320ms) — the fade is a CSS transition
   on `.bar` and this timeout only decides when the faded-out bar unmounts. Too
   short and it is cut off; too long and the live region holds a message nobody
   can see. */
const EXIT_MS = 320;

type Snack = {
  /** identity, so a repeat of the same message re-runs its entrance */
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
  const [leaving, setLeaving] = useState(false);
  const nextId = useRef(0);
  const regionRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const show = useCallback(({ message, actionLabel = "Undo", onAction }: ShowArgs) => {
    nextId.current += 1;
    setLeaving(false);
    setSnack({ id: nextId.current, message, actionLabel, onAction });
  }, []);

  /* Moving on is the dismissal: a press outside the bar, Escape, or leaving
     the route. `pointerdown` in the capture phase so a press that opens
     something else still counts, and on `document` so a press inside the bar
     (its own action) is excluded by the containment check, not by ordering. */
  useEffect(() => {
    if (!snack || leaving) return;
    const onPointer = (e: PointerEvent) => {
      if (!regionRef.current?.contains(e.target as Node)) setLeaving(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLeaving(true);
    };
    document.addEventListener("pointerdown", onPointer, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [snack, leaving]);

  const lastPath = useRef(pathname);
  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    setLeaving(true);
  }, [pathname]);

  /* The fade itself is CSS — `.bar[data-state="leaving"]` transitions to
     opacity 0. This only unmounts what has finished fading. */
  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => {
      setSnack(null);
      setLeaving(false);
    }, EXIT_MS);
    return () => clearTimeout(timer);
  }, [leaving]);

  /* ⚠️ THE BAR CLIMBS ABOVE AN OPEN SHEET'S `Done`. Its resting place is the
     nav clearance, which is exactly where a tray's own dismissal sits — so an
     undo raised from inside the add tray covered the tray's only way out.
     While a sheet is open the region's `bottom` is measured from that button's
     top edge instead, 12 above it; with no sheet it falls back to the CSS. */
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
      <div
        ref={regionRef}
        className={styles.region}
        style={liftTo != null ? { bottom: liftTo } : undefined}
        role="status"
      >
        {snack && (
          /* ⚠️ NO `key` ON THE BAR — only on its message. The bar used to be
             keyed on the snack's id, so a second removal inside the hold
             deleted it in one frame and faded a new one up from nothing in the
             same spot. It now stays put and the words change under it. */
          <div className={styles.bar} data-state={leaving ? "leaving" : undefined}>
            <span key={snack.id} className={`${styles.message} t-body3 reveal-quick`}>
              {snack.message}
            </span>
            <SmallButton
              className={styles.action}
              label={snack.actionLabel}
              arrow={false}
              onClick={() => {
                snack.onAction();
                setLeaving(true);
              }}
            />
          </div>
        )}
      </div>
    </SnackbarContext.Provider>
  );
}

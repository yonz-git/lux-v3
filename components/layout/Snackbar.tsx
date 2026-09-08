"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

const DISMISS_MS = 6000;

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
  const nextId = useRef(0);

  const show = useCallback(({ message, actionLabel = "Undo", onAction }: ShowArgs) => {
    nextId.current += 1;
    setPaused(false);
    setSnack({ id: nextId.current, message, actionLabel, onAction });
  }, []);

  /* ⚠️ THE TIMER PAUSES WHILE THE BAR IS HOVERED OR HOLDS FOCUS. Six seconds is
     the window to notice a mistake and reach the control; it is not enough to
     read the message, decide, move a pointer across the screen and land on a
     36px button, and a bar that vanishes from under the cursor on the way to it
     is worse than no bar. Keyboard users get the same guarantee for the same
     reason: tabbing to the action must not be a race. */
  useEffect(() => {
    if (!snack || paused) return;
    const timer = setTimeout(() => setSnack(null), DISMISS_MS);
    return () => clearTimeout(timer);
  }, [snack, paused]);

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
        className={styles.region}
        role="status"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        {snack && (
          <div key={snack.id} className={`${styles.bar} reveal-quick`}>
            <span className={`${styles.message} t-body3`}>{snack.message}</span>
            <SmallButton
              className={styles.action}
              label={snack.actionLabel}
              arrow={false}
              onClick={() => {
                snack.onAction();
                setSnack(null);
              }}
            />
          </div>
        )}
      </div>
    </SnackbarContext.Provider>
  );
}

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
 */

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
      <div
        ref={regionRef}
        className={styles.region}
        style={liftTo != null ? { bottom: liftTo } : undefined}
        role="status"
      >
        {snack && (
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

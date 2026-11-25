"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  type Answers,
  RETIRED_STORAGE_KEYS,
  STORAGE_KEY,
  TRANSIENT_KEYS,
} from "./answers";

/** The investigation's answer store. */
type Ctx = {
  answers: Answers;
  /** Accepts a value or an updater. */
  setAnswer: <K extends keyof Answers>(
    key: K,
    value: Answers[K] | ((prev: Answers[K]) => Answers[K])
  ) => void;
  reset: () => void;
  hydrated: boolean;
};

const InvestigationContext = createContext<Ctx | null>(null);

export function InvestigationProvider({
  children,
  seed,
}: {
  children: React.ReactNode;
  /**
   * Fixed answers for a staged screen (`/myskin/case-study`). Changes stay in
   * memory: the browser's saved answers are neither read nor written.
   */
  seed?: Answers;
}) {
  const [answers, setAnswers] = useState<Answers>(seed ?? {});
  const [hydrated, setHydrated] = useState(seed !== undefined);

  /* Answers are saved in this browser, so a finished skin profile (and the
     products, checks and check-ins after it) survives a reload. A value that
     is not an object is dropped, never repaired. */
  useEffect(() => {
    if (seed) return;
    try {
      for (const key of RETIRED_STORAGE_KEYS) window.localStorage.removeItem(key);
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const saved: unknown = raw ? JSON.parse(raw) : null;
      if (saved && typeof saved === "object" && !Array.isArray(saved)) {
        setAnswers(saved as Answers);
      }
    } catch {
      // storage unavailable (private mode) or unreadable — start empty
    }
    setHydrated(true);
  }, [seed]);

  /* written after every change; mid-task state (`TRANSIENT_KEYS`) is left out
     so a new visit does not reopen a half-finished add or check */
  useEffect(() => {
    if (!hydrated || seed) return;
    const kept: Answers = { ...answers };
    for (const key of TRANSIENT_KEYS) delete kept[key];
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(kept));
    } catch {
      // storage full or unavailable — the visit still works in memory
    }
  }, [answers, hydrated, seed]);

  useLayoutEffect(() => {
    if (hydrated) document.documentElement.setAttribute("data-store-ready", "");
  }, [hydrated]);

  const setAnswer = useCallback<Ctx["setAnswer"]>((key, value) => {
    setAnswers((prev) => ({
      ...prev,
      [key]:
        typeof value === "function"
          ? (value as (p: Answers[typeof key]) => Answers[typeof key])(prev[key])
          : value,
    }));
  }, []);

  const reset = useCallback(() => setAnswers({}), []);

  const value = useMemo(
    () => ({ answers, hydrated, setAnswer, reset }),
    [answers, hydrated, setAnswer, reset]
  );

  return (
    <InvestigationContext.Provider value={value}>
      {children}
    </InvestigationContext.Provider>
  );
}

export function useInvestigation(): Ctx {
  const ctx = useContext(InvestigationContext);
  if (!ctx) {
    throw new Error(
      "useInvestigation must be used inside <InvestigationProvider> — see app/investigation/layout.tsx"
    );
  }
  return ctx;
}

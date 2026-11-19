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
import { type Answers, RETIRED_STORAGE_KEYS } from "./answers";

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
}: {
  children: React.ReactNode;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [hydrated, setHydrated] = useState(false);

  /* The prototype starts fresh on every visit: answers live in memory for
     this page load only. Anything an earlier build saved is deleted, never
     read. */
  useEffect(() => {
    try {
      for (const key of RETIRED_STORAGE_KEYS) window.localStorage.removeItem(key);
    } catch {
      // storage unavailable (private mode) — nothing to clean up
    }
    setHydrated(true);
  }, []);

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

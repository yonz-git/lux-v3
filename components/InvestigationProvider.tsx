"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Answers } from "@/lib/answers";
import { STORAGE_KEY } from "@/lib/answers";

/**
 * The investigation's answer store.
 *
 * The flow is RESUMABLE — that is why the escape hatch says "Save & exit" and
 * not "Skip" — so answers persist to localStorage rather than living only in
 * memory. Without this each screen kept its own useState and answers were lost
 * the moment you navigated.
 *
 * HYDRATION: storage is read in an effect, never during render, so the first
 * client render matches the server's. The cost is that Continue is briefly
 * disabled on a resumed session before the effect runs; `ready` exposes that so
 * a screen can avoid flashing stale content if it ever needs to.
 */
type Ctx = {
  answers: Answers;
  ready: boolean;
  /**
   * Accepts a value or an updater. ⚠️ USE THE UPDATER FOR ANY TOGGLE. Computing
   * the next value from the `answers` you read during render uses a snapshot,
   * so two toggles in the same tick lose the first — the second one recomputes
   * from the pre-click state. The updater form reads the live previous value.
   */
  setAnswer: <K extends keyof Answers>(
    key: K,
    value: Answers[K] | ((prev: Answers[K]) => Answers[K])
  ) => void;
  reset: () => void;
};

const InvestigationContext = createContext<Ctx | null>(null);

export function InvestigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setAnswers(JSON.parse(raw) as Answers);
    } catch {
      // a corrupt or unavailable store must not break the flow — start empty
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // private mode / quota — the flow still works for this session
    }
  }, [answers, ready]);

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
    () => ({ answers, ready, setAnswer, reset }),
    [answers, ready, setAnswer, reset]
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

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Answers } from "./answers";
import { LEGACY_STORAGE_KEY } from "./answers";

/**
 * The investigation's answer store.
 *
 * ⚠️ IN MEMORY ONLY — DO NOT PERSIST THIS.
 *
 * Answers carry across the steps because `app/investigation/layout.tsx` wraps
 * every step, so the provider stays mounted through client-side navigation.
 * That is all the flow needs: 02a can recap what was chosen on 01, and 02b can
 * echo the skin type from 02a.
 *
 * It deliberately does NOT persist. An earlier version wrote to localStorage on
 * the reasoning that "Save & exit" implies a resumable flow — but the effect was
 * that opening the prototype showed options already selected from a previous
 * visit, which reads as though the screens ship pre-filled. For a prototype the
 * expectation is a clean slate every time: **nothing is selected until the user
 * selects it.** Real resumability belongs to a real backend, not to a store that
 * silently reproduces stale answers.
 */
type Ctx = {
  answers: Answers;
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

  // one-time cleanup: an earlier build persisted answers, and that data would
  // otherwise sit in visitors' browsers forever doing nothing
  useEffect(() => {
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // storage unavailable (private mode) — nothing to clean up
    }
  }, []);

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
    () => ({ answers, setAnswer, reset }),
    [answers, setAnswer, reset]
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

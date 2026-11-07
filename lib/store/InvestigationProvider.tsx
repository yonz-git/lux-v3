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
import type { Answers } from "./answers";
import {
  LEGACY_FLOW_V1_KEY,
  LEGACY_STORAGE_KEY,
  LEGACY_START_OTHER_KEY,
} from "./answers";
import { readFlow, readPersisted, writeFlow, writePersisted } from "./persistence";

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

  useEffect(() => {
    // one-time cleanup: an earlier build persisted the WHOLE store, and that
    // data — the flow selections this build refuses to restore — would
    // otherwise sit in visitors' browsers forever. It is deleted, never read.
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      // step 1's own free-text key, orphaned when the description became
      // `locationOther` — never read, so it can only sit there
      window.localStorage.removeItem(LEGACY_START_OTHER_KEY);
      // the flow answers' first envelope, retired when step 1's `start` became
      // a map: this build reads `lux.flow.v2`, and nothing reads v1 to expire it
      window.localStorage.removeItem(LEGACY_FLOW_V1_KEY);
    } catch {
      // storage unavailable (private mode) — nothing to clean up
    }

    const saved = { ...readPersisted(), ...readFlow(Date.now()) };
    if (Object.keys(saved).length) {
      // merge UNDER anything already set this session: an effect runs after
      // paint, so a fast first interaction must not be overwritten by disk
      setAnswers((prev) => ({ ...saved, ...prev }));
    }
    setHydrated(true);
  }, []);

  useLayoutEffect(() => {
    if (hydrated) document.documentElement.setAttribute("data-store-ready", "");
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    writePersisted(answers);
    writeFlow(answers, Date.now());
  }, [answers, hydrated]);

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

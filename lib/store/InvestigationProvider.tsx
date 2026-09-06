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
import { readPersisted, writePersisted } from "./persistence";

/**
 * The investigation's answer store.
 *
 * ⚠️ EVERY FLOW SELECTION IS IN MEMORY ONLY — DO NOT PERSIST THOSE.
 *
 * Answers carry across the steps because `app/layout.tsx` wraps the whole app,
 * so the provider stays mounted through client-side navigation. It is mounted
 * at the ROOT rather than at `app/investigation/layout.tsx` because the
 * PRODUCTS hub reads what step 5 writes and is reached from the bottom nav
 * rather than from inside the flow.
 *
 * ⚠️ THE STORE IS SPLIT, AND ONLY HALF OF IT IS WRITTEN TO DISK. An earlier
 * version persisted the WHOLE store on the reasoning that "Save & exit" implies
 * a resumable flow — and the effect was that opening the prototype showed
 * options already selected from a previous visit, which reads as though the
 * screens ship pre-filled. That rule still holds for every control: the flow
 * steps, the drafts, the baskets and the search fields all start empty every
 * time. **Nothing is selected until the user selects it.**
 *
 * What now survives a refresh is the COMPLETED work — added products, checks
 * run, days recorded, a saved finding — because those render as readouts, and
 * `/products`, `/check` and `/progress` are specified to open populated
 * anyway. `lib/store/persistence.ts` owns that seam and carries the reasoning;
 * `PERSISTED_KEYS` is the whole list.
 *
 * ⚠️ THIS IS STILL NOT RESUMABILITY. One device, one browser. `Save & exit`
 * does not resume a flow, and a deep link to another visitor's check-in has no
 * data behind it. That needs a backend, and the split does not pretend to be
 * one — see `docs/decisions.md`.
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
  const [hydrated, setHydrated] = useState(false);

  /**
   * ⚠️ HYDRATE IN AN EFFECT, NEVER IN THE `useState` INITIALISER. The server
   * renders with no storage, so seeding initial state from localStorage makes
   * the first client render disagree with the server's HTML and React throws a
   * hydration mismatch. Starting empty and filling in after mount is the only
   * shape that is correct in the App Router.
   */
  useEffect(() => {
    // one-time cleanup: an earlier build persisted the WHOLE store, and that
    // data — the flow selections this build refuses to restore — would
    // otherwise sit in visitors' browsers forever. It is deleted, never read.
    try {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // storage unavailable (private mode) — nothing to clean up
    }

    const saved = readPersisted();
    if (Object.keys(saved).length) {
      // merge UNDER anything already set this session: an effect runs after
      // paint, so a fast first interaction must not be overwritten by disk
      setAnswers((prev) => ({ ...saved, ...prev }));
    }
    setHydrated(true);
  }, []);

  /**
   * ⚠️ GATED ON `hydrated` AS STATE, NOT A REF. Effects run in declaration
   * order on mount, so a ref set above would already read true here while
   * `answers` is still the empty first-render value — and this would write `{}`
   * straight over the records it had just read. The state flag defers the first
   * write to the render AFTER hydration, when `answers` actually holds them.
   */
  useEffect(() => {
    if (!hydrated) return;
    writePersisted(answers);
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

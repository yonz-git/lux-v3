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
import {
  LEGACY_FLOW_V1_KEY,
  LEGACY_STORAGE_KEY,
  LEGACY_START_OTHER_KEY,
} from "./answers";
import { readFlow, readPersisted, writeFlow, writePersisted } from "./persistence";

/**
 * The investigation's answer store.
 *
 * ⚠️ THE FLOW'S ANSWERS SURVIVE FOR A DAY; NOTHING ELSE ABOUT A CONTROL EVER
 * SURVIVES. Drafts, baskets and search fields are in memory only, always.
 *
 * Answers carry across the steps because `app/layout.tsx` wraps the whole app,
 * so the provider stays mounted through client-side navigation. It is mounted
 * at the ROOT rather than at `app/investigation/layout.tsx` because the
 * PRODUCTS hub reads what step 5 writes and is reached from the bottom nav
 * rather than from inside the flow.
 *
 * ⚠️ THE STORE IS SPLIT THREE WAYS, AND EACH SLICE HAS ITS OWN LIFETIME.
 *
 *   completed records   forever      `PERSISTED_KEYS`  products, checks,
 *                                    check-ins, a saved finding
 *   the flow's answers  24 hours     `FLOW_KEYS`       steps 1–4, sliding
 *   everything else     the tab      by construction   drafts, baskets,
 *                                    search fields, the ambiguity answers
 *
 * ⚠️ THE MIDDLE ROW IS NEW — 7 Sep 2026, ASKED FOR — AND IT IS A REAL CHANGE TO
 * A RULE THIS FILE USED TO STATE ABSOLUTELY. An earlier version persisted the
 * WHOLE store on the reasoning that "Save & exit" implies a resumable flow, and
 * was reverted because opening the prototype then showed options selected in
 * some previous visit, which reads as though the screens ship pre-filled. The
 * fix at the time was "never persist a control". The fix now is narrower and
 * says what actually went wrong: state that belongs to NOBODY is the problem,
 * not state that belongs to the person still looking at the screen. Answers
 * from the last day are theirs; answers from three weeks ago are furniture.
 *
 * ⚠️ SO `/investigation/start` CAN NOW OPEN WITH CHIPS TICKED, AND THAT IS NOT
 * THE OLD BUG RETURNING. It happens only inside the window and only for
 * selections this browser made. Past it, `readFlow` drops the envelope AND
 * deletes it, and every screen is empty again. **Anything that makes a control
 * open filled from anywhere else is still the bug.**
 *
 * `lib/store/persistence.ts` owns both seams and carries the reasoning;
 * `PERSISTED_KEYS` and `FLOW_KEYS` are the whole of both lists.
 *
 * ⚠️ THIS IS STILL NOT RESUMABILITY. One device, one browser, no account, and
 * now also one day. `Save & exit` still does not resume a flow — it never
 * promised to reach another device, and it still cannot — and a deep link to
 * another visitor's check-in still has no data behind it. That needs a backend,
 * and the split does not pretend to be one — see `docs/decisions.md`.
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
  /**
   * ⚠️ WHETHER STORED RECORDS HAVE BEEN READ YET — exposed 13 Sep 2026. The
   * first render is always the empty store and the records arrive one commit
   * later (the hydration effect below), so anything that animates what
   * CHANGED — `CheckInCalendar`'s landing disc — must not count their arrival
   * as a change.
   */
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
      // step 1's own free-text key, orphaned when the description became
      // `locationOther` — never read, so it can only sit there
      window.localStorage.removeItem(LEGACY_START_OTHER_KEY);
      // the flow answers' first envelope, retired when step 1's `start` became
      // a map: this build reads `lux.flow.v2`, and nothing reads v1 to expire it
      window.localStorage.removeItem(LEGACY_FLOW_V1_KEY);
    } catch {
      // storage unavailable (private mode) — nothing to clean up
    }

    /* ⚠️ ONE `now` FOR THE READ, TAKEN HERE. `readFlow` needs a moment to
       measure the envelope's age against; taking it once means the expiry
       cannot be decided by a clock that moved between two calls. */
    const saved = { ...readPersisted(), ...readFlow(Date.now()) };
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
    /* ⚠️ EVERY WRITE RE-STAMPS THE WINDOW, WHICH IS WHAT MAKES IT SLIDING —
       see `FLOW_TTL_MS`. `Date.now()` is safe in an effect and would not be in
       render. An emptied store removes both keys rather than writing `{}`, so
       `reset()` needs nothing of its own. */
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

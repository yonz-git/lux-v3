# 018 — The analysis hands over from its passes

- **Status**: TODO
- **Commit**: `f23b117` (`design-trial`)
- **Severity**: MEDIUM
- **Category**: Preventing a jarring change, plus a hydration bug
- **Estimated scope**: 3 files, ~60 lines: `features/my-skin/components/Analysis.tsx`, `AnalysisPasses.tsx` + `.module.css`
- **Depends on**: plan 014, for ordering only. This plan relies on the page heading staying in place, which 014 makes true for the shell.

## Problem

```tsx
/* features/my-skin/components/Analysis.tsx:89-102 — current */
  const [running, setRunning] = useState(() => gaps(answers).length === 0);

  /* the one refusal that is a question rather than a dead end — see `center` */
  const unresolved = analysis.gaps[0]?.id === "unresolved-timeline";
  /* biome-ignore lint/correctness/useExhaustiveDependencies: RUNS ONCE, ON
     MOUNT. … */
  useEffect(() => {
    if (!running) return;
    const t = setTimeout(() => setRunning(false), PASSES_TOTAL_MS);
    return () => clearTimeout(t);
  }, []);
```

```tsx
/* Analysis.tsx:142-150 — current */
      center={!running && analysis.outcome === "none" && !unresolved}
    >
      {running ? (
        <AnalysisPasses />
      ) : analysis.outcome === "none" ? (
        <NoConclusion analysis={analysis} />
      ) : (
        <Hypotheses analysis={analysis} />
      )}
```

1. **The passes are skipped on a fresh load.** `running` is decided on the first render. `InvestigationProvider` fills the store from storage in an effect (`lib/store/InvestigationProvider.tsx:101-123`), so a reload or a direct visit renders its first frame with no answers:
   - `gaps()` is non-empty, so `running` starts false;
   - the mount-only effect never looks again;
   - the § 06 wait is skipped on exactly the visits that load the page fresh, while the same store reached by client navigation runs it.

2. **The hand-off is one commit (M3).** At `PASSES_TOTAL_MS` (2580ms) the orb, the title and the pass list vanish in a frame. The result's blocks then mount under `.body[data-reveal]` and fade up from 0, so the card is empty for the first frames.

3. **The title jumps on a refusal.** `center` turns true in that same commit when the outcome is `none`. `HubScreen` then moves the heading out of the card (`HubScreen.tsx:159` vs `:175`), so the `<h1>` unmounts, remounts in a different parent, re-fades, and the block re-centres.

## Target

- **A phase instead of a boolean**: `"pending" | "running" | "done"`.
  - `pending` holds until the store has hydrated, and renders the page with an empty card for that commit.
  - The decision is made once, from the hydrated store; the phase only moves forward.
- **`center` comes from the analysis, not the wait**: `phase !== "pending" && analysis.outcome === "none" && !unresolved`. `analyseInvestigation` is synchronous, so the outcome is known before the passes start, and they run where the answer will be. No hoist happens at the hand-off.
- **The passes leave before the answer arrives.** `useDialogPresence(phase === "running")` holds them for its 200ms exit.
  - `AnalysisPasses` gets `leaving`, rendered as `data-state="leaving"`.
  - `.hero[data-state="leaving"] { opacity: 0 }` transitions over `--duration-base` on `--ease-standard`.
  - The result mounts after that, on `.body`'s existing staggered reveal.
- **Accepted, and written down:**
  - The total wait grows by the 200ms exit, 2580 → 2780ms. `passesDuration` is the documented source of that number and stays untouched.
  - On desktop the card's height snaps at the instant invisible passes are replaced by an invisible result.
  - On a reload whose outcome is a refusal, `center` turns on one commit after arrival, while the page is still fading in.

## Repo conventions to follow

- **Holding a leaving node.** `useDialogPresence` + `data-state="leaving"` + a transition on the same 200ms is the app's recipe (`lib/useModalDialog.ts:151-194`; exemplar `Collapse.tsx:74-79`, which also derives "closing" from the open flag so there's no first frame without the attribute).
- **Waiting for hydration.** Gating a decision on `hydrated` has an exemplar in `features/progress/components/CheckInCalendar.tsx:155-159`.
- **The screen's rules.** "RUNS ONCE, ON ARRIVAL" and "do not re-expand it into a wizard" (AGENTS.md) still hold. This keeps one route and one wait.

## Steps

1. `Analysis.tsx`, imports. After `import { useInvestigation } from "@/lib/store/InvestigationProvider";` add

   ```tsx
   import { useDialogPresence } from "@/lib/useModalDialog";
   ```

2. Same file. Replace `  const { answers } = useInvestigation();` (the first line of `Analysis()`) with `  const { answers, hydrated } = useInvestigation();`.

3. Same file. Replace everything from `  const [running, setRunning] = useState(() => gaps(answers).length === 0);` through the end of the effect `  }, []);` (`:89-102`, quoted above) with

   ```tsx
     /* ⚠️ NOTHING IS DECIDED BEFORE THE STORE HAS HYDRATED — changed 13 Sep
        2026. The store fills in from storage in an effect, so a reload or a
        direct visit rendered its first frame with no answers: `gaps()` was
        non-empty, the passes were skipped, and a mount-only timer never looked
        again. `pending` renders the page with an empty card for that commit.
        The phase only ever moves forward, which is what keeps the rule above:
        answering the confirmation strip changes `answers`, never `phase`. */
     const [phase, setPhase] = useState<"pending" | "running" | "done">(() =>
       hydrated ? (gaps(answers).length === 0 ? "running" : "done") : "pending",
     );

     useEffect(() => {
       if (phase === "pending" && hydrated) {
         setPhase(gaps(answers).length === 0 ? "running" : "done");
       }
     }, [phase, hydrated, answers]);

     useEffect(() => {
       if (phase !== "running") return;
       const t = setTimeout(() => setPhase("done"), PASSES_TOTAL_MS);
       return () => clearTimeout(t);
     }, [phase]);

     /* ⚠️ THE PASSES LEAVE BEFORE THE ANSWER ARRIVES — added 13 Sep 2026. They
        were swapped for the result in one commit: the orb, the title and the
        list vanished in a frame and the result faded up into an empty card.
        They are held for `useDialogPresence`'s 200ms while they fade
        (`AnalysisPasses.module.css`); the result then arrives on `.body`'s own
        reveal. */
     const passes = useDialogPresence(phase === "running");
     const showPasses = phase === "running" || passes.present;

     /* the one refusal that is a question rather than a dead end — see `center` */
     const unresolved = analysis.gaps[0]?.id === "unresolved-timeline";
   ```

   Keep the two existing `⚠️` paragraphs above this block ("THE PASSES ONLY RUN IF…" and "AND WHEN THEY DO RUN, THEY RUN ONCE, ON ARRIVAL…") exactly as they are.

4. Same file, the `center` prop. Replace

   ```tsx
         center={!running && analysis.outcome === "none" && !unresolved}
       >
         {running ? (
           <AnalysisPasses />
         ) : analysis.outcome === "none" ? (
   ```

   with

   ```tsx
         /* ⚠️ DECIDED FROM THE OUTCOME, NOT FROM THE WAIT — changed 13 Sep 2026.
            `analyseInvestigation` is synchronous, so the outcome is known before
            the passes start. `center` used to switch on as they ended, which
            hoisted the page title out of the card mid-hand-off and re-faded it;
            the passes now run where the answer will be. */
         center={phase !== "pending" && analysis.outcome === "none" && !unresolved}
       >
         {phase === "pending" ? null : showPasses ? (
           <AnalysisPasses leaving={phase !== "running"} />
         ) : analysis.outcome === "none" ? (
   ```

   The existing long `center` comment above the prop stays; the new comment goes directly above `center=`.

5. `AnalysisPasses.tsx`. Replace

   ```tsx
   export function AnalysisPasses() {
     return (
       <div className={styles.hero}>
   ```

   with

   ```tsx
   export function AnalysisPasses({ leaving = false }: { leaving?: boolean }) {
     return (
       /* `leaving` fades the whole state out before the result replaces it — see
          `Analysis` */
       <div className={styles.hero} data-state={leaving ? "leaving" : undefined}>
   ```

6. `AnalysisPasses.module.css`. Replace

   ```css
   .hero {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: var(--space-2xl);
     width: 100%;
     padding: var(--space-4xl) 0;
   }
   ```

   with

   ```css
   .hero {
     display: flex;
     flex-direction: column;
     align-items: center;
     gap: var(--space-2xl);
     width: 100%;
     padding: var(--space-4xl) 0;
     transition: opacity var(--duration-base) var(--ease-standard);
   }

   /* ⚠️ THE PASSES FADE OUT BEFORE THE ANSWER ARRIVES — added 13 Sep 2026; see
      `Analysis`. A transition: it names nothing, so it may live here.
      `duration/base` is the app's exit interval and the 200ms
      `useDialogPresence` holds the node for — keep the two in step. */
   .hero[data-state="leaving"] {
     opacity: 0;
   }
   ```

## Boundaries

- Do NOT edit `features/my-skin/analysis.ts`, `PassList`, `passesDuration` or `PASSES_TOTAL_MS`.
- Do NOT add routes or steps, and do not re-run the passes when answers change.
- Do NOT change `HubScreen`.
- Do NOT animate the card's height.
- If the quoted code isn't found, STOP and report.

## Verification

- **Mechanical**: `npm run typecheck`, `npm run lint` and `npm run build` all exit 0.
- **Setup.** The passes only run when `gaps(answers)` is empty. Walk `/investigation/start` → step 5 with real answers (a symptom, a location, a skin type, a start date one to two weeks ago) and press Continue. If the analysis opens straight onto a refusal, the store still has a gap; fix step 4's date and try again.
- **Measured** (dev server, headless Chrome over CDP):
  - **Client navigation.** The hero is present on arrival. At about 2580ms it gets `data-state="leaving"`, and `getAnimations()` shows a `CSSTransition` on `opacity`, 200ms. The result's blocks mount only after the hero is gone, each with `lux-fade-in`.
  - **The heading.** Across the whole hand-off, the `<h1>`'s `getBoundingClientRect().top` doesn't change, and it gets no `lux-fade-in` after arrival.
  - **Reload.** Reload `/investigation/analysis` on the same store. The hero appears within two frames of hydration and the passes run, where before this plan they were skipped.
  - **Refusal.** With an empty store (a private window), the refusal renders centred with no passes and no console errors.
- **Feel check**:
  - DevTools → Animations at 10%. The passes fade out as one piece, and then the verdict and the blocks under it arrive in order. The title never moves.
  - Rendering → emulate `prefers-reduced-motion: reduce`. The hand-off swaps with no visible fade and no blank frame beyond the 200ms hold.
- **Done when**:
  - the passes run on reload;
  - the hero leaves over 200ms before the result mounts;
  - the page title is the same element in the same place from arrival to answer.

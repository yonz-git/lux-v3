"use client";

import { useEffect, useState } from "react";
import styles from "./PassList.module.css";
import { SuccessCheckIcon } from "./icons";

/**
 * A list of named steps that tick off while something is being worked out.
 *
 * ⚠️ IT LIVES IN `components/ui/` BECAUSE TWO SECTIONS USE IT — `my-skin`'s
 * analysis and CHECK's — and it has no opinion about what the steps SAY, which
 * is the test AGENTS.md sets for this folder. The lines themselves are data and
 * stay in each section's own module: `ANALYSIS_PASSES` in
 * `features/my-skin/analysis.ts`, `CHECK_PASSES` in `features/check/check.ts`.
 *
 * ⚠️ EACH LINE MUST NAME WORK THE CALLER ACTUALLY DOES, IN THE ORDER IT DOES
 * IT. That is the whole reason this exists rather than a spinner or a bar: a
 * bar says only that something is happening, and the point of both screens is
 * that you can see WHAT is being compared before you are asked to believe the
 * answer. It is also the line the product brief draws — "do not imply
 * laboratory-level certainty" — and a progress list narrating work the app is
 * not doing walks straight over it. If a pass is deleted from the code, delete
 * its line.
 *
 * ⚠️ ONE `role="progressbar"`, NOT ONE LIVE REGION PER LINE. Announcing each
 * step as it lands would read five or six sentences at a screen-reader user in
 * about two seconds. The progressbar carries the accessible NAME and
 * `aria-valuetext` says where it has got to — the split AGENTS.md describes for
 * `role="progressbar"`, which takes its name from a label and never from its
 * value.
 */
export function PassList({
  passes,
  label,
  stepMs = DEFAULT_STEP_MS,
  className,
}: {
  passes: readonly string[];
  /** the accessible name — `role="progressbar"` requires one */
  label: string;
  stepMs?: number;
  className?: string;
}) {
  const [done, setDone] = useState(0);

  /* biome-ignore lint/correctness/useExhaustiveDependencies: A FIXED-LENGTH
     SEQUENCE, RUN ONCE. `passes` is usually a module constant but a caller
     could pass a fresh array; listing it would clear and restart the timers on
     every render and the list would never finish. The length is what matters
     and it does not change within a mount. */
  useEffect(() => {
    const timers = passes.map((_, i) =>
      setTimeout(() => setDone(i + 1), stepMs * (i + 1))
    );
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [stepMs]);

  const current = Math.min(done, passes.length - 1);

  return (
    <ol
      className={[styles.list, className].filter(Boolean).join(" ")}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={passes.length}
      aria-valuenow={done}
      aria-valuetext={passes[current]}
    >
      {passes.map((line, i) => (
        <li
          key={line}
          className={styles.pass}
          data-state={i < done ? "done" : i === done ? "active" : "waiting"}
        >
          {/* a fixed slot, so the lines do not shift sideways as ticks appear —
              the list is being read while it changes, and reflowing text under
              the reader's eye is the one thing a progress list must not do */}
          <span className={styles.mark} aria-hidden="true">
            {i < done ? <SuccessCheckIcon className={styles.tick} /> : null}
          </span>
          <span className="t-body3">{line}</span>
        </li>
      ))}
    </ol>
  );
}

/** How long each line is shown before the next one lights up. */
export const DEFAULT_STEP_MS = 380;

/**
 * How long a `PassList` takes to finish, plus a beat to read the last line.
 *
 * ⚠️ CALLERS MUST USE THIS RATHER THAN THEIR OWN NUMBER. Both screens navigate
 * or swap content when the list ends, and a hardcoded duration beside a list
 * whose length can change is a wait that either cuts the last step off or hangs
 * after it.
 */
export function passesDuration(count: number, stepMs = DEFAULT_STEP_MS): number {
  return stepMs * count + 300;
}

import Link from "next/link";
import { BottomNav } from "@/components/BottomNav";
import { StepProgress } from "@/components/StepProgress";
import { stepFor } from "@/lib/flow";

/**
 * Step 8/8 — PRODUCTS.
 *
 * A deliberate placeholder, not a screen. Products is its own wireframe section
 * (12 screens x 2 breakpoints, Figma `04 — Add products intro` 574:1342 onward)
 * and has not been translated yet. Without this route the flow would 404 the
 * moment someone finished 03c, which reads as a bug rather than as unbuilt work.
 *
 * Replace it with the real screen — do not grow it into one.
 */
export default function Page() {
  return (
    <main className="screen" data-layout="flow">
      <div style={{ width: "100%", maxWidth: 392 }}>
        <StepProgress step={stepFor("products").step} />
        <h1 className="t-h3" style={{ marginTop: "var(--space-3xl)" }}>
          Products — not built yet
        </h1>
        <p
          className="t-body3"
          style={{
            marginTop: "var(--space-md)",
            color: "var(--color-text-secondary)",
          }}
        >
          Step 8 of 8 is the PRODUCTS section, designed in Figma but not yet
          translated. The investigation flow ends here for now.
        </p>
        <Link
          href="/"
          className="t-label"
          style={{
            display: "inline-block",
            marginTop: "var(--space-2xl)",
            color: "var(--color-text-brand)",
          }}
        >
          Back to the start
        </Link>
      </div>
      <BottomNav active="check" />
    </main>
  );
}

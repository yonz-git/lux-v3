/**
 * The investigation steps used to own the answer store. They no longer do —
 * `app/layout.tsx` provides it for the whole app, because the PRODUCTS hub
 * under /products reads the same products step 6 writes and is reached from
 * the bottom nav rather than from inside the flow.
 *
 * This layout stays as the segment's own boundary; a step-scoped concern (a
 * flow-wide banner, a resume prompt) belongs here rather than at the root.
 */
export default function InvestigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

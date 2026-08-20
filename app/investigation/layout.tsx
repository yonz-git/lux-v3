import { InvestigationProvider } from "@/components/InvestigationProvider";

/**
 * Every investigation step shares one answer store, so an answer given on 02a
 * is still there on 02b (which echoes it back in the user bubble).
 */
export default function InvestigationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InvestigationProvider>{children}</InvestigationProvider>;
}

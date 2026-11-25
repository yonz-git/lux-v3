import { ProgressScreen } from "@/features/progress/components/ProgressScreen";
import { caseStudyAnswers } from "@/features/progress/caseStudy";
import { InvestigationProvider } from "@/lib/store/InvestigationProvider";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/** My skin with a filled-in profile and a week of check-ins and photos, for
 *  the case study. Reads and writes none of the browser's saved answers. */
export const metadata: Metadata = { title: metadataTitleFor("/myskin/case-study") };

export const dynamic = "force-dynamic";

export default function Page() {
  const now = Date.now();
  return (
    <InvestigationProvider seed={caseStudyAnswers(new Date(now))}>
      <ProgressScreen now={now} />
    </InvestigationProvider>
  );
}

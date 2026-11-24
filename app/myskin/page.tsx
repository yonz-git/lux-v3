import { ProgressScreen } from "@/features/progress/components/ProgressScreen";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/myskin") };

export const dynamic = "force-dynamic";

export default function Page() {
  return <ProgressScreen now={Date.now()} />;
}

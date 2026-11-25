import { SkinProfileSummary } from "@/features/my-skin/components/SkinProfileSummary";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/investigation/profile") };

export const dynamic = "force-dynamic";

export default function Page() {
  return <SkinProfileSummary now={Date.now()} />;
}

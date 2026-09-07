import { SkinProfileSummary } from "@/features/my-skin/components/SkinProfileSummary";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/investigation/profile") };

/* ⚠️ DYNAMIC ON PURPOSE, AND IT IS ABOUT THE CLOCK — the same reason the three
   PROGRESS routes are. `now` seeds the first client render so hydration matches
   (see `lib/useToday.ts`); prerendered, it would be the BUILD time, and the
   recap's "18 days ago" would be that stale on first paint before the browser's
   own date corrected it. Rendered per request it is within a timezone of the
   reader's clock. It is the only route under `/investigation` that needs this,
   because it is the only one that measures a span against today. */
export const dynamic = "force-dynamic";

export default function Page() {
  return <SkinProfileSummary now={Date.now()} />;
}

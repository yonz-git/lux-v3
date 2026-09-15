import { CheckBuilder } from "@/features/check/components/CheckBuilder";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/check/new") };

/* ⚠️ DYNAMIC ON PURPOSE, AND IT IS ABOUT THE CLOCK — since 15 Sep 2026, when
   the page took PROGRESS's skin profile card, whose `Started <date> · Day <n>`
   is measured against today. Same reasoning as `/progress`: `now` seeds the
   first client render so hydration matches (see `lib/useToday.ts`), and
   prerendered it would be the BUILD time. */
export const dynamic = "force-dynamic";

export default function Page() {
  return <CheckBuilder now={Date.now()} />;
}

import { SkinType } from "@/features/my-skin/components/SkinType";
import type { Metadata } from "next";
import { metadataTitleFor } from "@/lib/pageTitles";

/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart. */
export const metadata: Metadata = { title: metadataTitleFor("/investigation/skin-type") };

export default function Page() {
  return <SkinType />;
}

import type { Metadata } from "next";
import { LogoEntrance } from "@/components/layout/LogoEntrance";
import { Welcome } from "@/features/my-skin/components/Welcome";
import { metadataTitleFor } from "@/lib/pageTitles";

/* The route's own `<title>`, product name included — see `metadataTitleFor`.
   Shared with `RouteAnnouncer`, so the tab label and the sentence a screen
   reader hears on navigation cannot drift apart.

   ⚠️ STILL "Welcome", AND THE ENTRANCE DELIBERATELY DOES NOT TOUCH IT. The
   lockup animation is an overlay, not a route and not a page: it is
   `aria-hidden`, it owns no heading, it is out of the DOM within three seconds,
   and the document this route describes is Welcome's throughout. A route of its
   own would have taken `/` from Welcome and become a back-button destination —
   see the doc comment on `LogoEntrance`. */
export const metadata: Metadata = { title: metadataTitleFor("/") };

export default function Page() {
  return (
    <>
      {/* ⚠️ BEFORE `<Welcome>`, NOT INSIDE IT. Welcome renders its own
          `<main className="screen">` and the entrance has to be its sibling:
          the veil is `position: fixed` at `--z-entrance`, above even the nav,
          and nesting it would put it inside `.welcome`'s stacking context
          (z-index 1, created for the shader) where it could not cover the nav.
          Rendering it first also means it is the first thing painted. */}
      <LogoEntrance />
      <Welcome />
    </>
  );
}

import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { InvestigationProvider } from "@/components/InvestigationProvider";
import { RouteAnnouncer } from "@/components/RouteAnnouncer";

/**
 * Figtree is the LUX typeface. Poppins was used early on and must not come back.
 * Only the three weights in the ramp are loaded: Light (Metric styles), Regular
 * (Body 1/2/3, Button, Button Small) and Medium (everything else). SemiBold and
 * Bold are deliberately absent — if text renders bold, that is drift.
 */
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-figtree",
  display: "swap",
});

/**
 * ⚠️ THIS TITLE IS A FALLBACK NOW, NOT THE APP'S TITLE. Every route used to
 * render the same `<title>LUX</title>` because this was the only one set and no
 * page overrode it — a WCAG 2.4.2 failure, since a title has to describe the
 * page's topic or purpose, and the reason a client-side navigation had nothing
 * to announce. Each page exports its own via `metadataTitleFor`; this covers
 * anything that does not, such as the 404.
 */
export const metadata: Metadata = {
  title: "LUX",
  description:
    "An AI-guided skincare investigation. This is not a medical diagnosis tool.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#cedee2",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={figtree.variable}>
      {/* The answer store wraps the WHOLE app, not just /investigation.
          The PRODUCTS hub (/products) reads the same products the add flow
          writes, and it is reached from the bottom nav rather than from inside
          the flow — a provider scoped to /investigation would hand it an empty
          list every time. Still IN MEMORY ONLY: a reload starts clean. */}
      <body>
        {/* speaks each client-side navigation and moves focus into the new
            screen — the App Router provides neither. See the component. */}
        <RouteAnnouncer />
        <InvestigationProvider>{children}</InvestigationProvider>
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";
import { InvestigationProvider } from "@/components/InvestigationProvider";

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
        <InvestigationProvider>{children}</InvestigationProvider>
      </body>
    </html>
  );
}

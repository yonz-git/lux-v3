import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}

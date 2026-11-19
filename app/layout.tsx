import type { Metadata, Viewport } from "next";
import { Figtree, Manrope } from "next/font/google";
import "./globals.css";
import { InvestigationProvider } from "@/lib/store/InvestigationProvider";
import { RouteAnnouncer } from "@/components/layout/RouteAnnouncer";
import { MotionObserver } from "@/components/layout/MotionObserver";
import { SmoothScroll } from "@/components/layout/SmoothScroll";
import { SnackbarProvider } from "@/components/layout/Snackbar";
import { AppCanvas } from "@/components/layout/CanvasShader";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-figtree",
  display: "swap",
});

/* the headings' font — a variable font, so every weight comes in one file */
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
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
  themeColor: "#d3e4e7",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${figtree.variable} ${manrope.variable}`}>
      {/* The answer store wraps the WHOLE app, not just /investigation.
          The PRODUCTS hub (/products) reads the same products the add flow
          writes, and it is reached from the bottom nav rather than from inside
          the flow — a provider scoped to /investigation would hand it an empty
          list every time. Still IN MEMORY ONLY: a reload starts clean. */}
      <body>
        <AppCanvas />
        {/* speaks each client-side navigation and moves focus into the new
            screen — the App Router provides neither. See the component. */}
        <RouteAnnouncer />
        <MotionObserver />
        {/* eases the page's WHEEL scroll on every route — touch, keyboard and
            modals are left to the browser. See the component. */}
        <SmoothScroll />
        <InvestigationProvider>
          <SnackbarProvider>{children}</SnackbarProvider>
        </InvestigationProvider>
      </body>
    </html>
  );
}

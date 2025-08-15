import "@workspace/ui/globals.css";

import { Geist, Geist_Mono } from "next/font/google";
import { draftMode } from "next/headers";
import { VisualEditing } from "next-sanity";
import { Suspense } from "react";
import { preconnect, prefetchDNS } from "react-dom";

import { FooterServer, FooterSkeleton } from "@/components/footer";
import { CombinedJsonLd } from "@/components/json-ld";
import { NavbarServer, NavbarSkeleton } from "@/components/navbar";
import { PreviewBar } from "@/components/preview-bar";
import { SanityLive } from "@/lib/sanity/live";

import { Providers } from "../components/providers";
import { ClientProviders } from "@/components/client-providers";

const fontGeist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700"],
  display: "optional",
});

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "700"],
  display: "optional",
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  preconnect("https://cdn.sanity.io");
  prefetchDNS("https://cdn.sanity.io");

  const { isEnabled } = await draftMode();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontGeist.variable} ${fontMono.variable} font-geist antialiased`}
      >
        <ClientProviders>
          <Providers>
            <Suspense fallback={<NavbarSkeleton />}>
              <NavbarServer />
            </Suspense>

            {children}

            <SanityLive />
            <CombinedJsonLd includeWebsite includeOrganization />

            {isEnabled && (
              <>
                <PreviewBar />
                <VisualEditing />
              </>
            )}
          </Providers>
        </ClientProviders>
      </body>
    </html>
  );
}

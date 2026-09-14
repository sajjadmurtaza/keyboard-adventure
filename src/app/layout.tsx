import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Fredoka, Nunito } from "next/font/google";
import { ProductionGuards } from "@/components/ProductionGuards";
import { NO_SELECT_CSS } from "@/utils/pageLock";
import { SITE_DESCRIPTION, SITE_TITLE, jsonLd, siteUrl } from "@/lib/seo";
import "./globals.css";

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: SITE_TITLE,
    template: "%s – Keyboard Adventure",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Keyboard Adventure",
  keywords: [
    "typing for kids",
    "keyboard practice for children",
    "learn keyboard letters",
    "kids typing lessons",
    "beginner typing practice",
    "touch typing for children",
  ],
  authors: [{ name: "Keyboard Adventure" }],
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl(),
    siteName: "Keyboard Adventure",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#7657E8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans">
        <style dangerouslySetInnerHTML={{ __html: NO_SELECT_CSS }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }}
        />
        {children}
        <ProductionGuards />
      </body>
    </html>
  );
}

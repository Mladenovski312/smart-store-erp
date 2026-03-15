import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import GiftFinder from "@/components/GiftFinder";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://interstarjumbo.com"),
  manifest: "/manifest.json",
  title: {
    default: "Интер Стар Џамбо | Играчки Куманово",
    template: "%s | Интер Стар Џамбо",
  },
  description: "Најдобриот избор на играчки во Куманово. Lego, Barbie, Paw Patrol и повеќе.",
  openGraph: {
    title: "Интер Стар Џамбо | Играчки Куманово",
    description: "Најдобриот избор на играчки во Куманово. Lego, Barbie, Paw Patrol и повеќе.",
    url: "https://interstarjumbo.com",
    siteName: "Интер Стар Џамбо",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Интер Стар Џамбо | Играчки Куманово",
      },
    ],
    locale: "mk_MK",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Интер Стар Џамбо | Играчки Куманово",
    description: "Најдобриот избор на играчки во Куманово. Lego, Barbie, Paw Patrol и повеќе.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.png", sizes: "32x32" },
      { url: "/icon.png", sizes: "512x512" },
    ],
    apple: "/icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mk">
      <head>
        <meta name="theme-color" content="#ffffff" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gray-50`} suppressHydrationWarning>
        <AuthProvider>
          {children}
          <GiftFinder />
        </AuthProvider>
      </body>
    </html>
  );
}

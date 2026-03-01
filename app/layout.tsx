import type { Metadata, Viewport } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin", "cyrillic"] });
const geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'ОПГ "Малиновка" — Торговая площадка игровых предметов',
  description:
    "Покупайте и продавайте предметы и имущество игры Малиновка за виртуальную валюту",
  generator: "v0.app",
  metadataBase: new URL("https://www.opgmalmarket.com"),
  openGraph: {
    title: 'ОПГ "Малиновка" — Торговая площадка игровых предметов',
    description:
      "Покупайте и продавайте предметы и имущество игры Малиновка за виртуальную валюту",
    url: "https://www.opgmalmarket.com/",
    siteName: "opgmalmarket",
    type: "website",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: 'ОПГ "Малиновка"',
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'ОПГ "Малиновка" — Торговая площадка игровых предметов',
    description:
      "Покупайте и продавайте предметы и имущество игры Малиновка за виртуальную валюту",
    images: ["/og.png"],
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1a1a2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`${inter.className} ${geistMono.className} antialiased`}>
        {children}
        <Toaster theme="dark" position="top-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}

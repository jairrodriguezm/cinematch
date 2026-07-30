import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LiquidBackground from "@/components/LiquidBackground";
import PWAInstallBanner from "@/components/PWAInstallBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07070a" },
    { media: "(prefers-color-scheme: light)", color: "#0f172a" }
  ]
};

export const metadata: Metadata = {
  title: "Movie Match — Películas en Match",
  description: "Desliza y empareja películas con tu pareja o amigos al estilo iOS.",
  applicationName: "Movie Match",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Movie Match",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#050508] text-slate-100 flex justify-center items-start p-0 m-0 overflow-x-hidden">
        <LiquidBackground />

        <div className="w-full max-w-md min-h-screen bg-[#07070a]/40 backdrop-blur-2xl shadow-2xl relative flex flex-col border-x border-white/5 overflow-hidden">
          {children}
        </div>

        <PWAInstallBanner />
      </body>
    </html>
  );
}

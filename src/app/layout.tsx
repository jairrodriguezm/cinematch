import type { Metadata, Viewport } from "next";
import { Inter, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import PWAInstallBanner from "@/components/PWAInstallBanner";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/context/AuthContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

export const metadata: Metadata = {
  title: "CineMatch - Calificar",
  description: "CineMatch - Califica películas en vivo",
  applicationName: "CineMatch",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "CineMatch",
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
    <html lang="es" className={`${inter.variable} ${hanken.variable} ${jetbrains.variable} dark h-full antialiased`}>
      <body className="bg-black text-white h-screen max-h-screen overflow-hidden flex flex-col font-sans relative select-none p-0 m-0">
        <AuthProvider>
          <div className="w-full h-full relative flex flex-col overflow-hidden">
            {children}
          </div>
          <BottomNav />
        </AuthProvider>
        <PWAInstallBanner />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import ReactQueryProvider from "./ReactQueryProvider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "./api/uploadthing/core";

// Nacitani lokalnich fontu pro aplikaci
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

// Metadata pro SEO a nazev zalozky v prohlizeci
export const metadata: Metadata = {
  title: {
    template: "%s | PrachSocial", // Pattern pro nazev stranky
    default: "PrachSocial", // Defaultni nazev (pokud neni definovan title)
  },
  description: "The social full of Prach",
};

// Hlavni layout aplikace, ktery obaluje vsechny stranky
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {/* UploadThing plugin pro nahravani souboru */}
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        {/* Provider pro React Query (cache a state management) */}
        <ReactQueryProvider>
          {/* Provider pro theme (svetly/tmavy rezim) */}
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ReactQueryProvider>
        {/* Komponenta pro zobrazovani toast notifikaci */}
        <Toaster />
      </body>
    </html>
  );
}

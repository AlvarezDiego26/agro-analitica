import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AppProviders } from "../providers/app-providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "AgroAnalitica",
  description: "Core platform mobile-first para analítica agrícola"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning className={inter.className}>
      <body suppressHydrationWarning className="antialiased">
        <AppProviders>{children}</AppProviders>
        <Toaster richColors position="top-right" closeButton theme="light" />
      </body>
    </html>
  );
}

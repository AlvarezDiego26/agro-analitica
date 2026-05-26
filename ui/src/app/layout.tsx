import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { AppProviders } from "../providers/app-providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "AgroAnalitica",
  description: "Core platform mobile-first para analítica agrícola"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className="antialiased">
        <AppProviders>{children}</AppProviders>
        <Toaster richColors position="top-right" closeButton theme="light" />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

import { AppHeader } from "@/widgets/header";

export const metadata: Metadata = {
  title: "CampusPolio",
  description: "CampusPolio Next.js application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="flex min-h-screen flex-col">
        <AppHeader />
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}

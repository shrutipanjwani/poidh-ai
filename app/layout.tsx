import type { Metadata } from "next";
import "./globals.css";
import ClientProvider from "./client";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_API_BASE_URL || ""),
  title: "Poidh AI",
  description: "poidh alternate client powered by AI",
  openGraph: {
    title: "Poidh AI",
    description: "poidh alternate client powered by AI",
    url: "/",
    siteName: "Poidh AI",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}

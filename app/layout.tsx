import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nano Banana - Admin Panel",
  description: "Admin panel for Nano Banana application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"  data-arp="">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

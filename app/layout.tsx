import type { Metadata } from "next";
import "./globals.css";
import "./index.css";
import { ReduxProvider } from "@/lib/store/ReduxProvider";
import AuthInitializer from "@/components/auth/AuthInitializer";
import NextTopLoader from 'nextjs-toploader';

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
        <ReduxProvider>
          <AuthInitializer>
            <NextTopLoader 
              color="#FFB22C"
              height={3}
              showSpinner={false}
            />
            {children}
          </AuthInitializer>
        </ReduxProvider>
      </body>
    </html>
  );
}

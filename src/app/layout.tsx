import type { Metadata } from "next";
import { Outfit, Dancing_Script } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/navbar/navbar-wrapper";
import { Suspense } from "react";
import Loading from "./loading";

// export const dynamic = 'force-static'

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancingscript",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blood Bridge",
  description: "A platform connecting blood donors with those in need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Hide navbar for blocked users
  // Hide navbar for /blocked-home using next/navigation (client-side)
  let isBlockedPage = false;
  if (typeof window !== 'undefined') {
    isBlockedPage = window.location.pathname.startsWith('/blocked-home');
  }
  return (
    <html lang="en" suppressHydrationWarning>
      <body
          className={`${outfit.variable} ${dancingScript.variable} font-outfit antialiased`}
      >
          <div className="relative flex min-h-screen flex-col">
            {!isBlockedPage && <NavbarWrapper />}
            <main className="flex-1">
              <Suspense fallback={<Loading/>}>
                {children}
              </Suspense>
            </main>
          </div>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Outfit, Dancing_Script } from "next/font/google";
import "./globals.css";
import NavbarWrapper from "@/components/navbar/navbar-wrapper";
import { Suspense } from "react";
import Loading from "./loading";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const dancingScript = Dancing_Script({
  variable: "--font-dancingscript",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Blood Bridge - Connect Blood Donors",
  description: "A platform connecting blood donors with those in need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
          className={`${outfit.variable} ${dancingScript.variable} font-outfit antialiased`}
      >
          <div className="relative flex min-h-screen flex-col">
            <NavbarWrapper />
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

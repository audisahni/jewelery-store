import type { Metadata } from "next";
import { Cormorant_Garamond, DM_Sans, Jost } from "next/font/google";
import "./globals.css";
import { constructMetadata } from "@/lib/seo";

const cormorant = Cormorant_Garamond({ 
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-cormorant"
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans"
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-jost"
});

export const metadata: Metadata = constructMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${dmSans.variable} ${jost.variable}`}>
      <body className="min-h-screen flex flex-col relative antialiased selection:bg-primary/20 selection:text-primary">
        <div className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.03] mix-blend-overlay bg-[url('/noise.png')]"></div>
        {children}
      </body>
    </html>
  );
}
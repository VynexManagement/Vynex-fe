import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Roboto } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"], // recommended weights
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadFlow | Premium Shopify Leads",
  description:
    "Find laser-targeted Shopify stores by niche, country, and marketing signal. Preview leads instantly, pay once, download your CSV.",
  keywords: "shopify leads, shopify stores, lead generation, email marketing leads",
  openGraph: {
    title: "LeadFlow — Premium Shopify Leads",
    description: "Targeted Shopify store leads with signal-based filtering.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${roboto.variable} font-sans antialiased`}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}


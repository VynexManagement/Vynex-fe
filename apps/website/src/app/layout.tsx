import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Navbar } from "@leadflow/ui";
import { Footer } from "../features/landing/_components/Footer";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadFlow | Premium Shopify Leads",
  description:
    "Find laser-targeted Shopify stores by niche, country, and marketing signal. Preview leads instantly, pay once, download your CSV.",
  keywords: "shopify leads, shopify stores, lead generation, email marketing leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${sans.className} bg-white antialiased`}>
        <Navbar isMarketing={true} loginUrl="http://localhost:3001/login" signupUrl="http://localhost:3001/signup" homeUrl="/" />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

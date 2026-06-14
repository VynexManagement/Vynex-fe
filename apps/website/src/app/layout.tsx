import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import { Navbar, Footer } from "@leadflow/ui";
import "./globals.css";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
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
      <body className={`${roboto.variable} font-sans bg-white antialiased`}>
        <Navbar isMarketing={true} loginUrl="http://localhost:3001/login" signupUrl="http://localhost:3001/signup" homeUrl="#" />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}

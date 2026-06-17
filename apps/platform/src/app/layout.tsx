import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import QueryProvider from "@/components/QueryProvider";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "LeadFlow Console",
  description: "LeadFlow Client Console",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${sans.className} bg-[#f8fafc] text-slate-800 antialiased`}>
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}

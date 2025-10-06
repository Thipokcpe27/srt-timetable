import type { Metadata } from "next";
import { Sarabun } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ToastContainer";

const sarabun = Sarabun({
  subsets: ["thai", "latin"],
  weight: ["400", "600", "700"],
  variable: "--font-sarabun",
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  title: "🚆 SRT Timetable - ตารางรถไฟ",
  description: "ค้นหาตารางรถไฟ การรถไฟแห่งประเทศไทย",
};

// Disable font optimization for faster initial load
export const dynamic = 'force-static';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${sarabun.className} antialiased`}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}

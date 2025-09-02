import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pacific Deep Sky",
  description: "Astrophotography by Jeff Ray Watts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <header style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>Pacific Deep Sky</div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>Astrophotography by Jeff Ray Watts</div>
        </header>
        {children}
      </body>
    </html>
  );
}

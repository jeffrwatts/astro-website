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
        {/* Hide site header when detail page opts into fullscreen (fs=1) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var params = new URLSearchParams(location.search);
                  var hide = params.get('fs') === '1';
                  if (!hide) {
                    var header = document.createElement('div');
                    header.innerHTML = '<div style="padding:16px 24px;border-bottom:1px solid rgba(255,255,255,0.08);margin-bottom:12px"><div style="font-size:22px;font-weight:700">Pacific Deep Sky</div><div style="color:var(--muted);font-size:14px">Astrophotography by Jeff Ray Watts</div></div>';
                    document.currentScript.parentNode.insertBefore(header.firstChild, document.currentScript);
                  }
                } catch (_) {}
              })();
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}

"use client";

import NextImage from "next/image";

export default function SiteHeader() {
  return (
    <div style={{ padding: "2px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <NextImage 
          src="/logo-white.png" 
          alt="Island Skies Astro" 
          width={80} 
          height={80} 
          style={{ objectFit: "contain" }}
        />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-cinzel)" }}>Island Skies Astro</div>
          <div style={{ color: "var(--muted)", fontSize: 15 }}>Astrophotography by Jeff Ray Watts</div>
        </div>
      </div>
    </div>
  );
}

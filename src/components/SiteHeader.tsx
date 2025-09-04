"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Image from "next/image";

export default function SiteHeader() {
  const params = useSearchParams();
  const pathname = usePathname();
  const hideForFullscreen = params.get("fs") === "1";
  const hideForDetailRoute = pathname?.startsWith("/image/") ?? false;
  if (hideForFullscreen || hideForDetailRoute) return null;
  return (
    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Image 
          src="/logo-white.png" 
          alt="Island Skies Astro" 
          width={48} 
          height={48} 
          style={{ objectFit: "contain" }}
        />
        <div>
          <div style={{ fontSize: 24, fontWeight: 700 }}>Island Skies Astro</div>
          <div style={{ color: "var(--muted)", fontSize: 15 }}>Astrophotography by Jeff Ray Watts</div>
        </div>
      </div>
    </div>
  );
}



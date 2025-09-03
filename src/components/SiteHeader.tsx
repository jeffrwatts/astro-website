"use client";

import { useSearchParams, usePathname } from "next/navigation";

export default function SiteHeader() {
  const params = useSearchParams();
  const pathname = usePathname();
  const hideForFullscreen = params.get("fs") === "1";
  const hideForDetailRoute = pathname?.startsWith("/image/") ?? false;
  if (hideForFullscreen || hideForDetailRoute) return null;
  return (
    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>Pacific Deep Sky</div>
      <div style={{ color: "var(--muted)", fontSize: 14 }}>Astrophotography by Jeff Ray Watts</div>
    </div>
  );
}



"use client";

import { useSearchParams } from "next/navigation";

export default function SiteHeader(): JSX.Element | null {
  const params = useSearchParams();
  const hide = params.get("fs") === "1";
  if (hide) return null;
  return (
    <div style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)", marginBottom: 12 }}>
      <div style={{ fontSize: 22, fontWeight: 700 }}>Pacific Deep Sky</div>
      <div style={{ color: "var(--muted)", fontSize: 14 }}>Astrophotography by Jeff Ray Watts</div>
    </div>
  );
}



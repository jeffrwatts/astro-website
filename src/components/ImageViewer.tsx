"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  url: string;
  title: string;
  prevHref?: string;
  nextHref?: string;
  closeHref?: string;
};

export default function ImageViewer({ url, title, prevHref, nextHref, closeHref = "/" }: Props) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  React.useEffect(() => {
    function onChange() {
      const fsEl = (document as any).fullscreenElement as Element | null;
      setIsFullscreen(!!fsEl);
    }
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const toggleFullscreen = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height: 0, paddingBottom: "66%", borderRadius: 8, overflow: "hidden" }}
      onTouchStart={(e: React.TouchEvent<HTMLDivElement>) => {
        e.currentTarget.dataset.touchX = String(e.touches[0].clientX);
      }}
      onTouchEnd={(e: React.TouchEvent<HTMLDivElement>) => {
        const startXStr = e.currentTarget.dataset.touchX;
        const startX = startXStr ? parseFloat(startXStr) : undefined;
        if (startX == null) return;
        const endX = e.changedTouches[0].clientX;
        const dx = endX - startX;
        if (Math.abs(dx) > 40) {
          if (dx < 0 && nextHref) {
            router.push(nextHref);
          } else if (dx > 0 && prevHref) {
            router.push(prevHref);
          }
        }
      }}
    >
      <Image
        src={url}
        alt={title}
        fill
        style={{ objectFit: "contain", background: "#000" }}
        sizes="(max-width: 1024px) 100vw, 900px"
        quality={70}
        priority
      />

      {/* Top overlay: title + actions */}
      <div
        style={{
          position: "absolute",
          top: 8,
          left: 8,
          right: 8,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          pointerEvents: "none",
        }}
      >
        {/* Exit fullscreen icon (persistent top-left when in fullscreen) */}
        {isFullscreen && (
          <button
            onClick={toggleFullscreen}
            aria-label="Exit fullscreen"
            style={{
              pointerEvents: "auto",
              background: "rgba(0,0,0,0.6)",
              color: "#fff",
              width: 36,
              height: 36,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: 16 }}>⤡</span>
          </button>
        )}

        <div style={{
          pointerEvents: "auto",
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          paddingLeft: isFullscreen ? 8 : 0,
        }}>
          <div style={{ color: "#f3f4f6", fontWeight: 600, textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>{title}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
              style={{
                background: "rgba(75,85,99,0.65)",
                color: "#f3f4f6",
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 18 }}>{isFullscreen ? "⤡" : "⤢"}</span>
            </button>
            <Link
              href={closeHref}
              aria-label="Close"
              style={{
                background: "rgba(75,85,99,0.65)",
                color: "#f3f4f6",
                width: 36,
                height: 36,
                borderRadius: 999,
                border: "1px solid rgba(255,255,255,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: 18 }}>✕</span>
            </Link>
          </div>
        </div>
      </div>

      {prevHref && (
        <Link
          href={prevHref}
          style={{
            position: "absolute",
            top: "50%",
            left: 12,
            transform: "translateY(-50%)",
            background: "rgba(75,85,99,0.65)",
            color: "#f3f4f6",
            width: 56,
            height: 96,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.35,
            transition: "opacity 150ms ease-in-out",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.opacity = "0.35"; }}
          aria-label="Previous image"
        >
          <span style={{ fontSize: 32 }}>❮</span>
        </Link>
      )}
      {nextHref && (
        <Link
          href={nextHref}
          style={{
            position: "absolute",
            top: "50%",
            right: 12,
            transform: "translateY(-50%)",
            background: "rgba(75,85,99,0.65)",
            color: "#f3f4f6",
            width: 56,
            height: 96,
            borderRadius: 12,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: 0.35,
            transition: "opacity 150ms ease-in-out",
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.opacity = "0.35"; }}
          aria-label="Next image"
        >
          <span style={{ fontSize: 32 }}>❯</span>
        </Link>
      )}
    </div>
  );
}



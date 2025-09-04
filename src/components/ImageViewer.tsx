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
  pseudoFullscreen?: boolean;
  exitHref?: string;
  enterFsHref?: string;
  blurDataURL?: string;
};

export default function ImageViewer({ url, title, prevHref, nextHref, pseudoFullscreen = false, exitHref, enterFsHref, blurDataURL }: Props) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const requestNativeFullscreen = React.useCallback(() => {
    const el = document.documentElement as HTMLElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      void el.requestFullscreen().catch(() => { /* ignore */ });
    }
  }, []);

  const exitNativeFullscreen = React.useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => { /* ignore */ });
    }
  }, []);

  const handleNavigation = React.useCallback((href: string) => {
    setIsLoading(true);
    router.push(href);
  }, [router]);

  return (
    <div
      ref={containerRef}
      style={pseudoFullscreen
        ? { position: "relative", width: "100%", height: "100dvh", borderRadius: 0, overflow: "hidden" }
        : { position: "relative", width: "100%", height: 0, paddingBottom: "66%", borderRadius: 8, overflow: "hidden" }
      }
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement | null;
        if (target && target.closest && target.closest('a')) {
          return; // Don't hijack clicks on navigation controls
        }
        if (!pseudoFullscreen) {
          if (enterFsHref) {
            // Try to enter native fullscreen first, then navigate to fs=1
            if (!document.fullscreenElement) {
              requestNativeFullscreen();
            }
            router.push(enterFsHref);
          }
        } else if (pseudoFullscreen && !document.fullscreenElement) {
          requestNativeFullscreen();
        }
      }}
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
            handleNavigation(nextHref);
          } else if (dx > 0 && prevHref) {
            handleNavigation(prevHref);
          }
        }
      }}
    >
      <Image
        src={url}
        alt={title}
        fill
        style={{ objectFit: pseudoFullscreen ? "contain" : "cover", background: "#000" }}
        sizes="(max-width: 1024px) 100vw, 900px"
        quality={70}
        priority
        placeholder={blurDataURL ? "blur" : undefined}
        blurDataURL={blurDataURL}
        onLoad={() => setIsLoading(false)}
        onError={() => setIsLoading(false)}
      />

      {/* Loading indicator */}
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "rgba(0,0,0,0.8)",
          color: "#fff",
          padding: "16px 24px",
          borderRadius: 8,
          display: "flex",
          alignItems: "center",
          gap: 12,
          zIndex: 10,
        }}>
          <div style={{
            width: 20,
            height: 20,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTop: "2px solid #fff",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <span>Loading...</span>
        </div>
      )}

      {pseudoFullscreen && exitHref && (
        <Link
          href={exitHref}
          aria-label="Exit fullscreen"
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background: "rgba(0,0,0,0.6)",
            color: "#fff",
            width: 36,
            height: 36,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid rgba(255,255,255,0.2)",
            zIndex: 5,
          }}
          onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
            if (document.fullscreenElement) {
              e.preventDefault();
              exitNativeFullscreen();
              // Allow router navigation after exiting native fullscreen
              router.push(exitHref);
            }
          }}
        >
          <span style={{ fontSize: 16 }}>⤡</span>
        </Link>
      )}

      {prevHref && (
        <button
          onClick={() => handleNavigation(prevHref)}
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
            border: "none",
            cursor: "pointer",
            zIndex: 5,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.opacity = "0.35"; }}
          aria-label="Previous image"
        >
          <span style={{ fontSize: 32 }}>❮</span>
        </button>
      )}
      {nextHref && (
        <button
          onClick={() => handleNavigation(nextHref)}
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
            border: "none",
            cursor: "pointer",
            zIndex: 5,
          }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.opacity = "1"; }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.opacity = "0.35"; }}
          aria-label="Next image"
        >
          <span style={{ fontSize: 32 }}>❯</span>
        </button>
      )}
    </div>
  );
}



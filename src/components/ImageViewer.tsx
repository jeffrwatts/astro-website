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
};

export default function ImageViewer({ url, title, prevHref, nextHref, pseudoFullscreen = false, exitHref }: Props) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isNativeFullscreen, setIsNativeFullscreen] = React.useState<boolean>(false);

  React.useEffect(() => {
    const handler = () => setIsNativeFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const requestNativeFullscreen = React.useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement && el.requestFullscreen) {
      void el.requestFullscreen().catch(() => {/* ignore */});
    }
  }, []);

  const exitNativeFullscreen = React.useCallback(() => {
    if (document.fullscreenElement && document.exitFullscreen) {
      void document.exitFullscreen().catch(() => {/* ignore */});
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={pseudoFullscreen
        ? { position: "relative", width: "100%", height: "100dvh", borderRadius: 0, overflow: "hidden" }
        : { position: "relative", width: "100%", height: 0, paddingBottom: "66%", borderRadius: 8, overflow: "hidden" }
      }
      onClick={() => {
        if (pseudoFullscreen && !document.fullscreenElement) {
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
        style={{ objectFit: pseudoFullscreen ? "contain" : "cover", background: "#000" }}
        sizes="(max-width: 1024px) 100vw, 900px"
        quality={70}
        priority
      />

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



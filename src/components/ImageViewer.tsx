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
};

export default function ImageViewer({ url, title, prevHref, nextHref }: Props) {
  const router = useRouter();

  return (
    <div
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



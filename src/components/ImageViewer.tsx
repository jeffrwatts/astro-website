"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";

type Props = {
  url: string;
  title: string;
  prevHref?: string;
  nextHref?: string;
  blurDataURL?: string;
  onFullscreenToggle?: () => void;
};

export default function ImageViewer({ url, title, prevHref, nextHref, blurDataURL, onFullscreenToggle }: Props) {
  const router = useRouter();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  const handleNavigation = React.useCallback((href: string) => {
    setIsLoading(true);
    
    // If we're in fullscreen, preserve that state in the URL
    if (document.fullscreenElement) {
      const separator = href.includes('?') ? '&' : '?';
      router.push(`${href}${separator}fs=1`);
    } else {
      router.push(href);
    }
  }, [router]);

  const requestFullscreen = React.useCallback(() => {
    const element = containerRef.current;
    if (!element) return;

    if (!document.fullscreenElement) {
      element.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.log('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch((err) => {
        console.log('Error attempting to exit fullscreen:', err);
      });
    }
  }, []);

  const handleFullscreenToggle = React.useCallback(() => {
    requestFullscreen();
    if (onFullscreenToggle) {
      onFullscreenToggle();
    }
  }, [requestFullscreen, onFullscreenToggle]);

  // Listen for fullscreen changes
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Enter fullscreen if URL has fs=1 parameter
  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('fs') === '1' && !document.fullscreenElement) {
      const element = containerRef.current;
      if (element) {
        // Small delay to ensure the image has loaded
        setTimeout(() => {
          element.requestFullscreen().catch(() => {
            // Ignore errors, user might have blocked fullscreen
          });
        }, 200);
      }
    }
  }, [url]);

  return (
    <div
      ref={containerRef}
      style={{ 
        position: "relative", 
        width: "100%", 
        height: isFullscreen ? "100vh" : 0, 
        paddingBottom: isFullscreen ? 0 : "66%", 
        borderRadius: isFullscreen ? 0 : 8, 
        overflow: "hidden",
        background: isFullscreen ? "#000" : "transparent"
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
        fill={!isFullscreen}
        style={{ 
          objectFit: isFullscreen ? "contain" : "cover", 
          background: "#000",
          ...(isFullscreen && { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" })
        }}
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

      {/* Fullscreen toggle button */}
      <button
        onClick={handleFullscreenToggle}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          width: 36,
          height: 36,
          borderRadius: 999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px solid rgba(255,255,255,0.2)",
          cursor: "pointer",
          zIndex: 5,
        }}
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        <span style={{ fontSize: 16 }}>{isFullscreen ? "⤡" : "⛶"}</span>
      </button>

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



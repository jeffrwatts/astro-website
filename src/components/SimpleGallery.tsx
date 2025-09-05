"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type ImageItem = {
  id: string;
  src: string;
  title: string;
  description: string;
  width: number;
  height: number;
};

type Props = {
  images: ImageItem[];
};

export default function SimpleGallery({ images }: Props) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);

  const handleImageError = (imageId: string) => {
    setFailedImages(prev => new Set(prev).add(imageId));
  };

  const getCurrentIndex = useCallback(() => {
    if (!selectedImage) return -1;
    return images.findIndex(img => img.id === selectedImage.id);
  }, [selectedImage, images]);

  const goToPrevious = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      setSelectedImage(images[currentIndex - 1]);
    }
  }, [images, getCurrentIndex]);

  const goToNext = useCallback(() => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < images.length - 1) {
      setSelectedImage(images[currentIndex + 1]);
    }
  }, [images, getCurrentIndex]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStart) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        // Swipe right - go to previous
        goToPrevious();
      } else {
        // Swipe left - go to next
        goToNext();
      }
    }
    
    setTouchStart(null);
  }, [touchStart, goToPrevious, goToNext]);

  // Keyboard navigation and scroll prevention
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (event.key === 'ArrowLeft') {
        goToPrevious();
      } else if (event.key === 'ArrowRight') {
        goToNext();
      } else if (event.key === 'Escape') {
        setSelectedImage(null);
      }
    };

    const preventScroll = (e: Event) => {
      e.preventDefault();
    };

    if (selectedImage) {
      // Prevent background scrolling when detail view is open
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
      
      // Prevent touch scrolling on mobile
      document.addEventListener('touchmove', preventScroll, { passive: false });
      document.addEventListener('wheel', preventScroll, { passive: false });
      document.addEventListener('keydown', handleKeyPress);
    } else {
      // Restore scrolling when detail view is closed
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('touchmove', preventScroll);
      document.removeEventListener('wheel', preventScroll);
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [selectedImage, goToPrevious, goToNext]);

  return (
    <div style={{ padding: "12px" }}>
      {/* Image Grid */}
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gridAutoRows: "min-content",
        gap: "12px"
      }}>
        {images.map((image) => {
          const hasFailed = failedImages.has(image.id);
          
          return (
            <div
              key={image.id}
              onClick={() => !hasFailed && setSelectedImage(image)}
              style={{
                cursor: hasFailed ? "default" : "pointer",
                borderRadius: "12px",
                overflow: "hidden",
                opacity: hasFailed ? 0.5 : 1,
                display: "flex",
                flexDirection: "column"
              }}
            >
              {hasFailed ? (
                <div style={{
                  width: "100%",
                  height: "200px",
                  backgroundColor: "#333",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#666",
                  fontSize: "14px"
                }}>
                  Failed to load
                </div>
              ) : (
                                            <Image
                              src={image.src}
                              alt={image.title}
                              width={image.width}
                              height={image.height}
                              style={{
                                width: "100%",
                                height: "auto",
                                objectFit: "contain"
                              }}
                              priority={false}
                              loading="lazy"
                              quality={75}
                              unoptimized
                              placeholder="blur"
                              blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                              onError={() => handleImageError(image.id)}
                            />
              )}
            </div>
          );
        })}
      </div>

      {/* Detail View */}
      {selectedImage && (
        <div 
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "#000",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Subtle close button */}
          <div style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            zIndex: 1001
          }}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                background: "rgba(0, 0, 0, 0.5)",
                border: "none",
                color: "#fff",
                padding: "8px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "16px",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ✕
            </button>
          </div>

          {/* Previous Button */}
          {getCurrentIndex() > 0 && (
            <button
              onClick={goToPrevious}
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.5)",
                border: "none",
                color: "#fff",
                padding: "12px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "24px",
                zIndex: 1001,
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ‹
            </button>
          )}

          {/* Next Button */}
          {getCurrentIndex() < images.length - 1 && (
            <button
              onClick={goToNext}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(0, 0, 0, 0.5)",
                border: "none",
                color: "#fff",
                padding: "12px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "24px",
                zIndex: 1001,
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              ›
            </button>
          )}

          {/* Full screen image */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0"
          }}>
            <img
              src={selectedImage.src}
              alt={selectedImage.title}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain"
              }}
              onLoad={() => console.log("Detail image loaded:", selectedImage.src)}
              onError={(e) => console.error("Detail image failed:", selectedImage.src, e)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

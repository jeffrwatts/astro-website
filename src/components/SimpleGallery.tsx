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

  // Keyboard navigation
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

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedImage, goToPrevious, goToNext]);

  return (
    <div style={{ padding: "20px" }}>
      {/* Image Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "20px"
      }}>
        {images.map((image) => {
          const hasFailed = failedImages.has(image.id);
          
          return (
            <div
              key={image.id}
              onClick={() => !hasFailed && setSelectedImage(image)}
              style={{
                cursor: hasFailed ? "default" : "pointer",
                borderRadius: "4px",
                overflow: "hidden",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                opacity: hasFailed ? 0.5 : 1
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
                    height: "200px",
                    objectFit: "cover"
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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "#000",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Header with close button */}
          <div style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1001
          }}>
            <button
              onClick={() => setSelectedImage(null)}
              style={{
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "#fff",
                padding: "12px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "18px",
                fontWeight: "bold"
              }}
            >
              ✕ Close
            </button>
          </div>

          {/* Previous Button */}
          {getCurrentIndex() > 0 && (
            <button
              onClick={goToPrevious}
              style={{
                position: "absolute",
                left: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "#fff",
                padding: "20px 25px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "32px",
                zIndex: 1001
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
                right: "20px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "#fff",
                padding: "20px 25px",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "32px",
                zIndex: 1001
              }}
            >
              ›
            </button>
          )}

          {/* Full screen image */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px 20px 20px"
          }}>
            <Image
              src={selectedImage.src}
              alt={selectedImage.title}
              width={selectedImage.width}
              height={selectedImage.height}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain"
              }}
            />
          </div>

          {/* Image info at bottom */}
          <div style={{
            position: "absolute",
            bottom: "20px",
            left: "20px",
            right: "20px",
            background: "rgba(0, 0, 0, 0.8)",
            padding: "20px",
            borderRadius: "8px"
          }}>
            <h2 style={{ color: "#fff", marginBottom: "10px", fontSize: "24px" }}>{selectedImage.title}</h2>
            <p style={{ color: "#ccc", lineHeight: "1.6", fontSize: "16px" }}>{selectedImage.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

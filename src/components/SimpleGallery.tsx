"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

// Hardcoded images for testing
const hardcodedImages = [
  {
    id: 1,
    src: "https://storage.googleapis.com/astro-website-images-astrowebsite-470903/m31.jpg",
    title: "Andromeda Galaxy",
    description: "The Andromeda Galaxy is the nearest major galaxy to the Milky Way."
  },
  {
    id: 2,
    src: "https://storage.googleapis.com/astro-website-images-astrowebsite-470903/m42.jpg",
    title: "Orion Nebula",
    description: "The Orion Nebula is a diffuse nebula situated in the Milky Way."
  },
  {
    id: 3,
    src: "https://storage.googleapis.com/astro-website-images-astrowebsite-470903/m8.jpg",
    title: "Lagoon Nebula",
    description: "The Lagoon Nebula is a giant interstellar cloud in the constellation Sagittarius."
  }
];

export default function SimpleGallery() {
  const [selectedImage, setSelectedImage] = useState<typeof hardcodedImages[0] | null>(null);

  const getCurrentIndex = () => {
    if (!selectedImage) return -1;
    return hardcodedImages.findIndex(img => img.id === selectedImage.id);
  };

  const goToPrevious = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex > 0) {
      setSelectedImage(hardcodedImages[currentIndex - 1]);
    }
  };

  const goToNext = () => {
    const currentIndex = getCurrentIndex();
    if (currentIndex < hardcodedImages.length - 1) {
      setSelectedImage(hardcodedImages[currentIndex + 1]);
    }
  };

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
  }, [selectedImage]);

  return (
    <div style={{ padding: "20px" }}>
      {/* Image Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "20px"
      }}>
        {hardcodedImages.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedImage(image)}
            style={{
              cursor: "pointer",
              borderRadius: "4px",
              overflow: "hidden",
              border: "1px solid rgba(255, 255, 255, 0.1)"
            }}
          >
            <Image
              src={image.src}
              alt={image.title}
              width={300}
              height={200}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover"
              }}
            />
          </div>
        ))}
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
          {getCurrentIndex() < hardcodedImages.length - 1 && (
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
              width={1200}
              height={800}
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

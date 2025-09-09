"use client";

import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import { fetchManifestArray } from "@/lib/gcs";
import styles from "./page.module.css";

interface ManifestEntry {
  objectId: string;
  displayName?: string;
  ra?: number;
  dec?: number;
  constellation?: string;
  imageFilename: string;
  width?: number;
  height?: number;
  blurDataURL?: string;
}

export default function Home() {
  const [images, setImages] = useState<ManifestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [spotlight, setSpotlight] = useState<unknown>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);

  useEffect(() => {
    // Load Spotlight.js exactly like the working HTML example
    const loadSpotlight = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).Spotlight) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setSpotlight((window as any).Spotlight);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resolve((window as any).Spotlight);
          return;
        }

        // Load the CSS first
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/spotlight.min.css';
        document.head.appendChild(link);

        // Load the script exactly like the working example: <script src="dist/spotlight.bundle.js"></script>
        const script = document.createElement('script');
        script.src = '/spotlight.bundle.js';
        script.onload = () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setSpotlight((window as any).Spotlight);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          resolve((window as any).Spotlight);
        };
        script.onerror = () => {
          console.error("Failed to load Spotlight.js");
          reject(new Error("Failed to load Spotlight.js"));
        };
        document.head.appendChild(script);
      });
    };

    const loadImages = async () => {
      try {
        const manifestData = await fetchManifestArray();
        setImages(manifestData);
      } catch (error) {
        console.error("Failed to load images:", error);
      } finally {
        setLoading(false);
      }
    };

    Promise.all([loadSpotlight(), loadImages()]).catch(console.error);
  }, []);

  // Create gallery array for Spotlight.js exactly like the working example
  const createGallery = () => {
    return images.map(image => ({
      title: image.displayName || image.objectId,
      description: image.constellation || "",
      src: `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${image.imageFilename}`
    }));
  };

  // Handle image click exactly like the working example's showGallery function
  const handleImageClick = (index: number) => {
    if (spotlight && images.length > 0) {
      const gallery = createGallery();
      setSelectedIndex(index);
      setIsGalleryOpen(true);
      
      // Use the exact same options structure as the working example
      const options = {
        index: index + 1, // The working example uses 1-based indexing
        infinite: true,
        autohide: false, // Disable autohide since we have our own controls
        control: "", // No Spotlight controls - we'll use our own
        // Add custom class for our layout
        class: "custom-spotlight-layout"
      };
      
      // Call exactly like the working example: Spotlight.show(gallery, options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).show(gallery, options);
    }
  };

  const handleClose = () => {
    if (spotlight) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).close();
    }
    setSelectedIndex(null);
    setIsGalleryOpen(false);
  };

  const handlePrevious = () => {
    if (spotlight && selectedIndex !== null && selectedIndex > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).prev();
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const handleNext = () => {
    if (spotlight && selectedIndex !== null && selectedIndex < images.length - 1) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).next();
      setSelectedIndex(selectedIndex + 1);
    }
  };

  const handleZoomIn = () => {
    if (spotlight) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).zoom(1.2);
    }
  };

  const handleZoomOut = () => {
    if (spotlight) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).zoom(0.8);
    }
  };

  const handleFullscreen = () => {
    if (spotlight) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).fullscreen();
    }
  };

  const currentImage = selectedIndex !== null ? images[selectedIndex] : null;

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <h1>Loading Gallery...</h1>
      </div>
    );
  }

  return (
    <div className={styles.galleryContainer}>
      {/* Thumbnail Grid */}
      <div className={styles.thumbnailGrid}>
        {images.map((image, index) => {
          const imageUrl = `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${image.imageFilename}`;
          return (
            <div
              key={`${image.objectId}-${image.imageFilename}-${index}`}
              className={styles.galleryItem}
              onClick={() => handleImageClick(index)}
            >
              <NextImage
                src={imageUrl}
                alt={image.displayName || image.objectId}
                width={image.width || 400}
                height={image.height || 300}
                className={styles.galleryImage}
                priority={false}
                loading="lazy"
                quality={75}
                unoptimized
                placeholder={image.blurDataURL ? "blur" : "empty"}
                blurDataURL={image.blurDataURL}
              />
            </div>
          );
        })}
      </div>

      {/* Custom Information/Control Pane - Only visible when gallery is open */}
      {isGalleryOpen && currentImage && (
        <div className={styles.customInfoPane}>
          <div className={styles.infoContent}>
            <h2 className={styles.imageTitle}>
              {currentImage.displayName || currentImage.objectId}
            </h2>
            
            {currentImage.constellation && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Constellation:</span>
                <span className={styles.infoValue}>{currentImage.constellation}</span>
              </div>
            )}
            
            {currentImage.ra && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Right Ascension:</span>
                <span className={styles.infoValue}>{currentImage.ra.toFixed(4)}°</span>
              </div>
            )}
            
            {currentImage.dec && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Declination:</span>
                <span className={styles.infoValue}>{currentImage.dec.toFixed(4)}°</span>
              </div>
            )}

            <div className={styles.imageCounter}>
              {selectedIndex !== null ? selectedIndex + 1 : 0} / {images.length}
            </div>
          </div>

          <div className={styles.controls}>
            <div className={styles.navigationControls}>
              <button 
                onClick={handlePrevious}
                disabled={selectedIndex === 0}
                className={styles.navButton}
              >
                Previous
              </button>
              <button 
                onClick={handleNext}
                disabled={selectedIndex === images.length - 1}
                className={styles.navButton}
              >
                Next
              </button>
            </div>
            
            <div className={styles.zoomControls}>
              <button onClick={handleZoomOut} className={styles.zoomButton}>
                Zoom Out
              </button>
              <button onClick={handleZoomIn} className={styles.zoomButton}>
                Zoom In
              </button>
            </div>
            
            <div className={styles.fullscreenControls}>
              <button onClick={handleFullscreen} className={styles.fullscreenButton}>
                Fullscreen
              </button>
              <button onClick={handleClose} className={styles.closeButton}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
"use client";

import React, { useEffect, useState } from "react";
import NextImage from "next/image";
import { fetchManifestArray } from "@/lib/gcs";

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
          console.error('Failed to load Spotlight.js bundle');
          reject(new Error('Failed to load Spotlight.js'));
        };
        document.head.appendChild(script);
      });
    };

    // Fetch manifest data
    const loadImages = async () => {
      try {
        const manifestData = await fetchManifestArray();
        setImages(manifestData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading images:', error);
        setLoading(false);
      }
    };

    loadSpotlight().catch(console.error);
    loadImages();
  }, []);

  // Create gallery exactly like the working example
  const createGallery = () => {
    return images.map((image) => ({
      title: image.displayName || image.objectId,
      description: image.constellation || "",
      src: `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${image.imageFilename}`
    }));
  };

  // Handle image click exactly like the working example's showGallery function
  const handleImageClick = (index: number) => {
    if (spotlight && images.length > 0) {
      const gallery = createGallery();
      
      // Use the exact same options structure as the working example
      const options = {
        index: index + 1, // The working example uses 1-based indexing
        infinite: true,
        autohide: "all",
        // Add mobile tap-to-toggle functionality
        onshow: function() {
          // Add tap event listener for mobile devices to toggle controls
          const spotlightElement = document.getElementById('spotlight');
          if (spotlightElement) {
            const handleMobileTap = (e: TouchEvent) => {
              // Only handle single taps (not swipes or multi-touch)
              if (e.touches.length === 1) {
                e.preventDefault();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (spotlight as any).menu();
              }
            };
            
            // Add touch event listener
            spotlightElement.addEventListener('touchstart', handleMobileTap, { passive: false });
            
            // Store reference for cleanup
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (spotlightElement as any)._mobileTapHandler = handleMobileTap;
          }
        },
        onclose: function() {
          // Clean up the event listener when gallery closes
          const spotlightElement = document.getElementById('spotlight');
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (spotlightElement && (spotlightElement as any)._mobileTapHandler) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            spotlightElement.removeEventListener('touchstart', (spotlightElement as any)._mobileTapHandler);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (spotlightElement as any)._mobileTapHandler;
          }
        }
      };
      
      // Call exactly like the working example: Spotlight.show(gallery, options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).show(gallery, options);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <h1>Loading Gallery...</h1>
        <p>Fetching images from manifest...</p>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="error-container">
        <h1>No Images Found</h1>
        <p>Unable to load images from manifest.</p>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <div className="gallery-grid">
        {images.map((image, index) => {
          const imageUrl = `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${image.imageFilename}`;
          
          return (
            <div
              key={`${image.objectId}-${image.imageFilename}-${index}`}
              className="gallery-item"
              onClick={() => handleImageClick(index)}
            >
              <NextImage
                src={imageUrl}
                alt={image.displayName || image.objectId}
                width={image.width || 400}
                height={image.height || 300}
                className="gallery-image"
                priority={false}
                loading="lazy"
                quality={75}
                unoptimized
                placeholder={image.blurDataURL ? "blur" : "empty"}
                blurDataURL={image.blurDataURL}
              />
              <div className="gallery-overlay">
                <h3>{image.displayName || image.objectId}</h3>
                {image.constellation && <p>{image.constellation}</p>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
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
      
      // Use the exact same options structure as the working example
      const options = {
        index: index + 1, // The working example uses 1-based indexing
        infinite: true,
        autohide: "all"
      };
      
      // Call exactly like the working example: Spotlight.show(gallery, options);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (spotlight as any).show(gallery, options);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', fontSize: '1.5rem', color: '#666' }}>
        <h1>Loading Gallery...</h1>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Thumbnail Grid */}
      <div className="responsive-grid">
        {images.map((image, index) => {
          const imageUrl = `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${image.imageFilename}`;
          
          // Calculate aspect ratio and container dimensions
          const imageWidth = image.width || 400;
          const imageHeight = image.height || 300;
          const aspectRatio = imageWidth / imageHeight;
          
          // Set a max width for thumbnails and calculate height based on aspect ratio
          const maxThumbnailWidth = 400; // Increased from 300 to use more space
          const thumbnailWidth = Math.min(maxThumbnailWidth, imageWidth);
          const thumbnailHeight = thumbnailWidth / aspectRatio;
          
          return (
            <div
              key={`${image.objectId}-${image.imageFilename}-${index}`}
              style={{ 
                cursor: 'pointer', 
                borderRadius: '8px', 
                overflow: 'hidden', 
                transition: 'transform 0.2s ease, box-shadow 0.2s ease', 
                background: 'transparent', 
                border: '1px solid rgba(255,255,255,0.1)',
                width: `${thumbnailWidth}px`,
                height: `${thumbnailHeight}px`,
                justifySelf: 'center' // Center the container in the grid cell
              }}
              onClick={() => handleImageClick(index)}
            >
              <NextImage
                src={imageUrl}
                alt={image.displayName || image.objectId}
                width={imageWidth}
                height={imageHeight}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.3s ease' }}
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
    </div>
  );
}
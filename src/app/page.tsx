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
    // Load Spotlight.js from local bundle
    const loadSpotlight = () => {
      return new Promise((resolve, reject) => {
        // Check if already loaded
        if (window.Spotlight) {
          setSpotlight(window.Spotlight);
          resolve(window.Spotlight);
          return;
        }

        // Load the CSS first
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/spotlight.min.css';
        document.head.appendChild(link);

        // Load the script from local bundle
        const script = document.createElement('script');
        script.src = '/spotlight.bundle.js';
        script.onload = () => {
          setSpotlight(window.Spotlight);
          resolve(window.Spotlight);
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

  const handleImageClick = (index: number) => {
    if (spotlight && images.length > 0) {
      // Create gallery array from manifest data
      const gallery = images.map((image) => ({
        title: image.displayName || image.objectId,
        description: image.constellation || "",
        src: `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${image.imageFilename}`
      }));
      
      // Show gallery using Spotlight.js API with infinite scrolling and autohide all
      spotlight.show(gallery, {
        index: index,
        infinite: true,
        autohide: "all"
      });
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

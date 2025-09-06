"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import 'spotlight.js/dist/css/spotlight.min.css';
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

export default function SimpleGallery() {
  const [images, setImages] = useState<ManifestEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
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

    loadImages();
  }, []);

  useEffect(() => {
    // Initialize Spotlight.js only on client side after images are loaded
    if (typeof window !== 'undefined' && images.length > 0) {
      import('spotlight.js').then((Spotlight) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spotlight = Spotlight.default as any;
        if (spotlight && typeof spotlight.init === 'function') {
          spotlight.init();
        }
      }).catch((error) => {
        console.log('Spotlight.js already initialized or error:', error);
      });
    }
  }, [images]);

  if (loading) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1 style={{ color: "#fff", marginBottom: "20px" }}>Loading Gallery...</h1>
        <div style={{ color: "#ccc" }}>Fetching images from manifest...</div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <h1 style={{ color: "#fff", marginBottom: "20px" }}>No Images Found</h1>
        <div style={{ color: "#ccc" }}>Unable to load images from manifest.</div>
      </div>
    );
  }

  return (
    <div className="gallery-grid">
      {images.map((image) => {
        const imageUrl = `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${image.imageFilename}`;
        const aspectRatio = image.width && image.height ? image.width / image.height : 1;
        
        return (
          <a
            key={image.objectId}
            href={imageUrl}
            className="spotlight"
            data-spotlight={imageUrl}
            data-title={image.displayName || image.objectId}
            data-description=""
            style={{
              cursor: "pointer",
              borderRadius: "12px",
              overflow: "hidden",
              transition: "transform 0.2s ease",
              textDecoration: "none",
              display: "block",
              aspectRatio: aspectRatio.toString()
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <Image
              src={imageUrl}
              alt={image.displayName || image.objectId}
              width={image.width || 400}
              height={image.height || 300}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
              priority={false}
              loading="lazy"
              quality={75}
              unoptimized
              placeholder={image.blurDataURL ? "blur" : "empty"}
              blurDataURL={image.blurDataURL}
            />
          </a>
        );
      })}
    </div>
  );
}
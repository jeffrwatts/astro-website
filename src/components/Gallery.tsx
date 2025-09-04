"use client";

import React, { useState } from "react";
import Image from "next/image";
import PhotoSwipeGallery from "@/components/PhotoSwipeGallery";

type Props = {
  items: Array<{
    imageFilename: string;
    displayName?: string;
    width?: number;
    height?: number;
    blurDataURL?: string;
  }>;
};

export default function Gallery({ items }: Props) {
  const [isPhotoSwipeOpen, setIsPhotoSwipeOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setIsPhotoSwipeOpen(true);
  };

  const photoSwipeItems = items.map((item) => {
    // Use actual dimensions from manifest, or use a more appropriate default for astrophotography
    const width = item.width || 1600;
    const height = item.height || 1200; // 4:3 aspect ratio, common for astrophotography
    
    return {
      src: `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${item.imageFilename}`,
      width,
      height,
      title: item.displayName || item.imageFilename,
      alt: item.displayName || item.imageFilename,
      objectId: item.objectId,
      constellation: item.constellation,
      ra: item.ra,
      dec: item.dec,
      description: item.description,
    };
  });

  return (
    <>
      <main style={{ minHeight: "100vh", padding: 24 }}>
        {items.length === 0 ? (
          <p>No images found.</p>
        ) : (
          <ul style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((meta, index) => {
              const isPriority = index < 8;
              const name = meta.imageFilename;
              const url = `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${name}`;
              const title = meta?.displayName ?? name;
              return (
                <li key={name}>
                  <figure>
                    <button
                      onClick={() => handleImageClick(index)}
                      style={{
                        border: "none",
                        background: "none",
                        padding: 0,
                        cursor: "pointer",
                        width: "100%",
                        borderRadius: 8,
                        overflow: "hidden",
                      }}
                    >
                      {meta?.width && meta?.height ? (
                        <div style={{ borderRadius: 8, overflow: "hidden" }}>
                          <Image
                            src={url}
                            alt={title}
                            width={meta.width}
                            height={meta.height}
                            style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
                            sizes="(max-width: 768px) 50vw, 280px"
                            quality={60}
                            priority={isPriority}
                            loading={isPriority ? "eager" : "lazy"}
                            unoptimized
                            placeholder={meta?.blurDataURL ? "blur" : undefined}
                            blurDataURL={meta?.blurDataURL}
                          />
                        </div>
                      ) : (
                        <div style={{ position: "relative", width: "100%", height: 0, paddingBottom: "66%", borderRadius: 8, overflow: "hidden" }}>
                          <Image
                            src={url}
                            alt={title}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 50vw, 280px"
                            quality={60}
                            priority={isPriority}
                            loading={isPriority ? "eager" : "lazy"}
                            unoptimized
                            placeholder={meta?.blurDataURL ? "blur" : undefined}
                            blurDataURL={meta?.blurDataURL}
                          />
                        </div>
                      )}
                    </button>
                  </figure>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      {isPhotoSwipeOpen && (
        <PhotoSwipeGallery
          items={photoSwipeItems}
          currentIndex={currentIndex}
          onClose={() => setIsPhotoSwipeOpen(false)}
        />
      )}
    </>
  );
}

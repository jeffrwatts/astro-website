"use client";

import React from "react";
import Image from "next/image";

// Hardcoded test images
const testImages = [
  {
    id: "test1",
    src: "https://storage.googleapis.com/astro-website-images-astrowebsite-470903/m31.jpg",
    title: "Andromeda Galaxy",
    description: "Test image 1"
  },
  {
    id: "test2", 
    src: "https://storage.googleapis.com/astro-website-images-astrowebsite-470903/m42.jpg",
    title: "Orion Nebula",
    description: "Test image 2"
  },
  {
    id: "test3",
    src: "https://storage.googleapis.com/astro-website-images-astrowebsite-470903/m8.jpg", 
    title: "Lagoon Nebula",
    description: "Test image 3"
  }
];

export default function SimpleGallery() {
  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ color: "#fff", marginBottom: "20px" }}>Simple Gallery</h1>
      
      <div style={{ 
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px"
      }}>
        {testImages.map((image) => (
          <div
            key={image.id}
            style={{
              cursor: "pointer",
              borderRadius: "8px",
              overflow: "hidden",
              backgroundColor: "#333"
            }}
          >
            <Image
              src={image.src}
              alt={image.title}
              width={400}
              height={300}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover"
              }}
              priority={false}
              loading="lazy"
              quality={75}
              unoptimized
            />
            <div style={{ padding: "10px", color: "#fff" }}>
              <h3 style={{ margin: "0 0 5px 0", fontSize: "16px" }}>{image.title}</h3>
              <p style={{ margin: "0", fontSize: "14px", color: "#ccc" }}>{image.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
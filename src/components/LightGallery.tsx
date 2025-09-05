"use client";

import React, { useEffect, useRef, useState } from 'react';

// Import LightGallery CSS
import 'lightgallery/css/lightgallery.css';
import 'lightgallery/css/lg-zoom.css';
import 'lightgallery/css/lg-thumbnail.css';
import 'lightgallery/css/lg-fullscreen.css';
import 'lightgallery/css/lg-autoplay.css';
import 'lightgallery/css/lg-share.css';
import 'lightgallery/css/lg-pager.css';
import 'lightgallery/css/lg-rotate.css';

type ImageItem = {
  src: string;
  width: number;
  height: number;
  title?: string;
  alt?: string;
};

type Props = {
  items: ImageItem[];
  currentIndex: number;
  onClose: () => void;
};

export default function LightGalleryComponent({ items, currentIndex, onClose }: Props) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const lightGalleryRef = useRef<LightGallery | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !galleryRef.current || lightGalleryRef.current) return;

    console.log('LightGallery options:', {
      items: items.length,
      currentIndex
    });

    // Dynamic import to avoid SSR issues
    const initLightGallery = async () => {
      const [
        { default: LightGallery },
        { default: lgThumbnail },
        { default: lgZoom },
        { default: lgFullscreen },
        { default: lgAutoplay },
        { default: lgShare },
        { default: lgPager },
        { default: lgRotate }
      ] = await Promise.all([
        import('lightgallery'),
        import('lg-thumbnail'),
        import('lg-zoom'),
        import('lg-fullscreen'),
        import('lg-autoplay'),
        import('lg-share'),
        import('lg-pager'),
        import('lg-rotate')
      ]);

      const options = {
        plugins: [lgThumbnail, lgZoom, lgFullscreen, lgAutoplay, lgShare, lgPager, lgRotate],
        mode: 'lg-fade',
        cssEasing: 'cubic-bezier(0.25, 0, 0.25, 1)',
        speed: 600,
        height: '100%',
        width: '100%',
        addClass: 'lg-custom-class',
        startClass: 'lg-start-zoom',
        backdropDuration: 150,
        hideBarsDelay: 6000,
        useLeft: false,
        closable: true,
        swipeToClose: true,
        closeOnTap: true,
        enableDrag: true,
        enableSwipe: true,
        dynamic: true,
        dynamicEl: items.map(item => ({
          src: item.src,
          thumb: item.src,
          subHtml: `<h4>${item.title || item.alt || ''}</h4>`,
          responsive: [
            {
              breakpoint: 1400,
              html: `<img src="${item.src}" alt="${item.alt || ''}" style="max-width: 100%; max-height: 100%;" />`
            }
          ]
        })),
        index: currentIndex,
        // Fullscreen options
        fullScreen: true,
        // Zoom options
        zoom: true,
        actualSize: true,
        // Thumbnail options
        thumbnail: true,
        thumbWidth: 100,
        thumbHeight: '80px',
        thumbContHeight: 100,
        // Share options
        share: true,
        // Autoplay options
        autoplay: false,
        // Pager options
        pager: true,
        // Rotate options
        rotate: true,
      };

      lightGalleryRef.current = LightGallery(galleryRef.current, options);

      // Add event listeners
      lightGalleryRef.current.on('lgClose', onClose);

      lightGalleryRef.current.init();
    };

    initLightGallery();

    return () => {
      if (lightGalleryRef.current) {
        lightGalleryRef.current.destroy();
        lightGalleryRef.current = null;
      }
    };
  }, [currentIndex, onClose, items, isClient]);

  if (!isClient) {
    return null;
  }

  return (
    <div
      ref={galleryRef}
      style={{
        display: 'none', // LightGallery will show this when initialized
      }}
    />
  );
}

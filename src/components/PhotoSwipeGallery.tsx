"use client";

import React, { useEffect, useRef, useState } from 'react';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

type ImageItem = {
  src: string;
  width: number;
  height: number;
  title?: string;
  alt?: string;
  objectId?: string;
  constellation?: string;
  ra?: number;
  dec?: number;
  description?: string;
};

type Props = {
  items: ImageItem[];
  currentIndex: number;
  onClose: () => void;
};

// Helper function to format coordinates
function formatRightAscension(ra: number): string {
  const hours = Math.floor(ra);
  const minutes = Math.floor((ra - hours) * 60);
  const seconds = Math.round(((ra - hours) * 60 - minutes) * 60);
  return `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;
}

function formatDeclination(dec: number): string {
  const sign = dec >= 0 ? '+' : '-';
  const absDec = Math.abs(dec);
  const degrees = Math.floor(absDec);
  const minutes = Math.floor((absDec - degrees) * 60);
  const seconds = Math.round(((absDec - degrees) * 60 - minutes) * 60);
  return `${sign}${degrees.toString().padStart(2, '0')}° ${minutes.toString().padStart(2, '0')}' ${seconds.toString().padStart(2, '0')}"`;
}

export default function PhotoSwipeGallery({ items, currentIndex, onClose }: Props) {
  const pswpRef = useRef<HTMLDivElement>(null);
  const pswpInstanceRef = useRef<PhotoSwipe | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<ImageItem | null>(null);

  useEffect(() => {
    if (!pswpRef.current || pswpInstanceRef.current) return;

    console.log('PhotoSwipe options:', {
      items: items.length
    });

    const options = {
      dataSource: items,
      index: currentIndex,
      bgOpacity: 0.9,
      showHideOpacity: true,
      history: false, // Disable URL changes
      closeOnScroll: false,
      closeOnVerticalDrag: false,
      allowPanToNext: true,
      allowMouseDrag: true,
      allowTouchDrag: true,
      showAnimationDuration: 333,
      hideAnimationDuration: 333,
      zoomAnimationDuration: 333,
      easing: 'cubic-bezier(0.4, 0, 0.22, 1)',
      escKey: true,
      arrowKeys: true,
      returnFocus: false,
      maxSpreadZoom: 3,
      imageClickAction: 'zoom' as const,
      tapAction: 'toggle-controls' as const,
      doubleTapAction: 'zoom' as const,
      indexIndicatorSep: ' / ',
      preloaderDelay: 2000,
      errorMsg: '<div class="pswp__error-msg">The image <a href="%url%" target="_blank">cannot be loaded</a>.</div>',
      // PhotoSwipe v5 UI configuration
      ui: {
        closeEl: true,
        zoomEl: true,
        counterEl: true,
        arrowEl: true,
        preloaderEl: true,
      },
    };

    pswpInstanceRef.current = new PhotoSwipe(options);
    
    // Add event listeners
    pswpInstanceRef.current.on('close', onClose);
    pswpInstanceRef.current.on('change', () => {
      const currentIndex = pswpInstanceRef.current?.options.index || 0;
      setCurrentItem(items[currentIndex]);
      setIsDetailOpen(false);
    });
    
    pswpInstanceRef.current.init();

    // Set initial current item
    setCurrentItem(items[currentIndex]);

    return () => {
      if (pswpInstanceRef.current) {
        pswpInstanceRef.current.destroy();
        pswpInstanceRef.current = null;
      }
    };
  }, [currentIndex, onClose, items]);

  return (
    <>
      <div
        ref={pswpRef}
        className="pswp"
        tabIndex={-1}
        role="dialog"
        aria-hidden="true"
        aria-label="PhotoSwipe Gallery"
      >
        <div className="pswp__bg" />
        <div className="pswp__scroll-wrap">
          <div className="pswp__container">
            <div className="pswp__item" />
            <div className="pswp__item" />
            <div className="pswp__item" />
          </div>
          <div className="pswp__ui pswp__ui--hidden">
            <div className="pswp__top-bar">
              <div className="pswp__counter" />
              <button
                className="pswp__button pswp__button--close"
                title="Close (Esc)"
                aria-label="Close"
              />
              <button
                className="pswp__button pswp__button--zoom"
                title="Zoom in/out"
                aria-label="Zoom"
              />
              <div className="pswp__preloader">
                <div className="pswp__preloader__icn">
                  <div className="pswp__preloader__cut">
                    <div className="pswp__preloader__donut" />
                  </div>
                </div>
              </div>
            </div>
            <button
              className="pswp__button pswp__button--arrow--left"
              title="Previous (arrow left)"
              aria-label="Previous"
            />
            <button
              className="pswp__button pswp__button--arrow--right"
              title="Next (arrow right)"
              aria-label="Next"
            />
            <div className="pswp__caption">
              <div className="pswp__caption__center" />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Detail Panel */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
          transform: isDetailOpen ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
          zIndex: 10000,
          maxHeight: '60vh',
          overflow: 'auto',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              {currentItem?.title || 'Object Details'}
            </h3>
            <button
              onClick={() => setIsDetailOpen(!isDetailOpen)}
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: '#fff',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {isDetailOpen ? 'Hide Details' : 'Show Details'}
            </button>
          </div>
          
          {currentItem && (
            <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
              {currentItem.constellation && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>Constellation:</strong> {currentItem.constellation}
                </div>
              )}
              {currentItem.ra !== undefined && currentItem.dec !== undefined && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>Coordinates:</strong><br />
                  RA: {formatRightAscension(currentItem.ra)}<br />
                  Dec: {formatDeclination(currentItem.dec)}
                </div>
              )}
              {currentItem.description && (
                <div style={{ marginTop: '16px' }}>
                  <strong>Description:</strong>
                  <div style={{ marginTop: '8px', color: 'rgba(255, 255, 255, 0.8)' }}>
                    {currentItem.description}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Toggle Button */}
      <button
        onClick={() => setIsDetailOpen(!isDetailOpen)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: '#fff',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '8px',
          padding: '12px 16px',
          cursor: 'pointer',
          zIndex: 10001,
          fontSize: '14px',
          fontWeight: '500',
        }}
      >
        {isDetailOpen ? 'Hide Details' : 'Show Details'}
      </button>
    </>
  );
}

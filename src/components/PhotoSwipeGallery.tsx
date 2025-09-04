"use client";

import React, { useEffect, useRef } from 'react';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

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

export default function PhotoSwipeGallery({ items, currentIndex, onClose }: Props) {
  const pswpRef = useRef<HTMLDivElement>(null);
  const pswpInstanceRef = useRef<PhotoSwipe | null>(null);

  useEffect(() => {
    if (!pswpRef.current || pswpInstanceRef.current) return;

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
    };

    pswpInstanceRef.current = new PhotoSwipe(options);
    
    // Add event listeners
    pswpInstanceRef.current.on('close', onClose);
    
    pswpInstanceRef.current.init();

    return () => {
      if (pswpInstanceRef.current) {
        pswpInstanceRef.current.destroy();
        pswpInstanceRef.current = null;
      }
    };
  }, [currentIndex, onClose, items]);

  return (
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
              className="pswp__button pswp__button--share"
              title="Share"
              aria-label="Share"
            />
            <button
              className="pswp__button pswp__button--fs"
              title="Toggle fullscreen"
              aria-label="Toggle fullscreen"
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
          <div className="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
            <div className="pswp__share-tooltip" />
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
  );
}

declare module 'lightgallery' {
  interface LightGallery {
    init(): void;
    destroy(): void;
    on(event: string, callback: () => void): void;
  }
  
  interface LightGalleryOptions {
    plugins?: unknown[];
    mode?: string;
    cssEasing?: string;
    speed?: number;
    height?: string;
    width?: string;
    addClass?: string;
    startClass?: string;
    backdropDuration?: number;
    hideBarsDelay?: number;
    useLeft?: boolean;
    closable?: boolean;
    swipeToClose?: boolean;
    closeOnTap?: boolean;
    enableDrag?: boolean;
    enableSwipe?: boolean;
    dynamic?: boolean;
    dynamicEl?: unknown[];
    index?: number;
    fullScreen?: boolean;
    zoom?: boolean;
    actualSize?: boolean;
    thumbnail?: boolean;
    thumbWidth?: number;
    thumbHeight?: string;
    thumbContHeight?: number;
    share?: boolean;
    autoplay?: boolean;
    pager?: boolean;
    rotate?: boolean;
  }
  
  function LightGallery(element: HTMLElement, options: LightGalleryOptions): LightGallery;
  export = LightGallery;
}

declare module 'lg-thumbnail';
declare module 'lg-zoom';
declare module 'lg-fullscreen';
declare module 'lg-autoplay';
declare module 'lg-share';
declare module 'lg-pager';
declare module 'lg-rotate';

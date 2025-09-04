const BUCKET = "astro-website-images-astrowebsite-470903";

export const revalidate = 600;

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

// Function to get image dimensions
async function getImageDimensions(imageUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      // Fallback to 16:9 aspect ratio if image fails to load
      resolve({ width: 1920, height: 1080 });
    };
    img.src = imageUrl;
  });
}

export async function fetchManifestArray(): Promise<ManifestEntry[]> {
  try {
    const res = await fetch(`https://storage.googleapis.com/${BUCKET}/web_images.json`, { next: { revalidate: 600 } });
    if (!res.ok) return [];
    const arr = (await res.json()) as ManifestEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Function to get manifest with image dimensions
export async function fetchManifestWithDimensions(): Promise<ManifestEntry[]> {
  const manifest = await fetchManifestArray();
  
  // For each image without dimensions, try to get them
  const manifestWithDimensions = await Promise.all(
    manifest.map(async (item) => {
      if (item.width && item.height) {
        return item; // Already has dimensions
      }
      
      // Get dimensions from the actual image
      const imageUrl = `https://storage.googleapis.com/${BUCKET}/${item.imageFilename}`;
      const dimensions = await getImageDimensions(imageUrl);
      
      return {
        ...item,
        width: dimensions.width,
        height: dimensions.height,
      };
    })
  );
  
  return manifestWithDimensions;
}

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

export async function fetchManifestArray(): Promise<ManifestEntry[]> {
  try {
    const res = await fetch('/api/manifest');
    if (!res.ok) return [];
    const arr = (await res.json()) as ManifestEntry[];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

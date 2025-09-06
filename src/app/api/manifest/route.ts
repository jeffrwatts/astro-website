import { NextResponse } from 'next/server';

const BUCKET = "astro-website-images-astrowebsite-470903";

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

export async function GET() {
  try {
    const res = await fetch(`https://storage.googleapis.com/${BUCKET}/web_images.json`, {
      next: { revalidate: 600 }
    });
    
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch manifest' }, { status: 500 });
    }
    
    const manifestData = await res.json() as ManifestEntry[];
    
    if (!Array.isArray(manifestData)) {
      return NextResponse.json({ error: 'Invalid manifest format' }, { status: 500 });
    }
    
    return NextResponse.json(manifestData);
  } catch (error) {
    console.error('Error fetching manifest:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

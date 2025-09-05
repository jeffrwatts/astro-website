import { fetchManifestArray } from "@/lib/gcs";
import SimpleGallery from "@/components/SimpleGallery";

export default async function Home() {
  const manifest = await fetchManifestArray();
  const images = manifest
    .filter((item) => item && typeof item.imageFilename === "string" && /\.(jpe?g|png|webp|tiff?)$/i.test(item.imageFilename))
    .map((item) => ({
      id: item.imageFilename,
      src: `https://storage.googleapis.com/astro-website-images-astrowebsite-470903/${item.imageFilename}`,
      title: item.displayName || item.imageFilename,
      description: `Astrophotography image: ${item.displayName || item.imageFilename}`,
      width: item.width || 1600,
      height: item.height || 1200,
    }));

  return <SimpleGallery images={images} />;
}

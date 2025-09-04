import { fetchManifestArray } from "@/lib/gcs";
import Gallery from "@/components/Gallery";

const BUCKET = "astro-website-images";

export default async function Home() {
  const manifest = await fetchManifestArray();
  const items = manifest
    .filter((e) => e && typeof e.imageFilename === "string" && /\.(jpe?g|png|webp|tiff?)$/i.test(e.imageFilename))
    .sort((a, b) => a.imageFilename.localeCompare(b.imageFilename));

  return (
    <div>
      <Gallery items={items} />
    </div>
  );
}

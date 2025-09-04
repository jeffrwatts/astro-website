import { fetchManifestWithDimensions } from "@/lib/gcs";
import Gallery from "@/components/Gallery";

export default async function Home() {
  const manifest = await fetchManifestWithDimensions();
  const items = manifest
    .filter((e) => e && typeof e.imageFilename === "string" && /\.(jpe?g|png|webp|tiff?)$/i.test(e.imageFilename))
    .sort((a, b) => a.imageFilename.localeCompare(b.imageFilename));

  return (
    <div>
      <Gallery items={items} />
    </div>
  );
}

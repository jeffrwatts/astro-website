import { Storage } from "@google-cloud/storage";
import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

const BUCKET = "astro-website-images-astrowebsite-470903";
export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ManifestEntry {
	objectId: string;
	displayName?: string;
	ra?: number;
	dec?: number;
	constellation?: string;
	imageFilename: string;
}

async function fetchManifest(): Promise<Record<string, ManifestEntry>> {
	const storage = new Storage();
	const file = storage.bucket(BUCKET).file("web_images.json");
	try {
		const [exists] = await file.exists();
		if (!exists) return {};
		const [buf] = await file.download();
		const arr = JSON.parse(buf.toString()) as ManifestEntry[];
		const map: Record<string, ManifestEntry> = {};
		for (const entry of arr) {
			if (entry && entry.imageFilename) {
				map[entry.imageFilename] = entry;
			}
		}
		return map;
	} catch {
		return {};
	}
}

async function ensureFileExists(filename: string): Promise<boolean> {
	const storage = new Storage();
	const file = storage.bucket(BUCKET).file(filename);
	const [exists] = await file.exists();
	return exists;
}

async function listBucketImages(): Promise<string[]> {
	const storage = new Storage();
	const [files] = await storage.bucket(BUCKET).getFiles({ autoPaginate: true });
	return files
		.map((f) => f.name)
		.filter((name) => /(\.(jpe?g|png|webp|tiff?))$/i.test(name))
		.sort();
}

export async function generateMetadata({ params }: { params: { filename: string } }): Promise<Metadata> {
  const raw = params.filename;
  const filename = decodeURIComponent(raw);
  const [exists, manifestByFilename] = await Promise.all([
    ensureFileExists(filename),
    fetchManifest(),
  ]);

  if (!exists) {
    return { title: "Not found" };
  }

  const meta = manifestByFilename[filename];
  const display = meta?.displayName ?? filename;
  const descParts: string[] = [];
  if (meta?.constellation) descParts.push(`Constellation: ${meta.constellation}`);
  if (typeof meta?.ra === "number" && typeof meta?.dec === "number") {
    descParts.push(`RA ${formatRightAscension(meta.ra)} · Dec ${formatDeclination(meta.dec)}`);
  }
  const description = descParts.join(" • ") || undefined;
  const imageUrl = `https://storage.googleapis.com/${BUCKET}/${filename}`;
  const canonical = `/image/${encodeURIComponent(filename)}`;

  return {
    title: display,
    description,
    alternates: { canonical },
    openGraph: {
      title: display,
      description,
      images: [imageUrl],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: display,
      description,
      images: [imageUrl],
    },
  };
}

function formatRightAscension(hours: number): string {
	const normalized = ((hours % 24) + 24) % 24;
	const totalSeconds = normalized * 3600;
	const hh = Math.floor(totalSeconds / 3600);
	const mm = Math.floor((totalSeconds % 3600) / 60);
	const ss = totalSeconds - hh * 3600 - mm * 60;
	const hhStr = String(hh).padStart(2, "0");
	const mmStr = String(mm).padStart(2, "0");
	const ssStr = ss.toFixed(1).padStart(4, "0");
	return `${hhStr}h ${mmStr}m ${ssStr}s`;
}

function formatDeclination(degrees: number): string {
	const isNegative = degrees < 0;
	const suffix = isNegative ? "S" : "N";
	const abs = Math.abs(degrees);
	const totalSeconds = abs * 3600;
	const dd = Math.floor(totalSeconds / 3600);
	const mm = Math.floor((totalSeconds % 3600) / 60);
	const ss = totalSeconds - dd * 3600 - mm * 60;
	const ddStr = String(dd).padStart(2, "0");
	const mmStr = String(mm).padStart(2, "0");
	const ssStr = ss.toFixed(1).padStart(4, "0");
	return `${ddStr}° ${mmStr}' ${ssStr}" ${suffix}`;
}

export default async function ImageDetail({ params }: { params: { filename: string } }) {
  noStore();
  const raw = params.filename;
  const filename = decodeURIComponent(raw);

  const [exists, manifestByFilename] = await Promise.all([
    ensureFileExists(filename),
    fetchManifest(),
  ]);

  if (!exists) return notFound();

  const meta = manifestByFilename[filename];
  const title = meta?.displayName ?? filename;
  const bust = Date.now();
  const url = `https://storage.googleapis.com/${BUCKET}/${filename}?v=${bust}`;

  const allNames = await listBucketImages();
  const index = allNames.indexOf(filename);
  const prevName = index > 0 ? allNames[index - 1] : undefined;
  const nextName = index >= 0 && index < allNames.length - 1 ? allNames[index + 1] : undefined;

  return (
    <main style={{ minHeight: "100vh", padding: 24 }}>
      <Link href="/" style={{ color: "#06c" }}>&larr; Back to gallery</Link>
      <h1 style={{ margin: "16px 0" }}>{title}</h1>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 340px", gap: 24, alignItems: "start" }}>
        <figure style={{ margin: 0 }}>
          <div style={{ position: "relative", width: "100%", height: 0, paddingBottom: "66%", borderRadius: 8, overflow: "hidden" }}>
            <Image
              src={url}
              alt={title}
              fill
              style={{ objectFit: "contain", background: "#000" }}
              sizes="(max-width: 1024px) 100vw, 900px"
              quality={70}
              priority
            />
          </div>
          {(prevName || nextName) && (
            <figcaption style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                {prevName && (
                  <Link href={`/image/${encodeURIComponent(prevName)}`} style={{ color: "#06c" }}>
                    ← Previous
                  </Link>
                )}
              </div>
              <div>
                {nextName && (
                  <Link href={`/image/${encodeURIComponent(nextName)}`} style={{ color: "#06c" }}>
                    Next →
                  </Link>
                )}
              </div>
            </figcaption>
          )}
        </figure>
        <aside style={{ position: "sticky", top: 24, alignSelf: "start" }}>
          <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>Details</div>
            {meta?.constellation && <div style={{ marginBottom: 6 }}>Constellation: {meta.constellation}</div>}
            {typeof meta?.ra === "number" && typeof meta?.dec === "number" && (
              <div style={{ marginBottom: 6 }}>
                RA: {formatRightAscension(meta.ra)}<br />
                Dec: {formatDeclination(meta.dec)}
              </div>
            )}
            <div style={{ color: "#666", fontSize: 13 }}>File: {filename}</div>
          </div>
        </aside>
      </div>
    </main>
  );
}



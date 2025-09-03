import { unstable_noStore as noStore } from "next/cache";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ImageViewer from "@/components/ImageViewer";

const BUCKET = "astro-website-images-astrowebsite-470903";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";

interface ManifestEntry {
	objectId: string;
	displayName?: string;
	ra?: number;
	dec?: number;
	constellation?: string;
	imageFilename: string;
}

async function fetchManifestArray(): Promise<ManifestEntry[]> {
	try {
		const res = await fetch(`https://storage.googleapis.com/${BUCKET}/web_images.json`, { cache: "no-store" });
		if (!res.ok) return [];
		const arr = (await res.json()) as ManifestEntry[];
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
	}
}

function indexByFilename(arr: ManifestEntry[]): Record<string, ManifestEntry> {
	const map: Record<string, ManifestEntry> = {};
	for (const e of arr) {
		if (e && e.imageFilename) map[e.imageFilename] = e;
	}
	return map;
}

async function ensureFileExists(filename: string): Promise<boolean> {
	try {
		const res = await fetch(`https://storage.googleapis.com/${BUCKET}/${encodeURIComponent(filename)}`, { method: "HEAD", cache: "no-store" });
		return res.ok;
	} catch {
		return false;
	}
}

async function listFromManifest(): Promise<string[]> {
	const arr = await fetchManifestArray();
	return arr
		.filter((e) => e && e.imageFilename && /(\.(jpe?g|png|webp|tiff?))$/i.test(e.imageFilename))
		.map((e) => e.imageFilename)
		.sort();
}

export async function generateMetadata({ params }: { params: { filename: string } }): Promise<Metadata> {
  const raw = params.filename;
  const filename = decodeURIComponent(raw);
  const [exists, manifestArr] = await Promise.all([
    ensureFileExists(filename),
    fetchManifestArray(),
  ]);

  if (!exists) {
    return { title: "Not found" };
  }

  const manifestByFilename = indexByFilename(manifestArr);
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

export default async function ImageDetail({ params, searchParams }: { params: { filename: string }, searchParams?: { [key: string]: string | string[] | undefined } }) {
  noStore();
  const raw = params.filename;
  const filename = decodeURIComponent(raw);

  const [exists, manifestArr] = await Promise.all([
    ensureFileExists(filename),
    fetchManifestArray(),
  ]);

  if (!exists) return notFound();

  const manifestByFilename = indexByFilename(manifestArr);
  const meta = manifestByFilename[filename];
  const title = meta?.displayName ?? filename;
  const url = `https://storage.googleapis.com/${BUCKET}/${filename}`;
  const fsValue = ((): string | undefined => {
    if (!searchParams) return undefined;
    const raw = searchParams["fs"];
    if (typeof raw === "string") return raw;
    if (Array.isArray(raw)) return raw[0];
    return undefined;
  })();
  const isFs = fsValue === "1";
  const navParams = new URLSearchParams();
  if (isFs) navParams.set("fs", "1");

  const allNames = await listFromManifest();
  const index = allNames.indexOf(filename);
  const prevName = index > 0 ? allNames[index - 1] : undefined;
  const nextName = index >= 0 && index < allNames.length - 1 ? allNames[index + 1] : undefined;

  return (
    <main style={{ minHeight: "100vh", padding: isFs ? 0 : 24 }}>
      {/* When fullscreen (fs=1), hide details sidebar and let image fill viewport height */}
      <div className="detailLayout" style={isFs ? { gridTemplateColumns: "minmax(0, 1fr)" } : undefined}>
        <figure style={{ margin: 0 }}>
          <ImageViewer
            url={url}
            title={title}
            prevHref={prevName ? `/image/${encodeURIComponent(prevName)}${navParams.toString() ? `?${navParams.toString()}` : ""}` : undefined}
            nextHref={nextName ? `/image/${encodeURIComponent(nextName)}${navParams.toString() ? `?${navParams.toString()}` : ""}` : undefined}
            pseudoFullscreen={isFs}
            exitHref={`/image/${encodeURIComponent(filename)}`}
          />
        </figure>
        {!isFs && (
          <aside className="detailAside">
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 700 }}>{title}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Link href={`/image/${encodeURIComponent(filename)}?fs=1`} aria-label="Enter fullscreen" style={{ background: "rgba(75,85,99,0.65)", color: "#f3f4f6", width: 36, height: 36, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <span style={{ fontSize: 18 }}>⤢</span>
                  </Link>
                  <Link href="/" aria-label="Close" style={{ background: "rgba(75,85,99,0.65)", color: "#f3f4f6", width: 36, height: 36, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid rgba(255,255,255,0.15)" }}>
                    <span style={{ fontSize: 18 }}>✕</span>
                  </Link>
                </div>
              </div>
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
        )}
      </div>
    </main>
  );
}



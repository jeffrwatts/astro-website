import { Storage } from "@google-cloud/storage";
import { unstable_noStore as noStore } from "next/cache";
import Link from "next/link";
import Image from "next/image";

const BUCKET = "astro-website-images-astrowebsite-470903";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function listBucketImages(): Promise<string[]> {
	const storage = new Storage();
	const [files] = await storage.bucket(BUCKET).getFiles({ autoPaginate: true });
	return files
		.map((f) => f.name)
		.filter((name) => /\.(jpe?g|png|webp|tiff?)$/i.test(name))
		.sort();
}

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

function formatRightAscension(hours: number): string {
	// Convert decimal hours to HH h MM m SS.s s
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
	// Convert decimal degrees to DD° MM' SS.s" with N/S suffix
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

export default async function Home() {
  noStore();
  const [names, manifestByFilename] = await Promise.all([
    listBucketImages(),
    fetchManifest(),
  ]);
  const items = names.map((file) => ({ file, meta: manifestByFilename[file] }));

	// Per-request cache-buster to avoid stale browser caches.
	const bust = Date.now();

	return (
		<main style={{ minHeight: "100vh", padding: 24 }}>
			<header style={{ padding: "0 0 12px 0", marginBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
				<div style={{ fontSize: 22, fontWeight: 700 }}>Pacific Deep Sky</div>
				<div style={{ color: "var(--muted)", fontSize: 14 }}>Astrophotography by Jeff Ray Watts</div>
			</header>
			<h1 style={{ marginBottom: 16 }}>Gallery</h1>
			{items.length === 0 ? (
				<p>No images found in bucket {BUCKET}.</p>
			) : (
				<ul style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
					{items.map((item) => {
						const name = item.file;
						const meta = (item as { meta?: ManifestEntry }).meta;
						const url = `https://storage.googleapis.com/${BUCKET}/${name}?v=${bust}`;
						const title = meta?.displayName ?? name;
						return (
							<li key={name}>
								<figure>
									<Link href={`/image/${encodeURIComponent(name)}`}>
										<div style={{ position: "relative", width: "100%", height: 200, borderRadius: 8, overflow: "hidden" }}>
											<Image
												src={url}
												alt={title}
												fill
												style={{ objectFit: "cover" }}
												sizes="(max-width: 768px) 50vw, 280px"
												quality={60}
												priority={false}
											/>
										</div>
									</Link>
									<figcaption style={{ marginTop: 8 }}>
										<div>
											<Link href={`/image/${encodeURIComponent(name)}`} style={{ color: "#06c", textDecoration: "none" }}>{title}</Link>
										</div>
										{meta && (
											<div style={{ color: "#666", fontSize: 14, marginTop: 4 }}>
												{meta.constellation && <div>Constellation: {meta.constellation}</div>}
												{typeof meta.ra === "number" && typeof meta.dec === "number" && (
													<div>
														RA: {formatRightAscension(meta.ra)} · Dec: {formatDeclination(meta.dec)}
													</div>
												)}
											</div>
										)}
									</figcaption>
								</figure>
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}

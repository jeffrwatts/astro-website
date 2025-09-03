import Link from "next/link";
import Image from "next/image";

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

async function fetchManifestArray(): Promise<ManifestEntry[]> {
	try {
		const res = await fetch(`https://storage.googleapis.com/${BUCKET}/web_images.json`, { next: { revalidate: 600 } });
		if (!res.ok) return [];
		const arr = (await res.json()) as ManifestEntry[];
		return Array.isArray(arr) ? arr : [];
	} catch {
		return [];
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
  const manifest = await fetchManifestArray();
  const items = manifest
    .filter((e) => e && typeof e.imageFilename === "string" && /\.(jpe?g|png|webp|tiff?)$/i.test(e.imageFilename))
    .sort((a, b) => a.imageFilename.localeCompare(b.imageFilename));

	// Per-request cache-buster to avoid stale browser caches.
	// Removed cache-buster; rely on proper object caching and Next Image.

	return (
		<main style={{ minHeight: "100vh", padding: 24 }}>
			{items.length === 0 ? (
				<p>No images found in bucket {BUCKET}.</p>
			) : (
				<ul style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
					{items.map((meta, index) => {
						const isPriority = index < 8;
						const name = meta.imageFilename;
						const url = `https://storage.googleapis.com/${BUCKET}/${name}`;
						const title = meta?.displayName ?? name;
						return (
							<li key={name}>
								<figure>
									<Link href={`/image/${encodeURIComponent(name)}`} prefetch={false}>
										{meta?.width && meta?.height ? (
											<div style={{ borderRadius: 8, overflow: "hidden" }}>
												<Image
													src={url}
													alt={title}
													width={meta.width}
													height={meta.height}
													style={{ width: "100%", height: "auto", display: "block", objectFit: "cover" }}
													sizes="(max-width: 768px) 50vw, 280px"
													quality={60}
													priority={isPriority}
													loading={isPriority ? "eager" : "lazy"}
													unoptimized
													placeholder={meta?.blurDataURL ? "blur" : undefined}
													blurDataURL={meta?.blurDataURL}
												/>
											</div>
										) : (
											<div style={{ position: "relative", width: "100%", height: 0, paddingBottom: "66%", borderRadius: 8, overflow: "hidden" }}>
												<Image
													src={url}
													alt={title}
													fill
													style={{ objectFit: "cover" }}
													sizes="(max-width: 768px) 50vw, 280px"
													quality={60}
													priority={isPriority}
													loading={isPriority ? "eager" : "lazy"}
													unoptimized
													placeholder={meta?.blurDataURL ? "blur" : undefined}
													blurDataURL={meta?.blurDataURL}
												/>
											</div>
										)}
									</Link>
									<figcaption style={{ marginTop: 8 }}>
										<div>
											<Link href={`/image/${encodeURIComponent(name)}`} prefetch={false} style={{ color: "#06c", textDecoration: "none" }}>{title}</Link>
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

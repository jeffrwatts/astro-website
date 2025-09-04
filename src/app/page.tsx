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
				<ul style={{ display: "grid", gap: 24, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", listStyle: "none", margin: 0, padding: 0 }}>
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
									
								</figure>
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}

import { Storage } from "@google-cloud/storage";

const BUCKET = "astro-website-images-astrowebsite-470903";
export const dynamic = "force-dynamic";

type ManifestItem = {
	file: string;
	title?: string;
	caption?: string;
	order?: number;
	tags?: string[];
};

type Manifest = {
	images: ManifestItem[];
};

async function fetchManifest(): Promise<ManifestItem[] | null> {
	const url = `https://storage.googleapis.com/${BUCKET}/gallery.json`;
	try {
		const res = await fetch(url, { cache: "no-store" });
		if (!res.ok) return null;
		const data = (await res.json()) as Manifest;
		const items = Array.isArray(data?.images) ? data.images : [];
		return items
			.filter((i) => typeof i?.file === "string" && i.file.trim() !== "")
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
	} catch {
		return null;
	}
}

async function listBucketImages(): Promise<string[]> {
	const storage = new Storage();
	const [files] = await storage.bucket(BUCKET).getFiles();
	return files
		.map((f) => f.name)
		.filter((name) => /\.(jpe?g|png|webp|tiff?)$/i.test(name))
		.sort();
}

export default async function Home() {
	const manifest = await fetchManifest();
	let items: ManifestItem[];
	if (manifest && manifest.length > 0) {
		items = manifest;
	} else {
		const names = await listBucketImages();
		items = names.map((file) => ({ file }));
	}

	return (
		<main style={{ minHeight: "100vh", padding: 24 }}>
			<h1 style={{ marginBottom: 16 }}>Gallery</h1>
			{items.length === 0 ? (
				<p>No images found in bucket {BUCKET}.</p>
			) : (
				<ul style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
					{items.map((item) => {
						const name = item.file;
						const url = `https://storage.googleapis.com/${BUCKET}/${name}`;
						const title = item.title ?? name;
						return (
							<li key={name}>
								<figure>
									<img src={url} alt={title} style={{ width: "100%", height: "auto", borderRadius: 8 }} />
									<figcaption style={{ marginTop: 8 }}>
										<div>{title}</div>
										{item.caption && <div style={{ fontSize: 12, opacity: 0.8 }}>{item.caption}</div>}
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

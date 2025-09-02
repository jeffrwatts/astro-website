import { Storage } from "@google-cloud/storage";

const BUCKET = "astro-website-images-astrowebsite-470903";
export const dynamic = "force-dynamic";

async function listBucketImages(): Promise<string[]> {
	const storage = new Storage();
	const [files] = await storage.bucket(BUCKET).getFiles();
	return files
		.map((f) => f.name)
		.filter((name) => /\.(jpe?g|png|webp|tiff?)$/i.test(name))
		.sort();
}

export default async function Home() {
	const files = await listBucketImages();
	return (
		<main style={{ minHeight: "100vh", padding: 24 }}>
			<h1 style={{ marginBottom: 16 }}>Gallery</h1>
			{files.length === 0 ? (
				<p>No images found in bucket {BUCKET}.</p>
			) : (
				<ul style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
					{files.map((name) => {
						const url = `https://storage.googleapis.com/${BUCKET}/${name}`;
						return (
							<li key={name}>
								<figure>
									<img src={url} alt={name} style={{ width: "100%", height: "auto", borderRadius: 8 }} />
									<figcaption style={{ marginTop: 8 }}>{name}</figcaption>
								</figure>
							</li>
						);
					})}
				</ul>
			)}
		</main>
	);
}

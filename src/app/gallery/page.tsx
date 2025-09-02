import Image from "next/image";

const images = [
	{
		id: "hero",
		src: "https://storage.googleapis.com/astro-website-images-astrowebsite-470903/hero.jpg",
		width: 1600,
		height: 1067,
		title: "NGC 6888 (Crescent Nebula)",
	},
];

export default function GalleryPage() {
	return (
		<main style={{ minHeight: "100vh", padding: 24 }}>
			<h1 style={{ marginBottom: 16 }}>Gallery</h1>
			<ul style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
				{images.map((img) => (
					<li key={img.id}>
						<figure>
							<Image src={img.src} alt={img.title} width={img.width} height={img.height} style={{ width: "100%", height: "auto", borderRadius: 8 }} />
							<figcaption style={{ marginTop: 8 }}>{img.title}</figcaption>
						</figure>
					</li>
				))}
			</ul>
		</main>
	);
}



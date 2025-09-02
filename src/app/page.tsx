const BUCKET = "astro-website-images-astrowebsite-470903";
const files = [
	"barnard68.jpg",
	"barnard72.jpg",
	"ic1805.jpg",
	"ic434-1.jpg",
	"ic434-2.jpg",
	"ic434.jpg",
	"ic5146.jpg",
	"ldn1625.jpg",
	"m1.jpg",
	"m16-1.jpg",
	"m16.jpg",
	"m17.jpg",
	"m20.jpg",
	"m27.jpg",
	"m42.jpg",
	"m8.jpg",
	"m97.jpg",
	"ngc1977.jpg",
	"ngc6888.jpg",
	"ngc6960.jpg",
	"ngc6992.jpg",
	"ngc7000.jpg",
	"ngc7293.jpg",
	"ngc7380.jpg",
	"ngc7635.jpg",
];

export default function Home() {
	return (
		<main style={{ minHeight: "100vh", padding: 24 }}>
			<h1 style={{ marginBottom: 16 }}>Gallery</h1>
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
		</main>
	);
}

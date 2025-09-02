import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 1200, width: "100%", textAlign: "center" }}>
        <h1 style={{ marginBottom: 16 }}>Astrophotography</h1>
        <p style={{ marginBottom: 24 }}>Explore the gallery of images.</p>
        <div style={{ marginTop: 8 }}>
          <Link href="/gallery">View Gallery</Link>
        </div>
      </div>
    </main>
  );
}

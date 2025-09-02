import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 1200, width: "100%", textAlign: "center" }}>
        <h1 style={{ marginBottom: 16 }}>Astrophotography</h1>
        <p style={{ marginBottom: 24 }}>Starter image below:</p>
        <Image
          src="/hero.jpg"
          alt="Uploaded astrophotography image"
          width={1600}
          height={1067}
          style={{ width: "100%", height: "auto", borderRadius: 8 }}
          priority
        />
        <div style={{ marginTop: 16 }}>
          <Link href="/gallery">View Gallery</Link>
        </div>
      </div>
    </main>
  );
}

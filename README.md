# Astro Website (Minimal)

A minimal Next.js app serving a single astrophotography image.

## Local

```bash
npm install
npm run dev
# open http://localhost:3000
```

Place your image at `public/hero.jpg`.

## Build

```bash
npm run build
npm start
```

## Docker (Cloud Run)

```bash
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/astro-website

gcloud run deploy astro-website \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/astro-website \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --port 8080
```

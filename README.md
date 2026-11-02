This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Backend API data fetching

The app reads studio data from your backend through a small typed API layer:

- `src/lib/api/client.ts` — env-aware `fetch` wrapper (`apiFetch`, `ApiError`, query params, timeouts).
- `src/lib/api/studios.ts` — cached studio endpoints, response normalisation, and local fallback.
- `src/hooks/use-api.ts` — client-side `useApi()` hook for dashboard/user-specific data.
- `src/app/api/revalidate/route.ts` — optional webhook to clear cached data after mutations.

### 1. Configure the backend URL

Copy `.env.example` to `.env.local` and set your API URL:

```bash
API_BASE_URL=http://localhost:5000/api
# Needed only for browser-side requests made with the useApi hook:
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

`API_BASE_URL` stays on the server, so the address is never sent to the browser.

### 2. Expected endpoints

```text
GET /studios      -> Studio[] | { data: Studio[] } | { studios: Studio[] }
GET /studios/:id  -> Studio   | { data: Studio }   | { studio: Studio }
```

A studio record should look like:

```json
{
  "id": "daylight-infinity-cove",
  "categorySlug": "photo",
  "category": "Photo Studios",
  "title": "The Daylight Infinity Cove",
  "description": "A daylight photo studio...",
  "image": "https://cdn.example.com/studio.jpg",
  "rating": 4.96,
  "reviews": 48,
  "location": "New York, NY",
  "price": 110,
  "capacity": 25,
  "featured": true,
  "amenities": ["30ft infinity cyclorama", "Profoto strobe arrays"]
}
```

Common aliases (`_id`, `name`, `imageUrl`, `hourlyRate`, `maxCapacity`, etc.) are normalised automatically. If your API uses different field names, update `toStudio()` in `src/lib/api/studios.ts`.

### 3. Where it is used

- `/studios` (server component) fetches all studios and filters by `?category=`.
- `/studios/[id]` (server component) fetches one studio and its similar studios, and reuses the same data for metadata.
- Both are cached with `cacheLife("minutes")` and the `studios` cache tag. When `API_BASE_URL` is missing or the backend is unreachable, the app falls back to the local seed data so development is never blocked.

### 4. Refreshing cached data

After creating/updating a studio in your backend, call:

```bash
curl -X POST http://localhost:3000/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"tags":["studios"]}'
```

### 5. Client-side pages

For pages that must fetch in the browser (for example `my-bookings`), use:

```tsx
"use client";

import { useApi } from "@/hooks/use-api";

type Booking = { id: string; studioName: string; status: string };

const { data, error, isLoading, refetch } = useApi<Booking[]>("/bookings");
```

> If the backend serves images from a host other than `images.unsplash.com`, add that host to `images.remotePatterns` in `next.config.ts`.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

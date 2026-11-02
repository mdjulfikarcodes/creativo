import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

/**
 * POST /api/revalidate
 *
 * Invalidate cached API data after a backend mutation. Call this from your
 * backend webhook or admin tools, for example:
 *
 *   curl -X POST http://localhost:3000/api/revalidate \
 *     -H "x-revalidate-secret: $REVALIDATE_SECRET" \
 *     -H "content-type: application/json" \
 *     -d '{"tags":["studios"]}'
 */
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET;
  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret");

  if (!secret || provided !== secret) {
    return NextResponse.json(
      { revalidated: false, message: "Invalid revalidation secret." },
      { status: 401 }
    );
  }

  const body = await request.json().catch(() => null);
  const requestedTags =
    body && typeof body === "object" && Array.isArray(body.tags)
      ? body.tags
      : undefined;
  const tags =
    requestedTags && requestedTags.length > 0
      ? requestedTags.map(String)
      : ["studios"];

  for (const tag of tags) {
    revalidateTag(tag, "max");
  }

  return NextResponse.json({ revalidated: true, tags });
}

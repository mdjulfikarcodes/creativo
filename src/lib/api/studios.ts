import { cacheLife, cacheTag } from "next/cache";

import { apiFetch, ApiError, isApiConfigured } from "@/lib/api/client";
import { studioCategories } from "@/lib/data/categories";
import { studios as fallbackStudios, type Studio } from "@/lib/data/studios";

/**
 * Backend contract expected by these helpers:
 *
 *   GET /studio          -> Studio[] | { data: Studio[] } | { studios: Studio[] }
 *   GET /studio/:id      -> Studio   | { data: Studio }   | { studio: Studio }
 *
 * Override the collection path with `STUDIOS_ENDPOINT` if your backend uses a
 * different route. Field aliases such as `_id`, `name`, `imageUrl`,
 * `hourlyRate`, and `maxCapacity` are normalised so the UI always receives the
 * same `Studio` shape. Update `toStudio()` below if your API uses different
 * names.
 *
 * When no API URL is configured — or the API is unreachable — the helpers fall
 * back to the local seed data in `src/lib/data/studios.ts`, keeping the app
 * usable during development.
 */

const STUDIOS_PATH = process.env.STUDIOS_ENDPOINT ?? "/studio";
const CACHE_TAG = "studios";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1600&auto=format&fit=crop";

type JsonRecord = Record<string, unknown>;

export async function getStudios(): Promise<Studio[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG);

  if (!isApiConfigured()) {
    return fallbackStudios;
  }

  try {
    const payload = await apiFetch<unknown>(STUDIOS_PATH);
    const rawStudios = unwrapList(payload);
    const studios = rawStudios
      .map(toStudio)
      .filter((studio): studio is Studio => studio !== undefined);

    if (rawStudios.length > 0 && studios.length === 0) {
      throw new ApiError(
        "The /studios endpoint returned no records in a recognised shape.",
        200,
        payload
      );
    }

    return studios;
  } catch (error) {
    console.warn(
      "[api] Could not fetch studios from the backend. Using local seed data instead.",
      error
    );
    return fallbackStudios;
  }
}

export async function getStudioById(id: string): Promise<Studio | undefined> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG, `studio-${id}`);

  if (!isApiConfigured()) {
    return fallbackStudios.find((studio) => studio.id === id);
  }

  try {
    const payload = await apiFetch<unknown>(
      `${STUDIOS_PATH}/${encodeURIComponent(id)}`
    );
    const studio = toStudio(unwrapItem(payload));

    if (studio) {
      return studio;
    }
  } catch (error) {
    // A dedicated detail endpoint may not exist; fall through to the list.
    if (!(error instanceof ApiError && error.status === 404)) {
      console.warn(
        `[api] Could not fetch studio "${id}". Falling back to the studios list.`,
        error
      );
    }
  }

  const studios = await getStudios();
  return studios.find((studio) => studio.id === id);
}

export async function getFeaturedStudios(): Promise<Studio[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG);

  const studios = await getStudios();
  const featured = studios.filter((studio) => studio.featured);

  return featured.length > 0 ? featured : studios.slice(0, 3);
}

export async function getSimilarStudios(
  studio: Studio,
  limit = 3
): Promise<Studio[]> {
  "use cache";
  cacheLife("minutes");
  cacheTag(CACHE_TAG);

  const studios = await getStudios();
  const sameCategory = studios.filter(
    (candidate) =>
      candidate.id !== studio.id &&
      candidate.categorySlug === studio.categorySlug
  );
  const others = studios.filter(
    (candidate) =>
      candidate.id !== studio.id && candidate.categorySlug !== studio.categorySlug
  );

  return [...sameCategory, ...others].slice(0, limit);
}

export function filterStudiosByCategory(
  studios: Studio[],
  categorySlug?: string
): Studio[] {
  if (!categorySlug) {
    return studios;
  }

  return studios.filter((studio) => studio.categorySlug === categorySlug);
}

function unwrapList(payload: unknown): unknown[] {
  const list = findList(payload);

  if (!list) {
    throw new ApiError(
      "Unexpected response shape from /studios. Expected an array or an object containing `data`, `studios`, `results`, or `items`.",
      200,
      payload
    );
  }

  return list;
}

function findList(payload: unknown, depth = 0): unknown[] | undefined {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (depth > 2 || !isRecord(payload)) {
    return undefined;
  }

  for (const key of ["data", "studios", "results", "items", "docs", "list"]) {
    const found = findList(payload[key], depth + 1);

    if (found) {
      return found;
    }
  }

  return undefined;
}

function unwrapItem(payload: unknown): unknown {
  if (!isRecord(payload)) {
    return payload;
  }

  for (const key of ["data", "studio", "result", "item"]) {
    if (isRecord(payload[key])) {
      return payload[key];
    }
  }

  return payload;
}

function toStudio(value: unknown): Studio | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const id = readId(value);
  const title = readString(value.title) ?? readString(value.name);

  if (!id || !title) {
    return undefined;
  }

  const category = resolveCategory(value);

  return {
    id,
    categorySlug: category.slug,
    category: category.title,
    title,
    description:
      readString(value.description) ??
      readString(value.overview) ??
      readString(value.summary) ??
      "",
    image:
      readString(value.image) ??
      readString(value.imageUrl) ??
      readString(value.coverImage) ??
      readString(value.thumbnail) ??
      FALLBACK_IMAGE,
    rating: readNumber(value.rating) ?? 0,
    reviews:
      readNumber(value.reviews) ??
      readNumber(value.reviewCount) ??
      readNumber(value.review_count) ??
      0,
    location:
      readString(value.location) ??
      readString(value.city) ??
      readString(value.address) ??
      "Location TBA",
    price:
      readNumber(value.price) ??
      readNumber(value.hourlyRate) ??
      readNumber(value.hourly_rate) ??
      readNumber(value.rate) ??
      0,
    capacity:
      readNumber(value.capacity) ??
      readNumber(value.maxCapacity) ??
      readNumber(value.max_capacity) ??
      0,
    saved: readBoolean(value.saved) ?? false,
    featured:
      readBoolean(value.featured) ??
      readBoolean(value.isFeatured) ??
      readBoolean(value.is_featured) ??
      false,
    amenities: readStringArray(value.amenities) ?? [],
  };
}

function resolveCategory(record: JsonRecord): { slug: string; title: string } {
  const providedSlug =
    readString(record.categorySlug) ?? readString(record.category_slug);
  const providedTitle =
    readString(record.category) ??
    readString(record.categoryName) ??
    readString(record.category_name);

  const matched = studioCategories.find(
    (category) =>
      category.slug === providedSlug ||
      category.title.toLowerCase() === providedTitle?.toLowerCase() ||
      (providedTitle !== undefined &&
        category.slug === slugify(providedTitle))
  );

  const slug =
    providedSlug ?? matched?.slug ?? slugify(providedTitle ?? "uncategorized");

  return {
    slug,
    title: providedTitle ?? matched?.title ?? "Creative Studio",
  };
}

function readId(record: JsonRecord): string | undefined {
  for (const key of ["id", "_id", "studioId", "studio_id", "slug"]) {
    const value = record[key];

    if (typeof value === "string" && value.trim()) {
      return value;
    }

    if (typeof value === "number") {
      return String(value);
    }
  }

  return undefined;
}

function readString(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value.trim() || undefined;
  }

  if (typeof value === "number") {
    return String(value);
  }

  return undefined;
}

function readNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function readBoolean(value: unknown): boolean | undefined {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true") return true;
    if (value === "false") return false;
  }

  if (typeof value === "number") {
    return value !== 0;
  }

  return undefined;
}

function readStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) {
    return undefined;
  }

  const strings = value
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      if (isRecord(item)) {
        return readString(item.name) ?? readString(item.label) ?? readString(item.title);
      }

      return undefined;
    })
    .filter((item): item is string => Boolean(item));

  return strings;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null;
}

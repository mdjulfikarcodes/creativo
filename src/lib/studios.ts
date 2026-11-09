import type { Studio } from "@/lib/types";

export type StudioInput = {
  title: string;
  category: string;
  location: string;
  overview: string;
  hourlyRate: number | string;
  securityDeposit: number | string;
  maxCapacity: number | string;
  imageUrl: string;
  amenities: string[];
};

async function readErrorMessage(
  response: Response,
  fallback: string,
): Promise<string> {
  const body = await response.json().catch(() => null);
  return typeof body?.message === "string"
    ? body.message
    : `${fallback} (${response.status}).`;
}

function requireBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_BASE_URL;
  if (!baseUrl) {
    throw new Error(
      "Studio API is not configured. Set NEXT_PUBLIC_SERVER_BASE_URL in .env.local.",
    );
  }
  return baseUrl.replace(/\/+$/, "");
}

function studioUrl(baseUrl: string, id: string): string {
  return `${baseUrl}/studio/${encodeURIComponent(id)}`;
}

function toStudio(value: unknown): Studio | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const studio = value as Studio;
  return studio._id || studio.id || studio.title ? studio : null;
}

export function parseStudioList(payload: unknown): Studio[] {
  if (Array.isArray(payload)) {
    return payload
      .map(toStudio)
      .filter((studio): studio is Studio => studio !== null);
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (Array.isArray(record.data)) return parseStudioList(record.data);
    if (Array.isArray(record.studios)) return parseStudioList(record.studios);
  }

  return [];
}

export function extractStudio(payload: unknown): Studio | null {
  const direct = toStudio(payload);
  if (direct) return direct;

  if (Array.isArray(payload)) {
    for (const item of payload) {
      const studio = toStudio(item);
      if (studio) return studio;
    }
    return null;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    return toStudio(record.data) ?? toStudio(record.studio);
  }

  return null;
}

export async function getMyStudios(ownerEmail: string): Promise<Studio[]> {
  const baseUrl = requireBaseUrl();

  const cleanEmail = String(ownerEmail || "").trim().toLowerCase();

  if (!cleanEmail) {
    throw new Error("Please sign in to manage your studios.");
  }

  const response = await fetch(
    `${baseUrl}/studio?ownerEmail=${encodeURIComponent(cleanEmail)}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json" },
    },
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error("Please sign in to manage your studios.");
  }

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to load your studios"));
  }

  return parseStudioList(await response.json());
}

export async function getStudioById(id: string): Promise<Studio | null> {
  const baseUrl = requireBaseUrl();

  const response = await fetch(studioUrl(baseUrl, id), {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (response.status === 404) return null;

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to load this studio"));
  }

  return extractStudio(await response.json());
}

export async function updateStudio(
  id: string,
  values: StudioInput,
): Promise<Studio | null> {
  const baseUrl = requireBaseUrl();

  const response = await fetch(studioUrl(baseUrl, id), {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(values),
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to update studio"));
  }

  const payload = await response.json().catch(() => null);
  return extractStudio(payload);
}

export async function deleteStudio(id: string): Promise<void> {
  const baseUrl = requireBaseUrl();

  const response = await fetch(studioUrl(baseUrl, id), {
    method: "DELETE",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to delete studio"));
  }
}

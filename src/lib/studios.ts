import type { Studio } from "@/lib/types";

function toStudio(value: unknown): Studio | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const studio = value as Studio;
  return studio._id || studio.id || studio.title ? studio : null;
}

/** Normalizes the different list shapes returned by the Express API. */
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

/** Normalizes the different single-studio shapes returned by the Express API. */
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

/**
 * Small HTTP client shared by Server and Client Components.
 *
 * Configuration (put these in `.env.local`):
 * - `API_BASE_URL` — server-only base URL, e.g. http://localhost:5000/api
 * - `NEXT_PUBLIC_API_BASE_URL` — required only for browser-side requests
 *
 * Server Components should prefer `API_BASE_URL` so the backend address is
 * never shipped to the browser.
 */

export type QueryParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type ApiRequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
  query?: QueryParams;
  timeoutMs?: number;
};

export class ApiError extends Error {
  readonly status: number;
  readonly details?: unknown;

  constructor(message: string, status = 0, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Resolve the backend base URL without a trailing slash.
 *
 * On the server we allow the private `API_BASE_URL`; in the browser only the
 * `NEXT_PUBLIC_` variant is available.
 */
export function getApiBaseUrl(): string {
  const configured =
    typeof window === "undefined"
      ? process.env.API_BASE_URL ??
        process.env.NEXT_PUBLIC_API_BASE_URL ??
        process.env.NEXT_PUBLIC_SERVER_BASE_URL
      : process.env.NEXT_PUBLIC_API_BASE_URL ??
        process.env.NEXT_PUBLIC_SERVER_BASE_URL;

  return configured?.replace(/\/+$/, "") ?? "";
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

export function buildApiUrl(path: string, query?: QueryParams): string {
  const baseUrl = getApiBaseUrl();

  if (!baseUrl) {
    throw new ApiError(
      "Backend API is not configured. Set API_BASE_URL in .env.local (or NEXT_PUBLIC_API_BASE_URL for browser requests)."
    );
  }

  const url = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);

  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

export async function apiFetch<T>(
  path: string,
  {
    query,
    body,
    timeoutMs = 10_000,
    headers,
    ...init
  }: ApiRequestOptions = {}
): Promise<T> {
  const url = buildApiUrl(path, query);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      signal: init.signal ?? controller.signal,
      headers: {
        Accept: "application/json",
        ...(isJsonBody(body) ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: isJsonBody(body) ? JSON.stringify(body) : body,
    });

    const raw = await response.text();
    const contentType = response.headers.get("content-type") ?? "";
    const payload = parseResponseBody(raw, contentType);

    if (!response.ok) {
      throw new ApiError(
        readErrorMessage(payload) ?? `Request failed with status ${response.status}`,
        response.status,
        payload
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ApiError(
        `Request to ${url} timed out after ${timeoutMs}ms`,
        0,
        error
      );
    }

    throw new ApiError(
      error instanceof Error ? error.message : "Unknown API request error",
      0,
      error
    );
  } finally {
    clearTimeout(timeout);
  }
}

function isJsonBody(
  body: ApiRequestOptions["body"]
): body is Record<string, unknown> | unknown[] {
  return (
    typeof body === "object" &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ArrayBuffer) &&
    !ArrayBuffer.isView(body)
  );
}

function parseResponseBody(raw: string, contentType: string): unknown {
  if (!raw) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  return raw;
}

function readErrorMessage(payload: unknown): string | undefined {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string") {
    return record.message;
  }

  if (typeof record.error === "string") {
    return record.error;
  }

  return undefined;
}

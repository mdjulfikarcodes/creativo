"use client";

import { useCallback, useEffect, useState } from "react";

import {
  apiFetch,
  ApiError,
  isApiConfigured,
  type QueryParams,
} from "@/lib/api/client";

export type UseApiOptions<T> = {
  /** Values appended to the request URL as a query string. */
  query?: QueryParams;
  /** Skip the request when false (useful for conditional/dependent fetches). */
  enabled?: boolean;
  /** Data to render before the first request resolves. */
  initialData?: T;
};

export type UseApiResult<T> = {
  data: T | undefined;
  error: ApiError | undefined;
  isLoading: boolean;
  refetch: () => void;
};

type ApiResult<T> = {
  key: string;
  data?: T;
  error?: ApiError;
};

/**
 * Client-side data fetching for dashboard/user-specific pages.
 *
 *   const { data, error, isLoading, refetch } = useApi<Booking[]>("/bookings");
 *
 * Requires `NEXT_PUBLIC_API_BASE_URL` because the request runs in the browser.
 * Prefer Server Components + `getStudios()` for public, SEO-sensitive pages.
 */
export function useApi<T>(
  path: string | null,
  { query, enabled = true, initialData }: UseApiOptions<T> = {}
): UseApiResult<T> {
  const [result, setResult] = useState<ApiResult<T> | undefined>();
  const [requestVersion, setRequestVersion] = useState(0);
  const queryKey = JSON.stringify(query ?? {});
  const requestKey = `${path ?? ""}?${queryKey}#${requestVersion}`;
  const isEnabled = Boolean(path) && enabled;
  const isConfigurationError = isEnabled && !isApiConfigured();
  const configurationError = isConfigurationError
    ? new ApiError(
        "Backend API is not configured. Set NEXT_PUBLIC_API_BASE_URL in .env.local."
      )
    : undefined;

  useEffect(() => {
    if (!path || !enabled || isConfigurationError) {
      return;
    }

    const controller = new AbortController();
    let isActive = true;

    apiFetch<T>(path, {
      query: JSON.parse(queryKey) as QueryParams,
      signal: controller.signal,
    })
      .then((data) => {
        if (isActive) {
          setResult({ key: requestKey, data });
        }
      })
      .catch((error: unknown) => {
        if (!isActive) return;

        setResult({
          key: requestKey,
          error:
            error instanceof ApiError
              ? error
              : new ApiError(
                  error instanceof Error
                    ? error.message
                    : "Unknown API request error",
                  0,
                  error
                ),
        });
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [path, enabled, queryKey, requestKey, isConfigurationError]);

  const refetch = useCallback(() => {
    setRequestVersion((version) => version + 1);
  }, []);

  const isCurrent = result?.key === requestKey;

  return {
    data: isCurrent ? result.data : (result?.data ?? initialData),
    error: configurationError ?? (isCurrent ? result.error : undefined),
    isLoading: isEnabled && !isConfigurationError && !isCurrent,
    refetch,
  };
}

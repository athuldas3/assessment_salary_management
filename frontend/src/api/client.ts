export class ApiError extends Error {
  code: string;
  details?: Array<{ field?: string | null; message: string }>;

  constructor(
    code: string,
    message: string,
    details?: Array<{ field?: string | null; message: string }>,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api/v1";

type QueryParamValue = string | number | undefined | null | string[];

type RequestOptions = {
  method?: string;
  body?: unknown;
  params?: Record<string, QueryParamValue>;
};

function buildUrl(path: string, params?: RequestOptions["params"]) {
  const url = new URL(`${API_BASE_URL}${path}`, window.location.origin);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          if (item !== "") {
            url.searchParams.append(key, String(item));
          }
        });
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetch(buildUrl(path, options.params), {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json();

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      error?.code ?? "INTERNAL_ERROR",
      error?.message ?? "Request failed",
      error?.details,
    );
  }

  return payload as T;
}

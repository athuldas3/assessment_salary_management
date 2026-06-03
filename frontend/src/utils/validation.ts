import { ApiError } from "../api/client";

export function applyApiValidationErrors<T extends Record<string, unknown>>(
  error: unknown,
  setError: (name: keyof T, error: { message: string }) => void,
) {
  if (!(error instanceof ApiError) || !error.details?.length) {
    return;
  }

  error.details.forEach((detail) => {
    if (!detail.field) {
      return;
    }

    const field = detail.field.replace(/^body\./, "") as keyof T;
    setError(field, { message: detail.message });
  });
}

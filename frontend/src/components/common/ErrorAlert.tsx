import { Alert } from "@mui/material";

import { ApiError } from "../../api/client";

type ErrorAlertProps = {
  error: unknown;
  title?: string;
};

export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function ErrorAlert({ error, title = "Unable to complete the request" }: ErrorAlertProps) {
  if (!error) {
    return null;
  }

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <strong>{title}:</strong> {getErrorMessage(error)}
    </Alert>
  );
}

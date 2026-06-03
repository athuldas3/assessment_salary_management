import { Alert, AlertTitle, Stack, Typography } from "@mui/material";

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

export function getValidationDetails(error: unknown) {
  if (error instanceof ApiError && error.details?.length) {
    return error.details;
  }

  return [];
}

export function ErrorAlert({ error, title = "Unable to complete the request" }: ErrorAlertProps) {
  const details = getValidationDetails(error);

  if (!error) {
    return null;
  }

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <AlertTitle>{title}</AlertTitle>
      <Typography variant="body2">{getErrorMessage(error)}</Typography>
      {details.length ? (
        <Stack component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
          {details.map((detail) => (
            <Typography component="li" variant="body2" key={`${detail.field}-${detail.message}`}>
              {detail.field ? `${detail.field}: ` : ""}
              {detail.message}
            </Typography>
          ))}
        </Stack>
      ) : null}
    </Alert>
  );
}

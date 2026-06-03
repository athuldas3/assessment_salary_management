import { Alert, Box, Chip, Stack, Typography } from "@mui/material";

import { useHealthCheck } from "../../api/hooks/useHealthCheck";

type PageHeaderProps = {
  title: string;
  description: string;
};

export function PageHeader({ title, description }: PageHeaderProps) {
  const healthQuery = useHealthCheck();

  return (
    <Stack spacing={2} sx={{ mb: 3 }}>
      <Box>
        <Typography variant="h4" component="h2" gutterBottom>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
      </Box>

      {healthQuery.isLoading ? (
        <Chip label="Checking API..." size="small" />
      ) : null}
      {healthQuery.isSuccess ? (
        <Chip color="success" label="API connected" size="small" variant="outlined" />
      ) : null}
      {healthQuery.isError ? (
        <Alert severity="warning">
          Backend API is unavailable. Start the FastAPI server on port 8000.
        </Alert>
      ) : null}
    </Stack>
  );
}

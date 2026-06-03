import { Box, CircularProgress, Typography } from "@mui/material";

type LoadingPanelProps = {
  label?: string;
};

export function LoadingPanel({ label = "Loading..." }: LoadingPanelProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 6,
        gap: 2,
      }}
    >
      <CircularProgress size={32} />
      <Typography color="text.secondary">{label}</Typography>
    </Box>
  );
}

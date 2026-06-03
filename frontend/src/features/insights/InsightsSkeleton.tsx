import { Grid, Skeleton, Stack } from "@mui/material";

export function InsightsSkeleton() {
  return (
    <Stack spacing={3}>
      <Grid container spacing={2}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Skeleton variant="rounded" height={120} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rounded" height={280} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rounded" height={240} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rounded" height={240} />
        </Grid>
      </Grid>
      <Skeleton variant="rounded" height={180} />
    </Stack>
  );
}

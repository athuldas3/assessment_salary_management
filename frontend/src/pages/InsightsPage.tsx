import { Paper, Typography } from "@mui/material";

import { PageHeader } from "../components/layout/PageHeader";

export function InsightsPage() {
  return (
    <>
      <PageHeader
        title="Salary Insights"
        description="Review compensation trends by country, department, and job title."
      />
      <Paper sx={{ p: 3 }}>
        <Typography>
          Salary insights dashboard will be implemented in a later step.
        </Typography>
      </Paper>
    </>
  );
}

import { Paper, Typography } from "@mui/material";

import { PageHeader } from "../components/layout/PageHeader";

export function EmployeesPage() {
  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage employee salary records with pagination, filters, and CRUD actions."
      />
      <Paper sx={{ p: 3 }}>
        <Typography>
          Employee management UI will be implemented in the next step.
        </Typography>
      </Paper>
    </>
  );
}

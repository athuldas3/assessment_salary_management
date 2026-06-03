import { Alert, CircularProgress, Stack } from "@mui/material";
import { useMemo } from "react";

import { useEmployeeFilters } from "../api/hooks/useEmployees";
import {
  useCountryInsights,
  useDepartmentInsights,
  useJobTitleInsights,
} from "../api/hooks/useInsights";
import { PageHeader } from "../components/layout/PageHeader";
import { CountryInsightsTable } from "../features/insights/CountryInsightsTable";
import { CountryJobTitleLookup } from "../features/insights/CountryJobTitleLookup";
import { InsightStatCard } from "../features/insights/InsightStatCard";
import {
  InsightsGrid,
  InsightsGridItem,
  SimpleInsightsTable,
} from "../features/insights/SimpleInsightsTable";

export function InsightsPage() {
  const filtersQuery = useEmployeeFilters();
  const countryQuery = useCountryInsights();
  const departmentQuery = useDepartmentInsights();
  const jobTitleQuery = useJobTitleInsights();

  const isLoading =
    countryQuery.isLoading || departmentQuery.isLoading || jobTitleQuery.isLoading;
  const isError = countryQuery.isError || departmentQuery.isError || jobTitleQuery.isError;

  const summary = useMemo(() => {
    const countries = countryQuery.data?.items ?? [];
    const totalEmployees = countries.reduce(
      (sum, item) => sum + item.employee_count,
      0,
    );

    return {
      countries: countries.length,
      totalEmployees,
    };
  }, [countryQuery.data]);

  return (
    <>
      <PageHeader
        title="Salary Insights"
        description="Review compensation trends by country, department, and job title."
      />

      {isLoading ? (
        <Stack alignItems="center" py={6}>
          <CircularProgress />
        </Stack>
      ) : null}

      {isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Unable to load salary insights. Confirm the backend is running and seeded.
        </Alert>
      ) : null}

      {countryQuery.data ? (
        <Stack spacing={3}>
          <InsightsGrid>
            <InsightsGridItem md={4}>
              <InsightStatCard
                label="Countries covered"
                value={String(summary.countries)}
              />
            </InsightsGridItem>
            <InsightsGridItem md={4}>
              <InsightStatCard
                label="Employees analyzed"
                value={summary.totalEmployees.toLocaleString()}
              />
            </InsightsGridItem>
            <InsightsGridItem md={4}>
              <InsightStatCard
                label="Insight views"
                value="Country · Department · Job title"
                helperText="Aggregated from PostgreSQL"
              />
            </InsightsGridItem>
          </InsightsGrid>

          <CountryInsightsTable items={countryQuery.data.items} />

          <InsightsGrid>
            <InsightsGridItem>
              <SimpleInsightsTable
                title="Average salary by department"
                labelHeader="Department"
                items={(departmentQuery.data?.items ?? []).map((item) => ({
                  label: item.department,
                  avgSalary: item.avg_salary,
                  employeeCount: item.employee_count,
                }))}
              />
            </InsightsGridItem>
            <InsightsGridItem>
              <SimpleInsightsTable
                title="Average salary by job title"
                labelHeader="Job title"
                items={(jobTitleQuery.data?.items ?? []).map((item) => ({
                  label: item.job_title,
                  avgSalary: item.avg_salary,
                  employeeCount: item.employee_count,
                }))}
              />
            </InsightsGridItem>
          </InsightsGrid>

          <CountryJobTitleLookup
            countries={filtersQuery.data?.countries ?? []}
            jobTitles={filtersQuery.data?.job_titles ?? []}
          />
        </Stack>
      ) : null}
    </>
  );
}

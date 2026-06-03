import { Alert, Chip, Stack } from "@mui/material";
import { useMemo } from "react";

import { useEmployeeFilters } from "../api/hooks/useEmployees";
import {
  useCountryInsights,
  useDepartmentInsights,
  useJobTitleInsights,
} from "../api/hooks/useInsights";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { PageHeader } from "../components/layout/PageHeader";
import { CountryInsightsTable } from "../features/insights/CountryInsightsTable";
import { CountryJobTitleLookup } from "../features/insights/CountryJobTitleLookup";
import { InsightStatCard } from "../features/insights/InsightStatCard";
import { InsightsSkeleton } from "../features/insights/InsightsSkeleton";
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
  const isFetching =
    countryQuery.isFetching || departmentQuery.isFetching || jobTitleQuery.isFetching;

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

      {isLoading && !countryQuery.data ? <InsightsSkeleton /> : null}

      {isError ? (
        <ErrorAlert error={countryQuery.error ?? departmentQuery.error ?? jobTitleQuery.error} title="Unable to load salary insights" />
      ) : null}

      {countryQuery.data ? (
        <Stack spacing={3} sx={{ opacity: isFetching ? 0.75 : 1, transition: "opacity 0.2s" }}>
          {isFetching ? <Chip label="Refreshing insights..." size="small" /> : null}

          {summary.totalEmployees === 0 ? (
            <Alert severity="info">
              No employee data is available yet. Seed the database to view salary insights.
            </Alert>
          ) : null}

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

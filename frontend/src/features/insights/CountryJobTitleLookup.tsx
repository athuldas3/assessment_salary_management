import {
  Alert,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";

import { useCountryJobTitleInsight } from "../../api/hooks/useInsights";
import { ErrorAlert } from "../../components/common/ErrorAlert";
import { InsightStatCard } from "./InsightStatCard";

type CountryJobTitleLookupProps = {
  countries: string[];
  jobTitles: string[];
};

export function CountryJobTitleLookup({ countries, jobTitles }: CountryJobTitleLookupProps) {
  const [country, setCountry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [submitted, setSubmitted] = useState<{ country: string; jobTitle: string } | null>(
    null,
  );

  const insightQuery = useCountryJobTitleInsight(
    submitted?.country ?? "",
    submitted?.jobTitle ?? "",
  );

  const handleSubmit = () => {
    setSubmitted({ country, jobTitle });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Average salary for job title in country
      </Typography>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="lookup-country-label">Country</InputLabel>
          <Select
            labelId="lookup-country-label"
            label="Country"
            value={country}
            onChange={(event) => setCountry(event.target.value)}
          >
            {countries.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="lookup-job-title-label">Job title</InputLabel>
          <Select
            labelId="lookup-job-title-label"
            label="Job title"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
          >
            {jobTitles.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!country || !jobTitle || insightQuery.isFetching}
          sx={{ minWidth: 140 }}
          startIcon={
            insightQuery.isFetching ? <CircularProgress size={16} color="inherit" /> : undefined
          }
        >
          Analyze
        </Button>
      </Stack>

      {insightQuery.isError ? (
        <ErrorAlert error={insightQuery.error} title="Unable to load selected insight" />
      ) : null}

      {insightQuery.isLoading && submitted ? (
        <Stack direction="row" spacing={2}>
          <InsightStatCard label="Average salary" value="Loading..." />
          <InsightStatCard label="Employee count" value="..." />
        </Stack>
      ) : null}

      {insightQuery.data &&
      !insightQuery.isFetching &&
      insightQuery.data.employee_count > 0 ? (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <InsightStatCard
            label="Average salary"
            value={insightQuery.data.avg_salary ?? "No matching employees"}
          />
          <InsightStatCard
            label="Employee count"
            value={String(insightQuery.data.employee_count)}
            helperText={`${insightQuery.data.country} · ${insightQuery.data.job_title}`}
          />
        </Stack>
      ) : null}

      {submitted &&
      insightQuery.data &&
      insightQuery.data.employee_count === 0 &&
      !insightQuery.isFetching ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No employees match the selected country and job title.
        </Alert>
      ) : null}
    </Paper>
  );
}

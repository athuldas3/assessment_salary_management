import {
  Alert,
  Button,
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
          disabled={!country || !jobTitle}
          sx={{ minWidth: 140 }}
        >
          Analyze
        </Button>
      </Stack>

      {insightQuery.isError ? (
        <Alert severity="error">Unable to load insight for the selected filters.</Alert>
      ) : null}

      {insightQuery.data ? (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <InsightStatCard
            label="Average salary"
            value={insightQuery.data.avg_salary ?? "No data"}
          />
          <InsightStatCard
            label="Employee count"
            value={String(insightQuery.data.employee_count)}
            helperText={`${insightQuery.data.country} · ${insightQuery.data.job_title}`}
          />
        </Stack>
      ) : null}
    </Paper>
  );
}

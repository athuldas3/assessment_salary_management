import {
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";

type EmployeeFiltersBarProps = {
  search: string;
  country: string;
  jobTitle: string;
  countries: string[];
  jobTitles: string[];
  onSearchChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onJobTitleChange: (value: string) => void;
  onClear: () => void;
};

export function EmployeeFiltersBar({
  search,
  country,
  jobTitle,
  countries,
  jobTitles,
  onSearchChange,
  onCountryChange,
  onJobTitleChange,
  onClear,
}: EmployeeFiltersBarProps) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 3 }}>
      <TextField
        label="Search name"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        fullWidth
      />

      <FormControl fullWidth>
        <InputLabel id="country-filter-label">Country</InputLabel>
        <Select
          labelId="country-filter-label"
          label="Country"
          value={country}
          onChange={(event) => onCountryChange(event.target.value)}
        >
          <MenuItem value="">All countries</MenuItem>
          {countries.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth>
        <InputLabel id="job-title-filter-label">Job title</InputLabel>
        <Select
          labelId="job-title-filter-label"
          label="Job title"
          value={jobTitle}
          onChange={(event) => onJobTitleChange(event.target.value)}
        >
          <MenuItem value="">All job titles</MenuItem>
          {jobTitles.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Button variant="outlined" onClick={onClear} sx={{ minWidth: 120 }}>
        Clear
      </Button>
    </Stack>
  );
}

import { useQuery } from "@tanstack/react-query";

import {
  getCountryInsights,
  getCountryJobTitleInsight,
  getDepartmentInsights,
  getJobTitleInsights,
} from "../insights";

export const insightKeys = {
  all: ["insights"] as const,
  country: ["insights", "country"] as const,
  department: ["insights", "department"] as const,
  jobTitle: ["insights", "job-title"] as const,
  countryJobTitle: (country: string, jobTitle: string) =>
    ["insights", "country-job-title", country, jobTitle] as const,
};

export function useCountryInsights() {
  return useQuery({
    queryKey: insightKeys.country,
    queryFn: getCountryInsights,
  });
}

export function useDepartmentInsights() {
  return useQuery({
    queryKey: insightKeys.department,
    queryFn: getDepartmentInsights,
  });
}

export function useJobTitleInsights() {
  return useQuery({
    queryKey: insightKeys.jobTitle,
    queryFn: getJobTitleInsights,
  });
}

export function useCountryJobTitleInsight(country: string, jobTitle: string) {
  return useQuery({
    queryKey: insightKeys.countryJobTitle(country, jobTitle),
    queryFn: () => getCountryJobTitleInsight(country, jobTitle),
    enabled: Boolean(country && jobTitle),
  });
}

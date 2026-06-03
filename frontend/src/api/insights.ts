import { apiRequest } from "./client";
import type {
  CountryInsight,
  CountryJobTitleInsight,
  DepartmentInsight,
  JobTitleInsight,
} from "./types";

export function getCountryInsights() {
  return apiRequest<{ items: CountryInsight[] }>("/insights/by-country");
}

export function getDepartmentInsights() {
  return apiRequest<{ items: DepartmentInsight[] }>("/insights/by-department");
}

export function getJobTitleInsights() {
  return apiRequest<{ items: JobTitleInsight[] }>("/insights/by-job-title");
}

export function getCountryJobTitleInsight(country: string, job_title: string) {
  return apiRequest<CountryJobTitleInsight>("/insights/country-job-title", {
    params: { country, job_title },
  });
}

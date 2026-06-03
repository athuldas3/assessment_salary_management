import { apiRequest } from "./client";
import type {
  Employee,
  EmployeeFilters,
  EmployeeInput,
  PaginatedEmployees,
} from "./types";

export type EmployeeListQuery = {
  page?: number;
  page_size?: number;
  country?: string;
  job_title?: string;
  department?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

export function getEmployees(params: EmployeeListQuery) {
  return apiRequest<PaginatedEmployees>("/employees", { params });
}

export function getEmployee(id: string) {
  return apiRequest<Employee>(`/employees/${id}`);
}

export function createEmployee(payload: EmployeeInput) {
  return apiRequest<Employee>("/employees", { method: "POST", body: payload });
}

export function updateEmployee(id: string, payload: EmployeeInput) {
  return apiRequest<Employee>(`/employees/${id}`, { method: "PUT", body: payload });
}

export function deleteEmployee(id: string) {
  return apiRequest<void>(`/employees/${id}`, { method: "DELETE" });
}

export function getEmployeeFilters() {
  return apiRequest<EmployeeFilters>("/employees/metadata/filters");
}

export function getHealthStatus() {
  return apiRequest<{ status: string }>("/health");
}

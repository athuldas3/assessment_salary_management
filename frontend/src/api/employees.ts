import { apiRequest } from "./client";
import type {
  Employee,
  EmployeeFilters,
  EmployeeInput,
  PaginatedEmployees,
} from "./types";

export type EmployeeSortField =
  | "full_name"
  | "country"
  | "job_title"
  | "department"
  | "salary";

export type EmployeeSort = {
  field: EmployeeSortField;
  order: "asc" | "desc";
};

export type EmployeeListQuery = {
  page?: number;
  page_size?: number;
  country?: string;
  job_title?: string;
  department?: string;
  search?: string;
  sort?: EmployeeSort[];
  sort_by?: string;
  sort_order?: "asc" | "desc";
};

function serializeSortParams(sort?: EmployeeSort[]) {
  if (!sort?.length) {
    return undefined;
  }

  return sort.map((item) => `${item.field}:${item.order}`);
}

export function getEmployees(params: EmployeeListQuery) {
  const { sort, ...rest } = params;

  return apiRequest<PaginatedEmployees>("/employees", {
    params: {
      ...rest,
      sort: serializeSortParams(sort),
    },
  });
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

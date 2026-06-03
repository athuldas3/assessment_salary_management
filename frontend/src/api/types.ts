export type Employee = {
  id: string;
  full_name: string;
  country: string;
  job_title: string;
  department: string;
  salary: string;
  created_at: string;
  updated_at: string;
};

export type PaginatedEmployees = {
  items: Employee[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type EmployeeInput = {
  full_name: string;
  country: string;
  job_title: string;
  department: string;
  salary: string;
};

export type EmployeeFilters = {
  countries: string[];
  job_titles: string[];
  departments: string[];
};

export type CountryInsight = {
  country: string;
  min_salary: string;
  max_salary: string;
  avg_salary: string;
  employee_count: number;
  salary_range: string;
};

export type DepartmentInsight = {
  department: string;
  avg_salary: string;
  employee_count: number;
};

export type JobTitleInsight = {
  job_title: string;
  avg_salary: string;
  employee_count: number;
};

export type CountryJobTitleInsight = {
  country: string;
  job_title: string;
  avg_salary: string | null;
  employee_count: number;
};

export type ApiErrorResponse = {
  error: {
    code: string;
    message: string;
    details?: Array<{ field?: string | null; message: string }>;
  };
};

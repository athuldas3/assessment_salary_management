import type { EmployeeSort, EmployeeSortField } from "../../api/employees";

export const DEFAULT_SORTS: EmployeeSort[] = [{ field: "full_name", order: "asc" }];

export function cycleSort(sorts: EmployeeSort[], field: EmployeeSortField): EmployeeSort[] {
  const index = sorts.findIndex((item) => item.field === field);

  if (index === -1) {
    return [...sorts, { field, order: "asc" }];
  }

  const current = sorts[index];

  if (current.order === "asc") {
    return sorts.map((item, itemIndex) =>
      itemIndex === index ? { ...item, order: "desc" as const } : item,
    );
  }

  return sorts.filter((item) => item.field !== field);
}

export function getSortForField(sorts: EmployeeSort[], field: EmployeeSortField) {
  const index = sorts.findIndex((item) => item.field === field);

  if (index === -1) {
    return { active: false, order: "asc" as const, priority: null };
  }

  return {
    active: true,
    order: sorts[index].order,
    priority: index + 1,
  };
}

export function formatSortLabel(sort: EmployeeSort) {
  const fieldLabels: Record<EmployeeSortField, string> = {
    full_name: "Name",
    country: "Country",
    job_title: "Job title",
    department: "Department",
    salary: "Salary",
  };

  return `${fieldLabels[sort.field]} (${sort.order.toUpperCase()})`;
}

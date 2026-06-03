import { useMutation, useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  getEmployeeFilters,
  getEmployees,
  updateEmployee,
  type EmployeeListQuery,
} from "../employees";
import type { EmployeeInput } from "../types";
import { insightKeys } from "./useInsights";

export const employeeKeys = {
  all: ["employees"] as const,
  list: (params: EmployeeListQuery) => ["employees", "list", params] as const,
  detail: (id: string) => ["employees", "detail", id] as const,
  filters: ["employees", "filters"] as const,
};

export function useEmployeeFilters() {
  return useQuery({
    queryKey: employeeKeys.filters,
    queryFn: getEmployeeFilters,
    staleTime: 60_000,
  });
}

export function useEmployees(params: EmployeeListQuery) {
  return useQuery({
    queryKey: employeeKeys.list(params),
    queryFn: () => getEmployees(params),
    placeholderData: keepPreviousData,
  });
}

export function useEmployee(id: string | null) {
  return useQuery({
    queryKey: employeeKeys.detail(id ?? "unknown"),
    queryFn: () => getEmployee(id!),
    enabled: Boolean(id),
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createEmployee,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.invalidateQueries({ queryKey: insightKeys.all });
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EmployeeInput }) =>
      updateEmployee(id, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.invalidateQueries({ queryKey: insightKeys.all });
      await queryClient.invalidateQueries({
        queryKey: employeeKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEmployee,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: employeeKeys.all });
      await queryClient.invalidateQueries({ queryKey: insightKeys.all });
    },
  });
}

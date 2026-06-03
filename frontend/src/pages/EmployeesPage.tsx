import AddIcon from "@mui/icons-material/Add";
import { Alert, Box, Button, Chip, Stack } from "@mui/material";
import { useMemo, useState } from "react";

import {
  useCreateEmployee,
  useDeleteEmployee,
  useEmployeeFilters,
  useEmployees,
  useUpdateEmployee,
} from "../api/hooks/useEmployees";
import type { Employee } from "../api/types";
import { ErrorAlert } from "../components/common/ErrorAlert";
import { SuccessSnackbar } from "../components/common/SuccessSnackbar";
import { TableSkeleton } from "../components/common/TableSkeleton";
import { PageHeader } from "../components/layout/PageHeader";
import { DeleteEmployeeDialog } from "../features/employees/DeleteEmployeeDialog";
import { EmployeeFiltersBar } from "../features/employees/EmployeeFiltersBar";
import { EmployeeFormDialog } from "../features/employees/EmployeeFormDialog";
import { EmployeeTable } from "../features/employees/EmployeeTable";
import type { EmployeeFormValues } from "../schemas/employee";

type DialogState =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; employee: Employee }
  | { type: "delete"; employee: Employee };

export function EmployeesPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [search, setSearch] = useState("");
  const [country, setCountry] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [dialogState, setDialogState] = useState<DialogState>({ type: "closed" });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const listParams = useMemo(
    () => ({
      page: page + 1,
      page_size: pageSize,
      search: search || undefined,
      country: country || undefined,
      job_title: jobTitle || undefined,
      sort_by: "full_name",
      sort_order: "asc" as const,
    }),
    [country, jobTitle, page, pageSize, search],
  );

  const filtersQuery = useEmployeeFilters();
  const employeesQuery = useEmployees(listParams);
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const closeDialog = () => {
    createMutation.reset();
    updateMutation.reset();
    deleteMutation.reset();
    setDialogState({ type: "closed" });
  };

  const handleCreate = async (values: EmployeeFormValues) => {
    await createMutation.mutateAsync(values);
    setSuccessMessage("Employee created successfully.");
    closeDialog();
  };

  const handleUpdate = async (values: EmployeeFormValues) => {
    if (dialogState.type !== "edit") {
      return;
    }

    await updateMutation.mutateAsync({
      id: dialogState.employee.id,
      payload: values,
    });
    setSuccessMessage("Employee updated successfully.");
    closeDialog();
  };

  const handleDelete = async () => {
    if (dialogState.type !== "delete") {
      return;
    }

    await deleteMutation.mutateAsync(dialogState.employee.id);
    setSuccessMessage("Employee deleted successfully.");
    closeDialog();
  };

  const clearFilters = () => {
    setSearch("");
    setCountry("");
    setJobTitle("");
    setPage(0);
  };

  return (
    <>
      <PageHeader
        title="Employees"
        description="Manage employee salary records with pagination, filters, and CRUD actions."
      />

      <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogState({ type: "create" })}
        >
          Add employee
        </Button>
      </Stack>

      {filtersQuery.isError ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Filter options could not be loaded. You can still search and manage employees.
        </Alert>
      ) : null}

      <EmployeeFiltersBar
        search={search}
        country={country}
        jobTitle={jobTitle}
        countries={filtersQuery.data?.countries ?? []}
        jobTitles={filtersQuery.data?.job_titles ?? []}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
        onCountryChange={(value) => {
          setCountry(value);
          setPage(0);
        }}
        onJobTitleChange={(value) => {
          setJobTitle(value);
          setPage(0);
        }}
        onClear={clearFilters}
      />

      {employeesQuery.isLoading && !employeesQuery.data ? (
        <TableSkeleton />
      ) : null}

      {employeesQuery.isError ? (
        <ErrorAlert
          error={employeesQuery.error}
          title="Unable to load employees"
        />
      ) : null}

      {employeesQuery.data ? (
        <Box sx={{ opacity: employeesQuery.isFetching ? 0.7 : 1, transition: "opacity 0.2s" }}>
          {employeesQuery.isFetching ? (
            <Chip label="Refreshing..." size="small" sx={{ mb: 2 }} />
          ) : null}
          <EmployeeTable
            employees={employeesQuery.data.items}
            page={page}
            pageSize={pageSize}
            totalItems={employeesQuery.data.total_items}
            onPageChange={setPage}
            onPageSizeChange={(nextPageSize) => {
              setPageSize(nextPageSize);
              setPage(0);
            }}
            onEdit={(employee) => setDialogState({ type: "edit", employee })}
            onDelete={(employee) => setDialogState({ type: "delete", employee })}
          />
        </Box>
      ) : null}

      {!employeesQuery.isLoading && employeesQuery.data?.total_items === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          No employees found. Add a record or run the backend seed script.
        </Alert>
      ) : null}

      <EmployeeFormDialog
        open={dialogState.type === "create" || dialogState.type === "edit"}
        mode={dialogState.type === "edit" ? "edit" : "create"}
        employee={dialogState.type === "edit" ? dialogState.employee : null}
        isSubmitting={createMutation.isPending || updateMutation.isPending}
        submitError={createMutation.error ?? updateMutation.error}
        onClose={closeDialog}
        onSubmit={dialogState.type === "edit" ? handleUpdate : handleCreate}
      />

      <DeleteEmployeeDialog
        open={dialogState.type === "delete"}
        employee={dialogState.type === "delete" ? dialogState.employee : null}
        isSubmitting={deleteMutation.isPending}
        submitError={deleteMutation.error}
        onClose={closeDialog}
        onConfirm={handleDelete}
      />

      <SuccessSnackbar
        open={Boolean(successMessage)}
        message={successMessage ?? ""}
        onClose={() => setSuccessMessage(null)}
      />
    </>
  );
}

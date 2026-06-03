import { zodResolver } from "@hookform/resolvers/zod";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

import type { Employee } from "../../api/types";
import { ErrorAlert } from "../../components/common/ErrorAlert";
import { employeeSchema, type EmployeeFormValues } from "../../schemas/employee";

type EmployeeFormDialogProps = {
  open: boolean;
  mode: "create" | "edit";
  employee?: Employee | null;
  isSubmitting: boolean;
  submitError: unknown;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
};

const emptyValues: EmployeeFormValues = {
  full_name: "",
  country: "",
  job_title: "",
  department: "",
  salary: "",
};

export function EmployeeFormDialog({
  open,
  mode,
  employee,
  isSubmitting,
  submitError,
  onClose,
  onSubmit,
}: EmployeeFormDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: emptyValues,
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (employee && mode === "edit") {
      reset({
        full_name: employee.full_name,
        country: employee.country,
        job_title: employee.job_title,
        department: employee.department,
        salary: employee.salary,
      });
      return;
    }

    reset(emptyValues);
  }, [employee, mode, open, reset]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{mode === "create" ? "Add Employee" : "Edit Employee"}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Stack spacing={2}>
            <ErrorAlert error={submitError} title="Unable to save employee" />

            <Controller
              name="full_name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Full name"
                  error={Boolean(errors.full_name)}
                  helperText={errors.full_name?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Country"
                  error={Boolean(errors.country)}
                  helperText={errors.country?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="job_title"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Job title"
                  error={Boolean(errors.job_title)}
                  helperText={errors.job_title?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="department"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Department"
                  error={Boolean(errors.department)}
                  helperText={errors.department?.message}
                  fullWidth
                />
              )}
            />

            <Controller
              name="salary"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Annual salary"
                  error={Boolean(errors.salary)}
                  helperText={errors.salary?.message}
                  fullWidth
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {mode === "create" ? "Create" : "Save changes"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

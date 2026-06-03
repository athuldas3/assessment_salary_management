import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import type { Employee } from "../../api/types";
import { ErrorAlert } from "../../components/common/ErrorAlert";

type DeleteEmployeeDialogProps = {
  open: boolean;
  employee: Employee | null;
  isSubmitting: boolean;
  submitError: unknown;
  onClose: () => void;
  onConfirm: () => void;
};

export function DeleteEmployeeDialog({
  open,
  employee,
  isSubmitting,
  submitError,
  onClose,
  onConfirm,
}: DeleteEmployeeDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Delete employee</DialogTitle>
      <DialogContent>
        <ErrorAlert error={submitError} title="Unable to delete employee" />
        <DialogContentText>
          Are you sure you want to delete{" "}
          <strong>{employee?.full_name ?? "this employee"}</strong>? This action cannot be
          undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button color="error" variant="contained" onClick={onConfirm} disabled={isSubmitting}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}

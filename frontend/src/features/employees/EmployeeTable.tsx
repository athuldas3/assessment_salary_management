import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from "@mui/material";

import type { EmployeeSort, EmployeeSortField } from "../../api/employees";
import type { Employee } from "../../api/types";
import { getSortForField } from "./sortUtils";

type EmployeeTableProps = {
  employees: Employee[];
  page: number;
  pageSize: number;
  totalItems: number;
  sorts: EmployeeSort[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSortChange: (field: EmployeeSortField) => void;
  onEdit: (employee: Employee) => void;
  onDelete: (employee: Employee) => void;
};

type SortableHeaderProps = {
  label: string;
  field: EmployeeSortField;
  sorts: EmployeeSort[];
  onSortChange: (field: EmployeeSortField) => void;
  align?: "left" | "right";
};

function SortableHeader({
  label,
  field,
  sorts,
  onSortChange,
  align = "left",
}: SortableHeaderProps) {
  const sortState = getSortForField(sorts, field);

  return (
    <TableCell align={align} sortDirection={sortState.active ? sortState.order : false}>
      <TableSortLabel
        active={sortState.active}
        direction={sortState.active ? sortState.order : "asc"}
        onClick={() => onSortChange(field)}
      >
        <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.75 }}>
          {label}
          {sortState.priority ? (
            <Box
              component="span"
              sx={{
                fontSize: "0.7rem",
                fontWeight: 700,
                lineHeight: 1,
                px: 0.75,
                py: 0.25,
                borderRadius: 999,
                bgcolor: "action.selected",
              }}
            >
              {sortState.priority}
            </Box>
          ) : null}
        </Box>
      </TableSortLabel>
    </TableCell>
  );
}

export function EmployeeTable({
  employees,
  page,
  pageSize,
  totalItems,
  sorts,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <SortableHeader
                label="Name"
                field="full_name"
                sorts={sorts}
                onSortChange={onSortChange}
              />
              <SortableHeader
                label="Country"
                field="country"
                sorts={sorts}
                onSortChange={onSortChange}
              />
              <SortableHeader
                label="Job Title"
                field="job_title"
                sorts={sorts}
                onSortChange={onSortChange}
              />
              <SortableHeader
                label="Department"
                field="department"
                sorts={sorts}
                onSortChange={onSortChange}
              />
              <SortableHeader
                label="Salary"
                field="salary"
                sorts={sorts}
                onSortChange={onSortChange}
                align="right"
              />
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color="text.secondary" sx={{ py: 3, textAlign: "center" }}>
                    No employees match the current filters.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id} hover>
                  <TableCell>{employee.full_name}</TableCell>
                  <TableCell>{employee.country}</TableCell>
                  <TableCell>{employee.job_title}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell align="right">{employee.salary}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" justifyContent="flex-end" spacing={1}>
                      <IconButton
                        aria-label={`Edit ${employee.full_name}`}
                        onClick={() => onEdit(employee)}
                      >
                        <EditOutlinedIcon />
                      </IconButton>
                      <IconButton
                        aria-label={`Delete ${employee.full_name}`}
                        color="error"
                        onClick={() => onDelete(employee)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalItems}
        page={page}
        onPageChange={(_, nextPage) => onPageChange(nextPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => onPageSizeChange(Number(event.target.value))}
        rowsPerPageOptions={[10, 20, 50]}
      />
    </Paper>
  );
}

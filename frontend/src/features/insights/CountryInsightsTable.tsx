import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import type { CountryInsight } from "../../api/types";

type CountryInsightsTableProps = {
  items: CountryInsight[];
};

export function CountryInsightsTable({ items }: CountryInsightsTableProps) {
  return (
    <Paper sx={{ overflow: "hidden" }}>
      <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
        Compensation by country
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Country</TableCell>
              <TableCell align="right">Min salary</TableCell>
              <TableCell align="right">Max salary</TableCell>
              <TableCell align="right">Avg salary</TableCell>
              <TableCell align="right">Employees</TableCell>
              <TableCell>Salary range</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.country} hover>
                <TableCell>{item.country}</TableCell>
                <TableCell align="right">{item.min_salary}</TableCell>
                <TableCell align="right">{item.max_salary}</TableCell>
                <TableCell align="right">{item.avg_salary}</TableCell>
                <TableCell align="right">{item.employee_count}</TableCell>
                <TableCell>{item.salary_range}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

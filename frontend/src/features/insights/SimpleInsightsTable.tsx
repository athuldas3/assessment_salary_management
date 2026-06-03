import {
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

type InsightRow = {
  label: string;
  avgSalary: string;
  employeeCount: number;
};

type SimpleInsightsTableProps = {
  title: string;
  labelHeader: string;
  items: InsightRow[];
};

export function SimpleInsightsTable({
  title,
  labelHeader,
  items,
}: SimpleInsightsTableProps) {
  return (
    <Paper sx={{ overflow: "hidden", height: "100%" }}>
      <Typography variant="h6" sx={{ px: 2, pt: 2 }}>
        {title}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{labelHeader}</TableCell>
              <TableCell align="right">Avg salary</TableCell>
              <TableCell align="right">Employees</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.label} hover>
                <TableCell>{item.label}</TableCell>
                <TableCell align="right">{item.avgSalary}</TableCell>
                <TableCell align="right">{item.employeeCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

export function InsightsGrid({ children }: { children: ReactNode }) {
  return (
    <Grid container spacing={2}>
      {children}
    </Grid>
  );
}

export function InsightsGridItem({
  children,
  md = 6,
}: {
  children: ReactNode;
  md?: number;
}) {
  return (
    <Grid item xs={12} md={md}>
      {children}
    </Grid>
  );
}

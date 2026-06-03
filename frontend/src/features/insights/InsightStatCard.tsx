import { Card, CardContent, Typography } from "@mui/material";

type InsightStatCardProps = {
  label: string;
  value: string;
  helperText?: string;
};

export function InsightStatCard({ label, value, helperText }: InsightStatCardProps) {
  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography color="text.secondary" variant="body2" gutterBottom>
          {label}
        </Typography>
        <Typography variant="h5" component="p">
          {value}
        </Typography>
        {helperText ? (
          <Typography color="text.secondary" variant="caption">
            {helperText}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}

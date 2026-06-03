import { z } from "zod";

export const employeeSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required").max(200),
  country: z.string().trim().min(1, "Country is required").max(100),
  job_title: z.string().trim().min(1, "Job title is required").max(150),
  department: z.string().trim().min(1, "Department is required").max(150),
  salary: z
    .string()
    .trim()
    .min(1, "Salary is required")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, {
      message: "Salary must be greater than 0",
    }),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;

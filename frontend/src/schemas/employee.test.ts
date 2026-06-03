import { describe, expect, it } from "vitest";

import { employeeSchema } from "../schemas/employee";

describe("employeeSchema", () => {
  it("accepts valid employee input", () => {
    const result = employeeSchema.safeParse({
      full_name: "Jane Doe",
      country: "United States",
      job_title: "Software Engineer",
      department: "Engineering",
      salary: "95000.00",
    });

    expect(result.success).toBe(true);
  });

  it("rejects non-positive salary", () => {
    const result = employeeSchema.safeParse({
      full_name: "Jane Doe",
      country: "United States",
      job_title: "Software Engineer",
      department: "Engineering",
      salary: "0",
    });

    expect(result.success).toBe(false);
  });
});

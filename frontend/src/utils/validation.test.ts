import { describe, expect, it, vi } from "vitest";

import { ApiError } from "../api/client";
import { applyApiValidationErrors } from "./validation";

describe("applyApiValidationErrors", () => {
  it("maps api validation details to form fields", () => {
    const setError = vi.fn();
    const error = new ApiError("VALIDATION_ERROR", "Invalid request data", [
      { field: "body.salary", message: "Salary must be greater than 0" },
      { field: "full_name", message: "Full name is required" },
    ]);

    applyApiValidationErrors(error, setError);

    expect(setError).toHaveBeenCalledWith("salary", {
      message: "Salary must be greater than 0",
    });
    expect(setError).toHaveBeenCalledWith("full_name", {
      message: "Full name is required",
    });
  });

  it("ignores non-api errors and empty details", () => {
    const setError = vi.fn();

    applyApiValidationErrors(new Error("network"), setError);
    applyApiValidationErrors(new ApiError("VALIDATION_ERROR", "Invalid"), setError);

    expect(setError).not.toHaveBeenCalled();
  });
});

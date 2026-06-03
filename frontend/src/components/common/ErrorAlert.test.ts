import { describe, expect, it } from "vitest";

import { ApiError } from "../api/client";
import { getErrorMessage, getValidationDetails } from "../components/common/ErrorAlert";

describe("error helpers", () => {
  it("returns api error message", () => {
    const error = new ApiError("VALIDATION_ERROR", "Invalid request data", [
      { field: "salary", message: "Salary must be greater than 0" },
    ]);

    expect(getErrorMessage(error)).toBe("Invalid request data");
    expect(getValidationDetails(error)).toHaveLength(1);
  });
});

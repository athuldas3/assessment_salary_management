import { describe, expect, it } from "vitest";

import { ApiError } from "./client";

describe("ApiError", () => {
  it("stores code, message, and details", () => {
    const error = new ApiError("NOT_FOUND", "Employee not found");

    expect(error.name).toBe("ApiError");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.message).toBe("Employee not found");
    expect(error.details).toBeUndefined();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApiError } from "../../api/client";
import { ErrorAlert, getErrorMessage, getValidationDetails } from "./ErrorAlert";

describe("ErrorAlert helpers", () => {
  it("returns api error message", () => {
    const error = new ApiError("VALIDATION_ERROR", "Invalid request data", [
      { field: "salary", message: "Salary must be greater than 0" },
    ]);

    expect(getErrorMessage(error)).toBe("Invalid request data");
    expect(getValidationDetails(error)).toHaveLength(1);
  });

  it("falls back for unknown errors", () => {
    expect(getErrorMessage("boom")).toBe("Something went wrong");
    expect(getValidationDetails("boom")).toEqual([]);
  });
});

describe("ErrorAlert", () => {
  it("renders message and validation details", () => {
    const error = new ApiError("VALIDATION_ERROR", "Invalid request data", [
      { field: "salary", message: "Salary must be greater than 0" },
    ]);

    render(<ErrorAlert error={error} title="Unable to save employee" />);

    expect(screen.getByText("Unable to save employee")).toBeInTheDocument();
    expect(screen.getByText("Invalid request data")).toBeInTheDocument();
    expect(screen.getByText(/salary:/i)).toBeInTheDocument();
  });

  it("returns null when no error is provided", () => {
    const { container } = render(<ErrorAlert error={null} />);

    expect(container).toBeEmptyDOMElement();
  });
});

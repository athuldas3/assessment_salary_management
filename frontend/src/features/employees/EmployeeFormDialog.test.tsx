import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApiError } from "../../api/client";
import { EmployeeFormDialog } from "./EmployeeFormDialog";

describe("EmployeeFormDialog", () => {
  it("shows client-side validation errors", async () => {
    const user = userEvent.setup();

    render(
      <EmployeeFormDialog
        open
        mode="create"
        isSubmitting={false}
        submitError={null}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: /create/i }));

    expect(await screen.findByText("Full name is required")).toBeInTheDocument();
    expect(screen.getByText("Salary is required")).toBeInTheDocument();
  });

  it("maps api validation errors to fields", async () => {
    const submitError = new ApiError("VALIDATION_ERROR", "Invalid request data", [
      { field: "body.salary", message: "Salary must be greater than 0" },
    ]);

    render(
      <EmployeeFormDialog
        open
        mode="create"
        isSubmitting={false}
        submitError={submitError}
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Salary must be greater than 0")).toBeInTheDocument();
    });
  });

  it("submits valid values", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <EmployeeFormDialog
        open
        mode="create"
        isSubmitting={false}
        submitError={null}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const dialog = screen.getByRole("dialog");
    const view = within(dialog);

    await user.type(view.getByLabelText(/full name/i), "Jane Doe");
    await user.type(view.getByLabelText(/^country$/i), "United States");
    await user.type(view.getByLabelText(/job title/i), "Software Engineer");
    await user.type(view.getByLabelText(/department/i), "Engineering");
    await user.type(view.getByLabelText(/annual salary/i), "95000");
    await user.click(view.getByRole("button", { name: /create/i }));

    expect(onSubmit.mock.calls[0][0]).toEqual({
      full_name: "Jane Doe",
      country: "United States",
      job_title: "Software Engineer",
      department: "Engineering",
      salary: "95000",
    });
  });
});

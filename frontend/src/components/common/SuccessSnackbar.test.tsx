import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { SuccessSnackbar } from "./SuccessSnackbar";

describe("SuccessSnackbar", () => {
  it("shows success message and closes on action", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(<SuccessSnackbar open message="Employee created" onClose={onClose} />);

    expect(screen.getByText("Employee created")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});

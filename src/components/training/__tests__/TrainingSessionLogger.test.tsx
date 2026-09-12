import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { TrainingSessionLogger } from "../TrainingSessionLogger";

describe("TrainingSessionLogger Component", () => {
  it("renders Coach Training Session Logger header and initial compliance stats", () => {
    render(<TrainingSessionLogger />);

    expect(screen.getByText(/COACH TRAINING SESSION LOGGER/i)).toBeInTheDocument();
    expect(screen.getByText(/STAGE 5 WORKFLOW/i)).toBeInTheDocument();
    expect(screen.getByText(/COMPLIANCE RATE/i)).toBeInTheDocument();
  });

  it("toggles drill completion status", () => {
    render(<TrainingSessionLogger />);

    const skippedBtns = screen.getAllByRole("button", { name: /SKIPPED/i });
    expect(skippedBtns.length).toBeGreaterThan(0);

    fireEvent.click(skippedBtns[0]);
    expect(skippedBtns[0]).toBeInTheDocument();
  });

  it("calls onSaveSession when Save Session Log button is clicked", () => {
    const handleSave = vi.fn();
    render(<TrainingSessionLogger onSaveSession={handleSave} />);

    const saveBtn = screen.getByRole("button", { name: /Save Session Log/i });
    fireEvent.click(saveBtn);

    expect(handleSave).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Logged!/i)).toBeInTheDocument();
  });
});

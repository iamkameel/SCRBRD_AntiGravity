import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PlayerComparisonCockpit } from "../PlayerComparisonCockpit";

describe("PlayerComparisonCockpit Component", () => {
  it("renders Head-to-Head Comparison Cockpit header and initial player selectors", () => {
    render(<PlayerComparisonCockpit />);

    expect(screen.getAllByText(/HEAD-TO-HEAD/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/COMPARISON COCKPIT/i)).toBeInTheDocument();

    expect(screen.getByText(/7-DOMAIN SKILL/i)).toBeInTheDocument();
    expect(screen.getByText(/DOMAIN SCORE/i)).toBeInTheDocument();
  });

  it("calculates role suitability when changing role filters", () => {
    render(<PlayerComparisonCockpit />);

    const deathBowlerBtn = screen.getByRole("button", { name: /Death Bowler/i });
    fireEvent.click(deathBowlerBtn);

    expect(screen.getAllByText(/Death Bowler Fit Index/i).length).toBeGreaterThan(0);
  });

  it("handles export PDF brief button click without error", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<PlayerComparisonCockpit />);

    const exportBtn = screen.getByRole("button", { name: /Export PDF Brief/i });
    fireEvent.click(exportBtn);

    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });
});

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { GroundskeeperDashboard } from "../GroundskeeperDashboard";

vi.mock("@/app/actions/fieldActions", () => ({
  logGroundStatusAction: vi.fn().mockResolvedValue({ success: true, id: "log-101" }),
  upsertMaintenanceTaskAction: vi.fn().mockResolvedValue({ success: true, id: "m-101" }),
}));

describe("GroundskeeperDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders live field operations header and surface telemetry cards", () => {
    render(<GroundskeeperDashboard />);

    expect(screen.getByText(/LIVE FIELD OPERATIONS/i)).toBeInTheDocument();
    expect(screen.getByText(/GROUND OPS/i)).toBeInTheDocument();

    // Check Clegg Hardness Index telemetry card
    expect(screen.getAllByText(/Clegg Hardness Index/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/84/)).toBeInTheDocument();

    // Check Moisture content card
    expect(screen.getByText(/Pitch Moisture Content/i)).toBeInTheDocument();
    expect(screen.getByText(/14%/)).toBeInTheDocument();
  });

  it("allows switching between surface selection pitches", () => {
    render(<GroundskeeperDashboard />);

    const bOvalBtn = screen.getByRole("button", { name: /B-Oval \(Secondary Turf\)/i });
    fireEvent.click(bOvalBtn);

    expect(screen.getByText(/Target Surface: B-Oval \(Secondary Turf\)/i)).toBeInTheDocument();
    expect(screen.getByText(/72/)).toBeInTheDocument(); // Clegg value for B-Oval
  });

  it("handles checklist item toggles and updates clearance readiness progress", () => {
    render(<GroundskeeperDashboard />);

    // Initially 4 out of 8 tasks completed (50%)
    expect(screen.getByText(/4 \/ 8 Completed/i)).toBeInTheDocument();

    // Click an unchecked task: Stump Hole Boring
    const taskItem = screen.getByText(/Stump Hole Boring, Gauge & Alignment/i);
    fireEvent.click(taskItem);

    // Now 5 out of 8 completed (63%)
    expect(screen.getByText(/5 \/ 8 Completed/i)).toBeInTheDocument();
  });

  it("adds new work orders to the maintenance queue", async () => {
    render(<GroundskeeperDashboard />);

    const input = screen.getByPlaceholderText(/New work order item\.\.\./i);
    fireEvent.change(input, { target: { value: "Irrigation Sub-surface Leak Repair" } });
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(screen.getByText(/Irrigation Sub-surface Leak Repair/i)).toBeInTheDocument();
  });

  it("logs official pitch clearance certificate to server action", async () => {
    render(<GroundskeeperDashboard />);

    const clearanceBtn = screen.getByRole("button", { name: /Issue Official Match Clearance/i });
    fireEvent.click(clearanceBtn);

    await waitFor(() => {
      expect(screen.getByText(/Official Pitch Clearance Certificate Logged to Match Engine/i)).toBeInTheDocument();
    });
  });
});

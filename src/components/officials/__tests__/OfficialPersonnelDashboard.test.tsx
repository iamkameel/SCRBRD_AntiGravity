import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { OfficialPersonnelDashboard } from "../OfficialPersonnelDashboard";

vi.mock("@/app/actions/umpireActions", () => ({
  createUmpireAction: vi.fn().mockResolvedValue({ success: true, message: "Umpire created" }),
}));

vi.mock("@/app/actions/scorerActions", () => ({
  createScorerAction: vi.fn().mockResolvedValue({ success: true, message: "Scorer created" }),
}));

describe("OfficialPersonnelDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders match officiating header and decision accuracy cards", () => {
    render(<OfficialPersonnelDashboard />);

    expect(screen.getByText(/MATCH OFFICIATING COMMAND/i)).toBeInTheDocument();
    expect(screen.getByText(/OFFICIAL PERSONNEL/i)).toBeInTheDocument();

    // Check decision accuracy card
    expect(screen.getByText(/Decision Accuracy Index/i)).toBeInTheDocument();
    expect(screen.getAllByText(/94%/)[0]).toBeInTheDocument();

    // Check match fee card
    expect(screen.getByText(/Match Day Strikers Fee/i)).toBeInTheDocument();
    expect(screen.getAllByText(/R450/)[0]).toBeInTheDocument();
  });

  it("allows selecting different officials from the roster", () => {
    render(<OfficialPersonnelDashboard />);

    const sarahBtn = screen.getByRole("button", { name: /Sarah Jenkins/i });
    fireEvent.click(sarahBtn);

    expect(screen.getAllByText(/98%/)[0]).toBeInTheDocument(); // Sarah's accuracy
    expect(screen.getAllByText(/R300/)[0]).toBeInTheDocument(); // Sarah's fee
  });

  it("approves pending match fees", () => {
    render(<OfficialPersonnelDashboard />);

    const approveBtn = screen.getByRole("button", { name: /Approve Fee/i });
    fireEvent.click(approveBtn);

    expect(screen.queryByRole("button", { name: /Approve Fee/i })).not.toBeInTheDocument();
  });

  it("enrolls a new match official using server actions", async () => {
    render(<OfficialPersonnelDashboard />);

    const input = screen.getByPlaceholderText(/Official Full Name/i);
    fireEvent.change(input, { target: { value: "Simon Taufel" } });

    const enrollBtn = screen.getByRole("button", { name: /Enroll/i });
    fireEvent.click(enrollBtn);

    await waitFor(() => {
      expect(screen.getByText(/Official profile created for Simon Taufel/i)).toBeInTheDocument();
    });
  });

  it("certifies official match accreditation clearance", () => {
    render(<OfficialPersonnelDashboard />);

    const certifyBtn = screen.getByRole("button", { name: /Certify Match Officiating Clearance/i });
    fireEvent.click(certifyBtn);

    expect(screen.getByText(/Official Match Accreditation & Fee Clearance Certified/i)).toBeInTheDocument();
  });
});

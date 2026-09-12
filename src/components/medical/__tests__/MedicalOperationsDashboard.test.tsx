import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { MedicalOperationsDashboard } from "../MedicalOperationsDashboard";

vi.mock("@/app/actions/medicalActions", () => ({
  getMedicalIncidentsAction: vi.fn().mockResolvedValue([
    {
      id: "inc-1",
      personId: "p-1",
      personName: "James Wilson",
      type: "CONCUSSION",
      severity: "High",
      status: "Reported",
      description: "Sustained blow to helmet during net session",
      reportedBy: "Dr. Aris Thorne",
      reportedAt: "2026-09-10T10:00:00.000Z",
    },
  ]),
  logMedicalIncidentAction: vi.fn().mockResolvedValue("inc-2"),
  updateMedicalStatusAction: vi.fn().mockResolvedValue(undefined),
}));

describe("MedicalOperationsDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders medical triage header and RTP protocol matrix", async () => {
    render(<MedicalOperationsDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/CLINICAL TRIAGE/i)).toBeInTheDocument();
      expect(screen.getByText(/Graduated Return-To-Play Protocol/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Rest & Cognitive Recovery/i)).toBeInTheDocument();
    expect(screen.getByText(/Light Aerobic Exercise/i)).toBeInTheDocument();
  });

  it("allows toggling RTP protocol stage completion", async () => {
    render(<MedicalOperationsDashboard />);

    await waitFor(() => {
      expect(screen.getByText(/Non-Contact Practice/i)).toBeInTheDocument();
    });

    const stage = screen.getByText(/Non-Contact Practice/i);
    fireEvent.click(stage);

    // After clicking, the progress should update
    await waitFor(() => {
      expect(screen.getByText(/67%/i)).toBeInTheDocument();
    });
  });

  it("certifies official medical clearance for return to play", async () => {
    render(<MedicalOperationsDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Issue RTP Match Clearance/i })).toBeInTheDocument();
    });

    const certifyBtn = screen.getByRole("button", { name: /Issue RTP Match Clearance/i });
    fireEvent.click(certifyBtn);

    await waitFor(() => {
      expect(screen.getByText(/OFFICIAL CLINICAL CLEARANCE ISSUED/i)).toBeInTheDocument();
    });
  });
});

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { SystemArchitectHub } from "../SystemArchitectHub";

// Mock dependencies
vi.mock("@/app/actions/systemActions", () => ({
  getSystemHealthTelemetryAction: vi.fn().mockResolvedValue({
    overallStatus: "OPERATIONAL",
    activeLatencyMs: 24,
    uptime90Days: 99.98,
    activeSchoolsCount: 18,
    activeSeasonsCount: 4,
    liveMatchesCount: 3,
    indexedDbQueueSize: 0,
    engines: [
      {
        id: "identity-engine",
        name: "Identity & Role Engine",
        category: "Platform Layer",
        status: "OPTIMAL",
        latencyMs: 14,
        uptimePercent: 100,
        activeEventsCount: 1240,
        lastSyncAt: new Date().toISOString(),
      },
      {
        id: "competition-engine",
        name: "Competition & NRR Engine",
        category: "League Layer",
        status: "OPTIMAL",
        latencyMs: 18,
        uptimePercent: 99.99,
        activeEventsCount: 8420,
        lastSyncAt: new Date().toISOString(),
      },
    ],
  }),
  getWorkflowPipelinesAction: vi.fn().mockResolvedValue([
    {
      id: "wf-101",
      fixtureId: "wbhs-vs-kearsney-2026",
      title: "WBHS 1st XI vs Kearsney 1st XI",
      stage: "LIVE_SCORING",
      status: "IN_PROGRESS",
      startedAt: new Date().toISOString(),
    },
    {
      id: "wf-104",
      fixtureId: "maritzburg-vs-glenwood-2026",
      title: "Maritzburg College vs Glenwood High",
      stage: "TRANSPORT_MANIFEST",
      status: "FAILED",
      startedAt: new Date().toISOString(),
      errorDetail: "Missing required role: Team Manager on transport manifest #TR-402.",
    },
  ]),
  retryWorkflowAction: vi.fn().mockResolvedValue({
    success: true,
    message: "Workflow #wf-104 re-queued successfully.",
  }),
  dispatchSystemBroadcastAction: vi.fn().mockResolvedValue({
    success: true,
    message: "System-wide broadcast dispatched successfully.",
  }),
}));

vi.mock("@/app/actions/auditActions", () => ({
  getRecentAuditLogsAction: vi.fn().mockResolvedValue([
    {
      id: "log-001",
      actorId: "usr-01",
      actorName: "David Miller",
      actionType: "SECURITY_ALERT",
      entityType: "system",
      entityId: "SYS-DIAG-01",
      description: "Manual OS security scan & integrity check initiated by System Architect.",
      createdAt: new Date().toISOString(),
    },
  ]),
  recordAuditAction: vi.fn().mockResolvedValue({ success: true }),
}));

describe("SystemArchitectHub Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders System Architect Header and telemetry metrics correctly", async () => {
    render(<SystemArchitectHub />);

    expect(await screen.findByText(/System Architect & Platform Audit Hub/i)).toBeInTheDocument();
    expect(await screen.findByText(/SCRBRD OS 6-Engine Core Status Matrix/i)).toBeInTheDocument();
    expect(await screen.findByText(/Identity & Role Engine/i)).toBeInTheDocument();
  });

  it("allows switching between navigation tabs (RBAC, Audit, Workflows, Broadcast)", async () => {
    render(<SystemArchitectHub />);

    const rbacTab = await screen.findByRole("button", { name: /RBAC Matrix & Role Inspector/i });
    fireEvent.click(rbacTab);

    expect(await screen.findByText(/17 Platform Roles/i)).toBeInTheDocument();

    const workflowsTab = screen.getByRole("button", { name: /Workflow Pipeline & Failures/i });
    fireEvent.click(workflowsTab);

    expect(await screen.findByText(/WBHS 1st XI vs Kearsney 1st XI/i)).toBeInTheDocument();
  });

  it("handles workflow pipeline retry trigger", async () => {
    render(<SystemArchitectHub />);

    const workflowsTab = await screen.findByRole("button", { name: /Workflow Pipeline & Failures/i });
    fireEvent.click(workflowsTab);

    const retryBtn = await screen.findByRole("button", { name: /Re-queue & Sync/i });
    fireEvent.click(retryBtn);

    expect(await screen.findByText(/Workflow #wf-104 re-queued successfully/i)).toBeInTheDocument();
  });

  it("opens and dispatches System Broadcast modal", async () => {
    render(<SystemArchitectHub />);

    const broadcastBtn = await screen.findByRole("button", { name: /Dispatch OS Broadcast/i });
    fireEvent.click(broadcastBtn);

    expect(await screen.findByText(/Dispatch Platform System Broadcast/i)).toBeInTheDocument();

    const titleInput = screen.getByPlaceholderText(/e\.g\. System Maintenance Notice or Urgent Weather Alert/i);
    const msgInput = screen.getByPlaceholderText(/Enter system announcement text to broadcast\.\.\./i);

    fireEvent.change(titleInput, { target: { value: "Scheduled Platform Maintenance" } });
    fireEvent.change(msgInput, { target: { value: "Database maintenance window at 22:00 CAT." } });

    const submitBtn = screen.getByRole("button", { name: /Dispatch Now/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/System-wide broadcast dispatched successfully/i)).toBeInTheDocument();
    });
  });
});

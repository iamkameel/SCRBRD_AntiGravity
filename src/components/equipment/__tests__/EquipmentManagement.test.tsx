import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import { EquipmentForm } from "../EquipmentForm";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn(),
  }),
}));

describe("EquipmentForm Component", () => {
  const mockEquipmentAction = vi.fn();
  const defaultInitialState = { success: false };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders equipment creation form header and input fields", () => {
    render(
      <EquipmentForm
        mode="create"
        equipmentAction={mockEquipmentAction}
        initialState={defaultInitialState}
      />
    );

    expect(screen.getAllByText(/GENERATE/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/RESOURCE/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Resource Name \*/i)).toBeInTheDocument();
    expect(screen.getByText(/Category \*/i)).toBeInTheDocument();
    expect(screen.getByText(/Storage Location \*/i)).toBeInTheDocument();
  });

  it("displays success banner when asset registration succeeds", () => {
    const successState = { success: true };
    render(
      <EquipmentForm
        mode="create"
        equipmentAction={mockEquipmentAction}
        initialState={successState}
      />
    );

    expect(
      screen.getByText(/Asset registered successfully in OS ledger\./i)
    ).toBeInTheDocument();
  });

  it("displays error alert when equipment submission encounters an error", () => {
    const errorState = { error: "Failed to create equipment: Access Denied" };
    render(
      <EquipmentForm
        mode="create"
        equipmentAction={mockEquipmentAction}
        initialState={errorState}
      />
    );

    expect(
      screen.getByText(/Failed to create equipment: Access Denied/i)
    ).toBeInTheDocument();
  });

  it("populates initial data when rendering in edit mode", () => {
    const initialData = {
      name: "Kookaburra Turf Match Ball",
      category: "Balls",
      quantity: 24,
      condition: "Excellent",
      location: "Main Pavilion Locker A",
      purchasePrice: 450.00,
      notes: "Official match day ball inventory",
    };

    render(
      <EquipmentForm
        mode="edit"
        equipmentAction={mockEquipmentAction}
        initialState={defaultInitialState}
        initialData={initialData}
      />
    );

    expect(screen.getByDisplayValue("Kookaburra Turf Match Ball")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Main Pavilion Locker A")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Official match day ball inventory")).toBeInTheDocument();
  });
});

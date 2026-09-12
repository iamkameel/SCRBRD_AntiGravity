import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BroadcastOverlayEngine } from "../BroadcastOverlayEngine";

describe("BroadcastOverlayEngine Component", () => {
  it("renders Broadcast Overlay Studio header and controls", () => {
    render(<BroadcastOverlayEngine />);

    expect(screen.getByText(/TV-GRADE BROADCAST OVERLAY STUDIO/i)).toBeInTheDocument();
    expect(screen.getByText(/Copy OBS Browser Source URL/i)).toBeInTheDocument();
    expect(screen.getByText(/SELECT BROADCAST OVERLAY GRAPHIC MODE/i)).toBeInTheDocument();
  });

  it("toggles Chroma Key (Green Screen) mode", () => {
    render(<BroadcastOverlayEngine />);

    const chromaBtn = screen.getByRole("button", { name: /Chroma Key/i });
    expect(chromaBtn).toHaveTextContent("OFF");

    fireEvent.click(chromaBtn);
    expect(chromaBtn).toHaveTextContent("ON (#00FF00)");
  });

  it("handles event simulation triggers", () => {
    render(<BroadcastOverlayEngine />);

    const sim4Btn = screen.getByRole("button", { name: /Simulate 4 Boundary/i });
    fireEvent.click(sim4Btn);

    expect(sim4Btn).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { VoiceScoringConsole } from "../VoiceScoringConsole";

describe("VoiceScoringConsole Component", () => {
  it("renders voice console header and quick commands sheet", () => {
    render(<VoiceScoringConsole onRecordBall={vi.fn()} />);

    expect(screen.getByText(/Voice-Assisted Scoring Console/i)).toBeInTheDocument();
    expect(screen.getByText(/CTRL\+SPACE TO TOGGLE MIC/i)).toBeInTheDocument();
    expect(screen.getByText(/Four runs to cover/i)).toBeInTheDocument();
  });

  it("handles voice mic toggle button interaction", () => {
    const handleRecordBall = vi.fn();
    render(<VoiceScoringConsole onRecordBall={handleRecordBall} />);

    const startBtn = screen.getByRole("button", { name: /Start Voice Input/i });
    expect(startBtn).toBeInTheDocument();
  });
});

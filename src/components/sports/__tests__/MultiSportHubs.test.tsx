import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SwimmingGalaHubView } from "../SwimmingGalaHub";
import { AthleticsMeetHubView } from "../AthleticsMeetHub";

describe("Multi-Sport Hub Views", () => {
  it("renders SwimmingGalaHubView with house standings and event live timekeeper", () => {
    render(<SwimmingGalaHubView />);

    expect(screen.getByText(/Aquatics & Swimming Gala Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Inter-House Gala Championship Standings/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit & Rank Race/i)).toBeInTheDocument();
  });

  it("renders AthleticsMeetHubView with track and field leaderboard", () => {
    render(<AthleticsMeetHubView />);

    expect(screen.getByText(/Track & Field Athletics Meet Engine/i)).toBeInTheDocument();
    expect(screen.getByText(/Athletics Championship Points Standings/i)).toBeInTheDocument();
    expect(screen.getByText(/Meet Events/i)).toBeInTheDocument();
  });
});

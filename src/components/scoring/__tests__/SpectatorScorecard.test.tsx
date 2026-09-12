import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { SpectatorScorecard } from "../SpectatorScorecard";

const mockFirstInnings = {
  teamName: "KES 1st XI",
  totalRuns: 245,
  totalWickets: 6,
  totalOvers: "50.0",
  extrasText: "12 (b 2, lb 4, w 5, nb 1)",
  batting: [
    { id: "b1", name: "K. Kalyan", dismissalText: "not out", runs: 85, balls: 90, fours: 8, sixes: 2, strikeRate: 94.4 }
  ],
  bowling: [
    { id: "bw1", name: "J. Smith", overs: "10.0", maidens: 1, runsConceded: 42, wickets: 2, economy: 4.2, dots: 32 }
  ]
};

describe("SpectatorScorecard Component", () => {
  it("renders Spectator & Parent Hub header and innings selector", () => {
    render(<SpectatorScorecard firstInnings={mockFirstInnings} />);

    expect(screen.getByText(/PARENT & SPECTATOR LIVE MATCH HUB/i)).toBeInTheDocument();
    expect(screen.getAllByText(/KES 1st XI/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/K. Kalyan/i)).toBeInTheDocument();

  });

  it("toggles parent push notification alert state", () => {
    render(<SpectatorScorecard firstInnings={mockFirstInnings} />);

    const alertBtn = screen.getByRole("button", { name: /Child Event Push Alerts/i });
    expect(alertBtn).toHaveTextContent(/Enable Child Event Push Alerts/i);

    fireEvent.click(alertBtn);
    expect(alertBtn).toHaveTextContent(/Parent Push Alerts: ON/i);
  });

  it("switches subtabs to analytics worm view", () => {
    render(<SpectatorScorecard firstInnings={mockFirstInnings} />);

    const analyticsTabBtn = screen.getByRole("button", { name: /ANALYTICS & WORM/i });
    fireEvent.click(analyticsTabBtn);

    expect(screen.getByText(/LIVE WORM & RUN-RATE COMPARISON/i)).toBeInTheDocument();
  });
});

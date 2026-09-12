import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';

vi.mock('@/lib/firebase', () => ({ db: {}, auth: {}, storage: {}, dataconnect: {}, default: {} }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));

// In-memory stand-in for the live bus (same surface the clipper uses).
vi.mock('@/services/liveMatchSync', () => {
  type Listener = (s: any) => void;
  let state: any = {
    fixtureId: 'fix-test',
    homeTeamName: 'Home 1st XI', awayTeamName: 'Away 1st XI',
    battingTeamName: 'Home 1st XI', bowlingTeamName: 'Away 1st XI',
    totalRuns: 120, wickets: 2, oversCompleted: 20, ballsInOver: 2, currentRunRate: 6,
    striker: { name: 'Aidan Smith', runs: 46, ballsFacing: 40, fours: 5, sixes: 1 },
    nonStriker: { name: 'Luke Davies', runs: 30, ballsFacing: 35, fours: 3, sixes: 0 },
    currentBowler: { name: 'B. Hendricks', overs: 5, maidens: 0, runsConceded: 28, wicketsTaken: 1 },
    recentBalls: [], wormData: [], matchStatus: 'LIVE', statusMessage: '', connectionStatus: 'CONNECTED',
  };
  const listeners = new Set<Listener>();
  const notify = () => listeners.forEach(l => l(state));
  return {
    liveMatchSync: {
      getLiveState: () => state,
      subscribe: (l: Listener) => { listeners.add(l); l(state); return () => listeners.delete(l); },
      updateMatchState: (p: any) => { state = { ...state, ...p }; notify(); },
      connectFirestore: vi.fn(),
      addBallEvent: async (ev: any) => {
        state = {
          ...state,
          recentBalls: [ev, ...state.recentBalls],
          totalRuns: state.totalRuns + ev.totalRuns,
          wickets: state.wickets + (ev.isWicket ? 1 : 0),
          striker: { ...state.striker, runs: state.striker.runs + ev.runsOffBat, ballsFacing: state.striker.ballsFacing + 1 },
        };
        notify();
      },
    },
  };
});

// In-memory persistence with the same contract as highlightService.
vi.mock('@/lib/services/highlightService', () => {
  const store = new Map<string, any[]>();
  const subs = new Map<string, Set<(c: any[]) => void>>();
  const emit = (f: string) => subs.get(f)?.forEach(l => l([...(store.get(f) ?? [])]));
  const set = (f: string, list: any[]) => { store.set(f, list); emit(f); };
  return {
    highlightService: {
      subscribe: (f: string, l: (c: any[]) => void) => {
        if (!subs.has(f)) subs.set(f, new Set());
        subs.get(f)!.add(l); l([...(store.get(f) ?? [])]);
        return () => subs.get(f)?.delete(l);
      },
      add: async (c: any) => { set(c.fixtureId, [...(store.get(c.fixtureId) ?? []), c]); return c; },
      update: async (c: any) => set(c.fixtureId, (store.get(c.fixtureId) ?? []).map(x => (x.id === c.id ? c : x))),
      setStatus: async (c: any, status: string) => set(c.fixtureId, (store.get(c.fixtureId) ?? []).map(x => (x.id === c.id ? { ...c, status } : x))),
      remove: async (c: any) => set(c.fixtureId, (store.get(c.fixtureId) ?? []).filter(x => x.id !== c.id)),
      replaceAll: async (f: string, clips: any[]) => set(f, [...clips]),
    },
  };
});

import { liveMatchSync } from '@/services/liveMatchSync';
import { HighlightClipper } from '../HighlightClipper';

const ball = (over: Record<string, unknown>) => ({
  id: `b-${Math.random()}`, overNumber: 20, ballNumber: 3, strikerName: 'Aidan Smith', bowlerName: 'B. Hendricks',
  runsOffBat: 0, extraRuns: 0, totalRuns: 0, isWicket: false, commentary: '', timestamp: new Date().toISOString(), ...over,
});

describe('HighlightClipper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });
  });

  it('starts empty and unsynced, then auto-marks a six + fifty from the live bus', async () => {
    render(<HighlightClipper />);
    expect(screen.getByText(/Nothing marked yet/)).toBeInTheDocument();
    expect(screen.getByText('NOT SYNCED')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Now' }));
    expect(screen.getByText('SYNCED')).toBeInTheDocument();

    await act(async () => {
      await liveMatchSync.addBallEvent(ball({ runsOffBat: 6, totalRuns: 6 })); // 46 → 52: six AND fifty
    });

    expect(await screen.findByText(/SIX — Aidan Smith/)).toBeInTheDocument();
    expect(screen.getByText(/FIFTY — Aidan Smith/)).toBeInTheDocument();
    expect(screen.getByText(/2 clips/)).toBeInTheDocument(); // reel header: "2 clips · …"
  });

  it('exports YouTube chapters for the reel and pushes a clip to the overlay', async () => {
    render(<HighlightClipper />);
    fireEvent.click(screen.getByRole('button', { name: 'Now' }));
    await act(async () => { await liveMatchSync.addBallEvent(ball({ isWicket: true, wicketType: 'Bowled', dismissedPlayerName: 'Aidan Smith' })); });
    await screen.findByText(/WICKET — Aidan Smith/);

    fireEvent.click(screen.getByRole('button', { name: /Copy YouTube chapters/ }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalled());
    const text = (navigator.clipboard.writeText as any).mock.calls[0][0] as string;
    expect(text.split('\n')[0]).toBe('00:00 Home 1st XI v Away 1st XI — Highlights'); // intro chapter is the reel title
    expect(text).toMatch(/WICKET — Aidan Smith/);

    fireEvent.click(screen.getAllByTitle('Push to broadcast overlay')[0]);
    expect(liveMatchSync.getLiveState().activeMilestoneAlert?.title).toMatch(/WICKET/);
  });

  it('marks a manual moment and lets it be discarded', async () => {
    render(<HighlightClipper />);
    fireEvent.click(screen.getByRole('button', { name: 'Now' }));
    fireEvent.change(screen.getByPlaceholderText(/Diving catch/), { target: { value: 'Run-out direct hit' } });
    fireEvent.click(screen.getByRole('button', { name: /Mark/ }));

    expect(await screen.findByText('Run-out direct hit')).toBeInTheDocument();
    expect(screen.getByText('MANUAL')).toBeInTheDocument();

    const select = screen.getAllByLabelText('Clip status').find(el => el.closest('div')?.textContent?.includes('Run-out direct hit'))
      ?? screen.getAllByLabelText('Clip status')[0];
    fireEvent.change(select, { target: { value: 'DISCARDED' } });
    await waitFor(() => expect(screen.queryByText('Run-out direct hit')).not.toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: /Show discarded/ }));
    expect(await screen.findByText('Run-out direct hit')).toBeInTheDocument();
  });
});

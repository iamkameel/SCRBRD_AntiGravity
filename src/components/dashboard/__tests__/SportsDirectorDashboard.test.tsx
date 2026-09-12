import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

vi.mock('@/lib/firebase', () => ({ db: {}, auth: {}, storage: {}, dataconnect: {}, default: {} }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: { uid: 'u1', email: 'director@example.com', displayName: 'Dee Rector' } }),
}));
vi.mock('@/contexts/DashboardContext', () => ({
  useDashboard: () => ({ filters: { schoolId: 'all', seasonId: 'all' }, setFilters: vi.fn() }),
}));
vi.mock('@/lib/services/sportsDirectorService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/sportsDirectorService')>();
  return {
    ...actual,
    sportsDirectorService: {
      ...actual.sportsDirectorService,
      listSchools: vi.fn().mockResolvedValue([]),
      getExecutiveSnapshot: vi.fn(),
      setSquadApproval: vi.fn().mockResolvedValue(undefined),
      assignStaffRole: vi.fn().mockResolvedValue(undefined),
      getRecentAuditLogs: vi.fn().mockResolvedValue([]),
      broadcastStaffPrompt: vi.fn().mockResolvedValue({ recipientCount: 5, outstandingItems: ['U15A: umpire unassigned'], broadcastId: 'b1' }),
    },
  };
});

import { toast } from 'sonner';
import { sportsDirectorService, buildFallbackSnapshot } from '@/lib/services/sportsDirectorService';
import { SportsDirectorDashboard } from '../SportsDirectorDashboard';

describe('SportsDirectorDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (sportsDirectorService.listSchools as Mock).mockResolvedValue([]);
    (sportsDirectorService.getRecentAuditLogs as Mock).mockResolvedValue([]);
  });

  it('renders the demo snapshot when no schools exist and flags it as demo data', async () => {
    render(<SportsDirectorDashboard />);
    expect(await screen.findByText(/Director Command/)).toBeInTheDocument();
    expect(screen.getByText(/Demo data — no records for this school/)).toBeInTheDocument();
    expect(screen.getAllByText('Readiness Score')).toHaveLength(6);
    expect(screen.getByText('5 of 6 Fixtures Cleared')).toBeInTheDocument();
    expect(screen.getByText('5 ACTIVE STAFF')).toBeInTheDocument();
    expect(screen.getByText('2 RISKS FLAGGED')).toBeInTheDocument();
  });

  it('filters senior vs junior squads', async () => {
    render(<SportsDirectorDashboard />);
    await screen.findByText(/Director Command/);
    fireEvent.click(screen.getByRole('button', { name: 'JUNIOR' }));
    expect(screen.getAllByText('Readiness Score')).toHaveLength(4);
    fireEvent.click(screen.getByRole('button', { name: 'SENIOR' }));
    expect(screen.getAllByText('Readiness Score')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'ALL' }));
    expect(screen.getAllByText('Readiness Score')).toHaveLength(6);
  });

  it('toggles squad approval locally on the demo dataset without persisting', async () => {
    render(<SportsDirectorDashboard />);
    await screen.findByText(/Director Command/);
    expect(screen.getAllByRole('button', { name: /Approve Selection/ })).toHaveLength(2);
    fireEvent.click(screen.getAllByRole('button', { name: /Approve Selection/ })[0]);
    expect(screen.getAllByRole('button', { name: /Approve Selection/ })).toHaveLength(1);
    expect(screen.getAllByRole('button', { name: /Squad Locked/ })).toHaveLength(5);
    expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/Demo dataset/));
    expect(sportsDirectorService.setSquadApproval).not.toHaveBeenCalled();
  });

  it('broadcasts a staff prompt and reports recipients', async () => {
    render(<SportsDirectorDashboard />);
    await screen.findByText(/Director Command/);
    fireEvent.click(screen.getByRole('button', { name: /Broadcast Staff Prompt/ }));
    expect(await screen.findByText('Broadcast Dispatched!')).toBeInTheDocument();
    expect(sportsDirectorService.broadcastStaffPrompt).toHaveBeenCalledTimes(1);
    expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/5 staff/));
  });

  it('surfaces a Firestore error distinctly from "no data"', async () => {
    (sportsDirectorService.listSchools as Mock).mockResolvedValue([{ id: 's1', name: 'St Test College' }]);
    (sportsDirectorService.getExecutiveSnapshot as Mock).mockResolvedValue(
      buildFallbackSnapshot('s1', 'St Test College', 'Firestore rules denied reading "teams" for this account.')
    );
    render(<SportsDirectorDashboard />);
    expect(await screen.findByText(/Firestore error — showing demo data/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/rules denied reading "teams"/);
    await waitFor(() => expect(sportsDirectorService.getExecutiveSnapshot).toHaveBeenCalledWith('s1', 'St Test College'));
  });

  it('filters squads by text input in live search', async () => {
    render(<SportsDirectorDashboard />);
    await screen.findByText(/Director Command/);
    const searchInput = screen.getByPlaceholderText(/Search squad, opponent, venue.../i);

    fireEvent.change(searchInput, { target: { value: 'U15A' } });
    expect(screen.getAllByText('Readiness Score')).toHaveLength(1);
    expect(screen.getByText('U15A Squad')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'NonExistentTeam' } });
    expect(screen.queryAllByText('Readiness Score')).toHaveLength(0);
    expect(screen.getByText(/No squads match this filter/i)).toBeInTheDocument();
  });

  it('opens quick staff assignment modal and assigns staff member in demo mode', async () => {
    render(<SportsDirectorDashboard />);
    await screen.findByText(/Director Command/);

    const assignBtns = screen.getAllByRole('button', { name: /\+ Assign/i });
    expect(assignBtns.length).toBeGreaterThan(0);
    fireEvent.click(assignBtns[0]);

    expect(screen.getByText(/Assign Official Scorer|Assign Match Umpire|Assign Head Coach/i)).toBeInTheDocument();
    const inputName = screen.getByPlaceholderText(/e.g. David Miller/i);
    fireEvent.change(inputName, { target: { value: 'Jane Doe' } });

    const confirmBtn = screen.getByRole('button', { name: /Confirm Assignment/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/Assigned Jane Doe/i));
    });
  });
});





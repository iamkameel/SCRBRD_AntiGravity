import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';

vi.mock('@/lib/firebase', () => ({ db: {}, auth: {}, storage: {}, dataconnect: {}, default: {} }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { uid: 'u1', email: 'grounds@example.com' } }) }));
vi.mock('@/contexts/DashboardContext', () => ({ useDashboard: () => ({ filters: { schoolId: 'all', seasonId: 'all' }, setFilters: vi.fn() }) }));
vi.mock('@/app/actions/fieldBookingActions', () => ({ createBookingAction: vi.fn().mockResolvedValue({ success: true, id: 'bk-new' }) }));
vi.mock('@/app/actions/fieldActions', () => ({ upsertMaintenanceTaskAction: vi.fn().mockResolvedValue({ success: true }) }));
vi.mock('@/lib/services/facilityEngineService', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/facilityEngineService')>();
  return {
    ...actual,
    facilityEngineService: {
      ...actual.facilityEngineService,
      listSchools: vi.fn().mockResolvedValue([]),
      loadSnapshot: vi.fn(),
      assignFixtureToField: vi.fn().mockResolvedValue(undefined),
    },
  };
});

// Radix Dialog + jsdom
global.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} } as any;

import { toast } from 'sonner';
import { createBookingAction } from '@/app/actions/fieldBookingActions';
import { facilityEngineService, buildFallbackSnapshot } from '@/lib/services/facilityEngineService';
import { FacilityCommandCenter } from '../FacilityCommandCenter';

describe('FacilityCommandCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (facilityEngineService.listSchools as Mock).mockResolvedValue([]);
  });

  it('renders the demo grounds with turf health, clashes, gaps and allocation', async () => {
    render(<FacilityCommandCenter />);
    expect(await screen.findByText(/Turf & Facility/)).toBeInTheDocument();
    expect(screen.getByText(/Demo data — no fields for this school/)).toBeInTheDocument();

    // 4 turf cards, each with a grade
    expect(screen.getAllByText(/^Grade [A-F]$/)).toHaveLength(4);
    expect(screen.getByText('Marginal')).toBeInTheDocument(); // C-Field: Poor + stale log → grade D

    // demo dataset has two deliberate overlaps and two fixtures with no booking
    expect(screen.getAllByText('OVERLAP')).toHaveLength(2);
    expect(screen.getAllByRole('button', { name: /Book it/ })).toHaveLength(2);
    expect(screen.getByText('3 unallocated')).toBeInTheDocument();
    expect(screen.getByText('4 open')).toBeInTheDocument();
  });

  it('books an unbooked fixture through the quick-book dialog (locally on demo data)', async () => {
    render(<FacilityCommandCenter />);
    await screen.findByText(/Turf & Facility/);

    fireEvent.click(screen.getAllByRole('button', { name: /Book it/ })[0]);
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText('Book ground for fixture')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: /Confirm booking/ }));

    await waitFor(() => expect(screen.getAllByRole('button', { name: /Book it/ })).toHaveLength(1));
    expect(toast.info).toHaveBeenCalledWith(expect.stringMatching(/Demo dataset/));
    expect(createBookingAction).not.toHaveBeenCalled();
  });

  it('applies a pitch-allocation recommendation and completes a maintenance task', async () => {
    render(<FacilityCommandCenter />);
    await screen.findByText(/Turf & Facility/);

    const card = screen.getByText('U15A v Hilton').closest('.space-y-2') as HTMLElement;
    const applyBtn = within(card).getAllByRole('button')[0];
    expect(applyBtn).toHaveTextContent(/Main Oval|B-Oval|Astro/);
    fireEvent.click(applyBtn);
    await waitFor(() => expect(screen.getByText('2 unallocated')).toBeInTheDocument());

    fireEvent.click(screen.getAllByLabelText('Mark complete')[0]);
    await waitFor(() => expect(screen.getByText('3 open')).toBeInTheDocument());
  });

  it('shows a Firestore error distinctly from "no fields"', async () => {
    (facilityEngineService.listSchools as Mock).mockResolvedValue([{ id: 's1', name: 'St Test College' }]);
    (facilityEngineService.loadSnapshot as Mock).mockResolvedValue({ ...buildFallbackSnapshot('s1'), source: 'error', error: 'Firestore rules denied reading "fields" for this account.' });
    render(<FacilityCommandCenter />);
    expect(await screen.findByText(/Firestore error — showing demo data/)).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(/denied reading "fields"/);
  });
});

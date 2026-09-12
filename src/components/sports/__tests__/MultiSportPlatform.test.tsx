import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';

vi.mock('@/lib/firebase', () => ({ db: {}, auth: {}, storage: {}, dataconnect: {}, default: {} }));
vi.mock('sonner', () => ({ toast: Object.assign(vi.fn(), { success: vi.fn(), error: vi.fn(), info: vi.fn() }) }));
vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => ({ user: { uid: 'u1', email: 'sport@example.com' } }) }));
vi.mock('@/contexts/DashboardContext', () => ({ useDashboard: () => ({ filters: { schoolId: 'all', seasonId: 'all' }, setFilters: vi.fn() }) }));
// No schools on record → the platform runs on the demo school; cricket/facility loaders are never hit.
vi.mock('@/lib/services/firestoreQuery', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/services/firestoreQuery')>();
  return { ...actual, queryDocsLenient: vi.fn().mockResolvedValue([]), queryDocs: vi.fn().mockResolvedValue([]), fetchWhereIn: vi.fn().mockResolvedValue([]), fetchByIds: vi.fn().mockResolvedValue([]) };
});

import { MultiSportPlatform } from '../MultiSportPlatform';

async function openRugbyConsole() {
  render(<MultiSportPlatform />);
  await screen.findByText(/PLATFORM ENGINE/);
  fireEvent.click(screen.getByRole('button', { name: /Rugby Union/ }));
  await screen.findByText(/MATCH CONSOLE/);
}

describe('MultiSportPlatform', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // fieldSportService falls back to memory mode when db is a stub — expected here, keep output clean
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('renders the discipline bar, tabs and demo badge', async () => {
    render(<MultiSportPlatform />);
    expect(await screen.findByText(/PLATFORM ENGINE/)).toBeInTheDocument();
    expect(await screen.findByText(/Demo · cricket & facilities from demo data/)).toBeInTheDocument(); // school resolution is async
    expect(screen.getByRole('button', { name: /Cricket/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Basketball/ })).toBeInTheDocument();
    expect(screen.getByText('CRICKET MATCH & SCORING ENGINE')).toBeInTheDocument();
  });

  it('runs a rugby match end-to-end in the console and feeds passports + championship', async () => {
    await openRugbyConsole();

    // create
    fireEvent.change(screen.getByLabelText('Home team'), { target: { value: 'Nash 1st XV' } });
    fireEvent.change(screen.getByLabelText('Away team'), { target: { value: 'Hill 1st XV' } });
    fireEvent.click(screen.getByRole('button', { name: /Create match/ }));
    expect(await screen.findByText('SCHEDULED')).toBeInTheDocument();

    // kick-off + try
    fireEvent.click(screen.getByRole('button', { name: /Kick-off/ }));
    expect(await screen.findByText('LIVE')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nash 1st XV player'), { target: { value: 'Aidan Smith' } });
    fireEvent.click(screen.getAllByRole('button', { name: /^Try/ })[0]);
    await waitFor(() => expect(screen.getByTestId('score-home')).toHaveTextContent('5'));
    fireEvent.click(screen.getAllByRole('button', { name: /^Conversion/ })[0]);
    await waitFor(() => expect(screen.getByTestId('score-home')).toHaveTextContent('7'));

    // yellow card → sin-bin banner, 14 on field
    fireEvent.change(screen.getByLabelText('Hill 1st XV player'), { target: { value: 'D. Prop' } });
    fireEvent.click(screen.getAllByRole('button', { name: /Yellow \(sin-bin\)/ })[1]);
    expect(await screen.findByText(/D\. Prop \(Hill 1st XV\) · Yellow \(sin-bin\)/)).toBeInTheDocument();
    expect(screen.getByText('14 on field')).toBeInTheDocument();

    // halves
    fireEvent.click(screen.getByRole('button', { name: /End half/ }));
    expect(await screen.findByText('BREAK')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Start half 2/ }));
    expect(await screen.findByText('LIVE')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /End half/ }));
    expect(await screen.findByText('FULL TIME')).toBeInTheDocument();
    expect(screen.getByText(/Full time — Nash 1st XV win/)).toBeInTheDocument();
    expect(screen.getByText(/League pts: 4–0/)).toBeInTheDocument();

    // passports: the try-scorer now has a rugby session this week
    fireEvent.click(screen.getByRole('button', { name: /Cross-Sport Passports/ }));
    const aidan = await screen.findAllByText('Aidan Smith');
    expect(aidan.length).toBeGreaterThan(0);
    fireEvent.click(aidan[0]);
    expect(await screen.findByText(/Nash 1st XV v Hill 1st XV/)).toBeInTheDocument();

    // championship: house shield now has a rugby column with Nash on 4
    fireEvent.click(screen.getByRole('button', { name: /Championship Shield/ }));
    const house = (await screen.findByText(/Inter-House/)).closest('div.space-y-4') as HTMLElement;
    expect(within(house).getByText('4 entrants · 3 disciplines')).toBeInTheDocument();
    expect(within(house).getByRole('columnheader', { name: 'RUGBY' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'RAW' }));
    expect(within(house).getByText('(4 · #1)')).toBeInTheDocument();
  });

  it('shows real conflict detection on the facility grid', async () => {
    render(<MultiSportPlatform />);
    await screen.findByText(/PLATFORM ENGINE/);
    fireEvent.click(screen.getByRole('button', { name: /Universal Facility Grid/ }));
    expect(await screen.findByText('Bookings this week')).toBeInTheDocument();
    expect(screen.getAllByText('OVERLAP')).toHaveLength(2); // the demo dataset's two deliberate clashes
  });
});

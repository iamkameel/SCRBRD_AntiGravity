import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TransportHub } from '../TransportHub';

// Mock dependencies
vi.mock('@/lib/services/transportService', () => ({
  transportService: {
    subscribeVehicles: vi.fn((cb) => {
      cb([
        {
          id: 'BUS-01',
          registration: 'GP 492-719',
          makeModel: 'TITAN EXPRESS (24-SEATER)',
          type: 'Bus',
          capacity: 24,
          status: 'AVAILABLE',
          mileage: '12,400 KM',
          health: 98,
          lastService: '12 MAR 2026',
          assignedDriver: 'M. PETERSON'
        }
      ]);
      return () => {};
    }),
    subscribeTrips: vi.fn((cb) => {
      cb([
        {
          id: 'TRIP-742',
          fixture: 'VS ST JOHNS (1ST XI AWAY)',
          destination: 'St Johns College Oval, Houghton',
          time: '07:30 AM',
          returnTime: '17:30 PM',
          vehicleId: 'BUS-01',
          vehicleName: 'TITAN EXPRESS',
          driver: 'M. PETERSON',
          status: 'READY FOR DEPARTURE',
          routeStops: ['Main School Gate (07:15)', 'N3 Highway Slipway', 'St Johns Oval (07:55)'],
          passengers: [
            { id: 'p1', name: 'Mark Boucher', role: 'Coach', status: 'BOARDED', emergencyPhone: '+27 82 555 0101' },
            { id: 'p2', name: 'Aiden Markram', role: 'Captain', status: 'AWAITING', emergencyPhone: '+27 83 444 0202' }
          ]
        }
      ]);
      return () => {};
    }),
    updateTripStatus: vi.fn().mockResolvedValue(true),
    updateTrip: vi.fn().mockResolvedValue(true),
    createTrip: vi.fn().mockResolvedValue('TRIP-999'),
    addVehicle: vi.fn().mockResolvedValue('BUS-09')
  }
}));

vi.mock('@/app/actions/transportActions', () => ({
  getVehiclesAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
  updateVehicleStatusAction: vi.fn().mockResolvedValue({ success: true }),
  getUpcomingTripsAction: vi.fn().mockResolvedValue({ success: true, data: [] }),
  createTripAction: vi.fn().mockResolvedValue({ success: true, id: 'TRIP-999' }),
  updateTripStatusAction: vi.fn().mockResolvedValue({ success: true }),
  updatePassengerBoardingAction: vi.fn().mockResolvedValue({ success: true }),
  getDriverTripsAction: vi.fn().mockResolvedValue({ success: true, data: [] })
}));

describe('TransportHub Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders Transport Hub header and default tabs correctly', () => {
    render(<TransportHub />);
    expect(screen.getByText(/TRANSPORT/i)).toBeInTheDocument();
    expect(screen.getByText(/FLEET ASSETS/i)).toBeInTheDocument();
    expect(screen.getAllByText(/VS ST JOHNS \(1ST XI AWAY\)/i)[0]).toBeInTheDocument();
  });

  it('allows tab switching between Trips and Fleet Assets', async () => {
    render(<TransportHub />);
    const fleetTab = screen.getByText(/FLEET ASSETS/i);
    fireEvent.click(fleetTab);

    expect(await screen.findByText(/TITAN EXPRESS \(24-SEATER\)/i)).toBeInTheDocument();
  });

  it('handles passenger boarding check-in toggle', async () => {
    render(<TransportHub />);
    
    // Find the boarding button for Aiden Markram who is 'AWAITING'
    const awaitingButton = screen.getByText('AWAITING');
    expect(awaitingButton).toBeInTheDocument();

    fireEvent.click(awaitingButton);

    // Should update state or call boarding handler
    expect(screen.getByText(/BOARD ALL/i)).toBeInTheDocument();
  });

  it('opens and submits Create Trip modal', async () => {
    render(<TransportHub />);
    
    const createTripBtn = screen.getByRole('button', { name: /CREATE TRIP/i });
    fireEvent.click(createTripBtn);

    expect(screen.getByText(/CREATE NEW TRIP/i)).toBeInTheDocument();

    const fixtureInput = screen.getByPlaceholderText(/e\.g\. VS HILTON COLLEGE \(1ST XI AWAY\)/i);
    const destInput = screen.getByPlaceholderText(/e\.g\. Hilton Oval, Hilton/i);

    fireEvent.change(fixtureInput, { target: { value: 'VS KES (1ST XI AWAY)' } });
    fireEvent.change(destInput, { target: { value: 'KES Main Oval' } });

    const submitBtn = screen.getByRole('button', { name: /CONFIRM & CREATE TRIP/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/VS KES \(1ST XI AWAY\)/i)[0]).toBeInTheDocument();
    });
  });
});

/**
 * SCRBRD Transport & Fleet Intelligence Engine
 * Handles vehicle capacity matching, travel time countdowns,
 * manifest readiness auditing, and fleet maintenance scoring.
 */

export interface FleetVehicleSpec {
    id: string;
    name: string;
    type: 'Bus' | 'Van' | 'Minibus' | 'Car';
    registration: string;
    capacity: number;
    status: 'AVAILABLE' | 'IN TRANSIT' | 'MAINTENANCE';
    mileageKm: number;
    healthScore: number; // 0 - 100
    lastServiceDate: string;
    assignedDriver?: string;
}

export interface TransportTripSpec {
    id: string;
    fixtureTitle: string;
    destinationVenue: string;
    distanceKm?: number;
    scheduledDeparture: string; // e.g. "07:30 AM"
    estimatedTravelMins?: number;
    vehicleId: string;
    driverName: string;
    status: 'DRAFT' | 'CONFIRMED' | 'READY FOR DEPARTURE' | 'IN TRANSIT' | 'ARRIVED' | 'COMPLETED';
    passengers: {
        id: string;
        name: string;
        role: 'Player' | 'Captain' | 'Coach' | 'Manager' | 'Physio' | 'Scorer';
        status: 'BOARDED' | 'AWAITING' | 'ABSENT';
        emergencyPhone?: string;
    }[];
    routeStops: string[];
}

export interface ManifestAuditReport {
    tripId: string;
    totalPassengers: number;
    boardedCount: number;
    awaitingCount: number;
    absentCount: number;
    boardingPct: number;
    isCaptainBoarded: boolean;
    isCoachBoarded: boolean;
    isPhysioBoarded: boolean;
    readinessGrade: 'READY' | 'WARNING' | 'CRITICAL';
    missingEssentialRoles: string[];
}

export interface FleetCapacityCheck {
    vehicleId: string;
    vehicleName: string;
    capacity: number;
    passengersCount: number;
    availableSeats: number;
    isOverCapacity: boolean;
    utilizationPct: number;
}

export const transportEngine = {
    /**
     * Performs an audit on a trip manifest to verify mandatory team roles.
     */
    auditManifest: (trip: TransportTripSpec): ManifestAuditReport => {
        const totalPassengers = trip.passengers.length;
        const boardedCount = trip.passengers.filter(p => p.status === 'BOARDED').length;
        const awaitingCount = trip.passengers.filter(p => p.status === 'AWAITING').length;
        const absentCount = trip.passengers.filter(p => p.status === 'ABSENT').length;
        const boardingPct = totalPassengers > 0 ? Math.round((boardedCount / totalPassengers) * 100) : 0;

        const captain = trip.passengers.find(p => p.role === 'Captain');
        const coach = trip.passengers.find(p => p.role === 'Coach' || p.role === 'Manager');
        const physio = trip.passengers.find(p => p.role === 'Physio');

        const isCaptainBoarded = captain ? captain.status === 'BOARDED' : true;
        const isCoachBoarded = coach ? coach.status === 'BOARDED' : true;
        const isPhysioBoarded = physio ? physio.status === 'BOARDED' : true;

        const missingEssentialRoles: string[] = [];
        if (captain && captain.status !== 'BOARDED') missingEssentialRoles.push('Captain');
        if (coach && coach.status !== 'BOARDED') missingEssentialRoles.push('Coach/Manager');
        if (physio && physio.status !== 'BOARDED') missingEssentialRoles.push('Physio');

        let readinessGrade: ManifestAuditReport['readinessGrade'] = 'READY';
        if (boardingPct < 50 || missingEssentialRoles.length > 1) {
            readinessGrade = 'CRITICAL';
        } else if (boardingPct < 100 || missingEssentialRoles.length > 0) {
            readinessGrade = 'WARNING';
        }

        return {
            tripId: trip.id,
            totalPassengers,
            boardedCount,
            awaitingCount,
            absentCount,
            boardingPct,
            isCaptainBoarded,
            isCoachBoarded,
            isPhysioBoarded,
            readinessGrade,
            missingEssentialRoles
        };
    },

    /**
     * Checks vehicle capacity against trip passenger counts.
     */
    checkFleetCapacity: (vehicle: FleetVehicleSpec, passengerCount: number): FleetCapacityCheck => {
        const availableSeats = vehicle.capacity - passengerCount;
        const isOverCapacity = passengerCount > vehicle.capacity;
        const utilizationPct = Math.round((passengerCount / vehicle.capacity) * 100);

        return {
            vehicleId: vehicle.id,
            vehicleName: vehicle.name,
            capacity: vehicle.capacity,
            passengersCount: passengerCount,
            availableSeats,
            isOverCapacity,
            utilizationPct
        };
    },

    /**
     * Recommends the optimal vehicle for a passenger squad size.
     */
    recommendVehicle: (fleet: FleetVehicleSpec[], squadSize: number): FleetVehicleSpec | null => {
        const availableFleet = fleet.filter(v => v.status === 'AVAILABLE' && v.healthScore > 50);
        if (availableFleet.length === 0) return null;

        // Sort by capacity >= squadSize, smallest headroom first
        const suitableVehicles = availableFleet
            .filter(v => v.capacity >= squadSize)
            .sort((a, b) => a.capacity - b.capacity);

        if (suitableVehicles.length > 0) {
            return suitableVehicles[0];
        }

        // Fallback to largest available vehicle
        return availableFleet.sort((a, b) => b.capacity - a.capacity)[0];
    },

    /**
     * Calculates departure lead time based on distance (km).
     */
    calculateDepartureLeadTime: (distanceKm: number, bufferMins: number = 20): { travelMins: number; totalLeadMins: number; recommendedDepartureNotice: string } => {
        // Average school bus speed: 60 km/h -> 1 km per min
        const travelMins = Math.ceil((distanceKm / 60) * 60);
        const totalLeadMins = travelMins + bufferMins;

        const hours = Math.floor(totalLeadMins / 60);
        const mins = totalLeadMins % 60;
        const noticeStr = hours > 0 ? `${hours}h ${mins}m before match` : `${mins} mins before match`;

        return {
            travelMins,
            totalLeadMins,
            recommendedDepartureNotice: noticeStr
        };
    }
};

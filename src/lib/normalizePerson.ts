import { Player as Person } from '@/lib/store';

/**
 * Normalizes Firestore Person data to match the application's Person interface.
 * 
 * Handles schema mismatches:
 * - activeRole → role
 * - assignedSchools → schoolId (first school)
 * - roles → ensures single role field
 */
export function normalizePerson(data: any): Person {
  // Determine the primary role
  const role = data.role || data.activeRole || (data.roles && data.roles[0]) || 'Member';

  // Determine the primary school
  const schoolId = data.schoolId ||
    (data.assignedSchools && data.assignedSchools.length > 0 ? data.assignedSchools[0] : undefined);

  // Extract team IDs (could be from various sources)
  const teamIds = data.teamIds ||
    (data.assignedTeams && data.assignedTeams.length > 0 ? data.assignedTeams : undefined);

  return {
    id: data.id,
    firstName: data.firstName || '',
    lastName: data.lastName || '',
    displayName: data.displayName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
    middleName: data.middleName,
    email: data.email || data.contactEmail,
    phone: data.phone || data.contactPhone,
    dateOfBirth: data.dateOfBirth,
    nationality: data.nationality,
    profileImageUrl: data.profileImageUrl,
    status: data.status || 'active',

    // Cricket Attributes
    battingStyle: data.battingStyle || data.physicalAttributes?.battingStyle,
    bowlingStyle: data.bowlingStyle || data.physicalAttributes?.bowlingStyle,
    battingHand: data.battingHand || data.physicalAttributes?.battingHand,
    bowlingHand: data.bowlingHand || data.physicalAttributes?.bowlingHand,
    playingRole: data.playingRole,
    primaryFieldingPosition: data.primaryFieldingPosition,
    skillMatrix: data.skillMatrix,

    // Normalized fields
    role,
    schoolId,
    teamIds,

    // Legacy fields
    title: data.title,
    specializations: data.specializations,
    skills: data.skills,
    stats: data.stats,

    // Contact
    contactEmail: data.contactEmail || data.email,
    contactPhone: data.contactPhone || data.phone,
    address: data.address,

    // Additional fields
    squadHistory: data.squadHistory,
    careerStatisticsId: data.careerStatisticsId,
    dataAiHint: data.dataAiHint,

    // Timestamps
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

/**
 * Normalizes an array of Person documents
 */
export function normalizePeople(data: any[]): Person[] {
  return data.map(normalizePerson);
}

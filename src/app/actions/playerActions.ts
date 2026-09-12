'use server';

import { createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import { playerSchema } from '@/lib/validations/playerSchema';
import { Person } from '@/types/firestore';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';
import { requireUser } from '@/lib/auth/session';

export type PlayerActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

function extractPlayerData(formData: FormData) {
  const extractGroup = (prefix: string, keys: string[]) => {
    const obj: any = {};
    let hasData = false;
    keys.forEach(key => {
      const val = formData.get(`${prefix}.${key}`);
      if (val) {
        obj[key] = Number(val);
        hasData = true;
      }
    });
    return hasData ? obj : undefined;
  };

  const extractArray = (prefix: string) => {
    const items: string[] = [];
    let i = 0;
    while (true) {
      const val = formData.get(`${prefix}[${i}]`);
      if (!val) break;
      items.push(val as string);
      i++;
    }
    return items.length > 0 ? items : undefined;
  };

  return {
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email') || '',
    phoneNumber: formData.get('phoneNumber') || '',
    dateOfBirth: formData.get('dateOfBirth'),
    schoolId: formData.get('schoolId'),
    assignedSchools: extractArray('assignedSchools'),
    teamIds: extractArray('teamIds'),
    jerseyNumber: formData.get('jerseyNumber') || undefined,
    status: formData.get('status') || 'active',
    role: formData.get('role') || 'Player',

    // Core Profile
    primaryRole: formData.get('primaryRole') || 'Unknown',
    battingStyle: formData.get('battingStyle') || 'Right-hand Bat',
    bowlingStyle: formData.get('bowlingStyle') || 'Right-arm Medium',
    heightCm: formData.get('heightCm') || undefined,
    weightKg: formData.get('weightKg') || undefined,

    // Nested Attributes
    battingAttributes: extractGroup('battingAttributes', [
      'frontFoot', 'backFoot', 'powerHitting', 'timing', 'shotRange',
      'sweep', 'reverseSweep', 'spinReading', 'seamAdaptation', 'strikeRotation', 'finishing'
    ]),
    bowlingAttributes: extractGroup('bowlingAttributes', [
      'stockBallControl', 'variations', 'powerplaySkill', 'middleOversControl', 'deathOversSkill',
      'lineLengthConsistency', 'spinManipulation', 'releaseMechanics', 'tacticalOverConstruction'
    ]),
    fieldingAttributes: extractGroup('fieldingAttributes', [
      'closeCatching', 'deepCatching', 'groundFielding', 'throwingPower',
      'throwingAccuracy', 'reactionSpeed', 'anticipation'
    ]),
    mentalAttributes: extractGroup('mentalAttributes', [
      'temperament', 'gameAwareness', 'pressureHandling', 'patience', 'killerInstinct',
      'decisionMaking', 'adaptability', 'workEthic', 'leadership', 'competitiveness'
    ]),
    physicalAttributes: extractGroup('physicalAttributes', [
      'speed', 'acceleration', 'agility', 'strength', 'stamina',
      'balance', 'coreFitness', 'injuryResistance'
    ]),

    // New FM-Style Array Fields (Expect JSON strings from hidden inputs)
    playerTraits: formData.get('playerTraits') ? JSON.parse(formData.get('playerTraits') as string) : undefined,
    roleRatings: formData.get('roleRatings') ? JSON.parse(formData.get('roleRatings') as string) : undefined,
    zoneAnalysis: formData.get('zoneAnalysis') ? JSON.parse(formData.get('zoneAnalysis') as string) : undefined,
    coachReports: formData.get('coachReports') ? JSON.parse(formData.get('coachReports') as string) : undefined,
    achievements: formData.get('achievements') ? JSON.parse(formData.get('achievements') as string) : undefined,
    seasonStats: formData.get('seasonStats') ? JSON.parse(formData.get('seasonStats') as string) : undefined,
  };
}

function mapToFirestorePerson(validatedData: any): Omit<Person, 'id' | 'createdAt' | 'updatedAt'> {
  const {
    battingAttributes,
    bowlingAttributes,
    fieldingAttributes,
    mentalAttributes,
    physicalAttributes,
    primaryRole,
    battingStyle,
    bowlingStyle,
    heightCm,
    weightKg,
    // New FM-Style fields
    playerTraits,
    roleRatings,
    zoneAnalysis,
    coachReports,
    achievements,
    seasonStats,
    ...rest
  } = validatedData;

  // Calculate overall rating (simple average of all attributes present)
  let totalScore = 0;
  let count = 0;

  [battingAttributes, bowlingAttributes, fieldingAttributes, mentalAttributes, physicalAttributes].forEach(group => {
    if (group) {
      Object.values(group).forEach((val: any) => {
        totalScore += Number(val);
        count++;
      });
    }
  });

  const overallRating = count > 0 ? Math.round((totalScore / count) * 5) : 50; // Scale 1-20 to 1-100 roughly

  return {
    ...rest,
    role: validatedData.role,
    // FM-Style Profile
    playerProfile: {
      primaryRole,
      battingStyle,
      bowlingStyle,
      preferredFormats: ['T20', '50-over'], // Default for now
      currentAbility: overallRating,
      potentialAbility: Math.min(100, overallRating + 10), // Placeholder logic
      reputation: 1,
      heightCm: heightCm ? Number(heightCm) : undefined,
      weightKg: weightKg ? Number(weightKg) : undefined,
      battingAttributes,
      bowlingAttributes,
      fieldingAttributes,
      mentalAttributes,
      physicalAttributes,
      // New fields
      playerTraits,
      roleRatings,
      zoneAnalysis,
      coachReports,
      achievements,
      seasonStats,
    },
    // Legacy/Top-level accessors for backward compatibility
    battingStyle,
    bowlingStyle,
    playingRole: primaryRole as any,
    physicalAttributes: {
      height: heightCm ? Number(heightCm) : undefined,
      weight: weightKg ? Number(weightKg) : undefined,
    }
  };
}

export async function createPlayerAction(
  prevState: PlayerActionState,
  formData: FormData
): Promise<PlayerActionState> {
  try {
      await requireUser('profiles');
    const rawData = extractPlayerData(formData);
    const validatedData = playerSchema.parse(rawData);
    const newPlayerData = mapToFirestorePerson(validatedData);

    await createDocument<Omit<Person, 'id'>>('people', {
      ...newPlayerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any);

    revalidatePath('/people');
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Create player error:', error);
    return { error: (error as Error).message || 'Failed to create player' };
  }
  redirect('/people');
}

export async function updatePlayerAction(
  id: string,
  prevState: PlayerActionState,
  formData: FormData
): Promise<PlayerActionState> {
  try {
      await requireUser('profiles');
    const rawData = extractPlayerData(formData);
    const validatedData = playerSchema.parse(rawData);
    const updateData = mapToFirestorePerson(validatedData);

    await updateDocument<Person>('people', id, {
      ...updateData,
      updatedAt: new Date().toISOString(),
    } as any);

    revalidatePath('/people');
    revalidatePath(`/people/${id}`);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Update player error:', error);
    return { error: (error as Error).message || 'Failed to update player' };
  }
  redirect(`/people/${id}`);
}

export async function deletePlayerAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
      await requireUser('profiles');
    await deleteDocument('people', id);
    revalidatePath('/people');
    return { success: true };
  } catch (error) {
    console.error('Delete player error:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete player' };
  }
}

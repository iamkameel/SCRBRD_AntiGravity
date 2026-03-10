'use server';

import { teamService } from '@/services/teamService';
import { TeamSchema } from '@/lib/validations/teamSchema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ZodError } from 'zod';

export type TeamActionState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
  success?: boolean;
};

export async function createTeamAction(
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  try {
    // Extract and prepare data
    const rawData: Record<string, unknown> = {
      name: formData.get('name') || '',
      organisationId: formData.get('organisationId') || formData.get('schoolId') || '',
      seasonId: formData.get('seasonId') || '',
      ageDivisionId: formData.get('ageDivisionId') || formData.get('divisionId') || '',
      teamClassId: formData.get('teamClassId') || '',
      abbreviatedName: formData.get('abbreviatedName') || undefined,
      nickname: formData.get('nickname') || undefined,
      displayName: formData.get('displayName') || undefined,
      shortName: formData.get('shortName') || undefined,
      suffix: formData.get('suffix') || undefined,
      defaultCaptainId: formData.get('defaultCaptainId') || undefined,
      defaultViceCaptainId: formData.get('defaultViceCaptainId') || undefined,
      defaultScorerId: formData.get('defaultScorerId') || undefined,
    };

    // Parse coachIds if provided
    const coachIdsValue = formData.get('coachIds');
    if (coachIdsValue && typeof coachIdsValue === 'string' && coachIdsValue.trim()) {
      rawData.coachIds = coachIdsValue.split(',').map(id => id.trim()).filter(Boolean);
    }

    // Validate with Zod
    const validatedData = TeamSchema.parse(rawData);

    // Add to Data Connect (PostgreSQL via GQL)
    await teamService.create({
      organisationId: validatedData.organisationId,
      seasonId: validatedData.seasonId,
      ageDivisionId: validatedData.ageDivisionId,
      teamClassId: validatedData.teamClassId,
      name: validatedData.name,
      displayName: validatedData.displayName || undefined,
      shortName: validatedData.shortName || undefined,
    });

    revalidatePath('/teams');
  } catch (error) {
    if (error instanceof ZodError) {
      // Zod validation errors
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Create team error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to create team' };
  }
  redirect('/teams');
}

/**
 * Legacy compatibility mock for local filtering in prototype
 */
export async function getCoachesBySchoolAction(schoolId: string) {
  // In a real implementation this would query Data Connect
  return [];
}

export async function deleteTeamAction(id: string): Promise<TeamActionState> {
  try {
    await teamService.delete(id);
    revalidatePath('/teams');
    return { success: true };
  } catch (error) {
    console.error('Delete team error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to delete team' };
  }
}

export async function checkDuplicateTeamAction(
  schoolId: string,
  ageGroup: string,
  suffix: string
) {
  // Simple check against all teams
  const teams = await teamService.getAll();
  const exists = teams.some(t =>
    t.organisation.id === schoolId &&
    t.name.includes(suffix) // Simplified check
  );

  return { exists, existingSuffixes: [] };
}

export async function updateTeamAction(
  id: string,
  prevState: TeamActionState,
  formData: FormData
): Promise<TeamActionState> {
  try {
    const rawData: Record<string, unknown> = {
      name: formData.get('name') || '',
      organisationId: formData.get('organisationId') || formData.get('schoolId') || '',
      seasonId: formData.get('seasonId') || '',
      ageDivisionId: formData.get('ageDivisionId') || formData.get('divisionId') || '',
      teamClassId: formData.get('teamClassId') || formData.get('suffix') || '',
      sport: formData.get('sport') || 'Cricket',
      status: formData.get('status') || 'active',
      displayName: formData.get('displayName') || '',
      shortName: formData.get('shortName') || '',
    };

    const validatedData = TeamSchema.parse(rawData);

    await teamService.update({
      id,
      name: validatedData.name,
      displayName: validatedData.displayName || undefined,
      shortName: validatedData.shortName || undefined,
    });

    revalidatePath('/teams');
    revalidatePath(`/teams/${id}`);
  } catch (error) {
    if (error instanceof ZodError) {
      const fieldErrors: Record<string, string[]> = {};
      error.issues.forEach((err: any) => {
        const field = String(err.path[0]);
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }
    console.error('Update team error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to update team' };
  }
  redirect(`/teams/${id}`);
}

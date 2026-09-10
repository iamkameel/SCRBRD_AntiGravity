'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { SchoolSchema, SchoolInput } from '@/lib/validations/schoolSchema';
import { createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import { School } from '@/types/firestore';

export interface SchoolActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export async function createSchoolAction(
  prevState: SchoolActionState,
  formData: FormData
): Promise<SchoolActionState> {
  try {
    const rawData = {
      name: formData.get('name'),
      abbreviation: formData.get('abbreviation') || undefined,
      motto: formData.get('motto') || undefined,
      establishmentYear: formData.get('establishmentYear')
        ? parseInt(formData.get('establishmentYear') as string, 10)
        : undefined,
      location: formData.get('location') || undefined,
      address: formData.get('address') || undefined,
      contactEmail: formData.get('contactEmail') || undefined,
      contactPhone: formData.get('contactPhone') || undefined,
      contactName: formData.get('contactName') || undefined,
      principal: formData.get('principal') || undefined,
      logoUrl: formData.get('logoUrl') || undefined,
      divisionId: formData.get('divisionId') || undefined,
      provinceId: formData.get('provinceId') || undefined,
      brandColors: {
        primary: formData.get('brandColors.primary') || undefined,
        secondary: formData.get('brandColors.secondary') || undefined,
      },
    };

    const validatedData = SchoolSchema.parse(rawData);

    await createDocument<Omit<School, 'id'>>('schools', validatedData as any);

    revalidatePath('/schools');
    return { success: true as const };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
      const fieldErrors: Record<string, string[]> = {};
      zodError.issues.forEach((err) => {
        const field = err.path.join('.');
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }

    return {
      error: error instanceof Error ? error.message : 'Failed to create school'
    };
  }
}

export async function updateSchoolAction(
  schoolId: string,
  prevState: SchoolActionState,
  formData: FormData
): Promise<SchoolActionState> {
  try {
    const rawData = {
      name: formData.get('name'),
      abbreviation: formData.get('abbreviation') || undefined,
      motto: formData.get('motto') || undefined,
      establishmentYear: formData.get('establishmentYear')
        ? parseInt(formData.get('establishmentYear') as string, 10)
        : undefined,
      location: formData.get('location') || undefined,
      address: formData.get('address') || undefined,
      contactEmail: formData.get('contactEmail') || undefined,
      contactPhone: formData.get('contactPhone') || undefined,
      contactName: formData.get('contactName') || undefined,
      principal: formData.get('principal') || undefined,
      logoUrl: formData.get('logoUrl') || undefined,
      divisionId: formData.get('divisionId') || undefined,
      provinceId: formData.get('provinceId') || undefined,
      brandColors: {
        primary: formData.get('brandColors.primary') || undefined,
        secondary: formData.get('brandColors.secondary') || undefined,
      },
    };

    const validatedData = SchoolSchema.parse(rawData);

    await updateDocument<School>('schools', schoolId, validatedData as any);

    revalidatePath('/schools');
    revalidatePath(`/schools/${schoolId}`);
    return { success: true as const };
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'issues' in error) {
      const zodError = error as { issues: Array<{ path: (string | number)[]; message: string }> };
      const fieldErrors: Record<string, string[]> = {};
      zodError.issues.forEach((err) => {
        const field = err.path.join('.');
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(err.message);
      });
      return { fieldErrors };
    }

    return {
      error: error instanceof Error ? error.message : 'Failed to update school'
    };
  }
}

export async function deleteSchoolAction(schoolId: string): Promise<void> {
  try {
    await deleteDocument('schools', schoolId);
    revalidatePath('/schools');
  } catch (error) {
    console.error('Failed to delete school:', error);
    throw error;
  }
  redirect('/schools');
}

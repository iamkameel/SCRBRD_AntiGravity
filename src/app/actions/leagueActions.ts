'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import admin from "@/lib/firebase-admin";
import { leagueSchema } from "@/lib/validations/leagueSchema";
import { League } from "@/types/firestore";
import { serializeData } from "@/lib/serialize";

interface LeagueFormState {
  errors?: {
    _form?: string[];
  };
  fieldErrors?: {
    [key: string]: string[];
  };
  success?: boolean;
  error?: string;
}

export type LeagueActionState = LeagueFormState;

export async function createLeagueAction(
  prevState: LeagueFormState,
  formData: FormData
): Promise<LeagueFormState> {
  const rawData = {
    name: formData.get("name"),
    provinceId: formData.get("provinceId"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
  };

  const validatedFields = leagueSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const leagueData = {
      ...validatedFields.data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await admin.firestore().collection("leagues").add(leagueData);
    revalidatePath("/leagues");
    return { success: true as const };
  } catch (error) {
    console.error('Create league error:', error);
    return {
      error: (error as Error).message || "Failed to create league. Please try again.",
    };
  }
}

export async function updateLeagueAction(
  id: string,
  prevState: LeagueFormState,
  formData: FormData
): Promise<LeagueFormState> {
  const rawData = {
    name: formData.get("name"),
    provinceId: formData.get("provinceId"),
    type: formData.get("type"),
    description: formData.get("description") || undefined,
  };

  const validatedFields = leagueSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    const leagueData = {
      ...validatedFields.data,
      updatedAt: new Date().toISOString(),
    };

    await admin.firestore().collection("leagues").doc(id).update(leagueData);
    revalidatePath("/leagues");
    revalidatePath(`/leagues/${id}/edit`);
    return { success: true };
  } catch (error) {
    console.error('Update league error:', error);
    return {
      error: (error as Error).message || "Failed to update league. Please try again.",
    };
  }
}

export async function deleteLeagueAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await admin.firestore().collection("leagues").doc(id).delete();
    revalidatePath('/leagues');
    return { success: true };
  } catch (error) {
    console.error('Delete league error:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete league' };
  }
}

export async function getLeagueAction(id: string) {
  try {
    const doc = await admin.firestore().collection("leagues").doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return serializeData({ id: doc.id, ...doc.data() } as League);
  } catch (error) {
    console.error('Get league error:', error);
    return null;
  }
}

export async function getLeaguesAction() {
  try {
    const snapshot = await admin.firestore().collection("leagues").orderBy("name").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get leagues error:', error);
    return [];
  }
}

export async function getProvincesAction() {
  try {
    const snapshot = await admin.firestore().collection("provinces").orderBy("name").get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Get provinces error:', error);
    return [];
  }
}

'use server';

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createDocument, updateDocument, deleteDocument } from "@/lib/firestore";
import { SeasonSchema } from "@/lib/validations/seasonSchema";

interface SeasonFormState {
  errors?: {
    _form?: string[];
  };
  fieldErrors?: {
    [key: string]: string[];
  };
  success?: boolean;
  error?: string;
}

// Export alias for compatibility
export type SeasonActionState = SeasonFormState;

export async function createSeasonAction(
  prevState: SeasonFormState,
  formData: FormData
): Promise<SeasonFormState> {
  const rawData = {
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    active: formData.get("active") === "on",
  };

  const validatedFields = SeasonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await createDocument("seasons", validatedFields.data);
  } catch (error) {
    return {
      errors: {
        _form: ["Failed to create season. Please try again."],
      },
    };
  }

  revalidatePath("/seasons");
  redirect("/seasons");
}

export async function updateSeasonAction(
  id: string,
  prevState: SeasonFormState,
  formData: FormData
): Promise<SeasonFormState> {
  const rawData = {
    name: formData.get("name"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    active: formData.get("active") === "on",
  };

  const validatedFields = SeasonSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await updateDocument("seasons", id, validatedFields.data);
  } catch (error) {
    return {
      errors: {
        _form: ["Failed to update season. Please try again."],
      },
    };
  }

  revalidatePath("/seasons");
  redirect("/seasons");
}

export async function deleteSeasonAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    await deleteDocument('seasons', id);
    revalidatePath('/seasons');
    return { success: true };
  } catch (error: unknown) {
    console.error('Delete season error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete season';
    return { success: false, error: errorMessage };
  }
}

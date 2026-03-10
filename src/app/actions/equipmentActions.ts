'use server';

import { revalidatePath } from 'next/cache';
import { equipmentSchema, EquipmentFormData } from '@/lib/validations/equipmentSchema';
import { createDocument, updateDocument } from '@/lib/firestore';
import { Equipment } from '@/types/firestore';

export interface EquipmentActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export async function createEquipmentAction(
  prevState: EquipmentActionState,
  formData: FormData
): Promise<EquipmentActionState> {
  try {
    const rawData = {
      name: formData.get('name'),
      category: formData.get('category'),
      quantity: formData.get('quantity'),
      condition: formData.get('condition'),
      location: formData.get('location'),
      purchaseDate: formData.get('purchaseDate'),
      purchasePrice: formData.get('purchasePrice'),
      supplier: formData.get('supplier'),
      serialNumber: formData.get('serialNumber'),
      notes: formData.get('notes'),
    };

    const validatedData = equipmentSchema.parse(rawData);

    await createDocument<Omit<Equipment, 'id'>>('equipment', validatedData as any);

    revalidatePath('/equipment');
    return { success: true };
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
      error: error instanceof Error ? error.message : 'Failed to create equipment'
    };
  }
}

export async function updateEquipmentAction(
  equipmentId: string,
  prevState: EquipmentActionState,
  formData: FormData
): Promise<EquipmentActionState> {
  try {
    const rawData = {
      name: formData.get('name'),
      category: formData.get('category'),
      quantity: formData.get('quantity'),
      condition: formData.get('condition'),
      location: formData.get('location'),
      purchaseDate: formData.get('purchaseDate'),
      purchasePrice: formData.get('purchasePrice'),
      supplier: formData.get('supplier'),
      serialNumber: formData.get('serialNumber'),
      notes: formData.get('notes'),
    };

    const validatedData = equipmentSchema.parse(rawData);

    await updateDocument<Equipment>('equipment', equipmentId, validatedData as any);

    revalidatePath('/equipment');
    revalidatePath(`/equipment/${equipmentId}`);
    return { success: true };
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
      error: error instanceof Error ? error.message : 'Failed to update equipment'
    };
  }
}


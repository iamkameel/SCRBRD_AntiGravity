'use server';

import { revalidatePath } from 'next/cache';
import { equipmentSchema, EquipmentFormData } from '@/lib/validations/equipmentSchema';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/services/auditService';

export interface EquipmentActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

function extractEquipmentData(formData: FormData) {
  const getStr = (key: string) => {
    const val = formData.get(key);
    return val !== null && val !== '' ? String(val) : undefined;
  };

  return {
    name: formData.get('name') ? String(formData.get('name')) : '',
    category: formData.get('category') ? String(formData.get('category')) : '',
    quantity: formData.get('quantity') ? String(formData.get('quantity')) : '',
    condition: formData.get('condition') ? String(formData.get('condition')) : '',
    location: formData.get('location') ? String(formData.get('location')) : '',
    purchaseDate: getStr('purchaseDate'),
    purchasePrice: getStr('purchasePrice'),
    supplier: getStr('supplier'),
    serialNumber: getStr('serialNumber'),
    notes: getStr('notes'),
  };
}

export async function createEquipmentAction(
  prevState: EquipmentActionState,
  formData: FormData
): Promise<EquipmentActionState> {
  try {
    const user = await requireUser('logistics');

    const rawData = extractEquipmentData(formData);
    const validatedData = equipmentSchema.parse(rawData);

    const docRef = await adminDb.collection('equipment').add({
      ...validatedData,
      createdBy: user.uid,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await recordAuditLog({
      actorId: user.uid,
      actorName: user.email || 'Logistics Coordinator',
      actionType: 'LOGISTICS_CREATE',
      entityType: 'equipment',
      entityId: docRef.id,
      description: `Created equipment asset: ${validatedData.name} (${validatedData.category})`,
    });

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
    const user = await requireUser('logistics');

    const rawData = extractEquipmentData(formData);
    const validatedData = equipmentSchema.parse(rawData);

    await adminDb.collection('equipment').doc(equipmentId).update({
      ...validatedData,
      updatedBy: user.uid,
      updatedAt: new Date().toISOString(),
    });

    await recordAuditLog({
      actorId: user.uid,
      actorName: user.email || 'Logistics Coordinator',
      actionType: 'LOGISTICS_UPDATE',
      entityType: 'equipment',
      entityId: equipmentId,
      description: `Updated equipment asset: ${validatedData.name} (${validatedData.condition})`,
    });

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

export async function deleteEquipmentAction(
  equipmentId: string
): Promise<EquipmentActionState> {
  try {
    const user = await requireUser('logistics');

    await adminDb.collection('equipment').doc(equipmentId).delete();

    await recordAuditLog({
      actorId: user.uid,
      actorName: user.email || 'Logistics Coordinator',
      actionType: 'LOGISTICS_DELETE',
      entityType: 'equipment',
      entityId: equipmentId,
      description: `Deleted equipment asset ID: ${equipmentId}`,
    });

    revalidatePath('/equipment');
    return { success: true };
  } catch (error: unknown) {
    return {
      error: error instanceof Error ? error.message : 'Failed to delete equipment'
    };
  }
}

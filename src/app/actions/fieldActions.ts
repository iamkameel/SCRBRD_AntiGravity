'use server';

import { revalidatePath } from 'next/cache';
import { fieldSchema } from '@/lib/validations/fieldSchema';
import { Field } from '@/types/firestore';
import { ZodError } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { requireUser } from '@/lib/auth/session';
import { recordAuditLog } from '@/lib/services/auditService';
import {
  GroundStatusLog,
  MaintenanceTask,
  ISO8601Timestamp
} from '@/types/schema_v4';

export interface FieldActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

function extractFieldData(formData: FormData) {
  const getStr = (key: string) => {
    const val = formData.get(key);
    return val !== null && val !== '' ? String(val) : undefined;
  };

  return {
    name: formData.get('name') ? String(formData.get('name')) : '',
    abbreviatedName: getStr('abbreviatedName'),
    nickName: getStr('nickName'),
    location: getStr('location'),
    address: getStr('address'),
    latitude: getStr('latitude'),
    longitude: getStr('longitude'),
    schoolId: getStr('schoolId'),
    capacity: getStr('capacity'),
    pitchCount: getStr('pitchCount'),
    boundaryMin: getStr('boundaryMin'),
    boundaryMax: getStr('boundaryMax'),
    pitchType: getStr('pitchType'),
    scoreboardType: getStr('scoreboardType'),
    facilities: formData.getAll('facilities') as string[],

    status: getStr('status'),
    fieldSize: getStr('fieldSize'),
    surfaceConditionRating: getStr('surfaceConditionRating'),
    grassCover: getStr('grassCover'),
    moistureLevel: getStr('moistureLevel'),
    firmness: getStr('firmness'),
    contactPerson: getStr('contactPerson'),
    contactPhone: getStr('contactPhone'),
    groundsKeeperIds: formData.getAll('groundsKeeperIds') as string[],
  };
}

export async function createFieldAction(
  prevState: FieldActionState,
  formData: FormData
): Promise<FieldActionState> {
  try {
    const user = await requireUser('fields');
    const rawData = extractFieldData(formData);
    const validatedData = fieldSchema.parse(rawData);

    const nowIso = new Date().toISOString();
    const newFieldData: Omit<Field, 'id'> = {
      ...validatedData,
      surfaceDetails: {
        grassCover: validatedData.grassCover ? Number(validatedData.grassCover) : undefined,
        moistureLevel: validatedData.moistureLevel,
        firmness: validatedData.firmness,
      },
      surfaceConditionRating: validatedData.surfaceConditionRating ? Number(validatedData.surfaceConditionRating) : undefined,
      createdBy: user.uid,
      createdAt: nowIso,
      updatedAt: nowIso,
    } as any;

    const docRef = await adminDb.collection('fields').add(newFieldData);

    await recordAuditLog({
      actorId: user.uid,
      actorName: user.email || 'Facility Admin',
      actionType: 'LOGISTICS_CREATE',
      entityType: 'field',
      entityId: docRef.id,
      description: `Created field facility: ${validatedData.name}`,
    });

    revalidatePath('/fields');
    return { success: true };
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
    console.error('Create field error:', error);
    return { error: (error as Error).message || 'Failed to create field' };
  }
}

export async function updateFieldAction(
  id: string,
  prevState: FieldActionState,
  formData: FormData
): Promise<FieldActionState> {
  try {
    const user = await requireUser('fields');
    const rawData = extractFieldData(formData);
    const validatedData = fieldSchema.parse(rawData);

    const nowIso = new Date().toISOString();
    const updateData: Partial<Field> = {
      ...validatedData,
      surfaceDetails: {
        grassCover: validatedData.grassCover ? Number(validatedData.grassCover) : undefined,
        moistureLevel: validatedData.moistureLevel,
        firmness: validatedData.firmness,
      },
      surfaceConditionRating: validatedData.surfaceConditionRating ? Number(validatedData.surfaceConditionRating) : undefined,
      updatedBy: user.uid,
      updatedAt: nowIso,
    } as any;

    await adminDb.collection('fields').doc(id).update(updateData);

    await recordAuditLog({
      actorId: user.uid,
      actorName: user.email || 'Facility Admin',
      actionType: 'LOGISTICS_UPDATE',
      entityType: 'field',
      entityId: id,
      description: `Updated field facility: ${validatedData.name}`,
    });

    revalidatePath('/fields');
    revalidatePath(`/fields/${id}`);
    return { success: true };
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
    console.error('Update field error:', error);
    return { error: (error as Error).message || 'Failed to update field' };
  }
}

export async function deleteFieldAction(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const user = await requireUser('fields');
    await adminDb.collection('fields').doc(id).delete();

    await recordAuditLog({
      actorId: user.uid,
      actorName: user.email || 'Facility Admin',
      actionType: 'LOGISTICS_DELETE',
      entityType: 'field',
      entityId: id,
      description: `Deleted field facility ${id}`,
    });

    revalidatePath('/fields');
    return { success: true };
  } catch (error) {
    console.error('Delete field error:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete field' };
  }
}

/**
 * Logs a new ground status entry, typically by a groundskeeper.
 */
export async function logGroundStatusAction(data: Partial<GroundStatusLog>) {
  try {
    const user = await requireUser('fields');
    const nowIso = new Date().toISOString();

    const docRef = await adminDb.collection('ground_status_logs').add({
      ...data,
      loggedBy: user.uid,
      loggedAt: nowIso as unknown as ISO8601Timestamp,
    });

    if (data.fieldId) {
      await adminDb.collection('fields').doc(data.fieldId).update({
        lastStatus: data.conditionStatus,
        updatedAt: nowIso as unknown as ISO8601Timestamp,
      });
    }

    await recordAuditLog({
      actorId: user.uid,
      actorName: user.email || 'Groundskeeper',
      actionType: 'READINESS_OVERRIDE',
      entityType: 'ground_readiness',
      entityId: docRef.id,
      description: `Logged ground status '${data.conditionStatus}' for field ${data.fieldId || 'N/A'}.`,
    });

    revalidatePath('/dashboard/groundskeeper');
    return { success: true, id: docRef.id };
  } catch (error: any) {
    console.error('Error logging ground status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches the latest ground status logs for a specific field.
 */
export async function getLatestFieldStatusAction(fieldId: string) {
  try {
    const snapshot = await adminDb
      .collection('ground_status_logs')
      .where('fieldId', '==', fieldId)
      .orderBy('loggedAt', 'desc')
      .limit(5)
      .get();

    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as GroundStatusLog[];

    return { success: true, data: logs };
  } catch (error: any) {
    console.error('Error fetching field status:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all fields for a specific school.
 */
export async function getSchoolFieldsAction(schoolId: string) {
  try {
    const snapshot = await adminDb
      .collection('fields')
      .where('schoolId', '==', schoolId)
      .where('status', '==', 'ACTIVE')
      .get();

    const fields = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as any[];

    return { success: true, data: fields };
  } catch (error: any) {
    console.error('Error fetching school fields:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Creates or updates a maintenance task for a field.
 */
export async function upsertMaintenanceTaskAction(data: Partial<MaintenanceTask>) {
  try {
    const user = await requireUser('fields');
    const nowIso = new Date().toISOString();

    if (data.id) {
      await adminDb.collection('maintenance_tasks').doc(data.id).update({
        ...data,
        updatedBy: user.uid,
        updatedAt: nowIso as unknown as ISO8601Timestamp,
      });

      await recordAuditLog({
        actorId: user.uid,
        actorName: user.email || 'Facility Staff',
        actionType: 'LOGISTICS_UPDATE',
        entityType: 'maintenance_task',
        entityId: data.id,
        description: `Updated maintenance task: ${data.title || data.id}`,
      });

      return { success: true, id: data.id };
    } else {
      const docRef = await adminDb.collection('maintenance_tasks').add({
        ...data,
        status: data.status || 'PENDING',
        createdBy: user.uid,
        createdAt: nowIso as unknown as ISO8601Timestamp,
        updatedAt: nowIso as unknown as ISO8601Timestamp,
      });

      await recordAuditLog({
        actorId: user.uid,
        actorName: user.email || 'Facility Staff',
        actionType: 'LOGISTICS_CREATE',
        entityType: 'maintenance_task',
        entityId: docRef.id,
        description: `Created maintenance task: ${data.title || docRef.id}`,
      });

      return { success: true, id: docRef.id };
    }
  } catch (error: any) {
    console.error('Error upserting maintenance task:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches pending maintenance tasks for a groundskeeper.
 */
export async function getPendingMaintenanceTasksAction(schoolId: string) {
  try {
    const snapshot = await adminDb
      .collection('maintenance_tasks')
      .where('status', '!=', 'COMPLETED')
      .orderBy('status')
      .orderBy('dueDate', 'asc')
      .get();

    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MaintenanceTask[];

    return { success: true, data: tasks };
  } catch (error: any) {
    console.error('Error fetching maintenance tasks:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all maintenance tasks for a specific field.
 */
export async function getMaintenanceTasksByFieldAction(fieldId: string) {
  try {
    const snapshot = await adminDb
      .collection('maintenance_tasks')
      .where('fieldId', '==', fieldId)
      .orderBy('dueDate', 'asc')
      .get();

    const tasks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as MaintenanceTask[];

    return { success: true, data: tasks };
  } catch (error: any) {
    console.error('Error fetching field maintenance tasks:', error);
    return { success: false, error: error.message };
  }
}

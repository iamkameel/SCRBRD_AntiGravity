'use server';

import { revalidatePath } from 'next/cache';
import { fieldSchema } from '@/lib/validations/fieldSchema';
import { createDocument, updateDocument, deleteDocument } from '@/lib/firestore';
import { Field } from '@/types/firestore';
import { ZodError } from 'zod';
import { db } from '@/lib/firebase';
import { requireUser } from '@/lib/auth/session';
import {
  collection,
  addDoc,
  updateDoc as firestoreUpdateDoc,
  doc as firestoreDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  getDocs
} from 'firebase/firestore';
import {
  GroundStatusLog,
  MaintenanceTask,
  ISO8601Timestamp,
  UUID
} from '@/types/schema_v4';

export interface FieldActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export async function createFieldAction(
  prevState: FieldActionState,
  formData: FormData
): Promise<FieldActionState> {
  try {
      await requireUser('fields');
    const rawData = {
      name: formData.get('name'),
      location: formData.get('location'),
      address: formData.get('address'),
      coordinates: {
        lat: Number(formData.get('latitude')),
        lng: Number(formData.get('longitude')),
      },
      capacity: Number(formData.get('capacity')),
      pitchCount: Number(formData.get('pitchCount')),
      boundarySize: {
        north: Number(formData.get('boundaryNorth')),
        south: Number(formData.get('boundarySouth')),
        east: Number(formData.get('boundaryEast')),
        west: Number(formData.get('boundaryWest')),
      },
      pitchType: formData.get('pitchType'),
      scoreboardType: formData.get('scoreboardType'),
      facilities: formData.getAll('facilities'),

      // New fields
      status: formData.get('status'),
      fieldSize: formData.get('fieldSize'),
      surfaceConditionRating: formData.get('surfaceConditionRating'),
      grassCover: formData.get('grassCover'),
      moistureLevel: formData.get('moistureLevel'),
      firmness: formData.get('firmness'),
      contactPerson: formData.get('contactPerson'),
      contactPhone: formData.get('contactPhone'),
      groundsKeeperIds: formData.getAll('groundsKeeperIds'),
    };

    const validatedData = fieldSchema.parse(rawData);

    const newFieldData: Omit<Field, 'id'> = {
      ...validatedData,
      // Transform flat surface fields into nested object
      surfaceDetails: {
        grassCover: validatedData.grassCover ? Number(validatedData.grassCover) : undefined,
        moistureLevel: validatedData.moistureLevel,
        firmness: validatedData.firmness,
      },
      surfaceConditionRating: validatedData.surfaceConditionRating ? Number(validatedData.surfaceConditionRating) : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as any;

    await createDocument<Omit<Field, 'id'>>('fields', newFieldData);

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
      await requireUser('fields');
    const rawData = {
      name: formData.get('name'),
      location: formData.get('location'),
      address: formData.get('address'),
      coordinates: {
        lat: Number(formData.get('latitude')),
        lng: Number(formData.get('longitude')),
      },
      capacity: Number(formData.get('capacity')),
      pitchCount: Number(formData.get('pitchCount')),
      boundarySize: {
        north: Number(formData.get('boundaryNorth')),
        south: Number(formData.get('boundarySouth')),
        east: Number(formData.get('boundaryEast')),
        west: Number(formData.get('boundaryWest')),
      },
      pitchType: formData.get('pitchType'),
      scoreboardType: formData.get('scoreboardType'),
      facilities: formData.getAll('facilities'),

      // New fields
      status: formData.get('status'),
      fieldSize: formData.get('fieldSize'),
      surfaceConditionRating: formData.get('surfaceConditionRating'),
      grassCover: formData.get('grassCover'),
      moistureLevel: formData.get('moistureLevel'),
      firmness: formData.get('firmness'),
      contactPerson: formData.get('contactPerson'),
      contactPhone: formData.get('contactPhone'),
      groundsKeeperIds: formData.getAll('groundsKeeperIds'),
    };

    const validatedData = fieldSchema.parse(rawData);

    const updateData: Partial<Field> = {
      ...validatedData,
      // Transform flat surface fields into nested object
      surfaceDetails: {
        grassCover: validatedData.grassCover ? Number(validatedData.grassCover) : undefined,
        moistureLevel: validatedData.moistureLevel,
        firmness: validatedData.firmness,
      },
      surfaceConditionRating: validatedData.surfaceConditionRating ? Number(validatedData.surfaceConditionRating) : undefined,
      updatedAt: new Date().toISOString(),
    } as any;

    await updateDocument<Field>('fields', id, updateData);

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
      await requireUser('fields');
    await deleteDocument('fields', id);
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
      await requireUser('fields');
    const docRef = await addDoc(collection(db, 'ground_status_logs'), {
      ...data,
      loggedAt: serverTimestamp() as unknown as ISO8601Timestamp
    });

    if (data.fieldId) {
      const fieldRef = firestoreDoc(db, 'fields', data.fieldId);
      await firestoreUpdateDoc(fieldRef, {
        lastStatus: data.conditionStatus,
        updatedAt: serverTimestamp() as unknown as ISO8601Timestamp
      } as any);
    }

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
    const q = query(
      collection(db, 'ground_status_logs'),
      where('fieldId', '==', fieldId),
      orderBy('loggedAt', 'desc'),
      limit(5)
    );

    const snapshot = await getDocs(q);
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
    // Note: We use queryDocuments from lib/firestore if possible, 
    // but here we use direct firebase for specific filtering logic matching the schema
    const q = query(
      collection(db, 'fields'),
      where('schoolId', '==', schoolId),
      where('status', '==', 'ACTIVE')
    );

    const snapshot = await getDocs(q);
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
      await requireUser('fields');
    if (data.id) {
      const docRef = firestoreDoc(db, 'maintenance_tasks', data.id);
      await firestoreUpdateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp() as unknown as ISO8601Timestamp
      } as any);
      return { success: true, id: data.id };
    } else {
      const docRef = await addDoc(collection(db, 'maintenance_tasks'), {
        ...data,
        status: data.status || 'PENDING',
        createdAt: serverTimestamp() as unknown as ISO8601Timestamp,
        updatedAt: serverTimestamp() as unknown as ISO8601Timestamp
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
    const q = query(
      collection(db, 'maintenance_tasks'),
      where('status', '!=', 'COMPLETED'),
      orderBy('status'),
      orderBy('dueDate', 'asc')
    );

    const snapshot = await getDocs(q);
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
    const q = query(
      collection(db, 'maintenance_tasks'),
      where('fieldId', '==', fieldId),
      orderBy('dueDate', 'asc')
    );

    const snapshot = await getDocs(q);
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

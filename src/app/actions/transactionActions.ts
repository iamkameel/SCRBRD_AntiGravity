'use server';

import { revalidatePath } from 'next/cache';
import { TransactionSchema, TransactionInput } from '@/lib/validations/transactionSchema';
import { createDocument, updateDocument } from '@/lib/firestore';
import { requireUser } from '@/lib/auth/session';

export interface TransactionActionState {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
}

export async function createTransactionAction(
  prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  try {
      await requireUser('management');
    const rawData = {
      date: formData.get('date'),
      type: formData.get('type'),
      category: formData.get('category'),
      amount: formData.get('amount')
        ? parseFloat(formData.get('amount') as string)
        : undefined,
      description: formData.get('description'),
      status: formData.get('status'),
    };

    const validatedData = TransactionSchema.parse(rawData);

    await createDocument('transactions', validatedData as any);

    revalidatePath('/financials');
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
      error: error instanceof Error ? error.message : 'Failed to create transaction'
    };
  }
}

export async function updateTransactionAction(
  transactionId: string,
  prevState: TransactionActionState,
  formData: FormData
): Promise<TransactionActionState> {
  try {
      await requireUser('management');
    const rawData = {
      date: formData.get('date'),
      type: formData.get('type'),
      category: formData.get('category'),
      amount: formData.get('amount')
        ? parseFloat(formData.get('amount') as string)
        : undefined,
      description: formData.get('description'),
      status: formData.get('status'),
    };

    const validatedData = TransactionSchema.parse(rawData);

    await updateDocument('transactions', transactionId, validatedData as any);

    revalidatePath('/financials');
    revalidatePath(`/financials/${transactionId}`);
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
      error: error instanceof Error ? error.message : 'Failed to update transaction'
    };
  }
}


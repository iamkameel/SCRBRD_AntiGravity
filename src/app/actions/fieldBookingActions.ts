'use server';

import { revalidatePath } from 'next/cache';
import admin from '@/lib/firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

export interface BookingData {
  date: Date | string;
  startTime: string;
  endTime: string;
  title: string;
  organizer: string;
  type: 'Match' | 'Practice' | 'Maintenance' | 'Event';
  status?: 'Confirmed' | 'Pending' | 'Cancelled';
  /** Links the booking to the match it holds the ground for (fixture reconciliation). */
  fixtureId?: string;
  recurring?: {
    frequency: 'weekly' | 'biweekly' | 'monthly';
    endDate: Date | string;
    parentBookingId?: string;
  };
}

export async function createBookingAction(fieldId: string, bookingData: BookingData) {
  'use server';

  try {
    const bookingRef = admin.firestore()
      .collection('fields')
      .doc(fieldId)
      .collection('bookings')
      .doc();

    const booking = {
      ...bookingData,
      date: bookingData.date instanceof Date
        ? Timestamp.fromDate(bookingData.date)
        : Timestamp.fromDate(new Date(bookingData.date)),
      status: bookingData.status || 'Confirmed',
      recurring: bookingData.recurring ? {
        ...bookingData.recurring,
        endDate: bookingData.recurring.endDate instanceof Date
          ? Timestamp.fromDate(bookingData.recurring.endDate)
          : Timestamp.fromDate(new Date(bookingData.recurring.endDate))
      } : undefined,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    await bookingRef.set(booking);

    revalidatePath(`/fields/${fieldId}`);
    revalidatePath('/fields');

    return { success: true, id: bookingRef.id };
  } catch (error) {
    console.error('createBookingAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to create booking' };
  }
}

export async function getFieldBookingsAction(
  fieldId: string,
  startDate?: Date,
  endDate?: Date
) {
  'use server';

  try {
    let query = admin.firestore()
      .collection('fields')
      .doc(fieldId)
      .collection('bookings') as any;

    if (startDate) {
      query = query.where('date', '>=', Timestamp.fromDate(startDate));
    }

    if (endDate) {
      query = query.where('date', '<=', Timestamp.fromDate(endDate));
    }

    const snapshot = await query.get();

    const bookings = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date?.toDate?.() || doc.data().date,
      recurring: doc.data().recurring ? {
        ...doc.data().recurring,
        endDate: doc.data().recurring.endDate?.toDate?.() || doc.data().recurring.endDate
      } : undefined
    }));

    return { success: true, bookings };
  } catch (error) {
    console.error('getFieldBookingsAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to fetch bookings', bookings: [] };
  }
}

export async function deleteBookingAction(fieldId: string, bookingId: string) {
  'use server';

  try {
    await admin.firestore()
      .collection('fields')
      .doc(fieldId)
      .collection('bookings')
      .doc(bookingId)
      .delete();

    revalidatePath(`/fields/${fieldId}`);
    revalidatePath('/fields');

    return { success: true };
  } catch (error) {
    console.error('deleteBookingAction error:', error);
    return { success: false, error: (error as Error).message || 'Failed to delete booking' };
  }
}

import { Timestamp } from 'firebase/firestore';

/**
 * Recursively serializes Firestore data by converting Timestamp objects
 * and Date objects to plain ISO strings to avoid "Only plain objects" errors
 * when passing data from Server Components/Actions to Client Components.
 */
export function serializeData<T>(data: T): T {
    if (data === null || data === undefined) {
        return data;
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => serializeData(item)) as unknown as T;
    }

    // Handle native JS Date objects
    if (data instanceof Date) {
        return data.toISOString() as unknown as T;
    }

    // Handle Firestore Timestamps (client and admin SDKs)
    if (
        typeof data === 'object' &&
        data !== null &&
        (
            data instanceof Timestamp ||
            (typeof (data as any).toDate === 'function' &&
                (('seconds' in data && typeof (data as any).seconds === 'number') ||
                    ('_seconds' in data && typeof (data as any)._seconds === 'number')))
        )
    ) {
        // Convert to ISO string for maximum compatibility
        return (data as any).toDate().toISOString() as unknown as T;
    }

    // Handle regular objects
    if (typeof data === 'object' && data !== null) {
        const result: any = {};
        for (const [key, value] of Object.entries(data)) {
            result[key] = serializeData(value);
        }
        return result as T;
    }

    return data;
}

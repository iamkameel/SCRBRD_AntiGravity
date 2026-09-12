/**
 * Shared client-side Firestore query helpers.
 *
 * `lib/firestore.fetchCollection` swallows every error and returns [] — which
 * makes "rules denied this read" indistinguishable from "no data". Dashboards
 * that fall back to a demo dataset need to tell those apart, so the helpers
 * here come in two flavours:
 *
 *   queryDocs        – strict: throws FirestoreQueryError (use for the query
 *                      that decides whether a school has data at all)
 *   queryDocsLenient – logs and returns [] (use for enrichment collections
 *                      that may legitimately not exist yet)
 */

import {
    collection,
    getDocs,
    query,
    where,
    documentId,
    Timestamp,
    type QueryConstraint,
    type FirestoreError,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

/** Firestore `in` / `array-contains-any` operand cap. */
export const IN_LIMIT = 30;

export class FirestoreQueryError extends Error {
    readonly collection: string;
    readonly code: string;
    constructor(col: string, code: string, message: string) {
        super(message);
        this.name = 'FirestoreQueryError';
        this.collection = col;
        this.code = code;
    }
}

export function chunk<T>(arr: T[], size = IN_LIMIT): T[][] {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
}

export async function queryDocs<T>(col: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
        const snap = await getDocs(query(collection(db, col), ...constraints));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as T));
    } catch (e) {
        const fe = e as Partial<FirestoreError>;
        throw new FirestoreQueryError(col, fe?.code ?? 'unknown', fe?.message ?? String(e));
    }
}

export async function queryDocsLenient<T>(col: string, constraints: QueryConstraint[] = []): Promise<T[]> {
    try {
        return await queryDocs<T>(col, constraints);
    } catch (e) {
        console.warn(`[firestoreQuery] ${col}: ${(e as Error).message}`);
        return [];
    }
}

/** Fetch documents by id, fanning out past the `in` cap. */
export async function fetchByIds<T>(col: string, ids: string[], strict = false): Promise<T[]> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (!unique.length) return [];
    const run = strict ? queryDocs<T> : queryDocsLenient<T>;
    return (await Promise.all(chunk(unique).map(c => run(col, [where(documentId(), 'in', c)])))).flat();
}

/** Fetch documents where `field` is in ids, fanning out past the `in` cap. */
export async function fetchWhereIn<T>(col: string, field: string, ids: string[], strict = false): Promise<T[]> {
    const unique = Array.from(new Set(ids.filter(Boolean)));
    if (!unique.length) return [];
    const run = strict ? queryDocs<T> : queryDocsLenient<T>;
    return (await Promise.all(chunk(unique).map(c => run(col, [where(field, 'in', c)])))).flat();
}

/** Coerce Timestamp | Date | ISO string | epoch into a Date (null when unparseable). */
export function toDate(value: unknown): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    if (value instanceof Timestamp) return value.toDate();
    if (typeof value === 'object' && typeof (value as { toDate?: unknown }).toDate === 'function') {
        return (value as { toDate: () => Date }).toDate();
    }
    if (typeof value === 'string' || typeof value === 'number') {
        const d = new Date(value);
        return isNaN(d.getTime()) ? null : d;
    }
    return null;
}

/** Human-readable explanation for a failed read, for surfacing in the UI. */
export function describeFirestoreError(e: unknown): string {
    if (e instanceof FirestoreQueryError) {
        switch (e.code) {
            case 'permission-denied': return `Firestore rules denied reading "${e.collection}" for this account.`;
            case 'unavailable': return 'Firestore is unreachable — check your connection.';
            case 'failed-precondition': return `Query on "${e.collection}" needs a composite index (see firestore.indexes.json).`;
            case 'unauthenticated': return 'Not signed in — Firestore rejected the read.';
            default: return `Firestore read on "${e.collection}" failed (${e.code}): ${e.message}`;
        }
    }
    return e instanceof Error ? e.message : String(e);
}

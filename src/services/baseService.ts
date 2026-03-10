import {
    collection,
    doc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    setDoc,
    query,
    where,
    orderBy,
    limit,
    QueryConstraint,
    DocumentData,
    WithFieldValue,
    UpdateData,
    onSnapshot,
    Firestore
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { FirestoreEntity } from '@/types/firestore';

/**
 * Generic Fetch Options
 */
export interface FetchOptions {
    constraints?: QueryConstraint[];
    limitCount?: number;
    orderByField?: string;
    orderDirection?: 'asc' | 'desc';
}

/**
 * Base Service class for Firestore operations
 * Use functional approach for consistency with existing project style, 
 * but keep logic centralized here.
 */

export const baseService = {
    /**
     * Get a single document by ID
     */
    async getOne<T extends FirestoreEntity>(collectionName: string, id: string): Promise<T | null> {
        try {
            const docRef = doc(db, collectionName, id);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as T;
            }
            return null;
        } catch (error) {
            console.error(`Error getting document ${id} from ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Get all documents in a collection with optional filters
     */
    async getAll<T extends FirestoreEntity>(
        collectionName: string,
        options: FetchOptions = {}
    ): Promise<T[]> {
        try {
            const { constraints = [], limitCount, orderByField, orderDirection = 'asc' } = options;
            const queryConstraints = [...constraints];

            if (orderByField) {
                queryConstraints.push(orderBy(orderByField, orderDirection));
            }
            if (limitCount) {
                queryConstraints.push(limit(limitCount));
            }

            const q = query(collection(db, collectionName), ...queryConstraints);
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
        } catch (error) {
            console.error(`Error getting documents from ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Create a new document
     */
    async create<T extends DocumentData>(collectionName: string, data: WithFieldValue<T>): Promise<string> {
        try {
            const docRef = await addDoc(collection(db, collectionName), data);
            return docRef.id;
        } catch (error) {
            console.error(`Error creating document in ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Update an existing document
     */
    async update<T extends DocumentData>(collectionName: string, id: string, data: UpdateData<T>): Promise<void> {
        try {
            const docRef = doc(db, collectionName, id);
            await updateDoc(docRef, data);
        } catch (error) {
            console.error(`Error updating document ${id} in ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Set (upsert) a document
     */
    async set<T extends DocumentData>(collectionName: string, id: string, data: WithFieldValue<T>): Promise<void> {
        try {
            const docRef = doc(db, collectionName, id);
            await setDoc(docRef, data);
        } catch (error) {
            console.error(`Error setting document ${id} in ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Delete a document
     */
    async delete(collectionName: string, id: string): Promise<void> {
        try {
            const docRef = doc(db, collectionName, id);
            await deleteDoc(docRef);
        } catch (error) {
            console.error(`Error deleting document ${id} from ${collectionName}:`, error);
            throw error;
        }
    },

    /**
     * Subscribe to real-time updates for a single document
     */
    subscribeToOne<T extends FirestoreEntity>(
        collectionName: string,
        id: string,
        onNext: (data: T | null) => void,
        onError?: (error: any) => void
    ) {
        const docRef = doc(db, collectionName, id);
        return onSnapshot(
            docRef,
            (docSnap) => {
                if (docSnap.exists()) {
                    onNext({ id: docSnap.id, ...docSnap.data() } as T);
                } else {
                    onNext(null);
                }
            },
            (error) => {
                console.error(`Subscription error for ${collectionName}/${id}:`, error);
                if (onError) onError(error);
            }
        );
    },

    /**
     * Subscribe to real-time updates for a collection
     */
    subscribeToAll<T extends FirestoreEntity>(
        collectionName: string,
        options: FetchOptions = {},
        onNext: (data: T[]) => void,
        onError?: (error: any) => void
    ) {
        const { constraints = [], limitCount, orderByField, orderDirection = 'asc' } = options;
        const queryConstraints = [...constraints];

        if (orderByField) {
            queryConstraints.push(orderBy(orderByField, orderDirection));
        }
        if (limitCount) {
            queryConstraints.push(limit(limitCount));
        }

        const q = query(collection(db, collectionName), ...queryConstraints);
        return onSnapshot(
            q,
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                onNext(data);
            },
            (error) => {
                console.error(`Subscription error for ${collectionName}:`, error);
                if (onError) onError(error);
            }
        );
    }
};

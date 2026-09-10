/**
 * Offline Event Queue for Live Scoring
 * Uses IndexedDB to store ball events when offline and syncs them when reconnected.
 */

export interface QueuedBallEvent {
    id: string;
    fixtureId: string;
    inningsId: string;
    overNumber: number;
    ballNumber: number;
    strikerId: string;
    nonStrikerId: string;
    bowlerId: string;
    runsOffBat: number;
    extraType?: 'wide' | 'noBall' | 'bye' | 'legBye' | 'penalty';
    extraRuns?: number;
    wicketType?: string;
    dismissedPlayerId?: string;
    queuedAt: number;
    synced: boolean;
}

const DB_NAME = 'scrbrd_scoring_offline';
const STORE_NAME = 'ball_events_queue';
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined' || !window.indexedDB) {
            reject(new Error('IndexedDB not supported in this environment'));
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                store.createIndex('fixtureId', 'fixtureId', { unique: false });
                store.createIndex('synced', 'synced', { unique: false });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export class OfflineEventQueue {
    /**
     * Enqueue a ball event locally when offline or for fast optimistic execution.
     */
    static async enqueueBallEvent(event: Omit<QueuedBallEvent, 'queuedAt' | 'synced'>): Promise<QueuedBallEvent> {
        const db = await openDB();
        const queuedItem: QueuedBallEvent = {
            ...event,
            queuedAt: Date.now(),
            synced: false,
        };

        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.put(queuedItem);
            req.onsuccess = () => resolve(queuedItem);
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Fetch all unsynced ball events for a given fixture.
     */
    static async getUnsyncedEvents(fixtureId?: string): Promise<QueuedBallEvent[]> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();
            req.onsuccess = () => {
                const all: QueuedBallEvent[] = req.result;
                const filtered = all.filter((e) => !e.synced && (!fixtureId || e.fixtureId === fixtureId));
                resolve(filtered.sort((a, b) => a.queuedAt - b.queuedAt));
            };
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Mark an event as synced after sending to Firestore.
     */
    static async markSynced(id: string): Promise<void> {
        const db = await openDB();
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.get(id);
            req.onsuccess = () => {
                if (req.result) {
                    req.result.synced = true;
                    store.put(req.result);
                }
                resolve();
            };
            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Clear synced events older than 24 hours.
     */
    static async pruneOldEvents(): Promise<number> {
        const db = await openDB();
        const cutoff = Date.now() - 24 * 60 * 60 * 1000;
        return new Promise((resolve, reject) => {
            const tx = db.transaction(STORE_NAME, 'readwrite');
            const store = tx.objectStore(STORE_NAME);
            const req = store.getAll();
            let prunedCount = 0;
            req.onsuccess = () => {
                const all: QueuedBallEvent[] = req.result;
                all.forEach((e) => {
                    if (e.synced && e.queuedAt < cutoff) {
                        store.delete(e.id);
                        prunedCount++;
                    }
                });
                resolve(prunedCount);
            };
            req.onerror = () => reject(req.error);
        });
    }
}

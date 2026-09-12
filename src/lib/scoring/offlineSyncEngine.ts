/**
 * SCRBRD Offline Sync Engine
 * Ported & enhanced from SCRBRD_OS/packages/scoring/src/sync-engine.mjs
 * 
 * Provides IndexedDB-backed offline event persistence with idempotency keys
 * and automatic background flushing when network connectivity is restored.
 */

export interface QueuedBallEvent {
    idempotencyKey: string;
    fixtureId: string;
    inningsNumber: number;
    overNumber: number;
    ballNumber: number;
    payload: Record<string, any>;
    createdAt: number;
    status: 'pending' | 'syncing' | 'failed';
    retryCount: number;
}

export type SyncState = 'online' | 'offline' | 'syncing';

export interface SyncStatus {
    state: SyncState;
    pendingCount: number;
    lastSyncedAt: number | null;
    error?: string;
}

type SyncStatusCallback = (status: SyncStatus) => void;

class OfflineSyncEngine {
    private dbName = 'scrbrd_offline_db';
    private dbVersion = 1;
    private storeName = 'ball_event_queue';
    private db: IDBDatabase | null = null;
    private listeners: Set<SyncStatusCallback> = new Set();

    private status: SyncStatus = {
        state: typeof navigator !== 'undefined' && navigator.onLine ? 'online' : 'offline',
        pendingCount: 0,
        lastSyncedAt: null,
    };

    constructor() {
        if (typeof window !== 'undefined') {
            this.initDB();
            window.addEventListener('online', () => this.handleNetworkChange(true));
            window.addEventListener('offline', () => this.handleNetworkChange(false));
        }
    }

    private async initDB(): Promise<IDBDatabase> {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            if (typeof window === 'undefined' || !window.indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    const store = db.createObjectStore(this.storeName, { keyPath: 'idempotencyKey' });
                    store.createIndex('fixtureId', 'fixtureId', { unique: false });
                    store.createIndex('status', 'status', { unique: false });
                    store.createIndex('createdAt', 'createdAt', { unique: false });
                }
            };

            request.onsuccess = (event) => {
                this.db = (event.target as IDBOpenDBRequest).result;
                this.updatePendingCount();
                resolve(this.db);
            };

            request.onerror = (event) => {
                console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
                reject((event.target as IDBOpenDBRequest).error);
            };
        });
    }

    /**
     * Enqueue a ball event to IndexedDB with an idempotency key.
     */
    public async enqueueBallEvent(fixtureId: string, payload: Record<string, any>): Promise<string> {
        const db = await this.initDB();
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const idempotencyKey = `${fixtureId}_${timestamp}_${randomSuffix}`;

        const queuedEvent: QueuedBallEvent = {
            idempotencyKey,
            fixtureId,
            inningsNumber: payload.inningsNumber || 1,
            overNumber: payload.overNumber || 1,
            ballNumber: payload.ballNumber || 1,
            payload,
            createdAt: timestamp,
            status: 'pending',
            retryCount: 0,
        };

        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);
            const req = store.add(queuedEvent);

            req.onsuccess = () => {
                this.updatePendingCount();
                if (this.status.state === 'online') {
                    this.triggerSyncFlush();
                }
                resolve(idempotencyKey);
            };

            req.onerror = () => {
                reject(req.error);
            };
        });
    }

    /**
     * Retrieve all pending queued events from IndexedDB.
     */
    public async getPendingEvents(): Promise<QueuedBallEvent[]> {
        const db = await this.initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.getAll();

            req.onsuccess = () => {
                const events = (req.result as QueuedBallEvent[]) || [];
                resolve(events.filter(e => e.status !== 'syncing'));
            };

            req.onerror = () => reject(req.error);
        });
    }

    /**
     * Mark events as successfully synced (removes them from queue).
     */
    public async markEventsSynced(idempotencyKeys: string[]): Promise<void> {
        if (idempotencyKeys.length === 0) return;
        const db = await this.initDB();

        return new Promise((resolve, reject) => {
            const tx = db.transaction(this.storeName, 'readwrite');
            const store = tx.objectStore(this.storeName);

            let completed = 0;
            idempotencyKeys.forEach(key => {
                const req = store.delete(key);
                req.onsuccess = () => {
                    completed++;
                    if (completed === idempotencyKeys.length) {
                        this.status.lastSyncedAt = Date.now();
                        this.updatePendingCount();
                        resolve();
                    }
                };
                req.onerror = () => reject(req.error);
            });
        });
    }

    /**
     * Attempt to flush the queue to remote storage.
     */
    public async triggerSyncFlush(): Promise<number> {
        if (this.status.state === 'offline') return 0;
        const pending = await this.getPendingEvents();
        if (pending.length === 0) return 0;

        this.setStatus({ state: 'syncing' });

        try {
            // Simulate remote API/Firestore push delay
            await new Promise(resolve => setTimeout(resolve, 800));

            const syncedKeys = pending.map(e => e.idempotencyKey);
            await this.markEventsSynced(syncedKeys);

            const remaining = await this.getPendingEvents();
            this.setStatus({
                state: 'online',
                pendingCount: remaining.length,
                lastSyncedAt: Date.now(),
            });

            return syncedKeys.length;
        } catch (err: any) {
            console.error('OfflineSyncEngine flush failed:', err);
            this.setStatus({
                state: 'online',
                error: err?.message || 'Sync failed',
            });
            return 0;
        }
    }

    /**
     * Update internal pending event count and notify subscribers.
     */
    private async updatePendingCount(): Promise<void> {
        if (!this.db) return;
        try {
            const tx = this.db.transaction(this.storeName, 'readonly');
            const store = tx.objectStore(this.storeName);
            const req = store.count();

            req.onsuccess = () => {
                this.setStatus({ pendingCount: req.result });
            };
        } catch {
            // Ignore background count errors
        }
    }

    private handleNetworkChange(isOnline: boolean) {
        this.setStatus({ state: isOnline ? 'online' : 'offline' });
        if (isOnline) {
            this.triggerSyncFlush();
        }
    }

    private setStatus(partial: Partial<SyncStatus>) {
        this.status = { ...this.status, ...partial };
        this.notifyListeners();
    }

    public subscribe(callback: SyncStatusCallback): () => void {
        this.listeners.add(callback);
        callback(this.status);
        return () => this.listeners.delete(callback);
    }

    private notifyListeners() {
        this.listeners.forEach(cb => cb(this.status));
    }

    public getStatus(): SyncStatus {
        return this.status;
    }
}

export const offlineSyncEngine = typeof window !== 'undefined' ? new OfflineSyncEngine() : null;

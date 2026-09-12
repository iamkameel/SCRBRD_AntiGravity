/**
 * Highlight clip persistence — Firestore `match_highlights`, with an in-memory
 * bus so the clipper keeps working when Firestore is unreachable (same
 * degrade-gracefully pattern as parentNotificationService / liveMatchSync).
 */

import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    query,
    where,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { HighlightClip, ClipStatus } from '@/lib/intelligence/highlightEngine';

type Listener = (clips: HighlightClip[]) => void;

const memory = new Map<string, HighlightClip[]>();          // fixtureId → clips
const listeners = new Map<string, Set<Listener>>();          // fixtureId → listeners

function emit(fixtureId: string) {
    const clips = memory.get(fixtureId) ?? [];
    listeners.get(fixtureId)?.forEach(l => l([...clips]));
}

function upsertLocal(fixtureId: string, clip: HighlightClip) {
    const list = memory.get(fixtureId) ?? [];
    const idx = list.findIndex(c => c.id === clip.id);
    if (idx >= 0) list[idx] = clip; else list.push(clip);
    memory.set(fixtureId, list);
}

export const highlightService = {
    /**
     * Subscribe to a fixture's clips. Firestore is the source of truth when it
     * answers; otherwise the local bus keeps the UI live.
     */
    subscribe(fixtureId: string, listener: Listener): () => void {
        if (!listeners.has(fixtureId)) listeners.set(fixtureId, new Set());
        listeners.get(fixtureId)!.add(listener);
        listener([...(memory.get(fixtureId) ?? [])]);

        let unsubFs = () => { };
        try {
            const q = query(collection(db, 'match_highlights'), where('fixtureId', '==', fixtureId));
            unsubFs = onSnapshot(q, snap => {
                if (snap.empty && (memory.get(fixtureId)?.length ?? 0) > 0) return; // keep local seeds
                const remote = snap.docs.map(d => ({ ...(d.data() as HighlightClip), id: d.id }));
                // Merge: remote wins on id collision, local-only clips (never synced) are kept.
                const local = (memory.get(fixtureId) ?? []).filter(c => c.id.startsWith('hl-') && !remote.some(r => r.sourceBallId && r.sourceBallId === c.sourceBallId));
                memory.set(fixtureId, [...remote, ...local]);
                emit(fixtureId);
            }, err => {
                console.warn('[highlightService] Firestore listener unavailable, memory mode:', err.message);
            });
        } catch (err) {
            console.warn('[highlightService] Could not bind Firestore listener:', err);
        }

        return () => {
            listeners.get(fixtureId)?.delete(listener);
            unsubFs();
        };
    },

    /** Add a clip. Returns the persisted clip (id swapped for the Firestore id when it syncs). */
    async add(clip: HighlightClip): Promise<HighlightClip> {
        upsertLocal(clip.fixtureId, clip);
        emit(clip.fixtureId);
        try {
            const { id: _localId, ...data } = clip;
            const ref = await addDoc(collection(db, 'match_highlights'), { ...data, createdAt: serverTimestamp() });
            const synced = { ...clip, id: ref.id };
            const list = (memory.get(clip.fixtureId) ?? []).filter(c => c.id !== clip.id);
            list.push(synced);
            memory.set(clip.fixtureId, list);
            emit(clip.fixtureId);
            return synced;
        } catch (err) {
            console.warn('[highlightService] add failed, kept locally:', err);
            return clip;
        }
    },

    async update(clip: HighlightClip): Promise<void> {
        upsertLocal(clip.fixtureId, clip);
        emit(clip.fixtureId);
        if (clip.id.startsWith('hl-')) return; // never synced
        try {
            const { id, ...data } = clip;
            await updateDoc(doc(db, 'match_highlights', id), { ...data, updatedAt: serverTimestamp() });
        } catch (err) {
            console.warn('[highlightService] update failed, kept locally:', err);
        }
    },

    async setStatus(clip: HighlightClip, status: ClipStatus): Promise<void> {
        return highlightService.update({ ...clip, status });
    },

    async remove(clip: HighlightClip): Promise<void> {
        memory.set(clip.fixtureId, (memory.get(clip.fixtureId) ?? []).filter(c => c.id !== clip.id));
        emit(clip.fixtureId);
        if (clip.id.startsWith('hl-')) return;
        try {
            await deleteDoc(doc(db, 'match_highlights', clip.id));
        } catch (err) {
            console.warn('[highlightService] delete failed:', err);
        }
    },

    /** Replace the whole local set (used after a resync of stream offsets). */
    async replaceAll(fixtureId: string, clips: HighlightClip[]): Promise<void> {
        memory.set(fixtureId, [...clips]);
        emit(fixtureId);
        await Promise.all(clips.filter(c => !c.id.startsWith('hl-')).map(c => highlightService.update(c)));
    },
};

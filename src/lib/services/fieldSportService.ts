/**
 * Field/court match persistence — Firestore `field_sport_matches`, one doc per
 * match, with an in-memory bus so the console keeps working offline (same
 * pattern as highlightService).
 */

import { collection, doc, onSnapshot, query, setDoc, where, orderBy, limit as qLimit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { FieldSportMatch } from '@/lib/intelligence/fieldSportEngine';

type MatchListener = (m: FieldSportMatch | null) => void;
type ListListener = (ms: FieldSportMatch[]) => void;

const memory = new Map<string, FieldSportMatch>();
const matchSubs = new Map<string, Set<MatchListener>>();
const listSubs = new Set<ListListener>();

function emitMatch(id: string) { matchSubs.get(id)?.forEach(l => l(memory.get(id) ?? null)); }
function emitList() { const all = list(); listSubs.forEach(l => l(all)); }
function list(): FieldSportMatch[] {
    return Array.from(memory.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export const fieldSportService = {
    /** Latest state of one match (Firestore when reachable, memory otherwise). */
    subscribe(matchId: string, listener: MatchListener): () => void {
        if (!matchSubs.has(matchId)) matchSubs.set(matchId, new Set());
        matchSubs.get(matchId)!.add(listener);
        listener(memory.get(matchId) ?? null);

        let unsub = () => { };
        try {
            unsub = onSnapshot(doc(db, 'field_sport_matches', matchId), snap => {
                if (!snap.exists()) return;
                const remote = snap.data() as FieldSportMatch;
                const local = memory.get(matchId);
                if (!local || remote.updatedAt >= local.updatedAt) {
                    memory.set(matchId, remote);
                    emitMatch(matchId); emitList();
                }
            }, err => console.warn('[fieldSportService] listener unavailable, memory mode:', err.message));
        } catch (err) {
            console.warn('[fieldSportService] could not bind listener:', err);
        }
        return () => { matchSubs.get(matchId)?.delete(listener); unsub(); };
    },

    /** Recent matches (optionally for one school). */
    subscribeList(listener: ListListener, schoolId?: string, max = 25): () => void {
        listSubs.add(listener);
        listener(list());
        let unsub = () => { };
        try {
            const constraints = [orderBy('updatedAt', 'desc'), qLimit(max)];
            const q = schoolId
                ? query(collection(db, 'field_sport_matches'), where('schoolId', '==', schoolId), ...constraints)
                : query(collection(db, 'field_sport_matches'), ...constraints);
            unsub = onSnapshot(q, snap => {
                snap.docs.forEach(d => {
                    const remote = d.data() as FieldSportMatch;
                    const local = memory.get(remote.id);
                    if (!local || remote.updatedAt >= local.updatedAt) memory.set(remote.id, remote);
                });
                emitList();
            }, err => console.warn('[fieldSportService] list listener unavailable, memory mode:', err.message));
        } catch (err) {
            console.warn('[fieldSportService] could not bind list listener:', err);
        }
        return () => { listSubs.delete(listener); unsub(); };
    },

    /** Persist a match state (fire-and-forget to Firestore; memory is updated synchronously). */
    async save(match: FieldSportMatch): Promise<void> {
        memory.set(match.id, match);
        emitMatch(match.id); emitList();
        try {
            await setDoc(doc(db, 'field_sport_matches', match.id), match, { merge: false });
        } catch (err) {
            console.warn('[fieldSportService] save failed, kept locally:', err);
        }
    },

    get(matchId: string): FieldSportMatch | null {
        return memory.get(matchId) ?? null;
    },

    all(): FieldSportMatch[] {
        return list();
    },
};

import { RewardsEngine } from './RewardsEngine';
import admin from '../../lib/firebase-admin';

/**
 * RewardService
 * Handles persistence and management of reward wallets and transactions.
 */
export class RewardService {

    /**
     * Applies reward transactions for any number of players in one pass:
     * transactions are queued on the batch and all affected wallets are read
     * with a single getAll() so the cost is one round trip, not one per player.
     */
    static async applyTransactions(
        transactions: Array<any>,
        batch: admin.firestore.WriteBatch
    ): Promise<void> {
        const db = admin.firestore();
        const pointsByPlayer = new Map<string, number>();

        for (const tx of transactions) {
            pointsByPlayer.set(tx.playerId, (pointsByPlayer.get(tx.playerId) || 0) + tx.amount);

            const txRef = db.collection('reward_transactions').doc();
            batch.set(txRef, {
                ...tx,
                id: txRef.id,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        const playerIds = [...pointsByPlayer.entries()].filter(([, pts]) => pts !== 0).map(([id]) => id);
        if (playerIds.length === 0) return;

        const walletRefs = playerIds.map(id => db.collection('rewards_wallets').doc(id));
        const walletDocs = await db.getAll(...walletRefs);

        walletDocs.forEach((walletDoc, i) => {
            const playerId = playerIds[i];
            const totalPointsToAdd = pointsByPlayer.get(playerId)!;
            const lifetime = (walletDoc.exists ? walletDoc.data()?.lifetimePointsEarned : 0) || 0;
            const newLifetime = lifetime + totalPointsToAdd;

            batch.set(walletRefs[i], {
                playerId,
                totalPointsBalance: admin.firestore.FieldValue.increment(totalPointsToAdd),
                lifetimePointsEarned: admin.firestore.FieldValue.increment(totalPointsToAdd),
                currentTier: RewardsEngine.calculateTier(newLifetime),
                nextTierThreshold: RewardsEngine.getNextTierThreshold(newLifetime),
                lastUpdated: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        });
    }
}

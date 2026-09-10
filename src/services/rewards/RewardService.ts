import { RewardsEngine } from './RewardsEngine';
import admin from '../../lib/firebase-admin';

/**
 * RewardService
 * Handles persistence and management of reward wallets and transactions.
 */
export class RewardService {

    /**
     * Applies reward transactions to a player's wallet and updates their tier status.
     */
    static async applyTransactions(
        playerId: string,
        transactions: Array<any>,
        batch: admin.firestore.WriteBatch
    ): Promise<void> {
        const db = admin.firestore();
        const walletRef = db.collection('rewards_wallets').doc(playerId);

        let totalPointsToAdd = 0;
        for (const tx of transactions) {
            if (tx.playerId === playerId) {
                totalPointsToAdd += tx.amount;

                const txId = db.collection('reward_transactions').doc().id;
                const txRef = db.collection('reward_transactions').doc(txId);

                batch.set(txRef, {
                    ...tx,
                    id: txId,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        if (totalPointsToAdd === 0) return;

        // Fetch current wallet to calculate tier updates
        const walletDoc = await walletRef.get();
        const walletData = walletDoc.exists ? walletDoc.data() : { lifetimePointsEarned: 0 };

        const newLifetime = (walletData?.lifetimePointsEarned || 0) + totalPointsToAdd;
        const newTier = RewardsEngine.calculateTier(newLifetime);
        const nextThreshold = RewardsEngine.getNextTierThreshold(newLifetime);

        batch.set(walletRef, {
            playerId,
            totalPointsBalance: admin.firestore.FieldValue.increment(totalPointsToAdd),
            lifetimePointsEarned: admin.firestore.FieldValue.increment(totalPointsToAdd),
            currentTier: newTier,
            nextTierThreshold: nextThreshold,
            lastUpdated: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });
    }
}

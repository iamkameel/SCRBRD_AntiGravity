import admin from './src/lib/firebase-admin';

async function debugMatches() {
    try {
        const snapshot = await admin.firestore().collection('matches').limit(5).get();
        console.log(`Found ${snapshot.size} matches`);
        snapshot.forEach(doc => {
            console.log(`ID: ${doc.id}`);
            console.log('Data:', JSON.stringify(doc.data(), null, 2));
            console.log('---');
        });
    } catch (error) {
        console.error('Error:', error);
    }
}

debugMatches();

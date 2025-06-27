import * as admin from 'firebase-admin';
import { firestore } from '../config/firebase.config';

// Initialize Firebase Admin SDK (ensure your service account key is configured)
// You might need to adjust the path to your service account key or environment variable
// For local development, you can set GOOGLE_APPLICATION_CREDENTIALS environment variable
// to the path of your service account key file.

const datesToDelete = [
  '2025-06-16',
  '2025-06-13',
];

async function deleteSaldosByDate() {
  console.log('Starting deletion of accounting balances...');

  for (const dateString of datesToDelete) {
    console.log(`Processing date: ${dateString}`);
    const targetDate = new Date(dateString);

    
    // Firestore Timestamps are based on UTC, so ensure consistency
    const startOfDay = admin.firestore.Timestamp.fromDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()));
    const endOfDay = admin.firestore.Timestamp.fromDate(new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate() + 1));

    try {
      // Query for documents on the specific date
      const querySnapshot = await firestore.collection('SaldosContables')
        .where('fecha', '==', dateString)
        .get();

      if (querySnapshot.empty) {
        console.log(`No accounting balances found for date ${dateString}.`);
        continue;
      }

      console.log(`Found ${querySnapshot.size} balances for date ${dateString}. Deleting...`);
      
      const batch = admin.firestore().batch();
      querySnapshot.forEach(doc => {
        // Add document to the batch for deletion
        batch.delete(doc.ref);
      });

      // Commit the batch
      await batch.commit();
      console.log(`Successfully deleted all balances for date ${dateString}.`);

    } catch (error) {
      console.error(`Error deleting balances for date ${dateString}:`, error);
    }
  }
  console.log('Deletion process completed.');
}

deleteSaldosByDate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error during script execution:', error);
    process.exit(1);
  });

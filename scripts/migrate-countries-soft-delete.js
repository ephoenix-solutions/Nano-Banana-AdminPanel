/**
 * Migration Script: Add isDeleted field to all existing countries
 * 
 * This script adds the isDeleted field (set to false) to all countries
 * in the database that don't already have this field.
 * This is required for the soft delete functionality.
 * 
 * IMPORTANT: Run this script ONCE before using the soft delete feature.
 * 
 * Usage:
 *   node scripts/migrate-countries-soft-delete.js
 */

const admin = require('firebase-admin');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
    console.log('[SUCCESS] Firebase Admin initialized successfully');
  } catch (error) {
    console.error('[ERROR] Firebase Admin initialization error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function migrateCountriesSoftDelete() {
  console.log('\n[START] Starting migration: Add isDeleted field to countries...');
  console.log('================================================\n');

  try {
    // Get all countries
    const countriesRef = db.collection('countries');
    const snapshot = await countriesRef.get();

    if (snapshot.empty) {
      console.log('[WARNING] No countries found in the database.');
      return;
    }

    console.log(`[INFO] Found ${snapshot.size} countries in total\n`);

    // Prepare batch operations
    let batch = db.batch();
    let batchCount = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    const BATCH_SIZE = 500; // Firestore batch limit

    // Process each country
    for (const countryDoc of snapshot.docs) {
      const countryData = countryDoc.data();

      // Check if country already has isDeleted field
      if (countryData.isDeleted !== undefined) {
        totalSkipped++;
        console.log(`[SKIP] Country: ${countryData.name} (already has isDeleted field)`);
      } else {
        // Add isDeleted field to country
        batch.update(countryDoc.ref, {
          isDeleted: false,
        });

        batchCount++;
        totalUpdated++;

        console.log(`[QUEUE] Country: ${countryData.name} (ID: ${countryDoc.id})`);
      }

      // Commit batch if it reaches the limit
      if (batchCount >= BATCH_SIZE) {
        await batch.commit();
        console.log(`\n[COMMIT] Committed batch of ${batchCount} updates\n`);
        batch = db.batch();
        batchCount = 0;
      }
    }

    // Commit remaining batch
    if (batchCount > 0) {
      await batch.commit();
      console.log(`\n[COMMIT] Committed final batch of ${batchCount} updates\n`);
    }

    // Summary
    console.log('\n================================================');
    console.log('[SUCCESS] Migration completed successfully!');
    console.log('================================================');
    console.log(`[INFO] Total countries processed: ${snapshot.size}`);
    console.log(`[INFO] Countries updated: ${totalUpdated}`);
    console.log(`[INFO] Countries skipped: ${totalSkipped}`);
    console.log('================================================\n');

    // Create Firestore indexes reminder
    console.log('[IMPORTANT] Create Firestore Indexes');
    console.log('================================================');
    console.log('After running this migration, you need to create composite indexes:');
    console.log('');
    console.log('1. Index for active countries query:');
    console.log('   Collection: countries');
    console.log('   Fields: isDeleted (Ascending), name (Ascending)');
    console.log('');
    console.log('2. Index for deleted countries query:');
    console.log('   Collection: countries');
    console.log('   Fields: isDeleted (Ascending), deletedAt (Descending)');
    console.log('');
    console.log('3. Index for countries by category (active):');
    console.log('   Collection: countries');
    console.log('   Fields: categories (Array), isDeleted (Ascending)');
    console.log('');
    console.log('Firestore will prompt you to create these indexes when you first');
    console.log('run queries that need them. Simply click the provided link.');
    console.log('================================================\n');

  } catch (error) {
    console.error('\n[ERROR] Migration failed:', error);
    throw error;
  }
}

// Run migration
migrateCountriesSoftDelete()
  .then(() => {
    console.log('[SUCCESS] Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[ERROR] Migration script failed:', error);
    process.exit(1);
  });

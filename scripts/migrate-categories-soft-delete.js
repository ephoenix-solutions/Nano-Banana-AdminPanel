/**
 * Migration Script: Add isDeleted field to all existing categories and subcategories
 * 
 * This script adds the isDeleted field (set to false) to all categories and their
 * subcategories in the database that don't already have this field.
 * This is required for the soft delete functionality.
 * 
 * IMPORTANT: Run this script ONCE before using the soft delete feature.
 * 
 * Usage:
 *   node scripts/migrate-categories-soft-delete.js
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

async function migrateCategoriesSoftDelete() {
  console.log('\n[START] Starting migration: Add isDeleted field to categories and subcategories...');
  console.log('================================================\n');

  try {
    // Get all categories
    const categoriesRef = db.collection('categories');
    const snapshot = await categoriesRef.get();

    if (snapshot.empty) {
      console.log('[WARNING] No categories found in the database.');
      return;
    }

    console.log(`[INFO] Found ${snapshot.size} categories in total\n`);

    // Prepare batch operations
    let batch = db.batch();
    let batchCount = 0;
    let totalCategoriesUpdated = 0;
    let totalCategoriesSkipped = 0;
    let totalSubcategoriesUpdated = 0;
    let totalSubcategoriesSkipped = 0;
    const BATCH_SIZE = 500; // Firestore batch limit

    // Process each category
    for (const categoryDoc of snapshot.docs) {
      const categoryData = categoryDoc.data();

      // Check if category already has isDeleted field
      if (categoryData.isDeleted !== undefined) {
        totalCategoriesSkipped++;
        console.log(`[SKIP] Category: ${categoryData.name} (already has isDeleted field)`);
      } else {
        // Add isDeleted field to category
        batch.update(categoryDoc.ref, {
          isDeleted: false,
        });

        batchCount++;
        totalCategoriesUpdated++;

        console.log(`[QUEUE] Category: ${categoryData.name} (ID: ${categoryDoc.id})`);
      }

      // Process subcategories
      const subcategoriesRef = categoryDoc.ref.collection('subcategories');
      const subcategoriesSnapshot = await subcategoriesRef.get();

      if (!subcategoriesSnapshot.empty) {
        console.log(`  [INFO] Processing ${subcategoriesSnapshot.size} subcategories for ${categoryData.name}`);

        for (const subDoc of subcategoriesSnapshot.docs) {
          const subData = subDoc.data();

          // Check if subcategory already has isDeleted field
          if (subData.isDeleted !== undefined) {
            totalSubcategoriesSkipped++;
            console.log(`  [SKIP] Subcategory: ${subData.name} (already has isDeleted field)`);
          } else {
            // Add isDeleted field to subcategory
            batch.update(subDoc.ref, {
              isDeleted: false,
            });

            batchCount++;
            totalSubcategoriesUpdated++;

            console.log(`  [QUEUE] Subcategory: ${subData.name} (ID: ${subDoc.id})`);
          }

          // Commit batch if it reaches the limit
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            console.log(`\n[COMMIT] Committed batch of ${batchCount} updates\n`);
            batch = db.batch();
            batchCount = 0;
          }
        }
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
    console.log(`[INFO] Total categories processed: ${snapshot.size}`);
    console.log(`[INFO] Categories updated: ${totalCategoriesUpdated}`);
    console.log(`[INFO] Categories skipped: ${totalCategoriesSkipped}`);
    console.log(`[INFO] Subcategories updated: ${totalSubcategoriesUpdated}`);
    console.log(`[INFO] Subcategories skipped: ${totalSubcategoriesSkipped}`);
    console.log('================================================\n');

    // Create Firestore indexes reminder
    console.log('[IMPORTANT] Create Firestore Indexes');
    console.log('================================================');
    console.log('After running this migration, you need to create composite indexes:');
    console.log('');
    console.log('1. Index for active categories query:');
    console.log('   Collection: categories');
    console.log('   Fields: isDeleted (Ascending), order (Ascending)');
    console.log('');
    console.log('2. Index for deleted categories query:');
    console.log('   Collection: categories');
    console.log('   Fields: isDeleted (Ascending), deletedAt (Descending)');
    console.log('');
    console.log('3. Index for active subcategories query:');
    console.log('   Collection Group: subcategories');
    console.log('   Fields: isDeleted (Ascending), order (Ascending)');
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
migrateCategoriesSoftDelete()
  .then(() => {
    console.log('[SUCCESS] Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[ERROR] Migration script failed:', error);
    process.exit(1);
  });

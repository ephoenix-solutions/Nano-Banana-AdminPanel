/**
 * CLEANUP SCRIPT: Remove Orphaned Saves from Prompts
 * 
 * This script removes saves from users that no longer exist (hard deleted).
 * Keeps saves from soft-deleted users (isDeleted: true).
 * 
 * HOW TO RUN:
 * node scripts/cleanup-prompt-saves.js
 * 
 * DRY RUN (preview only):
 * node scripts/cleanup-prompt-saves.js --dry-run
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('Firebase Admin initialized with service account');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('Firebase Admin initialized with environment credentials');
    }
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

// Collection names
const PROMPTS_COLLECTION = 'prompt';
const USERS_COLLECTION = 'users';
const SAVES_SUBCOLLECTION = 'saves';

/**
 * Main cleanup function
 */
async function cleanupPromptSaves() {
  console.log('🚀 Starting Prompt Saves Cleanup Script...\n');

  try {
    // Step 1: Get all users (including soft-deleted)
    console.log('📍 Step 1: Fetching all users...');
    const usersSnapshot = await db.collection(USERS_COLLECTION).get();
    const validUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));
    console.log(`✅ Found ${validUserIds.size} users (including soft-deleted)\n`);

    // Step 2: Get all prompts
    console.log('📍 Step 2: Fetching all prompts...');
    const promptsSnapshot = await db.collection(PROMPTS_COLLECTION).get();
    console.log(`✅ Found ${promptsSnapshot.size} prompts\n`);

    // Step 3: Check saves in each prompt
    console.log('📍 Step 3: Checking saves for orphaned users...\n');
    
    let totalPromptsChecked = 0;
    let totalSavesChecked = 0;
    let totalOrphanedSaves = 0;
    let totalSavesRemoved = 0;
    let totalCountsUpdated = 0;

    for (const promptDoc of promptsSnapshot.docs) {
      totalPromptsChecked++;
      const promptId = promptDoc.id;
      const promptData = promptDoc.data();
      
      // Get saves subcollection
      const savesSnapshot = await db
        .collection(PROMPTS_COLLECTION)
        .doc(promptId)
        .collection(SAVES_SUBCOLLECTION)
        .get();
      
      if (savesSnapshot.empty) {
        // Check if savesCount is 0, if not update it
        const storedCount = promptData.savesCount || 0;
        if (storedCount !== 0) {
          console.log(`\n🔧 Prompt: ${promptData.title || promptId}`);
          console.log(`   ⚠️  Count mismatch! Stored: ${storedCount}, Actual: 0`);
          await db.collection(PROMPTS_COLLECTION).doc(promptId).update({
            savesCount: 0
          });
          console.log(`   ✅ Updated savesCount to 0`);
          totalCountsUpdated++;
        }
        continue;
      }

      const orphanedSaves = [];
      
      for (const saveDoc of savesSnapshot.docs) {
        totalSavesChecked++;
        const userId = saveDoc.id;
        
        // Check if user exists
        if (!validUserIds.has(userId)) {
          orphanedSaves.push(userId);
          totalOrphanedSaves++;
        }
      }

      // Remove orphaned saves and update count
      if (orphanedSaves.length > 0) {
        console.log(`\n🔧 Prompt: ${promptData.title || promptId}`);
        console.log(`   - Total saves: ${savesSnapshot.size}`);
        console.log(`   - Orphaned saves: ${orphanedSaves.length}`);
        console.log(`   - Orphaned user IDs: ${orphanedSaves.join(', ')}`);

        for (const userId of orphanedSaves) {
          try {
            await db
              .collection(PROMPTS_COLLECTION)
              .doc(promptId)
              .collection(SAVES_SUBCOLLECTION)
              .doc(userId)
              .delete();
            
            totalSavesRemoved++;
            console.log(`   ✅ Removed save from user: ${userId}`);
          } catch (deleteError) {
            console.error(`   ❌ Failed to remove save from user ${userId}:`, deleteError.message);
          }
        }
        
        // Recalculate and update count if needed
        const actualCount = savesSnapshot.size - orphanedSaves.length;
        const storedCount = promptData.savesCount || 0;
        
        if (actualCount !== storedCount) {
          console.log(`   ⚠️  Count mismatch! Stored: ${storedCount}, Actual: ${actualCount}`);
          await db.collection(PROMPTS_COLLECTION).doc(promptId).update({
            savesCount: actualCount
          });
          console.log(`   ✅ Updated savesCount to ${actualCount}`);
          totalCountsUpdated++;
        }
      } else {
        // No orphaned saves, but check if count matches
        const actualCount = savesSnapshot.size;
        const storedCount = promptData.savesCount || 0;
        
        if (actualCount !== storedCount) {
          console.log(`\n🔧 Prompt: ${promptData.title || promptId}`);
          console.log(`   ⚠️  Count mismatch! Stored: ${storedCount}, Actual: ${actualCount}`);
          await db.collection(PROMPTS_COLLECTION).doc(promptId).update({
            savesCount: actualCount
          });
          console.log(`   ✅ Updated savesCount to ${actualCount}`);
          totalCountsUpdated++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Prompts checked:             ${totalPromptsChecked}`);
    console.log(`Total saves checked:         ${totalSavesChecked}`);
    console.log(`Orphaned saves found:        ${totalOrphanedSaves}`);
    console.log(`Orphaned saves removed:      ${totalSavesRemoved}`);
    console.log(`Counts updated:              ${totalCountsUpdated}`);
    console.log('='.repeat(60));
    console.log('\n✅ Cleanup completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  }
}

/**
 * Dry run - preview only
 */
async function dryRunCleanup() {
  console.log('🔍 DRY RUN MODE - No changes will be made\n');

  try {
    // Get all users
    const usersSnapshot = await db.collection(USERS_COLLECTION).get();
    const validUserIds = new Set(usersSnapshot.docs.map(doc => doc.id));
    console.log(`📊 Found ${validUserIds.size} users (including soft-deleted)\n`);

    // Get all prompts
    const promptsSnapshot = await db.collection(PROMPTS_COLLECTION).get();
    console.log(`📊 Found ${promptsSnapshot.size} prompts\n`);

    let totalSavesChecked = 0;
    let totalOrphanedSaves = 0;
    const promptsWithOrphans = [];

    for (const promptDoc of promptsSnapshot.docs) {
      const promptId = promptDoc.id;
      const promptData = promptDoc.data();
      
      const savesSnapshot = await db
        .collection(PROMPTS_COLLECTION)
        .doc(promptId)
        .collection(SAVES_SUBCOLLECTION)
        .get();
      
      if (savesSnapshot.empty) continue;

      const orphanedSaves = [];
      
      for (const saveDoc of savesSnapshot.docs) {
        totalSavesChecked++;
        const userId = saveDoc.id;
        
        if (!validUserIds.has(userId)) {
          orphanedSaves.push(userId);
          totalOrphanedSaves++;
        }
      }

      if (orphanedSaves.length > 0) {
        promptsWithOrphans.push({
          id: promptId,
          title: promptData.title || 'Untitled',
          totalSaves: savesSnapshot.size,
          orphanedCount: orphanedSaves.length,
          orphanedIds: orphanedSaves
        });
      }
    }

    if (promptsWithOrphans.length > 0) {
      console.log('⚠️  Prompts with orphaned saves:\n');
      
      promptsWithOrphans.forEach(prompt => {
        console.log(`📝 ${prompt.title}`);
        console.log(`   - Total saves: ${prompt.totalSaves}`);
        console.log(`   - Orphaned: ${prompt.orphanedCount}`);
        console.log(`   - User IDs: ${prompt.orphanedIds.join(', ')}\n`);
      });
    }

    console.log('='.repeat(60));
    console.log('📊 DRY RUN SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total saves checked:         ${totalSavesChecked}`);
    console.log(`Orphaned saves found:        ${totalOrphanedSaves}`);
    console.log(`Prompts affected:            ${promptsWithOrphans.length}`);
    console.log('='.repeat(60));
    
    if (totalOrphanedSaves > 0) {
      console.log('\n💡 Run without --dry-run to remove orphaned saves:');
      console.log('   node scripts/cleanup-prompt-saves.js\n');
    } else {
      console.log('\n✅ No orphaned saves found! All saves are valid.\n');
    }

  } catch (error) {
    console.error('\n❌ Error during dry run:', error);
    process.exit(1);
  }
}

// Main execution
const isDryRun = process.argv.includes('--dry-run');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   Prompt Saves Cleanup Script                             ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

if (isDryRun) {
  dryRunCleanup()
    .then(() => {
      console.log('✅ Dry run completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
} else {
  console.log('⚠️  WARNING: This will modify your database!');
  console.log('💡 Run with --dry-run first to preview changes\n');
  
  cleanupPromptSaves()
    .then(() => {
      console.log('✅ Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

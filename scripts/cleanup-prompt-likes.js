/**
 * CLEANUP SCRIPT: Remove Orphaned Likes from Prompts
 * 
 * This script removes likes from users that no longer exist (hard deleted).
 * Keeps likes from soft-deleted users (isDeleted: true).
 * 
 * HOW TO RUN:
 * node scripts/cleanup-prompt-likes.js
 * 
 * DRY RUN (preview only):
 * node scripts/cleanup-prompt-likes.js --dry-run
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
const LIKES_SUBCOLLECTION = 'likes';

/**
 * Main cleanup function
 */
async function cleanupPromptLikes() {
  console.log('🚀 Starting Prompt Likes Cleanup Script...\n');

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

    // Step 3: Check likes in each prompt
    console.log('📍 Step 3: Checking likes for orphaned users...\n');
    
    let totalPromptsChecked = 0;
    let totalLikesChecked = 0;
    let totalOrphanedLikes = 0;
    let totalLikesRemoved = 0;
    let totalCountsUpdated = 0;

    for (const promptDoc of promptsSnapshot.docs) {
      totalPromptsChecked++;
      const promptId = promptDoc.id;
      const promptData = promptDoc.data();
      
      // Get likes subcollection
      const likesSnapshot = await db
        .collection(PROMPTS_COLLECTION)
        .doc(promptId)
        .collection(LIKES_SUBCOLLECTION)
        .get();
      
      if (likesSnapshot.empty) {
        // Check if likesCount is 0, if not update it
        const storedCount = promptData.likesCount || 0;
        if (storedCount !== 0) {
          console.log(`\n🔧 Prompt: ${promptData.title || promptId}`);
          console.log(`   ⚠️  Count mismatch! Stored: ${storedCount}, Actual: 0`);
          await db.collection(PROMPTS_COLLECTION).doc(promptId).update({
            likesCount: 0
          });
          console.log(`   ✅ Updated likesCount to 0`);
          totalCountsUpdated++;
        }
        continue;
      }

      const orphanedLikes = [];
      
      for (const likeDoc of likesSnapshot.docs) {
        totalLikesChecked++;
        const userId = likeDoc.id;
        
        // Check if user exists
        if (!validUserIds.has(userId)) {
          orphanedLikes.push(userId);
          totalOrphanedLikes++;
        }
      }

      // Remove orphaned likes and update count
      if (orphanedLikes.length > 0) {
        console.log(`\n🔧 Prompt: ${promptData.title || promptId}`);
        console.log(`   - Total likes: ${likesSnapshot.size}`);
        console.log(`   - Orphaned likes: ${orphanedLikes.length}`);
        console.log(`   - Orphaned user IDs: ${orphanedLikes.join(', ')}`);

        for (const userId of orphanedLikes) {
          try {
            await db
              .collection(PROMPTS_COLLECTION)
              .doc(promptId)
              .collection(LIKES_SUBCOLLECTION)
              .doc(userId)
              .delete();
            
            totalLikesRemoved++;
            console.log(`   ✅ Removed like from user: ${userId}`);
          } catch (deleteError) {
            console.error(`   ❌ Failed to remove like from user ${userId}:`, deleteError.message);
          }
        }
        
        // Recalculate and update count if needed
        const actualCount = likesSnapshot.size - orphanedLikes.length;
        const storedCount = promptData.likesCount || 0;
        
        if (actualCount !== storedCount) {
          console.log(`   ⚠️  Count mismatch! Stored: ${storedCount}, Actual: ${actualCount}`);
          await db.collection(PROMPTS_COLLECTION).doc(promptId).update({
            likesCount: actualCount
          });
          console.log(`   ✅ Updated likesCount to ${actualCount}`);
          totalCountsUpdated++;
        }
      } else {
        // No orphaned likes, but check if count matches
        const actualCount = likesSnapshot.size;
        const storedCount = promptData.likesCount || 0;
        
        if (actualCount !== storedCount) {
          console.log(`\n🔧 Prompt: ${promptData.title || promptId}`);
          console.log(`   ⚠️  Count mismatch! Stored: ${storedCount}, Actual: ${actualCount}`);
          await db.collection(PROMPTS_COLLECTION).doc(promptId).update({
            likesCount: actualCount
          });
          console.log(`   ✅ Updated likesCount to ${actualCount}`);
          totalCountsUpdated++;
        }
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Prompts checked:             ${totalPromptsChecked}`);
    console.log(`Total likes checked:         ${totalLikesChecked}`);
    console.log(`Orphaned likes found:        ${totalOrphanedLikes}`);
    console.log(`Orphaned likes removed:      ${totalLikesRemoved}`);
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

    let totalLikesChecked = 0;
    let totalOrphanedLikes = 0;
    const promptsWithOrphans = [];

    for (const promptDoc of promptsSnapshot.docs) {
      const promptId = promptDoc.id;
      const promptData = promptDoc.data();
      
      const likesSnapshot = await db
        .collection(PROMPTS_COLLECTION)
        .doc(promptId)
        .collection(LIKES_SUBCOLLECTION)
        .get();
      
      if (likesSnapshot.empty) continue;

      const orphanedLikes = [];
      
      for (const likeDoc of likesSnapshot.docs) {
        totalLikesChecked++;
        const userId = likeDoc.id;
        
        if (!validUserIds.has(userId)) {
          orphanedLikes.push(userId);
          totalOrphanedLikes++;
        }
      }

      if (orphanedLikes.length > 0) {
        promptsWithOrphans.push({
          id: promptId,
          title: promptData.title || 'Untitled',
          totalLikes: likesSnapshot.size,
          orphanedCount: orphanedLikes.length,
          orphanedIds: orphanedLikes
        });
      }
    }

    if (promptsWithOrphans.length > 0) {
      console.log('⚠️  Prompts with orphaned likes:\n');
      
      promptsWithOrphans.forEach(prompt => {
        console.log(`📝 ${prompt.title}`);
        console.log(`   - Total likes: ${prompt.totalLikes}`);
        console.log(`   - Orphaned: ${prompt.orphanedCount}`);
        console.log(`   - User IDs: ${prompt.orphanedIds.join(', ')}\n`);
      });
    }

    console.log('='.repeat(60));
    console.log('📊 DRY RUN SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total likes checked:         ${totalLikesChecked}`);
    console.log(`Orphaned likes found:        ${totalOrphanedLikes}`);
    console.log(`Prompts affected:            ${promptsWithOrphans.length}`);
    console.log('='.repeat(60));
    
    if (totalOrphanedLikes > 0) {
      console.log('\n💡 Run without --dry-run to remove orphaned likes:');
      console.log('   node scripts/cleanup-prompt-likes.js\n');
    } else {
      console.log('\n✅ No orphaned likes found! All likes are valid.\n');
    }

  } catch (error) {
    console.error('\n❌ Error during dry run:', error);
    process.exit(1);
  }
}

// Main execution
const isDryRun = process.argv.includes('--dry-run');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   Prompt Likes Cleanup Script                             ║');
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
  
  cleanupPromptLikes()
    .then(() => {
      console.log('✅ Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

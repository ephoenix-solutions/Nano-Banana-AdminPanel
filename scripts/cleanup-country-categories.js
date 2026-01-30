/**
 * CLEANUP SCRIPT: Remove Invalid Category References from Countries
 * 
 * This script checks all countries and removes category IDs that don't exist or are deleted.
 * 
 * HOW TO RUN:
 * node scripts/cleanup-country-categories.js
 * 
 * DRY RUN (preview only):
 * node scripts/cleanup-country-categories.js --dry-run
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
const COUNTRIES_COLLECTION = 'countries';
const CATEGORIES_COLLECTION = 'categories';

/**
 * Main cleanup function
 */
async function cleanupCountryCategories() {
  console.log('🚀 Starting Country Categories Cleanup Script...\n');

  try {
    // Step 1: Fetch all countries
    console.log('📍 Step 1: Fetching all countries...');
    const countriesSnapshot = await db.collection(COUNTRIES_COLLECTION).get();
    const countries = countriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    console.log(`✅ Found ${countries.length} countries\n`);

    // Step 2: Fetch all active categories
    console.log('📍 Step 2: Fetching all active categories...');
    const categoriesSnapshot = await db.collection(CATEGORIES_COLLECTION)
      .where('isDeleted', '==', false)
      .get();
    
    const validCategoryIds = new Set(categoriesSnapshot.docs.map(doc => doc.id));
    console.log(`✅ Found ${validCategoryIds.size} active categories\n`);

    // Step 3: Check each country
    console.log('📍 Step 3: Checking countries for invalid category references...\n');
    
    let totalCountriesChecked = 0;
    let totalCountriesUpdated = 0;
    let totalCategoriesRemoved = 0;

    for (const country of countries) {
      totalCountriesChecked++;
      
      // Skip if no categories
      if (!country.categories || country.categories.length === 0) {
        console.log(`⏭️  ${country.name} (${country.isoCode}): No categories assigned`);
        continue;
      }

      // Find invalid category IDs
      const invalidCategoryIds = country.categories.filter(
        catId => !validCategoryIds.has(catId)
      );

      // If no invalid categories, skip
      if (invalidCategoryIds.length === 0) {
        console.log(`✅ ${country.name} (${country.isoCode}): All ${country.categories.length} categories are valid`);
        continue;
      }

      // Remove invalid categories
      const cleanedCategories = country.categories.filter(
        catId => validCategoryIds.has(catId)
      );

      console.log(`\n🔧 ${country.name} (${country.isoCode}):`);
      console.log(`   - Original categories: ${country.categories.length}`);
      console.log(`   - Invalid categories found: ${invalidCategoryIds.length}`);
      console.log(`   - Invalid IDs: ${invalidCategoryIds.join(', ')}`);
      console.log(`   - Cleaned categories: ${cleanedCategories.length}`);

      // Update the country
      try {
        await db.collection(COUNTRIES_COLLECTION).doc(country.id).update({
          categories: cleanedCategories,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedBy: 'cleanup-script'
        });

        console.log(`   ✅ Updated successfully!\n`);
        totalCountriesUpdated++;
        totalCategoriesRemoved += invalidCategoryIds.length;
      } catch (updateError) {
        console.error(`   ❌ Failed to update: ${updateError}\n`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total countries checked:     ${totalCountriesChecked}`);
    console.log(`Countries updated:           ${totalCountriesUpdated}`);
    console.log(`Invalid categories removed:  ${totalCategoriesRemoved}`);
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
    // Fetch all countries
    const countriesSnapshot = await db.collection(COUNTRIES_COLLECTION).get();
    const countries = countriesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch all active categories
    const categoriesSnapshot = await db.collection(CATEGORIES_COLLECTION)
      .where('isDeleted', '==', false)
      .get();
    
    const validCategoryIds = new Set(categoriesSnapshot.docs.map(doc => doc.id));

    console.log(`📊 Found ${countries.length} countries`);
    console.log(`📊 Found ${validCategoryIds.size} active categories\n`);

    let issuesFound = 0;
    let totalInvalidRefs = 0;

    for (const country of countries) {
      if (!country.categories || country.categories.length === 0) {
        continue;
      }

      const invalidCategoryIds = country.categories.filter(
        catId => !validCategoryIds.has(catId)
      );

      if (invalidCategoryIds.length > 0) {
        issuesFound++;
        totalInvalidRefs += invalidCategoryIds.length;
        console.log(`\n⚠️  ${country.name} (${country.isoCode}):`);
        console.log(`   - Has ${invalidCategoryIds.length} invalid category references`);
        console.log(`   - Invalid IDs: ${invalidCategoryIds.join(', ')}`);
        console.log(`   - Would be removed in actual run`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 DRY RUN SUMMARY');
    console.log('='.repeat(60));
    console.log(`Countries with issues:       ${issuesFound}`);
    console.log(`Total invalid references:    ${totalInvalidRefs}`);
    console.log('='.repeat(60));
    
    if (issuesFound > 0) {
      console.log('\n💡 Run without --dry-run to apply changes:');
      console.log('   node scripts/cleanup-country-categories.js\n');
    } else {
      console.log('\n✅ No issues found! All countries have valid categories.\n');
    }

  } catch (error) {
    console.error('\n❌ Error during dry run:', error);
    process.exit(1);
  }
}

// Main execution
const isDryRun = process.argv.includes('--dry-run');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   Country Categories Cleanup Script                       ║');
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
  
  cleanupCountryCategories()
    .then(() => {
      console.log('✅ Script completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

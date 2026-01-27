/**
 * TEMPORARY SCRIPT - Add Dummy Device Data with Multiple Accounts
 * 
 * Purpose: Generate and insert realistic device history data for testing
 * Includes multiple accounts on some devices to test device limit feature
 * 
 * Usage:
 * node temp-add-device-data.js
 * 
 * This script will:
 * 1. Generate realistic device data with 1-3 accounts per device
 * 2. Generate realistic login history data for all accounts
 * 3. Automatically insert into Firebase Firestore
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// ============================================
// USER DATA (All Available Users)
// ============================================
const USERS = [
  {
    id: "exrFb9eb5K5VpZw6bUn7",
    name: "Dhvanil Pansuriya",
    email: "dhvanilpansuriya2005@gmail.com",
    role: "user",
    provider: "google",
    language: "en",
    photoURL: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFpMZnvOyb9sdqE7jmOL5PaBa83i0cSuH6Qw&s",
  },
  {
    id: "4soRI3UAg3MSDOovoOjGt6wi2c03",
    name: "Deep Surti",
    email: "deepsurti816@gmail.com",
    role: "user",
    provider: "google",
    language: "en",
    photoURL: "https://lh3.googleusercontent.com/a/ACg8ocJjVJclA-sJYjwpc7npuBCuzcpoMJwYLVbWMVuqxOpGNjZ9wA=s96-c",
  },
  {
    id: "UT4n6EKBUqSf5yzukhawWQIpInx1",
    name: "deep Surti",
    email: "deepsurti23@gmail.com",
    role: "user",
    provider: "google",
    language: "en",
    photoURL: "https://lh3.googleusercontent.com/a/ACg8ocLmPsz_ndStjl2OZzaU8f9m1kziaf0QUxvmNcdRT-9Gv1Eef5t3=s96-c",
  },
  {
    id: "mbPN1LL0TxbHs6xqASaxTi68Hny2",
    name: "Dhvanil Pansuriya",
    email: "dkpansuriya2005@gmail.com",
    role: "user",
    provider: "google",
    language: "en",
    photoURL: "https://lh3.googleusercontent.com/a/ACg8ocIUYFKqP3kGGkPHfeyi8ciscUm3t0Zz1HhdoRtbUWKfA_2xxw=s96-c",
  },
  {
    id: "BZcYgisVN7Qkgn7ZT7JLDI9W68g2",
    name: "Dhvanil Pansuriya",
    email: "dhvanilpansuriya@gmail.com",
    role: "user",
    provider: "google",
    language: "en",
    photoURL: "https://lh3.googleusercontent.com/a/ACg8ocK789yLfiqASkVFwzcILEex8FXVDuX78VvGoo2j1jqGG6udDDk=s96-c",
  },
  {
    id: "g3s79JMXcNZiyEjXIncnsjZPOUJ3",
    name: "Dhvanil Patel",
    email: "dhvanilpatel0907@gmail.com",
    role: "user",
    provider: "google",
    language: "en",
    photoURL: "https://lh3.googleusercontent.com/a/ACg8ocKG0Gh31sCFNPU--s1ySM1sA7O2kuouBSmPkgoiCEnYIPab_g8=s96-c",
  }
];

// Primary user (Dhvanil)
const PRIMARY_USER = USERS[0];

// ============================================
// INITIALIZE FIREBASE ADMIN SDK
// ============================================
if (!admin.apps.length) {
  try {
    const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    
    if (serviceAccountPath) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      console.log('✅ Firebase Admin initialized with service account\n');
    } else {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
      console.log('✅ Firebase Admin initialized with environment credentials\n');
    }
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

// ============================================
// REALISTIC DEVICE CONFIGURATIONS
// ============================================

const DEVICE_CONFIGS = [
  {
    deviceId: "device_iphone14_dhvanil_001",
    deviceInfo: {
      model: "iPhone 14 Pro",
      os: "iOS 17.2",
      appVersion: "1.2.3"
    },
    type: "primary",
    // Only Dhvanil - 1 account
    accountUsers: [USERS[0]]
  },
  {
    deviceId: "device_samsung_dhvanil_002",
    deviceInfo: {
      model: "Samsung Galaxy S23 Ultra",
      os: "Android 14",
      appVersion: "1.2.2"
    },
    type: "secondary",
    // Dhvanil + Deep Surti - 2 accounts
    accountUsers: [USERS[0], USERS[1]]
  },
  {
    deviceId: "device_ipad_dhvanil_003",
    deviceInfo: {
      model: "iPad Pro 12.9-inch",
      os: "iPadOS 17.1",
      appVersion: "1.2.3"
    },
    type: "tablet",
    // Dhvanil + 2 other accounts - 3 accounts (AT LIMIT)
    accountUsers: [USERS[0], USERS[3], USERS[4]]
  },
  {
    deviceId: "device_pixel_dhvanil_004",
    deviceInfo: {
      model: "Google Pixel 8 Pro",
      os: "Android 14",
      appVersion: "1.2.1"
    },
    type: "old",
    // Dhvanil + Deep + Dhvanil Patel - 3 accounts (AT LIMIT)
    accountUsers: [USERS[0], USERS[2], USERS[5]]
  }
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateDeviceDocuments() {
  const now = new Date();
  const devices = [];

  DEVICE_CONFIGS.forEach((config) => {
    let firstLogin, lastLogin;

    // Determine login patterns based on device type
    switch (config.type) {
      case 'primary':
        firstLogin = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000); // 45 days ago
        lastLogin = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago
        break;
      case 'secondary':
        firstLogin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
        lastLogin = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
        break;
      case 'tablet':
        firstLogin = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
        lastLogin = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3 days ago
        break;
      case 'old':
        firstLogin = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days ago
        lastLogin = new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000); // 25 days ago
        break;
    }

    // Build accounts array with different login times for each user
    const accounts = config.accountUsers.map((user, index) => {
      // Stagger the first login times for different users
      const userFirstLogin = new Date(firstLogin.getTime() + (index * 7 * 24 * 60 * 60 * 1000)); // 7 days apart
      const userLastLogin = new Date(lastLogin.getTime() - (index * 2 * 24 * 60 * 60 * 1000)); // 2 days apart
      
      return {
        userId: user.id,
        email: user.email,
        name: user.name,
        photoURL: user.photoURL,
        firstLoginAt: admin.firestore.Timestamp.fromDate(userFirstLogin),
        lastLoginAt: admin.firestore.Timestamp.fromDate(userLastLogin)
      };
    });

    const device = {
      id: config.deviceId,
      deviceId: config.deviceId,
      accountIds: config.accountUsers.map(u => u.id),
      accountCount: config.accountUsers.length,
      accounts: accounts,
      deviceInfo: config.deviceInfo,
      firstLoginAt: admin.firestore.Timestamp.fromDate(firstLogin),
      lastLoginAt: admin.firestore.Timestamp.fromDate(lastLogin),
      createdAt: admin.firestore.Timestamp.fromDate(firstLogin),
      updatedAt: admin.firestore.Timestamp.fromDate(lastLogin)
    };

    devices.push(device);
  });

  return devices;
}

function generateLoginHistory() {
  const now = new Date();
  const allLoginHistory = [];
  let globalLoginId = 1;

  DEVICE_CONFIGS.forEach((config) => {
    // Generate login history for EACH user on this device
    config.accountUsers.forEach((user, userIndex) => {
      let loginDates = [];

      // Generate realistic login dates based on device type
      // Primary user gets more logins, secondary users get fewer
      const loginMultiplier = userIndex === 0 ? 1 : 0.5; // Primary user gets full logins, others get half

      switch (config.type) {
        case 'primary':
          // Daily logins for last 30 days
          for (let i = 0; i < 30 * loginMultiplier; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            const loginsPerDay = Math.floor(Math.random() * 3) + 1;
            for (let j = 0; j < loginsPerDay; j++) {
              const loginTime = new Date(date);
              loginTime.setHours(Math.floor(Math.random() * 24));
              loginTime.setMinutes(Math.floor(Math.random() * 60));
              loginDates.push(loginTime);
            }
          }
          break;

        case 'secondary':
          // Login every 2-3 days
          for (let i = 0; i < 30 * loginMultiplier; i += Math.floor(Math.random() * 2) + 2) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            date.setHours(Math.floor(Math.random() * 24));
            date.setMinutes(Math.floor(Math.random() * 60));
            loginDates.push(date);
          }
          break;

        case 'tablet':
          // Weekend logins
          for (let i = 0; i < 60 * loginMultiplier; i++) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            if (date.getDay() === 0 || date.getDay() === 6) {
              date.setHours(Math.floor(Math.random() * 12) + 10);
              date.setMinutes(Math.floor(Math.random() * 60));
              loginDates.push(date);
            }
          }
          break;

        case 'old':
          // Sporadic logins
          for (let i = 0; i < 90 * loginMultiplier; i += Math.floor(Math.random() * 10) + 5) {
            const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
            date.setHours(Math.floor(Math.random() * 24));
            date.setMinutes(Math.floor(Math.random() * 60));
            loginDates.push(date);
          }
          break;
      }

      // Create login history entries for this user on this device
      loginDates.forEach((loginTime) => {
        const entry = {
          id: `login_${String(globalLoginId).padStart(6, '0')}`,
          userId: user.id, // Track which user this login belongs to
          loginTime: admin.firestore.Timestamp.fromDate(loginTime),
          deviceInfo: config.deviceInfo,
          deviceId: config.deviceId
        };
        allLoginHistory.push(entry);
        globalLoginId++;
      });
    });
  });

  // Sort by login time (most recent first)
  allLoginHistory.sort((a, b) => b.loginTime.toMillis() - a.loginTime.toMillis());

  return allLoginHistory;
}

// ============================================
// INSERT DEVICE DOCUMENTS
// ============================================

async function insertDevices(devices) {
  console.log('━'.repeat(80));
  console.log('INSERTING DEVICES INTO FIRESTORE');
  console.log('━'.repeat(80));
  console.log(`\nTotal devices to insert: ${devices.length}\n`);

  const results = {
    created: 0,
    existing: 0,
    failed: 0
  };

  for (const device of devices) {
    try {
      const deviceRef = db.collection('devices').doc(device.deviceId);
      const deviceDoc = await deviceRef.get();

      if (deviceDoc.exists) {
        console.log(`⚠️  Device already exists: ${device.deviceInfo.model} (${device.accountCount} accounts)`);
        results.existing++;
      } else {
        await deviceRef.set(device);
        console.log(`✅ Device created: ${device.deviceInfo.model} (${device.accountCount} accounts)`);
        console.log(`   Accounts: ${device.accounts.map(a => a.name).join(', ')}`);
        results.created++;
      }
    } catch (error) {
      console.error(`❌ Failed to insert device ${device.deviceId}:`, error.message);
      results.failed++;
    }
  }

  console.log('\n' + '─'.repeat(80));
  console.log('DEVICES SUMMARY:');
  console.log(`  Created: ${results.created}`);
  console.log(`  Already Existed: ${results.existing}`);
  console.log(`  Failed: ${results.failed}`);
  console.log('─'.repeat(80) + '\n');

  return results;
}

// ============================================
// INSERT LOGIN HISTORY
// ============================================

async function insertLoginHistory(loginHistory) {
  console.log('━'.repeat(80));
  console.log('INSERTING LOGIN HISTORY INTO FIRESTORE');
  console.log('━'.repeat(80));
  console.log(`\nTotal login entries to insert: ${loginHistory.length}\n`);

  const results = {
    created: 0,
    existing: 0,
    failed: 0
  };

  // Group by user
  const loginsByUser = {};
  loginHistory.forEach(entry => {
    if (!loginsByUser[entry.userId]) {
      loginsByUser[entry.userId] = [];
    }
    loginsByUser[entry.userId].push(entry);
  });

  console.log('Login entries per user:');
  Object.keys(loginsByUser).forEach(userId => {
    const user = USERS.find(u => u.id === userId);
    console.log(`  ${user.name}: ${loginsByUser[userId].length} logins`);
  });
  console.log('');

  // Insert for each user
  for (const userId of Object.keys(loginsByUser)) {
    const userLogins = loginsByUser[userId];
    const user = USERS.find(u => u.id === userId);
    
    console.log(`Processing ${userLogins.length} logins for ${user.name}...`);

    for (const entry of userLogins) {
      try {
        const loginRef = db
          .collection('users')
          .doc(userId)
          .collection('loginHistory')
          .doc(entry.id);

        const loginDoc = await loginRef.get();

        if (loginDoc.exists) {
          results.existing++;
        } else {
          await loginRef.set({
            loginTime: entry.loginTime,
            deviceInfo: entry.deviceInfo,
            deviceId: entry.deviceId
          });
          results.created++;
        }
      } catch (error) {
        console.error(`❌ Failed to insert login ${entry.id}:`, error.message);
        results.failed++;
      }
    }

    console.log(`  ✅ Completed for ${user.name}`);
  }

  console.log('\n' + '─'.repeat(80));
  console.log('LOGIN HISTORY SUMMARY:');
  console.log(`  Created: ${results.created}`);
  console.log(`  Already Existed: ${results.existing}`);
  console.log(`  Failed: ${results.failed}`);
  console.log('─'.repeat(80) + '\n');

  return results;
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('DEVICE TRACKING SYSTEM - MULTI-ACCOUNT DUMMY DATA');
    console.log('='.repeat(80));
    console.log(`\nPrimary User: ${PRIMARY_USER.name} (${PRIMARY_USER.email})`);
    console.log(`Total Users: ${USERS.length}\n`);

    // Generate data
    console.log('📊 Generating device data with multiple accounts...');
    const devices = generateDeviceDocuments();
    console.log(`   Generated ${devices.length} devices\n`);
    
    console.log('Device Account Distribution:');
    devices.forEach(device => {
      console.log(`  ${device.deviceInfo.model}: ${device.accountCount} account(s)`);
    });
    console.log('');

    console.log('📊 Generating login history data for all users...');
    const loginHistory = generateLoginHistory();
    console.log(`   Generated ${loginHistory.length} login entries\n`);

    // Insert devices
    const deviceResults = await insertDevices(devices);

    // Insert login history
    const loginResults = await insertLoginHistory(loginHistory);

    // Final summary
    console.log('='.repeat(80));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(80));
    console.log('\nDevices:');
    console.log(`  ✅ Created: ${deviceResults.created}`);
    console.log(`  ⚠️  Already Existed: ${deviceResults.existing}`);
    console.log(`  ❌ Failed: ${deviceResults.failed}`);
    console.log('\nLogin History:');
    console.log(`  ✅ Created: ${loginResults.created}`);
    console.log(`  ⚠️  Already Existed: ${loginResults.existing}`);
    console.log(`  ❌ Failed: ${loginResults.failed}`);
    console.log('\n' + '='.repeat(80));
    console.log('DEVICE LIMIT TESTING SCENARIOS');
    console.log('='.repeat(80));
    console.log('\n✅ Device 1 (iPhone): 1 account - UNDER LIMIT');
    console.log('✅ Device 2 (Samsung): 2 accounts - UNDER LIMIT');
    console.log('⚠️  Device 3 (iPad): 3 accounts - AT LIMIT');
    console.log('⚠️  Device 4 (Pixel): 3 accounts - AT LIMIT');
    console.log('\n' + '='.repeat(80));
    console.log('VERIFICATION STEPS');
    console.log('='.repeat(80));
    console.log('\n1. Check devices page:');
    console.log('   http://localhost:3000/devices');
    console.log('\n2. Check each device detail page to see multiple accounts');
    console.log('\n3. Check user details pages:');
    USERS.forEach(user => {
      console.log(`   http://localhost:3000/users/view/${user.id} (${user.name})`);
    });
    console.log('\n4. Try to add 4th account to devices at limit (should fail)');
    console.log('\n' + '='.repeat(80));
    console.log('✅ SCRIPT COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });

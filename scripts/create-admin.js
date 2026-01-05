/**
 * Temporary Script to Create Multiple Admin Users
 * 
 * This script creates multiple admin users in Firestore using Firebase Admin SDK.
 * All users will have the 'admin' role.
 * 
 * Usage:
 * node scripts/create-admin.js
 * 
 * To add more admins, simply add them to the ADMIN_USERS array below.
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

// ============================================
// ADMIN USERS CONFIGURATION
// Add or modify admin users here
// 
// Available fields:
// - email (required): User email address
// - name (required): Full name
// - password (required): Plain text password (will be hashed automatically)
// - language (optional): Language preference (default: 'en')
// - photoURL (optional): Profile photo URL (default: '')
// - provider (optional): Auth provider (default: 'manual')
// - role (optional): User role (default: 'admin')
// ============================================

// Default password for all admin users (change after first login)
const DEFAULT_PASSWORD = 'password123';

const ADMIN_USERS = [
  {
    email: 'dhvanil@nanobanana.com',
    name: 'Dhvanil Pansuriya',
    password: DEFAULT_PASSWORD,
    language: 'en',
    photoURL: '',
    provider: 'manual',
    role: 'admin',
  },
  {
    email: 'deep@nanobanana.com',
    name: 'Deep Surti',
    password: DEFAULT_PASSWORD,
    language: 'en',
    photoURL: '',
    provider: 'manual',
    role: 'admin',
  },
  {
    email: 'hardik@nanobanana.com',
    name: 'Hardik Ramoliya',
    password: DEFAULT_PASSWORD,
    language: 'en',
    photoURL: '',
    provider: 'manual',
    role: 'admin',
  },
  {
    email: 'nikit@nanobanana.com',
    name: 'Nikit',
    password: DEFAULT_PASSWORD,
    language: 'en',
    photoURL: '',
    provider: 'manual',
    role: 'admin',
  },
  {
    email: 'viral@nanobanana.com',
    name: 'Viral',
    password: DEFAULT_PASSWORD,
    language: 'en',
    photoURL: '',
    provider: 'manual',
    role: 'admin',
  },
];
// ============================================

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

async function createAdminUser(adminUser) {
  try {
    const usersRef = db.collection('users');
    
    // Check if admin user already exists
    const querySnapshot = await usersRef.where('email', '==', adminUser.email).get();

    if (!querySnapshot.empty) {
      const existingUserDoc = querySnapshot.docs[0];
      const existingUser = { id: existingUserDoc.id, ...existingUserDoc.data() };
      
      // Update password if user exists but doesn't have a password
      if (!existingUser.password && adminUser.password) {
        const hashedPassword = bcrypt.hashSync(adminUser.password, 10);
        await usersRef.doc(existingUserDoc.id).update({ password: hashedPassword });
        console.log('User password updated');
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   Email:', existingUser.email);
        console.log('   Name:', existingUser.name);
        console.log('   Role:', existingUser.role);
        console.log('   Password: Updated (was missing)');
        console.log('   User ID:', existingUser.id);
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return { exists: true, updated: true, email: adminUser.email, id: existingUser.id };
      }
      
      console.log(' User already exists');
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   Email:', existingUser.email);
      console.log('   Name:', existingUser.name);
      console.log('   Role:', existingUser.role);
      console.log('   Password:', existingUser.password ? 'Set' : 'Not Set');
      console.log('   User ID:', existingUser.id);
      console.log('   Language:', existingUser.language);
      console.log('   Provider:', existingUser.provider);
      if (existingUser.createdAt) {
        console.log('   Created:', existingUser.createdAt.toDate().toLocaleString());
      }
      if (existingUser.lastLogin) {
        console.log('   Last Login:', existingUser.lastLogin.toDate().toLocaleString());
      }
      if (existingUser.photoURL) {
        console.log('    Photo URL:', existingUser.photoURL);
      }
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      return { exists: true, email: adminUser.email, id: existingUser.id, data: existingUser };
    }

    // Hash password before storing
    const hashedPassword = bcrypt.hashSync(adminUser.password, 10);

    // Create admin user with all fields from User interface
    const adminData = {
      email: adminUser.email,
      name: adminUser.name,
      password: hashedPassword,
      role: adminUser.role || 'admin',
      provider: adminUser.provider || 'manual',
      language: adminUser.language || 'en',
      photoURL: adminUser.photoURL || '',
      createdAt: admin.firestore.Timestamp.now(),
      lastLogin: admin.firestore.Timestamp.now(),
    };

    const docRef = await usersRef.add(adminData);
    console.log('User created successfully');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   Email:', adminData.email);
    console.log('   Name:', adminData.name);
    console.log('   Role:', adminData.role);
    console.log('   Password: Set (hashed)');
    console.log('   User ID:', docRef.id);
    console.log('   Language:', adminData.language);
    console.log('   Provider:', adminData.provider);
    console.log('   Created:', adminData.createdAt.toDate().toLocaleString());
    console.log('   Last Login:', adminData.lastLogin.toDate().toLocaleString());
    if (adminData.photoURL) {
      console.log('    Photo URL:', adminData.photoURL);
    }
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { exists: false, email: adminUser.email, id: docRef.id, data: adminData };

  } catch (error) {
    console.error('Error creating user:', adminUser.email);
    console.error('   Error:', error.message);
    return { exists: false, email: adminUser.email, error: error.message };
  }
}

async function createAllAdmins() {
  try {
    console.log('Starting admin users creation...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`Total admins to create: ${ADMIN_USERS.length}\n`);

    const results = [];
    
    for (const adminUser of ADMIN_USERS) {
      const result = await createAdminUser(adminUser);
      results.push(result);
      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const created = results.filter(r => !r.exists && !r.error);
    const existing = results.filter(r => r.exists);
    const failed = results.filter(r => r.error);
    const updated = results.filter(r => r.updated);
    
    console.log(`Created: ${created.length}`);
    console.log(`Updated (password added): ${updated.length}`);
    console.log(` Already existed: ${existing.length - updated.length}`);
    console.log(`Failed: ${failed.length}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n Login Instructions:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Use any of the admin emails above');
    console.log(`3. Password: ${DEFAULT_PASSWORD}`);
    console.log('\n IMPORTANT SECURITY NOTES:');
    console.log('   Passwords are now properly hashed using bcrypt');
    console.log('   Password validation is enabled');
    console.log('   Wrong passwords will be rejected');
    console.log(`   Default password for all admins: ${DEFAULT_PASSWORD}`);
    console.log('   Please change your password after first login\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('Error in admin creation process:', error);
    process.exit(1);
  }
}

// Run the script
createAllAdmins()
  .then(() => {
    console.log('Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });

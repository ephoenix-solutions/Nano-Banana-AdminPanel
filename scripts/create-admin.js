/**
 * Temporary Script to Create Multiple Admin Users
 * 
 * This script creates multiple admin users in Firestore.
 * All users will have the 'admin' role.
 * 
 * Usage:
 * node scripts/create-admin.js
 * 
 * To add more admins, simply add them to the ADMIN_USERS array below.
 */

require('dotenv').config({ path: '.env.local' });
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp, query, where, getDocs, updateDoc, doc } = require('firebase/firestore');
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
];
// ============================================

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function createAdminUser(adminUser) {
  try {
    const usersRef = collection(db, 'users');
    
    // Check if admin user already exists
    const q = query(usersRef, where('email', '==', adminUser.email));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const existingUser = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
      
      // Update password if user exists but doesn't have a password
      if (!existingUser.password && adminUser.password) {
        const hashedPassword = bcrypt.hashSync(adminUser.password, 10);
        const userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
        await updateDoc(userDocRef, { password: hashedPassword });
        console.log('✅ User password updated');
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('   📧 Email:', existingUser.email);
        console.log('   👤 Name:', existingUser.name);
        console.log('   🔑 Role:', existingUser.role);
        console.log('   🔐 Password: Updated (was missing)');
        console.log('   🆔 User ID:', existingUser.id);
        console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        return { exists: true, updated: true, email: adminUser.email, id: existingUser.id };
      }
      
      console.log('⚠️  User already exists');
      console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('   📧 Email:', existingUser.email);
      console.log('   👤 Name:', existingUser.name);
      console.log('   🔑 Role:', existingUser.role);
      console.log('   🔐 Password:', existingUser.password ? 'Set' : 'Not Set');
      console.log('   🆔 User ID:', existingUser.id);
      console.log('   🌐 Language:', existingUser.language);
      console.log('   🔗 Provider:', existingUser.provider);
      console.log('   📅 Created:', existingUser.createdAt?.toDate().toLocaleString() || 'N/A');
      console.log('   🕐 Last Login:', existingUser.lastLogin?.toDate().toLocaleString() || 'N/A');
      if (existingUser.photoURL) {
        console.log('   🖼️  Photo URL:', existingUser.photoURL);
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
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
    };

    const docRef = await addDoc(usersRef, adminData);
    console.log('✅ User created successfully');
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('   📧 Email:', adminData.email);
    console.log('   👤 Name:', adminData.name);
    console.log('   🔑 Role:', adminData.role);
    console.log('   🔐 Password: Set (hashed)');
    console.log('   🆔 User ID:', docRef.id);
    console.log('   🌐 Language:', adminData.language);
    console.log('   🔗 Provider:', adminData.provider);
    console.log('   📅 Created:', adminData.createdAt.toDate().toLocaleString());
    console.log('   🕐 Last Login:', adminData.lastLogin.toDate().toLocaleString());
    if (adminData.photoURL) {
      console.log('   🖼️  Photo URL:', adminData.photoURL);
    }
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return { exists: false, email: adminUser.email, id: docRef.id, data: adminData };

  } catch (error) {
    console.error('❌ Error creating user:', adminUser.email);
    console.error('   Error:', error.message);
    return { exists: false, email: adminUser.email, error: error.message };
  }
}

async function createAllAdmins() {
  try {
    console.log('🚀 Starting admin users creation...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📋 Total admins to create: ${ADMIN_USERS.length}\n`);

    const results = [];
    
    for (const adminUser of ADMIN_USERS) {
      const result = await createAdminUser(adminUser);
      results.push(result);
      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const created = results.filter(r => !r.exists && !r.error);
    const existing = results.filter(r => r.exists);
    const failed = results.filter(r => r.error);

    const updated = results.filter(r => r.updated);
    
    console.log(`✅ Created: ${created.length}`);
    console.log(`🔄 Updated (password added): ${updated.length}`);
    console.log(`⚠️  Already existed: ${existing.length - updated.length}`);
    console.log(`❌ Failed: ${failed.length}`);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 LOGIN CREDENTIALS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📝 Login Instructions:');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Use any of the admin emails above');
    console.log(`3. Password: ${DEFAULT_PASSWORD}`);
    console.log('\n⚠️  IMPORTANT SECURITY NOTES:');
    console.log('   ✅ Passwords are now properly hashed using bcrypt');
    console.log('   ✅ Password validation is enabled');
    console.log('   ✅ Wrong passwords will be rejected');
    console.log(`   🔑 Default password for all admins: ${DEFAULT_PASSWORD}`);
    console.log('   ⚠️  Please change your password after first login\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('❌ Error in admin creation process:', error);
    process.exit(1);
  }
}

// Run the script
createAllAdmins()
  .then(() => {
    console.log('✨ Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });

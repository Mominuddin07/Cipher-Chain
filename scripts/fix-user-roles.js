const admin = require('firebase-admin');
const path = require('path');

// Try to load service account key
let serviceAccount;
try {
  // Try root directory first
  serviceAccount = require('../serviceAccountKey.json');
} catch (e) {
  try {
    // Try scripts directory
    serviceAccount = require('./serviceAccountKey.json');
  } catch (e2) {
    console.error('❌ Error: serviceAccountKey.json not found!'); 
    console.error('   Please download it from Firebase Console → Project Settings → Service Accounts');
    process.exit(1);
  }
}

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Set user role by email
 */
async function setUserRole(userEmail, role) {
  try {
    const user = await admin.auth().getUserByEmail(userEmail);
    await admin.auth().setCustomUserClaims(user.uid, { role: role });
    console.log(`✅ Set role "${role}" for ${userEmail}`);
    console.log(`   ⚠️  User must sign out and sign back in!`);
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.error(`❌ User not found: ${userEmail}`);
    } else {
      console.error(`❌ Error: ${error.message}`);
    }
  }
}

/**
 * List all users and their roles
 */
async function listAllUsers() {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    console.log('\n📋 All Users and Roles:\n');
    console.log('='.repeat(60));
    
    listUsersResult.users.forEach((userRecord) => {
      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'not set (defaults to user)';
      const email = userRecord.email || 'no email';
      console.log(`Email: ${email}`);
      console.log(`  UID: ${userRecord.uid}`);
      console.log(`  Role: ${role}`);
      console.log('-'.repeat(60));
    });
    
    console.log(`\nTotal users: ${listUsersResult.users.length}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Fix all users - set non-admin users to 'user' role
 */
async function fixAllUsers() {
  try {
    console.log('🔍 Checking all users...\n');
    const listUsersResult = await admin.auth().listUsers(1000);
    let fixed = 0;
    let kept = 0;
    
    for (const userRecord of listUsersResult.users) {
      const customClaims = userRecord.customClaims || {};
      const currentRole = customClaims.role;
      const email = userRecord.email || userRecord.uid;
      
      // If role is not explicitly 'admin', set it to 'user'
      if (currentRole !== 'admin') {
        await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'user' });
        console.log(`✅ Fixed: ${email} → user (was: ${currentRole || 'not set'})`);
        fixed++;
      } else {
        console.log(`ℹ️  Admin: ${email} (keeping admin)`);
        kept++;
      }
    }
    
    console.log(`\n✅ Summary:`);
    console.log(`   Fixed: ${fixed} users`);
    console.log(`   Kept as admin: ${kept} users`);
    console.log(`\n⚠️  IMPORTANT: All users must sign out and sign back in for changes to take effect!`);
  } catch (error) {
    console.error('Error:', error);
  }
}

/**
 * Remove admin role from a specific user
 */
async function removeAdminRole(userEmail) {
  await setUserRole(userEmail, 'user');
}

// Run the script
async function main() {
  const command = process.argv[2];
  const email = process.argv[3];
  const role = process.argv[4];
  
  if (command === 'list') {
    await listAllUsers();
  } else if (command === 'set' && email && role) {
    if (role !== 'admin' && role !== 'user') {
      console.error('❌ Role must be "admin" or "user"');
      process.exit(1);
    }
    await setUserRole(email, role);
  } else if (command === 'fix-all') {
    await fixAllUsers();
  } else if (command === 'remove-admin' && email) {
    await removeAdminRole(email);
  } else {
    console.log(`
🔧 User Role Management Script

Usage:
  node scripts/fix-user-roles.js list                    - List all users and their roles
  node scripts/fix-user-roles.js set <email> <role>      - Set user role (admin/user)
  node scripts/fix-user-roles.js fix-all                 - Fix all non-admin users (set to 'user')
  node scripts/fix-user-roles.js remove-admin <email>    - Remove admin role from user

Examples:
  node scripts/fix-user-roles.js list
  node scripts/fix-user-roles.js set user@example.com user
  node scripts/fix-user-roles.js set admin@example.com admin
  node scripts/fix-user-roles.js fix-all
  node scripts/fix-user-roles.js remove-admin user@example.com
    `);
  }
  
  process.exit(0);
}

main();


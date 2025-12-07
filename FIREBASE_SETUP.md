# Firebase Setup Guide for RBAC

## Setting Up Custom Claims (User Roles)

To properly set user roles in Firebase, you need to use the Firebase Admin SDK. Here's how:

### 1. Install Firebase Admin SDK

```bash
npm install firebase-admin
```

### 2. Create a Script to Set User Roles

Create a file `scripts/set-user-role.js`:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path-to-your-service-account-key.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * Set user role by email
 * @param {string} userEmail - User's email address
 * @param {string} role - Role to assign ('admin' or 'user')
 */
async function setUserRole(userEmail, role) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(userEmail);
    
    // Set custom claims
    await admin.auth().setCustomUserClaims(user.uid, {
      role: role
    });
    
    console.log(`✅ Successfully set role "${role}" for ${userEmail}`);
    console.log(`   User UID: ${user.uid}`);
    
    // Note: User needs to sign out and sign back in for changes to take effect
    console.log(`⚠️  User must sign out and sign back in for changes to take effect`);
    
  } catch (error) {
    console.error(`❌ Error setting role for ${userEmail}:`, error.message);
  }
}

/**
 * Remove admin role from a user (set to 'user')
 */
async function removeAdminRole(userEmail) {
  await setUserRole(userEmail, 'user');
}

/**
 * List all users and their roles
 */
async function listAllUsers() {
  try {
    const listUsersResult = await admin.auth().listUsers(1000);
    
    console.log('\n📋 All Users and Their Roles:');
    console.log('=' .repeat(60));
    
    listUsersResult.users.forEach((userRecord) => {
      const customClaims = userRecord.customClaims || {};
      const role = customClaims.role || 'not set (defaults to user)';
      const email = userRecord.email || 'no email';
      
      console.log(`Email: ${email}`);
      console.log(`  UID: ${userRecord.uid}`);
      console.log(`  Role: ${role}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error listing users:', error);
  }
}

// Example usage:
// setUserRole('admin@example.com', 'admin');
// setUserRole('user@example.com', 'user');
// removeAdminRole('user@example.com');
// listAllUsers();

// Export functions for use in other scripts
module.exports = { setUserRole, removeAdminRole, listAllUsers };
```

### 3. Get Service Account Key

1. Go to Firebase Console
2. Project Settings → Service Accounts
3. Click "Generate New Private Key"
4. Save the JSON file securely (don't commit to git!)

### 4. Usage Examples

```javascript
const { setUserRole, removeAdminRole, listAllUsers } = require('./scripts/set-user-role');

// Set a user as admin
await setUserRole('admin@yourdomain.com', 'admin');

// Set a user as regular user
await setUserRole('user@yourdomain.com', 'user');

// Remove admin role (set to user)
await removeAdminRole('admin@yourdomain.com');

// List all users
await listAllUsers();
```

### 5. Important Notes

⚠️ **After setting custom claims, users must:**
- Sign out completely
- Sign back in
- The new role will be in their token

This is because Firebase tokens are cached. The `getIdTokenResult(true)` with `true` parameter forces a refresh, but it's still best practice to have users sign out/in.

## Deploying Firestore Rules

1. Copy the contents of `firestore.rules`
2. Go to Firebase Console → Firestore Database → Rules
3. Paste the rules
4. Click "Publish"

## Testing the Rules

### Test Admin Access
```javascript
// In your app, check if user is admin:
const token = await getIdTokenResult(user, true);
const isAdmin = token.claims.role === 'admin';
```

### Test in Firebase Console
1. Go to Firestore Database
2. Try to read/write documents
3. Rules will be enforced automatically

## Troubleshooting

### User still shows wrong role?
1. Make sure custom claims are set correctly
2. User must sign out and sign back in
3. Check browser console for token claims:
   ```javascript
   const user = auth.currentUser;
   const token = await user.getIdTokenResult(true);
   console.log('Role:', token.claims.role);
   ```

### Rules not working?
1. Make sure rules are deployed
2. Check Firebase Console for rule errors
3. Verify user is authenticated
4. Check custom claims are set correctly


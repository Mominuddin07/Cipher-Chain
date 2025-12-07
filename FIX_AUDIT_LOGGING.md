# 🔧 Fix Audit Logging Issue - Step by Step Guide

## Problem
Audit logs are showing incorrect roles (e.g., regular users showing as "admin").

## Root Cause
Firebase Custom Claims are not set correctly, or users haven't refreshed their authentication tokens.

---

## ✅ Step-by-Step Fix

### Step 1: Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the **⚙️ Settings** icon → **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save the file as `serviceAccountKey.json` in your project root directory:
   ```
   C:\Users\malii\OneDrive\Desktop\investment-insights-main\serviceAccountKey.json
   ```

⚠️ **IMPORTANT**: Add `serviceAccountKey.json` to `.gitignore` (already done) - **NEVER commit this file to Git!**

---

### Step 2: Check Current User Roles

Run this command to see all users and their current roles:

```bash
node scripts/fix-user-roles.js list
```

This will show you:
- All users in your Firebase project
- Their current roles (admin/user/not set)

**Example output:**
```
Email: maliik7x9@gmail.com
  UID: abc123...
  Role: admin
---
Email: user@example.com
  UID: def456...
  Role: not set (defaults to user)
```

---

### Step 3: Fix All User Roles

If you see users with incorrect roles, run:

```bash
node scripts/fix-user-roles.js fix-all
```

This will:
- ✅ Set all non-admin users to `"user"` role
- ✅ Keep existing admins as `"admin"`
- ⚠️ **Users must sign out and sign back in** for changes to take effect!

---

### Step 4: Set Specific User Roles (Optional)

If you need to manually set a role:

```bash
# Set a user as admin
node scripts/fix-user-roles.js set user@example.com admin

# Set a user as regular user
node scripts/fix-user-roles.js set user@example.com user

# Remove admin role from a user
node scripts/fix-user-roles.js remove-admin user@example.com
```

---

### Step 5: Deploy Firestore Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** → **Rules** tab
4. Copy the contents of `firestore.rules` file
5. Paste into the rules editor
6. Click **Publish**

**OR** use Firebase CLI:
```bash
firebase deploy --only firestore:rules
```

---

### Step 6: Force Users to Sign Out and Sign Back In

**This is CRITICAL!** Firebase tokens are cached. Users must:

1. **Sign out** from the app
2. **Sign back in** to get a fresh token with updated custom claims

The updated `audit.js` code will now:
- ✅ Force refresh tokens (`getIdTokenResult(true)`)
- ✅ Explicitly check for "admin" role
- ✅ Default to "user" for any other value
- ✅ Log debug info in development mode

---

### Step 7: Verify the Fix

1. **Sign out** from your app
2. **Sign back in** with a regular user account (not admin)
3. Perform some actions (login, view dashboard, etc.)
4. Check the **Admin Panel → Audit Logs**
5. Verify the role shows as **"user"** (not "admin")

---

## 🔍 Debugging

### Check Browser Console

In development mode, the audit logging will show debug info:
```
[Audit] User: user@example.com, Raw Role: undefined, Final Role: user, Action: auth_sign_in_email
[Audit] User: admin@example.com, Raw Role: admin, Final Role: admin, Action: auth_sign_in_admin_google
```

### Check Firebase Custom Claims

You can verify custom claims in Firebase Console:
1. Go to **Authentication** → **Users**
2. Click on a user
3. Check **Custom claims** section

---

## 📋 Quick Checklist

- [ ] Downloaded `serviceAccountKey.json` to project root
- [ ] Ran `node scripts/fix-user-roles.js list` to check roles
- [ ] Ran `node scripts/fix-user-roles.js fix-all` to fix roles
- [ ] Deployed updated `firestore.rules` to Firebase
- [ ] Signed out and signed back in to refresh tokens
- [ ] Verified audit logs show correct roles

---

## 🚨 Common Issues

### Issue: "serviceAccountKey.json not found"
**Solution**: Download it from Firebase Console (Step 1)

### Issue: Users still showing as "admin" in logs
**Solution**: 
1. Make sure you ran `fix-all` script
2. **Users must sign out and sign back in!**
3. Check browser console for debug logs

### Issue: "Permission denied" in Firestore
**Solution**: Deploy the updated `firestore.rules` (Step 5)

---

## 📞 Need Help?

If issues persist:
1. Check browser console for errors
2. Check Firebase Console → Firestore → Rules for deployment status
3. Verify `serviceAccountKey.json` is in the correct location
4. Make sure all users have signed out and signed back in


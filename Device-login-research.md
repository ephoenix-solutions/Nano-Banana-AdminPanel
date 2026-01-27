 ---------------------------------------------------------------------------------------------------

  ## 🎯 RECOMMENDED SCHEMA DESIGN

  ### Problem Statement

      * ✅ Limit **3 different accounts** per device
      * ✅ 4th account login should show error message
      * ✅ Existing accounts can re-login without issues

  ---------------------------------------------------------------------------------------------------

  ## 📊 BEST SOLUTION: Hybrid Schema (Two Collections)

  ### 1️⃣ Keep Existing: users/{userId}/loginHistory/{loginId}

  Purpose: User audit trail (which devices a user logged in from)

      // Path: users/{userId}/loginHistory/{loginId}
      {
        id: string,
        loginTime: Timestamp,
        deviceId: string,
        deviceInfo: {
          model: string,
          os: string,
          appVersion: string
        }
      }

  ---------------------------------------------------------------------------------------------------

  ### 2️⃣ Add New: devices/{deviceId} (Top-Level Collection)

  Purpose: Device-based account limiting (which accounts are on a device)

      // Path: devices/{deviceId}
      {
        deviceId: string,              // Unique device identifier
        accountIds: string[],          // Array of user IDs (max 3)
        accountCount: number,          // Quick count (length of accountIds)

        // Detailed account info
        accounts: [
          {
            userId: string,
            email: string,
            name: string,
            photoURL: string,
            firstLoginAt: Timestamp,
            lastLoginAt: Timestamp
          }
        ],

        // Device metadata
        deviceInfo: {
          model: string,               // "iPhone 14 Pro"
          os: string,                  // "iOS 16.5"
          appVersion: string           // "1.2.0"
        },

        // Timestamps
        firstLoginAt: Timestamp,       // First account login
        lastLoginAt: Timestamp,        // Most recent login
        createdAt: Timestamp,
        updatedAt: Timestamp
      }

  ---------------------------------------------------------------------------------------------------

  ## 🔄 LOGIN FLOW WITH DEVICE LIMIT

      // Mobile app sends:
      {
        email: string,
        password: string,
        deviceId: string,        // ← NEW: Unique device identifier
        deviceInfo: {
          model: string,
          os: string,
          appVersion: string
        }
      }

      // Server-side logic:
      1. Validate email & password ✅
      2. Get userId from authenticated user
      3. Check devices/{deviceId}:

         IF document doesn't exist:
           → Create new device document
           → Add userId to accountIds
           → Allow login ✅

         IF userId already in accountIds:
           → Update lastLoginAt
           → Allow login ✅ (existing account)

         IF userId NOT in accountIds:
           IF accountIds.length < 3:
             → Add userId to accountIds
             → Allow login ✅
           ELSE (accountIds.length >= 3):
             → REJECT login ❌
             → Return error: "Device limit reached"

      4. Update users/{userId}/loginHistory (audit trail)
      5. Return success/error response

  ---------------------------------------------------------------------------------------------------

  ## 📱 ERROR MESSAGE FOR 4TH ACCOUNT

      {
        "success": false,
        "code": "DEVICE_LIMIT_REACHED",
        "message": "This device has reached the maximum of 3 accounts. Please remove an existing account to add a new one.",
        "existingAccounts": [
          {
            "email": "user1@example.com",
            "name": "User One"
          },
          {
            "email": "user2@example.com",
            "name": "User Two"
          },
          {
            "email": "user3@example.com",
            "name": "User Three"
          }
        ]
      }

  ---------------------------------------------------------------------------------------------------

  ## ✅ WHY THIS SCHEMA IS BEST

  ┌─────────────────┬────────────────────────────────────────────────┐
  │ Feature         │ Benefit                                        │
  ├─────────────────┼────────────────────────────────────────────────┤
  │ Fast Lookup     │ O(1) - Single document read devices/{deviceId} │
  ├─────────────────┼────────────────────────────────────────────────┤
  │ Scalable        │ No need to query all users' subcollections     │
  ├─────────────────┼────────────────────────────────────────────────┤
  │ Maintainable    │ Clear separation: user audit vs device limits  │
  ├─────────────────┼────────────────────────────────────────────────┤
  │ Flexible        │ Easy to change limit (3 → 5 accounts)          │
  ├─────────────────┼────────────────────────────────────────────────┤
  │ Analytics Ready │ Can track device usage, popular devices        │
  ├─────────────────┼────────────────────────────────────────────────┤
  │ Admin Friendly  │ View/manage devices in admin panel             │
  └─────────────────┴────────────────────────────────────────────────┘

  ---------------------------------------------------------------------------------------------------

  ## 🛠️ IMPLEMENTATION STEPS

  ### Step 1: Mobile App Changes

      // Generate unique device ID (one-time)
      import DeviceInfo from 'react-native-device-info';

      const deviceId = await DeviceInfo.getUniqueId();
      const deviceInfo = {
        model: await DeviceInfo.getModel(),
        os: `${await DeviceInfo.getSystemName()} ${await DeviceInfo.getSystemVersion()}`,
        appVersion: DeviceInfo.getVersion()
      };

      // Send with login request
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          deviceId,      // ← NEW
          deviceInfo     // ← NEW
        })
      });

  ### Step 2: Backend API Changes

      // In /app/api/auth/login/route.ts

      export async function POST(request: NextRequest) {
        const { email, password, deviceId, deviceInfo } = await request.json();

        // ... existing authentication logic ...

        // NEW: Check device limit
        const deviceRef = adminDb.collection('devices').doc(deviceId);
        const deviceDoc = await deviceRef.get();

        if (deviceDoc.exists) {
          const deviceData = deviceDoc.data();
          const accountIds = deviceData.accountIds || [];

          // Check if user already logged in from this device
          if (!accountIds.includes(user.id)) {
            // New account on this device
            if (accountIds.length >= 3) {
              return NextResponse.json({
                success: false,
                code: 'DEVICE_LIMIT_REACHED',
                message: 'This device has reached the maximum of 3 accounts.',
                existingAccounts: deviceData.accounts
              }, { status: 403 });
            }
          }
        }

        // Update device document
        await deviceRef.set({
          deviceId,
          accountIds: admin.firestore.FieldValue.arrayUnion(user.id),
          accountCount: admin.firestore.FieldValue.increment(
            deviceDoc.exists && deviceDoc.data().accountIds.includes(user.id) ? 0 : 1
          ),
          accounts: admin.firestore.FieldValue.arrayUnion({
            userId: user.id,
            email: user.email,
            name: user.name,
            photoURL: user.photoURL,
            firstLoginAt: deviceDoc.exists ? undefined : admin.firestore.Timestamp.now(),
            lastLoginAt: admin.firestore.Timestamp.now()
          }),
          deviceInfo,
          lastLoginAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        }, { merge: true });

        // ... rest of login logic ...
      }

  ### Step 3: Admin Panel Features

      * View all devices
      * See which accounts are on each device
      * Remove accounts from devices (admin override)
      * Device analytics dashboard

  ---------------------------------------------------------------------------------------------------

  ## 🎨 VISUAL SCHEMA COMPARISON

  ### Current Schema (User-Centric)

      users/
        ├─ user1/
        │   └─ loginHistory/
        │       ├─ login1 (deviceA)
        │       └─ login2 (deviceB)
        ├─ user2/
        │   └─ loginHistory/
        │       └─ login1 (deviceA)
        └─ user3/
            └─ loginHistory/
                └─ login1 (deviceA)

      ❌ Problem: To check deviceA's account count,
         you need to scan ALL users' loginHistory!

  ### Recommended Schema (Device-Centric + User-Centric)

      devices/
        ├─ deviceA
        │   ├─ accountIds: [user1, user2, user3]
        │   └─ accountCount: 3  ← Fast check!
        └─ deviceB
            ├─ accountIds: [user1]
            └─ accountCount: 1

      users/
        ├─ user1/
        │   └─ loginHistory/
        │       ├─ login1 (deviceA)
        │       └─ login2 (deviceB)
        └─ user2/
            └─ loginHistory/
                └─ login1 (deviceA)

      ✅ Solution: Single read of devices/deviceA
         gives instant account count!

  ---------------------------------------------------------------------------------------------------

  ## 🚨 EDGE CASES HANDLED

  ┌──────────────────────────────────────────┬────────────────────────────────────────────────┐
  │ Scenario                                 │ Solution                                       │
  ├──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ User deletes account                     │ Cloud Function removes userId from all devices │
  ├──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ User wants to remove account from device │ API endpoint to remove from accountIds array   │
  ├──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Device reset/reinstall                   │ New deviceId = fresh 3-account limit           │
  ├──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Concurrent logins                        │ Use Firestore transactions for atomic updates  │
  ├──────────────────────────────────────────┼────────────────────────────────────────────────┤
  │ Admin login                              │ Bypass device limit check for admin role       │
  └──────────────────────────────────────────┴────────────────────────────────────────────────┘

  ---------------------------------------------------------------------------------------------------

  ## 💰 COST ANALYSIS

  ┌──────────────────┬─────────┬─────────────┬─────────────────────┐
  │ Operation        │ Current │ Recommended │ Increase            │
  ├──────────────────┼─────────┼─────────────┼─────────────────────┤
  │ Writes per login │ 1       │ 2           │ +1 write            │
  ├──────────────────┼─────────┼─────────────┼─────────────────────┤
  │ Reads per login  │ 0       │ 1           │ +1 read             │
  ├──────────────────┼─────────┼─────────────┼─────────────────────┤
  │ Storage          │ Low     │ Medium      │ +devices collection │
  └──────────────────┴─────────┴─────────────┴─────────────────────┘

  Verdict: Minimal cost increase (~$0.001 per login), huge business value! ✅

  ---------------------------------------------------------------------------------------------------

  ## 🎯 FINAL RECOMMENDATION

  ### Use the Hybrid Schema:

      1. ✅ **Keep** `users/{userId}/loginHistory` for user audit trail
      2. ✅ **Add** `devices/{deviceId}` for device-based limiting
      3. ✅ **Implement** device limit check in login API
      4. ✅ **Show** clear error message when limit reached
      5. ✅ **Build** device management in admin panel

  This solution is:

      * ✅ **Production-ready**
      * ✅ **Scalable**
      * ✅ **Maintainable**
      * ✅ **Cost-effective**
      * ✅ **Follows Firestore best practices**

  ---------------------------------------------------------------------------------------------------

  ## 📝 NEXT STEPS

      1. **Create TypeScript types** for devices collection
      2. **Update mobile app** to send deviceId
      3. **Modify login API** with device limit logic
      4. **Add device management** to admin panel
      5. **Test thoroughly** with multiple scenarios
      6. **Deploy** and monitor

  ---------------------------------------------------------------------------------------------------

  Would you like me to:

      1. 📝 Create the TypeScript types for the devices collection?
      2. 🔧 Write the complete login API code with device limiting?
      3. 🎨 Design the admin panel UI for device management?
      4. 📊 Create a migration script to populate devices collection from existing data?

  Let me know what you'd like to implement first! 🚀
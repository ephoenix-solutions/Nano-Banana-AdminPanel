# Device Tracking & Account Limiting System

## 📋 Overview

This system implements device-based account limiting using a **separate `devices` collection** as recommended in `Device-login-research.md`.

## 🏗️ Architecture

### Two Collections Working Together:

1. **`users/{userId}/loginHistory`** (Subcollection)
   - **Purpose:** User audit trail
   - **Question:** "Which devices did this user login from?"
   - **Use Case:** User activity monitoring

2. **`devices/{deviceId}`** (Top-Level Collection) ✨ NEW
   - **Purpose:** Device-based account limiting
   - **Question:** "Which accounts are on this device?"
   - **Use Case:** Enforce max accounts per device

---

## 📊 Devices Collection Schema

```typescript
// Path: devices/{deviceId}
{
  id: string,                    // Document ID (same as deviceId)
  deviceId: string,              // Unique device identifier
  accountIds: string[],          // Array of user IDs (e.g., ["user1", "user2", "user3"])
  accountCount: number,          // Quick count (3)
  
  accounts: [                    // Detailed account info
    {
      userId: string,
      email: string,
      name: string,
      photoURL: string,
      firstLoginAt: Timestamp,
      lastLoginAt: Timestamp
    }
  ],
  
  deviceInfo: {                  // Device metadata
    model: string,               // "iPhone 14 Pro"
    os: string,                  // "iOS 16.5"
    appVersion: string           // "1.2.0"
  },
  
  firstLoginAt: Timestamp,       // First account login
  lastLoginAt: Timestamp,        // Most recent login
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

---

## 🔄 Login Flow with Device Limiting

### Mobile App Implementation:

```typescript
// 1. Get device identifier
import DeviceInfo from 'react-native-device-info';

const deviceId = await DeviceInfo.getUniqueId();
const deviceInfo = {
  model: await DeviceInfo.getModel(),
  os: `${await DeviceInfo.getSystemName()} ${await DeviceInfo.getSystemVersion()}`,
  appVersion: DeviceInfo.getVersion()
};

// 2. Send with login request
const response = await fetch('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({
    email,
    password,
    deviceId,      // ← NEW
    deviceInfo     // ← NEW
  })
});
```

### Backend API Implementation:

```typescript
// In your login API route
import { checkDeviceLimit, createDevice, addAccountToDevice } from '@/lib/services/device.service';
import { addLoginHistory } from '@/lib/services/user.service';

export async function POST(request: NextRequest) {
  const { email, password, deviceId, deviceInfo } = await request.json();
  
  // 1. Authenticate user (existing logic)
  const user = await authenticateUser(email, password);
  
  // 2. Check device limit
  const limitCheck = await checkDeviceLimit(deviceId, user.id);
  
  if (!limitCheck.allowed) {
    return NextResponse.json({
      success: false,
      code: 'DEVICE_LIMIT_REACHED',
      message: limitCheck.reason,
      currentCount: limitCheck.currentCount,
      maxLimit: limitCheck.maxLimit,
      existingAccounts: limitCheck.existingAccounts
    }, { status: 403 });
  }
  
  // 3. Update device document
  const device = await getDeviceById(deviceId);
  
  if (!device) {
    // Create new device
    await createDevice({
      deviceId,
      userId: user.id,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      deviceInfo
    });
  } else {
    // Add/update account on existing device
    await addAccountToDevice(deviceId, {
      userId: user.id,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      deviceInfo
    });
  }
  
  // 4. Add to user's login history (audit trail)
  await addLoginHistory(user.id, {
    deviceId,
    deviceInfo
  });
  
  // 5. Return success
  return NextResponse.json({
    success: true,
    user,
    token: generateToken(user)
  });
}
```

---

## 🎯 Key Functions

### Device Service (`lib/services/device.service.ts`)

| Function | Purpose | Returns |
|----------|---------|---------|
| `getAllDevices()` | Get all devices | `Device[]` |
| `getDeviceById(deviceId)` | Get single device | `Device \| null` |
| `checkDeviceLimit(deviceId, userId)` | Check if user can login | `DeviceLimitCheckResult` |
| `createDevice(data)` | Create new device | `void` |
| `addAccountToDevice(deviceId, data)` | Add account to device | `void` |
| `removeAccountFromDevice(deviceId, userId)` | Remove account | `void` |
| `deleteDevice(deviceId)` | Delete device | `void` |
| `getDevicesByUserId(userId)` | Get user's devices | `Device[]` |

---

## 🎨 Admin Panel Features

### 1. Devices List Page (`/devices`)
- View all devices
- See account count per device
- Device info (model, OS, app version)
- First/last login timestamps
- Export to CSV/JSON
- Stats cards (total devices, accounts, at limit, available)

### 2. Device Detail Page (`/devices/view/{deviceId}`)
- Full device information
- List all accounts on device
- Remove accounts from device
- Delete entire device
- View user details (click on account)

---

## 🔒 Device Limit Logic

### Scenarios:

1. **New Device (First Login)**
   ```
   Device doesn't exist → Create device → Add user → Allow ✅
   ```

2. **Existing Account Re-login**
   ```
   User already in accountIds → Update lastLoginAt → Allow ✅
   ```

3. **New Account on Device (Under Limit)**
   ```
   accountCount < maxLimit → Add user to accountIds → Allow ✅
   ```

4. **New Account on Device (At Limit)**
   ```
   accountCount >= maxLimit → Reject → Show error ❌
   ```

### Error Response:

```json
{
  "success": false,
  "code": "DEVICE_LIMIT_REACHED",
  "message": "Device limit reached (3 accounts maximum)",
  "currentCount": 3,
  "maxLimit": 3,
  "existingAccounts": [
    {
      "userId": "user1",
      "email": "user1@example.com",
      "name": "User One",
      "photoURL": "...",
      "firstLoginAt": "...",
      "lastLoginAt": "..."
    }
  ]
}
```

---

## 📁 Files Created

### Types:
- ✅ `lib/types/device.types.ts` - Device interfaces

### Services:
- ✅ `lib/services/device.service.ts` - Device CRUD operations

### Pages:
- ✅ `app/devices/page.tsx` - Devices list
- ✅ `app/devices/view/[id]/page.tsx` - Device details

### Utils:
- ✅ `lib/utils/exportDevices.ts` - Export functionality

### Navigation:
- ✅ Updated `components/Sidebar.tsx` - Added Devices menu
- ✅ Updated `app/developer-guide/page.tsx` - Added devices collection

---

## 🚀 Next Steps (Mobile App Backend)

1. **Install device info package:**
   ```bash
   npm install react-native-device-info
   ```

2. **Get device ID in mobile app:**
   ```typescript
   const deviceId = await DeviceInfo.getUniqueId();
   ```

3. **Send with login request:**
   ```typescript
   { email, password, deviceId, deviceInfo }
   ```

4. **Implement backend API:**
   - Use `checkDeviceLimit()` before allowing login
   - Use `createDevice()` or `addAccountToDevice()` after successful auth
   - Use `addLoginHistory()` for audit trail

5. **Handle error response:**
   - Show user-friendly message
   - Display existing accounts
   - Offer option to remove old account

---

## ✅ Benefits

| Feature | Benefit |
|---------|---------|
| **Fast Lookup** | O(1) - Single document read `devices/{deviceId}` |
| **Scalable** | No need to query all users' subcollections |
| **Maintainable** | Clear separation: user audit vs device limits |
| **Flexible** | Easy to change limit via App Settings |
| **Analytics Ready** | Track device usage, popular devices |
| **Admin Friendly** | View/manage devices in admin panel |

---

## 🎯 Admin Panel Usage

1. **View All Devices:** Navigate to `/devices`
2. **View Device Details:** Click "View" button
3. **Remove Account:** Click trash icon on account
4. **Delete Device:** Click "Delete Device" button
5. **Export Data:** Use export dropdown

---

## 📝 Notes

- Device limit is configurable in App Settings (`maxAccountsPerDevice`)
- Changes to limit apply immediately (no caching)
- Existing accounts are grandfathered (can always re-login)
- Admin can manually remove accounts from devices
- Login history subcollection remains for user audit trail

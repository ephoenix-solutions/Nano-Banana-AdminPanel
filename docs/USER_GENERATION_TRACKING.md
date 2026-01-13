# User Generation Tracking System

## Overview

This system tracks user image generation activity, including generation counts, limits, and detailed generation history.

---

## 🗂️ Database Structure

### **1. Updated `users` Collection**

```typescript
interface User {
  // ... existing fields ...
  
  // NEW: Generation tracking fields
  generatedCount: number;        // Total images generated (lifetime)
  currentPeriodCount: number;    // Count for current subscription period
  lastResetDate: Timestamp;      // When the count was last reset
}
```

### **2. New `userGenerations` Collection**

```typescript
interface UserGeneration {
  id: string;                    // Auto-generated document ID
  userId: string;                // Reference to user
  promptId: string;              // Which prompt was used
  promptText: string;            // The actual prompt text used
  imageUrl: string;              // Generated image URL
  generationStatus: 'pending' | 'success' | 'failed';
  errorMessage?: string;         // If failed
  metadata: {
    model?: string;              // AI model used
    parameters?: any;            // Generation parameters
    processingTime?: number;     // Time taken in ms
  };
  createdAt: Timestamp;
  subscriptionId?: string;       // Which subscription was active
  planId?: string;               // Which plan was used
}
```

---

## 📁 Files Created

### **Type Definitions**
- `lib/types/user-generation.types.ts` - UserGeneration interfaces
- `lib/types/user.types.ts` - Updated with generation fields

### **Services**
- `lib/services/user-generation.service.ts` - CRUD operations for generations
- `lib/utils/generationHelpers.ts` - Helper functions for counts and limits

---

## 🔄 Implementation Flow

### **1. When User Generates an Image**

```typescript
import { createUserGeneration, updateUserGeneration } from '@/lib/services/user-generation.service';
import { incrementUserGenerationCount, checkUserGenerationLimit } from '@/lib/utils/generationHelpers';

async function generateImage(userId: string, promptId: string, promptText: string) {
  // 1. Check if user has remaining generations
  const limitCheck = await checkUserGenerationLimit(userId);
  
  if (!limitCheck.canGenerate) {
    throw new Error('Generation limit reached for current period');
  }
  
  // 2. Create generation record (status: pending)
  const generationId = await createUserGeneration({
    userId,
    promptId,
    promptText,
    generationStatus: 'pending',
    subscriptionId: 'sub_123', // Get from active subscription
    planId: 'plan_456',        // Get from subscription plan
  });
  
  try {
    // 3. Call AI service to generate image
    const imageUrl = await callAIService(promptText);
    
    // 4. Update generation record (status: success)
    await updateUserGeneration(generationId, {
      generationStatus: 'success',
      imageUrl,
      metadata: {
        model: 'dall-e-3',
        processingTime: 5000,
      },
    });
    
    // 5. Increment user's generation counts
    await incrementUserGenerationCount(userId);
    
    return { success: true, imageUrl, generationId };
    
  } catch (error) {
    // 6. Update generation record (status: failed)
    await updateUserGeneration(generationId, {
      generationStatus: 'failed',
      errorMessage: error.message,
    });
    
    throw error;
  }
}
```

### **2. Reset Count on Subscription Renewal**

```typescript
import { resetUserPeriodCount } from '@/lib/utils/generationHelpers';

async function onSubscriptionRenewal(userId: string) {
  await resetUserPeriodCount(userId);
}
```

### **3. Check Remaining Generations**

```typescript
import { getUserGenerationInfo } from '@/lib/utils/generationHelpers';

async function getRemainingGenerations(userId: string) {
  const info = await getUserGenerationInfo(userId);
  
  console.log({
    lifetimeTotal: info.lifetimeTotal,
    currentPeriodUsed: info.currentPeriodUsed,
    limit: info.limit,
    remaining: info.remaining,
  });
}
```

---

## 🔧 Available Functions

### **Service Functions** (`user-generation.service.ts`)

```typescript
// Get all generations
getAllUserGenerations(): Promise<UserGeneration[]>

// Get generations by user
getUserGenerationsByUserId(userId: string, limit?: number): Promise<UserGeneration[]>

// Get generations by status
getUserGenerationsByStatus(status: 'pending' | 'success' | 'failed'): Promise<UserGeneration[]>

// Get single generation
getUserGenerationById(id: string): Promise<UserGeneration | null>

// Create generation
createUserGeneration(data: CreateUserGenerationInput): Promise<string>

// Update generation
updateUserGeneration(id: string, data: UpdateUserGenerationInput): Promise<void>

// Delete generation
deleteUserGeneration(id: string): Promise<void>

// Get generation count
getUserGenerationCount(userId: string, startDate: Timestamp): Promise<number>

// Get generation statistics
getUserGenerationStats(userId: string): Promise<{
  total: number;
  success: number;
  failed: number;
  pending: number;
}>
```

### **Helper Functions** (`generationHelpers.ts`)

```typescript
// Increment user's generation counts
incrementUserGenerationCount(userId: string): Promise<void>

// Reset user's current period count
resetUserPeriodCount(userId: string): Promise<void>

// Check if user has remaining generations
checkUserGenerationLimit(userId: string): Promise<{
  hasLimit: boolean;
  limit: number;
  used: number;
  remaining: number;
  canGenerate: boolean;
}>

// Get user generation info
getUserGenerationInfo(userId: string): Promise<{
  lifetimeTotal: number;
  currentPeriodUsed: number;
  limit: number;
  remaining: number;
  lastResetDate: Timestamp | null;
}>
```

---

## 📊 Firestore Indexes Required

Add these indexes in Firebase Console:

### **userGenerations Collection**

1. **Index for user queries:**
   - Collection: `userGenerations`
   - Fields: `userId` (Ascending), `createdAt` (Descending)

2. **Index for status queries:**
   - Collection: `userGenerations`
   - Fields: `generationStatus` (Ascending), `createdAt` (Descending)

3. **Index for count queries:**
   - Collection: `userGenerations`
   - Fields: `userId` (Ascending), `createdAt` (Ascending), `generationStatus` (Ascending)

---

## 🔒 Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // User Generations
    match /userGenerations/{generationId} {
      // Users can only read their own generations
      allow read: if request.auth != null && 
                     resource.data.userId == request.auth.uid;
      
      // Only admins can write
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Users collection - allow reading generation counts
    match /users/{userId} {
      allow read: if request.auth != null && 
                     (request.auth.uid == userId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Only allow updating generation counts via Cloud Functions or admin
      allow update: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

## 🎯 Next Steps

### **For Admin Panel:**

1. **Create Admin Pages:**
   - `app/user-generations/page.tsx` - List all generations
   - `app/user-generations/view/[id]/page.tsx` - View generation details
   - `app/users/[id]/generations/page.tsx` - User-specific generations

2. **Create Components:**
   - `components/user-generations/list/GenerationsTable.tsx`
   - `components/user-generations/list/PageHeader.tsx`
   - `components/user-generations/list/StatsCards.tsx`

3. **Create Hooks:**
   - `lib/hooks/useUserGenerations.ts` - For admin panel data fetching

4. **Add Export Functionality:**
   - `lib/utils/exportUserGenerations.ts` - Export generations to CSV/JSON

### **For Mobile App:**

1. **Implement Generation Flow:**
   - Check limits before generation
   - Create generation record
   - Call AI service
   - Update generation status
   - Increment counts

2. **Display User Stats:**
   - Show remaining generations
   - Show lifetime total
   - Show current period usage

3. **Handle Errors:**
   - Display limit reached message
   - Show generation failed errors
   - Retry failed generations

---

## 📈 Analytics Queries

### **Most Active Users**
```typescript
// Get users with highest generation counts
const users = await getAllUsers();
const sorted = users.sort((a, b) => b.generatedCount - a.generatedCount);
```

### **Success Rate**
```typescript
const stats = await getUserGenerationStats(userId);
const successRate = (stats.success / stats.total) * 100;
```

### **Popular Prompts**
```typescript
const generations = await getAllUserGenerations();
const promptCounts = generations.reduce((acc, gen) => {
  acc[gen.promptId] = (acc[gen.promptId] || 0) + 1;
  return acc;
}, {});
```

---

## ⚠️ Important Notes

1. **Atomic Operations:** Use Firestore `increment()` for counts to avoid race conditions
2. **Transactions:** Consider using transactions for critical operations
3. **Caching:** Cache user limits in memory/Redis for better performance
4. **Monitoring:** Set up alerts for failed generations
5. **Cleanup:** Implement data retention policy for old generations

---

## 🚀 Deployment Checklist

- [ ] Create Firestore indexes
- [ ] Set up security rules
- [ ] Test generation flow
- [ ] Test limit checking
- [ ] Test count reset
- [ ] Monitor performance
- [ ] Set up error tracking
- [ ] Document API for mobile team

---

## 📞 Support

For questions or issues, contact the development team.

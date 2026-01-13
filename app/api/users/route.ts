import { NextRequest, NextResponse } from 'next/server';
import { adminDb, admin } from '@/config/firebase-admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET is configured
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable is not set!');
}

/**
 * Verify admin middleware
 * Checks if the request is from an authenticated admin user
 */
async function verifyAdmin(request: NextRequest) {
  if (!JWT_SECRET) {
    return null;
  }

  const token = request.cookies.get('admin_token')?.value;
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userDoc = await adminDb.collection('users').doc(decoded.userId).get();
    
    if (!userDoc.exists) {
      return null;
    }
    
    const user = userDoc.data();
    
    if (user?.role !== 'admin') {
      return null;
    }
    
    return { userId: decoded.userId, ...user };
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * POST /api/users
 * Create a new user (admin or regular user)
 * 
 * Regular users: No password (use Google/Apple sign-in)
 * Admin users: Password required (to access admin panel)
 * 
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Check if JWT_SECRET is configured
    if (!JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // 2. Verify admin authentication
    const currentAdmin = await verifyAdmin(request);
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // 3. Get user data from request
    const userData = await request.json();

    // 4. Validate required fields
    if (!userData.name || !userData.name.trim()) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    if (!userData.email || !userData.email.trim()) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // 5. Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // 6. Check if email already exists
    const existingUserQuery = await adminDb.collection('users')
      .where('email', '==', userData.email)
      .get();
    
    if (!existingUserQuery.empty) {
      return NextResponse.json(
        { success: false, message: 'Email already exists' },
        { status: 400 }
      );
    }

    // 7. Validate password ONLY if role is admin
    // Regular users don't have passwords (they use Google/Apple sign-in)
    if (userData.role === 'admin') {
      if (!userData.password) {
        return NextResponse.json(
          { success: false, message: 'Password is required for admin users' },
          { status: 400 }
        );
      }
      if (userData.password.length < 8) {
        return NextResponse.json(
          { success: false, message: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
    }

    // 8. Hash password on server (ONLY for admin users)
    let hashedPassword = undefined;
    if (userData.role === 'admin' && userData.password) {
      hashedPassword = bcrypt.hashSync(userData.password, 10);
    }

    // 9. Create user in Firestore using Admin SDK
    const usersRef = adminDb.collection('users');
    const now = admin.firestore.Timestamp.now();
    
    const newUser: any = {
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      language: userData.language || 'en',
      provider: userData.provider || 'manual',
      photoURL: userData.photoURL || '',
      role: userData.role || 'user',
      createdAt: now,
      lastLogin: now,
      createdBy: currentAdmin.userId,
    };

    // Add password ONLY for admin users
    if (userData.role === 'admin' && hashedPassword) {
      newUser.password = hashedPassword;
    }

    const docRef = await usersRef.add(newUser);

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      userId: docRef.id,
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create user. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/users
 * Get all users
 * Requires admin authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check if JWT_SECRET is configured
    if (!JWT_SECRET) {
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify admin authentication
    const currentAdmin = await verifyAdmin(request);
    if (!currentAdmin) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }

    // Get all users
    const usersSnapshot = await adminDb.collection('users')
      .orderBy('createdAt', 'desc')
      .get();

    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      // Remove password from response
      const { password, ...userWithoutPassword } = data;
      return {
        id: doc.id,
        ...userWithoutPassword,
      };
    });

    return NextResponse.json({
      success: true,
      users,
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/config/firebase-admin';
import jwt from 'jsonwebtoken';
import { User } from '@/lib/types/user.types';

const JWT_SECRET = process.env.JWT_SECRET;

// Validate JWT_SECRET is configured
if (!JWT_SECRET) {
  console.error('❌ CRITICAL: JWT_SECRET environment variable is not set!');
  console.error('   Please add JWT_SECRET to your .env.local file');
  console.error('   Example: JWT_SECRET=your-super-secret-jwt-key');
}

export async function GET(request: NextRequest) {
  try {
    // Check if JWT_SECRET is configured
    if (!JWT_SECRET) {
      console.error('❌ JWT_SECRET not configured');
      return NextResponse.json(
        { success: false, message: 'Server configuration error' },
        { status: 500 }
      );
    }

    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'No token found' },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Fetch full user data from Firestore using Admin SDK
    const userRef = adminDb.collection('users').doc(decoded.userId);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userData = userSnap.data() as User;

    // Verify user still has admin role
    if (userData.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: decoded.userId,
        email: userData.email,
        name: userData.name,
        photoURL: userData.photoURL,
        role: userData.role,
        provider: userData.provider,
        language: userData.language,
        createdAt: userData.createdAt,
        lastLogin: userData.lastLogin,
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Invalid token' },
      { status: 401 }
    );
  }
}

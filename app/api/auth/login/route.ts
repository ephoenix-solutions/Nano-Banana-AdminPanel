import { NextRequest, NextResponse } from 'next/server';
import { admin, adminDb } from '@/config/firebase-admin';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '@/lib/types/user.types';

const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_EXPIRY = '7d';

// Validate JWT_SECRET is configured
if (!JWT_SECRET) {
  console.error('CRITICAL: JWT_SECRET environment variable is not set!');
  console.error('   Please add JWT_SECRET to your .env.local file');
  console.error('   Example: JWT_SECRET=your-super-secret-jwt-key');
}

export async function POST(request: NextRequest) {
  try {
    // Check if JWT_SECRET is configured
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not configured');
      return NextResponse.json(
        { success: false, message: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email using Admin SDK
    const usersRef = adminDb.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).get();

    if (querySnapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Create user object WITHOUT password
    const user = {
      id: userDoc.id,
      email: userData.email,
      name: userData.name,
      photoURL: userData.photoURL,
      role: userData.role,
      provider: userData.provider,
      language: userData.language,
      createdAt: userData.createdAt,
      lastLogin: userData.lastLogin,
      password: userData.password, // Only for verification, not sent to client
    } as User;

    // Check if user has admin role
    if (user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json(
        { success: false, message: 'Password not set for this account. Please contact administrator.' },
        { status: 401 }
      );
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update lastLogin timestamp using Admin SDK
    const userRef = adminDb.collection('users').doc(user.id);
    const now = admin.firestore.Timestamp.now();
    await userRef.update({
      lastLogin: now,
    });

    // Generate JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    // Create auth user object WITHOUT password
    const authUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      photoURL: user.photoURL,
      role: user.role,
      provider: user.provider,
      language: user.language,
      createdAt: user.createdAt,
      lastLogin: now,
      // password is NOT included here
    };

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: authUser,
      token,
    });

    // Set HTTP-only cookie for server-side verification (secure)
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    // Note: Removed admin_token_client cookie for security
    // Client should check auth status via /api/auth/verify endpoint

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear HTTP-only cookie
  response.cookies.delete('admin_token');
  
  // Note: admin_token_client cookie removed for security
  // If it exists from old sessions, clear it
  response.cookies.delete('admin_token_client');

  return response;
}

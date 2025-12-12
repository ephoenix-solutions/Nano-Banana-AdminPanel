import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  });

  // Clear both cookies
  response.cookies.delete('admin_token');
  response.cookies.delete('admin_token_client');

  return response;
}

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API is working!',
    timestamp: new Date().toISOString(),
    environment: {
      api_url: process.env.NEXT_PUBLIC_API_URL,
      jwt_secret_exists: !!process.env.JWT_SECRET
    }
  });
}

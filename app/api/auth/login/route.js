import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  const { username, password } = await request.json();

  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'RLnews@2026';

  if (username === adminUser && password === adminPass) {
    // Simple token — in production use proper JWT
    const token = Buffer.from(`${username}:${Date.now()}:${process.env.JWT_SECRET}`).toString('base64');

    const cookieStore = await cookies();
    cookieStore.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}

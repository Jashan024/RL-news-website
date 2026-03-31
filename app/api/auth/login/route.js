import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SECRET = 'rl-newspaper-super-secret-key-2026';

export async function POST(request) {
  const { username, password } = await request.json();

  const adminUser = process.env.ADMIN_USERNAME || 'admin';
  const adminPass = process.env.ADMIN_PASSWORD || 'RLnews@2026';

  if (username === adminUser && password === adminPass) {
    const token = Buffer.from(`${username}:${Date.now()}:${SECRET}`).toString('base64');

    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token');

  if (token && token.value) {
    try {
      const decoded = Buffer.from(token.value, 'base64').toString('utf-8');
      const secret = process.env.JWT_SECRET || 'rl-newspaper-super-secret-key-2026';
      if (decoded.includes(secret)) {
        return NextResponse.json({ authenticated: true });
      }
    } catch {
      // invalid token
    }
  }

  return NextResponse.json({ authenticated: false }, { status: 401 });
}

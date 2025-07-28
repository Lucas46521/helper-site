
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const CLIENT_ID = '1015096771661279243';
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/discord/callback';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'login') {
    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    return NextResponse.redirect(authUrl);
  }

  if (action === 'logout') {
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.delete('discord_token');
    response.cookies.delete('discord_user');
    return response;
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}


import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const userCookie = cookieStore.get('discord_user');
  const tokenCookie = cookieStore.get('discord_token');

  if (!userCookie || !tokenCookie) {
    return NextResponse.json({ user: null });
  }

  try {
    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ 
      user: {
        id: user.id,
        username: user.username,
        discriminator: user.discriminator,
        avatar: user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128` : null,
      }
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

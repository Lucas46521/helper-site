
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('discord_user');
  const tokenCookie = cookieStore.get('discord_token');

  if (!userCookie || !tokenCookie) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
  }

  try {
    const user = JSON.parse(userCookie.value);
    const userId = user.id;

    // Usar a rota user-info que já existe
    const baseUrl = request.nextUrl.origin;
    const response = await fetch(`${baseUrl}/api/user-info?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Erro na API user-info:', response.status, response.statusText);
      return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 502 });
    }

    const result = await response.json();
    const userData = result.data;

    return NextResponse.json({
      money: userData.money || 0,
      bank: userData.bank || 0,
      userId: userId,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json({ error: 'Falha ao buscar informações financeiras' }, { status: 500 });
  }
}

export const revalidate = 30; // Revalidar a cada 30 segundos

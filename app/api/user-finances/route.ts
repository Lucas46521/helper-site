
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('discord_user');
  const tokenCookie = cookieStore.get('discord_token');
  const API_URL = process.env.INT_API;
  const API_TOKEN = process.env.INT_API_TOKEN;

  if (!userCookie || !tokenCookie) {
    return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
  }

  try {
    const user = JSON.parse(userCookie.value);
    const userId = user.id;

    // Fazer requisição para a API externa
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Erro na API financeira:', response.status, response.statusText);
      return NextResponse.json({ error: 'Erro ao buscar dados financeiros' }, { status: 502 });
    }

    const financialData = await response.json();

    return NextResponse.json({
      money: financialData.money || 0,
      bank: financialData.bank || 0,
      userId: userId,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao buscar dados financeiros:', error);
    return NextResponse.json({ error: 'Falha ao buscar informações financeiras' }, { status: 500 });
  }
}

export const revalidate = 30; // Revalidar a cada 30 segundos

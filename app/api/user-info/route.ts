
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const API_URL = process.env.INT_API;
  const API_TOKEN = process.env.INT_API_TOKEN;

  try {
    if (!API_URL || !API_TOKEN) {
      console.error('Variáveis de ambiente INT_API ou INT_API_TOKEN não definidas.');
      return NextResponse.json({ error: 'Configuração da API incorreta' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    // Se não tiver userId na query, buscar do usuário logado
    if (!userId) {
      const cookieStore = await cookies();
      const userCookie = cookieStore.get('discord_user');
      
      if (!userCookie) {
        return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
      }

      const user = JSON.parse(userCookie.value);
      userId = user.id;
    }

    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      console.error('Erro na API externa:', response.status, response.statusText);
      return NextResponse.json({ error: 'Erro ao buscar dados do usuário' }, { status: 502 });
    }

    const userData = await response.json();

    return NextResponse.json({
      userId,
      data: userData,
      money: userData.money || 0,
      bank: userData.bank || 0,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao fazer fetch para API externa:', error);
    return NextResponse.json({ error: 'Falha ao buscar informações do usuário' }, { status: 500 });
  }
}

export const revalidate = 30;

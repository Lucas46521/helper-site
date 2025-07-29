import { NextResponse } from 'next/server';
const API_URL = process.env.INT_API;
const API_TOKEN = process.env.INT_API_TOKEN;

export async function GET(req) {
  try {
    if (!API_URL || !API_TOKEN) {
      console.error('Variáveis de ambiente INT_API ou INT_API_TOKEN não definidas.');
      return NextResponse.json({ error: 'Configuração da API incorreta' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'Parâmetro "userId" é obrigatório' }, { status: 400 });
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
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Erro ao fazer fetch para API externa:', error);
    return NextResponse.json({ error: 'Falha ao buscar informações do usuário' }, { status: 500 });
  }
}

export const revalidate = 60;
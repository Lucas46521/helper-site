import { NextResponse } from 'next/server';
import botData from '../../bot-data.json';

const API_URL = process.env.INT_API;
const API_TOKEN = process.env.INT_API_TOKEN;

export async function GET() {
  try {
    if (!API_URL || !API_TOKEN) {
      console.error('Variáveis de ambiente INT_API ou INT_API_TOKEN não definidas.');
      return NextResponse.json({ error: 'Configuração da API incorreta' }, { status: 500 });
    }

    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${API_TOKEN}`
      }
    });

    if (!response.ok) {
      console.error('Erro na API externa:', response.status, response.statusText);
      return NextResponse.json({ error: 'Erro ao buscar dados externos' }, { status: 502 });
    }

    const externalBotInfo = await response.json();

    const botInfo = {
      ...externalBotInfo,
      description: botData.description,
      features: botData.features,
      commands: botData.commands || [],
      uptime: botData.uptime,
      public: botData.public,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(botInfo);
  } catch (error) {
    console.error('Erro ao fazer fetch para API externa:', error);
    return NextResponse.json({ error: 'Falha ao buscar informações do bot' }, { status: 500 });
  }
}

export const revalidate = 300;
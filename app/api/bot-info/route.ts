import { NextResponse } from 'next/server';
import botData from '../../bot-data.json';

const API_URL = 'http://gra-01.gratian.pro:3052/api/info';
const API_TOKEN = 'hp-nmk45uimg';

export async function GET() {
  try {
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

    // Mescla dados extras do botData local com dados externos da API
    const botInfo = {
      ...externalBotInfo,

      // Dados adicionais do botData local que você quer incluir ou sobrescrever:
      description: botData.description,
      features: botData.features,
      commands: botData.commands || [],
      uptime: botData.uptime,
      public: botData.public,

      // Atualiza timestamp de resposta
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(botInfo);
  } catch (error) {
    console.error('Erro ao fazer fetch para API externa:', error);
    return NextResponse.json({ error: 'Falha ao buscar informações do bot' }, { status: 500 });
  }
}

// Cache por 5 minutos
export const revalidate = 300;
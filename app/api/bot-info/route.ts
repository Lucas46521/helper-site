import { NextResponse } from 'next/server';
import botData from '../../bot-data.json';

export async function GET() {
  try {
    // Simula busca de dados em tempo real
    // Em produção, aqui você faria chamadas para APIs do Discord, banco de dados, etc.

    const botInfo = {
      ...botData,
      // Adiciona dados dinâmicos simulados
      guildCount: Math.floor(Math.random() * 100) + 1500,
      userCount: Math.floor(Math.random() * 5000) + 15000,
      uptime: '99.9%',
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(botInfo);
  } catch (error) {
    console.error('Error fetching bot info:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bot information' },
      { status: 500 }
    );
  }
}

// Permite cache por 5 minutos
export const revalidate = 300;
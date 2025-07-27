
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('id');

  if (!botId) {
    return NextResponse.json({ error: 'Bot ID é obrigatório' }, { status: 400 });
  }

  try {
    // Busca informações básicas do bot via Discord API
    const response = await fetch(`https://discord.com/api/v10/applications/${botId}/rpc`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // Fallback para informações estáticas se a API falhar
      return NextResponse.json({
        username: 'MeuBot',
        avatar: null,
        tag: 'MeuBot#1234',
        verified: false,
        public: true,
        description: 'Seu assistente inteligente no Discord',
        guildCount: null
      });
    }

    const data = await response.json();
    
    // Busca informações públicas do bot
    const botResponse = await fetch(`https://discord.com/api/v10/users/${botId}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    let botData = null;
    if (botResponse.ok) {
      botData = await botResponse.json();
    }

    return NextResponse.json({
      username: botData?.username || data.name || 'MeuBot',
      avatar: botData?.avatar || null,
      tag: botData ? `${botData.username}#${botData.discriminator}` : 'MeuBot#1234',
      verified: data.verify_key ? true : false,
      public: data.bot_public !== false,
      description: data.description || 'Seu assistente inteligente no Discord',
      guildCount: data.approximate_guild_count || null
    });

  } catch (error) {
    console.error('Erro ao buscar informações do bot:', error);
    
    // Retorna informações padrão em caso de erro
    return NextResponse.json({
      username: 'MeuBot',
      avatar: null,
      tag: 'MeuBot#1234',
      verified: false,
      public: true,
      description: 'Seu assistente inteligente no Discord',
      guildCount: null
    });
  }
}

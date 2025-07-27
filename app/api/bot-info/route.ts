
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('id');

  if (!botId) {
    return NextResponse.json({ error: 'Bot ID é obrigatório' }, { status: 400 });
  }

  try {
    // Tentativa de buscar informações do bot via Discord API
    const botResponse = await fetch(`https://discord.com/api/v10/users/${botId}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DiscordBot (https://discord.com, 1.0)'
      },
    });

    let botData = null;
    if (botResponse.ok) {
      botData = await botResponse.json();
    }

    // Dados padrão com comandos em JSON
    const defaultCommands = [
      {
        name: "play",
        description: "Reproduz uma música no canal de voz",
        usage: "/play <música>",
        category: "Música"
      },
      {
        name: "skip",
        description: "Pula a música atual",
        usage: "/skip",
        category: "Música"
      },
      {
        name: "kick",
        description: "Remove um usuário do servidor",
        usage: "/kick <@usuário> [motivo]",
        category: "Moderação"
      },
      {
        name: "ban",
        description: "Bane um usuário do servidor",
        usage: "/ban <@usuário> [motivo]",
        category: "Moderação"
      },
      {
        name: "help",
        description: "Mostra todos os comandos disponíveis",
        usage: "/help [comando]",
        category: "Utilidade"
      }
    ];

    return NextResponse.json({
      username: botData?.username || 'MeuBot',
      avatar: botData?.avatar || null,
      tag: botData ? `${botData.username}#${botData.discriminator || '0000'}` : 'MeuBot#1234',
      verified: botData?.verified || false,
      public: botData?.public_flags !== undefined,
      description: 'Um bot multifuncional para Discord com recursos de música, moderação e entretenimento. Desenvolvido para proporcionar a melhor experiência em servidores Discord.',
      guildCount: Math.floor(Math.random() * 1000) + 500, // Simulação
      commands: defaultCommands,
      features: [
        'Sistema de música com alta qualidade',
        'Moderação automática e manual', 
        'Comandos de diversão e entretenimento',
        'Sistema de economia virtual',
        'Logs detalhados de atividades'
      ]
    });

  } catch (error) {
    console.error('Erro ao buscar informações do bot:', error);
    
    // Retorna informações padrão completas em caso de erro
    return NextResponse.json({
      username: 'MeuBot',
      avatar: null,
      tag: 'MeuBot#1234',
      verified: false,
      public: true,
      description: 'Um bot multifuncional para Discord com recursos de música, moderação e entretenimento.',
      guildCount: 500,
      commands: [
        {
          name: "play",
          description: "Reproduz uma música no canal de voz",
          usage: "/play <música>",
          category: "Música"
        },
        {
          name: "help",
          description: "Mostra todos os comandos disponíveis", 
          usage: "/help [comando]",
          category: "Utilidade"
        }
      ],
      features: [
        'Sistema de música',
        'Moderação',
        'Entretenimento'
      ]
    });
  }
}

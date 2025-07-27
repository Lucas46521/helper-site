
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const botId = searchParams.get('id');

  if (!botId) {
    return NextResponse.json({ error: 'Bot ID é obrigatório' }, { status: 400 });
  }

  try {
    // Buscar informações do bot via Discord API usando o token
    const botResponse = await fetch(`https://discord.com/api/v10/users/${botId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${process.env.BOT_TOKEN}`,
        'User-Agent': 'DiscordBot (https://discord.com, 1.0)'
      },
    });

    let botData = null;
    if (botResponse.ok) {
      botData = await botResponse.json();
    }

    // Comandos atualizados em JSON
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
      },
      {
        name: "economy",
        description: "Sistema de economia virtual completo",
        usage: "/economy [opção]",
        category: "Economia"
      },
      {
        name: "logs",
        description: "Visualiza logs detalhados do servidor",
        usage: "/logs [tipo]",
        category: "Moderação"
      }
    ];

    // Novas features baseadas na descrição fornecida
    const features = [
      "Desenvolvimento constante - O bot está em desenvolvimento constante, visando melhorias e crescimento",
      "Velocidade - É um bot extremamente veloz",
      "Funcionalidades - Um bot insanamente completo, repleto de funções que te ajudaram nas tarefas mais complexas",
      "Sistema de música com alta qualidade",
      "Moderação automática e manual avançada", 
      "Comandos de diversão e entretenimento",
      "Sistema de economia virtual completo",
      "Logs detalhados de atividades do servidor",
      "Suporte 24/7 e atualizações constantes"
    ];

    return NextResponse.json({
      username: botData?.username || 'MeuBot',
      avatar: botData?.avatar || null,
      tag: botData ? `${botData.username}#${botData.discriminator || '0000'}` : 'MeuBot#1234',
      verified: botData?.verified || false,
      public: botData?.public_flags !== undefined,
      description: 'Um bot multifuncional repleto de funções uteis e preparado para te ajudar com seu problemas.',
      guildCount: Math.floor(Math.random() * 1000) + 500,
      commands: defaultCommands,
      features: features
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
      description: 'Um bot multifuncional repleto de funções uteis e preparado para te ajudar com seu problemas.',
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
        "Desenvolvimento constante",
        "Velocidade extrema",
        "Funcionalidades completas"
      ]
    });
  }
}

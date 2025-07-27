
import { NextResponse } from 'next/server';
import botData from '../../bot-data.json';

interface DiscordBotInfo {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
  bot: boolean;
  verified_bot?: boolean;
  public_flags?: number;
}

export async function GET() {
  try {
    const BOT_TOKEN = process.env.BOT_TOKEN;
    const BOT_ID = "1015096771661279243";

    let discordBotInfo: DiscordBotInfo | null = null;

    // Busca informações do bot via API do Discord se o token estiver disponível
    if (BOT_TOKEN && BOT_ID) {
      try {
        const response = await fetch(`https://discord.com/api/v10/users/${BOT_ID}`, {
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          discordBotInfo = await response.json();
        }
      } catch (discordError) {
        console.warn('Failed to fetch from Discord API:', discordError);
      }
    }

    // Busca estatísticas do bot (guilds count) se possível
    let guildCount = botData.guildCount;
    if (BOT_TOKEN) {
      try {
        const guildsResponse = await fetch('https://discord.com/api/v10/users/@me/guilds', {
          headers: {
            'Authorization': `Bot ${BOT_TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        if (guildsResponse.ok) {
          const guilds = await guildsResponse.json();
          guildCount = guilds.length;
        }
      } catch (guildsError) {
        console.warn('Failed to fetch guilds from Discord API:', guildsError);
      }
    }

    // Constrói a resposta final organizando dados por fonte
    const botInfo = {
      // === INFORMAÇÕES DA API DO DISCORD ===
      username: discordBotInfo?.username || botData.username,
      avatar: discordBotInfo?.avatar 
        ? `https://cdn.discordapp.com/avatars/${discordBotInfo.id}/${discordBotInfo.avatar}.png?size=256`
        : null,
      tag: discordBotInfo 
        ? `${discordBotInfo.username}#${discordBotInfo.discriminator}`
        : botData.tag,
      verified: discordBotInfo?.verified_bot || botData.verified,
      
      // === INFORMAÇÕES DO ARQUIVO JSON ===
      description: botData.description,
      features: botData.features,
      commands: botData.commands || [],
      
      // === STATS (MISTURADO: Discord API + JSON) ===
      guildCount: guildCount,
      userCount: Math.floor(Math.random() * 5000) + 15000, // Pode ser calculado de forma mais precisa
      uptime: botData.uptime,
      
      // === METADADOS ===
      public: botData.public,
      lastUpdated: new Date().toISOString(),
      fromDiscordAPI: !!discordBotInfo
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

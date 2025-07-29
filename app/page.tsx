"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import botData from './bot-data.json';
import ElectricBackground from './components/ElectricBackground';
import UserHeader from './components/UserHeader';

interface BotInfo {
  username: string;
  avatar: string | null;
  tag: string;
  verified: boolean;
  public: boolean;
  description: string;
  guildCount: number;
  userCount: number;
  uptime: string;
  inviteUrl: string; // Novo campo adicionado
  features: Array<{
    title: string;
    description: string;
    icon: string;
  }>;
  commands: Array<{
    name: string;
    description: string;
    usage: string;
    category: string;
  }>;
}

export default function Home() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCommands, setShowCommands] = useState(false);

  useEffect(() => {
    const fetchBotInfo = async () => {
      try {
        const response = await fetch('/api/bot-info');
        if (response.ok) {
          const data = await response.json();
          setBotInfo(data);
        } else {
          console.error('Erro na resposta da API:', response.status, response.statusText);
          setBotInfo(botData as BotInfo);
        }
      } catch (error) {
        console.error('Error fetching bot info:', error);
        setBotInfo(botData as BotInfo);
      } finally {
        setLoading(false);
      }
    };

    fetchBotInfo();
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <ElectricBackground />
      <UserHeader />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-4 py-12">
        {botInfo && (
          <div className="mb-8 relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 animate-pulse opacity-75"></div>
              <div className="absolute inset-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500">
                {botInfo.avatar ? (
                  <img
                    src={botInfo.avatar}
                    alt={`${botInfo.username} avatar`}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center text-4xl md:text-5xl">
                    🤖
                  </div>
                )}
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
            </div>
          </div>
        )}

        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent mb-6">
          {loading ? 'Carregando...' : botInfo?.username || 'MeuBot'}
        </h1>

        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
          {loading ? 'Buscando informações...' : botInfo?.description || 'Seu assistente inteligente no Discord'}
        </p>

        {botInfo && (
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Online • {botInfo.tag}</span>
            {botInfo.verified && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">✓ Verificado</span>
            )}
          </div>
        )}

        {/* Features com blur */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl">
          {botInfo?.features.map((feature, index) => (
            <div key={index} className="section-blur hover:border-cyan-400/40 hover:scale-105 transform transition-all">
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              {loading ? '...' : botInfo?.guildCount ? `${botInfo.guildCount}` : '1500+'}
            </div>
            <div className="text-gray-400 text-sm">Servidores</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-400">
              {loading ? '...' : botInfo?.userCount ? `${Math.floor(botInfo.userCount / 1000)}K+` : '15K+'}
            </div>
            <div className="text-gray-400 text-sm">Usuários</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-400">
              {loading ? '...' : botInfo?.uptime || '99.9%'}
            </div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-400">24/7</div>
            <div className="text-gray-400 text-sm">Online</div>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 mt-12">
          <a
            href={botInfo?.inviteUrl || '#'} // Usar inviteUrl com fallback para '#'
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
          >
            🔗 Adicionar ao Discord
          </a>

          <button
            onClick={() => setShowCommands(!showCommands)}
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            📚 {showCommands ? 'Ocultar' : 'Ver'} Comandos
          </button>
        </div>

        {/* Commands com blur */}
        {showCommands && botInfo?.commands && (
          <div className="mt-12 max-w-4xl w-full">
            <h2 className="text-3xl font-bold text-white mb-8">Comandos Disponíveis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {botInfo.commands.map((command, index) => (
                <div key={index} className="section-blur">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-cyan-400">/{command.name}</h3>
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                      {command.category}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">{command.description}</p>
                  <code className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                    {command.usage}
                  </code>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
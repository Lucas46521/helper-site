"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import botData from './bot-data.json';
import ElectricBackground from './components/ElectricBackground';

interface BotInfo {
  username: string;
  avatar: string;
  tag: string;
  verified: boolean;
  public: boolean;
  description: string;
  guildCount: number;
  userCount: number;
  uptime: string;
  features: { title: string; description: string; icon: string }[];
  commands: { name: string; description: string; usage: string; category: string }[];
}

export default function Home() {
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBotInfo = async () => {
      try {
        // Buscar informações do Discord API
        const response = await fetch('/api/bot-info?id=1015096771661279243');

        if (response.ok) {
          const discordData = await response.json();

          // Combinar dados do Discord com dados locais
          const combinedData = {
            ...botData,
            username: discordData.username || botData.username,
            avatar: discordData.avatar || botData.avatar,
            tag: discordData.tag || botData.tag,
            verified: discordData.verified || botData.verified,
            public: discordData.public || botData.public
          };

          setBotInfo(combinedData);
        } else {
          // Fallback para dados locais se a API falhar
          setBotInfo(botData);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do bot:', error);
        setBotInfo(botData);
      } finally {
        setLoading(false);
      }
    };

    fetchBotInfo();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 overflow-hidden">
      {/* Electric Background */}
      <ElectricBackground />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-20 z-10"></div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        {/* Bot Avatar/Logo */}
        <div className="mb-8 relative">
          <div className="w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-cyan-500/25 animate-pulse overflow-hidden">
            {botInfo?.avatar ? (
              <img
                src={`https://cdn.discordapp.com/avatars/1015096771661279243/${botInfo.avatar}.png?size=128`}
                alt={botInfo.username}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              '🤖'
            )}
          </div>
          <div className="absolute -inset-4 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full opacity-20 blur-xl animate-ping"></div>
        </div>

        {/* Bot Name */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-pulse">
          {loading ? 'Carregando...' : botInfo?.username || 'MeuBot'}
        </h1>

        {/* Bot Description */}
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed">
          {loading ? 'Buscando informações...' : botInfo?.description || 'Seu assistente inteligente no Discord'}
        </p>

        {/* Bot Status */}
        {botInfo && (
          <div className="flex items-center gap-2 mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-medium">Online • {botInfo.tag}</span>
            {botInfo.verified && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">✓ Verificado</span>
            )}
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-6xl">
          {botInfo?.features.map((feature, index) => (
            <div
              key={index}
              className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300 hover:transform hover:scale-105"
            >
              <div className="text-3xl mb-3">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-300 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="#"
            className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/25"
          >
            🔗 Adicionar ao Discord
          </a>

          <a
            href="#"
            className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105"
          >
            📚 Comandos
          </a>
        </div>

        {/* Stats */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-cyan-400">
              {loading ? '...' : botInfo?.guildCount ? `${botInfo.guildCount}+` : '1500+'}
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
      </div>
    </div>
  );
}
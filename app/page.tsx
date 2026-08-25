"use client";

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
    <main className="site-shell relative overflow-hidden">
      <ElectricBackground />
      <UserHeader />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col justify-center px-5 py-28 sm:px-8 lg:px-12">
        <div className="hero-grid">
          <section className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> BOT PARA DISCORD <span className="eyebrow-line" /></div>
            {botInfo && (
              <div className="avatar-wrap">
                <div className="avatar-ring">
                {botInfo.avatar ? (
                  <img
                    src={botInfo.avatar}
                    alt={`${botInfo.username} avatar`}
                    className="avatar-image"
                  />
                ) : (
                  <div className="avatar-fallback">
                    🤖
                  </div>
                )}
                </div>
                <div className="avatar-status"><span /></div>
              </div>
            )}

            <h1>{loading ? 'Carregando...' : botInfo?.username || 'MeuBot'}</h1>

            <p className="hero-description">
              {loading ? 'Buscando informações...' : botInfo?.description || 'Seu assistente inteligente no Discord'}
            </p>

            {botInfo && (
              <div className="bot-status">
                <span className="status-pulse" /> Online <span className="status-separator">/</span> {botInfo.tag}
            {botInfo.verified && (
                  <span className="verified-badge">VERIFICADO</span>
            )}
              </div>
            )}

            <div className="hero-actions">
              <a href={botInfo?.inviteUrl || '#'} className="primary-action">Adicionar ao Discord <span>↗</span></a>
              <button onClick={() => setShowCommands(!showCommands)} className="secondary-action">
                {showCommands ? 'Ocultar comandos' : 'Explorar comandos'} <span>↓</span>
              </button>
            </div>
          </section>

          <aside className="info-panel">
            <div className="panel-heading"><span>VISÃO GERAL</span><span className="panel-live">● AO VIVO</span></div>
            <div className="stats-grid">
              <div className="stat-item"><strong>{loading ? '...' : botInfo?.guildCount || '1500+'}</strong><span>Servidores</span></div>
              <div className="stat-item"><strong>{loading ? '...' : botInfo?.userCount ? `${Math.floor(botInfo.userCount / 1000)}K+` : '15K+'}</strong><span>Usuários</span></div>
              <div className="stat-item"><strong>{loading ? '...' : botInfo?.uptime || '99.9%'}</strong><span>Uptime</span></div>
              <div className="stat-item"><strong>24/7</strong><span>Disponível</span></div>
            </div>
            <div className="panel-divider" />
            <div className="panel-caption">RECURSOS PRINCIPAIS</div>
            <div className="feature-list">
              {botInfo?.features.map((feature, index) => (
                <div key={index} className="feature-row">
                  <span className="feature-icon">{feature.icon}</span>
                  <div><h3>{feature.title}</h3><p>{feature.description}</p></div>
                </div>
              ))}
            </div>
            <div className="panel-footer"><span className="footer-signal" /> SISTEMA OPERACIONAL <span>v2.0</span></div>
          </aside>
        </div>

        {showCommands && botInfo?.commands && (
          <section className="commands-section">
            <div className="commands-heading"><div><span className="eyebrow">COMANDOS</span><h2>Feito para agir.</h2></div><span>{botInfo.commands.length} disponíveis</span></div>
            <div className="commands-grid">
              {botInfo.commands.map((command, index) => (
                <div key={index} className="command-item">
                  <div className="command-top"><h3>/{command.name}</h3><span>{command.category}</span></div>
                  <p>{command.description}</p><code>{command.usage}</code>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

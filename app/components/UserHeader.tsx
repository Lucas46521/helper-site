
"use client";

import { useEffect, useState } from 'react';

interface User {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

interface FinancialData {
  money: number;
  bank: number;
  userId: string;
  lastUpdated: string;
}

export default function UserHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [financialLoading, setFinancialLoading] = useState(false);

  const fetchFinancialData = async () => {
    if (!user) return;
    
    setFinancialLoading(true);
    try {
      const response = await fetch('/api/user-info');
      if (response.ok) {
        const data = await response.json();
        setFinancialData(data);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setFinancialLoading(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/user');
        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFinancialData();
    }
  }, [user]);

  const handleLogin = () => {
    window.location.href = '/api/auth/discord?action=login';
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/discord?action=logout';
  };

  if (loading) {
    return (
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
          <div className="text-white text-sm">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-4 right-4 z-20">
      <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-full px-4 py-2">
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={`${user.username} avatar`}
                  className="w-8 h-8 rounded-full"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-white text-sm font-medium">
                  {user.username}#{user.discriminator}
                </span>
                {financialData && !financialLoading && (
                  <div className="flex gap-3 text-xs">
                    <span className="text-green-400">
                      💰 {financialData.money.toLocaleString()}
                    </span>
                    <span className="text-blue-400">
                      🏦 {financialData.bank.toLocaleString()}
                    </span>
                  </div>
                )}
                {financialLoading && (
                  <span className="text-gray-400 text-xs">Carregando finanças...</span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchFinancialData}
                disabled={financialLoading}
                className="text-cyan-400 hover:text-cyan-300 text-xs transition-colors disabled:opacity-50"
                title="Atualizar dados financeiros"
              >
                🔄
              </button>
              <button
                onClick={handleLogout}
                className="text-red-400 hover:text-red-300 text-sm transition-colors"
              >
                Sair
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center gap-2 text-white hover:text-cyan-400 transition-colors text-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
            Entrar com Discord
          </button>
        )}
      </div>
    </div>
  );
}

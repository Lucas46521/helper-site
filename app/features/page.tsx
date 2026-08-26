import React from 'react';

export default function FeaturesPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-4xl font-bold mb-4">Recursos</h1>
      <p className="text-lg text-muted mb-6">Lista de recursos principais do Ajudante.</p>

      <ul className="grid gap-4 sm:grid-cols-2">
        <li className="section-blur p-4">Moderação avançada: Warns, bans, logs.</li>
        <li className="section-blur p-4">Sistema de economia: moedas, lojas e ranks.</li>
        <li className="section-blur p-4">Automação: ações agendadas e integrações.</li>
        <li className="section-blur p-4">Comandos personalizados e documentação.</li>
      </ul>
    </main>
  );
}

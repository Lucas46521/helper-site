import React from 'react';

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-4xl font-bold mb-4">Documentação</h1>
      <p className="text-lg text-muted mb-6">Guia rápido para começar e referências das APIs/ comandos.</p>

      <section className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Começando</h2>
        <ol className="list-decimal list-inside text-base text-muted">
          <li>Adicione o bot ao seu servidor usando o link de convite.</li>
          <li>Configure permissões e cargos.</li>
          <li>Use /help para ver os comandos disponíveis.</li>
        </ol>
      </section>
    </main>
  );
}

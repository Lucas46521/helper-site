import React from 'react';

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-24">
      <h1 className="text-4xl font-bold mb-4">Sobre o Ajudante</h1>
      <p className="text-lg text-muted mb-6">O Ajudante é um bot multifuncional para Discord com foco em moderação, economia e automações. Ele foi projetado para ser leve, seguro e fácil de configurar.</p>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Missão</h2>
        <p className="text-base text-muted">Facilitar a gestão de servidores com comandos confiáveis e recursos de automação para comunidades de qualquer tamanho.</p>
      </section>

      <section className="mt-8">
        <h2 className="text-2xl font-semibold mb-2">Contato</h2>
        <p className="text-base text-muted">Para suporte e sugestões, acesse a seção de contato.</p>
      </section>
    </main>
  );
}

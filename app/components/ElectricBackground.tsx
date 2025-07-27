"use client";

import { useEffect, useRef } from "react";

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface MicroRay {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  life: number;
  maxLife: number;
  opacity: number;
}

interface ElectricNode {
  x: number;
  y: number;
  createdAt: number;
  radius: number;
}

export default function MicroElectricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const sparks: Spark[] = [];
    const rays: MicroRay[] = [];
    const nodes: ElectricNode[] = [];

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);

    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Criar nó elétrico
      nodes.push({
        x,
        y,
        createdAt: Date.now(),
        radius: 100,
      });

      // Atrair faíscas próximas
      for (const spark of sparks) {
        const dx = spark.x - x;
        const dy = spark.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 80) {
          const angle = Math.atan2(y - spark.y, x - spark.x);
          spark.vx = Math.cos(angle) * 1.5;
          spark.vy = Math.sin(angle) * 1.5;
        }
      }
    });

    const draw = () => {
      if (!ctx) return;
      
      ctx.fillStyle = "rgba(10, 15, 25, 0.12)";
      ctx.fillRect(0, 0, width, height);

      const now = Date.now();

      // Limpar nós após 3 segundos
      for (let i = nodes.length - 1; i >= 0; i--) {
        if (now - nodes[i].createdAt > 3000) nodes.splice(i, 1);
      }

      // Animação dos nós
      for (const node of nodes) {
        const pulse = Math.sin((now - node.createdAt) * 0.01) * 4 + 8;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(120, 200, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Atualizar faíscas
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.96;
        s.vy *= 0.96;
        s.life--;

        // Se estiver perto de um nó → lançar raio e remover faísca
        for (const node of nodes) {
          const dx = s.x - node.x;
          const dy = s.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < node.radius * 0.9) {
            rays.push({
              x1: node.x,
              y1: node.y,
              x2: s.x,
              y2: s.y,
              life: 10,
              maxLife: 10,
              opacity: 0.5,
            });
            sparks.splice(i, 1);
            break;
          }
        }

        const alpha = s.life / s.maxLife;
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (s.life <= 0) sparks.splice(i, 1);
      }

      // Atualizar micro raios
      for (let i = rays.length - 1; i >= 0; i--) {
        const r = rays[i];
        r.life--;
        const alpha = (r.life / r.maxLife) * r.opacity;

        ctx.strokeStyle = `rgba(150, 220, 255, ${alpha})`;
        ctx.lineWidth = 0.6;
        ctx.shadowColor = `rgba(150, 220, 255, ${alpha})`;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        if (r.life <= 0) rays.splice(i, 1);
      }

      // Criar novas faíscas
      if (Math.random() < 0.25) {
        sparks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: 40 + Math.random() * 40,
          maxLife: 80,
        });
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("click", () => {});
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #050f1a 0%, #0a1525 50%, #0f1b2e 100%)",
      }}
    />
  );
}
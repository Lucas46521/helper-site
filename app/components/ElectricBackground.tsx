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

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", resize);

    const draw = () => {
      ctx.fillStyle = "rgba(10, 15, 25, 0.15)";
      ctx.fillRect(0, 0, width, height);

      // Faíscas
      sparks.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        const alpha = s.life / s.maxLife;
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 1.2, 0, Math.PI * 2);
        ctx.fill();

        if (s.life <= 0) sparks.splice(i, 1);
      });

      // Micro raios
      rays.forEach((r, i) => {
        r.life--;
        const alpha = (r.life / r.maxLife) * r.opacity;

        ctx.strokeStyle = `rgba(150, 220, 255, ${alpha})`;
        ctx.lineWidth = 0.7;
        ctx.shadowColor = `rgba(150, 220, 255, ${alpha})`;
        ctx.shadowBlur = 4;

        ctx.beginPath();
        ctx.moveTo(r.x1, r.y1);
        ctx.lineTo(r.x2, r.y2);
        ctx.stroke();

        ctx.shadowBlur = 0;

        if (r.life <= 0) rays.splice(i, 1);
      });

      // Criar novas faíscas
      if (Math.random() < 0.2) {
        sparks.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: 30 + Math.random() * 30,
          maxLife: 60,
        });
      }

      // Criar novos micro raios
      if (Math.random() < 0.05) {
        const x1 = Math.random() * width;
        const y1 = Math.random() * height;
        const x2 = x1 + (Math.random() - 0.5) * 40;
        const y2 = y1 + (Math.random() - 0.5) * 40;
        rays.push({
          x1,
          y1,
          x2,
          y2,
          life: 15 + Math.random() * 10,
          maxLife: 30,
          opacity: 0.4 + Math.random() * 0.3,
        });
      }

      requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
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
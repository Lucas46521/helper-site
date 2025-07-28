"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  angle: number;
  speed: number;
  life: number;
  maxLife: number;
  radius: number;
}

interface Core {
  x: number;
  y: number;
  pulse: number;
  life: number;
}

interface Beam {
  path: { x: number; y: number }[];
  life: number;
}

export default function EnergyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: Particle[] = [];
    const cores: Core[] = [];
    const beams: Beam[] = [];

    function spawnParticle(x?: number, y?: number) {
      particles.push({
        x: x ?? Math.random() * width,
        y: y ?? Math.random() * height,
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random(),
        life: 80 + Math.random() * 80,
        maxLife: 80 + Math.random() * 80,
        radius: 1 + Math.random() * 1.5,
      });
    }

    function spawnCore(x: number, y: number) {
      if (cores.length >= 8) return;
      cores.push({ x, y, pulse: 0, life: 600 });
    }

    function spawnBeam(fromX: number, fromY: number, toX: number, toY: number) {
      const path = [];
      const segments = 6 + Math.floor(Math.random() * 3);
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const x = fromX + (toX - fromX) * t + (Math.random() - 0.5) * 20;
        const y = fromY + (toY - fromY) * t + (Math.random() - 0.5) * 20;
        path.push({ x, y });
      }
      beams.push({ path, life: 10 });
    }

    function animate() {
      if (!ctx) return; // Garante que ctx não é null
      ctx.clearRect(0, 0, width, height);

      // Fundo gradiente
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#000015");
      grad.addColorStop(1, "#000025");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Núcleos
      for (let i = cores.length - 1; i >= 0; i--) {
        const core = cores[i];
        core.pulse += 0.1;
        core.life--;

        const radius = 15 + 5 * Math.sin(core.pulse);
        ctx.beginPath();
        ctx.arc(core.x, core.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(0, 200, 255, 0.3)";
        ctx.lineWidth = 1.2;
        ctx.stroke();

        if (Math.random() < 0.1) {
          const close = particles.filter(p => Math.hypot(p.x - core.x, p.y - core.y) < 150);
          if (close.length > 0) {
            const target = close[Math.floor(Math.random() * close.length)];
            spawnBeam(core.x, core.y, target.x, target.y);
          }
        }

        if (core.life <= 0) cores.splice(i, 1);
      }

      // Feixes
      for (let i = beams.length - 1; i >= 0; i--) {
        const beam = beams[i];
        ctx.beginPath();
        ctx.moveTo(beam.path[0].x, beam.path[0].y);
        for (const point of beam.path) ctx.lineTo(point.x, point.y);
        ctx.strokeStyle = `rgba(0,255,255,${beam.life / 10})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        beam.life--;
        if (beam.life <= 0) beams.splice(i, 1);
      }

      // Partículas
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.angle += (Math.random() - 0.5) * 0.2;
        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;
        p.life--;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,255,${p.life / p.maxLife})`;
        ctx.fill();

        if (Math.random() < 0.005) {
          const neighbors = particles.filter(n => n !== p && Math.hypot(n.x - p.x, n.y - p.y) < 80);
          if (neighbors.length > 0) {
            const n = neighbors[Math.floor(Math.random() * neighbors.length)];
            spawnBeam(p.x, p.y, n.x, n.y);
          }
        }

        if (p.life <= 0) particles.splice(i, 1);
      }

      while (particles.length < 200) spawnParticle();

      animationRef.current = requestAnimationFrame(animate);
    }

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < 4; i++) spawnParticle(e.clientX, e.clientY);
    };

    const handleClick = (e: MouseEvent) => spawnCore(e.clientX, e.clientY);

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);

    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        background: "black",
      }}
    />
  );
}
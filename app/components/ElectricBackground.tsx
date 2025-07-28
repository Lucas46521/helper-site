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
  pulse: number;
}

interface Core {
  x: number;
  y: number;
  pulse: number;
  life: number;
  energy: number;
  rotation: number;
}

interface Beam {
  path: { x: number; y: number }[];
  life: number;
}

interface Matrix {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  life: number;
}

interface Vortex {
  x: number;
  y: number;
  radius: number;
  strength: number;
  life: number;
  rotation: number;
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
    const matrices: Matrix[] = [];
    const vortices: Vortex[] = [];

    // Inicializar elementos
    spawnCore(width / 2, height / 2);
    spawnMatrix(width / 4, height / 4);
    spawnVortex((3 * width) / 4, (3 * height) / 4);
    spawnParticle(width * 0.75, height * 0.75);

    function spawnParticle(x?: number, y?: number) {
      if (particles.length >= 50) return;
      particles.push({
        x: x ?? Math.random() * width,
        y: y ?? Math.random() * height,
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random(),
        life: 60 + Math.random() * 60, // 1 a 2 segundos
        maxLife: 60 + Math.random() * 60,
        radius: 3 + Math.random() * 3,
        pulse: 0,
      });
    }

    function spawnCore(x: number, y: number) {
      if (cores.length >= 8) return;
      cores.push({ x, y, pulse: 0, life: 600, energy: 0, rotation: 0 });
    }

    function spawnBeam(fromX: number, fromY: number, toX: number, toY: number, fromParticle: boolean = false) {
      const path = [];
      const segments = 6 + Math.floor(Math.random() * 3);
      const distance = Math.hypot(toX - fromX, toY - fromY);
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const maxDeviation = Math.min(distance * 0.1, 50); // Desvio proporcional, limitado a 50
        const x = fromX + (toX - fromX) * t + (Math.random() - 0.5) * maxDeviation;
        const y = fromY + (toY - fromY) * t + (Math.random() - 0.5) * maxDeviation;
        path.push({ x, y });
      }
      beams.push({ path, life: 20 }); // Duração aumentada para 20 frames
    }

    function spawnMatrix(x: number, y: number) {
      if (matrices.length >= 5) return;
      matrices.push({
        x,
        y,
        radius: 20,
        rotation: 0,
        life: 400,
      });
    }

    function spawnVortex(x: number, y: number) {
      if (vortices.length >= 3) return;
      vortices.push({
        x,
        y,
        radius: 50,
        strength: 0.075 + Math.random() * 0.075,
        life: 300,
        rotation: 0,
      });
    }

    function drawBackground() {
      // Gradiente radial
      const grad = ctx!.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, Math.max(width, height) / 2);
      grad.addColorStop(0, "#003366"); // Ciano no centro
      grad.addColorStop(1, "#000015"); // Azul escuro nas bordas
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, width, height);

      // Efeito de ruído (partículas de fundo)
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx!.beginPath();
        ctx!.arc(x, y, 1 + Math.random(), 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(0, 200, 255, ${Math.random() * 0.1})`;
        ctx!.fill();
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Desenhar fundo moderno
      drawBackground();

      // Vórtices (hexágono duplo com pontos girando)
      for (let i = vortices.length - 1; i >= 0; i--) {
        const vortex = vortices[i];
        vortex.life--;
        vortex.rotation += 0.025;

        // Desenhar hexágono duplo
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2 + vortex.rotation;
          const x = vortex.x + Math.cos(angle) * vortex.radius;
          const y = vortex.y + Math.sin(angle) * vortex.radius;
          ctx[j === 0 ? "moveTo" : "lineTo"](x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 100, 255, ${vortex.life / 300})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2 - vortex.rotation;
          const x = vortex.x + Math.cos(angle) * (vortex.radius * 0.7);
          const y = vortex.y + Math.sin(angle) * (vortex.radius * 0.7);
          ctx[j === 0 ? "moveTo" : "lineTo"](x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 150, 255, ${vortex.life / 300})`;
        ctx.lineWidth = 1;
        ctx.stroke();

        // Pontos girando
        for (let j = 0; j < 4; j++) {
          const angle = (j / 4) * Math.PI * 2 + vortex.rotation * 2;
          const x = vortex.x + Math.cos(angle) * (vortex.radius * 0.5);
          const y = vortex.y + Math.sin(angle) * (vortex.radius * 0.5);
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 200, 255, ${vortex.life / 300})`;
          ctx.fill();
        }

        // Atração e destruição de elementos próximos
        particles.forEach(p => {
          const dist = Math.hypot(p.x - vortex.x, p.y - vortex.y);
          if (dist < vortex.radius && dist > 0) {
            const force = vortex.strength * (1 - dist / vortex.radius);
            p.angle = Math.atan2(vortex.y - p.y, vortex.x - p.x);
            p.speed += force;
            p.x += Math.cos(p.angle) * p.speed;
            p.y += Math.sin(p.angle) * p.speed;
            if (dist < vortex.radius * 0.3) p.life = 0;
          }
        });

        cores.forEach(c => {
          const dist = Math.hypot(c.x - vortex.x, c.y - vortex.y);
          if (dist < vortex.radius && dist > 0) {
            const force = vortex.strength * (1 - dist / vortex.radius) * 0.5;
            const dx = (vortex.x - c.x) / dist;
            const dy = (vortex.y - c.y) / dist;
            c.x += dx * force * 2;
            c.y += dy * force * 2;
            if (dist < vortex.radius * 0.3) c.life = 0;
          }
        });

        matrices.forEach(m => {
          const dist = Math.hypot(m.x - vortex.x, m.y - vortex.y);
          if (dist < vortex.radius && dist > 0) {
            const force = vortex.strength * (1 - dist / vortex.radius) * 0.5;
            const dx = (vortex.x - m.x) / dist;
            const dy = (vortex.y - m.y) / dist;
            m.x += dx * force * 2;
            m.y += dy * force * 2;
            if (dist < vortex.radius * 0.3) m.life = 0;
          }
        });

        // Mini explosão ao sumir
        if (vortex.life <= 0) {
          for (let j = 0; j < 5; j++) {
            spawnParticle(vortex.x, vortex.y);
          }
          vortices.splice(i, 1);
        }
        }

        // Matrizes (raios girando conectados a um ponto)
        for (let i = matrices.length - 1; i >= 0; i--) {
          const matrix = matrices[i];
          matrix.rotation += 0.025;
          matrix.life--;

          // Desenhar ponto central
          ctx.beginPath();
          ctx.arc(matrix.x, matrix.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 200, 255, ${matrix.life / 400})`;
          ctx.fill();

          // Raios girando
          for (let j = 0; j < 8; j++) {
            const angle = (j / 8) * Math.PI * 2 + matrix.rotation;
            const x = matrix.x + Math.cos(angle) * matrix.radius;
            const y = matrix.y + Math.sin(angle) * matrix.radius;
            ctx.beginPath();
            ctx.moveTo(matrix.x, matrix.y);
            ctx.lineTo(x, y);
            ctx.strokeStyle = `rgba(0, 150, 255, ${matrix.life / 400})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }

          // Lançar até 3 feixes para partículas e vórtices próximos
          if (Math.random() < 0.2) {
            const targets = [
              ...particles.filter(p => Math.hypot(p.x - matrix.x, p.y - matrix.y) < 100),
              ...vortices.filter(v => Math.hypot(v.x - matrix.x, v.y - matrix.y) < 100),
            ];
            const numBeams = Math.min(targets.length, 3);
            for (let j = 0; j < numBeams; j++) {
              const target = targets[Math.floor(Math.random() * targets.length)];
              spawnBeam(matrix.x, matrix.y, target.x, target.y);
            }
          }

          if (matrix.life <= 0) matrices.splice(i, 1);
        }

        // Núcleos (círculo com triângulo central rotativo)
        for (let i = cores.length - 1; i >= 0; i--) {
          const core = cores[i];
          core.pulse += 0.1;
          core.rotation += 0.025;
          core.life--;
          core.energy += 0.1;

          // Desenhar círculo
          const radius = 15 + 5 * Math.sin(core.pulse);
          ctx.beginPath();
          ctx.arc(core.x, core.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 255, 0.1)`;
          ctx.fill();
          ctx.strokeStyle = `rgba(0, 200, 255, 0.3)`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Desenhar triângulo central
          ctx.beginPath();
          for (let j = 0; j < 3; j++) {
            const angle = (j / 3) * Math.PI * 2 + core.rotation;
            const x = core.x + Math.cos(angle) * (radius * 0.5);
            const y = core.y + Math.sin(angle) * (radius * 0.5);
            ctx[j === 0 ? "moveTo" : "lineTo"](x, y);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(0, 200, 255, ${core.life / 600})`;
          ctx.fill();

          // Divisão do núcleo
          if (core.energy > 100 && Math.random() < 0.02) {
            spawnCore(core.x + (Math.random() - 0.5) * 50, core.y + (Math.random() - 0.5) * 50);
            core.energy = 0;
          }

          // Feixes para partículas próximas
          if (Math.random() < 0.2) {
            const close = particles.filter(p => Math.hypot(p.x - core.x, p.y - core.y) < 100);
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
          ctx.strokeStyle = `rgba(0, 255, 255, ${beam.life / 20})`; // Ajustado para maior duração
          ctx.lineWidth = 1.2;
          ctx.stroke();
          beam.life--;
          if (beam.life <= 0) beams.splice(i, 1);
        }

        // Partículas
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.pulse += 0.1;
          p.angle += (Math.random() - 0.5) * 0.2;
          p.x += Math.cos(p.angle) * p.speed;
          p.y += Math.sin(p.angle) * p.speed;
          p.life--;

          // Atração/repulsão entre partículas
          particles.forEach(other => {
            if (other !== p) {
              const dist = Math.hypot(p.x - other.x, p.y - other.y);
              if (dist < 50 && dist > 0) {
                const force = 0.02 * (Math.random() < 0.5 ? 1 : -1);
                p.angle = Math.atan2(other.y - p.y, other.x - p.x);
                p.speed += force;
                // Colisão para formar matriz
                if (dist < p.radius + other.radius && Math.random() < 0.1) {
                  spawnMatrix(p.x, p.y);
                  p.life = 0;
                  other.life = 0;
                }
              }
            }
          });

          // Desenhar partícula com piscar
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 255, 255, ${Math.sin(p.pulse) * 0.5 + 0.5})`;
          ctx.fill();

          // Feixes apenas para outras partículas
          if (Math.random() < 0.01) {
            const targets = particles.filter(n => n !== p && Math.hypot(n.x - p.x, n.y - p.y) < 100);
            if (targets.length > 0) {
              const target = targets[Math.floor(Math.random() * targets.length)];
              spawnBeam(p.x, p.y, target.x, target.y, true);
            }
          }

          if (p.life <= 0) particles.splice(i, 1);
        }

        // Geração aleatória de elementos
        if (Math.random() < 0.05) spawnParticle();
        if (Math.random() < 0.005) spawnCore(Math.random() * width, Math.random() * height);
        if (Math.random() < 0.005) spawnVortex(Math.random() * width, Math.random() * height);

        animationRef.current = requestAnimationFrame(animate);
      }

      const handleResize = () => {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
      };

      const handleClick = (e: MouseEvent) => {
        const choice = Math.random();
        if (choice < 0.33) spawnCore(e.clientX, e.clientY);
        else if (choice < 0.66) spawnMatrix(e.clientX, e.clientY);
        else spawnParticle(e.clientX, e.clientY);
      };

      window.addEventListener("resize", handleResize);
      canvas.addEventListener("click", handleClick);

      animate();

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        window.removeEventListener("resize", handleResize);
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
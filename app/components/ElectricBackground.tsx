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
}

interface Beam {
  path: { x: number; y: number }[];
  life: number;
  direction: { x: number; y: number };
}

interface Matrix {
  x: number;
  y: number;
  radius: number;
  pulse: number;
  life: number;
  rotation: number; // Para rotação dos raios
}

interface Vortex {
  x: number;
  y: number;
  radius: number;
  strength: number;
  life: number;
  rotation: number; // Para pontos girando
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
      if (particles.length >= 20) return;
      particles.push({
        x: x ?? Math.random() * width,
        y: y ?? Math.random() * height,
        angle: Math.random() * Math.PI * 2,
        speed: 0.5 + Math.random(),
        life: 50 + Math.random() * 50,
        maxLife: 50 + Math.random() * 50,
        radius: 3 + Math.random() * 3,
        pulse: 0,
      });
    }

    function spawnCore(x: number, y: number) {
      if (cores.length >= 8) return;
      cores.push({ x, y, pulse: 0, life: 600, energy: 0 });
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
      beams.push({
        path,
        life: 10,
        direction: { x: (toX - fromX) / segments, y: (toY - fromY) / segments },
      });
    }

    function spawnMatrix(x: number, y: number) {
      if (matrices.length >= 5) return;
      matrices.push({
        x,
        y,
        radius: 20 + Math.random() * 10,
        pulse: 0,
        life: 400,
        rotation: 0,
      });
    }

    function spawnVortex(x: number, y: number) {
      if (vortices.length >= 3) return;
      vortices.push({
        x,
        y,
        radius: 50 + Math.random() * 50,
        strength: 0.05 + Math.random() * 0.05,
        life: 300,
        rotation: 0,
      });
    }

    function drawHexagon(x: number, y: number, radius: number, rotation: number) {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + rotation;
        const px = x + radius * Math.cos(angle);
        const py = y + radius * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 100, 255, 0.5)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // Fundo gradiente (tons de azul escuro)
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, "#000022");
      grad.addColorStop(1, "#000044");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Vórtices (hexágono duplo com pontos girando)
      for (let i = vortices.length - 1; i >= 0; i--) {
        const vortex = vortices[i];
        vortex.life--;
        vortex.rotation += 0.05;

        // Hexágono externo
        drawHexagon(vortex.x, vortex.y, vortex.radius, vortex.rotation);
        // Hexágono interno
        drawHexagon(vortex.x, vortex.y, vortex.radius * 0.6, -vortex.rotation);

        // Pontos girando ao redor
        for (let j = 0; j < 6; j++) {
          const angle = (Math.PI / 3) * j + vortex.rotation;
          const px = vortex.x + vortex.radius * 0.8 * Math.cos(angle);
          const py = vortex.y + vortex.radius * 0.8 * Math.sin(angle);
          ctx.beginPath();
          ctx.arc(px, py, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 150, 255, ${vortex.life / 300})`;
          ctx.fill();
        }

        // Atração de partículas
        particles.forEach(p => {
          const dist = Math.hypot(p.x - vortex.x, p.y - vortex.y);
          if (dist < vortex.radius && dist > 0) {
            const force = vortex.strength * (1 - dist / vortex.radius);
            p.angle = Math.atan2(vortex.y - p.y, vortex.x - p.x);
            p.speed += force;
          }
        });

        // Desvio de feixes
        beams.forEach(b => {
          const midPoint = b.path[Math.floor(b.path.length / 2)];
          const dist = Math.hypot(midPoint.x - vortex.x, midPoint.y - vortex.y);
          if (dist < vortex.radius) {
            const force = vortex.strength * (1 - dist / vortex.radius);
            b.path.forEach(p => {
              const angle = Math.atan2(vortex.y - p.y, vortex.x - p.x);
              p.x += Math.cos(angle) * force * 5;
              p.y += Math.sin(angle) * force * 5;
            });
          }
        });

        if (vortex.life <= 0) vortices.splice(i, 1);
      }

      // Matrizes (raios girando em torno de um ponto)
      for (let i = matrices.length - 1; i >= 0; i--) {
        const matrix = matrices[i];
        matrix.pulse += 0.05;
        matrix.life--;
        matrix.rotation += 0.1;

        // Ponto central
        ctx.beginPath();
        ctx.arc(matrix.x, matrix.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 150, 255, ${matrix.life / 400})`;
        ctx.fill();

        // Raios girando
        for (let j = 0; j < 6; j++) {
          const angle = (Math.PI / 3) * j + matrix.rotation;
          const endX = matrix.x + matrix.radius * Math.cos(angle);
          const endY = matrix.y + matrix.radius * Math.sin(angle);
          ctx.beginPath();
          ctx.moveTo(matrix.x, matrix.y);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = `rgba(0, 100, 255, ${matrix.life / 400})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Raios internos atingindo partículas e vórtices
        if (Math.random() < 0.1) {
          const targets = [
            ...particles.filter(p => Math.hypot(p.x - matrix.x, p.y - matrix.y) < 100),
            ...vortices.filter(v => Math.hypot(v.x - matrix.x, v.y - matrix.y) < 100),
          ];
          if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            spawnBeam(matrix.x, matrix.y, target.x, target.y);
          }
        }

        if (matrix.life <= 0) matrices.splice(i, 1);
      }

      // Núcleos
      for (let i = cores.length - 1; i >= 0; i--) {
        const core = cores[i];
        core.pulse += 0.1;
        core.life--;
        core.energy += 0.1;

        const radius = 15 + 5 * Math.sin(core.pulse);
        ctx.beginPath();
        ctx.arc(core.x, core.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 150, 255, 0.1)`;
        ctx.strokeStyle = `rgba(0, 100, 255, 0.3)`;
        ctx.lineWidth = 1.2;
        ctx.fill();
        ctx.stroke();

        // Divisão do núcleo
        if (core.energy > 100 && Math.random() < 0.02) {
          spawnCore(core.x + (Math.random() - 0.5) * 50, core.y + (Math.random() - 0.5) * 50);
          core.energy = 0;
        }

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
        ctx.strokeStyle = `rgba(0, 200, 255, ${beam.life / 10})`;
        ctx.lineWidth = 1.2;
        ctx.stroke();
        beam.life--;
        if (beam.life <= 0) beams.splice(i, 1);
      }

      // Partículas (faíscas)
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

        // Desenhar partícula (ponto piscante)
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 200, 255, ${Math.sin(p.pulse) * 0.5 + 0.5})`;
        ctx.fill();

        // Transformação em feixe
        if (Math.random() < 0.005) {
          const targets = [
            ...particles.filter(n => n !== p && Math.hypot(n.x - p.x, n.y - p.y) < 80),
            ...cores,
            ...matrices,
          ];
          if (targets.length > 0) {
            const target = targets[Math.floor(Math.random() * targets.length)];
            spawnBeam(p.x, p.y, target.x, target.y);
          }
        }

        if (p.life <= 0) particles.splice(i, 1);
      }

      // Geração aleatória de elementos
      if (Math.random() < 0.02) spawnParticle();
      if (Math.random() < 0.02) spawnCore(Math.random() * width, Math.random() * height);
      if (Math.random() < 0.02) spawnVortex(Math.random() * width, Math.random() * height);

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
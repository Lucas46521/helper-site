"use client";

import { useEffect, useRef } from "react";

/* ------------------------------- PERLIN NOISE ------------------------------- */
// Perlin Noise simples para suavizar movimentos e ângulos
function generatePerm() {
  const perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) perm[i] = i;
  for (let i = 0; i < 256; i++) {
    const j = Math.floor(Math.random() * 256);
    const tmp = perm[i];
    perm[i] = perm[j];
    perm[j] = tmp;
  }
  for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
  return perm;
}

const perm = generatePerm();
function perlin2D(x: number, y: number) {
  const xi = Math.floor(x) & 255;
  const yi = Math.floor(y) & 255;

  const xf = x - Math.floor(x);
  const yf = y - Math.floor(y);

  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);

  const aa = perm[perm[xi] + yi];
  const ba = perm[perm[xi + 1] + yi];
  const ab = perm[perm[xi] + yi + 1];
  const bb = perm[perm[xi + 1] + yi + 1];

  const x1 = aa + u * (ba - aa);
  const x2 = ab + u * (bb - ab);

  return (x1 + v * (x2 - x1)) / 255;
}

/* ----------------------------- INTERFACES ----------------------------------- */
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

/* --------------------------- COMPONENTE PRINCIPAL --------------------------- */
export default function EnergyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ------------------------------ SIZE SETUP ----------------------------- */
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    ctx.globalCompositeOperation = "lighter";

    /* ---------------------------- ELEMENT ARRAYS -------------------------- */
    const particles: Particle[] = [];
    const cores: Core[] = [];
    const beams: Beam[] = [];
    const matrices: Matrix[] = [];
    const vortices: Vortex[] = [];

    /* --------------------------- SPAWN FUNCTIONS -------------------------- */

    function spawnParticle(x?: number, y?: number) {
      if (particles.length >= 100) return;

      const life = 180 + Math.random() * 180;

      particles.push({
        x: x ?? Math.random() * width,
        y: y ?? Math.random() * height,
        angle: Math.random() * Math.PI * 2,
        speed: 0.4 + Math.random() * 0.4,
        life,
        maxLife: life,
        radius: 2.5 + Math.random() * 3,
        pulse: 0,
      });
    }

    function spawnCore(x: number, y: number) {
      if (cores.length >= 8) return;
      cores.push({
        x,
        y,
        pulse: 0,
        life: 700,
        energy: 0,
        rotation: 0,
      });
    }

    function spawnMatrix(x: number, y: number) {
      if (matrices.length >= 6) return;
      matrices.push({
        x,
        y,
        radius: 20,
        rotation: 0,
        life: 450,
      });
    }

    function spawnVortex(x: number, y: number) {
      if (vortices.length >= 4) return;
      vortices.push({
        x,
        y,
        radius: 55,
        strength: 0.06 + Math.random() * 0.07,
        life: 350,
        rotation: 0,
      });
    }

    function spawnBeam(fromX: number, fromY: number, toX: number, toY: number) {
      const path = [];
      const segments = 6 + Math.floor(Math.random() * 3);
      const distance = Math.hypot(toX - fromX, toY - fromY);

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const dev = Math.min(distance * 0.1, 45);

        path.push({
          x: fromX + (toX - fromX) * t + (Math.random() - 0.5) * dev,
          y: fromY + (toY - fromY) * t + (Math.random() - 0.5) * dev,
        });
      }

      beams.push({ path, life: 22 });
    }

    /* ----------------------------- BACKGROUND ------------------------------ */
    function drawBackground(time: number) {
     if (!ctx) return;

      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, width, height);

      // GRID + SUAVE PULSO DE PERLIN
      const glow = (perlin2D(time * 0.0005, 0) * 0.3 + 0.2).toFixed(3);

      ctx.strokeStyle = `rgba(0,150,255,${glow})`;
      ctx.lineWidth = 0.8;

      for (let x = 0; x < width; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += 55) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    }

    /* ------------------------------- ANIMATE ------------------------------- */
    const animate = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      drawBackground(time);

      /* ----------------------------- VÓRTICES ----------------------------- */
      for (let i = vortices.length - 1; i >= 0; i--) {
        const v = vortices[i];
        v.life--;
        v.rotation += 0.02;

        const alpha = v.life / 350;

        // Hex neon
        ctx.strokeStyle = `rgba(0,200,255,${alpha})`;
        ctx.lineWidth = 1.3;

        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const a = (j / 6) * Math.PI * 2 + v.rotation;
          const x = v.x + Math.cos(a) * v.radius;
          const y = v.y + Math.sin(a) * v.radius;
          ctx[j === 0 ? "moveTo" : "lineTo"](x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Inner hex
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const a = (j / 6) * Math.PI * 2 - v.rotation;
          const x = v.x + Math.cos(a) * (v.radius * 0.7);
          const y = v.y + Math.sin(a) * (v.radius * 0.7);
          ctx[j === 0 ? "moveTo" : "lineTo"](x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0,120,255,${alpha})`;
        ctx.stroke();

        // Rotating dots
        for (let j = 0; j < 4; j++) {
          const a = (j / 4) * Math.PI * 2 + v.rotation * 1.8;
          const x = v.x + Math.cos(a) * (v.radius * 0.45);
          const y = v.y + Math.sin(a) * (v.radius * 0.45);

          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,220,255,${alpha})`;
          ctx.fill();
        }

        if (v.life <= 0) vortices.splice(i, 1);
      }

      /* ------------------------------ MATRIZES ----------------------------- */
      for (let i = matrices.length - 1; i >= 0; i--) {
        const m = matrices[i];
        m.life--;
        m.rotation += 0.02;

        const alpha = m.life / 450;

        // Center dot
        ctx.beginPath();
        ctx.arc(m.x, m.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,200,255,${alpha})`;
        ctx.fill();

        // Spinning rays
        for (let j = 0; j < 8; j++) {
          const a = (j / 8) * Math.PI * 2 + m.rotation;
          const x = m.x + Math.cos(a) * m.radius;
          const y = m.y + Math.sin(a) * m.radius;

          ctx.beginPath();
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(x, y);
          ctx.strokeStyle = `rgba(0,150,255,${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Auto-beams
        if (Math.random() < 0.18) {
          const close = particles.filter(p => Math.hypot(p.x - m.x, p.y - m.y) < 120);
          if (close.length) {
            const t = close[Math.floor(Math.random() * close.length)];
            spawnBeam(m.x, m.y, t.x, t.y);
          }
        }

        if (m.life <= 0) matrices.splice(i, 1);
      }

      /* ------------------------------- NÚCLEOS ------------------------------ */
      for (let i = cores.length - 1; i >= 0; i--) {
        const c = cores[i];
        c.pulse += 0.1;
        c.rotation += 0.02;
        c.life--;
        c.energy += 0.12;

        const alpha = c.life / 700;

        const radius = 15 + 5 * Math.sin(c.pulse);

        // Glow circle
        ctx.beginPath();
        ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,255,0.12)`;
        ctx.fill();

        ctx.strokeStyle = `rgba(0,200,255,0.35)`;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        // Rotating triangle
        ctx.beginPath();
        for (let j = 0; j < 3; j++) {
          const a = (j / 3) * Math.PI * 2 + c.rotation;
          const x = c.x + Math.cos(a) * (radius * 0.55);
          const y = c.y + Math.sin(a) * (radius * 0.55);

          ctx[j === 0 ? "moveTo" : "lineTo"](x, y);
        }
        ctx.closePath();
        ctx.fillStyle = `rgba(0,200,255,${alpha})`;
        ctx.fill();

        // Core division
        if (c.energy > 100 && Math.random() < 0.02) {
          spawnCore(c.x + (Math.random() - 0.5) * 50, c.y + (Math.random() - 0.5) * 50);
          c.energy = 0;
        }

        if (c.life <= 0) cores.splice(i, 1);
      }

      /* ------------------------------- BEAMS -------------------------------- */
      for (let i = beams.length - 1; i >= 0; i--) {
        const b = beams[i];

        ctx.beginPath();
        ctx.moveTo(b.path[0].x, b.path[0].y);

        for (const p of b.path) ctx.lineTo(p.x, p.y);

        ctx.strokeStyle = `rgba(0,255,255,${b.life / 22})`;
        ctx.lineWidth = 1.3;
        ctx.stroke();

        b.life--;
        if (b.life <= 0) beams.splice(i, 1);
      }

      /* ------------------------------ PARTÍCULAS ---------------------------- */
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];

        p.pulse += 0.1;

        // Perlin controla direção
        const noise = perlin2D(p.x * 0.002, p.y * 0.002);
        p.angle += (noise - 0.5) * 0.25;

        p.x += Math.cos(p.angle) * p.speed;
        p.y += Math.sin(p.angle) * p.speed;

        p.life--;

        const alpha = Math.min(1, p.life / p.maxLife);

        // Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius + 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,180,255,${0.12 * alpha})`;
        ctx.fill();

        // Core sparkle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,255,255,${(Math.sin(p.pulse) * 0.5 + 0.5) * alpha})`;
        ctx.fill();

        // Random beams
        if (Math.random() < 0.01) {
          const targets = particles.filter(
            o => o !== p && Math.hypot(o.x - p.x, o.y - p.y) < 100
          );
          if (targets.length) {
            const t = targets[Math.floor(Math.random() * targets.length)];
            spawnBeam(p.x, p.y, t.x, t.y);
          }
        }

        if (p.life <= 0) particles.splice(i, 1);
      }

      /* ----------------------- RANDOM SPAWNING --------------------------- */
      if (particles.length < 90 && Math.random() < 0.18) spawnParticle();
      if (Math.random() < 0.004) spawnCore(Math.random() * width, Math.random() * height);
      if (Math.random() < 0.004) spawnVortex(Math.random() * width, Math.random() * height);

      animationRef.current = requestAnimationFrame(animate);
    };

    /* ---------------------------- EVENT LISTENERS ----------------------------- */
    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    const handleClick = (e: MouseEvent) => {
      const r = Math.random();
      if (r < 0.33) spawnCore(e.clientX, e.clientY);
      else if (r < 0.66) spawnMatrix(e.clientX, e.clientY);
      else spawnParticle(e.clientX, e.clientY);
    };

    window.addEventListener("resize", handleResize);
    canvas.addEventListener("click", handleClick);

    animate(0);

    /* ----------------------------- CLEANUP ------------------------------- */
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
        background: "#000",
      }}
    />
  );
}
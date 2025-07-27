"use client";

import { useEffect, useRef } from "react";

interface Spark { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; hits: number; removeAt?: number; }

interface MicroRay { x1: number; y1: number; x2: number; y2: number; life: number; maxLife: number; opacity: number; path?: [number, number][]; }

interface ElectricNode { x: number; y: number; createdAt: number; radius: number; persistent: boolean; }

export default function MicroElectricBackground() { const canvasRef = useRef<HTMLCanvasElement>(null); const mouse = useRef({ x: 0, y: 0, down: false });

useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return;

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

const createLightningPath = (x1: number, y1: number, x2: number, y2: number): [number, number][] => {
  const points: [number, number][] = [[x1, y1]];
  const steps = 4;
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    const dx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 20;
    const dy = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 20;
    points.push([dx, dy]);
  }
  points.push([x2, y2]);
  return points;
};

const generateSpark = (x: number, y: number) => {
  sparks.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 1.5,
    vy: (Math.random() - 0.5) * 1.5,
    life: 60 + Math.random() * 80,
    maxLife: 140,
    hits: 0,
  });
};

const handleMouseMove = (e: MouseEvent) => {
  mouse.current.x = e.clientX;
  mouse.current.y = e.clientY;
  if (Math.random() < 0.8) {
    for (let i = 0; i < 2; i++) {
      generateSpark(e.clientX + (Math.random() - 0.5) * 40, e.clientY + (Math.random() - 0.5) * 40);
    }
  }
};

const handleMouseDown = (e: MouseEvent) => {
  mouse.current.down = true;
  mouse.current.x = e.clientX;
  mouse.current.y = e.clientY;
  nodes.push({
    x: e.clientX,
    y: e.clientY,
    createdAt: Date.now(),
    radius: 100,
    persistent: true,
  });
};

const handleMouseUp = () => {
  mouse.current.down = false;
};

window.addEventListener("resize", resize);
window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("mousedown", handleMouseDown);
window.addEventListener("mouseup", handleMouseUp);

const draw = () => {
  ctx.fillStyle = "rgba(10, 15, 25, 0.12)";
  ctx.fillRect(0, 0, width, height);

  const now = Date.now();

  // Nós
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    if (!node.persistent && now - node.createdAt > 3000) {
      nodes.splice(i, 1);
      continue;
    }

    const pulse = Math.sin((now - node.createdAt) * 0.01) * 4 + 8;
    ctx.beginPath();
    ctx.arc(node.x, node.y, pulse, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(120, 200, 255, 0.4)";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Faíscas
  for (let i = sparks.length - 1; i >= 0; i--) {
    const s = sparks[i];
    s.x += s.vx;
    s.y += s.vy;
    s.vx *= 0.96;
    s.vy *= 0.96;
    s.life--;

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
          path: createLightningPath(node.x, node.y, s.x, s.y),
        });
        sparks.splice(i, 1);
        break;
      }
    }

    // Descargas aleatórias
    if (!s.removeAt && Math.random() < 0.005) {
      const nearby = sparks.filter(
        (o) => o !== s && Math.hypot(o.x - s.x, o.y - s.y) < 80
      );
      const targets = nearby.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4));
      for (const t of targets) {
        const path = createLightningPath(s.x, s.y, t.x, t.y);
        rays.push({
          x1: s.x,
          y1: s.y,
          x2: t.x,
          y2: t.y,
          life: 10,
          maxLife: 10,
          opacity: 0.5,
          path,
        });
        t.hits++;
        if (t.hits >= 3) {
          nodes.push({
            x: t.x,
            y: t.y,
            createdAt: now,
            radius: 100,
            persistent: false,
          });
        }
        t.removeAt = now + 1000;
      }
    }

    const alpha = s.life / s.maxLife;
    ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
    ctx.fill();

    if ((s.removeAt && now > s.removeAt) || s.life <= 0) sparks.splice(i, 1);
  }

  // Raios
  for (let i = rays.length - 1; i >= 0; i--) {
    const r = rays[i];
    r.life--;
    const alpha = (r.life / r.maxLife) * r.opacity;

    ctx.strokeStyle = `rgba(150, 220, 255, ${alpha})`;
    ctx.lineWidth = 0.6;
    ctx.shadowColor = `rgba(150, 220, 255, ${alpha})`;
    ctx.shadowBlur = 4;

    ctx.beginPath();
    if (r.path) {
      ctx.moveTo(r.path[0][0], r.path[0][1]);
      for (let j = 1; j < r.path.length; j++) {
        ctx.lineTo(r.path[j][0], r.path[j][1]);
      }
    } else {
      ctx.moveTo(r.x1, r.y1);
      ctx.lineTo(r.x2, r.y2);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    if (r.life <= 0) rays.splice(i, 1);
  }

  requestAnimationFrame(draw);
};

draw();

return () => {
  window.removeEventListener("resize", resize);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("mousedown", handleMouseDown);
  window.removeEventListener("mouseup", handleMouseUp);
};

}, []);

return ( <canvas ref={canvasRef} className="fixed inset-0 w-full h-full -z-10 pointer-events-none" style={{ background: "linear-gradient(135deg, #050f1a 0%, #0a1525 50%, #0f1b2e 100%)", }} /> ); }


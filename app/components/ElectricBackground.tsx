"use client";

import { useEffect, useRef } from "react";

interface Spark { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; radius: number; }

interface Ray { fromX: number; fromY: number; toX: number; toY: number; life: number; trail: { x: number; y: number }[]; }

interface EnergyMatrix { x: number; y: number; time: number; pulsePhase: number; gridSize: number; life: number; }

export default function ElectricBackground() { const canvasRef = useRef<HTMLCanvasElement>(null); const animationId = useRef<number | null>(null);

useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return;

let width = window.innerWidth;
let height = window.innerHeight;
canvas.width = width;
canvas.height = height;

const sparks: Spark[] = [];
const rays: Ray[] = [];
const matrices: EnergyMatrix[] = [];

function spawnSpark(x: number, y: number) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 1.5 + 0.5;
  sparks.push({
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 60 + Math.random() * 60,
    maxLife: 60 + Math.random() * 60,
    radius: Math.random() * 2 + 1,
  });
}

function spawnRay(fromX: number, fromY: number, toX: number, toY: number) {
  const trail = [];
  const steps = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const x = fromX + (toX - fromX) * t + (Math.random() - 0.5) * 20;
    const y = fromY + (toY - fromY) * t + (Math.random() - 0.5) * 20;
    trail.push({ x, y });
  }
  rays.push({ fromX, fromY, toX, toY, life: 10, trail });
}

function spawnMatrix(x: number, y: number) {
  if (matrices.length >= 10) return;
  matrices.push({
    x,
    y,
    time: 0,
    pulsePhase: Math.random() * Math.PI * 2,
    gridSize: 20 + Math.random() * 30,
    life: 600,
  });
}

function drawMatrix(matrix: EnergyMatrix) {
  if (!ctx) return;
  const radius =
    matrix.gridSize * (0.8 + 0.3 * Math.sin(matrix.pulsePhase + matrix.time));
  ctx.beginPath();
  ctx.arc(matrix.x, matrix.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 200, 255, 0.15)";
  ctx.fill();

  ctx.strokeStyle = "rgba(0, 200, 255, 0.4)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(matrix.x, matrix.y, radius, 0, Math.PI * 2);
  ctx.stroke();
}

function animate() {
  if (!ctx) return;

  ctx.clearRect(0, 0, width, height);

  for (const matrix of matrices) {
    drawMatrix(matrix);
    matrix.time += 0.05;
    matrix.life--;

    // Sugando faíscas
    sparks.forEach((spark) => {
      const dx = matrix.x - spark.x;
      const dy = matrix.y - spark.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        spark.vx += dx * 0.002;
        spark.vy += dy * 0.002;
      }
    });

    // Disparar raios aleatórios em faíscas
    if (Math.random() < 0.05) {
      const nearby = sparks.filter(
        (s) => Math.hypot(matrix.x - s.x, matrix.y - s.y) < 150
      );
      if (nearby.length > 0) {
        const target = nearby[Math.floor(Math.random() * nearby.length)];
        spawnRay(matrix.x, matrix.y, target.x, target.y);
        target.life += 30;
      }
    }
  }
  matrices.filter((m) => m.life > 0);

  for (const ray of rays) {
    ctx.beginPath();
    ctx.moveTo(ray.fromX, ray.fromY);
    for (const point of ray.trail) ctx.lineTo(point.x, point.y);
    ctx.lineTo(ray.toX, ray.toY);
    ctx.strokeStyle = `rgba(0,255,255,${ray.life / 10})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ray.life--;
  }
  rays.splice(0, rays.filter((r) => r.life <= 0).length);

  for (const spark of sparks) {
    spark.x += spark.vx;
    spark.y += spark.vy;
    spark.life--;

    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,255,255,${spark.life / spark.maxLife})`;
    ctx.fill();

    // Chance aleatória de criar raio
    if (Math.random() < 0.01) {
      const candidates = sparks.filter(
        (s) => s !== spark && Math.hypot(s.x - spark.x, s.y - spark.y) < 100
      );
      const count = Math.floor(Math.random() * 5);
      for (let i = 0; i < count && i < candidates.length; i++) {
        spawnRay(spark.x, spark.y, candidates[i].x, candidates[i].y);
      }
    }
  }
  sparks.splice(0, sparks.filter((s) => s.life <= 0).length);

  animationId.current = requestAnimationFrame(animate);
}

canvas.addEventListener("mousemove", (e) => {
  for (let i = 0; i < 3; i++) {
    spawnSpark(e.clientX, e.clientY);
  }
});

canvas.addEventListener("click", (e) => {
  spawnMatrix(e.clientX, e.clientY);
});

animate();

const handleResize = () => {
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = width;
  canvas.height = height;
};

window.addEventListener("resize", handleResize);

return () => {
  if (animationId.current !== null) cancelAnimationFrame(animationId.current);
  window.removeEventListener("resize", handleResize);
};

}, []);

return ( <canvas ref={canvasRef} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: -1, }} /> ); }


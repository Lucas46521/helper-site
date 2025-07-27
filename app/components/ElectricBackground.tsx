"use client";

import { useEffect, useRef } from "react";

interface Spark { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; }

interface MicroRay { x1: number; y1: number; x2: number; y2: number; alpha: number; life: number; maxLife: number; }

interface EnergyMatrix { x: number; y: number; time: number; pulsePhase: number; gridSize: number; }

export default function ElectricBackground() { const canvasRef = useRef<HTMLCanvasElement>(null); const animationId = useRef<number | null>(null); const sparks = useRef<Spark[]>([]); const rays = useRef<MicroRay[]>([]); const matrices = useRef<EnergyMatrix[]>([]); const lastMatrixTime = useRef<number>(0);

useEffect(() => { const canvas = canvasRef.current; if (!canvas) return;

const ctx = canvas.getContext("2d");
if (!ctx) return;

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

const generateSpark = (x: number, y: number) => {
  sparks.current.push({
    x,
    y,
    vx: (Math.random() - 0.5) * 2,
    vy: (Math.random() - 0.5) * 2,
    life: 0,
    maxLife: 60 + Math.random() * 60,
  });
};

const generateRay = (x1: number, y1: number, x2: number, y2: number) => {
  rays.current.push({
    x1,
    y1,
    x2,
    y2,
    alpha: 1,
    life: 0,
    maxLife: 20 + Math.random() * 20,
  });
};

const generateMatrix = (x: number, y: number) => {
  if (matrices.current.length >= 10) return;

  matrices.current.push({
    x,
    y,
    time: 0,
    pulsePhase: Math.random() * Math.PI * 2,
    gridSize: 25 + Math.random() * 15,
  });
};

const drawMatrix = (matrix: EnergyMatrix) => {
  if (!ctx) return;

  const radius = matrix.gridSize * (0.8 + 0.3 * Math.sin(matrix.pulsePhase + matrix.time));
  ctx.beginPath();
  ctx.arc(matrix.x, matrix.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 200, 255, 0.15)";
  ctx.fill();
};

const animate = () => {
  if (!ctx) return;
  ctx.clearRect(0, 0, width, height);

  const now = Date.now();
  if (now - lastMatrixTime.current > 1000 + Math.random() * 1000 && matrices.current.length < 10) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    generateMatrix(x, y);
    lastMatrixTime.current = now;
  }

  for (const matrix of matrices.current) {
    matrix.time += 0.05;
    drawMatrix(matrix);
  }

  for (let i = sparks.current.length - 1; i >= 0; i--) {
    const s = sparks.current[i];
    s.x += s.vx;
    s.y += s.vy;
    s.life++;

    ctx.beginPath();
    ctx.arc(s.x, s.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0, 150, 255, ${1 - s.life / s.maxLife})`;
    ctx.fill();

    if (Math.random() < 0.02) {
      const nearby = sparks.current.filter(
        other => other !== s && Math.hypot(other.x - s.x, other.y - s.y) < 50
      );
      const target = nearby[Math.floor(Math.random() * nearby.length)];
      if (target) generateRay(s.x, s.y, target.x, target.y);
    }

    if (s.life >= s.maxLife) sparks.current.splice(i, 1);
  }

  for (let i = rays.current.length - 1; i >= 0; i--) {
    const r = rays.current[i];
    r.life++;
    r.alpha = 1 - r.life / r.maxLife;

    ctx.strokeStyle = `rgba(0, 255, 255, ${r.alpha})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(r.x1, r.y1);
    ctx.lineTo(r.x2, r.y2);
    ctx.stroke();

    if (r.life >= r.maxLife) rays.current.splice(i, 1);
  }

  animationId.current = requestAnimationFrame(animate);
};

const handleMouseMove = (e: MouseEvent) => {
  generateSpark(e.clientX, e.clientY);
};

const handleClick = (e: MouseEvent) => {
  generateMatrix(e.clientX, e.clientY);
};

window.addEventListener("mousemove", handleMouseMove);
window.addEventListener("click", handleClick);

animate();

return () => {
  if (animationId.current !== null) cancelAnimationFrame(animationId.current);
  window.removeEventListener("mousemove", handleMouseMove);
  window.removeEventListener("click", handleClick);
};

}, []);

return ( <canvas
ref={canvasRef}
className="fixed top-0 left-0 w-full h-full z-[-1] pointer-events-none"
/> ); }


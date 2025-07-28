"use client";

import { useEffect, useRef } from "react";

interface Spark { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; isNode?: boolean; hits?: number; createdAt: number; }

interface MicroRay { x1: number; y1: number; x2: number; y2: number; life: number; maxLife: number; }

interface EnergyMatrix { x: number; y: number; time: number; pulsePhase: number; gridSize: number; }

export default function ElectricBackground() { const canvasRef = useRef<HTMLCanvasElement>(null); const animationId = useRef<number | null>(null); const sparks = useRef<Spark[]>([]); const rays = useRef<MicroRay[]>([]); const matrices = useRef<EnergyMatrix[]>([]); const maxMatrices = 10;

useEffect(() => { const canvas = canvasRef.current; if (!canvas) return; const ctx = canvas.getContext("2d"); if (!ctx) return;

const dpr = window.devicePixelRatio || 1;
canvas.width = window.innerWidth * dpr;
canvas.height = window.innerHeight * dpr;
ctx.scale(dpr, dpr);

const width = canvas.width / dpr;
const height = canvas.height / dpr;

const createSpark = (x: number, y: number, isNode = false) => {
  return {
    x,
    y,
    vx: Math.random() * 2 - 1,
    vy: Math.random() * 2 - 1,
    life: 0,
    maxLife: 60 + Math.random() * 60,
    isNode,
    hits: 0,
    createdAt: Date.now(),
  } as Spark;
};

const createRay = (x1: number, y1: number, x2: number, y2: number) => {
  return {
    x1,
    y1,
    x2,
    y2,
    life: 0,
    maxLife: 15 + Math.random() * 10,
  } as MicroRay;
};

const createMatrix = (x: number, y: number): EnergyMatrix => {
  return {
    x,
    y,
    time: 0,
    pulsePhase: Math.random() * Math.PI * 2,
    gridSize: 12 + Math.random() * 6,
  };
};

const drawMatrix = (matrix: EnergyMatrix) => {
  if (!ctx) return;
  const radius =
    matrix.gridSize * (0.8 + 0.3 * Math.sin(matrix.pulsePhase + matrix.time));
  ctx.beginPath();
  ctx.arc(matrix.x, matrix.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(0, 200, 255, 0.15)";
  ctx.fill();
};

const animate = () => {
  ctx.clearRect(0, 0, width, height);

  // Atualiza e desenha as matrizes
  matrices.current.forEach((matrix) => {
    matrix.time += 0.1;
    drawMatrix(matrix);
  });

  // Atualiza e desenha as faíscas
  sparks.current = sparks.current.filter((s) => s.life++ < s.maxLife);
  for (let spark of sparks.current) {
    spark.x += spark.vx;
    spark.y += spark.vy;

    ctx.beginPath();
    ctx.arc(spark.x, spark.y, spark.isNode ? 3 : 1.5, 0, Math.PI * 2);
    ctx.fillStyle = spark.isNode
      ? "rgba(0, 200, 255, 0.8)"
      : "rgba(0, 200, 255, 0.3)";
    ctx.fill();

    if (!spark.isNode && Math.random() < 0.03) {
      const nearby = sparks.current.filter(
        (s) =>
          s !== spark &&
          Math.hypot(s.x - spark.x, s.y - spark.y) < 50 &&
          !s.isNode
      );

      const hits = Math.floor(Math.random() * 4);
      for (let i = 0; i < hits && i < nearby.length; i++) {
        const target = nearby[i];
        rays.current.push(createRay(spark.x, spark.y, target.x, target.y));
        target.life = Math.max(target.life - 10, 0);
        target.hits = (target.hits || 0) + 1;

        if (target.hits > 2 && matrices.current.length < maxMatrices) {
          target.isNode = true;
          matrices.current.push(createMatrix(target.x, target.y));
        }
      }
    }
  }

  // Atualiza e desenha os raios
  rays.current = rays.current.filter((r) => r.life++ < r.maxLife);
  for (let ray of rays.current) {
    ctx.beginPath();
    ctx.moveTo(ray.x1, ray.y1);
    ctx.lineTo(ray.x2, ray.y2);
    ctx.strokeStyle = "rgba(0, 255, 255, 0.5)";
    ctx.lineWidth = 1 + Math.random();
    ctx.stroke();
  }

  animationId.current = requestAnimationFrame(animate);
};

const handleClick = (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  if (matrices.current.length < maxMatrices) {
    matrices.current.push(createMatrix(x, y));
  }
};

const handleMove = (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  sparks.current.push(createSpark(x, y));
};

canvas.addEventListener("click", handleClick);
canvas.addEventListener("mousemove", handleMove);

animate();

return () => {
  if (animationId.current !== null) cancelAnimationFrame(animationId.current);
  canvas.removeEventListener("click", handleClick);
  canvas.removeEventListener("mousemove", handleMove);
};

}, []);

return ( <canvas ref={canvasRef} style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", zIndex: -1, }} /> ); }


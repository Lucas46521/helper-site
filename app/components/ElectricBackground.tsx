"use client";

import { useEffect, useRef } from "react";

interface EnergyMatrix {
  x: number;
  y: number;
  gridSize: number;
  rotation: number;
  pulsePhase: number;
  energy: number;
  time: number;
}

export default function ElectricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matrices: EnergyMatrix[] = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.scale(dpr, dpr);

    const matrixCount = Math.min(10, 10); // Máximo de 10 matrizes

    for (let i = 0; i < matrixCount; i++) {
      matrices.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        gridSize: 50 + Math.random() * 30,
        rotation: Math.random() * Math.PI * 2,
        pulsePhase: Math.random() * Math.PI * 2,
        energy: Math.random() * 100,
        time: 0,
      });
    }

    function drawMatrix(matrix: EnergyMatrix) {
      const radius =
        matrix.gridSize * (0.8 + 0.3 * Math.sin(matrix.pulsePhase + matrix.time));
      ctx.beginPath();
      ctx.arc(matrix.x, matrix.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0, 200, 255, 0.15)";
      ctx.fill();

      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI * 2 * i) / 6 + matrix.rotation;
        const length = radius + 20 * Math.sin(matrix.time + i);
        const x2 = matrix.x + Math.cos(angle) * length;
        const y2 = matrix.y + Math.sin(angle) * length;
        ctx.beginPath();
        ctx.moveTo(matrix.x, matrix.y);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.2 + 0.2 * Math.sin(matrix.time + i)})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    }

    let animationFrameId: number;
    function animate() {
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(animate);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      matrices.forEach((matrix) => {
        matrix.time += 0.02;
        matrix.pulsePhase += 0.015;
        drawMatrix(matrix);
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
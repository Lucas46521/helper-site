
"use client";

import { useEffect, useRef, useState } from "react";

export default function ElectricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPressed, setIsPressed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const mousePos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const animationId = useRef<number | null>(null);

  useEffect(() => {
    // Detect mobile
    setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const sparks: { 
      x: number; 
      y: number; 
      vx: number; 
      vy: number; 
      life: number; 
      hits: number;
      size: number;
      color: { r: number; g: number; b: number };
    }[] = [];

    const energyMatrices: { 
      x: number; 
      y: number; 
      time: number; 
      permanent: boolean;
      rotation: number;
      energy: number;
      pulsePhase: number;
      gridSize: number;
    }[] = [];

    const discharges: { 
      path: [number, number][]; 
      time: number;
      intensity: number;
    }[] = [];

    const attractionPoints: { x: number; y: number; strength: number }[] = [];

    function generateSpark(x: number, y: number, intensity = 1) {
      const count = Math.floor(intensity * 3) + 1;
      for (let i = 0; i < count; i++) {
        sparks.push({
          x: x + (Math.random() - 0.5) * 20,
          y: y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 4 * intensity,
          vy: (Math.random() - 0.5) * 4 * intensity,
          life: 30 + Math.random() * 70 * intensity,
          hits: 0,
          size: 1 + Math.random() * 2 * intensity,
          color: {
            r: 0 + Math.random() * 100,
            g: 200 + Math.random() * 55,
            b: 200 + Math.random() * 55
          }
        });
      }
    }

    function generateEnergyMatrix(x: number, y: number, autoRemove = true) {
      const matrix = { 
        x, 
        y, 
        time: 0, 
        permanent: !autoRemove,
        rotation: 0,
        energy: 100,
        pulsePhase: Math.random() * Math.PI * 2,
        gridSize: 15 + Math.random() * 10
      };
      energyMatrices.push(matrix);
      
      // Add attraction point
      attractionPoints.push({ x, y, strength: 50 });
      
      if (autoRemove) {
        setTimeout(() => {
          const matrixIndex = energyMatrices.indexOf(matrix);
          if (matrixIndex !== -1) {
            energyMatrices.splice(matrixIndex, 1);
            const attractionIndex = attractionPoints.findIndex(p => p.x === x && p.y === y);
            if (attractionIndex !== -1) attractionPoints.splice(attractionIndex, 1);
          }
        }, 5000);
      }
    }

    function createDischarge(from: { x: number; y: number }, to: { x: number; y: number }, intensity = 1) {
      discharges.push({
        path: generateLightningPath(from.x, from.y, to.x, to.y),
        time: Math.floor(5 + intensity * 3),
        intensity
      });
    }

    function generateLightningPath(x1: number, y1: number, x2: number, y2: number) {
      const path: [number, number][] = [];
      const distance = Math.hypot(x2 - x1, y2 - y1);
      const steps = Math.floor(distance / 15) + 5;
      
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const chaos = Math.sin(t * Math.PI) * 15;
        const dx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * chaos;
        const dy = y1 + (y2 - y1) * t + (Math.random() - 0.5) * chaos;
        path.push([dx, dy]);
      }
      return path;
    }

    function drawEnergyMatrix(matrix: typeof energyMatrices[0]) {
      ctx.save();
      ctx.translate(matrix.x, matrix.y);
      ctx.rotate(matrix.rotation);
      
      const pulse = 0.8 + 0.3 * Math.sin(matrix.pulsePhase + matrix.time * 0.1);
      const size = matrix.gridSize * pulse;
      
      // Outer glow
      ctx.shadowColor = `rgba(0, ${150 + matrix.energy}, 255, 0.8)`;
      ctx.shadowBlur = 30;
      
      // Matrix grid
      ctx.strokeStyle = `rgba(0, ${100 + matrix.energy}, 255, 0.7)`;
      ctx.lineWidth = 2;
      
      // Draw grid lines
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(-size, i * size / 2);
        ctx.lineTo(size, i * size / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(i * size / 2, -size);
        ctx.lineTo(i * size / 2, size);
        ctx.stroke();
      }
      
      // Central energy core
      ctx.beginPath();
      ctx.arc(0, 0, size / 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, ${200 + matrix.energy / 2}, 255, 0.8)`;
      ctx.fill();
      
      // Energy particles around matrix
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2 + matrix.time * 0.05;
        const radius = size * 0.7;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 255, ${150 + Math.sin(matrix.time * 0.1 + i) * 100}, 0.9)`;
        ctx.fill();
      }
      
      ctx.restore();
    }

    function draw() {
      if (!ctx) return;
      
      // Fade effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
      ctx.fillRect(0, 0, width, height);

      // Generate ambient sparks
      if (Math.random() < 0.15) {
        generateSpark(Math.random() * width, Math.random() * height, 0.3);
      }

      // Mouse interaction - generate sparks near mouse
      const mouseDistance = Math.hypot(mousePos.current.x - width/2, mousePos.current.y - height/2);
      if (mouseDistance < 200) {
        if (Math.random() < 0.4) {
          generateSpark(
            mousePos.current.x + (Math.random() - 0.5) * 100,
            mousePos.current.y + (Math.random() - 0.5) * 100,
            0.8
          );
        }
      }

      // Update and draw sparks
      sparks.forEach((s, i) => {
        // Attraction to energy matrices
        energyMatrices.forEach(matrix => {
          const dx = matrix.x - s.x;
          const dy = matrix.y - s.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 100 && dist > 5) {
            const force = 0.3 / dist;
            s.vx += dx * force;
            s.vy += dy * force;
          }
        });

        // Mouse attraction
        const mouseDx = mousePos.current.x - s.x;
        const mouseDy = mousePos.current.y - s.y;
        const mouseDist = Math.hypot(mouseDx, mouseDy);
        if (mouseDist < 150) {
          const mouseForce = isPressed ? 0.1 : 0.05;
          s.vx += mouseDx * mouseForce / mouseDist;
          s.vy += mouseDy * mouseForce / mouseDist;
        }

        s.x += s.vx;
        s.y += s.vy;
        s.life--;
        s.vx *= 0.99; // Friction
        s.vy *= 0.99;

        // Draw spark
        ctx.save();
        ctx.globalAlpha = s.life / 100;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgb(${s.color.r}, ${s.color.g}, ${s.color.b})`;
        ctx.shadowColor = `rgba(${s.color.r}, ${s.color.g}, ${s.color.b}, 0.8)`;
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.restore();

        // Spark interactions
        if (Math.random() < 0.02) {
          const nearby = sparks.filter(s2 => 
            s2 !== s && Math.hypot(s.x - s2.x, s.y - s2.y) < 80
          );
          if (nearby.length) {
            const target = nearby[Math.floor(Math.random() * nearby.length)];
            createDischarge(s, target, 0.7);
            target.hits++;
            if (target.hits >= 2) {
              generateEnergyMatrix(target.x, target.y);
              sparks.splice(sparks.indexOf(target), 1);
            } else {
              target.life += 20;
            }
          }
        }

        if (s.life <= 0) sparks.splice(i, 1);
      });

      // Update and draw discharges
      discharges.forEach((d, i) => {
        ctx.save();
        ctx.globalAlpha = d.time / 10;
        ctx.beginPath();
        ctx.moveTo(d.path[0][0], d.path[0][1]);
        for (let j = 1; j < d.path.length; j++) {
          ctx.lineTo(d.path[j][0], d.path[j][1]);
        }
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.8 * d.intensity})`;
        ctx.lineWidth = 1 + d.intensity;
        ctx.shadowColor = "rgba(0, 255, 255, 0.5)";
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.restore();

        d.time--;
        if (d.time <= 0) discharges.splice(i, 1);
      });

      // Update and draw energy matrices
      energyMatrices.forEach(matrix => {
        matrix.time++;
        matrix.rotation += 0.01;
        matrix.pulsePhase += 0.05;
        
        drawEnergyMatrix(matrix);

        // Matrix generates sparks occasionally
        if (Math.random() < 0.05) {
          generateSpark(
            matrix.x + (Math.random() - 0.5) * 40,
            matrix.y + (Math.random() - 0.5) * 40,
            0.6
          );
        }
      });

      animationId.current = requestAnimationFrame(draw);
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
      
      if (Math.random() < 0.3) {
        generateSpark(e.clientX, e.clientY, 0.8);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      mousePos.current.x = touch.clientX;
      mousePos.current.y = touch.clientY;
      
      generateSpark(touch.clientX, touch.clientY, 1.2);
    };

    const handleMouseDown = (e: MouseEvent) => {
      generateEnergyMatrix(e.clientX, e.clientY, false);
      setIsPressed(true);
      
      // Burst effect
      for (let i = 0; i < 8; i++) {
        generateSpark(
          e.clientX + (Math.random() - 0.5) * 60,
          e.clientY + (Math.random() - 0.5) * 60,
          1.5
        );
      }
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      generateEnergyMatrix(touch.clientX, touch.clientY, false);
      setIsPressed(true);
      
      // Burst effect
      for (let i = 0; i < 12; i++) {
        generateSpark(
          touch.clientX + (Math.random() - 0.5) * 80,
          touch.clientY + (Math.random() - 0.5) * 80,
          1.8
        );
      }
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleTouchEnd = (e: TouchEvent) => {
      e.preventDefault();
      setIsPressed(false);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    // Event listeners
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("touchmove", handleTouchMove, { passive: false });
    canvas.addEventListener("touchstart", handleTouchStart, { passive: false });
    canvas.addEventListener("touchend", handleTouchEnd, { passive: false });
    window.addEventListener("resize", handleResize);

    // Initialize with some energy matrices
    generateEnergyMatrix(width * 0.2, height * 0.3);
    generateEnergyMatrix(width * 0.8, height * 0.7);
    
    draw();

    return () => {
      if (animationId.current) {
        cancelAnimationFrame(animationId.current);
      }
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("resize", handleResize);
    };
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
        background: "black",
        touchAction: "none", // Prevent scrolling on mobile
      }}
      onMouseMove={(e) => {
        mousePos.current.x = e.clientX;
        mousePos.current.y = e.clientY;
      }}
    />
  );
}

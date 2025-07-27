
"use client";

import { useEffect, useRef, useState } from 'react';

interface Lightning {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  segments: { x: number; y: number }[];
  life: number;
  maxLife: number;
  intensity: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export default function ElectricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isMouseActive, setIsMouseActive] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const lightnings: Lightning[] = [];
    const particles: Particle[] = [];
    const electricNodes: { x: number; y: number; charge: number }[] = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize electric nodes
      electricNodes.length = 0;
      for (let i = 0; i < 8; i++) {
        electricNodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          charge: Math.random() * 100 + 50
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse event handlers
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      setMousePos({ 
        x: e.clientX - rect.left, 
        y: e.clientY - rect.top 
      });
      setIsMouseActive(true);
    };

    const handleMouseLeave = () => {
      setIsMouseActive(false);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      // Create lightning from click point
      createLightning(clickX, clickY, Math.random() * canvas.width, Math.random() * canvas.height, 200);
      
      // Create explosion particles
      for (let i = 0; i < 20; i++) {
        particles.push({
          x: clickX,
          y: clickY,
          vx: (Math.random() - 0.5) * 10,
          vy: (Math.random() - 0.5) * 10,
          life: 60,
          maxLife: 60,
          size: Math.random() * 3 + 1
        });
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    // Create lightning between two points
    const createLightning = (startX: number, startY: number, endX: number, endY: number, intensity: number = 100) => {
      const segments: { x: number; y: number }[] = [];
      const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      const numSegments = Math.floor(distance / 20) + 5;
      
      for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 40 * (1 - Math.abs(t - 0.5) * 2);
        const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 40 * (1 - Math.abs(t - 0.5) * 2);
        segments.push({ x, y });
      }

      lightnings.push({
        x: startX,
        y: startY,
        targetX: endX,
        targetY: endY,
        segments,
        life: 30,
        maxLife: 30,
        intensity
      });
    };

    // Generate random lightning
    const generateRandomLightning = () => {
      if (Math.random() < 0.02) {
        const startNode = electricNodes[Math.floor(Math.random() * electricNodes.length)];
        const endNode = electricNodes[Math.floor(Math.random() * electricNodes.length)];
        
        if (startNode !== endNode) {
          const distance = Math.sqrt((endNode.x - startNode.x) ** 2 + (endNode.y - startNode.y) ** 2);
          if (distance < 400) {
            createLightning(startNode.x, startNode.y, endNode.x, endNode.y, Math.random() * 150 + 50);
          }
        }
      }
    };

    // Generate mouse lightning
    const generateMouseLightning = () => {
      if (isMouseActive && Math.random() < 0.1) {
        const nearestNode = electricNodes.reduce((closest, node) => {
          const distToMouse = Math.sqrt((mousePos.x - node.x) ** 2 + (mousePos.y - node.y) ** 2);
          const distToClosest = Math.sqrt((mousePos.x - closest.x) ** 2 + (mousePos.y - closest.y) ** 2);
          return distToMouse < distToClosest ? node : closest;
        });

        if (Math.sqrt((mousePos.x - nearestNode.x) ** 2 + (mousePos.y - nearestNode.y) ** 2) < 200) {
          createLightning(nearestNode.x, nearestNode.y, mousePos.x, mousePos.y, 180);
        }
      }
    };

    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(10, 10, 10, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw electric nodes
      electricNodes.forEach(node => {
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 20);
        gradient.addColorStop(0, `rgba(6, 182, 212, ${node.charge / 200})`);
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 20, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing effect
        node.charge = 50 + Math.sin(Date.now() * 0.01 + node.x * 0.01) * 30;
      });

      // Draw mouse glow effect
      if (isMouseActive) {
        const gradient = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, 50);
        gradient.addColorStop(0, 'rgba(147, 51, 234, 0.3)');
        gradient.addColorStop(1, 'rgba(147, 51, 234, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 50, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw lightning
      lightnings.forEach((lightning, index) => {
        lightning.life--;
        
        if (lightning.life <= 0) {
          lightnings.splice(index, 1);
          return;
        }

        const alpha = lightning.life / lightning.maxLife;
        const intensity = lightning.intensity * alpha;

        // Draw main lightning bolt
        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 10;
        
        ctx.beginPath();
        lightning.segments.forEach((segment, i) => {
          if (i === 0) ctx.moveTo(segment.x, segment.y);
          else ctx.lineTo(segment.x, segment.y);
        });
        ctx.stroke();

        // Draw secondary branches
        if (Math.random() < 0.3) {
          const randomSegment = lightning.segments[Math.floor(Math.random() * lightning.segments.length)];
          const branchLength = 50;
          const branchX = randomSegment.x + (Math.random() - 0.5) * branchLength;
          const branchY = randomSegment.y + (Math.random() - 0.5) * branchLength;

          ctx.strokeStyle = `rgba(147, 51, 234, ${alpha * 0.6})`;
          ctx.lineWidth = 1;
          ctx.shadowBlur = 5;
          ctx.beginPath();
          ctx.moveTo(randomSegment.x, randomSegment.y);
          ctx.lineTo(branchX, branchY);
          ctx.stroke();
        }

        ctx.shadowBlur = 0;
      });

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life--;

        if (particle.life <= 0) {
          particles.splice(index, 1);
          return;
        }

        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = `rgba(6, 182, 212, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      });

      generateRandomLightning();
      generateMouseLightning();

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('click', handleClick);
    };
  }, [mousePos, isMouseActive]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 cursor-crosshair"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
    />
  );
}

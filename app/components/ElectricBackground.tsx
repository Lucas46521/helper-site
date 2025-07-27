'use client';
import { useEffect, useRef } from 'react';

export default function ElectricBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouse = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Verifica se o canvas é null
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      if (canvas) {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    function drawRay(x: number, y: number, length: number, angle: number, alpha: number) {
      ctx!.beginPath();
      ctx!.moveTo(x, y);
      ctx!.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx!.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
      ctx!.lineWidth = 1 + Math.random();
      ctx!.shadowBlur = 10;
      ctx!.shadowColor = '#00faff';
      ctx!.stroke();
    }

    function randomRay() {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const length = 40 + Math.random() * 60;
      const angle = Math.random() * Math.PI * 2;
      const alpha = 0.05 + Math.random() * 0.3;
      drawRay(x, y, length, angle, alpha);
    }

    function rayNearMouse() {
      if (mouse.current.x === null || mouse.current.y === null) return;

      const x = mouse.current.x + (Math.random() - 0.5) * 100;
      const y = mouse.current.y + (Math.random() - 0.5) * 100;
      const length = 60 + Math.random() * 40;
      const angle = Math.random() * Math.PI * 2;
      const alpha = 0.3 + Math.random() * 0.5;
      drawRay(x, y, length, angle, alpha);
    }

    let frame = 0;
    function animate() {
      frame++;
      // Limpa parcialmente para efeito de "persistência"
      ctx!.fillStyle = 'rgba(0, 0, 10, 0.1)';
      ctx!.fillRect(0, 0, width, height);

      for (let i = 0; i < 5; i++) randomRay();
      for (let i = 0; i < 3; i++) rayNearMouse();

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: -1,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  );
}
"use client";

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function ElectricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Particle[] = [];
    const particleCount = 50;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Bounce off edges
        if (particle.x <= 0 || particle.x >= canvas.width) particle.vx *= -1;
        if (particle.y <= 0 || particle.y >= canvas.height) particle.vy *= -1;

        // Draw particle
        ctx.fillStyle = '#06b6d4';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 100) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${1 - distance / 100})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.stroke();
          }
        });
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
    />
  );
}

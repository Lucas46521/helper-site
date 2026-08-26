"use client";

import React, { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  hue: number;
};

export default function BackgroundParticles(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const pointer = useRef<{ x: number; y: number; down: boolean } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.clientWidth;
    let height = canvas.clientHeight;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    const particles: Particle[] = [];
    const maxParticles = Math.min(120, Math.floor((width * height) / 14000));

    const rand = (min: number, max: number) => Math.random() * (max - min) + min;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: rand(-0.4, 0.4),
        vy: rand(-0.3, 0.3),
        size: rand(0.6, 3.2),
        hue: 170 + Math.random() * 30,
      });
    }

    const connectDistance = 120;

    const draw = () => {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      // background subtle radial glows (kept minimal)
      // particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // movement
        p.x += p.vx;
        p.y += p.vy;

        // wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // interaction: repulse from pointer
        if (pointer.current && !pointer.current.down) {
          const dx = p.x - pointer.current.x;
          const dy = p.y - pointer.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 110 && dist > 0.1) {
            const force = (110 - dist) / 110;
            p.vx += (dx / dist) * 0.6 * force;
            p.vy += (dy / dist) * 0.6 * force;
          }
        }

        // friction
        p.vx *= 0.98;
        p.vy *= 0.98;

        // draw particle
        ctx.beginPath();
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, 0.9)`;
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // links
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDistance) {
            const alpha = 1 - dist / connectDistance;
            ctx.beginPath();
            ctx.strokeStyle = `hsla(180, 60%, 60%, ${0.12 * alpha})`;
            ctx.lineWidth = 1 * alpha;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.current = { x: e.clientX - rect.left, y: e.clientY - rect.top, down: false };
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      // spawn a few particles outward
      for (let k = 0; k < 6; k++) {
        particles.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          size: rand(0.8, 3.2),
          hue: 170 + Math.random() * 30,
        });
      }
      // cap
      while (particles.length > Math.max(40, Math.floor((width * height) / 10000))) particles.shift();
    };

    const onPointerLeave = () => {
      pointer.current = null;
    };

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div className="particles-canvas" aria-hidden>
      <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}

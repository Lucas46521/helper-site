
'use client';
import { useEffect, useRef } from 'react';

export default function ElectricBackground() {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: null, y: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);

    const onMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    function drawRay(x, y, length, angle, alpha) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
      ctx.strokeStyle = `rgba(0, 200, 255, ${alpha})`;
      ctx.lineWidth = 1 + Math.random();
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00faff';
      ctx.stroke();
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
      ctx.fillStyle = 'rgba(0, 0, 10, 0.1)';
      ctx.fillRect(0, 0, width, height);

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

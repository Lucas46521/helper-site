import { useEffect, useRef, useState } from "react";

export default function ElectricBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return; // Verifica se canvas não é null
    const ctx = canvas.getContext("2d");
    if (!ctx) return; // Verifica se ctx não é null

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const sparks: { x: number; y: number; vx: number; vy: number; life: number; hits: number }[] = [];
    const nodes: { x: number; y: number; time: number; permanent: boolean }[] = [];
    const discharges: { path: [number, number][]; time: number }[] = [];

    function generateSpark(x: number, y: number) {
      sparks.push({
        x,
        y,
        vx: Math.random() * 2 - 1,
        vy: Math.random() * 2 - 1,
        life: 30 + Math.random() * 70,
        hits: 0,
      });
    }

    function generateNode(x: number, y: number, autoRemove = true) {
      const node = { x, y, time: 0, permanent: !autoRemove };
      nodes.push(node);
      if (autoRemove) {
        setTimeout(() => {
          const i = nodes.indexOf(node);
          if (i !== -1) nodes.splice(i, 1);
        }, 3000);
      }
    }

    function createDischarge(from: { x: number; y: number }, to: { x: number; y: number }) {
      discharges.push({
        path: generateLightningPath(from.x, from.y, to.x, to.y),
        time: 5,
      });
    }

    function generateLightningPath(x1: number, y1: number, x2: number, y2: number) {
      const path: [number, number][] = [];
      const steps = 10;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const dx = x1 + (x2 - x1) * t + (Math.random() - 0.5) * 10;
        const dy = y1 + (y2 - y1) * t + (Math.random() - 0.5) * 10;
        path.push([dx, dy]);
      }
      return path;
    }

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, width, height);

      if (Math.random() < 0.2) {
        generateSpark(Math.random() * width, Math.random() * height);
      }

      sparks.forEach((s, i) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life--;

        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, ${150 + Math.random() * 100}, 0.9)`;
        ctx.shadowColor = "rgba(0,255,255,0.8)";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;

        if (Math.random() < 0.01) {
          const near = sparks.filter(s2 => s2 !== s && Math.hypot(s.x - s2.x, s.y - s2.y) < 100);
          if (near.length) {
            const count = Math.floor(Math.random() * 4);
            for (let j = 0; j < count; j++) {
              const target = near[Math.floor(Math.random() * near.length)];
              createDischarge(s, target);
              target.hits++;
              if (target.hits >= 3) {
                generateNode(target.x, target.y);
                sparks.splice(sparks.indexOf(target), 1);
              } else {
                target.life += 30;
              }
            }
          }
        }

        if (s.life <= 0) sparks.splice(i, 1);
      });

      discharges.forEach((d, i) => {
        ctx.beginPath();
        ctx.moveTo(d.path[0][0], d.path[0][1]);
        for (let j = 1; j < d.path.length; j++) {
          ctx.lineTo(d.path[j][0], d.path[j][1]);
        }
        ctx.strokeStyle = "rgba(0,255,255,0.7)";
        ctx.lineWidth = 1;
        ctx.stroke();

        d.time--;
        if (d.time <= 0) discharges.splice(i, 1);
      });

      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, 10, 0, Math.PI * 2);
        ctx.strokeStyle = "cyan";
        ctx.lineWidth = 2;
        ctx.shadowColor = "cyan";
        ctx.shadowBlur = 20;
        ctx.stroke();
        ctx.shadowBlur = 0;

        sparks.forEach((s, i) => {
          const dist = Math.hypot(n.x - s.x, n.y - s.y);
          if (dist < 80) {
            s.vx += (n.x - s.x) * 0.02;
            s.vy += (n.y - s.y) * 0.02;
            if (dist < 10) sparks.splice(i, 1);
          }
        });
      });

      requestAnimationFrame(draw);
    }

    const handleMouseMove = (e: MouseEvent) => {
      for (let i = 0; i < 4; i++) {
        generateSpark(e.clientX, e.clientY);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      generateNode(e.clientX, e.clientY, false);
      setIsPressed(true);
    };

    const handleMouseUp = () => {
      setIsPressed(false);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);

    draw();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPressed) return;
      const { x, y } = lastMouse.current;
      if (x !== null && y !== null) {
        generateNode(x, y, false);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [isPressed]);

  const lastMouse = useRef({ x: null, y: null }).current;

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
      }}
      onMouseMove={(e) => {
        lastMouse.x = e.clientX;
        lastMouse.y = e.clientY;
      }}
    />
  );
}
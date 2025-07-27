
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

interface DataNode {
  x: number;
  y: number;
  size: number;
  pulse: number;
  connections: number[];
  type: 'cpu' | 'memory' | 'network' | 'storage';
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
    const dataNodes: DataNode[] = [];

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      
      // Initialize processing nodes
      dataNodes.length = 0;
      const nodeTypes: DataNode['type'][] = ['cpu', 'memory', 'network', 'storage'];
      
      for (let i = 0; i < 6; i++) {
        dataNodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 8 + 12,
          pulse: Math.random() * Math.PI * 2,
          connections: [],
          type: nodeTypes[Math.floor(Math.random() * nodeTypes.length)]
        });
      }

      // Create connections between nearby nodes
      dataNodes.forEach((node, index) => {
        dataNodes.forEach((otherNode, otherIndex) => {
          if (index !== otherIndex) {
            const distance = Math.sqrt((node.x - otherNode.x) ** 2 + (node.y - otherNode.y) ** 2);
            if (distance < 300 && Math.random() < 0.4) {
              node.connections.push(otherIndex);
            }
          }
        });
      });
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
      
      // Create data pulse from click point
      createLightning(clickX, clickY, Math.random() * canvas.width, Math.random() * canvas.height, 150);
      
      // Create digital particles
      for (let i = 0; i < 15; i++) {
        particles.push({
          x: clickX,
          y: clickY,
          vx: (Math.random() - 0.5) * 8,
          vy: (Math.random() - 0.5) * 8,
          life: 45,
          maxLife: 45,
          size: Math.random() * 2 + 1
        });
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('click', handleClick);

    // Create thin lightning between two points
    const createLightning = (startX: number, startY: number, endX: number, endY: number, intensity: number = 100) => {
      const segments: { x: number; y: number }[] = [];
      const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
      const numSegments = Math.floor(distance / 15) + 3;
      
      for (let i = 0; i <= numSegments; i++) {
        const t = i / numSegments;
        const x = startX + (endX - startX) * t + (Math.random() - 0.5) * 20 * (1 - Math.abs(t - 0.5) * 2);
        const y = startY + (endY - startY) * t + (Math.random() - 0.5) * 20 * (1 - Math.abs(t - 0.5) * 2);
        segments.push({ x, y });
      }

      lightnings.push({
        x: startX,
        y: startY,
        targetX: endX,
        targetY: endY,
        segments,
        life: 20,
        maxLife: 20,
        intensity
      });
    };

    // Generate data transmission
    const generateDataTransmission = () => {
      if (Math.random() < 0.03) {
        dataNodes.forEach((node, index) => {
          if (node.connections.length > 0 && Math.random() < 0.2) {
            const targetIndex = node.connections[Math.floor(Math.random() * node.connections.length)];
            const targetNode = dataNodes[targetIndex];
            createLightning(node.x, node.y, targetNode.x, targetNode.y, Math.random() * 100 + 80);
          }
        });
      }
    };

    // Generate mouse interaction
    const generateMouseInteraction = () => {
      if (isMouseActive && Math.random() < 0.08) {
        const nearestNode = dataNodes.reduce((closest, node) => {
          const distToMouse = Math.sqrt((mousePos.x - node.x) ** 2 + (mousePos.y - node.y) ** 2);
          const distToClosest = Math.sqrt((mousePos.x - closest.x) ** 2 + (mousePos.y - closest.y) ** 2);
          return distToMouse < distToClosest ? node : closest;
        });

        if (Math.sqrt((mousePos.x - nearestNode.x) ** 2 + (mousePos.y - nearestNode.y) ** 2) < 150) {
          createLightning(nearestNode.x, nearestNode.y, mousePos.x, mousePos.y, 120);
        }
      }
    };

    // Draw processing node
    const drawProcessingNode = (node: DataNode) => {
      const time = Date.now() * 0.002;
      const pulseIntensity = Math.sin(time + node.pulse) * 0.3 + 0.7;
      
      // Node colors based on type
      const colors = {
        cpu: '#ff6b6b',
        memory: '#4ecdc4',
        network: '#45b7d1',
        storage: '#96ceb4'
      };

      // Outer glow
      const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.size * 2);
      gradient.addColorStop(0, `${colors[node.type]}40`);
      gradient.addColorStop(1, `${colors[node.type]}00`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * 2, 0, Math.PI * 2);
      ctx.fill();

      // Core node
      ctx.fillStyle = colors[node.type];
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * pulseIntensity * 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Inner core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * pulseIntensity * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Draw geometric patterns based on type
      ctx.strokeStyle = colors[node.type];
      ctx.lineWidth = 1;
      
      if (node.type === 'cpu') {
        // CPU: Circuit pattern
        const size = node.size * 1.5;
        ctx.beginPath();
        ctx.rect(node.x - size/2, node.y - size/2, size, size);
        ctx.moveTo(node.x - size/2, node.y);
        ctx.lineTo(node.x + size/2, node.y);
        ctx.moveTo(node.x, node.y - size/2);
        ctx.lineTo(node.x, node.y + size/2);
        ctx.stroke();
      } else if (node.type === 'memory') {
        // Memory: Stack pattern
        const size = node.size;
        for (let i = -2; i <= 2; i++) {
          ctx.beginPath();
          ctx.rect(node.x - size, node.y + i * 3 - 1, size * 2, 2);
          ctx.stroke();
        }
      } else if (node.type === 'network') {
        // Network: Hexagon
        const size = node.size;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          const x = node.x + Math.cos(angle) * size;
          const y = node.y + Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      } else if (node.type === 'storage') {
        // Storage: Database cylinder
        const size = node.size;
        ctx.beginPath();
        ctx.ellipse(node.x, node.y - size/2, size, size/3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(node.x, node.y + size/2, size, size/3, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(node.x - size, node.y - size/2);
        ctx.lineTo(node.x - size, node.y + size/2);
        ctx.moveTo(node.x + size, node.y - size/2);
        ctx.lineTo(node.x + size, node.y + size/2);
        ctx.stroke();
      }
    };

    const animate = () => {
      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(5, 5, 15, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw processing nodes
      dataNodes.forEach(node => {
        drawProcessingNode(node);
      });

      // Draw mouse interaction area
      if (isMouseActive) {
        const gradient = ctx.createRadialGradient(mousePos.x, mousePos.y, 0, mousePos.x, mousePos.y, 40);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, 40, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update and draw lightning (thin data streams)
      lightnings.forEach((lightning, index) => {
        lightning.life--;
        
        if (lightning.life <= 0) {
          lightnings.splice(index, 1);
          return;
        }

        const alpha = lightning.life / lightning.maxLife;
        
        // Draw main data stream (very thin)
        ctx.strokeStyle = `rgba(100, 200, 255, ${alpha * 0.8})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = '#64c8ff';
        ctx.shadowBlur = 3;
        
        ctx.beginPath();
        lightning.segments.forEach((segment, i) => {
          if (i === 0) ctx.moveTo(segment.x, segment.y);
          else ctx.lineTo(segment.x, segment.y);
        });
        ctx.stroke();

        // Draw data packets (small moving dots)
        const packetCount = 3;
        for (let i = 0; i < packetCount; i++) {
          const t = ((lightning.maxLife - lightning.life) / lightning.maxLife + i / packetCount) % 1;
          const segmentIndex = Math.floor(t * (lightning.segments.length - 1));
          const segment = lightning.segments[segmentIndex];
          
          if (segment) {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(segment.x, segment.y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        ctx.shadowBlur = 0;
      });

      // Update and draw particles
      particles.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.95;
        particle.vy *= 0.95;
        particle.life--;

        if (particle.life <= 0) {
          particles.splice(index, 1);
          return;
        }

        const alpha = particle.life / particle.maxLife;
        ctx.fillStyle = `rgba(100, 200, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      });

      generateDataTransmission();
      generateMouseInteraction();

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
      style={{ background: 'linear-gradient(135deg, #050f1a 0%, #0a1525 50%, #0f1b2e 100%)' }}
    />
  );
}

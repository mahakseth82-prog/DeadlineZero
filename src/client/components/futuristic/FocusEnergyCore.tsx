import React, { useEffect, useRef, useState } from 'react';

interface FocusEnergyCoreProps {
  size?: number;
  isActive?: boolean;
}

export const FocusEnergyCore: React.FC<FocusEnergyCoreProps> = ({ size = 260, isActive = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = size * window.devicePixelRatio);
    let height = (canvas.height = size * window.devicePixelRatio);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const centerX = size / 2;
    const centerY = size / 2;
    const crystalHeight = size * 0.28;
    const crystalWidth = size * 0.14;

    // Meditative floating ambient particles rising upwards
    interface FocusParticle {
      x: number;
      y: number;
      size: number;
      vy: number;
      alpha: number;
      limitY: number;
    }

    const particles: FocusParticle[] = [];
    const maxParticles = 25;

    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: centerX + (Math.random() - 0.5) * (size * 0.4),
        y: centerY + (Math.random() - 0.2) * (size * 0.3),
        size: Math.random() * 1.5 + 0.5,
        vy: -(Math.random() * 0.2 + 0.1),
        alpha: Math.random() * 0.3 + 0.1,
        limitY: centerY - (Math.random() * 0.4 + 0.1) * size,
      });
    }

    let time = 0;

    const drawCore = () => {
      ctx.clearRect(0, 0, size, size);

      time += isActive ? 1 : 0.2; // Slow down when inactive

      const breathFactor = Math.sin(time * 0.015);
      const floatY = centerY + Math.sin(time * 0.02) * 5;
      const crystalScale = 1 + breathFactor * 0.04;

      // 1. Core ambient light emission
      const coreLight = ctx.createRadialGradient(centerX, floatY, 0, centerX, floatY, size * 0.45);
      coreLight.addColorStop(0, 'rgba(99, 102, 241, 0.08)');
      coreLight.addColorStop(0.5, 'rgba(167, 139, 250, 0.02)');
      coreLight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = coreLight;
      ctx.beginPath();
      ctx.arc(centerX, floatY, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      // 2. Rising Focus Energy Particles
      particles.forEach((p) => {
        p.y += p.vy * (isActive ? 1.0 : 0.4);
        
        // Reset particle if it reaches limit or turns transparent
        if (p.y < p.limitY) {
          p.x = centerX + (Math.random() - 0.5) * (size * 0.45);
          p.y = centerY + (Math.random() - 0.2) * (size * 0.25);
          p.alpha = Math.random() * 0.35 + 0.1;
        }

        ctx.fillStyle = `rgba(167, 139, 250, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y + Math.sin(time * 0.01 + p.x) * 3, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Floating Meditative Coordinate Rings
      ctx.lineWidth = 0.5;

      // Outer wide ring
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.08)';
      ctx.beginPath();
      ctx.ellipse(centerX, floatY, size * 0.4, size * 0.1, -Math.PI / 12, 0, Math.PI * 2);
      ctx.stroke();

      // Core spinning ring with fine increments
      const ringAngle = time * 0.006;
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.2)';
      ctx.beginPath();
      ctx.ellipse(centerX, floatY, size * 0.32, size * 0.075, Math.PI / 16, 0, Math.PI * 2);
      ctx.stroke();

      // Accent dash on core spinning ring
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.65)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(centerX, floatY, size * 0.32, size * 0.075, Math.PI / 16, ringAngle, ringAngle + Math.PI * 0.35);
      ctx.stroke();

      // 4. Draw crystal vector octahedron (3D wireframe feel)
      ctx.lineWidth = 1;
      const crystalTopY = floatY - (crystalHeight / 2) * crystalScale;
      const crystalBottomY = floatY + (crystalHeight / 2) * crystalScale;
      const crystalRadiusX = (crystalWidth / 2) * crystalScale;

      // Calculate rotating vertices for 3D crystal rotation
      const numVertices = 4;
      const verticesX: number[] = [];
      const verticesZ: number[] = [];
      const crystalAngle = time * 0.004;

      for (let i = 0; i < numVertices; i++) {
        const vertAngle = crystalAngle + (i * Math.PI * 2) / numVertices;
        verticesX.push(Math.cos(vertAngle) * crystalRadiusX);
        verticesZ.push(Math.sin(vertAngle) * crystalRadiusX); // -crystalRadiusX to +crystalRadiusX
      }

      // Draw faces & lines (Depth sorted)
      // Back vertices (z < 0) are drawn with dimmer opacity
      for (let i = 0; i < numVertices; i++) {
        const nextIdx = (i + 1) % numVertices;
        const zMid = (verticesZ[i] + verticesZ[nextIdx]) / 2;
        const isBack = zMid < 0;

        ctx.strokeStyle = isBack ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.55)';
        ctx.fillStyle = isBack ? 'rgba(99, 102, 241, 0.02)' : 'rgba(99, 102, 241, 0.07)';

        const px1 = centerX + verticesX[i];
        const px2 = centerX + verticesX[nextIdx];

        // Draw top pyramid face
        ctx.beginPath();
        ctx.moveTo(centerX, crystalTopY);
        ctx.lineTo(px1, floatY);
        ctx.lineTo(px2, floatY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Draw bottom pyramid face
        ctx.beginPath();
        ctx.moveTo(centerX, crystalBottomY);
        ctx.lineTo(px1, floatY);
        ctx.lineTo(px2, floatY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Draw vertical inner energy spine
      ctx.save();
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#818cf8';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, crystalTopY + 8);
      ctx.lineTo(centerX, crystalBottomY - 8);
      ctx.stroke();
      ctx.restore();

      // Top specular glow tip
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#c084fc';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(centerX, crystalTopY, 2.5, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(drawCore);
    };

    drawCore();

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = size * window.devicePixelRatio;
      height = canvas.height = size * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [size, isActive, hovered]);

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={`absolute inset-0 bg-indigo-500/5 blur-[50px] rounded-full scale-100 transition-transform duration-1000 ${
        isActive ? 'animate-pulse' : ''
      }`} />
      <canvas
        id="focus-energy-core-canvas"
        ref={canvasRef}
        className="relative z-10 transition-transform duration-500 cursor-pointer hover:scale-105"
      />
    </div>
  );
};

import React, { useEffect, useRef, useState } from 'react';

interface AiAssistantOrbProps {
  size?: number;
  interactive?: boolean;
}

export const AiAssistantOrb: React.FC<AiAssistantOrbProps> = ({ size = 220, interactive = true }) => {
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
    const baseRadius = size * 0.32;

    // Orbiting particle class
    class OrbitingParticle {
      angle: number;
      speed: number;
      radiusX: number;
      radiusY: number;
      size: number;
      color: string;
      offsetZ: number;

      constructor(index: number) {
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.015 + Math.random() * 0.015;
        this.radiusX = baseRadius * (1.1 + Math.random() * 0.4);
        this.radiusY = baseRadius * (0.3 + Math.random() * 0.2);
        this.size = 1 + Math.random() * 2;
        this.color = index % 2 === 0 ? 'rgba(167, 139, 250, 0.8)' : 'rgba(96, 165, 250, 0.8)';
        this.offsetZ = (Math.random() - 0.5) * 15;
      }

      update(intensity: number) {
        this.angle += this.speed * intensity;
      }

      draw(c: CanvasRenderingContext2D, rot: number) {
        // Project onto 2D plane with rotation
        const cosA = Math.cos(this.angle);
        const sinA = Math.sin(this.angle);

        // Simple 3D rotation projection
        const rawX = cosA * this.radiusX;
        const rawY = sinA * this.radiusY + this.offsetZ;

        // Apply rotation of the orbit plane
        const rx = rawX * Math.cos(rot) - rawY * Math.sin(rot);
        const ry = rawX * Math.sin(rot) + rawY * Math.cos(rot);

        const px = centerX + rx;
        const py = centerY + ry;

        // Depth sorting effect (simple size/alpha scaling based on position)
        const depth = sinA; // -1 (back) to 1 (front)
        const finalSize = this.size * (1 + depth * 0.3);
        const finalAlpha = 0.3 + (depth + 1) * 0.35;

        c.fillStyle = this.color.replace('0.8', finalAlpha.toFixed(2));
        c.beginPath();
        c.arc(px, py, finalSize, 0, Math.PI * 2);
        c.fill();

        // Glowing connection lines if close
        if (depth > 0) {
          c.shadowBlur = 4;
          c.shadowColor = '#818cf8';
          c.fillStyle = `rgba(255, 255, 255, ${finalAlpha * 0.8})`;
          c.beginPath();
          c.arc(px, py, finalSize * 0.6, 0, Math.PI * 2);
          c.fill();
          c.shadowBlur = 0;
        }
      }
    }

    const particles: OrbitingParticle[] = [];
    for (let i = 0; i < 16; i++) {
      particles.push(new OrbitingParticle(i));
    }

    let time = 0;

    const drawOrb = () => {
      ctx.clearRect(0, 0, size, size);

      time += 1;
      const pulseFactor = hovered ? 1.5 : 1.0;
      const breathing = Math.sin(time * 0.02) * 3;
      const radius = baseRadius + breathing * (hovered ? 1.2 : 0.6);

      // 1. Draw outermost background glow
      const bgGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.6);
      bgGlow.addColorStop(0, 'rgba(124, 58, 237, 0.12)');
      bgGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.05)');
      bgGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bgGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Orbiting back particles (depth < 0)
      particles.forEach((p) => {
        if (Math.sin(p.angle) <= 0) {
          p.update(pulseFactor);
          p.draw(ctx, Math.PI / 12 + Math.sin(time * 0.005) * 0.1);
        }
      });

      // 3. Draw outer glass rim / glow
      ctx.shadowBlur = hovered ? 25 : 15;
      ctx.shadowColor = 'rgba(139, 92, 246, 0.4)';
      ctx.lineWidth = 1.5;
      
      const rimGrad = ctx.createLinearGradient(centerX - radius, centerY - radius, centerX + radius, centerY + radius);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      rimGrad.addColorStop(0.3, 'rgba(167, 139, 250, 0.15)');
      rimGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.05)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      
      ctx.strokeStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset

      // 4. Draw Core energy sphere (nested radial gradients simulating a liquid/gas energy core)
      const coreX = centerX + Math.cos(time * 0.03) * 2.5;
      const coreY = centerY + Math.sin(time * 0.025) * 2.5;

      const innerCoreGrad = ctx.createRadialGradient(
        coreX, coreY, 0, 
        coreX, coreY, radius * 0.85
      );
      innerCoreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
      innerCoreGrad.addColorStop(0.15, 'rgba(196, 181, 253, 0.85)'); // Purple core
      innerCoreGrad.addColorStop(0.4, 'rgba(124, 58, 237, 0.5)'); // Dark purple
      innerCoreGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.25)'); // Blue outer
      innerCoreGrad.addColorStop(0.95, 'rgba(30, 41, 59, 0.05)'); // Translucent edge
      innerCoreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = innerCoreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 0.98, 0, Math.PI * 2);
      ctx.fill();

      // 5. Drawing specular reflections / highlights to give glass feel
      const specGrad = ctx.createLinearGradient(
        centerX - radius * 0.5, centerY - radius * 0.5,
        centerX + radius * 0.2, centerY + radius * 0.2
      );
      specGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      specGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.02)');
      specGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = specGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Sub-crescent reflection highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX - 1.5, centerY - 1.5, radius - 4, Math.PI * 1.1, Math.PI * 1.6);
      ctx.stroke();

      // 6. Draw Orbiting front particles (depth > 0)
      particles.forEach((p) => {
        if (Math.sin(p.angle) > 0) {
          p.update(pulseFactor);
          p.draw(ctx, Math.PI / 12 + Math.sin(time * 0.005) * 0.1);
        }
      });

      // 7. Draw circular HUD coordinate ring
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.06)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.25, 0, Math.PI * 2);
      ctx.stroke();

      // Draw tick marks on outer HUD coordinate ring
      ctx.strokeStyle = 'rgba(124, 58, 237, 0.18)';
      ctx.lineWidth = 1.5;
      const numTicks = 3;
      const tickLength = 5;
      for (let i = 0; i < numTicks; i++) {
        const angle = time * 0.005 + (i * Math.PI * 2) / numTicks;
        const outerR = radius * 1.25;
        const innerR = outerR - tickLength;
        const x1 = centerX + Math.cos(angle) * innerR;
        const y1 = centerY + Math.sin(angle) * innerR;
        const x2 = centerX + Math.cos(angle) * outerR;
        const y2 = centerY + Math.sin(angle) * outerR;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(drawOrb);
    };

    drawOrb();

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
  }, [size, hovered]);

  return (
    <div 
      className="relative flex items-center justify-center select-none"
      onMouseEnter={() => interactive && setHovered(true)}
      onMouseLeave={() => interactive && setHovered(false)}
    >
      {/* Absolute Ambient Background Pulsing Light */}
      <div 
        className={`absolute inset-0 bg-violet-500/10 dark:bg-violet-500/5 blur-[50px] rounded-full transition-all duration-700 ${
          hovered ? 'scale-125 opacity-100' : 'scale-95 opacity-50'
        }`}
      />
      <canvas
        id="futuristic-ai-orb-canvas"
        ref={canvasRef}
        className="relative z-10 transition-transform duration-500 ease-out cursor-pointer hover:scale-105"
      />
    </div>
  );
};

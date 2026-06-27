import React, { useEffect, useRef } from 'react';

export const FloatingParticles: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse for subtle parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - width / 2) * 0.05;
      targetMouseY = (e.clientY - height / 2) * 0.05;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Particle interfaces
    interface Particle {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      alpha: number;
      pulseSpeed: number;
      color: string;
      parallaxFactor: number;
    }

    interface Shape {
      x: number;
      y: number;
      size: number;
      vx: number;
      vy: number;
      rotation: number;
      rotationSpeed: number;
      sides: number;
      alpha: number;
      parallaxFactor: number;
    }

    const particles: Particle[] = [];
    const shapes: Shape[] = [];

    // Create soft particles
    const particleCount = Math.min(45, Math.floor((width * height) / 35000));
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        alpha: Math.random() * 0.4 + 0.1,
        pulseSpeed: Math.random() * 0.02 + 0.005,
        color: i % 2 === 0 ? '139, 92, 246' : '59, 130, 246', // Purple / Blue
        parallaxFactor: Math.random() * 0.6 + 0.4,
      });
    }

    // Create geometric shapes
    const shapeCount = 6;
    for (let i = 0; i < shapeCount; i++) {
      shapes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 15 + 10,
        vx: (Math.random() - 0.5) * 0.1,
        vy: (Math.random() - 0.5) * 0.1,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.005,
        sides: Math.random() > 0.5 ? 3 : 4, // Triangles or Squares
        alpha: Math.random() * 0.05 + 0.02,
        parallaxFactor: Math.random() * 0.4 + 0.2,
      });
    }

    // Render loop
    const render = () => {
      // Lerp mouse coordinates
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Draw connections first
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        const px1 = p1.x + mouseX * p1.parallaxFactor;
        const py1 = p1.y + mouseY * p1.parallaxFactor;

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const px2 = p2.x + mouseX * p2.parallaxFactor;
          const py2 = p2.y + mouseY * p2.parallaxFactor;

          const dist = Math.hypot(px2 - px1, py2 - py1);
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.15 * Math.min(p1.alpha, p2.alpha);
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(px1, py1);
            ctx.lineTo(px2, py2);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        // Bounce/Wrap
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        // Pulsing alpha
        const currentAlpha = p.alpha + Math.sin(Date.now() * p.pulseSpeed) * 0.05;

        // Render point with subtle glow
        const px = p.x + mouseX * p.parallaxFactor;
        const py = p.y + mouseY * p.parallaxFactor;

        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.05, currentAlpha)})`;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Glow
        if (p.size > 2) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = `rgb(${p.color})`;
          ctx.fillStyle = `rgba(${p.color}, ${currentAlpha * 0.5})`;
          ctx.beginPath();
          ctx.arc(px, py, p.size * 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0; // reset
        }
      });

      // Draw shapes
      shapes.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.rotationSpeed;

        if (s.x < -30) s.x = width + 30;
        if (s.x > width + 30) s.x = -30;
        if (s.y < -30) s.y = height + 30;
        if (s.y > height + 30) s.y = -30;

        const sx = s.x + mouseX * s.parallaxFactor;
        const sy = s.y + mouseY * s.parallaxFactor;

        ctx.save();
        ctx.translate(sx, sy);
        ctx.rotate(s.rotation);
        ctx.strokeStyle = `rgba(139, 92, 246, ${s.alpha})`;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        if (s.sides === 3) {
          // Triangle
          ctx.moveTo(0, -s.size);
          ctx.lineTo(s.size * 0.86, s.size * 0.5);
          ctx.lineTo(-s.size * 0.86, s.size * 0.5);
          ctx.closePath();
        } else {
          // Square/Diamond
          ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size);
        }
        ctx.stroke();
        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      id="futuristic-particle-canvas"
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

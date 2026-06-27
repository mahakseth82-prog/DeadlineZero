import React, { useEffect, useRef, useState } from 'react';

interface AnalyticsGlobeProps {
  size?: number;
}

export const AnalyticsGlobe: React.FC<AnalyticsGlobeProps> = ({ size = 260 }) => {
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
    const radius = size * 0.35;

    // Define 3D points for the globe's wireframe
    interface Point3D {
      x: number;
      y: number;
      z: number;
      color?: string;
      size?: number;
      pulse?: number;
    }

    const points: Point3D[] = [];
    const numLatitudes = 5;
    const numLongitudes = 8;

    // Generate globe surface points
    for (let i = 1; i < numLatitudes; i++) {
      const lat = (Math.PI * i) / numLatitudes;
      for (let j = 0; j < numLongitudes; j++) {
        const lon = (Math.PI * 2 * j) / numLongitudes;
        points.push({
          x: Math.sin(lat) * Math.cos(lon),
          y: Math.cos(lat),
          z: Math.sin(lat) * Math.sin(lon),
          pulse: Math.random() * Math.PI,
        });
      }
    }

    // High-productivity glowing nodes on the globe
    const nodes: Point3D[] = [
      { x: Math.sin(1.2) * Math.cos(0.5), y: Math.cos(1.2), z: Math.sin(1.2) * Math.sin(0.5), color: '#818cf8', size: 4 },
      { x: Math.sin(2.2) * Math.cos(2.1), y: Math.cos(2.2), z: Math.sin(2.2) * Math.sin(2.1), color: '#60a5fa', size: 5 },
      { x: Math.sin(1.5) * Math.cos(3.8), y: Math.cos(1.5), z: Math.sin(1.5) * Math.sin(3.8), color: '#c084fc', size: 4 },
      { x: Math.sin(0.8) * Math.cos(5.2), y: Math.cos(0.8), z: Math.sin(0.8) * Math.sin(5.2), color: '#38bdf8', size: 5.5 },
    ];

    let angleX = 0.25; // Constant pitch tilt
    let angleY = 0;    // Rotating yaw

    const drawGlobe = () => {
      ctx.clearRect(0, 0, size, size);

      // Rotate over time
      angleY += hovered ? 0.007 : 0.0035;

      // Draw background glow
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.5);
      bgGrad.addColorStop(0, 'rgba(99, 102, 241, 0.06)');
      bgGrad.addColorStop(0.6, 'rgba(167, 139, 250, 0.02)');
      bgGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = bgGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Project 3D to 2D
      const project = (pt: Point3D) => {
        // Rotate around Y axis (yaw)
        let x1 = pt.x * Math.cos(angleY) - pt.z * Math.sin(angleY);
        let z1 = pt.x * Math.sin(angleY) + pt.z * Math.cos(angleY);

        // Rotate around X axis (pitch)
        let y2 = pt.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        let z2 = pt.y * Math.sin(angleX) + z1 * Math.cos(angleX);

        // Scale by radius
        const screenX = centerX + x1 * radius;
        const screenY = centerY + y2 * radius;

        return { x: screenX, y: screenY, z: z2 };
      };

      // 1. Draw outer glowing progress rings
      ctx.lineWidth = 1;
      const ringRot = angleY * 1.8;
      
      // Ring 1 (Vertical tilted blue)
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.25)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.25, radius * 0.4, Math.PI / 6, 0, Math.PI * 2);
      ctx.stroke();

      // Draw progress accent on Ring 1
      ctx.strokeStyle = 'rgba(96, 165, 250, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.25, radius * 0.4, Math.PI / 6, ringRot, ringRot + Math.PI * 0.4);
      ctx.stroke();

      // Ring 2 (Horizontal purple)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.25)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.15, radius * 0.35, -Math.PI / 12, 0, Math.PI * 2);
      ctx.stroke();

      // Draw progress accent on Ring 2
      ctx.strokeStyle = 'rgba(167, 139, 250, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * 1.15, radius * 0.35, -Math.PI / 12, -ringRot * 0.8, -ringRot * 0.8 + Math.PI * 0.3);
      ctx.stroke();

      // 2. Draw wireframe circles of the Globe
      ctx.lineWidth = 0.5;
      
      // Latitudes (Parallel rings)
      for (let i = 1; i < numLatitudes; i++) {
        const latRadius = radius * Math.sin((Math.PI * i) / numLatitudes);
        const latY = centerY + radius * Math.cos((Math.PI * i) / numLatitudes) * Math.cos(angleX);
        const latScaleY = latRadius * Math.sin(angleX);

        ctx.strokeStyle = 'rgba(139, 92, 246, 0.08)';
        ctx.beginPath();
        ctx.ellipse(centerX, latY, latRadius, Math.abs(latScaleY), 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Longitudes (Meridian loops)
      for (let j = 0; j < numLongitudes; j++) {
        const lonAngle = (Math.PI * j) / numLongitudes + angleY;
        const scaleX = radius * Math.cos(lonAngle);
        const scaleY = radius * Math.sin(lonAngle) * Math.sin(angleX);

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.08)';
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, Math.abs(scaleX), radius, Math.PI / 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 3. Draw background connection paths (timeline paths)
      const projectedNodes = nodes.map((nd) => ({ ...project(nd), pt: nd }));
      
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.beginPath();
      for (let i = 0; i < projectedNodes.length; i++) {
        const n1 = projectedNodes[i];
        for (let j = i + 1; j < projectedNodes.length; j++) {
          const n2 = projectedNodes[j];
          // Connect nodes with transparent glowing chords if they are on front side
          if (n1.z > -0.2 && n2.z > -0.2) {
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
          }
        }
      }
      ctx.stroke();

      // Draw light trail traveling along node connections
      const trailTime = (Date.now() * 0.001) % 1;
      if (projectedNodes.length >= 2) {
        ctx.save();
        const start = projectedNodes[0];
        const end = projectedNodes[1];
        if (start.z > -0.2 && end.z > -0.2) {
          const trailX = start.x + (end.x - start.x) * trailTime;
          const trailY = start.y + (end.y - start.y) * trailTime;
          
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#818cf8';
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(trailX, trailY, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // 4. Draw the 3D high-productivity nodes
      projectedNodes.forEach((node) => {
        // Simple 3D shading - back side nodes are dimmer
        const inFront = node.z > 0;
        const alpha = inFront ? 0.9 : 0.25;
        const nodeSize = (node.pt.size || 4) * (1 + node.z * 0.3);

        ctx.save();
        ctx.shadowBlur = inFront ? 10 : 0;
        ctx.shadowColor = node.pt.color || '#fff';
        
        ctx.fillStyle = (node.pt.color || '#fff') + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeSize, 0, Math.PI * 2);
        ctx.fill();

        // Pulsing core outline
        const nodePulse = Math.sin(Date.now() * 0.003 + (node.pt.pulse || 0)) * 3;
        if (inFront) {
          ctx.strokeStyle = (node.pt.color || '#fff') + '33';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize + 3 + nodePulse, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      });

      // 5. Draw rotating coordinate axes values
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '7px Courier New';
      ctx.fillText('SYS.DATA_SYNC', centerX - 32, centerY + radius * 1.6);

      animationFrameId = requestAnimationFrame(drawGlobe);
    };

    drawGlobe();

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
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="absolute inset-0 bg-blue-500/5 blur-[40px] rounded-full scale-95" />
      <canvas
        id="futuristic-analytics-globe-canvas"
        ref={canvasRef}
        className="relative z-10 transition-transform duration-500 ease-out cursor-pointer hover:scale-105"
      />
    </div>
  );
};

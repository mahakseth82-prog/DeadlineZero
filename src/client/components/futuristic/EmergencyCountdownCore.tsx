import React, { useEffect, useRef, useState } from 'react';

interface EmergencyCountdownCoreProps {
  size?: number;
  secondsRemaining?: number;
  totalDuration?: number;
}

export const EmergencyCountdownCore: React.FC<EmergencyCountdownCoreProps> = ({
  size = 280,
  secondsRemaining = 3600,
  totalDuration = 3600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pulseTimer, setPulseTimer] = useState(0);

  // Trigger pulse on seconds decrement
  useEffect(() => {
    setPulseTimer(1.0);
  }, [secondsRemaining]);

  // Decay pulse state
  useEffect(() => {
    if (pulseTimer <= 0) return;
    const interval = setInterval(() => {
      setPulseTimer((prev) => Math.max(0, prev - 0.04));
    }, 16);
    return () => clearInterval(interval);
  }, [pulseTimer]);

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
    const outerRadius = size * 0.42;

    const formatTime = (totalSecs: number) => {
      const hours = Math.floor(totalSecs / 3600);
      const mins = Math.floor((totalSecs % 3600) / 60);
      const secs = totalSecs % 60;
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    let rotationAngle = 0;

    const drawEmergencyCore = () => {
      ctx.clearRect(0, 0, size, size);

      rotationAngle += 0.005;

      // Base progress percentage
      const pct = totalDuration > 0 ? secondsRemaining / totalDuration : 1.0;

      // Compute color parameters dynamically: Blue -> Orange -> Red
      let activeColor = 'rgba(59, 130, 246, 0.85)'; // Blue/Cyan default
      let shadowColor = 'rgba(59, 130, 246, 0.8)';
      let glowColorStop1 = 'rgba(59, 130, 246, ';
      let glowColorStop2 = 'rgba(6, 182, 212, ';
      let ringBorderColor = 'rgba(59, 130, 246, 0.15)';
      let activeGlowColor = 'rgba(59, 130, 246, 0.08)';
      let innerRingColor = 'rgba(6, 182, 212, 0.12)';
      let fastTicksColor = 'rgba(59, 130, 246, 0.35)';
      let dotColor = '#3b82f6';
      let textColor = 'rgba(6, 182, 212, 0.6)';
      let statusText = 'SAFE CAPACITY';

      if (pct <= 0.3) {
        // Red
        activeColor = 'rgba(239, 68, 68, 0.85)';
        shadowColor = 'rgba(239, 68, 68, 0.8)';
        glowColorStop1 = 'rgba(239, 68, 68, ';
        glowColorStop2 = 'rgba(244, 63, 94, ';
        ringBorderColor = 'rgba(239, 68, 68, 0.15)';
        activeGlowColor = 'rgba(239, 68, 68, 0.08)';
        innerRingColor = 'rgba(249, 115, 22, 0.12)';
        fastTicksColor = 'rgba(239, 68, 68, 0.35)';
        dotColor = '#ef4444';
        textColor = 'rgba(239, 68, 68, 0.6)';
        statusText = 'CRITICAL OVERLOAD';
      } else if (pct <= 0.6) {
        // Orange
        activeColor = 'rgba(249, 115, 22, 0.85)';
        shadowColor = 'rgba(249, 115, 22, 0.8)';
        glowColorStop1 = 'rgba(249, 115, 22, ';
        glowColorStop2 = 'rgba(245, 158, 11, ';
        ringBorderColor = 'rgba(249, 115, 22, 0.15)';
        activeGlowColor = 'rgba(249, 115, 22, 0.08)';
        innerRingColor = 'rgba(245, 158, 11, 0.12)';
        fastTicksColor = 'rgba(249, 115, 22, 0.35)';
        dotColor = '#f97316';
        textColor = 'rgba(249, 115, 22, 0.6)';
        statusText = 'WARNING MARGIN';
      }

      // 1. Alert Glow Back-gradient (intensity modulated by second pulses)
      const glowIntensity = 0.06 + pulseTimer * 0.12;
      const baseGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, outerRadius * 1.3);
      baseGlow.addColorStop(0, `${glowColorStop1}${glowIntensity})`);
      baseGlow.addColorStop(0.5, `${glowColorStop2}${glowIntensity * 0.4})`);
      baseGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = baseGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // 2. Outer Rotating Circular Warning ring with ticks
      ctx.lineWidth = 1;
      ctx.strokeStyle = ringBorderColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Rotating Tick Marks
      ctx.strokeStyle = pct <= 0.3 ? `rgba(244, 63, 94, ${0.25 + pulseTimer * 0.45})` : pct <= 0.6 ? `rgba(245, 158, 11, ${0.25 + pulseTimer * 0.45})` : `rgba(6, 182, 212, ${0.25 + pulseTimer * 0.45})`;
      const numTicks = 45;
      const tickLength = 5;
      for (let i = 0; i < numTicks; i++) {
        const angle = rotationAngle + (i * Math.PI * 2) / numTicks;
        // Skip some segments dynamically to represent data gaps / styling
        if (i % 5 === 0) continue;

        const x1 = centerX + Math.cos(angle) * (outerRadius - tickLength);
        const y1 = centerY + Math.sin(angle) * (outerRadius - tickLength);
        const x2 = centerX + Math.cos(angle) * outerRadius;
        const y2 = centerY + Math.sin(angle) * outerRadius;

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 3. Middle Circular Timer Progress Arc
      const arcRadius = outerRadius * 0.85;
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = activeGlowColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, arcRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Glowing active progress arc
      ctx.save();
      ctx.shadowBlur = 10 + pulseTimer * 12;
      ctx.shadowColor = shadowColor;
      ctx.lineWidth = 4;
      ctx.strokeStyle = activeColor;
      
      // Draw progress arc matching time remaining
      const startAngle = -Math.PI / 2;
      const endAngle = startAngle + Math.PI * 2 * pct;
      ctx.beginPath();
      ctx.arc(centerX, centerY, arcRadius, startAngle, endAngle);
      ctx.stroke();
      ctx.restore();

      // 4. Rotating inner hud ring
      const innerRadius = outerRadius * 0.65;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = innerRingColor;
      ctx.beginPath();
      ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Fast-spinning inner ticks
      const fastAngle = -rotationAngle * 2.5;
      ctx.strokeStyle = fastTicksColor;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 4; i++) {
        const angle = fastAngle + (i * Math.PI) / 2;
        const x1 = centerX + Math.cos(angle) * (innerRadius - 4);
        const y1 = centerY + Math.sin(angle) * (innerRadius - 4);
        const x2 = centerX + Math.cos(angle) * innerRadius;
        const y2 = centerY + Math.sin(angle) * innerRadius;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // 5. Centered Digital Countdown text and status
      ctx.textAlign = 'center';
      
      // Secondary state text
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.font = '8px JetBrains Mono';
      ctx.fillText('EMERGENCY.TIME_REMAINING', centerX, centerY - 24);

      // Countdown numerical clock
      ctx.fillStyle = `rgba(255, 255, 255, ${0.85 + pulseTimer * 0.15})`;
      ctx.font = 'bold 22px JetBrains Mono';
      ctx.fillText(formatTime(secondsRemaining), centerX, centerY + 3);

      // Remaining percentage text
      ctx.fillStyle = textColor;
      ctx.font = '700 8px JetBrains Mono';
      ctx.fillText(`${(pct * 100).toFixed(1)}% ${statusText}`, centerX, centerY + 24);

      // Small blinking dot indicator
      const blink = Math.floor(Date.now() / 500) % 2 === 0;
      if (blink) {
        ctx.fillStyle = dotColor;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 38, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(drawEmergencyCore);
    };

    drawEmergencyCore();

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
  }, [size, secondsRemaining, totalDuration, pulseTimer]);

  return (
    <div className="relative flex items-center justify-center select-none">
      <div className={`absolute inset-0 bg-red-500/5 blur-[50px] rounded-full scale-100 transition-transform duration-300 ${
        pulseTimer > 0.8 ? 'scale-110 opacity-80' : 'scale-95 opacity-50'
      }`} />
      <canvas
        id="emergency-countdown-core-canvas"
        ref={canvasRef}
        className="relative z-10 transition-transform duration-300 ease-out hover:scale-103"
      />
    </div>
  );
};

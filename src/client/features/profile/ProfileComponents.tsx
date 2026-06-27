import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Trophy, Zap, Cpu } from 'lucide-react';

// Shared premium CSS animations
export const SHARED_STYLES = (
  <style>{`
    @keyframes shimmer-sweep {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .animate-shimmer-sweep {
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
      background-size: 200% 100%;
      animation: shimmer-sweep 3s infinite linear;
    }
    @keyframes float-sparkle {
      0% { transform: translateY(0) scale(0); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(-40px) scale(1); opacity: 0; }
    }
    .animate-float-sparkle {
      animation: float-sparkle 1.8s ease-out infinite;
    }
    @keyframes scan-line {
      0% { transform: translateY(-20px); opacity: 0; }
      10% { opacity: 0.8; }
      90% { opacity: 0.8; }
      100% { transform: translateY(165px); opacity: 0; }
    }
    @keyframes glow-pulse {
      0%, 100% { filter: drop-shadow(0 0 4px rgba(59,130,246,0.25)); }
      50% { filter: drop-shadow(0 0 12px rgba(59,130,246,0.6)); }
    }
    .animate-glow-pulse {
      animation: glow-pulse 3s infinite ease-in-out;
    }
  `}</style>
);

// --------------------------------------------------
// COUNTUP ANIMATION COMPONENT
// --------------------------------------------------
export const CountUp: React.FC<{ end: number; duration?: number; prefix?: string; suffix?: string }> = ({ 
  end, duration = 1.3, prefix = "", suffix = "" 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const startTime = performance.now();
    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.round(start + (end - start) * easeProgress));

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isInView, end, duration]);

  return <span ref={ref} className="font-mono">{prefix}{count.toLocaleString()}{suffix}</span>;
};

// --------------------------------------------------
// PREMIUM CARD CONTAINER WITH CURSOR GLOW & 3D TILT
// --------------------------------------------------
export const PremiumCard: React.FC<{ 
  children: React.ReactNode; 
  className?: string; 
  glowColor?: 'blue' | 'cyan' | 'purple' | 'emerald' | 'rose' | 'amber' | 'none';
  delay?: number;
}> = ({ children, className = "", glowColor = "blue", delay = 0 }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const tiltX = (yc - y) / 10; // 3-5 degrees max
    const tiltY = (x - xc) / 15;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const glowColors = {
    blue: "rgba(59, 130, 246, 0.12)",
    cyan: "rgba(6, 182, 212, 0.12)",
    purple: "rgba(139, 92, 246, 0.12)",
    emerald: "rgba(16, 185, 129, 0.12)",
    rose: "rgba(244, 63, 94, 0.12)",
    amber: "rgba(245, 158, 11, 0.12)",
    none: "rgba(255, 255, 255, 0.02)"
  };

  const glowBorderColors = {
    blue: "hover:border-blue-500/30",
    cyan: "hover:border-cyan-500/30",
    purple: "hover:border-purple-500/30",
    emerald: "hover:border-emerald-500/30",
    rose: "hover:border-rose-500/30",
    amber: "hover:border-amber-500/30",
    none: "hover:border-white/10"
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.45, delay, ease: "easeOut" }}
      style={{
        rotateX: tilt.x,
        rotateY: tilt.y,
        transformStyle: "preserve-3d",
        perspective: 1000,
        willChange: "transform"
      }}
      whileHover={{ 
        y: -5, 
        scale: 1.02, 
        transition: { duration: 0.25, ease: "easeOut" }
      }}
      className={`relative group bg-zinc-950/45 backdrop-blur-md border border-white/[0.05] rounded-3xl p-5 overflow-hidden transition-all duration-300 ${glowBorderColors[glowColor]} ${className}`}
    >
      {/* Dynamic Cursor tracking neon glow */}
      {isHovered && glowColor !== 'none' && (
        <div 
          className="absolute pointer-events-none rounded-full"
          style={{
            width: '350px',
            height: '350px',
            background: `radial-gradient(circle, ${glowColors[glowColor]} 0%, transparent 70%)`,
            left: `${coords.x - 175}px`,
            top: `${coords.y - 175}px`,
            mixBlendMode: 'screen',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Light Reflection overlay border highlights */}
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-40 pointer-events-none" />
      
      {/* Content layout wrapper to leverage translateZ */}
      <div style={{ transform: "translateZ(10px)" }} className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};

// --------------------------------------------------
// INTERACTIVE ALIVE AVATAR COMPONENT
// --------------------------------------------------
export const InteractiveAvatar: React.FC<{ src: string }> = ({ src }) => {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const [hovered, setHovered] = useState(false);

  const handleAvatarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setRipples(prev => [...prev, { id, x, y }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 1000);
  };

  return (
    <div 
      className="relative cursor-pointer select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={handleAvatarClick}
    >
      {/* Rotating outer energy rings */}
      <div className="absolute inset-0 -m-3.5 rounded-full border border-dashed border-cyan-500/40 animate-spin" style={{ animationDuration: '24s' }} />
      <div className="absolute inset-0 -m-2.5 rounded-full border border-double border-blue-500/25 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
      
      {/* Breathing glow animation */}
      <motion.div
        animate={{ 
          scale: [1, 1.06, 1],
          opacity: [0.35, 0.65, 0.35],
          boxShadow: [
            "0 0 12px rgba(59, 130, 246, 0.3)",
            "0 0 25px rgba(6, 182, 212, 0.5)",
            "0 0 12px rgba(59, 130, 246, 0.3)"
          ]
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600/10 to-cyan-400/10 blur-xs pointer-events-none"
      />

      {/* Floating particles on hover */}
      {hovered && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-full z-20">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              initial={{ x: 30 + Math.random() * 30, y: 80, opacity: 0, scale: 0 }}
              animate={{ y: [80, 15], opacity: [0, 0.8, 0], scale: [0, 1.1, 0] }}
              transition={{ duration: 1.4 + Math.random() * 0.8, repeat: Infinity, delay: i * 0.25 }}
            />
          ))}
        </div>
      )}

      {/* Click ripples / waves */}
      <AnimatePresence>
        {ripples.map(ripple => (
          <motion.span
            key={ripple.id}
            className="absolute bg-cyan-400/25 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              width: 1,
              height: 1,
              transform: "translate(-50%, -50%)"
            }}
            initial={{ width: 0, height: 0, opacity: 0.8 }}
            animate={{ width: 140, height: 140, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>

      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-zinc-950 p-1 bg-zinc-950 z-10 shadow-2xl">
        <motion.img
          whileHover={{ scale: 1.12 }}
          transition={{ duration: 0.3 }}
          src={src}
          referrerPolicy="no-referrer"
          alt="User Avatar"
          className="w-full h-full rounded-full object-cover"
        />
      </div>

      {/* Online indicator with status pulse */}
      <div className="absolute bottom-1 right-1 w-4.5 h-4.5 bg-zinc-950 border border-white/10 rounded-full flex items-center justify-center z-20 shadow-md">
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
        </span>
      </div>
    </div>
  );
};

// --------------------------------------------------
// XP PROGRESS BAR WITH GLOWING TIMELINE HIGHLIGHTS
// --------------------------------------------------
export const AnimatedXPProgressBar: React.FC = () => {
  const targetXP = 7850;
  const maxXP = 10000;
  const targetPercent = (targetXP / maxXP) * 100;
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="w-full mt-6 space-y-2 text-left">
      <div className="flex justify-between items-end text-[10px] font-mono">
        <span className="text-zinc-400 font-bold tracking-wider uppercase flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" /> Level 8 Blueprint
        </span>
        <span className="text-zinc-300 font-bold">
          {isInView ? <CountUp end={targetXP} duration={1.8} /> : 0} <span className="text-zinc-600">/</span> {maxXP} XP
        </span>
      </div>

      <div className="relative w-full bg-zinc-950/80 h-3.5 rounded-full p-0.5 border border-white/[0.05] overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent -translate-x-full animate-[shimmer-sweep_3s_infinite_linear]" />

        <motion.div 
          className="relative h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.45)] overflow-hidden"
          initial={{ width: 0 }}
          animate={isInView ? { width: `${targetPercent}%` } : { width: 0 }}
          transition={{ duration: 1.8, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.12)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.12)_50%,rgba(255,255,255,0.12)_75%,transparent_75%,transparent)] bg-[size:16px_16px] animate-[shimmer-sweep_15s_infinite_linear]" />
          
          <motion.div 
            className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_15px_#22d3ee,0_0_6px_#3b82f6]"
            animate={{ scale: [0.9, 1.25, 0.9] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </div>
    </div>
  );
};

// --------------------------------------------------
// PRODUCTIVITY DNA CIRCULAR GAUGE COMPONENT
// --------------------------------------------------
export const RadialStat: React.FC<{ percent: number; label: string; color: string; icon: React.ComponentType<any>; delay?: number }> = ({ 
  percent, label, color, icon: Icon, delay = 0 
}) => {
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => {
        setOffset(circumference - (percent / 100) * circumference);
      }, 150 + delay * 100);
      return () => clearTimeout(timer);
    }
  }, [isInView, percent, circumference, delay]);

  return (
    <div ref={ref} className="relative flex flex-col items-center justify-center p-3.5 bg-zinc-950/45 border border-white/[0.03] rounded-2xl hover:border-white/10 transition-all duration-300 shadow-md group">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r={radius} fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="4" />
          <motion.circle
            cx="32" cy="32" r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isInView ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
            transition={{ duration: 1.5, ease: "easeOut", delay: delay * 0.1 }}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 3px ${color}25)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" style={{ color }} />
        </div>
      </div>
      <span className="text-[10px] font-bold text-zinc-300 mt-2 text-center truncate max-w-full leading-none">{label}</span>
      <span className="text-[10px] font-mono font-bold text-zinc-500 mt-1">
        {isInView ? <CountUp end={percent} duration={1.2} suffix="%" /> : "0%"}
      </span>
    </div>
  );
};

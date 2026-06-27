/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { 
  ClipboardList, 
  Calendar, 
  Brain, 
  Target, 
  Clock, 
  BarChart3, 
  Zap, 
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const ChronoCore: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Mouse absolute offset values in pixels from center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  // Intensity metric representing cursor magnetism / hover activation (0 to 1)
  const activeIntensity = useMotionValue(0);

  // Smooth springs for high-fidelity physics
  const springConfig = { stiffness: 85, damping: 18, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);
  const smoothIntensity = useSpring(activeIntensity, { stiffness: 65, damping: 16 });

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate pixel distance relative to the center of the card
    const pxX = event.clientX - rect.left - width / 2;
    const pxY = event.clientY - rect.top - height / 2;
    
    mouseX.set(pxX);
    mouseY.set(pxY);

    // Dynamic Magnetism logic (within 180px of center for stronger magnetism range)
    const distance = Math.sqrt(pxX * pxX + pxY * pxY);
    if (distance < 180) {
      activeIntensity.set(1.0);
    } else {
      // Smooth falloff of magnetism beyond 180px
      const falloff = Math.max(0, 1 - (distance - 180) / 120);
      activeIntensity.set(falloff);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    activeIntensity.set(0);
    setIsHovered(false);
  };

  // PARALLAX MAPS - Converting mouse pixels to multi-layer 3D shifts
  
  // 1. Core overall rotations (Max ~15 degrees)
  const rotateX = useTransform(smoothY, [-190, 190], [15, -15]);
  const rotateY = useTransform(smoothX, [-190, 190], [-15, 15]);

  // 2. Entire Core / Center sphere displacement (100% parallax weight: shifts up to 26px)
  const coreX = useTransform(smoothX, [-190, 190], [-26, 26]);
  const coreY = useTransform(smoothY, [-190, 190], [-26, 26]);

  // 3. Floating icons displacement (70% weight: shifts up to 18px)
  const iconsParallaxX = useTransform(smoothX, [-190, 190], [-18, 18]);
  const iconsParallaxY = useTransform(smoothY, [-190, 190], [-18, 18]);

  // 4. Orbit rings displacement and skew bending
  // Middle ring (50%): up to 13px translation
  const middleRingX = useTransform(smoothX, [-190, 190], [-13, 13]);
  const middleRingY = useTransform(smoothY, [-190, 190], [-13, 13]);

  // Outer ring (30%): up to 8px translation
  const outerRingX = useTransform(smoothX, [-190, 190], [-8, 8]);
  const outerRingY = useTransform(smoothY, [-190, 190], [-8, 8]);

  // Inner ring (approx 60%): up to 15.6px translation
  const innerRingX = useTransform(smoothX, [-190, 190], [-15.6, 15.6]);
  const innerRingY = useTransform(smoothY, [-190, 190], [-15.6, 15.6]);

  const ringsSkewX = useTransform(smoothX, [-190, 190], [-3, 3]);
  const ringsSkewY = useTransform(smoothY, [-190, 190], [-3, 3]);

  // 5. Background particles displacement (10% weight: shifts up to 2.6px)
  const particlesParallaxX = useTransform(smoothX, [-190, 190], [-2.6, 2.6]);
  const particlesParallaxY = useTransform(smoothY, [-190, 190], [-2.6, 2.6]);

  // Dynamic overall hover lift (Z-axis pop and subtle Y-axis elevation)
  const liftZ = useSpring(useTransform(smoothIntensity, [0, 1], [0, 24]), springConfig);
  const liftY = useSpring(useTransform(smoothIntensity, [0, 1], [0, -12]), springConfig);

  // Dynamic glow tracking the cursor position on the card area
  const lightingStyle = useTransform([smoothX, smoothY], ([latestX, latestY]) => {
    const pctX = (Number(latestX) / 380 + 0.5) * 100;
    const pctY = (Number(latestY) / 380 + 0.5) * 100;
    return `radial-gradient(circle at ${pctX}% ${pctY}%, rgba(124, 58, 237, 0.35) 0%, rgba(59, 130, 246, 0.16) 35%, rgba(6, 182, 212, 0.04) 65%, transparent 80%)`;
  });

  // Dynamic scaling of center core on hover (up to 1.08x)
  const coreScale = useTransform(smoothIntensity, [0, 1], [1, 1.08]);
  // Dynamic glow brightness
  const glowOpacity = useTransform(smoothIntensity, [0, 1], [0.6, 1.0]);

  // Static list of orbit rings with exact dimensions, rotation rates, and icons
  const rings = [
    {
      id: 'inner',
      radius: 65,
      circumference: 408.4,
      duration: 16,
      clockwise: true,
      icons: [
        { Icon: Clock, angle: 45 },
        { Icon: Zap, angle: 225 }
      ],
      color: 'stroke-violet-500/25 dark:stroke-violet-400/15',
      pulseColor: '#7C3AED',
      parallaxX: innerRingX,
      parallaxY: innerRingY,
    },
    {
      id: 'middle',
      radius: 101,
      circumference: 634.6,
      duration: 25,
      clockwise: false,
      icons: [
        { Icon: ClipboardList, angle: 0 },
        { Icon: Target, angle: 120 },
        { Icon: CheckCircle2, angle: 240 }
      ],
      color: 'stroke-blue-500/20 dark:stroke-blue-400/15',
      pulseColor: '#3B82F6',
      parallaxX: middleRingX,
      parallaxY: middleRingY,
    },
    {
      id: 'outer',
      radius: 138,
      circumference: 867.0,
      duration: 36,
      clockwise: true,
      icons: [
        { Icon: Calendar, angle: 30 },
        { Icon: Brain, angle: 150 },
        { Icon: BarChart3, angle: 270 }
      ],
      color: 'stroke-cyan-500/15 dark:stroke-cyan-400/10',
      pulseColor: '#06B6D4',
      parallaxX: outerRingX,
      parallaxY: outerRingY,
    }
  ];

  // Micro-particles in the deep space background (35 elegant dots drifting)
  const particles = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 90 + 5}%`,
      duration: Math.random() * 6 + 7,
      delay: Math.random() * -6,
    }));
  }, []);

  return (
    <div className="relative w-full h-full min-h-[340px] lg:min-h-[400px] flex items-center justify-center select-none overflow-visible">
      <div className="perspective-[1000px] w-full max-w-[420px] h-full flex items-center justify-center overflow-visible">
        <motion.div
          ref={cardRef}
          style={{
            rotateX,
            rotateY,
            z: liftZ,
            y: liftY,
            transformStyle: 'preserve-3d',
          }}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          className="relative w-[340px] h-[340px] md:w-[380px] md:h-[380px] flex items-center justify-center cursor-pointer overflow-visible bg-transparent border-none shadow-none"
        >
          {/* Layer 0: Radial Spotlight glow trailing the cursor (completely transparent borderless) */}
          <motion.div 
            style={{ background: lightingStyle }}
            className="absolute inset-[-40px] rounded-full pointer-events-none mix-blend-screen opacity-70 dark:opacity-50 transition-opacity duration-300" 
          />

          {/* Layer 2: Constant soft background energy wash behind the free floating core */}
          <div className="absolute w-[280px] h-[280px] rounded-full bg-gradient-to-tr from-violet-600/5 via-indigo-500/5 to-cyan-500/5 blur-[80px] -z-10 pointer-events-none" />

          {/* Layer 3: Dynamic Parallax Background Particles (10% depth weight) */}
          <motion.div 
            style={{ x: particlesParallaxX, y: particlesParallaxY }}
            className="absolute inset-[-60px] pointer-events-none overflow-visible"
          >
            {particles.map((p) => (
              <motion.div
                key={p.id}
                style={{
                  position: 'absolute',
                  left: p.left,
                  top: p.top,
                  width: p.size,
                  height: p.size,
                }}
                animate={{
                  y: [0, -30, 0],
                  x: [0, 15, 0],
                  opacity: [0.03, 0.22, 0.03],
                  scale: p.id % 3 === 0 ? [1, 1.4, 0.8, 1] : 1,
                }}
                transition={{
                  duration: isHovered ? p.duration * 0.6 : p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="rounded-full bg-violet-400/35 dark:bg-violet-300/25 pointer-events-none"
              />
            ))}
          </motion.div>

          {/* Layer 4: Orbit Tracks and Flowing Data Pulses (with different parallax depths per track) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
            {rings.map((ring) => {
              const ringRotation = ring.clockwise ? 360 : -360;
              // Orbit rings rotate 2.0x faster when hovered
              const duration = isHovered ? ring.duration * 0.5 : ring.duration;

              // Compute SVG dash values for glowing particles flowing on the rings
              const clockwiseVal = `${ring.circumference};0`;
              const counterClockwiseVal = `0;${ring.circumference}`;
              const dashoffsetValues = ring.clockwise ? clockwiseVal : counterClockwiseVal;

              return (
                <motion.div
                  key={ring.id}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    x: ring.parallaxX,
                    y: ring.parallaxY,
                    skewX: ringsSkewX,
                    skewY: ringsSkewY,
                    transformStyle: 'preserve-3d',
                  }}
                  animate={{ 
                    rotate: ringRotation,
                    rotateX: isHovered ? [0, 2, -2, 0] : 0,
                    rotateY: isHovered ? [0, -2, 2, 0] : 0,
                  }}
                  transition={{
                    rotate: {
                      repeat: Infinity,
                      ease: 'linear',
                      duration: duration,
                    },
                    rotateX: {
                      repeat: Infinity,
                      ease: 'easeInOut',
                      duration: 3.5,
                    },
                    rotateY: {
                      repeat: Infinity,
                      ease: 'easeInOut',
                      duration: 4.2,
                    }
                  }}
                  className="flex items-center justify-center overflow-visible"
                >
                  <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 380 380">
                    <defs>
                      <linearGradient id={`pulseGrad-${ring.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={ring.pulseColor} stopOpacity="0.8" />
                        <stop offset="30%" stopColor={ring.pulseColor} stopOpacity="0.3" />
                        <stop offset="100%" stopColor={ring.pulseColor} stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Base orbit circular track */}
                    <circle
                      cx="190"
                      cy="190"
                      r={ring.radius}
                      fill="none"
                      className={`${ring.color} transition-colors duration-300`}
                      strokeWidth={isHovered ? "1.5" : "1"}
                    />

                    {/* FLOWING DATA PULSES: Multiple speed-controlled light segments travelling on orbit tracks */}
                    <circle
                      cx="190"
                      cy="190"
                      r={ring.radius}
                      fill="none"
                      stroke={`url(#pulseGrad-${ring.id})`}
                      strokeWidth="3.2"
                      strokeDasharray="10 50 20 120"
                      className="opacity-95 filter drop-shadow-[0_0_6px_rgba(124,58,237,0.6)]"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values={dashoffsetValues}
                        dur={isHovered ? "1.6s" : "3s"}
                        repeatCount="indefinite"
                      />
                    </circle>

                    {/* Secondary inverse subtle pulse ring for texture */}
                    <circle
                      cx="190"
                      cy="190"
                      r={ring.radius}
                      fill="none"
                      stroke={`url(#pulseGrad-${ring.id})`}
                      strokeWidth="1.5"
                      strokeDasharray="6 240"
                      className="opacity-50"
                    >
                      <animate
                        attributeName="stroke-dashoffset"
                        values={ring.clockwise ? counterClockwiseVal : clockwiseVal}
                        dur={isHovered ? "2.5s" : "4.8s"}
                        repeatCount="indefinite"
                      />
                    </circle>
                  </svg>

                  {/* Layer 5: Magnetic Orbiting Glass Icon Capsules (70% Parallax Depth) */}
                  {ring.icons.map((ic, idx) => {
                    const rad = (ic.angle * Math.PI) / 180;
                    const xPos = ring.radius * Math.cos(rad);
                    const yPos = ring.radius * Math.sin(rad);
                    const IconComp = ic.Icon;

                    return (
                      <motion.div
                        key={idx}
                        style={{
                          position: 'absolute',
                          transform: `translate(${xPos}px, ${yPos}px)`,
                          transformStyle: 'preserve-3d',
                          x: iconsParallaxX,
                          y: iconsParallaxY,
                        }}
                        className="flex items-center justify-center z-20 overflow-visible"
                      >
                        {/* Upright retention + dynamic floating wave physics */}
                        <motion.div
                          animate={{ 
                            rotate: -ringRotation,
                            y: [0, -6, 0],
                            x: [0, 3, 0],
                          }}
                          transition={{
                            rotate: {
                              repeat: Infinity,
                              ease: 'linear',
                              duration: duration,
                            },
                            y: {
                              duration: 2.5 + idx * 0.6,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            },
                            x: {
                              duration: 3.2 + idx * 0.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                            }
                          }}
                          className="relative group/capsule overflow-visible"
                        >
                          {/* Premium borderless glass capsules with double light reflection glow */}
                          <motion.div
                            whileHover={{ 
                              scale: 1.18, 
                              rotate: 5,
                              boxShadow: '0 0 25px rgba(124, 58, 237, 0.35)',
                              borderColor: 'rgba(255, 255, 255, 0.3)'
                            }}
                            className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.04] dark:bg-zinc-900/60 backdrop-blur-md border border-white/[0.12] dark:border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.08)] text-zinc-400 dark:text-zinc-300 hover:text-violet-500 dark:hover:text-violet-400 hover:border-violet-500/40 dark:hover:border-violet-400/35 transition-all duration-300"
                          >
                            <IconComp className="w-4.5 h-4.5 transition-transform duration-300 group-hover/capsule:scale-110" />
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              );
            })}
          </div>

          {/* Layer 6: Center Glass Energy Sphere (Chrono Core Brain - 100% Parallax Depth) */}
          <motion.div 
            style={{ 
              x: coreX, 
              y: coreY,
              scale: coreScale,
              transformStyle: 'preserve-3d'
            }}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80px] h-[80px] rounded-full z-30 pointer-events-none"
          >
            {/* Highly active soft breathing halo */}
            <motion.div
              style={{ opacity: glowOpacity }}
              animate={{
                scale: isHovered ? [1, 1.15, 1] : [1, 1.06, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="absolute -inset-5 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-500 blur-2xl opacity-65 dark:opacity-50"
            />

            {/* Hyper-glow boundary rim */}
            <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 opacity-30 dark:opacity-45 blur-[4px]" />

            {/* Crystal-clear glass orb with deep backdrop blur & multi-angle light specular peaks */}
            <div className="absolute inset-0 rounded-full bg-white/[0.09] dark:bg-zinc-950/45 backdrop-blur-2xl border border-white/[0.26] dark:border-zinc-800 shadow-[inset_0_3px_6px_rgba(255,255,255,0.25),0_16px_36px_rgba(124,58,237,0.3)] flex items-center justify-center overflow-hidden">
              {/* Primary light reflection glare */}
              <div className="absolute top-[3px] left-[7px] w-[36px] h-[18px] bg-gradient-to-b from-white/30 to-transparent rounded-full filter blur-[0.5px] rotate-[-20deg]" />

              {/* Shimmering, rotating color matrix */}
              <motion.div 
                animate={{ 
                  rotate: 360,
                  opacity: isHovered ? [0.25, 0.5, 0.25] : [0.12, 0.26, 0.12]
                }}
                transition={{
                  rotate: { duration: 9, repeat: Infinity, ease: 'linear' },
                  opacity: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }
                }}
                className="absolute inset-0 bg-gradient-to-tr from-violet-500 via-transparent to-cyan-400 mix-blend-color-dodge rounded-full"
              />
              
              {/* Internal dash ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  repeat: Infinity,
                  ease: 'linear',
                  duration: 8,
                }}
                className="absolute inset-2 border border-dashed border-violet-500/30 dark:border-violet-400/25 rounded-full"
              />

              {/* Sparkling intelligence core symbol */}
              <motion.div
                animate={{
                  scale: isHovered ? 1.12 : 1,
                  rotate: isHovered ? [0, 15, -15, 0] : 0,
                }}
                transition={{ duration: 0.4 }}
              >
                <Sparkles className="w-6.5 h-6.5 text-zinc-950 dark:text-white drop-shadow-[0_0_12px_rgba(124,58,237,0.7)] animate-pulse" />
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

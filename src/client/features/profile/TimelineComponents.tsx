import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { Bot, CheckCircle2 } from 'lucide-react';

// --------------------------------------------------
// TIMELINE VERTICAL PULSING LINE
// --------------------------------------------------
export const TimelineLine: React.FC = () => {
  return (
    <div className="absolute left-[8px] top-3 bottom-3 w-[1px] bg-gradient-to-b from-blue-500/50 via-cyan-400/30 to-transparent overflow-hidden">
      <motion.div 
        animate={{ y: ["-100%", "300%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="w-full h-1/3 bg-gradient-to-b from-transparent via-blue-400 to-transparent"
      />
    </div>
  );
};

// --------------------------------------------------
// ACTIVE WORKSPACE TIMELINE ITEM (MODERN ACTIVITY FEED)
// --------------------------------------------------
interface TimelineItemProps {
  title: string;
  desc: string;
  time: string;
  category: string;
  statusColor: string; // "bg-emerald-500", "bg-blue-500", etc.
  icon: React.ComponentType<any>;
  index: number;
  details: {
    duration: string;
    workspace: string;
    device: string;
    affected: string;
    reasoning: string;
    project: string;
    recoveryScore: string;
  };
}

export const TimelineItem: React.FC<TimelineItemProps> = ({ 
  title, desc, time, category, statusColor, icon: Icon, details, index 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <div ref={ref} className="relative group/item">
      {/* Dynamic Status Colored Dot on the timeline path */}
      <div className={`absolute -left-[24px] top-2 w-3.5 h-3.5 rounded-full bg-zinc-950 border-2 flex items-center justify-center cursor-pointer z-10 transition-all duration-300 group-hover/item:scale-125 border-zinc-700 focus-within:border-blue-500`}>
        <span className={`w-1.5 h-1.5 rounded-full ${statusColor}`} />
      </div>

      <motion.div 
        onClick={() => setIsOpen(!isOpen)}
        initial={{ opacity: 0, x: -15 }}
        animate={isInView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.4, delay: index * 0.08 }}
        whileHover={{ x: 4 }}
        className={`space-y-2 p-3.5 rounded-2xl border transition-all duration-300 text-left cursor-pointer ${
          isOpen 
            ? 'bg-white/[0.03] border-white/[0.06] shadow-md' 
            : 'border-transparent hover:bg-white/[0.015] hover:border-white/[0.02]'
        }`}
      >
        <div className="flex justify-between items-center gap-2 flex-wrap sm:flex-nowrap">
          <span className="text-xs font-bold text-zinc-200 flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-zinc-900 border border-white/[0.04] text-zinc-400 group-hover/item:text-white transition-colors`}>
              <Icon className="w-3.5 h-3.5" />
            </div>
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            <span className={`text-[8px] font-mono font-black uppercase tracking-wider px-2 py-0.5 rounded border border-white/[0.03] bg-zinc-950 text-zinc-400`}>
              {category}
            </span>
            <span className="text-[9px] font-mono text-zinc-500 font-bold bg-zinc-950 border border-white/[0.03] px-1.5 py-0.5 rounded-md">
              {time}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-zinc-400 font-light pl-9 leading-relaxed">{desc}</p>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: -5 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: -5 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="mt-3 p-3.5 bg-zinc-950 border border-white/[0.04] rounded-xl space-y-2.5 text-[9px] font-mono text-zinc-400">
                <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                  <div><span className="text-zinc-600 uppercase text-[8px] tracking-wider">Project:</span> <span className="text-zinc-300 font-bold">{details.project}</span></div>
                  <div><span className="text-zinc-600 uppercase text-[8px] tracking-wider">Recovery Score:</span> <span className="text-emerald-400 font-bold">{details.recoveryScore}</span></div>
                  <div><span className="text-zinc-600 uppercase text-[8px] tracking-wider">Workspace:</span> <span className="text-zinc-300">{details.workspace}</span></div>
                  <div><span className="text-zinc-600 uppercase text-[8px] tracking-wider">Duration:</span> <span className="text-zinc-300">{details.duration}</span></div>
                  <div><span className="text-zinc-600 uppercase text-[8px] tracking-wider">Device:</span> <span className="text-zinc-300">{details.device}</span></div>
                </div>
                <div className="border-t border-white/[0.04] pt-2.5 mt-1.5">
                  <span className="text-zinc-600 flex items-center gap-1 uppercase text-[8px] tracking-wider"><Bot className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> AI Reasoning:</span>
                  <p className="text-zinc-300 text-[10px] leading-relaxed mt-1 font-sans font-light bg-black/40 p-2.5 rounded-lg border border-white/[0.02]">{details.reasoning}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

// --------------------------------------------------
// UPGRADED AI OPERATING SYSTEM FLOATING WIDGET
// --------------------------------------------------
export const FloatingAIStatus: React.FC = () => {
  const steps = [
    { text: "Thinking...", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
    { text: "Learning...", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
    { text: "Analyzing...", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
    { text: "Optimizing...", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { text: "Connected...", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" }
  ];
  const [stepIndex, setStepIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex(prev => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const current = steps[stepIndex];
  const isExpanded = !isScrolled || isHovered || isClicked;

  return (
    <motion.div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsClicked(prev => !prev)}
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        y: 0, 
        scale: 1,
        width: isExpanded ? "210px" : "48px",
        height: "48px",
        borderRadius: "9999px"
      }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-start gap-3 backdrop-blur-xl bg-zinc-950/85 border border-white/[0.06] shadow-[0_12px_40px_rgba(0,0,0,0.6)] hover:border-blue-500/30 transition-colors duration-300 cursor-pointer overflow-hidden p-2"
      id="floating-chrono-ai-status"
      style={{
        boxSizing: "border-box",
      }}
    >
      <div className="relative flex items-center justify-center flex-shrink-0 ml-1.5" style={{ width: "24px", height: "24px" }}>
        <div className="absolute -inset-1 rounded-full bg-blue-500/15 animate-ping opacity-60" />
        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 border border-blue-500/25 flex items-center justify-center">
          <Bot className="w-3.5 h-3.5 text-blue-400 animate-[bounce_2.5s_infinite]" />
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0, width: 0, x: -10 }}
            animate={{ opacity: 1, width: "auto", x: 0 }}
            exit={{ opacity: 0, width: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="text-left space-y-0.5 min-w-[130px] flex-shrink-0 flex flex-col justify-center select-none"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-mono font-black text-blue-400 uppercase tracking-wider">Chrono OS AI</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="flex items-center gap-1.5 h-4">
              <p className="text-[11px] text-zinc-300 font-medium whitespace-nowrap">
                {current.text}
              </p>
              <span className="flex gap-0.5 items-center justify-center h-2">
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// --------------------------------------------------
// SUBTLE FLOATING AMBIENT BACKGROUNDS
// --------------------------------------------------
export const FloatingBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-500/5 blur-[120px] mix-blend-screen animate-[pulse_10s_infinite_ease-in-out]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45vw] h-[45vw] rounded-full bg-cyan-500/5 blur-[100px] mix-blend-screen animate-[pulse_12s_infinite_ease-in-out_2s]" />
      <div className="absolute top-[40%] right-[15%] w-[35vw] h-[35vw] rounded-full bg-purple-500/3 blur-[140px] mix-blend-screen animate-[pulse_8s_infinite_ease-in-out_1s]" />

      <div className="absolute inset-0">
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-cyan-400/20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
            animate={{
              y: [0, -40, 0],
              x: [0, Math.random() * 20 - 10, 0],
              opacity: [0.1, 0.4, 0.1]
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>
    </div>
  );
};

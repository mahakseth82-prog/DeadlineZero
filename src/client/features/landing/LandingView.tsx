/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Cpu, 
  Calendar, 
  Zap, 
  Flame, 
  Bot, 
  BarChart2, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  X, 
  Github, 
  Twitter, 
  Linkedin, 
  Smartphone,
  Play,
  Clock,
  Heart,
  Send,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

// ==========================================
// FLOATING 3D CHRONO CORE COMPONENT
// ==========================================
const ChronoCore: React.FC = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 12;
    const y = (e.clientY - rect.top - rect.height / 2) / 12;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0 });
    setIsHovered(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsHovered(true)}
      className="relative w-72 h-72 sm:w-80 sm:h-80 lg:w-96 lg:h-96 flex items-center justify-center cursor-pointer select-none mx-auto lg:mx-0"
    >
      <motion.div
        animate={{
          rotateY: coords.x,
          rotateX: -coords.y,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={{ type: "spring", stiffness: 150, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Outer glowing halo */}
        <div className="absolute inset-0 rounded-full bg-violet-600/10 blur-[60px] animate-pulse-soft" />
        
        {/* Ring 1 - Outer */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d", translateZ: 20 }}
          className="absolute w-64 h-64 sm:w-72 sm:h-72 lg:w-80 lg:h-80 rounded-full border border-violet-500/20 flex items-center justify-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-violet-400 rounded-full shadow-[0_0_15px_#a78bfa]" />
        </motion.div>

        {/* Ring 2 - Middle (Counter-rotating) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d", translateZ: 40 }}
          className="absolute w-48 h-48 sm:w-56 sm:h-56 lg:w-64 lg:h-64 rounded-full border border-indigo-500/30 flex items-center justify-center"
        >
          <div className="absolute bottom-0 left-1/3 w-2.5 h-2.5 bg-indigo-400 rounded-full shadow-[0_0_12px_#818cf8]" />
        </motion.div>

        {/* Ring 3 - Inner (Tilting) */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d", translateZ: 60 }}
          className="absolute w-36 h-36 sm:w-40 sm:h-40 lg:w-48 lg:h-48 rounded-full border border-cyan-500/40 flex items-center justify-center"
        >
          <div className="absolute top-1/2 right-0 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_#22d3ee]" />
        </motion.div>

        {/* Center Chrono Core (glowing crystal sphere) */}
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            boxShadow: [
              "0 0 30px rgba(139,92,246,0.3)",
              "0 0 50px rgba(139,92,246,0.65)",
              "0 0 30px rgba(139,92,246,0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ translateZ: 80 }}
          className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center border border-white/20 shadow-[0_0_35px_rgba(139,92,246,0.4)]"
        >
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)] animate-pulse" />
        </motion.div>

        {/* Floating particles */}
        <div className="absolute w-full h-full pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
              initial={{
                x: Math.random() * 160 - 80,
                y: Math.random() * 160 - 80,
                opacity: 0.2,
              }}
              animate={{
                x: [Math.random() * 160 - 80, Math.random() * 160 - 80],
                y: [Math.random() * 160 - 80, Math.random() * 160 - 80],
                opacity: [0.15, 0.7, 0.15],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// INTERACTIVE DASHBOARD PREVIEW MOCKUP
// ==========================================
const InteractiveMockup: React.FC = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [panicActive, setPanicActive] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, text: "Design premium landing sections & grids", done: true, time: "09:00 AM", category: "Core Design" },
    { id: 2, text: "Configure interactive 3D Chrono Core", done: false, time: "11:30 AM", category: "Development" },
    { id: 3, text: "Verify strict linting & compiler rules", done: false, time: "03:15 PM", category: "Security" },
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / 45; 
    const y = (e.clientY - rect.top - rect.height / 2) / 45;
    setCoords({ x, y });
  };

  const handleMouseLeave = () => {
    setCoords({ x: 0, y: 0 });
  };

  const toggleTask = (id: number) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const completedCount = tasks.filter(t => t.done).length;
  const score = Math.round((completedCount / tasks.length) * 100);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full rounded-2xl border border-white/[0.06] shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden bg-zinc-950/40 backdrop-blur-xl transition-all duration-300"
      style={{
        transform: `perspective(1200px) rotateY(${coords.x}deg) rotateX(${-coords.y}deg)`,
      }}
    >
      {/* Top Header of Mock Window */}
      <div className={`flex items-center justify-between border-b px-5 py-3 transition-colors duration-500 ${
        panicActive ? "bg-red-950/20 border-red-500/20" : "bg-zinc-950/40 border-white/[0.04]"
      }`}>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
          <span className="ml-3 text-[10px] font-mono text-zinc-500">deadlinezero-dashboard_v2.0</span>
        </div>
        <button
          onClick={() => setPanicActive(!panicActive)}
          className={`px-3 py-1 rounded-full text-[9px] font-mono font-bold uppercase transition-all duration-300 tracking-wider flex items-center gap-1.5 ${
            panicActive
              ? "bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)] animate-pulse"
              : "bg-red-500/15 text-red-400 border border-red-500/25 hover:bg-red-500/25"
          }`}
        >
          <Flame className="w-3 h-3" />
          {panicActive ? "Panic Protocol Active" : "Trigger Panic Mode"}
        </button>
      </div>

      {/* Grid: Sidebar + Workspace */}
      <div className="grid grid-cols-1 md:grid-cols-12 min-h-[400px]">
        {/* Sidebar */}
        <div className="md:col-span-3 border-r border-white/[0.04] p-4 bg-zinc-950/20 space-y-5 text-left">
          <div className="flex items-center gap-2 px-1">
            <span className="w-5 h-5 rounded bg-violet-600 flex items-center justify-center text-[10px] font-black text-white font-mono">DZ</span>
            <span className="text-xs font-bold text-zinc-200">DeadlineZero</span>
          </div>
          
          <div className="space-y-1">
            {[
              { label: "Dashboard", active: true },
              { label: "Tasks", active: false },
              { label: "Calendar", active: false },
              { label: "Focus Room", active: false },
              { label: "AI Coach", active: false },
              { label: "Analytics", active: false },
            ].map(item => (
              <div
                key={item.label}
                className={`flex items-center px-2 py-1.5 rounded-md text-[10px] font-medium cursor-default transition-colors ${
                  item.active 
                    ? "bg-violet-600/10 border border-violet-500/15 text-violet-300" 
                    : "text-zinc-500 hover:text-zinc-350"
                }`}
              >
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-white/[0.02]">
            <span className="text-[8px] font-mono font-bold text-zinc-600 uppercase tracking-widest block px-1">Engine Triage</span>
            <div className="mt-1.5 px-2 py-1.5 rounded bg-zinc-950/40 border border-white/[0.02] flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-mono text-zinc-400">Triage Status: Safe</span>
            </div>
          </div>
        </div>

        {/* Main Content Pane */}
        <div className={`md:col-span-9 p-5 text-left space-y-5 transition-colors duration-500 ${
          panicActive ? "bg-red-950/[0.03]" : "bg-transparent"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.02] pb-3.5">
            <div>
              <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-1.5">
                Active Space Workspace
                <span className="text-[9px] font-mono font-normal text-zinc-500 px-1.5 py-0.5 rounded bg-white/[0.02] border border-white/[0.04]">mahakseth_</span>
              </h4>
              <p className="text-[10px] text-zinc-500 mt-0.5">Real-time predictive pipeline monitoring.</p>
            </div>
            
            <div className="flex items-center gap-2.5 bg-zinc-950/35 border border-white/[0.03] px-3 py-1.5 rounded-lg">
              <div className="relative w-8 h-8 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="16" cy="16" r="12" stroke="rgba(255,255,255,0.02)" strokeWidth="2.5" fill="transparent" />
                  <circle
                    cx="16" cy="16" r="12"
                    stroke={panicActive ? "#f87171" : "#8b5cf6"}
                    strokeWidth="2.5" fill="transparent"
                    strokeDasharray={2 * Math.PI * 12}
                    strokeDashoffset={2 * Math.PI * 12 * (1 - score / 100)}
                    className="transition-all duration-700"
                  />
                </svg>
                <span className="absolute text-[9px] font-mono font-bold text-zinc-300">{score}%</span>
              </div>
              <div className="leading-none">
                <p className="text-[8px] font-mono font-bold text-zinc-400 uppercase tracking-wider">Sprint Pace</p>
                <p className="text-[8px] text-zinc-500 mt-0.5">{panicActive ? "Pressure schedule" : "Optimal velocity"}</p>
              </div>
            </div>
          </div>

          {panicActive ? (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/20 text-red-400 text-[11px] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-0.5">
                  <p className="font-bold uppercase tracking-wide">Emergency Triage Activated</p>
                  <p className="text-red-300 font-light leading-relaxed">
                    Meetings delayed. Schedule reorganized into high-intensity 45-minute study/work sprints. Focus lock active.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">Panic Mode Live Timeline</span>
                <div className="relative border-l border-red-500/15 pl-4 ml-2 space-y-3 pt-1">
                  {[
                    { time: "01:00 PM - 01:45 PM", title: "Clean styling structures & layout grid", desc: "Ambient study synthesizers activated.", status: "Active" },
                    { time: "01:45 PM - 02:00 PM", title: "Rest & Hydrate Block", desc: "Mandatory physical offline block.", status: "Pending" },
                    { time: "02:00 PM - 02:45 PM", title: "Review compilation & check build", desc: "Automatic verification sequence.", status: "Pending" },
                  ].map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[21px] top-1 w-2 h-2 rounded-full border ${
                        idx === 0 ? "bg-red-500 border-red-400 shadow-[0_0_8px_#f87171]" : "bg-zinc-950 border-red-500/25"
                      }`} />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-mono text-red-400 font-bold">{step.time}</span>
                          {idx === 0 && <span className="text-[8px] font-mono font-bold px-1.5 py-0.2 bg-red-500/10 rounded border border-red-500/20 animate-pulse text-red-400">Running</span>}
                        </div>
                        <h5 className="text-xs font-bold text-zinc-200">{step.title}</h5>
                        <p className="text-[10px] text-zinc-500 font-light">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Task Checklist */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider">Today's Focus Checklist</span>
                  <span className="text-[9px] font-mono text-violet-400">{completedCount}/{tasks.length} Done</span>
                </div>

                <div className="space-y-2">
                  {tasks.map(task => (
                    <div
                      key={task.id}
                      onClick={() => toggleTask(task.id)}
                      className={`flex items-start gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all duration-300 ${
                        task.done
                          ? "bg-violet-600/[0.02] border-violet-500/15"
                          : "bg-zinc-950/25 border-white/[0.04] hover:border-white/[0.08]"
                      }`}
                    >
                      <div className={`mt-0.5 w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${
                        task.done
                          ? "bg-violet-500 border-violet-400 text-white"
                          : "border-zinc-700/60"
                      }`}>
                        {task.done && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[11px] font-semibold leading-relaxed transition-all ${
                          task.done ? "line-through text-zinc-500" : "text-zinc-250"
                        }`}>{task.text}</p>
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[8px] font-mono text-zinc-500 font-bold uppercase">{task.category}</span>
                          <span className="w-0.5 h-0.5 rounded-full bg-zinc-800" />
                          <span className="text-[8px] font-mono text-zinc-500">{task.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Coach */}
              <div className="space-y-3">
                <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase tracking-wider block">AI Coach Node</span>
                
                <div className="bg-zinc-950/45 border border-white/[0.03] rounded-xl p-3.5 space-y-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-violet-500/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-zinc-300 uppercase tracking-wider">Coach Chrono</span>
                    <span className="text-[8px] font-mono text-violet-400 ml-auto bg-violet-500/10 px-1.5 py-0.5 rounded-full border border-violet-500/15">Active</span>
                  </div>

                  <p className="text-[10px] text-zinc-300 leading-relaxed font-light">
                    "I analyzed your work patterns over the last 12 days. Your peak focus density is between <strong>10:00 AM and 11:45 AM</strong>. Let's schedule tomorrow's toughest tasks inside this cognitive window."
                  </p>

                  <div className="pt-2 border-t border-white/[0.02] flex items-center justify-between text-[8px] font-mono text-zinc-500">
                    <span>CHRONO FEEDBACK</span>
                    <span className="text-violet-400 font-bold">12 Days Streak Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ==========================================
// MAIN PREMIUM REDESIGNED LANDINGVIEW
// ==========================================
export const LandingView: React.FC = () => {
  const navigate = useNavigate();

  // Dialog / Overlay triggers
  const [showDemo, setShowDemo] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Contact modal state
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setContactSuccess(true);
    setTimeout(() => {
      setContactSuccess(false);
      setContactForm({ name: '', email: '', message: '' });
      setShowContact(false);
    }, 2000);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#030014] text-zinc-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-white overflow-x-hidden relative">
      
      {/* ==========================================
          BACKGROUND (Animated mesh & glowing orbs)
          ========================================== */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Slow floating blurred meshes */}
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-violet-600/10 blur-[130px] animate-mesh-drift" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[130px] animate-mesh-drift-reverse" />
        <div className="absolute top-[40%] left-[25%] w-[35%] h-[35%] rounded-full bg-cyan-500/5 blur-[120px] animate-orb-float" />
        
        {/* Subtle glowing particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] rounded-full bg-violet-400"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.15, 0.65, 0.15],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 6 + Math.random() * 8,
                repeat: Infinity,
                ease: "easeInOut",
                delay: Math.random() * 5
              }}
            />
          ))}
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-950/0 via-zinc-950/0 to-zinc-950/90" />
      </div>

      {/* ==========================================
          NAVBAR (Sticky transparent glassmorphism)
          ========================================== */}
      <header className={`fixed top-0 z-50 w-full border-b transition-all duration-500 ${
        isScrolled 
          ? "premium-glass py-3 bg-zinc-950/70 border-white/[0.04] shadow-[0_4px_30px_rgba(0,0,0,0.5)]" 
          : "bg-transparent py-5 border-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-[0_0_15px_rgba(139,92,246,0.4)]">
              DZ
            </div>
            <span className="font-extrabold tracking-tight text-lg text-white font-mono uppercase">
              DeadlineZero
            </span>
          </div>

          {/* Navigation links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400">
            <button 
              onClick={() => scrollToSection('features')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => scrollToSection('how-it-works')} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              How It Works
            </button>
            <button 
              onClick={() => {
                setShowAbout(true);
                scrollToSection('about');
              }} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/login')}
              className="text-zinc-300 hover:text-white text-xs font-mono uppercase font-bold"
            >
              Login
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={() => navigate('/signup')}
              className="shadow-[0_0_15px_rgba(139,92,246,0.35)] text-xs font-mono uppercase font-bold px-4 py-2"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* ==========================================
          HERO SECTION (Spacious and Premium)
          ========================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-24 md:pt-40 md:pb-32 flex items-center min-h-[85vh]">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Side Content */}
          <div className="lg:col-span-3 text-left space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-mono uppercase font-bold tracking-widest shadow-[0_0_12px_rgba(139,92,246,0.15)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
              <span>Introducing DeadlineZero v2.0</span>
            </motion.div>

            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-black text-white leading-[1.05] tracking-tight font-sans"
              >
                Your AI Productivity <br />
                <span className="bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-300 bg-clip-text text-transparent">
                  Operating System.
                </span>
              </motion.h1>

              <motion.div 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-base sm:text-lg text-zinc-400 max-w-lg font-light leading-relaxed space-y-1 pt-1"
              >
                <p>Plan smarter.</p>
                <p>Focus deeper.</p>
                <p>Finish before every deadline.</p>
                <p className="text-violet-450 font-mono font-semibold text-xs tracking-wider uppercase pt-2">Powered by Chrono AI.</p>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <Button 
                size="lg" 
                onClick={() => navigate('/signup')}
                className="gap-2 shadow-[0_0_20px_rgba(139,92,246,0.35)] hover:shadow-[0_0_30px_rgba(139,92,246,0.55)] font-mono font-bold uppercase tracking-wider text-xs px-6 py-3.5"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={() => setShowDemo(true)}
                className="gap-2 border-white/[0.08] hover:border-violet-500/30 text-zinc-300 hover:text-white font-mono font-bold uppercase tracking-wider text-xs px-6 py-3.5 bg-white/[0.01]"
              >
                <Play className="w-3.5 h-3.5 fill-violet-400 text-violet-400" />
                <span>Watch Demo</span>
              </Button>
            </motion.div>

            {/* Small Trust Badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="flex flex-wrap items-center gap-6 pt-6 border-t border-white/[0.03] max-w-md text-[10px] font-mono uppercase tracking-widest text-zinc-500 font-bold"
            >
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_#6366f1]" />
                <span>Student Friendly</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_#06b6d4]" />
                <span>Professional Workflow</span>
              </div>
            </motion.div>
          </div>

          {/* Right Side Content (Interactive Orb) */}
          <div className="lg:col-span-2 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              <ChronoCore />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ==========================================
          TRUST STRIP (Minimal row)
          ========================================== */}
      <section className="relative z-10 w-full border-y border-white/[0.04] bg-zinc-950/25 py-6 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap justify-center md:justify-between items-center gap-8 md:gap-4 text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
            <div className="flex items-center gap-2 hover:text-zinc-300 transition-colors cursor-default group">
              <Cpu className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors duration-300" />
              <span>AI Powered</span>
            </div>
            <div className="flex items-center gap-2 hover:text-zinc-300 transition-colors cursor-default group">
              <Zap className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 transition-colors duration-300" />
              <span>Fast</span>
            </div>
            <div className="flex items-center gap-2 hover:text-zinc-300 transition-colors cursor-default group">
              <ShieldCheck className="w-4 h-4 text-zinc-600 group-hover:text-cyan-400 transition-colors duration-300" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-2 hover:text-zinc-300 transition-colors cursor-default group">
              <Smartphone className="w-4 h-4 text-zinc-600 group-hover:text-pink-400 transition-colors duration-300" />
              <span>Responsive</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          PRODUCT PREVIEW (One premium dashboard mockup)
          ========================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="space-y-4 mb-16 max-w-2xl mx-auto">
          <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest bg-violet-500/5 border border-violet-500/15 px-3 py-1 rounded-full">
            Interface
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Designed for high-stakes focus.
          </h2>
          <p className="text-sm text-zinc-400 font-light leading-relaxed">
            Click checklist items to test schedule feedback, or trigger Panic Mode to see the engine live-restructure deadlines in response to blockages.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-[-1px] rounded-2xl bg-gradient-to-b from-white/10 to-transparent opacity-30 blur-sm pointer-events-none" />
          <InteractiveMockup />
        </div>
      </section>

      {/* ==========================================
          FEATURES SECTION (Six Cards - One-Liners)
          ========================================== */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest bg-violet-500/5 border border-violet-500/15 px-3 py-1 rounded-full">
            Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            An entire suite of execution.
          </h2>
          <p className="text-sm text-zinc-400 font-light">
            Six cohesive modules unified under a single cognitive operating system.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: Cpu,
              title: "AI Task Engine",
              desc: "Dynamically prioritizes task arrays based on deadline latency.",
              color: "text-violet-450 bg-violet-500/10 border-violet-500/20"
            },
            {
              icon: Calendar,
              title: "Smart Calendar",
              desc: "Bi-directional integration slots focus blocks into open gaps automatically.",
              color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20"
            },
            {
              icon: Clock,
              title: "Focus Room",
              desc: "Dedicated high-intensity countdown workspace with ambient audio controls.",
              color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20"
            },
            {
              icon: Flame,
              title: "Panic Mode",
              desc: "Single-click triage instantly reorganizes converging deadlines into high-yield sprints.",
              color: "text-red-400 bg-red-500/10 border-red-500/20"
            },
            {
              icon: Bot,
              title: "AI Coach",
              desc: "Proactive 24/7 advisor tracking streaks and warning against burnout.",
              color: "text-pink-400 bg-pink-500/10 border-pink-500/20"
            },
            {
              icon: BarChart2,
              title: "Analytics",
              desc: "High-resolution cognitive logs mapping focus duration ratios.",
              color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
            }
          ].map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="group relative rounded-2xl border border-white/[0.04] p-6 text-left bg-zinc-950/45 hover:border-violet-500/25 transition-all duration-300 hover:shadow-[0_0_30px_rgba(139,92,246,0.12)]"
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.01] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border mb-4 ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white transition-colors group-hover:text-violet-400">{feat.title}</h3>
                <p className="text-xs text-zinc-400 mt-2.5 leading-relaxed font-light">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ==========================================
          HOW IT WORKS (Clean Horizontal Timeline)
          ========================================== */}
      <section id="how-it-works" className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/[0.03]">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest bg-violet-500/5 border border-violet-500/15 px-3 py-1 rounded-full">
            Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            How it works.
          </h2>
          <p className="text-sm text-zinc-400 font-light">
            Simple, automated step integration to secure study outputs.
          </p>
        </div>

        {/* Clean Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Horizontal connecting track on desktop */}
          <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-gradient-to-r from-violet-500/10 via-indigo-500/30 to-cyan-500/10 -translate-y-1/2 hidden lg:block" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8 relative z-10">
            {[
              {
                step: "1",
                title: "Create Tasks",
                desc: "Quickly declare key items, dates, and hours required."
              },
              {
                step: "2",
                title: "Chrono Plans Your Day",
                desc: "Our engine optimizes active capacity alongside schedule openings."
              },
              {
                step: "3",
                title: "Complete Work Stress-Free",
                desc: "Focus deeply in noise-cancelled spaces and deliver before targets."
              }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center text-center space-y-4">
                {/* Timeline circle */}
                <div className="w-12 h-12 rounded-full border border-violet-500/30 bg-zinc-950 flex items-center justify-center font-mono font-bold text-sm text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.25)] relative">
                  <span>{step.step}</span>
                  {/* Subtle pulsing beacon */}
                  <span className="absolute inset-0 rounded-full border border-violet-400/20 animate-ping opacity-30" />
                </div>
                
                <div className="space-y-1 max-w-xs">
                  <h4 className="text-base font-bold text-white font-sans">{step.title}</h4>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ==========================================
          WHY DEADLINEZERO (Three Comparison Cards)
          ========================================== */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24 border-t border-white/[0.03]">
        <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
          <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest bg-violet-500/5 border border-violet-500/15 px-3 py-1 rounded-full">
            Comparison
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Why DeadlineZero.
          </h2>
          <p className="text-sm text-zinc-400 font-light">
            Minimal, honest contrast showing how AI changes your execution loop.
          </p>
        </div>

        {/* Three comparison cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: "Planning Methodology",
              badTitle: "Manual Planning",
              badText: "Constant manual restructuring under fatigue and guesswork.",
              goodTitle: "AI Planning",
              goodText: "Auto-rebalancing computed in milliseconds based on focus capacity."
            },
            {
              title: "Timeline Security",
              badTitle: "Forgotten Deadlines",
              badText: "Unmonitored delays resulting in backlog noise and late drops.",
              goodTitle: "Automatic Scheduling",
              goodText: "Bi-directional bindings protect dates and warn prior to convergence."
            },
            {
              title: "Focus Quality",
              badTitle: "Scattered Notes",
              badText: "Fragmented contexts, scattered tasks, and infinite context switching.",
              goodTitle: "Focus Sessions & Recovery",
              goodText: "Integrated countdown rooms with mandatory rests and emergency rescues."
            }
          ].map((card, idx) => (
            <div key={idx} className="rounded-2xl border border-white/[0.04] bg-zinc-950/40 p-6 flex flex-col justify-between text-left space-y-6">
              <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{card.title}</span>
              
              <div className="space-y-5">
                {/* Without AI block */}
                <div className="space-y-1.5 opacity-60">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <h5 className="text-xs font-bold text-zinc-350">{card.badTitle}</h5>
                  </div>
                  <p className="text-[11px] text-zinc-500 font-light leading-relaxed pl-3.5">{card.badText}</p>
                </div>

                {/* divider */}
                <div className="border-t border-white/[0.02]" />

                {/* With DZ block */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-500 shadow-[0_0_8px_#8b5cf6]" />
                    <h5 className="text-xs font-bold text-white">{card.goodTitle}</h5>
                  </div>
                  <p className="text-[11px] text-zinc-400 font-light leading-relaxed pl-3.5">{card.goodText}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==========================================
          ABOUT SECTION (High impact, minimal paragraph)
          ========================================== */}
      <section id="about" className="relative z-10 max-w-4xl mx-auto px-6 py-24 border-t border-white/[0.03] text-center">
        <div className="space-y-6">
          <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">The Philosophy</span>
          <p className="text-lg sm:text-xl text-zinc-300 font-light leading-relaxed max-w-2xl mx-auto">
            "We believe time is a finite resource, and cognitive overload is the enemy of craft. Built with Chrono AI, DeadlineZero is designed to help high-stakes creators, researchers, and engineers plan stress-free, execute deeply, and reclaim hours of quiet focus."
          </p>
          <div className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider pt-2">
            <span>Designed in SF</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>Built for execution</span>
          </div>
        </div>
      </section>

      {/* ==========================================
          FINAL CTA (Centered with Background Glow)
          ========================================== */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="relative overflow-hidden rounded-2xl border border-white/[0.05] p-12 bg-zinc-950/40 backdrop-blur-md">
          {/* Subtle purple background glow behind CTA */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-violet-600/10 rounded-full blur-[110px] pointer-events-none" />
          
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to take control of your deadlines?
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
              Create your secure workspace in seconds. Reorganize study milestones, trigger Panic Rescue, and unlock peak productivity for free.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
              <Button 
                onClick={() => navigate('/signup')}
                className="w-full sm:w-auto shadow-[0_0_15px_rgba(139,92,246,0.35)] font-mono font-bold uppercase tracking-wider text-xs px-6 py-3.5"
              >
                <span>Start Free</span>
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto border-white/[0.08] hover:border-violet-500/30 text-zinc-300 font-mono font-bold uppercase tracking-wider text-xs px-6 py-3.5 bg-white/[0.01]"
              >
                <span>Login</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          FOOTER SECTION (Minimal)
          ========================================== */}
      <footer className="relative z-10 w-full border-t border-white/[0.04] bg-zinc-950/60 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-xs font-mono text-zinc-500 font-medium">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-[10px] shadow-[0_0_10px_rgba(139,92,246,0.35)]">
              DZ
            </div>
            <span className="font-extrabold tracking-tight text-white uppercase text-xs">DeadlineZero</span>
          </div>

          {/* Quick links & socials */}
          <div className="flex flex-wrap justify-center items-center gap-6 font-bold uppercase text-[10px] tracking-widest text-zinc-400">
            <button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">How It Works</button>
            <button onClick={() => setShowAbout(true)} className="hover:text-white transition-colors">About</button>
            <button onClick={() => setShowContact(true)} className="hover:text-white transition-colors">Contact</button>
            <span className="text-zinc-700">|</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/signup')}>Terms</span>
            <span className="hover:text-white cursor-pointer transition-colors" onClick={() => navigate('/signup')}>Privacy</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Github className="w-4 h-4" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-4 h-4" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              <Linkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </footer>

      {/* ==========================================
          WATCH DEMO LIGHTBOX / MODAL
          ========================================== */}
      <AnimatePresence>
        {showDemo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDemo(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-4xl rounded-2xl border border-white/[0.08] bg-zinc-900/90 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <button 
                onClick={() => setShowDemo(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 space-y-6 text-left">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-wider">Product Walkthrough</span>
                  <h3 className="text-xl font-bold text-white">Chrono AI Engine Simulation</h3>
                  <p className="text-xs text-zinc-400">See how DeadlineZero secures your study timeline dynamically in real time.</p>
                </div>

                {/* Simulated high-end visual process demonstration */}
                <div className="border border-white/[0.04] rounded-xl overflow-hidden bg-zinc-950/60 p-6 space-y-6 min-h-[300px] flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 border-b border-white/[0.02] pb-3 text-xs font-mono font-bold uppercase tracking-widest text-zinc-500">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
                    </span>
                    <span>Active Simulation Stream</span>
                  </div>

                  {/* High quality sequence blocks */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4">
                    {[
                      { step: "Syllabus Ingestion", desc: "PDF loaded, 4 projects auto-extracted & timestamped.", icon: Sparkles },
                      { step: "Calendar Intersect", desc: "Clash check with standard calendar completed.", icon: Calendar },
                      { step: "Cognitive Balance", desc: "Ideal focus intervals plotted avoiding burnout blocks.", icon: Cpu },
                      { step: "Chronological Lock", desc: "Seamless timeline established with 0 stress index.", icon: ShieldCheck }
                    ].map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.15 }}
                          className="p-3.5 rounded-lg bg-zinc-900/50 border border-white/[0.03] text-left space-y-2 relative"
                        >
                          <div className="w-7 h-7 rounded-lg bg-violet-600/10 border border-violet-500/15 flex items-center justify-center text-violet-400">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <p className="text-[11px] font-bold text-zinc-200">{item.step}</p>
                          <p className="text-[9px] text-zinc-500 leading-relaxed font-light">{item.desc}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                    <span>CHRONO SIMULATION COMPLETE v2.0</span>
                    <span className="text-violet-400 font-bold hover:underline cursor-pointer" onClick={() => navigate('/signup')}>Create Account To Use Engine →</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowDemo(false)}
                    className="text-xs font-mono uppercase font-bold text-zinc-400 border-white/[0.08]"
                  >
                    Close Demo
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowDemo(false);
                      navigate('/signup');
                    }}
                    className="text-xs font-mono uppercase font-bold"
                  >
                    Create Workspace
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </ AnimatePresence>

      {/* ==========================================
          CONTACT MODAL (Minimal and High Impact)
          ========================================== */}
      <AnimatePresence>
        {showContact && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowContact(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-900/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <button 
                onClick={() => setShowContact(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 space-y-6 text-left">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-wider">Get in Touch</span>
                  <h3 className="text-xl font-bold text-white font-sans">Contact Support</h3>
                  <p className="text-xs text-zinc-400">Have specific deployment or enterprise workspace inquiries? Send a message to the team.</p>
                </div>

                {contactSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-8 text-center space-y-3 bg-violet-600/5 rounded-xl border border-violet-500/20"
                  >
                    <div className="w-10 h-10 rounded-full bg-violet-600/10 border border-violet-500/25 flex items-center justify-center mx-auto text-violet-400">
                      <Send className="w-5 h-5" />
                    </div>
                    <p className="text-xs font-bold text-white">Message Transmitted</p>
                    <p className="text-[10px] text-zinc-400">Your secure inquiry has been securely sent to our dispatch grid.</p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                      <input
                        type="text"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        placeholder="e.g. Mahak Seth"
                        className="w-full bg-zinc-950/40 border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all focus:border-violet-500/50"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                      <input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        placeholder="e.g. mahakseth82@gmail.com"
                        className="w-full bg-zinc-950/40 border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all focus:border-violet-500/50"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Message</label>
                      <textarea
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        placeholder="Your inquiry..."
                        rows={4}
                        className="w-full bg-zinc-950/40 border border-white/[0.06] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-violet-500/30 transition-all focus:border-violet-500/50 resize-none"
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full font-mono font-bold uppercase tracking-wider text-xs py-3 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                      Transmit Inquiry
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          ABOUT LIGHTBOX MODAL
          ========================================== */}
      <AnimatePresence>
        {showAbout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAbout(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-md rounded-2xl border border-white/[0.08] bg-zinc-900/95 shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden"
            >
              <button 
                onClick={() => setShowAbout(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="p-8 space-y-6 text-left">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-violet-400 font-bold uppercase tracking-wider">The Mission</span>
                  <h3 className="text-xl font-bold text-white font-sans">About DeadlineZero</h3>
                  <p className="text-xs text-zinc-400">Crafting systems to achieve flawless study & work loops under high-stakes backlogs.</p>
                </div>

                <div className="space-y-4 text-xs text-zinc-300 leading-relaxed font-light">
                  <p>
                    DeadlineZero was born out of a simple, critical truth: traditional calendar and task planners are structurally broken. They operate statically, forcing you to manually re-schedule under stress when delays compound.
                  </p>
                  <p>
                    We designed <strong>Chrono AI</strong> to make calendars fluid. By dynamically estimating load indicators, calculating study fatigue gaps, and isolating focus milestones, our system heals your daily pipeline automatically.
                  </p>
                  <p className="font-medium text-white flex items-center gap-1.5">
                    Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for the high-yield builder.
                  </p>
                </div>

                <div className="flex justify-end gap-3">
                  <Button 
                    variant="outline"
                    onClick={() => setShowAbout(false)}
                    className="text-xs font-mono uppercase font-bold text-zinc-400 border-white/[0.08]"
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowAbout(false);
                      navigate('/signup');
                    }}
                    className="text-xs font-mono uppercase font-bold animate-pulse"
                  >
                    Start Free
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

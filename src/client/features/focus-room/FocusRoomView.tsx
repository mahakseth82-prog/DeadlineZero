/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Flame, 
  Sparkles, 
  Moon,
  Clock,
  Music,
  CheckCircle2,
  Expand,
  Shrink,
  Bot,
  Zap,
  Coffee,
  AlertTriangle,
  Award,
  Terminal,
  Volume1,
  X,
  Volume,
  BookOpen,
  CloudRain,
  Trees,
  Coffee as CafeIcon,
  Waves,
  FileAudio,
  FlameKindling,
  Smartphone,
  Eye,
  RefreshCw,
  Sparkle
} from 'lucide-react';
import { useFocusStore, AmbientSoundType } from '../../store/focus.store';
import { useTaskStore } from '../../store/task.store';
import { Task, TaskPriority, TaskStatus } from '../../../types';
import { useUiStore } from '../../store/ui.store';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { formatEffort } from '../../utils/time';
import { motion, AnimatePresence } from 'motion/react';
import { FocusEnergyCore } from '../../components/futuristic/FocusEnergyCore';

// Custom Client-Side Ambient Sound Synthesizer using Web Audio API
class LiveSynthEngine {
  private ctx: AudioContext | null = null;
  private activeNodes: AudioNode[] = [];
  private activeIntervals: number[] = [];
  private masterVolume: GainNode | null = null;
  private currentVolume: number = 0.5;
  private currentSoundType: string | null = null;

  init() {
    if (typeof window === 'undefined') return;
    if (!this.ctx) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.ctx = new AudioContextClass();
        this.masterVolume = this.ctx.createGain();
        this.masterVolume.gain.setValueAtTime(this.currentVolume, this.ctx.currentTime);
        this.masterVolume.connect(this.ctx.destination);
      } catch (e) {
        console.error('Web Audio API not supported', e);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(volume: number) {
    this.currentVolume = volume;
    if (this.masterVolume && this.ctx) {
      this.masterVolume.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 0.1);
    }
  }

  stopAll() {
    this.activeNodes.forEach(node => {
      try { (node as any).stop?.(); } catch (e) {}
      try { node.disconnect(); } catch (e) {}
    });
    this.activeNodes = [];
    this.activeIntervals.forEach(interval => clearInterval(interval));
    this.activeIntervals = [];
    this.currentSoundType = null;
  }

  private createNoiseBuffer(color: 'white' | 'pink' | 'brown') {
    if (!this.ctx) return null;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (color === 'white') {
        output[i] = white;
      } else if (color === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      } else if (color === 'brown') {
        output[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }
    }
    return noiseBuffer;
  }

  play(type: string) {
    this.init();
    this.stopAll();
    if (!this.ctx || !this.masterVolume) return;

    this.currentSoundType = type;
    const ctx = this.ctx;
    const dest = this.masterVolume;

    if (type === 'rain') {
      const noise = ctx.createBufferSource();
      const buffer = this.createNoiseBuffer('pink');
      if (buffer) {
        noise.buffer = buffer;
        noise.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        noise.connect(filter);
        filter.connect(dest);
        noise.start();
        this.activeNodes.push(noise, filter);
      }

      // Droplets interval
      const dropletId = window.setInterval(() => {
        if (this.currentSoundType !== 'rain' || !this.ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400 + Math.random() * 900, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);

          gain.gain.setValueAtTime(0.015, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          osc.stop(ctx.currentTime + 0.15);
        } catch (e) {}
      }, 250);
      this.activeIntervals.push(dropletId);

    } else if (type === 'waves' || type === 'ocean') {
      const noise = ctx.createBufferSource();
      const buffer = this.createNoiseBuffer('brown');
      if (buffer) {
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(350, ctx.currentTime);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.09, ctx.currentTime); // ~11s cycles
        
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(120, ctx.currentTime);

        const lfoVol = ctx.createGain();
        lfoVol.gain.setValueAtTime(0.12, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        lfo.connect(lfoVol);
        lfoVol.connect(gain.gain);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(dest);

        noise.start();
        lfo.start();
        this.activeNodes.push(noise, filter, gain, lfo, lfoGain, lfoVol);
      }

    } else if (type === 'forest') {
      const noise = ctx.createBufferSource();
      const buffer = this.createNoiseBuffer('pink');
      if (buffer) {
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(130, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(dest);

        noise.start();
        lfo.start();
        this.activeNodes.push(noise, filter, lfo, lfoGain);
      }

      // Birds
      const birdId = window.setInterval(() => {
        if (this.currentSoundType !== 'forest' || !this.ctx) return;
        if (Math.random() > 0.5) {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            const f = 1800 + Math.random() * 1000;
            osc.frequency.setValueAtTime(f, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(f + 300, ctx.currentTime + 0.04);
            osc.frequency.linearRampToValueAtTime(f - 100, ctx.currentTime + 0.1);

            gain.gain.setValueAtTime(0.003, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.008, ctx.currentTime + 0.04);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);

            osc.connect(gain);
            gain.connect(dest);
            osc.start();
            osc.stop(ctx.currentTime + 0.14);
          } catch (e) {}
        }
      }, 1800);
      this.activeIntervals.push(birdId);

    } else if (type === 'cafe') {
      const noise = ctx.createBufferSource();
      const buffer = this.createNoiseBuffer('brown');
      if (buffer) {
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(220, ctx.currentTime);

        noise.connect(filter);
        filter.connect(dest);
        noise.start();
        this.activeNodes.push(noise, filter);
      }

      // Human chatter mumble harmonics
      const chatterId = window.setInterval(() => {
        if (this.currentSoundType !== 'cafe' || !this.ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(150 + Math.random() * 250, ctx.currentTime);

          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 0.3);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.7);

          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          osc.stop(ctx.currentTime + 0.8);
        } catch (e) {}
      }, 400);
      this.activeIntervals.push(chatterId);

    } else if (type === 'fireplace') {
      const noise = ctx.createBufferSource();
      const buffer = this.createNoiseBuffer('brown');
      if (buffer) {
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, ctx.currentTime);

        noise.connect(filter);
        filter.connect(dest);
        noise.start();
        this.activeNodes.push(noise, filter);
      }

      // Crackles
      const crackleId = window.setInterval(() => {
        if (this.currentSoundType !== 'fireplace' || !this.ctx) return;
        if (Math.random() > 0.35) {
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(1200 + Math.random() * 3200, ctx.currentTime);

            gain.gain.setValueAtTime(0.02, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.015);

            osc.connect(gain);
            gain.connect(dest);
            osc.start();
            osc.stop(ctx.currentTime + 0.025);
          } catch (e) {}
        }
      }, 90);
      this.activeIntervals.push(crackleId);

    } else if (type === 'white_noise') {
      const noise = ctx.createBufferSource();
      const buffer = this.createNoiseBuffer('white');
      if (buffer) {
        noise.buffer = buffer;
        noise.loop = true;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.08, ctx.currentTime);

        noise.connect(gain);
        gain.connect(dest);
        noise.start();
        this.activeNodes.push(noise, gain);
      }
    } else if (type === 'lofi') {
      // Meditative Lofi Chord Generator
      const chordGen = () => {
        if (this.currentSoundType !== 'lofi' || !this.ctx) return;
        const progressions = [
          [130.81, 164.81, 196.00, 246.94], // Cmaj7
          [146.83, 174.61, 220.00, 261.63], // Dm7
          [164.81, 196.00, 246.94, 293.66], // Em7
          [174.61, 220.00, 261.63, 329.63]  // Fmaj7
        ];
        const notes = progressions[Math.floor(Math.random() * progressions.length)];
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.025, ctx.currentTime + 1.2 + idx * 0.15);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 4.8);

            osc.connect(gain);
            gain.connect(dest);
            osc.start();
            osc.stop(ctx.currentTime + 5.0);
          } catch (e) {}
        });
      };
      chordGen();
      const lofiId = window.setInterval(chordGen, 5200);
      this.activeIntervals.push(lofiId);
    } else if (type === 'instrumental') {
      // Warm Sine Wave Pads
      const padGen = () => {
        if (this.currentSoundType !== 'instrumental' || !this.ctx) return;
        const notes = [110.00, 165.00, 220.00, 330.00, 440.00]; // Pentatonic A minor chord
        notes.forEach((freq, idx) => {
          if (!this.ctx) return;
          try {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, ctx.currentTime);

            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 1.8);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 6.8);

            osc.connect(gain);
            gain.connect(dest);
            osc.start();
            osc.stop(ctx.currentTime + 7.0);
          } catch (e) {}
        });
      };
      padGen();
      const padId = window.setInterval(padGen, 7200);
      this.activeIntervals.push(padId);
    } else if (type === 'nature_music') {
      // Periodic soft wind chimes / crystalline drops
      const chimeGen = () => {
        if (this.currentSoundType !== 'nature_music' || !this.ctx) return;
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 987.77];
          const freq = notes[Math.floor(Math.random() * notes.length)];
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.018, ctx.currentTime + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.8);

          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          osc.stop(ctx.currentTime + 3.0);
        } catch (e) {}
      };
      const chimeId = window.setInterval(() => {
        if (Math.random() > 0.35) chimeGen();
      }, 1500);
      this.activeIntervals.push(chimeId);
    }
  }
}

const MOTIVATIONAL_QUOTES = [
  { text: "Your focus determines your reality.", author: "Qui-Gon Jinn" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Deep work is not an option; it is a superpower.", author: "Cal Newport" },
  { text: "The successful warrior is the average man, with laser-like focus.", author: "Bruce Lee" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "There is no noise when you are truly immersed.", author: "Linear OS" },
  { text: "Work like there is an infinite horizon, focus like time expires in seconds.", author: "Vercel" }
];

export const FocusRoomView: React.FC = () => {
  const { addToast } = useUiStore();
  const { tasks, updateTask } = useTaskStore();
  const { 
    isRunning, 
    timeRemaining, 
    totalSessionDuration,
    activeTaskId, 
    activeTaskTitle,
    ambientSound, 
    isAudioPlaying,
    completedSessions,
    startTimer,
    pauseTimer,
    resetTimer,
    tick,
    setTimeRemaining,
    setAmbientSound,
    toggleAudio,
    linkTask
  } = useFocusStore();

  // Redesign state managers
  const [fullscreen, setFullscreen] = useState(false);
  const [activeTimerMode, setActiveTimerMode] = useState<'25' | '50' | '90' | 'custom'>('25');
  const [customMinutes, setCustomMinutes] = useState(25);
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'forest' | 'cafe' | 'ocean' | 'white_noise' | 'fireplace'>('none');
  const [activeMusic, setActiveMusic] = useState<'none' | 'lofi' | 'instrumental' | 'nature' | 'custom'>('none');
  const [soundVolume, setSoundVolume] = useState(0.5);
  const [musicVolume, setMusicVolume] = useState(0.4);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [showEndPopup, setShowEndPopup] = useState(false);
  const [statsSummary, setStatsSummary] = useState({ focusTime: 0, completedCount: 0, score: 98 });
  
  // Distraction variables
  const [phoneCount, setPhoneCount] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [breakCount, setBreakCount] = useState(0);
  
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioEngineRef = useRef<LiveSynthEngine | null>(null);
  const quoteTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize client sound engine
  useEffect(() => {
    audioEngineRef.current = new LiveSynthEngine();
    return () => {
      audioEngineRef.current?.stopAll();
    };
  }, []);

  // Sync volume
  useEffect(() => {
    if (audioEngineRef.current) {
      audioEngineRef.current.setVolume(soundVolume);
    }
  }, [soundVolume]);

  // Handle ambient selection change
  const handleSelectAmbient = (sound: 'none' | 'rain' | 'forest' | 'cafe' | 'ocean' | 'white_noise' | 'fireplace') => {
    setActiveSound(sound);
    if (!audioEngineRef.current) return;
    if (sound === 'none') {
      audioEngineRef.current.stopAll();
      if (activeMusic !== 'none') {
        audioEngineRef.current.play(activeMusic === 'nature' ? 'nature_music' : activeMusic);
      }
    } else {
      audioEngineRef.current.play(sound);
    }
  };

  // Handle music selection change
  const handleSelectMusic = (music: 'none' | 'lofi' | 'instrumental' | 'nature' | 'custom') => {
    setActiveMusic(music);
    if (!audioEngineRef.current) return;
    if (music === 'none' || music === 'custom') {
      if (activeSound !== 'none') {
        audioEngineRef.current.play(activeSound);
      } else {
        audioEngineRef.current.stopAll();
      }
    } else {
      audioEngineRef.current.play(music === 'nature' ? 'nature_music' : music);
    }
  };

  // Automated tab switches tracking via Visibility Change API
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
        addToast('Distraction Warning', 'Avoid changing browser tabs during focus window.', 'warning');
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [addToast]);

  // Rotate quotes every minute
  useEffect(() => {
    quoteTimerRef.current = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % MOTIVATIONAL_QUOTES.length);
    }, 60000);
    return () => {
      if (quoteTimerRef.current) clearInterval(quoteTimerRef.current);
    };
  }, []);

  // Interval hook for ticking focus state
  useEffect(() => {
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        tick();
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isRunning, tick]);

  // Monitor timer completion for popup celebration
  useEffect(() => {
    if (timeRemaining === 0 && isRunning) {
      // Ended/Completed
      pauseTimer();
      setStatsSummary({
        focusTime: Math.round(totalSessionDuration / 60),
        completedCount: completedSessions.length + 1,
        score: Math.max(20, 100 - (phoneCount * 12) - (tabSwitches * 8))
      });
      setShowEndPopup(true);
      addToast('Flow Achieved!', 'You completed your focus segment successfully.', 'success');
      // If linked task is active, increment progress or mark as done
      if (activeTaskId) {
        const taskObj = tasks.find(t => t.id === activeTaskId);
        if (taskObj && taskObj.status !== TaskStatus.COMPLETED) {
          updateTask(activeTaskId, { status: TaskStatus.IN_PROGRESS });
        }
      }
    }
  }, [timeRemaining, isRunning, totalSessionDuration, activeTaskId, completedSessions.length, phoneCount, tabSwitches, tasks, updateTask, pauseTimer, addToast]);

  // Handle key shortcuts
  useEffect(() => {
    const handleKeys = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        if (isRunning) {
          pauseTimer();
          addToast('Session Paused', 'Focus cycle suspended.', 'info');
        } else {
          startTimer();
          addToast('Session Started', 'Diving back into flow state.', 'success');
        }
      } else if (e.code === 'Escape' && fullscreen) {
        setFullscreen(false);
      } else if (e.code === 'KeyN') {
        // Link next task
        const nextTask = tasks.find(t => t.status !== TaskStatus.COMPLETED && t.id !== activeTaskId);
        if (nextTask) {
          linkTask(nextTask.id, nextTask.title);
          addToast('Next Task Locked', `Shifted focus target to: ${nextTask.title}`, 'info');
        }
      }
    };
    window.addEventListener('keydown', handleKeys);
    return () => {
      window.removeEventListener('keydown', handleKeys);
    };
  }, [isRunning, fullscreen, activeTaskId, tasks, linkTask, pauseTimer, startTimer, addToast]);

  // Dynamic calculations
  const totalMinutesToday = completedSessions.reduce((acc, s) => acc + s.durationMinutes, 0) + 
    (isRunning ? Math.round((totalSessionDuration - timeRemaining) / 60) : 0);
  const progressPercent = totalSessionDuration > 0 ? (timeRemaining / totalSessionDuration) * 100 : 100;
  const elapsedSeconds = totalSessionDuration - timeRemaining;
  const elapsedPercent = totalSessionDuration > 0 ? (elapsedSeconds / totalSessionDuration) * 100 : 0;

  // Active locked task details
  const activeTaskObj = tasks.find(t => t.id === activeTaskId) || tasks.find(t => t.status !== TaskStatus.COMPLETED);

  const handleSetTimerPreset = (preset: '25' | '50' | '90' | 'custom') => {
    setActiveTimerMode(preset);
    let mins = 25;
    if (preset === '25') mins = 25;
    else if (preset === '50') mins = 50;
    else if (preset === '90') mins = 90;
    else mins = customMinutes;

    setTimeRemaining(mins * 60);
    addToast('Timer Set', `Focus loop set for ${mins} minutes.`, 'info');
  };

  const handleCustomSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setCustomMinutes(val);
    if (activeTimerMode === 'custom') {
      setTimeRemaining(val * 60);
    }
  };

  const handleSkipBreak = () => {
    handleSetTimerPreset(activeTimerMode);
    startTimer();
    addToast('Break Skipped', 'Direct jump to the next focus interval.', 'success');
  };

  const handleManualEnd = () => {
    pauseTimer();
    setStatsSummary({
      focusTime: Math.round(elapsedSeconds / 60) || 1,
      completedCount: completedSessions.length,
      score: Math.max(30, 100 - (phoneCount * 12) - (tabSwitches * 8))
    });
    setShowEndPopup(true);
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  // Compute focus score
  const computedFocusScore = Math.max(0, 100 - (phoneCount * 10) - (tabSwitches * 6));

  return (
    <div className={`space-y-8 select-none relative w-full pb-16`}>
      
      {/* Immersive Fullscreen Viewport Mode overlay */}
      <AnimatePresence>
        {fullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-zinc-950 text-white z-50 flex flex-col justify-center items-center p-8 gap-8 overflow-hidden"
          >
            {/* Background dynamic ambient loops inside Fullscreen */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10">
              <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] rounded-full bg-violet-600/[0.06] blur-[150px] animate-mesh-drift" />
              <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] rounded-full bg-blue-600/[0.05] blur-[150px] animate-mesh-drift-reverse" />
              <div className="absolute inset-0 bg-repeat bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noise%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noise)%22/%3E%3C/svg%3E')] opacity-[0.02]" />
            </div>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setFullscreen(false)}
              className="absolute top-8 right-8 text-xs font-mono font-bold text-zinc-400 hover:text-white border-zinc-800 hover:bg-zinc-900 bg-black/40 backdrop-blur-md rounded-xl"
            >
              <Shrink className="w-4 h-4 mr-1.5" /> Exit Fullscreen (Esc)
            </Button>
            
            <div className="text-center space-y-4">
              <p className="text-xs uppercase tracking-[0.25em] text-zinc-500 font-mono flex items-center justify-center gap-2">
                <Moon className="w-4 h-4 text-violet-400 animate-pulse" /> FOCUS ZONE IN PROGRESS
              </p>
              {activeTaskTitle && (
                <h2 className="text-lg font-medium text-zinc-400 max-w-lg truncate mx-auto">
                  Locked: <span className="text-white font-semibold">{activeTaskTitle}</span>
                </h2>
              )}
            </div>

            {/* Meditative Center Circle */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="160" cy="160" r="140" className="stroke-zinc-900 fill-none" strokeWidth="4" />
                <circle 
                  cx="160" 
                  cy="160" 
                  r="140" 
                  className="stroke-violet-500 fill-none transition-all duration-300" 
                  strokeWidth="6" 
                  strokeDasharray="879.64" 
                  strokeDashoffset={879.64 - (879.64 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>
              {/* Outer halo rotation animation while running */}
              {isRunning && (
                <div className="absolute inset-[-10px] border border-violet-500/20 rounded-full animate-spin [animation-duration:12s]" />
              )}
              <div className="absolute flex flex-col items-center">
                <span className="text-7xl font-mono font-bold tracking-tight text-white select-none">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-[10px] font-mono font-bold tracking-[0.15em] text-zinc-400 mt-2 uppercase">
                  {isRunning ? 'DEEP FLOW STATE' : 'CYCLE IDLE'}
                </span>
              </div>
            </div>

            {/* Ambient sound volume control panel in Fullscreen */}
            <div className="flex flex-col items-center gap-3 bg-zinc-900/60 backdrop-blur-lg border border-zinc-800 p-4 rounded-2xl w-full max-w-sm">
              <div className="flex items-center justify-between w-full text-xs font-mono text-zinc-400">
                <span className="flex items-center gap-1.5"><Volume1 className="w-4 h-4 text-violet-400" /> Soundscape volume</span>
                <span>{Math.round(soundVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.05" 
                value={soundVolume}
                onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500" 
              />
            </div>

            {/* Quick Actions in Fullscreen */}
            <div className="flex items-center gap-4">
              <Button 
                size="lg" 
                onClick={isRunning ? pauseTimer : startTimer} 
                className="bg-violet-600 hover:bg-violet-500 text-white rounded-full px-8 flex items-center gap-2 shadow-lg shadow-violet-500/20"
              >
                {isRunning ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white" />}
                {isRunning ? 'Pause Flow' : 'Resume Flow'}
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={handleManualEnd}
                className="rounded-full px-6 text-zinc-300 hover:text-white"
              >
                End Session
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Session Congratulations celebration popup */}
      <AnimatePresence>
        {showEndPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEndPopup(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 max-w-md w-full relative z-10 text-center overflow-hidden shadow-2xl"
            >
              {/* Crystalline background reflections */}
              <div className="absolute top-0 right-0 w-44 h-44 bg-violet-600/10 rounded-full blur-[60px]" />
              <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-600/10 rounded-full blur-[60px]" />

              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                  <Award className="w-8 h-8" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-white tracking-tight">Congratulations!</h1>
              <p className="text-zinc-400 text-xs mt-1.5 max-w-sm mx-auto">
                You maintained high cognitive focus. Every completed interval hardens your professional stamina.
              </p>

              {/* Stats card parameters */}
              <div className="grid grid-cols-2 gap-3.5 my-6">
                <div className="bg-zinc-950/45 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Focus Time</span>
                  <div className="text-lg font-bold text-white mt-1">{statsSummary.focusTime} mins</div>
                </div>
                <div className="bg-zinc-950/45 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Productivity</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">{statsSummary.score}%</div>
                </div>
                <div className="bg-zinc-950/45 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">Completed Logs</span>
                  <div className="text-lg font-bold text-white mt-1">{statsSummary.completedCount}</div>
                </div>
                <div className="bg-zinc-950/45 border border-zinc-800 p-3 rounded-2xl">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase">XP Gained</span>
                  <div className="text-lg font-bold text-violet-400 mt-1">+{statsSummary.focusTime * 4} XP</div>
                </div>
              </div>

              <div className="space-y-2">
                <Button 
                  size="lg" 
                  onClick={() => {
                    setShowEndPopup(false);
                    resetTimer();
                  }}
                  className="w-full rounded-2xl bg-violet-600 hover:bg-violet-500 text-white"
                >
                  Continue Focus
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200/50 dark:border-zinc-800/60 pb-5">
        <div>
          <h1 className="text-xl font-bold text-zinc-950 dark:text-white tracking-widest uppercase">FOCUS ROOM</h1>
          <p className="text-xs text-zinc-400 mt-1.5">
            Deep work starts here.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={isRunning ? pauseTimer : startTimer}
            className="gap-1.5 shrink-0"
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Pause Session' : 'Start Focus Session'}
          </Button>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleManualEnd}
            disabled={!isRunning && timeRemaining === totalSessionDuration}
            className="gap-1.5 shrink-0"
          >
            End Session
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setFullscreen(true)}
            className="gap-1.5 shrink-0 dark:bg-zinc-900"
          >
            <Expand className="w-3.5 h-3.5" /> Fullscreen Mode
          </Button>
        </div>
      </div>

      {/* MAIN SECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        
        {/* LEFT COLUMN: ACTIVE TIMER & SETTINGS */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* FOCUS TIMER CARD */}
          <div className="premium-glass rounded-2xl p-6 relative overflow-hidden flex flex-col items-center">
            {/* Ambient lighting halo behind timer */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-violet-600/[0.04] dark:bg-violet-600/[0.06] blur-3xl pointer-events-none transition-opacity duration-500 ${isRunning ? 'opacity-100' : 'opacity-40'}`} />

            {/* Preset modes selector tab rail */}
            <div className="flex items-center gap-1.5 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800/80 mb-6">
              {(['25', '50', '90', 'custom'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => handleSetTimerPreset(mode)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                    activeTimerMode === mode 
                      ? 'bg-violet-600 text-white shadow-sm' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                  }`}
                >
                  {mode === 'custom' ? 'Custom' : `${mode}m`}
                </button>
              ))}
            </div>

            {/* Custom slider selector when selected custom preset */}
            {activeTimerMode === 'custom' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full max-w-xs mb-6 px-4 py-3 bg-zinc-950/40 border border-zinc-800/50 rounded-xl flex flex-col gap-2"
              >
                <div className="flex justify-between items-center text-xs font-mono text-zinc-400">
                  <span>Custom Duration</span>
                  <span className="text-white font-bold">{customMinutes} minutes</span>
                </div>
                <input 
                  type="range" 
                  min="5" 
                  max="180" 
                  step="5" 
                  value={customMinutes}
                  onChange={handleCustomSliderChange}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500" 
                />
              </motion.div>
            )}

            {/* Circular countdown SVG and interactive energy core inside */}
            <div className="relative w-64 h-64 flex items-center justify-center my-4">
              {/* SVG circular track */}
              <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                <circle cx="128" cy="128" r="110" className="stroke-zinc-100 dark:stroke-zinc-800 fill-none" strokeWidth="4" />
                <circle 
                  cx="128" 
                  cy="128" 
                  r="110" 
                  className="stroke-violet-500 fill-none transition-all duration-300" 
                  strokeWidth="5" 
                  strokeDasharray="691.15" 
                  strokeDashoffset={691.15 - (691.15 * progressPercent) / 100}
                  strokeLinecap="round"
                />
              </svg>

              {/* Running indicator spin track */}
              {isRunning && (
                <div className="absolute inset-[10px] rounded-full border border-violet-500/10 animate-spin [animation-duration:8s]" />
              )}

              {/* Meditative floating crystal wireframe inside timer */}
              <div className="absolute opacity-[0.4] scale-90 pointer-events-none">
                <FocusEnergyCore isActive={isRunning} size={160} />
              </div>

              <div className="absolute flex flex-col items-center">
                <span className="text-5xl font-mono font-bold tracking-tight text-zinc-900 dark:text-white select-none">
                  {formatTime(timeRemaining)}
                </span>
                <span className="text-[9px] font-mono font-bold text-zinc-400 tracking-widest mt-1.5 uppercase">
                  {isRunning ? 'FLOW CYCLE' : 'TIMER OFF'}
                </span>
              </div>
            </div>

            {/* Timer quick active controllers */}
            <div className="flex items-center gap-3.5 mt-6 mb-2">
              <Button 
                size="lg" 
                onClick={isRunning ? pauseTimer : startTimer} 
                className="w-14 h-14 rounded-full p-0 flex items-center justify-center shadow-md bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 text-white"
              >
                {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
              </Button>
              <Button 
                size="lg" 
                variant="secondary" 
                onClick={resetTimer} 
                className="w-14 h-14 rounded-full p-0 flex items-center justify-center dark:bg-zinc-900 border border-zinc-800"
              >
                <RotateCcw className="w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                onClick={handleSkipBreak} 
                className="w-14 h-14 rounded-full p-0 flex items-center justify-center text-xs font-mono font-bold dark:bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                title="Skip Break & Restart Interval"
              >
                SKIP
              </Button>
            </div>
          </div>

          {/* CURRENT LOCKED TASK DETAILS PANEL */}
          <div className="premium-glass rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 mb-4 flex items-center gap-2">
              <Sparkle className="w-4 h-4 text-violet-400 animate-pulse" /> CURRENT FOCUS TARGET
            </h2>
            
            {activeTaskObj ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">{activeTaskObj.title}</h3>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{activeTaskObj.description || 'No description provided.'}</p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-mono uppercase tracking-wider font-semibold border ${
                    activeTaskObj.priority === TaskPriority.CRITICAL ? 'bg-red-950/40 text-red-400 border-red-500/20' :
                    activeTaskObj.priority === TaskPriority.HIGH ? 'bg-orange-950/40 text-orange-400 border-orange-500/20' :
                    activeTaskObj.priority === TaskPriority.MEDIUM ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/20' :
                    'bg-zinc-800 text-zinc-400 border-zinc-700/50'
                  }`}>
                    {activeTaskObj.priority} Priority
                  </span>
                </div>

                {/* Sub-parameters row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-y border-zinc-800/80">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Estimate</span>
                    <span className="text-xs font-semibold text-zinc-300 mt-0.5 block">{formatEffort(activeTaskObj.estimatedTime)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Deadline</span>
                    <span className="text-xs font-semibold text-zinc-300 mt-0.5 block truncate">
                      {new Date(activeTaskObj.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Category</span>
                    <span className="text-xs font-semibold text-zinc-300 mt-0.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: activeTaskObj.category?.color || '#a78bfa' }} />
                      {activeTaskObj.category?.name || 'General'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-zinc-500 block uppercase">Task Progress</span>
                    <span className="text-xs font-semibold text-violet-400 mt-0.5 block">
                      {activeTaskObj.subtasks?.length 
                        ? `${Math.round((activeTaskObj.subtasks.filter(s => s.completed).length / activeTaskObj.subtasks.length) * 100)}%`
                        : activeTaskObj.status === TaskStatus.COMPLETED ? '100%' : '0%'
                      }
                    </span>
                  </div>
                </div>

                {/* Action triggers */}
                <div className="flex justify-between items-center gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={activeTaskId || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          linkTask(null, null);
                          addToast('Focus Cleared', 'Target task cleared from current loop.', 'info');
                        } else {
                          const targetT = tasks.find(t => t.id === val);
                          if (targetT) {
                            linkTask(targetT.id, targetT.title);
                            addToast('Task Locked', `Focus locked onto: ${targetT.title}`, 'success');
                          }
                        }
                      }}
                      className="text-xs bg-zinc-950/60 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-violet-500 cursor-pointer"
                    >
                      <option value="">-- Shift Focus Target --</option>
                      {tasks.filter(t => t.status !== TaskStatus.COMPLETED).map(t => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button 
                      variant="primary" 
                      size="sm" 
                      onClick={() => {
                        linkTask(activeTaskObj.id, activeTaskObj.title);
                        startTimer();
                        addToast('Target Locked', 'Interval linked and started.', 'success');
                      }}
                      className="px-4"
                    >
                      Start Task
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        linkTask(activeTaskObj.id, activeTaskObj.title);
                        addToast('Target Maintained', 'Target lock verified.', 'info');
                      }}
                      className="px-4 dark:bg-zinc-900 border-zinc-800"
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-zinc-500 italic">No uncompleted focus tasks remaining.</p>
                <p className="text-[10px] text-zinc-600 mt-1">Excellent work! You can link a custom general focus segment above.</p>
              </div>
            )}
          </div>

          {/* AMBIENT SOUND MATRIX DECK */}
          <div className="premium-glass rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 flex items-center gap-2">
                <Music className="w-4 h-4 text-zinc-400" /> AMBIENT SOUNDSCAPES
              </h2>
              <div className="flex items-center gap-2">
                <Volume className="w-3.5 h-3.5 text-zinc-500" />
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.05" 
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(parseFloat(e.target.value))}
                  className="w-16 sm:w-24 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-violet-500" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {[
                { id: 'rain', label: 'Rain', icon: CloudRain, description: 'Lowpass white rain rumble' },
                { id: 'forest', label: 'Forest', icon: Trees, description: 'Wind leaf rustle & birds' },
                { id: 'cafe', label: 'Cafe', icon: CafeIcon, description: 'Low hum & mumble resonance' },
                { id: 'ocean', label: 'Ocean', icon: Waves, description: 'Deep modulating waves' },
                { id: 'white_noise', label: 'White Noise', icon: FileAudio, description: 'Static cognitive block' },
                { id: 'fireplace', label: 'Fireplace', icon: FlameKindling, description: 'Warm crackling hearth' },
              ].map(sound => {
                const isSelected = activeSound === sound.id;
                return (
                  <div 
                    key={sound.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-28 group ${
                      isSelected 
                        ? 'bg-zinc-900/90 border-violet-500/50 shadow-[0_0_15px_rgba(139,92,246,0.1)]' 
                        : 'bg-zinc-950/40 border-zinc-800/60 hover:border-zinc-700/60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
                        <sound.icon className={`w-4 h-4 ${isSelected ? 'text-violet-400' : 'text-zinc-500'}`} />
                      </div>
                      
                      {/* Interactive Siri-style animated waveform while active */}
                      {isSelected && (
                        <div className="flex items-end gap-[1.5px] h-4">
                          <span className="w-[1.5px] bg-violet-400 h-2 animate-bounce rounded-full" style={{ animationDelay: '0.1s', animationDuration: '0.6s' }} />
                          <span className="w-[1.5px] bg-violet-300 h-3 animate-bounce rounded-full" style={{ animationDelay: '0.3s', animationDuration: '0.8s' }} />
                          <span className="w-[1.5px] bg-violet-400 h-1 animate-bounce rounded-full" style={{ animationDelay: '0s', animationDuration: '0.5s' }} />
                          <span className="w-[1.5px] bg-violet-300 h-4 animate-bounce rounded-full" style={{ animationDelay: '0.2s', animationDuration: '0.7s' }} />
                        </div>
                      )}
                    </div>

                    <div>
                      <span className="text-xs font-semibold text-white block">{sound.label}</span>
                      <span className="text-[9px] text-zinc-500 mt-0.5 block line-clamp-1">{sound.description}</span>
                    </div>

                    {/* Simple Play / Pause button trigger inside card */}
                    <button 
                      onClick={() => handleSelectAmbient(isSelected ? 'none' : sound.id as any)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>



        </div>

        {/* RIGHT COLUMN: STATS, AI COACH, TRACKER */}
        <div className="space-y-8">
          


          {/* AI FOCUS COACH MODULE */}
          <div className="premium-glass rounded-2xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 flex items-center gap-2">
                  <Bot className="w-4 h-4 text-violet-400" /> AI FOCUS COACH
                </h2>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">Biometric-cognitive recommendations</p>
              </div>

              {/* Glowing animated pulse coach icon */}
              <div className="w-7 h-7 rounded-full bg-violet-600/10 border border-violet-500/30 flex items-center justify-center relative">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-ping absolute" />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
              </div>
            </div>

            <div className="space-y-4 font-sans text-xs">
              <div className="bg-zinc-950/40 border border-zinc-800/80 p-3.5 rounded-2xl space-y-2">
                <div className="flex items-center gap-1.5 font-semibold text-violet-300">
                  <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400/20" /> Coaching Insight
                </div>
                <p className="text-zinc-400 leading-relaxed text-[11px]">
                  "You are in the zone. Keep tabs locked. Let's finish your active segment."
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-start gap-3 bg-zinc-950/20 px-2.5 py-1.5 rounded-xl">
                  <span className="text-zinc-500 font-mono text-[9px] uppercase">Focus Tip</span>
                  <span className="text-zinc-300 text-right leading-normal text-[11px] max-w-[180px]">Shrink desktop viewpoint to prevent visual scatter</span>
                </div>
                <div className="flex justify-between items-start gap-3 bg-zinc-950/20 px-2.5 py-1.5 rounded-xl">
                  <span className="text-zinc-500 font-mono text-[9px] uppercase">Energy</span>
                  <span className="text-zinc-300 text-right leading-normal text-[11px] max-w-[180px]">88% - Perfect window for complex schema design</span>
                </div>
                <div className="flex justify-between items-start gap-3 bg-zinc-950/20 px-2.5 py-1.5 rounded-xl">
                  <span className="text-zinc-500 font-mono text-[9px] uppercase">Break</span>
                  <span className="text-zinc-300 text-right leading-normal text-[11px] max-w-[180px]">In 35 minutes, complete 20/20 focus release</span>
                </div>
                <div className="flex justify-between items-start gap-3 bg-zinc-950/20 px-2.5 py-1.5 rounded-xl">
                  <span className="text-zinc-500 font-mono text-[9px] uppercase">Next Task</span>
                  <span className="text-violet-400 text-right leading-normal text-[11px] max-w-[180px] font-semibold truncate">
                    {activeTaskObj?.title || 'General block'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* FOCUS STATS CARD */}
          <div className="premium-glass rounded-2xl p-6 relative overflow-hidden">
            <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-zinc-400 mb-4">
              FOCUS ANALYSIS (TODAY)
            </h2>

            <div className="grid grid-cols-2 gap-3.5 font-mono">
              <div className="bg-zinc-950/45 p-3 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase block">Focus Duration</span>
                <span className="text-base font-semibold text-white mt-1 block">{totalMinutesToday} mins</span>
              </div>
              <div className="bg-zinc-950/45 p-3 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase block">Completed Sessions</span>
                <span className="text-base font-semibold text-white mt-1 block">{completedSessions.length} segments</span>
              </div>
              <div className="bg-zinc-950/45 p-3 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase block">Deep Work Hours</span>
                <span className="text-base font-semibold text-white mt-1 block">{(totalMinutesToday / 60).toFixed(1)} hrs</span>
              </div>
              <div className="bg-zinc-950/45 p-3 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase block">Productivity</span>
                <span className="text-base font-semibold text-cyan-400 mt-1 block">{computedFocusScore}%</span>
              </div>
            </div>
          </div>



        </div>

      </div>

    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/auth.store';
import { useUiStore } from '../../store/ui.store';
import { Button } from '../../components/ui/Button';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Github, 
  Check, 
  AlertCircle, 
  Sparkles, 
  Zap, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { motion } from 'motion/react';

// ==========================================
// FLOATING 3D CHRONO CORE FOR AUTH LEFT PANEL
// ==========================================
const AuthChronoCore: React.FC = () => {
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
      className="relative w-64 h-64 md:w-72 md:h-72 lg:w-80 lg:h-80 flex items-center justify-center cursor-pointer select-none mx-auto"
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
        <div className="absolute inset-0 rounded-full bg-violet-600/10 blur-[50px] animate-pulse" />
        
        {/* Ring 1 - Outer */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d", translateZ: 15 }}
          className="absolute w-56 h-56 md:w-64 md:h-64 rounded-full border border-violet-500/10 flex items-center justify-center"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-violet-400 rounded-full shadow-[0_0_12px_#a78bfa]" />
        </motion.div>

        {/* Ring 2 - Middle (Counter-rotating) */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d", translateZ: 30 }}
          className="absolute w-40 h-40 md:w-48 md:h-48 rounded-full border border-indigo-500/20 flex items-center justify-center"
        >
          <div className="absolute bottom-0 left-1/3 w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8]" />
        </motion.div>

        {/* Center Core */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            boxShadow: [
              "0 0 25px rgba(139,92,246,0.3)",
              "0 0 45px rgba(139,92,246,0.6)",
              "0 0 25px rgba(139,92,246,0.3)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
          style={{ translateZ: 60 }}
          className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-violet-600 via-indigo-500 to-cyan-400 flex items-center justify-center border border-white/15"
        >
          <Zap className="w-5 h-5 md:w-6 md:h-6 text-white filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] animate-pulse" />
        </motion.div>

        {/* Floating particles inside core ring space */}
        <div className="absolute w-full h-full pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-cyan-400"
              initial={{
                x: Math.random() * 120 - 60,
                y: Math.random() * 120 - 60,
                opacity: 0.1,
              }}
              animate={{
                x: [Math.random() * 120 - 60, Math.random() * 120 - 60],
                y: [Math.random() * 120 - 60, Math.random() * 120 - 60],
                opacity: [0.1, 0.6, 0.1],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                ease: [0.42, 0, 0.58, 1],
              }}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// ==========================================
// GOOGLE BRAND ICON
// ==========================================
const GoogleIcon: React.FC = () => (
  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      fill="#EA4335"
    />
  </svg>
);

export const LoginView: React.FC = () => {
  const navigate = useNavigate();
 const { login, googleLogin } = useAuthStore();
  const { addToast } = useUiStore();
  
  // State variables
  const [email, setEmail] = useState('mahakseth82@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // Validation States
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  // Email check
  useEffect(() => {
    if (!emailTouched) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required.');
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError('');
    }
  }, [email, emailTouched]);

  // Password check
  useEffect(() => {
    if (!passwordTouched) return;
    if (!password) {
      setPasswordError('Password is required.');
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
    } else {
      setPasswordError('');
    }
  }, [password, passwordTouched]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailTouched(true);
    setPasswordTouched(true);

    // Final regex verify
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email) || !password || password.length < 6) {
      addToast('Validation', 'Please correct the highlighted issues before signing in.', 'warning');
      return;
    }

    setLoading(true);
    try {
      const success = await login(email, password);

if (!success) {
  throw new Error("Login failed");
}
      addToast('Welcome Back', 'Successfully authenticated session!', 'success');
      navigate('/app/dashboard');
    } catch (err) {
      addToast('Auth Error', 'Could not verify user password.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setLoading(true);
    try {
      const success = await googleLogin();

if (!success) {
  throw new Error("Google login failed");
}
      addToast('OAuth Connected', `Authorized seamlessly via secure ${provider === 'google' ? 'Google SSO' : 'GitHub integration'}.`, 'success');
      navigate('/app/dashboard');
    } catch (err) {
      addToast('SSO Failed', 'Unable to fetch secure token.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      addToast('Forgot Password', 'Please type your email address first so we can transmit instructions.', 'warning');
      return;
    }
    addToast('Security Link Transmitted', `A recovery ticket has been logged for ${email}. Check your inbox.`, 'info');
  };

  return (
    <div className="min-h-screen bg-[#030014] text-zinc-150 flex font-sans selection:bg-violet-500/30 selection:text-white overflow-hidden relative">
      
      {/* Dynamic Background mesh & floating orbs for the entire page */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-600/10 blur-[120px]" />
        {/* Soft floating stars */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-950/0 to-zinc-950/90" />
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-10 w-full relative z-10">
        
        {/* ==========================================
            LEFT PANEL: BRANDING & CHRONO CORE (60%)
            ========================================== */}
        <div className="hidden lg:flex lg:col-span-6 flex-col justify-between p-12 relative overflow-hidden border-r border-white/[0.03] bg-zinc-950/20 backdrop-blur-sm">
          {/* Subtle decoration mesh inside left panel */}
          <div className="absolute top-[30%] left-[20%] w-[40%] h-[40%] rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none" />
          
          {/* Branding Logo */}
          <Link to="/" className="flex items-center gap-2.5 self-start group z-10">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-[0_0_15px_rgba(139,92,246,0.35)] group-hover:scale-105 transition-transform">
              DZ
            </div>
            <span className="font-extrabold tracking-tight text-sm text-white font-mono uppercase">
              DeadlineZero
            </span>
          </Link>

          {/* Core Animation Area */}
          <div className="flex-1 flex flex-col items-center justify-center py-6 z-10">
            <AuthChronoCore />
            
            <div className="text-center mt-8 space-y-3 max-w-sm">
              <h2 className="text-2xl font-extrabold tracking-tight text-white font-sans">
                Your AI Productivity <br />
                <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">
                  Operating System.
                </span>
              </h2>
              <div className="flex items-center justify-center gap-1.5 text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest pt-1">
                <span>Plan</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Focus</span>
                <span className="w-1 h-1 rounded-full bg-zinc-700" />
                <span>Finish</span>
              </div>
            </div>
          </div>

          {/* Footer Info / Version tag */}
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-600 uppercase tracking-widest z-10">
            <span>COGNITIVE PLATFORM v2.0</span>
            <span>Zero latency.</span>
          </div>
        </div>

        {/* ==========================================
            RIGHT PANEL: AUTHENTICATION CARD (40%)
            ========================================== */}
        <div className="col-span-1 lg:col-span-4 flex flex-col justify-center items-center p-6 md:p-12 relative">
          
          {/* Top Logo for mobile view */}
          <div className="absolute top-6 lg:hidden flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs">
              DZ
            </div>
            <span className="font-bold tracking-tight text-sm text-white font-mono uppercase">
              DeadlineZero
            </span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="w-full max-w-md"
          >
            {/* Header */}
            <div className="text-left mb-8 space-y-1.5">
              <h1 className="text-2xl font-black text-white tracking-tight">Sign In</h1>
              <p className="text-xs text-zinc-400 font-light">
                Securely authenticate to access your dynamic workload triage.
              </p>
            </div>

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="e.g. mahakseth82@gmail.com"
                    className={`w-full bg-zinc-900/40 border rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:ring-1 transition-all ${
                      emailTouched && emailError
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : emailTouched && !emailError
                        ? 'border-emerald-500/40 focus:ring-emerald-500/20'
                        : 'border-white/[0.06] hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-violet-500/25'
                    }`}
                    required
                  />
                  {emailTouched && (
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
                      {emailError ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Check className="w-4 h-4 text-emerald-400" />
                      )}
                    </span>
                  )}
                </div>
                {emailTouched && emailError && (
                  <p className="text-[10px] text-red-400 font-medium">{emailError}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[10px] font-mono font-bold uppercase text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() => setPasswordTouched(true)}
                    placeholder="••••••••"
                    className={`w-full bg-zinc-900/40 border rounded-xl pl-10 pr-10 py-3 text-xs text-white focus:outline-none focus:ring-1 transition-all ${
                      passwordTouched && passwordError
                        ? 'border-red-500/50 focus:ring-red-500/30'
                        : passwordTouched && !passwordError
                        ? 'border-emerald-500/40 focus:ring-emerald-500/20'
                        : 'border-white/[0.06] hover:border-white/[0.12] focus:border-violet-500/50 focus:ring-violet-500/25'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordTouched && passwordError && (
                  <p className="text-[10px] text-red-400 font-medium">{passwordError}</p>
                )}
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded bg-zinc-900 border-white/[0.06] text-violet-600 focus:ring-violet-500/50 w-3.5 h-3.5 focus:ring-offset-0"
                  />
                  <span>Keep me authenticated</span>
                </label>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full mt-3 py-3 rounded-xl shadow-[0_0_15px_rgba(139,92,246,0.3)] hover:shadow-[0_0_25px_rgba(139,92,246,0.5)] font-mono font-bold uppercase tracking-wider text-xs gap-1.5" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </form>

            {/* Separator / Divider */}
            <div className="relative flex py-6 items-center">
              <div className="flex-grow border-t border-white/[0.04]"></div>
              <span className="flex-shrink mx-4 text-[9px] font-mono text-zinc-600 uppercase tracking-widest font-bold">OR</span>
              <div className="flex-grow border-t border-white/[0.04]"></div>
            </div>

            {/* OAuth Sign-in buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full text-xs font-mono uppercase font-bold py-2.5 border-white/[0.06] hover:bg-white/[0.02] text-zinc-300 hover:text-white"
                onClick={() => handleOAuthLogin('google')}
                disabled={loading}
              >
                <GoogleIcon />
                <span>Google</span>
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs font-mono uppercase font-bold py-2.5 border-white/[0.06] hover:bg-white/[0.02] text-zinc-300 hover:text-white gap-2"
                onClick={() => handleOAuthLogin('github')}
                disabled={loading}
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </Button>
            </div>

            {/* Create account suggestion link */}
            <p className="text-[11px] text-center text-zinc-500 mt-10">
              New to the proactive workflow?{' '}
              <Link to="/signup" className="text-violet-400 hover:text-violet-300 underline font-semibold transition-colors">
                Create free account
              </Link>
            </p>

          </motion.div>
        </div>

      </div>
    </div>
  );
};

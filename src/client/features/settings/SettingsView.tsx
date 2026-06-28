/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Moon, 
  Sun, 
  User, 
  Mail, 
  Check, 
  Palette, 
  Camera,
  Laptop,
  Key,
  Trash2,
  Briefcase,
  Sliders
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { motion, AnimatePresence } from 'motion/react';
import { AuthService } from "../../services/auth.service";
import { FirestoreService } from "../../services/firestore.service";
import { useUiStore } from '../../store/ui.store';
import { useAuthStore } from '../../store/auth.store';
import { useFocusStore } from '../../store/focus.store';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop', // Elegant female
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&fit=crop', // Stylish male
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=256&h=256&fit=crop', // 3D Neon boy
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=256&h=256&fit=crop', // Smart professional female
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=256&h=256&fit=crop', // Abstract aurora geometric
  'https://images.unsplash.com/photo-1614741118887-7a4ee193a5fa?q=80&w=256&h=256&fit=crop'  // Cyber neon code grid
];

export const SettingsView: React.FC = () => {
  const { 
    addToast, 
    themeMode, 
    setThemeMode 
  } = useUiStore();

  const { user, updateProfile, logout } = useAuthStore();
  const { setTimeRemaining } = useFocusStore();

  // =====================================
  // STATE INITIALIZATION FROM STORAGE
  // =====================================

  // Section 1: Account
  const [username, setUsername] = useState(
  () => user?.fullName || user?.email?.split("@")[0] || ""
);
  const [email, setEmail] = useState(() => user?.email || 'mahakseth82@gmail.com');
  const [avatar, setAvatar] = useState(() => user?.avatar || AVATAR_PRESETS[0]);
  const [occupation, setOccupation] = useState(() => user?.occupation || 'Student / Freelancer');
  const [bio, setBio] = useState(() => user?.bio || 'Computer Science student and freelance web developer.');
  const [isEditProfileMode, setIsEditProfileMode] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showDeleteAccountDialog, setShowDeleteAccountDialog] = useState(false);
  
  // Password inputs
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete account inputs
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  // Section 2: Appearance
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark' | 'system'>(() => {
    return (localStorage.getItem('dz-active-theme') as any) || themeMode || 'dark';
  });
  const [accentColor, setAccentColor] = useState<'purple' | 'blue' | 'cyan' | 'pink'>(() => {
    return (localStorage.getItem('dz-accent-color') as any) || 'purple';
  });
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>(() => {
    return (localStorage.getItem('dz-font-size') as any) || 'medium';
  });

  // Background values (preserved to guarantee full functionality for other views)
  const [desktopNotify] = useState(() => JSON.parse(localStorage.getItem('dz-notify-desktop') || 'true'));
  const [emailNotify] = useState(() => JSON.parse(localStorage.getItem('dz-notify-email') || 'true'));
  const [deadlineReminders] = useState(() => JSON.parse(localStorage.getItem('dz-notify-deadlines') || 'true'));
  const [dailySummary] = useState(() => JSON.parse(localStorage.getItem('dz-notify-summary') || 'false'));
  const [focusSessionAlerts] = useState(() => JSON.parse(localStorage.getItem('dz-notify-focus') || 'true'));
  const [integrations] = useState(() => {
    const saved = localStorage.getItem('dz-integrations');
    if (saved) return JSON.parse(saved);
    return {
      googleCalendar: { connected: true, lastSync: '3 mins ago', syncing: false },
      gmail: { connected: false, lastSync: 'Never', syncing: false },
      github: { connected: true, lastSync: '10 mins ago', syncing: false },
      discord: { connected: false, lastSync: 'Never', syncing: false },
      slack: { connected: false, lastSync: 'Never', syncing: false }
    };
  });
  const [enableAiSuggestions] = useState(() => JSON.parse(localStorage.getItem('dz-ai-suggestions') || 'true'));
  const [taskRecommendations] = useState(() => JSON.parse(localStorage.getItem('dz-ai-tasks') || 'true'));
  const [autoSchedule] = useState(() => JSON.parse(localStorage.getItem('dz-ai-autoschedule') || 'false'));
  const [smartDeadlines] = useState(() => JSON.parse(localStorage.getItem('dz-ai-deadlines') || 'true'));
  const [dailyAiSummary] = useState(() => JSON.parse(localStorage.getItem('dz-ai-summary') || 'true'));
  const [aiPersonality] = useState<'professional' | 'friendly' | 'minimal'>(() => {
    return (localStorage.getItem('dz-ai-personality') as any) || 'professional';
  });
  const [defaultFocusDuration] = useState(() => parseInt(localStorage.getItem('dz-focus-duration') || '25'));
  const [defaultBreak] = useState(() => parseInt(localStorage.getItem('dz-focus-break') || '5'));
  const [autoStartBreak] = useState(() => JSON.parse(localStorage.getItem('dz-focus-autostart-break') || 'true'));
  const [autoStartNextSession] = useState(() => JSON.parse(localStorage.getItem('dz-focus-autostart-next') || 'false'));
  const [playAmbientAuto] = useState(() => JSON.parse(localStorage.getItem('dz-focus-ambient-auto') || 'true'));
  const [enableFullscreen] = useState(() => JSON.parse(localStorage.getItem('dz-focus-fullscreen') || 'false'));
useEffect(() => {
  if (user) {
    setUsername(user.fullName || "");
    setEmail(user.email || "");
    setAvatar(user.avatar || AVATAR_PRESETS[0]);
    setOccupation(user.occupation || "");
    setBio(user.bio || "");
  }
}, [user]);
  // Theme Sync on change
  useEffect(() => {
    if (activeTheme === 'dark' || activeTheme === 'system') {
      document.documentElement.classList.add('dark');
      setThemeMode('dark');
    } else {
      document.documentElement.classList.remove('dark');
      setThemeMode('light');
    }
  }, [activeTheme, setThemeMode]);

  // Check if there are unsaved changes
  const hasChanges = 
    username !== (localStorage.getItem('dz-username') || user?.email?.split('@')[0] || 'mahakseth82') ||
    email !== (user?.email || 'mahakseth82@gmail.com') ||
    avatar !== (user?.avatar || AVATAR_PRESETS[0]) ||
    occupation !== (user?.occupation || 'Student / Freelancer') ||
    bio !== (user?.bio || 'Computer Science student and freelance web developer.') ||
    activeTheme !== ((localStorage.getItem('dz-active-theme') as any) || themeMode || 'dark') ||
    accentColor !== ((localStorage.getItem('dz-accent-color') as any) || 'purple') ||
    fontSize !== ((localStorage.getItem('dz-font-size') as any) || 'medium');

  // =====================================
  // ACTIONS HANDLERS
  // =====================================

  const handleCancelChanges = () => {
    setUsername(user?.fullName || "");
    setEmail(user?.email || 'mahakseth82@gmail.com');
    setAvatar(user?.avatar || AVATAR_PRESETS[0]);
    setOccupation(user?.occupation || 'Student / Freelancer');
    setBio(user?.bio || 'Computer Science student and freelance web developer.');
    setIsEditProfileMode(false);

    setActiveTheme((localStorage.getItem('dz-active-theme') as any) || themeMode || 'dark');
    setAccentColor((localStorage.getItem('dz-accent-color') as any) || 'purple');
    setFontSize((localStorage.getItem('dz-font-size') as any) || 'medium');

    addToast('Changes discarded', 'Settings reverted back to saved configuration.', 'info');
  };

  const handleResetDefaults = () => {
    setUsername(user?.fullName || "");
    setAvatar(AVATAR_PRESETS[0]);
    setOccupation('Student / Freelancer');
    setBio('Computer Science student and freelance web developer.');
    setIsEditProfileMode(false);

    setActiveTheme('dark');
    setAccentColor('purple');
    setFontSize('medium');

    addToast('Defaults loaded', 'Staged defaults. Click Save changes to apply.', 'warning');
  };

  const handleSaveChanges = async() => {
    
    try {
      await AuthService.updateDisplayName(username);
      await FirestoreService.updateUserProfile(user!.userId, {
  name: username,
  email,
  avatar,
  bio,
  occupation,
});
      updateProfile({
         fullName: username, 
        email,
        avatar,
        bio,
        occupation
      });

      
      localStorage.setItem('dz-active-theme', activeTheme);
      localStorage.setItem('dz-accent-color', accentColor);
      localStorage.setItem('dz-font-size', fontSize);

      localStorage.setItem('dz-notify-desktop', JSON.stringify(desktopNotify));
      localStorage.setItem('dz-notify-email', JSON.stringify(emailNotify));
      localStorage.setItem('dz-notify-deadlines', JSON.stringify(deadlineReminders));
      localStorage.setItem('dz-notify-summary', JSON.stringify(dailySummary));
      localStorage.setItem('dz-notify-focus', JSON.stringify(focusSessionAlerts));
      localStorage.setItem('dz-integrations', JSON.stringify(integrations));
      localStorage.setItem('dz-ai-suggestions', JSON.stringify(enableAiSuggestions));
      localStorage.setItem('dz-ai-tasks', JSON.stringify(taskRecommendations));
      localStorage.setItem('dz-ai-autoschedule', JSON.stringify(autoSchedule));
      localStorage.setItem('dz-ai-deadlines', JSON.stringify(smartDeadlines));
      localStorage.setItem('dz-ai-summary', JSON.stringify(dailyAiSummary));
      localStorage.setItem('dz-ai-personality', aiPersonality);
      localStorage.setItem('dz-focus-duration', defaultFocusDuration.toString());
      localStorage.setItem('dz-focus-break', defaultBreak.toString());
      localStorage.setItem('dz-focus-autostart-break', JSON.stringify(autoStartBreak));
      localStorage.setItem('dz-focus-autostart-next', JSON.stringify(autoStartNextSession));
      localStorage.setItem('dz-focus-ambient-auto', JSON.stringify(playAmbientAuto));
      localStorage.setItem('dz-focus-fullscreen', JSON.stringify(enableFullscreen));

      setThemeMode(activeTheme === 'light' ? 'light' : 'dark');
      setTimeRemaining(defaultFocusDuration * 60);

      setIsEditProfileMode(false);
      addToast('Workspace updated', 'Settings successfully integrated and saved.', 'success');
    } catch (err: any) {
  console.error("SAVE ERROR:", err);

  addToast(
    "Error",
    err.message || "Unknown error",
    "error"
  );
}
  };

  const handleUpdatePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      addToast('Password update failed', 'Please fill in all security input fields.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      addToast('Mismatch mismatch', 'Confirm password does not match the new password.', 'warning');
      return;
    }

    addToast('Security password updated', 'Workspace keys updated successfully.', 'success');
    setShowPasswordDialog(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleDeleteAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmationText.toUpperCase() !== 'DELETE') {
      addToast('Verification Mismatch', 'Please type DELETE exactly to proceed.', 'error');
      return;
    }

    addToast('Account Erased', 'Your account has been deleted. Logging out...', 'error');
    setTimeout(() => {
      logout();
      localStorage.clear();
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="relative min-h-screen text-zinc-150 p-4 md:p-8 pb-32">
      
      {/* =====================================
          PREMIUM BACKGROUND LAYER
         ===================================== */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl z-0">
        {/* Animated gradients and lights */}
        <div className="absolute top-[-10%] left-[-15%] w-[60%] h-[60%] rounded-full bg-violet-600/10 dark:bg-violet-600/15 blur-[120px] mix-blend-screen animate-[mesh-drift_30s_infinite_alternate]" />
        <div className="absolute bottom-[-10%] right-[-15%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 dark:bg-fuchsia-600/15 blur-[120px] mix-blend-screen animate-[mesh-drift-reverse_25s_infinite_alternate]" />
        <div className="absolute top-[35%] right-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 dark:bg-cyan-500/10 blur-[130px] mix-blend-screen" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-8">
        
        {/* =====================================
            HEADER PANEL
           ===================================== */}
        <div className="flex flex-col gap-2 border-b border-zinc-150/10 dark:border-zinc-800/60 pb-6 relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-zinc-900/40 backdrop-blur-md border border-zinc-800/40 text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold uppercase tracking-widest text-zinc-950 dark:text-white font-mono">
                SETTINGS
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Customize your productivity workspace.
              </p>
            </div>
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 text-[10px] font-mono uppercase bg-zinc-900/40 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-zinc-800/40 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Workspace Synced</span>
          </div>
        </div>

        {/* =====================================
            MAIN GRID
           ===================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* =====================================
              SECTION 1: ACCOUNT PANEL
             ===================================== */}
          <Card className="relative overflow-hidden space-y-6 bg-zinc-950/30 backdrop-blur-md border border-zinc-900/80 p-6 md:p-8 rounded-2xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2.5 border-b border-zinc-150/10 dark:border-zinc-800/60 pb-3.5 uppercase tracking-wider font-mono">
              <User className="w-4 h-4 text-violet-400" /> Account Profile
            </h3>

            <div className="space-y-6">
              
              {/* Profile Image Display & Form */}
              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="relative group rounded-full p-1 bg-gradient-to-tr from-violet-500 via-indigo-500 to-cyan-400 shadow-md shrink-0">
                  <img 
                    src={avatar} 
                    alt="Profile avatar" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-zinc-950" 
                    referrerPolicy="no-referrer"
                  />
                  {isEditProfileMode && (
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <Camera className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 w-full space-y-4">
                  {isEditProfileMode ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      {/* Avatar presets selection */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          Select Avatar Preset
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_PRESETS.map((p, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setAvatar(p)}
                              className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                                avatar === p ? 'border-violet-400 scale-105 shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'border-zinc-700/40 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img src={p} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display name and email inputs */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Display Name</label>
                          <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full text-xs bg-zinc-900/60 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/60 transition-colors"
                            placeholder="Display Name"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Email Address</label>
                          <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full text-xs bg-zinc-900/60 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/60 transition-colors"
                            placeholder="Email address"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Occupation</label>
                          <input 
                            type="text" 
                            value={occupation}
                            onChange={(e) => setOccupation(e.target.value)}
                            className="w-full text-xs bg-zinc-900/60 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/60 transition-colors"
                            placeholder="Occupation"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500">Bio</label>
                          <textarea 
                            value={bio}
                            rows={2}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full text-xs bg-zinc-900/60 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/60 transition-colors resize-none"
                            placeholder="Bio description"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          onClick={() => {
                            setIsEditProfileMode(false);
                            setAvatar(user?.avatar || AVATAR_PRESETS[0]);
                            setUsername(localStorage.getItem('dz-username') || user?.email?.split('@')[0] || 'mahakseth82');
                            setEmail(user?.email || 'mahakseth82@gmail.com');
                            setOccupation(user?.occupation || 'Student / Freelancer');
                            setBio(user?.bio || 'Computer Science student and freelance web developer.');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="primary" 
                          size="sm" 
                          onClick={() => setIsEditProfileMode(false)}
                        >
                          Apply
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <p className="text-sm font-mono text-zinc-400">Display Name</p>
                        <p className="text-base font-bold text-zinc-800 dark:text-zinc-100">{username}</p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-mono text-zinc-400">Email Address</p>
                        <p className="text-base font-medium text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-500" />
                          {email}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-mono text-zinc-400">Occupation</p>
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                          <Briefcase className="w-3.5 h-3.5 text-zinc-500" />
                          {occupation}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm font-mono text-zinc-400">Bio</p>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{bio}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-zinc-150/10 dark:border-zinc-800/40">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="flex items-center justify-center gap-1.5 w-full sm:w-auto"
                          onClick={() => setIsEditProfileMode(true)}
                        >
                          <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Edit Profile</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center justify-center gap-1.5 text-zinc-750 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 w-full sm:w-auto"
                          onClick={() => setShowPasswordDialog(true)}
                        >
                          <Key className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Change Password</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="flex items-center justify-center gap-1.5 text-red-500 hover:text-red-400 hover:bg-red-950/10 w-full sm:w-auto ml-auto"
                          onClick={() => setShowDeleteAccountDialog(true)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Account</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

            </div>
          </Card>

          {/* =====================================
              SECTION 2: APPEARANCE PANEL
             ===================================== */}
          <Card className="space-y-6 bg-zinc-950/30 backdrop-blur-md border border-zinc-900/80 p-6 md:p-8 rounded-2xl">
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2.5 border-b border-zinc-150/10 dark:border-zinc-800/60 pb-3.5 uppercase tracking-wider font-mono">
              <Palette className="w-4 h-4 text-indigo-400" /> Appearance
            </h3>

            {/* Theme Selectors */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Interface Mode
              </label>
              <div className="grid grid-cols-3 gap-3">
                {/* Dark */}
                <button
                  type="button"
                  onClick={() => setActiveTheme('dark')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    activeTheme === 'dark'
                      ? 'bg-zinc-900 border-violet-500/80 text-white shadow-md'
                      : 'bg-zinc-950/30 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-950/55'
                  }`}
                >
                  <Moon className="w-4 h-4 mb-1.5 text-violet-400" />
                  <span className="text-xs font-semibold">Dark</span>
                </button>

                {/* Light */}
                <button
                  type="button"
                  onClick={() => setActiveTheme('light')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    activeTheme === 'light'
                      ? 'bg-zinc-50 border-violet-500/80 text-zinc-950 shadow-md'
                      : 'bg-zinc-950/30 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-950/55'
                  }`}
                >
                  <Sun className="w-4 h-4 mb-1.5 text-amber-500" />
                  <span className="text-xs font-semibold">Light</span>
                </button>

                {/* System */}
                <button
                  type="button"
                  onClick={() => setActiveTheme('system')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    activeTheme === 'system'
                      ? 'bg-zinc-900 border-violet-500/80 text-white shadow-md'
                      : 'bg-zinc-950/30 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:bg-zinc-950/55'
                  }`}
                >
                  <Laptop className="w-4 h-4 mb-1.5 text-indigo-400" />
                  <span className="text-xs font-semibold">System</span>
                </button>
              </div>
            </div>

            {/* Accent Color Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Accent Color
              </label>
              <div className="grid grid-cols-4 gap-3">
                {/* Purple */}
                <button
                  type="button"
                  onClick={() => setAccentColor('purple')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    accentColor === 'purple'
                      ? 'bg-violet-950/20 border-violet-500 text-violet-300'
                      : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-850 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
                    <span className="text-xs font-semibold hidden sm:inline">Purple</span>
                  </div>
                  {accentColor === 'purple' && <Check className="w-3.5 h-3.5 text-violet-400" />}
                </button>

                {/* Blue */}
                <button
                  type="button"
                  onClick={() => setAccentColor('blue')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    accentColor === 'blue'
                      ? 'bg-blue-950/20 border-blue-500 text-blue-300'
                      : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-850 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                    <span className="text-xs font-semibold hidden sm:inline">Blue</span>
                  </div>
                  {accentColor === 'blue' && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>

                {/* Cyan */}
                <button
                  type="button"
                  onClick={() => setAccentColor('cyan')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    accentColor === 'cyan'
                      ? 'bg-cyan-950/20 border-cyan-500 text-cyan-300'
                      : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-850 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
                    <span className="text-xs font-semibold hidden sm:inline">Cyan</span>
                  </div>
                  {accentColor === 'cyan' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>

                {/* Pink */}
                <button
                  type="button"
                  onClick={() => setAccentColor('pink')}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    accentColor === 'pink'
                      ? 'bg-pink-950/20 border-pink-500 text-pink-300'
                      : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-850 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.5)]" />
                    <span className="text-xs font-semibold hidden sm:inline">Pink</span>
                  </div>
                  {accentColor === 'pink' && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </button>
              </div>
            </div>

            {/* Font Sizing Selection */}
            <div className="space-y-3">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 block">
                Workspace Font Size
              </label>
              
              <div className="grid grid-cols-3 gap-3">
                {/* Small */}
                <button
                  type="button"
                  onClick={() => setFontSize('small')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    fontSize === 'small'
                      ? 'bg-zinc-900 dark:bg-zinc-850 border-violet-500/80 text-violet-400 font-bold shadow-md'
                      : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-850 text-zinc-400'
                  }`}
                >
                  <span className="text-xs">Small</span>
                </button>

                {/* Medium */}
                <button
                  type="button"
                  onClick={() => setFontSize('medium')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    fontSize === 'medium'
                      ? 'bg-zinc-900 dark:bg-zinc-850 border-violet-500/80 text-violet-400 font-bold shadow-md'
                      : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-850 text-zinc-400'
                  }`}
                >
                  <span className="text-sm">Medium</span>
                </button>

                {/* Large */}
                <button
                  type="button"
                  onClick={() => setFontSize('large')}
                  className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    fontSize === 'large'
                      ? 'bg-zinc-900 dark:bg-zinc-850 border-violet-500/80 text-violet-400 font-bold shadow-md'
                      : 'bg-zinc-950/30 border-zinc-900 hover:border-zinc-850 text-zinc-400'
                  }`}
                >
                  <span className="text-base">Large</span>
                </button>
              </div>

              {/* Sample Scale Preview */}
              <div className="bg-zinc-950/40 p-4 rounded-xl border border-zinc-900 space-y-1.5">
                <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest block">Live Typography Scale</span>
                <p className={`font-semibold text-zinc-800 dark:text-zinc-200 transition-all ${
                  fontSize === 'small' ? 'text-xs' : fontSize === 'medium' ? 'text-sm' : 'text-base'
                }`}>
                  "The ultimate deadline is the motivator that zero-indexes task latency."
                </p>
              </div>
            </div>
          </Card>

        </div>
      </div>

      {/* =====================================
          STICKY SAVE FOOTER BAR
         ===================================== */}
      {hasChanges && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-50/90 dark:bg-zinc-950/85 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-850 py-4.5 px-6 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-15px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-20px_40px_rgba(0,0,0,0.4)]"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              You have unsaved changes in your workspace parameters.
            </span>
          </div>
          
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCancelChanges}
              className="w-full sm:w-auto text-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={handleResetDefaults}
              className="w-full sm:w-auto text-yellow-600 dark:text-yellow-500 border-yellow-500/20"
            >
              Reset Defaults
            </Button>
            <Button 
              variant="primary" 
              size="sm" 
              onClick={handleSaveChanges}
              className="w-full sm:w-auto shadow-[0_0_15px_rgba(139,92,246,0.35)]"
            >
              Save Changes
            </Button>
          </div>
        </motion.div>
      )}

      {/* =====================================
          MODAL DIALOGS OVERLAY
         ===================================== */}

      {/* Change Password Dialog */}
      <Dialog
        isOpen={showPasswordDialog}
        onClose={() => setShowPasswordDialog(false)}
        title="Change Security Password"
        size="sm"
      >
        <form onSubmit={handleUpdatePasswordSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Current Password</label>
            <input 
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full text-xs bg-zinc-900/60 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/60"
              placeholder="••••••••••••"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">New Password</label>
            <input 
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full text-xs bg-zinc-900/60 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/60"
              placeholder="Enter new password"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Confirm Password</label>
            <input 
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full text-xs bg-zinc-900/60 border border-zinc-850 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-violet-500/60"
              placeholder="Re-enter to verify"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-150/5 dark:border-zinc-850">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowPasswordDialog(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Update Password
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog
        isOpen={showDeleteAccountDialog}
        onClose={() => setShowDeleteAccountDialog(false)}
        title="Destroy Account Identity"
        size="sm"
      >
        <form onSubmit={handleDeleteAccountSubmit} className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-xl text-xs text-red-400 space-y-1.5 leading-relaxed">
            <p className="font-bold">⚠️ CRITICAL WARNING: Permanent Deletion</p>
            <p>
              This is a destructive action. Deleting this account will instantly wipe your tasks, active calendar schedules, focus logs, and settings parameters forever.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Type <span className="font-mono font-bold text-red-400">DELETE</span> to authorize:
            </label>
            <input 
              type="text"
              required
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              className="w-full text-xs bg-zinc-900/60 border border-zinc-850 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-violet-500/60"
              placeholder="DELETE"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-zinc-150/5 dark:border-zinc-850">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowDeleteAccountDialog(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Delete Account
            </Button>
          </div>
        </form>
      </Dialog>

    </div>
  );
};

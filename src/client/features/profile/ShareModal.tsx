import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Share2, ShieldCheck, Copy, Linkedin, Twitter, Download, FileDown, Sparkles } from 'lucide-react';
import { useUiStore } from '../../store/ui.store';
import { Button } from '../../components/ui/Button';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useUiStore();
  const [sharingAction, setSharingAction] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerShareAction = (platform: string) => {
    setSharingAction(platform);
    setTimeout(() => {
      setSharingAction(null);
      if (platform === 'copy') {
        addToast('Clipboard Synchronized', 'Your public Chrono passport link has been copied.', 'success');
      } else {
        addToast('Action Succeeded', `Productivity profile successfully published to ${platform}.`, 'success');
      }
    }, 1100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-zinc-950 border border-white/[0.05] p-6 rounded-3xl max-w-xl w-full relative z-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-left overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl pointer-events-none" />
        
        <div className="flex justify-between items-center border-b border-white/[0.05] pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Share2 className="w-4 h-4 text-blue-400" />
            <h3 className="font-black text-xs text-zinc-100 uppercase tracking-wider font-mono">Export Productivity Passport</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 font-bold font-mono text-xs">CLOSE</button>
        </div>

        {/* Passport Preview Card */}
        <div className="border border-white/[0.04] rounded-2xl p-5 bg-gradient-to-br from-zinc-900/40 via-zinc-950 to-zinc-900/20 relative overflow-hidden mb-6">
          <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-full">
            <ShieldCheck className="w-3 h-3 text-blue-400" />
            <span className="text-[8px] font-mono font-bold text-blue-400">CHRONO-ID</span>
          </div>

          <div className="flex gap-4 items-center mb-4">
            <div className="w-14 h-14 rounded-full border border-blue-500/25 p-0.5">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&fit=crop"
                referrerPolicy="no-referrer"
                alt="User Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="text-left">
              <h4 className="text-sm font-black text-white">Mahak Seth</h4>
              <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">LEVEL 8 COGNITIVE DEPTH</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-white/[0.03]">
            <div className="p-2 bg-white/[0.01] rounded-xl border border-white/[0.02]">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Focus Efficacy</span>
              <p className="text-xs font-bold text-blue-400 mt-0.5">88%</p>
            </div>
            <div className="p-2 bg-white/[0.01] rounded-xl border border-white/[0.02]">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Total Sprints</span>
              <p className="text-xs font-bold text-cyan-400 mt-0.5">42 Sessions</p>
            </div>
            <div className="p-2 bg-white/[0.01] rounded-xl border border-white/[0.02]">
              <span className="text-[8px] font-mono text-zinc-500 uppercase">Risk Level</span>
              <p className="text-xs font-bold text-emerald-400 mt-0.5">Moderate</p>
            </div>
          </div>

          <p className="text-[10px] text-zinc-400 font-light leading-relaxed mt-4 bg-white/[0.01] p-2.5 rounded-xl border border-white/[0.02]">
            "Mahak Seth is a high-stamina evening developer who consistently achieves Peak focus parameters during 50-minute ultradian cycles."
          </p>
        </div>

        {/* Action button options */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <Button
            onClick={() => triggerShareAction('copy')}
            variant="outline"
            disabled={sharingAction !== null}
            className="text-[11px] justify-start gap-2 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
          >
            <Copy className="w-3.5 h-3.5 text-zinc-300" /> Copy Link
          </Button>

          <Button
            onClick={() => triggerShareAction('LinkedIn')}
            variant="outline"
            disabled={sharingAction !== null}
            className="text-[11px] justify-start gap-2 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
          >
            <Linkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn
          </Button>

          <Button
            onClick={() => triggerShareAction('Twitter')}
            variant="outline"
            disabled={sharingAction !== null}
            className="text-[11px] justify-start gap-2 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
          >
            <Twitter className="w-3.5 h-3.5 text-sky-400" /> Twitter/X
          </Button>

          <Button
            onClick={() => triggerShareAction('PNG Export')}
            variant="outline"
            disabled={sharingAction !== null}
            className="text-[11px] justify-start gap-2 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" /> Download PNG
          </Button>

          <Button
            onClick={() => triggerShareAction('PDF Export')}
            variant="outline"
            disabled={sharingAction !== null}
            className="text-[11px] justify-start gap-2 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
          >
            <FileDown className="w-3.5 h-3.5 text-pink-400" /> Export PDF Log
          </Button>

          <Button
            onClick={() => triggerShareAction('AI Summary Generation')}
            variant="outline"
            disabled={sharingAction !== null}
            className="text-[11px] justify-start gap-2 bg-white/[0.01] hover:bg-white/[0.04] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Chrono Summary
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

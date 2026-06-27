import React from 'react';
import { 
  Sparkles,
  Play,
  Award,
  Clock
} from 'lucide-react';
import { Task, TaskStatus } from '../../../types';
import { calculateAIPriorityMetrics } from './TaskHelper';
import { Button } from '../../components/ui/Button';

interface ChronoAIPanelProps {
  tasks: Task[];
  productivityScore: number;
  onPanic: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onBreakdown: (task: Task) => void;
  onOpenVoiceDeck: () => void;
}

export const ChronoAIPanel: React.FC<ChronoAIPanelProps> = ({
  tasks,
  onStartFocus,
  onBreakdown
}) => {
  const pendingTasks = tasks.filter(t => t.status !== TaskStatus.COMPLETED);

  // Determine the highest importance task that is pending
  const nextBestTask = pendingTasks
    .map(t => ({ task: t, metrics: calculateAIPriorityMetrics(t) }))
    .sort((a, b) => b.metrics.importanceScore - a.metrics.importanceScore)[0]?.task;

  const formatEstimatedTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0) {
      return `${h}h${m > 0 ? ` ${m}m` : ''}`;
    }
    return `${m}m`;
  };

  return (
    <div className="bg-zinc-950/40 backdrop-blur-md border border-zinc-200/10 dark:border-zinc-800/60 p-4 rounded-2xl relative overflow-hidden">
      {/* Active Premium AI Energy Orbs */}
      <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-violet-500/[0.04] dark:bg-violet-500/[0.08] blur-2xl pointer-events-none animate-orb-float" />
      <div className="absolute -bottom-12 -right-12 w-28 h-28 rounded-full bg-blue-500/[0.03] dark:bg-blue-500/[0.06] blur-2xl pointer-events-none animate-orb-float" style={{ animationDelay: '2.5s' }} />

      {/* Background radial shine */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header section */}
      <div className="flex justify-between items-center border-b border-zinc-200/10 dark:border-zinc-800/40 pb-2.5 mb-3.5">
        <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" /> AI Recommendation
        </span>
      </div>

      {nextBestTask ? (
        <div className="space-y-3.5">
          <div className="space-y-1">
            <span className="text-[9px] font-mono font-bold text-violet-400 uppercase tracking-widest block">Next Best Task</span>
            <h5 className="text-sm font-bold text-zinc-100 leading-snug">{nextBestTask.title}</h5>
            {nextBestTask.description && (
              <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{nextBestTask.description}</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <Clock className="w-3.5 h-3.5 text-violet-400" />
            <span>Estimated Focus Time:</span>
            <span className="text-violet-400 font-bold">{formatEstimatedTime(nextBestTask.estimatedTime || 60)}</span>
          </div>

          <div className="flex flex-col gap-2 pt-1">
            <Button
              size="sm"
              onClick={() => onStartFocus(nextBestTask)}
              className="w-full py-1.5 h-8 text-[10px] font-mono font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white border-none gap-1.5 shadow-sm cursor-pointer"
            >
              <Play className="w-3 h-3 fill-current" /> Start Focus
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onBreakdown(nextBestTask)}
              className="w-full py-1.5 h-8 text-[10px] font-mono font-bold uppercase tracking-wider bg-transparent hover:bg-zinc-900 text-zinc-300 border border-zinc-850 hover:text-white cursor-pointer"
            >
              Break Into Subtasks
            </Button>
          </div>
        </div>
      ) : (
        <div className="py-4 text-center">
          <Award className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">Clear Backlog</span>
          <p className="text-xs text-zinc-500 mt-1">Outstanding! All milestones cleared.</p>
        </div>
      )}
    </div>
  );
};

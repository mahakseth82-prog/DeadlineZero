import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Edit, 
  Trash2, 
  Clock, 
  Flame, 
  Zap, 
  Play,
  Calendar
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../../types';
import { Button } from '../../components/ui/Button';
import { getTaskProgress } from '../../store/task.store';

interface TaskCardProps {
  task: Task;
  viewMode: 'list' | 'kanban' | 'timeline' | 'compact';
  onClick: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onDuplicate?: () => void;
  onStartFocus?: () => void;
  onPanic?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  viewMode,
  onClick,
  onStatusChange,
  onEdit,
  onDelete,
  onStartFocus,
  draggable = true,
  onDragStart
}) => {
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const deadlineDate = new Date(task.deadline);
  const isOverdue = deadlineDate.getTime() < Date.now() && !isCompleted;
  const progress = getTaskProgress(task);

  const [rotateX, setRotateX] = React.useState(0);
  const [rotateY, setRotateY] = React.useState(0);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isCompleted) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    setRotateY((x - xc) / (rect.width / 8)); // max ~3 degrees
    setRotateX((yc - y) / (rect.height / 6)); // max ~2.5 degrees
  };

  const handleCardMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  // Focus Recommendation Tip based on task properties
  const getFocusRecommendation = () => {
    if (task.priority === TaskPriority.CRITICAL || task.priority === TaskPriority.HIGH) {
      return "High ROI task to unlock sprint bottleneck.";
    }
    if ((task.difficultyScore || 5) >= 7) {
      return "Optimal for morning peak energy deep work.";
    }
    return "Quick win task to build productive momentum.";
  };

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  // Define priority badge styles
  const getPriorityStyle = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.CRITICAL:
        return 'bg-red-500/10 text-red-400 border-red-500/25';
      case TaskPriority.HIGH:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case TaskPriority.MEDIUM:
        return 'bg-violet-500/10 text-violet-400 border-violet-500/25';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 border-zinc-200 dark:border-zinc-700/50';
    }
  };

  // --- RENDERING COMPACT VIEW ---
  if (viewMode === 'compact') {
    return (
      <div
        onClick={onClick}
      
        className="group relative flex items-center justify-between gap-4 py-2 px-4 bg-white/30 dark:bg-zinc-900/35 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl hover:border-violet-500/30 hover:bg-white/50 dark:hover:bg-zinc-900/50 transition-all duration-300 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(isCompleted ? TaskStatus.TODO : TaskStatus.COMPLETED);
            }}
            className="text-zinc-400 hover:text-emerald-400 shrink-0 transition-colors"
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-400 fill-emerald-400/10' : ''}`} />
          </button>

          <span className="text-base font-bold font-mono text-zinc-400 uppercase w-16 truncate bg-zinc-100 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded text-center shrink-0">
            {task.project || 'General'}
          </span>

          <h4 className={`text-xl font-bold truncate leading-tight flex-1 ${isCompleted ? 'line-through text-zinc-500 font-medium' : 'text-zinc-800 dark:text-zinc-200'}`}>
            {task.title}
          </h4>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 shrink-0 font-mono text-base text-zinc-400">
              <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
              <div className="w-10 bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                <div className="bg-violet-500 h-1" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0 font-mono text-[10px]">
          <span className={`px-1.5 py-0.5 rounded font-bold border text-xs uppercase ${getPriorityStyle(task.priority)}`}>
            {task.priority}
          </span>

          <span className="text-zinc-400 w-12 text-right hidden sm:inline">
            {task.estimatedTime}m
          </span>

          <span className={`w-16 text-right hidden sm:inline ${isOverdue ? 'text-red-400 font-bold animate-pulse' : 'text-zinc-500'}`}>
            {isOverdue ? 'Overdue' : formatDate(task.deadline)}
          </span>

          {/* Compact Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="p-1 h-11 w-9 border-zinc-200/80 dark:border-zinc-800/80 rounded"
              title="Edit"
            >
              <Edit className="w-5 h-5 text-zinc-400" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="p-1 h-11 w-9 border-zinc-200/80 dark:border-zinc-800/80 rounded hover:bg-red-500/10 hover:border-red-500/30"
              title="Purge"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING TIMELINE VIEW ---
  if (viewMode === 'timeline') {
    return (
      <div className="flex gap-4 group">
        <div className="flex flex-col items-center shrink-0">
          <div className={`w-5 h-5 rounded-full border-2 ${
            isCompleted 
              ? 'bg-emerald-500 border-emerald-500/30' 
              : isOverdue 
              ? 'bg-red-500 border-red-500/30 animate-pulse' 
              : 'bg-zinc-950 border-violet-500'
          }`} />
          <div className="w-0.5 flex-1 bg-gradient-to-b from-zinc-300 dark:from-zinc-800/50 to-transparent min-h-[60px] group-last:hidden" />
        </div>

        <div className="flex-1 pb-4">
          <div className="text-[10px] font-bold font-mono text-violet-400 mb-1 flex items-center gap-2">
            <span>{formatDate(task.deadline)}</span>
            <span>•</span>
            <span className={`${isOverdue ? 'text-red-400 font-black' : 'text-zinc-500'}`}>{formatTime(task.deadline)}</span>
            {isOverdue && <span className="bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 text-xs">LATE</span>}
          </div>

          <div
            onClick={onClick}
           
            className="bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/50 dark:border-zinc-800/50 rounded-xl p-3.5 hover:border-violet-500/30 shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-xs font-mono font-bold text-zinc-500 uppercase">
                  {task.project || 'General'}
                </span>
                <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold border ${getPriorityStyle(task.priority)}`}>
                  {task.priority}
                </span>
                <span className="text-base font-mono text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-500" /> {task.estimatedTime}m
                </span>
              </div>

              <h4 className={`text-xl font-bold ${isCompleted ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                {task.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" onClick={e => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(isCompleted ? TaskStatus.TODO : TaskStatus.COMPLETED)}
                className="p-1 h-10 w-10 rounded-xl border-zinc-200/85 dark:border-zinc-800/85 hover:border-emerald-500/30"
              >
                <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'text-emerald-400' : 'text-zinc-400'}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="p-1h-10 w-10 rounded-xl border-zinc-200/85 dark:border-zinc-800/85"
              >
                <Edit className="w-5h-5 text-zinc-400" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="p-1 h-10 w-10 rounded-xl border-zinc-200/85 dark:border-zinc-800/85 hover:bg-red-500/10 hover:border-red-500/30"
              >
                <Trash2 className="w-5 h-5 text-red-400" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDERING KANBAN & LIST STANDARD VIEWS ---
  const isKanban = viewMode === 'kanban';

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      onMouseMove={handleCardMouseMove}
      onMouseLeave={handleCardMouseLeave}
      style={{
        transform: rotateX || rotateY 
          ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px) translateZ(0)` 
          : undefined,
        transition: rotateX || rotateY ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.25s ease, box-shadow 0.25s ease',
      }}
      className={`relative bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md border border-zinc-200/60 dark:border-zinc-800/60 rounded-2xl p-6 cursor-grab active:cursor-grabbing overflow-hidden group premium-card-hover ${
        isCompleted ? 'opacity-85' : ''
      }`}
    >
      {/* Priority Indicator left bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${
        task.priority === TaskPriority.CRITICAL 
          ? 'bg-red-500' 
          : task.priority === TaskPriority.HIGH 
          ? 'bg-amber-500' 
          : task.priority === TaskPriority.MEDIUM 
          ? 'bg-violet-500' 
          : 'bg-zinc-400'
      }`} />

      {/* Header tags */}
      <div className="flex justify-between items-center gap-1.5 flex-wrap pl-1.5">
        <div className="flex items-center gap-1.5">
          <span className="px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800/60 text-xs font-bold font-mono text-zinc-500 uppercase tracking-widest">
            {task.project || 'General'}
          </span>
          <span className={`px-1.5 py-0.5 rounded text-xs font-mono font-bold border ${getPriorityStyle(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        <span className="text-base font-mono text-zinc-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-zinc-500" /> {task.estimatedTime}m
        </span>
      </div>

      {/* Title & Description */}
      <div className="mt-3 space-y-1.5 pl-1.5">
        <h4 className={`font-bold text-xl tracking-tight leading-snug ${
          isCompleted ? 'line-through text-zinc-500' : 'text-zinc-900 dark:text-white'
        }`}>
          {task.title}
        </h4>

        {!isKanban && task.description && (
          <p className="text-base text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Subtask progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-400">
              <span className="uppercase">Subtasks</span>
              <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
            </div>
            <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-violet-500 h-1 rounded-full" 
                style={{ width: `${progress}%`, transition: 'width 0.3s ease' }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer info & Hover actions */}
      <div className="mt-4 pt-3.5 border-t border-zinc-200/50 dark:border-zinc-800/40 flex justify-between items-center pl-1.5">
        <div className="text-base font-mono text-zinc-400 flex items-center gap-1">
          <Calendar className="w-5 h-5 text-zinc-500" />
          <span className={isOverdue ? 'text-red-400 font-bold' : ''}>
            {isOverdue ? 'Overdue' : formatDate(task.deadline)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onStartFocus && !isCompleted && (
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); onStartFocus(); }}
              className=" py-1 h-11 text-base px-3 font-mono font-bold uppercase tracking-wider bg-violet-600 hover:bg-violet-700 text-white border-none gap-1 shrink-0 rounded-lg"
            >
              <Play className="w-2 h-2 fill-current" /> Focus
            </Button>
          )}

          <div className="flex gap-2 opacity-100 group-hover:opacity-100 transition-all duration-200" onClick={e => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(isCompleted ? TaskStatus.TODO : TaskStatus.COMPLETED)}
              className="p-1 h-11 w-9 rounded-lg border-zinc-200 dark:border-zinc-800 hover:border-emerald-500/30 bg-zinc-950/20"
            >
              <CheckCircle2 className={`w-5 h-5 ${isCompleted ? 'text-emerald-400' : 'text-zinc-400'}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="p-1 h-11 w-9 rounded-lg border-zinc-200 dark:border-zinc-800 bg-zinc-950/20"
            >
              <Edit className="w-5 h-5 text-zinc-400" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="p-1 h-11 w-9 rounded-lg border-zinc-200 dark:border-zinc-800 hover:bg-red-500/10 hover:border-red-500/30 bg-zinc-950/20"
            >
              <Trash2 className="w-5 h-5 text-red-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

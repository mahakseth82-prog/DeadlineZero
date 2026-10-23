import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Edit, 
  Trash2, 
  Clock, 
  Play,
  Calendar,
  Layers
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

  const getPriorityStyle = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.CRITICAL:
        return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case TaskPriority.HIGH:
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case TaskPriority.MEDIUM:
        return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700/50';
    }
  };

  // --- RENDERING COMPACT VIEW ---
  if (viewMode === 'compact') {
    return (
      <div
        onClick={onClick}
        className="group relative flex items-center justify-between gap-4 py-2.5 px-4 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl hover:border-indigo-500/30 hover:shadow-xs transition-all duration-150 cursor-pointer"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatusChange(isCompleted ? TaskStatus.TODO : TaskStatus.COMPLETED);
            }}
            className="text-slate-400 hover:text-emerald-500 shrink-0 transition-colors"
          >
            <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-500 fill-emerald-500/10' : ''}`} />
          </button>

          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md truncate max-w-[90px] shrink-0">
            {task.project || 'General'}
          </span>

          <h4 className={`text-sm truncate leading-tight flex-1 ${isCompleted ? 'line-through text-slate-400 font-normal' : 'text-slate-800 dark:text-slate-200 font-medium'}`}>
            {task.title}
          </h4>

          {task.subtasks && task.subtasks.length > 0 && (
            <div className="hidden md:flex items-center gap-1.5 shrink-0 text-xs text-slate-400 font-medium">
              <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
              <div className="w-12 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 text-xs">
          <span className={`px-2 py-0.5 rounded-full font-medium border text-[11px] ${getPriorityStyle(task.priority)}`}>
            {task.priority}
          </span>

          <span className="text-slate-400 text-xs hidden sm:inline">
            {task.estimatedTime}m
          </span>

          <span className={`text-xs hidden sm:inline ${isOverdue ? 'text-rose-500 font-semibold' : 'text-slate-400'}`}>
            {isOverdue ? 'Overdue' : formatDate(task.deadline)}
          </span>

          {/* Compact Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150" onClick={e => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="w-7 h-7 p-0 rounded-lg border-slate-200 dark:border-slate-800"
              title="Edit"
            >
              <Edit className="w-3.5 h-3.5 text-slate-400" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="w-7 h-7 p-0 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
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
          <div className={`w-4 h-4 rounded-full border-2 ${
            isCompleted 
              ? 'bg-emerald-500 border-emerald-500/30' 
              : isOverdue 
              ? 'bg-rose-500 border-rose-500/30 animate-pulse' 
              : 'bg-indigo-500 border-indigo-500/30'
          }`} />
          <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-800 min-h-[50px] group-last:hidden" />
        </div>

        <div className="flex-1 pb-4 text-left">
          <div className="text-xs text-indigo-500 dark:text-indigo-400 mb-1 flex items-center gap-2 font-medium">
            <span>{formatDate(task.deadline)}</span>
            <span>•</span>
            <span className={isOverdue ? 'text-rose-500 font-semibold' : 'text-slate-500 dark:text-slate-400'}>{formatTime(task.deadline)}</span>
            {isOverdue && <span className="bg-rose-500/10 text-rose-500 px-1.5 py-0.5 rounded text-[10px] font-semibold">OVERDUE</span>}
          </div>

          <div
            onClick={onClick}
            className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-xl p-4 hover:border-indigo-500/30 shadow-xs transition-all duration-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 cursor-pointer"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  {task.project || 'General'}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getPriorityStyle(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
              <h4 className={`text-sm font-semibold truncate ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                {task.title}
              </h4>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" onClick={e => e.stopPropagation()}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange(isCompleted ? TaskStatus.TODO : TaskStatus.COMPLETED)}
                className="w-8 h-8 p-0 rounded-lg border-slate-200 dark:border-slate-800 hover:border-emerald-500/30"
              >
                <CheckCircle2 className={`w-4 h-4 ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="w-8 h-8 p-0 rounded-lg border-slate-200 dark:border-slate-800"
              >
                <Edit className="w-4 h-4 text-slate-400" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onDelete}
                className="w-8 h-8 p-0 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30"
              >
                <Trash2 className="w-4 h-4 text-rose-400" />
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
      className={`relative bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 cursor-grab active:cursor-grabbing overflow-hidden group hover:border-indigo-500/30 hover:shadow-md transition-all duration-200 text-left ${
        isCompleted ? 'opacity-80' : ''
      }`}
    >
      {/* Priority Indicator left bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${
        task.priority === TaskPriority.CRITICAL 
          ? 'bg-rose-500' 
          : task.priority === TaskPriority.HIGH 
          ? 'bg-amber-500' 
          : task.priority === TaskPriority.MEDIUM 
          ? 'bg-indigo-500' 
          : 'bg-slate-400'
      }`} />

      {/* Header tags */}
      <div className="flex justify-between items-center gap-1.5 flex-wrap pl-1.5">
        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400">
            {task.project || 'General'}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${getPriorityStyle(task.priority)}`}>
            {task.priority}
          </span>
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
          <Clock className="w-3.5 h-3.5 text-slate-400" /> {task.estimatedTime}m
        </span>
      </div>

      {/* Title & Description */}
      <div className="mt-3 space-y-1.5 pl-1.5">
        <h4 className={`font-semibold text-base tracking-tight leading-snug ${
          isCompleted ? 'line-through text-slate-400' : 'text-slate-900 dark:text-white'
        }`}>
          {task.title}
        </h4>

        {!isKanban && task.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {task.description}
          </p>
        )}

        {/* Subtask progress */}
        {task.subtasks && task.subtasks.length > 0 && (
          <div className="space-y-1.5 pt-1.5">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span>Subtasks</span>
              <span>{task.subtasks.filter(s => s.completed).length}/{task.subtasks.length}</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full rounded-full transition-all duration-300" 
                style={{ width: `${progress}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer info & Hover actions */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex justify-between items-center pl-1.5">
        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 font-medium">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span className={isOverdue ? 'text-rose-500 font-semibold' : ''}>
            {isOverdue ? 'Overdue' : formatDate(task.deadline)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {onStartFocus && !isCompleted && (
            <Button
              size="sm"
              onClick={(e) => { e.stopPropagation(); onStartFocus(); }}
              className="py-1 px-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg gap-1"
            >
              <Play className="w-3 h-3 fill-current" /> Focus
            </Button>
          )}

          <div className="flex gap-1" onClick={e => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStatusChange(isCompleted ? TaskStatus.TODO : TaskStatus.COMPLETED)}
              className="w-7 h-7 p-0 rounded-lg border-slate-200 dark:border-slate-800 hover:border-emerald-500/30"
              title={isCompleted ? "Mark incomplete" : "Mark complete"}
            >
              <CheckCircle2 className={`w-3.5 h-3.5 ${isCompleted ? 'text-emerald-500' : 'text-slate-400'}`} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="w-7 h-7 p-0 rounded-lg border-slate-200 dark:border-slate-800"
              title="Edit task"
            >
              <Edit className="w-3.5 h-3.5 text-slate-400" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="w-7 h-7 p-0 rounded-lg border-slate-200 dark:border-slate-800 hover:bg-rose-500/10 hover:border-rose-500/30"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

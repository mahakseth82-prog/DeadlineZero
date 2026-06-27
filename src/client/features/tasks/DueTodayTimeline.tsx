import React from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Task, TaskPriority, TaskStatus } from '../../../types';

interface DueTodayTimelineProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
}

export const DueTodayTimeline: React.FC<DueTodayTimelineProps> = ({
  tasks,
  onTaskClick
}) => {
  // Get tasks due today that are not completed
  const getTodayTasks = () => {
    const today = new Date();
    return tasks.filter(t => {
      if (t.status === TaskStatus.COMPLETED) return false;
      const dl = new Date(t.deadline);
      return dl.getDate() === today.getDate() && 
             dl.getMonth() === today.getMonth() && 
             dl.getFullYear() === today.getFullYear();
    });
  };

  const todayTasks = getTodayTasks();

  // Sort chronologically by deadline time
  const sortedTodayTasks = [...todayTasks].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const getPriorityStyle = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.CRITICAL:
        return 'text-red-400 bg-red-500/10 border-red-500/20';
      case TaskPriority.HIGH:
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case TaskPriority.MEDIUM:
        return 'text-violet-400 bg-violet-500/10 border-violet-500/20';
      default:
        return 'text-zinc-400 bg-zinc-800 border-zinc-700/55';
    }
  };

  return (
    <div className="bg-zinc-950/25 border border-zinc-200/10 dark:border-zinc-800/60 p-4 rounded-2xl space-y-4">
      <div className="flex justify-between items-center border-b border-zinc-200/10 dark:border-zinc-800/40 pb-2">
        <span className="text-[10px] font-black font-mono uppercase tracking-widest text-zinc-300 flex items-center gap-2">
          Due Today
        </span>
        <span className="text-[10px] font-mono text-zinc-500">
          {sortedTodayTasks.length} {sortedTodayTasks.length === 1 ? 'task' : 'tasks'}
        </span>
      </div>

      {sortedTodayTasks.length === 0 ? (
        <div className="py-8 text-center text-[11px] font-mono text-zinc-500">
          <Clock className="w-5 h-5 mx-auto text-zinc-600 mb-1.5" />
          No deadlines scheduled for today.
        </div>
      ) : (
        <div className="space-y-2.5">
          {sortedTodayTasks.map((task) => (
            <div 
              key={task.id}
              onClick={() => onTaskClick(task.id)}
              className="bg-zinc-900/30 border border-zinc-800/60 hover:border-violet-500/30 rounded-xl p-3 transition-all duration-300 cursor-pointer flex justify-between items-center gap-3"
            >
              <div className="min-w-0 flex-1 space-y-1">
                <h5 className="text-xs font-bold text-zinc-100 truncate">
                  {task.title}
                </h5>
                <div className="flex items-center gap-2 font-mono text-[9px]">
                  <span className="text-zinc-400 font-medium">
                    {formatTime(task.deadline)}
                  </span>
                  <span>•</span>
                  <span className={`px-1.5 py-0.2 rounded border uppercase font-bold text-[8px] ${getPriorityStyle(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-[9px] font-mono text-violet-400 hover:text-violet-300 shrink-0">
                <span>Open</span>
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

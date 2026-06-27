import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Filter, 
  Tag, 
  Flame, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp,
  RefreshCw
} from 'lucide-react';
import { Category, TaskPriority, TaskStatus } from '../../../types';

interface TaskFiltersProps {
  categories: Category[];
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
  selectedPriorities: TaskPriority[];
  setSelectedPriorities: (prios: TaskPriority[]) => void;
  selectedStatuses: TaskStatus[];
  setSelectedStatuses: (stats: TaskStatus[]) => void;
  selectedDeadlines: string[];
  setSelectedDeadlines: (dls: string[]) => void;
  onResetAll: () => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  categories,
  selectedCategories,
  setSelectedCategories,
  selectedPriorities,
  setSelectedPriorities,
  selectedStatuses,
  setSelectedStatuses,
  selectedDeadlines,
  setSelectedDeadlines,
  onResetAll
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle helpers
  const toggleItem = <T,>(list: T[], setList: (items: T[]) => void, item: T) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Check if any filter is active
  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    selectedPriorities.length > 0 ||
    selectedStatuses.length > 0 ||
    selectedDeadlines.length > 0;

  return (
    <div className="bg-zinc-950/20 border border-zinc-200/10 dark:border-zinc-800/60 rounded-2xl p-3.5 space-y-3.5">
      {/* Filters Header Toggle */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <Filter className="w-4 h-4 text-violet-400" />
          <span className="text-[10px] font-black font-mono uppercase tracking-widest">
            Filters
          </span>
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-violet-400 animate-pulse shadow-[0_0_8px_#8b5cf6]" />
          )}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onResetAll}
            className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase text-red-400 hover:text-red-300 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reset Filters
          </button>
        )}
      </div>

      <AnimatePresence>
        {(isOpen || hasActiveFilters) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="space-y-4 pt-1.5 overflow-hidden"
          >
            {/* Row 1: CATEGORIES & STATUS */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Category Pills */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5" /> Category
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {categories.map(c => {
                    const isSelected = selectedCategories.includes(c.id);
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => toggleItem(selectedCategories, setSelectedCategories, c.id)}
                        className={`text-[9px] font-bold font-mono uppercase px-2.5 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                          isSelected
                            ? 'bg-violet-500/10 text-violet-400 border-violet-500/30 shadow-[0_0_8px_rgba(139,92,246,0.1)]'
                            : 'bg-zinc-900/30 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                        {c.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status Pills */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Status
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {([TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.COMPLETED] as const).map(st => {
                    const isSelected = selectedStatuses.includes(st);
                    const labelMap = {
                      [TaskStatus.TODO]: 'Todo',
                      [TaskStatus.IN_PROGRESS]: 'In Progress',
                      [TaskStatus.COMPLETED]: 'Completed'
                    };
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => toggleItem(selectedStatuses, setSelectedStatuses, st)}
                        className={`text-[9px] font-bold font-mono uppercase px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-zinc-900/30 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                        }`}
                      >
                        {labelMap[st]}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Row 2: PRIORITY & DUE DATE */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {/* Priorities */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> Priority
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {([TaskPriority.LOW, TaskPriority.MEDIUM, TaskPriority.HIGH, TaskPriority.CRITICAL] as const).map(pr => {
                    const isSelected = selectedPriorities.includes(pr);
                    const borderClass = pr === TaskPriority.CRITICAL ? 'border-red-500/10 hover:border-red-500/30' : 'border-zinc-800';
                    return (
                      <button
                        key={pr}
                        type="button"
                        onClick={() => toggleItem(selectedPriorities, setSelectedPriorities, pr)}
                        className={`text-[9px] font-bold font-mono uppercase px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? pr === TaskPriority.CRITICAL 
                              ? 'bg-red-500/10 text-red-400 border-red-500/30 shadow-[0_0_10px_rgba(239,68,68,0.15)]'
                              : 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                            : `bg-zinc-900/30 text-zinc-500 ${borderClass} hover:text-zinc-300`
                        }`}
                      >
                        {pr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Deadlines Range (Due Date) */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Due Date
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['overdue', 'today', 'thisWeek', 'later'].map(range => {
                    const isSelected = selectedDeadlines.includes(range);
                    const labelMap = { overdue: 'Overdue', today: 'Due Today', thisWeek: 'This Week', later: 'Later' };
                    return (
                      <button
                        key={range}
                        type="button"
                        onClick={() => toggleItem(selectedDeadlines, setSelectedDeadlines, range)}
                        className={`text-[9px] font-bold font-mono uppercase px-2.5 py-1 rounded-lg border transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                            : 'bg-zinc-900/30 text-zinc-500 border-zinc-800 hover:text-zinc-300'
                        }`}
                      >
                        {labelMap[range as 'overdue' | 'today' | 'thisWeek' | 'later']}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

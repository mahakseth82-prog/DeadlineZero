import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Bot, 
  CheckCircle2, 
  Calendar, 
  Paperclip, 
  Trash2, 
  Play, 
  Flame, 
  Activity, 
  Sliders, 
  Sparkles,
  Link2,
  FileText
} from 'lucide-react';
import { Task, TaskPriority, TaskStatus, Subtask } from '../../../types';
import { calculateAIPriorityMetrics } from './TaskHelper';
import { Button } from '../../components/ui/Button';

interface TaskDetailsDrawerProps {
  activeTask: Task | null;
  allTasks: Task[];
  onClose: () => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onRemoveSubtask: (taskId: string, subtaskId: string) => void;
  onTriggerAIBreakdown: (task: Task) => void;
  isBreakingDown: boolean;
  onAutoSchedule: (task: Task) => void;
  onStartFocus: (task: Task) => void;
  onPanic: (task: Task) => void;
  schedules: any[];
  attachments: Record<string, { id: string; name: string; size: string; date: string }[]>;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileDrop: (e: React.DragEvent) => void;
  onDeleteAttachment: (taskId: string, attachId: string) => void;
  onUpdateTask: (taskId: string, fields: Partial<Task>) => void;
  onAddToast: (title: string, desc: string, variant: 'success' | 'info' | 'warning') => void;
}

export const TaskDetailsDrawer: React.FC<TaskDetailsDrawerProps> = ({
  activeTask,
  allTasks,
  onClose,
  onToggleSubtask,
  onAddSubtask,
  onRemoveSubtask,
  onTriggerAIBreakdown,
  isBreakingDown,
  onAutoSchedule,
  onStartFocus,
  onPanic,
  schedules,
  attachments,
  onFileUpload,
  onFileDrop,
  onDeleteAttachment,
  onUpdateTask,
  onAddToast
}) => {
  const [newStepText, setNewStepText] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  if (!activeTask) return null;

  const metrics = calculateAIPriorityMetrics(activeTask);
  const isCompleted = activeTask.status === TaskStatus.COMPLETED;
  const isOverdue = new Date(activeTask.deadline).getTime() < Date.now() && !isCompleted;
  
  const hasSchedule = schedules.some(s => s.taskId === activeTask.id);
  const taskAttachments = attachments[activeTask.id] || [];

  // Handle adding a checklist step inside drawer
  const handleAddStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStepText.trim()) return;
    onAddSubtask(activeTask.id, newStepText.trim());
    setNewStepText('');
    onAddToast('Checklist Step Added', 'Successfully updated active sprint blueprint.', 'success');
  };

  // Handle saving notes
  const handleSaveNotes = () => {
    onUpdateTask(activeTask.id, { notes: tempNotes });
    setIsEditingNotes(false);
    onAddToast('Notes Saved', 'Task documentation synchronized.', 'success');
  };

  // Handle setting a dependency task
  const handleSetDependency = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const depTaskId = e.target.value;
    if (depTaskId === 'none') {
      onUpdateTask(activeTask.id, { notes: (activeTask.notes || '') + '\n[Dependencies Cleared]' });
    } else {
      const depTask = allTasks.find(t => t.id === depTaskId);
      if (depTask) {
        onUpdateTask(activeTask.id, { 
          notes: (activeTask.notes || '') + `\n[Dependency Linked]: Depends on target task "${depTask.title}"` 
        });
        onAddToast('Dependency Anchored', `Task is now blocked by "${depTask.title}".`, 'info');
      }
    }
  };

  // Find linked dependency title in notes
  const getLinkedDependencyName = () => {
    const lines = (activeTask.notes || '').split('\n');
    const depLine = lines.find(l => l.startsWith('[Dependency Linked]:'));
    if (depLine) {
      return depLine.replace('[Dependency Linked]: Depends on target task "', '').replace('"', '');
    }
    return null;
  };

  const dependencyName = getLinkedDependencyName();

  // Drag and drop file helper guards
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <>
      {/* Backdrop overlay */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full max-w-lg bg-zinc-950 border-l border-zinc-800 z-50 p-6 shadow-2xl flex flex-col overflow-hidden text-zinc-100"
      >
        {/* Drawer Header */}
        <div className="flex justify-between items-start pb-4 border-b border-zinc-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-zinc-800 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                {activeTask.project || 'Sprint Zero'}
              </span>
              <span className="text-[9px] font-mono text-zinc-500">
                ID: {activeTask.id}
              </span>
            </div>
            <h2 className="text-base font-black tracking-tight text-white leading-snug">
              {activeTask.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-all shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto space-y-5.5 py-5 pr-1 text-xs">
          
          {/* Description */}
          {activeTask.description && (
            <div className="space-y-1">
              <h5 className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Description</h5>
              <p className="text-zinc-300 leading-relaxed font-medium bg-zinc-900/30 p-3 rounded-xl border border-zinc-900">
                {activeTask.description}
              </p>
            </div>
          )}

          {/* AI Priority Metrics Card */}
          <div className="grid grid-cols-3 gap-3 bg-zinc-900/40 p-3.5 rounded-xl border border-zinc-800/80">
            <div className="text-center">
              <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">AI Urgency</span>
              <p className="text-sm font-black font-mono mt-1 text-violet-400">
                {metrics.urgencyScore}%
              </p>
            </div>
            <div className="text-center border-x border-zinc-800">
              <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">AI Importance</span>
              <p className="text-sm font-black font-mono mt-1 text-emerald-400">
                {metrics.importanceScore}%
              </p>
            </div>
            <div className="text-center">
              <span className="text-[8px] font-mono font-bold text-zinc-500 uppercase tracking-wider">Deadline Risk</span>
              <p className="text-sm font-black font-mono mt-1 uppercase text-red-400">
                {metrics.deadlineRisk.level}
              </p>
            </div>
          </div>

          {/* Checklist Area */}
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5">
              <h5 className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Action Checklist</h5>
              <Button
                size="sm"
                onClick={() => onTriggerAIBreakdown(activeTask)}
                disabled={isBreakingDown}
                className="py-1 h-6 px-2.5 text-[8px] font-mono font-bold uppercase bg-violet-600 hover:bg-violet-700 text-white border-none gap-1 shrink-0 shadow-sm"
              >
                <Bot className={`w-3 h-3 ${isBreakingDown ? 'animate-spin' : ''}`} />
                {isBreakingDown ? 'Analyzing...' : 'AI Breakdown'}
              </Button>
            </div>

            {/* Checklist Step Inputs */}
            <form onSubmit={handleAddStep} className="flex gap-1.5">
              <input
                type="text"
                placeholder="Add subtask checklist step..."
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
              <Button type="submit" size="sm" className="bg-zinc-800 hover:bg-zinc-750 text-white font-mono px-2.5 h-8 text-[9px]">
                ADD STEP
              </Button>
            </form>

            {/* Steps list */}
            {activeTask.subtasks && activeTask.subtasks.length > 0 ? (
              <div className="space-y-2">
                {activeTask.subtasks.map(sub => (
                  <div 
                    key={sub.id}
                    className="flex items-center justify-between bg-zinc-900/30 p-2.5 rounded-lg border border-zinc-850 hover:bg-zinc-900/50 transition-colors"
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1">
                      <input
                        type="checkbox"
                        checked={sub.completed}
                        onChange={() => onToggleSubtask(activeTask.id, sub.id)}
                        className="w-3.5 h-3.5 rounded text-violet-500 border-zinc-700 focus:ring-violet-500/50 bg-zinc-900"
                      />
                      <span className={`text-[11px] truncate ${sub.completed ? 'line-through text-zinc-500' : 'text-zinc-200 font-medium'}`}>
                        {sub.title}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => onRemoveSubtask(activeTask.id, sub.id)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-[10px] font-mono text-zinc-500 bg-zinc-900/10 border border-zinc-850 rounded-xl italic">
                No steps logged. Click "AI Breakdown" to generate steps instantly using Gemini.
              </div>
            )}
          </div>

          {/* Dependencies Linkage */}
          <div className="space-y-2.5 bg-zinc-900/20 border border-zinc-850 p-3 rounded-xl">
            <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest block">Milestone Dependencies</span>
            
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-violet-400 shrink-0" />
                <span className="font-medium text-zinc-300">
                  {dependencyName ? `Blocked by: "${dependencyName}"` : 'No dependencies mapped'}
                </span>
              </div>

              <select
                onChange={handleSetDependency}
                className="bg-zinc-950 border border-zinc-800 text-[10px] rounded px-2 py-1 focus:outline-none"
              >
                <option value="none">Set Blocker...</option>
                {allTasks.filter(t => t.id !== activeTask.id).map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Focus Anchor to Calendar */}
          <div className="space-y-3">
            <h5 className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Calendar Sync</h5>
            {hasSchedule ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex gap-2.5 items-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <div>
                  <p className="font-bold font-mono uppercase text-[9px]">Schedules Allocated</p>
                  <p className="text-[10px] text-zinc-500 mt-0.5 font-medium">Focus blocks synced to your Chrono Focus Calendar.</p>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-zinc-900/30 border border-zinc-850 rounded-xl space-y-3">
                <p className="text-zinc-400 font-medium leading-relaxed">
                  This task has no assigned calendar slots. Auto-schedule an optimal morning slot.
                </p>
                <Button
                  size="sm"
                  onClick={() => onAutoSchedule(activeTask)}
                  className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-200 border border-zinc-800 text-[9px] uppercase font-mono tracking-wider gap-2 h-8"
                >
                  <Calendar className="w-3.5 h-3.5 text-violet-400" /> Auto-Schedule Focus Slot
                </Button>
              </div>
            )}
          </div>

          {/* File Attachments */}
          <div className="space-y-3">
            <h5 className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Resource Vault</h5>
            
            <div 
              onDragOver={handleDragOver}
              onDrop={onFileDrop}
              className="border border-dashed border-zinc-800 hover:border-violet-500/30 rounded-xl p-4 text-center cursor-pointer transition-colors relative"
            >
              <input 
                type="file" 
                onChange={onFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <Paperclip className="w-5 h-5 text-zinc-500 mx-auto mb-1 animate-bounce" />
              <p className="font-bold text-zinc-300">Drag files here or click to upload</p>
              <p className="text-[9px] text-zinc-500 mt-0.5">Supports PDF, JSON, DOCX or ZIP up to 50MB</p>
            </div>

            {taskAttachments.length > 0 && (
              <div className="space-y-2">
                {taskAttachments.map(att => (
                  <div 
                    key={att.id} 
                    className="flex items-center justify-between p-2.5 bg-zinc-900/30 border border-zinc-850 rounded-lg"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Paperclip className="w-3.5 h-3.5 text-violet-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-200 truncate">{att.name}</p>
                        <p className="text-[9px] text-zinc-500 font-mono mt-0.5">{att.size} • {att.date}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteAttachment(activeTask.id, att.id)}
                      className="p-1 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Editable Notes Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-1">
              <h5 className="text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">Markdown Notes</h5>
              {!isEditingNotes ? (
                <button
                  type="button"
                  onClick={() => {
                    setTempNotes(activeTask.notes || '');
                    setIsEditingNotes(true);
                  }}
                  className="text-violet-400 hover:text-violet-300 font-mono text-[9px] uppercase font-bold"
                >
                  Edit Notes
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(false)}
                    className="text-zinc-500 hover:text-zinc-400 font-mono text-[9px] uppercase font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="text-emerald-400 hover:text-emerald-300 font-mono text-[9px] uppercase font-bold"
                  >
                    Save
                  </button>
                </div>
              )}
            </div>

            {!isEditingNotes ? (
              <pre className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl font-mono leading-relaxed overflow-x-auto text-zinc-300 whitespace-pre-wrap max-h-40 min-h-12">
                {activeTask.notes || 'No custom notes loaded. Click edit to log parameters.'}
              </pre>
            ) : (
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                rows={4}
                className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-xs focus:outline-none focus:ring-1 focus:ring-violet-500/50"
              />
            )}
          </div>

          {/* Activity Timeline */}
          <div className="space-y-3">
            <h5 className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Task History</h5>
            <div className="relative pl-5 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-4 text-xs">
              <div className="relative">
                <span className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-zinc-100 dark:border-zinc-950" />
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">Task Created</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Task successfully added to your productivity list.</p>
                </div>
              </div>
              <div className="relative">
                <span className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full border-2 border-zinc-100 dark:border-zinc-950 ${
                  activeTask.subtasks && activeTask.subtasks.length > 0 ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'
                }`} />
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">Subtasks Configured</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Task broken down into actionable checkbox steps.</p>
                </div>
              </div>
              <div className="relative">
                <span className={`absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full border-2 border-zinc-100 dark:border-zinc-950 ${
                  hasSchedule ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'
                }`} />
                <div>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200">Calendar Scheduled</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Scheduled in your custom focus window.</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Drawer Footer Actions */}
        <div className="pt-4 border-t border-zinc-800 grid grid-cols-2 gap-3.5">
          <Button
            onClick={() => onStartFocus(activeTask)}
            className="py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-mono font-bold uppercase tracking-wider text-[10px] gap-1.5 border-none shadow-lg shadow-violet-600/15 h-10"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Launch Focus Room
          </Button>
          <Button
            onClick={() => onPanic(activeTask)}
            className="py-2.5 bg-red-650 hover:bg-red-700 text-white font-mono font-bold uppercase tracking-wider text-[10px] gap-1.5 border-none shadow-lg shadow-red-650/15 h-10 dark:bg-red-650"
          >
            <Flame className="w-3.5 h-3.5 animate-pulse" /> Trigger Panic Mode
          </Button>
        </div>
      </motion.div>
    </>
  );
};

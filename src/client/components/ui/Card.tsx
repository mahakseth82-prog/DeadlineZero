/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'panic' | 'ambient';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  ...props
}) => {
  const styles = {
    default: 'bg-white/90 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/70 shadow-sm dark:shadow-[0_4px_20px_rgba(0,0,0,0.2)] rounded-2xl p-6 transition-all',
    outline: 'border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6',
    panic: 'bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 shadow-lg rounded-2xl p-6',
    ambient: 'bg-slate-50/80 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 rounded-2xl p-6',
  };

  const interactiveStyle = interactive 
    ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-500/40 dark:hover:border-indigo-500/40 cursor-pointer' 
    : '';

  return (
    <div className={`${styles[variant]} ${interactiveStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

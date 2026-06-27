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
    default: 'bg-white/80 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-250/50 dark:border-zinc-800/60 shadow-lg shadow-zinc-950/5 dark:shadow-zinc-950/20 rounded-2xl p-6',
    outline: 'border border-zinc-250/50 dark:border-zinc-800/60 rounded-2xl p-6',
    panic: 'bg-red-50/60 border border-red-150/60 shadow-lg shadow-red-950/5 dark:shadow-red-950/20 rounded-2xl p-6 dark:bg-red-950/20 dark:border-red-900/30 animate-pulse',
    ambient: 'bg-zinc-50/60 dark:bg-zinc-900/35 backdrop-blur-md border border-zinc-250/40 dark:border-zinc-800/60 shadow-inner rounded-2xl p-6',
  };

  const interactiveStyle = interactive 
    ? 'transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-violet-500 dark:hover:border-violet-500 cursor-pointer' 
    : '';

  return (
    <div className={`${styles[variant]} ${interactiveStyle} ${className}`} {...props}>
      {children}
    </div>
  );
};

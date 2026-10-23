/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none tracking-tight';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-sm hover:shadow border border-indigo-500/30 focus:ring-indigo-500 dark:focus:ring-offset-slate-900',
    secondary: 'bg-slate-100 hover:bg-slate-200/90 text-slate-800 border border-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 dark:text-slate-100 dark:border-slate-700/60 focus:ring-slate-400 dark:focus:ring-offset-slate-900',
    outline: 'border border-slate-300 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 focus:ring-slate-400 dark:focus:ring-offset-slate-900',
    ghost: 'hover:bg-slate-100/80 text-slate-600 dark:hover:bg-slate-800/60 dark:text-slate-300 focus:ring-slate-400 dark:focus:ring-offset-slate-900',
    danger: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm focus:ring-rose-500 dark:focus:ring-offset-slate-900',
    accent: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm hover:shadow border border-indigo-500/30 focus:ring-indigo-500 dark:focus:ring-offset-slate-900',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5',
  };

  return (
    <button
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

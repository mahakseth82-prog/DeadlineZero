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
  const baseStyle = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 hover:scale-[1.03] active:scale-95 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shimmer-sweep';
  
  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] hover:bg-right text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-md focus:ring-violet-500 border-none',
    secondary: 'bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 hover:border-violet-500/40 focus:ring-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-800 dark:text-zinc-100 dark:border-zinc-800 dark:hover:border-violet-500/30 hover:shadow-[0_0_8px_rgba(139,92,246,0.08)]',
    outline: 'border border-zinc-200 hover:bg-zinc-50 hover:border-violet-500/40 text-zinc-700 focus:ring-zinc-200 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-300 dark:hover:border-violet-500/30 hover:shadow-[0_0_8px_rgba(139,92,246,0.08)]',
    ghost: 'hover:bg-zinc-50/50 text-zinc-600 focus:ring-zinc-100 dark:hover:bg-zinc-800/50 dark:text-zinc-400',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
    accent: 'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] hover:bg-right text-white hover:shadow-[0_0_15px_rgba(139,92,246,0.3)] shadow-md focus:ring-violet-500 border-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
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

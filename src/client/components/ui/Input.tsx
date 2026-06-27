/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className = '',
  ...props
}) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
          {label}
        </label>
      )}
      <input
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent dark:bg-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100 dark:text-white ${
          error
            ? 'border-red-500 focus:ring-red-500'
            : 'border-zinc-200 hover:border-zinc-300 dark:hover:border-zinc-700'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-500 font-medium">{error}</span>}
      {!error && helperText && (
        <span className="text-xs text-zinc-400">{helperText}</span>
      )}
    </div>
  );
};

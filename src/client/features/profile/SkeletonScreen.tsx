import React from 'react';

export const SkeletonScreen: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 text-left animate-pulse p-4">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.04] pb-6">
        <div className="space-y-2.5">
          <div className="h-8 w-64 bg-zinc-800/40 rounded-xl" />
          <div className="h-4 w-96 bg-zinc-800/20 rounded-xl" />
        </div>
        <div className="h-8 w-36 bg-zinc-800/40 rounded-xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column Skeleton */}
        <div className="space-y-6 lg:col-span-1">
          {/* Hero Profile Skeleton */}
          <div className="border border-white/[0.04] bg-zinc-900/10 rounded-3xl p-6 flex flex-col items-center space-y-4">
            <div className="w-24 h-24 rounded-full bg-zinc-800/40" />
            <div className="h-5 w-40 bg-zinc-800/40 rounded-xl" />
            <div className="h-3 w-48 bg-zinc-800/20 rounded-xl" />
            <div className="h-7 w-32 bg-zinc-800/30 rounded-full" />
            <div className="w-full h-10 bg-zinc-800/20 rounded-xl" />
            <div className="w-full h-12 bg-zinc-800/30 rounded-xl" />
          </div>

          {/* Cognitive Profile Skeleton */}
          <div className="border border-white/[0.04] bg-zinc-900/10 rounded-3xl p-5 space-y-3">
            <div className="h-4 w-48 bg-zinc-800/40 rounded-lg" />
            <div className="h-12 w-full bg-zinc-800/20 rounded-lg" />
          </div>

          {/* Productivity DNA Skeleton */}
          <div className="border border-white/[0.04] bg-zinc-900/10 rounded-3xl p-5 space-y-4">
            <div className="h-4 w-40 bg-zinc-800/40 rounded-lg" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-zinc-800/25 rounded-xl" />
              ))}
            </div>
          </div>
        </div>

        {/* Middle/Right Column Skeleton */}
        <div className="space-y-6 lg:col-span-2">
          {/* Account Details Skeleton */}
          <div className="border border-white/[0.04] bg-zinc-900/10 rounded-3xl p-6 space-y-5">
            <div className="flex justify-between">
              <div className="h-5 w-52 bg-zinc-800/40 rounded-lg" />
              <div className="h-6 w-32 bg-zinc-800/30 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-10 bg-zinc-800/25 rounded-lg" />
              ))}
            </div>
            <div className="h-12 w-full bg-zinc-800/20 rounded-lg" />
          </div>

          {/* Personality Diagnostics Skeleton */}
          <div className="border border-white/[0.04] bg-zinc-900/10 rounded-3xl p-5 space-y-3">
            <div className="h-4 w-52 bg-zinc-800/40 rounded-lg" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-16 bg-zinc-800/25 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Statistics Grid Skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-zinc-800/20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

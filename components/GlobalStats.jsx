import React from 'react';
import { Flame, UserX, Loader2 } from 'lucide-react';

export default function GlobalStats({ t, isFetchingGlobalStats, platformStats }) {
  return (
    <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 space-y-4 sm:space-y-6 shadow-xl">
      <h3 className="font-display text-lg sm:text-xl font-bold text-white">{t.statsTitle}</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] uppercase text-neutral-500 block mb-1.5 font-bold font-mono">{t.totalSupplyLabel || "Total Supply"}</span>
          <span className="text-base sm:text-xl font-extrabold font-mono text-purple-400 flex items-center gap-1.5">
            {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : (platformStats.supply / 1000000).toFixed(2)}
            {!isFetchingGlobalStats && <span className="text-[9px] sm:text-[10px] text-neutral-500">M</span>}
          </span>
        </div>

        <div className="bg-[#05030F] border border-red-900/20 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col justify-center shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]">
          <span className="text-[9px] sm:text-[10px] uppercase text-red-500 block mb-1.5 font-bold font-mono">{t.totalBurnedLabel}</span>
          <span className="text-base sm:text-xl font-extrabold font-mono text-red-400 flex items-center gap-1.5">
            {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4" />} 
            {platformStats.burned.toFixed(2)}
          </span>
        </div>

        <div className="bg-[#05030F] border border-cyan-900/20 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col justify-center shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]">
          <span className="text-[9px] sm:text-[10px] uppercase text-cyan-500 block mb-1.5 font-bold font-mono">{t.activeCapsulesLabel || "Total Capsules"}</span>
          <span className="text-base sm:text-xl font-extrabold font-mono text-cyan-400 flex items-center gap-1.5">
            {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : platformStats.capsules} 
            {!isFetchingGlobalStats && <span className="text-[9px] sm:text-[10px] text-neutral-500">{t.unit}</span>}
          </span>
        </div>

        <div className="bg-[#05030F] border border-neutral-900 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex flex-col justify-center">
          <span className="text-[9px] sm:text-[10px] uppercase text-neutral-500 block mb-1.5 font-bold font-mono">{t.totalUsersLabel || "Active Users"}</span>
          <span className="text-base sm:text-xl font-extrabold font-mono text-white flex items-center gap-1.5">
            {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserX className="w-4 h-4" />} 
            {platformStats.users}
          </span>
        </div>
      </div>
    </div>
  );
}
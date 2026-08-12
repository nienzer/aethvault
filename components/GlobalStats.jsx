import React from 'react';
import { Flame, UserX, Users, Loader2, Database, ShieldCheck, Award, Blocks } from 'lucide-react';

export default function GlobalStats({ t = {}, isFetchingGlobalStats, platformStats, stakingGlobalStats }) {

  const totalSupply = platformStats?.supply || 0;
  const burned = platformStats?.burned || 0;
  const burnPercentage = totalSupply > 0 ? ((burned / totalSupply) * 100).toFixed(4) : "0.00";

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 font-sans">
      
      {/* HEADER SECTION */}
      <div className="bg-gradient-to-br from-[#0B0817] via-[#05030F] to-[#0A0713] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="space-y-6 flex-1 z-10">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">{t.title || "Protocol Statistics"}</h3>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)]">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
               <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">{t.networkHealthy || "Network Healthy"}</span>
            </div>
          </div>
          
          {/* STATS BARS (Supply & Burn) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#030208] border border-neutral-800/80 p-4 rounded-2xl shadow-inner">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.totalSupply || "Total Supply"}</span>
                 <Database className="w-4 h-4 text-yellow-500" />
               </div>
               <div className="text-xl font-black text-white font-mono">
                 {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin"/> : (totalSupply / 1000000).toLocaleString() + "M AETH"}
               </div>
               <div className="w-full h-1 bg-neutral-900 mt-3 rounded-full overflow-hidden">
                 <div className="h-full bg-yellow-500 w-full"></div>
               </div>
            </div>

            <div className="bg-[#030208] border border-neutral-800/80 p-4 rounded-2xl shadow-inner">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.burn || "Deflationary Burn"}</span>
                 <Flame className="w-4 h-4 text-red-500" />
               </div>
               <div className="flex items-end justify-between">
                 <div className="text-xl font-black text-white font-mono">
                   {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin"/> : burned.toLocaleString()}
                 </div>
                 <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{burnPercentage}%</span>
               </div>
               <div className="w-full h-1 bg-neutral-900 mt-3 rounded-full overflow-hidden flex">
                 <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" style={{ width: `${Math.max(Number(burnPercentage), 2)}%` }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC GRIDS (Aman - Hanya membaca props) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Capsules */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-cyan-500/50 hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">{t.capsules || "Capsules"}</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : platformStats?.capsules?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="mt-3">
             <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">{t.immutable || "Immutable"}</span>
          </div>
        </div>

        {/* Wallets */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-green-500/50 hover:shadow-[0_10px_20px_-10px_rgba(34,197,94,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">{t.wallets || "Active Wallets"}</span>
            <UserX className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : platformStats?.users?.toLocaleString() || "0"}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
             <span className="text-[9px] font-mono text-neutral-500 uppercase">{t.tracked || "Tracked"}</span>
          </div>
        </div>

        {/* Staked TVL */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-blue-500/50 hover:shadow-[0_10px_20px_-10px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">{t.tvl || "Staked TVL"}</span>
            <Database className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl sm:text-2xl font-black font-mono text-white">
              {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                (stakingGlobalStats?.totalStaked || 0) > 1000000 
                  ? ((stakingGlobalStats?.totalStaked || 0) / 1000000).toFixed(2) + "M"
                  : (stakingGlobalStats?.totalStaked || 0).toFixed(2)}
            </span>
          </div>
          <div className="mt-3">
             <span className="text-[9px] font-mono text-blue-400">{t.locked || "Total $AETH"}</span>
          </div>
        </div>

        {/* Stakers */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-pink-500/50 hover:shadow-[0_10px_20px_-10px_rgba(236,72,153,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">{t.stakers || "Total Stakers"}</span>
            <Users className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : (stakingGlobalStats?.stakers || 0).toLocaleString()}
            </span>
          </div>
          <div className="mt-3">
             <span className="text-[9px] font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">{t.active || "Active"}</span>
          </div>
        </div>

        {/* Network Panel */}
        <div className="col-span-2 lg:col-span-4 bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-white/40 hover:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-800/50 pb-3">
            <span className="text-[9px] sm:text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest flex items-center gap-1.5 sm:gap-2 truncate pr-2">
              <Blocks className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white shrink-0"/> 
              <span className="truncate">{t.height || "Binance Smart Chain"}</span>
            </span>
            <div className="flex items-center gap-1.5 sm:gap-2 bg-neutral-900 border border-neutral-700 px-2 py-1 rounded shadow-inner shrink-0">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
               <span className="text-[9px] sm:text-[10px] font-bold text-white tracking-widest uppercase">{t.liveSync || "Live Sync"}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <div className="w-full text-center">
              <span className="text-[10px] text-cyan-500 font-mono mt-1 w-full bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-md inline-block">Global Blockchain Metrics Synchronized</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
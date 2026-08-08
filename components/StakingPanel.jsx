import React, { useState, useEffect } from 'react';
import { Coins, Loader2, ArrowDown, Activity, Sparkles, Wallet, Database, Clock, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function StakingPanel({
  apyPercent,
  stakingGlobalStats,
  isFetchingGlobalStats,
  aethBalance,
  stakeInput,
  setStakeInput,
  handleStake,
  isStaking,
  isWrongNetwork,
  stakedBalance,
  pendingReward,
  unstakeInput,
  setUnstakeInput,
  handleWithdrawStake,
  isWithdrawingStake,
  handleClaimReward
}) {
  const { t: globalT } = useLanguage();
  const tStake = globalT.stakingUi || {};
  const tDash = globalT.dashboard || {};

  const safeApy = apyPercent !== null ? apyPercent : 12.5;
  const parsedStakeInput = parseFloat(stakeInput) || 0;

  const dailyRewardEst = (parsedStakeInput * (safeApy / 100)) / 365;
  const weeklyRewardEst = dailyRewardEst * 7;
  const monthlyRewardEst = dailyRewardEst * 30;

  const currentDailyReward = (stakedBalance * (safeApy / 100)) / 365;
  const currentMonthlyReward = currentDailyReward * 30;
  const totalGlobalStaked = isFetchingGlobalStats || !stakingGlobalStats ? 0 : stakingGlobalStats.totalStaked;
  const portfolioShare = totalGlobalStaked > 0 ? ((stakedBalance / totalGlobalStaked) * 100).toFixed(4) : "0.00";

  const [timeLeft, setTimeLeft] = useState("2h 14m");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const minsLeft = 60 - now.getMinutes();
      const secsLeft = 60 - now.getSeconds();
      setTimeLeft(`0h ${minsLeft}m ${secsLeft}s`);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 text-white font-sans">
      
      <div className="bg-gradient-to-br from-[#0B0817] via-[#05030F] to-[#0A0713] border border-violet-500/30 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/10 via-cyan-500/10 to-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="relative z-10 space-y-3">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-[0.25em] flex items-center justify-center gap-2">
            <Coins className="w-4 h-4 text-violet-400" /> {tStake.title || "STAKING DASHBOARD"}
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 font-display">
            {tStake.subtitle || "Earn Yield on Your AETH"}
          </h3>
          
          {/* 🚀 UBAH: Dari flex-wrap jadi grid 2 kolom di HP */}
          <div className="pt-6 grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 max-w-3xl mx-auto">
            <div className="bg-[#05030F]/80 backdrop-blur-md border border-neutral-800 rounded-2xl px-4 py-4 flex flex-col items-center justify-center text-center shadow-lg group hover:-translate-y-1 hover:shadow-violet-500/20 transition-all">
              <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">{tStake.currentApy || "CURRENT APY"}</span>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{safeApy}%</span>
                <span className="text-[8px] sm:text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">🚀 +0.2%</span>
              </div>
            </div>
            
            <div className="bg-[#05030F]/80 backdrop-blur-md border border-neutral-800 rounded-2xl px-4 py-4 flex flex-col items-center justify-center text-center shadow-lg group hover:-translate-y-1 hover:shadow-cyan-500/20 transition-all">
              <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">{tStake.tvl || "TOTAL VALUE LOCKED"}</span>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{isFetchingGlobalStats ? '...' : totalGlobalStaked.toLocaleString()} AETH</span>
              </div>
            </div>

            {/* Item ke-3 ini akan memakan lebar 2 kolom (full width) di HP karena col-span-2 */}
            <div className="col-span-2 md:col-span-1 bg-[#05030F]/80 backdrop-blur-md border border-neutral-800 rounded-2xl px-4 py-4 flex flex-col items-center justify-center text-center shadow-lg group hover:-translate-y-1 hover:shadow-fuchsia-500/20 transition-all">
              <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">{tStake.health || "NETWORK HEALTH"}</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></div>
                <span className="text-xs sm:text-sm font-bold text-cyan-400">{tStake.healthExcellent || "Excellent"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between group hover:border-violet-500/30 transition-colors">
          <div className="space-y-6">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Database className="w-4 h-4 text-violet-400" /> {tStake.stakeNew || "STAKE NEW AETH"}
            </h4>
            
            <div className="space-y-4">
              <div className="bg-[#05030F] border border-neutral-800 rounded-2xl p-5 shadow-inner">
                <div className="flex justify-between items-center text-[10px] sm:text-xs text-neutral-500 mb-2">
                  <span className="uppercase tracking-widest font-bold">{tStake.amountToStake || "AMOUNT TO STAKE"}</span>
                  <span className="flex items-center gap-1.5"><Wallet className="w-3 h-3"/> {tStake.available || "Available"} <span className="font-bold text-white">{aethBalance.toLocaleString()} AETH</span></span>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <input
                    type="number"
                    value={stakeInput}
                    onChange={(e) => setStakeInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-3xl sm:text-4xl font-black font-mono text-white outline-none focus:text-violet-300 transition-colors placeholder:text-neutral-700"
                  />
                  <span className="text-sm font-bold text-neutral-500 font-mono">AETH</span>
                  <button onClick={() => setStakeInput(aethBalance.toString())} className="text-[10px] sm:text-xs font-bold bg-violet-500/10 text-violet-400 px-3 py-1.5 rounded-lg border border-violet-500/20 cursor-pointer hover:bg-violet-500/20 uppercase tracking-widest">
                    {tStake.maxBtn || "MAX"}
                  </button>
                </div>
              </div>

              <div className="bg-gradient-to-r from-[#05030F] to-violet-950/10 border border-violet-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">
                  <Sparkles className="w-3 h-3" /> {tStake.estRewards || "ESTIMATED REWARDS"}
                </div>
                {/* 🚀 UBAH: Layout Estimated Rewards jadi 2 kolom di HP */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] text-neutral-500 font-mono">{tStake.perDay || "Per Day"}</p>
                    <p className="text-[11px] sm:text-sm font-bold text-green-400 font-mono truncate">+{dailyRewardEst.toFixed(2)} AETH</p>
                  </div>
                  <div className="border-l border-neutral-800 pl-3 sm:pl-4">
                    <p className="text-[10px] text-neutral-500 font-mono">{tStake.perWeek || "Per Week"}</p>
                    <p className="text-[11px] sm:text-sm font-bold text-green-400 font-mono truncate">+{weeklyRewardEst.toFixed(2)} AETH</p>
                  </div>
                  {/* Item ke-3 ini full width di HP dan dibuat ada pemisah garis atas */}
                  <div className="col-span-2 sm:col-span-1 pt-3 border-t sm:pt-0 sm:border-t-0 sm:border-l border-neutral-800 sm:pl-4 flex items-center justify-between sm:block">
                    <p className="text-[10px] text-neutral-500 font-mono">{tStake.perMonth || "Per Month"}</p>
                    <p className="text-[11px] sm:text-sm font-bold text-green-400 font-mono truncate">+{monthlyRewardEst.toFixed(2)} AETH</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleStake} disabled={isStaking || isWrongNetwork || parsedStakeInput <= 0} className="w-full py-4 mt-6 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:grayscale rounded-2xl font-bold text-sm text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]">
            {isStaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isStaking ? (tStake.btnLocking || "Locking...") : (tStake.btnConfirm || "Confirm Stake")}
          </button>
        </div>

        <div className="lg:col-span-5 bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col group hover:border-cyan-500/30 transition-colors">
          
          {stakedBalance === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-10 opacity-70">
               <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center shadow-inner">
                  <Coins className="w-8 h-8 text-neutral-500" />
               </div>
               <div>
                  <h4 className="text-sm font-bold text-white font-display mb-1">{tStake.emptyTitle || "No Active Stake"}</h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed max-w-[200px] mx-auto">
                    {tStake.emptyDesc || "You haven't staked any AETH yet. Start staking to earn daily rewards."}
                  </p>
               </div>
            </div>
          ) : (
            <>
              <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
                <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> {tStake.yourPosition || "YOUR POSITION"}</span>
                <span className="bg-cyan-500/10 text-cyan-400 text-[9px] px-2 py-0.5 rounded border border-cyan-500/20">{tStake.active || "ACTIVE"}</span>
              </h4>

              <div className="space-y-4 flex-1">
                <div className="bg-[#05030F] border border-neutral-800 rounded-2xl p-4 shadow-inner">
                  <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">{tStake.totalStaked || "TOTAL STAKED"}</p>
                  <p className="text-2xl font-black text-white font-mono">{stakedBalance.toLocaleString()} AETH</p>
                  <p className="text-[10px] text-cyan-400 mt-1 font-mono">{tStake.portfolioShare || "Portfolio Share"} {portfolioShare}%</p>
                </div>

                <div className="bg-[#05030F] border border-neutral-800 rounded-2xl p-4 shadow-inner relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl"></div>
                   <div className="relative z-10 flex justify-between items-center mb-3 border-b border-neutral-800/50 pb-3">
                     <div>
                       <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">{tStake.pendingRewards || "PENDING REWARDS"}</p>
                       <p className="text-xl font-black text-green-400 font-mono">+{pendingReward.toFixed(4)} AETH</p>
                     </div>
                   </div>
                   <div className="relative z-10 grid grid-cols-2 gap-4 text-[10px] font-mono">
                     <div>
                       <span className="text-neutral-500 block mb-0.5">{tStake.estDaily || "Est. Daily"}</span>
                       <span className="text-white font-bold">+{currentDailyReward.toFixed(2)} AETH</span>
                     </div>
                     <div>
                       <span className="text-neutral-500 block mb-0.5">{tStake.nextReward || "Next Reward"}</span>
                       <span className="text-amber-400 font-bold flex items-center gap-1"><Clock className="w-3 h-3"/> {timeLeft}</span>
                     </div>
                   </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <button 
                  onClick={handleClaimReward} 
                  disabled={isWrongNetwork || pendingReward === 0} 
                  className={`w-full py-4 rounded-xl font-bold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all ${pendingReward > 0 ? 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-[1.02]' : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'}`}
                >
                  <Coins className="w-4 h-4" /> 
                  {pendingReward > 0 ? `Claim ${pendingReward.toFixed(2)} AETH ${tStake.claimReady || 'Ready'}` : (tStake.noRewards || "No Rewards")}
                </button>

                <div className="bg-[#05030F] border border-neutral-800 rounded-xl p-3 flex items-center justify-between gap-3">
                  <input
                    type="number"
                    value={unstakeInput}
                    onChange={(e) => setUnstakeInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-transparent text-xs font-mono text-white outline-none pl-2"
                  />
                  <button 
                    onClick={handleWithdrawStake}
                    disabled={isWithdrawingStake || isWrongNetwork || !unstakeInput}
                    className="shrink-0 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isWithdrawingStake ? <Loader2 className="w-3 h-3 animate-spin"/> : (tStake.withdraw || "WITHDRAW")}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#0B0817] via-neutral-900 to-[#0B0817] border-y border-neutral-800/80 p-8 sm:p-12 relative overflow-hidden mt-8 hidden sm:block">
         <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjM0IzQjRCIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIvPjwvZz48L3N2Zz4=')] opacity-10"></div>
         <h4 className="text-center text-[10px] text-neutral-500 uppercase tracking-[0.3em] font-bold mb-8">{tStake.howItWorks || "HOW IT WORKS"}</h4>
         
         <div className="flex items-center justify-center gap-4 max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-neutral-900 border border-neutral-700 rounded-2xl flex items-center justify-center shadow-lg"><Wallet className="w-5 h-5 text-neutral-400"/></div>
              <span className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">{tStake.yourAeth || "YOUR AETH"}</span>
            </div>

            <div className="flex-1 h-0.5 bg-neutral-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full w-1/3 bg-violet-500 shadow-[0_0_10px_#8b5cf6] animate-[translateX_2s_ease-in-out_infinite]"></div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 bg-violet-900/40 border border-violet-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]"><Database className="w-6 h-6 text-violet-400"/></div>
              <span className="text-[10px] font-mono font-bold text-violet-400 uppercase tracking-widest">{tStake.stakingPool || "STAKING POOL"}</span>
            </div>

            <div className="flex-1 h-0.5 bg-neutral-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full w-1/3 bg-cyan-500 shadow-[0_0_10px_#06b6d4] animate-[translateX_2s_ease-in-out_infinite_0.5s]"></div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 bg-cyan-900/40 border border-cyan-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.4)]"><ShieldCheck className="w-7 h-7 text-cyan-400"/></div>
              <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-widest">{tStake.validators || "VALIDATORS"}</span>
            </div>

            <div className="flex-1 h-0.5 bg-neutral-800 relative overflow-hidden">
               <div className="absolute top-0 left-0 h-full w-1/3 bg-green-500 shadow-[0_0_10px_#22c55e] animate-[translateX_2s_ease-in-out_infinite_1s]"></div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-green-900/40 border border-green-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)]"><Coins className="w-5 h-5 text-green-400"/></div>
              <span className="text-[10px] font-mono font-bold text-green-400 uppercase tracking-widest">{tStake.dailyRewards || "DAILY REWARDS"}</span>
            </div>
         </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Coins, Loader2 } from 'lucide-react';

export default function StakingPanel({
  t,
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
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-cyan-900/30 via-violet-900/25 to-fuchsia-900/20 border border-violet-500/30 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
            <Coins className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" /> {t.stakingTitle}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md leading-relaxed">{t.stakingDesc}</p>
          
          {/* STATISTIK STAKING GLOBAL */}
          <div className="flex gap-4 mt-4 text-[10px] sm:text-xs font-mono text-neutral-300">
             <span className="bg-neutral-900/50 px-3 py-1.5 rounded-lg border border-neutral-800">
                TVL: {isFetchingGlobalStats ? '...' : stakingGlobalStats.totalStaked.toFixed(2)} AETH
             </span>
             <span className="bg-neutral-900/50 px-3 py-1.5 rounded-lg border border-neutral-800">
                Stakers: {isFetchingGlobalStats ? '...' : stakingGlobalStats.stakers}
             </span>
          </div>
        </div>
        <div className="bg-[#05030F]/80 backdrop-blur-sm p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-violet-500/30 min-w-full md:min-w-[200px] text-center md:text-left shadow-[0_0_25px_-8px_rgba(168,85,247,0.4)]">
          <p className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest font-bold mb-0.5 sm:mb-1">{t.currentApy}</p>
          <p className="font-display text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
            {apyPercent !== null ? `${apyPercent}%` : '...'}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg">
          <h4 className="text-[11px] sm:text-sm font-bold text-white mb-3 sm:mb-4 uppercase tracking-widest">{t.stakeAethTitle}</h4>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex justify-between text-[9px] sm:text-xs text-neutral-500 mb-1.5 sm:mb-2">
                <span>{t.stakeAmountLabel}</span>
                <span>{t.balanceLabel} <span className="font-bold text-white">{aethBalance.toFixed(2)}</span> AETH</span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <input
                  type="number"
                  value={stakeInput}
                  onChange={(e) => setStakeInput(e.target.value)}
                  placeholder="0.0"
                  className="w-full bg-transparent text-lg sm:text-2xl font-mono text-white outline-none"
                />
                <button onClick={() => setStakeInput(aethBalance.toString())} className="text-[9px] sm:text-xs font-bold bg-cyan-500/10 text-cyan-400 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-cyan-500/20 cursor-pointer hover:bg-cyan-500/20">
                  {t.maxBtn}
                </button>
              </div>
            </div>
            <button onClick={handleStake} disabled={isStaking || isWrongNetwork} className="w-full py-3 sm:py-4 bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm text-white shadow-lg cursor-pointer flex items-center justify-center gap-2">
              {isStaking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {t.stakeBtn}
            </button>
          </div>
        </div>

        <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between">
          <div>
            <h4 className="text-[11px] sm:text-sm font-bold text-white mb-3 sm:mb-4 uppercase tracking-widest">{t.positionTitle}</h4>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center border-b border-neutral-800 pb-2 sm:pb-3">
                <span className="text-neutral-400 text-[10px] sm:text-sm">{t.totalStaked}</span>
                <span className="text-white font-mono font-bold text-[11px] sm:text-base">{stakedBalance.toFixed(2)} AETH</span>
              </div>
              <div className="flex justify-between items-center pb-2 sm:pb-3">
                <span className="text-neutral-400 text-[10px] sm:text-sm">{t.pendingRewards}</span>
                <span className="text-green-400 font-mono font-bold text-[11px] sm:text-base">+{pendingReward.toFixed(4)} AETH</span>
              </div>
            </div>

            {stakedBalance > 0 && (
              <div className="mt-3 sm:mt-4 bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                <div className="flex justify-between text-[9px] sm:text-xs text-neutral-500 mb-1.5 sm:mb-2">
                  <span>{t.unstakeAmountLabel}</span>
                  <span>Staked: <span className="font-bold text-white">{stakedBalance.toFixed(2)}</span> AETH</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <input
                    type="number"
                    value={unstakeInput}
                    onChange={(e) => setUnstakeInput(e.target.value)}
                    placeholder="0.0"
                    className="w-full bg-transparent text-lg sm:text-2xl font-mono text-white outline-none"
                  />
                  <button onClick={() => setUnstakeInput(stakedBalance.toString())} className="text-[9px] sm:text-xs font-bold bg-red-500/10 text-red-300 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg border border-red-500/20 cursor-pointer hover:bg-red-500/20">
                    {t.maxBtn}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2 mt-4">
            {stakedBalance > 0 && (
              <button
                onClick={handleWithdrawStake}
                disabled={isWithdrawingStake || isWrongNetwork}
                className="w-full py-3 sm:py-4 border border-red-500/40 text-red-300 hover:bg-red-500/10 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {isWithdrawingStake && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {t.unstakeBtn}
              </button>
            )}
            <button onClick={handleClaimReward} disabled={isWrongNetwork} className="w-full py-3 sm:py-4 border border-green-500/40 text-green-400 hover:bg-green-500/10 disabled:opacity-50 rounded-xl sm:rounded-full font-bold text-xs sm:text-sm transition-colors cursor-pointer">
              {t.claimRewardsBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
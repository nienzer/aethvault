import React, { useState, useEffect } from 'react';
import { Coins, Loader2, Activity, Sparkles, Wallet, Database, Clock, ShieldCheck, AlertTriangle, Lock, Unlock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function StakingPanel({
  // Props Global/Statistik
  stakingGlobalStats,
  isFetchingGlobalStats,
  aethBalance,
  isConnected,

  // Props untuk Stake Baru
  stakeInput,
  setStakeInput,
  handleStake, 
  isStaking,
  isWrongNetwork,

  // Props Data User (BERUBAH UNTUK V6)
  totalUserStaked, 
  pendingReward,   
  userDeposits,    

  // Props Aksi Withdraw & Claim
  handleWithdrawStake,       
  handleEmergencyWithdraw,   
  isWithdrawingStake,
  handleClaimReward
}) {
  const { t: globalT } = useLanguage();
  const tStake = globalT.stakingUi || {};

  // ==========================================
  // KONFIGURASI TIER V6
  // ==========================================
  const TIERS = [
    { id: 0, name: "Flexible", apy: 4, lockDays: 0, color: "text-cyan-400", border: "border-cyan-500/30", bg: "bg-cyan-500/10" },
    { id: 1, name: "Bronze", apy: 8, lockDays: 30, color: "text-amber-500", border: "border-amber-500/30", bg: "bg-amber-500/10" },
    { id: 2, name: "Silver", apy: 14, lockDays: 180, color: "text-neutral-300", border: "border-neutral-400/30", bg: "bg-neutral-400/10" },
    { id: 3, name: "Gold", apy: 20, lockDays: 365, color: "text-yellow-400", border: "border-yellow-400/30", bg: "bg-yellow-400/10" }
  ];

  const [selectedTier, setSelectedTier] = useState(0);

  // Kalkulasi Estimasi Berdasarkan Tier Terpilih
  const parsedStakeInput = parseFloat(stakeInput) || 0;
  const activeApy = TIERS[selectedTier].apy;
  const dailyRewardEst = (parsedStakeInput * (activeApy / 100)) / 365;
  const weeklyRewardEst = dailyRewardEst * 7;
  const monthlyRewardEst = dailyRewardEst * 30;

  const totalGlobalStaked = isFetchingGlobalStats || !stakingGlobalStats ? 0 : stakingGlobalStats.totalStaked;
  const portfolioShare = totalGlobalStaked > 0 && totalUserStaked ? ((totalUserStaked / totalGlobalStaked) * 100).toFixed(4) : "0.00";

  // Waktu real-time untuk cek status Lock
  const [currentTime, setCurrentTime] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16 text-white font-sans">

      {/* HEADER DASHBOARD STATS */}
      <div className="bg-gradient-to-br from-[#0B0817] via-[#05030F] to-[#0A0713] border border-violet-500/30 p-8 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden text-center">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-violet-500/10 via-cyan-500/10 to-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="relative z-10 space-y-3">
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-[0.25em] flex items-center justify-center gap-2">
            <Coins className="w-4 h-4 text-violet-400" /> {tStake.title || "STAKING DASHBOARD"}
          </h2>
          <h3 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-violet-400 to-fuchsia-400 font-display">
            {tStake.subtitle || "Earn Yield on Your AETH"}
          </h3>

          <div className="pt-6 grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto">
            <div className="bg-[#05030F]/80 backdrop-blur-md border border-neutral-800 rounded-2xl px-4 py-4 flex flex-col items-center justify-center text-center shadow-lg group hover:-translate-y-1 hover:shadow-violet-500/20 transition-all">
              <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">{tStake.maxApy || "MAX APY"}</span>
              <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">20%</span>
                <span className="text-[8px] sm:text-[10px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">{tStake.tierGold || "Tier Gold"}</span>
              </div>
            </div>

            <div className="bg-[#05030F]/80 backdrop-blur-md border border-neutral-800 rounded-2xl px-4 py-4 flex flex-col items-center justify-center text-center shadow-lg group hover:-translate-y-1 hover:shadow-cyan-500/20 transition-all">
              <span className="text-[9px] sm:text-[10px] text-neutral-500 uppercase font-bold tracking-widest mb-1">{tStake.tvl || "TOTAL VALUE LOCKED"}</span>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black text-white font-mono">{isFetchingGlobalStats ? '...' : totalGlobalStaked.toLocaleString()} AETH</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* PANEL KIRI: STAKE BARU (MULTI-TIER) */}
        <div className="lg:col-span-7 bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col justify-between group hover:border-violet-500/30 transition-colors">
          <div className="space-y-6">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 border-b border-neutral-800 pb-3">
              <Database className="w-4 h-4 text-violet-400" /> {tStake.stakeNew || "STAKE NEW AETH"}
            </h4>

            {/* PEMILIHAN TIER */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TIERS.map((tier) => (
                <div 
                  key={tier.id}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`cursor-pointer border rounded-xl p-3 flex flex-col items-center justify-center text-center transition-all ${selectedTier === tier.id ? `${tier.border} ${tier.bg} shadow-[0_0_15px_rgba(0,0,0,0.2)] scale-105` : 'border-neutral-800 bg-[#05030F] opacity-60 hover:opacity-100'}`}
                >
                  <span className={`text-xs font-black uppercase tracking-wider ${selectedTier === tier.id ? tier.color : 'text-neutral-400'}`}>{tier.name}</span>
                  <span className="text-lg font-bold text-white mt-1">{tier.apy}%</span>
                  <span className="text-[9px] text-neutral-500 mt-1 uppercase tracking-widest">{tier.lockDays === 0 ? (tStake.noLock || "No Lock") : `${tier.lockDays} ${tStake.days || "Days"}`}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="bg-[#05030F] border border-neutral-800 rounded-2xl p-5 shadow-inner">
                <div className="flex justify-between items-center text-[10px] sm:text-xs text-neutral-500 mb-2">
                  <span className="uppercase tracking-widest font-bold">{tStake.amountToStake || "AMOUNT TO STAKE"}</span>
                  <span className="flex items-center gap-1.5"><Wallet className="w-3 h-3"/> {tStake.available || "Available"} <span className="font-bold text-white">{aethBalance?.toLocaleString() || "0"} AETH</span></span>
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
                  <button onClick={() => setStakeInput((aethBalance || 0).toString())} className="text-[10px] sm:text-xs font-bold bg-violet-500/10 text-violet-400 px-3 py-1.5 rounded-lg border border-violet-500/20 cursor-pointer hover:bg-violet-500/20 uppercase tracking-widest">
                    {tStake.maxBtn || "MAX"}
                  </button>
                </div>
              </div>

              {/* ESTIMASI HADIAH DINAMIS */}
              <div className="bg-gradient-to-r from-[#05030F] to-violet-950/10 border border-violet-500/20 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-[10px] font-bold text-violet-400 uppercase tracking-widest mb-1">
                  <Sparkles className="w-3 h-3" /> {tStake.estRewards || `ESTIMATED REWARDS`} ({activeApy}% APY)
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div>
                    <p className="text-[10px] text-neutral-500 font-mono">{tStake.perDay || "Per Day"}</p>
                    <p className="text-[11px] sm:text-sm font-bold text-green-400 font-mono truncate">+{dailyRewardEst.toFixed(2)} AETH</p>
                  </div>
                  <div className="border-l border-neutral-800 pl-3 sm:pl-4">
                    <p className="text-[10px] text-neutral-500 font-mono">{tStake.perWeek || "Per Week"}</p>
                    <p className="text-[11px] sm:text-sm font-bold text-green-400 font-mono truncate">+{weeklyRewardEst.toFixed(2)} AETH</p>
                  </div>
                  <div className="col-span-2 sm:col-span-1 pt-3 border-t sm:pt-0 sm:border-t-0 sm:border-l border-neutral-800 sm:pl-4 flex items-center justify-between sm:block">
                    <p className="text-[10px] text-neutral-500 font-mono">{tStake.perMonth || "Per Month"}</p>
                    <p className="text-[11px] sm:text-sm font-bold text-green-400 font-mono truncate">+{monthlyRewardEst.toFixed(2)} AETH</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Teks Peringatan Max Stake */}
          {(parsedStakeInput + parseFloat(totalUserStaked || 0) > 50000) && (
            <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl mt-4 flex items-center gap-2 text-red-400 text-[11px] font-mono">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{tStake.maxLimitReached || "Maximum staking limit per wallet is 50,000 AETH."}</span>
            </div>
          )}

           <button 
            onClick={() => handleStake(selectedTier, stakeInput)} 
            disabled={!isConnected || isStaking || isWrongNetwork || parsedStakeInput <= 0 || (parsedStakeInput + parseFloat(totalUserStaked || 0) > 50000)} 
            className="w-full py-4 mt-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:grayscale rounded-2xl font-bold text-sm text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
          >
            {isStaking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
            {isStaking ? (tStake.btnLocking || "Locking...") : !isConnected ? (tStake.connectWallet || "Connect Wallet") : (tStake.btnConfirm || "Confirm Stake")}
          </button>
        </div>

        {/* PANEL KANAN: STATUS USER & DAFTAR DEPOSIT */}
        <div className="lg:col-span-5 bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col group hover:border-cyan-500/30 transition-colors">

          <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-widest flex items-center justify-between border-b border-neutral-800 pb-3 mb-5">
            <span className="flex items-center gap-2"><Activity className="w-4 h-4 text-cyan-400" /> {tStake.yourPosition || "YOUR POSITION"}</span>
            {totalUserStaked > 0 && <span className="bg-cyan-500/10 text-cyan-400 text-[9px] px-2 py-0.5 rounded border border-cyan-500/20">{tStake.active || "ACTIVE"}</span>}
          </h4>

          {(!userDeposits || userDeposits.length === 0) && pendingReward === 0 ? (
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
            <div className="space-y-4 flex-1 flex flex-col">

              {/* RINGKASAN TOTAL STAKE & PENDING REWARD */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#05030F] border border-neutral-800 rounded-2xl p-4 shadow-inner">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">{tStake.totalStaked || "TOTAL STAKED"}</p>
                  <p className="text-lg font-black text-white font-mono truncate">{Number(totalUserStaked || 0).toLocaleString()} AETH</p>
                </div>
                <div className="bg-[#05030F] border border-neutral-800 rounded-2xl p-4 shadow-inner">
                  <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold mb-1">{tStake.pendingRewards || "READY TO CLAIM"}</p>
                  <p className="text-lg font-black text-green-400 font-mono truncate">+{pendingReward?.toFixed(4) || "0.00"} AETH</p>
                </div>
              </div>

              {/* TOMBOL CLAIM GLOBAL */}
              <button 
                onClick={handleClaimReward} 
                disabled={isWrongNetwork || pendingReward === 0} 
                className={`w-full py-3 rounded-xl font-bold text-xs shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all ${pendingReward > 0 ? 'bg-green-500 hover:bg-green-400 text-black shadow-[0_0_15px_rgba(34,197,94,0.4)] hover:scale-[1.02]' : 'bg-neutral-900 text-neutral-500 border border-neutral-800 cursor-not-allowed'}`}
              >
                <Coins className="w-4 h-4" /> 
                {pendingReward > 0 ? `${tStake.claimPrefix || "Claim"} ${pendingReward.toFixed(4)} AETH` : (tStake.noRewards || "No Rewards")}
              </button>

              <div className="border-t border-neutral-800 my-2"></div>

              {/* DAFTAR DEPOSIT AKTIF (MULTI-DEPOSIT) */}
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1">{tStake.activeDeposits || "ACTIVE DEPOSITS"}</p>

              <div className="flex-1 overflow-y-auto max-h-[300px] space-y-3 pr-1 custom-scrollbar">
                {userDeposits?.map((dep, index) => {
                  const unlockTimestamp = dep.unlockTime !== undefined ? Number(dep.unlockTime.toString()) : 0;
                  const isLocked = currentTime < unlockTimestamp;

                  const rawAmount = parseFloat(dep.amount || 0);
                  const formattedAmount = rawAmount > 1000000000 
                    ? (rawAmount / 1e18).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })
                    : rawAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });

                  const targetTier = TIERS[dep.tierId] || TIERS[0];
                  const tierName = targetTier.name;
                  
                  const displayApy = dep.apy ? (Number(dep.apy) / 100) : targetTier.apy;

                  return (
                    <div key={dep.id !== undefined ? String(dep.id) : index} className="bg-[#05030F] border border-neutral-800 rounded-xl p-3 flex flex-col gap-2 animate-in fade-in duration-200">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-white bg-neutral-800 px-2 py-0.5 rounded">{tierName}</span>
                          <span className="text-[10px] text-cyan-400 font-mono">{displayApy}% APY</span>
                        </div>
                        <span className="text-xs font-black text-white font-mono">{formattedAmount} AETH</span>
                      </div>

                      <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center gap-1.5 text-[9px] text-neutral-400">
                          {isLocked ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-500" />
                              <span>{tStake.lockedStatus || "Locked"}</span>
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3 h-3 text-green-400" />
                              <span className="text-green-400">{tStake.unlockedStatus || "Unlocked"}</span>
                            </>
                          )}
                        </div>

                        {/* TOMBOL WITHDRAW / EMERGENCY */}
                        {isLocked ? (
                          <button 
                            onClick={() => handleEmergencyWithdraw(dep.id)}
                            disabled={isWithdrawingStake}
                            className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors flex items-center gap-1 cursor-pointer"
                            title={tStake.emergencyTooltip || "Force Withdraw: Forfeit Rewards!"}
                          >
                            <AlertTriangle className="w-3 h-3" /> {tStake.emergencyBtn || "Emergency"}
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleWithdrawStake(dep.id)}
                            disabled={isWithdrawingStake}
                            className="px-4 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg text-[9px] font-bold uppercase tracking-widest transition-colors cursor-pointer"
                          >
                            {tStake.withdraw || "Withdraw"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
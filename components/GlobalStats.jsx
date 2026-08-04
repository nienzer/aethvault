import React, { useState, useEffect } from 'react';
import { Flame, UserX, Loader2, Database, ShieldCheck, Activity, Award, Wallet, Coins, Clock, Blocks, Zap } from 'lucide-react';
import { ethers } from 'ethers';

// ⭐ KONFIGURASI KONTRAK ON-CHAIN (Sesuai dengan page.jsx Bos)
const READ_ONLY_RPC_URL = "https://rpc-amoy.polygon.technology/";
const AETHER_VAULT_ADDRESS = "0xb273Bdad4D9d0053657359F45d189561449aa56B";
const STAKING_CONTRACT_ADDRESS = "0xc72433e176F2935965cbf595d6f30a70A89F702c";

// ABI minimal untuk menarik statistik dan event log
const VAULT_ABI = [
  "function totalProofs() view returns (uint256)",
  "event CapsuleSealed(uint256 indexed capsuleId, address indexed owner, uint8 tier, uint256 cost, bytes32 proofHash)",
  "event ProofCreated(uint256 indexed capsuleId, address indexed owner, bytes32 proofHash)"
];
const STAKING_ABI = [
  "function getStakingStats() view returns (uint256 currentTotalStaked, uint256 totalRewardsPaid, uint256 stakersCount, uint256 rewardPoolAvailable)",
  "event Staked(address indexed user, uint256 amount)"
];

export default function GlobalStats({ t, isFetchingGlobalStats, platformStats }) {
  // State untuk Data On-Chain Murni
  const [onChainStats, setOnChainStats] = useState({
    proofs: 0,
    tvl: 0,
    stakers: 0,
    blockNumber: 0
  });
  const [activities, setActivities] = useState([]);
  const [isLoadingExtra, setIsLoadingExtra] = useState(true);
  
  // Data dari prop platformStats (ditarik dari page.jsx)
  const totalSupply = platformStats?.supply || 0;
  const burned = platformStats?.burned || 0;
  const burnPercentage = totalSupply > 0 ? ((burned / totalSupply) * 100).toFixed(4) : "0.00";
  
  // ⭐ TARIK SEMUA DATA REAL-TIME DARI BLOCKCHAIN
  useEffect(() => {
    const fetchOnChainRealtime = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
        const vaultContract = new ethers.Contract(AETHER_VAULT_ADDRESS, VAULT_ABI, provider);
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);

        const currentBlock = await provider.getBlockNumber();

        // 1. Tarik Data Statistik Paralel
        const [totalProofs, stakingStats] = await Promise.all([
          vaultContract.totalProofs().catch(() => 0),
          stakingContract.getStakingStats().catch(() => [0, 0, 0, 0])
        ]);

        setOnChainStats({
          proofs: Number(totalProofs),
          tvl: parseFloat(ethers.formatUnits(stakingStats[0] || 0, 18)),
          stakers: Number(stakingStats[2] || 0),
          blockNumber: currentBlock
        });

        // 2. Tarik Event Logs untuk Recent Activity
        const DEPLOY_BLOCK = 43345845;
        const startBlock = Math.max(DEPLOY_BLOCK, currentBlock - 50000); // 50rb blok terakhir
        
        const [sealedLogs, proofLogs, stakedLogs] = await Promise.all([
          vaultContract.queryFilter(vaultContract.filters.CapsuleSealed(), startBlock, "latest"),
          vaultContract.queryFilter(vaultContract.filters.ProofCreated(), startBlock, "latest"),
          stakingContract.queryFilter(stakingContract.filters.Staked(), startBlock, "latest")
        ]);

        // Gabungkan dan urutkan dari yang terbaru (descending)
        const allLogs = [
          ...sealedLogs.map(l => ({ ...l, type: 'capsule' })),
          ...proofLogs.map(l => ({ ...l, type: 'proof' })),
          ...stakedLogs.map(l => ({ ...l, type: 'stake' }))
        ].sort((a, b) => b.blockNumber - a.blockNumber || b.transactionIndex - a.transactionIndex)
         .slice(0, 5); // Ambil 5 aktivitas teratas

        const acts = [];
        for (const log of allLogs) {
          const block = await provider.getBlock(log.blockNumber);
          const timeAgoMs = Date.now() - (block.timestamp * 1000);
          const minsAgo = Math.floor(timeAgoMs / 60000);
          const timeStr = minsAgo < 1 ? "Just now" : minsAgo < 60 ? `${minsAgo} mins ago` : `${Math.floor(minsAgo / 60)} hrs ago`;
          
          let detail = "";
          let icon = <Activity className="w-4 h-4 text-neutral-400"/>;
          let user = "0xUnknown";

          if (log.type === 'capsule') {
            user = log.args[1];
            detail = `Sealed Capsule #${log.args[0]}`;
            icon = <ShieldCheck className="w-4 h-4 text-cyan-400"/>;
          } else if (log.type === 'proof') {
            user = log.args[1];
            detail = `Minted Proof #${log.args[0]}`;
            icon = <Award className="w-4 h-4 text-purple-400"/>;
          } else if (log.type === 'stake') {
            user = log.args[0];
            const amt = parseFloat(ethers.formatUnits(log.args[1], 18)).toFixed(2);
            detail = `Staked ${amt} AETH`;
            icon = <Coins className="w-4 h-4 text-green-400"/>;
          }

          acts.push({
            type: log.type,
            user: `${user.substring(0, 6)}...${user.substring(user.length - 4)}`,
            detail,
            time: timeStr,
            icon
          });
        }

        setActivities(acts);
        setIsLoadingExtra(false);
      } catch (e) { 
        console.error("Gagal menarik data blockchain murni:", e);
        setIsLoadingExtra(false);
      }
    };
    
    fetchOnChainRealtime();
    const interval = setInterval(fetchOnChainRealtime, 15000); // Sinkronisasi tiap 15 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 font-sans">
      
      {/* ⭐ 1. HERO SATELLITE DASHBOARD (NETWORK HEALTH & BURN PROGRESS) */}
      <div className="bg-gradient-to-br from-[#0B0817] via-[#05030F] to-[#0A0713] border border-neutral-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row justify-between gap-6">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="space-y-6 flex-1 z-10">
          <div className="flex items-center gap-3">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white tracking-tight">Protocol Statistics</h3>
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.2)]">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
               <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Network Healthy</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#030208] border border-neutral-800/80 p-4 rounded-2xl shadow-inner">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Total Supply</span>
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
                 <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Deflationary Burn</span>
                 <Flame className="w-4 h-4 text-red-500" />
               </div>
               <div className="flex items-end justify-between">
                 <div className="text-xl font-black text-white font-mono">
                   {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin"/> : burned.toLocaleString()}
                 </div>
                 <span className="text-[10px] font-mono text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">{burnPercentage}% Burned</span>
               </div>
               <div className="w-full h-1 bg-neutral-900 mt-3 rounded-full overflow-hidden flex">
                 <div className="h-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]" style={{ width: `${Math.max(Number(burnPercentage), 2)}%` }}></div>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* ⭐ 2. THE 8 PREMIUM METRIC CARDS WITH HOVER GLOW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Capsules */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-cyan-500/50 hover:shadow-[0_10px_20px_-10px_rgba(6,182,212,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">Capsules</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : platformStats?.capsules || 0}
            </span>
          </div>
          <div className="mt-3">
             <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">Immutable</span>
          </div>
        </div>

        {/* Proofs */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-purple-500/50 hover:shadow-[0_10px_20px_-10px_rgba(168,85,247,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">Verified Proofs</span>
            <Award className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {isLoadingExtra ? <Loader2 className="w-4 h-4 animate-spin" /> : onChainStats.proofs.toLocaleString()}
            </span>
          </div>
          <div className="mt-3 flex items-end gap-1 h-3 opacity-60 group-hover:opacity-100 transition-opacity">
             <div className="w-1.5 h-1 bg-purple-500 rounded-t"></div>
             <div className="w-1.5 h-2 bg-purple-500 rounded-t"></div>
             <div className="w-1.5 h-1.5 bg-purple-500 rounded-t"></div>
             <div className="w-1.5 h-3 bg-purple-500 rounded-t"></div>
             <div className="w-1.5 h-2.5 bg-purple-500 rounded-t"></div>
             <span className="text-[8px] font-mono text-neutral-500 ml-1 leading-none">On-Chain</span>
          </div>
        </div>

        {/* Users */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-green-500/50 hover:shadow-[0_10px_20px_-10px_rgba(34,197,94,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">Active Wallets</span>
            <UserX className="w-4 h-4 text-green-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {isFetchingGlobalStats ? <Loader2 className="w-4 h-4 animate-spin" /> : platformStats?.users || 0}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-1.5">
             <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
             <span className="text-[9px] font-mono text-neutral-500 uppercase">Tracked</span>
          </div>
        </div>

        {/* TVL */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-blue-500/50 hover:shadow-[0_10px_20px_-10px_rgba(59,130,246,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">Staked TVL</span>
            <Database className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-xl sm:text-2xl font-black font-mono text-white">
              {isLoadingExtra ? <Loader2 className="w-4 h-4 animate-spin" /> : 
                onChainStats.tvl > 1000000 
                  ? (onChainStats.tvl / 1000000).toFixed(2) + "M"
                  : onChainStats.tvl.toFixed(2)}
            </span>
          </div>
          <div className="mt-3">
             <span className="text-[9px] font-mono text-blue-400">Total $AETH</span>
          </div>
        </div>

        {/* Stakers */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-pink-500/50 hover:shadow-[0_10px_20px_-10px_rgba(236,72,153,0.3)] hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest">Total Stakers</span>
            <Users className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-black font-mono text-white">
              {isLoadingExtra ? <Loader2 className="w-4 h-4 animate-spin" /> : onChainStats.stakers.toLocaleString()}
            </span>
          </div>
          <div className="mt-3">
             <span className="text-[9px] font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded">Active</span>
          </div>
        </div>

        {/* Polygon Height */}
        <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl flex flex-col justify-between shadow-lg group hover:border-white/40 hover:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.2)] hover:-translate-y-1 transition-all lg:col-span-3">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-800/50 pb-3">
            <span className="text-[10px] uppercase text-neutral-500 font-bold font-mono tracking-widest flex items-center gap-2">
              <Blocks className="w-4 h-4 text-white"/> Polygon Network Height
            </span>
            <div className="flex items-center gap-2 bg-neutral-900 border border-neutral-700 px-2.5 py-1 rounded shadow-inner">
               <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
               <span className="text-[10px] font-bold text-white tracking-widest uppercase">Live Sync</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2">
            <div>
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight drop-shadow-md">
                {onChainStats.blockNumber > 0 ? onChainStats.blockNumber.toLocaleString() : <Loader2 className="w-6 h-6 animate-spin text-neutral-500"/>}
              </span>
              <p className="text-[10px] text-neutral-500 font-mono mt-1">Target Chain: {READ_ONLY_RPC_URL}</p>
            </div>
            
            {/* Visualisasi Block Flow */}
            <div className="hidden sm:flex items-center gap-1 opacity-50">
              {[...Array(6)].map((_, i) => (
                 <div key={i} className="w-2 h-8 bg-neutral-800 rounded-sm" style={{ animation: `pulse 1.5s infinite ${(i * 0.2)}s` }}></div>
              ))}
              <div className="w-2 h-8 bg-white rounded-sm shadow-[0_0_15px_rgba(255,255,255,0.8)]"></div>
            </div>
          </div>
        </div>

      </div>

      {/* ⭐ 3. ECOSYSTEM ACTIVITY (100% REAL ON-CHAIN EVENT LOGS) */}
      <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl">
        <h4 className="font-display text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-neutral-800 pb-4">
          <Activity className="w-4 h-4 text-cyan-400" /> Recent Ecosystem Activity
        </h4>
        
        <div className="space-y-4">
          {isLoadingExtra ? (
            <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 text-neutral-600 animate-spin" /></div>
          ) : activities.length === 0 ? (
            <div className="text-center py-6 text-xs text-neutral-500 font-mono">No recent activity found on the network.</div>
          ) : activities.map((act, idx) => (
            <div key={idx} className="group flex items-center justify-between bg-[#05030F] border border-neutral-800/80 hover:border-neutral-600 p-4 rounded-xl transition-all shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                  {act.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">{act.user}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{act.detail}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end gap-1 shrink-0 pl-2">
                <span className="flex items-center gap-1 text-[9px] font-mono text-neutral-500">
                  <Clock className="w-3 h-3"/> {act.time}
                </span>
                <span className="w-1.5 h-1.5 bg-cyan-500/50 rounded-full mt-1"></span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button className="text-[10px] font-bold font-mono text-neutral-500 hover:text-white uppercase tracking-widest transition-colors cursor-pointer border-b border-transparent hover:border-white pb-0.5">
            Verified On Polygon Amoy →
          </button>
        </div>
      </div>

    </div>
  );
}
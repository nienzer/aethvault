"use client";
import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Lock, Clock, Database, Activity, ArrowRight, Server, Cpu, Globe, CheckCircle2, MessageSquare, Send, Code, Zap, Flame, UserX, Layers, FileText, Map, Users, ChevronRight, Bell, AlertTriangle, RefreshCcw, LineChart, Mail, Award, ShieldCheck, Fingerprint, Box, Network, TerminalSquare, Eye, KeyRound, Hexagon, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/context/LanguageContext';
import { ethers } from 'ethers';

const RPC_URL = "https://bsc-testnet-rpc.publicnode.com";
const AETHER_VAULT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265";
const STAKING_CONTRACT_ADDRESS = "0xe6FdC38895E2B7D463151423EE86ffcE268f5167";

const VAULT_ABI = ["function totalCapsules() view returns (uint256)", "function totalProofs() view returns (uint256)"];
const STAKING_ABI = ["function totalStaked() view returns (uint256)", "function totalStakers() view returns (uint256)"];

export default function LandingPage() {
  const router = useRouter();
  const { t: globalT, lang, changeLanguage } = useLanguage();
  const t = globalT.landing;

  const [toast, setToast] = useState(null);
  const [liveStats, setLiveStats] = useState({ block: 0, proofs: 0, tvl: 0, stakers: 0 });
  const [onChainStatus, setOnChainStatus] = useState("Connecting to BSC Testnet...");

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    let isMounted = true; 

    const fetchLiveBlockchainData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const vaultContract = new ethers.Contract(AETHER_VAULT_ADDRESS, VAULT_ABI, provider);
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);

        const [currentBlock, totalProofs, rawTotalStaked, rawStakers] = await Promise.all([
          provider.getBlockNumber(),
          vaultContract.totalProofs().catch(() => 0),
          stakingContract.totalStaked().catch(() => 0n),
          stakingContract.totalStakers().catch(() => 0n)
        ]);

        if (!isMounted) return; 

        setLiveStats({
          block: Number(currentBlock || 0),
          proofs: Number(totalProofs || 0),
          tvl: parseFloat(ethers.formatUnits(rawTotalStaked || 0n, 18)),
          stakers: Number(rawStakers || 0n)
        });
        
        setOnChainStatus("Verified On-Chain & Synced");
      } catch (e) {
        console.error("Gagal menarik data on-chain:", e);
        if (isMounted) setOnChainStatus("RPC Connection Error");
      }
    };

    fetchLiveBlockchainData();
    const interval = setInterval(fetchLiveBlockchainData, 20000); 
    
    return () => {
      isMounted = false; 
      clearInterval(interval);
    };
  }, []);



  return (
    <div className="min-h-screen bg-[#030208] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden relative pt-24 sm:pt-28 lg:pt-32">
      
      {/* Background Orbs Global */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-900/80 border-green-500/40 text-green-300' : 'bg-[#0B0817] border-cyan-500/30 text-cyan-400'} backdrop-blur-xl max-w-[90vw]`}>
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <p className="text-xs font-medium">{toast.msg}</p>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.2); }
          50% { box-shadow: 0 0 25px rgba(6, 182, 212, 0.5); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* ⭐ 1. HERO SECTION */}
      <section id="home" className="pb-6 sm:pb-10 px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-6 sm:gap-8 items-start lg:items-center relative z-10">
        
        <div className="lg:col-span-6 relative text-center lg:text-left flex flex-col items-center lg:items-start -mt-16 sm:-mt-20 lg:-mt-24">
          <div className="w-fit flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            {globalT.hero.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight mb-3 sm:mb-6 text-white leading-[1.15] drop-shadow-xl">
            {globalT.hero.titleLine1} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
              {globalT.hero.titleHighlight}
            </span>
          </h1>
          
          <p className="text-neutral-300 text-xs sm:text-base mb-5 sm:mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-md">
            {globalT.hero.desc}
          </p>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-4 mb-4 sm:mb-6 w-full sm:w-auto">
            <button onClick={() => router.push("/dashboard")} className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-[10px] sm:text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)] hover:scale-105 cursor-pointer outline-none">
              {globalT.hero.exploreBtn} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => router.push('/whitepaper')} className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-[#0B0817]/80 hover:bg-[#05030F] backdrop-blur-md text-white px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-[10px] sm:text-sm border border-neutral-800 hover:border-cyan-500/50 transition-all cursor-pointer outline-none shadow-lg">
              Whitepaper <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-6 relative z-10 hidden lg:flex flex-col items-center justify-center h-[500px] lg:-ml-10 lg:-mt-12">
           <div className="w-full max-w-sm space-y-3 relative">
              
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 -rotate-90 text-[8px] font-mono text-neutral-500 tracking-[0.3em] uppercase opacity-70">
                Architecture Diagram
              </div>

              <div className="bg-[#0B0817]/90 backdrop-blur-xl border border-neutral-800 p-3.5 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.4)] transform translate-x-4 animate-float">
                 <div className="w-10 h-10 bg-[#05030F] border border-neutral-800 rounded-xl flex items-center justify-center"><Lock className="w-5 h-5 text-neutral-300"/></div>
                 <div><p className="text-white font-bold text-xs">Encrypted Capsule</p><p className="text-[9px] text-neutral-400 font-mono">ECIES-secp256k1</p></div>
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-neutral-800 to-purple-500/50 mx-auto"></div>
              
              <div className="bg-[#0B0817]/90 backdrop-blur-xl border border-purple-500/30 p-3.5 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(168,85,247,0.15)] transform -translate-x-4 animate-float" style={{ animationDelay: '1s' }}>
                 <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5 text-purple-400"/></div>
                 <div><p className="text-white font-bold text-xs">Binance Smart Chain</p><p className="text-[9px] text-purple-400 font-mono">L2 Immutable Storage</p></div>
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-purple-500/50 to-cyan-500/50 mx-auto"></div>

              <div className="bg-[#0B0817]/90 backdrop-blur-xl border border-cyan-500/30 p-3.5 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(6,182,212,0.15)] transform translate-x-6 animate-float animate-glow" style={{ animationDelay: '2s' }}>
                 <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-cyan-400"/></div>
                 <div><p className="text-white font-bold text-xs">Time-Lock Target</p><p className="text-[9px] text-cyan-400 font-mono">Smart Contract Enforced</p></div>
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-cyan-500/50 to-green-500/50 mx-auto"></div>

              <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/30 p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(34,197,94,0.15)] transform mx-auto w-fit animate-float" style={{ animationDelay: '3s' }}>
                 <CheckCircle2 className="w-4 h-4 text-green-400"/>
                 <p className="text-green-400 font-bold text-[10px] uppercase tracking-widest">Verified On-Chain</p>
              </div>
           </div>
        </div>
      </section>

      {/* ⭐ 2. LIVE DATA TICKER. */}
      <div className="border-y border-neutral-800/80 bg-[#0B0817]/60 backdrop-blur-xl py-3 relative z-20 shadow-[0_4px_30px_rgba(0,0,0,0.3)] mt-4 lg:mt-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-3 sm:gap-12 text-[9px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Network: <span className="text-white font-bold">BSC Testnet</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
             Block: <span className="text-cyan-400 font-bold">{liveStats.block > 0 ? liveStats.block.toLocaleString() : "Syncing..."}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
             Proofs: <span className="text-purple-400 font-bold">{liveStats.proofs.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
             Stakers: <span className="text-amber-400 font-bold">{liveStats.stakers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-400">
             TVL: <span className="text-blue-400 font-bold">{liveStats.tvl.toLocaleString()} AETH</span>
          </div>
        </div>
      </div>

      {/* ⭐ PILAR UTAMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
           <div className="bg-[#0B0817] border border-neutral-800/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl hover:border-cyan-500/30 transition-all group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-inner">
                 <Award className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.proofTitle}</h3>
              <p className="text-neutral-400 text-[10px] sm:text-sm leading-relaxed hidden sm:block">{t.pillars.proofDesc}</p>
           </div>
           <div className="bg-[#0B0817] border border-neutral-800/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl hover:border-purple-500/30 transition-all group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-inner">
                 <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.legacyTitle}</h3>
              <p className="text-neutral-400 text-[10px] sm:text-sm leading-relaxed hidden sm:block">{t.pillars.legacyDesc}</p>
           </div>
           <div className="bg-[#0B0817] border border-neutral-800/80 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl hover:border-amber-500/30 transition-all col-span-2 md:col-span-1 group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform shadow-inner">
                 <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.capsuleTitle}</h3>
              <p className="text-neutral-400 text-[10px] sm:text-sm leading-relaxed">{t.pillars.capsuleDesc}</p>
           </div>
        </div>
      </section>

      {/* ⭐ GABUNGAN 1: HALL OF PROOF & INFRASTRUCTURE */}
      <section id="infrastructure" className="py-12 sm:py-20 border-y border-neutral-900 relative overflow-hidden z-10 bg-[#05030F]/40 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start relative z-10">
           
           {/* KIRI: HALL OF PROOF */}
           <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
             <div className="w-fit px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 backdrop-blur-md text-cyan-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest font-mono shadow-[0_0_15px_rgba(6,182,212,0.15)]">
               100% On-Chain Verified
             </div>
             <div>
               <h2 className="text-2xl sm:text-4xl font-black text-white font-display drop-shadow-lg mb-3">Hall of Proof™ Live Records</h2>
               <p className="text-neutral-400 text-xs sm:text-sm drop-shadow-md max-w-md mx-auto lg:mx-0">Real-time smart contract state directly queried from BSC Testnet blockchain.</p>
             </div>

             <div className="w-full bg-[#0B0817] border border-neutral-800 rounded-3xl p-4 sm:p-6 text-left shadow-2xl">
               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-neutral-800 gap-3">
                 <div className="flex items-center gap-2.5">
                   <span className="w-2 h-2 rounded-full bg-green-400 animate-ping shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
                   <span className="text-[10px] sm:text-xs font-mono text-white font-bold tracking-wider drop-shadow-md">CONTRACT: 0x318E...71FD</span>
                 </div>
                 <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                   {onChainStatus}
                 </span>
               </div>

               <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
                 <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-2xl space-y-1.5 shadow-inner">
                   <p className="text-neutral-500 uppercase tracking-widest text-[7px] sm:text-[8px] font-bold">Total Proofs</p>
                   <p className="text-cyan-400 text-sm sm:text-base font-black">{liveStats.proofs.toLocaleString()} Rec</p>
                 </div>
                 <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-2xl space-y-1.5 shadow-inner">
                   <p className="text-neutral-500 uppercase tracking-widest text-[7px] sm:text-[8px] font-bold">Staking Pool TVL</p>
                   <p className="text-purple-400 text-sm sm:text-base font-black">{liveStats.tvl.toLocaleString()} AETH</p>
                 </div>
                 <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-2xl space-y-1.5 col-span-2 sm:col-span-1 shadow-inner">
                   <p className="text-neutral-500 uppercase tracking-widest text-[7px] sm:text-[8px] font-bold">BSC Block</p>
                   <p className="text-green-400 text-sm sm:text-base font-black">#{liveStats.block > 0 ? liveStats.block.toLocaleString() : "Syncing"}</p>
                 </div>
               </div>

               <div className="mt-5 text-center flex justify-center">
                 <button 
                   onClick={() => router.push('/dashboard')}
                   className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#05030F] hover:bg-neutral-900 text-white px-5 py-3 rounded-xl font-bold text-[10px] sm:text-xs border border-neutral-800 hover:border-cyan-500/40 transition-all cursor-pointer shadow-lg"
                 >
                   Open dApp Terminal <ArrowRight className="w-3.5 h-3.5" />
                 </button>
               </div>
             </div>
           </div>

           {/* KANAN: INFRASTRUCTURE */}
           <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
             <div className="w-fit px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md text-blue-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest font-mono">
               {globalT.infrastructure.tag}
             </div>
             <div>
               <h2 className="text-2xl sm:text-4xl font-black text-white font-display drop-shadow-lg mb-3">{globalT.infrastructure.title}</h2>
               <p className="text-neutral-400 text-xs sm:text-sm drop-shadow-md max-w-md mx-auto lg:mx-0">{globalT.infrastructure.desc}</p>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 w-full">
               <div className="bg-[#0B0817] border border-neutral-800 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all text-left">
                 <Server className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 mb-3 drop-shadow-md"/>
                 <h4 className="text-sm sm:text-base font-bold text-white mb-1">{globalT.infrastructure.nodesTitle}</h4>
                 <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">{globalT.infrastructure.nodesDesc}</p>
               </div>
               <div className="bg-[#0B0817] border border-neutral-800 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-purple-500/30 transition-all text-left">
                 <Cpu className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mb-3 drop-shadow-md"/>
                 <h4 className="text-sm sm:text-base font-bold text-white mb-1">{globalT.infrastructure.interopTitle}</h4>
                 <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">{globalT.infrastructure.interopDesc}</p>
               </div>
               <div className="bg-[#0B0817] border border-neutral-800 p-5 sm:p-6 rounded-2xl shadow-xl hover:border-amber-500/30 transition-all text-left col-span-1 sm:col-span-2 flex items-start gap-4">
                 <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 shrink-0 mt-1 drop-shadow-md"/>
                 <div>
                   <h4 className="text-sm sm:text-base font-bold text-white mb-1">{globalT.infrastructure.securityTitle}</h4>
                   <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">{globalT.infrastructure.securityDesc}</p>
                 </div>
               </div>
             </div>
           </div>

        </div>
      </section>

      {/* ⭐ GABUNGAN 2: TIERS ARCHITECTURE & TOKENOMICS */}
      <section id="tiers" className="py-12 sm:py-20 border-t border-neutral-900 relative overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start relative z-10">
           
           {/* KIRI: 4-TIER VAULT ARCHITECTURE */}
           <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6">
             <div className="w-fit px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md text-amber-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest font-mono">
               {globalT.tiers.tag}
             </div>
             <div>
               <h2 className="text-2xl sm:text-4xl font-black text-white font-display drop-shadow-lg mb-3">{globalT.tiers.title}</h2>
               <p className="text-neutral-400 text-xs sm:text-sm drop-shadow-md max-w-md mx-auto lg:mx-0">{globalT.tiers.desc}</p>
             </div>

             <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
                {/* Tier 1 */}
                <div className="bg-[#0B0817] border border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{globalT.tiers.tier1Title}</h4>
                    <p className="text-[9px] sm:text-[10px] text-neutral-400 leading-relaxed">{globalT.tiers.tier1Desc}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-neutral-800 text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400">10 AETH (2 Burn)</div>
                </div>
                {/* Tier 2 */}
                <div className="bg-[#0B0817] border border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{globalT.tiers.tier2Title}</h4>
                    <p className="text-[9px] sm:text-[10px] text-neutral-400 leading-relaxed">{globalT.tiers.tier2Desc}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-neutral-800 text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400">50 AETH (10 Burn)</div>
                </div>
                {/* Tier 3 */}
                <div className="bg-[#0B0817] border border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-xl hover:border-cyan-500/30 transition-all flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">{globalT.tiers.tier3Title}</h4>
                    <p className="text-[9px] sm:text-[10px] text-neutral-400 leading-relaxed">{globalT.tiers.tier3Desc}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-neutral-800 text-[9px] sm:text-[10px] font-mono font-bold text-cyan-400">200 AETH (40 Burn)</div>
                </div>
                {/* Tier 4 (Ultimate) */}
                <div className="bg-gradient-to-br from-[#0B0817] to-cyan-950/20 border border-cyan-500/30 p-4 sm:p-5 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:border-cyan-400 transition-all flex flex-col justify-between relative">
                  <div>
                    <span className="absolute top-2 right-2 sm:top-3 sm:right-3 text-[6px] sm:text-[7px] bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded font-mono uppercase font-bold border border-cyan-500/30">Ultimate</span>
                    <h4 className="text-sm font-bold text-white mb-1 mt-2 sm:mt-0">{globalT.tiers.tier4Title}</h4>
                    <p className="text-[9px] sm:text-[10px] text-neutral-300 leading-relaxed">{globalT.tiers.tier4Desc}</p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-cyan-500/20 text-[9px] sm:text-[10px] font-mono text-cyan-400 font-bold">500 AETH (100 Burn)</div>
                </div>

                <div className="bg-[#0B0817] border border-neutral-800 p-4 sm:p-5 rounded-2xl shadow-xl col-span-2 flex items-start gap-3 mt-1 border-l-4 border-l-green-500">
                  <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 shrink-0 mt-0.5" />
                  <div className="text-left">
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1">{lang === 'en' ? 'Military-Grade Security' : 'Keamanan Tingkat Militer'}</h4>
                    <p className="text-[9px] sm:text-[10px] text-neutral-400 leading-relaxed">
                      {lang === 'en' ? 'All capsules are cryptographically secured using ECIES-secp256k1 on-chain. Zero-knowledge architecture ensures absolute privacy.' : 'Semua kapsul diamankan secara mutlak menggunakan kriptografi ECIES-secp256k1. Arsitektur zero-knowledge memastikan privasi data terjamin.'}
                    </p>
                  </div>
                </div>
             </div>
           </div>

           {/* KANAN: TOKENOMICS & TOTAL SUPPLY */}
           <div id="tokenomics" className="w-full flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 lg:pl-4">
             <div className="w-fit px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md text-purple-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest font-mono">
               {globalT.tokenomics.tag || "TOKENOMICS"}
             </div>
             <div>
               <h2 className="text-2xl sm:text-4xl font-black text-white font-display drop-shadow-lg mb-3">Designed for Scarcity</h2>
               <p className="text-neutral-400 text-xs sm:text-sm drop-shadow-md max-w-md mx-auto lg:mx-0">100,000,000 total fixed supply with robust utility and automated deflationary burn mechanisms.</p>
             </div>

             <div className="w-full flex flex-col items-center justify-center gap-6 mt-2">
                <div className="relative shrink-0 animate-float">
                  <div className="absolute inset-0 bg-cyan-500/10 blur-[40px] rounded-full"></div>
                  <div className="w-48 h-48 sm:w-56 sm:h-56 rounded-full relative shadow-2xl flex items-center justify-center"
                       style={{
                         background: "conic-gradient(#06b6d4 0% 30%, #a855f7 30% 55%, #f59e0b 55% 75%, #3b82f6 75% 85%, #22c55e 85% 100%)"
                       }}>
                     <div className="w-32 h-32 sm:w-40 sm:h-40 bg-[#05030F] rounded-full flex flex-col items-center justify-center absolute border border-neutral-800 shadow-inner">
                       <span className="text-white font-black text-2xl sm:text-3xl font-mono drop-shadow-lg">100M</span>
                       <span className="text-neutral-500 text-[8px] sm:text-[9px] tracking-widest mt-1 font-bold">TOTAL AETH</span>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                  <div className="bg-[#0B0817] border border-neutral-800 p-4 rounded-xl shadow-xl text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee]"></div>
                       <span className="text-[7px] sm:text-[8px] font-mono text-cyan-400 font-bold uppercase">{globalT.tokenomics.liquidity || "LIQUIDITY POOL"}</span>
                    </div>
                    <div className="text-sm sm:text-lg font-black text-white font-mono">30%</div>
                  </div>
                  <div className="bg-[#0B0817] border border-neutral-800 p-4 rounded-xl shadow-xl text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 rounded-full bg-purple-500 shadow-[0_0_6px_#a855f7]"></div>
                       <span className="text-[7px] sm:text-[8px] font-mono text-purple-400 font-bold uppercase">{globalT.tokenomics.staking || "STAKING REWARDS"}</span>
                    </div>
                    <div className="text-sm sm:text-lg font-black text-white font-mono">25%</div>
                  </div>
                  <div className="bg-[#0B0817] border border-neutral-800 p-4 rounded-xl shadow-xl text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_6px_#f59e0b]"></div>
                       <span className="text-[7px] sm:text-[8px] font-mono text-amber-400 font-bold uppercase">{globalT.tokenomics.initialSale || "INITIAL SALE"}</span>
                    </div>
                    <div className="text-sm sm:text-lg font-black text-white font-mono">20%</div>
                  </div>
                  <div className="bg-[#0B0817] border border-neutral-800 p-4 rounded-xl shadow-xl text-left">
                    <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_6px_#3b82f6]"></div>
                       <span className="text-[7px] sm:text-[8px] font-mono text-blue-400 font-bold uppercase">{globalT.tokenomics.treasury || "TREASURY"}</span>
                    </div>
                    <div className="text-sm sm:text-lg font-black text-white font-mono">10%</div>
                  </div>
                  <div className="bg-[#0B0817] border border-neutral-800 p-4 rounded-xl shadow-xl text-left col-span-2 sm:col-span-1">
                    <div className="flex items-center gap-2 mb-1.5">
                       <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_6px_#22c55e]"></div>
                       <span className="text-[7px] sm:text-[8px] font-mono text-green-400 font-bold uppercase">TEAM & DEV</span>
                    </div>
                    <div className="text-sm sm:text-lg font-black text-white font-mono">15%</div>
                  </div>
                </div>
             </div>
           </div>

        </div>
      </section>

      {/* ⭐ GABUNGAN 3: TEAM / DEV & COMMUNITY HUB */}
      <section id="team" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-neutral-900 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* KOLOM KIRI: PROFIL DEV */}
          <div className="bg-[#0B0817] border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-6 shadow-2xl relative overflow-hidden w-full hover:border-cyan-500/30 transition-colors h-full">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none"></div>
            
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-cyan-500/30 to-blue-600/30 p-[1px] shadow-xl">
                <div className="w-full h-full bg-[#05030F] rounded-2xl flex items-center justify-center overflow-hidden relative">
                  <img src="/dev.png" alt="Nienzer" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                  <div className="absolute inset-0 bg-black/50 hidden items-center justify-center text-cyan-400 font-mono font-black text-lg">
                    NZ
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-[6px] sm:text-[8px] font-mono font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-widest border-2 border-[#0B0817] shadow-md">
                Core Dev
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 flex-1 relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest font-mono">
                {globalT.team.tag || "THE CONTRIBUTOR"}
              </div>
              <h3 className="text-lg sm:text-2xl font-extrabold text-white font-display drop-shadow-md">{globalT.team.name || "Nienzer"}</h3>
              <p className="text-neutral-400 text-[10px] sm:text-xs leading-relaxed">
                {globalT.team.bio || "Lead architect behind AetherVault Smart Contracts. Focused on cryptographic innovation, data privacy, and secure Web3 architecture."}
              </p>
              
              <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-2">
                <a href="https://t.me/nienzer" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-2.5 rounded-full bg-[#05030F] border border-neutral-800 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-400 text-neutral-500 transition-all shadow-md">
                   <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </a>
                <a href="https://github.com/nienzer" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-2.5 rounded-full bg-[#05030F] border border-neutral-800 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-400 text-neutral-500 transition-all shadow-md">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                </a>
                <a href="https://twitter.com/nien_zer" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-2.5 rounded-full bg-[#05030F] border border-neutral-800 hover:bg-cyan-500/10 hover:border-cyan-500/40 hover:text-cyan-400 text-neutral-500 transition-all shadow-md">
                   <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: COMMUNITY GRID */}
          <div className="w-full flex flex-col justify-center gap-3 h-full">
            <div className="grid grid-cols-2 gap-3 w-full">
              <a href="https://t.me/AethVault" target="_blank" rel="noreferrer" className="bg-[#05030F] border border-neutral-800 hover:border-cyan-500/40 p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all shadow-inner group">
                <Send className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h3 className="text-white font-bold text-xs sm:text-sm">{globalT.communityPage?.telegramTitle || "Telegram Official"}</h3>
                  <p className="text-[8px] sm:text-[9px] text-neutral-500 mt-0.5 font-mono">{(globalT.communityPage?.telegramDesc || "Real-time discussion group").replace('(Coming Soon)', '').trim()}</p>
                </div>
              </a>
              
              <a href="https://twitter.com/AethVault" target="_blank" rel="noreferrer" className="bg-[#05030F] border border-neutral-800 hover:border-cyan-500/40 p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all shadow-inner group">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
                <div className="text-center">
                  <h3 className="text-white font-bold text-xs sm:text-sm">{globalT.communityPage?.twitterTitle || "Twitter / X"}</h3>
                  <p className="text-[8px] sm:text-[9px] text-neutral-500 mt-0.5 font-mono">{(globalT.communityPage?.twitterDesc || "Technical announcements").replace('(Coming Soon)', '').trim()}</p>
                </div>
              </a>
              
              <a href="https://github.com/nienzer" target="_blank" rel="noreferrer" className="bg-[#05030F] border border-neutral-800 hover:border-cyan-500/40 p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all shadow-inner group">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-neutral-400 group-hover:scale-110 transition-transform"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
                <div className="text-center">
                  <h3 className="text-white font-bold text-xs sm:text-sm">{globalT.communityPage?.githubTitle || "Github Open Source"}</h3>
                  <p className="text-[8px] sm:text-[9px] text-neutral-500 mt-0.5 font-mono">{globalT.communityPage?.githubDesc || "Protocol code repository"}</p>
                </div>
              </a>
              
              <a href="/community" className="bg-[#05030F] border border-neutral-800 hover:border-cyan-500/40 p-5 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all shadow-inner group">
                <Globe className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="text-center">
                  <h3 className="text-white font-bold text-xs sm:text-sm">{globalT.communityPage?.forumTitle || "Web3 Forum"}</h3>
                  <p className="text-[8px] sm:text-[9px] text-neutral-500 mt-0.5 font-mono">{(globalT.communityPage?.forumDesc || "DAO Voting & Proposals").replace('(Coming Soon)', '').trim()}</p>
                </div>
              </a>
            </div>

            <a href="mailto:admin@aethvault.xyz" className="bg-[#0B0817] border border-cyan-500/20 hover:border-cyan-400/50 p-4 sm:p-5 rounded-2xl flex flex-row items-center justify-center gap-4 transition-all group shadow-xl w-full">
              <div className="w-10 h-10 bg-[#05030F] border border-cyan-500/20 rounded-full flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              </div>
              <div className="text-left">
                <h3 className="text-white font-bold text-sm">{lang === 'en' ? 'Official Email Support' : 'Dukungan Email Resmi'}</h3>
                <p className="text-[10px] sm:text-xs text-cyan-400 mt-0.5 font-mono tracking-wide">admin@aethvault.xyz</p>
              </div>
            </a>
          </div>

        </div>
      </section>

      {/* ⭐ ECOSYSTEM & PARTNERS LOGO BAR */}
      <section className="py-12 sm:py-16 border-y border-neutral-900 bg-[#0B0817]/30 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-5 sm:space-y-8">
           <p className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] sm:tracking-[0.3em] text-neutral-500 font-bold drop-shadow-md">Secured, Audited & Powered By</p>
           <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-6">
              
              <div className="flex items-center gap-2.5 bg-[#05030F] border border-neutral-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-lg hover:border-neutral-600 hover:scale-105 transition-all">
                 <img src="/binance.png" alt="Binance" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                 <span className="text-[10px] sm:text-sm font-bold font-mono text-white tracking-wide">BINANCE</span>
              </div>

              <div className="flex items-center gap-2.5 bg-[#05030F] border border-neutral-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-lg hover:border-neutral-600 hover:scale-105 transition-all">
                 <Hexagon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                 <span className="text-[10px] sm:text-sm font-bold font-mono text-white tracking-wide">CHAINLINK</span>
              </div>

              <div className="flex items-center gap-2.5 bg-[#05030F] border border-neutral-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-lg hover:border-neutral-600 hover:scale-105 transition-all">
                 <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                 <span className="text-[10px] sm:text-sm font-bold font-mono text-white tracking-wide">ZEPPELIN</span>
              </div>

              <div className="flex items-center gap-2.5 bg-[#05030F] border border-neutral-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-lg hover:border-neutral-600 hover:scale-105 transition-all">
                 <img src="/uniswap.png" alt="Uniswap" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                 <span className="text-[10px] sm:text-sm font-bold font-mono text-white tracking-wide">UNISWAP</span>
              </div>

              <div className="flex items-center gap-2.5 bg-[#05030F] border border-neutral-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-lg hover:border-neutral-600 hover:scale-105 transition-all">
                 <img src="/pinksale.png" alt="Pinksale" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                 <span className="text-[10px] sm:text-sm font-bold font-mono text-white tracking-wide">PINKSALE</span>
              </div>

              <div className="flex items-center gap-2.5 bg-[#05030F] border border-neutral-800 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl shadow-lg hover:border-neutral-600 hover:scale-105 transition-all">
                 <img src="/gecko.png" alt="Gecko" className="w-4 h-4 sm:w-5 sm:h-5 object-contain" />
                 <span className="text-[10px] sm:text-sm font-bold font-mono text-white tracking-wide">GECKO</span>
              </div>

           </div>
        </div>
      </section>

      {/* ⭐ FOOTER */}
      <footer className="bg-[#030208] pt-12 sm:pt-16 pb-8 sm:pb-10 relative z-10 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8 sm:mb-12">
          
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-lg object-cover drop-shadow-md" />
              <span className="text-sm font-black tracking-widest text-white font-display drop-shadow-md">AETHERVAULT</span>
            </div>
            <p className="text-neutral-500 text-xs leading-relaxed max-w-sm drop-shadow-sm">{globalT.footer.desc}</p>
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-2 gap-4 sm:gap-8">
            <div className="flex flex-col space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-1">{globalT.footer.quickLinks}</h4>
              <a href="#infrastructure" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">{globalT.footer.navInfrastructure}</a>
              <button onClick={() => router.push('/dashboard')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.navLaunchApp}</button>
              <button onClick={() => router.push('/whitepaper')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.navWhitepaper}</button>
            </div>
            
            <div className="flex flex-col space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-1">{globalT.footer.community}</h4>
              <button onClick={() => router.push('/community')} className="text-xs text-cyan-500 hover:text-cyan-400 font-bold transition-colors text-left bg-transparent border-none p-0 cursor-pointer flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Community Hub
              </button>
              <button onClick={() => router.push('/terms')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.terms}</button>
              <button onClick={() => router.push('/privacy')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.privacy}</button>
            </div>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs text-neutral-600 font-mono gap-3">
          <p>© {new Date().getFullYear()} Nienzer. Hak Cipta Dilindungi. Email: admin@aethvault.xyz</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span> BSC Mainnet Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
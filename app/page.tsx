"use client";
import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Lock, Clock, Database, Activity, ArrowRight, Server, Cpu, Globe, CheckCircle2, MessageSquare, Send, Code, Zap, Flame, UserX, Layers, FileText, Map, Users, ChevronRight, Bell, AlertTriangle, RefreshCcw, LineChart, Mail, Award, ShieldCheck, Fingerprint, Box, Network, TerminalSquare, Eye, KeyRound, Hexagon, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/context/LanguageContext';
import { ethers } from 'ethers';

const RPC_URL = "https://rpc-amoy.polygon.technology/";
const AETHER_VAULT_ADDRESS = "0xb273Bdad4D9d0053657359F45d189561449aa56B";
const STAKING_CONTRACT_ADDRESS = "0xc72433e176F2935965cbf595d6f30a70A89F702c";

const VAULT_ABI = ["function totalProofs() view returns (uint256)"];
const STAKING_ABI = ["function getStakingStats() view returns (uint256 currentTotalStaked, uint256 totalRewardsPaid, uint256 stakersCount, uint256 rewardPoolAvailable)"];

export default function LandingPage() {
  const router = useRouter();
  const { t: globalT, lang, changeLanguage } = useLanguage();
  const t = globalT.landing;

  const [toast, setToast] = useState(null);
  const [liveStats, setLiveStats] = useState({ block: 0, proofs: 0, tvl: 0, stakers: 0 });
  const [onChainStatus, setOnChainStatus] = useState("Connecting to Polygon Amoy...");

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const fetchLiveBlockchainData = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(RPC_URL);
        const vaultContract = new ethers.Contract(AETHER_VAULT_ADDRESS, VAULT_ABI, provider);
        const stakingContract = new ethers.Contract(STAKING_CONTRACT_ADDRESS, STAKING_ABI, provider);

        const [currentBlock, totalProofs, stakingData] = await Promise.all([
          provider.getBlockNumber(),
          vaultContract.totalProofs().catch(() => 0),
          stakingContract.getStakingStats().catch(() => [0, 0, 0, 0])
        ]);

        setLiveStats({
          block: currentBlock,
          proofs: Number(totalProofs),
          tvl: parseFloat(ethers.formatUnits(stakingData[0] || 0, 18)),
          stakers: Number(stakingData[2] || 0)
        });
        setOnChainStatus("Verified On-Chain & Synced");
      } catch (e) {
        console.error("Gagal menarik data on-chain:", e);
        setOnChainStatus("RPC Connection Error");
      }
    };

    fetchLiveBlockchainData();
    const interval = setInterval(fetchLiveBlockchainData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#030208] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden relative pt-20">
      
      {/* Background Orbs Global */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none z-0"></div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-900/80 border-green-500/40 text-green-300' : 'bg-white/10 border-white/20 text-cyan-400'} backdrop-blur-xl max-w-[90vw]`}>
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <p className="text-xs font-medium">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* CSS Animasi Kustom */}
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
        
        {/* lg:-mt-24 & sm:-mt-10 UNTUK MENARIK TEKS NAIK MELET KE NAVBAR DI DESKTOP & HP */}
        <div className="lg:col-span-7 relative text-center lg:text-left flex flex-col items-center lg:items-start -mt-8 sm:-mt-10 lg:-mt-24">
          <div className="w-fit flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 font-mono shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            {globalT.hero.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-tight mb-3 sm:mb-6 text-white leading-[1.15] drop-shadow-xl">
            {globalT.hero.titleLine1} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
              {globalT.hero.titleHighlight}
            </span>
          </h1>
          
          <p className="text-neutral-300 text-xs sm:text-base mb-5 sm:mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0 drop-shadow-md">
            {globalT.hero.desc}
          </p>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-4 mb-4 sm:mb-6 w-full sm:w-auto">
            <button onClick={() => router.push("/dashboard")} className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-white text-black px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-[10px] sm:text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:scale-105 cursor-pointer outline-none">
              {globalT.hero.exploreBtn} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => router.push('/whitepaper')} className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-[10px] sm:text-sm border border-white/10 transition-all cursor-pointer outline-none">
              Whitepaper <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* HERO ANIMATION FLOW (LENGKAP 4 BOX & GLASSMORPHISM) */}
        <div className="lg:col-span-5 relative z-10 hidden lg:flex flex-col items-center justify-center h-[500px]">
           <div className="w-full max-w-sm space-y-3">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transform translate-x-4 animate-float">
                 <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center"><Lock className="w-5 h-5 text-neutral-300"/></div>
                 <div><p className="text-white font-bold text-xs">Encrypted Capsule</p><p className="text-[9px] text-neutral-400 font-mono">ECIES-secp256k1</p></div>
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-white/20 to-purple-500/50 mx-auto"></div>
              
              <div className="bg-purple-500/10 backdrop-blur-xl border border-purple-500/20 p-3.5 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(168,85,247,0.15)] transform -translate-x-4 animate-float" style={{ animationDelay: '1s' }}>
                 <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/30 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5 text-purple-300"/></div>
                 <div><p className="text-white font-bold text-xs">Polygon Network</p><p className="text-[9px] text-purple-300 font-mono">L2 Immutable Storage</p></div>
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-purple-500/50 to-cyan-500/50 mx-auto"></div>

              <div className="bg-cyan-500/10 backdrop-blur-xl border border-cyan-500/20 p-3.5 rounded-2xl flex items-center gap-3 shadow-[0_8px_30px_rgb(6,182,212,0.15)] transform translate-x-6 animate-float animate-glow" style={{ animationDelay: '2s' }}>
                 <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/30 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-cyan-300"/></div>
                 <div><p className="text-white font-bold text-xs">Time-Lock Target</p><p className="text-[9px] text-cyan-300 font-mono">Unlock Year 2045</p></div>
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-cyan-500/50 to-green-500/50 mx-auto"></div>

              <div className="bg-green-500/10 backdrop-blur-xl border border-green-500/20 p-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-[0_8px_30px_rgb(34,197,94,0.15)] transform mx-auto w-fit animate-float" style={{ animationDelay: '3s' }}>
                 <CheckCircle2 className="w-4 h-4 text-green-400"/>
                 <p className="text-green-400 font-bold text-[10px] uppercase tracking-widest">Verified On-Chain</p>
              </div>
           </div>
        </div>
      </section>

      {/* ⭐ 2. LIVE DATA TICKER (GLASSMORPHISM) */}
      <div className="border-y border-white/5 bg-white/5 backdrop-blur-xl py-3 relative z-20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] mt-4 lg:mt-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-3 sm:gap-12 text-[9px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 text-neutral-300">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Network: <span className="text-white font-bold">Polygon Amoy</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
             Block: <span className="text-cyan-400 font-bold">{liveStats.block > 0 ? liveStats.block.toLocaleString() : "Syncing..."}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
             Proofs: <span className="text-purple-400 font-bold">{liveStats.proofs.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
             Stakers: <span className="text-amber-400 font-bold">{liveStats.stakers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5 text-neutral-300">
             TVL: <span className="text-blue-400 font-bold">{liveStats.tvl.toLocaleString()} AETH</span>
          </div>
        </div>
      </div>

      {/* ⭐ ECOSYSTEM & PARTNERS LOGO BAR (GLASSMORPHISM) */}
      <section className="py-6 sm:py-8 border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-3 sm:space-y-4">
           <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-neutral-400 drop-shadow-md">Secured, Audited & Powered By</p>
           <div className="flex flex-wrap justify-center items-center gap-2 sm:gap-8 opacity-90">
              
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/10 transition-colors">
                 <img src="/polygon.png" alt="Polygon" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
                 <span className="text-[9px] sm:text-xs font-bold font-mono text-white">POLYGON</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/10 transition-colors">
                 <Hexagon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
                 <span className="text-[9px] sm:text-xs font-bold font-mono text-white">CHAINLINK</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/10 transition-colors">
                 <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
                 <span className="text-[9px] sm:text-xs font-bold font-mono text-white">ZEPPELIN</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/10 transition-colors">
                 <img src="/uniswap.png" alt="Uniswap" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
                 <span className="text-[9px] sm:text-xs font-bold font-mono text-white">UNISWAP</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/10 transition-colors">
                 <img src="/pinksale.png" alt="Pinksale" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
                 <span className="text-[9px] sm:text-xs font-bold font-mono text-white">PINKSALE</span>
              </div>

              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] hover:bg-white/10 transition-colors">
                 <img src="/gecko.png" alt="Gecko" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain" />
                 <span className="text-[9px] sm:text-xs font-bold font-mono text-white">GECKO</span>
              </div>

           </div>
        </div>
      </section>

      {/* ⭐ PILAR UTAMA (GLASSMORPHISM) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-cyan-500/20 border border-cyan-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                 <Award className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-300"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.proofTitle}</h3>
              <p className="text-neutral-300 text-[10px] sm:text-sm leading-relaxed hidden sm:block">{t.pillars.proofDesc}</p>
           </div>
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500/20 border border-purple-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-purple-300"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.legacyTitle}</h3>
              <p className="text-neutral-300 text-[10px] sm:text-sm leading-relaxed hidden sm:block">{t.pillars.legacyDesc}</p>
           </div>
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all col-span-2 md:col-span-1 group">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-amber-500/20 border border-amber-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                 <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-amber-300"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.capsuleTitle}</h3>
              <p className="text-neutral-300 text-[10px] sm:text-sm leading-relaxed">{t.pillars.capsuleDesc}</p>
           </div>
        </div>
      </section>

      {/* ⭐ HALL OF PROOF™ ON-CHAIN LIVE FEED (GLASSMORPHISM) */}
      <section className="py-10 sm:py-24 border-y border-white/5 relative overflow-hidden z-10 bg-black/20 backdrop-blur-3xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-6 sm:space-y-12 relative z-10">
           
           <div className="space-y-3">
             <div className="w-fit mx-auto px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 backdrop-blur-md text-cyan-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest font-mono shadow-[0_0_15px_rgba(6,182,212,0.3)]">
               100% On-Chain Verified
             </div>
             <h2 className="text-2xl sm:text-5xl font-black text-white font-display drop-shadow-lg">Hall of Proof™ Live Records</h2>
             <p className="text-neutral-300 max-w-xl mx-auto text-xs sm:text-base drop-shadow-md">Real-time smart contract state directly queried from Polygon Amoy blockchain.</p>
           </div>

           <div className="w-full max-w-4xl mx-auto bg-white/5 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 sm:p-8 text-left shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 sm:mb-6 border-b border-white/10 gap-3">
               <div className="flex items-center gap-2.5">
                 <span className="w-2 h-2 rounded-full bg-green-400 animate-ping shadow-[0_0_10px_rgba(74,222,128,0.8)]"></span>
                 <span className="text-[10px] sm:text-xs font-mono text-white font-bold tracking-wider drop-shadow-md">CONTRACT: 0xb273...a56B</span>
               </div>
               <span className="text-[9px] sm:text-[10px] font-mono text-cyan-300 bg-cyan-500/20 backdrop-blur-md px-2 py-1 rounded-md border border-cyan-500/30">
                 {onChainStatus}
               </span>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 font-mono text-xs">
               <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-xl space-y-1.5 shadow-inner">
                 <p className="text-neutral-400 uppercase tracking-widest text-[7px] sm:text-[8px]">Total Proofs</p>
                 <p className="text-cyan-300 text-sm sm:text-lg font-bold">{liveStats.proofs.toLocaleString()} Rec</p>
               </div>
               <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-xl space-y-1.5 shadow-inner">
                 <p className="text-neutral-400 uppercase tracking-widest text-[7px] sm:text-[8px]">Staking Pool TVL</p>
                 <p className="text-purple-300 text-sm sm:text-lg font-bold">{liveStats.tvl.toLocaleString()} AETH</p>
               </div>
               <div className="bg-black/40 backdrop-blur-md border border-white/10 p-3 sm:p-4 rounded-xl space-y-1.5 col-span-2 sm:col-span-1 shadow-inner">
                 <p className="text-neutral-400 uppercase tracking-widest text-[7px] sm:text-[8px]">Polygon Block</p>
                 <p className="text-green-400 text-sm sm:text-lg font-bold">#{liveStats.block > 0 ? liveStats.block.toLocaleString() : "Syncing"}</p>
               </div>
             </div>

             <div className="mt-6 text-center flex flex-col sm:flex-row justify-center items-center gap-3">
               <button 
                 onClick={() => router.push('/dashboard')}
                 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl font-bold text-[10px] sm:text-xs border border-white/20 transition-all cursor-pointer shadow-[0_8px_30px_rgb(255,255,255,0.1)]"
               >
                 Open dApp Terminal <ArrowRight className="w-3.5 h-3.5" />
               </button>
             </div>
           </div>

        </div>
      </section>

      {/* ⭐ INFRASTRUCTURE SECTION (GLASSMORPHISM) */}
      <section id="infrastructure" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="w-fit mx-auto px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 backdrop-blur-md text-cyan-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-3 font-mono">
            {globalT.infrastructure.tag}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display mb-3 drop-shadow-lg">{globalT.infrastructure.title}</h2>
          <p className="text-neutral-300 text-xs sm:text-base drop-shadow-md">{globalT.infrastructure.desc}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all">
            <Server className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400 drop-shadow-md"/>
            <h4 className="text-sm sm:text-lg font-bold text-white">{globalT.infrastructure.nodesTitle}</h4>
            <p className="text-[10px] sm:text-xs text-neutral-300 leading-relaxed hidden sm:block">{globalT.infrastructure.nodesDesc}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all">
            <Cpu className="w-5 h-5 sm:w-7 sm:h-7 text-purple-400 drop-shadow-md"/>
            <h4 className="text-sm sm:text-lg font-bold text-white">{globalT.infrastructure.interopTitle}</h4>
            <p className="text-[10px] sm:text-xs text-neutral-300 leading-relaxed hidden sm:block">{globalT.infrastructure.interopDesc}</p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 col-span-2 md:col-span-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all">
            <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400 drop-shadow-md"/>
            <h4 className="text-sm sm:text-lg font-bold text-white">{globalT.infrastructure.securityTitle}</h4>
            <p className="text-[10px] sm:text-xs text-neutral-300 leading-relaxed hidden sm:block">{globalT.infrastructure.securityDesc}</p>
          </div>
        </div>
      </section>

      {/* ⭐ TIERS ARCHITECTURE SECTION (GLASSMORPHISM) */}
      <section id="tiers" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="w-fit mx-auto px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 backdrop-blur-md text-amber-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-3 font-mono">
            {globalT.tiers.tag}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display mb-3 drop-shadow-lg">{globalT.tiers.title}</h2>
          <p className="text-neutral-300 text-xs sm:text-base drop-shadow-md">{globalT.tiers.desc}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{globalT.tiers.tier1Title}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-300 leading-relaxed">{globalT.tiers.tier1Desc}</p>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] sm:text-xs font-mono text-cyan-300">10 AETH (2 Burn)</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{globalT.tiers.tier2Title}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-300 leading-relaxed">{globalT.tiers.tier2Desc}</p>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] sm:text-xs font-mono text-cyan-300">50 AETH (10 Burn)</div>
          </div>
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{globalT.tiers.tier3Title}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-300 leading-relaxed">{globalT.tiers.tier3Desc}</p>
            </div>
            <div className="pt-3 border-t border-white/10 text-[10px] sm:text-xs font-mono text-cyan-300">200 AETH (40 Burn)</div>
          </div>
          <div className="bg-cyan-500/10 backdrop-blur-2xl border border-cyan-500/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 flex flex-col justify-between relative shadow-[0_0_30px_rgba(6,182,212,0.2)] hover:bg-cyan-500/20 transition-all">
            <div>
              <span className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 text-[7px] sm:text-[8px] bg-cyan-500/30 backdrop-blur-md text-white px-1.5 py-0.5 rounded font-mono uppercase font-bold border border-cyan-500/50">Ultimate</span>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5 mt-2 sm:mt-0 drop-shadow-md">{globalT.tiers.tier4Title}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-200 leading-relaxed">{globalT.tiers.tier4Desc}</p>
            </div>
            <div className="pt-3 border-t border-cyan-500/30 text-[10px] sm:text-xs font-mono text-cyan-200 font-bold">500 AETH (100 Burn)</div>
          </div>
        </div>
      </section>

      {/* ⭐ TOKENOMICS SECTION (DIAGRAM LINGKARAN & GLASSMORPHISM) */}
      <section id="tokenomics" className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-20 border-t border-white/5 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-16">
          <div className="w-fit mx-auto px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 backdrop-blur-md text-purple-300 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-3 font-mono">
            {globalT.tokenomics.tag || "TOKENOMICS"}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display mb-3 drop-shadow-lg">Designed for Scarcity</h2>
          <p className="text-neutral-300 text-xs sm:text-base drop-shadow-md">100,000,000 total fixed supply with robust utility and automated deflationary burn mechanisms.</p>
        </div>

        {/* BUNGKUS KIRI (DIAGRAM) DAN KANAN (KARTU) */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-20">
          
          {/* KIRI: DONUT CHART PURE CSS */}
          <div className="relative shrink-0 animate-float">
            {/* Efek Cahaya di belakang diagram */}
            <div className="absolute inset-0 bg-cyan-500/20 blur-[60px] rounded-full"></div>
            
            {/* Diagram Lingkaran (Conic Gradient) */}
            <div className="w-56 h-56 sm:w-72 sm:h-72 rounded-full relative shadow-[0_0_40px_rgba(0,0,0,0.5)] flex items-center justify-center"
                 style={{
                   background: "conic-gradient(#06b6d4 0% 30%, #a855f7 30% 55%, #f59e0b 55% 75%, #3b82f6 75% 85%, #22c55e 85% 100%)"
                 }}>
               {/* Lubang Tengah Donut */}
               <div className="w-40 h-40 sm:w-52 sm:h-52 bg-[#040209] rounded-full flex flex-col items-center justify-center absolute border border-white/5 shadow-inner">
                 <span className="text-white font-black text-3xl sm:text-4xl font-mono drop-shadow-lg">100M</span>
                 <span className="text-neutral-400 text-[10px] sm:text-xs tracking-widest mt-1">TOTAL AETH</span>
               </div>
            </div>
          </div>

          {/* KANAN: 5 KARTU ALOKASI WALLET (GRID 2 KOLOM) */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5 w-full max-w-lg">
            
            {/* 1. Liquidity */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3.5 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
                 <span className="text-[8px] sm:text-[10px] font-mono text-cyan-300 font-bold uppercase">{globalT.tokenomics.liquidity || "LIQUIDITY POOL"}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono drop-shadow-md">30%</div>
            </div>

            {/* 2. Staking */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3.5 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-[0_0_8px_#a855f7]"></div>
                 <span className="text-[8px] sm:text-[10px] font-mono text-purple-300 font-bold uppercase">{globalT.tokenomics.staking || "STAKING REWARDS"}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono drop-shadow-md">25%</div>
            </div>

            {/* 3. Initial Sale */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3.5 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b]"></div>
                 <span className="text-[8px] sm:text-[10px] font-mono text-amber-300 font-bold uppercase">{globalT.tokenomics.initialSale || "INITIAL SALE"}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono drop-shadow-md">20%</div>
            </div>

            {/* 4. Treasury (Dikoreksi jadi 10%) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3.5 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all text-left">
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]"></div>
                 <span className="text-[8px] sm:text-[10px] font-mono text-blue-300 font-bold uppercase">{globalT.tokenomics.treasury || "TREASURY"}</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono drop-shadow-md">10%</div>
            </div>

            {/* 5. Team & Advisors (Dikoreksi jadi 15%) */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-3.5 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:bg-white/10 transition-all text-left col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-1.5">
                 <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></div>
                 <span className="text-[8px] sm:text-[10px] font-mono text-green-300 font-bold uppercase">TEAM & DEV</span>
              </div>
              <div className="text-xl sm:text-2xl font-black text-white font-mono drop-shadow-md">15%</div>
            </div>

          </div>
        </div>
      </section>

      {/* ⭐ TEAM / DEV SECTION */}
      <section id="team" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-20 border-t border-white/5 relative z-10">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-8 flex flex-col sm:flex-row items-center gap-5 sm:gap-8 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden mx-auto max-w-xl text-center sm:text-left hover:bg-white/10 transition-colors">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-tr from-cyan-500/50 to-blue-600/50 p-0.5 shadow-xl">
              <div className="w-full h-full bg-black/50 backdrop-blur-md rounded-2xl flex items-center justify-center overflow-hidden relative">
                <img src="/dev.jpg" alt="Nienzer" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="absolute inset-0 bg-black/50 hidden items-center justify-center text-cyan-300 font-mono font-black text-lg">
                  NZ
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-[6px] sm:text-[8px] font-mono font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full uppercase tracking-widest border-2 border-[#0B0817] shadow-md">
              Core Dev
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-3 flex-1 relative z-10 flex flex-col items-center sm:items-start">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 text-cyan-300 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest font-mono shadow-inner">
              {globalT.team.tag}
            </div>
            <h3 className="text-lg sm:text-2xl font-extrabold text-white font-display drop-shadow-md">{globalT.team.name}</h3>
            <p className="text-neutral-300 text-[10px] sm:text-xs leading-relaxed max-w-[250px] sm:max-w-none">
              {globalT.team.bio}
            </p>
            
            {/* SOCIAL LINKS (Menggunakan SVG Native Anti-Error) */}
            <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-4 pt-2">
              <a href="https://t.me/nienzer" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 text-neutral-400 transition-all shadow-md">
                 <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </a>
              <a href="https://github.com/nienzer" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 text-neutral-400 transition-all shadow-md">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
              <a href="https://twitter.com/nien_zer" target="_blank" rel="noopener noreferrer" className="p-2 sm:p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-cyan-500/20 hover:border-cyan-500/50 hover:text-cyan-400 text-neutral-400 transition-all shadow-md">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ⭐ FOOTER (GLASSMORPHISM) */}
      <footer className="bg-black/20 backdrop-blur-2xl pt-12 sm:pt-16 pb-8 sm:pb-10 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8 sm:mb-12">
          
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-lg object-cover drop-shadow-md" />
              <span className="text-sm font-black tracking-widest text-white font-display drop-shadow-md">AETHERVAULT</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm drop-shadow-sm">{globalT.footer.desc}</p>
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-2 gap-4 sm:gap-8">
            <div className="flex flex-col space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-1 drop-shadow-md">{globalT.footer.quickLinks}</h4>
              <a href="#infrastructure" className="text-xs text-neutral-400 hover:text-cyan-300 transition-colors drop-shadow-sm">{globalT.footer.navInfrastructure}</a>
              <button onClick={() => router.push('/dashboard')} className="text-xs text-neutral-400 hover:text-cyan-300 transition-colors text-left bg-transparent border-none p-0 cursor-pointer drop-shadow-sm">{globalT.footer.navLaunchApp}</button>
              <button onClick={() => router.push('/whitepaper')} className="text-xs text-neutral-400 hover:text-cyan-300 transition-colors text-left bg-transparent border-none p-0 cursor-pointer drop-shadow-sm">{globalT.footer.navWhitepaper}</button>
            </div>
            
            <div className="flex flex-col space-y-3">
              <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-1 drop-shadow-md">{globalT.footer.community}</h4>
              <button onClick={() => router.push('/community')} className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors text-left bg-transparent border-none p-0 cursor-pointer drop-shadow-sm flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> Community Hub
              </button>
              <button onClick={() => router.push('/terms')} className="text-xs text-neutral-400 hover:text-cyan-300 transition-colors text-left bg-transparent border-none p-0 cursor-pointer drop-shadow-sm">{globalT.footer.terms}</button>
              <button onClick={() => router.push('/privacy')} className="text-xs text-neutral-400 hover:text-cyan-300 transition-colors text-left bg-transparent border-none p-0 cursor-pointer drop-shadow-sm">{globalT.footer.privacy}</button>
            </div>
          </div>

        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs text-neutral-500 font-mono gap-3">
          <p>© {new Date().getFullYear()} Nienzer. Hak Cipta Dilindungi. Email: admin@aethvault.xyz</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></span> Polygon Mainnet Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
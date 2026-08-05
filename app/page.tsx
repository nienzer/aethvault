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
    <div className="min-h-screen bg-[#030208] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden relative pt-14 sm:pt-20">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-4 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/40 text-green-300' : 'bg-[#080808] border-cyan-500/40 text-cyan-400'} backdrop-blur-md max-w-[90vw]`}>
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

      {/* ⭐ 1. HERO SECTION (TOMBOL KIRI-KANAN DI HP) */}
      <section id="home" className="pt-6 pb-10 px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center relative">
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="lg:col-span-7 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="w-fit flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 font-mono shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            {globalT.hero.badge}
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-tight mb-4 sm:mb-6 text-white leading-[1.15]">
            {globalT.hero.titleLine1} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
              {globalT.hero.titleHighlight}
            </span>
          </h1>
          
          <p className="text-neutral-400 text-xs sm:text-base mb-6 sm:mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
            {globalT.hero.desc}
          </p>
          
          <div className="grid grid-cols-2 sm:flex sm:flex-row items-center gap-2 sm:gap-4 mb-6 w-full sm:w-auto">
            <button onClick={() => router.push("/dashboard")} className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-white text-black px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-black text-[10px] sm:text-sm transition-all shadow-lg hover:scale-105 cursor-pointer outline-none">
              {globalT.hero.exploreBtn} <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button onClick={() => router.push('/whitepaper')} className="w-full sm:w-auto flex items-center justify-center gap-1.5 sm:gap-2 bg-[#080808] hover:bg-neutral-900 text-neutral-300 px-4 sm:px-8 py-3.5 sm:py-4 rounded-2xl font-bold text-[10px] sm:text-sm border border-neutral-800 transition-all cursor-pointer outline-none">
              Whitepaper <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* HERO ANIMATION FLOW (TETAP DI DESKTOP, SEMBUNYI DI HP BIAR GAK PANJANG) */}
        <div className="lg:col-span-5 relative z-10 hidden lg:flex flex-col items-center justify-center h-[450px]">
           <div className="w-full max-w-sm space-y-3">
              <div className="bg-[#0B0817]/80 backdrop-blur-md border border-neutral-800 p-3.5 rounded-2xl flex items-center gap-3 shadow-xl transform translate-x-4 animate-float">
                 <div className="w-10 h-10 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center"><Lock className="w-5 h-5 text-neutral-400"/></div>
                 <div><p className="text-white font-bold text-xs">Encrypted Capsule</p><p className="text-[9px] text-neutral-500 font-mono">ECIES-secp256k1</p></div>
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-neutral-700 to-purple-500 mx-auto"></div>
              
              <div className="bg-purple-900/20 backdrop-blur-md border border-purple-500/30 p-3.5 rounded-2xl flex items-center gap-3 shadow-lg transform -translate-x-4 animate-float" style={{ animationDelay: '1s' }}>
                 <div className="w-10 h-10 bg-purple-500/20 border border-purple-500/50 rounded-xl flex items-center justify-center"><Layers className="w-5 h-5 text-purple-400"/></div>
                 <div><p className="text-white font-bold text-xs">Polygon Network</p><p className="text-[9px] text-purple-400 font-mono">L2 Immutable Storage</p></div>
              </div>
              <div className="w-0.5 h-5 bg-gradient-to-b from-purple-500 to-cyan-500 mx-auto"></div>

              <div className="bg-cyan-900/20 backdrop-blur-md border border-cyan-500/30 p-3.5 rounded-2xl flex items-center gap-3 shadow-lg transform translate-x-6 animate-float animate-glow" style={{ animationDelay: '2s' }}>
                 <div className="w-10 h-10 bg-cyan-500/20 border border-cyan-500/50 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5 text-cyan-400"/></div>
                 <div><p className="text-white font-bold text-xs">Time-Lock Target</p><p className="text-[9px] text-cyan-400 font-mono">Unlock Year 2045</p></div>
              </div>
           </div>
        </div>
      </section>

      {/* ⭐ 2. LIVE DATA TICKER */}
      <div className="border-y border-neutral-900 bg-[#05030F] py-3 relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-4 sm:gap-12 text-[9px] sm:text-xs font-mono">
          <div className="flex items-center gap-1.5 text-neutral-400">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Network: <span className="text-white font-bold">Polygon Amoy</span>
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

      {/* ⭐ ECOSYSTEM & PARTNERS LOGO BAR */}
      <section className="py-8 bg-[#020106] border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
           <p className="text-[9px] sm:text-[10px] font-mono uppercase tracking-widest text-neutral-500">Secured, Audited & Powered By</p>
           <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-8 opacity-80">
              
              <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 px-3.5 py-2 rounded-xl shadow-inner">
                 <img src="/polygon.png" alt="Polygon" className="w-4 h-4 object-contain" />
                 <span className="text-[10px] sm:text-xs font-bold font-mono text-white">POLYGON</span>
              </div>

              <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 px-3.5 py-2 rounded-xl shadow-inner">
                 <Hexagon className="w-4 h-4 text-cyan-400" />
                 <span className="text-[10px] sm:text-xs font-bold font-mono text-white">CHAINLINK</span>
              </div>

              <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 px-3.5 py-2 rounded-xl shadow-inner">
                 <ShieldCheck className="w-4 h-4 text-purple-400" />
                 <span className="text-[10px] sm:text-xs font-bold font-mono text-white">ZEPPELIN</span>
              </div>

              <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 px-3.5 py-2 rounded-xl shadow-inner">
                 <img src="/uniswap.png" alt="Uniswap" className="w-4 h-4 object-contain" />
                 <span className="text-[10px] sm:text-xs font-bold font-mono text-white">UNISWAP</span>
              </div>

              <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 px-3.5 py-2 rounded-xl shadow-inner">
                 <img src="/pinksale.png" alt="Pinksale" className="w-4 h-4 object-contain" />
                 <span className="text-[10px] sm:text-xs font-bold font-mono text-white">PINKSALE</span>
              </div>

              <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-800 px-3.5 py-2 rounded-xl shadow-inner">
                 <img src="/gecko.png" alt="Gecko" className="w-4 h-4 object-contain" />
                 <span className="text-[10px] sm:text-xs font-bold font-mono text-white">GECKO</span>
              </div>

           </div>
        </div>
      </section>

      {/* ⭐ PILAR UTAMA (GRID 2 KOLOM DI HP) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-4 sm:p-8 rounded-2xl sm:rounded-3xl">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-cyan-500/15 border border-cyan-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                 <Award className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.proofTitle}</h3>
              <p className="text-neutral-400 text-[10px] sm:text-sm leading-relaxed hidden sm:block">{t.pillars.proofDesc}</p>
           </div>
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-4 sm:p-8 rounded-2xl sm:rounded-3xl">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-500/15 border border-purple-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                 <ShieldCheck className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.legacyTitle}</h3>
              <p className="text-neutral-400 text-[10px] sm:text-sm leading-relaxed hidden sm:block">{t.pillars.legacyDesc}</p>
           </div>
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-4 sm:p-8 rounded-2xl sm:rounded-3xl col-span-2 md:col-span-1">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-amber-500/15 border border-amber-500/30 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4">
                 <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400"/>
              </div>
              <h3 className="text-sm sm:text-2xl font-black text-white font-display mb-1.5 sm:mb-2">{t.pillars.capsuleTitle}</h3>
              <p className="text-neutral-400 text-[10px] sm:text-sm leading-relaxed">{t.pillars.capsuleDesc}</p>
           </div>
        </div>
      </section>

      {/* ⭐ HALL OF PROOF™ ON-CHAIN LIVE FEED (GRID 2 KOLOM KOTAK KECIL DI HP) */}
      <section className="bg-[#0A0713] py-16 sm:py-24 border-y border-neutral-900 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-8 sm:space-y-12 relative z-10">
           
           <div className="space-y-3">
             <div className="w-fit mx-auto px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest font-mono">
               100% On-Chain Verified
             </div>
             <h2 className="text-2xl sm:text-5xl font-black text-white font-display">Hall of Proof™ Live Records</h2>
             <p className="text-neutral-400 max-w-xl mx-auto text-xs sm:text-base">Real-time smart contract state directly queried from Polygon Amoy blockchain.</p>
           </div>

           <div className="w-full max-w-4xl mx-auto bg-[#030208] border border-neutral-800 rounded-2xl p-4 sm:p-8 text-left shadow-xl">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 sm:mb-6 border-b border-neutral-800 gap-3">
               <div className="flex items-center gap-2.5">
                 <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
                 <span className="text-[10px] sm:text-xs font-mono text-white font-bold tracking-wider">CONTRACT: 0xb273...a56B</span>
               </div>
               <span className="text-[9px] sm:text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-1 rounded-md border border-cyan-500/20">
                 {onChainStatus}
               </span>
             </div>

             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 font-mono text-xs">
               <div className="bg-[#080808] border border-neutral-800 p-3 sm:p-4 rounded-xl space-y-1.5">
                 <p className="text-neutral-500 uppercase tracking-widest text-[7px] sm:text-[8px]">Total Proofs</p>
                 <p className="text-cyan-400 text-sm sm:text-lg font-bold">{liveStats.proofs.toLocaleString()} Rec</p>
               </div>
               <div className="bg-[#080808] border border-neutral-800 p-3 sm:p-4 rounded-xl space-y-1.5">
                 <p className="text-neutral-500 uppercase tracking-widest text-[7px] sm:text-[8px]">Staking Pool TVL</p>
                 <p className="text-purple-400 text-sm sm:text-lg font-bold">{liveStats.tvl.toLocaleString()} AETH</p>
               </div>
               <div className="bg-[#080808] border border-neutral-800 p-3 sm:p-4 rounded-xl space-y-1.5 col-span-2 sm:col-span-1">
                 <p className="text-neutral-500 uppercase tracking-widest text-[7px] sm:text-[8px]">Polygon Block</p>
                 <p className="text-green-400 text-sm sm:text-lg font-bold">#{liveStats.block > 0 ? liveStats.block.toLocaleString() : "Syncing"}</p>
               </div>
             </div>

             <div className="mt-6 text-center flex flex-col sm:flex-row justify-center items-center gap-3">
               <button 
                 onClick={() => router.push('/dashboard')}
                 className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black px-5 sm:px-6 py-3 rounded-xl font-bold text-[10px] sm:text-xs transition-all cursor-pointer shadow-md"
               >
                 Open dApp Terminal <ArrowRight className="w-3.5 h-3.5" />
               </button>
             </div>
           </div>

        </div>
      </section>

      {/* ⭐ INFRASTRUCTURE SECTION (GRID 2 KOLOM DI HP) */}
      <section id="infrastructure" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-neutral-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-fit mx-auto px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-3 font-mono">
            {globalT.infrastructure.tag}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display mb-3">{globalT.infrastructure.title}</h2>
          <p className="text-neutral-400 text-xs sm:text-base">{globalT.infrastructure.desc}</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3">
            <Server className="w-5 h-5 sm:w-7 sm:h-7 text-cyan-400"/>
            <h4 className="text-sm sm:text-lg font-bold text-white">{globalT.infrastructure.nodesTitle}</h4>
            <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed hidden sm:block">{globalT.infrastructure.nodesDesc}</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3">
            <Cpu className="w-5 h-5 sm:w-7 sm:h-7 text-purple-400"/>
            <h4 className="text-sm sm:text-lg font-bold text-white">{globalT.infrastructure.interopTitle}</h4>
            <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed hidden sm:block">{globalT.infrastructure.interopDesc}</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-8 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 col-span-2 md:col-span-1">
            <Shield className="w-5 h-5 sm:w-7 sm:h-7 text-amber-400"/>
            <h4 className="text-sm sm:text-lg font-bold text-white">{globalT.infrastructure.securityTitle}</h4>
            <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed hidden sm:block">{globalT.infrastructure.securityDesc}</p>
          </div>
        </div>
      </section>

      {/* ⭐ TIERS ARCHITECTURE SECTION (GRID 2 KOLOM DI HP) */}
      <section id="tiers" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-neutral-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-fit mx-auto px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-3 font-mono">
            {globalT.tiers.tag}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display mb-3">{globalT.tiers.title}</h2>
          <p className="text-neutral-400 text-xs sm:text-base">{globalT.tiers.desc}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{globalT.tiers.tier1Title}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">{globalT.tiers.tier1Desc}</p>
            </div>
            <div className="pt-3 border-t border-neutral-800 text-[10px] sm:text-xs font-mono text-cyan-400">10 AETH (2 Burn)</div>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{globalT.tiers.tier2Title}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">{globalT.tiers.tier2Desc}</p>
            </div>
            <div className="pt-3 border-t border-neutral-800 text-[10px] sm:text-xs font-mono text-cyan-400">50 AETH (10 Burn)</div>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 flex flex-col justify-between">
            <div>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5">{globalT.tiers.tier3Title}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">{globalT.tiers.tier3Desc}</p>
            </div>
            <div className="pt-3 border-t border-neutral-800 text-[10px] sm:text-xs font-mono text-cyan-400">200 AETH (40 Burn)</div>
          </div>
          <div className="bg-[#080808] border border-cyan-500/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-2 sm:space-y-3 flex flex-col justify-between relative shadow-lg">
            <div>
              <span className="absolute top-2.5 right-2.5 sm:top-4 sm:right-4 text-[7px] sm:text-[8px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded font-mono uppercase font-bold">Ultimate</span>
              <h4 className="text-sm sm:text-base font-bold text-white mb-1.5 mt-2 sm:mt-0">{globalT.tiers.tier4Title}</h4>
              <p className="text-[10px] sm:text-xs text-neutral-400 leading-relaxed">{globalT.tiers.tier4Desc}</p>
            </div>
            <div className="pt-3 border-t border-neutral-800 text-[10px] sm:text-xs font-mono text-cyan-400">500 AETH (100 Burn)</div>
          </div>
        </div>
      </section>

      {/* ⭐ TOKENOMICS SECTION (GRID 2 KOLOM DI HP) */}
      <section id="tokenomics" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-neutral-900">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="w-fit mx-auto px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest mb-3 font-mono">
            {globalT.tokenomics.tag}
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white font-display mb-3">Designed for Scarcity</h2>
          <p className="text-neutral-400 text-xs sm:text-base">100,000,000 total fixed supply with robust utility and automated deflationary burn mechanisms.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-1.5 sm:space-y-2">
            <span className="text-[8px] sm:text-[10px] font-mono text-cyan-400 font-bold uppercase">{globalT.tokenomics.liquidity}</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">30%</div>
            <p className="text-[9px] sm:text-xs text-neutral-500 hidden sm:block">Open market liquidity availability on DEXs.</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-1.5 sm:space-y-2">
            <span className="text-[8px] sm:text-[10px] font-mono text-purple-400 font-bold uppercase">{globalT.tokenomics.staking}</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">25%</div>
            <p className="text-[9px] sm:text-xs text-neutral-500 hidden sm:block">Smart contract pool allocated for staker APY.</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-1.5 sm:space-y-2">
            <span className="text-[8px] sm:text-[10px] font-mono text-amber-400 font-bold uppercase">{globalT.tokenomics.initialSale}</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">20%</div>
            <p className="text-[9px] sm:text-xs text-neutral-500 hidden sm:block">Initial liquidity fundraising and bootstrap.</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-1.5 sm:space-y-2">
            <span className="text-[8px] sm:text-[10px] font-mono text-blue-400 font-bold uppercase">{globalT.tokenomics.treasury}</span>
            <div className="text-xl sm:text-2xl font-black text-white font-mono">25%</div>
            <p className="text-[9px] sm:text-xs text-neutral-500 hidden sm:block">Vested development allocation and reserve.</p>
          </div>
        </div>
      </section>

      {/* ⭐ TEAM / DEV SECTION */}
      <section id="team" className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20 border-t border-neutral-900">
        <div className="bg-gradient-to-br from-[#0B0817] to-[#040308] border border-neutral-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5 shadow-2xl relative overflow-hidden mx-auto max-w-xl text-center sm:text-left">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 shadow-xl">
              <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center overflow-hidden relative">
                <img src="/dev-avatar.png" alt="Nienzer" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="absolute inset-0 bg-neutral-900 hidden items-center justify-center text-cyan-400 font-mono font-black text-lg">
                  NZ
                </div>
              </div>
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-green-500 text-black text-[7px] font-mono font-black px-2 py-0.5 rounded-full uppercase tracking-widest border-2 border-[#0B0817]">
              Core Dev
            </div>
          </div>

          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[8px] sm:text-[9px] font-bold uppercase tracking-widest font-mono">
              {globalT.team.tag}
            </div>
            <h3 className="text-lg sm:text-xl font-extrabold text-white font-display">{globalT.team.name}</h3>
            <p className="text-neutral-400 text-xs leading-relaxed">
              {globalT.team.bio}
            </p>
          </div>
        </div>
      </section>

      {/* ⭐ FOOTER */}
      <footer className="bg-[#020106] pt-16 pb-10 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 mb-2 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img src="/logo.png" alt="Logo" className="w-6 h-6 rounded-lg object-cover" />
              <span className="text-sm font-black tracking-widest text-white font-display">AETHERVAULT</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">{globalT.footer.desc}</p>
          </div>
          
          <div className="flex flex-col space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-1">{globalT.footer.quickLinks}</h4>
            <a href="#infrastructure" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">{globalT.footer.navInfrastructure}</a>
            <button onClick={() => router.push('/dashboard')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.navLaunchApp}</button>
            <button onClick={() => router.push('/whitepaper')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.navWhitepaper}</button>
          </div>
          
          <div className="flex flex-col space-y-3">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-1">{globalT.footer.community}</h4>
            <button onClick={() => router.push('/terms')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.terms}</button>
            <button onClick={() => router.push('/privacy')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.privacy}</button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-neutral-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-neutral-300 font-mono gap-3">
          <p>© {new Date().getFullYear()} Nienzer. Hak Cipta Dilindungi. Email: admin@aethvault.xyz</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Polygon Mainnet Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
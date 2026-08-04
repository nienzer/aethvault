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
  const { t: globalT, lang, setLang } = useLanguage();
  const t = globalT.landing;
  const navT = globalT.nav;

  const [toast, setToast] = useState(null);
  const [liveStats, setLiveStats] = useState({ block: 0, proofs: 0, tvl: 0, stakers: 0 });

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
      } catch (e) {
        console.error("Gagal menarik data on-chain landing page:", e);
      }
    };

    fetchLiveBlockchainData();
    const interval = setInterval(fetchLiveBlockchainData, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#030208] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-4 sm:right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/40 text-green-300' : 'bg-[#080808] border-cyan-500/40 text-cyan-400'} backdrop-blur-md max-w-[90vw]`}>
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />
            <p className="text-xs sm:text-sm font-medium">{toast.msg}</p>
          </div>
        </div>
      )}

      {/* CSS Animasi Kustom */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 15px rgba(6, 182, 212, 0.2); }
          50% { box-shadow: 0 0 30px rgba(6, 182, 212, 0.6); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>

      {/* ⭐ NAVBAR TUNGGAL FINAL (TIDAK DOBEL) */}
      <nav className="sticky top-0 z-50 bg-[#030208]/95 backdrop-blur-xl border-b border-neutral-900 py-4 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-xl object-cover" />
            <span className="text-lg font-black tracking-widest text-white font-display">AETHERVAULT</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-xs font-bold font-mono text-neutral-400">
            <a href="#home" className="hover:text-cyan-400 transition-colors">{navT.home}</a>
            <a href="#infra" className="hover:text-cyan-400 transition-colors">{navT.infra}</a>
            <a href="#tiers" className="hover:text-cyan-400 transition-colors">{navT.tiers}</a>
            <a href="#tokenomics" className="hover:text-cyan-400 transition-colors">{navT.tokenomics}</a>
            <a href="#team" className="hover:text-cyan-400 transition-colors">{navT.team}</a>
            <button onClick={() => router.push('/whitepaper')} className="hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">Whitepaper</button>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
              <button 
                onClick={() => setLang('id')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${lang === 'id' ? 'bg-cyan-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                ID
              </button>
              <button 
                onClick={() => setLang('en')}
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${lang === 'en' ? 'bg-cyan-500 text-black shadow-md' : 'text-neutral-400 hover:text-white'}`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={() => router.push("/dashboard")}
              className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              {navT.launchApp}
            </button>
          </div>
        </div>
      </nav>

      {/* ⭐ 1. HERO SECTION & ANIMASI FLOW LENGKAP */}
      <section id="home" className="pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="lg:col-span-7 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="w-fit flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-6 font-mono shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            {globalT.hero.badge}
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-tight mb-6 text-white leading-[1.1]">
            {globalT.hero.titleLine1} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
              {globalT.hero.titleHighlight}
            </span>
          </h1>
          
          <p className="text-neutral-400 text-sm sm:text-base mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
            {globalT.hero.desc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto px-4 sm:px-0">
            <button onClick={() => router.push("/dashboard")} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 cursor-pointer outline-none">
              {globalT.hero.exploreBtn} <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => router.push('/whitepaper')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#080808] hover:bg-neutral-900 text-neutral-300 px-8 py-4 rounded-2xl font-bold text-sm border border-neutral-800 transition-all cursor-pointer outline-none hover:border-cyan-500/30">
              {globalT.hero.whitepaperBtn} <FileText className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* HERO ANIMATION FLOW LENGKAP (TIDAK ADA YANG HILANG) */}
        <div className="lg:col-span-5 relative z-10 hidden lg:flex flex-col items-center justify-center h-[500px]">
           <div className="w-full max-w-sm space-y-4">
              <div className="bg-[#0B0817]/80 backdrop-blur-md border border-neutral-800 p-4 rounded-2xl flex items-center gap-4 shadow-xl transform translate-x-4 animate-float">
                 <div className="w-12 h-12 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center shadow-inner"><Lock className="w-6 h-6 text-neutral-400"/></div>
                 <div><p className="text-white font-bold text-sm">Encrypted Capsule</p><p className="text-[10px] text-neutral-500 font-mono">ECIES-secp256k1</p></div>
              </div>
              <div className="w-0.5 h-6 bg-gradient-to-b from-neutral-700 to-purple-500 mx-auto"></div>
              
              <div className="bg-purple-900/20 backdrop-blur-md border border-purple-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(168,85,247,0.15)] transform -translate-x-4 animate-float" style={{ animationDelay: '1s' }}>
                 <div className="w-12 h-12 bg-purple-500/20 border border-purple-500/50 rounded-xl flex items-center justify-center shadow-inner"><Layers className="w-6 h-6 text-purple-400"/></div>
                 <div><p className="text-white font-bold text-sm">Polygon Network</p><p className="text-[10px] text-purple-400 font-mono">L2 Immutable Storage</p></div>
              </div>
              <div className="w-0.5 h-6 bg-gradient-to-b from-purple-500 to-cyan-500 mx-auto"></div>

              <div className="bg-cyan-900/20 backdrop-blur-md border border-cyan-500/30 p-4 rounded-2xl flex items-center gap-4 shadow-[0_0_30px_rgba(6,182,212,0.15)] transform translate-x-6 animate-float animate-glow" style={{ animationDelay: '2s' }}>
                 <div className="w-12 h-12 bg-cyan-500/20 border border-cyan-500/50 rounded-xl flex items-center justify-center shadow-inner"><Clock className="w-6 h-6 text-cyan-400"/></div>
                 <div><p className="text-white font-bold text-sm">Time-Lock Target</p><p className="text-[10px] text-cyan-400 font-mono">Unlock Year 2045</p></div>
              </div>
              <div className="w-0.5 h-6 bg-gradient-to-b from-cyan-500 to-green-500 mx-auto"></div>

              <div className="bg-green-900/20 backdrop-blur-md border border-green-500/30 p-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(34,197,94,0.15)] transform mx-auto w-fit animate-float" style={{ animationDelay: '3s' }}>
                 <CheckCircle2 className="w-5 h-5 text-green-400"/>
                 <p className="text-green-400 font-bold text-xs uppercase tracking-widest">Verified On-Chain</p>
              </div>
           </div>
        </div>
      </section>

      {/* ⭐ 2. LIVE DATA TICKER (ON-CHAIN) */}
      <div className="border-y border-neutral-900 bg-[#05030F] py-4 relative z-20">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-6 sm:gap-12 text-[10px] sm:text-xs font-mono">
          <div className="flex items-center gap-2 text-neutral-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Network: <span className="text-white font-bold">Polygon Amoy</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
             Current Block: <span className="text-cyan-400 font-bold">{liveStats.block > 0 ? liveStats.block.toLocaleString() : "Syncing..."}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
             Verified Proofs: <span className="text-purple-400 font-bold">{liveStats.proofs.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
             Active Stakers: <span className="text-amber-400 font-bold">{liveStats.stakers.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
             <Database className="w-3 h-3 text-blue-500"/> TVL: <span className="text-blue-400 font-bold">{liveStats.tvl.toLocaleString()} AETH</span>
          </div>
        </div>
      </div>

      {/* ⭐ ECOSYSTEM & PARTNERS LOGO BAR (LENGKAP 6 LOGO) */}
      <section className="py-12 bg-[#020106] border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
           <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Secured, Audited & Powered By</p>
           <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-12 opacity-80 hover:opacity-100 transition-all">
              
              <div className="flex items-center gap-2.5 bg-neutral-900/60 border border-neutral-800 px-5 py-2.5 rounded-2xl shadow-inner">
                 <img src="/polygon.png" alt="Polygon" className="w-5 h-5 object-contain" />
                 <span className="text-xs font-bold font-mono text-white tracking-wider">POLYGON AMOY</span>
              </div>

              <div className="flex items-center gap-2.5 bg-neutral-900/60 border border-neutral-800 px-5 py-2.5 rounded-2xl shadow-inner">
                 <Hexagon className="w-5 h-5 text-cyan-400" />
                 <span className="text-xs font-bold font-mono text-white tracking-wider">CHAINLINK</span>
              </div>

              <div className="flex items-center gap-2.5 bg-neutral-900/60 border border-neutral-800 px-5 py-2.5 rounded-2xl shadow-inner">
                 <ShieldCheck className="w-5 h-5 text-purple-400" />
                 <span className="text-xs font-bold font-mono text-white tracking-wider">OPENZEPPELIN</span>
              </div>

              <div className="flex items-center gap-2.5 bg-neutral-900/60 border border-neutral-800 px-5 py-2.5 rounded-2xl shadow-inner">
                 <img src="/uniswap.png" alt="Uniswap" className="w-5 h-5 object-contain" />
                 <span className="text-xs font-bold font-mono text-white tracking-wider">UNISWAP V3</span>
              </div>

              <div className="flex items-center gap-2.5 bg-neutral-900/60 border border-neutral-800 px-5 py-2.5 rounded-2xl shadow-inner">
                 <img src="/pinksale.png" alt="Pinksale" className="w-5 h-5 object-contain" />
                 <span className="text-xs font-bold font-mono text-white tracking-wider">PINKSALE LAUNCH</span>
              </div>

              <div className="flex items-center gap-2.5 bg-neutral-900/60 border border-neutral-800 px-5 py-2.5 rounded-2xl shadow-inner">
                 <img src="/gecko.png" alt="GeckoTerminal" className="w-5 h-5 object-contain" />
                 <span className="text-xs font-bold font-mono text-white tracking-wider">GECKOTERMINAL</span>
              </div>

           </div>
        </div>
      </section>

      {/* ⭐ PILAR UTAMA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-8 rounded-3xl hover:border-cyan-500/50 transition-colors group">
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Award className="w-7 h-7 text-cyan-400"/>
              </div>
              <h3 className="text-2xl font-black text-white font-display mb-3">{t.pillars.proofTitle}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{t.pillars.proofDesc}</p>
           </div>
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-8 rounded-3xl hover:border-purple-500/50 transition-colors group">
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-7 h-7 text-purple-400"/>
              </div>
              <h3 className="text-2xl font-black text-white font-display mb-3">{t.pillars.legacyTitle}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{t.pillars.legacyDesc}</p>
           </div>
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-8 rounded-3xl hover:border-amber-500/50 transition-colors group">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Clock className="w-7 h-7 text-amber-400"/>
              </div>
              <h3 className="text-2xl font-black text-white font-display mb-3">{t.pillars.capsuleTitle}</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">{t.pillars.capsuleDesc}</p>
           </div>
        </div>
      </section>

      {/* ⭐ INFRASTRUCTURE SECTION */}
      <section id="infra" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-fit mx-auto px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest mb-4 font-mono">
            {globalT.infrastructure.tag}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display mb-4 whitespace-pre-line">{globalT.infrastructure.title}</h2>
          <p className="text-neutral-400 text-sm sm:text-base">{globalT.infrastructure.desc}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#080808] border border-neutral-800 p-8 rounded-3xl space-y-4">
            <Server className="w-8 h-8 text-cyan-400"/>
            <h4 className="text-xl font-bold text-white">{globalT.infrastructure.nodesTitle}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">{globalT.infrastructure.nodesDesc}</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-8 rounded-3xl space-y-4">
            <Cpu className="w-8 h-8 text-purple-400"/>
            <h4 className="text-xl font-bold text-white">{globalT.infrastructure.interopTitle}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">{globalT.infrastructure.interopDesc}</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-8 rounded-3xl space-y-4">
            <Shield className="w-8 h-8 text-amber-400"/>
            <h4 className="text-xl font-bold text-white">{globalT.infrastructure.securityTitle}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">{globalT.infrastructure.securityDesc}</p>
          </div>
        </div>
      </section>

      {/* ⭐ TIERS ARCHITECTURE SECTION */}
      <section id="tiers" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-fit mx-auto px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-4 font-mono">
            {globalT.tiers.tag}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display mb-4">{globalT.tiers.title}</h2>
          <p className="text-neutral-400 text-sm sm:text-base">{globalT.tiers.desc}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#080808] border border-neutral-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white mb-2">{globalT.tiers.tier1Title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{globalT.tiers.tier1Desc}</p>
            </div>
            <div className="pt-4 border-t border-neutral-800 text-xs font-mono text-cyan-400">10 AETH (2 Burn)</div>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white mb-2">{globalT.tiers.tier2Title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{globalT.tiers.tier2Desc}</p>
            </div>
            <div className="pt-4 border-t border-neutral-800 text-xs font-mono text-cyan-400">50 AETH (10 Burn)</div>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-bold text-white mb-2">{globalT.tiers.tier3Title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{globalT.tiers.tier3Desc}</p>
            </div>
            <div className="pt-4 border-t border-neutral-800 text-xs font-mono text-cyan-400">200 AETH (40 Burn)</div>
          </div>
          <div className="bg-[#080808] border border-cyan-500/40 p-6 rounded-3xl space-y-4 flex flex-col justify-between relative shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <div>
              <span className="absolute top-4 right-4 text-[9px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded font-mono uppercase font-bold">Ultimate</span>
              <h4 className="text-lg font-bold text-white mb-2">{globalT.tiers.tier4Title}</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">{globalT.tiers.tier4Desc}</p>
            </div>
            <div className="pt-4 border-t border-neutral-800 text-xs font-mono text-cyan-400">500 AETH (100 Burn)</div>
          </div>
        </div>
      </section>

      {/* ⭐ TOKENOMICS SECTION */}
      <section id="tokenomics" className="max-w-7xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-900">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="w-fit mx-auto px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold uppercase tracking-widest mb-4 font-mono">
            {globalT.tokenomics.tag}
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display mb-4">Designed for Scarcity</h2>
          <p className="text-neutral-400 text-sm sm:text-base">100,000,000 total fixed supply with robust utility and automated deflationary burn mechanisms.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-[#080808] border border-neutral-800 p-6 rounded-3xl space-y-3">
            <span className="text-xs font-mono text-cyan-400 font-bold uppercase">{globalT.tokenomics.liquidity}</span>
            <div className="text-3xl font-black text-white font-mono">30%</div>
            <p className="text-xs text-neutral-500">Open market liquidity availability on decentralized exchanges.</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-6 rounded-3xl space-y-3">
            <span className="text-xs font-mono text-purple-400 font-bold uppercase">{globalT.tokenomics.staking}</span>
            <div className="text-3xl font-black text-white font-mono">25%</div>
            <p className="text-xs text-neutral-500">Smart contract pool allocated for staker APY yield.</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-6 rounded-3xl space-y-3">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase">{globalT.tokenomics.initialSale}</span>
            <div className="text-3xl font-black text-white font-mono">20%</div>
            <p className="text-xs text-neutral-500">Initial liquidity fundraising and community bootstrap.</p>
          </div>
          <div className="bg-[#080808] border border-neutral-800 p-6 rounded-3xl space-y-3">
            <span className="text-xs font-mono text-blue-400 font-bold uppercase">{globalT.tokenomics.treasury}</span>
            <div className="text-3xl font-black text-white font-mono">25%</div>
            <p className="text-xs text-neutral-500">Vested development allocation and protocol reserve fund.</p>
          </div>
        </div>
      </section>

      {/* ⭐ TEAM / DEV SECTION */}
      <section id="team" className="max-w-5xl mx-auto px-4 sm:px-6 py-20 border-t border-neutral-900">
        <div className="bg-gradient-to-br from-[#0B0817] to-[#040308] border border-neutral-800 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none"></div>
          
          <div className="relative shrink-0">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-1 shadow-2xl">
              <div className="w-full h-full bg-neutral-900 rounded-2xl flex items-center justify-center overflow-hidden relative">
                <img src="/dev-avatar.png" alt="Nienzer" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <div className="absolute inset-0 bg-neutral-900 hidden items-center justify-center text-cyan-400 font-mono font-black text-2xl">
                  NZ
                </div>
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-green-500 text-black text-[9px] font-mono font-black px-2.5 py-1 rounded-full uppercase tracking-widest border-2 border-[#0B0817]">
              Core Dev
            </div>
          </div>

          <div className="space-y-4 text-center md:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase tracking-widest font-mono">
              {globalT.team.tag}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">{globalT.team.name}</h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              {globalT.team.bio}
            </p>
          </div>
        </div>
      </section>

      {/* ⭐ FOOTER */}
      <footer className="bg-[#020106] pt-20 pb-12 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 mb-4 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img src="/logo.png" alt="Logo" className="w-7 h-7 rounded-lg object-cover" />
              <span className="text-base font-black tracking-widest text-white font-display">AETHERVAULT</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">{globalT.footer.desc}</p>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-2">{globalT.footer.quickLinks}</h4>
            <a href="#infra" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">{globalT.footer.navInfrastructure}</a>
            <button onClick={() => router.push('/dashboard')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.navLaunchApp}</button>
            <button onClick={() => router.push('/whitepaper')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.navWhitepaper}</button>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-2">{globalT.footer.community}</h4>
            <button onClick={() => router.push('/terms')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.terms}</button>
            <button onClick={() => router.push('/privacy')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left bg-transparent border-none p-0 cursor-pointer">{globalT.footer.privacy}</button>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-neutral-300 font-mono gap-4">
          <p>© {new Date().getFullYear()} Nienzer. Hak Cipta Dilindungi. Email: admin@aethvault.xyz</p>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Polygon Mainnet Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
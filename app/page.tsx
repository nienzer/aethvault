"use client";
import React, { useState, useEffect } from 'react';
import { Wallet, Shield, Lock, Clock, Database, Activity, ArrowRight, Server, Cpu, Globe, CheckCircle2, MessageSquare, Send, Code, Zap, Flame, UserX, Layers, FileText, Map, Users, ChevronRight, Bell, AlertTriangle, RefreshCcw, LineChart, Mail, Award, ShieldCheck, Fingerprint, Box, Network, TerminalSquare, Eye, KeyRound, Hexagon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/context/LanguageContext';
import { ethers } from 'ethers';

// ⭐ KONFIGURASI SMART CONTRACT ON-CHAIN
const RPC_URL = "https://rpc-amoy.polygon.technology/";
const AETHER_VAULT_ADDRESS = "0xb273Bdad4D9d0053657359F45d189561449aa56B";
const STAKING_CONTRACT_ADDRESS = "0xc72433e176F2935965cbf595d6f30a70A89F702c";

const VAULT_ABI = ["function totalProofs() view returns (uint256)"];
const STAKING_ABI = ["function getStakingStats() view returns (uint256 currentTotalStaked, uint256 totalRewardsPaid, uint256 stakersCount, uint256 rewardPoolAvailable)"];

export default function LandingPage() {
  const router = useRouter();
  const { t, lang } = useLanguage();

  const [toast, setToast] = useState(null);
  
  // ⭐ STATE DATA MURNI ON-CHAIN
  const [liveStats, setLiveStats] = useState({
    block: 0,
    proofs: 0,
    tvl: 0,
    stakers: 0
  });

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleConnect = () => {
    router.push("/dashboard");
  };

  // ⭐ TARIK DATA REAL DARI POLYGON AMOY & SMART CONTRACT
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
    const interval = setInterval(fetchLiveBlockchainData, 15000); // Update tiap 15 detik
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#030208] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden relative">
      
      {/* Toast Notification System */}
      {toast && (
        <div className="fixed top-24 right-4 sm:right-8 z-[100] animate-in fade-in slide-in-from-right-8 duration-300">
          <div className={`flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl shadow-2xl border ${toast.type === 'success' ? 'bg-green-950/90 border-green-500/40 text-green-300' : toast.type === 'error' ? 'bg-red-950/90 border-red-500/40 text-red-300' : 'bg-[#080808] border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]'} backdrop-blur-md max-w-[90vw]`}>
            {toast.type === 'success' ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 shrink-0" /> : toast.type === 'error' ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" /> : <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 shrink-0" />}
            <p className="text-xs sm:text-sm font-medium break-words">{toast.msg}</p>
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

      {/* ⭐ 1. HERO SECTION & FLOW ANIMATION */}
      <section id="home" className="pt-20 pb-16 px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center relative">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="lg:col-span-7 relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="w-fit flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-6 font-mono shadow-lg">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
            Web3 Digital Legacy Protocol
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[4rem] font-extrabold tracking-tight mb-6 text-white leading-[1.1]">
            Preserve Your <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500">
              Digital Legacy Forever
            </span>
          </h1>
          
          <p className="text-neutral-400 text-sm sm:text-base mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
            Secure messages, memories, contracts, certificates, and intellectual property on the Polygon blockchain forever using military-grade ECIES cryptography.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-10 w-full sm:w-auto px-4 sm:px-0">
            <button onClick={handleConnect} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-black px-8 py-4 rounded-2xl font-black text-sm transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 cursor-pointer outline-none">
              Explore App <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => router.push('/whitepaper')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#080808] hover:bg-neutral-900 text-neutral-300 px-8 py-4 rounded-2xl font-bold text-sm border border-neutral-800 transition-all cursor-pointer outline-none hover:border-cyan-500/30">
              Read Whitepaper <FileText className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* HERO ANIMATION FLOW (VC Level) */}
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

      {/* ⭐ 2. LIVE DATA TICKER (100% REAL ON-CHAIN) */}
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

      {/* ⭐ 5. SOCIAL PROOF LOGOS */}
      <section className="py-12 bg-[#020106]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-6">
           <p className="text-[10px] font-mono uppercase tracking-widest text-neutral-500">Secured & Powered By</p>
           <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-xl font-black text-white"><Layers className="w-6 h-6"/> POLYGON</div>
              <div className="flex items-center gap-2 text-xl font-black text-white"><Hexagon className="w-6 h-6"/> CHAINLINK</div>
              <div className="flex items-center gap-2 text-xl font-black text-white"><ShieldCheck className="w-6 h-6"/> OPENZEPPELIN</div>
              <div className="flex items-center gap-2 text-xl font-black text-white"><Wallet className="w-6 h-6"/> WALLETCONNECT</div>
           </div>
        </div>
      </section>

      {/* ⭐ PILAR UTAMA (3 FITUR BESAR) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-3 gap-6">
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-8 rounded-3xl hover:border-cyan-500/50 transition-colors group">
              <div className="w-14 h-14 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Award className="w-7 h-7 text-cyan-400"/>
              </div>
              <h3 className="text-2xl font-black text-white font-display mb-3">Aether Proof™</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Mint immutable ownership certificates for any digital creation, artwork, software, or intellectual property on the blockchain.</p>
           </div>
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-8 rounded-3xl hover:border-purple-500/50 transition-colors group">
              <div className="w-14 h-14 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <ShieldCheck className="w-7 h-7 text-purple-400"/>
              </div>
              <h3 className="text-2xl font-black text-white font-display mb-3">Legacy Vault™</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Leave an encrypted digital inheritance. Dead-man's switch logic ensures your wealth and secrets transfer safely to the next generation.</p>
           </div>
           <div className="bg-gradient-to-b from-[#0A0713] to-[#030208] border border-neutral-800 p-8 rounded-3xl hover:border-amber-500/50 transition-colors group">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                 <Clock className="w-7 h-7 text-amber-400"/>
              </div>
              <h3 className="text-2xl font-black text-white font-display mb-3">Time Capsule™</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Lock a message or file today, and make it cryptographically impossible to open until a specific date years into the future.</p>
           </div>
        </div>
      </section>

      {/* ⭐ 4. SHOWCASE (APPLE STYLE UI PREVIEW) */}
      <section className="bg-[#0A0713] py-24 border-y border-neutral-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-cyan-600/5 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center space-y-12 relative z-10">
           
           <div className="space-y-4">
             <h2 className="text-3xl sm:text-5xl font-black text-white font-display">Experience The Protocol</h2>
             <p className="text-neutral-400 max-w-2xl mx-auto">A seamless Web3 terminal designed for both everyday users and advanced crypto natives.</p>
           </div>

           <div className="w-full max-w-5xl mx-auto bg-[#030208] border border-neutral-800 rounded-t-3xl rounded-b-xl shadow-[0_-20px_60px_rgba(6,182,212,0.1)] overflow-hidden flex flex-col pt-4 px-4 pb-0">
             <div className="flex gap-2 px-2 mb-4">
               <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
             </div>
             
             {/* Mock Dashboard UI */}
             <div className="bg-[#0A0713] border border-neutral-800 border-b-0 rounded-t-2xl w-full h-[300px] sm:h-[500px] p-6 flex flex-col gap-6 relative overflow-hidden">
                <div className="flex justify-between items-center pb-4 border-b border-neutral-800/80">
                   <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-cyan-400"/><span className="text-white font-bold font-display">Hall of Proof™</span></div>
                   <div className="w-32 h-8 bg-neutral-900 rounded-lg border border-neutral-800"></div>
                </div>
                <div className="grid grid-cols-3 gap-4 flex-1">
                   <div className="bg-[#05030F] border border-neutral-800 rounded-xl p-4 space-y-3">
                     <div className="w-full h-24 bg-neutral-900 rounded-lg"></div>
                     <div className="w-3/4 h-4 bg-neutral-800 rounded"></div>
                     <div className="w-1/2 h-3 bg-neutral-800 rounded"></div>
                   </div>
                   <div className="bg-[#05030F] border border-cyan-500/30 rounded-xl p-4 space-y-3 relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                     <div className="absolute inset-0 bg-cyan-500/5"></div>
                     <div className="w-full h-24 bg-cyan-900/20 border border-cyan-500/30 rounded-lg flex items-center justify-center"><Award className="w-8 h-8 text-cyan-400"/></div>
                     <div className="w-3/4 h-4 bg-cyan-500/40 rounded"></div>
                     <div className="w-1/2 h-3 bg-cyan-500/20 rounded"></div>
                   </div>
                   <div className="bg-[#05030F] border border-neutral-800 rounded-xl p-4 space-y-3 hidden sm:block">
                     <div className="w-full h-24 bg-neutral-900 rounded-lg"></div>
                     <div className="w-3/4 h-4 bg-neutral-800 rounded"></div>
                     <div className="w-1/2 h-3 bg-neutral-800 rounded"></div>
                   </div>
                </div>
             </div>
           </div>
        </div>
      </section>

      {/* ⭐ 3. HOW IT WORKS (TIMELINE) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
         <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-white font-display mb-4">How AetherVault Works</h2>
            <p className="text-neutral-400">Four simple steps to eternal cryptographic security.</p>
         </div>

         <div className="relative border-l border-neutral-800 ml-4 sm:ml-1/2 space-y-12 pb-4">
            {[
              { num: "1", title: "Create Content", desc: "Write a secret message, upload an intellectual property file, or set up a dead-man's switch.", icon: <FileText className="w-5 h-5 text-white"/> },
              { num: "2", title: "Client-Side ECIES Encryption", desc: "Your content is encrypted directly in your browser using secp256k1 keys. No plain text ever reaches our servers.", icon: <KeyRound className="w-5 h-5 text-white"/> },
              { num: "3", title: "Mint to Blockchain", desc: "A smart contract records your ciphertext, hash, and unlock conditions immutably on the Polygon network.", icon: <Database className="w-5 h-5 text-white"/> },
              { num: "4", title: "Future Unlock", desc: "When the block timestamp passes your target date, you or your heir decrypt the vault via MetaMask signature.", icon: <Unlock className="w-5 h-5 text-white"/> }
            ].map((step, idx) => (
              <div key={idx} className="relative pl-8 sm:pl-12">
                 <div className="absolute -left-6 sm:-left-6 w-12 h-12 bg-[#0B0817] border-2 border-cyan-500 rounded-full flex items-center justify-center font-black text-cyan-400 font-mono shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    {step.num}
                 </div>
                 <div className="bg-[#080808] border border-neutral-800 p-6 rounded-2xl shadow-lg hover:border-neutral-600 transition-colors">
                    <h4 className="text-xl font-bold text-white mb-2 flex items-center gap-3">{step.icon} {step.title}</h4>
                    <p className="text-neutral-400 text-sm leading-relaxed">{step.desc}</p>
                 </div>
              </div>
            ))}
         </div>
      </section>

      {/* ⭐ 6. BIG NUMBERS (TRUST METRICS - CONNECTED ON-CHAIN) */}
      <section className="bg-gradient-to-r from-cyan-900/20 via-blue-900/20 to-purple-900/20 border-y border-neutral-900 py-16">
         <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
               <div className="text-4xl sm:text-5xl font-black text-white font-mono mb-2 drop-shadow-md">100M</div>
               <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest font-bold">$AETH Token Supply</div>
            </div>
            <div>
               <div className="text-4xl sm:text-5xl font-black text-cyan-400 font-mono mb-2 drop-shadow-md">
                 {liveStats.block > 0 ? (liveStats.block / 1000000).toFixed(1) + 'M+' : '...'}
               </div>
               <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest font-bold">Polygon Blocks</div>
            </div>
            <div>
               <div className="text-4xl sm:text-5xl font-black text-white font-mono mb-2 drop-shadow-md">AES-256</div>
               <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest font-bold">Military Encryption</div>
            </div>
            <div>
               <div className="text-4xl sm:text-5xl font-black text-purple-400 font-mono mb-2 drop-shadow-md">100%</div>
               <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-widest font-bold">On-Chain Protocol</div>
            </div>
         </div>
      </section>

      {/* ⭐ 7. EXPANDED FOOTER */}
      <footer className="bg-[#020106] pt-20 pb-12 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-16">
          
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 mb-4 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img src="/logo.png" alt="Logo" className="w-7 h-7 grayscale opacity-80" />
              <span className="text-base font-black tracking-widest text-white font-display">AETHERVAULT</span>
            </div>
            <p className="text-neutral-400 text-xs leading-relaxed max-w-sm">The decentralized vault and registry protocol on Polygon. Securing intellectual property and digital legacy for generations to come.</p>
            <div className="flex gap-4 pt-4">
              <a href="#" className="w-8 h-8 bg-neutral-900 hover:bg-white text-neutral-400 hover:text-black rounded-full flex items-center justify-center transition-all"><MessageSquare className="w-4 h-4"/></a>
              <a href="#" className="w-8 h-8 bg-neutral-900 hover:bg-white text-neutral-400 hover:text-black rounded-full flex items-center justify-center transition-all"><Send className="w-4 h-4"/></a>
              <a href="#" className="w-8 h-8 bg-neutral-900 hover:bg-white text-neutral-400 hover:text-black rounded-full flex items-center justify-center transition-all"><Code className="w-4 h-4"/></a>
            </div>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-2">Ecosystem</h4>
            <a href="#infrastructure" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Infrastructure</a>
            <button onClick={() => router.push('/dashboard')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left outline-none bg-transparent border-none p-0">Launch App</button>
            <a href="#tokenomics" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Tokenomics</a>
            <button onClick={() => router.push('/staking')} className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors text-left outline-none bg-transparent border-none p-0">$AETH Staking</button>
          </div>
          
          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-2">Developers</h4>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Documentation</a>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">API Reference</a>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">GitHub Repository</a>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Smart Contract Audit</a>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Bug Bounty</a>
          </div>

          <div className="flex flex-col space-y-4">
            <h4 className="text-white font-bold text-xs uppercase tracking-widest font-mono mb-2">Support</h4>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Help Center</a>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Contact Us</a>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Terms of Service</a>
            <a href="#" className="text-xs text-neutral-500 hover:text-cyan-400 transition-colors">Privacy Policy</a>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-neutral-900 pt-8 flex flex-col sm:flex-row items-center justify-between text-[10px] text-neutral-600 font-mono gap-4">
          <p>© {new Date().getFullYear()} AetherVault Protocol. All rights reserved.</p>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Polygon Mainnet Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
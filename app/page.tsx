"use client";
import React, { useState } from 'react';
import { Wallet, Shield, Lock, Clock, Database, Activity, ArrowRight, Server, Cpu, Globe, CheckCircle2, MessageSquare, Send, Code, Zap, Flame, UserX, Layers, FileText, Map, Users, ChevronRight, Bell, AlertTriangle, RefreshCcw, LineChart, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLanguage } from '@/context/LanguageContext'; // <-- Panggil Otak Bahasa

export default function LandingPage() {
  const router = useRouter();
  const { t, lang } = useLanguage(); // Gantikan useState manual

  const [toast, setToast] = useState<{msg: string, type: 'success' | 'error' | 'info'} | null>(null);

  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleConnect = () => {
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden relative">
      
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
          50% { transform: translateY(-15px); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-orbit { animation: orbit 25s linear infinite; }
      `}</style>

      {/* KODE <nav> PANJANG SUDAH DIHAPUS KARENA MENGGUNAKAN NAVBAR GLOBAL */}

      {/* HERO SECTION (Jarak atas disesuaikan jadi pt-4 sm:pt-16 agar pas dengan Navbar Global) */}
      <section id="home" className="pt-4 sm:pt-16 pb-12 sm:pb-20 px-4 sm:px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 sm:gap-12 items-center relative">
        <div className="absolute top-1/4 left-1/4 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-cyan-600/10 blur-[150px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 text-center lg:text-left flex flex-col items-center lg:items-start">
          <div className="w-fit flex items-center gap-2 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[9px] sm:text-[10px] font-bold text-cyan-400 uppercase tracking-widest mb-4 sm:mb-6 font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            {t.hero.badge}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[3.4rem] font-extrabold tracking-tight mb-3 sm:mb-6 text-white leading-[1.15]">
            {t.hero.titleLine1} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-500 pb-1 sm:pb-2 inline-block">
              {t.hero.titleHighlight}
            </span>
          </h1>
          
          <p className="text-neutral-400 text-xs sm:text-base mb-6 sm:mb-8 leading-relaxed max-w-lg mx-auto lg:mx-0">
            {t.hero.desc}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 sm:mb-10 w-full sm:w-auto px-4 sm:px-0">
            <button onClick={handleConnect} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-[0_0_25px_rgba(6,182,212,0.3)] cursor-pointer outline-none">
              {t.hero.exploreBtn} <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={() => router.push('/whitepaper')} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#080808] hover:bg-neutral-900 text-neutral-300 px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm border border-neutral-800 transition-all cursor-pointer outline-none">
              {t.hero.whitepaperBtn} <FileText className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 sm:gap-6 text-[10px] sm:text-xs text-neutral-500 font-mono">
            <span>{t.hero.builtOn}</span>
            <div className="flex items-center gap-1.5 text-purple-400 font-bold"><Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> {t.hero.polygon}</div>
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold"><Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> {t.hero.chainlink}</div>
          </div>
        </div>

        <div className="relative z-10 h-[300px] sm:h-[450px] flex items-center justify-center mt-6 lg:mt-0 hidden sm:flex">
          <div className="absolute w-[240px] h-[240px] sm:w-[360px] sm:h-[360px] border border-neutral-800 rounded-full animate-orbit"></div>
          <div className="absolute w-[180px] h-[180px] sm:w-[260px] sm:h-[260px] border border-cyan-900/30 rounded-full animate-orbit" style={{ animationDirection: 'reverse', animationDuration: '20s' }}></div>
          
          <div className="relative animate-float z-20 flex flex-col items-center justify-center">
            <div className="relative w-36 h-24 sm:w-48 sm:h-36 bg-gradient-to-br from-cyan-500/10 via-blue-600/10 to-purple-600/20 border border-cyan-500/40 rounded-xl sm:rounded-2xl flex items-center justify-center backdrop-blur-xl shadow-[0_0_50px_rgba(6,182,212,0.25)] rotate-6 overflow-visible">
              <Mail className="w-12 h-12 sm:w-20 sm:h-20 text-cyan-300 drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]" />
              <div className="absolute -bottom-3 -right-3 sm:-bottom-4 sm:-right-4 bg-[#030508] border border-blue-500/50 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.4)]">
                <Lock className="w-5 h-5 sm:w-7 sm:h-7 text-blue-400" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFRASTRUCTURE */}
      <section id="infrastructure" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-neutral-900">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          <div className="col-span-2 lg:col-span-1 text-center lg:text-left mb-4 lg:mb-0">
            <span className="text-cyan-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase block mb-1.5 sm:mb-2 font-mono">{t.infrastructure.tag}</span>
            <h2 className="text-xl sm:text-3xl font-extrabold mb-2 sm:mb-3 text-white leading-tight whitespace-pre-line">{t.infrastructure.title}</h2>
            <p className="text-neutral-500 text-[10px] sm:text-sm leading-relaxed max-w-xs mx-auto lg:mx-0">{t.infrastructure.desc}</p>
          </div>
          
          {[
            { icon: <Cpu className="w-4 h-4 sm:w-6 sm:h-6 text-cyan-400" />, title: t.infrastructure.nodesTitle, desc: t.infrastructure.nodesDesc },
            { icon: <Layers className="w-4 h-4 sm:w-6 sm:h-6 text-blue-400" />, title: t.infrastructure.interopTitle, desc: t.infrastructure.interopDesc },
            { icon: <Shield className="w-4 h-4 sm:w-6 sm:h-6 text-purple-400" />, title: t.infrastructure.securityTitle, desc: t.infrastructure.securityDesc }
          ].map((item, i) => (
            <div key={i} className="bg-[#080808] border border-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl hover:border-cyan-500/30 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-neutral-900 border border-neutral-800 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <h3 className="text-xs sm:text-base font-bold text-white mb-1.5 sm:mb-2">{item.title}</h3>
                <p className="text-neutral-400 text-[9px] sm:text-xs leading-relaxed line-clamp-3 sm:line-clamp-none">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TIER BRANKAS SECTION */}
      <section id="tiers" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-neutral-900">
        <div className="text-center mb-8 sm:mb-16">
          <span className="text-cyan-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase block mb-1.5 sm:mb-2 font-mono">{t.tiers.tag}</span>
          <h2 className="text-xl sm:text-3xl font-extrabold mb-2 sm:mb-3 text-white">{t.tiers.title}</h2>
          <p className="text-neutral-400 text-[10px] sm:text-sm max-w-sm mx-auto">{t.tiers.desc}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {/* Tier 1 */}
          <div className="bg-[#080808] border border-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="p-1.5 sm:p-2.5 bg-neutral-900 rounded-lg sm:rounded-xl text-gray-300 border border-neutral-800"><Shield className="w-3.5 h-3.5 sm:w-5 sm:h-5"/></span>
                <span className="font-mono text-[9px] sm:text-xs font-bold text-white bg-neutral-900 px-2 sm:px-3 py-1 rounded-md sm:rounded-xl border border-neutral-800">10 AETH</span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white mb-1.5 sm:mb-2">{t.tiers.tier1Title}</h3>
              <p className="text-[9px] sm:text-xs text-neutral-400 leading-relaxed mb-4 sm:mb-6">{t.tiers.tier1Desc}</p>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-neutral-900 flex flex-col xl:flex-row items-start xl:items-center justify-between text-[9px] sm:text-[11px] font-mono text-neutral-500 gap-1.5 xl:gap-0">
              <span>{t.tiers.autoBurn}</span>
              <span className="text-red-400 font-bold flex items-center gap-1"><Flame className="w-3 h-3"/> 2 Burn</span>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-[#080808] border border-cyan-500/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-[0_0_20px_rgba(6,182,212,0.1)] relative">
            <div className="absolute -top-2 sm:-top-3 right-4 sm:right-6 bg-cyan-600 text-white text-[7px] sm:text-[9px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-mono">{t.tiers.popular}</div>
            <div>
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="p-1.5 sm:p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-lg sm:rounded-xl text-cyan-400"><Layers className="w-3.5 h-3.5 sm:w-5 sm:h-5"/></span>
                <span className="font-mono text-[9px] sm:text-xs font-bold text-white bg-neutral-900 px-2 sm:px-3 py-1 rounded-md sm:rounded-xl border border-neutral-800">50 AETH</span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white mb-1.5 sm:mb-2">{t.tiers.tier2Title}</h3>
              <p className="text-[9px] sm:text-xs text-neutral-400 leading-relaxed mb-4 sm:mb-6">{t.tiers.tier2Desc}</p>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-neutral-900 flex flex-col xl:flex-row items-start xl:items-center justify-between text-[9px] sm:text-[11px] font-mono text-neutral-500 gap-1.5 xl:gap-0">
              <span>{t.tiers.autoBurn}</span>
              <span className="text-red-400 font-bold flex items-center gap-1"><Flame className="w-3 h-3"/> 10 Burn</span>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-[#080808] border border-yellow-500/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="p-1.5 sm:p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-lg sm:rounded-xl text-yellow-400"><Lock className="w-3.5 h-3.5 sm:w-5 sm:h-5"/></span>
                <span className="font-mono text-[9px] sm:text-xs font-bold text-white bg-neutral-900 px-2 sm:px-3 py-1 rounded-md sm:rounded-xl border border-neutral-800">200 AETH</span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white mb-1.5 sm:mb-2">{t.tiers.tier3Title}</h3>
              <p className="text-[9px] sm:text-xs text-neutral-400 leading-relaxed mb-4 sm:mb-6">{t.tiers.tier3Desc}</p>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-neutral-900 flex flex-col xl:flex-row items-start xl:items-center justify-between text-[9px] sm:text-[11px] font-mono text-neutral-500 gap-1.5 xl:gap-0">
              <span>{t.tiers.autoBurn}</span>
              <span className="text-red-400 font-bold flex items-center gap-1"><Flame className="w-3 h-3"/> 40 Burn</span>
            </div>
          </div>

          {/* Tier 4 */}
          <div className="bg-[#080808] border border-red-500/40 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between shadow-[0_0_20px_rgba(239,68,68,0.1)] relative">
            <div className="absolute -top-2 sm:-top-3 right-4 sm:right-6 bg-red-600 text-white text-[7px] sm:text-[9px] font-bold uppercase tracking-widest px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full font-mono">{t.tiers.warisan}</div>
            <div>
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <span className="p-1.5 sm:p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg sm:rounded-xl text-red-400"><UserX className="w-3.5 h-3.5 sm:w-5 sm:h-5"/></span>
                <span className="font-mono text-[9px] sm:text-xs font-bold text-white bg-neutral-900 px-2 sm:px-3 py-1 rounded-md sm:rounded-xl border border-neutral-800">500 AETH</span>
              </div>
              <h3 className="text-xs sm:text-base font-bold text-white mb-1.5 sm:mb-2">{t.tiers.tier4Title}</h3>
              <p className="text-[9px] sm:text-xs text-neutral-400 leading-relaxed mb-4 sm:mb-6">{t.tiers.tier4Desc}</p>
            </div>
            <div className="pt-3 sm:pt-4 border-t border-neutral-900 flex flex-col xl:flex-row items-start xl:items-center justify-between text-[9px] sm:text-[11px] font-mono text-neutral-500 gap-1.5 xl:gap-0">
              <span>{t.tiers.autoBurn}</span>
              <span className="text-red-400 font-bold flex items-center gap-1"><Flame className="w-3 h-3"/> 100 Burn</span>
            </div>
          </div>
        </div>
      </section>

      {/* TOKENOMICS */}
      <section id="tokenomics" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-neutral-900">
        <div className="grid lg:grid-cols-2 gap-4 sm:gap-8">
          <div className="bg-[#080808] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col justify-between">
            <div>
              <span className="text-cyan-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase block mb-1 sm:mb-2 font-mono">{t.tokenomics.tag}</span>
              <p className="text-neutral-400 text-[9px] sm:text-xs mb-1">{t.tokenomics.totalSupply}</p>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-5 sm:mb-8 font-mono">100,000,000 <span className="text-cyan-500 text-xs sm:text-base">AETH</span></h2>
              
              <div className="flex flex-row items-center gap-4 sm:gap-8 mb-5 sm:mb-8">
                <div className="w-20 h-20 sm:w-40 sm:h-40 rounded-full flex items-center justify-center shadow-xl flex-shrink-0" 
                     style={{ background: 'conic-gradient(#3b82f6 0% 30%, #06b6d4 30% 55%, #a855f7 55% 75%, #6366f1 75% 90%, #475569 90% 100%)' }}>
                  <div className="w-14 h-14 sm:w-28 sm:h-28 bg-[#080808] rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 sm:w-7 sm:h-7 text-neutral-600" />
                  </div>
                </div>
                
                <div className="flex-1 space-y-1.5 sm:space-y-2 w-full text-[9px] sm:text-xs font-mono">
                  {[
                    { color: "bg-blue-500", percent: "30%", label: t.tokenomics.liquidity },
                    { color: "bg-cyan-500", percent: "25%", label: t.tokenomics.staking },
                    { color: "bg-purple-500", percent: "20%", label: t.tokenomics.initialSale },
                    { color: "bg-indigo-500", percent: "15%", label: t.tokenomics.teamWallet },
                    { color: "bg-slate-600", percent: "10%", label: t.tokenomics.treasury },
                  ].map((stat, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 sm:gap-2.5">
                        <div className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${stat.color}`}></div>
                        <span className="text-neutral-400 font-sans truncate max-w-[80px] sm:max-w-none">{stat.label}</span>
                      </div>
                      <span className="text-white font-bold">{stat.percent}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={() => router.push('/whitepaper#tokenomics')} className="w-full text-[9px] sm:text-xs font-bold text-white border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 rounded-xl sm:rounded-2xl py-2.5 sm:py-3.5 transition-colors flex items-center justify-center gap-1.5 sm:gap-2 cursor-pointer outline-none">
              {t.tokenomics.viewDetails} <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-6">
            <div className="bg-[#080808] border border-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
              <div>
                <div className="mb-2 sm:mb-3"><FileText className="text-cyan-400 w-4 h-4 sm:w-5 sm:h-5" /></div>
                <h3 className="text-[11px] sm:text-base font-bold text-white mb-1">{t.docs.whitepaperTitle}</h3>
                <p className="text-neutral-500 text-[9px] sm:text-xs mb-3 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">{t.docs.whitepaperDesc}</p>
              </div>
              <button onClick={() => router.push('/whitepaper')} className="bg-transparent border-none p-0 text-cyan-400 text-[9px] sm:text-xs font-bold flex items-center gap-1 hover:text-cyan-300 font-mono cursor-pointer w-fit outline-none mt-auto">
                {t.docs.explore} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="bg-[#080808] border border-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
              <div>
                <div className="mb-2 sm:mb-3"><Map className="text-purple-400 w-4 h-4 sm:w-5 sm:h-5" /></div>
                <h3 className="text-[11px] sm:text-base font-bold text-white mb-1">{t.docs.roadmapTitle}</h3>
                <p className="text-neutral-500 text-[9px] sm:text-xs mb-3 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">{t.docs.roadmapDesc}</p>
              </div>
              <button onClick={() => router.push('/roadmap')} className="bg-transparent border-none p-0 text-cyan-400 text-[9px] sm:text-xs font-bold flex items-center gap-1 hover:text-cyan-300 font-mono cursor-pointer w-fit outline-none mt-auto">
                {t.docs.explore} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="bg-[#080808] border border-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
              <div>
                <div className="mb-2 sm:mb-3"><Cpu className="text-blue-400 w-4 h-4 sm:w-5 sm:h-5" /></div>
                <h3 className="text-[11px] sm:text-base font-bold text-white mb-1">{t.docs.docsTitle}</h3>
                <p className="text-neutral-500 text-[9px] sm:text-xs mb-3 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">{t.docs.docsDesc}</p>
              </div>
              <button onClick={() => router.push('/docs')} className="bg-transparent border-none p-0 text-cyan-400 text-[9px] sm:text-xs font-bold flex items-center gap-1 hover:text-cyan-300 font-mono cursor-pointer w-fit outline-none mt-auto">
                {t.docs.explore} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>

            <div className="bg-[#080808] border border-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col justify-between hover:border-cyan-500/30 transition-colors">
              <div>
                <div className="mb-2 sm:mb-3"><Users className="text-amber-400 w-4 h-4 sm:w-5 sm:h-5" /></div>
                <h3 className="text-[11px] sm:text-base font-bold text-white mb-1">{t.docs.communityTitle}</h3>
                <p className="text-neutral-500 text-[9px] sm:text-xs mb-3 sm:mb-6 leading-relaxed line-clamp-3 sm:line-clamp-none">{t.docs.communityDesc}</p>
              </div>
              <button onClick={() => router.push('/community')} className="bg-transparent border-none p-0 text-cyan-400 text-[9px] sm:text-xs font-bold flex items-center gap-1 hover:text-cyan-300 font-mono cursor-pointer w-fit outline-none mt-auto">
                {t.docs.explore} <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* TEAM SECTION */}
      <section id="team" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-neutral-900 text-center">
        <span className="text-cyan-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase block mb-1.5 sm:mb-2 font-mono">{t.team.tag}</span>
        <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-8 sm:mb-12">{t.team.title}</h2>
        
        <div className="flex justify-center">
          <div className="bg-[#080808] border border-neutral-900 rounded-2xl sm:rounded-3xl overflow-hidden group max-w-[240px] sm:max-w-sm w-full hover:border-cyan-500/40 transition-all duration-300">
            <div className="h-24 sm:h-40 bg-gradient-to-b from-neutral-900 to-[#080808] flex items-center justify-center pt-4">
              <img 
                src="/profile.png" 
                alt="Nienzer Profile" 
                className="w-16 h-16 sm:w-24 sm:h-24 rounded-full object-cover border-2 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] group-hover:scale-110 transition-transform duration-500" 
                onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=Nienzer&background=0D8B93&color=fff&size=128'; }} 
              />
            </div>
            <div className="p-5 sm:p-8 border-t border-neutral-900 mt-2">
              <h3 className="text-white font-extrabold text-base sm:text-xl mb-1">{t.team.name}</h3>
              <p className="text-cyan-500 text-[9px] sm:text-xs mb-3 sm:mb-4 font-mono uppercase tracking-widest">{t.team.role}</p>
              <p className="text-neutral-500 text-[10px] sm:text-sm leading-relaxed mb-4 sm:mb-6">{t.team.bio}</p>
              
              {/* SOCIAL MEDIA LINKS */}
              <div className="flex justify-center gap-4 sm:gap-5 text-neutral-500">
                {/* Twitter / X */}
                <a href="https://twitter.com/nien_zer" target="_blank" rel="noreferrer" title="Twitter / X" className="outline-none">
                  <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 hover:text-cyan-400 cursor-pointer transition-colors" />
                </a>
                
                {/* Telegram */}
                <a href="https://t.me/nienzer" target="_blank" rel="noreferrer" title="Telegram" className="outline-none">
                  <Send className="w-4 h-4 sm:w-5 sm:h-5 hover:text-blue-400 cursor-pointer transition-colors" />
                </a>
                
                {/* GitHub */}
                <a href="https://github.com/nienzer" target="_blank" rel="noreferrer" title="GitHub" className="outline-none">
                  <Code className="w-4 h-4 sm:w-5 sm:h-5 hover:text-white cursor-pointer transition-colors" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section id="partners" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 border-t border-neutral-900 text-center">
        <span className="text-cyan-400 text-[10px] sm:text-xs font-bold tracking-widest uppercase block mb-1.5 sm:mb-2 font-mono">{t.partners.tag}</span>
        <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-6 sm:mb-12">{t.partners.title}</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 max-w-4xl mx-auto">
          {[
            { name: "PolygonScan", desc: t.partners.p1Desc, icon: <img src="/polygon.png" alt="PolygonScan" className="w-5 h-5 sm:w-7 sm:h-7 object-contain" /> },
            { name: "Uniswap V3", desc: t.partners.p2Desc, icon: <img src="/uniswap.png" alt="Uniswap" className="w-5 h-5 sm:w-7 sm:h-7 object-contain" /> },
            { name: "GeckoTerminal", desc: t.partners.p3Desc, icon: <img src="/gecko.png" alt="GeckoTerminal" className="w-5 h-5 sm:w-7 sm:h-7 object-contain" /> },
            { name: "PinkSale", desc: t.partners.p4Desc, icon: <img src="/pinksale.png" alt="PinkSale" className="w-5 h-5 sm:w-7 sm:h-7 object-contain" /> }
          ].map((partner, i) => (
            <div key={i} className="bg-[#080808] border border-neutral-900 px-3 sm:px-8 py-4 sm:py-6 rounded-xl sm:rounded-2xl flex flex-col sm:flex-row items-center gap-2 sm:gap-4 hover:border-cyan-500/30 transition-colors w-full text-center sm:text-left">
              <div className="p-2 sm:p-3 bg-neutral-900 rounded-lg sm:rounded-xl border border-neutral-800 flex items-center justify-center shrink-0">
                {partner.icon}
              </div>
              <div>
                <h4 className="text-white font-bold text-[11px] sm:text-sm">{partner.name}</h4>
                <p className="text-neutral-500 text-[8px] sm:text-[10px] font-mono uppercase tracking-widest mt-0.5 sm:mt-1">{partner.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-[#020305] pt-10 sm:pt-16 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col lg:flex-row justify-between gap-10 mb-8 sm:mb-12">
          
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-sm mx-auto lg:mx-0">
            <div className="flex items-center gap-2 sm:gap-2.5 mb-3 sm:mb-4 cursor-pointer" onClick={() => window.scrollTo(0,0)}>
              <img src="/logo.png" alt="Logo" className="w-5 h-5 sm:w-6 sm:h-6 grayscale opacity-60" />
              <span className="text-[11px] sm:text-sm font-extrabold tracking-widest text-white">AETHERVAULT</span>
            </div>
            <p className="text-neutral-500 text-[10px] sm:text-xs leading-relaxed">{t.footer.desc}</p>
          </div>
          
          {/* QUICK LINKS & COMMUNITY DI BUAT SEJAJAR DI HP */}
          <div className="flex justify-center gap-12 sm:gap-24">
            <div className="flex flex-col items-start">
              <h4 className="text-white font-bold text-[10px] sm:text-xs mb-4 font-mono">{t.footer.quickLinks}</h4>
              <ul className="space-y-3 text-[10px] sm:text-xs text-neutral-500 text-left">
                <li><a href="#infrastructure" className="hover:text-cyan-400 transition-colors">Infrastructure</a></li>
                <li><button onClick={() => router.push('/roadmap')} className="bg-transparent border-none p-0 hover:text-cyan-400 transition-colors cursor-pointer text-left outline-none">Roadmap</button></li>
                <li><button onClick={() => router.push('/whitepaper')} className="bg-transparent border-none p-0 hover:text-cyan-400 transition-colors cursor-pointer text-left outline-none">Whitepaper</button></li>
                <li><button onClick={handleConnect} className="bg-transparent border-none p-0 hover:text-cyan-400 transition-colors cursor-pointer text-left outline-none">Launch App</button></li>
              </ul>
            </div>
            
            <div className="flex flex-col items-start">
              <h4 className="text-white font-bold text-[10px] sm:text-xs mb-4 font-mono">{t.footer.community}</h4>
              <ul className="space-y-3 text-[10px] sm:text-xs text-neutral-500 text-left">
                <li><button onClick={() => router.push('/community')} className="bg-transparent border-none p-0 hover:text-cyan-400 flex items-center gap-2 transition-colors outline-none cursor-pointer"><MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> Twitter / X</button></li>
                <li><button onClick={() => router.push('/community')} className="bg-transparent border-none p-0 hover:text-cyan-400 flex items-center gap-2 transition-colors outline-none cursor-pointer"><Send className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> Telegram</button></li>
                <li><button onClick={() => router.push('/community')} className="bg-transparent border-none p-0 hover:text-cyan-400 flex items-center gap-2 transition-colors outline-none cursor-pointer"><Code className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> Github</button></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 border-t border-neutral-900 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-[9px] sm:text-[11px] text-neutral-600 font-mono gap-3 sm:gap-4">
          <p className="text-center sm:text-left">© {new Date().getFullYear()} Nienzer. All rights reserved. Email: admin@aethvault.xyz.</p>
          <div className="flex gap-4 sm:gap-6">
            <a href="/privacy" className="hover:text-neutral-400 cursor-pointer outline-none transition-colors">{t.footer.privacy}</a>
            <a href="/terms" className="hover:text-neutral-400 cursor-pointer outline-none transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
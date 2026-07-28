"use client";
import React from 'react';
import { Cpu, FileJson, Server, Activity } from 'lucide-react'; // ArrowLeft dihapus karena sudah di Navbar Global
import { useLanguage } from '@/context/LanguageContext';

export default function DocsPage() {
  // Panggil data bahasa dari Context terpusat
  const { t: globalT } = useLanguage();
  const t = globalT.docsPage;

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans overflow-x-hidden relative">
      
      {/* NAVBAR PANJANG SUDAH DIHAPUS DARI SINI */}

      {/* MAIN CONTENT (Jarak atas disesuaikan menjadi pt-8 sm:pt-12) */}
      <div className="pt-8 sm:pt-12 pb-12 sm:pb-20 max-w-5xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="md:col-span-1 space-y-2">
          <div className="bg-[#080808] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 sticky top-28 shadow-xl">
            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 font-mono">{t.sidebarTitle}</p>
            <div className="space-y-1">
              <a href="#contracts" className="block px-4 py-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 text-[11px] sm:text-xs font-bold font-mono border border-cyan-500/20">{t.navContracts}</a>
              <a href="#api" className="block px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white text-[11px] sm:text-xs font-bold transition-colors">{t.navApi}</a>
              <a href="#github" className="block px-4 py-2.5 rounded-xl text-neutral-400 hover:text-white text-[11px] sm:text-xs font-bold transition-colors">{t.navGithub}</a>
            </div>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="md:col-span-2 space-y-6 sm:space-y-8">
          
          {/* SECTION: SMART CONTRACTS */}
          <div className="bg-[#080808] border border-neutral-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 id="contracts" className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center gap-2">
              <Server className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400"/> {t.contractsTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mb-6 leading-relaxed">{t.contractsDesc}</p>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-[#030508] border border-neutral-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl">
                <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">{t.rpcLabel}</p>
                <p className="text-white font-mono text-xs sm:text-sm flex items-center gap-2"><Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400"/> {t.networkVal}</p>
              </div>
              <div className="bg-[#030508] border border-neutral-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl">
                <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">{t.tokenLabel}</p>
                <div className="flex justify-between items-center">
                  <p className="text-cyan-400 font-mono text-[10px] sm:text-sm break-all">0xDe3f12C4F22D9EE96E01509361E230B54D578080</p>
                </div>
              </div>
              <div className="bg-[#030508] border border-neutral-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl">
                <p className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest mb-1.5 font-bold">{t.stakingLabel}</p>
                <div className="flex justify-between items-center">
                  <p className="text-cyan-400 font-mono text-[10px] sm:text-sm break-all">0x0066d7389FD4df78dc67f0110Df825182904eD83</p>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION: API / ABI */}
          <div className="bg-[#080808] border border-neutral-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl">
            <h2 id="api" className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
              <FileJson className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400"/> {t.abiTitle}
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mb-4 leading-relaxed">{t.abiDesc}</p>
            <div className="bg-[#030508] p-4 rounded-xl border border-neutral-800 font-mono text-[10px] sm:text-xs text-neutral-500 overflow-x-auto shadow-inner">
              {`const StakingABI = [
  { "inputs": [{ "internalType": "uint256", "name": "_amount", ...}], "name": "stake", ...},
  { "inputs": [], "name": "claimReward", "outputs": [], "stateMutability": "nonpayable", ...}
];`}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
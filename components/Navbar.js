"use client";
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Memanggil data bahasa beserta kamusnya (t)
  const { lang, changeLanguage, t } = useLanguage();

  // Mengecek apakah kita sedang di halaman utama (Landing Page)
  const isHome = pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 border-b border-neutral-900 bg-[#030508]/90 backdrop-blur-xl z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo & Judul */}
        <div className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0" onClick={() => router.push('/')}>
          <img src="/logo.png" alt="Logo" className="w-7 h-7 sm:w-9 sm:h-9 object-contain" />
          <span className="hidden sm:block text-lg font-extrabold tracking-widest text-white">AETHERVAULT</span>
        </div>

        {/* MENU TENGAH: HANYA MUNCUL DI LANDING PAGE */}
        {isHome && t.nav && (
          <ul className="hidden lg:flex items-center gap-2.5 text-[10px] font-bold tracking-widest uppercase text-neutral-400 font-mono">
            <li><a href="#home" className="px-4 py-2 rounded-full border border-neutral-800 bg-[#080808] hover:border-cyan-500/40 hover:text-cyan-400 transition-all block">{t.nav.home}</a></li>
            <li><a href="#infrastructure" className="px-4 py-2 rounded-full border border-neutral-800 bg-[#080808] hover:border-cyan-500/40 hover:text-cyan-400 transition-all block">{t.nav.infra}</a></li>
            <li><a href="#tiers" className="px-4 py-2 rounded-full border border-neutral-800 bg-[#080808] hover:border-cyan-500/40 hover:text-cyan-400 transition-all block">{t.nav.tiers}</a></li>
            <li><a href="#tokenomics" className="px-4 py-2 rounded-full border border-neutral-800 bg-[#080808] hover:border-cyan-500/40 hover:text-cyan-400 transition-all block">{t.nav.tokenomics}</a></li>
            <li><a href="#team" className="px-4 py-2 rounded-full border border-neutral-800 bg-[#080808] hover:border-cyan-500/40 hover:text-cyan-400 transition-all block">{t.nav.team}</a></li>
          </ul>
        )}

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          
          {/* Tombol Pemilih Bahasa */}
          <div className="flex bg-[#080808] border border-neutral-800 rounded-full p-0.5 sm:p-1 shadow-sm">
            <button
              onClick={() => changeLanguage('id')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold transition-all cursor-pointer ${lang === 'id' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-neutral-400 hover:text-white'}`}
            >
              ID
            </button>
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[9px] sm:text-xs font-bold transition-all cursor-pointer ${lang === 'en' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-neutral-400 hover:text-white'}`}
            >
              EN
            </button>
          </div>

          {/* LOGIKA PINTAR: Launch App (Home) ATAU Back (Halaman Lain) */}
          {isHome ? (
            <button 
              onClick={() => router.push('/dashboard')} 
              className="flex items-center gap-1 sm:gap-2 bg-transparent hover:bg-cyan-500/10 border border-cyan-500/50 px-3 sm:px-6 py-1.5 sm:py-2.5 rounded-full transition-all text-[9px] sm:text-xs font-bold text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.2)] cursor-pointer outline-none whitespace-nowrap"
            >
              {lang === 'id' ? 'Luncurkan App' : 'Launch App'}
            </button>
          ) : (
            <button 
              onClick={() => router.push('/')} 
              className="flex items-center gap-1.5 sm:gap-2 bg-transparent hover:bg-neutral-900 border border-neutral-800 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-full transition-all text-[10px] sm:text-xs font-bold text-neutral-400 cursor-pointer outline-none"
            >
              <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> 
              <span className="hidden sm:inline">{lang === 'id' ? 'Kembali' : 'Back'}</span>
            </button>
          )}
          
        </div>
      </div>
    </nav>
  );
}
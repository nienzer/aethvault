"use client";
import React from 'react';
import { Users, MessageSquare, Send, Code, Globe, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CommunityPage() {
  // Panggil data bahasa dari Context
  const { t: globalT, lang } = useLanguage();
  const t = (globalT as any)?.communityPage || {};

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans overflow-x-hidden relative flex flex-col items-center">
      
      {/* MAIN CONTENT */}
      <div className="pt-8 sm:pt-12 pb-12 sm:pb-20 w-full max-w-4xl px-4 sm:px-6 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Users className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4">{t.title}</h1>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-lg mx-auto mb-8 sm:mb-12 px-4 sm:px-0 leading-relaxed">{t.desc}</p>

        {/* GRID SOCIAL MEDIA */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 max-w-2xl mx-auto mb-6 sm:mb-8">
          
          {/* 1. KARTU TELEGRAM */}
          <a href="https://t.me/AethVault" target="_blank" rel="noreferrer" className="bg-[#080808] border border-neutral-800 hover:border-cyan-500/40 p-5 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all group">
            <Send className="w-7 h-7 sm:w-10 sm:h-10 text-blue-400 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="text-white font-bold text-sm sm:text-lg">{t.telegramTitle}</h3>
              <p className="text-[9px] sm:text-xs text-neutral-500 mt-1">{t.telegramDesc}</p>
            </div>
          </a>
          
          {/* 2. KARTU TWITTER / X */}
          <a href="https://twitter.com/AethVault" target="_blank" rel="noreferrer" className="bg-[#080808] border border-neutral-800 hover:border-cyan-500/40 p-5 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all group">
            <MessageSquare className="w-7 h-7 sm:w-10 sm:h-10 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="text-white font-bold text-sm sm:text-lg">{t.twitterTitle}</h3>
              <p className="text-[9px] sm:text-xs text-neutral-500 mt-1">{t.twitterDesc}</p>
            </div>
          </a>
          
          {/* 3. KARTU GITHUB */}
          <a href="https://github.com/nienzer" target="_blank" rel="noreferrer" className="bg-[#080808] border border-neutral-800 hover:border-cyan-500/40 p-5 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all group">
            <Code className="w-7 h-7 sm:w-10 sm:h-10 text-neutral-400 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="text-white font-bold text-sm sm:text-lg">{t.githubTitle}</h3>
              <p className="text-[9px] sm:text-xs text-neutral-500 mt-1">{t.githubDesc}</p>
            </div>
          </a>
          
         {/* 4. KARTU WEB3 DAO FORUM */}
          <a href="/dashboard" className="bg-[#080808] border border-neutral-800 hover:border-cyan-500/40 p-5 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center gap-3 sm:gap-4 transition-all group">
            <Globe className="w-7 h-7 sm:w-10 sm:h-10 text-purple-400 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <h3 className="text-white font-bold text-sm sm:text-lg">{t.forumTitle}</h3>
              <p className="text-[9px] sm:text-xs text-neutral-500 mt-1">{t.forumDesc}</p>
            </div>
          </a>

        </div>

        {/* OFFICIAL EMAIL SUPPORT CARD */}
        <div className="max-w-2xl mx-auto">
          <a href="mailto:admin@aethvault.xyz" className="bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 hover:border-cyan-400 p-6 sm:p-8 rounded-2xl sm:rounded-3xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 transition-all group shadow-[0_0_20px_rgba(6,182,212,0.1)]">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-500/10 rounded-full flex items-center justify-center shrink-0">
              <Mail className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-center sm:text-left">
              <h3 className="text-white font-bold text-base sm:text-lg">{lang === 'en' ? 'Official Email Support' : 'Dukungan Email Resmi'}</h3>
              <p className="text-xs sm:text-sm text-cyan-400 mt-1 font-mono tracking-wide">admin@aethvault.xyz</p>
            </div>
          </a>
        </div>

      </div>
    </div>
  );
}
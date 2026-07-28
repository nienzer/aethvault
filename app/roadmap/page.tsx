"use client";
import React from 'react';
import { Map, CheckCircle2, Circle, Milestone } from 'lucide-react'; // ArrowLeft dihapus
import { useLanguage } from '@/context/LanguageContext';

export default function RoadmapPage() {
  // Panggil data bahasa dari Context
  const { t: globalT } = useLanguage();
  const t = globalT.roadmap;

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans overflow-x-hidden relative">
      
      {/* NAVBAR PANJANG SUDAH DIHAPUS DARI SINI */}

      {/* MAIN CONTENT (Jarak atas disesuaikan jadi pt-8 sm:pt-12) */}
      <div className="pt-8 sm:pt-12 pb-12 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold font-mono mb-4 uppercase tracking-widest">
            <Map className="w-3 h-3" /> {t.badge}
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white mb-3 sm:mb-4">{t.title}</h1>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-xl mx-auto px-4 sm:px-0 leading-relaxed">{t.desc}</p>
        </div>

        <div className="relative border-l-2 border-neutral-800 ml-4 md:ml-0 md:pl-0 space-y-8 sm:space-y-12">
          
          {/* FASE 1 */}
          <div className="relative md:pl-12 pl-6 sm:pl-8">
            <div className="absolute -left-[11px] md:-left-[11px] top-1 bg-[#030508] p-1">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
            </div>
            <div className="bg-[#080808] border border-cyan-500/30 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
              <span className="text-cyan-400 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 block">{t.phase1Time}</span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">{t.phase1Title}</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-neutral-400">
                <li className="flex gap-2 sm:gap-3 items-start"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0 mt-0.5"/> {t.phase1Item1}</li>
                <li className="flex gap-2 sm:gap-3 items-start"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0 mt-0.5"/> {t.phase1Item2}</li>
                <li className="flex gap-2 sm:gap-3 items-start"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0 mt-0.5"/> {t.phase1Item3}</li>
                <li className="flex gap-2 sm:gap-3 items-start"><CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-400 shrink-0 mt-0.5"/> {t.phase1Item4}</li>
              </ul>
            </div>
          </div>

          {/* FASE 2 */}
          <div className="relative md:pl-12 pl-6 sm:pl-8">
            <div className="absolute -left-[11px] md:-left-[11px] top-1 bg-[#030508] p-1">
              <Milestone className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-pulse" />
            </div>
            <div className="bg-[#080808] border border-neutral-800 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl">
              <span className="text-neutral-500 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 block">{t.phase2Time}</span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">{t.phase2Title}</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-neutral-400">
                <li className="flex gap-2 sm:gap-3 items-start"><Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 shrink-0 mt-0.5"/> {t.phase2Item1}</li>
                <li className="flex gap-2 sm:gap-3 items-start"><Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 shrink-0 mt-0.5"/> {t.phase2Item2}</li>
                <li className="flex gap-2 sm:gap-3 items-start"><Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-600 shrink-0 mt-0.5"/> {t.phase2Item3}</li>
              </ul>
            </div>
          </div>

          {/* FASE 3 */}
          <div className="relative md:pl-12 pl-6 sm:pl-8">
            <div className="absolute -left-[11px] md:-left-[11px] top-1 bg-[#030508] p-1">
              <Circle className="w-4 h-4 sm:w-5 sm:h-5 text-neutral-700" />
            </div>
            <div className="bg-[#080808] border border-neutral-900 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl opacity-70">
              <span className="text-neutral-600 font-mono text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-1.5 sm:mb-2 block">{t.phase3Time}</span>
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2 sm:mb-3">{t.phase3Title}</h3>
              <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-neutral-500">
                <li className="flex gap-2 sm:gap-3 items-start"><Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700 shrink-0 mt-0.5"/> {t.phase3Item1}</li>
                <li className="flex gap-2 sm:gap-3 items-start"><Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-neutral-700 shrink-0 mt-0.5"/> {t.phase3Item2}</li>
              </ul>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
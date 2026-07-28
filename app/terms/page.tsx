"use client";
import React from 'react';
import { FileText } from 'lucide-react'; // ArrowLeft & Shield dihapus
import { useLanguage } from '@/context/LanguageContext';

export default function TermsOfServicePage() {
  // Panggil data bahasa dari Context
  const { t: globalT, lang } = useLanguage();
  const t = globalT.terms;

  // Tanggal otomatis mengikuti bahasa yang aktif dari memori
  const currentDate = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden">
      
      {/* NAVBAR PANJANG SUDAH DIHAPUS DARI SINI */}

      {/* CONTENT (Jarak atas disesuaikan jadi pt-8 sm:pt-12) */}
      <div className="pt-8 sm:pt-12 pb-12 sm:pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="bg-[#080808] border border-neutral-900 rounded-2xl sm:rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/5 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="border-b border-neutral-800 pb-6 sm:pb-8 mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold font-mono mb-4 uppercase tracking-widest">
              <FileText className="w-3 h-3" /> {t.legalDoc}
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">{t.title}</h1>
            <p className="text-neutral-400">{t.updatedPrefix}{currentDate}</p>
          </div>

          <div className="space-y-6 sm:space-y-8 text-neutral-300 leading-relaxed text-sm md:text-base">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t.sec1Title}</h2>
              <p>{t.sec1Text}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t.sec2Title}</h2>
              <p>{t.sec2Text}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t.sec3Title}</h2>
              <p>{t.sec3Text}</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">{t.sec4Title}</h2>
              <p>{t.sec4Text}</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
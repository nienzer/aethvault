"use client";
import React from 'react';
import { Lock, Shield, EyeOff, Database, ServerOff, FileKey, AlertTriangle, Fingerprint, CheckCircle2, KeyRound } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function PrivacyPolicyPage() {
  const { t: globalT, lang } = useLanguage();
  const t = globalT.privacy;
  
  const currentDate = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  const sidebarLinks = [
    { id: "zero-knowledge", label: t.sec1Title, icon: <EyeOff className="w-4 h-4" /> },
    { id: "no-keys", label: t.sec2Title, icon: <KeyRound className="w-4 h-4" /> },
    { id: "client-side", label: t.sec3Title, icon: <Lock className="w-4 h-4" /> },
    { id: "public-data", label: t.sec4Title, icon: <Database className="w-4 h-4" /> },
    { id: "storage", label: t.sec5Title, icon: <ServerOff className="w-4 h-4" /> },
    { id: "no-tracking", label: t.sec6Title, icon: <Fingerprint className="w-4 h-4" /> },
    { id: "liability", label: t.sec7Title, icon: <Shield className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#030208] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden">
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* SIDEBAR */}
        <div className="hidden lg:block col-span-1">
          <div className="sticky top-28 space-y-1 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 px-3 font-mono">Privacy Sections</p>
            {sidebarLinks.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all text-neutral-400 hover:bg-cyan-500/10 hover:text-cyan-400 truncate">
                <span className="shrink-0">{item.icon}</span> <span className="truncate">{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-[#0A0713]/80 backdrop-blur-xl border border-neutral-900 rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="border-b border-neutral-800 pb-10 mb-12 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold font-mono mb-6 uppercase tracking-widest shadow-inner">
                <Lock className="w-3 h-3" /> {t.legalDoc}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight font-display tracking-tight">{t.title}</h1>
              <p className="text-lg sm:text-xl text-neutral-400 mb-8 max-w-2xl">{t.subtitle}</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-neutral-800/50">
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">{t.updatedPrefix.replace(': ', '')}</p>
                  <p className="text-sm font-bold text-white">{currentDate}</p>
                </div>
                <div className="hidden sm:block w-px h-10 bg-neutral-800"></div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">{t.architecture}</p>
                  <p className="text-sm font-bold text-cyan-400 flex items-center justify-center sm:justify-start gap-1">
                    <CheckCircle2 className="w-4 h-4"/> {t.clientSide}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-4">
               <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
               <div>
                 <h4 className="text-white font-bold mb-1">{t.criticalNotice}</h4>
                 <p className="text-sm text-red-200/80">{t.criticalDesc}</p>
               </div>
            </div>

            <div className="space-y-16 text-neutral-300 leading-relaxed text-sm md:text-base font-medium">
              
              <section id="zero-knowledge" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-cyan-500 pl-4">{t.sec1Title}</h2>
                <p className="mb-4">{t.sec1Text1}</p>
                <p>{t.sec1Text2}</p>
              </section>

              <section id="no-keys" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-red-500 pl-4">{t.sec2Title}</h2>
                <div className="bg-[#030208] border border-neutral-800 p-6 rounded-2xl">
                   <p className="mb-4 text-white font-bold">{t.sec2Text}</p>
                   <ul className="list-disc list-inside space-y-2 text-neutral-400">
                     {t.sec2Items?.map((item, i) => <li key={i}>{item}</li>)}
                   </ul>
                </div>
              </section>

              <section id="client-side" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-blue-500 pl-4">{t.sec3Title}</h2>
                <p className="mb-4">{t.sec3Text1}</p>
                <div className="flex items-center gap-3 bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl text-blue-200 text-sm">
                   <FileKey className="w-6 h-6 text-blue-400 shrink-0"/>
                   <p>{t.sec3Text2}</p>
                </div>
              </section>

              <section id="public-data" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-purple-500 pl-4">{t.sec4Title}</h2>
                <p className="mb-4">{t.sec4Text1}</p>
                <div className="grid sm:grid-cols-2 gap-3 mb-4">
                  {t.sec4Items?.map((item, i) => (
                    <div key={i} className="bg-[#05030F] border border-neutral-800 px-4 py-3 rounded-lg text-xs font-mono text-neutral-300">
                      • {item}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-neutral-500 italic">{t.sec4Text2}</p>
              </section>

              <section id="storage" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-amber-500 pl-4">{t.sec5Title}</h2>
                <p className="mb-4">{t.sec5Text1}</p>
                <p>{t.sec5Text2}</p>
              </section>

              <section id="no-tracking" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-emerald-500 pl-4">{t.sec6Title}</h2>
                <p className="mb-4">{t.sec6Text1}</p>
                <ul className="space-y-3">
                  {t.sec6Items?.map((item, i) => (
                    <li key={i} className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0"/> {item}</li>
                  ))}
                </ul>
              </section>

              <section id="liability" className="scroll-mt-32 border-t border-neutral-800 pt-12">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-neutral-500 pl-4">{t.sec7Title}</h2>
                <p className="mb-4">{t.sec7Text1}</p>
                <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-2xl text-neutral-400 text-sm space-y-4">
                  <p>{t.sec7Text2}</p>
                  <ul className="list-disc list-inside ml-2">
                    {t.sec7Items?.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
                  <p className="text-center font-bold text-white mt-6 pt-4 border-t border-neutral-800">{t.sec7Footer}</p>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
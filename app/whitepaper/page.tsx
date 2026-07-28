"use client";
import React from 'react';
import { Shield, FileText, Lock, Cpu, Coins, Flame, Layers, Map } from 'lucide-react'; // ArrowLeft dihapus karena sudah di Navbar
import { useLanguage } from '@/context/LanguageContext';

export default function WhitepaperPage() {
  // Cukup panggil otak bahasa dari Context
  const { t: globalT } = useLanguage();
  const t = globalT.whitepaper;

  return (
    <div className="min-h-screen bg-[#030508] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden">
      
      {/* KODE <nav> PANJANG SUDAH DIHAPUS TOTAL DARI SINI */}

      {/* CONTENT AREA (Jarak atas diubah jadi pt-8 karena layout sudah punya pt-20) */}
      <div className="pt-8 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* SIDEBAR NAVIGATION (Desktop Only) */}
        <div className="hidden lg:block col-span-1">
          <div className="sticky top-32 space-y-1">
            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 px-3 font-mono">{t.tableOfContent}</p>
            {[
              { id: "abstract", label: "Abstract", icon: <FileText className="w-4 h-4" /> },
              { id: "pendahuluan", label: t.sec1Title, icon: <Layers className="w-4 h-4" /> },
              { id: "arsitektur", label: t.sec2Title, icon: <Lock className="w-4 h-4" /> },
              { id: "tokenomics", label: t.sec3Title, icon: <Coins className="w-4 h-4" /> },
              { id: "deflasi", label: t.sec4Title, icon: <Flame className="w-4 h-4" /> },
              { id: "staking", label: t.sec5Title, icon: <Cpu className="w-4 h-4" /> },
              { id: "roadmap", label: t.sec6Title, icon: <Map className="w-4 h-4" /> },
            ].map((item) => (
              <a 
                key={item.id} 
                href={`#${item.id}`}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all text-neutral-400 hover:bg-cyan-500/10 hover:text-cyan-400"
              >
                {item.icon} {item.label}
              </a>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-[#080808] border border-neutral-900 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-600/5 blur-[80px] rounded-full pointer-events-none"></div>

            {/* HEADER DOCUMENT */}
            <div className="border-b border-neutral-800 pb-8 mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold font-mono mb-4 uppercase tracking-widest">
                {t.officialDoc}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight whitespace-pre-line">{t.title}</h1>
              <p className="text-xl text-neutral-400 mb-6">{t.subtitle}</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center p-0.5">
                  <div className="w-full h-full bg-[#030508] rounded-full flex items-center justify-center">
                    <Shield className="w-5 h-5 text-cyan-400" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Nienzer</p>
                  <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">{t.authorRole}</p>
                </div>
              </div>
            </div>

            {/* CONTENT BODY */}
            <div className="space-y-12 text-neutral-300 leading-relaxed text-sm md:text-base">
              
              <section id="abstract" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><FileText className="text-cyan-400 w-6 h-6"/> {t.abstractTitle}</h2>
                <p>{t.abstractText}</p>
              </section>

              <section id="pendahuluan" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4">{t.sec1Title}</h2>
                <p>{t.sec1Text}</p>
              </section>

              <section id="arsitektur" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4">{t.sec2Title}</h2>
                <ul className="space-y-4 list-none pl-0">
                  <li className="bg-[#030508] border border-neutral-800 p-5 rounded-2xl">
                    <strong className="text-cyan-400 block mb-1">{t.sec2Box1Title}</strong>
                    {t.sec2Box1Text}
                  </li>
                  <li className="bg-[#030508] border border-neutral-800 p-5 rounded-2xl">
                    <strong className="text-cyan-400 block mb-1">{t.sec2Box2Title}</strong>
                    {t.sec2Box2Text}
                  </li>
                  <li className="bg-[#030508] border border-neutral-800 p-5 rounded-2xl">
                    <strong className="text-cyan-400 block mb-1">{t.sec2Box3Title}</strong>
                    {t.sec2Box3Text}
                  </li>
                  <li className="bg-[#030508] border border-neutral-800 p-5 rounded-2xl">
                    <strong className="text-cyan-400 block mb-1">{t.sec2Box4Title}</strong>
                    {t.sec2Box4Text}
                  </li>
                </ul>
              </section>

              <section id="tokenomics" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4">{t.sec3Title}</h2>
                <p className="mb-6">{t.sec3Text}</p>
                <div className="bg-cyan-500/10 border border-cyan-500/20 p-4 rounded-2xl inline-block mb-6">
                  <p className="text-xs text-cyan-400 font-bold uppercase tracking-widest font-mono mb-1">{t.totalSupplyLabel}</p>
                  <p className="text-2xl font-extrabold text-white font-mono">100,000,000 AETH</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="border-b border-neutral-800 text-sm text-neutral-400">
                        <th className="py-4 font-bold">{t.tableAlloc}</th>
                        <th className="py-4 font-bold">{t.tablePerc}</th>
                        <th className="py-4 font-bold font-mono">{t.tableAmount}</th>
                        <th className="py-4 font-bold">{t.tableDesc}</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      <tr className="border-b border-neutral-900/50">
                        <td className="py-4 font-bold text-white">{t.t1Name}</td>
                        <td className="py-4 text-cyan-400 font-bold">30%</td>
                        <td className="py-4 font-mono">30,000,000</td>
                        <td className="py-4 text-neutral-500">{t.t1Desc}</td>
                      </tr>
                      <tr className="border-b border-neutral-900/50">
                        <td className="py-4 font-bold text-white">{t.t2Name}</td>
                        <td className="py-4 text-cyan-400 font-bold">25%</td>
                        <td className="py-4 font-mono">25,000,000</td>
                        <td className="py-4 text-neutral-500">{t.t2Desc}</td>
                      </tr>
                      <tr className="border-b border-neutral-900/50">
                        <td className="py-4 font-bold text-white">{t.t3Name}</td>
                        <td className="py-4 text-cyan-400 font-bold">20%</td>
                        <td className="py-4 font-mono">20,000,000</td>
                        <td className="py-4 text-neutral-500">{t.t3Desc}</td>
                      </tr>
                      <tr className="border-b border-neutral-900/50">
                        <td className="py-4 font-bold text-white">{t.t4Name}</td>
                        <td className="py-4 text-cyan-400 font-bold">15%</td>
                        <td className="py-4 font-mono">15,000,000</td>
                        <td className="py-4 text-neutral-500">{t.t4Desc}</td>
                      </tr>
                      <tr>
                        <td className="py-4 font-bold text-white">{t.t5Name}</td>
                        <td className="py-4 text-cyan-400 font-bold">10%</td>
                        <td className="py-4 font-mono">10,000,000</td>
                        <td className="py-4 text-neutral-500">{t.t5Desc}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section id="deflasi" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4">{t.sec4Title}</h2>
                <p className="mb-4">{t.sec4Text}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-[#030508] border border-neutral-800 p-4 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{t.tier1}</span>
                    <span className="text-red-400 font-mono text-sm font-bold flex items-center gap-1"><Flame className="w-4 h-4"/> 2 AETH Burn</span>
                  </div>
                  <div className="bg-[#030508] border border-cyan-500/20 p-4 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{t.tier2}</span>
                    <span className="text-red-400 font-mono text-sm font-bold flex items-center gap-1"><Flame className="w-4 h-4"/> 10 AETH Burn</span>
                  </div>
                  <div className="bg-[#030508] border border-yellow-500/20 p-4 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{t.tier3}</span>
                    <span className="text-red-400 font-mono text-sm font-bold flex items-center gap-1"><Flame className="w-4 h-4"/> 40 AETH Burn</span>
                  </div>
                  <div className="bg-[#030508] border border-red-500/20 p-4 rounded-xl flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{t.tier4}</span>
                    <span className="text-red-400 font-mono text-sm font-bold flex items-center gap-1"><Flame className="w-4 h-4"/> 100 AETH Burn</span>
                  </div>
                </div>
              </section>

              <section id="staking" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4">{t.sec5Title}</h2>
                <p>{t.sec5Text}</p>
              </section>

              <section id="roadmap" className="scroll-mt-32">
                <h2 className="text-2xl font-bold text-white mb-4">{t.sec6Title}</h2>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center text-[#030508] font-bold text-xs">1</div>
                      <div className="w-px h-full bg-cyan-500/30 my-2"></div>
                    </div>
                    <div className="pb-4">
                      <h4 className="font-bold text-white text-lg">{t.phase1Title}</h4>
                      <p className="text-neutral-400 text-sm mt-1">{t.phase1Desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs">2</div>
                      <div className="w-px h-full bg-neutral-800 my-2"></div>
                    </div>
                    <div className="pb-4">
                      <h4 className="font-bold text-white text-lg opacity-70">{t.phase2Title}</h4>
                      <p className="text-neutral-500 text-sm mt-1">{t.phase2Desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs">3</div>
                      <div className="w-px h-full bg-neutral-800 my-2"></div>
                    </div>
                    <div className="pb-4">
                      <h4 className="font-bold text-white text-lg opacity-70">{t.phase3Title}</h4>
                      <p className="text-neutral-500 text-sm mt-1">{t.phase3Desc}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-white font-bold text-xs">4</div>
                    </div>
                    <div className="pb-4">
                      <h4 className="font-bold text-white text-lg opacity-70">{t.phase4Title}</h4>
                      <p className="text-neutral-500 text-sm mt-1">{t.phase4Desc}</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="scroll-mt-32 border-t border-neutral-800 pt-10">
                <h2 className="text-2xl font-bold text-white mb-4">{t.sec7Title}</h2>
                <p>{t.sec7Text}</p>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
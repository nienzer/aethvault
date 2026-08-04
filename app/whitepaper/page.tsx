"use client";
import React from 'react';
import { Shield, FileText, Lock, Cpu, Coins, Flame, Layers, Map, Network, Award, Globe, ShieldCheck, AlertTriangle, CheckCircle2, Zap, Flag, ArrowRight, ArrowDown } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function WhitepaperPage() {
  const { t: globalT } = useLanguage();
  const t = globalT.whitepaper;

  // Navigasi Sidebar Dinamis untuk 14 Bab
  const sidebarLinks = [
    { id: "abstract", label: t.sec1Title, icon: <FileText className="w-4 h-4" /> },
    { id: "problem", label: t.sec2Title, icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "solution", label: t.sec3Title, icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "architecture", label: t.sec4Title, icon: <Network className="w-4 h-4" /> },
    { id: "cryptography", label: t.sec5Title, icon: <Lock className="w-4 h-4" /> },
    { id: "aetherproof", label: t.sec6Title, icon: <Award className="w-4 h-4" /> },
    { id: "hallofproof", label: t.sec7Title, icon: <Globe className="w-4 h-4" /> },
    { id: "security", label: t.sec8Title, icon: <ShieldCheck className="w-4 h-4" /> },
    { id: "tokenutility", label: t.sec9Title, icon: <Coins className="w-4 h-4" /> },
    { id: "deflation", label: t.sec10Title, icon: <Flame className="w-4 h-4" /> },
    { id: "staking", label: t.sec11Title, icon: <Layers className="w-4 h-4" /> },
    { id: "roadmap", label: t.sec12Title, icon: <Map className="w-4 h-4" /> },
    { id: "future", label: t.sec13Title, icon: <Zap className="w-4 h-4" /> },
    { id: "conclusion", label: t.sec14Title, icon: <Flag className="w-4 h-4" /> }
  ];

  // Helper untuk membersihkan teks dari format bullet points yang berlebihan
  const renderFormattedText = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('•')) {
        return <li key={idx} className="ml-4 mb-2 flex items-start gap-2"><span className="text-cyan-500 mt-1">•</span> {line.replace('• ', '')}</li>;
      }
      if (line.startsWith('**') && line.endsWith('**')) {
        return <h4 key={idx} className="text-lg font-bold text-white mt-6 mb-2">{line.replace(/\*\*/g, '')}</h4>;
      }
      return <p key={idx} className="mb-4">{line}</p>;
    });
  };

  return (
    <div className="min-h-screen bg-[#030208] text-gray-200 font-sans selection:bg-cyan-500 overflow-x-hidden">
      
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* SIDEBAR NAVIGATION (Desktop Only) */}
        <div className="hidden lg:block col-span-1">
          <div className="sticky top-28 space-y-1 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
            <p className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest mb-4 px-3 font-mono">{t.tableOfContent}</p>
            {sidebarLinks.map((item) => (
              <a 
                key={item.id} 
                href={`#${item.id}`}
                className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all text-neutral-400 hover:bg-cyan-500/10 hover:text-cyan-400 truncate"
              >
                <span className="shrink-0">{item.icon}</span> <span className="truncate">{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-[#0A0713]/80 backdrop-blur-xl border border-neutral-900 rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-600/5 blur-[100px] rounded-full pointer-events-none"></div>

            {/* ⭐ COVER PAGE / HEADER DOCUMENT */}
            <div className="border-b border-neutral-800 pb-10 mb-12 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold font-mono mb-6 uppercase tracking-widest shadow-inner">
                {t.officialDoc}
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight font-display tracking-tight">
                {t.title}
              </h1>
              <p className="text-lg sm:text-xl text-neutral-400 mb-8 max-w-2xl">{t.subtitle}</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 border-t border-neutral-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-500 flex items-center justify-center p-[2px] shadow-lg">
                    <div className="w-full h-full bg-[#030508] rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-white">Nienzer</p>
                    <p className="text-[10px] font-mono text-cyan-500 uppercase tracking-widest">Lead Architect</p>
                  </div>
                </div>
                <div className="hidden sm:block w-px h-10 bg-neutral-800"></div>
                <div className="text-center sm:text-left">
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Document Version</p>
                  <p className="text-sm font-bold text-white">{t.authorRole}</p>
                </div>
              </div>
            </div>

            {/* ⭐ CONTENT BODY */}
            <div className="space-y-16 text-neutral-300 leading-relaxed text-sm md:text-base font-medium">
              
              {/* 1. Abstract */}
              <section id="abstract" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-cyan-500 pl-4">{t.sec1Title}</h2>
                <div className="text-lg text-neutral-300 leading-relaxed opacity-90">{renderFormattedText(t.sec1Text)}</div>
              </section>

              {/* 2. Problem Statement */}
              <section id="problem" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-red-500 pl-4">{t.sec2Title}</h2>
                <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-2xl text-red-100/80">
                  {renderFormattedText(t.sec2Text)}
                </div>
              </section>

              {/* 3. Solution */}
              <section id="solution" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-green-500 pl-4">{t.sec3Title}</h2>
                <div className="bg-[#05030F] border border-neutral-800 p-6 sm:p-8 rounded-3xl shadow-inner">
                  {renderFormattedText(t.sec3Text)}
                </div>
              </section>

              {/* 4. Architecture (DIAGRAM VISUAL) */}
              <section id="architecture" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-blue-500 pl-4">{t.sec4Title}</h2>
                <p className="mb-8">{t.sec4Text.split(':')[0]}:</p>
                
                {/* Visual Pipeline Architecture */}
                <div className="bg-[#030208] border border-neutral-800 rounded-3xl p-8 flex flex-col items-center shadow-inner relative overflow-hidden">
                   <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjM0IzQjRCIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIvPjwvZz48L3N2Zz4=')] opacity-20"></div>
                   
                   <div className="relative z-10 w-full max-w-md space-y-2">
                     {["User Local Input", "ECIES Browser Encryption", "IPFS / Arweave Storage", "Polygon Smart Contract", "Immutable Registry"].map((step, idx) => (
                       <React.Fragment key={idx}>
                         <div className="bg-neutral-900 border border-neutral-700 p-4 rounded-xl text-center font-bold text-sm text-cyan-300 shadow-md flex items-center justify-center gap-3">
                           {idx === 1 ? <Lock className="w-4 h-4"/> : idx === 3 ? <Layers className="w-4 h-4"/> : <CheckCircle2 className="w-4 h-4 text-green-400"/>}
                           {step}
                         </div>
                         {idx !== 4 && <div className="flex justify-center"><ArrowDown className="w-5 h-5 text-neutral-600 my-1"/></div>}
                       </React.Fragment>
                     ))}
                   </div>
                </div>
              </section>

              {/* 5. Cryptography */}
              <section id="cryptography" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-purple-500 pl-4">{t.sec5Title}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                   <div className="bg-purple-900/10 border border-purple-500/20 p-5 rounded-2xl">{renderFormattedText(t.sec5Text)}</div>
                </div>
              </section>

              {/* 6. Aether Proof */}
              <section id="aetherproof" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-amber-500 pl-4">{t.sec6Title}</h2>
                {renderFormattedText(t.sec6Text)}
              </section>

              {/* 7. Hall of Proof */}
              <section id="hallofproof" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-cyan-500 pl-4">{t.sec7Title}</h2>
                {renderFormattedText(t.sec7Text)}
              </section>

              {/* 8. Security */}
              <section id="security" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-emerald-500 pl-4">{t.sec8Title}</h2>
                <div className="bg-emerald-900/10 border border-emerald-500/20 p-6 rounded-2xl">
                  {renderFormattedText(t.sec8Text)}
                </div>
              </section>

              {/* 9. Token Utility */}
              <section id="tokenutility" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-indigo-500 pl-4">{t.sec9Title}</h2>
                {renderFormattedText(t.sec9Text)}
              </section>

              {/* 10. Deflationary Mechanism (TABEL DEFLASI PREMIUM) */}
              <section id="deflation" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-orange-500 pl-4">{t.sec10Title}</h2>
                <p className="mb-6">{t.sec10Text.split('\n\n')[0]}</p>
                
                <div className="overflow-x-auto bg-[#030208] border border-neutral-800 rounded-2xl shadow-inner">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-neutral-800 bg-neutral-900/50 text-xs text-neutral-400 uppercase tracking-widest font-mono">
                        <th className="p-5 font-bold rounded-tl-2xl">Security Tier</th>
                        <th className="p-5 font-bold">Transaction Cost</th>
                        <th className="p-5 font-bold text-red-400 flex items-center gap-2"><Flame className="w-4 h-4"/> Burn Rate</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm font-mono">
                      <tr className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors">
                        <td className="p-5 font-bold text-white">Basic</td>
                        <td className="p-5 text-cyan-400">10 AETH</td>
                        <td className="p-5 text-red-400 font-bold">2 AETH (20%)</td>
                      </tr>
                      <tr className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors">
                        <td className="p-5 font-bold text-white">VIP Vault</td>
                        <td className="p-5 text-cyan-400">50 AETH</td>
                        <td className="p-5 text-red-400 font-bold">10 AETH (20%)</td>
                      </tr>
                      <tr className="border-b border-neutral-800/50 hover:bg-neutral-900/30 transition-colors">
                        <td className="p-5 font-bold text-white">Eternal</td>
                        <td className="p-5 text-cyan-400">200 AETH</td>
                        <td className="p-5 text-red-400 font-bold">40 AETH (20%)</td>
                      </tr>
                      <tr className="hover:bg-neutral-900/30 transition-colors">
                        <td className="p-5 font-bold text-white flex items-center gap-2">Legacy <span className="text-[9px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded uppercase tracking-widest">Heirloom</span></td>
                        <td className="p-5 text-cyan-400">500 AETH</td>
                        <td className="p-5 text-red-400 font-bold">100 AETH (20%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 11. Staking */}
              <section id="staking" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-yellow-500 pl-4">{t.sec11Title}</h2>
                {renderFormattedText(t.sec11Text)}
              </section>

              {/* 12. Roadmap (VISUAL TIMELINE) */}
              <section id="roadmap" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 font-display border-l-4 border-pink-500 pl-4">{t.sec12Title}</h2>
                <div className="space-y-6 pl-2 sm:pl-4 border-l-2 border-neutral-800 ml-4">
                  {[
                    { phase: "Phase 1: Genesis", desc: "Core Protocol, Web3 Wallet Integration, Time Capsule, ECIES Encryption", color: "bg-cyan-500" },
                    { phase: "Phase 2: Expansion", desc: "Aether Proof™ Implementation, Certificate Generation, Hall of Proof, Blockchain Explorer", color: "bg-blue-500" },
                    { phase: "Phase 3: Decentralization", desc: "DAO Transition, Public API, Developer SDK, Developer Portal", color: "bg-purple-500" },
                    { phase: "Phase 4: Global Adoption", desc: "Mobile App, Cross-chain Integration, Enterprise Solutions, Institutional Partnerships", color: "bg-indigo-500" }
                  ].map((p, idx) => (
                    <div key={idx} className="relative pl-6 sm:pl-8">
                       <div className={`absolute -left-[1.3rem] top-1.5 w-4 h-4 rounded-full ${p.color} border-4 border-[#0B0817] shadow-lg`}></div>
                       <h4 className="text-lg font-bold text-white mb-1">{p.phase}</h4>
                       <p className="text-neutral-400 text-sm">{p.desc}</p>
                    </div>
                  ))}
                </div>
              </section>

              {/* 13. Future Ecosystem */}
              <section id="future" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-fuchsia-500 pl-4">{t.sec13Title}</h2>
                <div className="bg-[#05030F] p-6 rounded-3xl border border-neutral-800">
                  {renderFormattedText(t.sec13Text)}
                </div>
              </section>

              {/* 14. Conclusion */}
              <section id="conclusion" className="scroll-mt-32 border-t border-neutral-800 pt-12">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-white pl-4">{t.sec14Title}</h2>
                <p className="text-xl leading-relaxed text-white font-medium italic opacity-90">{t.sec14Text}</p>
              </section>

              {/* ⭐ DISCLAIMER */}
              <div className="mt-16 pt-8 border-t border-neutral-900 text-center space-y-3">
                <h5 className="text-xs font-bold text-neutral-500 uppercase tracking-widest font-mono">{t.disclaimerTitle}</h5>
                <p className="text-[10px] text-neutral-600 max-w-2xl mx-auto leading-relaxed">{t.disclaimerText}</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
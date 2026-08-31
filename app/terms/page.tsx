"use client";
import React from 'react';
import { FileText, Shield, Lock, Scale, AlertTriangle, CheckCircle2, Database, Flame, Wallet, Coins, Globe, Mail, MessageSquare, Send, Code, TerminalSquare, Layers, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function TermsOfServicePage() {
  const { t: globalT, lang } = useLanguage();
  const t = globalT.terms;
  
  const currentDate = new Date().toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

  const sidebarLinks = [
    { id: "acceptance", label: t.sec1Title, icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: "description", label: t.sec2Title, icon: <Layers className="w-4 h-4" /> },
    { id: "non-custodial", label: t.sec3Title, icon: <Shield className="w-4 h-4" /> },
    { id: "encryption", label: t.sec4Title, icon: <Lock className="w-4 h-4" /> },
    { id: "permanence", label: t.sec5Title, icon: <Database className="w-4 h-4" /> },
    { id: "ip", label: t.sec6Title, icon: <FileText className="w-4 h-4" /> },
    { id: "prohibited", label: t.sec7Title, icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "wallet", label: t.sec8Title, icon: <Wallet className="w-4 h-4" /> },
    { id: "token", label: t.sec9Title, icon: <Coins className="w-4 h-4" /> },
    { id: "burn", label: t.sec10Title, icon: <Flame className="w-4 h-4" /> },
    { id: "fees", label: t.sec11Title, icon: <TerminalSquare className="w-4 h-4" /> },
    { id: "disclaimer", label: t.sec12Title, icon: <AlertTriangle className="w-4 h-4" /> },
    { id: "liability", label: t.sec13Title, icon: <Scale className="w-4 h-4" /> },
    { id: "opensource", label: t.sec14Title, icon: <Code className="w-4 h-4" /> },
    { id: "law", label: t.sec15Title, icon: <Globe className="w-4 h-4" /> },
    { id: "changes", label: t.sec16Title, icon: <RefreshCcw className="w-4 h-4" /> },
    { id: "contact", label: t.sec17Title, icon: <Mail className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-[#030208] text-gray-200 font-sans selection:bg-purple-500 overflow-x-hidden">
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-4 gap-10">
        
        {/* SIDEBAR */}
        <div className="hidden lg:block col-span-1">
          <div className="sticky top-28 space-y-1 max-h-[80vh] overflow-y-auto custom-scrollbar pr-2">
            <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-4 px-3 font-mono">Legal Sections</p>
            {sidebarLinks.map((item) => (
              <a key={item.id} href={`#${item.id}`} className="flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl text-[11px] font-bold transition-all text-neutral-400 hover:bg-purple-500/10 hover:text-purple-400 truncate">
                <span className="shrink-0">{item.icon}</span> <span className="truncate">{item.label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* CONTENT */}
        <div className="col-span-1 lg:col-span-3">
          <div className="bg-[#0A0713]/80 backdrop-blur-xl border border-neutral-900 rounded-3xl p-8 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="border-b border-neutral-800 pb-10 mb-12 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-bold font-mono mb-6 uppercase tracking-widest shadow-inner">
                <Scale className="w-3 h-3" /> {t.legalDoc}
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
                  <p className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1">Jurisdiction</p>
                  <p className="text-sm font-bold text-white">{t.jurisdiction}</p>
                </div>
              </div>
            </div>

            <div className="space-y-16 text-neutral-300 leading-relaxed text-sm md:text-base font-medium">
              
              <section id="acceptance" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-purple-500 pl-4">{t.sec1Title}</h2>
                <p className="mb-4">{t.sec1Text1}</p>
                <p className="mb-4">{t.sec1Text2}</p>
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-200 font-bold">{t.sec1Warning}</div>
              </section>

              <section id="description" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-blue-500 pl-4">{t.sec2Title}</h2>
                <p className="mb-4">{t.sec2Text}</p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 bg-[#030208] p-4 rounded-xl border border-neutral-800"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><div><strong className="text-white">Aether Capsule™:</strong> {t.sec2Capsule}</div></li>
                  <li className="flex items-start gap-3 bg-[#030208] p-4 rounded-xl border border-neutral-800"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><div><strong className="text-white">Aether Proof™:</strong> {t.sec2Proof}</div></li>
                  <li className="flex items-start gap-3 bg-[#030208] p-4 rounded-xl border border-neutral-800"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><div><strong className="text-white">Hall of Proof™:</strong> {t.sec2Hall}</div></li>
                  <li className="flex items-start gap-3 bg-[#030208] p-4 rounded-xl border border-neutral-800"><CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0"/><div><strong className="text-white">AETH Token:</strong> {t.sec2Token}</div></li>
                </ul>
                <p className="mt-6 text-sm text-neutral-400 font-mono">{t.sec2Footer}</p>
              </section>

              <section id="non-custodial" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-amber-500 pl-4">{t.sec3Title}</h2>
                <p className="mb-6 font-bold text-amber-400 uppercase tracking-widest text-sm">{t.sec3Warning}</p>
                <p className="mb-4">{t.sec3Text1}</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {t.sec3Items?.map(item => (
                    <div key={item} className="bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg text-amber-200 text-center text-xs font-bold">{item}</div>
                  ))}
                </div>
                <p className="font-bold text-white">{t.sec3Text2}</p>
              </section>

              <section id="encryption" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-cyan-500 pl-4">{t.sec4Title}</h2>
                <p className="mb-4">{t.sec4Text1}</p>
                <p className="bg-neutral-900 border border-neutral-700 p-4 rounded-xl text-neutral-300">{t.sec4Text2}</p>
              </section>

              <section id="permanence" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-rose-500 pl-4">{t.sec5Title}</h2>
                <p className="mb-4">{t.sec5Text1}</p>
                <ul className="list-disc list-inside space-y-2 ml-4 text-rose-200">
                  {t.sec5Items?.map(item => <li key={item}>{item}</li>)}
                </ul>
              </section>

              <section id="ip" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-indigo-500 pl-4">{t.sec6Title}</h2>
                <p className="mb-4">{t.sec6Text1}</p>
                <p>{t.sec6Text2}</p>
              </section>

              <section id="prohibited" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-red-600 pl-4">{t.sec7Title}</h2>
                <p className="mb-4">{t.sec7Text}</p>
                <div className="flex flex-wrap gap-2">
                  {t.sec7Items?.map(item => (
                    <span key={item} className="bg-[#030208] border border-red-900/50 text-neutral-400 px-3 py-1.5 rounded-full text-xs font-mono">{item}</span>
                  ))}
                </div>
              </section>

              <section id="wallet" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-emerald-500 pl-4">{t.sec8Title}</h2>
                <p className="mb-4">{t.sec8Text1}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-4 text-emerald-100">
                  {t.sec8Items?.map(item => <li key={item}>{item}</li>)}
                </ul>
                <p className="font-bold text-white bg-emerald-900/20 p-4 rounded-xl inline-block">{t.sec8Warning}</p>
              </section>

              <section id="token" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-yellow-500 pl-4">{t.sec9Title}</h2>
                <p className="mb-4">{t.sec9Text1}</p>
                <p className="italic text-neutral-500 text-sm">{t.sec9Disclaimer}</p>
              </section>

              <section id="burn" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-orange-500 pl-4">{t.sec10Title}</h2>
                <p>{t.sec10Text}</p>
              </section>

              <section id="fees" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-teal-500 pl-4">{t.sec11Title}</h2>
                <p className="mb-4">{t.sec11Text}</p>
                <ul className="list-disc list-inside space-y-1 ml-4 mb-4">
                  {t.sec11Items?.map(item => <li key={item}>{item}</li>)}
                </ul>
                <p className="text-xs text-neutral-500 font-mono">{t.sec11Footer}</p>
              </section>

              <section id="disclaimer" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-neutral-500 pl-4">{t.sec12Title}</h2>
                <div className="bg-neutral-900 border border-neutral-700 p-6 rounded-2xl">
                  <p className="text-xl font-black text-white mb-4">{t.sec12Warning}</p>
                  <p className="text-neutral-400 mb-2">{t.sec12Text}</p>
                  <ul className="list-disc list-inside text-neutral-400">
                    {t.sec12Items?.map(item => <li key={item}>{item}</li>)}
                  </ul>
                </div>
              </section>

              <section id="liability" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-red-500 pl-4">{t.sec13Title}</h2>
                <p className="mb-4">{t.sec13Text}</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {t.sec13Items?.map(item => (
                    <div key={item} className="bg-[#030208] border border-neutral-800 p-3 rounded-lg text-sm text-center">{item}</div>
                  ))}
                </div>
              </section>

              <section id="opensource" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-cyan-500 pl-4">{t.sec14Title}</h2>
                <p>{t.sec14Text}</p>
              </section>

              <section id="law" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-blue-500 pl-4">{t.sec15Title}</h2>
                <p>{t.sec15Text}</p>
              </section>

              <section id="changes" className="scroll-mt-32">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-6 font-display border-l-4 border-purple-500 pl-4">{t.sec16Title}</h2>
                <p>{t.sec16Text}</p>
              </section>

              <section id="contact" className="scroll-mt-32 border-t border-neutral-800 pt-12">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-8 font-display border-l-4 border-white pl-4">{t.sec17Title}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <a href="https://aethvault.xyz" className="flex items-center gap-3 bg-[#030208] border border-neutral-800 p-4 rounded-xl hover:border-cyan-500 transition-colors">
                    <Globe className="w-5 h-5 text-neutral-400"/>
                    <div><p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.contactWeb}</p><p className="text-white">aethvault.xyz</p></div>
                  </a>
                  <a href="mailto:admin@aethvault.xyz" className="flex items-center gap-3 bg-[#030208] border border-neutral-800 p-4 rounded-xl hover:border-cyan-500 transition-colors">
                    <Mail className="w-5 h-5 text-neutral-400"/>
                    <div><p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.contactEmail}</p><p className="text-white">admin@aethvault.xyz</p></div>
                  </a>
                  <a href="#" className="flex items-center gap-3 bg-[#030208] border border-neutral-800 p-4 rounded-xl hover:border-cyan-500 transition-colors">
                    <MessageSquare className="w-5 h-5 text-neutral-400"/>
                    <div><p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.contactX}</p><p className="text-white">@AetherVault</p></div>
                  </a>
                  <a href="#" className="flex items-center gap-3 bg-[#030208] border border-neutral-800 p-4 rounded-xl hover:border-cyan-500 transition-colors">
                    <Send className="w-5 h-5 text-neutral-400"/>
                    <div><p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.contactTg}</p><p className="text-white">t.me/AetherVault</p></div>
                  </a>
                  <a href="#" className="col-span-1 sm:col-span-2 flex items-center gap-3 bg-[#030208] border border-neutral-800 p-4 rounded-xl hover:border-cyan-500 transition-colors">
                    <Code className="w-5 h-5 text-neutral-400"/>
                    <div><p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">{t.contactGithub}</p><p className="text-white">github.com/nienzer</p></div>
                  </a>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
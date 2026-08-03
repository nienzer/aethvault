import React from 'react';
import { Award, ShieldCheck, Database, Download, CheckCircle2, Globe, FileText, Music, Code2, Palette, BookOpen, Camera, Film, Microscope, GraduationCap, Building2, Users } from 'lucide-react';

export default function AetherProofHub({ t, myCapsules, handleViewCertificate, setActiveTab }) {
  
  const categories = [
    { icon: <Music className="w-5 h-5 text-cyan-400" />, title: "Musician", desc: "Certify your original songs, albums, lyrics, compositions, and music releases." },
    { icon: <Code2 className="w-5 h-5 text-blue-400" />, title: "Programmer", desc: "Protect source code, open-source projects, smart contracts, applications, and software releases." },
    { icon: <Palette className="w-5 h-5 text-purple-400" />, title: "Designer", desc: "Certify logos, illustrations, artworks, UI/UX designs, and digital creations." },
    { icon: <BookOpen className="w-5 h-5 text-amber-400" />, title: "Writer", desc: "Protect books, articles, poems, manuscripts, research papers, and publications." },
    { icon: <Camera className="w-5 h-5 text-emerald-400" />, title: "Photographer", desc: "Record ownership of original photographs and digital images." },
    { icon: <Film className="w-5 h-5 text-rose-400" />, title: "Filmmaker", desc: "Certify movies, documentaries, animations, trailers, and video productions." },
    { icon: <Microscope className="w-5 h-5 text-indigo-400" />, title: "Researcher", desc: "Preserve research findings, discoveries, scientific papers, and innovations." },
    { icon: <GraduationCap className="w-5 h-5 text-teal-400" />, title: "Educator", desc: "Publish learning materials, educational content, and academic resources." },
    { icon: <Building2 className="w-5 h-5 text-orange-400" />, title: "Company", desc: "Secure official company documents, product releases, patents, and business milestones." },
    { icon: <Users className="w-5 h-5 text-fuchsia-400" />, title: "Everyone", desc: "Anyone can permanently preserve important achievements on the blockchain." }
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Banner Utama Aether Proof */}
      <div className="bg-gradient-to-r from-amber-950/30 via-violet-950/20 to-[#0B0817] border border-amber-500/30 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest">
            <Award className="w-3.5 h-3.5" /> Official Blockchain Certification
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Create a Permanent On-Chain Certificate
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Turn your achievements into a tamper-proof blockchain certificate. Whether you're a musician, programmer, designer, writer, researcher, educator, or creator, your work is permanently recorded on the blockchain and protected by cryptographic proof.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-[11px] font-mono text-cyan-300">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400"/> Immutable</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400"/> Publicly Verifiable</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400"/> Timestamped</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-400"/> Permanent Proof</span>
          </div>

          <div className="pt-4 flex flex-wrap gap-3">
            <button 
              onClick={() => setActiveTab('create')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-6 py-3 rounded-xl text-xs sm:text-sm shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)] cursor-pointer transition-all flex items-center gap-2"
            >
              <Award className="w-4 h-4" /> Create Aether Proof
            </button>
          </div>
        </div>
      </div>

      {/* Grid Kategori Creators */}
      <div>
        <h4 className="text-sm sm:text-base font-bold text-white mb-4 uppercase tracking-wider font-mono">
          Certificate Categories & Use Cases
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div key={idx} className="bg-[#0B0817] border border-neutral-900 hover:border-amber-500/30 p-5 rounded-2xl transition-all flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  {cat.icon}
                </div>
                <h5 className="font-bold text-white text-sm sm:text-base">{cat.title}</h5>
                <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed">{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bagian Bawah: Apa saja yang didapat dalam sertifikat */}
      <div className="bg-[#0B0817] border border-neutral-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-6">
        <div className="border-b border-neutral-800 pb-4">
          <h4 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-display">
            Official AetherVault Certification
          </h4>
          <p className="text-xs text-neutral-400 mt-1">Every certificate generated includes verifiable metadata directly from Polygon blockchain.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="bg-[#05030F] p-3.5 rounded-xl border border-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-neutral-300">Blockchain Timestamp</span>
          </div>
          <div className="bg-[#05030F] p-3.5 rounded-xl border border-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-neutral-300">Certificate ID</span>
          </div>
          <div className="bg-[#05030F] p-3.5 rounded-xl border border-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-neutral-300">Proof Hash (Keccak256)</span>
          </div>
          <div className="bg-[#05030F] p-3.5 rounded-xl border border-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-neutral-300">Wallet Owner Address</span>
          </div>
          <div className="bg-[#05030F] p-3.5 rounded-xl border border-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-neutral-300">Network Polygon Amoy</span>
          </div>
          <div className="bg-[#05030F] p-3.5 rounded-xl border border-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-neutral-300">Smart Contract Address</span>
          </div>
          <div className="bg-[#05030F] p-3.5 rounded-xl border border-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-neutral-300">Public QR Verification</span>
          </div>
          <div className="bg-[#05030F] p-3.5 rounded-xl border border-neutral-800 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-neutral-300">Permanent Record</span>
          </div>
        </div>

        {/* Jika user punya kapsul, tampilkan daftar sertifikat miliknya */}
        {myCapsules && myCapsules.length > 0 && (
          <div className="pt-6 border-t border-neutral-800 space-y-4">
            <h5 className="font-bold text-white text-sm uppercase tracking-wider">Your Minted Proofs ({myCapsules.length})</h5>
            <div className="space-y-2">
              {myCapsules.map((cap) => (
                <div key={cap.id} className="bg-[#05030F] border border-neutral-800 p-4 rounded-xl flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold text-white">{cap.title}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">ID: AETH-2026-{String(cap.id).padStart(9, '0')} • {cap.tierLabel}</p>
                  </div>
                  <button
                    onClick={() => handleViewCertificate(cap.id)}
                    className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Award className="w-3.5 h-3.5" /> View / Download PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
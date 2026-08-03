import React, { useState } from 'react';
import { Award, Globe, CheckCircle2, Music, Code2, Palette, BookOpen, Camera, Film, Search, ExternalLink, ShieldCheck } from 'lucide-react';

export default function HallOfProof({ t, handleViewCertificate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Data Mock Showcase Publik (Nanti bisa ditarik langsung dari Event On-Chain Blockchain)
  const publicProofs = [
    { id: 101, title: "Symphony of the Future (Album)", category: "Music", creator: "0x8a3f...9BE9", date: "2026-08-01", tier: "Eternal", proofHash: "0x4f8c...3a19", block: 4350122 },
    { id: 102, title: "AetherVault Smart Contract V2 Core", category: "Programmer", creator: "0x12c4...7F21", date: "2026-07-28", tier: "Legacy", proofHash: "0x9b2e...5d80", block: 4348901 },
    { id: 103, title: "Cyberpunk Neon Brand Identity UI/UX", category: "Designer", creator: "0x5e91...3B44", date: "2026-07-25", tier: "VIP", proofHash: "0x1a7f...8c33", block: 4345210 },
    { id: 104, title: "Decentralized Cryptography Whitepaper", category: "Writer", creator: "0x7d20...1E88", date: "2026-07-20", tier: "Eternal", proofHash: "0x3e4d...2f91", block: 4341099 },
    { id: 105, title: "Cinematic Sci-Fi Trailer Animation", category: "Filmmaker", creator: "0x3f88...4A60", date: "2026-07-15", tier: "VIP", proofHash: "0x8c1a...6e42", block: 4338750 },
    { id: 106, title: "Quantum Resistance Research Papers", category: "Researcher", creator: "0x9b11...2C33", date: "2026-07-10", tier: "Legacy", proofHash: "0x5d9f...1b70", block: 4335400 }
  ];

  const categories = ['All', 'Music', 'Programmer', 'Designer', 'Writer', 'Filmmaker', 'Researcher'];

  const filteredProofs = publicProofs.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.creator.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* Banner Hall of Proof */}
      <div className="bg-gradient-to-r from-purple-950/30 via-cyan-950/20 to-[#0B0817] border border-cyan-500/30 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest">
            <Globe className="w-3.5 h-3.5" /> Global On-Chain Creator Gallery
          </div>
          <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
            Hall of Proof™
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            Explore verified creative works, software releases, and intellectual properties permanently sealed on the Polygon blockchain. 100% transparent, decentralized, and tamper-proof.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0B0817] border border-neutral-900 p-4 rounded-2xl shadow-md">
        {/* Kategori Filter */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${selectedCategory === cat ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#05030F] text-neutral-400 hover:text-white border border-neutral-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search title or creator..."
            className="w-full bg-[#05030F] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-cyan-500 font-mono"
          />
        </div>
      </div>

      {/* Grid Showcase Galeri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {filteredProofs.map((proof) => (
          <div key={proof.id} className="bg-[#0B0817] border border-neutral-900 hover:border-cyan-500/40 p-5 rounded-2xl sm:rounded-3xl transition-all flex flex-col justify-between shadow-lg group">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20 uppercase">
                  {proof.category}
                </span>
                <span className="text-[9px] font-mono text-neutral-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-green-400" /> {proof.tier} Tier
                </span>
              </div>

              <h4 className="font-bold text-white text-sm sm:text-base group-hover:text-cyan-300 transition-colors">
                {proof.title}
              </h4>

              <div className="space-y-1.5 pt-2 border-t border-neutral-800/80 text-[10px] font-mono text-neutral-400">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Creator:</span>
                  <span className="text-white">{proof.creator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Block Mined:</span>
                  <span className="text-amber-400">{proof.block}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Proof Hash:</span>
                  <span className="text-cyan-300">{proof.proofHash}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-800 flex items-center justify-between">
              <span className="text-[9px] text-green-400 font-mono font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> VERIFIED ON-CHAIN
              </span>
              <button
                onClick={() => handleViewCertificate(proof.id)}
                className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Award className="w-3.5 h-3.5 text-amber-400" /> View Proof
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
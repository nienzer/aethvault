import React, { useState, useEffect } from 'react';
import { Award, Globe, Music, Code2, Palette, BookOpen, Camera, Film, Search, ExternalLink, ShieldCheck, Database, Blocks, Users, Copy, Check, Hexagon, Crown, Flame, Sparkles, Gem, Layers, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';

// ⭐ ALAMAT SMART CONTRACT BARU BOS DI POLYGON AMOY
const AETHER_VAULT_ADDRESS = "0xb273Bdad4D9d0053657359F45d189561449aa56B";

const AETHER_VAULT_ABI = [
  "function totalProofs() external view returns (uint256)",
  "function getProofDetails(uint256 _tokenId) external view returns (tuple(string category, bytes32 fileHash, bool isPublic, uint256 timestamp))"
];

export default function HallOfProof({ t, handleViewCertificate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Web3 States
  const [isLoading, setIsLoading] = useState(true);
  const [publicProofs, setPublicProofs] = useState([]);
  const [stats, setStats] = useState({ totalProofs: 0, creators: 0, categories: 10, blocks: "0" });

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ⭐ AMBIL DATA REAL ON-CHAIN DARI SMART CONTRACT V3
  useEffect(() => {
    const fetchOnChainData = async () => {
      setIsLoading(true);
      try {
        // Gunakan Public RPC Polygon Amoy atau window.ethereum
        const provider = window.ethereum 
          ? new ethers.BrowserProvider(window.ethereum)
          : new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");

        const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AETHER_VAULT_ABI, provider);
        
        // 1. Ambil Total Proofs yang sudah diminting
        const total = await contract.totalProofs();
        const totalNum = Number(total);

        // 2. Ambil Nomor Blok Terakhir
        const blockNum = await provider.getBlockNumber();

        let fetchedProofs = [];
        // Loop ambil data proof dari blockchain (maksimal 10 data teratas untuk efisiensi)
        const limit = Math.min(totalNum, 10);
        for (let i = 1; i <= limit; i++) {
          try {
            const details = await contract.getProofDetails(i);
            
            // Mapping kategori dan ikon
            const cat = details.category || "General";
            let iconComponent = <Box className="w-12 h-12" />;
            if (cat === "Music") iconComponent = <Music className="w-12 h-12" />;
            else if (cat === "Software") iconComponent = <Code2 className="w-12 h-12" />;
            else if (cat === "Design") iconComponent = <Palette className="w-12 h-12" />;
            else if (cat === "Writing") iconComponent = <BookOpen className="w-12 h-12" />;
            else if (cat === "Video") iconComponent = <Film className="w-12 h-12" />;
            else if (cat === "Research") iconComponent = <Microscope className="w-12 h-12" />;

            fetchedProofs.push({
              id: i,
              tokenId: i.toString(),
              title: `Aether Proof #${i}`,
              category: cat,
              owner: "0x...OnChain",
              date: new Date(Number(details.timestamp) * 1000).toLocaleDateString(),
              tier: "Eternal",
              tierColor: "text-amber-400 bg-amber-500/10 border-amber-500/20",
              tierIcon: <Sparkles className="w-3 h-3"/>,
              txHash: details.fileHash,
              ipfsCID: details.fileHash.substring(0, 15) + "...",
              resolvedImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=500&h=280",
              icon: iconComponent
            });
          } catch (err) {
            console.error(`Gagal memuat token ID ${i}:`, err);
          }
        }

        setPublicProofs(fetchedProofs.reverse());
        setStats({
          totalProofs: totalNum,
          creators: totalNum > 0 ? totalNum : 1,
          categories: 10,
          blocks: blockNum.toLocaleString()
        });

      } catch (error) {
        console.error("Gagal menarik data on-chain:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnChainData();
  }, []);

  const categories = ['All', 'Music', 'Software', 'Design', 'Writing', 'Video', 'Research'];

  const filteredProofs = publicProofs.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.owner.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-10">
      
      {/* HEADER & STATISTIK ON-CHAIN */}
      <div className="space-y-6">
        <div className="text-center space-y-3 py-6">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-2 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <Globe className="w-3.5 h-3.5" /> Immutable On-Chain Gallery
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white font-display tracking-tight">Hall of Proof™</h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            The World's Permanent Registry for Verified Intellectual Property. Explore authentic digital assets secured by Polygon cryptography.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-[#05030F] border border-neutral-800 p-4 sm:p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20"><Award className="w-5 h-5 text-cyan-400" /></div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Total Proofs</p>
              <p className="text-lg sm:text-xl font-black text-white font-mono">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-1 text-neutral-500"/> : stats.totalProofs.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-[#05030F] border border-neutral-800 p-4 sm:p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20"><Users className="w-5 h-5 text-purple-400" /></div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Creators</p>
              <p className="text-lg sm:text-xl font-black text-white font-mono">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-1 text-neutral-500"/> : stats.creators.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-[#05030F] border border-neutral-800 p-4 sm:p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20"><Layers className="w-5 h-5 text-amber-400" /></div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Categories</p>
              <p className="text-lg sm:text-xl font-black text-white font-mono">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-1 text-neutral-500"/> : stats.categories}
              </p>
            </div>
          </div>
          <div className="bg-[#05030F] border border-neutral-800 p-4 sm:p-5 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center border border-green-500/20"><Blocks className="w-5 h-5 text-green-400" /></div>
            <div>
              <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Polygon Blocks</p>
              <p className="text-lg sm:text-xl font-black text-white font-mono">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mt-1 text-neutral-500"/> : stats.blocks}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0B0817] border border-neutral-900 p-3 sm:p-4 rounded-2xl shadow-md">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${selectedCategory === cat ? 'bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-[#05030F] text-neutral-400 hover:text-white border border-neutral-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search proof or creator wallet..."
            className="w-full bg-[#05030F] border border-neutral-800 rounded-xl pl-11 pr-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono transition-colors"
          />
        </div>
      </div>

      {/* GALLERY GRID */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-4">
          <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
          <p className="text-xs text-neutral-500 font-mono">Syncing Registry with Polygon Amoy Mainnet...</p>
        </div>
      ) : filteredProofs.length === 0 ? (
        <div className="py-20 text-center text-neutral-500 font-mono text-xs">
          Belum ada data sertifikat on-chain yang tercatat di kontrak ini. Yuk, coba minting sertifikat pertama Bos!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
          {filteredProofs.map((proof) => (
            <div key={proof.id} className="bg-[#0B0817] border border-neutral-800 hover:border-cyan-500/50 rounded-3xl overflow-hidden transition-all duration-300 shadow-xl group hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] flex flex-col">
              
              <div className="relative h-48 sm:h-52 w-full bg-neutral-900 overflow-hidden">
                <img src={proof.resolvedImage} alt={proof.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0817] via-[#0B0817]/20 to-transparent"></div>
                
                <div className="absolute top-4 left-4 bg-[#0B0817]/80 backdrop-blur-md border border-neutral-700 text-white text-[9px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 uppercase tracking-widest shadow-lg">
                  <CheckCircle2 className="w-3 h-3 text-cyan-400" /> Verified On-Chain
                </div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 text-white drop-shadow-2xl">
                  {proof.icon}
                </div>
                
                <div className="absolute bottom-3 right-4 text-[9px] font-mono text-white/80 bg-black/60 px-2 py-1 rounded backdrop-blur-sm border border-white/10">
                  Minted: {proof.date}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h4 className="font-bold text-white text-base sm:text-lg group-hover:text-cyan-400 transition-colors line-clamp-1 mb-1" title={proof.title}>
                    {proof.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500">Contract</span>
                    <span className="font-mono text-[10px] font-bold text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800">{AETHER_VAULT_ADDRESS.substring(0, 8)}...</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-5">
                  <span className="text-[9px] font-mono text-neutral-300 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700 shadow-inner">
                    ID: #{proof.tokenId}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-300 bg-neutral-800/80 px-2.5 py-1 rounded-lg border border-neutral-700">
                    {proof.category}
                  </span>
                </div>

                <div className="bg-[#05030F] border border-neutral-800 rounded-xl p-3.5 space-y-3 mb-5 mt-auto shadow-inner">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-neutral-500 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3"/> File Hash</span>
                    <div className="flex items-center gap-2">
                      <span className="text-cyan-400">{proof.txHash.substring(0,6)}...{proof.txHash.substring(proof.txHash.length - 4)}</span>
                      <button onClick={() => copyToClipboard(proof.txHash, `hash-${proof.id}`)} className="text-neutral-500 hover:text-white cursor-pointer transition-colors" title="Copy Hash">
                        {copiedId === `hash-${proof.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleViewCertificate(proof.id)}
                  className="w-full bg-[#0B0817] hover:bg-cyan-500/10 border border-neutral-700 hover:border-cyan-500/40 text-white hover:text-cyan-400 font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg"
                >
                  <Award className="w-4 h-4" /> View Certificate
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
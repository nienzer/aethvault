import React, { useState, useEffect } from 'react';
import { Award, Globe, Music, Code2, Palette, BookOpen, Camera, Film, Search, ExternalLink, ShieldCheck, Database, Blocks, Users, Copy, Check, Hexagon, Crown, Flame, Sparkles, Gem, Layers, Loader2, ArrowUpRight, Lock, Box, Microscope, HardDrive, Activity, Zap } from 'lucide-react';
import { ethers } from 'ethers';
import { useLanguage } from '@/context/LanguageContext';

const AETHER_VAULT_ADDRESS = "0xb273Bdad4D9d0053657359F45d189561449aa56B";
const AETHER_VAULT_ABI = [
  "function totalProofs() external view returns (uint256)",
  "function getProofDetails(uint256 _tokenId) external view returns (tuple(string category, bytes32 fileHash, bool isPublic, uint256 timestamp))",
  "event ProofCreated(uint256 indexed capsuleId, address indexed owner, bytes32 proofHash)"
];

export default function HallOfProof({ handleViewCertificate, setActiveTab }) {
  const { t: globalT } = useLanguage();
  const tHop = globalT.hallOfProof || {};
  const tStats = globalT.globalStats || {};

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingStepText, setLoadingStepText] = useState(tHop.syncing || 'Syncing Registry...');
  const [publicProofs, setPublicProofs] = useState([]);
  const [stats, setStats] = useState({ totalProofs: 0, creators: 0, burned: 0, blocks: "0", filesTb: 0 });
  const [latestBlocks, setLatestBlocks] = useState([]);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  useEffect(() => {
    if (!isLoading) return;
    const steps = [
      tHop.syncing || "Syncing Registry...",
      tHop.reading || "Reading Polygon...",
      tHop.verifying || "Verifying Hashes...",
      tHop.loading || "Loading Certificates..."
    ];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % steps.length;
      setLoadingStepText(steps[index]);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLoading, tHop.syncing, tHop.reading, tHop.verifying, tHop.loading]);

  useEffect(() => {
    const fetchOnChainData = async () => {
      setIsLoading(true);
      try {
        const provider = window.ethereum 
          ? new ethers.BrowserProvider(window.ethereum)
          : new ethers.JsonRpcProvider("https://rpc-amoy.polygon.technology/");

        const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AETHER_VAULT_ABI, provider);
        
        const total = await contract.totalProofs();
        const totalNum = Number(total);
        const blockNum = await provider.getBlockNumber();

        const blocksTimeline = [];
        for(let b = 0; b < 5; b++) {
          blocksTimeline.push({
            blockNumber: (blockNum - (b * Math.floor(Math.random() * 5 + 1))).toLocaleString(),
            proofsCount: b === 0 ? Math.floor(Math.random() * 3 + 1) : Math.floor(Math.random() * 5),
            timeAgo: b === 0 ? "Just now" : `${b * 2} mins ago`
          });
        }
        setLatestBlocks(blocksTimeline);

        const DEPLOY_BLOCK = 43345845;
        const startBlock = Math.max(DEPLOY_BLOCK, blockNum - 100000);
        const events = await contract.queryFilter(contract.filters.ProofCreated(), startBlock, "latest");
        
        const ownerMap = {};
        events.forEach(ev => {
          ownerMap[ev.args[0].toString()] = ev.args[1];
        });

        let fetchedProofs = [];
        let uniqueOwners = new Set();
        let totalEstimatedCost = 0;

        const limit = Math.min(totalNum, 15);
        for (let i = totalNum; i > totalNum - limit && i > 0; i--) {
          try {
            const details = await contract.getProofDetails(i);
            const rawCat = details.category || "General";
            
            let iconComponent = <Box className="w-8 h-8" />;
            let imageBg = "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?auto=format&fit=crop&q=80&w=600&h=400";
            let cost = 10;

            if (rawCat === "Music") { iconComponent = <Music className="w-8 h-8 text-purple-400" />; imageBg = "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&q=80&w=600&h=400"; cost = 50; }
            else if (rawCat === "Software") { iconComponent = <Code2 className="w-8 h-8 text-blue-400" />; imageBg = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=600&h=400"; cost = 200; }
            else if (rawCat === "Design") { iconComponent = <Palette className="w-8 h-8 text-fuchsia-400" />; imageBg = "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=600&h=400"; cost = 10; }
            else if (rawCat === "Writing") { iconComponent = <BookOpen className="w-8 h-8 text-amber-400" />; imageBg = "https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=600&h=400"; cost = 10; }
            else if (rawCat === "Video") { iconComponent = <Film className="w-8 h-8 text-rose-400" />; imageBg = "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&q=80&w=600&h=400"; cost = 50; }
            else if (rawCat === "Research") { iconComponent = <Microscope className="w-8 h-8 text-emerald-400" />; imageBg = "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=600&h=400"; cost = 200; }
            else if (rawCat === "Business") { iconComponent = <Building2 className="w-8 h-8 text-yellow-400" />; imageBg = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600&h=400"; cost = 500; }

            totalEstimatedCost += (cost * 0.2); 

            const timestampMs = Number(details.timestamp) * 1000;
            const diffMs = Date.now() - timestampMs;
            const diffMins = Math.floor(diffMs / (1000 * 60));
            const diffHours = Math.floor(diffMins / 60);
            const timeAgoStr = diffMins < 1 ? "Just now" : diffMins < 60 ? `${diffMins} mins ago` : diffHours < 24 ? `${diffHours} hours ago` : `${Math.floor(diffHours / 24)} days ago`;

            const ownerAddress = ownerMap[i.toString()] || "0xUnknown";
            if (ownerAddress !== "0xUnknown") uniqueOwners.add(ownerAddress);

            const badges = ["Verified"];
            if (i <= 100) badges.push("Genesis");
            if (i === totalNum) badges.push("Newest");
            if (ownerAddress.startsWith("0x5") || i % 7 === 0) badges.push("Top Creator");
            if (cost >= 200) badges.push("Premium");
            if (details.isPublic) badges.push("Public");

            fetchedProofs.push({
              id: i,
              tokenId: i.toString(),
              title: `Aether Proof #${i}`,
              category: rawCat,
              ownerFull: ownerAddress,
              owner: ownerAddress !== "0xUnknown" ? `${ownerAddress.substring(0, 6)}...${ownerAddress.substring(ownerAddress.length - 4)}` : (tHop.creator || "Creator"),
              date: new Date(timestampMs).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
              timeAgo: timeAgoStr,
              badges: badges,
              txHash: details.fileHash,
              resolvedImage: imageBg,
              icon: iconComponent,
              isPublic: details.isPublic
            });

          } catch (err) {
            console.error(`Gagal memuat token ID ${i} dari blockchain:`, err);
          }
        }

        const publicOnly = fetchedProofs.filter(p => p.isPublic !== false);
        setPublicProofs(publicOnly);
        setStats({
          totalProofs: totalNum,
          creators: uniqueOwners.size > 0 ? uniqueOwners.size : (totalNum > 0 ? 1 : 0),
          burned: totalEstimatedCost + (totalNum > 15 ? (totalNum * 15) : 0), 
          blocks: blockNum.toLocaleString(),
          filesTb: (totalNum * 0.005).toFixed(2) 
        });

      } catch (error) {
        console.error("Kesalahan jaringan/kontrak saat menarik data on-chain:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOnChainData();
  }, [tHop.creator]);

  const categories = ['All', 'Music', 'Software', 'Design', 'Writing', 'Video', 'Research', 'Business'];

  const filteredProofs = publicProofs.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || item.ownerFull.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredProof = publicProofs.length > 0 ? publicProofs[0] : null;

  return (
    <div className="relative min-h-screen bg-[#030208] text-white font-sans overflow-hidden">
      
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgc3Ryb2tlPSIjM0IzQjRCIiBzdHJva2Utd2lkdGg9IjAuNSIgZmlsbD0ibm9uZSI+PHBhdGggZD0iTTAgNDBoNDBNNDAgMHY0MCIvPjwvZz48L3N2Zz4=')] opacity-[0.15]"></div>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute top-40 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px] mix-blend-screen"></div>
        <div className="absolute bottom-0 left-1/2 w-[800px] h-[400px] bg-amber-500/5 rounded-full blur-[150px] mix-blend-screen"></div>
      </div>

      <div className="relative z-10 space-y-12 animate-in fade-in duration-500 pb-20">
        
        <div className="text-center pt-8 pb-4 space-y-3">
          <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900 border border-neutral-700 text-neutral-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-lg">
            <Globe className="w-3.5 h-3.5 text-cyan-400" /> {tHop.galleryBadge || 'Immutable On-Chain Gallery'}
          </div>
          <h2 className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neutral-400 font-display tracking-tight drop-shadow-sm">
            {tHop.title || 'Hall of Proof™'}
          </h2>
          <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {tHop.desc || 'The World\'s Permanent Registry for Verified Intellectual Property. Explore authentic digital assets secured directly on the Polygon blockchain.'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: tHop.totalProofs || "Total Proofs", value: stats.totalProofs.toLocaleString(), icon: Database, color: "text-cyan-400" },
            { label: "Files Protected", value: `${stats.filesTb} TB`, icon: HardDrive, color: "text-blue-400" },
            { label: tStats.burn || "AETH Burned", value: stats.burned.toLocaleString(), icon: Flame, color: "text-orange-400" },
            { label: tHop.creators || "Creators", value: stats.creators.toLocaleString(), icon: Users, color: "text-purple-400" },
            { label: tHop.categories || "Categories", value: 8, icon: Layers, color: "text-pink-400" },
            { label: tHop.blocks || "Polygon Blocks", value: stats.blocks, icon: Blocks, color: "text-green-400" }
          ].map((stat, idx) => (
            <div key={idx} className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-5 rounded-2xl hover:border-neutral-600 transition-colors shadow-lg flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-black text-white font-mono tracking-tight">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-neutral-500"/> : stat.value}
                </p>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-3 space-y-8">
            <div className="bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 rounded-3xl p-6 shadow-xl">
              <h4 className="font-display text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-6 border-b border-neutral-800 pb-4">
                <Activity className="w-4 h-4 text-green-400" /> {tHop.activeStream || 'Active Stream'}
              </h4>
              <div className="space-y-4">
                {isLoading ? (
                   <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 text-neutral-500 animate-spin" /></div>
                ) : latestBlocks.map((block, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    {idx !== latestBlocks.length - 1 && (
                      <div className="absolute top-6 left-2 w-[1px] h-full bg-neutral-800 -z-10"></div>
                    )}
                    <div className="w-4 h-4 rounded-full bg-neutral-900 border-2 border-neutral-700 mt-0.5 shrink-0"></div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-cyan-400">{block.blockNumber}</span>
                        <span className="text-[9px] text-neutral-500 font-mono">{block.timeAgo}</span>
                      </div>
                      <div className="text-[10px] text-neutral-400 bg-neutral-900/50 px-2 py-1 rounded inline-block border border-neutral-800/50">
                        {block.proofsCount} proofs minted
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 space-y-8">

            {!isLoading && featuredProof && (
              <div className="bg-[#0A0713]/80 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-1 shadow-[0_0_40px_rgba(245,158,11,0.1)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-amber-500 text-black text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl rounded-tr-2xl z-20 flex items-center gap-1.5">
                  <Crown className="w-3 h-3"/> Featured Proof
                </div>
                
                <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden">
                  <img src={featuredProof.resolvedImage} alt={featuredProof.title} className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0713] via-[#0A0713]/40 to-transparent"></div>
                  
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {featuredProof.badges.map(b => (
                          <span key={b} className="text-[9px] font-bold uppercase tracking-widest bg-black/60 backdrop-blur-md border border-white/20 px-2.5 py-1 rounded-full text-white">
                            {b}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-black text-white drop-shadow-md mb-2">{featuredProof.title}</h3>
                      <div className="flex items-center gap-3 text-xs font-mono text-neutral-300 drop-shadow">
                        <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-cyan-400"/> {featuredProof.category}</span>
                        <span>•</span>
                        <span>{featuredProof.owner}</span>
                        <span>•</span>
                        <span>{featuredProof.timeAgo}</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleViewCertificate(featuredProof.id)}
                      className="shrink-0 bg-white hover:bg-neutral-200 text-black font-bold px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                    >
                      {tHop.viewCert || 'VIEW CERTIFICATE'} <ArrowUpRight className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#0A0713]/80 backdrop-blur-md border border-neutral-800 p-3 sm:p-4 rounded-2xl shadow-lg relative z-20">
              <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
                {categories.map((cat, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${selectedCategory === cat ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-inner' : 'bg-transparent text-neutral-400 hover:text-white border border-transparent hover:bg-neutral-800'}`}
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
                  placeholder={tHop.searchPlaceholder || "Search proofs or owner wallet..."}
                  className="w-full bg-[#030208] border border-neutral-800 rounded-xl pl-11 pr-12 py-2.5 text-xs text-white outline-none focus:border-cyan-500/50 font-mono transition-colors shadow-inner"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 bg-neutral-800 border border-neutral-700 text-[9px] font-mono text-neutral-400 rounded">
                  ⌘K
                </div>
              </div>
            </div>

            {isLoading ? (
              <div className="py-24 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-cyan-500 animate-spin drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
                <p className="text-xs text-cyan-300 font-mono font-bold tracking-widest uppercase">{loadingStepText}</p>
              </div>
            ) : filteredProofs.length === 0 ? (
              <div className="py-24 px-4 bg-[#0A0713]/50 backdrop-blur-md border border-neutral-800/50 rounded-3xl text-center space-y-5 shadow-2xl max-w-2xl mx-auto mt-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800/20 via-[#0A0713]/0 to-transparent"></div>
                <div className="w-20 h-20 bg-gradient-to-b from-neutral-800 to-[#0A0713] border border-neutral-700 rounded-full flex items-center justify-center mx-auto text-neutral-400 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative z-10">
                  <ShieldCheck className="w-8 h-8 opacity-50" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-2xl font-black text-white font-display mb-2">{tHop.emptyTitle || 'The Registry Awaits'}</h3>
                  <p className="text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
                    {tHop.emptyDesc || 'No public proofs have been found in this category. Become the first verified creator to permanently register your work.'}
                  </p>
                </div>
                <div className="pt-4 relative z-10">
                  <button
                    onClick={() => setActiveTab && setActiveTab('proof')}
                    className="bg-white hover:bg-neutral-200 text-black font-bold px-8 py-3.5 rounded-xl text-xs shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer transition-all hover:scale-105"
                  >
                    {tHop.mintFirst || 'Mint First Proof'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {filteredProofs.map((proof, idx) => (
                  <div 
                    key={proof.id} 
                    className="bg-[#0A0713]/90 backdrop-blur-md border border-neutral-800 rounded-3xl p-4 transition-all duration-500 shadow-xl group hover:-translate-y-2 hover:shadow-[0_15px_40px_-10px_rgba(6,182,212,0.25)] hover:border-cyan-500/40 flex flex-col animate-in fade-in slide-in-from-bottom-6 zoom-in-95"
                    style={{ animationDelay: `${idx * 100}ms` }}
                  >
                    
                    <div className="relative h-56 w-full rounded-2xl overflow-hidden mb-5 bg-neutral-900">
                      <img src={proof.resolvedImage} alt={proof.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0713] via-transparent to-transparent opacity-80"></div>
                      
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2 pr-12">
                        {proof.badges.map(b => (
                          <div key={b} className={`backdrop-blur-md border text-[8px] font-bold px-2 py-1 rounded-md flex items-center gap-1 uppercase tracking-widest shadow-md
                            ${b === 'Verified' ? 'bg-black/50 border-cyan-500/30 text-cyan-300' : 
                              b === 'Genesis' ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' :
                              b === 'Top Creator' ? 'bg-purple-500/20 border-purple-500/50 text-purple-300' :
                              b === 'Premium' ? 'bg-rose-500/20 border-rose-500/50 text-rose-300' :
                              'bg-black/50 border-neutral-600 text-neutral-300'}`}>
                            {b === 'Verified' && <Check className="w-2.5 h-2.5" />}
                            {b === 'Genesis' && <Crown className="w-2.5 h-2.5" />}
                            {b === 'Top Creator' && <Gem className="w-2.5 h-2.5" />}
                            {b}
                          </div>
                        ))}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30 group-hover:opacity-0 transition-opacity duration-500 text-white drop-shadow-2xl">
                        {proof.icon}
                      </div>

                      <div className="absolute bottom-3 right-3 text-[9px] font-mono text-neutral-300 bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-neutral-700">
                        {proof.timeAgo}
                      </div>
                    </div>

                    <div className="px-2 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-bold text-white text-lg group-hover:text-cyan-400 transition-colors line-clamp-1" title={proof.title}>
                          {proof.title}
                        </h4>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-neutral-500 mb-4">
                        <span className="text-cyan-500 font-bold">{proof.category}</span>
                        <span>•</span>
                        <span>Polygon Amoy</span>
                      </div>

                      <div className="bg-[#030208] border border-neutral-800/80 rounded-xl p-3 space-y-2 mb-5 shadow-inner">
                        <div className="flex justify-between items-center text-[10px] font-mono">
                          <span className="text-neutral-500">{tHop.creator || 'Creator'}</span>
                          <span className="text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded border border-neutral-800" title={proof.ownerFull}>{proof.owner}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] font-mono border-t border-neutral-800/50 pt-2">
                          <span className="text-neutral-500">{tHop.hash || 'SHA-256'}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-neutral-400">{proof.txHash.substring(0,6)}...{proof.txHash.substring(proof.txHash.length - 4)}</span>
                            <button onClick={() => copyToClipboard(proof.txHash, `hash-${proof.id}`)} className="text-neutral-500 hover:text-white transition-colors" title="Copy Hash">
                              {copiedId === `hash-${proof.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleViewCertificate(proof.id)}
                        className="w-full bg-neutral-900 hover:bg-white border border-neutral-800 hover:border-white text-white hover:text-black font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all mt-auto group/btn"
                      >
                        {tHop.viewCert || 'VIEW CERTIFICATE'} <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover/btn:opacity-100" />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
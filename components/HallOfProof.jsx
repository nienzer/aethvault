import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Award, Search, Filter, Eye, Hash, Calendar, Hexagon, ShieldCheck, Loader2, X, Download, Image as ImageIcon, ExternalLink, Globe, Sparkles, Box, Building2, Camera, Code2, Film, Microscope, Music, Palette, Scale, BookOpen, CheckCircle2 } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import AetherVaultV3Artifact from '@/contracts/AetherVaultV3ABI.json';
import { useLanguage } from '@/context/LanguageContext';

const AetherVaultV3ABI = AetherVaultV3Artifact.abi || AetherVaultV3Artifact;
const AETHER_VAULT_ADDRESS = "0x346cD3B294fE403459cf887677221eC97B3DBBeE";
const CONTRACT_ADDRESS = "0x346cD3B294fE403459cf887677221eC97B3DBBeE";
const READ_ONLY_RPC_URL = "https://bsc-testnet-rpc.publicnode.com";

const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Unknown';

// =========================================================
// RENDER CERTIFICATE TEMPLATE - HALL OF PROOF
// =========================================================
const CertificateTemplate = React.forwardRef(({ proofData, categoryConfig }, ref) => {
  const catKey = (proofData?.category || "Software").toLowerCase().trim();
  const rawCatObj = categoryConfig ? Object.entries(categoryConfig).find(([key]) => key.toLowerCase() === catKey) : null;
  
  const cat = rawCatObj ? rawCatObj[1] : { badge: "Verified Creator", badgeLabel: "AUTHENTIC", label: "AUTHENTIC", icon: <Sparkles className="w-4 h-4" />, color: "#00ffcc" };
  const CatIcon = cat.icon ? React.cloneElement(cat.icon, { className: "w-4 h-4 text-[#00ffcc]" }) : <Sparkles className="w-4 h-4 text-[#00ffcc]" />;

  const title = proofData?.title || "Aether Proof™";
  const creator = proofData?.creator || formatAddressFunc(proofData?.wallet);
  const owner = proofData?.wallet ? formatAddressFunc(proofData.wallet) : "0x00...00";
  const tokenId = proofData?.tokenId || "PENDING";
  const certificateId = proofData?.id || tokenId;
  const date = proofData?.date || new Date().toLocaleDateString("en-GB");
  const network = proofData?.network || "BSC Testnet";
  const contract = proofData?.contract ? formatAddressFunc(proofData.contract) : "0x00...00";
  const fileHash = proofData?.fileHash || "Awaiting verification";
  const verifyUrl = proofData?.verifyUrl || "https://aethvault.xyz";
  const description = proofData?.description || "This asset is permanently encrypted via advanced cryptographic primitives and verified on-chain. Ownership records are immutable and timestamped directly on the blockchain.";

  return (
    <div id="cert-export-node" ref={ref} className="relative mx-auto shrink-0 overflow-hidden w-[1200px] h-[760px] rounded-[32px] border border-white/[0.15] bg-[#0c0f1d]/85 backdrop-blur-2xl text-white font-sans shadow-[0_40px_100px_rgba(0,0,0,0.7),inset_0_1px_2px_rgba(255,255,255,0.15)]">
      <style>{`
        @keyframes av-orbit-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes av-orbit-fast { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes av-shield-glow { 0%,100% { filter: drop-shadow(0 0 15px rgba(0,255,204,0.3)) drop-shadow(0 0 30px rgba(139,92,246,0.2)); transform: scale(0.97); } 50% { filter: drop-shadow(0 0 35px rgba(0,255,204,0.7)) drop-shadow(0 0 60px rgba(139,92,246,0.5)); transform: scale(1.03); } }
        @keyframes av-sweep-light { 0%,60% { transform: translateX(-150%) skewX(-20deg); opacity:0; } 70% { opacity:0.5; } 95%,100% { transform: translateX(280%) skewX(-20deg); opacity:0; } }
        @keyframes av-bg-nebula { 0%,100% { opacity: 0.3; transform: scale(0.95); } 50% { opacity: 0.6; transform: scale(1.05); } }
        .av-orbit-slow { animation: av-orbit-slow 22s linear infinite; transform-origin: center; }
        .av-orbit-fast { animation: av-orbit-fast 14s linear infinite; transform-origin: center; }
        .av-shield-glow { animation: av-shield-glow 4s ease-in-out infinite; transform-origin: center; }
        .av-sweep-light { animation: av-sweep-light 7s ease-in-out infinite; }
        .av-bg-nebula { animation: av-bg-nebula 5s ease-in-out infinite; }
      `}</style>
      
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "radial-gradient(circle at 85% 45%, rgba(6,182,212,0.2), transparent 45%), radial-gradient(circle at 15% 75%, rgba(139,92,246,0.15), transparent 40%)" }} />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "45px 45px" }} />
      
      <div className="absolute inset-[12px] rounded-[28px] border border-white/[0.08] pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.08)]" />
      <div className="absolute inset-[20px] rounded-[24px] border border-cyan-500/10 pointer-events-none" />
      <div className="absolute top-[20px] left-[20px] w-8 h-8 border-t border-l border-white/20 rounded-tl-lg" />
      <div className="absolute top-[20px] right-[20px] w-8 h-8 border-t border-r border-white/20 rounded-tr-lg" />
      <div className="absolute bottom-[20px] left-[20px] w-8 h-8 border-b border-l border-white/20 rounded-bl-lg" />
      <div className="absolute bottom-[20px] right-[20px] w-8 h-8 border-b border-r border-white/20 rounded-br-lg" />

      {/* HEADER SECTION */}
      <div className="absolute top-[45px] left-[64px] right-[64px] flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
            <img src="/logo.png" alt="AetherVault" className="w-10 h-10 object-contain opacity-90" />
          </div>
          <div>
            <div className="font-black tracking-[0.3em] text-[24px] bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">AETHER<span className="text-cyan-400">VAULT</span></div>
            <div className="text-[9px] tracking-[0.45em] text-white/40 font-mono mt-1 font-bold">TRUSTLESS • VERIFIED • TIMELESS</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.1] flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(6,182,212,1)]" />
            <span className="text-[10px] font-black tracking-[0.25em] text-neutral-300">SECURED ON-CHAIN</span>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.1]">
            <span className="text-[10px] font-black tracking-[0.25em] text-neutral-300">{String(network).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* TITLE SECTION */}
      <div className="absolute top-[125px] left-[64px] z-20">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-16 h-px bg-gradient-to-r from-transparent to-white/30" />
          <span className="text-[10px] tracking-[0.55em] text-white/30 uppercase font-mono font-black">Decentralized Vault Registry</span>
        </div>
        <h1 className="text-[40px] font-black tracking-[0.15em] text-white leading-tight">
          CERTIFICATE OF AUTHENTICITY
        </h1>
        <p className="text-[10px] text-white/40 tracking-[0.25em] mt-0.5 font-mono uppercase font-bold">AETHER PROOF COPYRIGHT REGISTRATION PROTOCOL</p>
      </div>

      {/* LEFT CONTENT PANEL */}
      <div className="absolute left-[64px] top-[225px] w-[560px] h-[385px] z-20 rounded-[28px] border border-white/[0.06] bg-[#0c101d]/60 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-start pb-4 border-b border-white/[0.08]">
          <div className="min-w-0 pr-6">
            <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-2">ASSET TITLE / TYPE</div>
            <div className="text-[18px] font-black text-white truncate tracking-wide">{title}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-2">CERTIFICATE NO.</div>
            <div className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.03] text-white text-[11px] font-mono font-black">
              #{certificateId}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-5">
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">OWNER</div><div className="text-[12px] text-white font-bold truncate tracking-wide">{owner}</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">CREATOR</div><div className="text-[12px] text-white/80 font-mono font-bold truncate tracking-wide">{creator}</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">STATUS</div><div className="text-[11px] text-emerald-400 font-mono font-black tracking-wider">Authenticated & Verified</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">DATE</div><div className="text-[11px] text-white/70 font-mono font-bold">{date}</div></div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/[0.08]">
          <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">ASSET DESCRIPTION</div>
          <div className="text-[10px] leading-relaxed text-white/50 font-medium font-sans line-clamp-3">
            {description}
          </div>
        </div>

        <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
          <div><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">TOKEN ID</div><div className="text-[10px] text-white/60 font-mono font-black mt-1">#{tokenId}</div></div>
          <div><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">NETWORK</div><div className="text-[10px] text-white/60 font-mono font-black mt-1">BSC TESTNET</div></div>
          <div className="max-w-[210px]"><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">CONTRACT</div><div className="text-[9px] text-white/50 font-mono mt-1 truncate">{CONTRACT_ADDRESS}</div></div>
        </div>
      </div>
      
      {/* RIGHT DISPLAY PANEL */}
      <div className="absolute right-[64px] top-[225px] w-[460px] h-[385px] z-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-[28px] border border-white/[0.06] bg-[#0c101d]/60 shadow-[0_30px_60px_rgba(0,0,0,0.3)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
        
        <div className="relative w-[340px] h-[340px] flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="w-full h-full absolute inset-0 pointer-events-none">
            <defs>
              <linearGradient id="av-glass-frost" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="av-edge-neon" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00ffcc" stopOpacity="0.6" />
                <stop offset="50%" stopColor="#a855f7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.6" />
              </linearGradient>
              <radialGradient id="av-glass-shadow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="200" cy="200" r="130" fill="url(#av-glass-shadow)" className="av-bg-nebula" />

            <g opacity="0.2" stroke="#ffffff" strokeWidth="0.75">
              <circle cx="200" cy="200" r="145" fill="none" strokeDasharray="3 6" />
              <line x1="60" y1="200" x2="340" y2="200" />
              <line x1="200" y1="60" x2="200" y2="340" />
            </g>

            <g className="av-orbit-slow">
              <circle cx="200" cy="200" r="120" fill="none" stroke="url(#av-edge-neon)" strokeWidth="1.5" strokeDasharray="140 50 20 40" />
              <circle cx="320" cy="200" r="4" fill="#ffffff" filter="drop-shadow(0 0 6px #00ffcc)" />
            </g>

            <g className="av-orbit-fast">
              <circle cx="200" cy="200" r="90" fill="none" stroke="url(#av-glass-frost)" strokeWidth="1.25" strokeDasharray="80 40 40 20" />
              <circle cx="200" cy="110" r="3.5" fill="#ffffff" opacity="0.8" />
            </g>

            <circle cx="200" cy="200" r="65" fill="none" stroke="url(#av-glass-frost)" strokeWidth="1.5" opacity="0.4" />
            <circle cx="200" cy="200" r="58" fill="#111526" stroke="url(#av-glass-frost)" strokeWidth="1" />
          </svg>

          {/* LOGO AETHER ASLI */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
             <div className="w-[86px] h-[86px] bg-[#111526] rounded-full border border-white/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(6,182,212,0.3),0_0_20px_rgba(6,182,212,0.6)] av-shield-glow">
                <img src="/logo.png" alt="Logo" className="w-[52px] h-[52px] object-contain opacity-90 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
             </div>
          </div>
        </div>
        
        <div className="absolute top-[20px] left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-white/[0.04] text-white/90">
            {CatIcon}<span className="text-[10px] font-black tracking-[0.25em]">AUTHENTICATED</span>
          </div>
        </div>
        <div className="absolute bottom-[20px] left-[32px]">
          <div className="text-[8px] tracking-[0.35em] text-white/30 font-black">DIGITAL ARTIFACT</div>
          <div className="text-[13px] text-white/70 font-black mt-1 tracking-wide">AETHERVAULT PROOF</div>
        </div>
        <div className="absolute bottom-[20px] right-[32px] text-right">
          <div className="text-[8px] tracking-[0.35em] text-white/30 font-black">SERIAL REG.</div>
          <div className="text-[12px] text-white/80 font-mono font-black mt-1">#{certificateId}</div>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="absolute left-[64px] right-[64px] bottom-[60px] z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white/60" />
            </div>
            <div className="w-11 h-11 rounded-xl border border-white/10 bg-white/[0.04] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white/60" />
            </div>
          </div>
          <div>
            <div className="text-[9px] tracking-[0.3em] text-white/30 font-black">AUTOMATED AUTHENTICITY STATUS</div>
            <div className="text-[12px] text-white/80 font-black tracking-[0.1em] mt-1 flex items-center gap-2">
              100% VERIFIABLE ON-CHAIN <span className="px-2 py-0.5 rounded text-[9px] bg-white/10 border border-white/20 text-white/70 font-mono font-black">BSC VERIFIED</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[9px] tracking-[0.3em] text-white/30 font-black">DECENTRALIZED AUDIT</div>
            <div className="text-[10px] text-white/40 font-mono font-black mt-1">SCAN METADATA CONTRACT</div>
          </div>
          <div className="w-[72px] h-[72px] rounded-xl bg-white p-2 shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/10 flex items-center justify-center">
            <QRCode value={verifyUrl} size={56} bgColor="#ffffff" fgColor="#0c0f1d" level="Q" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[20px] left-[64px] right-[64px] flex items-center justify-between text-[9px] font-mono tracking-[0.3em] text-white/30 z-20">
        <span>VERIFIABLE • IMMUTABLE • SECURED FOREVER</span>
        <span className="text-white/40 font-black">POWERED BY AETHERVAULT PROTOCOL</span>
        <span>{String(fileHash).slice(0, 30)}...</span>
      </div>
      
      <div className="absolute top-0 bottom-0 left-0 w-[160px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent skew-x-[-20deg] pointer-events-none av-sweep-light" />
    </div>
  );
});
CertificateTemplate.displayName = "CertificateTemplate";

// =========================================================
export default function HallOfProof({ TARGET_CHAIN_NAME = "BSC Testnet" }) {
  const { t: globalT } = useLanguage();
  const tHop = globalT.hallOfProof || {};

  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const [selectedProof, setSelectedProof] = useState(null);
  const certificateRef = useRef(null);

  const categoryConfig = {
    "Writing": { badge: "Verified Author", color: '#22d3ee', icon: <BookOpen className="w-5 h-5 text-cyan-400" /> },
    "Photography": { badge: "Verified Photographer", color: '#f472b6', icon: <Camera className="w-5 h-5 text-pink-400" /> },
    "Design": { badge: "Verified Creator", color: '#a78bfa', icon: <Palette className="w-5 h-5 text-purple-400" /> },
    "Music": { badge: "Verified Artist", color: '#fbbf24', icon: <Music className="w-5 h-5 text-amber-400" /> },
    "Video": { badge: "Verified Filmmaker", color: '#f87171', icon: <Film className="w-5 h-5 text-rose-400" /> },
    "Software": { badge: "Verified Developer", color: '#4ade80', icon: <Code2 className="w-5 h-5 text-green-400" /> },
    "Research": { badge: "Verified Researcher", color: '#60a5fa', icon: <Microscope className="w-5 h-5 text-blue-400" /> },
    "Business": { badge: "Verified Company", color: '#fb923c', icon: <Building2 className="w-5 h-5 text-orange-400" /> },
    "Legal": { badge: "Verified Entity", color: '#c084fc', icon: <Scale className="w-5 h-5 text-indigo-400" /> },
    "Other": { badge: "Verified Creator", color: '#94a3b8', icon: <Box className="w-5 h-5 text-neutral-400" /> }
  };

  const fetchProofs = useCallback(async () => {
    setLoading(true);
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AetherVaultV3ABI, provider);
      
      const filter = contract.filters.ProofMinted();
      const DEPLOY_BLOCK = 43345845;
      const currentBlock = await provider.getBlockNumber();
      
      // LOGIKA AMAN: Hanya ambil 49.000 blok terakhir agar server RPC tidak memblokir koneksi
      let allEvents = [];
      let fromBlock = Math.max(DEPLOY_BLOCK, currentBlock - 49000);
      const maxBlockRange = 4900; 

      while (fromBlock <= currentBlock) {
        let toBlock = fromBlock + maxBlockRange;
        if (toBlock > currentBlock) {
          toBlock = currentBlock;
        }
        
        try {
          const chunkEvents = await contract.queryFilter(filter, fromBlock, toBlock);
          allEvents = allEvents.concat(chunkEvents);
        } catch (chunkErr) {
          console.warn(`Gagal fetch blok ${fromBlock} - ${toBlock}:`, chunkErr);
        }
        
        fromBlock = toBlock + 1;
      }
      
      const parsedProofs = await Promise.all(allEvents.map(async (ev) => {
        const block = await provider.getBlock(ev.blockNumber);
        const args = ev.args;
        const tokenId = args[0].toString();
        const ownerWallet = args[1];
        const category = args[2] || "Software";
        
        let extractedTitle = `Aether Proof #${tokenId}`;
        let extractedDesc = "Aether Proof Immutable Certificate. 100% On-Chain Verification.";
        let extractedCreator = "";

        try {
          // JURUS MUTLAK: Langsung minta metadata ke Smart Contract, jangan pakai args[3]
          let tokenUriRaw = "";
          try { 
            tokenUriRaw = await contract.tokenURI(tokenId); 
          } catch(err) {
            console.warn("Gagal tarik URI dari contract untuk token", tokenId);
          }

          if (tokenUriRaw && typeof tokenUriRaw === 'string' && tokenUriRaw.includes('base64,')) {
            const base64Payload = tokenUriRaw.split('base64,')[1];
            let jsonString = "";
            
            try {
              jsonString = decodeURIComponent(escape(window.atob(base64Payload)));
            } catch (e1) {
              jsonString = window.atob(base64Payload);
            }
            
            const metadata = JSON.parse(jsonString);
            if (metadata.name) extractedTitle = metadata.name;
            if (metadata.description) extractedDesc = metadata.description;
            if (metadata.attributes) {
              const creatorAttr = metadata.attributes.find(a => a.trait_type === "Creator");
              if (creatorAttr && creatorAttr.value && creatorAttr.value.trim() !== "") {
                extractedCreator = creatorAttr.value;
              }
            }
          }
        } catch (e) {
          console.warn("Gagal parse tokenURI untuk token", tokenId);
        }

        const finalCreator = extractedCreator || formatAddressFunc(ownerWallet);

        return {
          id: tokenId,
          tokenId: tokenId,
          title: extractedTitle,
          description: extractedDesc,
          category: category,
          creator: finalCreator,
          wallet: ownerWallet,
          fileHash: args[4],
          contract: AETHER_VAULT_ADDRESS,
          date: new Date((block?.timestamp || Date.now() / 1000) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          network: TARGET_CHAIN_NAME,
          txHash: ev.transactionHash,
          verifyUrl: `https://testnet.bscscan.com/tx/${ev.transactionHash}`
        };
      }));

      parsedProofs.reverse();
      setProofs(parsedProofs);
    } catch (error) {
      console.error("Gagal memuat sertifikat on-chain:", error);
    } finally {
      setLoading(false);
    }
  }, [TARGET_CHAIN_NAME]);

  useEffect(() => {
    fetchProofs();
  }, [fetchProofs]);

  const filteredProofs = proofs.filter(p => {
    const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        p.wallet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        p.fileHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const handleDownloadPNG = async () => {
    if (!certificateRef.current || !selectedProof) return;
    try {
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#06070d', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `AETH-PROOF-${selectedProof.tokenId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { 
      console.error("Export PNG gagal", err); 
      alert("Gagal Export PNG: " + err.message);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !selectedProof) return;
    try {
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#06070d', pixelRatio: 2 });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (760 * pdfWidth) / 1200;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`AETH-PROOF-${selectedProof.tokenId}.pdf`);
    } catch (err) { 
      console.error("Export PDF gagal", err); 
      alert("Gagal Export PDF: " + err.message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-10">
      <div className="bg-gradient-to-br from-[#0B0817] via-[#0d091e] to-[#05030F] border border-cyan-900/40 p-6 sm:p-8 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 tracking-tight">Hall of Proof</h2>
            <p className="text-sm text-cyan-200/60 mt-2 max-w-xl">Eksplorasi galeri sertifikat aset digital yang telah diverifikasi secara permanen di blockchain.</p>
          </div>
          
          <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-500/60" />
              <input 
                type="text" 
                placeholder="Cari Token ID, Title, Hash..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-black/40 border border-cyan-900/50 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-cyan-500 font-mono placeholder:text-neutral-600"
              />
            </div>
            <select 
              value={selectedCategory} 
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-black/40 border border-cyan-900/50 rounded-xl py-2.5 px-4 text-sm text-cyan-300 outline-none focus:border-cyan-500 cursor-pointer font-mono font-bold appearance-none"
            >
              <option value="All">All Categories</option>
              {Object.keys(categoryConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-dashed border-cyan-900/30">
          <Loader2 className="w-10 h-10 text-cyan-400 animate-spin mb-4" />
          <p className="text-sm font-mono text-cyan-500/80 font-bold">Sinkronisasi dengan Ledger Blockchain...</p>
        </div>
      ) : filteredProofs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-black/20 rounded-3xl border border-dashed border-cyan-900/30">
          <Hexagon className="w-12 h-12 text-neutral-700 mb-4" />
          <p className="text-sm font-mono text-neutral-500">Tidak ada sertifikat yang ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
          {filteredProofs.map(proof => {
            const catInfo = categoryConfig[proof.category] || categoryConfig["Other"];
            return (
              <div key={proof.id} className="bg-[#05030F] border border-cyan-900/40 rounded-[20px] p-5 hover:border-cyan-500/50 transition-all duration-300 flex flex-col group relative overflow-hidden hover:-translate-y-1">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[50px] opacity-20 pointer-events-none transition-all group-hover:opacity-40" style={{ backgroundColor: catInfo.color }}></div>
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/50 border border-white/5 backdrop-blur-md">
                    {React.cloneElement(catInfo.icon, { className: "w-3.5 h-3.5" })}
                    <span className="text-[10px] font-bold font-mono tracking-widest uppercase" style={{ color: catInfo.color }}>{proof.category}</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-mono font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-3 h-3" /> Valid
                  </div>
                </div>

                <div className="mb-5 relative z-10 flex-1">
                  <h4 className="text-lg font-bold text-white mb-2 line-clamp-1 group-hover:text-cyan-300 transition-colors">{proof.title}</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500">Creator</span>
                      <span className="text-neutral-300 truncate max-w-[140px] font-bold">{proof.creator}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500">Owner Wallet</span>
                      <span className="text-cyan-400">{formatAddressFunc(proof.wallet)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-500">Token ID</span>
                      <span className="text-amber-300">#{proof.tokenId}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-4 border-t border-neutral-800 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
                    <Calendar className="w-3.5 h-3.5" /> {proof.date}
                  </div>
                  <button 
                    onClick={() => setSelectedProof(proof)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
{/* MODAL POPUP - FIXED SCROLLING UI */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex flex-col bg-[#05030F] border border-cyan-500/30 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
            
            {/* HEADER (Tetap/Fixed di atas) */}
            <div className="w-full flex justify-between items-center p-4 border-b border-cyan-900/50 bg-black/40 shrink-0">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white font-mono">Certificate <span className="text-cyan-400">#{selectedProof.tokenId}</span></h3>
              </div>
              <button onClick={() => setSelectedProof(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/50 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* BODY & FOOTER (Sekarang digabung agar bisa di-scroll ke bawah bersama-sama) */}
            <div className="w-full flex-1 overflow-y-auto custom-scrollbar bg-[#020207] p-4 sm:p-6 flex flex-col items-center">
              
              {/* Area Gambar Sertifikat */}
              <div style={{ width: '780px', height: '494px', position: 'relative' }} className="shrink-0 mb-8">
                <div className="absolute top-0 left-0" style={{ width: '1200px', height: '760px', transform: 'scale(0.65)', transformOrigin: 'top left' }}>
                  <CertificateTemplate ref={certificateRef} proofData={selectedProof} categoryConfig={categoryConfig} />
                </div>
              </div>

              {/* TOMBOL AKSI - Sekarang berada di dalam area scroll! */}
              <div className="w-full flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-cyan-900/40">
                <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 border border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/10 text-amber-300 text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <Download className="w-4 h-4" /> Save PDF
                </button>
                <button onClick={handleDownloadPNG} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 text-cyan-300 text-xs font-bold transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <ImageIcon className="w-4 h-4" /> Save PNG
                </button>
                <a href={selectedProof.verifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/40 hover:border-purple-400/70 hover:from-purple-600/30 hover:to-blue-600/30 text-purple-300 text-xs font-bold transition-all cursor-pointer no-underline shadow-[0_0_15px_rgba(168,85,247,0.15)]">
                  <ExternalLink className="w-4 h-4" /> View Transaction
                </a>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Award, Search, Filter, Eye, Hash, Calendar, Hexagon, ShieldCheck, Loader2, X, Download, Image as ImageIcon, ExternalLink, Globe, Sparkles, Box, Building2, Camera, Code2, Film, Microscope, Music, Palette, Scale, BookOpen, CheckCircle2 } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import AetherVaultV3Artifact from '@/contracts/AetherVaultV3ABI.json';
import { useLanguage } from '@/context/LanguageContext';

const AetherVaultV3ABI = AetherVaultV3Artifact.abi || AetherVaultV3Artifact;
const AETHER_VAULT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265";
const READ_ONLY_RPC_URL = "https://bsc-testnet-rpc.publicnode.com";

const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Unknown';

// =========================================================
// ULTRA-PREMIUM GLASSMORPHIC CERTIFICATE TEMPLATE - PROOF
// =========================================================
const CertificateTemplate = React.forwardRef(({ proofData, categoryConfig, AETHER_LOGO = "/logo.png" }, ref) => {
  const catKey = (proofData?.category || "Software").toLowerCase().trim();
  const rawCatObj = categoryConfig ? Object.entries(categoryConfig).find(([key]) => key.toLowerCase() === catKey) : null;
  
  const cat = rawCatObj ? rawCatObj[1] : { badge: "Verified Creator", badgeLabel: "AUTHENTIC", label: "AUTHENTIC", icon: <Sparkles className="w-4 h-4" />, color: "#00ffcc" };
  const CatIcon = cat.icon ? React.cloneElement(cat.icon, { className: "w-4 h-4 text-[#00ffcc]" }) : <Sparkles className="w-4 h-4 text-[#00ffcc]" />;
  const catColor = cat.color || "#00ffcc";

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

  return (
    <div id="cert-export-node" ref={ref} className="relative mx-auto shrink-0 overflow-hidden w-[1200px] h-[760px] rounded-[32px] border border-cyan-500/30 bg-[#06070d] text-white font-sans shadow-[0_0_120px_rgba(6,182,212,0.15)]">
      <style>{`
        @keyframes av-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes av-orbit-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes av-logo-pulse { 0%,100% { transform: scale(0.96) rotate(-5deg); filter: drop-shadow(0 0 15px rgba(6,182,212,0.4)); } 50% { transform: scale(1.04) rotate(5deg); filter: drop-shadow(0 0 35px rgba(139,92,246,0.8)); } }
        @keyframes av-sweep { 0%,55% { transform: translateX(-150%) skewX(-18deg); opacity:0; } 65% { opacity:.45; } 90%,100% { transform: translateX(260%) skewX(-18deg); opacity:0; } }
        @keyframes av-pulse { 0%,100% { opacity:.25; transform:scale(.95); } 50% { opacity:.7; transform:scale(1.03); } }
        .av-orbit { animation: av-orbit 16s linear infinite; }
        .av-orbit-reverse { animation: av-orbit-reverse 11s linear infinite; }
        .av-logo-pulse { animation: av-logo-pulse 4.5s ease-in-out infinite; }
        .av-sweep { animation: av-sweep 6s ease-in-out infinite; }
        .av-pulse { animation: av-pulse 4s ease-in-out infinite; }
      `}</style>
      
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 75% 40%, rgba(139,92,246,0.15), transparent 35%), radial-gradient(circle at 25% 75%, rgba(6,182,212,0.12), transparent 35%), linear-gradient(145deg, #040508 0%, #0a0d16 50%, #030407 100%)" }} />
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      
      <div className="absolute inset-[16px] rounded-[26px] border border-cyan-500/20 pointer-events-none" />
      <div className="absolute inset-[24px] rounded-[22px] border border-white/[0.02] pointer-events-none" />
      
      <div className="absolute top-[24px] left-[24px] w-14 h-14 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-xl" />
      <div className="absolute top-[24px] right-[24px] w-14 h-14 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-xl" />
      <div className="absolute bottom-[24px] left-[24px] w-14 h-14 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-xl" />
      <div className="absolute bottom-[24px] right-[24px] w-14 h-14 border-b-2 border-r-2 border-cyan-400/80 rounded-br-xl" />

      {/* HEADER SECTION */}
      <div className="absolute top-[54px] left-[64px] right-[64px] flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.2)]">
            <img src={AETHER_LOGO} alt="AetherVault" className="w-9 h-9 object-contain" />
          </div>
          <div>
            <div className="font-black tracking-[0.25em] text-[23px] bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">AETHER<span className="text-cyan-400">VAULT</span></div>
            <div className="text-[8px] tracking-[0.45em] text-cyan-400/60 font-mono mt-1 font-bold">TRUSTLESS • VERIFIED • TIMELESS</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-cyan-500/[0.05] border border-cyan-400/40 flex items-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
            <span className="text-[9px] font-black tracking-[0.2em] text-cyan-300">SECURED ON-CHAIN</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-purple-500/[0.05] border border-purple-400/30">
            <span className="text-[9px] font-black tracking-[0.2em] text-purple-300">{String(network).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* TITLE SECTION */}
      <div className="absolute top-[145px] left-[64px] z-20">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-14 h-px bg-gradient-to-r from-transparent to-cyan-400" />
          <span className="text-[9px] tracking-[0.5em] text-purple-400 uppercase font-mono font-bold">Decentralized Vault Registry</span>
        </div>
        <h1 className="text-[36px] font-black tracking-[0.18em] text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-purple-200">
          CERTIFICATE OF AUTHENTICITY
        </h1>
        <p className="text-[10px] text-neutral-400 tracking-[0.22em] mt-1 font-mono">AETHER PROF COPYRIGHT REGISTRATION PROTOCOL</p>
      </div>

      {/* LEFT CONTENT PANEL - GLASSMORPHISM CARD */}
      <div className="absolute left-[64px] top-[245px] w-[560px] h-[390px] z-20 rounded-[24px] border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-7 shadow-[0_25px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-start pb-5 border-b border-white/[0.06]">
          <div className="min-w-0 pr-5">
            <div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-2">ASSET TITLE / TYPE</div>
            <div className="text-[19px] font-black text-white truncate tracking-wide">{title}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-2">CERTIFICATE NO.</div>
            <div className="px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.03] text-cyan-300 text-[11px] font-mono font-black shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              #{certificateId}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6">
          <div><div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-1.5">OWNER</div><div className="text-[13px] text-white font-bold truncate tracking-wide">{owner}</div></div>
          <div><div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-1.5">CREATOR</div><div className="text-[13px] text-cyan-300 font-bold truncate tracking-wide">{creator}</div></div>
          <div><div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-1.5">STATUS</div><div className="text-[11px] text-emerald-400 font-mono font-bold tracking-wider">Authenticated & Verified</div></div>
          <div><div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-1.5">DATE</div><div className="text-[11px] text-neutral-200 font-mono font-bold">{date}</div></div>
        </div>

        <div className="mt-7 pt-5 border-t border-white/[0.06]">
          <div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-2">AUTHENTICATION STATEMENT</div>
          <div className="text-[10px] leading-relaxed text-neutral-400 font-medium">
            This asset is permanently encrypted via advanced cryptographic primitives and verified on-chain. Ownership records are immutable and timestamped directly on the blockchain.
          </div>
        </div>

        <div className="absolute bottom-5 left-7 right-7 flex items-center justify-between">
          <div><div className="text-[7px] tracking-[0.3em] text-neutral-600 font-bold">TOKEN ID</div><div className="text-[10px] text-purple-400 font-mono font-bold mt-1">#{tokenId}</div></div>
          <div><div className="text-[7px] tracking-[0.3em] text-neutral-600 font-bold">NETWORK</div><div className="text-[10px] text-cyan-400 font-mono font-bold mt-1">BSC TESTNET</div></div>
          <div className="max-w-[210px]"><div className="text-[7px] tracking-[0.3em] text-neutral-600 font-bold">CONTRACT</div><div className="text-[9px] text-neutral-400 font-mono mt-1 truncate">{CONTRACT_ADDRESS}</div></div>
        </div>
      </div>
      
      {/* RIGHT DISPLAY PANEL - LIQUID CHROME CORE & SHIELD */}
      <div className="absolute right-[64px] top-[230px] w-[470px] h-[430px] z-20">
        <div className="absolute inset-0 rounded-[32px] border border-white/[0.05] bg-gradient-to-b from-white/[0.01] to-transparent shadow-[0_30px_60px_rgba(0,0,0,0.4)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-purple-500/[0.05]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        </div>
        
        {/* Efek Pendaran Nebula Di Belakang Perisai */}
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] rounded-full bg-cyan-500/[0.06] blur-[60px] av-pulse" />
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full bg-purple-500/[0.08] blur-[50px]" />
        
        {/* Orbit Lingkaran Siber */}
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-cyan-400/20 av-orbit">
          <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_15px_#00ffcc]" />
        </div>
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[240px] h-[240px] rounded-full border border-purple-400/20 border-dashed av-orbit-reverse">
          <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_15px_#a855f7]" />
        </div>
        
        {/* Wadah Perisai Inti */}
        <div className="absolute left-1/2 top-[44%] -translate-x-1/2 -translate-y-1/2 w-[170px] h-[170px] rounded-full bg-gradient-to-b from-[#11131e] to-[#07080f] border border-cyan-400/30 flex items-center justify-center shadow-[inset_0_0_40px_rgba(6,182,212,0.15),0_0_50px_rgba(0,0,0,0.6)]">
          <div className="absolute inset-2 rounded-full border border-white/[0.04]" />
          <div className="absolute inset-4 rounded-full border border-purple-400/20 av-orbit-reverse" />
          
          {/* Logo Perisai Rantai Berputar Halus */}
          <div className="relative z-10 w-[96px] h-[96px] flex items-center justify-center bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-2xl shadow-xl av-logo-pulse">
            <Shield className="w-16 h-16 text-cyan-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" strokeWidth={1.5} />
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
              <Box className="w-8 h-8 text-purple-300" />
            </div>
          </div>
        </div>
        
        {/* Lencana Atas & Bawah Panel Kanan */}
        <div className="absolute top-[22px] left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-xl shadow-[0_5px_15px_rgba(0,0,0,0.3)]" style={{ color: catColor, borderColor: `${catColor}44`, background: `linear-gradient(135deg, ${catColor}08, ${catColor}15)` }}>
            {CatIcon}<span className="text-[10px] font-black tracking-[0.25em]">AUTHENTICATED</span>
          </div>
        </div>
        <div className="absolute bottom-[22px] left-[32px]">
          <div className="text-[7px] tracking-[0.32em] text-neutral-600 font-bold">DIGITAL ARTIFACT</div>
          <div className="text-[12px] text-white font-black mt-1 tracking-wide">AETHER PROF PROOF</div>
        </div>
        <div className="absolute bottom-[22px] right-[32px] text-right">
          <div className="text-[7px] tracking-[0.32em] text-neutral-600 font-bold">SERIAL REG.</div>
          <div className="text-[11px] text-cyan-400 font-mono font-black mt-1">#{certificateId}</div>
        </div>
      </div>

      {/* FOOTER SECTION */}
      <div className="absolute left-[64px] right-[64px] bottom-[55px] z-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <div className="w-10 h-10 rounded-xl border border-cyan-400/30 bg-cyan-400/[0.04] flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              <ShieldCheck className="w-5 h-5 text-cyan-300" />
            </div>
            <div className="w-10 h-10 rounded-xl border border-purple-400/30 bg-purple-400/[0.04] flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.1)]">
              <Sparkles className="w-5 h-5 text-purple-300" />
            </div>
          </div>
          <div>
            <div className="text-[8px] tracking-[0.28em] text-neutral-500 font-bold">AUTHENTICITY STATUS</div>
            <div className="text-[11px] text-cyan-300 font-black tracking-[0.1em] mt-1 flex items-center gap-1.5">
              100% VERIFIABLE ON-CHAIN <span className="px-1.5 py-0.5 rounded text-[8px] bg-emerald-500/10 border border-emerald-400/30 text-emerald-400 font-mono font-bold">BSC VERIFIED</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[8px] tracking-[0.28em] text-neutral-500 font-bold">VERIFY METADATA</div>
            <div className="text-[9px] text-purple-400 font-mono font-bold mt-1">SCAN TO AUDIT CONTRACT</div>
          </div>
          <div className="w-[70px] h-[70px] rounded-xl bg-white p-2 shadow-[0_0_30px_rgba(6,182,212,0.2)] border border-cyan-400/30">
            <QRCode value={verifyUrl} size={54} bgColor="#ffffff" fgColor="#06070d" level="Q" />
          </div>
        </div>
      </div>

      <div className="absolute bottom-[25px] left-[64px] right-[64px] flex items-center justify-between text-[7px] font-mono tracking-[0.25em] text-neutral-600 z-20">
        <span>VERIFIABLE • IMMUTABLE • SECURED FOREVER</span>
        <span className="text-cyan-400/50 font-bold">POWERED BY AETHERVAULT PROTOCOL</span>
        <span>{String(fileHash).slice(0, 22)}...</span>
      </div>
      
      <div className="absolute top-0 bottom-0 left-0 w-[150px] bg-gradient-to-r from-transparent via-cyan-400/[0.05] to-transparent skew-x-[-18deg] pointer-events-none av-sweep" />
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
      const startBlock = Math.max(DEPLOY_BLOCK, currentBlock - 4900);
      
      const events = await contract.queryFilter(filter, startBlock, "latest");
      
      const parsedProofs = await Promise.all(events.map(async (ev) => {
        const block = await provider.getBlock(ev.blockNumber);
        const args = ev.args;
        const tokenId = args[0].toString();
        const ownerWallet = args[1];
        const category = args[2] || "Software";
        
        let extractedTitle = `Aether Proof #${tokenId}`;
        let extractedDesc = "Aether Proof Immutable Certificate. 100% On-Chain Verification.";
        let extractedCreator = "";

        try {
          const tokenUriRaw = args[3];
          if (tokenUriRaw && tokenUriRaw.startsWith('data:application/json;base64,')) {
            const base64Payload = tokenUriRaw.split(',')[1];
            const jsonString = decodeURIComponent(escape(window.atob(base64Payload)));
            const metadata = JSON.parse(jsonString);
            if (metadata.name) extractedTitle = metadata.name;
            if (metadata.description) extractedDesc = metadata.description;
            if (metadata.attributes) {
              const creatorAttr = metadata.attributes.find(a => a.trait_type === "Creator");
              // FIX: Menangani Unknown Creator
              if (creatorAttr && creatorAttr.value && creatorAttr.value.trim() !== "" && creatorAttr.value !== "Unknown Creator") {
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
      // Menggunakan html-to-image (toPng)
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
      // Menggunakan html-to-image (toPng) kemudian dimasukkan ke jsPDF
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#06070d', pixelRatio: 2 });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (760 * pdfWidth) / 1200; // Skala aspect ratio original 1200x760
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

      {/* MODAL POPUP DENGAN POSISI CENTERING */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative flex flex-col items-center bg-[#05030F] border border-cyan-500/30 rounded-3xl shadow-2xl max-w-[95vw] max-h-[95vh] overflow-hidden">
            <div className="w-full flex justify-between items-center p-4 border-b border-cyan-900/50 bg-black/40">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-white font-mono">Certificate <span className="text-cyan-400">#{selectedProof.tokenId}</span></h3>
              </div>
              <button onClick={() => setSelectedProof(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/50 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* FIX CENTERING: Posisi skalasi pas di tengah */}
            <div className="w-full flex-1 overflow-auto custom-scrollbar flex items-center justify-center bg-[#020207] p-4 min-h-[550px]">
              <div style={{ width: '780px', height: '494px', position: 'relative' }} className="shrink-0">
                <div className="absolute top-0 left-0" style={{ width: '1200px', height: '760px', transform: 'scale(0.65)', transformOrigin: 'top left' }}>
                  <CertificateTemplate ref={certificateRef} proofData={selectedProof} categoryConfig={categoryConfig} />
                </div>
              </div>
            </div>

            <div className="w-full flex flex-wrap items-center justify-center gap-4 p-5 border-t border-cyan-900/50 bg-black/40">
              <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 text-xs font-bold transition-all cursor-pointer"><Download className="w-4 h-4" /> Save PDF</button>
              <button onClick={handleDownloadPNG} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 text-xs font-bold transition-all cursor-pointer"><ImageIcon className="w-4 h-4" /> Save PNG</button>
              <a href={selectedProof.verifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/40 hover:border-purple-400/70 text-purple-300 text-xs font-bold transition-all cursor-pointer no-underline"><ExternalLink className="w-4 h-4" /> View Transaction</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
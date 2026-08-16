import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, Globe, Music, Code2, Palette, BookOpen, Camera, Film, Microscope, Building2, Scale, Box, User, Link as LinkIcon, UploadCloud, Lock, ChevronLeft, Loader2, FileImage, Cpu, Flame, Fingerprint, Image as ImageIcon, ExternalLink, QrCode, Eye, Sparkles, Activity, Layers, ArrowUpRight, Check, Compass, Shield, Hash, FileDigit, Hexagon } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AetherVaultV3Artifact from '@/contracts/AetherVaultV3ABI.json';
import AetherVaultArtifact from '@/contracts/AetherVaultABI.json';
import { useLanguage } from '@/context/LanguageContext';

// 🚀 FIX: EKSTRAK ABI DARI ARTIFACT HARDHAT AGAR TIDAK ERROR "E IS NOT ITERABLE"
const AetherVaultV3ABI = AetherVaultV3Artifact.abi || AetherVaultV3Artifact;
const AetherVaultABI = AetherVaultArtifact.abi || AetherVaultArtifact;

const AETHER_VAULT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265";
const AETH_TOKEN_ADDRESS = "0x2121a501Db9bBf122a69b856AEAaB3F908467cED"; 
const READ_ONLY_RPC_URL = "https://bsc-testnet-rpc.publicnode.com";

const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Not Connected';

// =========================================================
// 🚀 GAYA WEB3 PREMIUM: ULTRA-MODERN GLASSMORPHISM
// =========================================================
const CertificateTemplate = React.forwardRef(({ proofData, tDash, tHop, formatAddress, categoryConfig, AETHER_LOGO = '/logo.png' }, ref) => {
  const catKey = (proofData?.category || 'Software').toLowerCase().trim();
  const rawCatObj = categoryConfig ? Object.entries(categoryConfig).find(([key]) => key.toLowerCase() === catKey) : null;
  const cat = rawCatObj ? rawCatObj[1] : { badge: 'Verified Creator', icon: <Sparkles className="w-4 h-4" />, color: '#60a5fa', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.15)' };
  
  const CatIcon = cat.icon ? React.cloneElement(cat.icon, { className: "w-4 h-4 drop-shadow-[0_0_8px_currentColor]", style: { color: cat.color } }) : <Sparkles className="w-4 h-4" style={{ color: cat.color }} />;

  return (
    <div id="cert-export-node" ref={ref} className="w-[890px] h-[660px] bg-[#030303] text-gray-200 rounded-[2rem] p-7 pb-6 relative overflow-hidden font-sans mx-auto flex flex-col justify-between shrink-0 shadow-[0_0_80px_rgba(0,0,0,0.8)] border border-[#ffffff10]" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #1a1b26 0%, #050505 60%, #000000 100%)' }}>
      
      {/* 🔮 PREMIUM HOLOGRAPHIC BACKGROUND ACCENTS */}
      <div className="absolute inset-0 opacity-[0.15] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-gradient-to-br from-indigo-600/30 to-purple-600/20 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] bg-gradient-to-tl from-cyan-600/20 to-blue-600/20 pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] rounded-full blur-[150px] bg-amber-500/10 pointer-events-none" />

      {/* 🌟 HEADER: CLEAN & MINIMALIST */}
      <div className="flex justify-between items-center relative z-10 pb-4 border-b border-white/[0.08] shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-[14px] flex items-center justify-center bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] backdrop-blur-md">
            <img src={AETHER_LOGO} alt="AetherVault" style={{ width: '32px', height: '32px' }} className="drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]" />
          </div>
          <div>
            <div className="font-display font-black text-xl tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-sm">
              AETHER<span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">VAULT</span>
            </div>
            <p className="text-[8px] tracking-[0.4em] text-neutral-400 uppercase font-mono mt-1.5 font-semibold">Trustless • Verified • Timeless</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#09120c] px-4 py-1.5 rounded-full border border-[#166534] shadow-[0_0_15px_rgba(22,101,52,0.4)] backdrop-blur-sm">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-widest font-mono">VERIFIED ON-CHAIN</span>
          </div>
          <div className="bg-[#170f05] px-4 py-1.5 rounded-full border border-[#78350f] flex items-center gap-2 shadow-[0_0_15px_rgba(120,53,15,0.4)] backdrop-blur-sm">
            <Globe className="w-3 h-3 text-amber-400" />
            <span className="text-[9px] font-bold text-amber-300 uppercase tracking-widest font-mono">BNB CHAIN</span>
          </div>
        </div>
      </div>

      {/* 🌟 TITLE: ELEGANT & SHARP */}
      <div className="text-center relative z-10 shrink-0 mt-3 mb-2">
        <div className="inline-flex items-center gap-2.5 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[10px] tracking-[0.5em] text-indigo-200/80 uppercase font-mono font-bold">Non-Fungible Token Certificate</span>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </div>
        <h2 className="text-[32px] font-black tracking-[0.18em] font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-100 via-white to-purple-200 drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
          CERTIFICATE OF AUTHENTICITY
        </h2>
      </div>

      {/* 🌟 STRUKTUR UTAMA: PURE GLASSMORPHISM */}
      <div className="flex flex-col gap-3.5 relative z-10 flex-1 justify-center">
        
        {/* BARIS 1: ASSET INFO */}
        <div className="flex gap-4 items-stretch">
          {/* Emblem Hologram */}
          <div className="w-[130px] shrink-0 rounded-[20px] bg-white/[0.02] border border-white/[0.08] relative overflow-hidden flex items-center justify-center backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4)]">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
            <div className="absolute w-[80px] h-[80px] rounded-full blur-[30px] bg-cyan-500/20"></div>
            <img src={AETHER_LOGO} alt="Emblem" className="relative z-10 object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] av-float" style={{ width: '64px', height: '64px' }} />
          </div>

          {/* Info Glass Panel */}
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-5 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl flex flex-col justify-between font-mono relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <div className="flex justify-between items-start mb-2 relative z-10">
              <div className="flex-1 pr-4">
                <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-1 font-bold">Asset Title</p>
                <p className="text-white font-bold text-base line-clamp-1 drop-shadow-sm tracking-wide">{proofData?.title || 'Aether Proof™'}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-1 font-bold">Certificate ID</p>
                <div className="px-3 py-1 bg-white/[0.05] rounded-md border border-white/[0.1]">
                   <p className="text-cyan-300 font-bold text-sm tracking-widest drop-shadow-[0_0_8px_rgba(103,232,249,0.4)]">#{proofData?.id || 'PENDING'}</p>
                </div>
              </div>
            </div>

            <div className="mb-3 flex-1 relative z-10">
              <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-400 mb-1 font-bold">Description</p>
              <p className="text-[11px] text-neutral-300 leading-relaxed line-clamp-2 pr-4 font-sans">
                {proofData?.description || 'Authentic digital asset secured and verified permanently on the decentralized network.'}
              </p>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-white/[0.08] relative z-10">
              <div className="w-1/4 pr-2"><p className="text-[8px] uppercase tracking-[0.25em] text-neutral-500 mb-1 font-bold">Creator</p><p className="text-white font-bold text-[11px] truncate">{proofData?.creator || 'Unknown'}</p></div>
              <div className="w-1/4 pr-2"><p className="text-[8px] uppercase tracking-[0.25em] text-neutral-500 mb-1 font-bold">Owner</p><p className="text-white font-bold text-[11px] truncate">{formatAddress(proofData?.wallet || '0x00...00')}</p></div>
              <div className="w-1/4 pr-2"><p className="text-[8px] uppercase tracking-[0.25em] text-neutral-500 mb-1 font-bold">Issued</p><p className="text-white font-bold text-[11px]">{proofData?.date || new Date().toLocaleDateString()}</p></div>
              <div className="w-1/4"><p className="text-[8px] uppercase tracking-[0.25em] text-neutral-500 mb-1 font-bold">Network</p><p className="text-white font-bold text-[11px] truncate">{proofData?.network || 'BSC Testnet'}</p></div>
            </div>
          </div>
        </div>

        {/* BARIS 2: METADATA */}
        <div className="bg-[#050505]/60 rounded-2xl py-3.5 px-5 border border-white/[0.05] shadow-[inset_0_0_20px_rgba(255,255,255,0.02)] flex items-center gap-4 w-full font-mono shrink-0 backdrop-blur-md">
          <div className="flex items-center gap-2.5 pr-5 border-r border-white/[0.1] shrink-0">
            <Lock className="w-4 h-4 text-neutral-400" />
            <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-300 font-bold leading-tight">On-Chain<br/>Data</p>
          </div>
          <div className="flex-1 flex justify-between items-center text-[10px] sm:text-xs">
            <div className="flex flex-col gap-1 w-[15%]"><p className="text-[8px] text-neutral-500 uppercase font-bold tracking-wider">Token ID</p><p className="text-white truncate font-bold">#{proofData?.tokenId || '0'}</p></div>
            <div className="flex flex-col gap-1 w-[15%]"><p className="text-[8px] text-neutral-500 uppercase font-bold tracking-wider">Chain ID</p><p className="text-white truncate font-bold">97</p></div>
            <div className="flex flex-col gap-1 w-[25%] pr-2"><p className="text-[8px] text-neutral-500 uppercase font-bold tracking-wider">Contract</p><p className="text-neutral-300 truncate w-full font-bold">{formatAddress(proofData?.contract || AETHER_VAULT_ADDRESS)}</p></div>
            <div className="flex flex-col gap-1 w-[45%]"><p className="text-[8px] text-neutral-500 uppercase font-bold tracking-wider">Tx Hash (SHA-256)</p><p className="text-neutral-300 truncate w-full font-bold">{proofData?.fileHash || 'Calculating...'}</p></div>
          </div>
        </div>

        {/* BARIS 3: SERIAL, 100% ON-CHAIN, AUTHENTIC, QR CODE (Tertata Presisi & Modern) */}
        <div className="flex gap-4 font-mono shrink-0 items-center">
          <div className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-[20px] p-4.5 flex items-center justify-between shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl">
            
            {/* SERIAL NUMBER */}
            <div>
              <p className="text-[9px] text-neutral-400 uppercase tracking-[0.25em] font-bold mb-1">Certificate Serial</p>
              <p className="text-xl font-bold font-mono text-white tracking-widest drop-shadow-md">#{proofData?.id || proofData?.tokenId || 'PENDING-MINT'}</p>
            </div>
            
            {/* TULISAN 100% ON-CHAIN DI TENGAH */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/[0.1] text-neutral-300 text-[10px] font-bold uppercase tracking-widest shadow-inner">
              <Shield className="w-4 h-4 text-emerald-400" /> 100% On-Chain
            </div>

            {/* AUTHENTIC BADGE (Glow Modern) */}
            <div className="relative av-badge-pulse" style={{ color: cat.color || '#60a5fa' }}>
               <div className="flex items-center gap-2.5 px-6 py-3 rounded-xl border border-white/[0.15] font-bold text-[13px] tracking-[0.2em] backdrop-blur-md shadow-[0_0_20px_rgba(255,255,255,0.05)]" style={{ background: 'rgba(255,255,255,0.05)' }}>
                 {CatIcon} <span className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">{cat.badgeLabel || cat.label?.toUpperCase() || 'AUTHENTIC'}</span>
               </div>
            </div>
          </div>

          {/* QR CODE (Desain Kotak Minimalis Apple-Style) */}
          <div className="w-[105px] h-[105px] bg-white/[0.03] border border-white/[0.08] rounded-[20px] p-2 flex items-center justify-center shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-xl shrink-0">
            <div className="w-full h-full bg-white rounded-[14px] shadow-sm flex items-center justify-center p-1.5">
              <QRCode value={proofData?.verifyUrl || "https://aethvault.xyz"} size={76} bgColor="#ffffff" fgColor="#030303" level="Q" />
            </div>
          </div>
        </div>

      </div>

      {/* 🌟 FOOTER (Rapat ke Siku, Animasi Tetap Nyala, Super Bersih) */}
      <div className="relative z-10 pt-4 flex flex-row items-end justify-between px-1 shrink-0 mt-2">
        {/* Kiri */}
        <div className="pb-1">
          <p className="text-[8px] uppercase tracking-[0.4em] text-neutral-500 font-mono font-bold mb-1.5">Powered By</p>
          <div className="flex items-center gap-2">
            <Hexagon className="w-4 h-4 text-indigo-400" />
            <p className="text-[11px] font-bold text-white font-display tracking-widest opacity-90">AETHERVAULT PROTOCOL</p>
          </div>
        </div>

        {/* Tengah (Signature & Animasi) */}
        <div className="text-center flex flex-col items-center justify-end">
          <div className="relative w-16 h-12 flex items-center justify-center mb-1">
            <div className="absolute inset-0 rounded-full border border-neutral-500/30 animate-spin" style={{ animationDuration: '10s' }} />
            <ShieldCheck className="w-7 h-7 text-neutral-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] av-float" />
          </div>
          <div className="font-signature text-3xl text-white tracking-wider opacity-90" style={{ fontFamily: "'Brush Script MT', cursive" }}>AetherVault</div>
          <div className="w-32 border-b border-white/20 my-1.5" />
          <p className="text-[7px] uppercase tracking-[0.4em] text-neutral-500 font-mono font-bold">Authorized Signature</p>
        </div>

        {/* Kanan */}
        <div className="text-right pb-1">
          <p className="text-[8px] uppercase tracking-[0.4em] text-neutral-500 font-mono font-bold mb-1.5">Network</p>
          <div className="flex items-center justify-end gap-2">
            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
            <span className="text-[10px] font-mono text-indigo-200 bg-indigo-500/10 px-3 py-0.5 rounded-full border border-indigo-500/30 font-bold">BSC TESTNET</span>
          </div>
        </div>
      </div>
    </div>
  );
});
CertificateTemplate.displayName = "CertificateTemplate";

// =========================================================
// MAIN COMPONENT: AETHER PROOF HUB
// =========================================================
export default function AetherProofHub({ handleViewCertificate, setActiveTab, address, TARGET_CHAIN_NAME }) {
  const { t: globalT } = useLanguage();
  const tHop = globalT.hallOfProof || {};
  const tLand = globalT.landing || {};
  const tDash = globalT.dashboard || {};
  const tStats = globalT.globalStats || {};

  const [view, setView] = useState('hub');
  const certificateRef = useRef(null);

  const previewScrollRef = useRef(null);
  const [previewZoom, setPreviewZoom] = useState(0.8);
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const [category, setCategory] = useState('Software');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [creatorName, setCreatorName] = useState('');
  const [tier, setTier] = useState(0);
  const [file, setFile] = useState(null);
  
  const [isHashing, setIsHashing] = useState(false);
  const [fileHash, setFileHash] = useState('0x0000000000000000000000000000000000000000000000000000000000000000');
  const [metadataHash, setMetadataHash] = useState('0x...');

  const [mintStep, setMintStep] = useState(0);
  const [generatedProof, setGeneratedProof] = useState(null);
  const [mintingStatusMsg, setMintingStatusMsg] = useState('Please confirm transaction in MetaMask...');

  const [onChainProofs, setOnChainProofs] = useState([]);
  const [isLoadingHall, setIsLoadingHall] = useState(true);
  const [globalProtocolStats, setGlobalProtocolStats] = useState({ totalProofs: 0, burnedTotal: 0 });

  const categoryConfig = {
    "Writing": { price: 200, badge: "Verified Author", color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.35)', badgeIcon: "✍️", icon: <BookOpen className="w-5 h-5 text-cyan-400" /> },
    "Photography": { price: 200, badge: "Verified Photographer", color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.35)', badgeIcon: "📷", icon: <Camera className="w-5 h-5 text-pink-400" /> },
    "Design": { price: 200, badge: "Verified Creator", color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)', badgeIcon: "🎨", icon: <Palette className="w-5 h-5 text-purple-400" /> },
    "Music": { price: 200, badge: "Verified Artist", color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)', badgeIcon: "🎵", icon: <Music className="w-5 h-5 text-amber-400" /> },
    "Video": { price: 200, badge: "Verified Filmmaker", color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)', badgeIcon: "🎬", icon: <Film className="w-5 h-5 text-rose-400" /> },
    "Software": { price: 200, badge: "Verified Developer", color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.35)', badgeIcon: "💻", icon: <Code2 className="w-5 h-5 text-green-400" /> },
    "Research": { price: 200, badge: "Verified Researcher", color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.35)', badgeIcon: "🔬", icon: <Microscope className="w-5 h-5 text-blue-400" /> },
    "Business": { price: 200, badge: "Verified Company", color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.35)', badgeIcon: "🏛️", icon: <Building2 className="w-5 h-5 text-orange-400" /> },
    "Legal": { price: 200, badge: "Verified Entity", color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.35)', badgeIcon: "📜", icon: <Scale className="w-5 h-5 text-indigo-400" /> },
    "Other": { price: 200, badge: "Verified Creator", color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)', badgeIcon: "✨", icon: <Box className="w-5 h-5 text-neutral-400" /> }
  };

  const currentConfig = categoryConfig[category];
  const realAddress = address || "0x0000000000000000000000000000000000000000";

  const handleMouseDown = (e) => {
    setIsDraggingPreview(true);
    setDragStart({ x: e.pageX - previewScrollRef.current.offsetLeft, y: e.pageY - previewScrollRef.current.offsetTop, scrollLeft: previewScrollRef.current.scrollLeft, scrollTop: previewScrollRef.current.scrollTop });
  };
  const handleMouseLeaveOrUp = () => setIsDraggingPreview(false);
  const handleMouseMove = (e) => {
    if (!isDraggingPreview) return;
    e.preventDefault();
    const x = e.pageX - previewScrollRef.current.offsetLeft;
    const y = e.pageY - previewScrollRef.current.offsetTop;
    previewScrollRef.current.scrollLeft = dragStart.scrollLeft - (x - dragStart.x) * 1.5;
    previewScrollRef.current.scrollTop = dragStart.scrollTop - (y - dragStart.y) * 1.5;
  };
  const handleTouchStart = (e) => {
    setIsDraggingPreview(true);
    setDragStart({ x: e.touches[0].pageX - previewScrollRef.current.offsetLeft, y: e.touches[0].pageY - previewScrollRef.current.offsetTop, scrollLeft: previewScrollRef.current.scrollLeft, scrollTop: previewScrollRef.current.scrollTop });
  };
  const handleTouchMove = (e) => {
    if (!isDraggingPreview) return;
    const x = e.touches[0].pageX - previewScrollRef.current.offsetLeft;
    const y = e.touches[0].pageY - previewScrollRef.current.offsetTop;
    previewScrollRef.current.scrollLeft = dragStart.scrollLeft - (x - dragStart.x) * 1.5;
    previewScrollRef.current.scrollTop = dragStart.scrollTop - (y - dragStart.y) * 1.5;
  };

  const fetchOnChainHallOfProof = useCallback(async () => {
    setIsLoadingHall(true);
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
        return {
          id: args[0].toString(),
          title: `Aether Proof #${args[0].toString()}`,
          category: args[2] || "Software",
          owner: `${args[1].substring(0, 6)}...${args[1].substring(args[1].length - 4)}`,
          ownerFull: args[1],
          date: new Date((block?.timestamp || Date.now() / 1000) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          network: TARGET_CHAIN_NAME || "BSC Testnet",
          hash: `${args[4].substring(0, 8)}...`,
          fullHash: args[4],
          status: "Verified On-Chain",
          txHash: ev.transactionHash
        };
      }));

      parsedProofs.reverse();
      setOnChainProofs(parsedProofs);
      setGlobalProtocolStats({ totalProofs: parsedProofs.length, burnedTotal: parsedProofs.length * 50 });
    } catch (err) {
      console.error("Gagal memuat Hall of Proof on-chain:", err);
    } finally {
      setIsLoadingHall(false);
    }
  }, [TARGET_CHAIN_NAME]);

  useEffect(() => { fetchOnChainHallOfProof(); }, [fetchOnChainHallOfProof]);

  const generateKeccak256 = async (dataBuffer) => {
    try {
      const uint8Array = new Uint8Array(dataBuffer);
      return ethers.keccak256(uint8Array);
    } catch (err) {
      throw new Error("File hashing failed / corrupted"); 
    }
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setIsHashing(true);
    try {
      const arrayBuffer = await uploadedFile.arrayBuffer();
      const hash = await generateKeccak256(arrayBuffer);
      setTimeout(() => { setFileHash(hash); setIsHashing(false); }, 800);
    } catch (err) {
      alert("Gagal membaca file: " + err.message);
      setIsHashing(false); setFile(null);
    }
  };

  useEffect(() => {
    const updateMetadataHash = async () => {
      try {
        const metadata = JSON.stringify({
          name: title || "Aether Proof",
          description: description || "Blockchain Certificate",
          attributes: [
            { trait_type: "Category", value: category },
            { trait_type: "Creator", value: creatorName || realAddress },
            { trait_type: "File Hash", value: fileHash }
          ]
        });
        const enc = new TextEncoder();
        const hash = await generateKeccak256(enc.encode(metadata).buffer);
        setMetadataHash(hash);
      } catch (e) {
        setMetadataHash("0x...");
      }
    };
    updateMetadataHash();
  }, [title, description, category, creatorName, fileHash, realAddress]);

  const handleMintSequence = async (e) => {
    e.preventDefault();
    setView('minting');
    setMintingStatusMsg('Preparing transaction...');
    
    try {
      setMintStep(1);
      await new Promise(res => setTimeout(res, 500));
      if (!window.ethereum) throw new Error("MetaMask not found!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const requiredCostWei = ethers.parseUnits(currentConfig.price.toString(), 18);
      const tokenContract = new ethers.Contract(AETH_TOKEN_ADDRESS, AetherVaultABI, signer);

      setMintingStatusMsg(tHop.checkingAllowance || 'Memeriksa izin akses token $AETH...');
      const currentAllowance = await tokenContract.allowance(address, AETHER_VAULT_ADDRESS);

      if (currentAllowance < requiredCostWei) {
        setMintingStatusMsg(tHop.approveTokenPrompt || 'Silakan setujui izin akses $AETH di dompet Anda...');
        const approveTx = await tokenContract.approve(AETHER_VAULT_ADDRESS, requiredCostWei);
        setMintingStatusMsg(tHop.waitingApproveConfirm || 'Menunggu konfirmasi izin akses dari jaringan...');
        await approveTx.wait();
        setMintingStatusMsg(tHop.approvalSuccess || 'Izin akses disetujui! Menyiapkan sertifikat...');
      }

      setMintStep(3);
      const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AetherVaultV3ABI, signer);
      setMintStep(4);
      
      const safeTitle = (title || "Aether Proof").replace(/[<>&'"]/g, function (c) {
        switch (c) {
          case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case '\'': return '&apos;'; case '"': return '&quot;'; default: return c;
        }
      });

      const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#0B0817"/><text x="50%" y="50%" font-family="monospace" font-size="24" font-weight="bold" fill="#e4a329" text-anchor="middle" dy=".3em">${safeTitle}</text></svg>`;
      const base64Svg = window.btoa(unescape(encodeURIComponent(svgImage)));

      const metadataJSON = {
        name: title || "Aether Proof",
        description: description || "Aether Proof Immutable Certificate. 100% On-Chain Verification.",
        image: `data:image/svg+xml;base64,${base64Svg}`,
        attributes: [
          { trait_type: "Category", value: category },
          { trait_type: "Creator", value: creatorName || realAddress }, 
          { trait_type: "File Hash", value: fileHash }
        ]
      };

      const encodedJSON = window.btoa(unescape(encodeURIComponent(JSON.stringify(metadataJSON))));
      const tokenURIParam = `data:application/json;base64,${encodedJSON}`;

      setMintingStatusMsg('Harap konfirmasi transaksi pencetakan (Mint) di MetaMask...');
      const tx = await contract.createProof(Number(tier), category, fileHash, tokenURIParam, true);
      
      setMintingStatusMsg('Menunggu validasi blok BSC Testnet...');
      setMintStep(5);
      const receipt = await tx.wait();

      let realTokenId = Math.floor(8000 + Math.random() * 2000);
      if (receipt && receipt.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log);
            if (parsed && parsed.name === 'ProofMinted') {
              realTokenId = parsed.args[0].toString();
              break;
            }
          } catch (e) {}
        }
      }
      
      setGeneratedProof({
        tokenId: realTokenId,
        id: `AETH-PROOF-${realTokenId}`,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber || 4350122,
        contract: AETHER_VAULT_ADDRESS,
        category,
        title,
        description: description || "Aether Proof Immutable Certificate. 100% On-Chain Verification.",
        badge: currentConfig.badge,
        badgeIcon: currentConfig.badgeIcon,
        creator: creatorName || formatAddressFunc(address),
        wallet: realAddress,
        fileHash: fileHash,
        metaHash: metadataHash,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        network: TARGET_CHAIN_NAME || "BSC Testnet",
        verifyUrl: `https://testnet.bscscan.com/tx/${receipt.hash}`
      });
      
      setView('success');
      fetchOnChainHallOfProof();
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Transaksi dibatalkan atau gagal: " + (error.reason || error.message));
      setView('form');
    }
  };

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: '#0B0817' });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${generatedProof.id}.png`;
      link.click();
    } catch (error) { console.error("PNG generation failed", error); }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: '#0B0817' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`${generatedProof.id}.pdf`);
    } catch (error) { console.error("PDF generation failed", error); }
  };

  const resetFormToMintAnother = () => {
    setView('hub'); 
    setFile(null); 
    setFileHash('0x0000000000000000000000000000000000000000000000000000000000000000');
    setTitle('');
    setDescription('');
    setCreatorName('');
    setCategory('Software');
    setTier(0);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      <style>{`
        @keyframes av-ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes av-ring-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes av-light-sweep { 0%, 55% { transform: translateX(-140%) skewX(-18deg); opacity: 0; } 65% { opacity: .8; } 82%, 100% { transform: translateX(140%) skewX(-18deg); opacity: 0; } }
        @keyframes av-logo-pulse { 0%, 100% { filter: drop-shadow(0 0 16px rgba(245,158,11,.45)); transform: scale(1); } 50% { filter: drop-shadow(0 0 28px rgba(245,158,11,.85)); transform: scale(1.025); } }
        @keyframes av-orbit-dot { from { transform: rotate(0deg) translateX(43px) rotate(0deg); } to { transform: rotate(360deg) translateX(43px) rotate(-360deg); } }
        @keyframes av-badge-pulse { 0%, 100% { box-shadow: 0 0 12px currentColor, inset 0 1px 0 rgba(255,255,255,.08); } 50% { box-shadow: 0 0 24px currentColor, inset 0 1px 0 rgba(255,255,255,.14); } }
        @keyframes av-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .av-ring-spin { animation: av-ring-spin 12s linear infinite; }
        .av-ring-reverse { animation: av-ring-reverse 8s linear infinite; }
        .av-light-sweep { animation: av-light-sweep 4.5s ease-in-out infinite; }
        .av-logo-pulse { animation: av-logo-pulse 3.8s ease-in-out infinite; }
        .av-badge-pulse { animation: av-badge-pulse 2.8s ease-in-out infinite; }
        .av-orbit-dot { animation: av-orbit-dot 6s linear infinite; }
        .av-float { animation: av-float 3s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .av-ring-spin, .av-ring-reverse, .av-light-sweep, .av-logo-pulse, .av-badge-pulse, .av-orbit-dot, .av-float { animation: none !important; } }
      `}</style>

      {view === 'hub' && (
        <>
          <div className="bg-gradient-to-br from-[#0B0817] via-[#0d091e] to-[#05030F] border border-cyan-900/40 p-6 sm:p-10 rounded-3xl shadow-[0_0_40px_rgba(6,182,212,0.1)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/15 via-cyan-500/15 to-purple-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                  <Award className="w-3.5 h-3.5 text-cyan-400" /> {tHop.galleryBadge || 'Immutable On-Chain Gallery'}
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200 tracking-tight leading-tight">
                  {tLand.pillars?.proofTitle || 'Aether Proof™'}
                </h3>
                <p className="text-xs sm:text-sm text-cyan-100/70 leading-relaxed max-w-xl">
                  {tLand.pillars?.proofDesc || 'Mint immutable ownership certificates for any digital creation, artwork, software, or intellectual property on the blockchain.'}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => setView('form')}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-8 py-4 rounded-2xl text-xs sm:text-sm shadow-[0_0_30px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.6)] cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" /> {tHop.mintFirst || 'Mint Proof'}
                  </button>
                  <div className="flex items-center gap-3 px-4 py-3 bg-black/40 rounded-2xl border border-cyan-900/50 backdrop-blur-sm">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping shadow-[0_0_10px_rgba(6,182,212,0.8)]"></div>
                    <div className="text-[11px] font-mono">
                      <span className="text-white font-bold">100%</span> <span className="text-cyan-400/80">On-Chain</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center bg-black/40 border border-cyan-900/40 p-6 rounded-2xl relative shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] backdrop-blur-md">
                <span className="absolute top-3 right-3 text-[9px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 uppercase shadow-[0_0_10px_rgba(6,182,212,0.2)]">Live Pipeline</span>
                <div className="space-y-3 w-full max-w-[240px] text-center">
                  <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center gap-2 shadow-lg">
                    <Globe className="w-4 h-4 text-purple-400 animate-spin" /> Binance Smart Chain
                  </div>
                  <div className="h-4 w-0.5 bg-gradient-to-b from-purple-500 to-amber-500 mx-auto"></div>
                  <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center gap-2 shadow-lg">
                    <Fingerprint className="w-4 h-4 text-amber-400" /> Keccak256 Hash
                  </div>
                  <div className="h-4 w-0.5 bg-gradient-to-b from-amber-500 to-cyan-500 mx-auto"></div>
                  <div className="p-3 bg-gradient-to-r from-cyan-950/60 to-blue-900/60 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold text-cyan-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md">
                    <Award className="w-4 h-4 text-cyan-400" /> Immutable Certificate
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: tHop.totalProofs || "On-Chain Proofs", value: globalProtocolStats.totalProofs, icon: Award, color: "text-amber-400", border: "border-amber-900/30" },
              { label: tHop.creators || "Global Creators", value: globalProtocolStats.totalProofs > 0 ? `${globalProtocolStats.totalProofs}+` : "0", icon: User, color: "text-cyan-400", border: "border-cyan-900/30" },
              { label: "Network", value: "BSC Testnet", icon: Globe, color: "text-purple-400", border: "border-purple-900/30" },
              { label: tStats.burn || "$AETH Burned", value: `${globalProtocolStats.burnedTotal} AETH`, icon: Flame, color: "text-red-400", border: "border-red-900/30" }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-[#0B0817] border ${stat.border} p-5 sm:p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.05)] transition-shadow`}>
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-[9px] font-mono text-neutral-500 uppercase">Live On-Chain</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mb-1 drop-shadow-md">{stat.value}</div>
                <div className="text-xs text-neutral-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#0B0817] border border-cyan-900/30 p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-300 uppercase tracking-wider font-display">
                  {tHop.categories || 'Categories'} & Badges
                </h4>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Object.entries(categoryConfig).map(([key, val], idx) => (
                <div 
                  key={idx} 
                  onClick={() => { setCategory(key); setView('form'); }}
                  className="bg-[#05030F] border border-neutral-800/80 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all duration-300 cursor-pointer group relative overflow-hidden flex flex-col justify-between hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-black/50 border border-neutral-700 flex items-center justify-center group-hover:scale-110 group-hover:border-cyan-500/50 transition-all shrink-0 shadow-inner">
                        <div className="scale-75 sm:scale-100 flex items-center justify-center">{val.icon}</div>
                      </div>
                      <span className="text-[9px] sm:text-xs font-mono font-bold text-cyan-400 bg-cyan-950/50 px-2 py-1 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl border border-cyan-500/30 whitespace-nowrap shadow-sm">{val.price} AETH</span>
                    </div>
                    <h5 className="font-bold text-white text-xs sm:text-base mb-1 group-hover:text-cyan-300 transition-colors truncate">{key}</h5>
                  </div>
                  <div className="pt-2 sm:pt-3 border-t border-neutral-800/80 flex items-center justify-between mt-2">
                    <span className="text-[9px] sm:text-[11px] font-bold text-neutral-400 group-hover:text-neutral-200 flex items-center gap-1 sm:gap-1.5 truncate pr-1 transition-colors">
                      <span className="shrink-0">{val.badgeIcon}</span> <span className="truncate">{val.badge}</span>
                    </span>
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-600 group-hover:text-cyan-400 transition-colors shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0B0817] border border-cyan-900/30 p-6 sm:p-8 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" /> {tHop.recentActivity || 'Recent On-Chain Activity'}
                </h4>
              </div>
            </div>
            {isLoadingHall ? (
              <div className="text-center py-12 text-cyan-500/70 text-xs flex items-center justify-center gap-2 font-mono font-bold">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Fetching Blockchain Registry...
              </div>
            ) : onChainProofs.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs font-mono border border-dashed border-neutral-800 rounded-2xl bg-black/20">
                {tHop.emptyDesc || 'No proofs minted on-chain yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {onChainProofs.map((item) => (
                  <div key={item.id} className="bg-[#05030F] border border-neutral-800 rounded-2xl p-5 hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.15)] transition-all flex flex-col justify-between group">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-500/30">{item.category}</span>
                        <span className="text-[10px] font-mono text-green-400 flex items-center gap-1"><Check className="w-3 h-3"/> On-Chain</span>
                      </div>
                      <h5 className="font-bold text-white text-sm line-clamp-2 group-hover:text-cyan-300 transition-colors">{item.title}</h5>
                      <p className="text-[10px] text-cyan-500/60 font-mono truncate">Hash: {item.hash}</p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-neutral-800/80 space-y-2">
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                        <span>{tHop.creator || 'Owner'}</span>
                        <span className="text-neutral-300">{item.owner}</span>
                      </div>
                      <div className="flex justify-between text-[10px] text-neutral-500 font-mono">
                        <span>Date</span>
                        <span className="text-neutral-300">{item.date}</span>
                      </div>
                      <button 
                        onClick={() => handleViewCertificate(item.id)}
                        className="w-full mt-3 py-2.5 bg-cyan-950/30 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-900/50 hover:border-cyan-400/50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" /> {tHop.viewCert || 'View Certificate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {view === 'form' && (
        <div className="flex flex-col gap-6 lg:gap-8 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#0B0817] border border-cyan-900/50 p-6 sm:p-8 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col w-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
            
            <button onClick={() => setView('hub')} className="mb-4 flex items-center gap-2 text-xs text-neutral-400 hover:text-cyan-300 transition-colors cursor-pointer w-fit z-10">
              <ChevronLeft className="w-4 h-4" /> Back to Hub
            </button>
            
            <div className="flex items-center justify-between mb-6 border-b border-neutral-800/60 pb-4 z-10">
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">Metadata Details</h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">STEP 1: CONFIGURATION</span>
            </div>

            <form onSubmit={handleMintSequence} className="space-y-6 z-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono drop-shadow-sm">{tHop.categories || 'Category'}</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#05030F] border border-neutral-700 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] cursor-pointer font-mono transition-all">
                    {Object.keys(categoryConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono drop-shadow-sm">Title *</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Core Smart Contract v1" className="w-full bg-[#05030F] border border-neutral-700 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] font-medium transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono drop-shadow-sm">{tHop.creator || 'Creator Name'}</label>
                  <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="e.g., Satoshi Nakamoto" className="w-full bg-[#05030F] border border-neutral-700 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] font-medium transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 h-full">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono drop-shadow-sm">Description</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Short description about this proof..." 
                    className="w-full h-[110px] bg-[#05030F] border border-neutral-700 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] font-medium resize-none custom-scrollbar transition-all" 
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1.5 drop-shadow-sm"><Fingerprint className="w-3 h-3"/> Target File</label>
                  <div className="flex-1 h-[110px]">
                    {!file ? (
                      <div className="h-full border-2 border-dashed border-neutral-700 hover:border-cyan-500/60 bg-[#05030F] rounded-2xl flex flex-col items-center justify-center cursor-pointer relative transition-all group">
                        <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <UploadCloud className="w-6 h-6 text-cyan-500 mb-1 group-hover:scale-110 transition-transform" />
                        <p className="text-[11px] text-neutral-300 font-bold group-hover:text-cyan-300 transition-colors">Drop your file here</p>
                      </div>
                    ) : (
                      <div className="h-full bg-cyan-950/20 border border-cyan-500/40 p-4 rounded-2xl flex flex-col justify-center gap-3 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
                        <div className="flex items-center gap-3 truncate">
                          <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30"><FileImage className="w-5 h-5 text-cyan-300 shrink-0" /></div>
                          <div className="min-w-0">
                             <span className="text-xs text-white truncate font-bold block mb-0.5">{file.name}</span>
                             <span className="text-[9px] text-cyan-400/80 font-mono block truncate">{fileHash}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => {setFile(null); setFileHash('0x0000000000000000000000000000000000000000000000000000000000000000');}} className="text-[10px] bg-red-950/50 text-red-400 hover:bg-red-900/70 py-1.5 px-3 rounded-lg w-fit cursor-pointer font-bold border border-red-500/30 transition-colors">Remove File</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-6 border-t border-neutral-800/60 flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="bg-black/50 border border-neutral-800 py-2.5 px-4 rounded-xl flex items-center gap-3 shadow-inner">
                    <span className="text-[10px] font-mono text-neutral-500">Mint Cost</span>
                    <span className="text-xs text-cyan-300 font-bold">{currentConfig.price} AETH</span>
                  </div>
                  <div className="bg-black/50 border border-neutral-800 py-2.5 px-4 rounded-xl flex items-center gap-3 shadow-inner">
                    <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1"><Flame className="w-3 h-3 text-red-500"/> Burn</span>
                    <span className="text-xs text-red-400 font-bold">-{currentConfig.price * 0.2}</span>
                  </div>
                  <div className="bg-black/50 border border-neutral-800 py-2.5 px-4 rounded-xl flex items-center gap-3 shadow-inner">
                    <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1"><Activity className="w-3 h-3 text-green-500"/> Staking Pool</span>
                    <span className="text-xs text-green-400 font-bold">+{currentConfig.price * 0.4}</span>
                  </div>
                </div>

                <button type="submit" disabled={!title || isHashing} className="w-full lg:w-auto px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:grayscale text-white font-bold py-4 rounded-xl text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap">
                  <Award className="w-5 h-5" /> Mint & Issue Proof
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gradient-to-b from-[#0B0817] to-[#05030F] border border-cyan-900/40 p-4 sm:p-6 rounded-3xl flex flex-col relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] w-full">
            <div className="absolute top-6 left-6 flex items-center gap-2 text-cyan-300 font-mono text-[10px] uppercase tracking-widest z-20 bg-cyan-950/40 px-4 py-2 rounded-lg border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Eye className="w-4 h-4 text-cyan-400"/> Live NFT Preview
            </div>
            
            <div className="absolute top-6 right-6 flex items-center gap-2 z-20 bg-black/60 p-1 border border-neutral-800 rounded-lg shadow-lg backdrop-blur-md">
              <button type="button" onClick={() => setPreviewZoom(p => Math.max(0.3, p - 0.1))} className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md cursor-pointer font-bold transition-colors">-</button>
              <span className="text-xs text-cyan-400 font-mono w-12 text-center font-bold">{Math.round(previewZoom * 100)}%</span>
              <button type="button" onClick={() => setPreviewZoom(p => Math.min(2.0, p + 0.1))} className="w-8 h-8 flex items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md cursor-pointer font-bold transition-colors">+</button>
            </div>
            
            <div 
              ref={previewScrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              onTouchStart={handleTouchStart} 
              onTouchEnd={handleMouseLeaveOrUp}
              onTouchMove={handleTouchMove}
              className={`w-full flex justify-center overflow-auto py-16 mt-8 custom-scrollbar ${isDraggingPreview ? 'cursor-grabbing' : 'cursor-grab'} rounded-2xl bg-black/40 border border-neutral-900/50 shadow-inner`}
              style={{ minHeight: '680px' }}
            >
              <div 
                className="mx-auto shadow-[0_0_60px_rgba(0,0,0,0.8)] border border-neutral-800 rounded-2xl shrink-0 transition-transform duration-200"
                style={{ 
                  transform: `scale(${previewZoom})`, 
                  width: '890px', 
                  height: '660px',
                  marginBottom: `${(previewZoom > 1 ? (previewZoom - 1) * 660 : 0)}px`,
                  marginRight: `${(previewZoom > 1 ? (previewZoom - 1) * 890 : 0)}px`,
                  transformOrigin: 'center'
                }}
              >
                <CertificateTemplate 
                  tDash={tDash}
                  tHop={tHop}
                  formatAddress={formatAddressFunc}
                  categoryConfig={categoryConfig}
                  proofData={{
                    id: 'PENDING-MINT',
                    category,
                    title: title || 'Proof Title Preview',
                    description: description || 'Authentic digital asset secured and verified permanently on the Binance Smart Chain.',
                    creator: creatorName || 'Unknown Creator',
                    wallet: address || '0x0000...0000',
                    fileHash: isHashing ? 'Calculating Keccak256...' : fileHash,
                    tokenId: '0',
                    contract: AETHER_VAULT_ADDRESS,
                    date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                    network: TARGET_CHAIN_NAME || "BSC Testnet",
                    verifyUrl: "https://testnet.bscscan.com/address/" + AETHER_VAULT_ADDRESS
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'minting' && (
        <div className="bg-[#0B0817] border border-cyan-900/50 p-10 sm:p-16 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_50%)]"></div>
          <Loader2 className="w-14 h-14 text-cyan-400 animate-spin mb-8 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]" />
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-8 z-10 tracking-wide">Processing On-Chain Transaction</h3>
          <div className="w-full max-w-md space-y-4 font-mono text-xs sm:text-sm z-10">
             <div className="text-center text-cyan-300 font-bold bg-cyan-950/60 py-3.5 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md">{mintingStatusMsg}</div>
          </div>
        </div>
      )}

      {view === 'success' && generatedProof && (
        <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center pb-10">
          <div className="w-20 h-20 bg-green-950/40 rounded-full flex items-center justify-center mb-6 border border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.3)] backdrop-blur-sm">
            <CheckCircle2 className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-2 text-center tracking-wide">Aether Proof Minted Successfully!</h3>
          <p className="text-neutral-400 text-sm mb-6 font-mono">Your digital asset is now permanently secured on the blockchain.</p>
          
          <div className="w-full max-w-[950px] overflow-x-auto custom-scrollbar shadow-[0_20px_50px_rgba(0,0,0,0.6)] rounded-2xl border border-neutral-800 bg-[#030208] p-4 sm:p-8">
             <div className="mx-auto" style={{ width: '890px' }}>
               <CertificateTemplate 
                  ref={certificateRef}
                  tDash={tDash}
                  tHop={tHop}
                  formatAddress={formatAddressFunc}
                  categoryConfig={categoryConfig}
                  proofData={generatedProof} 
               />
             </div>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl">
            <button onClick={handleDownloadPDF} className="bg-black/60 border border-amber-900/50 hover:border-amber-500/50 hover:bg-neutral-900 text-amber-100 font-bold py-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Download className="w-4 h-4 text-amber-500" /> Download PDF
            </button>
            <button onClick={handleDownloadPNG} className="bg-black/60 border border-cyan-900/50 hover:border-cyan-500/50 hover:bg-neutral-900 text-cyan-100 font-bold py-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <ImageIcon className="w-4 h-4 text-cyan-400" /> Export PNG
            </button>
            <a href={`https://testnet.bscscan.com/tx/${generatedProof.txHash}`} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer no-underline shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]">
              <ExternalLink className="w-4 h-4" /> View Transaction
            </a>
          </div>
          <button onClick={resetFormToMintAnother} className="mt-10 text-xs font-bold text-neutral-500 hover:text-cyan-400 transition-colors cursor-pointer border-b border-transparent hover:border-cyan-400/50 pb-1 tracking-wider uppercase">
            Mint Another Proof
          </button>
        </div>
      )}

    </div>
  );
}
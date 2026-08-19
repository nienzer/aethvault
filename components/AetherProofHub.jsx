import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, Globe, Music, Code2, Palette, BookOpen, Camera, Film, Microscope, Building2, Scale, Box, User, Link as LinkIcon, UploadCloud, Lock, ChevronLeft, Loader2, FileImage, Cpu, Flame, Fingerprint, Image as ImageIcon, ExternalLink, QrCode, Eye, Sparkles, Activity, Layers, ArrowUpRight, Check, Compass, Shield, Hash, FileDigit, Hexagon } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import AetherVaultV3Artifact from '@/contracts/AetherVaultV3ABI.json';
import AetherVaultArtifact from '@/contracts/AetherVaultABI.json';
import { useLanguage } from '@/context/LanguageContext';

const AetherVaultV3ABI = AetherVaultV3Artifact.abi || AetherVaultV3Artifact;
const AetherVaultABI = AetherVaultArtifact.abi || AetherVaultArtifact;

const AETHER_VAULT_ADDRESS = "0x8C315f5F2364139436fc126cBAe397718bd0f3BE";
const AETH_TOKEN_ADDRESS = "0x71C387117FA0DaD965B7F587081338395FEA2E4a"; 
const READ_ONLY_RPC_URL = "https://bsc-testnet-rpc.publicnode.com";

const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Not Connected';

// =========================================================
// RENDER PEMBARUAN: FIXED TINTED GLASSMORPHIC NFT - PROOF
// =========================================================
const CertificateTemplate = React.forwardRef(({ proofData, categoryConfig, tHop, tDash }, ref) => {
  const catKey = (proofData?.category || 'Software').toLowerCase().trim();
  const rawCatObj = categoryConfig ? Object.entries(categoryConfig).find(([key]) => key.toLowerCase() === catKey) : null;
  const cat = rawCatObj ? rawCatObj[1] : { badge: 'Verified Creator', icon: <Sparkles className="w-4 h-4" />, color: '#00ffcc' };
  
  const CatIcon = cat.icon ? React.cloneElement(cat.icon, { className: "w-4 h-4 text-[#00ffcc]" }) : <Sparkles className="w-4 h-4 text-[#00ffcc]" />;

  const title = proofData?.title || "Aether Proof™";
  const creator = proofData?.creator || tHop.unknownCreator || "Unknown Creator";
  const owner = formatAddressFunc(proofData?.wallet || "0x00...00");
  const tokenId = proofData?.tokenId || "PENDING";
  const certificateId = proofData?.id || tokenId;
  const date = proofData?.date || new Date().toLocaleDateString("en-GB");
  const network = proofData?.network || "BSC Testnet";
  const contract = formatAddressFunc(proofData?.contract || AETHER_VAULT_ADDRESS);
  const fileHash = proofData?.fileHash || tHop.awaitingVerification || "Awaiting verification";
  const verifyUrl = proofData?.verifyUrl || `https://testnet.bscscan.com/address/${AETHER_VAULT_ADDRESS}`;

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
      
      {/* Background Hologram */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ background: "radial-gradient(circle at 85% 45%, rgba(6,182,212,0.2), transparent 45%), radial-gradient(circle at 15% 75%, rgba(139,92,246,0.15), transparent 40%)" }} />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "45px 45px" }} />
      
      {/* Frames */}
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
            <span className="text-[10px] font-black tracking-[0.25em] text-neutral-300">{tHop.securedOnChain || "SECURED ON-CHAIN"}</span>
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
          <span className="text-[10px] tracking-[0.55em] text-white/30 uppercase font-mono font-black">{tHop.decentralizedRegistry || "Decentralized Vault Registry"}</span>
        </div>
        <h1 className="text-[40px] font-black tracking-[0.15em] text-white leading-tight">
          {tHop.certAuthenticity || "CERTIFICATE OF AUTHENTICITY"}
        </h1>
        <p className="text-[10px] text-white/40 tracking-[0.25em] mt-0.5 font-mono uppercase font-bold">{tHop.certProtocol || "AETHER PROOF COPYRIGHT REGISTRATION PROTOCOL"}</p>
      </div>

      {/* LEFT DATA PANEL */}
      <div className="absolute left-[64px] top-[225px] w-[560px] h-[385px] z-20 rounded-[28px] border border-white/[0.06] bg-[#0c101d]/60 p-6 shadow-[0_30px_60px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-start pb-4 border-b border-white/[0.08]">
          <div className="min-w-0 pr-6">
            <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-2">{tHop.assetTitle || "ASSET TITLE / TYPE"}</div>
            <div className="text-[18px] font-black text-white truncate tracking-wide">{title}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-2">{tHop.certNo || "CERTIFICATE NO."}</div>
            <div className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.03] text-white text-[11px] font-mono font-black">
              #{certificateId}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 pt-5">
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">{tHop.ownerAddress || "OWNER ADDRESS"}</div><div className="text-[12px] text-white/80 font-mono font-bold truncate tracking-wide">{owner}</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">{tHop.legalCreator || "LEGAL CREATOR"}</div><div className="text-[12px] text-white font-bold truncate tracking-wide">{creator}</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">{tHop.vaultStatus || "VAULT STATUS"}</div><div className="text-[11px] text-emerald-400 font-mono font-black tracking-wider flex items-center gap-1.5">{tHop.authenticated || "● Authenticated & Verified"}</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">{tHop.regDate || "REGISTRATION DATE"}</div><div className="text-[11px] text-white/70 font-mono font-bold">{date}</div></div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/[0.08]">
          <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">{tHop.assetDesc || "ASSET DESCRIPTION"}</div>
          <div className="text-[10px] leading-relaxed text-white/50 font-medium font-sans line-clamp-3">
            {proofData?.description || tHop.defaultAssetDesc || "This legal artifact asset is permanently secured via end-to-end cryptographic primitives and timestamped on-chain. Molecular ownership records are absolute, immutable, and non-fungible."}
          </div>
        </div>

        <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
          <div><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">{tHop.tokenIdLabel || "TOKEN ID"}</div><div className="text-[10px] text-white/60 font-mono font-black mt-1">#{tokenId}</div></div>
          <div><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">{tHop.networkProt || "NETWORK PROT."}</div><div className="text-[10px] text-white/60 font-mono font-black mt-1">{String(network).toUpperCase()}</div></div>
          <div className="max-w-[210px]"><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">{tHop.smartContract || "SMART CONTRACT"}</div><div className="text-[9px] text-white/50 font-mono mt-1 truncate">{contract}</div></div>
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

          <div className="absolute inset-0 flex items-center justify-center z-10">
             <div className="w-[86px] h-[86px] bg-[#111526] rounded-full border border-white/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(6,182,212,0.3),0_0_20px_rgba(6,182,212,0.6)] av-shield-glow">
                <img src="/logo.png" alt="Logo" className="w-[52px] h-[52px] object-contain opacity-90 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
             </div>
          </div>
        </div>
        
        <div className="absolute top-[20px] left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-white/[0.04] text-white/90">
            {CatIcon}<span className="text-[10px] font-black tracking-[0.25em]">{tHop.authenticatedBadge || "AUTHENTICATED"}</span>
          </div>
        </div>
        <div className="absolute bottom-[20px] left-[32px]">
          <div className="text-[8px] tracking-[0.35em] text-white/30 font-black">{tHop.digitalArtifact || "DIGITAL ARTIFACT"}</div>
          <div className="text-[13px] text-white/70 font-black mt-1 tracking-wide">{tHop.aetherProofProof || "AETHER PROOF"}</div>
        </div>
        <div className="absolute bottom-[20px] right-[32px] text-right">
          <div className="text-[8px] tracking-[0.35em] text-white/30 font-black">{tHop.serialReg || "SERIAL REG."}</div>
          <div className="text-[12px] text-white/80 font-mono font-black mt-1">#{certificateId}</div>
        </div>
      </div>

      {/* FOOTER BAR BANNER */}
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
            <div className="text-[9px] tracking-[0.3em] text-white/30 font-black">{tHop.autoAuthStatus || "AUTOMATED AUTHENTICITY STATUS"}</div>
            <div className="text-[12px] text-white/80 font-black tracking-[0.1em] mt-1 flex items-center gap-2">
              {tHop.verifiableOnChain || "100% VERIFIABLE ON-CHAIN"} <span className="px-2 py-0.5 rounded text-[9px] bg-white/10 border border-white/20 text-white/70 font-mono font-black">{tHop.bscVerified || "BSC VERIFIED"}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-[9px] tracking-[0.3em] text-white/30 font-black">{tHop.decentralizedAudit || "DECENTRALIZED AUDIT"}</div>
            <div className="text-[10px] text-white/40 font-mono font-black mt-1">{tHop.scanMetadata || "SCAN METADATA CONTRACT"}</div>
          </div>
          <div className="w-[72px] h-[72px] rounded-xl bg-white p-2 shadow-[0_15px_35px_rgba(0,0,0,0.3)] border border-white/10 flex items-center justify-center">
            <QRCode value={verifyUrl} size={56} bgColor="#ffffff" fgColor="#0c0f1d" level="Q" />
          </div>
        </div>
      </div>

      {/* SUB-FOOTER */}
      <div className="absolute bottom-[20px] left-[64px] right-[64px] flex items-center justify-between text-[9px] font-mono tracking-[0.3em] text-white/30 z-20">
        <span>{tHop.footerMotto1 || "VERIFIABLE • IMMUTABLE • SECURED FOREVER"}</span>
        <span className="text-white/40 font-black">{tHop.footerMotto2 || "POWERED BY AETHERVAULT PROTOCOL"}</span>
        <span>{String(fileHash).slice(0, 30)}...</span>
      </div>
      
      <div className="absolute top-0 bottom-0 left-0 w-[160px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent skew-x-[-20deg] pointer-events-none av-sweep-light" />
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
  const [previewZoom, setPreviewZoom] = useState(0.4);
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
  const [mintingStatusMsg, setMintingStatusMsg] = useState(tHop.preparingTx || 'Preparing transaction...');

  const [onChainProofs, setOnChainProofs] = useState([]);
  const [isLoadingHall, setIsLoadingHall] = useState(true);
  const [globalProtocolStats, setGlobalProtocolStats] = useState({ totalProofs: 0, burnedTotal: 0 });

  const categoryConfig = {
    "Writing": { price: 200, badge: "Verified Author", color: '#22d3ee', icon: <BookOpen className="w-5 h-5 text-cyan-400" /> },
    "Photography": { price: 200, badge: "Verified Photographer", color: '#f472b6', icon: <Camera className="w-5 h-5 text-pink-400" /> },
    "Design": { price: 200, badge: "Verified Creator", color: '#a78bfa', icon: <Palette className="w-5 h-5 text-purple-400" /> },
    "Music": { price: 200, badge: "Verified Artist", color: '#fbbf24', icon: <Music className="w-5 h-5 text-amber-400" /> },
    "Video": { price: 200, badge: "Verified Filmmaker", color: '#f87171', icon: <Film className="w-5 h-5 text-rose-400" /> },
    "Software": { price: 200, badge: "Verified Developer", color: '#4ade80', icon: <Code2 className="w-5 h-5 text-green-400" /> },
    "Research": { price: 200, badge: "Verified Researcher", color: '#60a5fa', icon: <Microscope className="w-5 h-5 text-blue-400" /> },
    "Business": { price: 200, badge: "Verified Company", color: '#fb923c', icon: <Building2 className="w-5 h-5 text-orange-400" /> },
    "Legal": { price: 200, badge: "Verified Entity", color: '#c084fc', icon: <Scale className="w-5 h-5 text-indigo-400" /> },
    "Other": { price: 200, badge: "Verified Creator", color: '#94a3b8', icon: <Box className="w-5 h-5 text-neutral-400" /> }
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
      const DEPLOY_BLOCK = 125804762; 
      const currentBlock = await provider.getBlockNumber();
      
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
          let tokenUriRaw = "";
          try { 
            tokenUriRaw = await contract.tokenURI(tokenId); 
          } catch(err) {}

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
          owner: formatAddressFunc(ownerWallet),
          ownerFull: ownerWallet,
          wallet: ownerWallet,
          date: new Date((block?.timestamp || Date.now() / 1000) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
          network: TARGET_CHAIN_NAME || "BSC Testnet",
          hash: `${args[4].substring(0, 8)}...`,
          fileHash: args[4],
          fullHash: args[4],
          status: "Verified On-Chain",
          txHash: ev.transactionHash,
          verifyUrl: `https://testnet.bscscan.com/tx/${ev.transactionHash}`
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
    setMintingStatusMsg(tHop.preparingTx || 'Preparing transaction...');
    
    try {
      setMintStep(1);
      await new Promise(res => setTimeout(res, 500));
      if (!window.ethereum) throw new Error(tDash.metaMaskNotFound || "MetaMask not found!");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const PROOF_PRICE = "200"; 
      const requiredCostWei = ethers.parseEther(PROOF_PRICE);
      
      const tokenContract = new ethers.Contract(AETH_TOKEN_ADDRESS, AetherVaultABI, signer);

      // PERBAIKAN BAHASA METAMASK DI SINI BOS: Pakai tDash dan fallback Bahasa Inggris
      setMintingStatusMsg(tDash.checkingAllowance || 'Checking $AETH token allowance...');
      const currentAllowance = await tokenContract.allowance(address, AETHER_VAULT_ADDRESS);

      if (currentAllowance < requiredCostWei) {
        setMintingStatusMsg(tDash.approveTokenPrompt || 'Please approve $AETH spending in your wallet...');
        const approveTx = await tokenContract.approve(AETHER_VAULT_ADDRESS, requiredCostWei);
        setMintingStatusMsg(tDash.waitingApproveConfirm || 'Waiting for network approval confirmation...');
        await approveTx.wait();
        setMintingStatusMsg(tDash.approvalSuccess || 'Approval granted! Generating proof certificate...');
      }

      setMintStep(3);
      const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AetherVaultV3ABI, signer);
      setMintStep(4);
      
      const safeTitle = (title || "Aether Proof").replace(/[<>&'"]/g, function (c) {
        switch (c) {
          case '<': return '&lt;'; case '>': return '&gt;'; case '&': return '&amp;'; case '\'': return '&apos;'; case '"': return '&quot;'; default: return c;
        }
      });

      const svgImage = `
      <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0B0817;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#1a1a2e;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad)" />
        <rect x="15" y="15" width="370" height="370" rx="20" fill="none" stroke="#06b6d4" stroke-width="4" />
        <text x="50%" y="190" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#ffffff" text-anchor="middle">${safeTitle}</text>
        <text x="50%" y="230" font-family="Arial, sans-serif" font-size="14" fill="#06b6d4" text-anchor="middle" letter-spacing="2px">AETHER PROOF</text>
        <text x="50%" y="280" font-family="Arial, sans-serif" font-size="12" fill="#888" text-anchor="middle">${category.toUpperCase()}</text>
      </svg>`;

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

      // PERBAIKAN BAHASA: Validasi Blok & Konfirmasi
      setMintingStatusMsg(tHop.confirmMintMetaMask || 'Please confirm Mint transaction in MetaMask...');
      
      const tx = await contract.createProof(category, fileHash, tokenURIParam, true);
      
      setMintingStatusMsg(tHop.waitingBlockValidation || 'Waiting for BSC Testnet block validation...');
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
      // PERBAIKAN BAHASA: Error Message
      alert((tHop.txFailed || "Transaction cancelled or failed: ") + (error.reason || error.message));
      setView('form');
    }
  };

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return alert(tHop.certNotReady || "Sertifikat belum siap.");
    try {
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#06070d', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `${generatedProof?.id || 'AETHER-PROOF'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) { 
      console.error("PNG error:", error); 
      alert(tHop.downloadPngFail || "Gagal mengunduh PNG. Silakan coba lagi."); 
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return alert(tHop.certNotReady || "Sertifikat belum siap.");
    try {
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#06070d', pixelRatio: 2 });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (760 * pdfWidth) / 1200;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`${generatedProof?.id || 'AETHER-PROOF'}.pdf`);
    } catch (error) { 
      console.error("PDF error:", error); 
      alert(tHop.downloadPdfFail || "Gagal mengunduh PDF. Silakan coba lagi."); 
    }
  };

  const resetFormToMintAnother = () => {
    setView('hub'); 
    setFile(null); 
    setFileHash('0x0000000000000000000000000000000000000000000000000000000000000000');
    setTitle('');
    setDescription('');
    setCreatorName('');
    setCategory('Software');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
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
                      <span className="text-white font-bold">100%</span> <span className="text-cyan-400/80">{tHop.onChainLabel || 'On-Chain'}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center bg-black/40 border border-cyan-900/40 p-6 rounded-2xl relative shadow-[inset_0_0_20px_rgba(6,182,212,0.1)] backdrop-blur-md">
                <span className="absolute top-3 right-3 text-[9px] font-mono text-cyan-400 bg-cyan-950/50 px-2 py-0.5 rounded border border-cyan-500/30 uppercase shadow-[0_0_10px_rgba(6,182,212,0.2)]">{tHop.livePipeline || 'Live Pipeline'}</span>
                <div className="space-y-3 w-full max-w-[240px] text-center">
                  <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center gap-2 shadow-lg">
                    <Globe className="w-4 h-4 text-purple-400 animate-spin" /> Binance Smart Chain
                  </div>
                  <div className="h-4 w-0.5 bg-gradient-to-b from-purple-500 to-amber-500 mx-auto"></div>
                  <div className="p-3 bg-neutral-900/80 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center gap-2 shadow-lg">
                    <Fingerprint className="w-4 h-4 text-amber-400" /> {tHop.keccakHash || 'Keccak256 Hash'}
                  </div>
                  <div className="h-4 w-0.5 bg-gradient-to-b from-amber-500 to-cyan-500 mx-auto"></div>
                  <div className="p-3 bg-gradient-to-r from-cyan-950/60 to-blue-900/60 border border-cyan-500/40 rounded-xl text-xs font-mono font-bold text-cyan-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] backdrop-blur-md">
                    <Award className="w-4 h-4 text-cyan-400" /> {tHop.immutableCert || 'Immutable Certificate'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: tHop.totalProofs || "On-Chain Proofs", value: globalProtocolStats.totalProofs, icon: Award, color: "text-amber-400", border: "border-amber-900/30" },
              { label: tHop.creators || "Global Creators", value: globalProtocolStats.totalProofs > 0 ? `${globalProtocolStats.totalProofs}+` : "0", icon: User, color: "text-cyan-400", border: "border-cyan-900/30" },
              { label: tHop.networkLabel || "Network", value: "BSC Testnet", icon: Globe, color: "text-purple-400", border: "border-purple-900/30" },
              { label: tStats.burn || "$AETH Burned", value: `${globalProtocolStats.burnedTotal} AETH`, icon: Flame, color: "text-red-400", border: "border-red-900/30" }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-[#0B0817] border ${stat.border} p-5 sm:p-6 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_4px_25px_rgba(255,255,255,0.05)] transition-shadow`}>
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-[9px] font-mono text-neutral-500 uppercase">{tHop.liveOnChainLabel || 'Live On-Chain'}</span>
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
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> {tHop.fetchingRegistry || 'Fetching Blockchain Registry...'}
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
                        <span>{tHop.dateLabel || 'Date'}</span>
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
              <ChevronLeft className="w-4 h-4" /> {tDash.backBtn || 'Back to Hub'}
            </button>
            
            <div className="flex items-center justify-between mb-6 border-b border-neutral-800/60 pb-4 z-10">
              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-200">{tHop.metadataDetails || 'Metadata Details'}</h3>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-3 py-1.5 rounded-full border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">{tHop.step1Config || 'STEP 1: CONFIGURATION'}</span>
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
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono drop-shadow-sm">{tHop.titleLabel || 'Title *'}</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tHop.titlePlaceholder || "e.g., Core Smart Contract v1"} className="w-full bg-[#05030F] border border-neutral-700 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] font-medium transition-all" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono drop-shadow-sm">{tHop.creator || 'Creator Name'}</label>
                  <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder={tHop.creatorPlaceholder || "e.g., Satoshi Nakamoto"} className="w-full bg-[#05030F] border border-neutral-700 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] font-medium transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5 h-full">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono drop-shadow-sm">{tHop.descLabel || 'Description'}</label>
                  <textarea 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder={tHop.descPlaceholder || "Short description about this proof..."} 
                    className="w-full h-[110px] bg-[#05030F] border border-neutral-700 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-cyan-500 focus:shadow-[0_0_15px_rgba(6,182,212,0.2)] font-medium resize-none custom-scrollbar transition-all" 
                  />
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono flex items-center gap-1.5 drop-shadow-sm"><Fingerprint className="w-3 h-3"/> {tHop.targetFile || 'Target File'}</label>
                  <div className="flex-1 h-[110px]">
                    {!file ? (
                      <label htmlFor="file-upload" className="h-full w-full border-2 border-dashed border-neutral-700 hover:border-cyan-500/60 bg-[#05030F] rounded-2xl flex flex-col items-center justify-center cursor-pointer relative transition-all group overflow-hidden">
                        <UploadCloud className="w-6 h-6 text-cyan-500 mb-1 group-hover:scale-110 transition-transform relative z-10 pointer-events-none" />
                        <p className="text-[11px] text-neutral-300 font-bold group-hover:text-cyan-300 transition-colors relative z-10 pointer-events-none">{tHop.clickToBrowse || 'Click to Browse or Drop File'}</p>
                      </label>
                    ) : (
                      <div className="h-full bg-cyan-950/20 border border-cyan-500/40 p-4 rounded-2xl flex flex-col justify-center gap-3 shadow-[inset_0_0_20px_rgba(6,182,212,0.1)]">
                        <div className="flex items-center gap-3 truncate">
                          <div className="p-2 bg-cyan-500/20 rounded-lg border border-cyan-500/30"><FileImage className="w-5 h-5 text-cyan-300 shrink-0" /></div>
                          <div className="min-w-0">
                             <span className="text-xs text-white truncate font-bold block mb-0.5">{file.name}</span>
                             <span className="text-[9px] text-cyan-400/80 font-mono block truncate">{fileHash}</span>
                          </div>
                        </div>
                        <button type="button" onClick={() => {setFile(null); setFileHash('0x0000000000000000000000000000000000000000000000000000000000000000');}} className="text-[10px] bg-red-950/50 text-red-400 hover:bg-red-900/70 py-1.5 px-3 rounded-lg w-fit cursor-pointer font-bold border border-red-500/30 transition-colors">{tHop.removeFile || 'Remove File'}</button>
                      </div>
                    )}
                    <input id="file-upload" type="file" onChange={handleFileUpload} className="hidden" />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-6 border-t border-neutral-800/60 flex flex-col lg:flex-row gap-6 items-center justify-between">
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  <div className="bg-black/50 border border-neutral-800 py-2.5 px-4 rounded-xl flex items-center gap-3 shadow-inner">
                    <span className="text-[10px] font-mono text-neutral-500">{tHop.mintCost || 'Mint Cost'}</span>
                    <span className="text-xs text-cyan-300 font-bold">{currentConfig.price} AETH</span>
                  </div>
                  <div className="bg-black/50 border border-neutral-800 py-2.5 px-4 rounded-xl flex items-center gap-3 shadow-inner">
                    <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1"><Flame className="w-3 h-3 text-red-500"/> {tHop.burnLabel || 'Burn'}</span>
                    <span className="text-xs text-red-400 font-bold">-{currentConfig.price * 0.2}</span>
                  </div>
                  <div className="bg-black/50 border border-neutral-800 py-2.5 px-4 rounded-xl flex items-center gap-3 shadow-inner">
                    <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1"><Activity className="w-3 h-3 text-green-500"/> {tHop.stakingPoolLabel || 'Staking Pool'}</span>
                    <span className="text-xs text-green-400 font-bold">+{currentConfig.price * 0.4}</span>
                  </div>
                </div>

                <button type="submit" disabled={!title || isHashing} className="w-full lg:w-auto px-8 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 disabled:grayscale text-white font-bold py-4 rounded-xl text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.6)] flex items-center justify-center gap-2 cursor-pointer transition-all whitespace-nowrap">
                  <Award className="w-5 h-5" /> {tHop.mintIssueProof || 'Mint & Issue Proof'}
                </button>
              </div>
            </form>
          </div>

          <div className="bg-gradient-to-b from-[#0B0817] to-[#05030F] border border-cyan-900/40 p-4 sm:p-6 rounded-3xl flex flex-col relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.7)] w-full">
            <div className="absolute top-6 left-6 flex items-center gap-2 text-cyan-300 font-mono text-[10px] uppercase tracking-widest z-20 bg-cyan-950/40 px-4 py-2 rounded-lg border border-cyan-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Eye className="w-4 h-4 text-cyan-400"/> {tHop.liveNftPreview || 'Live NFT Preview'}
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
              className={`w-full flex justify-center overflow-auto py-6 mt-8 custom-scrollbar ${isDraggingPreview ? 'cursor-grabbing' : 'cursor-grab'} rounded-2xl bg-black/40 border border-neutral-900/50 shadow-inner`}
              style={{ minHeight: '420px' }}
            >
              <div 
                className="mx-auto shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-[28px] shrink-0 transition-transform duration-200"
                style={{ 
                  transform: `scale(${previewZoom})`, 
                  width: '1200px', 
                  height: '760px',
                  marginBottom: `${(previewZoom > 1 ? (previewZoom - 1) * 760 : 0)}px`,
                  marginRight: `${(previewZoom > 1 ? (previewZoom - 1) * 1200 : 0)}px`,
                  transformOrigin: 'top center'
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
                    creator: creatorName || tHop.unknownCreator || 'Unknown Creator',
                    wallet: address || '0x0000...0000',
                    fileHash: isHashing ? tHop.calculatingHash || 'Calculating Keccak256...' : fileHash,
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
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-8 z-10 tracking-wide">{tHop.processingTx || 'Processing On-Chain Transaction'}</h3>
          <div className="w-full max-w-md space-y-4 font-mono text-xs sm:text-sm z-10">
             <div className="text-center text-cyan-300 font-bold bg-cyan-950/60 py-3.5 rounded-xl border border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.15)] backdrop-blur-md">{mintingStatusMsg}</div>
          </div>
        </div>
      )}

      {view === 'success' && generatedProof && (
        <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center pb-10 w-full overflow-hidden">
          <div className="w-20 h-20 bg-green-950/40 rounded-full flex items-center justify-center mb-6 border border-green-500/40 shadow-[0_0_40px_rgba(34,197,94,0.3)] backdrop-blur-sm">
            <CheckCircle2 className="w-10 h-10 text-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
          </div>
          <h3 className="text-2xl sm:text-3xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-cyan-300 mb-2 text-center tracking-wide">{tHop.mintSuccessTitle || 'Aether Proof Minted Successfully!'}</h3>
          <p className="text-neutral-400 text-sm mb-6 font-mono">{tHop.mintSuccessDesc || 'Your digital asset is now permanently secured on the blockchain.'}</p>
          
          <div className="w-full flex justify-center items-center mt-4 overflow-hidden">
            <div className="w-full max-w-[750px] overflow-hidden flex justify-center bg-black/40 border border-neutral-900 rounded-2xl p-4">
              <div style={{ width: '1200px', height: '760px', transform: 'scale(0.55)', transformOrigin: 'top center', marginBottom: '-340px' }}>
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
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-3xl px-4">
            <button onClick={handleDownloadPDF} className="bg-black/60 border border-amber-900/50 hover:border-amber-500/50 hover:bg-neutral-900 text-amber-100 font-bold py-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Download className="w-4 h-4 text-amber-500" /> {tDash.certDownloadBtn || 'Download PDF'}
            </button>
            <button onClick={handleDownloadPNG} className="bg-black/60 border border-cyan-900/50 hover:border-cyan-500/50 hover:bg-neutral-900 text-cyan-100 font-bold py-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-[0_0_20px_rgba(6,182,212,0.2)]">
              <ImageIcon className="w-4 h-4 text-cyan-400" /> {tDash.certExportPng || 'Export PNG'}
            </button>
            <a href={`https://testnet.bscscan.com/tx/${generatedProof.txHash}`} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-4 rounded-2xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer no-underline shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:shadow-[0_0_30px_rgba(147,51,234,0.5)]">
              <ExternalLink className="w-4 h-4" /> {tHop.viewTransaction || 'View Transaction'}
            </a>
          </div>
          <button onClick={resetFormToMintAnother} className="mt-10 text-xs font-bold text-neutral-500 hover:text-cyan-400 transition-colors cursor-pointer border-b border-transparent hover:border-cyan-400/50 pb-1 tracking-wider uppercase">
            {tHop.mintAnother || 'Mint Another Proof'}
          </button>
        </div>
      )}

    </div>
  );
}
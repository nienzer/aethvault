import React, { useRef } from 'react';
import {
  X,
  Download,
  Image as ImageIcon,
  ShieldCheck,
  Fingerprint,
  Sparkles,
  Lock,
  Globe,
  PenTool,
  Camera,
  Palette,
  Music,
  Film,
  Code2,
  FlaskConical,
  Building2,
  Scale,
  Hash,
  FileDigit,
  Cpu,
  Hexagon
} from 'lucide-react';

import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLanguage } from '@/context/LanguageContext';

export default function CertificateModal({
  selectedCertificate,
  setSelectedCertificate,
  TARGET_CHAIN_NAME,
  showToast
}) {
  const { t: globalT } = useLanguage();
  const t = globalT.dashboard || {};

  const certificateRef = useRef(null);

  if (!selectedCertificate) return null;

  const isProof = Boolean(
    selectedCertificate.title ||
    (
      selectedCertificate.proofHash &&
      selectedCertificate.proofHash !== 'Encrypted On-Chain'
    )
  );

  const AETHER_LOGO = '/logo.png';

  // =========================================================
  // CATEGORY CONFIG (IKON & WARNA TEMA DINAMIS)
  // =========================================================
  const categoryConfig = {
    writing: { icon: PenTool, label: 'Verified Author', badgeLabel: 'WRITING', color: '#22d3ee', bg: 'rgba(34,211,238,0.12)', border: 'rgba(34,211,238,0.35)' },
    photography: { icon: Camera, label: 'Verified Photographer', badgeLabel: 'PHOTOGRAPHY', color: '#f472b6', bg: 'rgba(244,114,182,0.12)', border: 'rgba(244,114,182,0.35)' },
    design: { icon: Palette, label: 'Verified Creator', badgeLabel: 'DESIGN', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.35)' },
    music: { icon: Music, label: 'Verified Artist', badgeLabel: 'MUSIC', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
    video: { icon: Film, label: 'Verified Filmmaker', badgeLabel: 'VIDEO', color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)' },
    software: { icon: Code2, label: 'Verified Developer', badgeLabel: 'SOFTWARE', color: '#4ade80', bg: 'rgba(74,222,128,0.12)', border: 'rgba(74,222,128,0.35)' },
    research: { icon: FlaskConical, label: 'Verified Researcher', badgeLabel: 'RESEARCH', color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.35)' },
    business: { icon: Building2, label: 'Verified Company', badgeLabel: 'BUSINESS', color: '#fb923c', bg: 'rgba(251,146,60,0.12)', border: 'rgba(251,146,60,0.35)' },
    legal: { icon: Scale, label: 'Verified Entity', badgeLabel: 'LEGAL', color: '#c084fc', bg: 'rgba(192,132,252,0.12)', border: 'rgba(192,132,252,0.35)' },
    other: { icon: Sparkles, label: 'Verified Creator', badgeLabel: 'AUTHENTIC', color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.35)' }
  };

  const catKey = (selectedCertificate.category || 'other').toLowerCase().trim();
  const cat = categoryConfig[catKey] || categoryConfig.other;
  const CatIcon = cat.icon ? React.cloneElement(cat.icon, { className: "w-4 h-4", style: { color: cat.color } }) : <Sparkles className="w-4 h-4" style={{ color: cat.color }} />;

  // =========================================================
  // FUNGSI UNDUH AMAN (ANTI-JEBOL UKURAN)
  // =========================================================
  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      showToast(t.certGenPng || 'Generating PNG...', 'info');
      const bgColor = isProof ? '#05030F' : '#fdfbf7';
      const targetWidth = isProof ? 890 : 842;
      const targetHeight = isProof ? 620 : 595;

      const canvas = await html2canvas(certificateRef.current, { 
        scale: 3, 
        useCORS: true, 
        backgroundColor: bgColor,
        width: targetWidth,
        height: targetHeight,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('cert-export-node');
          if (el) {
            el.style.transform = 'none';
            el.style.width = targetWidth + 'px';
            el.style.height = targetHeight + 'px';
            el.style.margin = '0';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `AETHER-${isProof ? 'PROOF' : 'CERT'}-${selectedCertificate.capsuleId}.png`;
      link.click();
    } catch (error) {
      console.error(error);
      showToast(t.certPngFail || 'PNG generation failed', 'error');
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      showToast(t.certPreparing || 'Preparing PDF...', 'info');
      const bgColor = isProof ? '#05030F' : '#fdfbf7';
      const targetWidth = isProof ? 890 : 842;
      const targetHeight = isProof ? 620 : 595;

      const canvas = await html2canvas(certificateRef.current, { 
        scale: 3, 
        useCORS: true, 
        backgroundColor: bgColor,
        width: targetWidth,
        height: targetHeight,
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('cert-export-node');
          if (el) {
            el.style.transform = 'none';
            el.style.width = targetWidth + 'px';
            el.style.height = targetHeight + 'px';
            el.style.margin = '0';
          }
        }
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`AETHER-${isProof ? 'PROOF' : 'CERT'}-${selectedCertificate.capsuleId}.pdf`);
      showToast(t.certDownloaded || 'PDF Downloaded', 'success');
    } catch (error) {
      console.error(error);
      showToast(t.certFail || 'PDF generation failed', 'error');
    }
  };

  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Not Connected';
  
  const timestamp = selectedCertificate.creationTimestamp || Date.now() / 1000;
  const dateObj = new Date(timestamp * 1000);
  const dateStr = dateObj.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

  const verifyUrl = isProof
    ? `https://testnet.bscscan.com/tx/${selectedCertificate.proofHash}`
    : `https://testnet.bscscan.com/address/0xCda136B176baE8F92d0Dbc7851C0A1E282469265#readContract`;

  return (
    <div className="fixed inset-0 bg-[#030208]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      
      {/* GLOBAL KEYFRAMES */}
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

      <div className="bg-[#0B0817] border border-neutral-800 max-w-6xl w-full rounded-3xl shadow-[0_0_60px_rgba(0,0,0,0.9)] relative flex flex-col max-h-[95vh]">
        
        {/* MODAL HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Official Certificate of Authenticity</h3>
              <p className="text-[10px] text-neutral-400 font-mono">Blockchain Verified | NFT Certificate</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedCertificate(null)}
            className="w-10 h-10 bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CERTIFICATE VIEW AREA */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 custom-scrollbar bg-[#070510] flex items-center justify-center">
          <div className="w-full max-w-[950px] overflow-x-auto">

            {isProof ? (
              // =======================================================
              // 🌟 AETHER PROOF NFT CERTIFICATE (WEB3 HORIZONTAL SYNC)
              // =======================================================
              <div 
                id="cert-export-node"
                ref={certificateRef}
                className="w-[890px] h-[620px] bg-[#0A0714] text-gray-200 rounded-2xl p-6 relative overflow-hidden font-sans border border-amber-500/30 mx-auto flex flex-col justify-between shrink-0 transform origin-top-left sm:origin-center scale-[0.55] sm:scale-100 mb-[-220px] sm:mb-0 shadow-[0_0_50px_rgba(139,92,246,0.15)]"
                style={{
                  background: 'radial-gradient(ellipse at 20% 0%, #11112d 0%, #090718 42%, #03020a 100%)',
                  borderImage: 'linear-gradient(135deg, #06b6d4, #8b5cf6, #f59e0b, #8b5cf6, #06b6d4) 1',
                  borderWidth: '2px', borderStyle: 'solid'
                }}
              >
                {/* BACKGROUND DECORATION */}
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                  <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.35), transparent 70%)' }} />
                  <div className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.22), transparent 70%)' }} />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px]" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.08), transparent 65%)' }} />
                </div>

                <div className="absolute top-8 right-8 w-[180px] h-[180px] opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.8) 1px, transparent 1px)', backgroundSize: '10px 10px', maskImage: 'linear-gradient(to bottom left, black, transparent)' }} />
                <div className="absolute bottom-10 left-8 w-[180px] h-[150px] opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.8) 1px, transparent 1px)', backgroundSize: '10px 10px', maskImage: 'linear-gradient(to top right, black, transparent)' }} />

                <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-400/50 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-amber-500/50 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-amber-500/50 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-cyan-400/50 rounded-br-xl pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[65%] h-[3px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.7), rgba(139,92,246,0.8), rgba(245,158,11,0.8), transparent)' }} />

                {/* HEADER */}
                <div className="flex justify-between items-center relative z-10 pb-3 border-b border-neutral-800/60 shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center relative overflow-hidden border border-cyan-400/40 bg-black/50 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-violet-500/10 to-amber-500/20" />
                      <img src={AETHER_LOGO} alt="AetherVault" className="relative object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]" style={{ width: '36px', height: '36px' }} />
                    </div>
                    <div>
                      <div className="font-display font-black text-xl tracking-[0.18em] leading-none">
                        <span className="text-white">AETHER</span><span className="text-amber-400">VAULT</span>
                      </div>
                      <p className="text-[7px] tracking-[0.3em] text-cyan-300/70 uppercase font-mono mt-1.5">Trustless • Verified • Timeless</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-neutral-950/80 px-3 py-1.5 rounded-full border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                      <span className="text-[8px] font-bold text-green-300 uppercase tracking-widest font-mono">VERIFIED ON-CHAIN</span>
                    </div>
                    <div className="bg-neutral-950/80 px-3 py-1.5 rounded-full border border-amber-500/30 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                      <Globe className="w-3 h-3 text-amber-400" />
                      <span className="text-[8px] font-bold text-amber-300 uppercase tracking-widest font-mono">BNB CHAIN</span>
                    </div>
                  </div>
                </div>

                {/* TITLE - Teks Diperbesar */}
                <div className="text-center relative z-10 shrink-0 mt-3 mb-4">
                  <div className="inline-flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-[11px] tracking-[0.4em] text-neutral-400 uppercase font-mono font-bold">Non-Fungible Token Certificate</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <h2 className="text-4xl font-black tracking-[0.15em] font-display text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-amber-200" style={{ textShadow: '0 0 30px rgba(6,182,212,0.3)' }}>
                    CERTIFICATE OF AUTHENTICITY
                  </h2>
                  <p className="text-[10px] tracking-[0.3em] text-neutral-500 uppercase font-mono mt-2">Blockchain Verified | Immutable | Decentralized</p>
                </div>

                {/* STRUKTUR DATA UTAMA HORIZONTAL */}
                <div className="flex flex-col gap-4 relative z-10 flex-1 justify-center">

                  {/* BARIS 1: INFO KARYA & CREATOR */}
                  <div className="flex gap-5 h-[140px]">
                    {/* Emblem Kiri (Floating Animated) */}
                    <div className="w-[140px] h-[140px] shrink-0 rounded-2xl border border-violet-500/30 relative overflow-hidden flex items-center justify-center bg-black/30">
                      <div className="absolute w-[110px] h-[110px] rounded-full blur-[25px] opacity-50" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.55), rgba(6,182,212,0.18), transparent 70%)' }} />
                      <div className="absolute w-[100px] h-[100px] border border-cyan-400/30 rotate-45 rounded-[16px]" />
                      <div className="absolute w-[80px] h-[80px] border border-violet-400/30 rotate-45 rounded-[12px]" />
                      <img src={AETHER_LOGO} alt="Emblem" className="relative z-10 object-contain drop-shadow-[0_0_20px_rgba(245,158,11,0.65)] av-float" style={{ width: '75px', height: '75px' }} />
                    </div>

                    <div className="flex-1 bg-[#05030F]/60 border border-neutral-800/60 rounded-2xl p-5 shadow-inner backdrop-blur-md flex flex-col justify-between font-mono">
                      <div className="flex justify-between items-start mb-1.5">
                        <div className="flex-1 pr-3">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-1 font-bold">Asset Title</p>
                          <p className="text-white font-bold text-lg line-clamp-1">{selectedCertificate.title || 'Aether Proof™'}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-1 font-bold">Certificate ID</p>
                          <p className="text-cyan-400 font-bold text-base tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                            #{selectedCertificate.capsuleId || 'PROOF-2026'}
                          </p>
                        </div>
                      </div>

                      <div className="mb-2 flex-1">
                        <p className="text-[10px] uppercase tracking-[0.3em] text-neutral-500 mb-1 font-bold">Description</p>
                        <p className="text-xs text-neutral-300 leading-relaxed line-clamp-2 pr-4">
                          {selectedCertificate.description || 'Authentic digital asset secured and verified permanently on the Binance Smart Chain.'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-neutral-800/60">
                        <div className="w-1/4 pr-2">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mb-1 font-bold">Creator Name</p>
                          <p className="text-neutral-200 font-bold text-xs truncate">{selectedCertificate.creator || formatAddress(selectedCertificate.owner)}</p>
                        </div>
                        <div className="w-1/4 pr-2">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mb-1 font-bold">Owner Wallet</p>
                          <p className="text-neutral-200 font-bold text-xs truncate font-mono">{formatAddress(selectedCertificate.owner)}</p>
                        </div>
                        <div className="w-1/4 pr-2">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mb-1 font-bold">Issued On</p>
                          <p className="text-neutral-200 font-bold text-xs">{dateStr} • UTC</p>
                        </div>
                        <div className="w-1/4">
                          <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500 mb-1 font-bold">Blockchain</p>
                          <p className="text-neutral-200 font-bold text-xs truncate">{TARGET_CHAIN_NAME || 'Binance Smart Chain'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BARIS 2: ON-CHAIN METADATA (Teks Diperbesar) */}
                  <div className="bg-[#0a0a1a]/80 rounded-xl p-4 border border-cyan-500/20 shadow-lg flex items-center gap-5 w-full font-mono shrink-0 h-[75px]">
                    <div className="flex items-center gap-2 pr-5 border-r border-neutral-800/80 shrink-0">
                      <Lock className="w-5 h-5 text-cyan-400" />
                      <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 font-bold leading-tight">On-Chain<br/>Metadata</p>
                    </div>
                    <div className="flex-1 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 w-[15%]">
                        <Hash className="w-4 h-4 text-neutral-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] text-neutral-500 uppercase mb-0.5 font-bold">Token ID</p>
                          <p className="text-white font-mono truncate">#{selectedCertificate.capsuleId || '0'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-[15%]">
                        <Cpu className="w-4 h-4 text-neutral-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[9px] text-neutral-500 uppercase mb-0.5 font-bold">Chain ID</p>
                          <p className="text-white font-mono truncate">97</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-[25%] pr-2">
                        <FileDigit className="w-4 h-4 text-neutral-500 shrink-0" />
                        <div className="min-w-0 w-full">
                          <p className="text-[9px] text-neutral-500 uppercase mb-0.5 font-bold">Contract Address</p>
                          <p className="text-cyan-300 font-mono text-[11px] truncate w-full">0xCda1...0265</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 w-[45%]">
                        <Code2 className="w-4 h-4 text-cyan-400 shrink-0" />
                        <div className="min-w-0 w-full">
                          <p className="text-[9px] text-neutral-500 uppercase mb-0.5 font-bold">Tx Hash (SHA-256)</p>
                          <p className="text-cyan-300 font-mono text-[11px] truncate w-full">{selectedCertificate.proofHash || '0x...'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BARIS 3: NFT PREVIEW & QR CODE */}
                  <div className="flex gap-5 h-[115px] font-mono shrink-0">
                    
                    <div className="flex-1 bg-[#05030F]/80 border rounded-2xl p-4 flex items-center gap-6 shadow-lg relative overflow-hidden" style={{ borderColor: cat.color + '40' }}>
                      <div className="absolute inset-0 opacity-20 blur-2xl pointer-events-none" style={{ background: `radial-gradient(circle at left, ${cat.color}22, transparent 70%)` }} />
                      
                      <div className="relative w-[76px] h-[90px] shrink-0">
                        <div className="absolute inset-0 rounded-lg transform rotate-3" style={{ background: `linear-gradient(135deg, ${cat.color}20, transparent)`, border: `1px solid ${cat.color}40` }} />
                        <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-neutral-900 to-neutral-950 border overflow-hidden flex items-center justify-center p-2 shadow-[0_10px_30px_rgba(0,0,0,0.5)]" style={{ borderColor: cat.color + '55' }}>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="av-ring-spin absolute w-[60px] h-[60px] rounded-full border border-cyan-400/35" style={{ borderTopColor: cat.color, borderBottomColor: 'rgba(139,92,246,.45)' }} />
                            <div className="av-ring-reverse absolute w-[50px] h-[50px] rounded-full border border-violet-400/25 border-dashed" />
                          </div>
                          {CatIcon}
                        </div>
                      </div>

                      <div className="flex flex-col justify-center z-10 flex-1">
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold mb-1.5">Asset Category</p>
                        <div className="relative rounded-lg mb-2.5 w-fit">
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded border font-bold text-[11px] tracking-[0.15em] backdrop-blur-md shadow-md" style={{ background: cat.bg, borderColor: cat.border, color: cat.color }}>
                            <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                            <span>{cat.badgeLabel || cat.label?.toUpperCase() || 'AUTHENTIC'}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-[9px] text-neutral-500 uppercase tracking-widest font-bold">On-Chain Token ID</p>
                          <p className="text-base text-white font-bold mt-0.5">#{selectedCertificate.capsuleId || '7X9K2J'}</p>
                        </div>
                      </div>
                    </div>

                    {/* QR Code Diperbesar */}
                    <div className="w-[130px] bg-[#05030F]/80 border border-neutral-800/60 rounded-2xl p-3 flex flex-col items-center justify-center shadow-lg shrink-0">
                      <div className="w-[84px] h-[84px] bg-white p-1.5 rounded-lg shadow-sm flex items-center justify-center mb-2">
                        <QRCode value={verifyUrl} size={72} bgColor="#ffffff" fgColor="#0A0714" level="Q" />
                      </div>
                      <span className="text-[8px] text-neutral-400 font-mono uppercase tracking-widest text-center leading-tight font-bold">Scan to<br/>Verify</span>
                    </div>

                  </div>

                </div>

                {/* FOOTER - Teks Diperbesar */}
                <div className="relative z-10 pt-4 border-t border-neutral-800/60 flex flex-row items-center justify-between px-2 shrink-0 mt-3">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-mono font-bold">Powered By</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Hexagon className="w-5 h-5 text-cyan-500" />
                      <p className="text-xs font-bold text-white font-display tracking-wider">AETHERVAULT PROTOCOL</p>
                    </div>
                    <p className="text-[8px] text-neutral-600 font-mono mt-1">Decentralized Time-Lock & Legacy Infrastructure</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-24 h-16 mx-auto mb-1 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="absolute inset-2 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                      <ShieldCheck className="w-9 h-9 text-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.8)]" />
                    </div>
                    <div className="font-signature text-2xl text-amber-200/90 tracking-wider" style={{ fontFamily: "'Brush Script MT', cursive" }}>AetherVault</div>
                    <div className="w-28 border-b border-neutral-700 my-1 mx-auto" />
                    <p className="text-[8px] uppercase tracking-[0.3em] text-neutral-500 font-mono font-bold">Authorized Digital Signature</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 font-mono font-bold">Network</p>
                    <div className="flex items-center justify-end gap-2 mt-1.5">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30 font-bold">BSC TESTNET</span>
                    </div>
                    <p className="text-[8px] text-neutral-600 font-mono mt-1">Chain ID: 97</p>
                  </div>
                </div>

              </div>
            ) : (

              /* ===================================================
                 LEGACY / VAULT CERTIFICATE (FORMAT KLASIK)
              ==================================================== */
              <div 
                id="cert-export-node"
                ref={certificateRef} 
                className="w-[842px] h-[595px] bg-[#fdfbf7] text-[#171717] rounded-sm p-8 relative overflow-hidden shadow-2xl font-serif border border-[#d4d4d4] mx-auto flex flex-col justify-between shrink-0 transform origin-top-left sm:origin-center scale-[0.6] sm:scale-100 mb-[-200px] sm:mb-0"
              >
                <div className="absolute top-6 right-6 flex items-center gap-2 z-20 bg-[rgba(255,255,255,0.9)] px-3 py-1.5 rounded-full border border-[#bbf7d0] shadow-sm">
                  <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  <span className="text-[10px] font-bold text-[#15803d] uppercase tracking-widest">Verified on Binance</span>
                </div>

                <div 
                  className="absolute inset-0 pointer-events-none grayscale opacity-[0.035] m-20"
                  style={{ backgroundImage: `url(${AETHER_LOGO})`, backgroundSize: 'contain', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}
                />

                <div className="absolute inset-4 border-[4px] border-double border-[rgba(120,53,15,0.3)] pointer-events-none rounded-sm" />
                <div className="absolute inset-6 border-[1px] border-[rgba(120,53,15,0.1)] pointer-events-none rounded-sm" />

                <div className="relative z-10 text-center mb-1 pt-2 border-b-2 border-[rgba(120,53,15,0.1)] pb-2">
                  <div className="flex justify-center items-center gap-3 mb-1">
                    <img src={AETHER_LOGO} alt="AetherVault" className="object-contain" style={{ width: '48px', height: '48px' }} />
                    <h4 className="text-3xl font-black tracking-[0.25em] text-[#78350f] font-display drop-shadow-sm">AETHERVAULT</h4>
                  </div>
                  <p className="text-[11px] font-bold tracking-[0.3em] text-[#b45309] uppercase">Official Cryptographic Certificate</p>
                </div>

                <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-center px-4">
                  <div className="text-center mb-1">
                    <p className="text-[10px] uppercase tracking-widest text-[#737373] mb-1">This certifies the creation of</p>
                    <h5 className="text-2xl font-bold text-[#171717] font-display px-8 leading-snug">"Cryptographic Vault #{selectedCertificate.capsuleId}"</h5>
                  </div>

                  <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-xs font-mono bg-[rgba(255,255,255,0.2)] p-4 border border-[rgba(120,53,15,0.2)] rounded-sm shadow-sm backdrop-blur-sm">
                    <div className="border-r border-[rgba(120,53,15,0.1)] pr-4">
                      <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">Vault ID & Tier</p>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-[#171717]">#{selectedCertificate.capsuleId}</p>
                        <span className="text-[8px] bg-[#78350f] text-[#fef3c7] px-2 py-0.5 rounded-sm tracking-widest font-bold">{selectedCertificate.tier} (Legacy)</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">Timestamp</p>
                      <p className="font-bold text-[#171717]">{dateStr}</p>
                    </div>
                    <div className="border-r border-[rgba(120,53,15,0.1)] pr-4 pt-2 border-t border-[rgba(120,53,15,0.1)]">
                      <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">Creator / Owner</p>
                      <p className="font-bold text-[#171717] text-[11px] truncate">{formatAddress(selectedCertificate.owner)}</p>
                    </div>
                    <div className="pt-2 border-t border-[rgba(120,53,15,0.1)]">
                      <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">Smart Contract</p>
                      <p className="font-bold text-[#171717] text-[11px] truncate">0xCda136B176baE8F92d0Dbc7851C0A1E282469265</p>
                    </div>
                    <div className="col-span-2 border-t border-[rgba(120,53,15,0.2)] pt-2 mt-1">
                      <p className="text-[9px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1 flex items-center gap-1.5"><Fingerprint className="w-3 h-3"/> Security Status</p>
                      <p className="text-[10px] text-[#404040] font-bold tracking-tight">Encrypted On-Chain (Legacy Vault Protection)</p>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 mt-3 pt-2 border-t-2 border-[rgba(120,53,15,0.2)] flex flex-row items-end justify-between px-6 pb-1">
                  <div className="text-left mb-1">
                    <p className="text-[8px] font-bold text-[#78350f] uppercase tracking-widest leading-relaxed">Registered By<br/><span className="text-xs font-black mt-0.5 block">AETHERVAULT™ REGISTRY</span></p>
                    <p className="text-[7px] text-[#737373] font-mono mt-1 tracking-widest bg-[rgba(120,53,15,0.05)] inline-block px-1.5 py-0.5 rounded">IMMUTABLE • BINANCE</p>
                  </div>
                  
                  <div className="text-center mb-1 px-8 flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <div className="font-signature text-3xl text-[rgba(120,53,15,0.8)] -rotate-3 mb-1 mt-2" style={{ fontFamily: "'Brush Script MT', cursive" }}>AetherVault</div>
                    </div>
                    <div className="w-32 border-b border-[rgba(120,53,15,0.4)] mb-1" />
                    <p className="text-[8px] uppercase tracking-widest text-[#737373] font-bold">Signature</p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white border border-[#e5e5e5] p-1.5 rounded-sm shadow-sm flex items-center justify-center">
                      <QRCode value={verifyUrl} size={68} bgColor="#ffffff" fgColor="#451a03" level="Q" />
                    </div>
                    <p className="text-[7px] uppercase tracking-widest mt-1 text-[#78350f] font-bold">Scan to Verify</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* DOWNLOAD BUTTONS */}
        <div className="p-6 border-t border-neutral-900 bg-[#0B0817] rounded-b-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={handleDownloadPDF} className="w-full bg-[#05030F] hover:bg-neutral-900 border border-neutral-700 hover:border-amber-500/50 text-white font-bold py-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg group">
            <Download className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 transition-colors" /> {t.certDownloadBtn || 'Download PDF'}
          </button>
          <button onClick={handleDownloadPNG} className="w-full bg-[#05030F] hover:bg-neutral-900 border border-neutral-700 hover:border-cyan-500/50 text-white font-bold py-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg group">
            <ImageIcon className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition-colors" /> {t.certExportPng || 'Export PNG'}
          </button>
        </div>

      </div>
    </div>
  );
}
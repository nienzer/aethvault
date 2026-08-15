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
  Cpu
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

  // =========================================================
  // AETHERVAULT LOGO - Disesuaikan dengan file logo.png milik Bos
  // =========================================================
  const AETHER_LOGO = '/logo.png';

  // =========================================================
  // CATEGORY CONFIG
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
  const CatIcon = cat.icon;

  // =========================================================
  // DOWNLOAD LOGIC
  // =========================================================
  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      showToast(t.certGenPng || 'Generating PNG...', 'info');
      const bgColor = isProof ? '#05030F' : '#fdfbf7';
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: bgColor });
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
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: bgColor });
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
  const timeStr = dateObj.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  // QR Code URL Terpusat & Akurat
  const verifyUrl = isProof
    ? `https://testnet.bscscan.com/tx/${selectedCertificate.proofHash}`
    : `https://testnet.bscscan.com/address/0xCda136B176baE8F92d0Dbc7851C0A1E282469265#readContract`;

  return (
    <div className="fixed inset-0 bg-[#030208]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      
      <style>{`
        @keyframes av-ring-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes av-ring-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes av-light-sweep {
          0%, 55% { transform: translateX(-140%) skewX(-18deg); opacity: 0; }
          65% { opacity: .8; }
          82%, 100% { transform: translateX(140%) skewX(-18deg); opacity: 0; }
        }
        @keyframes av-logo-pulse {
          0%, 100% { filter: drop-shadow(0 0 16px rgba(245,158,11,.45)); transform: scale(1); }
          50% { filter: drop-shadow(0 0 28px rgba(245,158,11,.85)); transform: scale(1.025); }
        }
        @keyframes av-orbit-dot {
          from { transform: rotate(0deg) translateX(43px) rotate(0deg); }
          to { transform: rotate(360deg) translateX(43px) rotate(-360deg); }
        }
        @keyframes av-badge-pulse {
          0%, 100% { box-shadow: 0 0 12px currentColor, inset 0 1px 0 rgba(255,255,255,.08); }
          50% { box-shadow: 0 0 24px currentColor, inset 0 1px 0 rgba(255,255,255,.14); }
        }
        .av-ring-spin { animation: av-ring-spin 12s linear infinite; }
        .av-ring-reverse { animation: av-ring-reverse 8s linear infinite; }
        .av-light-sweep { animation: av-light-sweep 4.5s ease-in-out infinite; }
        .av-logo-pulse { animation: av-logo-pulse 3.8s ease-in-out infinite; }
        .av-badge-pulse { animation: av-badge-pulse 2.8s ease-in-out infinite; }
        .av-orbit-dot { animation: av-orbit-dot 6s linear infinite; }
        @media (prefers-reduced-motion: reduce) {
          .av-ring-spin, .av-ring-reverse, .av-light-sweep, .av-logo-pulse, .av-badge-pulse, .av-orbit-dot { animation: none !important; }
        }
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
              // 🌟 AETHER PROOF NFT CERTIFICATE
              <div 
                ref={certificateRef}
                className="w-[950px] h-[660px] text-gray-200 rounded-2xl p-8 relative overflow-hidden font-sans border mx-auto flex flex-col justify-between shrink-0 transform origin-top-left sm:origin-center scale-[0.52] sm:scale-100 mb-[-240px] sm:mb-0"
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

                {/* DIGITAL DOT MATRIX */}
                <div className="absolute top-8 right-8 w-[180px] h-[180px] opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.8) 1px, transparent 1px)', backgroundSize: '10px 10px', maskImage: 'linear-gradient(to bottom left, black, transparent)' }} />
                <div className="absolute bottom-10 left-8 w-[180px] h-[150px] opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(34,211,238,0.8) 1px, transparent 1px)', backgroundSize: '10px 10px', maskImage: 'linear-gradient(to top right, black, transparent)' }} />

                {/* CORNER ORNAMENTS */}
                <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-cyan-400/50 rounded-tl-xl pointer-events-none" />
                <div className="absolute top-4 right-4 w-16 h-16 border-r-2 border-t-2 border-amber-500/50 rounded-tr-xl pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-16 h-16 border-l-2 border-b-2 border-amber-500/50 rounded-bl-xl pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-16 h-16 border-r-2 border-b-2 border-cyan-400/50 rounded-br-xl pointer-events-none" />

                {/* TOP HOLOGRAPHIC STRIP */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[65%] h-[3px]" style={{ background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.7), rgba(139,92,246,0.8), rgba(245,158,11,0.8), transparent)' }} />

                {/* HEADER */}
                <div className="flex justify-between items-center relative z-10 pb-4 border-b border-neutral-800/60">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center relative overflow-hidden border border-cyan-400/40 bg-black/50 shadow-[0_0_25px_rgba(6,182,212,0.25)]">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/15 via-violet-500/10 to-amber-500/20" />
                      <img src={AETHER_LOGO} alt="AetherVault" className="relative w-11 h-11 object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.7)]" />
                    </div>
                    <div>
                      <div className="font-display font-black text-2xl tracking-[0.18em] leading-none">
                        <span className="text-white">AETHER</span><span className="text-amber-400">VAULT</span>
                      </div>
                      <p className="text-[8px] tracking-[0.3em] text-cyan-300/70 uppercase font-mono mt-1">Trustless • Verified • Timeless</p>
                    </div>
                  </div>

                  {/* NETWORK STATUS */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-neutral-950/80 px-4 py-2 rounded-full border border-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]">
                      <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]" />
                      <span className="text-[10px] font-bold text-green-300 uppercase tracking-widest font-mono">VERIFIED ON-CHAIN</span>
                    </div>
                    <div className="bg-neutral-950/80 px-4 py-2 rounded-full border border-amber-500/30 flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
                      <Globe className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-mono">BNB CHAIN</span>
                    </div>
                  </div>
                </div>

                {/* TITLE */}
                <div className="text-center relative z-10 my-2">
                  <div className="inline-flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-[10px] tracking-[0.4em] text-neutral-400 uppercase font-mono">Non-Fungible Token Certificate</span>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                  </div>
                  <h2 className="text-3xl font-black tracking-[0.15em] font-display" style={{ background: 'linear-gradient(90deg, #22d3ee, #ffffff, #fbbf24, #ffffff, #22d3ee)', backgroundSize: '200% auto', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textShadow: '0 0 30px rgba(6,182,212,0.3)' }}>
                    CERTIFICATE OF AUTHENTICITY
                  </h2>
                  <p className="text-[9px] tracking-[0.3em] text-neutral-500 uppercase font-mono mt-2">Blockchain Verified | Immutable | Decentralized</p>
                </div>

                {/* MAIN CONTENT */}
                <div className="grid grid-cols-12 gap-6 relative z-10 items-stretch my-1 flex-1">

                  {/* LEFT SIDE: EMBLEM & DATA */}
                  <div className="col-span-8 bg-[#05030F]/60 border border-neutral-800/60 rounded-2xl p-5 shadow-inner backdrop-blur-md flex gap-5 font-mono">
                    
                    {/* EMBLEM LOGO - Dikecilkan ukurannya jadi 180px */}
                    <div className="w-[180px] shrink-0 rounded-2xl border border-violet-500/30 relative overflow-hidden flex items-center justify-center bg-black/30">
                      <div className="absolute w-[150px] h-[150px] rounded-full blur-[35px] opacity-50" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.55), rgba(6,182,212,0.18), transparent 70%)' }} />
                      <div className="absolute w-[140px] h-[140px] border border-cyan-400/30 rotate-45 rounded-[24px]" />
                      <div className="absolute w-[120px] h-[120px] border border-violet-400/30 rotate-45 rounded-[20px]" />
                      <img src={AETHER_LOGO} alt="AetherVault Emblem" className="relative z-10 w-[100px] h-[100px] object-contain drop-shadow-[0_0_28px_rgba(245,158,11,0.65)]" />
                      <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                        <span className="text-[7px] tracking-[0.35em] uppercase text-cyan-300/70">AUTHENTIC AETHER PROOF</span>
                      </div>
                    </div>

                    {/* CERTIFICATE DATA */}
                    <div className="flex-1 space-y-3">
                      <div className="pb-3 border-b border-neutral-800/40">
                        <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 mb-1">Certificate ID</p>
                        <p className="text-cyan-400 font-bold text-lg tracking-wider drop-shadow-[0_0_8px_rgba(6,182,212,0.5)]">
                          #{selectedCertificate.capsuleId || 'PROOF-2026'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 mb-1">Asset / Item</p>
                          <p className="text-white font-bold text-sm truncate">{selectedCertificate.title || 'Aether Proof™'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 mb-1">Owner</p>
                          <p className="text-neutral-200 font-bold text-sm truncate font-mono">{formatAddress(selectedCertificate.owner)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 mb-1">Issued On</p>
                          <p className="text-neutral-200 font-bold text-sm">{dateStr} • {timeStr} UTC</p>
                        </div>
                        <div>
                          <p className="text-[9px] uppercase tracking-[0.3em] text-neutral-500 mb-1">Blockchain</p>
                          <p className="text-neutral-200 font-bold text-sm">{TARGET_CHAIN_NAME || 'Binance Smart Chain'}</p>
                        </div>
                      </div>

                      {/* ON-CHAIN METADATA */}
                      <div className="bg-[#0a0a1a]/80 rounded-xl p-4 border border-cyan-500/20 mt-2">
                        <div className="flex items-center gap-2 mb-3">
                          <Lock className="w-3.5 h-3.5 text-cyan-400" />
                          <p className="text-[9px] uppercase tracking-[0.3em] text-cyan-400 font-bold">On-Chain Metadata</p>
                        </div>

                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-[11px]">
                          <div className="flex items-center">
                            <Hash className="w-3 h-3 text-neutral-500 mr-1.5" />
                            <span className="text-neutral-500">Token ID:</span>
                            <span className="text-white ml-2 font-mono">{selectedCertificate.capsuleId || '#0'}</span>
                          </div>
                          
                          <div className="flex items-center">
                            <Cpu className="w-3 h-3 text-neutral-500 mr-1.5" />
                            <span className="text-neutral-500">Chain ID:</span>
                            <span className="text-white ml-2 font-mono">97</span> {/* FIX: Menggunakan Chain ID Testnet */}
                          </div>

                          <div className="col-span-2 flex items-center">
                            <FileDigit className="w-3 h-3 text-neutral-500 mr-1.5" />
                            <span className="text-neutral-500">Contract:</span>
                            <span className="text-cyan-300 ml-2 font-mono text-[10px]">0xCda1...0265</span>
                          </div>

                          <div className="col-span-2 flex items-center">
                            <Code2 className="w-3.5 h-3.5 text-cyan-400 mr-1.5" /> {/* FIX: Penambahan Ikon Tx Hash */}
                            <span className="text-neutral-500">Tx Hash:</span>
                            <span className="text-cyan-300 ml-2 font-mono text-[10px] truncate">{selectedCertificate.proofHash || '0x...'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT SIDE: PREVIEW & QR */}
                  <div className="col-span-4 flex flex-col gap-4">
                    <div className="bg-[#05030F]/80 border rounded-2xl p-5 flex flex-col items-center shadow-2xl relative flex-1" style={{ borderColor: cat.color + '40' }}>
                      <div className="absolute inset-0 rounded-2xl opacity-20 blur-xl pointer-events-none" style={{ background: `radial-gradient(circle at center, ${cat.color}22, transparent 70%)` }} />
                      <span className="text-[9px] font-mono tracking-[0.3em] uppercase mb-3 border-b border-neutral-800 pb-2 w-full text-center" style={{ color: cat.color }}>NFT PREVIEW</span>

                      {/* NFT CARD */}
                      <div className="relative w-32 h-40 mb-3">
                        <div className="absolute inset-0 rounded-xl transform rotate-3" style={{ background: `linear-gradient(135deg, ${cat.color}20, transparent)`, border: `1px solid ${cat.color}40` }} />
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neutral-900 to-neutral-950 border overflow-hidden flex items-center justify-center p-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]" style={{ borderColor: cat.color + '55' }}>
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="av-ring-spin absolute w-[92px] h-[92px] rounded-full border border-cyan-400/35" style={{ borderTopColor: cat.color, borderBottomColor: 'rgba(139,92,246,.45)' }} />
                            <div className="av-ring-reverse absolute w-[78px] h-[78px] rounded-full border border-violet-400/25 border-dashed" />
                            <div className="absolute w-[62px] h-[62px] rounded-full border border-amber-400/20" />
                            <div className="av-orbit-dot absolute w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,.9)]" />
                            <div className="absolute w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,.95)]" />
                          </div>
                          <img src={AETHER_LOGO} alt="AetherVault NFT" className="av-logo-pulse relative z-10 w-16 h-16 object-contain" />
                          <div className="av-light-sweep absolute top-[-25%] bottom-[-25%] left-[-35%] w-[24%] rotate-[18deg] bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[3px] pointer-events-none z-20" />
                          <div className="absolute inset-2 rounded-lg border border-white/5 pointer-events-none" />
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
                      </div>

                      {/* CATEGORY BADGE */}
                      <div className="relative mb-3 av-badge-pulse rounded-lg" style={{ color: cat.color }}>
                        <div className="absolute inset-0 rounded-lg blur-md opacity-50" style={{ background: cat.color }} />
                        <div className="relative flex items-center gap-2 px-3 py-1.5 rounded-lg border font-bold text-[10px] tracking-[0.18em] font-mono backdrop-blur-md" style={{ background: cat.bg, borderColor: cat.border, color: cat.color }}>
                          <CatIcon className="w-3.5 h-3.5" style={{ color: cat.color }} />
                          <span>{cat.badgeLabel || cat.label.toUpperCase()}</span>
                        </div>
                      </div>

                      <div className="text-center mb-3">
                        <p className="text-[7px] text-neutral-500 uppercase tracking-widest font-mono">Serial Number</p>
                        <p className="text-sm text-white font-mono font-bold mt-1">{selectedCertificate.capsuleId || '7X9K2J'}</p>
                      </div>

                      <div className="relative w-14 h-14 rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center mb-2" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.1), rgba(139,92,246,0.1))' }}>
                        <img src={AETHER_LOGO} alt="Verified" className="w-9 h-9 object-contain drop-shadow-[0_0_8px_rgba(245,158,11,0.7)]" />
                      </div>
                      <span className="text-[7px] text-neutral-500 font-mono uppercase tracking-widest">AUTHENTIC</span>
                    </div>

                    {/* QR CODE */}
                    <div className="bg-[#05030F]/80 border border-neutral-800/60 rounded-2xl p-4 flex flex-col items-center">
                      <div className="w-20 h-20 bg-white p-1.5 rounded-lg shadow-lg flex items-center justify-center">
                        <QRCode value={verifyUrl} size={68} bgColor="#ffffff" fgColor="#0A0714" level="Q" />
                      </div>
                      <span className="text-[7px] text-neutral-400 font-mono mt-2 uppercase tracking-widest">Scan to Verify On-Chain</span>
                    </div>
                  </div>
                </div>

                {/* FOOTER */}
                <div className="relative z-10 pt-4 border-t border-neutral-800/60 flex flex-row items-center justify-between px-2">
                  <div>
                    <p className="text-[8px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Powered By</p>
                    <div className="flex items-center gap-2 mt-1">
                      <img src={AETHER_LOGO} alt="AetherVault" className="w-7 h-7 object-contain drop-shadow-[0_0_7px_rgba(245,158,11,0.5)]" />
                      <p className="text-sm font-bold text-white font-display tracking-wider">AETHERVAULT PROTOCOL</p>
                    </div>
                    <p className="text-[7px] text-neutral-600 font-mono mt-0.5">Decentralized Time-Lock & Legacy Infrastructure</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-24 h-20 mx-auto mb-1 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border border-amber-500/20 animate-spin" style={{ animationDuration: '8s' }} />
                      <div className="absolute inset-2 rounded-full border border-cyan-500/20 animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />
                      <img src={AETHER_LOGO} alt="AetherVault Seal" className="w-12 h-12 object-contain drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
                    </div>
                    <div className="font-signature text-2xl text-amber-200/90 tracking-wider" style={{ fontFamily: "'Brush Script MT', cursive" }}>AetherVault</div>
                    <div className="w-32 border-b border-neutral-700 my-1 mx-auto" />
                    <p className="text-[7px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Authorized Digital Signature</p>
                  </div>

                  <div className="text-right">
                    <p className="text-[7px] uppercase tracking-[0.3em] text-neutral-500 font-mono">Network</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/30">BSC TESTNET</span>
                    </div>
                    <p className="text-[7px] text-neutral-600 font-mono mt-1">Chain ID: 97</p> {/* FIX: Sesuai dengan BSC Testnet */}
                  </div>
                </div>
              </div>
            ) : (

              /* ===================================================
                 LEGACY / VAULT CERTIFICATE
              ==================================================== */
              <div 
                ref={certificateRef} 
                className="w-[842px] h-[595px] bg-[#fdfbf7] text-[#171717] rounded-sm p-8 relative overflow-hidden shadow-2xl font-serif border border-[#d4d4d4] mx-auto flex flex-col justify-between shrink-0 transform origin-top-left sm:origin-center scale-[0.6] sm:scale-100 mb-[-200px] sm:mb-0"
              >
                <div className="absolute top-6 right-6 flex items-center gap-2 z-20 bg-[rgba(255,255,255,0.9)] px-3 py-1.5 rounded-full border border-[#bbf7d0] shadow-sm">
                  <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
                  <span className="text-[10px] font-bold text-[#15803d] uppercase tracking-widest">Verified on Binance</span>
                </div>

                <img src={AETHER_LOGO} alt="Watermark" className="absolute inset-0 w-full h-full object-contain opacity-[0.035] pointer-events-none grayscale p-20" />
                <div className="absolute inset-4 border-[4px] border-double border-[rgba(120,53,15,0.3)] pointer-events-none rounded-sm" />
                <div className="absolute inset-6 border-[1px] border-[rgba(120,53,15,0.1)] pointer-events-none rounded-sm" />

                <div className="relative z-10 text-center mb-1 pt-2 border-b-2 border-[rgba(120,53,15,0.1)] pb-2">
                  <div className="flex justify-center items-center gap-3 mb-1">
                    <img src={AETHER_LOGO} alt="AetherVault" className="w-12 h-12 object-contain" />
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
                      <img src={AETHER_LOGO} alt="AetherVault" className="w-7 h-7 object-contain" />
                      <div className="font-signature text-3xl text-[rgba(120,53,15,0.8)] -rotate-3 mb-1" style={{ fontFamily: "'Brush Script MT', cursive" }}>AetherVault</div>
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
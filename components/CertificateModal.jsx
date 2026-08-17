import React, { useRef } from 'react';
import { Award, Download, Image as ImageIcon, X, Shield, KeyRound, Activity, Sparkles, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import QRCode from 'react-qr-code';

const CONTRACT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265"; 
const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Unknown';

// =========================================================
// RENDER PEMBARUAN: FIXED TINTED GLASSMORPHIC NFT - VAULT
// =========================================================
const CertificateTemplate = React.forwardRef(({ data, networkName }, ref) => {
  const certificateId = data?.capsuleId || "PENDING";
  const owner = formatAddressFunc(data?.owner);
  const category = data?.tier || "Vault";
  const isLegacy = data?.isLegacy;
  const date = data?.creationTimestamp ? new Date(data.creationTimestamp * 1000).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");
  
  const title = isLegacy ? "Legacy Vault Capsule" : "Time-Locked Vault Capsule";
  const fileHash = "Encrypted On-Chain Data";
  const verifyUrl = `https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}`;

  let CatIcon = <Shield className="w-4 h-4 text-[#00ffcc]" />;
  if (category === "VIP") { CatIcon = <Shield className="w-4 h-4 text-[#0066ff]" />; }
  else if (category === "Eternal") { CatIcon = <Activity className="w-4 h-4 text-purple-400" />; }
  else if (category === "Legacy") { CatIcon = <KeyRound className="w-4 h-4 text-pink-400" />; }

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
            <span className="text-[10px] font-black tracking-[0.25em] text-neutral-300">SECURED ON-CHAIN</span>
          </div>
          <div className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.1]">
            <span className="text-[10px] font-black tracking-[0.25em] text-neutral-300">{String(networkName).toUpperCase()}</span>
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
        <p className="text-[10px] text-white/40 tracking-[0.25em] mt-0.5 font-mono uppercase font-bold">CRYPTOGRAPHIC PROOF OF OWNERSHIP</p>
      </div>

      {/* LEFT DATA PANEL - POSISI DAN UKURAN DIAMANKAN */}
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
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">OWNER ADDRESS</div><div className="text-[12px] text-white/80 font-mono font-bold truncate tracking-wide">{owner}</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">WALLET</div><div className="text-[12px] text-white font-bold truncate tracking-wide">{data?.owner || "0x00...00"}</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">VAULT STATUS</div><div className="text-[11px] text-emerald-400 font-mono font-black tracking-wider flex items-center gap-1.5">● Secured & Verified</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">REGISTRATION DATE</div><div className="text-[11px] text-white/70 font-mono font-bold">{date}</div></div>
        </div>

        <div className="mt-5 pt-4 border-t border-white/[0.08]">
          <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1.5">CRYPTOGRAPHIC IMMUTABILITY STATEMENT</div>
          <div className="text-[10px] leading-relaxed text-white/50 font-medium font-sans">This artifact asset is permanently secured via end-to-end cryptographic primitives and timestamped on-chain. Molecular ownership records are absolute, immutable, and non-fungible.</div>
        </div>

        <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
          <div><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">TOKEN ID</div><div className="text-[10px] text-white/60 font-mono font-black mt-1">#{certificateId}</div></div>
          <div><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">NETWORK PROT.</div><div className="text-[10px] text-white/60 font-mono font-black mt-1">BSC TESTNET</div></div>
          <div className="max-w-[210px]"><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">SMART CONTRACT</div><div className="text-[9px] text-white/50 font-mono mt-1 truncate">{CONTRACT_ADDRESS}</div></div>
        </div>
      </div>
      
      {/* RIGHT DISPLAY PANEL - UKURAN DAN LOGO ASLI DIAMANKAN */}
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

          {/* LOGO AETHER ASLI DENGAN EFEK GLOW */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
             <div className="w-[86px] h-[86px] bg-[#111526] rounded-full border border-white/20 flex items-center justify-center shadow-[inset_0_0_20px_rgba(6,182,212,0.3),0_0_20px_rgba(6,182,212,0.6)] av-shield-glow">
                <img src="/logo.png" alt="Logo" className="w-[52px] h-[52px] object-contain opacity-90 drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
             </div>
          </div>
        </div>
        
        <div className="absolute top-[20px] left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 backdrop-blur-xl shadow-[0_4px_12px_rgba(0,0,0,0.15)] bg-white/[0.04] text-white/90">
            {CatIcon}<span className="text-[10px] font-black tracking-[0.25em]">SECURED VAULT</span>
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

      {/* SUB-FOOTER - UKURAN TEKS DIBESARKAN KE text-[9px] */}
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
export default function CertificateModal({ selectedCertificate, setSelectedCertificate, TARGET_CHAIN_NAME, showToast }) {
  const certificateRef = useRef(null);
  if (!selectedCertificate) return null;

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      if (showToast) showToast("Menyiapkan file PNG...", "info");
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#06070d', pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `VAULT-CERT-${selectedCertificate.capsuleId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) { 
      console.error("Export PNG gagal", err); 
      alert("Gagal Export PNG: " + err.message);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      if (showToast) showToast("Menyiapkan file PDF...", "info");
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#06070d', pixelRatio: 2 });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (760 * pdfWidth) / 1200;
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`VAULT-CERT-${selectedCertificate.capsuleId}.pdf`);
    } catch (err) { 
      console.error("Export PDF gagal", err); 
      alert("Gagal Export PDF: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col bg-[#05030F] border border-cyan-500/30 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.3)] w-full max-w-4xl max-h-[95vh] overflow-hidden">
        
        {/* HEADER (Tetap/Fixed di atas) */}
        <div className="w-full flex justify-between items-center p-4 border-b border-cyan-900/50 bg-black/40 shrink-0">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white font-mono">Vault Certificate <span className="text-cyan-400">#{selectedCertificate.capsuleId}</span></h3>
          </div>
          <button onClick={() => setSelectedCertificate(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/50 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        
        {/* BODY & FOOTER (Sekarang digabung agar bisa di-scroll ke bawah bersama-sama) */}
        <div className="w-full flex-1 overflow-y-auto custom-scrollbar bg-[#020207] p-4 sm:p-6 flex flex-col items-center">
          
          {/* Area Gambar Sertifikat */}
          <div style={{ width: '780px', height: '494px', position: 'relative' }} className="shrink-0 mb-8">
            <div className="absolute top-0 left-0" style={{ width: '1200px', height: '760px', transform: 'scale(0.65)', transformOrigin: 'top left' }}>
              <CertificateTemplate ref={certificateRef} data={selectedCertificate} networkName={TARGET_CHAIN_NAME} />
            </div>
          </div>

          {/* TOMBOL AKSI - Sekarang berada di dalam area scroll! */}
          <div className="w-full flex flex-wrap items-center justify-center gap-4 pt-6 border-t border-cyan-900/40">
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 border border-amber-500/30 hover:border-amber-400/60 hover:bg-amber-500/10 text-amber-300 text-xs font-bold transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] cursor-pointer">
              <Download className="w-4 h-4" /> Save PDF
            </button>
            <button onClick={handleDownloadPNG} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-neutral-900 border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-500/10 text-cyan-300 text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.1)] cursor-pointer">
              <ImageIcon className="w-4 h-4" /> Save PNG
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
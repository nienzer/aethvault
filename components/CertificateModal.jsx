import React, { useRef } from 'react';
import { Award, Download, Image as ImageIcon, X, Shield, KeyRound, Box, Sparkles, Hexagon, ShieldCheck, Activity } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import QRCode from 'react-qr-code';

const AETHER_LOGO = "/logo.png";
const CONTRACT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265"; 

const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Unknown';

// =========================================================
// FINAL PREMIUM: TINTED GLASSMORPHIC (AMAN EKSPOR PNG) - BAGIAN 1
// =========================================================
const CertificateTemplate = React.forwardRef(({ data, networkName }, ref) => {
  const certificateId = data?.capsuleId || "PENDING";
  const owner = formatAddressFunc(data?.owner);
  const category = data?.tier || "Vault";
  const isLegacy = data?.isLegacy;
  const date = data?.creationTimestamp ? new Date(data.creationTimestamp * 1000).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");
  
  const title = isLegacy ? "Legacy Vault Capsule" : "Time-Locked Vault Capsule";
  const verifyUrl = `https://bscscan.com{CONTRACT_ADDRESS}`;

  let catColor = "#00ffcc";
  let CatIcon = <Shield className="w-4 h-4 text-[#00ffcc]" />;
  if (category === "VIP") { catColor = "#0066ff"; CatIcon = <Shield className="w-4 h-4 text-[#0066ff]" />; }
  else if (category === "Eternal") { catColor = "#a855f7"; CatIcon = <Activity className="w-4 h-4 text-purple-400" />; }
  else if (category === "Legacy") { catColor = "#ec4899"; CatIcon = <KeyRound className="w-4 h-4 text-pink-400" />; }

  return (
    <div id="cert-export-node" ref={ref} className="relative mx-auto shrink-0 overflow-hidden w-[1200px] h-[760px] rounded-[32px] border border-white/[0.12] bg-[#0a0d14]/75 backdrop-blur-3xl text-white font-sans shadow-[0_40px_100px_rgba(0,0,0,0.6),inset_0_1px_2px_rgba(255,255,255,0.15)]">
      <style>{`
        @keyframes av-orbit-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes av-orbit-fast { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes av-shield-glow { 0%,100% { filter: drop-shadow(0 0 15px rgba(0,255,204,0.3)); transform: scale(0.97); } 50% { filter: drop-shadow(0 0 35px rgba(139,92,246,0.5)); transform: scale(1.03); } }
        @keyframes av-sweep-light { 0%,60% { transform: translateX(-150%) skewX(-20deg); opacity:0; } 70% { opacity:0.5; } 95%,100% { transform: translateX(280%) skewX(-20deg); opacity:0; } }
        .av-orbit-slow { animation: av-orbit-slow 22s linear infinite; transform-origin: center; }
        .av-orbit-fast { animation: av-orbit-fast 14s linear infinite; transform-origin: center; }
        .av-shield-glow { animation: av-shield-glow 4s ease-in-out infinite; transform-origin: center; }
        .av-sweep-light { animation: av-sweep-light 7s ease-in-out infinite; }
      `}</style>
      
      <div className="absolute inset-[12px] rounded-[28px] border border-white/[0.06] pointer-events-none shadow-[inset_0_1px_2px_rgba(255,255,255,0.05)]" />
      <div className="absolute inset-[20px] rounded-[24px] border border-cyan-500/10 pointer-events-none" />
      
      {/* HEADER COMPONENT (OTOMATIS LOGO.PNG ANDA) */}
      <div className="absolute top-[54px] left-[64px] right-[64px] flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.1] flex items-center justify-center">
            <img src="/logo.png" alt="AetherVault" className="w-10 h-10 object-contain opacity-95" />
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
          <div className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.1] text-[10px] font-black tracking-[0.25em] text-neutral-300">
            {String(networkName).toUpperCase()}
          </div>
        </div>
      </div>

      {/* TITLE SECTION */}
      <div className="absolute top-[150px] left-[64px] z-20">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-16 h-px bg-white/20" />
          <span className="text-[10px] tracking-[0.55em] text-white/30 uppercase font-mono font-black">Decentralized Vault Registry</span>
        </div>
        <h1 className="text-[40px] font-black tracking-[0.15em] text-white">CERTIFICATE OF AUTHENTICITY</h1>
        <p className="text-[10px] text-white/40 tracking-[0.25em] mt-1 font-mono uppercase font-bold">AETHER PROF COPYRIGHT REGISTRATION PROTOCOL</p>
      </div>

      {/* PANEL DATA KIRI */}
      <div className="absolute left-[64px] top-[255px] w-[560px] h-[395px] z-20 rounded-[28px] border border-white/[0.06] bg-[#070911]/60 p-8 flex flex-col justify-between shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
        <div className="flex justify-between items-start pb-4 border-b border-white/[0.08] w-full">
          <div className="min-w-0 pr-4">
            <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1">ASSET TITLE / TYPE</div>
            <div className="text-[20px] font-black text-white truncate tracking-wide">{title}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1">CERTIFICATE NO.</div>
            <div className="px-3 py-1.5 rounded-xl border border-white/15 bg-white/[0.03] text-white text-[11px] font-mono font-black">#0001</div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-3 w-full">
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-0.5">OWNER ADDRESS</div><div className="text-[13px] text-white/80 font-mono font-bold truncate tracking-wide">{owner}</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-0.5">LEGAL CREATOR</div><div className="text-[13px] text-white font-bold truncate tracking-wide">Aether Prof</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-0.5">VAULT STATUS</div><div className="text-[11px] text-emerald-400 font-mono font-black tracking-wider flex items-center gap-1">● Authenticated & Verified</div></div>
          <div><div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-0.5">REGISTRATION DATE</div><div className="text-[11px] text-white/70 font-mono font-bold">{date}</div></div>
        </div>

        <div className="py-3 border-t border-b border-white/[0.08] w-full">
          <div className="text-[9px] tracking-[0.35em] text-white/40 font-black mb-1">CRYPTOGRAPHIC IMMUTABILITY STATEMENT</div>
          <div className="text-[10px] leading-relaxed text-white/50 font-medium font-sans">This legal artifact asset is permanently secured via end-to-end cryptographic primitives and timestamped on-chain. Molecular ownership records are absolute, immutable, and non-fungible.</div>
        </div>

        <div className="flex items-center justify-between w-full pt-2">
          <div><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">TOKEN ID</div><div className="text-[10px] text-white/60 font-mono font-black mt-0.5">#{certificateId}</div></div>
          <div><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">NETWORK PROT.</div><div className="text-[10px] text-white/60 font-mono font-black mt-0.5">BSC TESTNET</div></div>
          <div className="max-w-[190px]"><div className="text-[8px] tracking-[0.35em] text-white/30 font-black">SMART CONTRACT</div><div className="text-[9px] text-white/50 font-mono mt-0.5 truncate">{CONTRACT_ADDRESS}</div></div>
        </div>
      </div>
      {/* PANEL TAMPILAN KANAN GRAPHIC GLASS */}
      <div className="absolute right-[64px] top-[225px] w-[480px] h-[440px] z-20 flex items-center justify-center">
        <div className="absolute inset-0 rounded-[36px] border border-white/[0.06] bg-[#070911]/40 shadow-[0_30px_60px_rgba(0,0,0,0.3)] overflow-hidden" />
        
        <div className="relative w-[380px] h-[380px] flex items-center justify-center">
          <svg viewBox="0 0 400 400" className="w-full h-full">
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
            </defs>

            <g opacity="0.15" stroke="#ffffff" strokeWidth="0.75">
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

            <g className="av-shield-glow">
              <path d="M200,155 C214,155 226,149 226,149 C226,176 219,210 200,228 C181,210 174,176 174,149 C174,149 186,155 200,155 Z" fill="url(#av-glass-frost)" stroke="#ffffff" strokeWidth="1.5" opacity="0.85" />
              <path d="M195,182 C195,177 198,173 203,173 C206,173 208,175 209,177 M205,187 C205,192 201,195 196,195 C193,195 191,193 190,191" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" opacity="0.95" />
              <circle cx="200" cy="185" r="4.5" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.95" />
            </g>
          </svg>
        </div>
        
        <div className="absolute top-[24px] left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-xl shadow-sm text-white/90">
            {CatIcon}<span className="text-[10px] tracking-[0.25em]">AUTHENTICATED</span>
          </div>
        </div>
        <div className="absolute bottom-[24px] left-[32px]">
          <div className="text-[8px] tracking-[0.35em] text-white/30 font-black">DIGITAL ARTIFACT</div>
          <div className="text-[13px] text-white/70 font-black mt-1 tracking-wide">AETHER PROF PROOF</div>
        </div>
        <div className="absolute bottom-[24px] right-[32px] text-right">
          <div className="text-[8px] tracking-[0.35em] text-white/30 font-black">SERIAL REG.</div>
          <div className="text-[12px] text-white/80 font-mono font-black mt-1">#0001</div>
        </div>
      </div>

      {/* FOOTER BAR */}
      <div className="absolute left-[64px] right-[64px] bottom-[55px] z-20 flex items-center justify-between">
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

      <div className="absolute bottom-[24px] left-[64px] right-[64px] flex items-center justify-between text-[7px] font-mono tracking-[0.3em] text-white/20 z-20">
        <span>VERIFIABLE • IMMUTABLE • SECURED FOREVER</span>
        <span className="text-white/30 font-black">POWERED BY AETHERVAULT PROTOCOL</span>
        <span>Encrypted On-Chain Data</span>
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
      // Menggunakan html-to-image (toPng)
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
      // Menggunakan html-to-image (toPng) kemudian dimasukkan ke jsPDF
      const dataUrl = await toPng(certificateRef.current, { cacheBust: true, backgroundColor: '#06070d', pixelRatio: 2 });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (760 * pdfWidth) / 1200; // Skala aspect ratio original 1200x760
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`VAULT-CERT-${selectedCertificate.capsuleId}.pdf`);
    } catch (err) { 
      console.error("Export PDF gagal", err); 
      alert("Gagal Export PDF: " + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative flex flex-col items-center bg-[#05030F] border border-cyan-500/30 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.3)] max-w-[95vw] max-h-[95vh] overflow-hidden">
        <div className="w-full flex justify-between items-center p-4 border-b border-cyan-900/50 bg-black/40">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-white font-mono">Vault Certificate <span className="text-cyan-400">#{selectedCertificate.capsuleId}</span></h3>
          </div>
          <button onClick={() => setSelectedCertificate(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-neutral-800/50 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"><X className="w-5 h-5" /></button>
        </div>
        
        {/* FIX CENTERING: Posisi skalasi pas di tengah */}
        <div className="w-full flex-1 overflow-auto custom-scrollbar flex items-center justify-center bg-[#020207] p-4 min-h-[550px]">
          <div style={{ width: '780px', height: '494px', position: 'relative' }} className="shrink-0">
            <div className="absolute top-0 left-0" style={{ width: '1200px', height: '760px', transform: 'scale(0.65)', transformOrigin: 'top left' }}>
              <CertificateTemplate ref={certificateRef} data={selectedCertificate} networkName={TARGET_CHAIN_NAME} />
            </div>
          </div>
        </div>

        <div className="w-full flex flex-wrap items-center justify-center gap-4 p-5 border-t border-cyan-900/50 bg-black/40">
          <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-amber-500/30 hover:border-amber-400/60 text-amber-300 text-xs font-bold transition-all shadow-sm cursor-pointer"><Download className="w-4 h-4" /> Save PDF</button>
          <button onClick={handleDownloadPNG} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 border border-cyan-500/30 hover:border-cyan-400/60 text-cyan-300 text-xs font-bold transition-all shadow-sm cursor-pointer"><ImageIcon className="w-4 h-4" /> Save PNG</button>
        </div>
      </div>
    </div>
  );
}
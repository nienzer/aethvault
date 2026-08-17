import React, { useRef } from 'react';
import { Award, Download, Image as ImageIcon, X, Shield, KeyRound, Box, Sparkles, Hexagon, ShieldCheck, Activity } from 'lucide-react';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import QRCode from 'react-qr-code';

const AETHER_LOGO = "/logo.png";
const CONTRACT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265"; 

const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Unknown';

// =========================================================
// ULTRA-PREMIUM GLASSMORPHIC CERTIFICATE TEMPLATE - VAULT
// =========================================================
const CertificateTemplate = React.forwardRef(({ data, networkName }, ref) => {
  const certificateId = data?.capsuleId || "PENDING";
  const owner = formatAddressFunc(data?.owner);
  const category = data?.tier || "Vault";
  const isLegacy = data?.isLegacy;
  const date = data?.creationTimestamp ? new Date(data.creationTimestamp * 1000).toLocaleDateString("en-GB") : new Date().toLocaleDateString("en-GB");
  
  const title = isLegacy ? "Legacy Vault Capsule" : "Time-Locked Vault Capsule";
  const description = "Highly secured cryptographic vault encrypted via ECIES and locked on the Binance Smart Chain.";
  const verifyUrl = `https://testnet.bscscan.com/address/${CONTRACT_ADDRESS}`;
  const fileHash = "Encrypted On-Chain Data";

  let catColor = "#00ffcc";
  let CatIcon = <Shield className="w-4 h-4 text-[#00ffcc]" />;
  if (category === "VIP") { catColor = "#0066ff"; CatIcon = <Shield className="w-4 h-4 text-[#0066ff]" />; }
  else if (category === "Eternal") { catColor = "#a855f7"; CatIcon = <Activity className="w-4 h-4 text-purple-400" />; }
  else if (category === "Legacy") { catColor = "#ec4899"; CatIcon = <KeyRound className="w-4 h-4 text-pink-400" />; }

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
        @media (prefers-reduced-motion: reduce) { .av-orbit,.av-orbit-reverse,.av-logo-pulse,.av-sweep,.av-pulse { animation:none !important; } }
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
            <span className="text-[9px] font-black tracking-[0.2em] text-purple-300">{String(networkName).toUpperCase()}</span>
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
          VAULT CERTIFICATE
        </h1>
        <p className="text-[10px] text-neutral-400 tracking-[0.22em] mt-1 font-mono">CRYPTOGRAPHIC PROOF OF CAPSULE OWNERSHIP</p>
      </div>

      {/* LEFT CONTENT PANEL - GLASSMORPHISM CARD */}
      <div className="absolute left-[64px] top-[245px] w-[560px] h-[390px] z-20 rounded-[24px] border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl p-7 shadow-[0_25px_50px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.05)]">
        <div className="flex justify-between items-start pb-5 border-b border-white/[0.06]">
          <div className="min-w-0 pr-5">
            <div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-2">VAULT TYPE</div>
            <div className="text-[19px] font-black text-white truncate tracking-wide">{title}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-2">CAPSULE NO.</div>
            <div className="px-3 py-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/[0.03] text-cyan-300 text-[11px] font-mono font-black shadow-[0_0_15px_rgba(6,182,212,0.1)]">
              #{certificateId}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 pt-6">
          <div><div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-1.5">OWNER</div><div className="text-[13px] text-white font-bold truncate tracking-wide">{owner}</div></div>
          <div><div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-1.5">WALLET</div><div className="text-[11px] text-cyan-300 font-mono truncate tracking-wide">{data?.owner || "0x00...00"}</div></div>
          <div><div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-1.5">CATEGORY / TIER</div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-[0_5px_15px_rgba(0,0,0,0.3)]" style={{ color: catColor, borderColor: `${catColor}44`, background: `linear-gradient(135deg, ${catColor}08, ${catColor}15)` }}>
              {CatIcon}<span className="text-[9px] font-black tracking-[0.25em]">{category.toUpperCase()}</span>
            </div>
          </div>
          <div><div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-1.5">DATE ISSUED</div><div className="text-[11px] text-neutral-200 font-mono font-bold">{date}</div></div>
        </div>

        <div className="mt-7 pt-5 border-t border-white/[0.06]">
          <div className="text-[8px] tracking-[0.3em] text-neutral-500 font-bold mb-2">DESCRIPTION</div>
          <div className="text-[10px] leading-relaxed text-neutral-400 font-medium">{description}</div>
        </div>

        <div className="absolute bottom-5 left-7 right-7 flex items-center justify-between">
          <div><div className="text-[7px] tracking-[0.3em] text-neutral-600 font-bold">CAPSULE ID</div><div className="text-[10px] text-purple-400 font-mono font-bold mt-1">#{certificateId}</div></div>
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
          
          <div className="relative z-10 w-[96px] h-[96px] flex items-center justify-center bg-gradient-to-tr from-cyan-500/10 to-purple-500/10 border border-white/10 rounded-2xl shadow-xl av-logo-pulse">
            <img src={AETHER_LOGO} alt="Logo" className="w-16 h-16 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
          </div>
        </div>
        
        {/* Lencana Atas & Bawah Panel Kanan */}
        <div className="absolute top-[22px] left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-xl shadow-[0_5px_15px_rgba(0,0,0,0.3)]" style={{ color: catColor, borderColor: `${catColor}44`, background: `linear-gradient(135deg, ${catColor}08, ${catColor}15)` }}>
            {CatIcon}<span className="text-[10px] font-black tracking-[0.25em]">SECURED VAULT</span>
          </div>
        </div>
        <div className="absolute bottom-[22px] left-[32px]">
          <div className="text-[7px] tracking-[0.32em] text-neutral-600 font-bold">DIGITAL ARTIFACT</div>
          <div className="text-[12px] text-white font-black mt-1 tracking-wide">AETHERVAULT PROOF</div>
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
        <span>{fileHash}</span>
      </div>
      
      <div className="absolute top-0 bottom-0 left-0 w-[150px] bg-gradient-to-r from-transparent via-cyan-400/[0.05] to-transparent skew-x-[-18deg] pointer-events-none av-sweep" />
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
import React, { useRef } from 'react';
import { Award, Download, Image as ImageIcon, X, Shield, KeyRound, Box, Sparkles, Hexagon, ShieldCheck, Activity } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'react-qr-code';

const AETHER_LOGO = "/logo.png";
const CONTRACT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265"; 

const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Unknown';

// =========================================================
// PREMIUM CERTIFICATE TEMPLATE UNTUK VAULT
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

  let catColor = "#60a5fa";
  let CatIcon = <Shield className="w-4 h-4 text-blue-400" />;
  if (category === "VIP") { catColor = "#22d3ee"; CatIcon = <Shield className="w-4 h-4 text-cyan-400" />; }
  else if (category === "Eternal") { catColor = "#fbbf24"; CatIcon = <Activity className="w-4 h-4 text-amber-400" />; }
  else if (category === "Legacy") { catColor = "#f472b6"; CatIcon = <KeyRound className="w-4 h-4 text-pink-400" />; }

  return (
    <div id="cert-export-node" ref={ref} className="relative mx-auto shrink-0 overflow-hidden w-[1200px] h-[760px] rounded-[28px] border border-amber-300/20 bg-[#020207] text-white font-sans shadow-[0_0_100px_rgba(0,0,0,.95)]">
      <style>{`
        @keyframes av-orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes av-orbit-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
        @keyframes av-logo-pulse { 0%,100% { transform: scale(0.97); filter: drop-shadow(0 0 12px rgba(251,191,36,.35)); } 50% { transform: scale(1.035); filter: drop-shadow(0 0 30px rgba(251,191,36,.9)); } }
        @keyframes av-sweep { 0%,55% { transform: translateX(-150%) skewX(-18deg); opacity:0; } 65% { opacity:.65; } 90%,100% { transform: translateX(260%) skewX(-18deg); opacity:0; } }
        @keyframes av-pulse { 0%,100% { opacity:.35; transform:scale(.96); } 50% { opacity:.9; transform:scale(1.04); } }
        .av-orbit { animation: av-orbit 13s linear infinite; }
        .av-orbit-reverse { animation: av-orbit-reverse 9s linear infinite; }
        .av-logo-pulse { animation: av-logo-pulse 3.8s ease-in-out infinite; }
        .av-sweep { animation: av-sweep 5s ease-in-out infinite; }
        .av-pulse { animation: av-pulse 3.5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .av-orbit,.av-orbit-reverse,.av-logo-pulse,.av-sweep,.av-pulse { animation:none !important; } }
      `}</style>
      <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 58% 45%, rgba(124,58,237,.12), transparent 28%), radial-gradient(circle at 90% 80%, rgba(6,182,212,.08), transparent 28%), radial-gradient(circle at 20% 10%, rgba(251,191,36,.07), transparent 24%), linear-gradient(135deg,#020207 0%,#080812 48%,#010105 100%)" }} />
      <div className="absolute inset-0 opacity-[.08] pointer-events-none" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.06) 1px, transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px)", backgroundSize: "32px 32px" }} />
      <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-violet-600/10 blur-[130px]" />
      <div className="absolute -bottom-48 -right-40 w-[560px] h-[560px] rounded-full bg-cyan-500/10 blur-[140px]" />
      <div className="absolute inset-[14px] rounded-[22px] border border-amber-300/15 pointer-events-none" />
      <div className="absolute inset-[22px] rounded-[18px] border border-white/[.035] pointer-events-none" />
      <div className="absolute top-[22px] left-[22px] w-12 h-12 border-t-2 border-l-2 border-amber-300/70 rounded-tl-xl" />
      <div className="absolute top-[22px] right-[22px] w-12 h-12 border-t-2 border-r-2 border-amber-300/70 rounded-tr-xl" />
      <div className="absolute bottom-[22px] left-[22px] w-12 h-12 border-b-2 border-l-2 border-amber-300/70 rounded-bl-xl" />
      <div className="absolute bottom-[22px] right-[22px] w-12 h-12 border-b-2 border-r-2 border-amber-300/70 rounded-br-xl" />
      <div className="absolute top-[48px] left-[58px] right-[58px] flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/[.035] border border-white/[.1] flex items-center justify-center shadow-[inset_0_0_24px_rgba(255,255,255,.03)]">
            <img src={AETHER_LOGO} alt="AetherVault" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <div className="font-black tracking-[.22em] text-[21px]">AETHER<span className="text-amber-300">VAULT</span></div>
            <div className="text-[8px] tracking-[.42em] text-neutral-500 font-mono mt-1">TRUSTLESS • VERIFIED • TIMELESS</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-full bg-emerald-500/[.07] border border-emerald-400/30 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_12px_rgba(52,211,153,.8)]" />
            <span className="text-[9px] font-bold tracking-[.18em] text-emerald-300">SECURED ON-CHAIN</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-amber-500/[.06] border border-amber-300/25">
            <span className="text-[9px] font-bold tracking-[.18em] text-amber-200">{String(networkName).toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div className="absolute top-[132px] left-[58px] z-20">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-12 h-px bg-gradient-to-r from-transparent to-amber-300" />
          <span className="text-[9px] tracking-[.48em] text-cyan-300 uppercase font-mono">Decentralized Vault Registry</span>
        </div>
        <h1 className="text-[34px] font-black tracking-[.16em] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-cyan-100">
          VAULT CERTIFICATE
        </h1>
        <p className="text-[11px] text-neutral-500 tracking-[.18em] mt-2">CRYPTOGRAPHIC PROOF OF CAPSULE OWNERSHIP</p>
      </div>
      <div className="absolute left-[58px] top-[238px] w-[560px] h-[390px] z-20 rounded-[24px] border border-white/[.08] bg-white/[.025] backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,.35)]">
        <div className="flex justify-between items-start pb-4 border-b border-white/[.07]">
          <div className="min-w-0 pr-5">
            <div className="text-[8px] tracking-[.3em] text-neutral-500 font-bold mb-2">VAULT TYPE</div>
            <div className="text-[18px] font-bold text-white truncate">{title}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[8px] tracking-[.3em] text-neutral-500 font-bold mb-2">CAPSULE ID</div>
            <div className="px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/[.04] text-cyan-300 text-[11px] font-mono font-bold">
              #{certificateId}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-5">
          <div><div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-1.5">CREATOR / OWNER</div><div className="text-[12px] text-white font-semibold truncate">{owner}</div></div>
          <div><div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-1.5">OWNER WALLET</div><div className="text-[11px] text-neutral-200 font-mono truncate">{data?.owner || "0x00...00"}</div></div>
          <div><div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-1.5">CATEGORY / TIER</div><div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ color: catColor, borderColor: `${catColor}55`, background: `${catColor}10` }}>{CatIcon}<span className="text-[9px] font-black tracking-[.18em]">{category.toUpperCase()}</span></div></div>
          <div><div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-1.5">ISSUED</div><div className="text-[11px] text-white font-mono">{date}</div></div>
        </div>
        <div className="mt-6 pt-5 border-t border-white/[.07]">
          <div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-2">DESCRIPTION</div>
          <div className="text-[10px] leading-relaxed text-neutral-300 line-clamp-2">{description}</div>
        </div>
        <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
          <div><div className="text-[7px] tracking-[.28em] text-neutral-600 font-bold">TOKEN ID</div><div className="text-[10px] text-cyan-300 font-mono mt-1">#{certificateId}</div></div>
          <div><div className="text-[7px] tracking-[.28em] text-neutral-600 font-bold">CHAIN ID</div><div className="text-[10px] text-amber-200 font-mono mt-1">97</div></div>
          <div className="max-w-[210px]"><div className="text-[7px] tracking-[.28em] text-neutral-600 font-bold">CONTRACT</div><div className="text-[9px] text-neutral-300 font-mono mt-1 truncate">{CONTRACT_ADDRESS}</div></div>
        </div>
      </div>
      <div className="absolute right-[58px] top-[226px] w-[470px] h-[430px] z-20">
        <div className="absolute inset-0 rounded-[30px] border border-cyan-300/15 bg-black/30 shadow-[0_0_80px_rgba(34,211,238,.08)] overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[.04] via-transparent to-violet-500/[.06]" /><div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" /></div>
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-amber-400/[.07] blur-[55px] av-pulse" />
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[210px] h-[210px] rounded-full bg-violet-500/[.08] blur-[45px]" />
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[290px] h-[290px] rounded-full border border-cyan-300/15 av-orbit"><div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,1)]" /></div>
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[230px] h-[230px] rounded-full border border-amber-300/20 border-dashed av-orbit-reverse"><div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,1)]" /></div>
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[164px] h-[164px] rounded-full bg-black/80 border border-amber-200/20 flex items-center justify-center shadow-[inset_0_0_45px_rgba(251,191,36,.08),0_0_50px_rgba(251,191,36,.12)]"><div className="absolute inset-3 rounded-full border border-white/[.07]" /><div className="absolute inset-5 rounded-full border border-cyan-300/20 av-orbit-reverse" /><div className="absolute inset-8 rounded-full bg-amber-300/[.06] blur-xl av-pulse" /><img src={AETHER_LOGO} alt="AetherVault AETH" className="relative z-10 w-[86px] h-[86px] object-contain av-logo-pulse" /></div>
        <div className="absolute top-[18px] left-1/2 -translate-x-1/2"><div className="flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-xl shadow-[0_0_25px_rgba(255,255,255,.06)]" style={{ color: catColor, borderColor: `${catColor}66`, background: `${catColor}12` }}>{CatIcon}<span className="text-[10px] font-black tracking-[.25em]">SECURED VAULT</span></div></div>
        <div className="absolute bottom-[18px] left-[28px]"><div className="text-[7px] tracking-[.32em] text-neutral-600 font-bold">DIGITAL ARTIFACT</div><div className="text-[12px] text-white font-bold mt-1">AETHERVAULT PROOF</div></div>
        <div className="absolute bottom-[18px] right-[28px] text-right"><div className="text-[7px] tracking-[.32em] text-neutral-600 font-bold">SERIAL</div><div className="text-[11px] text-amber-200 font-mono font-bold mt-1">#{certificateId}</div></div>
      </div>
      <div className="absolute left-[58px] right-[58px] bottom-[50px] z-20 flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl border border-emerald-400/20 bg-emerald-400/[.04] flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-emerald-300" /></div><div><div className="text-[8px] tracking-[.28em] text-neutral-600 font-bold">AUTHENTICITY STATUS</div><div className="text-[10px] text-emerald-300 font-bold tracking-[.12em] mt-1">100% VERIFIABLE ON-CHAIN</div></div></div>
        <div className="flex items-center gap-3"><div className="text-right"><div className="text-[7px] tracking-[.28em] text-neutral-600 font-bold">VERIFY CERTIFICATE</div><div className="text-[8px] text-cyan-300 font-mono mt-1">SCAN TO VERIFY</div></div><div className="w-[66px] h-[66px] rounded-xl bg-white p-1.5 shadow-[0_0_30px_rgba(34,211,238,.12)]"><QRCode value={verifyUrl} size={54} bgColor="#ffffff" fgColor="#050505" level="Q" /></div></div>
      </div>
      <div className="absolute bottom-[25px] left-[58px] right-[58px] flex items-center justify-between text-[7px] font-mono tracking-[.22em] text-neutral-600 z-20">
        <span>VERIFIABLE • IMMUTABLE • FOREVER</span><span className="text-amber-300/70">POWERED BY AETHERVAULT PROTOCOL</span><span>{fileHash}</span>
      </div>
      <div className="absolute top-0 bottom-0 left-0 w-[120px] bg-gradient-to-r from-transparent via-white/[.07] to-transparent skew-x-[-18deg] pointer-events-none av-sweep" />
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
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, backgroundColor: '#020207' });
      const link = document.createElement('a');
      link.download = `VAULT-CERT-${selectedCertificate.capsuleId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { console.error("Export PNG gagal", err); if (showToast) showToast("Gagal menyimpan PNG", "error"); }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      if (showToast) showToast("Menyiapkan file PDF...", "info");
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, backgroundColor: '#020207' });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`VAULT-CERT-${selectedCertificate.capsuleId}.pdf`);
    } catch (err) { console.error("Export PDF gagal", err); if (showToast) showToast("Gagal menyimpan PDF", "error");}
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
        <div className="w-full flex-1 overflow-auto custom-scrollbar p-6 flex justify-center bg-[#020207] shadow-inner">
          <div className="mx-auto shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-[28px] shrink-0" style={{ transform: `scale(0.65)`, width: '1200px', height: '760px', marginBottom: `calc((0.65 - 1) * 760px)`, marginRight: `calc((0.65 - 1) * 1200px)`, transformOrigin: 'top center' }}>
            <CertificateTemplate ref={certificateRef} data={selectedCertificate} networkName={TARGET_CHAIN_NAME} />
          </div>
        </div>
        <div className="w-full flex flex-wrap items-center justify-center gap-4 p-5 border-t border-cyan-900/50 bg-black/40">
          <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold transition-all cursor-pointer shadow-lg">
            <Download className="w-4 h-4" /> Cetak / Save ke PDF (HD)
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Award, Search, Filter, Eye, Hash, Calendar, Hexagon, ShieldCheck, Loader2, X, Download, Image as ImageIcon, ExternalLink, Globe, Sparkles, Box, Building2, Camera, Code2, Film, Microscope, Music, Palette, Scale, BookOpen, CheckCircle2 } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AetherVaultV3Artifact from '@/contracts/AetherVaultV3ABI.json';
import { useLanguage } from '@/context/LanguageContext';

const AetherVaultV3ABI = AetherVaultV3Artifact.abi || AetherVaultV3Artifact;
const AETHER_VAULT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265";
const READ_ONLY_RPC_URL = "https://bsc-testnet-rpc.publicnode.com";

const formatAddressFunc = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Unknown';

// =========================================================
// PREMIUM CERTIFICATE TEMPLATE UNTUK AETHER PROOF (NFT)
// =========================================================
const CertificateTemplate = React.forwardRef(({ proofData, categoryConfig, AETHER_LOGO = "/logo.png" }, ref) => {
  const catKey = (proofData?.category || "Software").toLowerCase().trim();
  const rawCatObj = categoryConfig ? Object.entries(categoryConfig).find(([key]) => key.toLowerCase() === catKey) : null;
  
  const cat = rawCatObj ? rawCatObj[1] : { badge: "Verified Creator", badgeLabel: "AUTHENTIC", label: "AUTHENTIC", icon: <Sparkles className="w-4 h-4" />, color: "#60a5fa" };
  const CatIcon = cat.icon ? React.cloneElement(cat.icon, { className: "w-4 h-4", style: { color: cat.color } }) : <Sparkles className="w-4 h-4" style={{ color: cat.color }} />;

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

  const badgeText = cat.badgeLabel || cat.label?.toUpperCase() || cat.badge || "AUTHENTIC";

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
      `}</style>

      {/* BACKGROUND HOLOGRAM */}
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

      {/* HEADER */}
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
            <span className="text-[9px] font-bold tracking-[.18em] text-emerald-300">VERIFIED ON-CHAIN</span>
          </div>
          <div className="px-4 py-2 rounded-full bg-amber-500/[.06] border border-amber-300/25">
            <span className="text-[9px] font-bold tracking-[.18em] text-amber-200">{String(network).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div className="absolute top-[132px] left-[58px] z-20">
        <div className="flex items-center gap-3 mb-3">
          <span className="w-12 h-px bg-gradient-to-r from-transparent to-amber-300" />
          <span className="text-[9px] tracking-[.48em] text-cyan-300 uppercase font-mono">Blockchain Verified • NFT Certificate</span>
        </div>
        <h1 className="text-[34px] font-black tracking-[.16em] text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-cyan-100">
          CERTIFICATE OF AUTHENTICITY
        </h1>
        <p className="text-[11px] text-neutral-500 tracking-[.18em] mt-2">IMMUTABLE DIGITAL PROOF OF OWNERSHIP & AUTHENTICITY</p>
      </div>

      {/* LEFT DATA PANEL */}
      <div className="absolute left-[58px] top-[238px] w-[560px] h-[390px] z-20 rounded-[24px] border border-white/[.08] bg-white/[.025] backdrop-blur-xl p-6 shadow-[0_20px_60px_rgba(0,0,0,.35)]">
        <div className="flex justify-between items-start pb-4 border-b border-white/[.07]">
          <div className="min-w-0 pr-5">
            <div className="text-[8px] tracking-[.3em] text-neutral-500 font-bold mb-2">ASSET TITLE</div>
            <div className="text-[18px] font-bold text-white truncate">{title}</div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-[8px] tracking-[.3em] text-neutral-500 font-bold mb-2">CERTIFICATE ID</div>
            <div className="px-3 py-1.5 rounded-lg border border-cyan-400/20 bg-cyan-400/[.04] text-cyan-300 text-[11px] font-mono font-bold">
              #{certificateId}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-5 pt-5">
          <div>
            <div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-1.5">CREATOR / USERNAME</div>
            <div className="text-[12px] text-white font-semibold truncate">{creator}</div>
          </div>
          <div>
            <div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-1.5">OWNER WALLET</div>
            <div className="text-[11px] text-neutral-200 font-mono truncate">{owner}</div>
          </div>
          <div>
            <div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-1.5">CATEGORY / BADGE</div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border" style={{ color: cat.color || "#60a5fa", borderColor: `${cat.color || "#60a5fa"}55`, background: `${cat.color || "#60a5fa"}10` }}>
              {CatIcon}
              <span className="text-[9px] font-black tracking-[.18em]">{badgeText}</span>
            </div>
          </div>
          <div>
            <div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-1.5">ISSUED</div>
            <div className="text-[11px] text-white font-mono">{date}</div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-white/[.07]">
          <div className="text-[8px] tracking-[.28em] text-neutral-500 font-bold mb-2">DESCRIPTION</div>
          <div className="text-[10px] leading-relaxed text-neutral-300 line-clamp-2">
            {proofData?.description || "Authentic digital asset secured and verified permanently on the decentralized network."}
          </div>
        </div>

        <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between">
          <div>
            <div className="text-[7px] tracking-[.28em] text-neutral-600 font-bold">TOKEN ID</div>
            <div className="text-[10px] text-cyan-300 font-mono mt-1">#{tokenId}</div>
          </div>
          <div>
            <div className="text-[7px] tracking-[.28em] text-neutral-600 font-bold">CHAIN ID</div>
            <div className="text-[10px] text-amber-200 font-mono mt-1">97</div>
          </div>
          <div className="max-w-[210px]">
            <div className="text-[7px] tracking-[.28em] text-neutral-600 font-bold">CONTRACT</div>
            <div className="text-[9px] text-neutral-300 font-mono mt-1 truncate">{contract}</div>
          </div>
        </div>
      </div>

      {/* RIGHT NFT ARTIFACT */}
      <div className="absolute right-[58px] top-[226px] w-[470px] h-[430px] z-20">
        <div className="absolute inset-0 rounded-[30px] border border-cyan-300/15 bg-black/30 shadow-[0_0_80px_rgba(34,211,238,.08)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[.04] via-transparent to-violet-500/[.06]" />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
        </div>
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[260px] h-[260px] rounded-full bg-amber-400/[.07] blur-[55px] av-pulse" />
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[210px] h-[210px] rounded-full bg-violet-500/[.08] blur-[45px]" />
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[290px] h-[290px] rounded-full border border-cyan-300/15 av-orbit">
          <div className="absolute -top-1 left-1/2 w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_18px_rgba(103,232,249,1)]" />
        </div>
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[230px] h-[230px] rounded-full border border-amber-300/20 border-dashed av-orbit-reverse">
          <div className="absolute top-1/2 -right-1 w-2 h-2 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,1)]" />
        </div>
        <div className="absolute left-1/2 top-[43%] -translate-x-1/2 -translate-y-1/2 w-[164px] h-[164px] rounded-full bg-black/80 border border-amber-200/20 flex items-center justify-center shadow-[inset_0_0_45px_rgba(251,191,36,.08),0_0_50px_rgba(251,191,36,.12)]">
          <div className="absolute inset-3 rounded-full border border-white/[.07]" />
          <div className="absolute inset-5 rounded-full border border-cyan-300/20 av-orbit-reverse" />
          <div className="absolute inset-8 rounded-full bg-amber-300/[.06] blur-xl av-pulse" />
          <img src={AETHER_LOGO} alt="AetherVault AETH" className="relative z-10 w-[86px] h-[86px] object-contain av-logo-pulse" />
        </div>

        <div className="absolute top-[18px] left-1/2 -translate-x-1/2">
          <div className="flex items-center gap-2 px-5 py-2 rounded-full border backdrop-blur-xl shadow-[0_0_25px_rgba(255,255,255,.06)]" style={{ color: cat.color || "#60a5fa", borderColor: `${cat.color || "#60a5fa"}66`, background: `${cat.color || "#60a5fa"}12` }}>
            {CatIcon}
            <span className="text-[10px] font-black tracking-[.25em]">{badgeText}</span>
          </div>
        </div>
        <div className="absolute bottom-[18px] left-[28px]"><div className="text-[7px] tracking-[.32em] text-neutral-600 font-bold">DIGITAL ARTIFACT</div><div className="text-[12px] text-white font-bold mt-1">AETHERVAULT PROOF</div></div>
        <div className="absolute bottom-[18px] right-[28px] text-right"><div className="text-[7px] tracking-[.32em] text-neutral-600 font-bold">SERIAL</div><div className="text-[11px] text-amber-200 font-mono font-bold mt-1">#{certificateId}</div></div>
      </div>

      {/* QR + VERIFICATION */}
      <div className="absolute left-[58px] right-[58px] bottom-[50px] z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl border border-emerald-400/20 bg-emerald-400/[.04] flex items-center justify-center"><ShieldCheck className="w-4 h-4 text-emerald-300" /></div>
          <div><div className="text-[8px] tracking-[.28em] text-neutral-600 font-bold">AUTHENTICITY STATUS</div><div className="text-[10px] text-emerald-300 font-bold tracking-[.12em] mt-1">100% VERIFIABLE ON-CHAIN</div></div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right"><div className="text-[7px] tracking-[.28em] text-neutral-600 font-bold">VERIFY CERTIFICATE</div><div className="text-[8px] text-cyan-300 font-mono mt-1">SCAN TO VERIFY</div></div>
          <div className="w-[66px] h-[66px] rounded-xl bg-white p-1.5 shadow-[0_0_30px_rgba(34,211,238,.12)]"><QRCode value={verifyUrl} size={54} bgColor="#ffffff" fgColor="#050505" level="Q" /></div>
        </div>
      </div>
      <div className="absolute bottom-[25px] left-[58px] right-[58px] flex items-center justify-between text-[7px] font-mono tracking-[.22em] text-neutral-600 z-20">
        <span>VERIFIABLE • IMMUTABLE • FOREVER</span><span className="text-amber-300/70">POWERED BY AETHERVAULT PROTOCOL</span><span>{String(fileHash).slice(0, 22)}...</span>
      </div>
      <div className="absolute top-0 bottom-0 left-0 w-[120px] bg-gradient-to-r from-transparent via-white/[.07] to-transparent skew-x-[-18deg] pointer-events-none av-sweep" />
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
        const category = args[2] || "Software";
        const ownerWallet = args[1];
        
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
              // FIX: Pastikan yang ditarik bukan "Unknown Creator" bawaan gagal
              if (creatorAttr && creatorAttr.value && creatorAttr.value.trim() !== "" && creatorAttr.value !== "Unknown Creator") {
                extractedCreator = creatorAttr.value;
              }
            }
          }
        } catch (e) {
          console.warn("Gagal parse tokenURI untuk token", tokenId);
        }

        // Kalau kosong, otomatis ambil dari nama wallet yang dipendekkan
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
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, backgroundColor: '#020207' });
      const link = document.createElement('a');
      link.download = `AETH-PROOF-${selectedProof.tokenId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { 
      console.error("Export PNG gagal", err); 
      alert("Gagal Export: " + err.message + "\n(Jika ini error 'oklab', silakan update html2canvas atau cetak layar manual)");
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current || !selectedProof) return;
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 2, useCORS: true, backgroundColor: '#020207' });
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`AETH-PROOF-${selectedProof.tokenId}.pdf`);
    } catch (err) { 
      console.error("Export PDF gagal", err); 
      alert("Gagal Export: " + err.message + "\n(Jika ini error 'oklab', silakan update html2canvas atau cetak layar manual)");
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

      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
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

            {/* FIX CENTERING: Wrapper khusus agar skala selalu 100% pas di tengah */}
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
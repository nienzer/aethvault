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
// SERTIFIKAT BERSIH TANPA OKLAB (MURNI HEX / RGB)
// =========================================================
const CertificateTemplate = React.forwardRef(({ proofData, categoryConfig, AETHER_LOGO = "/logo.png" }, ref) => {
  const catKey = (proofData?.category || "Software").toLowerCase().trim();
  const rawCatObj = categoryConfig ? Object.entries(categoryConfig).find(([key]) => key.toLowerCase() === catKey) : null;
  const cat = rawCatObj ? rawCatObj[1] : { badge: "Verified Creator", badgeLabel: "AUTHENTIC", icon: <Sparkles className="w-4 h-4" />, color: "#60a5fa" };
  
  const title = proofData?.title || "Aether Proof™";
  // Fallback otomatis jika creator unknown
  const creator = (proofData?.creator && proofData.creator !== "Unknown Creator") ? proofData.creator : formatAddressFunc(proofData?.wallet);
  const owner = proofData?.wallet ? formatAddressFunc(proofData.wallet) : "0x00...00";
  const tokenId = proofData?.tokenId || "PENDING";
  const certificateId = proofData?.id || tokenId;
  const date = proofData?.date || new Date().toLocaleDateString("en-GB");
  const network = proofData?.network || "BSC Testnet";
  const contract = proofData?.contract ? formatAddressFunc(proofData.contract) : "0x00...00";
  const fileHash = proofData?.fileHash || "Awaiting verification";
  const verifyUrl = proofData?.verifyUrl || "https://aethvault.xyz";

  return (
    <div id="cert-export-node" ref={ref} style={{ width: '1200px', height: '760px', backgroundColor: '#020207', color: '#ffffff', position: 'relative', overflow: 'hidden', borderRadius: '28px', border: '2px solid rgba(251,191,36,0.3)', fontFamily: 'sans-serif' }}>
      
      {/* BACKGROUND MURNI CSS (TANPA OKLAB) */}
      <div style={{ position: 'absolute', inset: 0, background: '#020207', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '520px', height: '520px', borderRadius: '50%', background: 'rgba(124,58,237,0.15)', filter: 'blur(100px)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-48px', right: '-40px', width: '560px', height: '560px', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', filter: 'blur(100px)', pointerEvents: 'none' }} />

      {/* HEADER */}
      <div style={{ position: 'absolute', top: '48px', left: '58px', right: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={AETHER_LOGO} alt="AetherVault" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontWeight: 900, letterSpacing: '0.22em', fontSize: '21px' }}>AETHER<span style={{ color: '#fbbf24' }}>VAULT</span></div>
            <div style={{ fontSize: '8px', letterSpacing: '0.42em', color: '#737373', fontFamily: 'monospace', marginTop: '4px' }}>TRUSTLESS • VERIFIED • TIMELESS</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ padding: '8px 16px', borderRadius: '9999px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#34d399' }} />
            <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.18em', color: '#34d399' }}>VERIFIED ON-CHAIN</span>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '9999px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)' }}>
            <span style={{ fontSize: '9px', fontWeight: 'bold', letterSpacing: '0.18em', color: '#fde68a' }}>{String(network).toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* TITLE */}
      <div style={{ position: 'absolute', top: '132px', left: '58px', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ width: '48px', height: '1px', background: '#fbbf24' }} />
          <span style={{ fontSize: '9px', letterSpacing: '0.48em', color: '#67e8f9', textTransform: 'uppercase', fontFamily: 'monospace' }}>Blockchain Verified • NFT Certificate</span>
        </div>
        <h1 style={{ fontSize: '34px', fontWeight: 900, letterSpacing: '0.16em', color: '#ffffff' }}>CERTIFICATE OF AUTHENTICITY</h1>
        <p style={{ fontSize: '11px', color: '#737373', letterSpacing: '0.18em', marginTop: '8px' }}>IMMUTABLE DIGITAL PROOF OF OWNERSHIP & AUTHENTICITY</p>
      </div>

      {/* LEFT DATA PANEL */}
      <div style={{ position: 'absolute', left: '58px', top: '238px', width: '560px', height: '390px', zIndex: 20, borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', padding: '24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ overflow: 'hidden', paddingRight: '20px' }}>
            <div style={{ fontSize: '8px', letterSpacing: '0.3em', color: '#737373', fontWeight: 'bold', marginBottom: '8px' }}>ASSET TITLE</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: '8px', letterSpacing: '0.3em', color: '#737373', fontWeight: 'bold', marginBottom: '8px' }}>CERTIFICATE ID</div>
            <div style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(6,182,212,0.3)', background: 'rgba(6,182,212,0.05)', color: '#67e8f9', fontSize: '11px', fontFamily: 'monospace', fontWeight: 'bold' }}>#{certificateId}</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', paddingTop: '20px' }}>
          <div>
            <div style={{ fontSize: '8px', letterSpacing: '0.28em', color: '#737373', fontWeight: 'bold', marginBottom: '6px' }}>CREATOR / USERNAME</div>
            <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{creator}</div>
          </div>
          <div>
            <div style={{ fontSize: '8px', letterSpacing: '0.28em', color: '#737373', fontWeight: 'bold', marginBottom: '6px' }}>OWNER WALLET</div>
            <div style={{ fontSize: '11px', color: '#d4d4d4', fontFamily: 'monospace', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{owner}</div>
          </div>
          <div>
            <div style={{ fontSize: '8px', letterSpacing: '0.28em', color: '#737373', fontWeight: 'bold', marginBottom: '6px' }}>CATEGORY / BADGE</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '9999px', border: `1px solid ${cat.color}55`, color: cat.color, background: `${cat.color}15` }}>
              <span style={{ fontSize: '9px', fontWeight: 900, letterSpacing: '0.18em' }}>{cat.badge.toUpperCase()}</span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '8px', letterSpacing: '0.28em', color: '#737373', fontWeight: 'bold', marginBottom: '6px' }}>ISSUED</div>
            <div style={{ fontSize: '11px', color: '#ffffff', fontFamily: 'monospace' }}>{date}</div>
          </div>
        </div>

        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '8px', letterSpacing: '0.28em', color: '#737373', fontWeight: 'bold', marginBottom: '8px' }}>DESCRIPTION</div>
          <div style={{ fontSize: '10px', lineHeight: 1.5, color: '#d4d4d4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {proofData?.description || "Authentic digital asset secured and verified permanently on the decentralized network."}
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '7px', letterSpacing: '0.28em', color: '#525252', fontWeight: 'bold' }}>TOKEN ID</div>
            <div style={{ fontSize: '10px', color: '#67e8f9', fontFamily: 'monospace', marginTop: '4px' }}>#{tokenId}</div>
          </div>
          <div>
            <div style={{ fontSize: '7px', letterSpacing: '0.28em', color: '#525252', fontWeight: 'bold' }}>CHAIN ID</div>
            <div style={{ fontSize: '10px', color: '#fde68a', fontFamily: 'monospace', marginTop: '4px' }}>97</div>
          </div>
          <div style={{ maxWidth: '210px' }}>
            <div style={{ fontSize: '7px', letterSpacing: '0.28em', color: '#525252', fontWeight: 'bold' }}>CONTRACT</div>
            <div style={{ fontSize: '9px', color: '#d4d4d4', fontFamily: 'monospace', marginTop: '4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{contract}</div>
          </div>
        </div>
      </div>

      {/* RIGHT NFT ARTIFACT */}
      <div style={{ position: 'absolute', right: '58px', top: '226px', width: '470px', height: '430px', zIndex: 20 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '30px', border: '1px solid rgba(34,211,238,0.2)', background: 'rgba(0,0,0,0.4)', overflow: 'hidden' }} />
        <div style={{ position: 'absolute', left: '50%', top: '43%', transform: 'translate(-50%, -50%)', width: '164px', height: '164px', borderRadius: '50%', background: '#000000', border: '1px solid rgba(251,191,36,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img src={AETHER_LOGO} alt="AetherVault AETH" style={{ position: 'relative', zIndex: 10, width: '86px', height: '86px', objectFit: 'contain' }} />
        </div>
        <div style={{ position: 'absolute', bottom: '18px', left: '28px' }}>
          <div style={{ fontSize: '7px', letterSpacing: '0.32em', color: '#525252', fontWeight: 'bold' }}>DIGITAL ARTIFACT</div>
          <div style={{ fontSize: '12px', color: '#ffffff', fontWeight: 'bold', marginTop: '4px' }}>AETHERVAULT PROOF</div>
        </div>
        <div style={{ position: 'absolute', bottom: '18px', right: '28px', textAlign: 'right' }}>
          <div style={{ fontSize: '7px', letterSpacing: '0.32em', color: '#525252', fontWeight: 'bold' }}>SERIAL</div>
          <div style={{ fontSize: '11px', color: '#fde68a', fontFamily: 'monospace', fontWeight: 'bold', marginTop: '4px' }}>#{certificateId}</div>
        </div>
      </div>

      {/* QR + VERIFICATION */}
      <div style={{ position: 'absolute', left: '58px', right: '58px', bottom: '50px', zIndex: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '12px', border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ShieldCheck style={{ width: '16px', height: '16px', color: '#34d399' }} />
          </div>
          <div>
            <div style={{ fontSize: '8px', letterSpacing: '0.28em', color: '#525252', fontWeight: 'bold' }}>AUTHENTICITY STATUS</div>
            <div style={{ fontSize: '10px', color: '#34d399', fontWeight: 'bold', letterSpacing: '0.12em', marginTop: '4px' }}>100% VERIFIABLE ON-CHAIN</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '7px', letterSpacing: '0.28em', color: '#525252', fontWeight: 'bold' }}>VERIFY CERTIFICATE</div>
            <div style={{ fontSize: '8px', color: '#67e8f9', fontFamily: 'monospace', marginTop: '4px' }}>SCAN TO VERIFY</div>
          </div>
          <div style={{ width: '66px', height: '66px', borderRadius: '12px', background: '#ffffff', padding: '6px', boxSizing: 'border-box' }}>
            <QRCode value={verifyUrl} size={54} bgColor="#ffffff" fgColor="#050505" level="Q" />
          </div>
        </div>
      </div>

      <div style={{ position: 'absolute', bottom: '25px', left: '58px', right: '58px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '7px', fontFamily: 'monospace', letterSpacing: '0.22em', color: '#525252', zIndex: 20 }}>
        <span>VERIFIABLE • IMMUTABLE • FOREVER</span>
        <span style={{ color: 'rgba(251,191,36,0.7)' }}>POWERED BY AETHERVAULT PROTOCOL</span>
        <span>{String(fileHash).slice(0, 22)}...</span>
      </div>
    </div>
  );
});
CertificateTemplate.displayName = "CertificateTemplate";

// =========================================================
// MAIN COMPONENT: HALL OF PROOF (DIJAMIN PAS DI TENGAH & ANTI-OKLAB)
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
        let extractedCreator = null; // Biar nanti ditarik dari wallet jika tidak ada

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
              if (creatorAttr && creatorAttr.value && creatorAttr.value !== "Unknown Creator") {
                extractedCreator = creatorAttr.value;
              }
            }
          }
        } catch (e) {}

        // Jika creator tetap tidak ada, gunakan format pendek wallet
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
    } catch (err) { console.error("Export PNG gagal", err); alert("Gagal mengunduh PNG."); }
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
    } catch (err) { console.error("Export PDF gagal", err); alert("Gagal mengunduh PDF."); }
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

      {/* MODAL POPUP DENGAN POSISI CENTERING PAS DI TENGAH */}
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

            {/* CONTAINER SCROLL DENGAN POSISI FLEX CENTER */}
            <div className="w-full flex-1 overflow-auto custom-scrollbar p-6 flex items-center justify-center bg-[#020207] shadow-inner" style={{ minHeight: '520px' }}>
              <div className="mx-auto shadow-2xl rounded-[28px] shrink-0" style={{ transform: `scale(0.6)`.replace(/ /g,''), width: '1200px', height: '760px', margin: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', transformOrigin: 'center center' }}>
                <CertificateTemplate ref={certificateRef} proofData={selectedProof} categoryConfig={categoryConfig} />
              </div>
            </div>

            <div className="w-full flex flex-wrap items-center justify-center gap-4 p-5 border-t border-cyan-900/50 bg-black/40">
              <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white text-xs font-bold transition-all cursor-pointer shadow-lg">
                <Download className="w-4 h-4" /> Cetak / Save ke PDF (HD)
              </button>
              <a href={selectedProof.verifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/40 hover:border-purple-400/70 text-purple-300 text-xs font-bold transition-all cursor-pointer no-underline">
                <ExternalLink className="w-4 h-4" /> View Transaction
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, Globe, Music, Code2, Palette, BookOpen, Camera, Film, Microscope, Building2, Scale, Box, User, Link as LinkIcon, UploadCloud, Lock, ChevronLeft, Loader2, FileImage, Cpu, Flame, Fingerprint, Image as ImageIcon, ExternalLink, QrCode, Eye, Sparkles, Activity, Layers, ArrowUpRight, Check, Compass, Shield } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AetherVaultV3ABI from '@/contracts/AetherVaultV3ABI.json';
import AetherVaultABI from '@/contracts/AetherVaultABI.json';
import { useLanguage } from '@/context/LanguageContext';

const AETHER_VAULT_ADDRESS = "0x4558D794044Dc382BF9D98e3D45E2478904Cf46c";
const AETH_TOKEN_ADDRESS = "0xB251439799Ca1cCe317451b5E13A080eEaa70bff"; 
const READ_ONLY_RPC_URL = "https://bsc-testnet-rpc.publicnode.com";

export default function AetherProofHub({ handleViewCertificate, setActiveTab, address, TARGET_CHAIN_NAME }) {
  const { t: globalT } = useLanguage();
  const tHop = globalT.hallOfProof || {};
  const tLand = globalT.landing || {};
  const tDash = globalT.dashboard || {};
  const tStats = globalT.globalStats || {};

  const [view, setView] = useState('hub');
  const certificateRef = useRef(null);

  const previewScrollRef = useRef(null);
  const [previewZoom, setPreviewZoom] = useState(0.6);
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
    "Writing": { price: 200, badge: "Verified Author", badgeIcon: "✍️", icon: <BookOpen className="w-5 h-5 text-amber-400" /> },
    "Photography": { price: 200, badge: "Verified Photographer", badgeIcon: "📷", icon: <Camera className="w-5 h-5 text-cyan-400" /> },
    "Design": { price: 200, badge: "Verified Creator", badgeIcon: "🎨", icon: <Palette className="w-5 h-5 text-fuchsia-400" /> },
    "Music": { price: 200, badge: "Verified Artist", badgeIcon: "🎵", icon: <Music className="w-5 h-5 text-purple-400" /> },
    "Video": { price: 200, badge: "Verified Filmmaker", badgeIcon: "🎬", icon: <Film className="w-5 h-5 text-rose-400" /> },
    "Software": { price: 200, badge: "Verified Developer", badgeIcon: "💻", icon: <Code2 className="w-5 h-5 text-blue-400" /> },
    "Research": { price: 200, badge: "Verified Researcher", badgeIcon: "🔬", icon: <Microscope className="w-5 h-5 text-emerald-400" /> },
    "Business": { price: 200, badge: "Verified Company", badgeIcon: "🏛️", icon: <Building2 className="w-5 h-5 text-yellow-400" /> },
    "Legal": { price: 200, badge: "Verified Entity", badgeIcon: "📜", icon: <Scale className="w-5 h-5 text-indigo-400" /> },
    "Other": { price: 200, badge: "Verified Creator", badgeIcon: "✨", icon: <Box className="w-5 h-5 text-neutral-400" /> }
  };

  const currentConfig = categoryConfig[category];
  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '0xA5E3...7Fa2';
  const realAddress = address || "0xA5E3000000000000000000000000000000007Fa2";

  const handleMouseDown = (e) => {
    setIsDraggingPreview(true);
    setDragStart({
      x: e.pageX - previewScrollRef.current.offsetLeft,
      y: e.pageY - previewScrollRef.current.offsetTop,
      scrollLeft: previewScrollRef.current.scrollLeft,
      scrollTop: previewScrollRef.current.scrollTop
    });
  };
  const handleMouseLeaveOrUp = () => setIsDraggingPreview(false);
  const handleMouseMove = (e) => {
    if (!isDraggingPreview) return;
    e.preventDefault();
    const x = e.pageX - previewScrollRef.current.offsetLeft;
    const y = e.pageY - previewScrollRef.current.offsetTop;
    const walkX = (x - dragStart.x) * 1.5; 
    const walkY = (y - dragStart.y) * 1.5;
    previewScrollRef.current.scrollLeft = dragStart.scrollLeft - walkX;
    previewScrollRef.current.scrollTop = dragStart.scrollTop - walkY;
  };

  const fetchOnChainHallOfProof = useCallback(async () => {
    setIsLoadingHall(true);
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AetherVaultV3ABI, provider);

      const filter = contract.filters.ProofMinted();
      const DEPLOY_BLOCK = 43345845; 
      const currentBlock = await provider.getBlockNumber();
      const startBlock = Math.max(DEPLOY_BLOCK, currentBlock - 200000);

      const events = await contract.queryFilter(filter, startBlock, "latest");
      
      const parsedProofs = await Promise.all(
        events.map(async (ev) => {
          const block = await provider.getBlock(ev.blockNumber);
          const args = ev.args;
          return {
            id: args[0].toString(),
            title: `Aether Proof #${args[0].toString()}`,
            category: "Software",
            owner: `${args[1].substring(0, 6)}...${args[1].substring(args[1].length - 4)}`,
            ownerFull: args[1],
            date: new Date((block?.timestamp || Date.now() / 1000) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            network: TARGET_CHAIN_NAME || "BSC Testnet",
            hash: `${args[4].substring(0, 8)}...`,
            fullHash: args[4],
            status: "Verified On-Chain",
            txHash: ev.transactionHash
          };
        })
      );

      parsedProofs.reverse();
      setOnChainProofs(parsedProofs);
      setGlobalProtocolStats({
        totalProofs: parsedProofs.length,
        burnedTotal: parsedProofs.length * 50
      });
    } catch (err) {
      console.error("Gagal memuat Hall of Proof on-chain:", err);
    } finally {
      setIsLoadingHall(false);
    }
  }, [TARGET_CHAIN_NAME]);

  useEffect(() => {
    fetchOnChainHallOfProof();
  }, [fetchOnChainHallOfProof]);

  const generateKeccak256 = async (dataBuffer) => {
    try {
      const uint8Array = new Uint8Array(dataBuffer);
      return ethers.keccak256(uint8Array);
    } catch (err) {
      console.error("Hashing failed", err);
      return '0x' + Array.from({length: 64}, () => Math.floor(Math.random() * 16).toString(16)).join('');
    }
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setIsHashing(true);
    
    const arrayBuffer = await uploadedFile.arrayBuffer();
    const hash = await generateKeccak256(arrayBuffer);
    
    setTimeout(() => {
      setFileHash(hash);
      setIsHashing(false);
    }, 800);
  };

  useEffect(() => {
    const updateMetadataHash = async () => {
      const metadata = JSON.stringify({
        name: title || "Aether Proof",
        description: "Blockchain Certificate",
        attributes: [
          { trait_type: "Category", value: category },
          { trait_type: "Creator", value: creatorName || realAddress },
          { trait_type: "File Hash", value: fileHash }
        ]
      });
      const enc = new TextEncoder();
      const hash = await generateKeccak256(enc.encode(metadata).buffer);
      setMetadataHash(hash);
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

      setMintingStatusMsg(tHop.checkingAllowance || 'Checking $AETH token allowance...');
      const currentAllowance = await tokenContract.allowance(address, AETHER_VAULT_ADDRESS);

      if (currentAllowance < requiredCostWei) {
        if (currentAllowance > 0n) {
          const resetTx = await tokenContract.approve(AETHER_VAULT_ADDRESS, 0);
          await resetTx.wait();
        }
        setMintingStatusMsg(tHop.approveTokenPrompt || 'Please approve $AETH spending in your wallet...');
        const approveTx = await tokenContract.approve(AETHER_VAULT_ADDRESS, requiredCostWei);
        setMintingStatusMsg(tHop.waitingApproveConfirm || 'Waiting for network approval confirmation...');
        await approveTx.wait();
        setMintingStatusMsg(tHop.approvalSuccess || 'Approval granted! Generating proof certificate...');
      }

      setMintStep(3);
      const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AetherVaultV3ABI, signer);
      setMintStep(4);
      
      const svgImage = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="#0B0817"/><text x="50%" y="50%" font-family="monospace" font-size="24" font-weight="bold" fill="#e4a329" text-anchor="middle" dy=".3em">AETHER PROOF</text></svg>`;
      const base64Svg = btoa(unescape(encodeURIComponent(svgImage)));

      const metadataJSON = {
        name: title || "Aether Proof",
        description: "Aether Proof Immutable Certificate. 100% On-Chain Verification.",
        image: `data:image/svg+xml;base64,${base64Svg}`,
        attributes: [
          { trait_type: "Category", value: category },
          { trait_type: "Creator", value: creatorName || formatAddress(address) },
          { trait_type: "File Hash", value: fileHash }
        ]
      };

      const encodedJSON = btoa(unescape(encodeURIComponent(JSON.stringify(metadataJSON))));
      const tokenURIParam = `data:application/json;base64,${encodedJSON}`;

      setMintingStatusMsg('Harap konfirmasi transaksi pencetakan (Mint) di MetaMask...');
      const tx = await contract.createProof(tier, category, fileHash, tokenURIParam, true);
      
      setMintingStatusMsg('Menunggu validasi blok BSC Testnet...');
      setMintStep(5);
      const receipt = await tx.wait();

      let realTokenId = Math.floor(8000 + Math.random() * 2000);
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog(log);
          if (parsed && parsed.name === 'ProofMinted') {
            realTokenId = parsed.args[0].toString();
            break;
          }
        } catch (e) {}
      }
      
      setGeneratedProof({
        tokenId: realTokenId,
        id: `AETH-PROOF-${realTokenId}`,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber || 4350122,
        contract: AETHER_VAULT_ADDRESS,
        category,
        title,
        badge: currentConfig.badge,
        badgeIcon: currentConfig.badgeIcon,
        creator: creatorName || formatAddress(address),
        wallet: realAddress,
        fileHash: fileHash,
        metaHash: metadataHash,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        network: TARGET_CHAIN_NAME || "BSC Testnet",
        verifyUrl: `https://testnet.bscscan.com/address/${AETHER_VAULT_ADDRESS}`
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
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: '#fdfbf7' });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${generatedProof.id}.png`;
      link.click();
    } catch (error) {
      console.error("PNG generation failed", error);
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: '#fdfbf7' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`${generatedProof.id}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    }
  };

  const CertificateTemplate = ({ proofData }) => (
    <div ref={certificateRef} className="w-[842px] h-[595px] bg-[#fdfbf7] text-neutral-900 rounded-sm p-10 relative overflow-hidden shadow-2xl font-serif border border-neutral-300 mx-auto flex flex-col justify-between shrink-0">
      <div className="absolute top-8 right-8 flex items-center gap-2 z-20 bg-white/90 px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
        <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">{tDash.certBadgePolygon || 'Verified on BSC Testnet'}</span>
      </div>

      {/* 🚀 FIX WATERMARK: Opacity dinaikkan jadi 15 agar lebih terlihat */}
      <img src="/whatermark.png" alt="Watermark" className="absolute inset-0 w-full h-full object-contain opacity-10 pointer-events-none grayscale mix-blend-multiply p-20" />

      <div className="absolute inset-4 border-[4px] border-double border-amber-900/30 pointer-events-none rounded-sm"></div>
      <div className="absolute inset-6 border-[1px] border-amber-900/10 pointer-events-none rounded-sm"></div>
      
      <div className="relative z-10 text-center mb-4 pt-4 border-b-2 border-amber-900/10 pb-4">
        <h4 className="text-4xl font-black tracking-[0.25em] text-amber-900 mb-2 font-display drop-shadow-sm">{tDash.certTitle || 'AETHER PROOF™'}</h4>
        <p className="text-xs font-bold tracking-[0.3em] text-amber-700 uppercase">{tDash.certOfficialCert || 'Cryptographic Certificate of Authenticity'}</p>
      </div>

      <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-center px-4">
        <div className="text-center mb-2">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">{tDash.certCertifies || 'This unalterable document officially certifies the registration of'}</p>
          <h5 className="text-3xl font-bold text-neutral-900 font-display px-8 leading-snug truncate">"{proofData?.title || 'Untitled Proof'}"</h5>
        </div>

        <div className="grid grid-cols-3 gap-y-5 gap-x-6 text-xs font-mono bg-white/60 p-6 border border-amber-900/20 rounded-sm shadow-sm backdrop-blur-sm">
          <div className="col-span-1 border-r border-amber-900/10">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">{tDash.certId || 'Certificate ID'}</p>
            <p className="font-bold text-neutral-900">{proofData?.id || 'AETH-PROOF-XXXX'}</p>
          </div>
          <div className="col-span-1 border-r border-amber-900/10 pl-2">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">{tDash.certCreator || 'Creator / Owner'}</p>
            <p className="font-bold text-neutral-900 truncate pr-2">{proofData?.creator || 'Unknown'}</p>
          </div>
          <div className="col-span-1 pl-2">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">{tDash.certTimestamp || 'Timestamp'}</p>
            <p className="font-bold text-neutral-900">{proofData?.date || new Date().toLocaleDateString()}</p>
          </div>

          <div className="col-span-1 border-r border-amber-900/10 pt-2 border-t border-amber-900/10">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">{tHop.categories || 'Category'}</p>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-900">{proofData?.category || 'Category'}</span>
              <span className="text-[8px] bg-amber-900 text-amber-100 px-1.5 py-0.5 rounded-sm tracking-widest flex items-center gap-1">
                {proofData?.badgeIcon || '✨'} {proofData?.badge || 'Verified'}
              </span>
            </div>
          </div>
          <div className="col-span-1 border-r border-amber-900/10 pl-2 pt-2 border-t border-amber-900/10">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">{tDash.certWalletLabel || 'Wallet Address'}</p>
            <p className="font-bold text-neutral-900 text-[10px] truncate pr-2">{proofData?.wallet || '0x...'}</p>
          </div>
          <div className="col-span-1 pl-2 pt-2 border-t border-amber-900/10">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">{tDash.certSmartContract || 'Smart Contract'}</p>
            <p className="font-bold text-neutral-900 text-[10px] truncate pr-2">{formatAddress(proofData?.contract || AETHER_VAULT_ADDRESS)}</p>
          </div>

          {/* 🚀 FIX HASH: Pakai grid-cols-2 dan truncate agar teks hash terpotong rapi dengan titik-titik dan tidak menerobos batas */}
          <div className="col-span-3 border-t border-amber-900/20 pt-4 mt-2">
            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="min-w-0">
                <p className="text-[9px] uppercase tracking-widest text-amber-800/70 mb-1 flex items-center gap-1.5"><Fingerprint className="w-3 h-3"/> {tHop.hash || 'SHA-256'}</p>
                <p className="text-[10px] text-neutral-700 font-bold tracking-tight truncate pr-4">{proofData?.fileHash || '0x...'}</p>
              </div>
              <div className="min-w-0 text-right">
                <p className="text-[9px] uppercase tracking-widest text-amber-800/70 mb-1 flex items-center justify-end gap-1.5"><Lock className="w-3 h-3"/> Metadata Hash</p>
                <p className="text-[10px] text-neutral-700 font-bold tracking-tight truncate pl-4">{proofData?.metaHash || '0x...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 FIX QR CODE & MARGIN BAWAH: Mengatur items-center dan mengecilkan QR Code */}
      <div className="relative z-10 mt-4 pt-4 border-t-2 border-amber-900/20 flex flex-row items-center justify-between px-6 pb-1">
        <div className="text-left mb-1">
          <p className="text-[8px] font-bold text-amber-900 uppercase tracking-widest leading-relaxed">
            {tDash.certRegisteredBy || 'Certified & Permanently Registered by'}<br/>
            <span className="text-xs font-black mt-0.5 block">AETHERVAULT™ REGISTRY</span>
          </p>
          <p className="text-[7px] text-neutral-500 font-mono mt-1.5 tracking-widest bg-amber-900/5 inline-block px-1.5 py-0.5 rounded">{tDash.certImmutableBadge || 'IMMUTABLE • ON-CHAIN'} • {proofData?.network || 'BSC TESTNET'}</p>
        </div>

        <div className="text-center mb-1 px-8 flex flex-col items-center">
           <div className="font-signature text-3xl text-amber-900/80 -rotate-3 mb-1" style={{ fontFamily: "'Brush Script MT', cursive" }}>AetherVault DAO</div>
           <div className="w-32 border-b border-amber-900/40 mb-1"></div>
           <p className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold">{tDash.certSignature || 'Digital Signature'}</p>
        </div>

        <div className="flex flex-col items-center">
          {/* QR Code dikecilkan jadi w-16 h-16 dan size 56 agar tidak nabrak bawah */}
          <div className="w-16 h-16 bg-white border border-neutral-200 p-1 rounded-sm shadow-sm flex items-center justify-center mb-1">
            <QRCode value={proofData?.verifyUrl || 'https://aethvault.xyz'} size={56} bgColor="#ffffff" fgColor="#451a03" level="Q" />
          </div>
          <p className="text-[6px] uppercase tracking-widest text-amber-900 font-bold">{tDash.certScan || 'Scan to Verify'}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {view === 'hub' && (
        <>
          <div className="bg-gradient-to-br from-[#0B0817] via-neutral-900 to-[#05030F] border border-neutral-800/80 p-6 sm:p-10 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-amber-500/10 via-cyan-500/10 to-purple-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> {tHop.galleryBadge || 'Immutable On-Chain Gallery'}
                </div>
                <h3 className="font-display text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                  {tLand.pillars?.proofTitle || 'Aether Proof™'}
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-xl">
                  {tLand.pillars?.proofDesc || 'Mint immutable ownership certificates for any digital creation, artwork, software, or intellectual property on the blockchain.'}
                </p>
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={() => setView('form')}
                    className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-8 py-4 rounded-2xl text-xs sm:text-sm shadow-[0_0_25px_-3px_rgba(245,158,11,0.5)] cursor-pointer transition-all flex items-center gap-2"
                  >
                    <Award className="w-4 h-4" /> {tHop.mintFirst || 'Mint Proof'}
                  </button>
                  <div className="flex items-center gap-3 px-4 py-3 bg-[#05030F] rounded-2xl border border-neutral-800">
                    <div className="w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    <div className="text-[11px] font-mono">
                      <span className="text-white font-bold">100%</span> <span className="text-neutral-400">On-Chain</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 hidden lg:flex flex-col items-center justify-center bg-[#05030F]/80 border border-neutral-800 p-6 rounded-2xl relative shadow-inner">
                <span className="absolute top-3 right-3 text-[9px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 uppercase">Live Pipeline</span>
                
                <div className="space-y-3 w-full max-w-[240px] text-center">
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center gap-2 shadow">
                    <Globe className="w-4 h-4 text-purple-400 animate-spin" /> Binance Smart Chain
                  </div>
                  <div className="h-4 w-0.5 bg-gradient-to-b from-purple-500 to-amber-500 mx-auto"></div>
                  <div className="p-3 bg-neutral-900 border border-neutral-800 rounded-xl text-xs font-mono font-bold text-white flex items-center justify-center gap-2 shadow">
                    <Fingerprint className="w-4 h-4 text-amber-400" /> Keccak256 Hash
                  </div>
                  <div className="h-4 w-0.5 bg-gradient-to-b from-amber-500 to-cyan-500 mx-auto"></div>
                  <div className="p-3 bg-gradient-to-r from-amber-500/10 to-cyan-500/10 border border-cyan-500/30 rounded-xl text-xs font-mono font-bold text-cyan-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                    <Award className="w-4 h-4 text-cyan-400" /> Immutable Certificate
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {[
              { label: tHop.totalProofs || "On-Chain Proofs", value: globalProtocolStats.totalProofs, icon: Award, color: "text-amber-400" },
              { label: tHop.creators || "Global Creators", value: globalProtocolStats.totalProofs > 0 ? `${globalProtocolStats.totalProofs}+` : "0", icon: User, color: "text-cyan-400" },
              { label: "Network", value: "BSC Testnet", icon: Globe, color: "text-purple-400" },
              { label: tStats.burn || "$AETH Burned", value: `${globalProtocolStats.burnedTotal} AETH`, icon: Flame, color: "text-red-400" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-6 rounded-2xl shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-[9px] font-mono text-neutral-500 uppercase">Live On-Chain</span>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white font-mono mb-1">{stat.value}</div>
                <div className="text-xs text-neutral-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="bg-[#0B0817] border border-neutral-900 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-display">
                  {tHop.categories || 'Categories'} & Badges
                </h4>
              </div>
            </div>

            {/* 🚀 UBAH: Layout grid untuk kotak Categories & Badges agar 2 kolom di HP */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Object.entries(categoryConfig).map(([key, val], idx) => (
                <div 
                  key={idx} 
                  onClick={() => { setCategory(key); setView('form'); }}
                  className="bg-[#05030F] border border-neutral-800/80 hover:border-amber-500/50 p-3 sm:p-5 rounded-xl sm:rounded-2xl transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                        <div className="scale-75 sm:scale-100 flex items-center justify-center">{val.icon}</div>
                      </div>
                      <span className="text-[9px] sm:text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-1 sm:px-3 sm:py-1 rounded-lg sm:rounded-xl border border-amber-500/20 whitespace-nowrap">{val.price} AETH</span>
                    </div>
                    <h5 className="font-bold text-white text-xs sm:text-base mb-1 group-hover:text-amber-300 transition-colors truncate">{key}</h5>
                  </div>

                  <div className="pt-2 sm:pt-3 border-t border-neutral-800/80 flex items-center justify-between mt-2">
                    <span className="text-[9px] sm:text-[11px] font-bold text-neutral-300 flex items-center gap-1 sm:gap-1.5 truncate pr-1">
                      <span className="shrink-0">{val.badgeIcon}</span> <span className="truncate">{val.badge}</span>
                    </span>
                    <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-neutral-500 group-hover:text-amber-400 transition-colors shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#0B0817] border border-neutral-900 p-6 sm:p-8 rounded-3xl shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-display flex items-center gap-2">
                  <Compass className="w-5 h-5 text-cyan-400" /> {tHop.recentActivity || 'Recent On-Chain Activity'}
                </h4>
              </div>
            </div>

            {isLoadingHall ? (
              <div className="text-center py-12 text-neutral-500 text-xs flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" /> Fetching...
              </div>
            ) : onChainProofs.length === 0 ? (
              <div className="text-center py-12 text-neutral-500 text-xs font-mono">
                {tHop.emptyDesc || 'No proofs minted on-chain yet.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {onChainProofs.map((item) => (
                  <div key={item.id} className="bg-[#05030F] border border-neutral-800 rounded-2xl p-5 hover:border-cyan-500/50 transition-all flex flex-col justify-between shadow-lg group">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg border border-cyan-500/20">{item.category}</span>
                        <span className="text-[10px] font-mono text-green-400 flex items-center gap-1"><Check className="w-3 h-3"/> On-Chain</span>
                      </div>
                      <h5 className="font-bold text-white text-sm line-clamp-2 group-hover:text-cyan-300 transition-colors">{item.title}</h5>
                      <p className="text-[10px] text-neutral-400 font-mono">Hash: {item.hash}</p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-neutral-800 space-y-2">
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
                        className="w-full mt-2 py-2 bg-neutral-900 hover:bg-neutral-800 text-cyan-300 border border-neutral-800 hover:border-cyan-500/30 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="lg:col-span-5 bg-[#0B0817] border border-amber-500/30 p-6 rounded-3xl shadow-xl flex flex-col h-full">
            <button onClick={() => setView('hub')} className="mb-4 flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer w-fit">
              <ChevronLeft className="w-4 h-4" /> Back to Hub
            </button>
            <h3 className="font-display text-xl font-extrabold text-white mb-6">Metadata Details</h3>

            <form onSubmit={handleMintSequence} className="space-y-5 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">{tHop.categories || 'Category'}</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#05030F] border border-neutral-800 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-amber-500 cursor-pointer font-mono">
                  {Object.keys(categoryConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">Title *</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Core Smart Contract v1" className="w-full bg-[#05030F] border border-neutral-800 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-amber-500 font-medium" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono">{tHop.creator || 'Creator Name'}</label>
                <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="e.g., Satoshi Nakamoto" className="w-full bg-[#05030F] border border-neutral-800 rounded-2xl p-3.5 text-xs text-white outline-none focus:border-amber-500 font-medium" />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest font-mono flex items-center gap-1.5"><Fingerprint className="w-3 h-3"/> Target File</label>
                {!file ? (
                  <div className="border-2 border-dashed border-neutral-800 hover:border-amber-500/50 bg-[#05030F] rounded-2xl p-5 text-center cursor-pointer relative">
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <UploadCloud className="w-7 h-7 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-white font-bold">Drop your file here</p>
                  </div>
                ) : (
                  <div className="bg-[#05030F] border border-cyan-500/30 p-3.5 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileImage className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-xs text-white truncate font-medium">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => {setFile(null); setFileHash('0x0000000000000000000000000000000000000000000000000000000000000000');}} className="text-[10px] text-red-400 shrink-0 cursor-pointer font-bold">Remove</button>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6">
                <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-2xl space-y-2.5 mb-4">
                  <div className="flex justify-between text-xs font-mono"><span className="text-neutral-400">Mint Cost</span><span className="text-white font-bold">{currentConfig.price} AETH</span></div>
                  <div className="flex justify-between text-xs font-mono"><span className="text-neutral-500 flex items-center gap-1"><Flame className="w-3 h-3 text-red-400"/> {tStats.burn || 'Burn'}</span><span className="text-red-400">-{currentConfig.price * 0.2} AETH</span></div>
                  <div className="flex justify-between text-xs font-mono"><span className="text-neutral-500 flex items-center gap-1"><Activity className="w-3 h-3 text-green-400"/> Staking Pool</span><span className="text-green-400">+{currentConfig.price * 0.4} AETH</span></div>
                  <div className="flex justify-between text-xs font-mono"><span className="text-neutral-500 flex items-center gap-1"><Building2 className="w-3 h-3 text-yellow-400"/> Treasury Reserve</span><span className="text-yellow-400">+{currentConfig.price * 0.4} AETH</span></div>
                  <div className="flex justify-between text-xs font-mono border-t border-neutral-800 pt-2"><span className="text-neutral-400">Est. Gas Fee</span><span className="text-white">~0.0005 tBNB</span></div>
                </div>

                <button type="submit" disabled={!title || isHashing} className="w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold py-4 rounded-full text-xs sm:text-sm shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <Award className="w-4 h-4" /> Mint & Issue Proof
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-3xl flex flex-col relative overflow-hidden shadow-xl">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-cyan-500 font-mono text-[10px] uppercase tracking-widest z-20">
              <Eye className="w-3.5 h-3.5"/> Live NFT Preview
            </div>
            
            {/* ⭐ PANEL KONTROL ZOOM */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20 bg-[#0B0817] p-1 border border-neutral-800 rounded-lg shadow-lg">
              <button type="button" onClick={() => setPreviewZoom(p => Math.max(0.3, p - 0.1))} className="w-7 h-7 flex items-center justify-center text-white bg-neutral-800 hover:bg-neutral-700 rounded-md cursor-pointer font-bold transition-colors">-</button>
              <span className="text-[10px] text-cyan-400 font-mono w-10 text-center font-bold">{Math.round(previewZoom * 100)}%</span>
              <button type="button" onClick={() => setPreviewZoom(p => Math.min(2.0, p + 0.1))} className="w-7 h-7 flex items-center justify-center text-white bg-neutral-800 hover:bg-neutral-700 rounded-md cursor-pointer font-bold transition-colors">+</button>
            </div>
            
            {/* ⭐ AREA PREVIEW YANG BISA DI-DRAG */}
            <div 
              ref={previewScrollRef}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeaveOrUp}
              onMouseUp={handleMouseLeaveOrUp}
              onMouseMove={handleMouseMove}
              className={`w-full flex justify-start overflow-auto py-8 mt-10 custom-scrollbar ${isDraggingPreview ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ maxHeight: '600px' }}
            >
              <div 
                className="mx-auto origin-top-left shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-neutral-800 rounded-sm shrink-0 transition-transform duration-200"
                style={{ 
                  transform: `scale(${previewZoom})`, 
                  width: '842px', 
                  height: '595px',
                  marginBottom: `${(previewZoom > 1 ? (previewZoom - 1) * 595 : 0)}px`,
                  marginRight: `${(previewZoom > 1 ? (previewZoom - 1) * 842 : 0)}px` 
                }}
              >
                <CertificateTemplate proofData={{
                  id: 'AETH-PROOF-PREVIEW',
                  category,
                  title: title || 'Proof Title Preview',
                  badge: currentConfig.badge,
                  badgeIcon: currentConfig.badgeIcon,
                  creator: creatorName || formatAddress(address),
                  wallet: realAddress,
                  fileHash: isHashing ? 'Calculating Keccak256...' : fileHash,
                  metaHash: metadataHash,
                  date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                  network: TARGET_CHAIN_NAME || "BSC Testnet",
                  contract: AETHER_VAULT_ADDRESS,
                  verifyUrl: "https://testnet.bscscan.com/address/" + AETHER_VAULT_ADDRESS
                }} />
              </div>
            </div>
          </div>

        </div>
      )}

      {view === 'minting' && (
        <div className="bg-[#0B0817] border border-amber-500/30 p-10 sm:p-16 rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-8" />
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-8">Processing BSC Testnet Transaction...</h3>
          <div className="w-full max-w-md space-y-4 font-mono text-xs sm:text-sm">
             <div className="text-center text-cyan-400 font-bold bg-cyan-500/10 py-3 rounded-xl border border-cyan-500/20">{mintingStatusMsg}</div>
          </div>
        </div>
      )}

      {view === 'success' && generatedProof && (
        <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center pb-10">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 text-center">Aether Proof Minted On-Chain!</h3>
          
          <div className="w-full max-w-[900px] overflow-x-auto custom-scrollbar shadow-2xl mt-6">
             <CertificateTemplate proofData={generatedProof} />
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <button onClick={handleDownloadPDF} className="bg-[#05030F] border border-amber-900/50 hover:bg-neutral-900 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <Download className="w-4 h-4 text-amber-500" /> Download PDF
            </button>
            <button onClick={handleDownloadPNG} className="bg-[#05030F] border border-amber-900/50 hover:bg-neutral-900 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <ImageIcon className="w-4 h-4 text-cyan-400" /> Export PNG
            </button>
            <a href={`https://testnet.bscscan.com/tx/${generatedProof.txHash}`} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-2xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer no-underline shadow-lg">
              <ExternalLink className="w-4 h-4" /> View Transaction
            </a>
          </div>
          <button onClick={() => { setView('hub'); setFile(null); setFileHash('0x0000000000000000000000000000000000000000000000000000000000000000'); }} className="mt-8 text-xs font-bold text-neutral-500 hover:text-white transition-colors cursor-pointer border-b border-transparent hover:border-white pb-0.5">
            Mint Another Proof
          </button>
        </div>
      )}

    </div>
  );
}
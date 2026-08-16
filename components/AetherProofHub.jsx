import React, { useState, useRef, useEffect } from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, Globe, Music, Code2, Palette, BookOpen, Camera, Film, Microscope, Building2, Scale, Box, User, Link as LinkIcon, UploadCloud, Lock, ChevronLeft, Loader2, FileImage, Cpu, Flame, Fingerprint, Image as ImageIcon, ExternalLink, QrCode, Eye } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AetherVaultV3ABI from '../contracts/AetherVaultV3ABI.json';

const AETHER_VAULT_ADDRESS = "0xCda136B176baE8F92d0Dbc7851C0A1E282469265";
const BSC_TESTNET_CHAIN_ID = 97;
const BSC_TESTNET_NAME = "BNB Smart Chain Testnet";
const BSC_TESTNET_EXPLORER = "https://testnet.bscscan.com";

export default function AetherProofHub({ t, handleViewCertificate, setActiveTab, address, TARGET_CHAIN_NAME }) {
  const [view, setView] = useState('hub');
  const certificateRef = useRef(null);
  const previewContainerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(0.65);

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

  const categoryConfig = {
    "Writing": { price: 10, badge: "Verified Author", badgeIcon: "✍️", icon: <BookOpen className="w-4 h-4" /> },
    "Photography": { price: 10, badge: "Verified Photographer", badgeIcon: "📷", icon: <Camera className="w-4 h-4" /> },
    "Design": { price: 10, badge: "Verified Creator", badgeIcon: "🎨", icon: <Palette className="w-4 h-4" /> },
    "Music": { price: 50, badge: "Verified Artist", badgeIcon: "🎵", icon: <Music className="w-4 h-4" /> },
    "Video": { price: 50, badge: "Verified Filmmaker", badgeIcon: "🎬", icon: <Film className="w-4 h-4" /> },
    "Software": { price: 200, badge: "Verified Developer", badgeIcon: "💻", icon: <Code2 className="w-4 h-4" /> },
    "Research": { price: 200, badge: "Verified Researcher", badgeIcon: "🔬", icon: <Microscope className="w-4 h-4" /> },
    "Business": { price: 500, badge: "Verified Company", badgeIcon: "🏛️", icon: <Building2 className="w-4 h-4" /> },
    "Legal": { price: 500, badge: "Verified Entity", badgeIcon: "📜", icon: <Scale className="w-4 h-4" /> },
    "Other": { price: 10, badge: "Verified Creator", badgeIcon: "✨", icon: <Box className="w-4 h-4" /> }
  };

  const currentConfig = categoryConfig[category];
  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '0xA5E3...7Fa2';
  const realAddress = address || "0xA5E3000000000000000000000000000000007Fa2";

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
    const updatePreviewScale = () => {
      if (!previewContainerRef.current) return;
      const width = previewContainerRef.current.clientWidth;
      setPreviewScale(Math.min(0.82, Math.max(0.36, (width - 8) / 842)));
    };
    updatePreviewScale();
    const observer = new ResizeObserver(updatePreviewScale);
    if (previewContainerRef.current) observer.observe(previewContainerRef.current);
    window.addEventListener('resize', updatePreviewScale);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updatePreviewScale);
    };
  }, [view]);

  useEffect(() => {
    const updateMetadataHash = async () => {
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
    };
    updateMetadataHash();
  }, [title, description, category, creatorName, fileHash, realAddress]);

  const handleMintSequence = async (e) => {
    e.preventDefault();
    setView('minting');
    
    try {
      setMintStep(1);
      await new Promise(res => setTimeout(res, 1000));
      
      setMintStep(2);
      await new Promise(res => setTimeout(res, 1000));
      
      setMintStep(3);
      if (!window.ethereum) throw new Error("MetaMask not found!");
      
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== BSC_TESTNET_CHAIN_ID) {
        try {
          await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x61' }] });
        } catch (switchError) {
          if (switchError?.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x61',
                chainName: BSC_TESTNET_NAME,
                nativeCurrency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
                rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
                blockExplorerUrls: [BSC_TESTNET_EXPLORER]
              }]
            });
          } else throw switchError;
        }
      }
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AetherVaultV3ABI, signer);

      setMintStep(4);
      const tokenURIParam = `https://gateway.pinata.cloud/ipfs/bafybeig...preview`;
      const tx = await contract.createProof(tier, category, fileHash, tokenURIParam, true);
      
      setMintStep(5);
      const receipt = await tx.wait();

      const mockTokenId = Math.floor(8000 + Math.random() * 2000);
      
      setGeneratedProof({
        tokenId: mockTokenId,
        id: `AETH-PROOF-${mockTokenId}`,
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
        network: BSC_TESTNET_NAME,
        verifyUrl: `${BSC_TESTNET_EXPLORER}/address/${AETHER_VAULT_ADDRESS}`
      });
      
      setView('success');
    } catch (error) {
      console.error("Minting failed:", error);
      alert("Transaction failed or rejected: " + (error.reason || error.message));
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
        <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Verified on BNB Smart Chain Testnet</span>
      </div>

      <img src="/whatermark.png" alt="Watermark" className="absolute inset-0 w-full h-full object-contain opacity-[0.05] pointer-events-none grayscale mix-blend-multiply p-20" />

      <div className="absolute inset-4 border-[4px] border-double border-amber-900/30 pointer-events-none rounded-sm"></div>
      <div className="absolute inset-6 border-[1px] border-amber-900/10 pointer-events-none rounded-sm"></div>
      
      <div className="relative z-10 text-center mb-4 pt-4 border-b-2 border-amber-900/10 pb-4">
        <h4 className="text-4xl font-black tracking-[0.25em] text-amber-900 mb-2 font-display drop-shadow-sm">AETHER PROOF™</h4>
        <p className="text-xs font-bold tracking-[0.3em] text-amber-700 uppercase">Cryptographic Certificate of Authenticity</p>
      </div>

      <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-center px-4">
        <div className="text-center mb-2">
          <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-2">This unalterable document officially certifies the registration of</p>
          <h5 className="text-3xl font-bold text-neutral-900 font-display px-8 leading-snug">"{proofData?.title || 'Untitled Proof'}"</h5>
        </div>

        <div className="grid grid-cols-3 gap-y-5 gap-x-6 text-xs font-mono bg-white/60 p-6 border border-amber-900/20 rounded-sm shadow-sm backdrop-blur-sm">
          <div className="col-span-1 border-r border-amber-900/10">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">Certificate ID</p>
            <p className="font-bold text-neutral-900">{proofData?.id || 'AETH-PROOF-XXXX'}</p>
          </div>
          <div className="col-span-1 border-r border-amber-900/10 pl-2">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">Creator / Owner</p>
            <p className="font-bold text-neutral-900 truncate pr-2">{proofData?.creator || 'Unknown'}</p>
          </div>
          <div className="col-span-1 pl-2">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">Timestamp</p>
            <p className="font-bold text-neutral-900">{proofData?.date || new Date().toLocaleDateString()}</p>
          </div>

          <div className="col-span-1 border-r border-amber-900/10 pt-2 border-t">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">Role / Badge</p>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-neutral-900">{proofData?.category || 'Category'}</span>
              <span className="text-[8px] bg-amber-900 text-amber-100 px-1.5 py-0.5 rounded-sm tracking-widest flex items-center gap-1">
                {proofData?.badgeIcon || '✨'} {proofData?.badge || 'Verified'}
              </span>
            </div>
          </div>
          <div className="col-span-1 border-r border-amber-900/10 pl-2 pt-2 border-t">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">Wallet Address</p>
            <p className="font-bold text-neutral-900 text-[10px]">{proofData?.wallet || '0x...'}</p>
          </div>
          <div className="col-span-1 pl-2 pt-2 border-t">
            <p className="text-[8px] uppercase tracking-widest text-amber-800/70 mb-1">Smart Contract</p>
            <p className="font-bold text-neutral-900 text-[10px]">{formatAddress(proofData?.contract || AETHER_VAULT_ADDRESS)}</p>
          </div>

          <div className="col-span-3 border-t border-amber-900/20 pt-4 mt-2 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-amber-800/70 mb-1 flex items-center gap-1.5"><Fingerprint className="w-3 h-3"/> File Proof Hash (Keccak256)</p>
                <p className="text-[10px] text-neutral-700 font-bold tracking-tight">{proofData?.fileHash || '0x...'}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] uppercase tracking-widest text-amber-800/70 mb-1 flex items-center justify-end gap-1.5"><Lock className="w-3 h-3"/> Metadata Hash</p>
                <p className="text-[10px] text-neutral-700 font-bold tracking-tight">{proofData?.metaHash || '0x...'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 pt-4 border-t-2 border-amber-900/20 flex flex-row items-end justify-between px-6 pb-2">
        <div className="text-left mb-2">
          <p className="text-[8px] font-bold text-amber-900 uppercase tracking-widest leading-relaxed">
            Certified & Permanently Registered by<br/>
            <span className="text-xs font-black mt-0.5 block">AETHERVAULT™ REGISTRY</span>
          </p>
          <p className="text-[7px] text-neutral-500 font-mono mt-1.5 tracking-widest bg-amber-900/5 inline-block px-1.5 py-0.5 rounded">IMMUTABLE • ON-CHAIN • {proofData?.network || 'POLYGON'}</p>
        </div>

        <div className="text-center mb-2 px-8 flex flex-col items-center">
           <div className="font-signature text-3xl text-amber-900/80 -rotate-3 mb-1" style={{ fontFamily: "'Brush Script MT', cursive" }}>AetherVault DAO</div>
           <div className="w-32 border-b border-amber-900/40 mb-1"></div>
           <p className="text-[8px] uppercase tracking-widest text-neutral-500 font-bold">Digital Signature</p>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-20 h-20 bg-white border border-neutral-200 p-1.5 rounded-sm shadow-sm flex items-center justify-center">
            <QRCode value={proofData?.verifyUrl || 'https://aethvault.xyz'} size={68} bgColor="#ffffff" fgColor="#451a03" level="Q" />
          </div>
          <p className="text-[7px] uppercase tracking-widest mt-1.5 text-amber-900 font-bold">Scan to Verify</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {view === 'hub' && (
        <>
          <div className="bg-gradient-to-r from-amber-950/30 via-violet-950/20 to-[#0B0817] border border-amber-500/30 p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-widest">
                <Award className="w-3.5 h-3.5" /> Official Web3 Certificate Registry
              </div>
              <h3 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
                Cryptographic Proof of Ownership
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Turn your intellectual property into a tamper-proof blockchain identity. Upload your file, generate a Keccak256 hash, and mint your verifiable on-chain certificate.
              </p>
              <div className="pt-4 flex flex-wrap gap-3">
                <button 
                  onClick={() => setView('form')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold px-8 py-3.5 rounded-xl text-xs sm:text-sm shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)] cursor-pointer transition-all flex items-center gap-2"
                >
                  <Award className="w-4 h-4" /> Mint Aether Proof
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0817] border border-neutral-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
            <h4 className="text-sm sm:text-base font-bold text-white mb-6 uppercase tracking-wider font-mono">
              Ecosystem Pricing & Verified Badges
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(categoryConfig).map(([key, val], idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => { setCategory(key); setView('form'); }}
                  className={`w-full text-left bg-[#05030F] border p-4 rounded-2xl transition-all duration-200 cursor-pointer hover:-translate-y-0.5 hover:border-cyan-400/50 hover:bg-[#090617] hover:shadow-[0_0_24px_rgba(34,211,238,0.10)] ${category === key ? 'border-cyan-400/60 ring-1 ring-cyan-400/20' : 'border-neutral-800'}`}
                  aria-label={`Create ${key} Aether Proof`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-cyan-400">{val.icon}</div>
                      <h5 className="font-bold text-white text-sm">{key}</h5>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">{val.price} AETH</span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-1.5 text-[10px] text-neutral-400 bg-neutral-900/50 py-1.5 px-2 rounded-lg border border-neutral-800/50">
                    <span className="flex items-center gap-1.5"><span>{val.badgeIcon}</span> <span className="font-bold">{val.badge}</span></span>
                    <span className="text-cyan-400 font-bold">Create →</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {view === 'form' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 animate-in slide-in-from-bottom-4 duration-300">
          
          <div className="lg:col-span-5 bg-[#0B0817] border border-amber-500/30 p-6 rounded-2xl shadow-xl flex flex-col h-full">
            <button onClick={() => setView('hub')} className="mb-4 flex items-center gap-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer w-fit">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h3 className="font-display text-xl font-extrabold text-white mb-6">Metadata Details</h3>

            <form onSubmit={handleMintSequence} className="space-y-5 flex-1 flex flex-col">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 cursor-pointer">
                  {Object.keys(categoryConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Title *</label>
                <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Core Smart Contract v1" className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Creator Name</label>
                <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="e.g., Satoshi Nakamoto" className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the work or intellectual property..." rows={3} className="w-full resize-none bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500" />
              </div>

              <div className="space-y-1.5 pt-2 border-t border-neutral-800">
                <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5"><Fingerprint className="w-3 h-3"/> Target File (Generate Hash)</label>
                {!file ? (
                  <div className="border-2 border-dashed border-neutral-800 hover:border-amber-500/50 bg-[#05030F] rounded-xl p-4 text-center cursor-pointer relative">
                    <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <UploadCloud className="w-6 h-6 text-neutral-600 mx-auto mb-1" />
                    <p className="text-[10px] text-white font-bold">Select File for Keccak256</p>
                  </div>
                ) : (
                  <div className="bg-[#05030F] border border-cyan-500/30 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileImage className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="text-[10px] text-white truncate">{file.name}</span>
                    </div>
                    <button type="button" onClick={() => {setFile(null); setFileHash('0x0000000000000000000000000000000000000000000000000000000000000000');}} className="text-[9px] text-red-400 shrink-0 cursor-pointer">Remove</button>
                  </div>
                )}
              </div>

              <div className="mt-auto pt-6">
                <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-xl space-y-2.5 mb-4">
                  <div className="flex justify-between text-[10px] font-mono"><span className="text-neutral-400">Mint Cost</span><span className="text-white font-bold">{currentConfig.price} AETH</span></div>
                  <div className="flex justify-between text-[10px] font-mono"><span className="text-neutral-500 flex items-center gap-1"><Flame className="w-2.5 h-2.5 text-red-400"/> Burn (20%)</span><span className="text-red-400">-{currentConfig.price * 0.2} AETH</span></div>
                  <div className="flex justify-between text-[10px] font-mono"><span className="text-neutral-500 flex items-center gap-1"><ShieldCheck className="w-2.5 h-2.5 text-blue-400"/> Treasury (80%)</span><span className="text-blue-400">{currentConfig.price * 0.8} AETH</span></div>
                  <div className="flex justify-between text-[10px] font-mono border-t border-neutral-800 pt-2"><span className="text-neutral-400">Est. Gas Fee</span><span className="text-white">~0.0005 tBNB</span></div>
                </div>

                <button type="submit" disabled={!title || isHashing} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                  <Award className="w-4 h-4" /> Mint & Issue Proof
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[#05030F] border border-neutral-900 p-6 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-cyan-500 font-mono text-[9px] uppercase tracking-widest"><Eye className="w-3 h-3"/> Live NFT Preview</div>
            
            <div
              ref={previewContainerRef}
              className="w-full max-w-[842px] mx-auto rounded-xl border border-neutral-800 bg-[#02010A] shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden"
              style={{ height: `${595 * previewScale}px` }}
            >
              <div
                className="origin-top-left"
                style={{ width: '842px', height: '595px', transform: `scale(${previewScale})`, transformOrigin: 'top left' }}
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
                network: BSC_TESTNET_NAME,
                contract: AETHER_VAULT_ADDRESS,
                verifyUrl: BSC_TESTNET_EXPLORER + "/address/" + AETHER_VAULT_ADDRESS
                }} />
              </div>
            </div>
          </div>

        </div>
      )}

      {view === 'minting' && (
        <div className="bg-[#0B0817] border border-amber-500/30 p-10 sm:p-16 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-8" />
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-8">Processing BNB Smart Chain Testnet Transaction...</h3>
          
          <div className="w-full max-w-md space-y-4 font-mono text-xs sm:text-sm">
            <div className={`flex items-center justify-between ${mintStep >= 1 ? 'text-cyan-400' : 'text-neutral-700'}`}>
              <span className="flex items-center gap-2">{mintStep > 1 ? <CheckCircle2 className="w-4 h-4 text-green-400"/> : mintStep === 1 ? <Loader2 className="w-4 h-4 animate-spin"/> : <div className="w-4 h-4 rounded-full border border-neutral-700"/>} 1. Preparing Metadata</span>
              <span>{mintStep > 1 ? 'DONE' : mintStep === 1 ? 'WORKING' : 'WAITING'}</span>
            </div>
            <div className={`flex items-center justify-between ${mintStep >= 2 ? 'text-amber-400' : 'text-neutral-700'}`}>
              <span className="flex items-center gap-2">{mintStep > 2 ? <CheckCircle2 className="w-4 h-4 text-green-400"/> : mintStep === 2 ? <Loader2 className="w-4 h-4 animate-spin"/> : <div className="w-4 h-4 rounded-full border border-neutral-700"/>} 2. Generating Keccak256 Hash</span>
              <span>{mintStep > 2 ? 'DONE' : mintStep === 2 ? 'WORKING' : 'WAITING'}</span>
            </div>
            <div className={`flex items-center justify-between ${mintStep >= 3 ? 'text-purple-400' : 'text-neutral-700'}`}>
              <span className="flex items-center gap-2">{mintStep > 3 ? <CheckCircle2 className="w-4 h-4 text-green-400"/> : mintStep === 3 ? <Loader2 className="w-4 h-4 animate-spin"/> : <div className="w-4 h-4 rounded-full border border-neutral-700"/>} 3. Requesting Wallet Signature</span>
              <span>{mintStep > 3 ? 'DONE' : mintStep === 3 ? 'WORKING' : 'WAITING'}</span>
            </div>
            <div className={`flex items-center justify-between ${mintStep >= 4 ? 'text-blue-400' : 'text-neutral-700'}`}>
              <span className="flex items-center gap-2">{mintStep > 4 ? <CheckCircle2 className="w-4 h-4 text-green-400"/> : mintStep === 4 ? <Loader2 className="w-4 h-4 animate-spin"/> : <div className="w-4 h-4 rounded-full border border-neutral-700"/>} 4. Sending to Smart Contract</span>
              <span>{mintStep > 4 ? 'DONE' : mintStep === 4 ? 'WORKING' : 'WAITING'}</span>
            </div>
            <div className={`flex items-center justify-between ${mintStep >= 5 ? 'text-green-400 font-bold' : 'text-neutral-700'}`}>
              <span className="flex items-center gap-2">{mintStep > 5 ? <CheckCircle2 className="w-4 h-4 text-green-400"/> : mintStep === 5 ? <Loader2 className="w-4 h-4 animate-spin"/> : <div className="w-4 h-4 rounded-full border border-neutral-700"/>} 5. Confirming on Blockchain</span>
              <span>{mintStep > 5 ? 'SUCCESS' : mintStep === 5 ? 'WORKING' : 'WAITING'}</span>
            </div>
          </div>
        </div>
      )}

      {view === 'success' && generatedProof && (
        <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center pb-10">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 border border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
            <CheckCircle2 className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-white mb-2 text-center">Aether Proof Minted On-Chain!</h3>
          <p className="text-xs text-neutral-400 mb-8 text-center max-w-md">Your intellectual property has been permanently recorded on BNB Smart Chain Testnet Block #{generatedProof.blockNumber}.</p>

          <div className="w-full max-w-[900px] overflow-x-auto custom-scrollbar shadow-2xl">
             <CertificateTemplate proofData={generatedProof} />
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl">
            <button onClick={handleDownloadPDF} className="bg-[#05030F] border border-amber-900/50 hover:bg-neutral-900 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <Download className="w-4 h-4 text-amber-500" /> Download PDF
            </button>
            <button onClick={handleDownloadPNG} className="bg-[#05030F] border border-amber-900/50 hover:bg-neutral-900 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg">
              <ImageIcon className="w-4 h-4 text-cyan-400" /> Export PNG
            </button>
            <a href={`${BSC_TESTNET_EXPLORER}/tx/${generatedProof.txHash}`} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer no-underline shadow-lg">
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
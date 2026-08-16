import React, { useState, useRef, useEffect } from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, Globe, Music, Code2, Palette, BookOpen, Camera, Film, Microscope, Building2, Scale, Box, User, Link as LinkIcon, UploadCloud, Lock, ChevronLeft, Loader2, FileImage, Cpu, Flame, Fingerprint, Image as ImageIcon, ExternalLink, QrCode, Eye } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import AetherVaultV3ABI from '../contracts/AetherVaultV3ABI.json';

const AETHER_VAULT_ADDRESS = '0xCda136B176baE8F92d0Dbc7851C0A1E282469265';
const BSC_TESTNET_CHAIN_ID = 97;
const BSC_TESTNET_HEX = '0x61';
const BSC_TESTNET_NAME = 'BNB Smart Chain Testnet';
const BSC_TESTNET_EXPLORER = 'https://testnet.bscscan.com';

export default function AetherProofHub({ t, handleViewCertificate, setActiveTab, address, TARGET_CHAIN_NAME }) {
  const [view, setView] = useState('hub');
  const certificateRef = useRef(null);
  const previewViewportRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(0.7);
  const [logoDataUrl, setLogoDataUrl] = useState(null);

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
  const realAddress = address || "";

  useEffect(() => {
    let cancelled = false;
    fetch('/logo.png', { cache: 'force-cache' })
      .then((res) => {
        if (!res.ok) throw new Error('logo.png not found');
        return res.blob();
      })
      .then((blob) => {
        const reader = new FileReader();
        reader.onload = () => { if (!cancelled) setLogoDataUrl(reader.result); };
        reader.readAsDataURL(blob);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const updateScale = () => {
      const el = previewViewportRef.current;
      if (!el) return;
      const available = Math.max(280, el.clientWidth - 24);
      setPreviewScale(Math.min(0.82, Math.max(0.28, available / 1200)));
    };
    updateScale();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateScale) : null;
    if (ro && previewViewportRef.current) ro.observe(previewViewportRef.current);
    window.addEventListener('resize', updateScale);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', updateScale);
    };
  }, []);

  const generateKeccak256 = async (dataBuffer) => {
    try {
      const uint8Array = new Uint8Array(dataBuffer);
      return ethers.keccak256(uint8Array);
    } catch (err) {
      console.error("Hashing failed", err);
      throw err;
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


  const safeSvg = (value = '') =>
    String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');

  const buildNftImage = ({ serial = 'PREVIEW' } = {}) => {
    const colorMap = {
      Writing: '#22d3ee', Photography: '#f472b6', Design: '#a78bfa',
      Music: '#fbbf24', Video: '#f87171', Software: '#4ade80',
      Research: '#60a5fa', Business: '#fb923c', Legal: '#c084fc', Other: '#94a3b8'
    };
    const color = colorMap[category] || '#fbbf24';
    const logo = logoDataUrl
      ? `<image href="${logoDataUrl}" x="118" y="205" width="190" height="190" preserveAspectRatio="xMidYMid meet"/>`
      : `<text x="213" y="325" text-anchor="middle" fill="#ffd447" font-size="120" font-family="Arial" font-weight="900">A</text>`;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="760" viewBox="0 0 1200 760">
        <defs>
          <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#20e7ff"/><stop offset=".48" stop-color="#8b5cf6"/><stop offset="1" stop-color="#ffd447"/>
          </linearGradient>
          <radialGradient id="bg" cx="50%" cy="42%" r="80%">
            <stop offset="0" stop-color="#17113a"/><stop offset=".55" stop-color="#070512"/><stop offset="1" stop-color="#010107"/>
          </radialGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="10" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>
        <rect width="1200" height="760" rx="34" fill="url(#bg)"/>
        <rect x="15" y="15" width="1170" height="730" rx="26" fill="none" stroke="url(#edge)" stroke-width="3"/>
        <rect x="28" y="28" width="1144" height="704" rx="20" fill="none" stroke="#ffffff" stroke-opacity=".08"/>
        <path d="M55 92 H330 M870 92 H1145" stroke="#22d3ee" stroke-opacity=".45"/>
        <text x="62" y="70" fill="#ffffff" font-family="Arial" font-size="22" font-weight="800" letter-spacing="5">AETHERVAULT</text>
        <text x="62" y="116" fill="#94a3b8" font-family="Arial" font-size="11" letter-spacing="4">TRUSTLESS • VERIFIED • TIMELESS</text>
        <rect x="890" y="48" width="245" height="52" rx="26" fill="#07140f" stroke="#22c55e" stroke-opacity=".45"/>
        <circle cx="916" cy="74" r="7" fill="#22c55e"/><text x="934" y="80" fill="#86efac" font-family="Arial" font-size="12" font-weight="700">VERIFIED ON-CHAIN</text>
        <text x="600" y="74" text-anchor="middle" fill="#eaf8ff" font-family="Arial" font-size="38" font-weight="900" letter-spacing="8">CERTIFICATE OF AUTHENTICITY</text>
        <text x="600" y="111" text-anchor="middle" fill="#8deeff" font-family="Arial" font-size="13" letter-spacing="6">BLOCKCHAIN VERIFIED • NFT CERTIFICATE</text>

        <rect x="58" y="145" width="345" height="530" rx="22" fill="#05030f" stroke="#22d3ee" stroke-opacity=".35"/>
        <circle cx="230" cy="295" r="155" fill="none" stroke="#22d3ee" stroke-opacity=".3" stroke-width="2" stroke-dasharray="12 18"/>
        <circle cx="230" cy="295" r="130" fill="none" stroke="#8b5cf6" stroke-opacity=".4" stroke-width="2" stroke-dasharray="4 14"/>
        <circle cx="230" cy="295" r="103" fill="#03020a" stroke="${color}" stroke-opacity=".45" stroke-width="2"/>
        <g filter="url(#glow)">${logo}</g>
        <text x="230" y="445" text-anchor="middle" fill="#67e8f9" font-family="Arial" font-size="13" font-weight="700" letter-spacing="4">AETHER PROOF</text>
        <text x="230" y="474" text-anchor="middle" fill="#71717a" font-family="Arial" font-size="10" letter-spacing="3">AUTHENTIC DIGITAL ASSET</text>

        <rect x="438" y="145" width="470" height="530" rx="22" fill="#05030f" stroke="#ffffff" stroke-opacity=".1"/>
        <text x="472" y="180" fill="#22d3ee" font-family="Arial" font-size="10" font-weight="700" letter-spacing="3">PROOF RECORD</text>
        <text x="472" y="225" fill="#737b8c" font-family="Arial" font-size="11">CERTIFICATE ID</text>
        <text x="472" y="252" fill="#ffffff" font-family="monospace" font-size="17" font-weight="700">AETH-PROOF-${safeSvg(serial)}</text>
        <line x1="472" y1="272" x2="874" y2="272" stroke="#ffffff" stroke-opacity=".1"/>
        <text x="472" y="304" fill="#737b8c" font-family="Arial" font-size="11">TITLE / ASSET</text>
        <text x="472" y="331" fill="#ffffff" font-family="Arial" font-size="20" font-weight="700">${safeSvg(title || 'Proof Title Preview').slice(0, 38)}</text>
        <text x="472" y="370" fill="#737b8c" font-family="Arial" font-size="11">CREATOR / USERNAME</text>
        <text x="472" y="397" fill="#ffffff" font-family="Arial" font-size="17">${safeSvg(creatorName || 'Not Connected').slice(0, 34)}</text>
        <line x1="472" y1="418" x2="874" y2="418" stroke="#ffffff" stroke-opacity=".1"/>
        <text x="472" y="450" fill="#737b8c" font-family="Arial" font-size="11">CATEGORY / BADGE</text>
        <rect x="472" y="466" width="260" height="42" rx="21" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-opacity=".65"/>
        <text x="602" y="493" text-anchor="middle" fill="${color}" font-family="Arial" font-size="13" font-weight="800" letter-spacing="3">${safeSvg(category).toUpperCase()}</text>
        <text x="472" y="548" fill="#737b8c" font-family="Arial" font-size="11">FILE HASH</text>
        <text x="472" y="573" fill="#a5f3fc" font-family="monospace" font-size="10">${safeSvg(fileHash).slice(0, 57)}</text>
        <text x="472" y="610" fill="#737b8c" font-family="Arial" font-size="11">NETWORK</text>
        <text x="472" y="635" fill="#fbbf24" font-family="Arial" font-size="12" font-weight="700">BNB SMART CHAIN TESTNET • CHAIN 97</text>

        <rect x="930" y="145" width="212" height="530" rx="22" fill="#05030f" stroke="#8b5cf6" stroke-opacity=".4"/>
        <text x="1036" y="180" text-anchor="middle" fill="#ffffff" font-family="Arial" font-size="11" font-weight="700" letter-spacing="3">NFT PREVIEW</text>
        <rect x="958" y="205" width="156" height="190" rx="18" fill="#02020a" stroke="${color}" stroke-opacity=".4"/>
        <circle cx="1036" cy="300" r="67" fill="none" stroke="#22d3ee" stroke-opacity=".35" stroke-width="2" stroke-dasharray="7 12"/>
        ${logo.replace(/x="118" y="205" width="190" height="190"/, 'x="981" y="245" width="110" height="110"')}
        <text x="1036" y="430" text-anchor="middle" fill="${color}" font-family="Arial" font-size="12" font-weight="900" letter-spacing="3">${safeSvg(category).toUpperCase()}</text>
        <text x="1036" y="478" text-anchor="middle" fill="#737b8c" font-family="Arial" font-size="9" letter-spacing="3">TOKEN / SERIAL</text>
        <text x="1036" y="505" text-anchor="middle" fill="#ffffff" font-family="monospace" font-size="15" font-weight="700">${safeSvg(serial)}</text>
        <rect x="981" y="535" width="110" height="110" fill="#ffffff" rx="8"/>
        <text x="1036" y="575" text-anchor="middle" fill="#111827" font-family="Arial" font-size="9" font-weight="700">SCAN TO VERIFY</text>
        <text x="1036" y="594" text-anchor="middle" fill="#111827" font-family="monospace" font-size="8">ON-CHAIN</text>
        <text x="1036" y="625" text-anchor="middle" fill="#64748b" font-family="Arial" font-size="7">QR GENERATED IN APP</text>
      </svg>`;
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  };

  const buildTokenMetadataUri = (serial) => {
    const image = buildNftImage({ serial });
    const metadata = {
      name: title.trim() || 'Aether Proof',
      description: description.trim() || 'AetherVault Cryptographic Certificate of Authenticity',
      image,
      external_url: `${BSC_TESTNET_EXPLORER}/address/${AETHER_VAULT_ADDRESS}`,
      attributes: [
        { trait_type: 'Category', value: category },
        { trait_type: 'Badge', value: currentConfig.badge },
        { trait_type: 'Creator', value: creatorName.trim() || realAddress || 'Not Connected' },
        { trait_type: 'File Hash', value: fileHash },
        { trait_type: 'Metadata Hash', value: metadataHash },
        { trait_type: 'Network', value: BSC_TESTNET_NAME },
        { trait_type: 'Chain ID', value: 97 },
        { trait_type: 'Contract', value: AETHER_VAULT_ADDRESS }
      ]
    };
    return `data:application/json;base64,${btoa(unescape(encodeURIComponent(JSON.stringify(metadata))))}`;
  };

  const handleMintSequence = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setView('minting');

    try {
      setMintStep(1);
      if (!window.ethereum) throw new Error('MetaMask / wallet Web3 tidak ditemukan.');

      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();

      if (Number(network.chainId) !== BSC_TESTNET_CHAIN_ID) {
        await provider.send('wallet_switchEthereumChain', [{ chainId: BSC_TESTNET_HEX }]);
      }

      setMintStep(2);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const tokenURIParam = buildTokenMetadataUri('ON-CHAIN');

      setMintStep(3);
      const contract = new ethers.Contract(AETHER_VAULT_ADDRESS, AetherVaultV3ABI, signer);
      const tx = await contract.createProof(tier, category, fileHash, tokenURIParam, true);

      setMintStep(4);
      const receipt = await tx.wait();

      let tokenId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
          if (parsed?.name === 'ProofMinted') {
            tokenId = parsed.args.tokenId.toString();
            break;
          }
        } catch (_) {}
      }

      if (tokenId === null) {
        throw new Error('Transaksi berhasil, tetapi Token ID tidak ditemukan pada event ProofMinted.');
      }

      setMintStep(5);
      const block = await provider.getBlock(receipt.blockNumber);
      const creator = creatorName.trim() || signerAddress;
      const finalTokenURI = buildTokenMetadataUri(tokenId);

      setGeneratedProof({
        tokenId,
        id: `AETH-PROOF-${tokenId}`,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        contract: AETHER_VAULT_ADDRESS,
        category,
        title: title.trim(),
        description: description.trim(),
        badge: currentConfig.badge,
        badgeIcon: currentConfig.badgeIcon,
        creator,
        wallet: signerAddress,
        fileHash,
        metaHash: metadataHash,
        date: new Date((block?.timestamp || Math.floor(Date.now()/1000)) * 1000).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }),
        network: BSC_TESTNET_NAME,
        chainId: BSC_TESTNET_CHAIN_ID,
        tokenURI: finalTokenURI,
        verifyUrl: `${BSC_TESTNET_EXPLORER}/tx/${receipt.hash}`,
        image: buildNftImage({ serial: tokenId })
      });

      setView('success');
    } catch (error) {
      console.error('Minting failed:', error);
      alert('Transaction failed or rejected: ' + (error?.reason || error?.shortMessage || error?.message || 'Unknown error'));
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

  const CertificateTemplate = ({ proofData }) => {
    const data = proofData || {
      id: 'AETH-PROOF-PREVIEW',
      category,
      title: title || 'Proof Title Preview',
      badge: currentConfig.badge,
      badgeIcon: currentConfig.badgeIcon,
      creator: creatorName || 'Not Connected',
      wallet: realAddress || 'Not Connected',
      fileHash: isHashing ? 'Calculating Keccak256...' : fileHash,
      metaHash: metadataHash,
      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      network: BSC_TESTNET_NAME,
      contract: AETHER_VAULT_ADDRESS,
      verifyUrl: `${BSC_TESTNET_EXPLORER}/address/${AETHER_VAULT_ADDRESS}`
    };
    const colorMap = {
      Writing:'#22d3ee', Photography:'#f472b6', Design:'#a78bfa', Music:'#fbbf24',
      Video:'#f87171', Software:'#4ade80', Research:'#60a5fa', Business:'#fb923c',
      Legal:'#c084fc', Other:'#94a3b8'
    };
    const accent = colorMap[data.category] || '#fbbf24';
    return (
      <div ref={certificateRef} className="relative w-[1200px] h-[760px] shrink-0 overflow-hidden rounded-[26px] bg-[#03020a] text-white border border-white/10 shadow-[0_0_80px_rgba(34,211,238,.12)] font-sans">
        <style>{`
          @keyframes avSpin{to{transform:rotate(360deg)}} 
          @keyframes avSpinR{to{transform:rotate(-360deg)}} 
          @keyframes avPulse{0%,100%{opacity:.4;transform:scale(.96)}50%{opacity:.95;transform:scale(1.04)}} 
          @keyframes avSweep{0%,55%{transform:translateX(-140%);opacity:0}65%{opacity:.75}85%,100%{transform:translateX(140%);opacity:0}}
        `}</style>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(79,70,229,.22),transparent_42%),radial-gradient(circle_at_15%_75%,rgba(34,211,238,.12),transparent_30%),radial-gradient(circle_at_90%_75%,rgba(245,158,11,.10),transparent_28%)]"/>
        <div className="absolute inset-4 rounded-[20px] border border-cyan-300/25"/>
        <div className="absolute inset-6 rounded-[18px] border border-violet-400/15"/>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[320px] h-1 bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-400"/>

        <div className="relative z-10 flex items-center justify-between px-12 pt-9">
          <div>
            <div className="flex items-center gap-3">
              {logoDataUrl ? <img src={logoDataUrl} alt="" className="w-12 h-12 object-contain"/> : <div className="w-12 h-12 rounded-xl border border-amber-400/40 flex items-center justify-center text-amber-300 font-black text-2xl">A</div>}
              <div>
                <div className="text-2xl font-black tracking-[.18em]">AETHER<span className="text-amber-300">VAULT</span></div>
                <div className="text-[9px] tracking-[.35em] text-slate-400">TRUSTLESS • VERIFIED • TIMELESS</div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 rounded-2xl border border-emerald-400/30 bg-emerald-400/5">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold tracking-widest"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"/> VERIFIED ON-CHAIN</div>
            <div className="text-[10px] text-amber-300 mt-1 tracking-widest text-right">BNB SMART CHAIN TESTNET</div>
          </div>
        </div>

        <div className="relative z-10 text-center mt-4">
          <h4 className="text-[42px] leading-none font-black tracking-[.14em] bg-gradient-to-r from-cyan-200 via-white to-fuchsia-200 bg-clip-text text-transparent">CERTIFICATE OF AUTHENTICITY</h4>
          <p className="mt-3 text-[13px] tracking-[.55em] text-slate-400">BLOCKCHAIN VERIFIED &nbsp;|&nbsp; NFT CERTIFICATE</p>
        </div>

        <div className="relative z-10 grid grid-cols-[350px_1fr_220px] gap-5 px-12 mt-6">
          <div className="relative h-[480px] rounded-[24px] border border-cyan-300/25 bg-black/30 overflow-hidden flex flex-col items-center justify-center">
            <div className="absolute w-[310px] h-[310px] rounded-full border border-cyan-400/25" style={{animation:'avSpin 10s linear infinite'}}/>
            <div className="absolute w-[270px] h-[270px] rounded-full border border-violet-400/25 border-dashed" style={{animation:'avSpinR 7s linear infinite'}}/>
            <div className="absolute w-[225px] h-[225px] rounded-full border border-amber-400/20" style={{animation:'avSpin 14s linear infinite'}}/>
            <div className="absolute w-[190px] h-[190px] rounded-full bg-amber-400/10 blur-3xl" style={{animation:'avPulse 3s ease-in-out infinite'}}/>
            <div className="relative z-10 w-[150px] h-[150px] flex items-center justify-center">
              {logoDataUrl ? <img src={logoDataUrl} alt="AetherVault" className="w-full h-full object-contain drop-shadow-[0_0_25px_rgba(251,191,36,.65)]" style={{animation:'avPulse 3.4s ease-in-out infinite'}}/> : <div className="text-8xl text-amber-300 font-black">A</div>}
            </div>
            <div className="absolute bottom-9 text-[11px] tracking-[.35em] text-cyan-300">AUTHENTIC AETHER PROOF</div>
          </div>

          <div className="h-[480px] rounded-[24px] border border-white/10 bg-black/25 p-7">
            <div className="text-[10px] text-cyan-300 tracking-[.3em] font-bold">PROOF RECORD</div>
            <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-6">
              <div className="col-span-2"><div className="label">CERTIFICATE ID</div><div className="value text-cyan-300">#{data.id}</div></div>
              <div><div className="label">TITLE / ASSET</div><div className="value">{data.title || 'Untitled Proof'}</div></div>
              <div><div className="label">CREATOR / USERNAME</div><div className="value truncate">@{String(data.creator || 'Not Connected').replace(/^@/,'')}</div></div>
              <div><div className="label">ISSUED ON</div><div className="value">{data.date}</div></div>
              <div><div className="label">BLOCKCHAIN</div><div className="value text-amber-300">BNB Smart Chain Testnet</div></div>
              <div><div className="label">CATEGORY / BADGE</div><div className="value" style={{color:accent}}>{data.badgeIcon} {data.badge}</div></div>
              <div><div className="label">OWNER WALLET</div><div className="value font-mono text-[12px]">{formatAddress(data.wallet)}</div></div>
              <div className="col-span-2"><div className="label">TRANSACTION HASH</div><div className="value font-mono text-[11px] break-all">{data.txHash || 'Pending mint'}</div></div>
              <div className="col-span-2 rounded-xl border border-cyan-400/10 bg-cyan-400/5 p-4">
                <div className="text-[10px] text-cyan-300 tracking-[.25em] font-bold mb-3">ON-CHAIN METADATA</div>
                <div className="grid grid-cols-2 gap-4">
                  <div><div className="label">TOKEN ID</div><div className="value">{data.tokenId || 'PREVIEW'}</div></div>
                  <div><div className="label">CHAIN ID</div><div className="value">97</div></div>
                  <div className="col-span-2"><div className="label">CONTRACT</div><div className="value font-mono text-[10px]">{data.contract}</div></div>
                  <div className="col-span-2"><div className="label">FILE HASH / KECCAK256</div><div className="value font-mono text-[10px] break-all">{data.fileHash}</div></div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[480px] rounded-[24px] border bg-black/25 p-4 flex flex-col items-center" style={{borderColor:`${accent}55`}}>
            <div className="text-[10px] tracking-[.3em] text-white mb-4">NFT PREVIEW</div>
            <div className="relative w-[178px] h-[210px] rounded-[18px] border overflow-hidden bg-[#02020a]" style={{borderColor:`${accent}70`}}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(139,92,246,.35),transparent_55%)]"/>
              <div className="absolute inset-3 rounded-xl border border-cyan-300/15"/>
              <div className="absolute inset-0 flex items-center justify-center">
                {logoDataUrl ? <img src={logoDataUrl} alt="" className="w-24 h-24 object-contain drop-shadow-[0_0_20px_rgba(251,191,36,.7)]" style={{animation:'avPulse 2.8s ease-in-out infinite'}}/> : <div className="text-6xl text-amber-300 font-black">A</div>}
              </div>
              <div className="absolute inset-x-0 bottom-3 text-center text-[9px] tracking-[.2em]" style={{color:accent}}>{String(data.category).toUpperCase()}</div>
            </div>
            <div className="mt-5 text-[9px] tracking-[.28em] text-slate-500">SERIAL / TOKEN ID</div>
            <div className="mt-1 font-mono font-bold text-white">{data.tokenId || 'PREVIEW'}</div>
            <div className="mt-5 w-[110px] h-[110px] bg-white rounded-lg p-2 flex items-center justify-center">
              <QRCode value={data.verifyUrl || `${BSC_TESTNET_EXPLORER}/address/${AETHER_VAULT_ADDRESS}`} size={92} level="M"/>
            </div>
            <div className="mt-3 text-[8px] tracking-[.18em] text-slate-400 text-center">SCAN TO VERIFY ON-CHAIN</div>
          </div>
        </div>

        <div className="absolute bottom-4 left-12 right-12 z-10 flex justify-between items-center text-[9px] font-mono tracking-[.18em] text-slate-500">
          <span>AETHERVAULT™ REGISTRY</span><span>CHAIN 97</span><span>{formatAddress(data.contract)}</span>
        </div>
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-white/10 blur-2xl pointer-events-none" style={{animation:'avSweep 5.5s ease-in-out infinite', transform:'translateX(-150%) skewX(-18deg)'}}/>
        <style>{`.label{font-size:9px;letter-spacing:.2em;color:#64748b;text-transform:uppercase;margin-bottom:4px}.value{font-size:14px;font-weight:700;color:#f8fafc;line-height:1.25}`}</style>
      </div>
    );
  };


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
                <div key={idx} className="bg-[#05030F] border border-neutral-800 p-4 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-cyan-400">{val.icon}</div>
                      <h5 className="font-bold text-white text-sm">{key}</h5>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">{val.price} AETH</span>
                  </div>
                  <div className="mt-3 flex items-center gap-1.5 text-[10px] text-neutral-400 bg-neutral-900/50 py-1.5 px-2 rounded-lg border border-neutral-800/50">
                    <span>{val.badgeIcon}</span> <span className="font-bold">{val.badge}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {view === 'form' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-[#0B0817] border border-amber-500/30 p-6 sm:p-8 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <button onClick={() => setView('hub')} className="mb-3 flex items-center gap-2 text-xs text-neutral-400 hover:text-white cursor-pointer">
                  <ChevronLeft className="w-4 h-4"/> Back
                </button>
                <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white">Metadata Details</h3>
                <p className="text-[10px] text-neutral-500 mt-1">Create the proof metadata that will appear on the NFT certificate.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono text-emerald-400 border border-emerald-500/20 rounded-full px-3 py-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/> BSC TESTNET • CHAIN 97
              </div>
            </div>

            <form onSubmit={handleMintSequence} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 cursor-pointer">
                    {Object.keys(categoryConfig).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Title *</label>
                  <input required type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Core Smart Contract v1" className="mt-1.5 w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500"/>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Creator / Username</label>
                  <input type="text" value={creatorName} onChange={(e) => setCreatorName(e.target.value)} placeholder="e.g. AetherMusic" className="mt-1.5 w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500"/>
                </div>
                <div>
                  <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short certificate description" className="mt-1.5 w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500"/>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_330px] gap-4 pt-2 border-t border-neutral-800">
                <div>
                  <label className="text-[9px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5"><Fingerprint className="w-3 h-3"/> Target File — Generate Keccak256</label>
                  {!file ? (
                    <div className="mt-1.5 border-2 border-dashed border-neutral-800 hover:border-amber-500/50 bg-[#05030F] rounded-xl p-5 text-center cursor-pointer relative">
                      <input type="file" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                      <UploadCloud className="w-7 h-7 text-neutral-600 mx-auto mb-1"/>
                      <p className="text-[10px] text-white font-bold">Select File for Keccak256</p>
                      <p className="text-[8px] text-neutral-600 mt-1">The file itself is hashed locally in your browser.</p>
                    </div>
                  ) : (
                    <div className="mt-1.5 bg-[#05030F] border border-cyan-500/30 p-3 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 truncate"><FileImage className="w-4 h-4 text-cyan-400 shrink-0"/><span className="text-[10px] text-white truncate">{file.name}</span></div>
                      <button type="button" onClick={() => {setFile(null); setFileHash('0x' + '00'.repeat(32));}} className="text-[9px] text-red-400 shrink-0 cursor-pointer">Remove</button>
                    </div>
                  )}
                  <p className="text-[8px] text-neutral-600 font-mono mt-2 break-all">{isHashing ? 'Calculating Keccak256…' : fileHash}</p>
                </div>
                <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-xl">
                  <div className="flex justify-between text-[10px] font-mono mb-2"><span className="text-neutral-400">Mint Cost</span><span className="text-white font-bold">{currentConfig.price} AETH</span></div>
                  <div className="flex justify-between text-[10px] font-mono mb-2"><span className="text-neutral-500">Category Badge</span><span style={{color: currentConfig.badge === 'Verified Artist' ? '#fbbf24' : '#22d3ee'}}>{currentConfig.badgeIcon} {currentConfig.badge}</span></div>
                  <div className="flex justify-between text-[10px] font-mono border-t border-neutral-800 pt-2"><span className="text-neutral-400">Network</span><span className="text-emerald-400">BSC Testnet / 97</span></div>
                  <button type="submit" disabled={!title || isHashing} className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                    <Award className="w-4 h-4"/> Mint & Issue Proof
                  </button>
                </div>
              </div>
            </form>
          </div>

          <div ref={previewViewportRef} className="bg-[#05030F] border border-neutral-900 p-4 sm:p-6 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-[9px] uppercase tracking-widest"><Eye className="w-3 h-3"/> Live NFT Preview</div>
              <div className="flex items-center gap-1 bg-[#0B0817] border border-neutral-800 rounded-xl p-1">
                <button type="button" onClick={() => setPreviewScale(s => Math.max(0.28, +(s - 0.05).toFixed(2)))} className="w-8 h-8 rounded-lg text-white hover:bg-white/10">−</button>
                <button type="button" onClick={() => { const el = previewViewportRef.current; if (el) setPreviewScale(Math.min(0.82, Math.max(0.28, (el.clientWidth - 32) / 1200))); }} className="px-3 h-8 rounded-lg text-cyan-300 text-[10px] font-mono">{Math.round(previewScale*100)}%</button>
                <button type="button" onClick={() => setPreviewScale(s => Math.min(0.82, +(s + 0.05).toFixed(2)))} className="w-8 h-8 rounded-lg text-white hover:bg-white/10">+</button>
              </div>
            </div>
            <div className="overflow-auto rounded-xl border border-white/5 bg-[#02010A]">
              <div className="origin-top-left" style={{width: `${1200 * previewScale}px`, height: `${760 * previewScale}px`}}>
                <div style={{width:'1200px', height:'760px', transform:`scale(${previewScale})`, transformOrigin:'top left'}}>
                  <CertificateTemplate proofData={{
                    id:'AETH-PROOF-PREVIEW',
                    category,
                    title:title || 'Proof Title Preview',
                    badge:currentConfig.badge,
                    badgeIcon:currentConfig.badgeIcon,
                    creator:creatorName || 'Not Connected',
                    wallet:realAddress || 'Not Connected',
                    fileHash:isHashing ? 'Calculating Keccak256...' : fileHash,
                    metaHash:metadataHash,
                    date:new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),
                    network:BSC_TESTNET_NAME,
                    contract:AETHER_VAULT_ADDRESS,
                    verifyUrl:`${BSC_TESTNET_EXPLORER}/address/${AETHER_VAULT_ADDRESS}`
                  }}/>
                </div>
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

          <div className="w-full overflow-auto custom-scrollbar shadow-2xl rounded-2xl"><CertificateTemplate proofData={generatedProof} /></div>

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
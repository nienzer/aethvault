import React, { useState, useRef, useEffect } from 'react';
import { Award, ShieldCheck, Download, CheckCircle2, Globe, Music, Code2, Palette, BookOpen, Camera, Film, Microscope, Building2, Scale, Box, User, Link as LinkIcon, UploadCloud, Lock, ChevronLeft, Loader2, FileImage, Cpu, Flame, Fingerprint, Image as ImageIcon, ExternalLink, QrCode, Eye } from 'lucide-react';
import { ethers } from 'ethers';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
const BSC_TESTNET_CHAIN_ID = 97;
const BSC_TESTNET_HEX = '0x61';
const BSC_TESTNET_NAME = 'BNB Smart Chain Testnet';
const BSC_TESTNET_EXPLORER = 'https://testnet.bscscan.com';

// Put the deployed AetherVaultV3 BSC Testnet address in your app config or pass it as a prop.
// We deliberately do NOT invent an address that is not present in the supplied source.
const AETHER_VAULT_ADDRESS =
  (typeof window !== 'undefined' && window.__AETHER_VAULT_V3_BSC_TESTNET__) || '';

const PROOF_ABI = [
  'function createProof(uint8 _tier,string _category,bytes32 _fileHash,string _tokenURI,bool _isPublic) external',
  'function tierConfigs(uint8) view returns (uint256 cost,uint256 burnPart,uint256 maxDuration)',
  'function aethToken() view returns (address)',
  'function totalProofs() view returns (uint256)',
  'function tokenURI(uint256) view returns (string)',
  'event ProofMinted(uint256 indexed tokenId,address indexed creator,string category,bool isPublic,bytes32 fileHash,string tokenURI,uint256 blockNumber)'
];

const ERC20_ABI = [
  'function allowance(address owner,address spender) view returns (uint256)',
  'function approve(address spender,uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)'
];

export default function AetherProofHub({ t, handleViewCertificate, setActiveTab, address, TARGET_CHAIN_NAME }) {
  const [view, setView] = useState('hub');
  const certificateRef = useRef(null);

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

  const switchToBscTestnet = async () => {
    if (!window.ethereum) throw new Error('MetaMask not found!');
    const provider = new ethers.BrowserProvider(window.ethereum);
    const network = await provider.getNetwork();
    if (Number(network.chainId) === BSC_TESTNET_CHAIN_ID) return provider;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BSC_TESTNET_HEX }]
      });
    } catch (switchError) {
      if (switchError?.code !== 4902) throw switchError;
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: BSC_TESTNET_HEX,
          chainName: BSC_TESTNET_NAME,
          nativeCurrency: { name: 'BNB', symbol: 'tBNB', decimals: 18 },
          rpcUrls: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545'],
          blockExplorerUrls: [BSC_TESTNET_EXPLORER]
        }]
      });
    }
    return new ethers.BrowserProvider(window.ethereum);
  };

  const escapeSvg = (value) => String(value ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

  const makeOnChainSvg = ({ titleValue, creatorValue, categoryValue, badgeValue, serialValue }) => {
    const safeTitle = escapeSvg(titleValue || 'Aether Proof');
    const safeCreator = escapeSvg(creatorValue || 'Verified Creator');
    const safeCategory = escapeSvg(categoryValue || 'OTHER').toUpperCase();
    const safeBadge = escapeSvg(badgeValue || 'AUTHENTIC').toUpperCase();
    const safeSerial = escapeSvg(serialValue || 'PENDING');
    const palette = {
      Music: ['#fbbf24','#f59e0b'], Design: ['#a78bfa','#7c3aed'], Writing: ['#60a5fa','#2563eb'],
      Photography: ['#f472b6','#db2777'], Video: ['#f87171','#dc2626'], Software: ['#4ade80','#16a34a'],
      Research: ['#38bdf8','#0284c7'], Business: ['#fb923c','#ea580c'], Legal: ['#c084fc','#9333ea'], Other: ['#94a3b8','#475569']
    };
    const [c1,c2] = palette[categoryValue] || palette.Other;
    return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1500" viewBox="0 0 1200 1500">
      <defs>
        <radialGradient id="bg" cx="50%" cy="38%"><stop offset="0" stop-color="#172554"/><stop offset="0.45" stop-color="#080b18"/><stop offset="1" stop-color="#02030a"/></radialGradient>
        <linearGradient id="gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff7c2"/><stop offset=".35" stop-color="#f5c451"/><stop offset=".7" stop-color="#b7791f"/><stop offset="1" stop-color="#fff1a8"/></linearGradient>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
        <filter id="glow"><feGaussianBlur stdDeviation="14" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        <filter id="soft"><feGaussianBlur stdDeviation="45"/></filter>
        <pattern id="grid" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M70 0H0V70" fill="none" stroke="#fff" stroke-opacity=".035"/></pattern>
      </defs>
      <rect width="1200" height="1500" rx="70" fill="#02030a"/>
      <rect x="24" y="24" width="1152" height="1452" rx="48" fill="url(#bg)" stroke="#ffffff" stroke-opacity=".14" stroke-width="2"/>
      <rect x="24" y="24" width="1152" height="1452" rx="48" fill="url(#grid)"/>
      <circle cx="600" cy="570" r="300" fill="${c1}" opacity=".07" filter="url(#soft)"/>
      <circle cx="600" cy="570" r="245" fill="none" stroke="url(#accent)" stroke-opacity=".22" stroke-width="2" stroke-dasharray="8 20"/>
      <circle cx="600" cy="570" r="220" fill="none" stroke="url(#gold)" stroke-opacity=".45" stroke-width="3" stroke-dasharray="1 18"/>
      <circle cx="600" cy="570" r="185" fill="#050711" stroke="#ffffff" stroke-opacity=".12" stroke-width="2"/>
      <path d="M600 400 L690 520 L600 735 L510 520 Z" fill="none" stroke="url(#gold)" stroke-width="9" opacity=".95" filter="url(#glow)"/>
      <path d="M600 430 L645 520 L600 680 L555 520 Z" fill="#090b14" stroke="url(#gold)" stroke-width="4"/>
      <path d="M555 520 L600 565 L645 520" fill="none" stroke="url(#accent)" stroke-width="8"/>
      <text x="600" y="565" fill="#fff8d6" font-size="62" font-family="Arial, sans-serif" font-weight="900" text-anchor="middle" letter-spacing="9">AETH</text>
      <text x="600" y="805" fill="#ffffff" font-size="18" font-family="Arial, sans-serif" font-weight="700" text-anchor="middle" letter-spacing="7">AETHER PROOF</text>
      <rect x="350" y="850" width="500" height="76" rx="38" fill="#ffffff" fill-opacity=".045" stroke="${c1}" stroke-opacity=".55"/>
      <circle cx="390" cy="888" r="11" fill="${c1}" filter="url(#glow)"/>
      <text x="425" y="897" fill="#fff" font-size="24" font-family="Arial, sans-serif" font-weight="800" letter-spacing="3">${safeCategory}</text>
      <text x="600" y="1010" fill="#ffffff" font-size="34" font-family="Arial, sans-serif" font-weight="800" text-anchor="middle">${safeTitle.slice(0,38)}</text>
      <text x="600" y="1055" fill="#9ca3af" font-size="20" font-family="Arial, sans-serif" text-anchor="middle">CREATED BY @${safeCreator.replace(/^@/,'')}</text>
      <text x="600" y="1125" fill="#f5c451" font-size="16" font-family="monospace" font-weight="700" text-anchor="middle" letter-spacing="4">${safeBadge}</text>
      <line x1="270" y1="1180" x2="930" y2="1180" stroke="#fff" stroke-opacity=".1"/>
      <text x="600" y="1235" fill="#6b7280" font-size="15" font-family="monospace" text-anchor="middle" letter-spacing="3">TOKEN / PROOF SERIAL</text>
      <text x="600" y="1280" fill="#ffffff" font-size="25" font-family="monospace" font-weight="700" text-anchor="middle">${safeSerial}</text>
      <text x="600" y="1370" fill="#6b7280" font-size="14" font-family="monospace" text-anchor="middle" letter-spacing="4">BSC TESTNET • CHAIN 97 • ON-CHAIN</text>
    </svg>`;
  };

  const makeDataUri = (mime, text) => `data:${mime};base64,${btoa(unescape(encodeURIComponent(text)))}`;

  const handleMintSequence = async (e) => {
    e.preventDefault();
    setView('minting');

    try {
      if (!window.ethereum) throw new Error('MetaMask not found.');
      if (!AETHER_VAULT_ADDRESS) {
        throw new Error('AetherVaultV3 BSC Testnet address belum dikonfigurasi. Set window.__AETHER_VAULT_V3_BSC_TESTNET__ ke alamat deployment BSC Testnet Anda.');
      }
      if (!fileHash || /^0x0+$/.test(fileHash)) throw new Error('Upload file terlebih dahulu agar File Hash valid.');

      setMintStep(1);
      const provider = await switchToBscTestnet();
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();
      const proofContract = new ethers.Contract(AETHER_VAULT_ADDRESS, PROOF_ABI, signer);

      setMintStep(2);
      const tierConfig = await proofContract.tierConfigs(tier);
      const aethAddress = await proofContract.aethToken();
      const aeth = new ethers.Contract(aethAddress, ERC20_ABI, signer);
      const allowance = await aeth.allowance(signerAddress, AETHER_VAULT_ADDRESS);
      if (allowance < tierConfig.cost) {
        const approveTx = await aeth.approve(AETHER_VAULT_ADDRESS, tierConfig.cost);
        await approveTx.wait();
      }

      const creator = creatorName.trim() || formatAddress(signerAddress);
      const svg = makeOnChainSvg({
        titleValue: title,
        creatorValue: creator,
        categoryValue: category,
        badgeValue: currentConfig.badge,
        serialValue: 'GENERATED ON-CHAIN'
      });
      const imageUri = makeDataUri('image/svg+xml', svg);
      const nftMetadata = {
        name: title || 'Aether Proof',
        description: description || 'Cryptographic proof registered by AetherVault on BNB Smart Chain Testnet.',
        image: imageUri,
        external_url: `${BSC_TESTNET_EXPLORER}/address/${AETHER_VAULT_ADDRESS}`,
        attributes: [
          { trait_type: 'Category', value: category },
          { trait_type: 'Badge', value: currentConfig.badge },
          { trait_type: 'Creator', value: creator },
          { trait_type: 'Creator Wallet', value: signerAddress },
          { trait_type: 'File Hash', value: fileHash },
          { trait_type: 'Metadata Hash', value: metadataHash },
          { trait_type: 'Network', value: BSC_TESTNET_NAME },
          { trait_type: 'Chain ID', value: String(BSC_TESTNET_CHAIN_ID) },
          { trait_type: 'Standard', value: 'ERC-721' }
        ]
      };
      const tokenURIParam = makeDataUri('application/json', JSON.stringify(nftMetadata));

      setMintStep(3);
      setMintStep(4);
      const tx = await proofContract.createProof(tier, category, fileHash, tokenURIParam, true);

      setMintStep(5);
      const receipt = await tx.wait();

      let tokenId = null;
      let emittedTokenUri = tokenURIParam;
      for (const log of receipt.logs || []) {
        try {
          const parsed = proofContract.interface.parseLog(log);
          if (parsed && parsed.name === 'ProofMinted') {
            tokenId = parsed.args.tokenId.toString();
            emittedTokenUri = parsed.args.tokenURI;
            break;
          }
        } catch (_) {}
      }
      if (!tokenId) throw new Error('Transaksi berhasil tetapi event ProofMinted tidak ditemukan. Jangan tampilkan sertifikat sebagai minted sebelum Token ID terverifikasi.');

      const verifyUrl = `${BSC_TESTNET_EXPLORER}/token/${AETHER_VAULT_ADDRESS}?a=${tokenId}`;
      const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      const serial = `AP-${String(tokenId).padStart(6, '0')}`;

      setGeneratedProof({
        tokenId,
        id: `AETH-PROOF-${tokenId}`,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        contract: AETHER_VAULT_ADDRESS,
        category,
        title,
        description,
        badge: currentConfig.badge,
        badgeIcon: currentConfig.badgeIcon,
        creator,
        wallet: signerAddress,
        fileHash,
        metaHash: metadataHash,
        tokenURI: emittedTokenUri,
        serial,
        date,
        network: BSC_TESTNET_NAME,
        chainId: BSC_TESTNET_CHAIN_ID,
        verifyUrl,
        imageUri
      });

      setView('success');
    } catch (error) {
      console.error('BSC Testnet minting failed:', error);
      alert('BSC Testnet transaction failed or rejected: ' + (error?.reason || error?.shortMessage || error?.message || error));
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
    const cat = proofData?.category || category;
    const catCfg = categoryConfig[cat] || categoryConfig.Other;
    return (
      <div ref={certificateRef} className="w-[1100px] min-h-[760px] bg-[#05040b] text-white rounded-[32px] p-10 relative overflow-hidden shadow-2xl border border-white/10 mx-auto font-sans">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_42%,rgba(245,158,11,.16),transparent_24%),radial-gradient(circle_at_15%_85%,rgba(124,58,237,.14),transparent_30%),linear-gradient(135deg,#080711,#03040a)]" />
        <div className="absolute inset-5 rounded-[26px] border border-white/10 pointer-events-none" />
        <div className="absolute -top-32 -right-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-20 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-2xl border border-amber-300/30 bg-amber-300/5 flex items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(245,158,11,.12)]">
              <img src="/logo.png" alt="AetherVault" className="w-8 h-8 object-contain" onError={(e)=>{e.currentTarget.style.display='none';}} />
            </div>
            <div>
              <div className="text-sm font-black tracking-[.3em]">AETHERVAULT</div>
              <div className="text-[9px] text-neutral-500 font-mono tracking-[.25em] uppercase">Aether Proof Registry</div>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-full border border-emerald-400/20 bg-emerald-400/5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-bold tracking-[.18em] text-emerald-300">VERIFIED ON-CHAIN</span>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-[1.05fr_.95fr] gap-10 pt-8">
          <div className="flex flex-col justify-between min-h-[600px]">
            <div>
              <div className="text-[10px] font-mono tracking-[.35em] text-amber-400 uppercase mb-4">Cryptographic Certificate of Authenticity</div>
              <h2 className="text-5xl font-black leading-tight tracking-tight max-w-xl">{proofData?.title || 'Untitled Proof'}</h2>
              <p className="mt-4 text-sm text-neutral-400 max-w-xl leading-relaxed">A permanent digital proof registered as an ERC-721 Aether Proof on BNB Smart Chain Testnet.</p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                {[
                  ['CERTIFICATE ID', proofData?.id],
                  ['CREATOR / USER', `@${String(proofData?.creator || '').replace(/^@/,'')}`],
                  ['OWNER WALLET', proofData?.wallet],
                  ['CATEGORY', `${proofData?.badgeIcon || '✨'} ${proofData?.category || 'Other'}`],
                  ['TOKEN ID', proofData?.tokenId],
                  ['ISSUED', proofData?.date]
                ].map(([label,value]) => (
                  <div key={label} className="rounded-2xl border border-white/8 bg-white/[.025] p-4">
                    <div className="text-[8px] font-mono tracking-[.2em] text-neutral-500 mb-2">{label}</div>
                    <div className="text-xs font-bold text-neutral-200 truncate">{value || '—'}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="grid grid-cols-2 gap-4 text-[10px] font-mono">
                  <div><span className="text-neutral-600">NETWORK</span><div className="text-amber-300 mt-1">BNB SMART CHAIN TESTNET</div></div>
                  <div><span className="text-neutral-600">CHAIN ID</span><div className="text-white mt-1">97</div></div>
                  <div><span className="text-neutral-600">CONTRACT</span><div className="text-white mt-1 truncate">{proofData?.contract}</div></div>
                  <div><span className="text-neutral-600">TX HASH</span><div className="text-white mt-1 truncate">{proofData?.txHash}</div></div>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-end justify-between gap-6">
              <div className="max-w-[390px]">
                <div className="text-[8px] text-neutral-600 uppercase tracking-[.2em] mb-2">File Proof Hash • Keccak256</div>
                <div className="text-[9px] text-neutral-400 font-mono break-all">{proofData?.fileHash}</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] text-neutral-600 uppercase tracking-[.2em]">AetherVault Registry</div>
                <div className="text-[10px] text-amber-300 font-bold mt-1">IMMUTABLE • ERC-721 • BSC TESTNET</div>
              </div>
            </div>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="absolute w-[470px] h-[610px] rounded-[42px] border border-amber-300/10 rotate-2" />
            <div className="absolute w-[470px] h-[610px] rounded-[42px] border border-violet-400/10 -rotate-2" />
            <div className="relative w-[430px] h-[570px] rounded-[36px] overflow-hidden border border-white/15 bg-[#070812] shadow-[0_0_90px_rgba(245,158,11,.12)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,rgba(245,158,11,.18),transparent_28%),radial-gradient(circle_at_70%_70%,rgba(124,58,237,.14),transparent_32%)]" />
              <div className="absolute inset-4 rounded-[28px] border border-white/8" />
              <div className="absolute top-7 left-7 right-7 flex justify-between items-center z-20">
                <span className="text-[8px] font-mono tracking-[.25em] text-neutral-500">AETHER PROOF</span>
                <span className="text-[8px] font-mono tracking-[.2em] text-emerald-300">LIVE • 97</span>
              </div>
              <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2 w-[270px] h-[270px]">
                <div className="absolute inset-0 rounded-full border border-amber-300/30 animate-[spin_14s_linear_infinite] border-dashed" />
                <div className="absolute inset-5 rounded-full border border-violet-400/25 animate-[spin_9s_linear_infinite_reverse]" />
                <div className="absolute inset-11 rounded-full border border-white/10 animate-[spin_18s_linear_infinite]" />
                <div className="absolute inset-[56px] rounded-full bg-amber-300/10 blur-2xl animate-pulse" />
                <div className="absolute inset-[65px] rounded-[34%] border border-amber-200/50 rotate-45 bg-black/60 backdrop-blur-xl shadow-[0_0_60px_rgba(245,158,11,.18)] flex items-center justify-center">
                  <img src="/logo.png" alt="AetherVault NFT" className="w-24 h-24 object-contain drop-shadow-[0_0_24px_rgba(245,158,11,.65)] animate-[pulse_3s_ease-in-out_infinite]" onError={(e)=>{e.currentTarget.style.display='none';}} />
                  <div className="absolute inset-0 rounded-[34%] bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[sweep_3.2s_ease-in-out_infinite]" />
                </div>
              </div>
              <div className="absolute bottom-[122px] left-1/2 -translate-x-1/2 z-20 text-center w-[360px]">
                <div className="text-[9px] font-mono tracking-[.3em] text-neutral-500">NFT / ON-CHAIN IDENTITY</div>
                <div className="mt-3 text-xl font-black tracking-tight truncate">{proofData?.title || 'Aether Proof'}</div>
                <div className="mt-2 text-[10px] text-neutral-500">@{String(proofData?.creator || '').replace(/^@/,'')}</div>
              </div>
              <div className="absolute bottom-9 left-7 right-7 z-20 flex items-center justify-between">
                <div className="px-3 py-2 rounded-xl border bg-white/[.03]" style={{borderColor: `${catCfg?.color || '#fbbf24'}55`}}>
                  <span className="mr-2">{proofData?.badgeIcon || '✨'}</span><span className="text-[9px] font-black tracking-[.18em]" style={{color:catCfg?.color || '#fbbf24'}}>{String(proofData?.category || 'OTHER').toUpperCase()}</span>
                </div>
                <div className="text-right"><div className="text-[7px] text-neutral-600 tracking-[.2em]">SERIAL</div><div className="text-[10px] font-mono text-white">{proofData?.serial || 'PENDING'}</div></div>
              </div>
            </div>
          </div>
        </div>

        <style>{`@keyframes sweep{0%,20%{transform:translateX(-130%)}65%,100%{transform:translateX(130%)}}`}</style>
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
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the work or intellectual property..." rows={3} className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-amber-500 resize-none" />
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
                  <div className="flex justify-between text-[10px] font-mono border-t border-neutral-800 pt-2"><span className="text-neutral-400">Est. Gas Fee</span><span className="text-white">~0.001 tBNB</span></div>
                </div>

                <button type="submit" disabled={!title || isHashing} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl text-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer">
                  <Award className="w-4 h-4" /> Mint & Issue Proof
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-7 bg-[#05030F] border border-neutral-900 p-6 rounded-2xl flex flex-col justify-center items-center relative overflow-hidden">
            <div className="absolute top-4 left-4 flex items-center gap-2 text-cyan-500 font-mono text-[9px] uppercase tracking-widest"><Eye className="w-3 h-3"/> Live NFT Preview</div>
            
            <div className="w-full max-w-[842px] overflow-hidden transform scale-[0.65] sm:scale-75 lg:scale-[0.55] xl:scale-[0.65] origin-center shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-neutral-800">
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
            <a href={`https://testnet.bscscan.com/tx/${generatedProof.txHash}`} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer no-underline shadow-lg">
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
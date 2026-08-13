import React, { useRef } from 'react';
import { X, Download, Image as ImageIcon, CheckCircle2, ShieldCheck, Fingerprint, Lock } from 'lucide-react';
import QRCode from 'react-qr-code';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useLanguage } from '@/context/LanguageContext';

export default function CertificateModal({
  selectedCertificate,
  setSelectedCertificate,
  TARGET_CHAIN_NAME,
  showToast
}) {
  const { t: globalT } = useLanguage();
  const t = globalT.dashboard || {}; 
  
  const certificateRef = useRef(null);

  if (!selectedCertificate) return null;

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) return;
    try {
      showToast(t.certGenPng || "Generating PNG...", "info");
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: '#fdfbf7' });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `AETH-CERT-${selectedCertificate.capsuleId}.png`;
      link.click();
    } catch (error) {
      showToast(t.certPngFail || "PNG generation failed", "error");
    }
  };

  const handleDownloadPDF = async () => {
    if (!certificateRef.current) return;
    try {
      showToast(t.certPreparing || "Preparing PDF...", "info");
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: '#fdfbf7' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
      pdf.save(`AETH-CERT-${selectedCertificate.capsuleId}.pdf`);
      showToast(t.certDownloaded || "PDF Downloaded", "success");
    } catch (error) {
      showToast(t.certFail || "PDF generation failed", "error");
    }
  };

  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  const dateStr = new Date(selectedCertificate.creationTimestamp * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const verifyUrl = `https://testnet.bscscan.com/tx/${selectedCertificate.proofHash}`;

  return (
    <div className="fixed inset-0 bg-[#030208]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
      
      <div className="bg-[#0B0817] border border-neutral-800 max-w-5xl w-full rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col max-h-[95vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-neutral-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">{t.certOfficialLabel || "Official Certificate"}</h3>
              <p className="text-[10px] text-neutral-400 font-mono">{t.certProvenance || "On-Chain Provenance"}</p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedCertificate(null)}
            className="w-10 h-10 bg-neutral-900 hover:bg-red-500/20 text-neutral-400 hover:text-red-400 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-transparent hover:border-red-500/30"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 sm:p-10 overflow-y-auto flex-1 custom-scrollbar bg-[#05030F] flex items-center justify-center">
          <div className="w-full max-w-[842px] overflow-x-auto">
            <div ref={certificateRef} className="w-[842px] h-[595px] bg-[#fdfbf7] text-[#171717] rounded-sm p-10 relative overflow-hidden shadow-2xl font-serif border border-[#d4d4d4] mx-auto flex flex-col justify-between shrink-0 transform origin-top-left sm:origin-center scale-[0.6] sm:scale-100 mb-[-200px] sm:mb-0">
              
              <div className="absolute top-8 right-8 flex items-center gap-2 z-20 bg-[rgba(255,255,255,0.9)] px-3 py-1.5 rounded-full border border-[#bbf7d0] shadow-sm">
                <div className="w-2.5 h-2.5 bg-[#22c55e] rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
                <span className="text-[10px] font-bold text-[#15803d] uppercase tracking-widest">{t.certBadgePolygon || "Verified on Binance"}</span>
              </div>

                            {/* 🚀 FIX WATERMARK: Mengubah nama aset menjadi /watermark.png agar terbaca sempurna di sistem Windows & Produksi */}
              <img src="/watermark.png" alt="Watermark" className="absolute inset-0 w-full h-full object-contain opacity-[0.05] pointer-events-none grayscale p-20" />
              <div className="absolute inset-4 border-[4px] border-double border-[rgba(120,53,15,0.3)] pointer-events-none rounded-sm"></div>
              <div className="absolute inset-6 border-[1px] border-[rgba(120,53,15,0.1)] pointer-events-none rounded-sm"></div>
              
              <div className="relative z-10 text-center mb-4 pt-4 border-b-2 border-[rgba(120,53,15,0.1)] pb-4">
                <h4 className="text-4xl font-black tracking-[0.25em] text-[#78350f] mb-2 font-display drop-shadow-sm">{t.certTitle || "AETHERVAULT"}</h4>
                <p className="text-xs font-bold tracking-[0.3em] text-[#b45309] uppercase">{t.certOfficialCert || "Official Cryptographic Certificate"}</p>
              </div>

              <div className="relative z-10 space-y-6 flex-1 flex flex-col justify-center px-4">
                <div className="text-center mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-[#737373] mb-2">{t.certCertifies || "This certifies the creation of"}</p>
                  <h5 className="text-3xl font-bold text-[#171717] font-display px-8 leading-snug">
                    "{(t.certCryptoVaultPrefix || "Cryptographic Vault #")}{selectedCertificate.capsuleId}"
                  </h5>
                </div>

                <div className="grid grid-cols-3 gap-y-5 gap-x-6 text-xs font-mono bg-[rgba(255,255,255,0.1)] p-6 border border-[rgba(120,53,15,0.2)] rounded-sm shadow-sm backdrop-blur-xs">
                  <div className="col-span-1 border-r border-[rgba(120,53,15,0.1)]">
                    <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">{t.certVaultId || "Vault ID"}</p>
                    <p className="font-bold text-[#171717]">#{selectedCertificate.capsuleId}</p>
                  </div>
                  <div className="col-span-1 border-r border-[rgba(120,53,15,0.1)] pl-2">
                    <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">{t.certCreator || "Creator"}</p>
                    <p className="font-bold text-[#171717] truncate pr-2">{formatAddress(selectedCertificate.owner)}</p>
                  </div>
                  <div className="col-span-1 pl-2">
                    <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">{t.certTimestamp || "Timestamp"}</p>
                    <p className="font-bold text-[#171717]">{dateStr}</p>
                  </div>

                  <div className="col-span-1 border-r border-[rgba(120,53,15,0.1)] pt-2 border-t">
                    <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">{t.certTier || "Tier"}</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#171717]">{selectedCertificate.tier}</span>
                      <span className="text-[8px] bg-[#78350f] text-[#fef3c7] px-1.5 py-0.5 rounded-sm tracking-widest flex items-center gap-1">
                        {selectedCertificate.isLegacy ? (t.certLegacyLabel || 'Legacy') : (t.certTimeLockLabel || 'Time-Lock')}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-1 border-r border-[rgba(120,53,15,0.1)] pl-2 pt-2 border-t">
                    <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">{t.certBlock || "Block Number"}</p>
                    <p className="font-bold text-[#171717] text-[10px]">{selectedCertificate.blockNumber}</p>
                  </div>
                  <div className="col-span-1 pl-2 pt-2 border-t">
                    <p className="text-[8px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1">{t.certSmartContract || "Smart Contract"}</p>
                    <p className="font-bold text-[#171717] text-[10px]">{formatAddress("0x3CD6383169bA310EFDC246acfa48FbAAcE8A572F")}</p>
                  </div>

                  <div className="col-span-3 border-t border-[rgba(120,53,15,0.2)] pt-4 mt-2 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[9px] uppercase tracking-widest text-[rgba(146,64,14,0.7)] mb-1 flex items-center gap-1.5"><Fingerprint className="w-3 h-3"/> {t.certHash || "Proof Hash"}</p>
                        <p className="text-[10px] text-[#404040] font-bold tracking-tight">{selectedCertificate.proofHash}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 mt-6 pt-4 border-t-2 border-[rgba(120,53,15,0.2)] flex flex-row items-end justify-between px-6 pb-2">
                <div className="text-left mb-2">
                  <p className="text-[8px] font-bold text-[#78350f] uppercase tracking-widest leading-relaxed">
                    {t.certRegisteredBy || "Registered By"}<br/>
                    <span className="text-xs font-black mt-0.5 block">AETHVAULT™ REGISTRY</span>
                  </p>
                  <p className="text-[7px] text-[#737373] font-mono mt-1.5 tracking-widest bg-[rgba(120,53,15,0.05)] inline-block px-1.5 py-0.5 rounded">{t.certImmutableBadge || "IMMUTABLE"} • {TARGET_CHAIN_NAME || 'BINANCE'}</p>
                </div>

                <div className="text-center mb-2 px-8 flex flex-col items-center">
                   <div className="font-signature text-3xl text-[rgba(120,53,15,0.8)] -rotate-3 mb-1" style={{ fontFamily: "'Brush Script MT', cursive" }}>AetherVault DAO</div>
                   <div className="w-32 border-b border-[rgba(120,53,15,0.4)] mb-1"></div>
                   <p className="text-[8px] uppercase tracking-widest text-[#737373] font-bold">{t.certSignature || "Signature"}</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-20 h-20 bg-white border border-[#e5e5e5] p-1.5 rounded-sm shadow-sm flex items-center justify-center">
                    <QRCode value={verifyUrl} size={68} bgColor="#ffffff" fgColor="#451a03" level="Q" />
                  </div>
                  <p className="text-[7px] uppercase tracking-widest mt-1.5 text-[#78350f] font-bold">{t.certScan || "Scan to Verify"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-neutral-900 bg-[#0B0817] rounded-b-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={handleDownloadPDF} className="w-full bg-[#05030F] hover:bg-neutral-900 border border-neutral-700 hover:border-amber-500/50 text-white font-bold py-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg group">
            <Download className="w-4 h-4 text-neutral-400 group-hover:text-amber-500 transition-colors" /> {t.certDownloadBtn || "Download PDF"}
          </button>
          <button onClick={handleDownloadPNG} className="w-full bg-[#05030F] hover:bg-neutral-900 border border-neutral-700 hover:border-cyan-500/50 text-white font-bold py-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg group">
            <ImageIcon className="w-4 h-4 text-neutral-400 group-hover:text-cyan-400 transition-colors" /> {t.certExportPng || "Export PNG"}
          </button>
        </div>

      </div>
    </div>
  );
}
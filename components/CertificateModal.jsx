import React, { useRef } from 'react';
import { X, Download, Image as ImageIcon, ShieldCheck, Fingerprint, Lock } from 'lucide-react';
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
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: '#0B0817' });
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
      const canvas = await html2canvas(certificateRef.current, { scale: 3, useCORS: true, backgroundColor: '#0B0817' });
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

  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : 'Not Connected';
  
  const dateStr = new Date((selectedCertificate.creationTimestamp || Date.now() / 1000) * 1000).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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
            {/* 🚀 DESAIN BARU: Menggunakan tema gelap Web3 yang elegan dan selaras dengan Web Terminal */}
            <div ref={certificateRef} className="w-[842px] h-[595px] bg-[#0B0817] text-gray-200 rounded-2xl p-10 relative overflow-hidden shadow-2xl font-sans border border-cyan-500/30 mx-auto flex flex-col justify-between shrink-0 transform origin-top-left sm:origin-center scale-[0.6] sm:scale-100 mb-[-200px] sm:mb-0">
              
              {/* Background Glow & Watermark effect */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-fuchsia-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="absolute top-8 right-8 flex items-center gap-2 z-20 bg-green-950/80 px-3.5 py-1.5 rounded-full border border-green-500/40 shadow-lg">
                <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
                <span className="text-[10px] font-bold text-green-300 uppercase tracking-widest font-mono">Verified on Binance</span>
              </div>

              {/* Header Title */}
              <div className="relative z-10 text-center mb-2 pt-2 border-b border-neutral-800 pb-4">
                <h4 className="text-3xl font-black tracking-[0.2em] text-white font-display mb-1 drop-shadow-md">AETHERVAULT</h4>
                <p className="text-[10px] font-bold tracking-[0.3em] text-cyan-400 uppercase font-mono">Official Cryptographic Vault Certificate</p>
              </div>

              {/* Main Info Body */}
              <div className="relative z-10 space-y-5 flex-1 flex flex-col justify-center px-4">
                <div className="text-center mb-1">
                  <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-mono mb-1">This certifies the secure cryptographic anchoring of</p>
                  <h5 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-violet-300 to-fuchsia-300 font-display">
                    Cryptographic Vault #{selectedCertificate.capsuleId}
                  </h5>
                </div>

                <div className="grid grid-cols-3 gap-4 text-xs font-mono bg-[#05030F] p-5 border border-neutral-800 rounded-xl shadow-inner">
                  <div className="col-span-1 border-r border-neutral-800/80 pr-2">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Vault ID</p>
                    <p className="font-bold text-white text-sm">#{selectedCertificate.capsuleId}</p>
                  </div>
                  <div className="col-span-1 border-r border-neutral-800/80 px-2">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Creator / Owner</p>
                    <p className="font-bold text-cyan-300 truncate">{formatAddress(selectedCertificate.owner)}</p>
                  </div>
                  <div className="col-span-1 pl-2">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Timestamp</p>
                    <p className="font-bold text-neutral-200">{dateStr}</p>
                  </div>

                  <div className="col-span-1 border-r border-neutral-800/80 pr-2 pt-3 border-t border-neutral-800/80">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Security Tier</p>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{selectedCertificate.tier}</span>
                      <span className="text-[9px] bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 px-2 py-0.5 rounded tracking-widest font-bold">
                        {selectedCertificate.isLegacy ? 'Legacy' : 'Time-Lock'}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 pl-2 pt-3 border-t border-neutral-800/80">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1">Smart Contract</p>
                    <p className="font-bold text-neutral-300 text-[11px] truncate">0xCda136B176baE8F92d0Dbc7851C0A1E282469265</p>
                  </div>

                  <div className="col-span-3 border-t border-neutral-800/80 pt-3 mt-1">
                    <p className="text-[9px] uppercase tracking-widest text-neutral-500 mb-1 flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-cyan-400"/> Proof Hash (On-Chain)
                    </p>
                    <p className="text-[10px] text-neutral-400 font-bold tracking-tight break-all font-mono">{selectedCertificate.proofHash}</p>
                  </div>
                </div>
              </div>

              {/* Footer Section */}
              <div className="relative z-10 pt-4 border-t border-neutral-800 flex flex-row items-end justify-between px-2 pb-1">
                <div className="text-left">
                  <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest leading-relaxed font-mono">
                    Registered By<br/>
                    <span className="text-xs font-black text-white mt-0.5 block tracking-wider">AETHERVAULT™ PROTOCOL</span>
                  </p>
                  <span className="text-[8px] text-cyan-400 font-mono mt-1 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 inline-block">IMMUTABLE • {TARGET_CHAIN_NAME || 'BSC Testnet'}</span>
                </div>

                <div className="text-center px-4 flex flex-col items-center">
                   <span className="font-display font-black text-lg text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-fuchsia-400 tracking-wider mb-0.5">Nin Studio</span>
                   <div className="w-36 border-b border-neutral-700 mb-1"></div>
                   <p className="text-[8px] uppercase tracking-widest text-neutral-500 font-mono">Decrypted Protocol Authority</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white p-1 rounded-lg shadow-md flex items-center justify-center">
                    <QRCode value={verifyUrl} size={56} bgColor="#ffffff" fgColor="#05030F" level="Q" />
                  </div>
                  <p className="text-[7px] uppercase tracking-widest mt-1 text-neutral-400 font-mono font-bold">Scan to Verify</p>
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
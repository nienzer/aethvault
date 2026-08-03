import React from 'react';
import { Award, Fingerprint, Database, Globe, CheckCircle2, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { QRCodeCanvas } from 'qrcode.react';

export default function CertificateModal({
  selectedCertificate,
  setSelectedCertificate,
  TARGET_CHAIN_NAME,
  showToast,
  t
}) {
  if (!selectedCertificate) return null;

  const handleDownloadPDF = async () => {
    try {
      showToast(t.certPreparing || "Mempersiapkan Sertifikat PDF...", "info");
      const element = document.getElementById('pdf-certificate-template');
      element.style.display = 'block'; 
      
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#05030F' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`AETHER-PROOF-${String(selectedCertificate.capsuleId).padStart(9, '0')}.pdf`);
      
      element.style.display = 'none'; 
      showToast(t.certDownloaded || "Sertifikat berhasil diunduh!", "success");
    } catch (err) {
      showToast(t.certFail || "Gagal membuat PDF.", "error");
      console.error(err);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-[#05030F]/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
        <div className="bg-[#0B0817] border border-amber-500/30 max-w-md w-full rounded-2xl sm:rounded-3xl p-6 sm:p-8 space-y-6 shadow-[0_0_40px_rgba(245,158,11,0.15)] relative overflow-hidden my-auto">
          {/* Hiasan Latar Modal */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
          
          <div className="text-center space-y-2 border-b border-neutral-800 pb-5">
            <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-3 border border-amber-500/20">
              <Award className="w-6 h-6 text-amber-400" />
            </div>
            <h4 className="text-lg sm:text-xl font-extrabold text-white tracking-widest uppercase font-display">
              {t.certTitle || "Aether Proof™"}
            </h4>
            <p className="text-[10px] sm:text-xs text-amber-500/70">{t.certSub || "Blockchain Certificate"}</p>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/20 p-3 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-green-400 font-bold text-xs tracking-widest uppercase">{t.certVerified || "VERIFIED ON-CHAIN ✓"}</span>
            </div>
            
            <div>
              <p className="text-[9px] text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 mb-1"><Fingerprint className="w-3 h-3"/> {t.certHash || "Proof Hash"}</p>
              <div className="bg-[#05030F] p-3 rounded-xl border border-neutral-800 text-[9px] sm:text-[10px] text-amber-300 font-mono break-all leading-relaxed select-all">
                {selectedCertificate.proofHash}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#05030F] p-3 rounded-xl border border-neutral-800">
                <p className="text-[8px] text-neutral-500 uppercase tracking-widest mb-1">{t.certId || "Certificate ID"}</p>
                <p className="text-[10px] font-bold text-white font-mono">AETH-2026-{String(selectedCertificate.capsuleId).padStart(9, '0')}</p>
              </div>
              <div className="bg-[#05030F] p-3 rounded-xl border border-neutral-800">
                <p className="text-[8px] text-neutral-500 uppercase tracking-widest mb-1">{t.certBlock || "Block Mined"}</p>
                <p className="text-[10px] font-bold text-white font-mono">{selectedCertificate.blockNumber}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button 
              onClick={handleDownloadPDF} 
              className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold py-3.5 rounded-xl text-[10px] sm:text-xs cursor-pointer shadow-[0_0_20px_-3px_rgba(245,158,11,0.4)] flex items-center justify-center gap-2 transition-all"
            >
              <Download className="w-4 h-4" /> {t.certDownloadBtn || "Download PDF Proof"}
            </button>
            <button onClick={() => setSelectedCertificate(null)} className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white font-bold py-3.5 rounded-xl text-[10px] sm:text-xs cursor-pointer transition-colors border border-transparent">
              {t.certClose || "Tutup"}
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* ⭐ HIDDEN TEMPLATE UNTUK EXPORT PDF */}
        {/* ============================================================== */}
        <div id="pdf-certificate-template" className="absolute top-0 left-0 w-[800px] bg-[#05030F] text-white p-16 font-sans hidden" style={{ zIndex: -9999 }}>
          <div className="absolute inset-4 border-[6px] border-amber-900/40 rounded-xl pointer-events-none"></div>
          <div className="absolute inset-6 border-[2px] border-cyan-900/30 rounded-lg pointer-events-none"></div>
          
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <div className="text-[120px] font-black text-center leading-none transform -rotate-45 font-mono">
              AETHERVAULT<br/>VERIFIED
            </div>
          </div>

          <div className="text-center mb-12 relative z-10 border-b border-neutral-800 pb-10">
            <img src="/logo.png" alt="AetherVault" className="w-16 h-16 grayscale mx-auto mb-6 opacity-80" />
            <h1 className="text-5xl font-black tracking-widest text-white mb-4">{t.certTitle || "AETHER PROOF™"}</h1>
            <h2 className="text-xl text-cyan-400 font-mono uppercase tracking-[0.3em]">{t.certSub || "Blockchain Certificate of Existence"}</h2>
          </div>

          <div className="flex justify-between items-start mb-12 relative z-10">
            <div className="space-y-8 w-2/3 pr-8">
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-widest mb-1">{t.certId || "Certificate ID"}</p>
                <p className="text-3xl font-bold font-mono text-white">AETH-2026-{String(selectedCertificate.capsuleId).padStart(9, '0')}</p>
              </div>
              
              <div>
                <p className="text-sm text-neutral-500 uppercase tracking-widest mb-2">{t.certHash || "Cryptographic Proof Hash"}</p>
                <div className="bg-[#0B0817] p-4 rounded-lg border border-neutral-800 text-amber-300 font-mono text-sm break-all">
                  {selectedCertificate.proofHash}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">{t.certCreator || "Creator / Owner"}</p>
                  <p className="text-base font-bold text-white font-mono break-all">{selectedCertificate.owner}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">{t.certNetwork || "Network"}</p>
                  <p className="text-base font-bold text-purple-400 font-mono">{TARGET_CHAIN_NAME}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">{t.certBlock || "Block Mined"}</p>
                  <p className="text-base font-bold text-amber-400 font-mono">{selectedCertificate.blockNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">{t.certTier || "Security Tier"}</p>
                  <p className="text-base font-bold text-white uppercase tracking-wider">{selectedCertificate.tier}</p>
                </div>
              </div>
            </div>

            <div className="w-1/3 flex flex-col items-center justify-start border-l border-neutral-800 pl-8 space-y-6">
              <div className="bg-white p-3 rounded-xl shadow-2xl">
                <QRCodeCanvas value={`https://aethvault.xyz/verify/${selectedCertificate.capsuleId}`} size={160} level={"H"} includeMargin={false} />
              </div>
              <div className="text-center w-full bg-green-500/10 border border-green-500/20 py-3 rounded-lg">
                <p className="text-green-400 font-bold tracking-widest uppercase text-sm">{t.certVerified || "VERIFIED ✓"}</p>
              </div>
              <p className="text-[10px] text-neutral-500 text-center uppercase tracking-widest">{t.certScan || "Scan to Verify On-Chain"}</p>
            </div>
          </div>

          <div className="text-center relative z-10 pt-10 border-t border-neutral-800">
            <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl mx-auto mb-6">
              {t.certFooter || "This certificate confirms that a digital asset was cryptographically sealed on the blockchain."}
            </p>
            <div className="inline-block border border-neutral-700 px-6 py-3 rounded-xl bg-[#0B0817]">
              <p className="text-sm font-bold text-neutral-300">{t.certCertifiedBy || "Certified On-Chain by AetherVault™"}</p>
              <p className="text-[10px] text-neutral-500 mt-1">"Preserving Digital Legacy Forever" • www.aethvault.xyz</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
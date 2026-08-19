import React, { useState } from 'react';
import { UploadCloud, Fingerprint, CheckCircle, Copy, Loader2, Search, ShieldCheck, ShieldAlert, Database, AlertOctagon } from 'lucide-react';
import { ethers } from 'ethers';
import { useLanguage } from '@/context/LanguageContext'; // Import context bahasa Bos

export default function VerifyProof() {
  // Panggil sistem terjemahan
  const { t: globalT } = useLanguage();
  const t = (globalT && globalT.verifyProof) ? globalT.verifyProof : {};

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fileHash, setFileHash] = useState(null);
  const [extractResult, setExtractResult] = useState(null); 

  const [manualHash, setManualHash] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState('idle'); 

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const calculateFileHash = async (fileToHash) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(fileToHash);
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = "0x" + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
          resolve(hashHex);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setIsScanning(true);
    setExtractResult(null);
    setFileHash(null);

    try {
      const generatedHash = await calculateFileHash(selectedFile);
      setFileHash(generatedHash);
      setTimeout(() => {
        setExtractResult('success');
        setIsScanning(false);
      }, 800);
    } catch (error) {
      console.error("Gagal menghitung hash:", error);
      setIsScanning(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleVerifyOnChain = async () => {
    if (!manualHash || manualHash.trim() === '') return;
    
    const hashToTest = manualHash.trim();
    if (!/^0x[a-fA-F0-9]{64}$/.test(hashToTest)) {
      setVerifyStatus('invalid_format');
      return;
    }

    setIsVerifying(true);
    setVerifyStatus('idle');

    try {
      const provider = new ethers.JsonRpcProvider("https://bsc-testnet-rpc.publicnode.com");
      const CONTRACT_ADDRESS = "0x8C315f5F2364139436fc126cBAe397718bd0f3BE";
      const minimalABI = ["function usedHashes(bytes32) view returns (bool)"];
      const contract = new ethers.Contract(CONTRACT_ADDRESS, minimalABI, provider);

      const isRegistered = await contract.usedHashes(hashToTest);

      if (isRegistered) {
        setVerifyStatus('valid');
      } else {
        setVerifyStatus('invalid');
      }
    } catch (error) {
      console.error("Error verifikasi on-chain:", error);
      setVerifyStatus('error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* --- BOX 1: HASH EXTRACTOR --- */}
      <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="border-b border-neutral-900 pb-4 mb-6">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
            <Fingerprint className="w-6 h-6 text-cyan-400" /> {t.title || "Digital Forensics"}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-2">
            {t.desc || "Ekstrak sidik jari digital (Hash SHA-256) dari file apa pun. File diproses secara offline di peramban Anda."}
          </p>
        </div>

        <div 
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all ${
            dragActive ? 'border-cyan-500 bg-cyan-500/10' : 'border-neutral-800 bg-[#05030F] hover:border-neutral-600'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
          />
          
          {isScanning ? (
            <div className="flex flex-col items-center gap-4 py-4">
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
              <p className="text-cyan-400 font-bold font-mono text-sm uppercase tracking-widest animate-pulse">{t.extracting || "Mengekstrak Hash..."}</p>
            </div>
          ) : extractResult === 'success' ? (
            <div className="flex flex-col items-center gap-4 text-green-400 w-full">
              <CheckCircle className="w-12 h-12 shadow-[0_0_30px_rgba(74,222,128,0.3)] rounded-full" />
              <div className="w-full text-center">
                <p className="font-bold text-base uppercase">{t.readSuccess || "Berhasil Membaca File!"}</p>
                <p className="text-xs text-green-500/70 font-mono mt-1">{file?.name} ({(file?.size / (1024 * 1024)).toFixed(2)} MB)</p>
                
                <div className="mt-4 p-4 bg-[#0B0817] border border-green-500/30 rounded-xl max-w-full overflow-hidden shadow-inner">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-2 font-bold">{t.fingerprintLabel || "Sidik Jari Digital (SHA-256 Hash):"}</p>
                  <div className="flex items-center justify-between bg-[#05030F] border border-neutral-800 p-2 sm:p-3 rounded-lg gap-2">
                    <p className="text-xs sm:text-sm text-cyan-300 font-mono truncate selection:bg-cyan-900 w-full text-left">
                      {fileHash}
                    </p>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(fileHash);
                        setManualHash(fileHash);
                      }}
                      className="p-2 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 rounded-md text-neutral-300 hover:text-cyan-400 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5"
                      title={t.copyBtn || "COPY"}
                    >
                      <Copy className="w-4 h-4" /> <span className="text-[10px] hidden sm:block font-bold">{t.copyBtn || "COPY"}</span>
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-green-500/70 mt-3">{t.copyInstruction || "Silakan salin Hash di atas dan tempel pada kolom verifikasi di bawah."}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-400 pointer-events-none py-6">
              <UploadCloud className="w-12 h-12 text-neutral-600" />
              <div>
                <p className="font-bold text-white text-sm sm:text-base">{t.dragDropTitle || "Seret & Lepas File ke Sini"}</p>
                <p className="text-xs mt-1">{t.dragDropSub || "atau klik untuk memilih file dari perangkat Anda"}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- BOX 2: ON-CHAIN VALIDATOR --- */}
      <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-violet-500/30">
            <Database className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white">{t.validatorTitle || "On-Chain Validator"}</h3>
            <p className="text-[11px] sm:text-xs text-neutral-400">{t.validatorDesc || "Cocokkan Hash dengan database Smart Contract AetherVault."}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
            <input 
              type="text" 
              placeholder={t.placeholder || "Tempel Hash (0x...) di sini untuk cek keaslian..."}
              value={manualHash}
              onChange={(e) => {
                setManualHash(e.target.value);
                setVerifyStatus('idle');
              }}
              className="w-full bg-[#05030F] border border-neutral-800 focus:border-violet-500 text-cyan-300 text-xs sm:text-sm font-mono pl-12 pr-4 py-4 rounded-xl outline-none transition-colors shadow-inner"
            />
          </div>
          
          <button 
            onClick={handleVerifyOnChain}
            disabled={isVerifying || !manualHash}
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:grayscale text-white font-bold py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          >
            {isVerifying ? (
              <><Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" /> {t.verifyingBtn || "Menghubungi Blockchain..."}</>
            ) : (
              <><ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" /> {t.verifyBtn || "Verifikasi Hash Sekarang"}</>
            )}
          </button>
        </div>

        {/* HASIL VALIDASI */}
        {verifyStatus !== 'idle' && (
          <div className="mt-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
            {verifyStatus === 'valid' && (
              <div className="bg-green-500/10 border border-green-500/40 p-5 rounded-2xl flex items-start gap-4">
                <ShieldCheck className="w-8 h-8 text-green-400 shrink-0 mt-0.5 shadow-[0_0_15px_rgba(74,222,128,0.4)] rounded-full bg-green-500/20" />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-green-400 uppercase tracking-wide">{t.validTitle || "Hash Terverifikasi Asli!"}</h4>
                  <p className="text-[11px] sm:text-xs text-green-500/80 mt-1 leading-relaxed">
                    {t.validDesc || "Sidik jari digital ini terdaftar secara sah di dalam Smart Contract AetherVault. File yang Anda miliki adalah 100% otentik dan belum pernah dimodifikasi."}
                  </p>
                </div>
              </div>
            )}

            {verifyStatus === 'invalid' && (
              <div className="bg-red-500/10 border border-red-500/40 p-5 rounded-2xl flex items-start gap-4">
                <ShieldAlert className="w-8 h-8 text-red-400 shrink-0 mt-0.5 shadow-[0_0_15px_rgba(248,113,113,0.4)] rounded-full bg-red-500/20" />
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-red-400 uppercase tracking-wide">{t.invalidTitle || "Palsu / Tidak Terdaftar!"}</h4>
                  <p className="text-[11px] sm:text-xs text-red-400/80 mt-1 leading-relaxed">
                    {t.invalidDesc || "Hash ini tidak ditemukan di database Blockchain. Kemungkinan file ini belum didaftarkan, atau file tersebut telah mengalami modifikasi/edit dari versi aslinya."}
                  </p>
                </div>
              </div>
            )}

            {verifyStatus === 'invalid_format' && (
              <div className="bg-amber-500/10 border border-amber-500/40 p-4 rounded-xl flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0" />
                <p className="text-[11px] sm:text-xs text-amber-400/90 font-medium">
                  {t.invalidFormat || "Format Hash tidak valid! Hash harus diawali dengan '0x' dan memiliki panjang 66 karakter."}
                </p>
              </div>
            )}

            {verifyStatus === 'error' && (
              <div className="bg-neutral-800/50 border border-neutral-700 p-4 rounded-xl flex items-center gap-3">
                <AlertOctagon className="w-5 h-5 text-neutral-400 shrink-0" />
                <p className="text-[11px] sm:text-xs text-neutral-400 font-medium">
                  {t.rpcError || "Gagal menghubungi RPC Node BSC Testnet. Silakan coba beberapa saat lagi."}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
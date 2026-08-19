import React, { useState } from 'react';
import { UploadCloud, Fingerprint, CheckCircle, XCircle, Loader2, Copy } from 'lucide-react';

export default function VerifyProof() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fileHash, setFileHash] = useState(null);
  // Untuk saat ini kita set 'valid' terus sebagai contoh, 
  // nanti Bos bisa sambungkan ini ke query smart contract Aethvault
  const [result, setResult] = useState(null); 

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // --- FUNGSI MENGHITUNG HASH (SHA-256) DARI FILE FISIK ---
  const calculateFileHash = async (fileToHash) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      // Membaca file sebagai ArrayBuffer
      reader.readAsArrayBuffer(fileToHash);
      
      reader.onload = async (e) => {
        try {
          const buffer = e.target.result;
          // Menggunakan Web Crypto API bawaan browser (sangat cepat & aman)
          const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
          
          // Mengubah hasil buffer menjadi string Hexadecimal (mirip hash di blockchain)
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
    setResult(null);
    setFileHash(null);

    try {
      // 1. Hitung Hash Asli dari file yang dimasukkan
      const generatedHash = await calculateFileHash(selectedFile);
      setFileHash(generatedHash);

      // 2. Di sini nanti Bos bisa memanggil fungsi Smart Contract
      // Contoh: const isExist = await contract.isHashRegistered(generatedHash);
      
      // Untuk simulasi saat ini, kita anggap semua hash yang digenerate adalah 'valid'
      // agar Bos bisa melihat bentuk hash-nya di layar.
      setTimeout(() => {
        setResult('valid');
        setIsScanning(false);
      }, 1000);

    } catch (error) {
      console.error("Gagal menghitung hash:", error);
      setIsScanning(false);
      setResult('error');
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

  return (
    <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl animate-in fade-in duration-300">
      <div className="border-b border-neutral-900 pb-4">
        <h3 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-3">
          <Fingerprint className="w-6 h-6 text-cyan-400" /> Verify Proof
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400 mt-2">
          Verifikasi keaslian karya secara instan. File Anda diproses di perangkat lokal dan tidak pernah diunggah ke server mana pun.
        </p>
      </div>

      <div 
        className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all ${
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
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            <p className="text-cyan-400 font-bold font-mono text-sm uppercase tracking-widest animate-pulse">Menghitung Hash File...</p>
          </div>
        ) : result === 'valid' ? (
          <div className="flex flex-col items-center gap-4 text-green-400 w-full">
            <CheckCircle className="w-16 h-16 shadow-[0_0_30px_rgba(74,222,128,0.3)] rounded-full" />
            <div className="w-full text-center">
              <p className="font-bold text-lg uppercase">Berhasil Membaca File!</p>
              <p className="text-xs text-green-500/70 font-mono mt-1">{file?.name} ({(file?.size / (1024 * 1024)).toFixed(2)} MB)</p>
              
              {/* Menampilkan Hash Asli */}
              <div className="mt-4 p-4 bg-[#05030F] border border-green-500/30 rounded-xl max-w-full overflow-hidden">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider mb-1 font-bold">Sidik Jari Digital (SHA-256 Hash):</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="text-xs sm:text-sm text-cyan-300 font-mono truncate break-all selection:bg-cyan-900">
                    {fileHash}
                  </p>
                  <button 
                    onClick={() => navigator.clipboard.writeText(fileHash)}
                    className="p-1.5 hover:bg-neutral-800 rounded-md text-neutral-400 hover:text-cyan-400 transition-colors cursor-pointer"
                    title="Copy Hash"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-green-500/70 mt-3">Hash ini siap dicocokkan dengan data sertifikat AetherVault.</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4 text-neutral-400 pointer-events-none">
            <UploadCloud className="w-12 h-12 text-neutral-600" />
            <div>
              <p className="font-bold text-white text-sm sm:text-base">Seret & Lepas File ke Sini</p>
              <p className="text-xs mt-1">atau klik untuk memilih file dari perangkat Anda</p>
            </div>
          </div>
        )}
      </div>
      
      {result && (
        <button 
          onClick={() => { setResult(null); setFile(null); setFileHash(null); }}
          className="w-full py-3 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
        >
          Cek File Lainnya
        </button>
      )}
    </div>
  );
}
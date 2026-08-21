"use client";
import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ethers } from 'ethers';
import { Shield, CheckCircle2, AlertTriangle, Loader2, Award, Database, Clock, Key, Globe, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const CONTRACT_ADDRESS = "0xac884F2670cF85dCAF34e750e52B846D8DE3Cf55";
const READ_ONLY_RPC_URL = "https://bsc-testnet-rpc.publicnode.com";
const TARGET_CHAIN_NAME = "BSC Testnet Testnet";

const AetherVaultABI = [
  { "inputs": [{ "internalType": "uint256", "name": "_capsuleIndex", "type": "uint256" }], "name": "getCertificate", "outputs": [
      { "internalType": "uint256", "name": "capsuleId", "type": "uint256" },
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "enum AetherVault.Tier", "name": "tier", "type": "uint8" },
      { "internalType": "bool", "name": "isLegacy", "type": "bool" },
      { "internalType": "bytes32", "name": "proofHash", "type": "bytes32" },
      { "internalType": "uint256", "name": "creationTimestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "blockNumber", "type": "uint256" }
    ], "stateMutability": "view", "type": "function" }
];

const TIER_LABELS = { 0: 'Basic', 1: 'VIP Vault', 2: 'Eternal', 3: 'Legacy' };

export default function VerifyPage() {
  const params = useParams();
  const { id } = params;
  
  const [certData, setCertData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProof = async () => {
      try {
        const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
        const contract = new ethers.Contract(CONTRACT_ADDRESS, AetherVaultABI, provider);
        const cert = await contract.getCertificate(id);
        
        setCertData({
          serial: `AETH-2026-${String(cert.capsuleId).padStart(9, '0')}`,
          capsuleId: cert.capsuleId.toString(),
          owner: cert.owner,
          tier: TIER_LABELS[Number(cert.tier)],
          proofHash: cert.proofHash,
          creationTimestamp: Number(cert.creationTimestamp),
          blockNumber: Number(cert.blockNumber)
        });
      } catch (err) {
        console.error(err);
        setError("Sertifikat tidak ditemukan atau ID tidak valid di jaringan.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProof();
  }, [id]);

  return (
    <div className="min-h-screen bg-[#05030F] flex flex-col items-center justify-center p-4 sm:p-8 font-sans text-white selection:bg-cyan-500/30">
      {/* Watermark Background */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] overflow-hidden">
        <div className="text-[150px] font-black transform -rotate-45 leading-none text-center whitespace-nowrap">
          AETHERVAULT<br/>VERIFIED
        </div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 opacity-60 hover:opacity-100 transition-opacity">
             <img src="/logo.png" alt="Logo" className="w-6 h-6 grayscale" />
             <span className="font-bold tracking-widest text-xs uppercase">AetherVault Protocol</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">AETHER PROOF™</h1>
          <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Blockchain Certificate of Existence</p>
        </div>

        {loading ? (
          <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-12 text-center shadow-2xl">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mx-auto mb-4" />
            <p className="text-neutral-400 font-mono animate-pulse">Memverifikasi On-Chain Data...</p>
          </div>
        ) : error ? (
          <div className="bg-red-950/20 border border-red-500/30 rounded-3xl p-12 text-center shadow-2xl">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-400 mb-2">VERIFIKASI GAGAL</h2>
            <p className="text-red-300/70">{error}</p>
          </div>
        ) : certData ? (
          <div className="bg-[#0B0817] border border-cyan-900/50 rounded-3xl shadow-[0_0_50px_rgba(6,182,212,0.1)] relative overflow-hidden">
            {/* Green Verified Banner */}
            <div className="bg-green-500/10 border-b border-green-500/20 py-4 flex items-center justify-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
              <span className="text-green-400 font-bold tracking-widest text-lg">VERIFIED ON-CHAIN ✓</span>
            </div>

            <div className="p-8 sm:p-10 space-y-6">
              <div className="text-center pb-6 border-b border-neutral-800">
                <p className="text-neutral-500 text-xs uppercase tracking-widest mb-1">Certificate ID</p>
                <p className="text-2xl font-mono font-bold text-white">{certData.serial}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest flex items-center gap-1.5 mb-1.5"><Key className="w-3 h-3"/> Cryptographic Proof Hash</p>
                  <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-xl text-cyan-300 font-mono text-[10px] sm:text-xs break-all">
                    {certData.proofHash}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-xl">
                    <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Network</p>
                    <p className="text-white font-bold text-xs sm:text-sm flex items-center gap-1.5"><Globe className="w-3 h-3 text-purple-400"/> {TARGET_CHAIN_NAME}</p>
                  </div>
                  <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-xl">
                    <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Block Mined</p>
                    <p className="text-white font-bold font-mono text-xs sm:text-sm flex items-center gap-1.5"><Database className="w-3 h-3 text-amber-400"/> {certData.blockNumber}</p>
                  </div>
                </div>

                <div className="bg-[#05030F] border border-neutral-800 p-4 rounded-xl">
                  <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Creator / Owner Wallet</p>
                  <a href={`https://testnet.bscscan.com.com/address/${certData.owner}`} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 font-mono text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors">
                    {certData.owner} <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="flex justify-between items-center bg-[#05030F] border border-neutral-800 p-4 rounded-xl">
                  <div>
                    <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-1 flex items-center gap-1.5"><Clock className="w-3 h-3"/> Timestamp</p>
                    <p className="text-white font-mono text-xs sm:text-sm font-bold">{new Date(certData.creationTimestamp * 1000).toUTCString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-neutral-500 text-[10px] uppercase tracking-widest mb-1">Security Tier</p>
                    <span className="bg-purple-500/20 border border-purple-500/30 text-purple-300 px-3 py-1 rounded text-xs font-bold uppercase tracking-wider">{certData.tier}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-neutral-800 text-center">
                <p className="text-[10px] text-neutral-500 leading-relaxed mb-4 max-w-md mx-auto">
                  This certificate confirms that a digital asset was cryptographically sealed on the blockchain. The certificate does not disclose the content. Content remains encrypted and accessible only by the rightful owner.
                </p>
                <div className="inline-block px-4 py-2 bg-neutral-900 rounded-lg">
                  <p className="text-xs font-bold text-neutral-400">Certified On-Chain by AetherVault™</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
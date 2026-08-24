"use client";
import React, { useState } from 'react';
import { useWeb3Modal, useWeb3ModalAccount } from '@web3modal/ethers/react';
import { Droplet, Wallet, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

// ENSURE AETH TOKEN ADDRESS IS SET HERE
const AETH_TOKEN_ADDRESS = "0xac884F2670cF85dCAF34e750e52B846D8DE3Cf55"; 

export default function JuryFaucetPage() {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useWeb3ModalAccount();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const handleClaimFaucet = async () => {
    if (!isConnected) return;
    setIsLoading(true);
    setMessage({ text: "Processing 1,000 AETH transfer...", type: "info" });

    try {
      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address, tokenAddress: AETH_TOKEN_ADDRESS }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: `Success! 1,000 AETH has been sent. (Tx: ${data.txHash.slice(0, 8)}...)`, type: "success" });
      } else {
        setMessage({ text: data.error || "Failed to claim faucet.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error occurred.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05030F] flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-[#0B0817] border border-neutral-900 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        
        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-500/30">
          <Droplet className="w-8 h-8 text-amber-400" />
        </div>
        
        <div>
          <h1 className="text-xl font-bold text-white font-display">AETHERVAULT FAUCET</h1>
          <p className="text-sm text-neutral-400 mt-2">Special Testnet Access for Reviewers & Judges</p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-mono flex items-center justify-center gap-2 ${message.type === 'success' ? 'bg-green-950/50 text-green-400 border border-green-900' : message.type === 'error' ? 'bg-red-950/50 text-red-400 border border-red-900' : 'bg-cyan-950/50 text-cyan-400 border border-cyan-900'}`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <Loader2 className="w-4 h-4 animate-spin" />}
            {message.text}
          </div>
        )}

        {!isConnected ? (
          <button onClick={() => open()} className="w-full bg-amber-500 hover:bg-amber-400 text-black py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
            <Wallet className="w-5 h-5" /> Connect Wallet
          </button>
        ) : (
          <div className="space-y-4">
            <div className="bg-[#05030F] border border-neutral-800 p-3 rounded-xl text-xs font-mono text-cyan-400 truncate">
              {address}
            </div>
            <button 
              disabled={isLoading} 
              onClick={handleClaimFaucet} 
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-500/20"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Droplet className="w-5 h-5" />}
              MINT 1,000 AETH
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
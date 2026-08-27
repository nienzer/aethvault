import React, { useState } from 'react';
import { Search, ShieldCheck, Clock, User, Fingerprint, Activity, AlertCircle, Loader2, Wallet, ArrowRightLeft, CheckCircle, XCircle, FileText, Zap, Coins } from 'lucide-react';
import { ethers } from 'ethers';

export default function AetherExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resultType, setResultType] = useState(null); // 'address', 'tx', 'file'
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');

  const RPC_URL = "https://bsc-testnet-rpc.publicnode.com";
  const VAULT_CONTRACT = "0x4D9Ed118fbCc24dB118fD5B33609a51F50C4B135";
  const AETH_TOKEN = "0xac884F2670cF85dCAF34e750e52B846D8DE3Cf55";
  const FORGE_FACTORY_ADDRESS = "0x452ceE9B5f3CBF8E9ac7C9fcEc7AC4101349f09E"; // 🌟 Kontrak Pabrik Forge Bos

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    setError('');
    setSearchResult(null);
    setResultType(null);

    try {
      const provider = new ethers.JsonRpcProvider(RPC_URL);
      let query = searchQuery.trim();
      if (!query.startsWith("0x")) query = "0x" + query;

      // ==========================================
      // 1. DETEKSI ALAMAT DOMPET / KONTRAK
      // ==========================================
      if (ethers.isAddress(query)) {
        const balanceWei = await provider.getBalance(query);
        const bnbBalance = ethers.formatEther(balanceWei);

        // Cek Saldo AETH
        const erc20Abi = [
          "function balanceOf(address) view returns (uint256)",
          "function name() view returns (string)",
          "function symbol() view returns (string)",
          "function totalSupply() view returns (uint256)",
          "function decimals() view returns (uint8)"
        ];
        const tokenContract = new ethers.Contract(AETH_TOKEN, erc20Abi, provider);
        let aethBalance = "0";
        try {
          const aethWei = await tokenContract.balanceOf(query);
          aethBalance = ethers.formatUnits(aethWei, 18);
        } catch (e) {}

        const code = await provider.getCode(query);
        const isContract = code !== "0x";

        let forgeData = null;

        // 🌟 JIKA INI KONTRAK, CEK APAKAH INI TOKEN DARI AETHER FORGE
        if (isContract) {
          try {
            const factoryContract = new ethers.Contract(FORGE_FACTORY_ADDRESS, ["function isVerifiedForgeToken(address) view returns (bool)"], provider);
            const isVerifiedForge = await factoryContract.isVerifiedForgeToken(query);

            if (isVerifiedForge) {
              // Jika Verified, Tarik Identitas Tokennya!
              const childToken = new ethers.Contract(query, erc20Abi, provider);
              const tName = await childToken.name();
              const tSymbol = await childToken.symbol();
              const tDecimals = await childToken.decimals();
              const tSupplyWei = await childToken.totalSupply();
              
              forgeData = {
                name: tName,
                symbol: tSymbol,
                supply: parseFloat(ethers.formatUnits(tSupplyWei, tDecimals)).toLocaleString()
              };
            }
          } catch (e) {
            console.warn("Gagal mengecek status Forge Token", e);
          }
        }

        setSearchResult({
          address: query,
          bnbBalance: parseFloat(bnbBalance).toFixed(4),
          aethBalance: parseFloat(aethBalance).toLocaleString(),
          type: forgeData ? "AetherForge Token" : (isContract ? "Smart Contract" : "Wallet Account"),
          forgeData: forgeData
        });
        setResultType('address');
        return;
      }

      // ==========================================
      // 2. DETEKSI TX HASH / FILE HASH
      // ==========================================
      if (query.length === 66) {
        // A. Coba cari sebagai Transaksi Jaringan (Tx Hash)
        try {
          const tx = await provider.getTransaction(query);
          const receipt = await provider.getTransactionReceipt(query);

          if (tx && receipt) {
            const block = await provider.getBlock(receipt.blockNumber);
            setSearchResult({
              hash: query,
              status: receipt.status === 1 ? 'Success' : 'Failed',
              block: receipt.blockNumber,
              timestamp: block.timestamp,
              from: receipt.from,
              to: receipt.to || "Contract Creation",
              gasUsed: ethers.formatEther(receipt.gasUsed * receipt.gasPrice)
            });
            setResultType('tx');
            return;
          }
        } catch (e) {
          console.warn("Bukan Transaksi BSC. Mencari di Database AetherVault...");
        }

        // B. Jika bukan Transaksi, coba cari sebagai File Hash AetherVault
        const minimalABI = [
          "function usedHashes(bytes32) view returns (bool)",
          "event ProofMinted(uint256 indexed tokenId, address indexed creator, string category, bool isPublic, bytes32 fileHash, string tokenURI, uint256 blockNumber)"
        ];
        const vaultContract = new ethers.Contract(VAULT_CONTRACT, minimalABI, provider);
        const isRegistered = await vaultContract.usedHashes(query);

        if (isRegistered) {
          const currentBlock = await provider.getBlockNumber();
          const startBlock = Math.max(0, currentBlock - 500000); 
          const events = await vaultContract.queryFilter(vaultContract.filters.ProofMinted(), startBlock, "latest");
          const matchedEvent = events.find(e => e.args && e.args[4] === query);

          if (matchedEvent) {
            const blockData = await provider.getBlock(matchedEvent.blockNumber);
            setSearchResult({
              hash: query,
              owner: matchedEvent.args[1],
              timestamp: blockData.timestamp,
              category: matchedEvent.args[2],
              tokenId: matchedEvent.args[0].toString()
            });
          } else {
            setSearchResult({
              hash: query,
              owner: "Archive Data",
              timestamp: Math.floor(Date.now() / 1000),
              category: "AetherVault Proof",
              tokenId: "Valid"
            });
          }
          setResultType('file');
          return;
        }

        throw new Error("Hash tidak ditemukan! Ini bukan Transaksi BSC yang valid dan bukan File Hash yang terdaftar di AetherVault.");
      }

      throw new Error("Format pencarian tidak dikenali. Masukkan Alamat Dompet, Tx Hash, atau File Hash.");

    } catch (err) {
      setError(err.message || "Gagal melakukan pencarian di blockchain.");
    } finally {
      setIsSearching(false);
    }
  };

  const formatDate = (unix) => {
    return new Date(unix * 1000).toLocaleString("id-ID", {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const formatAddress = (addr) => addr ? `${addr.substring(0, 8)}...${addr.substring(addr.length - 6)}` : '';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 font-sans text-white animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-2 flex items-center justify-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400" /> AETHER<span className="text-white">SCAN</span>
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm tracking-widest uppercase">The Universal Ecosystem Explorer</p>
      </div>

      {/* SEARCH BAR */}
      <form onSubmit={handleSearch} className="relative group mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
        <div className="relative flex flex-col sm:flex-row items-center bg-[#05030F] border border-cyan-900/50 rounded-2xl overflow-hidden shadow-2xl">
          <div className="hidden sm:flex pl-5 pr-2 text-cyan-500">
            <Search className="w-6 h-6" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Address / Txn Hash / File Hash..."
            className="w-full bg-transparent border-none outline-none py-4 px-5 text-white placeholder-white/20 font-mono text-xs sm:text-sm"
          />
          <button 
            type="submit" 
            disabled={isSearching || !searchQuery}
            className="w-full sm:w-auto px-8 py-4 bg-cyan-900/40 hover:bg-cyan-800/60 text-cyan-300 text-sm font-bold tracking-widest transition-colors disabled:opacity-50 border-t sm:border-t-0 sm:border-l border-cyan-900/50 flex items-center justify-center gap-2"
          >
            {isSearching ? <><Loader2 className="w-4 h-4 animate-spin"/> SCANNING</> : 'SEARCH'}
          </button>
        </div>
      </form>

      {/* ERROR */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 shadow-inner">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-mono leading-relaxed">{error}</p>
        </div>
      )}

      {/* RESULT: ADDRESS / TOKEN */}
      {resultType === 'address' && searchResult && (
        <div className={`p-6 rounded-2xl border shadow-xl animate-in slide-in-from-bottom-4 ${searchResult.forgeData ? 'bg-gradient-to-br from-[#0c0f1d] to-[#120a26] border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'bg-[#0B0817] border-neutral-800'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-neutral-900/50 pb-4">
            <div className="flex items-center gap-3">
              {searchResult.forgeData ? <Zap className="w-6 h-6 text-purple-400 fill-purple-400/20" /> : <Wallet className="w-6 h-6 text-cyan-400" />}
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">{searchResult.type}</h3>
            </div>
            
            {/* 🌟 TAMPILAN BADGE JIKA INI ADALAH TOKEN AETHERFORGE */}
            {searchResult.forgeData && (
              <div className="px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] sm:text-xs font-black tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <CheckCircle className="w-4 h-4 text-purple-400" /> VERIFIED BY AETHERFORGE
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="sm:col-span-3 bg-[#05030F] p-4 rounded-xl border border-neutral-900 shadow-inner">
              <p className="text-[10px] text-neutral-500 tracking-widest mb-1 uppercase">Contract / Wallet Address</p>
              <p className="text-sm sm:text-base font-mono text-cyan-300 break-all">{searchResult.address}</p>
            </div>

            {/* 🌟 TAMPILAN METRIK TOKEN FORGE */}
            {searchResult.forgeData ? (
              <>
                <div className="bg-[#05030F] p-4 rounded-xl border border-purple-900/30">
                  <p className="text-[10px] text-purple-400/70 tracking-widest mb-1 uppercase">Token Name</p>
                  <p className="text-lg font-bold text-white">{searchResult.forgeData.name}</p>
                </div>
                <div className="bg-[#05030F] p-4 rounded-xl border border-purple-900/30">
                  <p className="text-[10px] text-purple-400/70 tracking-widest mb-1 uppercase">Ticker Symbol</p>
                  <p className="text-lg font-bold text-purple-300">{searchResult.forgeData.symbol}</p>
                </div>
                <div className="bg-[#05030F] p-4 rounded-xl border border-purple-900/30">
                  <p className="text-[10px] text-purple-400/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><Coins className="w-3 h-3"/> Total Supply</p>
                  <p className="text-lg font-bold text-white">{searchResult.forgeData.supply}</p>
                </div>
              </>
            ) : (
              // TAMPILAN SALDO DOMPET BIASA
              <>
                <div className="bg-[#05030F] p-4 rounded-xl border border-neutral-900">
                  <p className="text-[10px] text-neutral-500 tracking-widest mb-1 uppercase">BNB Balance</p>
                  <p className="text-lg font-bold text-white">{searchResult.bnbBalance} <span className="text-xs text-neutral-500">tBNB</span></p>
                </div>
                <div className="bg-[#05030F] p-4 rounded-xl border border-neutral-900 sm:col-span-2">
                  <p className="text-[10px] text-neutral-500 tracking-widest mb-1 uppercase">AETH Balance</p>
                  <p className="text-lg font-bold text-white">{searchResult.aethBalance} <span className="text-xs text-cyan-500">AETH</span></p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* RESULT: TRANSACTION HASH */}
      {resultType === 'tx' && searchResult && (
        <div className="p-6 rounded-2xl bg-[#0B0817] border border-neutral-800 shadow-xl animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-6 border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-3">
              <ArrowRightLeft className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">Transaction Details</h3>
            </div>
            <div className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 ${searchResult.status === 'Success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
              {searchResult.status === 'Success' ? <CheckCircle className="w-3 h-3"/> : <XCircle className="w-3 h-3"/>} {searchResult.status}
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-3 border-b border-neutral-900/50">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider font-bold">Txn Hash</div>
              <div className="sm:col-span-3 text-xs sm:text-sm font-mono text-cyan-300 break-all">{searchResult.hash}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-3 border-b border-neutral-900/50">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider font-bold">Block / Time</div>
              <div className="sm:col-span-3 text-xs sm:text-sm text-white"><span className="text-blue-400 font-mono">#{searchResult.block}</span> • {formatDate(searchResult.timestamp)}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-3 border-b border-neutral-900/50">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider font-bold">From</div>
              <div className="sm:col-span-3 text-xs sm:text-sm font-mono text-white break-all">{searchResult.from}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-3 border-b border-neutral-900/50">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider font-bold">To</div>
              <div className="sm:col-span-3 text-xs sm:text-sm font-mono text-white break-all">{searchResult.to}</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 py-3">
              <div className="text-[11px] text-neutral-500 uppercase tracking-wider font-bold">Txn Fee</div>
              <div className="sm:col-span-3 text-xs sm:text-sm font-mono text-neutral-300">{searchResult.gasUsed} tBNB</div>
            </div>
          </div>
        </div>
      )}

      {/* RESULT: FILE HASH (AETHERVAULT) */}
      {resultType === 'file' && searchResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c0f1d] to-[#0B0817] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 mb-6 border-b border-cyan-900/50 pb-4">
            <ShieldCheck className="w-6 h-6 text-cyan-400" />
            <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">AetherVault Certificate</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><User className="w-3 h-3"/> Copyright Owner</p>
              <p className="text-sm font-mono text-white break-all">{searchResult.owner}</p>
            </div>
            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><Clock className="w-3 h-3"/> Registration Date</p>
              <p className="text-sm font-bold text-white">{formatDate(searchResult.timestamp)}</p>
            </div>
            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><Activity className="w-3 h-3"/> Asset Category</p>
              <p className="text-sm font-bold text-purple-400 uppercase">{searchResult.category}</p>
            </div>
            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><FileText className="w-3 h-3"/> Cryptographic Hash</p>
              <p className="text-[10px] font-mono text-cyan-300 break-all mt-1">{searchResult.hash}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
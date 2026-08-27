import React, { useState } from 'react';
import { Search, ShieldCheck, Clock, User, Fingerprint, Activity, AlertCircle, Loader2, Wallet, ArrowRightLeft, CheckCircle, XCircle, FileText, Zap, Coins, Award, Copy } from 'lucide-react';
import { ethers } from 'ethers';

export default function AetherExplorer({ handleViewCertificate, externalQuery }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [resultType, setResultType] = useState(null); 
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');

  const RPC_URL = "https://bsc-testnet-rpc.publicnode.com";
  const VAULT_CONTRACT = "0x4D9Ed118fbCc24dB118fD5B33609a51F50C4B135";
  const AETH_TOKEN = "0xac884F2670cF85dCAF34e750e52B846D8DE3Cf55";
  const FORGE_FACTORY_ADDRESS = "0x452ceE9B5f3CBF8E9ac7C9fcEc7AC4101349f09E"; 

  React.useEffect(() => {
    if (externalQuery && externalQuery !== '') {
      setSearchQuery(externalQuery);
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        handleSearch(fakeEvent);
      }, 100);
    }
  }, [externalQuery]);

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

      if (ethers.isAddress(query)) {
        const balanceWei = await provider.getBalance(query);
        const bnbBalance = ethers.formatEther(balanceWei);

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

        if (isContract) {
          try {
            const factoryContract = new ethers.Contract(FORGE_FACTORY_ADDRESS, ["function isVerifiedForgeToken(address) view returns (bool)"], provider);
            const isVerifiedForge = await factoryContract.isVerifiedForgeToken(query);

            if (isVerifiedForge) {
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
          } catch (e) {}
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

      if (query.length === 66) {
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
        } catch (e) {}

        const minimalABI = [
          "function usedHashes(bytes32) view returns (bool)",
          "function tokenURI(uint256) view returns (string)", // 🌟 TAMBAHAN: FUNGSI TOKEN URI
          "event ProofMinted(uint256 indexed tokenId, address indexed creator, string category, bool isPublic, bytes32 fileHash, string tokenURI, uint256 blockNumber)"
        ];
        const vaultContract = new ethers.Contract(VAULT_CONTRACT, minimalABI, provider);
        const isRegistered = await vaultContract.usedHashes(query);

        if (isRegistered) {
          let ownerWallet = "0x... (On-Chain Secured)";
          let timestamp = Math.floor(Date.now() / 1000);
          let category = "Aether Proof Copyright";
          let tokenId = "1";
          let creatorName = "";

          try {
            const currentBlock = await provider.getBlockNumber();
            const startBlock = Math.max(0, currentBlock - 49000); 
            const events = await vaultContract.queryFilter(vaultContract.filters.ProofMinted(), startBlock, "latest");
            const matchedEvent = events.find(e => e.args && e.args[4] === query);

            if (matchedEvent) {
              tokenId = matchedEvent.args[0].toString();
              ownerWallet = matchedEvent.args[1];
              category = matchedEvent.args[2] || "Aether Proof";
              const blockData = await provider.getBlock(matchedEvent.blockNumber);
              timestamp = blockData.timestamp;

              // 🌟 LOGIKA BONGKAR METADATA IDENTIK DENGAN HALL OF PROOF 🌟
              try {
                const tokenUriRaw = await vaultContract.tokenURI(tokenId);
                if (tokenUriRaw && typeof tokenUriRaw === 'string' && tokenUriRaw.includes('base64,')) {
                  const base64Payload = tokenUriRaw.split('base64,')[1];
                  let jsonString = "";
                  try {
                    jsonString = decodeURIComponent(escape(window.atob(base64Payload)));
                  } catch (e1) {
                    jsonString = window.atob(base64Payload);
                  }
                  
                  const metadata = JSON.parse(jsonString);
                  if (metadata.attributes) {
                    const creatorAttr = metadata.attributes.find(a => a.trait_type === "Creator");
                    if (creatorAttr && creatorAttr.value && creatorAttr.value.trim() !== "") {
                      creatorName = creatorAttr.value;
                    }
                  }
                }
              } catch (err) {
                console.warn("Gagal parse tokenURI:", err);
              }
            }
          } catch (e) {}

          setSearchResult({
            hash: query,
            owner: ownerWallet,
            creator: creatorName || "Verified Creator", 
            timestamp: timestamp,
            category: category,
            tokenId: tokenId
          });
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

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 font-sans text-white animate-in fade-in duration-300">
      
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 mb-2 flex items-center justify-center gap-3">
          <Activity className="w-8 h-8 text-cyan-400" /> AETHER<span className="text-white">SCAN</span>
        </h2>
        <p className="text-neutral-400 font-mono text-xs sm:text-sm tracking-widest uppercase">The Universal Ecosystem Explorer</p>
      </div>

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

      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mb-6 shadow-inner">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm font-mono leading-relaxed">{error}</p>
        </div>
      )}

      {resultType === 'address' && searchResult && (
        <div className={`p-6 rounded-2xl border shadow-xl animate-in slide-in-from-bottom-4 ${searchResult.forgeData ? 'bg-gradient-to-br from-[#0c0f1d] to-[#120a26] border-purple-500/40 shadow-[0_0_30px_rgba(168,85,247,0.15)]' : 'bg-[#0B0817] border-neutral-800'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-neutral-900/50 pb-4">
            <div className="flex items-center gap-3">
              {searchResult.forgeData ? <Zap className="w-6 h-6 text-purple-400 fill-purple-400/20" /> : <Wallet className="w-6 h-6 text-cyan-400" />}
              <h3 className="text-lg font-bold text-white uppercase tracking-wider">{searchResult.type}</h3>
            </div>
            
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

      {resultType === 'file' && searchResult && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c0f1d] to-[#0B0817] border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-in slide-in-from-bottom-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-cyan-900/50 pb-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-cyan-400" />
              <h3 className="text-lg font-bold text-cyan-400 uppercase tracking-wider">AetherVault Certificate</h3>
            </div>
            
            {handleViewCertificate && (
              <button 
                onClick={() => handleViewCertificate(searchResult.tokenId)}
                className="px-4 py-2 sm:py-2.5 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/40 rounded-xl text-cyan-300 text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <Award className="w-4 h-4" /> View On-Chain Certificate
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            
            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30 shadow-inner">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><User className="w-3 h-3"/> Creator / Username</p>
              <p className="text-sm font-bold text-white mt-1 truncate" title={searchResult.creator}>{searchResult.creator}</p>
            </div>

            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30 shadow-inner">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><Wallet className="w-3 h-3"/> Owner Wallet</p>
              <div className="flex items-center justify-between text-xs font-mono text-cyan-300 gap-1 mt-1">
                <span className="truncate">{searchResult.owner}</span>
                <button 
                  onClick={() => navigator.clipboard.writeText(searchResult.owner)}
                  className="p-1 hover:bg-cyan-950 rounded text-cyan-300 cursor-pointer shrink-0"
                  title="Copy Wallet"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30 shadow-inner">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><Clock className="w-3 h-3"/> Registration Date</p>
              <p className="text-sm font-bold text-white mt-1">{formatDate(searchResult.timestamp)}</p>
            </div>

            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30 shadow-inner">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><Activity className="w-3 h-3"/> Asset Category</p>
              <p className="text-sm font-bold text-purple-400 uppercase mt-1">{searchResult.category}</p>
            </div>

            <div className="bg-[#05030F] p-4 rounded-xl border border-cyan-900/30 shadow-inner">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><FileText className="w-3 h-3"/> Token ID</p>
              <p className="text-sm font-mono font-bold text-amber-300 mt-1">#{searchResult.tokenId}</p>
            </div>

            <div className="bg-[#05030F] sm:col-span-2 lg:col-span-3 p-4 rounded-xl border border-cyan-900/30 shadow-inner">
              <p className="text-[10px] text-cyan-500/70 tracking-widest mb-1 uppercase flex items-center gap-1.5"><Fingerprint className="w-3 h-3"/> Cryptographic File Hash</p>
              <p className="text-xs font-mono text-cyan-300 break-all mt-1">{searchResult.hash}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
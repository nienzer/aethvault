"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Scale, Vote, PlusCircle, CheckCircle2, XCircle, Clock, AlertCircle, Loader2, Send } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const GOVERNOR_FULL_ABI = [
  "event ProposalCreated(uint256 proposalId, address proposer, address[] targets, uint256[] values, string[] signatures, bytes[] calldatas, uint256 voteStart, uint256 voteEnd, string description)",
  "function propose(address[] targets, uint256[] values, bytes[] calldata, string description) public returns (uint256)",
  "function castVote(uint256 proposalId, uint8 support) public returns (uint256)",
  "function proposalThreshold() view returns (uint256)",
  "function state(uint256 proposalId) view returns (uint8)",
  "function proposalVotes(uint256 proposalId) view returns (uint256 againstVotes, uint256 forVotes, uint256 abstainVotes)"
];

const PROPOSAL_STATES = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
const STATE_COLORS = {
  Active: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  Succeeded: 'bg-green-500/10 text-green-400 border-green-500/30',
  Defeated: 'bg-red-500/10 text-red-400 border-red-500/30',
  Executed: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  Pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

export default function GovernancePanel({
  veAethBalance,
  votingPower,
  veAethInput,
  setVeAethInput,
  isVeAethLoading,
  handleVeAethDeposit,
  handleVeAethWithdraw,
  handleDelegate,
  proposalTarget,
  setProposalTarget,
  proposalDescription,
  setProposalDescription,
  isProposing,
  handleCreateProposal,
  walletProvider,
  address,
  isWrongNetwork,
  TARGET_CHAIN_NAME,
  showToast,
  extractErrorMessage,
  ensureCorrectNetwork,
  GOVERNOR_ADDRESS,
  READ_ONLY_RPC_URL
}) {
  const { t: globalT } = useLanguage();
  // Kamus utama untuk UI di tab DAO
  const t = (globalT && globalT.dao) ? globalT.dao : {};
  // Kamus dashboard untuk notifikasi/Toast (karena kuncinya ditaruh di sana)
  const tDash = (globalT && globalT.dashboard) ? globalT.dashboard : {};

  const [proposals, setProposals] = useState([]);
  const [isLoadingProposals, setIsLoadingProposals] = useState(false);
  const [votingProposalId, setVotingProposalId] = useState(null);

  const fetchProposals = useCallback(async () => {
    if (!GOVERNOR_ADDRESS || GOVERNOR_ADDRESS.startsWith("0x000")) return;
    setIsLoadingProposals(true);
    try {
      const provider = new ethers.JsonRpcProvider(READ_ONLY_RPC_URL);
      const governorContract = new ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_FULL_ABI, provider);

      const currentBlock = await provider.getBlockNumber();
      const DEPLOY_BLOCK = Math.max(0, currentBlock - 20000);

      const filter = governorContract.filters.ProposalCreated();
      const logs = await governorContract.queryFilter(filter, DEPLOY_BLOCK, "latest");

      const parsedProposals = await Promise.all(logs.map(async (log) => {
        try {
          const parsedLog = governorContract.interface.parseLog({
            topics: log.topics,
            data: log.data
          });
          const proposalId = parsedLog.args.proposalId.toString();
          const description = parsedLog.args.description;
          const proposer = parsedLog.args.proposer;

          const stateCode = await governorContract.state(proposalId);
          const stateName = PROPOSAL_STATES[Number(stateCode)] || 'Unknown';

          const votes = await governorContract.proposalVotes(proposalId);
          const against = parseFloat(ethers.formatUnits(votes.againstVotes, 18));
          const forVotes = parseFloat(ethers.formatUnits(votes.forVotes, 18));
          const abstain = parseFloat(ethers.formatUnits(votes.abstainVotes, 18));

          return {
            id: proposalId,
            description,
            proposer,
            state: stateName,
            against,
            forVotes,
            abstain,
            blockNumber: log.blockNumber
          };
        } catch (err) {
          return null;
        }
      }));

      const validProposals = parsedProposals.filter(Boolean);
      validProposals.sort((a, b) => Number(b.id) - Number(a.id));
      setProposals(validProposals);
    } catch (err) {
      console.error("Gagal memuat proposal:", err);
    } finally {
      setIsLoadingProposals(false);
    }
  }, [GOVERNOR_ADDRESS, READ_ONLY_RPC_URL]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  const handleDirectVote = async (proposalId, supportValue) => {
    if (!walletProvider) return showToast(tDash.connectWalletFirst || "Hubungkan dompet terlebih dahulu", "error");
    if (isWrongNetwork) return showToast(tDash.switchNetworkFirst?.replace('{chain}', TARGET_CHAIN_NAME) || `Pindah ke jaringan ${TARGET_CHAIN_NAME}`, "error");

    setVotingProposalId(proposalId);
    try {
      const provider = new ethers.BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      await ensureCorrectNetwork(signer);

      const governorContract = new ethers.Contract(GOVERNOR_ADDRESS, GOVERNOR_FULL_ABI, signer);
      const voteTypeStr = supportValue === 1 ? 'FOR' : supportValue === 0 ? 'AGAINST' : 'ABSTAIN';
      
      showToast(`${tDash.daoTxVoting || "Memberikan suara"} (${voteTypeStr})...`, "info");
      const tx = await governorContract.castVote(proposalId, supportValue);
      await tx.wait();

      showToast(tDash.daoTxVoteSuccess || "Suara Voting Berhasil Dicatat!", "success");
      await fetchProposals();
    } catch (err) {
      showToast((tDash.daoTxVoteFail || "Gagal Voting: ") + extractErrorMessage(err), "error");
    } finally {
      setVotingProposalId(null);
    }
  };

  const formatAddress = (addr) => addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  
  // ⚡ PERBAIKAN: Fungsi pemotong string khusus untuk Proposal ID yang sangat panjang
  const formatId = (idStr) => idStr && idStr.length > 12 ? `${idStr.substring(0, 8)}...${idStr.substring(idStr.length - 6)}` : idStr;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* HEADER INFO */}
      <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="font-display text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Scale className="text-cyan-400 w-5 h-5" /> {t.title || "AetherVault DAO Governance"}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            {t.subtitle || "Manage veAETH voting tickets and shape the protocol's future."}
          </p>
        </div>
        <div className="bg-[#05030F] border border-neutral-800 px-4 py-3 rounded-2xl flex items-center gap-4">
          <div>
            <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{t.vaultLabel || "Your veAETH Vault"}</p>
            <p className="text-xs sm:text-sm font-mono font-bold text-cyan-300">{veAethBalance.toLocaleString()} veAETH</p>
          </div>
          <div className="border-l border-neutral-800 pl-4">
            <p className="text-[9px] text-neutral-500 uppercase tracking-wider">{t.votingPowerLabel || "Voting Power"}</p>
            <p className="text-xs sm:text-sm font-mono font-bold text-fuchsia-400">{votingPower.toLocaleString()} Votes</p>
          </div>
        </div>
      </div>

      {/* LOKET VE-AETH */}
      <div className="bg-[#0B0817] border border-neutral-900 p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl space-y-5">
        <h4 className="text-xs sm:text-sm font-bold text-cyan-400 uppercase font-mono flex items-center gap-2">
          <Vote className="w-4 h-4" /> {t.loketTitle || "1. Voting Ticket Window (Mint / Burn veAETH)"}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input 
            type="text" 
            placeholder={t.placeholderAmount || "AETH amount..."} 
            value={veAethInput}
            onChange={(e) => setVeAethInput(e.target.value)}
            className="bg-[#05030F] border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500 font-mono"
          />
          <button
            disabled={isVeAethLoading}
            onClick={handleVeAethDeposit}
            className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isVeAethLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {t.depositBtn || "Deposit & Lock AETH"}
          </button>
          <button
            disabled={isVeAethLoading}
            onClick={handleVeAethWithdraw}
            className="bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isVeAethLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {t.withdrawBtn || "Withdraw AETH"}
          </button>
        </div>
        <button
          disabled={isVeAethLoading}
          onClick={handleDelegate}
          className="w-full bg-gradient-to-r from-violet-600/20 to-fuchsia-600/20 hover:from-violet-600/30 hover:to-fuchsia-600/30 border border-violet-500/40 text-violet-300 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-inner flex items-center justify-center gap-2"
        >
          {t.delegateBtn || "⚡ Activate Voting Power (Delegate to Self)"}
        </button>
      </div>

      {/* GRID: BUAT PROPOSAL & FEED OTOMATIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        
        {/* KOLOM KIRI: FORM BUAT PROPOSAL */}
        <div className="lg:col-span-1 bg-[#0B0817] border border-neutral-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl h-fit space-y-4">
          <h4 className="text-xs sm:text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-fuchsia-400" /> {t.proposeTitle || "Create Parliament Proposal"}
          </h4>
          <form onSubmit={handleCreateProposal} className="space-y-4">
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1 font-mono uppercase">{t.targetLabel || "Target Contract (Address)"}</label>
              <input 
                type="text" 
                placeholder="0x..." 
                value={proposalTarget}
                onChange={(e) => setProposalTarget(e.target.value)}
                className="w-full bg-[#05030F] border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-fuchsia-500 font-mono"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 block mb-1 font-mono uppercase">{t.descLabel || "Proposal Description"}</label>
              <textarea 
                rows={4}
                placeholder={t.descPlaceholder || "E.g., Proposal to update system parameters..."} 
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                className="w-full bg-[#05030F] border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-fuchsia-500 font-mono resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isProposing}
              className="w-full bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:opacity-90 text-white py-3.5 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProposing && <Loader2 className="w-4 h-4 animate-spin" />}
              <Send className="w-3.5 h-3.5" /> {t.proposeBtn || "Submit New Proposal"}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: DAFTAR PROPOSAL */}
        <div className="lg:col-span-2 bg-[#0B0817] border border-neutral-900 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
            <h4 className="text-xs sm:text-sm font-bold text-white uppercase font-mono flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" /> {t.votingPanelTitle || "Voting Panel"}
            </h4>
            <button 
              onClick={fetchProposals}
              disabled={isLoadingProposals}
              className="text-[10px] text-cyan-400 hover:text-cyan-300 font-mono bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg cursor-pointer flex items-center gap-1"
            >
              {isLoadingProposals ? (tDash.processingBtn || 'Memproses...') : '↻ Refresh'}
            </button>
          </div>

          {isLoadingProposals ? (
            <div className="text-center py-16 text-neutral-500 text-xs font-mono">
              <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-2 animate-spin" />
              {tDash.fetchingRegistry || "Memindai proposal dari blockchain..."}
            </div>
          ) : proposals.length === 0 ? (
            <div className="text-center py-16 text-neutral-500 text-xs font-mono space-y-2">
              <AlertCircle className="w-8 h-8 text-neutral-700 mx-auto" />
              <p>{t.emptyProposals || "Belum ada proposal di parlemen saat ini."}</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {proposals.map((prop) => (
                <div key={prop.id} className="bg-[#05030F] border border-neutral-800 hover:border-neutral-700 p-4 sm:p-5 rounded-2xl space-y-3 transition-all">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      {/* ⚡ PERBAIKAN: Menggunakan formatId dan menambahkan atribut title */}
                      <span 
                        title={`ID Lengkap: ${prop.id}`} 
                        className="bg-neutral-900 text-cyan-300 font-mono text-[10px] px-2.5 py-1 rounded-lg border border-neutral-800 cursor-help"
                      >
                        ID #{formatId(prop.id)}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg border ${STATE_COLORS[prop.state] || 'bg-neutral-800 text-neutral-300 border-neutral-700'}`}>
                        {prop.state}
                      </span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono whitespace-nowrap">
                      {t.byLabel || "Oleh:"} {formatAddress(prop.proposer)}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-white font-medium bg-[#0B0817] p-3 rounded-xl border border-neutral-900 leading-relaxed whitespace-pre-wrap">
                    {prop.description}
                  </p>

                  <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono text-[10px]">
                    <div className="bg-green-950/20 border border-green-500/20 rounded-xl p-2">
                      <p className="text-neutral-500 uppercase">{t.forBtn || "For"}</p>
                      <p className="text-green-400 font-bold text-xs">{prop.forVotes.toLocaleString()}</p>
                    </div>
                    <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-2">
                      <p className="text-neutral-500 uppercase">{t.againstBtn || "Against"}</p>
                      <p className="text-red-400 font-bold text-xs">{prop.against.toLocaleString()}</p>
                    </div>
                    <div className="bg-yellow-950/20 border border-yellow-500/20 rounded-xl p-2">
                      <p className="text-neutral-500 uppercase">{t.abstainBtn || "Abstain"}</p>
                      <p className="text-yellow-400 font-bold text-xs">{prop.abstain.toLocaleString()}</p>
                    </div>
                  </div>

                  {prop.state === 'Active' && (
                    <div className="flex gap-2 pt-2 border-t border-neutral-900">
                      <button
                        disabled={votingProposalId === prop.id}
                        onClick={() => handleDirectVote(prop.id, 1)}
                        className="flex-1 bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {votingProposalId === prop.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                        {t.forBtn || "For"}
                      </button>
                      <button
                        disabled={votingProposalId === prop.id}
                        onClick={() => handleDirectVote(prop.id, 0)}
                        className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {votingProposalId === prop.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                        {t.againstBtn || "Against"}
                      </button>
                      <button
                        disabled={votingProposalId === prop.id}
                        onClick={() => handleDirectVote(prop.id, 2)}
                        className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        {votingProposalId === prop.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
                        {t.abstainBtn || "Abstain"}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
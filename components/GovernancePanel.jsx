"use client";
import React from 'react';
import { Scale, Sparkles, Activity, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

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
  proposalIdInput,
  setProposalIdInput,
  isVoting,
  handleCastVote
}) {
  const { t: globalT } = useLanguage();
  const t = (globalT && globalT.dao) ? globalT.dao : {};

  return (
    <div className="space-y-6">
      {/* Header & Brankas veAETH */}
      <div className="bg-[#0B0817] border border-cyan-500/30 p-6 sm:p-8 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl">
            <Scale className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-white">{t.title || "AetherVault DAO Governance"}</h3>
            <p className="text-xs text-neutral-400 mt-0.5">{t.subtitle || "Kelola tiket suara veAETH dan tentukan masa depan protokol."}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="bg-[#05030F] border border-neutral-800 p-5 rounded-2xl">
            <p className="text-[10px] font-mono text-neutral-400 uppercase">{t.vaultLabel || "Brankas veAETH Anda"}</p>
            <p className="text-2xl font-bold font-mono text-cyan-300 mt-1">{veAethBalance.toLocaleString()} <span className="text-xs font-normal text-neutral-500">veAETH</span></p>
          </div>
          <div className="bg-[#05030F] border border-neutral-800 p-5 rounded-2xl">
            <p className="text-[10px] font-mono text-neutral-400 uppercase">{t.votingPowerLabel || "Kekuatan Suara (Voting Power)"}</p>
            <p className="text-2xl font-bold font-mono text-fuchsia-300 mt-1">{votingPower.toLocaleString()} <span className="text-xs font-normal text-neutral-500">Votes</span></p>
          </div>
        </div>

        {/* Loket Deposit & Withdraw veAETH */}
        <div className="bg-[#05030F] border border-neutral-800 p-5 sm:p-6 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">{t.loketTitle || "1. Loket Tiket Suara (Mint / Burn veAETH)"}</h4>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={t.placeholderAmount || "Nominal AETH..."}
              value={veAethInput}
              onChange={(e) => setVeAethInput(e.target.value)}
              className="flex-1 bg-[#0B0817] border border-neutral-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-cyan-500 font-mono"
            />
            <button
              disabled={isVeAethLoading}
              onClick={handleVeAethDeposit}
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all shadow-lg whitespace-nowrap"
            >
              {isVeAethLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (t.depositBtn || "Deposit & Lock AETH")}
            </button>
            <button
              disabled={isVeAethLoading}
              onClick={handleVeAethWithdraw}
              className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-5 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap border border-neutral-700"
            >
              {t.withdrawBtn || "Withdraw AETH"}
            </button>
          </div>

          {/* Tombol Aktivasi Hak Suara */}
          <button
            disabled={isVeAethLoading}
            onClick={handleDelegate}
            className="w-full mt-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {isVeAethLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (t.delegateBtn || "⚡ Aktifkan Hak Suara (Delegate to Self)")}
          </button>
        </div>
      </div>

      {/* Parlemen DAO: Create Proposal & Voting Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <form onSubmit={handleCreateProposal} className="bg-[#0B0817] border border-neutral-900 p-6 rounded-3xl space-y-4 shadow-xl">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> {t.proposeTitle || "Buat Proposal Parlemen"}
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-[10px] text-neutral-400 font-mono">{t.targetLabel || "Target Kontrak (Address)"}</label>
              <input
                type="text"
                placeholder="0x..."
                value={proposalTarget}
                onChange={(e) => setProposalTarget(e.target.value)}
                className="w-full bg-[#05030F] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 font-mono mt-1"
                required
              />
            </div>
            <div>
              <label className="text-[10px] text-neutral-400 font-mono">{t.descLabel || "Deskripsi Proposal"}</label>
              <textarea
                rows={3}
                placeholder={t.descPlaceholder || "Contoh: Proposal pembaruan parameter sistem..."}
                value={proposalDescription}
                onChange={(e) => setProposalDescription(e.target.value)}
                className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3 text-xs text-white outline-none focus:border-cyan-500 font-mono mt-1 resize-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isProposing}
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white font-bold py-3 rounded-xl text-xs cursor-pointer shadow-lg transition-all"
            >
              {isProposing ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : (t.proposeBtn || "Kirim Proposal Baru")}
            </button>
          </div>
        </form>

        <div className="bg-[#0B0817] border border-neutral-900 p-6 rounded-3xl space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
              <Activity className="w-4 h-4 text-fuchsia-400" /> {t.votingPanelTitle || "Voting Panel"}
            </h4>
            <div>
              <label className="text-[10px] text-neutral-400 font-mono">{t.proposalIdLabel || "ID Proposal"}</label>
              <input
                type="number"
                placeholder={t.proposalIdPlaceholder || "Masukkan Proposal ID..."}
                value={proposalIdInput}
                onChange={(e) => setProposalIdInput(e.target.value)}
                className="w-full bg-[#05030F] border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-fuchsia-500 font-mono mt-1"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-4">
            <button
              disabled={isVoting}
              onClick={() => handleCastVote(0)}
              className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              {t.againstBtn || "Against"}
            </button>
            <button
              disabled={isVoting}
              onClick={() => handleCastVote(1)}
              className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-300 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              {t.forBtn || "For"}
            </button>
            <button
              disabled={isVoting}
              onClick={() => handleCastVote(2)}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all"
            >
              {t.abstainBtn || "Abstain"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
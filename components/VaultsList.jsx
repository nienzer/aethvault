import React from 'react';
import { Lock, Unlock, Clock, AlertTriangle, Shield, Trash2, Award, Activity, Eye, Loader2, KeyRound, Sparkles, Box, FileText } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function VaultsList({
  isLoadingCapsules, myCapsules, setActiveTab,
  handlePingAlive, isPinging, isWrongNetwork,
  handleDeleteOpenedContent, isDeletingContent,
  handleOpenVault, handleViewCertificate, formatUnlockDateTime
}) {
  const { t: globalT } = useLanguage();
  const vaultT = globalT.vaultsUi || {};
  const dashT = globalT.dashboard || {};

  if (isLoadingCapsules) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-12 h-12 text-cyan-500 animate-spin drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]" />
        <p className="text-xs text-cyan-300 font-mono font-bold tracking-widest uppercase">{vaultT.decrypting || "DECRYPTING CAPSULES..."}</p>
      </div>
    );
  }

  if (myCapsules.length === 0) {
    return (
      <div className="py-24 px-4 bg-[#0B0817]/80 backdrop-blur-md border border-neutral-900 rounded-3xl text-center space-y-5 shadow-2xl max-w-2xl mx-auto mt-8">
        <div className="w-20 h-20 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mx-auto text-neutral-500 shadow-inner">
          <Box className="w-8 h-8 opacity-50" />
        </div>
        <div>
          <h3 className="text-2xl font-black text-white font-display mb-2">{vaultT.emptyTitle || "No Capsules Found"}</h3>
          <p className="text-sm text-neutral-400 leading-relaxed max-w-sm mx-auto">
            {vaultT.emptyDesc || "You haven't created any cryptographic vaults yet."}
          </p>
        </div>
        <div className="pt-4">
          <button
            onClick={() => setActiveTab('create')}
            className="bg-white hover:bg-neutral-200 text-black font-bold px-8 py-3.5 rounded-xl text-xs shadow-[0_0_30px_rgba(255,255,255,0.15)] cursor-pointer transition-all hover:scale-105"
          >
            {vaultT.btnCreate || "Create New Capsule"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500 pb-16">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0B0817] border border-neutral-900 p-6 rounded-3xl shadow-xl">
        <div>
          <h3 className="font-display text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
            <Lock className="text-cyan-400 w-5 h-5 sm:w-6 sm:h-6" /> {vaultT.title || "My Vaults"}
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">{vaultT.desc || "Manage your active and legacy cryptographic capsules."}</p>
        </div>
        <div className="bg-[#05030F] border border-neutral-800 px-4 py-2 rounded-xl flex items-center gap-3 shadow-inner">
          <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-bold">{vaultT.totalVaults || "TOTAL VAULTS"}</span>
          <span className="text-lg font-black text-white font-mono">{myCapsules.length}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {myCapsules.map((capsule) => (
          <div key={capsule.id} className="bg-[#0B0817] border border-neutral-800 rounded-3xl p-5 hover:border-cyan-500/40 transition-all duration-300 shadow-lg group hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(6,182,212,0.2)] flex flex-col">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shadow-inner ${
                  capsule.status === (dashT.statusOpened || "OPENED") ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                  capsule.status === (dashT.statusReady || "READY") ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                  capsule.status === (dashT.statusDeleted || "DELETED") ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                }`}>
                  {capsule.status === (dashT.statusOpened || "OPENED") ? <Unlock className="w-5 h-5" /> : 
                   capsule.status === (dashT.statusDeleted || "DELETED") ? <Trash2 className="w-5 h-5" /> : 
                   <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-widest block mb-0.5">ID: #{capsule.id}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${
                    capsule.status === (dashT.statusOpened || "OPENED") ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    capsule.status === (dashT.statusReady || "READY") ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                    capsule.status === (dashT.statusDeleted || "DELETED") ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                  }`}>
                    {capsule.status || 'UNKNOWN'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-neutral-400 bg-neutral-900 px-2 py-1 rounded-md border border-neutral-800 font-bold">
                  {capsule.tierLabel}
                </span>
                {capsule.asHeir && (
                  <span className="block mt-1 text-[9px] font-bold text-purple-400 uppercase tracking-widest">{vaultT.heirAccess || "HEIR ACCESS"}</span>
                )}
              </div>
            </div>

            <div className="mb-5">
              <h4 className="font-bold text-white text-lg flex items-center gap-2 group-hover:text-cyan-300 transition-colors">
                {capsule.titleIsLocked ? <Lock className="w-4 h-4 text-neutral-500" /> : <FileText className="w-4 h-4 text-cyan-500" />}
                <span className="truncate">{capsule.title}</span>
              </h4>
            </div>

            <div className="bg-[#05030F] border border-neutral-800/80 rounded-2xl p-4 space-y-3 mb-5 mt-auto shadow-inner">
              {!capsule.isLegacy ? (
                <div className="flex justify-between items-center text-[10px] sm:text-xs">
                  <span className="text-neutral-500 font-mono uppercase tracking-widest flex items-center gap-1.5"><Clock className="w-3.5 h-3.5"/> {vaultT.unlocks || "UNLOCKS"}</span>
                  <span className="font-mono font-bold text-neutral-300">{formatUnlockDateTime(capsule.unlockTimestamp)}</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] sm:text-xs">
                    <span className="text-neutral-500 font-mono uppercase tracking-widest flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> {vaultT.lastPing || "LAST PING"}</span>
                    <span className="font-mono font-bold text-neutral-300">{formatUnlockDateTime(capsule.lastPingAlive)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] sm:text-xs border-t border-neutral-800/50 pt-2">
                    <span className="text-neutral-500 font-mono uppercase tracking-widest">{vaultT.limit || "INACTIVITY LIMIT"}</span>
                    <span className="font-mono font-bold text-red-400">{capsule.inactivityLimit / (365*24*60*60)} {vaultT.years || "Years"}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              {!capsule.contentDeleted && (
                <button
                  onClick={() => handleOpenVault(capsule)}
                  disabled={!capsule.isReady && !capsule.isClaimedOrRevealed}
                  className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                    capsule.isClaimedOrRevealed 
                      ? 'bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700' 
                      : capsule.isReady 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-[#05030F] text-neutral-600 border border-neutral-800 cursor-not-allowed'
                  }`}
                >
                  {capsule.isClaimedOrRevealed ? <Eye className="w-4 h-4"/> : capsule.isReady ? <KeyRound className="w-4 h-4"/> : <Lock className="w-4 h-4"/>}
                  {capsule.isClaimedOrRevealed ? (dashT.btnViewOpened || "View Content") : capsule.isReady ? (capsule.asHeir ? (dashT.btnClaimLegacy || "Claim Legacy") : (dashT.btnReveal || "Reveal Capsule")) : (dashT.btnLocked || "Locked")}
                </button>
              )}

              {capsule.isLegacy && !capsule.asHeir && !capsule.isClaimedOrRevealed && !capsule.contentDeleted && (
                <button
                  onClick={() => handlePingAlive(capsule)}
                  disabled={isPinging === capsule.id || isWrongNetwork}
                  className="w-full py-3 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  {isPinging === capsule.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  {dashT.btnPingAlive || "Ping Alive"}
                </button>
              )}

              <div className="grid grid-cols-2 gap-2 mt-2">
                <button
                  onClick={() => handleViewCertificate(capsule.id)}
                  className="py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-800 hover:border-neutral-600 font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Award className="w-3 h-3" /> {vaultT.certBtn || "Cert"}
                </button>

                {capsule.isClaimedOrRevealed && !capsule.contentDeleted && !capsule.asHeir && (
                  <button
                    onClick={() => handleDeleteOpenedContent(capsule)}
                    disabled={isDeletingContent === capsule.id || isWrongNetwork}
                    className="py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-xl text-[10px] uppercase tracking-widest flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isDeletingContent === capsule.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    {dashT.deleteBtn || "Delete Content"}
                  </button>
                )}
              </div>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
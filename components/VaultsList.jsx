import React from 'react';
import { Layers, Lock, Clock, Award, Loader2, Activity, X, Eye } from 'lucide-react';

export default function VaultsList({
  t,
  isLoadingCapsules,
  myCapsules,
  setActiveTab,
  handlePingAlive,
  isPinging,
  isWrongNetwork,
  handleDeleteOpenedContent,
  isDeletingContent,
  handleOpenVault,
  handleViewCertificate,
  formatUnlockDateTime
}) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-[#0B0817] border border-neutral-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl">
        <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">{t.vaultsTitle}</h3>
        <p className="text-xs sm:text-sm text-neutral-400">{t.vaultsDesc}</p>
      </div>

      {isLoadingCapsules ? (
        <div className="text-center py-16 sm:py-24 bg-[#0B0817] rounded-2xl sm:rounded-3xl border border-dashed border-neutral-800">
          <Loader2 className="w-8 h-8 text-cyan-500 mx-auto mb-3 animate-spin" />
        </div>
      ) : myCapsules.length === 0 ? (
        <div className="text-center py-16 sm:py-24 bg-[#0B0817] rounded-2xl sm:rounded-3xl border border-dashed border-neutral-800">
          <Layers className="w-10 h-10 sm:w-12 sm:h-12 text-neutral-700 mx-auto mb-3 sm:mb-4" />
          <p className="text-neutral-300 font-bold mb-1 text-sm sm:text-base">{t.noVaultsTitle}</p>
          <button onClick={() => setActiveTab('create')} className="bg-cyan-500 text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-[10px] sm:text-xs font-bold cursor-pointer mt-4 shadow-[0_0_20px_-3px_rgba(6,182,212,0.4)]">
            {t.createNowBtn}
          </button>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {myCapsules.map((cap) => {
            const canPingAlive = cap.isLegacy && !cap.asHeir && !cap.isClaimedOrRevealed;
            const canDeleteContent = cap.isClaimedOrRevealed && !cap.contentDeleted;
            const isOwnUnclaimableLegacy = canPingAlive;
            const canOpen = !cap.contentDeleted && !isOwnUnclaimableLegacy && (cap.isReady || cap.isClaimedOrRevealed);

            return (
            <div key={cap.id} className="bg-[#0B0817] border border-neutral-900 hover:border-cyan-500/30 p-4 sm:p-6 rounded-2xl sm:rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6 shadow-lg transition-colors">
              <div className="space-y-2 w-full md:w-auto">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-[9px] sm:text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase border border-cyan-500/20 font-mono">{cap.tierLabel}{cap.asHeir ? t.asHeirSuffix : ''}</span>
                  <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 sm:px-3 py-1 rounded-md sm:rounded-lg uppercase border border-amber-500/20 font-mono flex items-center gap-1 sm:gap-1.5">
                    <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3" /> {cap.status}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-white truncate">{cap.title}</h4>
                <div className="flex items-center gap-3">
                  <p className="text-[9px] sm:text-[10px] text-neutral-500 font-mono flex items-center gap-1.5">
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                    {cap.isLegacy ? `${t.lastPingLabel} ${formatUnlockDateTime(cap.lastPingAlive)}` : `${t.unlockLabel} ${formatUnlockDateTime(cap.unlockTimestamp)}`}
                  </p>
                  <button 
                    onClick={() => handleViewCertificate(cap.id)} 
                    className="text-[9px] sm:text-[10px] text-amber-500 hover:text-amber-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Award className="w-3 h-3" /> {t.viewProofBtn || "View Proof"}
                  </button>
                </div>
              </div>
              
              <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                {canPingAlive && (
                  <button
                    onClick={() => handlePingAlive(cap)}
                    disabled={isPinging === cap.id || isWrongNetwork}
                    className="w-full md:w-auto bg-transparent hover:bg-green-500/10 disabled:opacity-40 text-green-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-green-500/50 transition-all"
                  >
                    {isPinging === cap.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Activity className="w-3.5 h-3.5" />}
                    {t.btnPingAlive}
                  </button>
                )}
                {canDeleteContent && (
                  <button
                    onClick={() => handleDeleteOpenedContent(cap)}
                    disabled={isDeletingContent === cap.id || isWrongNetwork}
                    className="w-full md:w-auto bg-transparent hover:bg-red-500/10 disabled:opacity-40 text-red-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-red-500/50 transition-all"
                  >
                    {isDeletingContent === cap.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                    {t.btnDeleteContent}
                  </button>
                )}
                <button
                  onClick={() => handleOpenVault(cap)}
                  disabled={!canOpen || isWrongNetwork}
                  className="w-full md:w-auto bg-transparent hover:bg-cyan-500/10 disabled:opacity-40 disabled:cursor-not-allowed text-cyan-400 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-full text-[10px] sm:text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-cyan-500/50 transition-all"
                >
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  {cap.contentDeleted
                    ? t.statusAlreadyDeleted
                    : isOwnUnclaimableLegacy
                      ? (cap.isReady ? t.statusWaitingHeir : t.statusNotReady)
                      : cap.isClaimedOrRevealed
                        ? t.btnViewAgain
                        : (cap.isReady ? t.openVaultBtn : t.statusNotReady)}
                </button>
              </div>
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
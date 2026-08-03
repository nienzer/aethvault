import React from 'react';
import { Sparkles, Lock, Shield, UserX, Flame, UploadCloud, FileImage, X, Loader2, Clock } from 'lucide-react';

export default function CreateCapsule({
  t,
  title, setTitle,
  message, setMessage,
  unlockDate, setUnlockDate,
  tier, setTier,
  tiers,
  inactivityYears, setInactivityYears,
  heirAddress, setHeirAddress,
  isSealing, handleSeal,
  isConnected, isWrongNetwork, TARGET_CHAIN_NAME,
  isPermanentTier,
  uploadedCid, setUploadedCid,
  selectedFile, setSelectedFile,
  isPreparingUpload, stagedUpload, isUploading,
  handleConfirmArweaveUpload, handleCancelStagedUpload, handleFileSelected,
  getMinUnlockDatetimeLocal
}) {
  return (
    <div className="bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl space-y-6 sm:space-y-8">
      <div>
        <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" /> {t.createTitle}
        </h3>
        <p className="text-xs sm:text-sm text-neutral-400">{t.createDesc}</p>
        <p className="text-[10px] sm:text-xs text-cyan-500/80 mt-2 flex items-center gap-1.5">
          <Lock className="w-3 h-3" /> {t.encryptionNotice}
        </p>
      </div>

      <form onSubmit={handleSeal} className="space-y-5 sm:space-y-6">
        <div>
          <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest mb-1.5 sm:mb-2">{t.capsuleTitleLabel}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t.capsuleTitlePlaceholder}
            className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none transition-all font-medium"
            required
          />
        </div>

        <div className="space-y-2 sm:space-y-3">
          <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest">{t.securityTierLabel}</label>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {Object.entries(tiers).map(([key, data]) => (
              <button
                key={key}
                type="button"
                onClick={() => setTier(key)}
                className={`p-3 sm:p-5 rounded-xl sm:rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${tier === key ? `${data.border} bg-neutral-900/90` : 'border-neutral-900 bg-[#05030F] hover:border-neutral-700'}`}
              >
                <div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2 sm:gap-0">
                    <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl ${data.icon} flex items-center justify-center shrink-0`}>
                      {key === 'legacy' ? <UserX className={`w-3 h-3 sm:w-4 sm:h-4 ${data.color}`} /> : <Shield className={`w-3 h-3 sm:w-4 sm:h-4 ${data.color}`} />}
                    </div>
                    <span className="font-mono text-[9px] sm:text-xs font-bold text-white px-2 py-0.5 sm:py-1 bg-[#05030F] rounded-md sm:rounded-lg border border-neutral-800">{data.cost} AETH</span>
                  </div>
                  <div className="font-bold text-xs sm:text-sm mb-1 text-white truncate">{data.name}</div>
                  <p className="text-[9px] sm:text-[11px] text-neutral-400 mb-3 sm:mb-4 leading-relaxed line-clamp-2 sm:line-clamp-none">{data.desc}</p>
                </div>
                <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between border-t border-neutral-800/80 pt-2 sm:pt-3 w-full gap-1.5 xl:gap-0">
                  <span className="text-[8px] sm:text-[10px] text-neutral-500 uppercase tracking-wider font-mono hidden sm:block">{t.autoBurnProtocol}</span>
                  <span className="text-[9px] sm:text-[10px] text-red-400 font-bold flex items-center gap-1 font-mono"><Flame className="w-3 h-3" /> {data.burn} {t.burnLabel}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2 mt-4 sm:mt-6">
          <label className="text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
            <UploadCloud className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            {t.ipfsAttachment}
            {!isPermanentTier && <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 sm:px-2 py-0.5 rounded text-[8px] sm:text-[9px]">{t.locked}</span>}
          </label>
          <div className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all ${isPermanentTier ? 'border-cyan-500/30 hover:border-cyan-500 bg-[#05030F]' : 'border-neutral-800 bg-[#0B0817] opacity-60 cursor-not-allowed'}`}>
            {!isPermanentTier ? (
              <div>
                <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-neutral-600 mx-auto mb-2" />
                <p className="text-[10px] sm:text-xs text-neutral-500">{t.ipfsLockedDesc}</p>
              </div>
            ) : uploadedCid ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-cyan-500/10 border border-cyan-500/30 p-2 sm:p-3 rounded-xl gap-2 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3 w-full">
                  <FileImage className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 shrink-0" />
                  <div className="text-left flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold text-white truncate w-full">{selectedFile?.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-cyan-500 font-mono truncate w-full">{uploadedCid}</p>
                  </div>
                </div>
                <button type="button" onClick={() => {setSelectedFile(null); setUploadedCid('');}} className="text-neutral-500 hover:text-red-400 p-1 sm:p-2 cursor-pointer ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : isPreparingUpload ? (
              <div className="py-3 sm:py-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2 sm:mb-3"></div>
                <p className="text-[10px] sm:text-xs font-bold text-cyan-400 animate-pulse">{t.encryptingAndEstimating}</p>
              </div>
            ) : stagedUpload ? (
              <div className="text-left space-y-3">
                <div className="flex items-center gap-2 sm:gap-3">
                  <FileImage className="w-5 h-5 sm:w-6 sm:h-6 text-purple-300 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] sm:text-xs font-bold text-white truncate">{stagedUpload.file.name}</p>
                    <p className="text-[9px] sm:text-[10px] text-neutral-500">{(stagedUpload.file.size / 1024).toFixed(1)} KB ({t.afterEncryptedLabel})</p>
                  </div>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-xs text-purple-200">
                    {t.estimatedCostLabel} <span className="font-mono font-bold">~{stagedUpload.estimatedCost} POL</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  {isUploading ? (
                    <div className="flex-1 flex items-center justify-center gap-2 py-2.5 text-cyan-400 text-[10px] sm:text-xs font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> {t.uploadingArweave}
                    </div>
                  ) : (
                    <>
                      <button type="button" onClick={handleConfirmArweaveUpload} className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-bold py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs cursor-pointer">
                        {t.confirmPayBtn}
                      </button>
                      <button type="button" onClick={handleCancelStagedUpload} className="px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs cursor-pointer">
                        {t.cancelBtn}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative">
                <input type="file" onChange={handleFileSelected} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf,.zip" />
                <UploadCloud className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-500/50 mx-auto mb-1.5 sm:mb-2" />
                <p className="text-[10px] sm:text-xs text-neutral-400"><span className="text-cyan-400 font-bold">{t.ipfsUploadPrompt}</span></p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5 sm:space-y-2">
          <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest">{t.payloadLabel}</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.payloadPlaceholder}
            className="w-full h-32 sm:h-40 bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-5 text-[11px] sm:text-sm text-white focus:border-cyan-500 outline-none resize-none font-mono transition-all"
            required
          />
          <div className="text-right text-[9px] sm:text-xs text-neutral-500 font-mono">
            {t.charCount} {message.length} / {tiers[tier].maxLength}
          </div>
        </div>

        <div className="pt-2">
          {tier === 'legacy' ? (
            <div className="space-y-4 sm:space-y-5 bg-red-950/10 border border-red-500/20 p-4 sm:p-6 rounded-xl sm:rounded-2xl">
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5 sm:mb-2">{t.deadManLimitLabel}</label>
                <select
                  value={inactivityYears}
                  onChange={(e) => setInactivityYears(e.target.value)}
                  className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-red-500 outline-none cursor-pointer"
                >
                  <option value="5">{t.inactivity5y}</option>
                  <option value="10">{t.inactivity10y}</option>
                  <option value="20">{t.inactivity20y}</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] sm:text-xs font-bold text-red-400 uppercase tracking-widest mb-1.5 sm:mb-2">{t.heirAddressLabel}</label>
                <input
                  type="text"
                  value={heirAddress}
                  onChange={(e) => setHeirAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-xs sm:text-sm text-white focus:border-red-500 outline-none font-mono"
                  required
                />
                <p className="text-[9px] sm:text-[10px] text-neutral-500 mt-1.5">{t.heirNote}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5 sm:space-y-2">
              <label className="block text-[10px] sm:text-xs font-bold text-cyan-500 uppercase tracking-widest">{t.timeLockLabel}</label>
              <div className="relative">
                <Clock className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-500 pointer-events-none" />
                <input
                  type="datetime-local"
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  min={getMinUnlockDatetimeLocal()}
                  className="w-full bg-[#05030F] border border-neutral-800 rounded-xl sm:rounded-2xl pl-10 sm:pl-12 pr-4 sm:pr-5 py-3 sm:py-4 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none font-mono transition-all"
                  style={{ colorScheme: 'dark' }}
                  required
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!isConnected || isSealing || isWrongNetwork}
          className={`w-full font-bold py-3 sm:py-4 rounded-full flex justify-center items-center gap-1.5 sm:gap-2 transition-all text-xs sm:text-sm mt-2 sm:mt-4 ${isConnected && !isSealing && !isWrongNetwork ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white shadow-[0_0_25px_-3px_rgba(168,85,247,0.5),0_0_15px_-3px_rgba(34,211,238,0.4)] cursor-pointer' : 'bg-[#0B0817] text-neutral-600 cursor-not-allowed border border-neutral-800'}`}
        >
          {isSealing ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" /> : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          {isSealing ? t.processingBtn : isWrongNetwork ? t.switchToChainFirstBtn.replace('{chain}', TARGET_CHAIN_NAME) : (isConnected ? t.sealButton : t.connectToSeal)}
        </button>
      </form>
    </div>
  );
}
import React from 'react';
import { Sparkles, Lock, Shield, UserX, Flame, UploadCloud, FileImage, X, Loader2, Clock, Check, Coins } from 'lucide-react';

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
  getMinUnlockDatetimeLocal,
  aethBalance
}) {
  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* ⭐ 1. 4-STEP PROGRESS BAR (GAYA WEB3 TIER-1) */}
      <div className="bg-[#0B0817] border border-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
          {[
            { step: 1, label: t.step1Label || "WALLET", desc: t.step1Desc || "Connect your wallet", active: isConnected },
            { step: 2, label: t.step2Label || "TIER", desc: t.step2Desc || "Choose security tier", active: true },
            { step: 3, label: t.step3Label || "ENCRYPT", desc: t.step3Desc || "Add your content", active: message.length > 0 || title.length > 0 },
            { step: 4, label: t.step4Label || "SEAL", desc: t.step4Desc || "Confirm & seal", active: false }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-[#05030F] p-3 rounded-2xl border border-neutral-800/80">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${item.active ? 'bg-gradient-to-br from-cyan-500 to-violet-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'bg-neutral-900 text-neutral-500 border border-neutral-800'}`}>
                {item.step}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white truncate">{item.label}</p>
                <p className="text-[9px] text-neutral-400 truncate">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        
        {/* KOLOM KIRI: FORM UTAMA */}
        <div className="lg:col-span-8 bg-[#0B0817] border border-neutral-900 rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl space-y-6">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-white mb-1 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" /> {t.createCapsuleTitle || 'Create New Capsule'}
            </h3>
            <p className="text-xs text-neutral-400">{t.createCapsuleDesc || 'Secure your messages or files with military-grade encryption.'}</p>
            <p className="text-[10px] text-cyan-400 mt-2 flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl w-fit font-mono">
              <Lock className="w-3 h-3 shrink-0" /> {t.encryptionNotice || 'Messages are encrypted (ECIES) directly in your browser before being sent to the blockchain.'}
            </p>
          </div>

          <form onSubmit={handleSeal} className="space-y-6">
            
            {/* KAPSUL TITLE */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{t.capsuleTitleLabel || 'Capsule Title'}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.capsuleTitlePlaceholder || "e.g., A message for the future"}
                maxLength={80}
                className="w-full bg-[#05030F] border border-neutral-800 rounded-2xl p-4 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none transition-all font-medium"
                required
              />
            </div>

            {/* SECURITY TIER CARDS */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{t.securityTierLabel || 'Security Tier'}</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(tiers).map(([key, data]) => {
                  const isSelected = tier === key;
                  const isPopular = key === 'premium';
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTier(key)}
                      className={`p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected 
                          ? 'border-cyan-400 bg-gradient-to-b from-neutral-900/90 to-[#05030F] shadow-[0_0_25px_rgba(34,211,238,0.2)] ring-1 ring-cyan-400/50' 
                          : 'border-neutral-900 bg-[#05030F] hover:border-neutral-700'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] font-mono font-bold px-3 py-1 rounded-bl-xl uppercase tracking-widest shadow-md">
                          {t.mostPopularBadge || 'Most Popular'}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-8 h-8 rounded-xl ${data.icon} flex items-center justify-center shrink-0`}>
                            {key === 'legacy' ? <UserX className={`w-4 h-4 ${data.color}`} /> : <Shield className={`w-4 h-4 ${data.color}`} />}
                          </div>
                          <span className="font-mono text-xs font-bold text-white px-3 py-1 bg-[#0B0817] rounded-xl border border-neutral-800">{data.cost} AETH</span>
                        </div>
                        <div className="font-bold text-sm mb-1 text-white flex items-center gap-2">
                          {data.name}
                          {isSelected && <Check className="w-4 h-4 text-cyan-400 ml-auto" />}
                        </div>
                        <p className="text-[11px] text-neutral-400 mb-4 leading-relaxed">{data.desc}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-800/80 pt-3 w-full">
                        <span className="text-[10px] text-red-400 font-bold flex items-center gap-1 font-mono">
                          <Flame className="w-3.5 h-3.5" /> {t.burnLabel || 'Burn'} {data.burn} AETH
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
                            {t.selectedLabel || 'SELECTED'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* FILE ATTACHMENT */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono flex items-center gap-1.5">
                  <UploadCloud className="w-4 h-4" /> {t.fileAttachmentLabel || 'File Attachment'}
                </label>
                <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">{t.optionalLabel || 'Optional'}</span>
              </div>

              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isPermanentTier ? 'border-cyan-500/30 hover:border-cyan-500/60 bg-[#05030F]' : 'border-neutral-800 bg-[#0B0817] opacity-50 cursor-not-allowed'}`}>
                {!isPermanentTier ? (
                  <div>
                    <Lock className="w-7 h-7 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-mono">{t.attachmentLockMsg || 'IPFS/Arweave Attachment available for Eternal & Legacy tiers'}</p>
                  </div>
                ) : uploadedCid ? (
                  <div className="flex items-center justify-between bg-cyan-500/10 border border-cyan-500/30 p-3 rounded-xl">
                    <div className="flex items-center gap-3 truncate">
                      <FileImage className="w-6 h-6 text-cyan-400 shrink-0" />
                      <div className="text-left truncate">
                        <p className="text-xs font-bold text-white truncate">{selectedFile?.name}</p>
                        <p className="text-[10px] text-cyan-500 font-mono truncate">{uploadedCid}</p>
                      </div>
                    </div>
                    <button type="button" onClick={() => {setSelectedFile(null); setUploadedCid('');}} className="text-neutral-500 hover:text-red-400 p-2 cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : isPreparingUpload ? (
                  <div className="py-4">
                    <Loader2 className="w-6 h-6 text-cyan-500 animate-spin mx-auto mb-2" />
                    <p className="text-xs font-bold text-cyan-400">{t.encryptingStorageMsg || 'Encrypting & Estimating Storage...'}</p>
                  </div>
                ) : stagedUpload ? (
                  <div className="text-left space-y-3">
                    <div className="flex items-center gap-3">
                      <FileImage className="w-6 h-6 text-purple-400 shrink-0" />
                      <div className="flex-1 truncate">
                        <p className="text-xs font-bold text-white truncate">{stagedUpload.file.name}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{(stagedUpload.file.size / (1024*1024)).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3">
                      <p className="text-xs text-purple-200 font-mono">
                        {t.estStorageCostLabel || 'Estimated Arweave Cost:'} <span className="font-bold text-white">~{stagedUpload.estimatedCost} POL</span>
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {isUploading ? (
                        <div className="flex-1 flex items-center justify-center gap-2 py-2 text-cyan-400 text-xs font-bold font-mono">
                          <Loader2 className="w-4 h-4 animate-spin" /> {t.uploadingArweaveMsg || 'Uploading to Arweave...'}
                        </div>
                      ) : (
                        <>
                          <button type="button" onClick={handleConfirmArweaveUpload} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-lg">
                            {t.confirmPayBtn || 'Confirm & Pay Storage'}
                          </button>
                          <button type="button" onClick={handleCancelStagedUpload} className="px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer">
                            {t.cancelBtn || 'Cancel'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative cursor-pointer">
                    <input type="file" onChange={handleFileSelected} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf,.zip" />
                    <UploadCloud className="w-8 h-8 text-cyan-400/70 mx-auto mb-2" />
                    <p className="text-xs text-white font-bold mb-1">{t.dropFileHere || 'Drop your file here'} <span className="text-neutral-500 font-normal">{t.orWord || 'or'}</span> <span className="text-cyan-400 underline">{t.browseFiles || 'Browse Files'}</span></p>
                    <p className="text-[10px] text-neutral-500 font-mono">{t.supportedFiles || 'Supported: PNG, JPG, PDF, ZIP • Max size: 10 MB'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* SECRET MESSAGE (ENCRYPTED) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{t.secretMessageLabel || 'Secret Message (Encrypted)'}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={t.secretMessagePlaceholder || "Type the message you want to secure..."}
                className="w-full h-36 bg-[#05030F] border border-neutral-800 rounded-2xl p-4 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none resize-none font-mono transition-all leading-relaxed"
                required
              />
              <div className="text-right text-[11px] text-cyan-400 font-mono font-bold">
                {t.charsLabel || 'Characters'}: {message.length} / {tiers[tier].maxLength}
              </div>
            </div>

            {/* UNLOCK DATE & TIME */}
            <div className="pt-2">
              {tier === 'legacy' ? (
                <div className="space-y-4 bg-red-950/10 border border-red-500/20 p-5 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 font-mono">{t.inactivityLimitLabel || 'Inactivity Limit'}</label>
                    <select
                      value={inactivityYears}
                      onChange={(e) => setInactivityYears(e.target.value)}
                      className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3.5 text-xs text-white focus:border-red-500 outline-none cursor-pointer font-mono"
                    >
                      <option value="5">5 {t.yearsInactivity || 'Years Inactivity'}</option>
                      <option value="10">10 {t.yearsInactivity || 'Years Inactivity'}</option>
                      <option value="20">20 {t.yearsInactivity || 'Years Inactivity'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 font-mono">{t.heirAddressLabel || 'Heir Wallet Address'}</label>
                    <input
                      type="text"
                      value={heirAddress}
                      onChange={(e) => setHeirAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3.5 text-xs text-white focus:border-red-500 outline-none font-mono"
                      required
                    />
                    <p className="text-[10px] text-neutral-500 mt-1.5 font-mono">{t.heirAddressHint || 'The designated heir must register their public key in settings to claim.'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{t.unlockDateTimeLabel || 'Unlock Date & Time'}</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={unlockDate}
                      onChange={(e) => setUnlockDate(e.target.value)}
                      min={getMinUnlockDatetimeLocal()}
                      className="w-full bg-[#05030F] border border-neutral-800 rounded-2xl pl-12 pr-4 py-3.5 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none font-mono transition-all cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            {/* TOMBOL UTAMA */}
            <button
              type="submit"
              disabled={!isConnected || isSealing || isWrongNetwork}
              className={`w-full font-bold py-4 rounded-full flex justify-center items-center gap-2 transition-all text-xs sm:text-sm shadow-xl cursor-pointer ${
                isConnected && !isSealing && !isWrongNetwork 
                  ? 'bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 hover:from-cyan-400 hover:via-violet-400 hover:to-fuchsia-400 text-white shadow-[0_0_25px_rgba(168,85,247,0.4)]' 
                  : 'bg-neutral-900 text-neutral-500 cursor-not-allowed border border-neutral-800'
              }`}
            >
              {isSealing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {isSealing ? (t.btnSealing || "Sealing Capsule on Blockchain...") : isWrongNetwork ? `${t.btnSwitchTo || 'Switch to'} ${TARGET_CHAIN_NAME}` : (isConnected ? (t.btnSealCapsule || "Seal Capsule") : (t.btnConnectToSeal || "Connect Wallet to Seal"))}
            </button>
          </form>
        </div>

        {/* KOLOM KANAN: WIDGET INFORMASI & SALDO ASLI */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* APA ITU AETHERVAULT CAPSULE */}
          <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">{t.whatIsAetherVaultTitle || 'What is AetherVault?'}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {t.whatIsAetherVaultDesc || 'A decentralized cryptographic vault for time-lock messages, dead-man\'s switch legacy transfer, and permanent IP proof-of-ownership.'}
            </p>
            <div className="space-y-3 pt-2 border-t border-neutral-900 text-xs">
              <div className="flex items-center gap-2.5 text-neutral-300">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{t.featureEncryption || 'Client-Side ECIES Encryption'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-neutral-300">
                <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{t.featureBurn || 'Deflationary $AETH Token Burn'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-neutral-300">
                <Shield className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span>{t.featureImmutability || 'Polygon On-Chain Immutability'}</span>
              </div>
            </div>
          </div>

          {/* SALDO ASLI WALLET ($AETH) - SUDAH DIPERBAIKI AGAR TIDAK TERPOTONG */}
          <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 shadow-xl space-y-3">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20 uppercase tracking-widest">{t.yourAethBalance || 'Your $AETH Balance'}</span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-white font-mono">
                {Number(aethBalance).toLocaleString()}
              </span>
              <span className="text-lg font-bold text-cyan-400 font-mono">AETH</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono">{t.securedByPolygon || 'Secured by Polygon'}</p>
          </div>

        </div>

      </div>

    </div>
  );
}
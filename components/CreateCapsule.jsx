import React from 'react';
import { Sparkles, Lock, Shield, UserX, Flame, UploadCloud, FileImage, X, Loader2, Clock, Check, Coins, Fingerprint } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function CreateCapsule({
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
  aethBalance,
  uploadError
}) {
  const { t: globalT } = useLanguage();
  const tDash = globalT.dashboard || {};
  const tTiers = globalT.tiers || {};
  const tLand = globalT.landing || {};

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      
      {/* 4-STEP PROGRESS BAR */}
      <div className="bg-[#0B0817] border border-neutral-900 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 relative">
         {[
            { step: 1, label: "WALLET", desc: "Connect your wallet", active: isConnected },
            { step: 2, label: "TIER", desc: "Choose security tier", active: isConnected && tier !== '' },
            { step: 3, label: "ENCRYPT", desc: "Add your content", active: isConnected && tier !== '' && (title.trim().length > 0 || message.trim().length > 0) },
            { step: 4, label: "SEAL", desc: "Confirm & seal", active: isConnected && tier !== '' && title.trim().length > 0 && message.trim().length > 0 && (tier === 'legacy' ? heirAddress.length > 0 : unlockDate !== '') }
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
              <Sparkles className="w-5 h-5 text-cyan-400" /> {tDash.createTitle || 'Create New Capsule'}
            </h3>
            <p className="text-xs text-neutral-400">{tDash.createDesc || 'Secure your messages or files with military-grade encryption.'}</p>
            <p className="text-[10px] text-cyan-400 mt-2 flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1.5 rounded-xl w-fit font-mono">
              <Lock className="w-3 h-3 shrink-0" /> {tDash.encryptionNotice || 'Messages are encrypted (ECIES) directly in your browser before being sent to the blockchain.'}
            </p>
          </div>

          <form onSubmit={handleSeal} className="space-y-6">
            
            {/* KAPSUL TITLE */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{tDash.capsuleTitleLabel || 'Capsule Title'}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tDash.capsuleTitlePlaceholder || "e.g., A message for the future"}
                maxLength={80}
                className="w-full bg-[#05030F] border border-neutral-800 rounded-2xl p-4 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none transition-all font-medium"
                required
              />
            </div>

            {/* SECURITY TIER CARDS */}
            <div className="space-y-3">
              <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{tDash.securityTierLabel || 'Security Tier'}</label>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {Object.entries(tiers).map(([key, data]) => {
                  const isSelected = tier === key;
                  const isPopular = key === 'premium' || key === 'vip';
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTier(key)}
                      className={`p-3 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected 
                          ? 'border-cyan-400 bg-gradient-to-b from-neutral-900/90 to-[#05030F] shadow-[0_0_15px_rgba(34,211,238,0.2)] ring-1 ring-cyan-400/50' 
                          : 'border-neutral-900 bg-[#05030F] hover:border-neutral-700'
                      }`}
                    >
                      {isPopular && (
                        <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[7px] sm:text-[8px] font-mono font-bold px-2 py-0.5 sm:px-3 sm:py-1 rounded-bl-xl uppercase tracking-widest shadow-md">
                          {tTiers.popular || 'Popular'}
                        </div>
                      )}

                      <div>
                        <div className="flex items-center justify-between mb-2 sm:mb-3">
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl ${data.icon} flex items-center justify-center shrink-0`}>
                            {key === 'legacy' ? <UserX className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${data.color}`} /> : <Shield className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${data.color}`} />}
                          </div>
                          <span className="font-mono text-[9px] sm:text-xs font-bold text-white px-2 py-1 bg-[#0B0817] rounded-xl border border-neutral-800">{data.cost} AETH</span>
                        </div>
                        <div className="font-bold text-[11px] sm:text-sm mb-1 text-white flex items-center gap-1 sm:gap-2">
                          <span className="truncate">{data.name}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 ml-auto shrink-0" />}
                        </div>
                        <p className="text-[9px] sm:text-[11px] text-neutral-400 mb-3 sm:mb-4 leading-snug sm:leading-relaxed line-clamp-2 sm:line-clamp-none">{data.desc}</p>
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-800/80 pt-2.5 sm:pt-3 w-full">
                        <span className="text-[9px] sm:text-[10px] text-red-400 font-bold flex items-center gap-1 font-mono truncate pr-1">
                          <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" /> 
                          <span className="truncate">{tDash.burnLabel || 'Burn'} {data.burn}</span>
                        </span>
                        {isSelected && (
                          <span className="text-[8px] sm:text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 sm:px-2 rounded border border-cyan-500/30 shrink-0">
                            SEL
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
                  <UploadCloud className="w-4 h-4" /> {tDash.ipfsAttachment || 'File Attachment'}
                </label>
                <span className="text-[9px] font-mono text-neutral-500 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">Optional</span>
              </div>

              <div className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${isPermanentTier ? 'border-cyan-500/30 hover:border-cyan-500/60 bg-[#05030F]' : 'border-neutral-800 bg-[#0B0817] opacity-50 cursor-not-allowed pointer-events-none'}`}>
                {!isPermanentTier ? (
                  <div>
                    <Lock className="w-7 h-7 text-neutral-600 mx-auto mb-2" />
                    <p className="text-xs text-neutral-500 font-mono">{tDash.ipfsLockedDesc || 'IPFS/Arweave Attachment available for Eternal & Legacy tiers'}</p>
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
                    <p className="text-xs font-bold text-cyan-400">{tDash.encryptingAndEstimating || 'Encrypting & Estimating Cost...'}</p>
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
                             {tDash.estimatedCostLabel || 'Estimated Storage Cost:'} <span className="font-bold text-white">~{stagedUpload.estimatedCost.toString()} tBNB</span>
                       </p>
                    </div>
                    {uploadError && (
                      <div className="bg-red-500/10 border border-red-500/20 p-2.5 rounded-xl flex items-start gap-2 text-red-400 text-[11px] font-mono shadow-[0_0_10px_rgba(239,68,68,0.1)]">
                        <X className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span><strong>Gagal Upload:</strong> {uploadError}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {isUploading ? (
                        <div className="flex-1 flex items-center justify-center gap-2 py-2 text-cyan-400 text-xs font-bold font-mono">
                          <Loader2 className="w-4 h-4 animate-spin" /> {tDash.uploadingArweave || 'Uploading to network...'}
                        </div>
                      ) : (
                        <>
                          <button type="button" onClick={handleConfirmArweaveUpload} className="flex-1 bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 rounded-xl text-xs cursor-pointer shadow-lg">
                            {tDash.confirmPayBtn || 'Confirm & Pay Storage'}
                          </button>
                          <button type="button" onClick={handleCancelStagedUpload} className="px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold py-2.5 rounded-xl text-xs cursor-pointer">
                            {tDash.cancelBtn || 'Cancel'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="relative cursor-pointer">
                    <input type="file" onChange={handleFileSelected} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,.pdf,.zip" />
                    <UploadCloud className="w-8 h-8 text-cyan-400/70 mx-auto mb-2" />
                    <p className="text-xs text-white font-bold mb-1">{tDash.ipfsUploadPrompt || 'Click or drag file here'}</p>
                    <p className="text-[10px] text-neutral-500 font-mono">Max attachment {tier === 'legacy' ? '10' : '5'}MB (PDF, ZIP, Images)</p>
                  </div>
                )}
              </div>
            </div>

            {/* SECRET MESSAGE (ENCRYPTED) */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{tDash.payloadLabel || 'Secret Message Payload'}</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={tDash.payloadPlaceholder || "Type the message you want to secure..."}
                className="w-full h-36 bg-[#05030F] border border-neutral-800 rounded-2xl p-4 text-xs sm:text-sm text-white focus:border-cyan-500 outline-none resize-none font-mono transition-all leading-relaxed"
                required
              />
              <div className="text-center text-[10px] sm:text-[11px] text-cyan-400 font-mono font-bold flex items-center justify-center gap-1.5 mt-2">
                <Fingerprint className="w-3.5 h-3.5 shrink-0" /> {tDash.payloadHashNotice || 'Payload will be hashed (32-bytes) & encrypted locally'}
              </div>
            </div>

            {/* UNLOCK DATE & TIME */}
            <div className="pt-2">
              {tier === 'legacy' ? (
                <div className="space-y-4 bg-red-950/10 border border-red-500/20 p-5 rounded-2xl">
                  <div>
                    <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 font-mono">{tDash.deadManLimitLabel || 'Inactivity Time Limit'}</label>
                    <select
                      value={inactivityYears}
                      onChange={(e) => setInactivityYears(e.target.value)}
                      className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3.5 text-xs text-white focus:border-red-500 outline-none cursor-pointer font-mono"
                    >
                      <option value="5">{tDash.inactivity5y || '5 Years'}</option>
                      <option value="10">{tDash.inactivity10y || '10 Years'}</option>
                      <option value="20">{tDash.inactivity20y || '20 Years'}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-red-400 uppercase tracking-widest mb-2 font-mono">{tDash.heirAddressLabel || 'Heir Wallet Address'}</label>
                    <input
                      type="text"
                      value={heirAddress}
                      onChange={(e) => setHeirAddress(e.target.value)}
                      placeholder="0x..."
                      className="w-full bg-[#05030F] border border-neutral-800 rounded-xl p-3.5 text-xs text-white focus:border-red-500 outline-none font-mono"
                      required
                    />
                    <p className="text-[10px] text-neutral-500 mt-1.5 font-mono">{tDash.heirNote || 'This message can only be opened by this wallet after the time limit has passed.'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-[10px] font-bold text-cyan-500 uppercase tracking-widest font-mono">{tDash.timeLockLabel || 'Unlock Date & Time'}</label>
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
              {isSealing ? (tDash.processingBtn || "Processing...") : isWrongNetwork ? `Switch to ${TARGET_CHAIN_NAME}` : (isConnected ? (tDash.sealButton || "Seal Capsule Now") : (tDash.connectToSeal || "Connect Wallet to Seal"))}
            </button>

          </form>
        </div>

        {/* KOLOM KANAN: WIDGET INFORMASI & SALDO ASLI */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm uppercase tracking-wider font-mono">{tLand.howItWorks?.title || 'How AetherVault Works'}</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {tLand.pillars?.capsuleDesc || 'Lock a message or file today, and make it cryptographically impossible to open until a specific date years into the future.'}
            </p>
            <div className="space-y-3 pt-2 border-t border-neutral-900 text-xs">
              <div className="flex items-center gap-2.5 text-neutral-300">
                <Lock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>{tLand.metrics?.encryption || 'Military Encryption'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-neutral-300">
                <Flame className="w-3.5 h-3.5 text-red-400 shrink-0" />
                <span>{tTiers.autoBurn || 'Auto-Burn Protocol'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-neutral-300">
                <Shield className="w-3.5 h-3.5 text-green-400 shrink-0" />
                <span>{tLand.metrics?.onchain || 'On-Chain Protocol'}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0B0817] border border-neutral-900 rounded-3xl p-6 shadow-xl space-y-3">
            <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20 uppercase tracking-widest">Your $AETH Balance</span>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-black text-white font-mono">
  {Number(aethBalance || 0).toLocaleString()}
</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">AETH</span>
            </div>
            <p className="text-[10px] text-neutral-500 font-mono">Secured by Binance</p>
          </div>

        </div>

      </div>

    </div>
  );
}
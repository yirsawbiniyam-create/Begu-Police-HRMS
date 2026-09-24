import React, { useState, useRef } from 'react';
import { useHrms } from '../../context/HrmsContext';
import { compressImageForLogo } from '../../services/hrmsFirebase';
import {
  Shield,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Cloud,
  CheckCircle,
  AlertCircle,
  X,
  ExternalLink
} from 'lucide-react';

interface SystemLogoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Curated high quality official police emblems for quick selection
const OFFICIAL_PRESETS = [
  {
    id: 'begu-shield-gold',
    name: 'የቤኒሻንጉል ጉሙዝ ፖሊስ ክላሲክ ጋሻ (Classic Gold Shield)',
    url: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'eth-police-eagle',
    name: 'የክብር ንስርና ፖሊስ ኮከብ (Eagle Crest)',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80'
  },
  {
    id: 'police-badge-silver',
    name: 'የብር ፖሊስ ባጅ ማህተም (Silver Star Badge)',
    url: 'https://images.unsplash.com/photo-1509822929063-6b6cfc9b42f2?w=300&auto=format&fit=crop&q=80'
  }
];

export const SystemLogoModal: React.FC<SystemLogoModalProps> = ({ isOpen, onClose }) => {
  const { systemLogo, updateSystemLogo, resetSystemLogo, isLogoSynced, t, currentUser } = useHrms();
  const [previewUrl, setPreviewUrl] = useState<string | null>(systemLogo);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({
        text: t('እባክዎ ትክክለኛ የምስል ፋይል (PNG, JPG, SVG) ይምረጡ', 'Please select a valid image file (PNG, JPG, SVG)'),
        type: 'error'
      });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      setSelectedFileName(file.name);
      // Compress and convert to base64 Data URL
      const compressedDataUrl = await compressImageForLogo(file, 360, 360, 0.9);
      setPreviewUrl(compressedDataUrl);
      setStatusMessage({
        text: t('ምስሉ ተመርጧል! አሁን «አስቀምጥና ለሁሉም አሰራጭ» የሚለውን ይጫኑ', 'Image loaded! Click "Save & Sync to All" to publish'),
        type: 'success'
      });
    } catch (err: any) {
      console.error('Error processing image:', err);
      setStatusMessage({
        text: t('ምስሉን ማዘጋጀት አልተቻለም', 'Failed to process image'),
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveLogo = async () => {
    if (!previewUrl) return;

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const res = await updateSystemLogo(previewUrl, selectedFileName || 'Official Commission Logo');
      if (res.success) {
        setStatusMessage({
          text: t('ሎጎው በክላውድ ዳታቤዝ ተቀምጧል! ለሁሉም ተጠቃሚዎች ወዲያውኑ ይታያል።', 'Logo saved to Cloud Firestore! All users will now see this logo in real-time.'),
          type: 'success'
        });
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        setStatusMessage({
          text: res.message,
          type: 'error'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: err?.message || 'ስህተት ተከስቷል',
        type: 'error'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = async () => {
    setIsProcessing(true);
    try {
      await resetSystemLogo();
      setPreviewUrl(null);
      setSelectedFileName('');
      setStatusMessage({
        text: t('ሎጎው ወደ ነባሪው የኮሚሽኑ አርማ ተመልሷል', 'Reset to default official emblem'),
        type: 'success'
      });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch {
      // ignore
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {t('የኮሚሽኑ ይፋዊ ሎጎ ማስተካከያ', 'Commission Official Logo & Branding')}
              </h2>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-sky-400" />
                <span>begu-police-hrms · Cloud Firestore Real-time</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Current / Selected Preview */}
          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-slate-900 border-2 border-amber-500/40 p-1 flex items-center justify-center shadow-lg shadow-amber-500/10 overflow-hidden relative group">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Logo Preview"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <Shield className="w-10 h-10 text-amber-400 fill-amber-400/20" />
                )}
              </div>
              <div>
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  {previewUrl ? t('የተመረጠው ሎጎ', 'Selected Logo Preview') : t('ነባሪው ጋሻ አርማ', 'Default Police Emblem')}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {selectedFileName || (previewUrl ? t('በክላውድ ላይ ያለ ሎጎ', 'Active Cloud Logo') : t('ምንም ምስል አልተሰቀለም', 'Using default icon'))}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 mt-1 font-semibold">
                  <Check className="w-3 h-3" />
                  {t('ለሁሉም ተጠቃሚዎች ወዲያውኑ ይሰራጫል', 'Syncs live across all dashboards')}
                </span>
              </div>
            </div>

            {/* Gallery Upload Button */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>{t('ከጋለሪ ሎጎ ምረጥ', 'Upload from Gallery')}</span>
              </button>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2.5">
              {t('ወይም ከኦፊሴላዊ አርማዎች ይምረጡ (Quick Presets)', 'Or Choose from Official Presets')}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {OFFICIAL_PRESETS.map(preset => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => {
                    setPreviewUrl(preset.url);
                    setSelectedFileName(preset.name);
                    setStatusMessage(null);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col items-center gap-2 ${
                    previewUrl === preset.url
                      ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-12 h-12 object-cover rounded-lg border border-slate-700 shadow"
                  />
                  <span className="text-[11px] font-semibold text-center leading-tight line-clamp-2">
                    {preset.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Firebase Real-time Notice */}
          <div className="bg-sky-500/10 border border-sky-500/20 p-3.5 rounded-xl text-xs text-sky-200 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-sky-400">
              <Cloud className="w-4 h-4" />
              <span>{t('የክላውድ ዳታቤዝ ውህደት (Cloud Firestore Synced)', 'Cloud Firestore Synced')}</span>
            </div>
            <p className="text-[11px] text-sky-300/80 leading-relaxed">
              {t(
                'አድሚኑ አዲስ ሎጎ ሲመርጥ በኮሚሽኑ Firebase ክላውድ ዳታቤዝ (begu-police-hrms) ላይ ወዲያውኑ ይቀመጣል። በዚህም የፖሊስ አባላትና ኃላፊዎች ገጻቸውን ማደስ (refresh) ሳያስፈልጋቸው ሎጎው በቅጽበት ይለወጥላቸዋል!',
                'When the Admin updates the logo, it writes to begu-police-hrms Cloud Firestore and pushes in real-time to all online sessions, payslips, and login screens.'
              )}
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-slate-950/80">
          <button
            type="button"
            onClick={handleReset}
            disabled={isProcessing || !systemLogo}
            className="px-3 py-2 rounded-xl text-slate-400 hover:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('ወደ ነባሪ መልስ', 'Reset to Default')}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors"
            >
              {t('ይቅር', 'Cancel')}
            </button>

            <button
              type="button"
              onClick={handleSaveLogo}
              disabled={isProcessing || !previewUrl || previewUrl === systemLogo}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>{t('በማስቀመጥ ላይ...', 'Saving to Cloud...')}</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>{t('አስቀምጥና ለሁሉም አሰራጭ', 'Save & Sync to All')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

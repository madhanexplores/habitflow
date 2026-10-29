import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-2 rounded-lg bg-[#7C5CFC]/20 hover:bg-[#7C5CFC]/30 border border-[#7C5CFC]/40 text-[#F5F7FF] transition font-medium ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-xs'
        }`}
        title="Install HabitFlow app to your desktop or mobile home screen"
      >
        <Download className="w-3.5 h-3.5 text-[#36C5F0]" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[#7C5CFC]/40 transition`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#36C5F0]" />
          <span>Add to iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-[#141B2B] border border-[#7C5CFC]/30 p-6 shadow-2xl text-[#F5F7FF] relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-[#36C5F0]" />
                </div>
                <div>
                  <h3 className="text-base font-semibold">Install HabitFlow on iOS</h3>
                  <p className="text-xs text-[#98A2B8]">Add to your iPhone / iPad home screen</p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-[#98A2B8] bg-[#101522] p-4 rounded-xl border border-slate-800">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#7C5CFC]/30 text-[#F5F7FF] font-mono flex items-center justify-center text-[10px] shrink-0 mt-0.5">1</span>
                  <span>Tap the <strong>Share</strong> icon in the Safari navigation bar at the bottom.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#7C5CFC]/30 text-[#F5F7FF] font-mono flex items-center justify-center text-[10px] shrink-0 mt-0.5">2</span>
                  <span>Scroll down and select <strong>"Add to Home Screen"</strong>.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#7C5CFC]/30 text-[#F5F7FF] font-mono flex items-center justify-center text-[10px] shrink-0 mt-0.5">3</span>
                  <span>Tap <strong>Add</strong> in the top right to launch full-screen like a native app.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#7C5CFC] py-2.5 text-xs font-semibold text-white hover:bg-[#6848F2] transition shadow-lg shadow-[#7C5CFC]/20"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

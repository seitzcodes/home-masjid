'use client'

import { useEffect, useState } from 'react'
import { X, Download, Share } from 'lucide-react'

// Extended window interface to include beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed',
    platform: string
  }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(true) // Default true to prevent flash
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // 1. Check if we're already in standalone mode
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone || 
      document.referrer.includes('android-app://');
    
    setIsStandalone(isStandaloneMode);

    if (isStandaloneMode) return;

    // 2. Check if user recently dismissed the prompt (7-day cooldown)
    const lastDismissed = localStorage.getItem('pwa_prompt_dismissed');
    if (lastDismissed) {
      const dismissDate = new Date(parseInt(lastDismissed, 10));
      const daysSinceDismissal = (Date.now() - dismissDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissal < 7) {
        return; // Still in cooldown period
      }
    }

    // 3. Detect iOS Safari
    const ua = window.navigator.userAgent;
    const webkit = !!ua.match(/WebKit/i);
    const isIPad = !!ua.match(/iPad/i);
    const isIPhone = !!ua.match(/iPhone/i);
    const isIOSDevice = isIPad || isIPhone;
    const isSafari = isIOSDevice && webkit && !ua.match(/CriOS/i); // Exclude Chrome on iOS

    if (isIOSDevice && isSafari) {
      setIsIOS(true);
      setShowPrompt(true);
    }

    // 4. Handle Android / Chrome beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa_prompt_dismissed', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the native install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
    
    // Clear the deferred prompt variable
    setDeferredPrompt(null);
  };

  if (!showPrompt || isStandalone) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-6 animate-in slide-in-from-bottom-5">
      <div className="max-w-md mx-auto bg-[#0F172A] rounded-2xl shadow-2xl border border-slate-700 p-4 text-white flex items-center justify-between gap-4">
        
        {/* App Icon */}
        <div className="w-12 h-12 bg-white rounded-xl shrink-0 flex items-center justify-center p-1">
          <img src="/home-masjid-icon.png" alt="Home Masjid" className="w-full h-full object-contain rounded-lg" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm md:text-base leading-tight">Install Home Masjid</h4>
          
          {isIOS ? (
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Tap <Share className="inline w-3.5 h-3.5 mx-0.5" /> then <strong>Add to Home Screen</strong>
            </p>
          ) : (
            <p className="text-xs text-slate-300 mt-1 leading-snug">
              Get the app for a faster, seamless experience.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {!isIOS && (
            <button 
              onClick={handleInstallClick}
              className="bg-[#D4AF37] hover:bg-[#8C7320] text-[#0F172A] font-bold text-xs px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Install
            </button>
          )}
          
          <button 
            onClick={handleDismiss}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
      </div>
    </div>
  );
}

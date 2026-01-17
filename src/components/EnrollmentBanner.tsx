import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Download, Sparkles } from 'lucide-react';
import { scheduleDailyNotification } from '@/lib/notifications';

const DISMISS_KEY = 'teccine_enrollment_dismissed';
const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const EnrollmentBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [showDesktopInstructions, setShowDesktopInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
      return;
    }

    // Detect iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // Detect desktop (not mobile/tablet)
    const isDesktopDevice = !iOS && !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsDesktop(isDesktopDevice);

    // Check if dismissed within last 24 hours
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) {
        return; // Still within dismiss period
      }
    }

    // Capture the beforeinstallprompt event for PWA (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show banner after 20 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 20000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
    setIsVisible(false);
  };

  const handleEnroll = async () => {
    try {
      // Step 1: Trigger PWA install prompt if available (Android/Chrome/Desktop)
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log('PWA install choice:', choiceResult.outcome);
        setDeferredPrompt(null);
        
        if (choiceResult.outcome === 'accepted') {
          // Schedule daily notifications after install
          await scheduleDailyNotification();
          setIsEnrolled(true);
          setTimeout(() => {
            setIsVisible(false);
            localStorage.setItem(DISMISS_KEY, Date.now().toString());
          }, 2000);
          return;
        }
      }

      // Step 2: For desktop without prompt, show installation instructions
      if (isDesktop && !deferredPrompt) {
        setShowDesktopInstructions(true);
        // Schedule notifications
        await scheduleDailyNotification();
        return;
      }

      // Step 3: For iOS, show instructions (they need to use share button)
      if (isIOS && !deferredPrompt) {
        // On iOS, we can't programmatically trigger install
        // But we can schedule notifications
        await scheduleDailyNotification();
        setIsEnrolled(true);
        setTimeout(() => {
          setIsVisible(false);
          localStorage.setItem(DISMISS_KEY, Date.now().toString());
        }, 3000);
        return;
      }

      // Step 4: Schedule notifications and show success
      await scheduleDailyNotification();
      setIsEnrolled(true);
      setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      }, 2000);
    } catch (error) {
      console.error('Enrollment error:', error);
      // Try to schedule notifications anyway
      try {
        await scheduleDailyNotification();
      } catch (notifError) {
        console.error('Notification scheduling error:', notifError);
      }
      // Still show success
      setIsEnrolled(true);
      setTimeout(() => {
        setIsVisible(false);
        localStorage.setItem(DISMISS_KEY, Date.now().toString());
      }, 2000);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && !isStandalone && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-2xl"
        >
          <div className="relative bg-gradient-to-br from-[hsl(175,60%,45%)] to-[hsl(175,60%,40%)] text-white rounded-2xl px-6 py-5 shadow-2xl border border-white/10 backdrop-blur-sm">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-white/80" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pr-8">
              {/* Icon */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <h3 className="font-display font-bold text-lg sm:text-xl leading-tight mb-1.5">
                  💊 Never miss your daily tech dose
                </h3>
                <p className="text-white/90 text-sm leading-relaxed">
                  {isDesktop && !deferredPrompt 
                    ? "Install Teccine as an app for instant access. Get daily notifications at 9 AM to stay tech-healthy without the noise."
                    : "Add Teccine to your home screen for instant access. Get daily notifications at 9 AM to stay tech-healthy without the noise."
                  }
                </p>
                {showDesktopInstructions && (
                  <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/20">
                    <p className="text-white/90 text-xs font-medium mb-2">To install on desktop:</p>
                    <ul className="text-white/80 text-xs space-y-1 list-disc list-inside">
                      <li>Chrome/Edge: Click the install icon <Download className="w-3 h-3 inline mx-0.5" /> in the address bar</li>
                      <li>Or go to Menu → Install Teccine</li>
                    </ul>
                  </div>
                )}
                {isIOS && !deferredPrompt && !showDesktopInstructions && (
                  <p className="text-white/70 text-xs mt-2 italic">
                    Tap the share button <Download className="w-3 h-3 inline mx-0.5" /> and select "Add to Home Screen"
                  </p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 shrink-0 w-full sm:w-auto">
                {isEnrolled ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500/90 text-white font-semibold shadow-lg"
                  >
                    <Check className="w-5 h-5" />
                    <span>All Set!</span>
                  </motion.div>
                ) : (
                  <>
                    <button
                      onClick={handleEnroll}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-[hsl(175,60%,35%)] font-semibold hover:bg-white/95 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-100"
                    >
                      {deferredPrompt ? (
                        <>
                          <Download className="w-5 h-5" />
                          <span>{isDesktop ? 'Install App' : 'Add to Home Screen'}</span>
                        </>
                      ) : isDesktop ? (
                        <>
                          <Download className="w-5 h-5" />
                          <span>Show Install Instructions</span>
                        </>
                      ) : (
                        <>
                          <Bell className="w-5 h-5" />
                          <span>Enable Notifications</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="px-4 py-3 rounded-xl text-white/80 hover:text-white hover:bg-white/10 text-sm font-medium transition-all sm:hidden"
                    >
                      Later
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EnrollmentBanner;

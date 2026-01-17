import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check } from 'lucide-react';

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

  useEffect(() => {
    // Check if dismissed within last 24 hours
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) {
        return; // Still within dismiss period
      }
    }

    // Capture the beforeinstallprompt event for PWA
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Show banner after 30 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 30000);

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
      // Step 1: Request notification permission
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      }

      // Step 2: Trigger PWA install prompt if available
      if (deferredPrompt) {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        console.log('PWA install choice:', choiceResult.outcome);
        setDeferredPrompt(null);
      }

      // Step 3: Show success state
      setIsEnrolled(true);
    } catch (error) {
      console.error('Enrollment error:', error);
      // Still show success if notification permission was granted
      setIsEnrolled(true);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg"
        >
          <div className="bg-[hsl(175,60%,45%)] text-white rounded-full px-6 py-4 shadow-xl">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Content */}
              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-display font-bold text-lg leading-tight">
                  💊 Prescription: Never miss a dose.
                </h3>
                <p className="text-white/90 text-sm mt-1 leading-snug">
                  Enable daily notifications and add Teccine to your home screen. 
                  It's the fastest way to stay tech-healthy without the noise of social media.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2 shrink-0">
                {isEnrolled ? (
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-green-500 text-white font-semibold"
                  >
                    <Check className="w-5 h-5" />
                    <span>Prescription Active</span>
                  </motion.div>
                ) : (
                  <>
                    <button
                      onClick={handleEnroll}
                      className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-white text-[hsl(175,60%,35%)] font-semibold hover:bg-white/90 transition-colors shadow-md"
                    >
                      <Bell className="w-4 h-4" />
                      <span>Enroll Now</span>
                    </button>
                    <button
                      onClick={handleDismiss}
                      className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                    >
                      Maybe tomorrow
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

// Notification scheduling service for daily 9 AM notifications

const NOTIFICATION_TITLE = '💊 Your Daily Tech Dose is Ready!';
const NOTIFICATION_BODY = 'Check out today\'s tech update explained simply.';
const NOTIFICATION_ICON = '/pwa-192x192.png';
const NOTIFICATION_BADGE = '/pwa-192x192.png';

// Check if notifications are supported
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

// Check current notification permission
export const getNotificationPermission = (): NotificationPermission => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission === 'denied') {
    return 'denied';
  }

  const permission = await Notification.requestPermission();
  return permission;
};

// Calculate time until next 9 AM
const getTimeUntil9AM = (): number => {
  const now = new Date();
  const target = new Date(now);
  target.setHours(9, 0, 0, 0);

  // If it's already past 9 AM today, schedule for tomorrow
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
};

// Store notification schedule in localStorage
const STORAGE_KEY = 'teccine_notification_schedule';

interface NotificationSchedule {
  scheduled: boolean;
  scheduledAt: number;
  nextNotification: number;
}

// Schedule daily notification at 9 AM
export const scheduleDailyNotification = async (): Promise<boolean> => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return false;
  }

  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    console.warn('Notification permission not granted');
    return false;
  }

  // Calculate time until next 9 AM
  const timeUntil9AM = getTimeUntil9AM();
  const nextNotificationTime = Date.now() + timeUntil9AM;

  // Store schedule in localStorage
  const schedule: NotificationSchedule = {
    scheduled: true,
    scheduledAt: Date.now(),
    nextNotification: nextNotificationTime,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));

  // Register service worker if available
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Send schedule to service worker
      if (registration.active) {
        registration.active.postMessage({
          type: 'SCHEDULE_NOTIFICATION',
          time: timeUntil9AM,
          nextNotification: nextNotificationTime,
          title: NOTIFICATION_TITLE,
          body: NOTIFICATION_BODY,
          icon: NOTIFICATION_ICON,
          badge: NOTIFICATION_BADGE,
        });
      }
    } catch (error) {
      console.error('Error communicating with service worker:', error);
    }
  }

  // Schedule client-side notifications (works when app is open)
  scheduleClientSideNotification(timeUntil9AM);
  scheduleRecurringNotifications();

  console.log('Daily notifications scheduled for 9 AM');
  return true;
};

// Schedule client-side notification (works when app is open)
const scheduleClientSideNotification = (delay: number): void => {
  // Store timeout ID to clear if needed
  const timeoutId = setTimeout(() => {
    if (Notification.permission === 'granted') {
      try {
        new Notification(NOTIFICATION_TITLE, {
          body: NOTIFICATION_BODY,
          icon: NOTIFICATION_ICON,
          badge: NOTIFICATION_BADGE,
          tag: 'daily-tech-dose',
          requireInteraction: false,
          silent: false,
        });
        
        // Update schedule for next day
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 1);
        nextDay.setHours(9, 0, 0, 0);
        
        const schedule: NotificationSchedule = {
          scheduled: true,
          scheduledAt: Date.now(),
          nextNotification: nextDay.getTime(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schedule));
        
        // Schedule next notification
        scheduleRecurringNotifications();
      } catch (error) {
        console.error('Error showing notification:', error);
      }
    }
  }, delay);
  
  // Store timeout ID in case we need to clear it
  (window as any).__teccineNotificationTimeout = timeoutId;
};

// Schedule recurring daily notifications
const scheduleRecurringNotifications = (): void => {
  // Schedule for the next 7 days
  for (let day = 1; day <= 7; day++) {
    const now = new Date();
    const target = new Date(now);
    target.setDate(target.getDate() + day);
    target.setHours(9, 0, 0, 0);
    
    const delay = target.getTime() - now.getTime();
    
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification(NOTIFICATION_TITLE, {
          body: NOTIFICATION_BODY,
          icon: NOTIFICATION_ICON,
          badge: NOTIFICATION_BADGE,
          tag: `daily-tech-dose-${day}`,
          requireInteraction: false,
        });
      }
    }, delay);
  }
};

// Clear all scheduled notifications
export const clearScheduledNotifications = (): void => {
  // Clear localStorage
  localStorage.removeItem(STORAGE_KEY);
  
  // Clear client-side timeout
  if ((window as any).__teccineNotificationTimeout) {
    clearTimeout((window as any).__teccineNotificationTimeout);
  }
  
  // Service worker will handle clearing scheduled notifications
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage({
          type: 'CLEAR_NOTIFICATIONS',
        });
      }
    });
  }
};

// Check if notifications are already scheduled
export const areNotificationsScheduled = (): boolean => {
  const schedule = localStorage.getItem(STORAGE_KEY);
  if (!schedule) return false;
  
  try {
    const data: NotificationSchedule = JSON.parse(schedule);
    return data.scheduled && data.nextNotification > Date.now();
  } catch {
    return false;
  }
};

// Re-initialize notifications if app was closed and reopened
export const reinitializeNotifications = async (): Promise<void> => {
  const schedule = localStorage.getItem(STORAGE_KEY);
  if (!schedule) return;
  
  try {
    const data: NotificationSchedule = JSON.parse(schedule);
    if (data.scheduled) {
      // Check if we missed the notification
      if (Date.now() >= data.nextNotification) {
        // Reschedule for next 9 AM
        await scheduleDailyNotification();
      }
    }
  } catch (error) {
    console.error('Error reinitializing notifications:', error);
  }
};

// Send a test notification immediately
export const sendTestNotification = async (): Promise<boolean> => {
  const permission = await requestNotificationPermission();
  if (permission !== 'granted') {
    return false;
  }

  new Notification('Test Notification', {
    body: 'Notifications are working! You\'ll receive daily updates at 9 AM.',
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_BADGE,
    tag: 'test-notification',
  });

  return true;
};

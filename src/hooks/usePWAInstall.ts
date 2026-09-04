import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export interface PlatformInfo {
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isSafari: boolean;
  isChrome: boolean;
  isEdge: boolean;
}

const DISMISS_KEY = 'vuew_pwa_banner_dismissed_v1';

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [platform, setPlatform] = useState<PlatformInfo>({
    isIOS: false,
    isAndroid: false,
    isDesktop: true,
    isSafari: false,
    isChrome: false,
    isEdge: false,
  });

  useEffect(() => {
    // 1. Detect Standalone / Installed mode
    const checkIsStandalone = () => {
      const isStandaloneMatch = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isDocumentReferrer = document.referrer.includes('android-app://');
      return isStandaloneMatch || isIOSStandalone || isDocumentReferrer;
    };

    setIsInstalled(checkIsStandalone());

    // 2. Detect Platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroidDevice = /android/.test(ua);
    const isSafariBrowser = /safari/.test(ua) && !/chrome|chromium|edg/.test(ua);
    const isChromeBrowser = /chrome|chromium/.test(ua) && !/edg/.test(ua);
    const isEdgeBrowser = /edg/.test(ua);
    const isDesktopDevice = !isIOSDevice && !isAndroidDevice;

    setPlatform({
      isIOS: isIOSDevice,
      isAndroid: isAndroidDevice,
      isDesktop: isDesktopDevice,
      isSafari: isSafariBrowser,
      isChrome: isChromeBrowser,
      isEdge: isEdgeBrowser,
    });

    // 3. Listen for native browser install prompt event (Chromium, Android, Edge, Desktop Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      try {
        localStorage.setItem(DISMISS_KEY, 'true');
      } catch {
        // ignore
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = useCallback(async (): Promise<'accepted' | 'dismissed' | 'manual_instructions'> => {
    if (!deferredPrompt) {
      return 'manual_instructions';
    }

    try {
      await deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        try {
          localStorage.setItem(DISMISS_KEY, 'true');
        } catch {
          // ignore
        }
        return 'accepted';
      }
      return 'dismissed';
    } catch (err) {
      console.warn('PWA install prompt error:', err);
      return 'manual_instructions';
    }
  }, [deferredPrompt]);

  const dismissBanner = useCallback(() => {
    setIsBannerDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, 'true');
    } catch {
      // ignore
    }
  }, []);

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isBannerDismissed,
    platform,
    install,
    dismissBanner,
  };
}

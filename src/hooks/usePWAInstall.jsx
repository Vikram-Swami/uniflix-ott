import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const usePWAInstall = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);

    useEffect(() => {
        // Detect iOS
        const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
            (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        setIsIOS(iOS);

        // Detect Android
        const android = /Android/.test(navigator.userAgent);
        setIsAndroid(android);

        // Check if already installed (standalone mode)
        const checkInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                window.navigator.standalone === true ||
                document.referrer.includes('android-app://') ||
                (window.matchMedia('(display-mode: fullscreen)').matches && window.screen.height - window.innerHeight < 5);
            setIsInstalled(isStandalone);
            return isStandalone;
        };

        checkInstalled();

        // Re-check periodically in case install status changes
        const interval = setInterval(checkInstalled, 1000);

        // Listen for beforeinstallprompt event (Android Chrome, Edge, etc.)
        const handler = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Also listen for appinstalled event
        const installedHandler = () => {
            setIsInstalled(true);
            setDeferredPrompt(null);
        };

        window.addEventListener('appinstalled', installedHandler);

        return () => {
            clearInterval(interval);
            window.removeEventListener('beforeinstallprompt', handler);
            window.removeEventListener('appinstalled', installedHandler);
        };
    }, []);

    const handleInstall = async () => {
        // Double check if already installed
        const currentlyInstalled = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');

        if (currentlyInstalled) {
            toast.info('App is already installed on your device');
            return;
        }

        // iOS - Show instructions
        if (isIOS) {
            const isInStandaloneMode = window.navigator.standalone === true;
            if (!isInStandaloneMode) {
                toast.info(
                    'To install: Tap the Share button (square with arrow) at the bottom, then select "Add to Home Screen"',
                    { autoClose: 8000 }
                );
            } else {
                toast.info('App is already installed');
            }
            return;
        }

        // Android/Desktop - Use beforeinstallprompt if available
        if (deferredPrompt) {
            try {
                await deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;

                if (outcome === 'accepted') {
                    toast.success('App installation started!');
                    setDeferredPrompt(null);
                } else {
                    toast.info('Installation cancelled');
                }
            } catch (error) {
                console.error('Install prompt error:', error);
                toast.error('Failed to show install prompt. Please try again.');
            }
        } else {
            // If prompt is not available, provide alternative message based on platform
            if (isAndroid) {
                toast.info('Install option not available. Please ensure you are using Chrome browser and the site meets PWA requirements.', { autoClose: 5000 });
            } else if (navigator.userAgent.includes('Edge')) {
                toast.info('Please use the browser menu (three dots) and select "Install UniFlix"', { autoClose: 5000 });
            } else {
                toast.info('Install option not available on this browser. Try using Chrome, Edge, or Safari.', { autoClose: 5000 });
            }
        }
    };

    const handlePlayStoreInstall = () => {
        // Check if already installed
        const currentlyInstalled = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');

        if (currentlyInstalled) {
            toast.info('App is already installed on your device');
            return;
        }

        // For Android, try PWA install first (works better than Play Store redirect)
        if (isAndroid || deferredPrompt) {
            handleInstall();
        } else {
            // If no prompt available, provide helpful message
            toast.info('For Android: Please use Chrome browser and try again, or use the browser menu to install.', { autoClose: 5000 });
            handleInstall();
        }
    };

    const handleAppStoreInstall = () => {
        // Check if already installed
        const currentlyInstalled = window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');

        if (currentlyInstalled) {
            toast.info('App is already installed on your device');
            return;
        }

        if (isIOS) {
            handleInstall();
        } else {
            // For non-iOS, still try PWA install
            handleInstall();
        }
    };

    return {
        handleInstall,
        handlePlayStoreInstall,
        handleAppStoreInstall,
        isInstalled,
        canInstall: !!deferredPrompt || isIOS,
        isIOS,
        isAndroid,
    };
};

export default usePWAInstall;


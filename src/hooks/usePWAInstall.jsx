import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { toast } from 'react-toastify';

// Global context for PWA install
const PWAInstallContext = createContext(null);

// Provider component - should wrap the app
export const PWAInstallProvider = ({ children }) => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isAndroid, setIsAndroid] = useState(false);
    const promptRef = useRef(null);

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

            // If installed, clear any pending prompt
            if (isStandalone) {
                setDeferredPrompt(null);
                promptRef.current = null;
            }

            return isStandalone;
        };

        checkInstalled();

        // Listen for beforeinstallprompt event - ONLY ONCE at app level
        const handler = (e) => {
            console.log('beforeinstallprompt event captured');
            e.preventDefault();

            // Store in both state and ref for reliability
            promptRef.current = e;
            setDeferredPrompt(e);
        };

        // Also listen for appinstalled event
        const installedHandler = () => {
            console.log('App installed successfully');
            setIsInstalled(true);
            setDeferredPrompt(null);
            promptRef.current = null;
        };

        window.addEventListener('beforeinstallprompt', handler);
        window.addEventListener('appinstalled', installedHandler);

        return () => {
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

        // Use ref first (more reliable), then state
        const prompt = promptRef.current || deferredPrompt;

        // Android/Desktop - Use beforeinstallprompt if available
        if (prompt) {
            try {
                // Check if prompt is still valid (has prompt method)
                if (typeof prompt.prompt !== 'function') {
                    console.warn('Prompt is no longer valid');
                    setDeferredPrompt(null);
                    promptRef.current = null;
                    toast.info('Install prompt expired. Please refresh the page and try again.');
                    return;
                }

                console.log('Showing install prompt...');
                await prompt.prompt();

                // Wait for user choice
                const choiceResult = await prompt.userChoice;
                console.log('Install outcome:', choiceResult?.outcome);

                if (choiceResult?.outcome === 'accepted') {
                    toast.success('App installation started!');
                } else {
                    toast.info('Installation cancelled');
                }

                // Clear after use
                setDeferredPrompt(null);
                promptRef.current = null;
            } catch (error) {
                console.error('Install prompt error:', error);
                // Check if it's a specific error we can handle
                if (error.name === 'NotAllowedError') {
                    toast.info('Install prompt was blocked. Please allow prompts and try again.');
                } else {
                    toast.error('Failed to show install prompt. Please try again.');
                }
                // Clear invalid prompt
                setDeferredPrompt(null);
                promptRef.current = null;
            }
        } else {
            // Check if we're on a supported browser
            const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
            const isEdge = /Edg/.test(navigator.userAgent);
            const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

            if (isAndroid) {
                if (isChrome) {
                    toast.info('Install option will appear soon. Make sure the site meets PWA requirements and try again in a moment.', { autoClose: 6000 });
                } else {
                    toast.info('For Android: Please use Chrome browser for best PWA support.', { autoClose: 5000 });
                }
            } else if (isEdge) {
                toast.info('Please use the browser menu (three dots) → "Apps" → "Install this site as an app"', { autoClose: 6000 });
            } else if (isSafari) {
                toast.info('Safari on desktop doesn\'t support PWA install. Please use Chrome or Edge.', { autoClose: 5000 });
            } else {
                toast.info('Install option not available on this browser. Try using Chrome, Edge, or Safari.', { autoClose: 5000 });
            }
        }
    };

    const handlePlayStoreInstall = () => {
        handleInstall();
    };

    const handleAppStoreInstall = () => {
        handleInstall();
    };

    const value = {
        handleInstall,
        handlePlayStoreInstall,
        handleAppStoreInstall,
        isInstalled,
        canInstall: !!deferredPrompt || !!promptRef.current || isIOS,
        isIOS,
        isAndroid,
        deferredPrompt: promptRef.current || deferredPrompt,
    };

    return (
        <PWAInstallContext.Provider value={value}>
            {children}
        </PWAInstallContext.Provider>
    );
};

// Hook to use PWA install functionality
const usePWAInstall = () => {
    const context = useContext(PWAInstallContext);
    if (!context) {
        throw new Error('usePWAInstall must be used within PWAInstallProvider');
    }
    return context;
};

export default usePWAInstall;

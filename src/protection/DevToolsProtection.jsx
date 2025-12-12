import { useEffect, useRef } from 'react';

const DevToolsProtection = () => {
    const hasRedirected = useRef(false);

    useEffect(() => {
        // ========================================
        // MOBILE/TABLET DETECTION - Enhanced Version
        // ========================================
        const isMobileOrTablet = () => {
            // Method 1: User Agent Detection
            const ua = navigator.userAgent || navigator.vendor || window.opera;
            const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i;

            // Method 2: Touch Detection
            const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

            // Method 3: Screen Size (mobile typically < 1024px)
            const isSmallScreen = window.innerWidth < 1024;

            // Method 4: Check for mobile-specific APIs
            const hasMobileAPIs = 'orientation' in window || 'onorientationchange' in window;

            // Method 5: Device memory check (mobile devices usually have less memory)
            const hasLowMemory = navigator.deviceMemory && navigator.deviceMemory <= 4;

            // iOS specific detection
            const isIOS = /iphone|ipad|ipod/i.test(ua);

            // Android specific detection
            const isAndroid = /android/i.test(ua);

            // Tablet specific detection
            const isTablet = /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua);

            // Return true if ANY mobile/tablet indicator is present
            return mobileRegex.test(ua) ||
                (hasTouch && isSmallScreen) ||
                hasMobileAPIs ||
                isIOS ||
                isAndroid ||
                isTablet;
        };

        // Exit early if mobile/tablet detected
        if (isMobileOrTablet()) {
            console.log('Mobile/Tablet detected - DevTools protection disabled');
            return;
        }

        // ========================================
        // REDIRECT FUNCTION
        // ========================================
        const redirectToGoogle = () => {
            if (hasRedirected.current) return;
            hasRedirected.current = true;

            try {
                // Clear storage
                localStorage.clear();
                sessionStorage.clear();

                // Clear cookies
                document.cookie.split(";").forEach((c) => {
                    document.cookie = c
                        .replace(/^ +/, "")
                        .replace(/=.*/, "=;expires=" + new Date(0).toUTCString() + ";path=/");
                });
            } catch (e) {
                console.error('Error clearing storage:', e);
            }

            // Redirect
            window.location.replace('https://www.google.com');
        };

        // ========================================
        // DETECTION METHOD 1: Console DevTools Check
        // ========================================
        const element = new Image();
        let devtoolsOpen = false;

        Object.defineProperty(element, 'id', {
            get: function () {
                devtoolsOpen = true;
                redirectToGoogle();
                throw new Error('DevTools detected');
            }
        });

        // Trigger detection immediately
        requestIdleCallback(() => {
            try {
                console.log('%c', element);
                console.clear();
            } catch (e) {
                // DevTools detected
            }
        });

        // ========================================
        // DETECTION METHOD 2: Window Size Difference
        // ========================================
        const checkWindowSize = () => {
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;

            // Threshold for detecting devtools (adjust as needed)
            if (widthDiff > 160 || heightDiff > 160) {
                redirectToGoogle();
                return true;
            }
            return false;
        };

        // ========================================
        // DETECTION METHOD 3: Debugger Statement
        // ========================================
        const checkDebugger = () => {
            const start = performance.now();
            debugger;
            const end = performance.now();

            // If debugger pauses execution, time difference will be significant
            if (end - start > 100) {
                redirectToGoogle();
                return true;
            }
            return false;
        };

        // ========================================
        // DETECTION METHOD 4: toString Method
        // ========================================
        const checkToString = () => {
            const div = document.createElement('div');
            let detected = false;

            Object.defineProperty(div, 'id', {
                get: function () {
                    detected = true;
                    redirectToGoogle();
                }
            });

            // This triggers getter if devtools are open
            console.dir(div);
            console.clear();

            return detected;
        };

        // ========================================
        // DETECTION METHOD 5: Firebug Check
        // ========================================
        const checkFirebug = () => {
            if (window.console && (window.console.firebug || window.console.exception)) {
                redirectToGoogle();
                return true;
            }
            return false;
        };

        // ========================================
        // IMMEDIATE DETECTION ON LOAD
        // ========================================
        const runImmediateChecks = () => {
            if (checkWindowSize()) return;
            if (checkDebugger()) return;
            if (checkToString()) return;
            if (checkFirebug()) return;
        };

        // Run checks after a small delay to ensure DOM is ready
        setTimeout(runImmediateChecks, 100);
        setTimeout(runImmediateChecks, 500);
        setTimeout(runImmediateChecks, 1000);

        // ========================================
        // DISABLE KEYBOARD SHORTCUTS
        // ========================================
        const handleKeyDown = (e) => {
            // F12
            if (e.keyCode === 123) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+I (Inspect)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+J (Console)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }
            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
            // Ctrl+U (View Source)
            if (e.ctrlKey && e.keyCode === 85) {
                e.preventDefault();
                return false;
            }
            // Ctrl+S (Save)
            if (e.ctrlKey && e.keyCode === 83) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+I (Mac Inspect)
            if (e.metaKey && e.altKey && e.keyCode === 73) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+J (Mac Console)
            if (e.metaKey && e.altKey && e.keyCode === 74) {
                e.preventDefault();
                return false;
            }
            // Cmd+Option+C (Mac Inspect Element)
            if (e.metaKey && e.altKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
        };

        // ========================================
        // DISABLE RIGHT CLICK
        // ========================================
        const handleContextMenu = (e) => {
            e.preventDefault();
            return false;
        };

        // ========================================
        // CONTINUOUS MONITORING
        // ========================================
        const monitoringInterval = setInterval(() => {
            if (hasRedirected.current) {
                clearInterval(monitoringInterval);
                return;
            }

            checkWindowSize();
            checkDebugger();
            checkFirebug();
        }, 1000);

        // More frequent checks for better detection
        const fastCheckInterval = setInterval(() => {
            if (hasRedirected.current) {
                clearInterval(fastCheckInterval);
                return;
            }
            checkDebugger();
        }, 500);

        // ========================================
        // APPLY PROTECTIONS
        // ========================================
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('contextmenu', handleContextMenu);

        // Disable text selection (optional, uncomment if needed)
        // document.body.style.userSelect = 'none';
        // document.body.style.webkitUserSelect = 'none';

        // ========================================
        // CLEANUP
        // ========================================
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('contextmenu', handleContextMenu);
            clearInterval(monitoringInterval);
            clearInterval(fastCheckInterval);
        };
    }, []);

    return null;
};

export default DevToolsProtection;
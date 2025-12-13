import { useEffect } from 'react';

const DevToolsProtection = () => {
    useEffect(() => {
        const preventZoom = (e) => {
            if (e.ctrlKey && (e.key === '+' || e.key === '-' || e.key === '=')) {
                e.preventDefault();
            }
        };

        document.addEventListener('keydown', preventZoom);

        return () => {
            document.removeEventListener('keydown', preventZoom);
        };
    }, []);
    useEffect(() => {
        const preventWheelZoom = (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
            }
        };

        document.addEventListener('wheel', preventWheelZoom, { passive: false });

        return () => {
            document.removeEventListener('wheel', preventWheelZoom);
        };
    }, []);
    useEffect(() => {
        // Detect if device is mobile or tablet (iPhone/Android)
        const isMobileDevice = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';

            // Check for desktop OS first - if it's Windows/Mac/Linux, it's NOT mobile
            const isDesktopOS = /windows|win32|win64|macintosh|mac os x|linux/i.test(userAgent);
            if (isDesktopOS) {
                return false; // Definitely desktop, not mobile
            }

            // Prefer UA-CH when available (only if not desktop OS)
            if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
                return navigator.userAgentData.mobile;
            }

            // Mobile device patterns - only check if not desktop OS
            const mobilePatterns = [
                /android/i,
                /iphone/i,
                /ipad/i,
                /ipod/i,
                /blackberry/i,
                /windows phone/i,
                /mobile/i,
                /tablet/i
            ];

            // Only return true if user agent explicitly matches mobile patterns
            return mobilePatterns.some((pattern) => pattern.test(userAgent));
        };

        // If it's a mobile/tablet device, don't run DevTools protection
        if (isMobileDevice()) {
            console.log("first", isMobileDevice())
            return; // Exit early - no protection needed on mobile devices
        }

        // Helper function to redirect
        const redirectToGoogle = () => {
            // Redirect to Google
            window.location.href = 'https://www.google.com';
        };

        // 1. Disable Right Click
        const disableRightClick = (e) => {
            e.preventDefault();
            return false;
        };

        // 2. Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        const disableKeyboardShortcuts = (e) => {
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
            // Ctrl+Shift+C (Inspect Element)
            if (e.ctrlKey && e.shiftKey && e.keyCode === 67) {
                e.preventDefault();
                return false;
            }
        };

        // 3. Detect DevTools Open (Window size method)
        const detectDevTools = () => {
            const threshold = 160;
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;

            if (widthThreshold || heightThreshold) {
                redirectToGoogle();
                return true;
            }
            return false;
        };

        // 4. Detect DevTools using console (runs BEFORE console is disabled)
        const devtoolsDetector = () => {
            let devtools = false;
            const element = new Image();
            Object.defineProperty(element, 'id', {
                get: function () {
                    devtools = true;
                    redirectToGoogle();
                }
            });
            // Use console.log before it's disabled
            console.log(element);
            console.clear();
            return devtools;
        };

        // 5. Detect DevTools using toString (more reliable immediate check)
        const detectDevToolsToString = () => {
            let devtools = false;
            const element = document.createElement('div');
            Object.defineProperty(element, 'id', {
                get: function () {
                    devtools = true;
                    redirectToGoogle();
                }
            });
            // This will trigger the getter if devtools are open
            const result = element.toString();
            return devtools;
        };

        // 6. Detect DevTools using performance timing
        const detectDevToolsPerformance = () => {
            const start = performance.now();
            debugger;
            const end = performance.now();
            if (end - start > 100) {
                redirectToGoogle();
                return true;
            }
            return false;
        };

        // 7. Disable console methods (but keep a reference for detection)
        const originalConsoleLog = console.log;
        const disableConsole = () => {
            const noop = () => { };
            console.log = noop;
            console.warn = noop;
            console.error = noop;
            console.info = noop;
            console.debug = noop;
            console.table = noop;
            console.clear = noop;
        };

        // 8. Detect debugger (continuous monitoring)
        let debugIntervalId = null;
        const detectDebugger = () => {
            debugIntervalId = setInterval(() => {
                const before = new Date().getTime();
                debugger;
                const after = new Date().getTime();
                if (after - before > 100) {
                    redirectToGoogle();
                }
            }, 1000);
        };

        // 9. Monitor localStorage/sessionStorage changes
        let storageIntervalId = null;
        const monitorStorage = () => {
            storageIntervalId = setInterval(() => {
                if (typeof (Storage) !== "undefined") {
                    try {
                        const testKey = '__storage_test__';
                        localStorage.setItem(testKey, testKey);
                        localStorage.removeItem(testKey);
                    } catch (e) {
                        // Storage is being inspected
                        clearInterval(storageIntervalId);
                        redirectToGoogle();
                    }
                }
            }, 1000);
        };

        // IMMEDIATE CHECKS - Run all detection methods immediately on page load
        // This ensures devtools are detected even if already open

        // Check 1: Window size detection (immediate)
        if (detectDevTools()) {
            return; // Already redirected
        }

        // Check 2: Console detection (immediate - must run before disabling console)
        if (devtoolsDetector()) {
            return; // Already redirected
        }

        // Check 3: toString detection (immediate)
        if (detectDevToolsToString()) {
            return; // Already redirected
        }

        // Check 4: Performance timing detection (immediate)
        if (detectDevToolsPerformance()) {
            return; // Already redirected
        }

        // Apply protections
        document.addEventListener('contextmenu', disableRightClick);
        document.addEventListener('keydown', disableKeyboardShortcuts);

        // Continuous monitoring - Check DevTools every second
        const devToolsInterval = setInterval(() => {
            detectDevTools();
        }, 1000);

        // Continuous console detection
        const consoleInterval = setInterval(() => {
            // Re-enable console.log temporarily for detection
            console.log = originalConsoleLog;
            devtoolsDetector();
            // Disable again
            disableConsole();
        }, 500);

        // Disable console (after initial detection)
        disableConsole();

        // Start debugger detection
        detectDebugger();

        // Monitor storage
        monitorStorage();

        // Cleanup
        return () => {
            document.removeEventListener('contextmenu', disableRightClick);
            document.removeEventListener('keydown', disableKeyboardShortcuts);
            clearInterval(devToolsInterval);
            clearInterval(consoleInterval);
            if (debugIntervalId) clearInterval(debugIntervalId);
            if (storageIntervalId) clearInterval(storageIntervalId);
        };
    }, []);

    return null; // This component doesn't render anything
};

export default DevToolsProtection;
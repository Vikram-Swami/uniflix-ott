import { X } from "lucide-react";
import React, { useState, useEffect } from 'react';

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showInstallButton, setShowInstallButton] = useState(true);

    useEffect(() => {
        // Listen for the beforeinstallprompt event
        const handler = (e) => {
            // Prevent the default browser install prompt
            e.preventDefault();
            // Save the event for later use
            setDeferredPrompt(e);
            // Show install button
            setShowInstallButton(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) {
            return;
        }
        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user's response
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // Clear the deferredPrompt
        setDeferredPrompt(null);
        setShowInstallButton(false);
    };

    if (!showInstallButton) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-500000000000">
            <div className="bg-linear-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-bounce">
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                </svg>
                <button
                    onClick={handleInstallClick}
                    className="font-semibold text-lg"
                >
                   
                </button>
                <button
                    onClick={() => setShowInstallButton(false)}
                    className="ml-2 text-white/80 hover:text-white"
                >
                    <X />
                </button>
            </div>
        </div>
    );
};

export default InstallPWA;
import { Copyright, X } from "lucide-react";
import React, { useState, useEffect } from 'react';
import Playstore from "../assets/images/playstore.png"
import Appstore from "../assets/images/apple.png"

const InstallPWA = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    useEffect(() => {
        // Listen for the beforeinstallprompt event
        const handler = (e) => {
            // Prevent the default browser install prompt
            e.preventDefault();
            // Save the event for later use
            setDeferredPrompt(e);
            // Show install button
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        console.log("first")
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
    };

    return (
        <div className="flex items-center flex-col h-full justify-end">
            <p className="text-xs xs:text-sm md:text-base">Uniflix is a copy of Prime Video and Lions Gate Play</p>
            <p className="my-2 text-xs xs:text-sm md:text-base">Stay connect with us and share with your friends and family</p>
            <p className="text-xs xs:text-sm md:text-base">You can download our Uniflix app for a better experience.</p>
            <div className="flex relative z-10 items-center gap-10 mt-5 mb-7 sm:mb-10">
                <button onClick={handleInstallClick} type="button" className="cursor-pointer">
                    <img className="w-30 sm:w-40 [box-shadow:0px_0px_22px_1px_#ffffff73] rounded-lg" src={Playstore} alt="playstore-btn" />
                </button>
                <button onClick={handleInstallClick} type="button" className="cursor-pointer">
                    <img className="w-30 sm:w-40 [box-shadow:0px_0px_22px_1px_#ffffff73] rounded-lg" src={Appstore} alt="Appstore-btn" />
                </button>
            </div>
            <p className="flex items-center justify-center gap-3 text-lg py-2"><Copyright className="w-5 h-5" /> 2025 uniflix.fun - Inc.</p>
        </div>
    );
};

export default InstallPWA;
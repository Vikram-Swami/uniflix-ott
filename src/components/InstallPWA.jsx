import { Copyright } from "lucide-react";
import React from 'react';
import Playstore from "../assets/images/playstore.png"
import Appstore from "../assets/images/apple.png"
import usePWAInstall from "../hooks/usePWAInstall"

const InstallPWA = () => {
    const { handlePlayStoreInstall, handleAppStoreInstall } = usePWAInstall();

    return (
        <div className="flex items-center flex-col h-full justify-end">
            <p className="text-xs xs:text-sm md:text-base">Uniflix is a clone of Prime Video and 10+ OTT</p>
            <p className="my-2 text-xs xs:text-sm md:text-base">Stay connect with us and share with your friends and family</p>
            <p className="text-xs xs:text-sm md:text-base">You can download our Uniflix app for a better experience.</p>
            <div className="flex relative z-10 items-center gap-10 mt-5 mb-7 sm:mb-10">
                <button onClick={handlePlayStoreInstall} type="button" className="cursor-pointer">
                    <img className="w-30 sm:w-40 [box-shadow:0px_0px_22px_1px_#ffffff73] rounded-lg" src={Playstore} alt="playstore-btn" />
                </button>
                <button onClick={handleAppStoreInstall} type="button" className="cursor-pointer">
                    <img className="w-30 sm:w-40 [box-shadow:0px_0px_22px_1px_#ffffff73] rounded-lg" src={Appstore} alt="Appstore-btn" />
                </button>
            </div>
            <p className="flex items-center justify-center gap-3 text-lg py-2"><Copyright className="w-5 h-5" /> 2025 uniflix.fun - Inc.</p>
        </div>
    );
};

export default InstallPWA;
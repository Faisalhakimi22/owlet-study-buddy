import React, { useState, useEffect } from 'react';
import { X, Share, PlusSquare, Download } from 'lucide-react';

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // Check if iOS
        const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // If iOS, show prompt after a delay (since we can't detect installability)
        if (isIOSDevice) {
            const hasSeenPrompt = localStorage.getItem('install-prompt-seen');
            if (!hasSeenPrompt) {
                setTimeout(() => setShowPrompt(true), 3000);
            }
        }

        // Handle Android/Desktop install prompt
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);

            const hasSeenPrompt = localStorage.getItem('install-prompt-seen');
            if (!hasSeenPrompt) {
                setShowPrompt(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('install-prompt-seen', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 z-50 animate-in slide-in-from-bottom-10 duration-500">
            <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
                <X size={20} />
            </button>

            <div className="flex items-start gap-4">
                <div className="bg-[#195d82] p-3 rounded-xl text-white shrink-0">
                    <Download size={24} />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Install Owlet</h3>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                        Add to your home screen for the best full-screen experience.
                    </p>

                    {isIOS ? (
                        <div className="mt-4 space-y-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-bold">1</span>
                                <span>Tap the <Share size={14} className="inline mx-1" /> Share button</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 bg-gray-200 rounded-full text-xs font-bold">2</span>
                                <span>Select <PlusSquare size={14} className="inline mx-1" /> Add to Home Screen</span>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            className="mt-4 w-full bg-[#195d82] text-white py-2.5 rounded-lg font-medium hover:bg-[#144a6a] transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={18} />
                            Install App
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InstallPrompt;

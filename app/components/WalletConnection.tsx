'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useNetwork } from 'wagmi';
import { useState, useEffect } from 'react';

export default function WalletConnection() {
    const { address, isConnected } = useAccount();
    const { chain } = useNetwork();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-bold text-gray-900">
                        Freelancer Smart Contract dApp
                    </h1>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="w-32 h-10 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between p-4 bg-white shadow-sm border-b">
            <div className="flex items-center space-x-4">
                <h1 className="text-xl font-bold text-gray-900">
                    Freelancer Smart Contract dApp
                </h1>
                {isConnected && chain && (
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Network:</span>
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded text-sm">
                            {chain.name}
                        </span>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-4">
                {isConnected && address && (
                    <div className="text-sm text-gray-600">
                        {`${address.slice(0, 6)}...${address.slice(-4)}`}
                    </div>
                )}
                <ConnectButton />
            </div>
        </div>
    );
}
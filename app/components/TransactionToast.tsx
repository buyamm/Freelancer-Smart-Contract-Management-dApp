'use client';

import { useEffect, useState } from 'react';

interface TransactionToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    hash?: string;
    onClose: () => void;
}

export default function TransactionToast({ message, type, hash, onClose }: TransactionToastProps) {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type];

    const icon = {
        success: '✅',
        error: '❌',
        info: 'ℹ️',
    }[type];

    return (
        <div
            className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
        >
            <div className="flex items-start space-x-3">
                <span className="text-xl">{icon}</span>
                <div>
                    <p className="font-medium">{message}</p>
                    {hash && (
                        <a
                            href={`https://sepolia.etherscan.io/tx/${hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm underline opacity-80 hover:opacity-100"
                        >
                            Xem transaction →
                        </a>
                    )}
                </div>
                <button onClick={onClose} className="ml-4 opacity-70 hover:opacity-100">
                    ×
                </button>
            </div>
        </div>
    );
}
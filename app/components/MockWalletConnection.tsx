'use client';

import { useState } from 'react';
import { mockService, MOCK_ADDRESSES } from '../utils/mockData';

interface MockWalletConnectionProps {
    onConnect: (address: string) => void;
    isConnected: boolean;
    currentAddress: string;
}

export default function MockWalletConnection({ onConnect, isConnected, currentAddress }: MockWalletConnectionProps) {
    const [isOpen, setIsOpen] = useState(false);

    const mockAccounts = [
        { address: MOCK_ADDRESSES.client1, label: 'Client 1 (Chủ dự án)', role: 'client' },
        { address: MOCK_ADDRESSES.client2, label: 'Client 2 (Chủ dự án)', role: 'client' },
        { address: MOCK_ADDRESSES.freelancer1, label: 'Freelancer 1 (Người làm)', role: 'freelancer' },
        { address: MOCK_ADDRESSES.freelancer2, label: 'Freelancer 2 (Người làm)', role: 'freelancer' },
        { address: MOCK_ADDRESSES.arbiter1, label: 'Arbiter 1 (Trọng tài)', role: 'arbiter' },
        { address: MOCK_ADDRESSES.arbiter2, label: 'Arbiter 2 (Trọng tài)', role: 'arbiter' }
    ];

    const handleConnect = (address: string) => {
        mockService.setCurrentUser(address);
        onConnect(address);
        setIsOpen(false);
    };

    const handleDisconnect = () => {
        onConnect('');
        setIsOpen(false);
    };

    const getCurrentAccount = () => {
        return mockAccounts.find(acc => acc.address === currentAddress);
    };

    if (!isConnected) {
        return (
            <div className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-sm">FL</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Freelancer dApp
                            </h1>
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                                MOCK MODE
                            </span>
                        </div>

                        <button
                            onClick={() => setIsOpen(true)}
                            className="btn-primary"
                        >
                            Kết nối ví (Mock)
                        </button>
                    </div>
                </div>

                {/* Mock Wallet Selection Modal */}
                {isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Chọn ví để test</h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-2">
                                {mockAccounts.map((account) => (
                                    <button
                                        key={account.address}
                                        onClick={() => handleConnect(account.address)}
                                        className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="font-medium text-sm">{account.label}</div>
                                        <div className="text-xs text-gray-500 font-mono">
                                            {account.address.slice(0, 10)}...{account.address.slice(-8)}
                                        </div>
                                        <div className="text-xs text-blue-600 mt-1">
                                            Role: {account.role}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                                <p className="text-xs text-yellow-800">
                                    💡 Đây là mock data để test. Chọn các tài khoản khác nhau để xem các vai trò khác nhau (Client, Freelancer, Arbiter).
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    const currentAccount = getCurrentAccount();

    return (
        <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-3">
                <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">FL</span>
                        </div>
                        <h1 className="text-xl font-bold text-gray-900">
                            Freelancer dApp
                        </h1>
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                            MOCK MODE
                        </span>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-right">
                            <div className="text-sm font-medium text-gray-900">
                                {currentAccount?.label || 'Unknown Account'}
                            </div>
                            <div className="text-xs text-gray-500 font-mono">
                                {currentAddress.slice(0, 6)}...{currentAddress.slice(-4)}
                            </div>
                        </div>

                        <div className="flex space-x-2">
                            <button
                                onClick={() => setIsOpen(true)}
                                className="btn-secondary text-sm"
                            >
                                Đổi ví
                            </button>
                            <button
                                onClick={handleDisconnect}
                                className="btn-secondary text-sm"
                            >
                                Ngắt kết nối
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Account Switch Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Chuyển đổi tài khoản</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2">
                            {mockAccounts.map((account) => (
                                <button
                                    key={account.address}
                                    onClick={() => handleConnect(account.address)}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${account.address === currentAddress
                                            ? 'bg-primary-50 border-primary-200'
                                            : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="font-medium text-sm">{account.label}</div>
                                    <div className="text-xs text-gray-500 font-mono">
                                        {account.address.slice(0, 10)}...{account.address.slice(-8)}
                                    </div>
                                    <div className="text-xs text-blue-600 mt-1">
                                        Role: {account.role}
                                    </div>
                                    {account.address === currentAddress && (
                                        <div className="text-xs text-primary-600 mt-1 font-medium">
                                            ✓ Đang sử dụng
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
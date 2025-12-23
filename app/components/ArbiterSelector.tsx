'use client';

import { useState } from 'react';
import { isAddress } from 'viem';

// Danh sách arbiters mẫu (trong thực tế có thể lấy từ database hoặc smart contract)
const SAMPLE_ARBITERS = [
    {
        address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
        name: 'Arbiter Alpha',
        rating: 4.8,
        resolved: 156,
        fee: '5%',
        specialties: ['Web Development', 'Smart Contract'],
    },
    {
        address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
        name: 'Arbiter Beta',
        rating: 4.6,
        resolved: 89,
        fee: '5%',
        specialties: ['Design', 'Marketing'],
    },
    {
        address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
        name: 'Arbiter Gamma',
        rating: 4.9,
        resolved: 234,
        fee: '5%',
        specialties: ['Blockchain', 'DeFi', 'NFT'],
    },
];

interface ArbiterSelectorProps {
    value: string;
    onChange: (address: string) => void;
}

export default function ArbiterSelector({ value, onChange }: ArbiterSelectorProps) {
    const [mode, setMode] = useState<'select' | 'manual'>('select');
    const [manualAddress, setManualAddress] = useState('');

    const handleSelectArbiter = (address: string) => {
        onChange(address);
    };

    const handleManualInput = (address: string) => {
        setManualAddress(address);
        if (isAddress(address)) {
            onChange(address);
        }
    };

    const selectedArbiter = SAMPLE_ARBITERS.find(a => a.address.toLowerCase() === value.toLowerCase());

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">
                    Chọn Arbiter (Trọng tài) *
                </label>
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={() => setMode('select')}
                        className={`text-xs px-3 py-1 rounded ${mode === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Chọn từ danh sách
                    </button>
                    <button
                        type="button"
                        onClick={() => setMode('manual')}
                        className={`text-xs px-3 py-1 rounded ${mode === 'manual' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        Nhập thủ công
                    </button>
                </div>
            </div>

            {mode === 'select' ? (
                <div className="space-y-3">
                    {SAMPLE_ARBITERS.map((arbiter) => (
                        <div
                            key={arbiter.address}
                            onClick={() => handleSelectArbiter(arbiter.address)}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${value.toLowerCase() === arbiter.address.toLowerCase()
                                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="font-semibold text-gray-900">{arbiter.name}</div>
                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                        {arbiter.address.slice(0, 10)}...{arbiter.address.slice(-8)}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center text-yellow-500">
                                        <span className="mr-1">⭐</span>
                                        <span className="font-semibold">{arbiter.rating}</span>
                                    </div>
                                    <div className="text-xs text-gray-500">{arbiter.resolved} đã giải quyết</div>
                                </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {arbiter.specialties.map((spec) => (
                                    <span
                                        key={spec}
                                        className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                                    >
                                        {spec}
                                    </span>
                                ))}
                            </div>
                            <div className="mt-2 text-sm text-gray-600">
                                Phí trọng tài: <span className="font-medium">{arbiter.fee}</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => handleManualInput(e.target.value)}
                        placeholder="0x..."
                        className={`input w-full ${manualAddress && !isAddress(manualAddress) ? 'border-red-500' : ''}`}
                    />
                    {manualAddress && !isAddress(manualAddress) && (
                        <p className="text-xs text-red-500 mt-1">Địa chỉ không hợp lệ</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                        Nhập địa chỉ ví của người bạn tin tưởng làm trọng tài
                    </p>
                </div>
            )}

            {/* Selected Arbiter Display */}
            {value && isAddress(value) && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center text-green-800">
                        <span className="mr-2">✅</span>
                        <span className="font-medium">Đã chọn Arbiter:</span>
                    </div>
                    <div className="mt-1 font-mono text-sm text-green-700">
                        {selectedArbiter ? selectedArbiter.name : value}
                    </div>
                </div>
            )}
        </div>
    );
}
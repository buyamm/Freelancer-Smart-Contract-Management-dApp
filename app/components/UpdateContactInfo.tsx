'use client';

import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { useAccount } from 'wagmi';

interface ContactInfo {
    name: string;
    email: string;
    phone: string;
    chatLink: string;
}

export default function UpdateContactInfo() {
    const { address } = useAccount();
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        chatLink: ''
    });

    // Load existing contact info
    const { data: existingInfo } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getContactInfo',
        args: [address as `0x${string}`],
        enabled: !!address && isOpen,
    }) as { data: ContactInfo | undefined };

    // Load existing data when modal opens
    useState(() => {
        if (existingInfo && isOpen) {
            setFormData({
                name: existingInfo.name || '',
                email: existingInfo.email || '',
                phone: existingInfo.phone || '',
                chatLink: existingInfo.chatLink || ''
            });
        }
    });

    const { config } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'updateContactInfo',
        args: [
            formData.name,
            formData.email,
            formData.phone,
            formData.chatLink
        ],
        enabled: isOpen && !!address
    });

    const { write, data } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({ hash: data?.hash });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (write) {
            write();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (isSuccess) {
        return (
            <div className="card bg-green-50 border-green-200">
                <div className="text-center">
                    <div className="text-green-600 text-lg font-semibold mb-2">
                        ✅ Cập nhật thành công!
                    </div>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setTimeout(() => window.location.reload(), 1000);
                        }}
                        className="btn-primary"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn-secondary w-full"
            >
                📞 Cập nhật thông tin liên lạc
            </button>
        );
    }

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">📞 Thông tin liên lạc</h3>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
                Cập nhật thông tin để đối tác có thể liên lạc với bạn dễ dàng hơn.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Nguyễn Văn A"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="email@example.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số điện thoại
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="+84 xxx xxx xxx"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Link chat (Telegram, Discord, etc.)
                    </label>
                    <input
                        type="url"
                        name="chatLink"
                        value={formData.chatLink}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="https://t.me/username"
                    />
                </div>

                <div className="flex space-x-3 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || !write}
                        className="btn-primary flex-1 disabled:opacity-50"
                    >
                        {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="btn-secondary"
                    >
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
}

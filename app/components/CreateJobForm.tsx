'use client';

import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';
import { parseEther } from 'viem';

export default function CreateJobForm() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        payment: '',
        deadline: '',
        arbiter: ''
    });
    const [isOpen, setIsOpen] = useState(false);

    const deadlineTimestamp = formData.deadline ?
        Math.floor(new Date(formData.deadline).getTime() / 1000) : 0;

    const { config } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'createJob',
        args: [
            formData.title,
            formData.description,
            BigInt(deadlineTimestamp),
            formData.arbiter as `0x${string}`
        ],
        value: formData.payment ? parseEther(formData.payment) : undefined,
        enabled: !!(formData.title && formData.description && formData.payment &&
            formData.deadline && formData.arbiter && deadlineTimestamp > Date.now() / 1000)
    });

    const { data, write } = useContractWrite(config);

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (write) {
            write();
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
                        ✅ Hợp đồng đã được tạo thành công!
                    </div>
                    <p className="text-green-700 mb-4">
                        Hợp đồng của bạn đã được tạo và đang chờ freelancer nhận việc.
                    </p>
                    <button
                        onClick={() => {
                            setIsOpen(false);
                            setFormData({
                                title: '',
                                description: '',
                                payment: '',
                                deadline: '',
                                arbiter: ''
                            });
                        }}
                        className="btn-primary"
                    >
                        Tạo hợp đồng mới
                    </button>
                </div>
            </div>
        );
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="btn-primary w-full"
            >
                + Tạo hợp đồng mới
            </button>
        );
    }

    return (
        <div className="card">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Tạo hợp đồng mới</h2>
                <button
                    onClick={() => setIsOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    ✕
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiêu đề công việc *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="Ví dụ: Phát triển website React"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mô tả công việc *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className="input"
                        placeholder="Mô tả chi tiết về công việc cần thực hiện..."
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thanh toán (ETH) *
                        </label>
                        <input
                            type="number"
                            name="payment"
                            value={formData.payment}
                            onChange={handleInputChange}
                            step="0.001"
                            min="0"
                            className="input"
                            placeholder="0.1"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Deadline *
                        </label>
                        <input
                            type="datetime-local"
                            name="deadline"
                            value={formData.deadline}
                            onChange={handleInputChange}
                            className="input"
                            min={new Date().toISOString().slice(0, 16)}
                            required
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Địa chỉ Arbiter *
                    </label>
                    <input
                        type="text"
                        name="arbiter"
                        value={formData.arbiter}
                        onChange={handleInputChange}
                        className="input"
                        placeholder="0x..."
                        pattern="^0x[a-fA-F0-9]{40}$"
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Địa chỉ ví của người trọng tài để giải quyết tranh chấp
                    </p>
                </div>

                <div className="flex space-x-3 pt-4">
                    <button
                        type="submit"
                        disabled={isLoading || !write}
                        className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang tạo...' : 'Tạo hợp đồng'}
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
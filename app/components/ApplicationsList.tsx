'use client';

import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

interface Application {
    freelancer: string;
    proposal: string;
    appliedAt: bigint;
    isSelected: boolean;
}

interface ApplicationsListProps {
    jobId: bigint;
    onSelect?: () => void;
}

export default function ApplicationsList({ jobId, onSelect }: ApplicationsListProps) {
    const [selectedFreelancer, setSelectedFreelancer] = useState<string>('');

    const { data: applications, refetch } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJobApplications',
        args: [jobId],
        watch: true,
    }) as { data: Application[] | undefined; refetch: () => void };

    const { config: selectConfig } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'selectFreelancer',
        args: [jobId, selectedFreelancer as `0x${string}`],
        enabled: !!selectedFreelancer,
    });
    const { write: selectFreelancer, data: selectData } = useContractWrite(selectConfig);
    const { isLoading: isSelecting, isSuccess } = useWaitForTransaction({ hash: selectData?.hash });

    useEffect(() => {
        if (isSuccess) {
            refetch();
            onSelect?.();
        }
    }, [isSuccess, refetch, onSelect]);

    const formatDate = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleString('vi-VN');
    };

    const shortenAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

    if (!applications || applications.length === 0) {
        return (
            <div className="bg-gray-50 p-4 rounded-lg text-center">
                <p className="text-gray-500">Chưa có freelancer nào ứng tuyển</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-gray-700">
                👥 Danh sách ứng viên ({applications.length})
            </h4>
            <div className="space-y-3 max-h-80 overflow-y-auto">
                {applications.map((app, index) => (
                    <ApplicationCard
                        key={index}
                        application={app}
                        isSelected={selectedFreelancer === app.freelancer}
                        onSelect={() => setSelectedFreelancer(app.freelancer)}
                        formatDate={formatDate}
                        shortenAddress={shortenAddress}
                    />
                ))}
            </div>
            {selectedFreelancer && (
                <button
                    onClick={() => selectFreelancer?.()}
                    disabled={isSelecting || !selectFreelancer}
                    className="btn-primary w-full disabled:opacity-50"
                >
                    {isSelecting ? '⏳ Đang xử lý...' : '✅ Chọn freelancer này'}
                </button>
            )}
        </div>
    );
}

function ApplicationCard({
    application,
    isSelected,
    onSelect,
    formatDate,
    shortenAddress,
}: {
    application: Application;
    isSelected: boolean;
    onSelect: () => void;
    formatDate: (t: bigint) => string;
    shortenAddress: (a: string) => string;
}) {
    const { data: rating } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getFreelancerAverageRating',
        args: [application.freelancer as `0x${string}`],
    }) as { data: [bigint, bigint] | undefined };

    const avgRating = rating ? Number(rating[0]) / 100 : 0;
    const ratingCount = rating ? Number(rating[1]) : 0;

    return (
        <div
            onClick={onSelect}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                    ? 'border-green-500 bg-green-50'
                    : application.isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                }`}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="font-mono text-sm">{shortenAddress(application.freelancer)}</span>
                    {application.isSelected && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                            Đã chọn
                        </span>
                    )}
                </div>
                {ratingCount > 0 && (
                    <div className="flex items-center text-sm">
                        <span className="text-yellow-500">⭐</span>
                        <span className="ml-1">{avgRating.toFixed(1)}</span>
                        <span className="text-gray-400 ml-1">({ratingCount})</span>
                    </div>
                )}
            </div>
            <p className="text-sm text-gray-600 mb-2">{application.proposal || 'Không có proposal'}</p>
            <p className="text-xs text-gray-400">Ứng tuyển: {formatDate(application.appliedAt)}</p>
        </div>
    );
}

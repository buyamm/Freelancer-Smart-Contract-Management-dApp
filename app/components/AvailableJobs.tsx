'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_STATES } from '../config/contract';
import { formatEther } from 'viem';
import JobDetailModal from './JobDetailModal';

interface Job {
    id: bigint;
    client: string;
    freelancer: string;
    title: string;
    description: string;
    payment: bigint;
    deadline: bigint;
    state: number;
    ipfsHash: string;
    createdAt: bigint;
    submittedAt: bigint;
    rejectionCount: bigint;
    penaltyAmount: bigint;
}

export default function AvailableJobs() {
    const { address } = useAccount();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [availableJobs, setAvailableJobs] = useState<Job[]>([]);

    // Lấy tổng số jobs
    const { data: jobCounter } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'jobCounter',
    });

    // Fetch tất cả jobs và filter những job đang mở (state = Funded)
    useEffect(() => {
        const fetchJobs = async () => {
            if (!jobCounter || Number(jobCounter) === 0) return;

            const jobs: Job[] = [];
            // Tạo array các job IDs để fetch
            for (let i = 1; i <= Number(jobCounter); i++) {
                jobs.push({ id: BigInt(i) } as Job);
            }
            setAvailableJobs(jobs);
        };

        fetchJobs();
    }, [jobCounter]);

    const formatDeadline = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return 'Đã hết hạn';
        if (diffDays === 0) return 'Hôm nay';
        if (diffDays === 1) return 'Ngày mai';
        return `${diffDays} ngày`;
    };

    if (!address) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Vui lòng kết nối ví để xem việc có sẵn</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">🔍 Việc đang tuyển</h2>
                <span className="text-sm text-gray-500">
                    {jobCounter ? `${Number(jobCounter)} việc` : 'Đang tải...'}
                </span>
            </div>

            {Number(jobCounter) === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-4">📭</div>
                    <p className="text-gray-600">Chưa có việc nào được đăng</p>
                    <p className="text-sm text-gray-500 mt-2">Hãy quay lại sau hoặc tạo việc mới</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {availableJobs.map((job) => (
                        <JobCard
                            key={job.id.toString()}
                            jobId={job.id}
                            currentAddress={address}
                            onViewDetail={setSelectedJob}
                        />
                    ))}
                </div>
            )}

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    userRole="freelancer"
                />
            )}
        </div>
    );
}

function JobCard({
    jobId,
    currentAddress,
    onViewDetail
}: {
    jobId: bigint;
    currentAddress: string;
    onViewDetail: (job: Job) => void;
}) {
    const { data: job } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJob',
        args: [jobId],
    }) as { data: Job | undefined };

    // Chỉ hiển thị jobs đang mở (state = 1 = Funded) và không phải của mình
    if (!job || job.state !== 1 || job.client.toLowerCase() === currentAddress.toLowerCase()) {
        return null;
    }

    const formatDeadline = (timestamp: bigint) => {
        const date = new Date(Number(timestamp) * 1000);
        const now = new Date();
        const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: 'Đã hết hạn', color: 'text-red-600' };
        if (diffDays === 0) return { text: 'Hôm nay', color: 'text-orange-600' };
        if (diffDays === 1) return { text: 'Ngày mai', color: 'text-yellow-600' };
        if (diffDays <= 7) return { text: `${diffDays} ngày`, color: 'text-blue-600' };
        return { text: `${diffDays} ngày`, color: 'text-green-600' };
    };

    const deadline = formatDeadline(job.deadline);

    return (
        <div className="card hover:shadow-lg transition-all border-l-4 border-l-blue-500">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gray-500">
                        Client: {job.client.slice(0, 6)}...{job.client.slice(-4)}
                    </p>
                </div>
                <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                        {formatEther(job.payment)} ETH
                    </div>
                    <div className={`text-sm ${deadline.color}`}>
                        ⏰ {deadline.text}
                    </div>
                </div>
            </div>

            <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>

            <div className="flex justify-between items-center">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                    Đang tuyển
                </span>
                <button
                    onClick={() => onViewDetail(job)}
                    className="btn-primary text-sm"
                >
                    Xem & Nhận việc →
                </button>
            </div>
        </div>
    );
}
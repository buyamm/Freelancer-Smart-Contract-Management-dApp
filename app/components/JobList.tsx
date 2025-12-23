'use client';

import { useState } from 'react';
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

interface JobListProps {
    userRole: 'client' | 'freelancer';
}

export default function JobList({ userRole }: JobListProps) {
    const { address } = useAccount();
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);

    const { data: jobIds } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: userRole === 'client' ? 'getClientJobs' : 'getFreelancerJobs',
        args: [address as `0x${string}`],
        enabled: !!address,
    });

    if (!address) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Vui lòng kết nối ví để xem danh sách hợp đồng</p>
            </div>
        );
    }

    if (!jobIds || (jobIds as bigint[]).length === 0) {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">
                    {userRole === 'client' && '📝'}
                    {userRole === 'freelancer' && '💼'}
                </div>
                <p className="text-gray-600">
                    {userRole === 'client' && 'Bạn chưa tạo hợp đồng nào'}
                    {userRole === 'freelancer' && 'Bạn chưa nhận hợp đồng nào'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                    {userRole === 'client' && 'Tạo hợp đồng mới để bắt đầu'}
                    {userRole === 'freelancer' && 'Xem việc có sẵn để nhận việc'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">
                    {userRole === 'client' && '📋 Hợp đồng đã tạo'}
                    {userRole === 'freelancer' && '💼 Hợp đồng đang thực hiện'}
                </h2>
                <span className="text-sm text-gray-500">
                    {(jobIds as bigint[]).length} hợp đồng
                </span>
            </div>

            <div className="grid gap-4">
                {(jobIds as bigint[]).map((jobId) => (
                    <JobCard
                        key={jobId.toString()}
                        jobId={jobId}
                        userRole={userRole}
                        onViewDetail={setSelectedJob}
                    />
                ))}
            </div>

            {selectedJob && (
                <JobDetailModal
                    job={selectedJob}
                    onClose={() => setSelectedJob(null)}
                    userRole={userRole}
                />
            )}
        </div>
    );
}

function JobCard({
    jobId,
    userRole,
    onViewDetail
}: {
    jobId: bigint;
    userRole: 'client' | 'freelancer' | 'arbiter';
    onViewDetail: (job: Job) => void;
}) {
    const { data: job } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJob',
        args: [jobId],
    }) as { data: Job | undefined };

    const formatDeadline = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString('vi-VN');
    };

    const getStateColor = (state: number) => {
        const colors: Record<number, string> = {
            0: 'bg-yellow-100 text-yellow-800',
            1: 'bg-blue-100 text-blue-800',
            2: 'bg-purple-100 text-purple-800',
            3: 'bg-orange-100 text-orange-800',
            4: 'bg-green-100 text-green-800',
            5: 'bg-red-100 text-red-800',
            6: 'bg-red-100 text-red-800',
        };
        return colors[state] || 'bg-gray-100 text-gray-800';
    };

    const getActionButton = () => {
        if (!job) return null;

        if (userRole === 'client') {
            if (job.state === 3) return { text: '✅ Duyệt công việc', highlight: true };
            if (job.state === 1) return { text: '⏳ Đang chờ freelancer', highlight: false };
        }
        if (userRole === 'freelancer') {
            if (job.state === 2) return { text: '📤 Nộp kết quả', highlight: true };
            if (job.state === 3) return { text: '⏳ Đang chờ duyệt', highlight: false };
        }
        if (userRole === 'arbiter') {
            if (job.state === 6) return { text: '⚖️ Giải quyết', highlight: true };
        }
        return null;
    };

    if (!job) return <div className="card animate-pulse h-32 bg-gray-200"></div>;

    const actionButton = getActionButton();

    return (
        <div className="card hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStateColor(job.state)}`}>
                    {CONTRACT_STATES[job.state as keyof typeof CONTRACT_STATES]}
                </span>
            </div>

            <p className="text-gray-600 mb-3 line-clamp-2">{job.description}</p>

            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="text-gray-500">Thanh toán:</span>
                    <span className="ml-2 font-medium text-green-600">{formatEther(job.payment)} ETH</span>
                </div>
                <div>
                    <span className="text-gray-500">Deadline:</span>
                    <span className="ml-2">{formatDeadline(job.deadline)}</span>
                </div>
                {job.freelancer !== '0x0000000000000000000000000000000000000000' && (
                    <div className="col-span-2">
                        <span className="text-gray-500">Freelancer:</span>
                        <span className="ml-2 font-mono text-xs">
                            {`${job.freelancer.slice(0, 6)}...${job.freelancer.slice(-4)}`}
                        </span>
                    </div>
                )}
            </div>

            <div className="mt-4 flex space-x-2">
                <button
                    onClick={() => onViewDetail(job)}
                    className="btn-primary text-sm"
                >
                    Xem chi tiết
                </button>
                {actionButton && (
                    <button
                        onClick={() => onViewDetail(job)}
                        className={`text-sm px-4 py-2 rounded-lg ${actionButton.highlight
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-gray-200 text-gray-700'
                            }`}
                    >
                        {actionButton.text}
                    </button>
                )}
            </div>
        </div>
    );
}
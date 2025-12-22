'use client';

import { useState, useEffect } from 'react';
import { useAccount, useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CONTRACT_STATES } from '../config/contract';
import { formatEther } from 'viem';

interface Job {
    id: bigint;
    client: string;
    freelancer: string;
    arbiter: string;
    title: string;
    description: string;
    payment: bigint;
    deadline: bigint;
    state: number;
    ipfsHash: string;
    createdAt: bigint;
    submittedAt: bigint;
}

interface JobListProps {
    userRole: 'client' | 'freelancer' | 'arbiter';
}

export default function JobList({ userRole }: JobListProps) {
    const { address } = useAccount();
    const [jobs, setJobs] = useState<Job[]>([]);

    const { data: jobIds } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: userRole === 'client' ? 'getClientJobs' :
            userRole === 'freelancer' ? 'getFreelancerJobs' :
                'getArbiterJobs',
        args: [address],
        enabled: !!address,
    });

    const formatDeadline = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleDateString('vi-VN');
    };

    const getStateColor = (state: number) => {
        const colors = {
            0: 'bg-yellow-100 text-yellow-800', // Pending
            1: 'bg-blue-100 text-blue-800',     // Funded
            2: 'bg-purple-100 text-purple-800', // InProgress
            3: 'bg-orange-100 text-orange-800', // Submitted
            4: 'bg-green-100 text-green-800',   // Completed
            5: 'bg-red-100 text-red-800',       // Canceled
            6: 'bg-red-100 text-red-800',       // Disputed
        };
        return colors[state as keyof typeof colors] || 'bg-gray-100 text-gray-800';
    };

    if (!address) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">Vui lòng kết nối ví để xem danh sách hợp đồng</p>
            </div>
        );
    }

    if (!jobIds || jobIds.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600">
                    {userRole === 'client' && 'Bạn chưa tạo hợp đồng nào'}
                    {userRole === 'freelancer' && 'Bạn chưa nhận hợp đồng nào'}
                    {userRole === 'arbiter' && 'Chưa có hợp đồng tranh chấp nào'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">
                {userRole === 'client' && 'Hợp đồng đã tạo'}
                {userRole === 'freelancer' && 'Hợp đồng đang thực hiện'}
                {userRole === 'arbiter' && 'Hợp đồng tranh chấp'}
            </h2>

            <div className="grid gap-4">
                {(jobIds as bigint[]).map((jobId) => (
                    <JobCard key={jobId.toString()} jobId={jobId} userRole={userRole} />
                ))}
            </div>
        </div>
    );
}

function JobCard({ jobId, userRole }: { jobId: bigint; userRole: string }) {
    const { data: job } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJob',
        args: [jobId],
    }) as { data: Job | undefined };

    if (!job) return <div className="card animate-pulse h-32 bg-gray-200"></div>;

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
                    <span className="ml-2 font-medium">{formatEther(job.payment)} ETH</span>
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
                <button className="btn-primary text-sm">
                    Xem chi tiết
                </button>
                {userRole === 'client' && job.state === 3 && (
                    <button className="btn-secondary text-sm">
                        Duyệt công việc
                    </button>
                )}
                {userRole === 'freelancer' && job.state === 2 && (
                    <button className="btn-secondary text-sm">
                        Nộp kết quả
                    </button>
                )}
            </div>
        </div>
    );
}

function getStateColor(state: number) {
    const colors = {
        0: 'bg-yellow-100 text-yellow-800',
        1: 'bg-blue-100 text-blue-800',
        2: 'bg-purple-100 text-purple-800',
        3: 'bg-orange-100 text-orange-800',
        4: 'bg-green-100 text-green-800',
        5: 'bg-red-100 text-red-800',
        6: 'bg-red-100 text-red-800',
    };
    return colors[state as keyof typeof colors] || 'bg-gray-100 text-gray-800';
}
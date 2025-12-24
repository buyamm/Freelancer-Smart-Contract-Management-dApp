'use client';

import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

interface Submission {
    ipfsHash: string;
    submittedAt: bigint;
    comment: string;
}

interface SubmissionHistoryProps {
    jobId: bigint;
}

export default function SubmissionHistory({ jobId }: SubmissionHistoryProps) {
    const { data: submissions } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJobSubmissions',
        args: [jobId],
        watch: true,
    }) as { data: Submission[] | undefined };

    const formatDate = (timestamp: bigint) => {
        return new Date(Number(timestamp) * 1000).toLocaleString('vi-VN');
    };

    if (!submissions || submissions.length === 0) {
        return null;
    }

    return (
        <div className="space-y-3">
            <h4 className="font-semibold text-gray-700">
                📜 Lịch sử nộp bài ({submissions.length} lần)
            </h4>
            <div className="space-y-2 max-h-60 overflow-y-auto">
                {submissions.map((sub, index) => (
                    <div
                        key={index}
                        className={`p-3 rounded-lg border ${index === submissions.length - 1
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium">
                                {index === submissions.length - 1 ? '🆕 Mới nhất' : `#${index + 1}`}
                            </span>
                            <span className="text-xs text-gray-500">{formatDate(sub.submittedAt)}</span>
                        </div>
                        {sub.comment && (
                            <p className="text-sm text-gray-600 mb-2 italic">"{sub.comment}"</p>
                        )}
                        <a
                            href={`https://gateway.pinata.cloud/ipfs/${sub.ipfsHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm break-all"
                        >
                            📎 {sub.ipfsHash.slice(0, 20)}...
                        </a>
                    </div>
                ))}
            </div>
        </div>
    );
}

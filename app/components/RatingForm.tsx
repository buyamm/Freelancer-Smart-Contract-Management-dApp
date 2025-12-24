'use client';

import { useState, useEffect } from 'react';
import { useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

interface Rating {
    score: number;
    comment: string;
    ratedAt: bigint;
}

interface RatingFormProps {
    jobId: bigint;
    freelancerAddress: string;
    isClient: boolean;
    onSuccess?: () => void;
}

export default function RatingForm({ jobId, freelancerAddress, isClient, onSuccess }: RatingFormProps) {
    const [score, setScore] = useState(5);
    const [comment, setComment] = useState('');
    const [hoveredStar, setHoveredStar] = useState(0);

    const { data: existingRating } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getJobRating',
        args: [jobId],
        watch: true,
    }) as { data: Rating | undefined };

    const { data: freelancerRating } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getFreelancerAverageRating',
        args: [freelancerAddress as `0x${string}`],
    }) as { data: [bigint, bigint] | undefined };

    const { config } = usePrepareContractWrite({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'rateFreelancer',
        args: [jobId, score, comment],
        enabled: isClient && (!existingRating || existingRating.ratedAt === BigInt(0)),
    });
    const { write: rateFreelancer, data } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({ hash: data?.hash });

    useEffect(() => {
        if (isSuccess) onSuccess?.();
    }, [isSuccess, onSuccess]);

    const hasRated = existingRating && existingRating.ratedAt > BigInt(0);
    const avgRating = freelancerRating ? Number(freelancerRating[0]) / 100 : 0;
    const ratingCount = freelancerRating ? Number(freelancerRating[1]) : 0;

    const renderStars = (rating: number, interactive = false) => {
        return (
            <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        disabled={!interactive}
                        onClick={() => interactive && setScore(star)}
                        onMouseEnter={() => interactive && setHoveredStar(star)}
                        onMouseLeave={() => interactive && setHoveredStar(0)}
                        className={`text-2xl transition-transform ${interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default'
                            }`}
                    >
                        {star <= (interactive ? (hoveredStar || score) : rating) ? '⭐' : '☆'}
                    </button>
                ))}
            </div>
        );
    };

    // Hiển thị đánh giá đã có
    if (hasRated) {
        return (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-2">⭐ Đánh giá</h4>
                <div className="flex items-center mb-2">
                    {renderStars(existingRating.score)}
                    <span className="ml-2 font-bold">{existingRating.score}/5</span>
                </div>
                {existingRating.comment && (
                    <p className="text-sm text-yellow-800 italic">"{existingRating.comment}"</p>
                )}
                {ratingCount > 0 && (
                    <p className="text-xs text-yellow-700 mt-2">
                        Freelancer có điểm trung bình: {avgRating.toFixed(1)}/5 ({ratingCount} đánh giá)
                    </p>
                )}
            </div>
        );
    }

    // Form đánh giá cho client
    if (isClient) {
        return (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-900 mb-3">⭐ Đánh giá Freelancer</h4>
                <div className="space-y-3">
                    <div>
                        <label className="text-sm text-yellow-800 mb-1 block">Điểm số</label>
                        {renderStars(score, true)}
                    </div>
                    <div>
                        <label className="text-sm text-yellow-800 mb-1 block">Nhận xét (tùy chọn)</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Nhận xét về freelancer..."
                            className="input w-full text-sm"
                            rows={2}
                        />
                    </div>
                    <button
                        onClick={() => rateFreelancer?.()}
                        disabled={isLoading || !rateFreelancer}
                        className="btn-primary w-full disabled:opacity-50"
                    >
                        {isLoading ? '⏳ Đang gửi...' : '📝 Gửi đánh giá'}
                    </button>
                </div>
            </div>
        );
    }

    // Hiển thị rating trung bình cho freelancer
    if (ratingCount > 0) {
        return (
            <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center">
                    <span className="text-yellow-500 text-xl">⭐</span>
                    <span className="ml-1 font-bold">{avgRating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({ratingCount} đánh giá)</span>
                </div>
            </div>
        );
    }

    return null;
}

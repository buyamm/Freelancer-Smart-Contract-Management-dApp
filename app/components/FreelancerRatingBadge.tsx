'use client';

import { useContractRead } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../config/contract';

interface FreelancerRatingBadgeProps {
    address: string;
    showCount?: boolean;
}

export default function FreelancerRatingBadge({ address, showCount = true }: FreelancerRatingBadgeProps) {
    const { data: rating } = useContractRead({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'getFreelancerAverageRating',
        args: [address as `0x${string}`],
        watch: true,
    }) as { data: [bigint, bigint] | undefined };

    const avgRating = rating ? Number(rating[0]) / 100 : 0;
    const ratingCount = rating ? Number(rating[1]) : 0;

    if (ratingCount === 0) {
        return (
            <div className="flex items-center text-gray-400 text-sm">
                <span>☆</span>
                <span className="ml-1">Chưa có đánh giá</span>
            </div>
        );
    }

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <span key={i} className={i <= Math.round(avgRating) ? 'text-yellow-500' : 'text-gray-300'}>
                    {i <= Math.round(avgRating) ? '⭐' : '☆'}
                </span>
            );
        }
        return stars;
    };

    return (
        <div className="flex items-center bg-yellow-50 px-3 py-1.5 rounded-full">
            <div className="flex">{renderStars()}</div>
            <span className="ml-2 font-bold text-yellow-800">{avgRating.toFixed(1)}</span>
            {showCount && (
                <span className="ml-1 text-yellow-600 text-sm">({ratingCount} đánh giá)</span>
            )}
        </div>
    );
}

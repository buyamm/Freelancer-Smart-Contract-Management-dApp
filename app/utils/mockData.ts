// Mock data for testing without blockchain connection
export interface MockJob {
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

export const CONTRACT_STATES = {
    0: 'Đang chờ',
    1: 'Đã thanh toán',
    2: 'Đang thực hiện',
    3: 'Đã nộp',
    4: 'Hoàn thành',
    5: 'Đã hủy',
    6: 'Tranh chấp'
};

// Mock wallet addresses
export const MOCK_ADDRESSES = {
    client1: '0x1234567890123456789012345678901234567890',
    client2: '0x2345678901234567890123456789012345678901',
    freelancer1: '0x3456789012345678901234567890123456789012',
    freelancer2: '0x4567890123456789012345678901234567890123',
    arbiter1: '0x5678901234567890123456789012345678901234',
    arbiter2: '0x6789012345678901234567890123456789012345'
};

// Mock jobs data
export const MOCK_JOBS: MockJob[] = [
    {
        id: BigInt(1),
        client: MOCK_ADDRESSES.client1,
        freelancer: MOCK_ADDRESSES.freelancer1,
        arbiter: MOCK_ADDRESSES.arbiter1,
        title: 'Phát triển website React cho startup',
        description: 'Cần phát triển một website React hiện đại với responsive design, tích hợp API và có dashboard quản trị. Yêu cầu sử dụng TypeScript, Tailwind CSS và Next.js.',
        payment: BigInt('500000000000000000'), // 0.5 ETH
        deadline: BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60), // 7 days from now
        state: 2, // InProgress
        ipfsHash: '',
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60), // 2 days ago
        submittedAt: BigInt(0)
    },
    {
        id: BigInt(2),
        client: MOCK_ADDRESSES.client1,
        freelancer: '0x0000000000000000000000000000000000000000',
        arbiter: MOCK_ADDRESSES.arbiter1,
        title: 'Thiết kế logo và branding',
        description: 'Thiết kế logo chuyên nghiệp và bộ nhận diện thương hiệu hoàn chỉnh cho công ty công nghệ. Bao gồm logo, business card, letterhead và style guide.',
        payment: BigInt('200000000000000000'), // 0.2 ETH
        deadline: BigInt(Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60), // 5 days from now
        state: 1, // Funded
        ipfsHash: '',
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 1 * 24 * 60 * 60), // 1 day ago
        submittedAt: BigInt(0)
    },
    {
        id: BigInt(3),
        client: MOCK_ADDRESSES.client2,
        freelancer: MOCK_ADDRESSES.freelancer1,
        arbiter: MOCK_ADDRESSES.arbiter1,
        title: 'Viết content marketing cho blog',
        description: 'Viết 10 bài blog về công nghệ blockchain và cryptocurrency, mỗi bài từ 1500-2000 từ. Nội dung phải chuyên sâu, dễ hiểu và SEO-friendly.',
        payment: BigInt('300000000000000000'), // 0.3 ETH
        deadline: BigInt(Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60), // 14 days from now
        state: 3, // Submitted
        ipfsHash: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60), // 10 days ago
        submittedAt: BigInt(Math.floor(Date.now() / 1000) - 1 * 60 * 60) // 1 hour ago
    },
    {
        id: BigInt(4),
        client: MOCK_ADDRESSES.client1,
        freelancer: MOCK_ADDRESSES.freelancer2,
        arbiter: MOCK_ADDRESSES.arbiter2,
        title: 'Phát triển mobile app Flutter',
        description: 'Phát triển ứng dụng mobile đa nền tảng bằng Flutter cho việc quản lý tài chính cá nhân. Tích hợp với API ngân hàng và có tính năng báo cáo chi tiết.',
        payment: BigInt('1000000000000000000'), // 1 ETH
        deadline: BigInt(Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60), // 30 days from now
        state: 4, // Completed
        ipfsHash: 'QmPChd2hVbrJ1bfo2WecTSUby8ELGOxkY5dHoKDKXqKGBp',
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 45 * 24 * 60 * 60), // 45 days ago
        submittedAt: BigInt(Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60) // 5 days ago
    },
    {
        id: BigInt(5),
        client: MOCK_ADDRESSES.client2,
        freelancer: MOCK_ADDRESSES.freelancer1,
        arbiter: MOCK_ADDRESSES.arbiter1,
        title: 'Audit smart contract Solidity',
        description: 'Thực hiện audit bảo mật cho smart contract DeFi. Kiểm tra các lỗ hổng bảo mật, tối ưu gas và đưa ra báo cáo chi tiết với khuyến nghị.',
        payment: BigInt('800000000000000000'), // 0.8 ETH
        deadline: BigInt(Math.floor(Date.now() / 1000) + 10 * 24 * 60 * 60), // 10 days from now
        state: 6, // Disputed
        ipfsHash: 'QmNLei78zWmzUdbeRB3CiUfAizWUrbeeZh5K1rhAQKCh51',
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 20 * 24 * 60 * 60), // 20 days ago
        submittedAt: BigInt(Math.floor(Date.now() / 1000) - 3 * 24 * 60 * 60) // 3 days ago
    },
    {
        id: BigInt(6),
        client: MOCK_ADDRESSES.client1,
        freelancer: '0x0000000000000000000000000000000000000000',
        arbiter: MOCK_ADDRESSES.arbiter2,
        title: 'Tạo video explainer animation',
        description: 'Tạo video animation 2-3 phút giải thích về sản phẩm fintech. Phong cách hiện đại, màu sắc tươi sáng và có voice-over tiếng Việt chuyên nghiệp.',
        payment: BigInt('400000000000000000'), // 0.4 ETH
        deadline: BigInt(Math.floor(Date.now() / 1000) + 12 * 24 * 60 * 60), // 12 days from now
        state: 1, // Funded
        ipfsHash: '',
        createdAt: BigInt(Math.floor(Date.now() / 1000) - 3 * 60 * 60), // 3 hours ago
        submittedAt: BigInt(0)
    }
];

// Mock service class
export class MockFreelancerService {
    private jobs: MockJob[] = [...MOCK_JOBS];
    private currentUser: string = MOCK_ADDRESSES.client1; // Default user

    setCurrentUser(address: string) {
        this.currentUser = address;
    }

    getCurrentUser(): string {
        return this.currentUser;
    }

    // Get jobs for current user based on role
    getJobsByRole(role: 'client' | 'freelancer' | 'arbiter'): MockJob[] {
        switch (role) {
            case 'client':
                return this.jobs.filter(job => job.client.toLowerCase() === this.currentUser.toLowerCase());
            case 'freelancer':
                return this.jobs.filter(job => job.freelancer.toLowerCase() === this.currentUser.toLowerCase());
            case 'arbiter':
                return this.jobs.filter(job =>
                    job.arbiter.toLowerCase() === this.currentUser.toLowerCase() &&
                    job.state === 6 // Only disputed jobs for arbiters
                );
            default:
                return [];
        }
    }

    // Get all available jobs (for freelancers to browse)
    getAvailableJobs(): MockJob[] {
        return this.jobs.filter(job =>
            job.state === 1 && // Funded
            job.freelancer === '0x0000000000000000000000000000000000000000'
        );
    }

    // Get job by ID
    getJob(jobId: bigint): MockJob | undefined {
        return this.jobs.find(job => job.id === jobId);
    }

    // Create new job
    createJob(jobData: {
        title: string;
        description: string;
        payment: string;
        deadline: string;
        arbiter: string;
    }): MockJob {
        const newJob: MockJob = {
            id: BigInt(this.jobs.length + 1),
            client: this.currentUser,
            freelancer: '0x0000000000000000000000000000000000000000',
            arbiter: jobData.arbiter,
            title: jobData.title,
            description: jobData.description,
            payment: BigInt(Math.floor(parseFloat(jobData.payment) * 1e18)), // Convert ETH to wei
            deadline: BigInt(Math.floor(new Date(jobData.deadline).getTime() / 1000)),
            state: 1, // Funded
            ipfsHash: '',
            createdAt: BigInt(Math.floor(Date.now() / 1000)),
            submittedAt: BigInt(0)
        };

        this.jobs.push(newJob);
        return newJob;
    }

    // Accept job (for freelancers)
    acceptJob(jobId: bigint): boolean {
        const job = this.jobs.find(j => j.id === jobId);
        if (job && job.state === 1 && job.freelancer === '0x0000000000000000000000000000000000000000') {
            job.freelancer = this.currentUser;
            job.state = 2; // InProgress
            return true;
        }
        return false;
    }

    // Submit work
    submitWork(jobId: bigint, ipfsHash: string): boolean {
        const job = this.jobs.find(j => j.id === jobId);
        if (job && job.state === 2 && job.freelancer.toLowerCase() === this.currentUser.toLowerCase()) {
            job.ipfsHash = ipfsHash;
            job.state = 3; // Submitted
            job.submittedAt = BigInt(Math.floor(Date.now() / 1000));
            return true;
        }
        return false;
    }

    // Approve work
    approveWork(jobId: bigint): boolean {
        const job = this.jobs.find(j => j.id === jobId);
        if (job && job.state === 3 && job.client.toLowerCase() === this.currentUser.toLowerCase()) {
            job.state = 4; // Completed
            return true;
        }
        return false;
    }

    // Cancel job
    cancelJob(jobId: bigint): boolean {
        const job = this.jobs.find(j => j.id === jobId);
        if (job && job.client.toLowerCase() === this.currentUser.toLowerCase() &&
            (job.state === 1 || (job.state === 2 && Date.now() / 1000 > Number(job.deadline)))) {
            job.state = 5; // Canceled
            return true;
        }
        return false;
    }

    // Open dispute
    openDispute(jobId: bigint): boolean {
        const job = this.jobs.find(j => j.id === jobId);
        if (job && (job.state === 2 || job.state === 3) &&
            (job.client.toLowerCase() === this.currentUser.toLowerCase() ||
                job.freelancer.toLowerCase() === this.currentUser.toLowerCase())) {
            job.state = 6; // Disputed
            return true;
        }
        return false;
    }

    // Get user stats
    getUserStats(role: 'client' | 'freelancer' | 'arbiter') {
        const userJobs = this.getJobsByRole(role);
        const completedJobs = userJobs.filter(job => job.state === 4);

        let totalEarnings = BigInt(0);
        if (role === 'freelancer') {
            completedJobs.forEach(job => {
                totalEarnings += job.payment;
            });
        } else if (role === 'client') {
            completedJobs.forEach(job => {
                totalEarnings += job.payment;
            });
        }

        return {
            completedJobs: completedJobs.length,
            totalEarnings,
            rating: completedJobs.length > 0 ? 4.5 : 0 // Mock rating
        };
    }
}

// Export singleton instance
export const mockService = new MockFreelancerService();

// Helper function to check if we're in mock mode
export const isMockMode = () => {
    return process.env.NODE_ENV === 'development' ||
        typeof window !== 'undefined' && window.location.hostname === 'localhost';
};
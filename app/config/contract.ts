export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x1234567890123456789012345678901234567890';

export const CONTRACT_ABI = [
    // Events
    "event ContractCreated(uint256 indexed jobId, address indexed client, string title, uint256 payment)",
    "event ContractFunded(uint256 indexed jobId, address indexed client, uint256 amount)",
    "event ContractAccepted(uint256 indexed jobId, address indexed freelancer)",
    "event ContractSubmitted(uint256 indexed jobId, string ipfsHash)",
    "event ContractApproved(uint256 indexed jobId, address indexed client)",
    "event ContractCanceled(uint256 indexed jobId, string reason)",
    "event DisputeOpened(uint256 indexed jobId, address indexed opener)",
    "event DisputeResolved(uint256 indexed jobId, address indexed arbiter, uint256 clientAmount, uint256 freelancerAmount)",

    // Read functions
    "function jobs(uint256) view returns (uint256 id, address client, address freelancer, address arbiter, string title, string description, uint256 payment, uint256 deadline, uint8 state, string ipfsHash, uint256 createdAt, uint256 submittedAt)",
    "function getJob(uint256 _jobId) view returns (tuple(uint256 id, address client, address freelancer, address arbiter, string title, string description, uint256 payment, uint256 deadline, uint8 state, string ipfsHash, uint256 createdAt, uint256 submittedAt))",
    "function getClientJobs(address _client) view returns (uint256[])",
    "function getFreelancerJobs(address _freelancer) view returns (uint256[])",
    "function getArbiterJobs(address _arbiter) view returns (uint256[])",
    "function isDeadlinePassed(uint256 _jobId) view returns (bool)",
    "function jobCounter() view returns (uint256)",

    // Write functions
    "function createJob(string _title, string _description, uint256 _deadline, address _arbiter) payable",
    "function acceptJob(uint256 _jobId)",
    "function submitWork(uint256 _jobId, string _ipfsHash)",
    "function approveWork(uint256 _jobId)",
    "function cancelJob(uint256 _jobId, string _reason)",
    "function openDispute(uint256 _jobId)",
    "function resolveDispute(uint256 _jobId, uint256 _clientPercentage)"
];

export const CONTRACT_STATES = {
    0: 'Pending',
    1: 'Funded',
    2: 'InProgress',
    3: 'Submitted',
    4: 'Completed',
    5: 'Canceled',
    6: 'Disputed'
} as const;
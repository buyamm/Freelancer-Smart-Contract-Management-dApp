export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "OwnableInvalidOwner",
    "type": "error"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "OwnableUnauthorizedAccount",
    "type": "error"
  },
  { "inputs": [], "name": "ReentrancyGuardReentrantCall", "type": "error" },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "finalPayment", "type": "uint256" }
    ],
    "name": "AutoApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "internalType": "address", "name": "user", "type": "address" }],
    "name": "ContactInfoUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "freelancer", "type": "address" }
    ],
    "name": "ContractAccepted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "client", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "finalPayment", "type": "uint256" }
    ],
    "name": "ContractApproved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "ContractCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "client", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "title", "type": "string" },
      { "indexed": false, "internalType": "uint256", "name": "payment", "type": "uint256" }
    ],
    "name": "ContractCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "client", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "ContractFunded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "reason", "type": "string" }
    ],
    "name": "ContractRejected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "ipfsHash", "type": "string" },
      { "indexed": false, "internalType": "bool", "name": "isLate", "type": "bool" },
      { "indexed": false, "internalType": "uint256", "name": "submissionIndex", "type": "uint256" }
    ],
    "name": "ContractSubmitted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "newDeadline", "type": "uint256" }
    ],
    "name": "DeadlineExtended",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "freelancer", "type": "address" },
      { "indexed": false, "internalType": "string", "name": "proposal", "type": "string" }
    ],
    "name": "FreelancerApplied",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "freelancer", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "score", "type": "uint8" },
      { "indexed": false, "internalType": "string", "name": "comment", "type": "string" }
    ],
    "name": "FreelancerRated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{ "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" }],
    "name": "FreelancerRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "jobId", "type": "uint256" },
      { "indexed": true, "internalType": "address", "name": "freelancer", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "client", "type": "address" }
    ],
    "name": "FreelancerSelected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" },
      { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }
    ],
    "name": "OwnershipTransferred",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "AUTO_APPROVE_DAYS",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "PENALTY_RATE",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "acceptJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "string", "name": "_proposal", "type": "string" }
    ],
    "name": "applyForJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "approveWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "autoApproveWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "canAutoApprove",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "string", "name": "_reason", "type": "string" }
    ],
    "name": "cancelJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_title", "type": "string" },
      { "internalType": "string", "name": "_description", "type": "string" },
      { "internalType": "uint256", "name": "_deadline", "type": "uint256" }
    ],
    "name": "createJob",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "uint256", "name": "_newDeadline", "type": "uint256" }
    ],
    "name": "extendDeadline",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "getApplicationCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_client", "type": "address" }],
    "name": "getClientJobs",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_user", "type": "address" }],
    "name": "getContactInfo",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "email", "type": "string" },
          { "internalType": "string", "name": "phone", "type": "string" },
          { "internalType": "string", "name": "chatLink", "type": "string" }
        ],
        "internalType": "struct FreelancerContract.ContactInfo",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_freelancer", "type": "address" }],
    "name": "getFreelancerAverageRating",
    "outputs": [
      { "internalType": "uint256", "name": "average", "type": "uint256" },
      { "internalType": "uint256", "name": "count", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_freelancer", "type": "address" }],
    "name": "getFreelancerJobs",
    "outputs": [{ "internalType": "uint256[]", "name": "", "type": "uint256[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "getJob",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "id", "type": "uint256" },
          { "internalType": "address", "name": "client", "type": "address" },
          { "internalType": "address", "name": "freelancer", "type": "address" },
          { "internalType": "string", "name": "title", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "payment", "type": "uint256" },
          { "internalType": "uint256", "name": "deadline", "type": "uint256" },
          { "internalType": "enum FreelancerContract.ContractState", "name": "state", "type": "uint8" },
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "submittedAt", "type": "uint256" },
          { "internalType": "uint256", "name": "rejectionCount", "type": "uint256" },
          { "internalType": "uint256", "name": "penaltyAmount", "type": "uint256" }
        ],
        "internalType": "struct FreelancerContract.Job",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "getJobApplications",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "freelancer", "type": "address" },
          { "internalType": "string", "name": "proposal", "type": "string" },
          { "internalType": "uint256", "name": "appliedAt", "type": "uint256" },
          { "internalType": "bool", "name": "isSelected", "type": "bool" }
        ],
        "internalType": "struct FreelancerContract.Application[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "getJobRating",
    "outputs": [
      {
        "components": [
          { "internalType": "uint8", "name": "score", "type": "uint8" },
          { "internalType": "string", "name": "comment", "type": "string" },
          { "internalType": "uint256", "name": "ratedAt", "type": "uint256" }
        ],
        "internalType": "struct FreelancerContract.Rating",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "getJobSubmissions",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "ipfsHash", "type": "string" },
          { "internalType": "uint256", "name": "submittedAt", "type": "uint256" },
          { "internalType": "string", "name": "comment", "type": "string" }
        ],
        "internalType": "struct FreelancerContract.Submission[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "getPenaltyAmount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "getSubmissionCount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "address", "name": "_freelancer", "type": "address" }
    ],
    "name": "hasFreelancerApplied",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "isDeadlinePassed",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "jobCounter",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "uint8", "name": "_score", "type": "uint8" },
      { "internalType": "string", "name": "_comment", "type": "string" }
    ],
    "name": "rateFreelancer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "string", "name": "_reason", "type": "string" }
    ],
    "name": "rejectWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_jobId", "type": "uint256" }],
    "name": "removeFreelancer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "renounceOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "address", "name": "_freelancer", "type": "address" }
    ],
    "name": "selectFreelancer",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "string", "name": "_ipfsHash", "type": "string" }
    ],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_jobId", "type": "uint256" },
      { "internalType": "string", "name": "_ipfsHash", "type": "string" },
      { "internalType": "string", "name": "_comment", "type": "string" }
    ],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }],
    "name": "transferOwnership",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "string", "name": "_name", "type": "string" },
      { "internalType": "string", "name": "_email", "type": "string" },
      { "internalType": "string", "name": "_phone", "type": "string" },
      { "internalType": "string", "name": "_chatLink", "type": "string" }
    ],
    "name": "updateContactInfo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

export const CONTRACT_STATES = {
  0: 'Pending',
  1: 'Funded',
  2: 'InProgress',
  3: 'Submitted',
  4: 'Completed',
  5: 'Canceled'
} as const;

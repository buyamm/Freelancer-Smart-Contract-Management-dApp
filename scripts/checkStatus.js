const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log("🔍 Checking Contract Status...\n");
    
    // Get contract
    const FreelancerContract = await ethers.getContractFactory("FreelancerContract");
    const contract = FreelancerContract.attach(contractAddress);
    
    // Get accounts
    const accounts = await ethers.getSigners();
    
    console.log("📊 Account Balances:");
    console.log("=".repeat(60));
    for (let i = 0; i < Math.min(accounts.length, 5); i++) {
        const balance = await ethers.provider.getBalance(accounts[i].address);
        console.log(`Account #${i}: ${accounts[i].address}`);
        console.log(`  Balance: ${ethers.formatEther(balance)} ETH\n`);
    }
    
    // Get contract balance
    const contractBalance = await ethers.provider.getBalance(contractAddress);
    console.log(`📦 Contract Balance: ${ethers.formatEther(contractBalance)} ETH\n`);
    
    // Get job counter
    const jobCounter = await contract.jobCounter();
    console.log(`📋 Total Jobs: ${jobCounter}\n`);
    
    // Get all jobs
    console.log("📝 Job Details:");
    console.log("=".repeat(60));
    for (let i = 1; i <= jobCounter; i++) {
        const job = await contract.getJob(i);
        const states = ['Pending', 'Funded', 'InProgress', 'Submitted', 'Completed', 'Canceled', 'Disputed'];
        
        console.log(`Job #${i}:`);
        console.log(`  Title: ${job.title}`);
        console.log(`  Client: ${job.client}`);
        console.log(`  Freelancer: ${job.freelancer}`);
        console.log(`  Payment: ${ethers.formatEther(job.payment)} ETH`);
        console.log(`  State: ${states[job.state]} (${job.state})`);
        console.log(`  IPFS Hash: ${job.ipfsHash || 'N/A'}`);
        console.log("");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
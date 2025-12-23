const { ethers } = require("hardhat");

async function main() {
    console.log("🔑 Hardhat Test Accounts:");
    console.log("=" .repeat(80));
    
    const accounts = await ethers.getSigners();
    
    for (let i = 0; i < Math.min(accounts.length, 5); i++) {
        const account = accounts[i];
        const balance = await ethers.provider.getBalance(account.address);
        
        console.log(`Account #${i}:`);
        console.log(`  Address: ${account.address}`);
        console.log(`  Private Key: ${account.privateKey || 'N/A'}`);
        console.log(`  Balance: ${ethers.formatEther(balance)} ETH`);
        console.log("");
    }
    
    console.log("💡 To use in MetaMask:");
    console.log("1. Add Network: Localhost 8545");
    console.log("2. RPC URL: http://127.0.0.1:8545");
    console.log("3. Chain ID: 31337");
    console.log("4. Import any private key above");
    console.log("");
    console.log("🚀 Quick import (Account #0):");
    console.log("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
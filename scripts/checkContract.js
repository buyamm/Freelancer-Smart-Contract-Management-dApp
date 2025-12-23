const { ethers } = require("hardhat");

async function main() {
    const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log("🔍 Contract Information:");
    console.log("=" .repeat(50));
    console.log(`Contract Address: ${contractAddress}`);
    
    // Kiểm tra xem có phải là contract không
    const code = await ethers.provider.getCode(contractAddress);
    const isContract = code !== "0x";
    
    console.log(`Is Contract: ${isContract ? '✅ Yes' : '❌ No'}`);
    
    if (isContract) {
        console.log(`Bytecode length: ${code.length} characters`);
        
        // Kết nối với contract
        const FreelancerContract = await ethers.getContractFactory("FreelancerContract");
        const contract = FreelancerContract.attach(contractAddress);
        
        try {
            const jobCounter = await contract.jobCounter();
            console.log(`Current job counter: ${jobCounter}`);
            console.log("✅ Contract is working correctly!");
        } catch (error) {
            console.log("❌ Error calling contract:", error.message);
        }
    }
    
    console.log("\n📋 Summary:");
    console.log("- This is the deployed FreelancerContract");
    console.log("- When you create jobs, you interact with this address");
    console.log("- Your MetaMask account calls functions on this contract");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });